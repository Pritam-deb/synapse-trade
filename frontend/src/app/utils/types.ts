export interface Ticker {
    "firstPrice": string,
    "high": string,
    "lastPrice": string,
    "low": string,
    "priceChange": string,
    "priceChangePercent": string,
    "quoteVolume": string,
    "symbol": string,
    "trades": string,
    "volume": string
}

export interface Depth {
    // [string, string][]
    "asks": Array<Array<string>>,
    "bids": Array<Array<string>>,
    "lastUpdateId": string,
    "timestamp": number
}

export interface Trade {
    "id": number,
    "isBuyerMaker": boolean,
    "price": string,
    "quantity": string,
    "quoteQuantity": string,
    "timestamp": number
}

export interface KLine {
    "close": string,
    "end": string,
    "high": string,
    "low": string,
    "open": string,
    "quoteVolume": string,
    "start": string,
    "trades": string,
    "volume": string
}

export interface Market {
    baseSymbol: string;
    createdAt: string;
    filters: {
        price: {
            borrowEntryFeeMaxMultiplier?: string | null;
            borrowEntryFeeMinMultiplier?: string | null;
            maxImpactMultiplier?: string | null;
            maxMultiplier?: string | null;
            maxPrice?: string | null;
            meanMarkPriceBand?: string | null;
            meanPremiumBand?: string | null;
            minImpactMultiplier?: string | null;
            minMultiplier?: string | null;
            minPrice: string;
            tickSize: string;
        };
        quantity: {
            maxQuantity?: string | null;
            minQuantity: string;
            stepSize: string;
        };
    };
    fundingInterval: number;
    imfFunction?: string | null;
    marketType: "SPOT" | "FUTURES" | "OPTIONS" | string;
    mmfFunction?: string | null;
    openInterestLimit: string;
    orderBookState: "LimitOnly" | "FullTrading" | "Disabled" | string;
    quoteSymbol: string;
    symbol: string;
}