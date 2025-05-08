import fs from 'fs';
import { GET_DEPTH, GET_OPEN_ORDERS, MessageFromApi } from "../types/fromApi";
import { RedisManager } from "../RedisManager";
import { Orderbook } from './orderbook';


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
                    const {market} = message.data;
                    const openorderbook = this.orderbooks.find(o=>o.ticker()===market);
                    if(!openorderbook) throw new Error("No orderbooks found");
                    const openOrders = openorderbook.getOpenOrders(message.data.userId)
                    RedisManager.getInstance().sendToApi(clientId, {
                        type: "OPEN_ORDERS",
                        payload: openOrders,
                    })
                } catch (error) {
                    console.error("Error processing message:", error);
                }
            }
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