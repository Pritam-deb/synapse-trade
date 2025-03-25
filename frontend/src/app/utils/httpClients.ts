import axios from "axios";
import { Depth, KLine, Market, Ticker, Trade } from "./types";

const BASE_URL = "https://api.backpack.exchange/api/v1";

export const getTicker = async (market: string): Promise<Ticker> => {
    const response = await axios.get(`${BASE_URL}/ticker?symbol=${market}`);
    return response.data;
}

export const getTickers = async (): Promise<Ticker[]> => {
    const response = await axios.get(`${BASE_URL}/ticker`);
    return response.data;
}

export const getDepth = async (market: string): Promise<Depth> => {
    const response = await axios.get(`${BASE_URL}/depth?symbol=${market}`);
    return response.data;
}

export const getTrades = async (market: string, limit?: number): Promise<Trade[]> => {
    const response = await axios.get(`${BASE_URL}/depth?symbol=${market}&limit=${limit ? limit : 10}`);
    return response.data;
}

export const getKLines = async (market: string, interval: string, startTime: number, endTime?: number): Promise<KLine[]> => {
    const response = await axios.get(`${BASE_URL}/klines?symbol=${market}&interval=${interval}&startTime=${startTime}${endTime ? `&endTime=${endTime}` : ""}`);
    return response.data;
}

export const getMarkets = async (): Promise<Market[]> => {
    const response = await axios.get(`${BASE_URL}/markets`);
    return response.data;
}