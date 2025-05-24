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

export interface Ticker {
    symbol: string;
    priceChange: string;
    priceChangePercent: string;
    weightedAvgPrice: string;
    lastPrice: string;
    lastQty: string;
    openPrice: string;
    highPrice: string;
    lowPrice: string;
    volume: string;
    quoteVolume: string;
    //     openTime: number;
    //     closeTime: number;
}

interface PersistedTickerData {
    symbol?: string;
    priceChange?: string;
    priceChangePercent?: string;
    weightedAvgPrice?: string;
    lastPrice?: string;
    lastQty?: string;
    openPrice?: string;
    highPrice?: string;
    lowPrice?: string;
    volume?: string;
    quoteVolume?: string;
    _periodOpenTime?: number;   // Optional: Timestamp (ms)
    _periodCloseTime?: number;  // Optional: Timestamp (ms)
}

export class Orderbook {
    bids: Order[] = [];
    asks: Order[] = [];
    baseAsset: string;
    quoteAsset: string = BASE_CURRENCY;
    lastTradeId: number;
    currentPrice: number;

    priceChange: string;
    priceChangePercent: string;
    weightedAvgPrice: string;
    lastPrice: string; // String representation of currentPrice for the ticker
    lastQty: string;
    openPrice: string;
    highPrice: string;
    lowPrice: string;
    volume: string;
    quoteVolume: string;
    // openTime: number;
    // closeTime: number;

    // Time-window management for ticker period (e.g., 24 hours)
    private periodOpenTime: number = 0;
    private periodCloseTime: number = 0;
    private readonly TICKER_PERIOD_DURATION: number = 24 * 60 * 60 * 1000; // 24 hours

    constructor(baseAsset: string, bids: Order[], asks: Order[], lastTradeId: number, currentPrice: number, snapshotTime?: number, initialTickerData?: PersistedTickerData | null) {
        this.bids = bids;
        this.asks = asks;
        this.baseAsset = baseAsset;
        this.lastTradeId = lastTradeId || 0;
        this.currentPrice = currentPrice || 0;
        // Initialize ticker data
        this.lastPrice = initialTickerData?.lastPrice || currentPrice.toString();
        this.priceChange = initialTickerData?.priceChange || "0";
        this.priceChangePercent = initialTickerData?.priceChangePercent || "0";
        this.weightedAvgPrice = initialTickerData?.weightedAvgPrice || "0";
        this.lastQty = initialTickerData?.lastQty || "0";
        this.openPrice = initialTickerData?.openPrice || currentPrice.toString(); // Default open to current if new
        this.highPrice = initialTickerData?.highPrice || currentPrice.toString();
        this.lowPrice = initialTickerData?.lowPrice || currentPrice.toString();
        this.volume = initialTickerData?.volume || "0";
        this.quoteVolume = initialTickerData?.quoteVolume || "0";
        // Default openTime to now if not provided, closeTime 24h later
        // This is a simple default; your engine might have better logic for new markets
        const now = Date.now();
        // this.openTime = initialTickerData?.openTime || now;
        // this.closeTime = initialTickerData?.closeTime || (this.openTime + 24 * 60 * 60 * 1000);

        this.periodOpenTime = (initialTickerData && typeof initialTickerData._periodOpenTime === 'number') ? initialTickerData._periodOpenTime : 0;
        this.periodCloseTime = (initialTickerData && typeof initialTickerData._periodCloseTime === 'number') ? initialTickerData._periodCloseTime : 0;

        // If currentPrice is 0 but there's an initial openPrice, it might be more representative
        if (currentPrice === 0 && parseFloat(this.openPrice) > 0) {
            this.lastPrice = this.openPrice;
            if (!initialTickerData?.highPrice) this.highPrice = this.openPrice;
            if (!initialTickerData?.lowPrice) this.lowPrice = this.openPrice;
        }


    }

    private resetTickerPeriod(currentPriceValue: number, time: number, isNewPeriodStart: boolean = false) {
        this.periodOpenTime = time;
        this.periodCloseTime = time + this.TICKER_PERIOD_DURATION;
        this.openPrice = isNewPeriodStart && currentPriceValue > 0 ? currentPriceValue.toString() : "0";
        this.highPrice = isNewPeriodStart && currentPriceValue > 0 ? currentPriceValue.toString() : "0";
        this.lowPrice = isNewPeriodStart && currentPriceValue > 0 ? currentPriceValue.toString() : "0";
        this.volume = "0";
        this.quoteVolume = "0";
        // this.trades = "0";
        this.priceChange = "0.00";
        this.priceChangePercent = "0.00";

        // If currentPriceValue is 0, it means no trades yet to set these, so they remain "0".
        // If there's a known currentPrice (e.g. from a previous period's close), it's used.
    }


    market() {
        return `${this.baseAsset}_${this.quoteAsset}`;
    }

    getTickerPayload(): Ticker {
        return {
            symbol: this.market(),
            priceChange: this.priceChange,
            priceChangePercent: this.priceChangePercent,
            weightedAvgPrice: this.weightedAvgPrice,
            lastPrice: this.lastPrice, // Uses the string 'lastPrice' field
            lastQty: this.lastQty,
            openPrice: this.openPrice,
            highPrice: this.highPrice,
            lowPrice: this.lowPrice,
            volume: this.volume,
            quoteVolume: this.quoteVolume,
            // openTime: this.openTime,
            // closeTime: this.closeTime,
        };
    }

    getSnapshot() {
        return {
            baseAsset: this.baseAsset,
            bids: this.bids,
            asks: this.asks,
            lastTradeId: this.lastTradeId,
            currentPrice: this.currentPrice,
            // Ticker data
            tickerData: {
                priceChange: this.priceChange,
                priceChangePercent: this.priceChangePercent,
                weightedAvgPrice: this.weightedAvgPrice,
                lastPrice: this.lastPrice,
                lastQty: this.lastQty,
                openPrice: this.openPrice,
                highPrice: this.highPrice,
                lowPrice: this.lowPrice,
                volume: this.volume,
                quoteVolume: this.quoteVolume,
                // openTime: this.openTime,
                // closeTime: this.closeTime,

                _periodOpenTime: this.periodOpenTime,
                _periodCloseTime: this.periodCloseTime,
            }
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



    addOrder(order: Order): { executedQty: number, fills: Fill[], remainingQty: number } {
        if (order.quantity <= 0 || order.price <= 0) {
            throw new Error("Order quantity and price must be positive.");
        }
        order.filled = order.filled || 0;

        let result: { executedQty: number, fills: Fill[] };
        let orderAddedToBook = false;

        if (order.side === "buy") {
            result = this.matchBid(order);
            if (order.quantity - order.filled > result.executedQty) {
                this.bids.push({
                    ...order,
                    quantity: order.quantity,
                    filled: order.filled + result.executedQty,
                });
                this.bids.sort((a, b) => b.price - a.price);
                orderAddedToBook = true;
            }
        } else { // sell
            result = this.matchAsk(order);
            if (order.quantity - order.filled > result.executedQty) {
                this.asks.push({
                    ...order,
                    quantity: order.quantity,
                    filled: order.filled + result.executedQty,
                });
                this.asks.sort((a, b) => a.price - b.price);
                orderAddedToBook = true;
            }
        }

        if (result.fills.length > 0) {
            const lastFill = result.fills[result.fills.length - 1];
            this.currentPrice = parseFloat(lastFill.price);
            this.lastPrice = lastFill.price; // Update string lastPrice
            this.lastQty = lastFill.qty.toString();

            // Call to update comprehensive ticker stats
            this.updateTickerAggregates(
                this.currentPrice,
                result.fills.reduce((sum, f) => sum + f.qty, 0), // Sum of quantities from all fills in this match
                Date.now()
            );
        } else if (orderAddedToBook) {
            // If order is added to book without immediate fill, it might affect current best bid/ask
            // Ticker price doesn't change, but this event could be relevant for other updates
        }

        const totalFilledForOrder = order.filled + result.executedQty;
        const remainingQty = order.quantity - totalFilledForOrder;
        return { ...result, remainingQty };
    }


    matchBid(buyOrder: Order): { executedQty: number, fills: Fill[] } { // Matching a BUY order against ASKS
        const fills: Fill[] = [];
        let totalExecutedQty = 0;
        const orderAvailableQty = buyOrder.quantity - buyOrder.filled;

        for (let i = 0; i < this.asks.length && totalExecutedQty < orderAvailableQty;) {
            const ask = this.asks[i];
            const askAvailableQty = ask.quantity - ask.filled;

            if (ask.userId === buyOrder.userId) { i++; continue; }
            if (askAvailableQty <= 0) { this.asks.splice(i, 1); continue; }

            if (ask.price <= buyOrder.price) {
                const fillQty = Math.min(orderAvailableQty - totalExecutedQty, askAvailableQty);
                ask.filled += fillQty;
                totalExecutedQty += fillQty;
                this.lastTradeId++;
                fills.push({
                    price: ask.price.toString(),
                    qty: fillQty,
                    tradeId: this.lastTradeId,
                    otherUserId: ask.userId,
                    markerOrderId: ask.orderId,
                });
                if (ask.quantity - ask.filled <= 0) {
                    this.asks.splice(i, 1);
                } else {
                    i++;
                }
            } else {
                break;
            }
        }
        return { executedQty: totalExecutedQty, fills };
    }


    matchAsk(sellOrder: Order): { executedQty: number, fills: Fill[] } { // Matching a SELL order against BIDS
        const fills: Fill[] = [];
        let totalExecutedQty = 0;
        const orderAvailableQty = sellOrder.quantity - sellOrder.filled;

        for (let i = 0; i < this.bids.length && totalExecutedQty < orderAvailableQty;) {
            const bid = this.bids[i];
            const bidAvailableQty = bid.quantity - bid.filled;

            if (bid.userId === sellOrder.userId) { i++; continue; }
            if (bidAvailableQty <= 0) { this.bids.splice(i, 1); continue; }

            if (bid.price >= sellOrder.price) {
                const fillQty = Math.min(orderAvailableQty - totalExecutedQty, bidAvailableQty);
                bid.filled += fillQty;
                totalExecutedQty += fillQty;
                this.lastTradeId++;
                fills.push({
                    price: bid.price.toString(),
                    qty: fillQty,
                    tradeId: this.lastTradeId,
                    otherUserId: bid.userId,
                    markerOrderId: bid.orderId,
                });
                if (bid.quantity - bid.filled <= 0) {
                    this.bids.splice(i, 1);
                } else {
                    i++;
                }
            } else {
                break;
            }
        }
        return { executedQty: totalExecutedQty, fills };
    }
    cancelBid(orderToCancel: Order): number | undefined { // orderToCancel is the actual order object
        const index = this.bids.findIndex(o => o.orderId === orderToCancel.orderId);
        if (index !== -1) {
            const price = this.bids[index].price;
            this.bids.splice(index, 1);
            return price;
        }
        return undefined;
    }

    cancelAsk(orderToCancel: Order): number | undefined { // orderToCancel is the actual order object
        const index = this.asks.findIndex(o => o.orderId === orderToCancel.orderId);
        if (index !== -1) {
            const price = this.asks[index].price;
            this.asks.splice(index, 1);
            return price;
        }
        return undefined;
    }

    public updateTickerAggregates(tradePrice: number, tradeQty: number, tradeTime: number) {
        // --- This is a simplified example and needs robust logic for time windows ---
        const tradeValue = tradePrice * tradeQty;

        this.lastPrice = tradePrice.toString(); // Ensure string lastPrice is updated
        this.currentPrice = tradePrice; // Keep numeric currentPrice in sync
        this.lastQty = tradeQty.toString();


        if (this.periodOpenTime === 0 || tradeTime >= this.periodCloseTime || (parseFloat(this.openPrice) === 0 && parseFloat(this.volume) === 0)) { // New period
            this.periodOpenTime = tradeTime;
            this.periodCloseTime = tradeTime + this.TICKER_PERIOD_DURATION;
            this.openPrice = tradePrice.toString();
            this.highPrice = tradePrice.toString();
            this.lowPrice = tradePrice.toString();
            this.volume = tradeQty.toString();
            this.quoteVolume = tradeValue.toString();
        } else { // Update existing period
            this.highPrice = Math.max(parseFloat(this.highPrice), tradePrice).toString();
            // For 'low', if it was '0' (uninitialized for period) and tradePrice > 0, new low is tradePrice.
            if (parseFloat(this.lowPrice) === 0 && tradePrice > 0) {
                this.lowPrice = tradePrice.toString();
            } else {
                this.lowPrice = Math.min(parseFloat(this.lowPrice), tradePrice).toString();
            }
            this.volume = (parseFloat(this.volume) + tradeQty).toString();
            this.quoteVolume = (parseFloat(this.quoteVolume) + tradeValue).toString();
        }
        this.lastPrice = tradePrice.toString();
        if (parseFloat(this.openPrice) > 0) {
            const priceChangeNum = tradePrice - parseFloat(this.openPrice);
            this.priceChange = priceChangeNum.toFixed(2); // Example: to 2 decimal places
            this.priceChangePercent = (parseFloat(this.openPrice) === 0) ? "0.00" : ((priceChangeNum / parseFloat(this.openPrice)) * 100).toFixed(2);
        } else {
            this.priceChange = "0.00";
            this.priceChangePercent = "0.00";
        }

        if (parseFloat(this.volume) > 0) {
            this.weightedAvgPrice = (parseFloat(this.quoteVolume) / parseFloat(this.volume)).toFixed(2); // Example
        } else {
            this.weightedAvgPrice = "0.00";
        }
    }
}

export function getMarketTicker(marketSymbol: string, orderbook: Orderbook): Ticker {
    if (marketSymbol !== orderbook.market()) {
        console.warn(`Market symbol mismatch: requested '${marketSymbol}', orderbook is for '${orderbook.market()}'`);
        // Handle error or return a default ticker
    }
    return orderbook.getTickerPayload(); // Use the new method
}