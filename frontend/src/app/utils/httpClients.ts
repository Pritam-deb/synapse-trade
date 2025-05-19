import axios from "axios";
import { Depth, KLine, Market, Ticker, Trade } from "./types";

const api = axios.create({
    baseURL: "http://localhost:3000", // Point to your Next.js app
    headers: {
        "Content-Type": "application/json",
    },
});


export const postOrder = async (
    market: string,
    side: string,
    price: string,
    quantity: string,
    userId: string
): Promise<any> => {
    const response = await api.post("/order/create", {
        market,
        side,
        price,
        quantity,
        userId,
    });

    return response.data;
};

export const getTicker = async (market: string): Promise<Ticker> => {
    // const response = await api.get(`https://api.backpack.exchange/api/v1/api/backpack/ticker?symbol=${market}`);
    const response = await api.get(`/ticker/fetch?symbol=${market}`);
    return response.data;
}

export const getTickers = async (): Promise<Ticker[]> => {
    // const response = await axios.get(`/api/backpack/tickers`);
    const response = await api.get(`/tickers`);
    return response.data;
}

export const getDepth = async (market: string): Promise<Depth> => {
    // const response = await axios.get(`/api/backpack/depth?symbol=${market}`);
    const response = await api.get(`/depth?symbol=${market}`);
    return response.data;
}

export const getTrades = async (market: string, limit?: number): Promise<Trade[]> => {
    // const response = await axios.get(`/api/backpack/depth?symbol=${market}&limit=${limit ? limit : 10}`);
    const response = await api.get(`/trades?market=${market}`);
    return response.data;
}

export const getKLines = async (market: string, interval: string, startTime: number, endTime?: number): Promise<KLine[]> => {
    // const response = await axios.get(`/api/backpack/klines?symbol=${market}&interval=${interval}&startTime=${startTime}${endTime ? `&endTime=${endTime}` : ""}`);
    const response = await api.get(`/kline?interval=1m&startTime=1747094400&endTime=1747267200&market=USDC_INR`);
    return response.data;
}

export const getMarkets = async (): Promise<Market[]> => {
    // const response = await axios.get(`/api/backpack/markets`);
    const response = await api.get(`/markets`);
    return response.data;
}