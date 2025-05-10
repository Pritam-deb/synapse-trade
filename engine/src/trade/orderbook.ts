import { BASE_CURRENCY } from "./engine";


export interface Order {
    price: number;
    quantity: number;
    orderId: string;
    filled: number;
    side: "buy" | "sell";
    userId: string;
}

export interface Fill {
    price: string;
    qty: number;
    tradeId: number;
    otherUserId: string;
    markerOrderId: string;
}


export class Orderbook {
    bids: Order[] = [];
    asks: Order[] = [];
    baseAsset: string;
    quoteAsset: string = BASE_CURRENCY;
    lastTradeId: number;
    currentPrice: number;

    constructor(baseAsset: string, bids: Order[], asks: Order[], lastTradeId: number, currentPrice: number) {
        this.bids = bids;
        this.asks = asks;
        this.baseAsset = baseAsset;
        this.lastTradeId = lastTradeId || 0;
        this.currentPrice = currentPrice || 0;
    }

    ticker() {
        return `${this.baseAsset}_${this.quoteAsset}`;
    }

    getSnapshot() {
        return {
            baseAsset: this.baseAsset,
            bids: this.bids,
            asks: this.asks,
            lastTradeId: this.lastTradeId,
            currentPrice: this.currentPrice
        }
    }

    getDepth() {
        const bids: [string, string][] = [];
        const asks: [string, string][] = [];
        // console.log("Bids: ", this.bids);
        // console.log("Asks: ", this.asks);

        const bidsObj: { [key: string]: number } = {};
        const asksObj: { [key: string]: number } = {};

        for (let i = 0; i < this.bids.length; i++) {
            const order = this.bids[i];
            if (!bidsObj[order.price]) {
                bidsObj[order.price] = 0;
            }
            bidsObj[order.price] += order.quantity;
        }
        // console.log("bids object=====>", bidsObj)

        for (let i = 0; i < this.asks.length; i++) {
            const order = this.asks[i];
            if (!asksObj[order.price]) {
                asksObj[order.price] = 0;
            }
            asksObj[order.price] += order.quantity;
        }

        for (const price in bidsObj) {
            bids.push([price, bidsObj[price].toString()]);
        }

        for (const price in asksObj) {
            asks.push([price, asksObj[price].toString()]);
        }

        return {
            bids,
            asks
        };
    }

    getOpenOrders(userId: string): Order[] {
        const asks = this.asks.filter(x => x.userId === userId);
        const bids = this.bids.filter(x => x.userId === userId);
        return [...asks, ...bids];
    }

    addOrder(order: Order): { executedQty: number, fills: Fill[] } {
        let result;
        if (order.side === "buy") {
            result = this.matchBid(order);
            if (order.quantity > result.executedQty) {
                this.bids.push({
                    ...order,
                    quantity: order.quantity - result.executedQty,
                    filled: result.executedQty
                });
            }
        } else {
            result = this.matchAsk(order);
            if (order.quantity > result.executedQty) {
                this.asks.push({
                    ...order,
                    quantity: order.quantity - result.executedQty,
                    filled: result.executedQty
                });
            }
        }
        return result;
    }

    matchBid(order: Order): { executedQty: number, fills: Fill[] } {
        const fills: Fill[] = [];
        let executedQty = 0;

        // Sort asks by lowest price first
        this.asks.sort((a, b) => a.price - b.price);

        for (let i = 0; i < this.asks.length && executedQty < order.quantity; i++) {
            const ask = this.asks[i];
            if (ask.price <= order.price) {
                const fillQty = Math.min(order.quantity - executedQty, ask.quantity);
                ask.quantity -= fillQty;
                executedQty += fillQty;

                fills.push({
                    price: ask.price.toString(),
                    qty: fillQty,
                    tradeId: this.lastTradeId++,
                    otherUserId: ask.userId,
                    markerOrderId: ask.orderId
                });

                if (ask.quantity === 0) {
                    this.asks.splice(i, 1);
                    i--;
                }
            }
        }

        return { executedQty, fills };
    }

    matchAsk(order: Order): { executedQty: number, fills: Fill[] } {
        const fills: Fill[] = [];
        let executedQty = 0;

        // Sort bids by highest price first
        this.bids.sort((a, b) => b.price - a.price);

        for (let i = 0; i < this.bids.length && executedQty < order.quantity; i++) {
            const bid = this.bids[i];
            if (bid.price >= order.price) {
                const fillQty = Math.min(order.quantity - executedQty, bid.quantity);
                bid.quantity -= fillQty;
                executedQty += fillQty;

                fills.push({
                    price: bid.price.toString(),
                    qty: fillQty,
                    tradeId: this.lastTradeId++,
                    otherUserId: bid.userId,
                    markerOrderId: bid.orderId
                });

                if (bid.quantity === 0) {
                    this.bids.splice(i, 1);
                    i--;
                }
            }
        }

        return { executedQty, fills };
    }
}