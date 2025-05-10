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

    addOrder(order: Order): {executedQty: number, fills: Fill[]} {
        
        if (order.side === "buy") {
            const {executedQty, fills} = this.matchBid(order);
            order.filled = executedQty;
            if(order.quantity === executedQty) {
                return {executedQty, fills};
            }
            this.bids.push(order);
            return {executedQty, fills};
        } else {
            const {executedQty, fills} = this.matchAsk(order);
            order.filled = executedQty;
            if(order.quantity === executedQty) {
                return {executedQty, fills};
            }
            this.asks.push(order);
            return {executedQty, fills};
        }
    }

    matchBid(order: Order): {executedQty: number, fills: Fill[]} {
        const fills: Fill[] = [];
        let executedQty = 0;

        for (let i = 0; i < this.asks.length; i++) {
            const ask = this.asks[i];
            if (ask.price <= order.price && executedQty < order.quantity) {
                const fillQty = Math.min(order.quantity - executedQty, ask.quantity);
                executedQty += fillQty;
                this.asks[i].quantity += fillQty;
                fills.push({
                    price: ask.price.toString(),
                    qty: fillQty,
                    tradeId: this.lastTradeId++,
                    otherUserId: ask.userId,
                    markerOrderId: ask.orderId
                });
            }
        }
        for (let i = 0; i < this.asks.length; i++) {
            if (this.asks[i].quantity == this.asks[i].filled) {
                this.asks.splice(i, 1);
                i--;
            }
        }
        console.log("Executed qty: ", executedQty);
        console.log("Fills: ", fills);
        return {
            executedQty,
            fills
        }
    }

    matchAsk(order: Order): {executedQty: number, fills: Fill[]}{
        const fills: Fill[] = [];
        let executedQty = 0;
        for (let i = 0; i < this.bids.length; i++) {
            const bid = this.bids[i];
            if (bid.price >= order.price && executedQty < order.quantity) {
                const fillQty = Math.min(order.quantity - executedQty, bid.quantity);
                executedQty += fillQty;
                this.bids[i].quantity += fillQty;
                fills.push({
                    price: bid.price.toString(),
                    qty: fillQty,
                    tradeId: this.lastTradeId++,
                    otherUserId: bid.userId,
                    markerOrderId: bid.orderId
                });
            }
        }
        for (let i = 0; i < this.bids.length; i++) {
            if (this.bids[i].quantity == this.bids[i].filled) {
                this.bids.splice(i, 1);
                i--;
            }
        }
        console.log("Executed qty: ", executedQty);
        console.log("Fills: ", fills);
        return {
            executedQty,
            fills
        }
    }
}