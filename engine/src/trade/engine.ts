import fs from 'fs';
import { CREATE_ORDER, GET_DEPTH, GET_OPEN_ORDERS, MessageFromApi, USER_BALANCE } from "../types/fromApi";
import { RedisManager } from "../RedisManager";
import { Fill, Order, Orderbook } from './orderbook';


export const BASE_CURRENCY = 'INR';

interface UserBalance {
    [key: string]: {
        available: number;
        locked: number;
    }
}

export class Engine {
    private orderbooks: Orderbook[] = [];
    private balances: Map<string, UserBalance> = new Map();


    constructor() {
        let snapshot = null;
        try {
            if (process.env.WITH_SNAPSHOT) {
                snapshot = fs.readFileSync("./snapshot.json", "utf-8");
            }
        } catch (error) {
            console.error("Error reading snapshot file:", error);
        }

        if (snapshot) {
            const parsedSnapshot = JSON.parse(snapshot.toString());
            this.orderbooks = parsedSnapshot.orderbooks.map((orderbook: any) => new Orderbook(orderbook.baseAsset, orderbook.bids, orderbook.asks, orderbook.lastTradeId, orderbook.currentPrice));
            this.balances = new Map<string, UserBalance>(Object.entries(parsedSnapshot.balances));
        } else {
            this.orderbooks = [new Orderbook("USDC", [], [], 0, 0)];
            this.setBaseBalances();
        }

        setInterval(() => {
            const snapshot = {
                orderbooks: this.orderbooks.map(orderbook => orderbook.getSnapshot()),
                balances: Object.fromEntries(this.balances)
            };
            fs.writeFileSync("./snapshot.json", JSON.stringify(snapshot));
        }, 1000 * 60 * 5);
    }


    process({ clientId, message }: { clientId: string, message: MessageFromApi }) {
        switch (message.type) {
            case GET_OPEN_ORDERS: {
                try {
                    const { market } = message.data;
                    const openorderbook = this.orderbooks.find(o => o.ticker() === market);
                    if (!openorderbook) throw new Error("No orderbooks found");
                    const openOrders = openorderbook.getOpenOrders(message.data.userId)
                    RedisManager.getInstance().sendToApi(clientId, {
                        type: "OPEN_ORDERS",
                        payload: openOrders,
                    })
                } catch (error) {
                    console.error("Error processing message:", error);
                }
            }
            break;
            case GET_DEPTH: {
                try {
                    const { market } = message.data;
                    const orderbook = this.orderbooks.find(orderbook => orderbook.ticker() === market);
                    if (orderbook) {
                        RedisManager.getInstance().sendToApi(clientId, {
                            type: "DEPTH",
                            payload: orderbook.getDepth()
                        });
                    }
                } catch (error) {
                    console.error("Error processing message:", error);
                    RedisManager.getInstance().sendToApi(clientId, {
                        type: "DEPTH",
                        payload: {
                            bids: [],
                            asks: []
                        }
                    });
                }
            }
            break;
            case CREATE_ORDER: {
                try {
                    if ('quantity' in message.data && 'side' in message.data && 'price' in message.data && 'userId' in message.data) {
                        const {market, side, price, quantity, userId} = message.data;
                        // Proceed with the logic here
                        const {executedQty, fills, orderId} = this.createOrder(market, side, price, quantity, userId);
                        RedisManager.getInstance().sendToApi(clientId, {
                            type: "ORDER_PLACED",
                            payload: {
                                orderId,
                                executedQty,
                                fills
                            }
                        });
                    } else {
                        throw new Error("Invalid message data for CREATE_ORDER");
                    }
                } catch (error) {
                    console.error("Error processing message:", error);
                    RedisManager.getInstance().sendToApi(clientId, {
                        type: "ORDER_CANCELLED",
                        payload: {
                            orderId: "",
                            executedQty: 0,
                            remainingQty: 0,
                        }
                    });
                }
            }
            break;
            case USER_BALANCE: {
                try {
                    const { userId } = message.data;
                    const userBalance = this.balances.get(userId);
            
                    if (!userBalance) {
                        throw new Error("User not found");
                    }
                                
                    const finalBalance = userBalance[1] || { available: 0, locked: 0 };
                    RedisManager.getInstance().sendToApi(clientId, {
                        type: "USER_BALANCE_FETCHED",
                        payload: {
                            userId,
                            balance: finalBalance
                        }
                    } as any); // use proper typing later
                } catch (error) {
                    console.error("Error processing message:", error);
                }
            }
        }
    }

    createOrder( market: string, side: 'buy' | 'sell', price: string, quantity: string, userId: string ) {
        const orderbook = this.orderbooks.find(orderbook => orderbook.ticker() === market);
        if (!orderbook) {
            throw new Error("Orderbook not found");
        }
        const baseAsset = market.split("_")[0];
        const quoteAsset = market.split("_")[1];

        this.checkAndLockFunds(
            userId,
            baseAsset,
            quoteAsset,
            side,
            Number(price),
            Number(quantity)
        )
        const order : Order = {
            price: Number(price),
            quantity: Number(quantity),
            filled: 0,
            side,
            userId,
            orderId: Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15),
        };
        const {fills, executedQty} = orderbook.addOrder(order);
        this.updateBalances(userId, baseAsset, quoteAsset, side, fills, executedQty);
        return {
            orderId: order.orderId,
            executedQty,
            fills
        }
    }

    checkAndLockFunds(userId: string, baseAsset: string, quoteAsset: string, side: 'buy' | 'sell', price: number, quantity: number) {
        const userBalance = this.balances.get(userId);
        if (!userBalance) {
            throw new Error("User not found");
        }

        const baseAssetBalance = userBalance?.[baseAsset] || {locked: 0, available: 0};
        const quoteAssetBalance = userBalance?.[quoteAsset] || {locked: 0, available: 0};

        if (side === 'buy') {
            if (quoteAssetBalance.available < price * quantity) {
                throw new Error("Insufficient funds");
            }
            quoteAssetBalance.available -= price * quantity;
            quoteAssetBalance.locked += price * quantity;
        } else {
            if (baseAssetBalance.available < quantity) {
                throw new Error("Insufficient funds");
            }
            baseAssetBalance.available -= quantity;
            baseAssetBalance.locked += quantity;
        }
    }

    updateBalances(userId: string, baseAsset: string, quoteAsset: string, side: 'buy' | 'sell', fills: Fill[], executedQty: number) {
        if(side === 'buy') {
            fills.forEach(fill => {
                //update quote asset balance
                // @ts-ignore
                this.balances.get(fill.otherUserId)[quoteAsset].available += fill.price * fill.qty;
                // @ts-ignore
                this.balances.get(userId)[quoteAsset].locked -= fill.price * fill.qty;
                //update base asset balance
                // @ts-ignore
                this.balances.get(fill.otherUserId)[baseAsset].locked -= fill.qty;
                // @ts-ignore
                this.balances.get(userId)[baseAsset].available += fill.qty;
            })
        } else {
            fills.forEach(fill => {
                //update base asset balance
                // @ts-ignore
                this.balances.get(fill.otherUserId)[baseAsset].available += fill.qty;
                // @ts-ignore
                this.balances.get(userId)[baseAsset].locked -= fill.qty;
                //update quote asset balance
                // @ts-ignore
                this.balances.get(fill.otherUserId)[quoteAsset].locked -= fill.price * fill.qty;
                // @ts-ignore
                this.balances.get(userId)[quoteAsset].available += fill.price * fill.qty;
            })
        }
    }

    setBaseBalances() {
        this.balances.set("1", {
            [BASE_CURRENCY]: {
                available: 10000000,
                locked: 0
            },
            "USDC": {
                available: 10000000,
                locked: 0
            }
        });

        this.balances.set("2", {
            [BASE_CURRENCY]: {
                available: 10000000,
                locked: 0
            },
            "USDC": {
                available: 10000000,
                locked: 0
            }
        });

        this.balances.set("5", {
            [BASE_CURRENCY]: {
                available: 10000000,
                locked: 0
            },
            "USDC": {
                available: 10000000,
                locked: 0
            }
        });
    }
}