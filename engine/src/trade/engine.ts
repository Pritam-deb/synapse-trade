import fs from 'fs';
import { CANCEL_ORDER, CREATE_ORDER, GET_DEPTH, GET_OPEN_ORDERS, MessageFromApi, USER_BALANCE } from "../types/fromApi";
import { ORDER_UPDATE, TRADE_ADDED } from "../types/index";
import { DbMessage, RedisManager } from "../RedisManager";
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
            if (true) {
                snapshot = fs.readFileSync("./snapshot.json", "utf-8");
            }
        } catch (error) {
            console.error("Error reading snapshot file:", error);
        }
        // console.log("snapshot", snapshot);

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
        }, 1000 * 60 * 1);
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
                    if (message.data) {
                        const { market, side, price, quantity, userId } = message.data;
                        // Proceed with the logic here
                        const { executedQty, fills, orderId } = this.createOrder(market, side, price, quantity, userId);
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

                    // const finalBalance = userBalance[1] || { available: 0, locked: 0 };
                    RedisManager.getInstance().sendToApi(clientId, {
                        type: "USER_BALANCE_FETCHED",
                        payload: {
                            userId,
                            balance: userBalance
                        }
                    } as any); // use proper typing later
                } catch (error) {
                    console.error("Error processing message:", error);
                }
            }
            case CANCEL_ORDER:
                try {
                    let orderId = "";
                    let cancelMarket = "";
                    if ("orderId" in message.data && "market" in message.data) {
                        orderId = message.data.orderId;
                        cancelMarket = message.data.market;
                    }
                    const cancelOrderbook = this.orderbooks.find(o => o.ticker() === cancelMarket);
                    const quoteAsset = cancelMarket.split("_")[1];
                    if (!cancelOrderbook) {
                        throw new Error("No orderbook found");
                    }

                    const order = cancelOrderbook.asks.find(o => o.orderId === orderId) || cancelOrderbook.bids.find(o => o.orderId === orderId);
                    if (!order) {
                        console.log("No order found");
                        throw new Error("No order found");
                    }

                    if (order.side === "buy") {
                        const price = cancelOrderbook.cancelBid(order)
                        const leftQuantity = (order.quantity - order.filled) * order.price;
                        //@ts-ignore
                        this.balances.get(order.userId)[BASE_CURRENCY].available += leftQuantity;
                        //@ts-ignore
                        this.balances.get(order.userId)[BASE_CURRENCY].locked -= leftQuantity;
                        if (price) {
                            this.sendUpdatedDepthAt(price.toString(), cancelMarket);
                        }
                    } else {
                        const price = cancelOrderbook.cancelAsk(order)
                        const leftQuantity = order.quantity - order.filled;
                        //@ts-ignore
                        this.balances.get(order.userId)[quoteAsset].available += leftQuantity;
                        //@ts-ignore
                        this.balances.get(order.userId)[quoteAsset].locked -= leftQuantity;
                        if (price) {
                            this.sendUpdatedDepthAt(price.toString(), cancelMarket);
                        }
                    }

                    RedisManager.getInstance().sendToApi(clientId, {
                        type: "ORDER_CANCELLED",
                        payload: {
                            orderId,
                            executedQty: 0,
                            remainingQty: 0
                        }
                    });
                } catch (error) {
                    console.error("Error processing message:", error);
                }
        }
    }

    createOrder(market: string, side: 'buy' | 'sell', price: string, quantity: string, userId: string) {
        const orderbook = this.orderbooks.find(orderbook => orderbook.ticker() === market);
        if (!orderbook) {
            throw new Error("Orderbook not found");
        }
        const baseAsset = market.split("_")[0];
        const quoteAsset = market.split("_")[1];
        console.log("Creating order", market, side, price, quantity, userId);
        this.checkAndLockFunds(
            userId,
            baseAsset,
            quoteAsset,
            side,
            Number(price),
            Number(quantity)
        )
        const order: Order = {
            price: Number(price),
            quantity: Number(quantity),
            filled: 0,
            side,
            userId,
            orderId: Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15),
        };
        const { fills, executedQty } = orderbook.addOrder(order);
        this.updateBalances(userId, baseAsset, quoteAsset, side, fills, executedQty);
        this.createDbTrades(fills, market, userId);
        this.updateDbOrder(order, executedQty, fills, market);
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

        const baseAssetBalance = userBalance?.[baseAsset] || { locked: 0, available: 0 };
        const quoteAssetBalance = userBalance?.[quoteAsset] || { locked: 0, available: 0 };

        if (side === 'buy') {
            // console.log("buying", baseAsset, quoteAsset, price, quantity);
            if (quoteAssetBalance.available < price * quantity) {
                throw new Error("Insufficient funds");
            }
            quoteAssetBalance.available -= price * quantity;
            quoteAssetBalance.locked += price * quantity;
        } else {
            // console.log("selling", baseAsset, quoteAsset, price, quantity);
            if (baseAssetBalance.available < quantity) {
                throw new Error("Insufficient funds");
            }
            baseAssetBalance.available -= quantity;
            baseAssetBalance.locked += quantity;
        }
    }

    updateBalances(userId: string, baseAsset: string, quoteAsset: string, side: 'buy' | 'sell', fills: Fill[], executedQty: number) {
        if (side === 'buy') {
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
                // console.log("buying other user balance", this.balances.get(fill.otherUserId));
                // console.log("buying user balance", this.balances.get(userId));
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
                // console.log("selling other user balance", this.balances.get(fill.otherUserId));
                // console.log("selling user balance", this.balances.get(userId));
            })
        }
    }

    sendUpdatedDepthAt(price: string, market: string) {
        const orderbook = this.orderbooks.find(o => o.ticker() === market);
        if (!orderbook) {
            return;
        }
        const depth = orderbook.getDepth();
        const updatedBids = depth?.bids.filter(x => x[0] === price);
        const updatedAsks = depth?.asks.filter(x => x[0] === price);

        RedisManager.getInstance().publishMessage(`depth@${market}`, {
            stream: `depth@${market}`,
            data: {
                a: updatedAsks.length ? updatedAsks : [[price, "0"]],
                b: updatedBids.length ? updatedBids : [[price, "0"]],
                e: "depth"
            }
        });
    }

    createDbTrades(fills: Fill[], market: string, userId: string) {
        fills.forEach(fill => {
            const message: DbMessage = {
                type: TRADE_ADDED,
                data: {
                    market: market,
                    id: fill.tradeId.toString(),
                    isBuyerMaker: fill.otherUserId === userId,
                    price: fill.price,
                    quantity: fill.qty.toString(),
                    quoteQuantity: (fill.qty * Number(fill.price)).toString(),
                    timestamp: Date.now()
                }
            };
            RedisManager.getInstance().pushMessageToQueue(message);
        })
    }

    updateDbOrder(order: Order, executedQty: number, fills: Fill[], market: string) {
        const message: DbMessage = {
            type: ORDER_UPDATE,
            data: {
                orderId: order.orderId,
                executedQty,
                market,
                price: order.price.toString(),
                quantity: order.quantity.toString(),
                side: order.side
            }
        };
        RedisManager.getInstance().pushMessageToQueue(message);
        fills.forEach(fill => {
            RedisManager.getInstance().pushMessageToQueue({
                type: ORDER_UPDATE,
                data: {
                    orderId: fill.markerOrderId,
                    executedQty: fill.qty,
                    market,
                    price: fill.price.toString(),
                    quantity: fill.qty.toString(),
                    side: order.side === "buy" ? "sell" : "buy",
                }
            })
        })
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