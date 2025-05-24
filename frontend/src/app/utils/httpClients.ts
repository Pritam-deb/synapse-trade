import axios from "axios";
import { Depth, KLine, Market, Ticker, Trade } from "./types";

const api = axios.create({
    baseURL: "http://localhost:3000", // Point to your Next.js app
    headers: {
        "Content-Type": "application/json",
    },
});

const authApi = axios.create({
    baseURL: "http://localhost:3000", // Point to your Next.js app
    headers: {
        "Authorization": `Bearer ${localStorage.getItem("token")}`,
        "Content-Type": "application/json",
    },
})

export const signin = async (email: string, password: string): Promise<any> => {
    const response = await api.post("/user/signin", {
        email,
        password,
    });
    return response.data;
}

export const signup = async (
    email: string,
    password: string,
    username: string
): Promise<any> => {
    const response = await api.post("/user/signup", {
        email,
        password,
        username,
    });
    return response.data;
};

export const signout = async (): Promise<any> => {
    const response = await authApi.post("/user/signout");
    return response.data;
}

export const postOrder = async (
    market: string,
    side: string,
    price: string,
    quantity: string,
    userId: string
): Promise<any> => {
    const response = await authApi.post("/order/create", {
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
    const response = await api.get(`/kline?symbol=${market}&interval=${interval}&startTime=${startTime}${endTime ? `&endTime=${endTime}` : ""}`);
    // const response = await api.get(`/kline?interval=1m&startTime=1747976400&endTime=1748005200&market=USDC_INR`);
    return response.data;
}

export const getMarkets = async (): Promise<Market[]> => {
    // const response = await axios.get(`/api/backpack/markets`);
    const response = await api.get(`/markets`);
    return response.data;
}