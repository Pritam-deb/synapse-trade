import { Order } from "../trade/orderbook"

export type MessageToApi =
    {
        type: "DEPTH",
        payload: {
            bids: [string, string][],
            asks: [string, string][],
        }
    } |
    {
        type: "OPEN_ORDERS",
        payload: Order[]
    } |
    {
        type: 'ORDER_PLACED',
        payload: {
            orderId: string,
            executedQty: number,
            fills:
            {
                price: string,
                qty: number,
                tradeId: number,
            }[]

        }
    } |
    {
        type: 'ORDER_CANCELLED',
        payload: {
            orderId: string,
            executedQty: number,
            remainingQty: number,
        }
    } |
    {
        type: 'ORDER_REJECTED',
        payload: {
            orderId: string,
            reason: string,
        }
    } |
    {
        type: "USER_BALANCE_FETCHED",
        payload: {
            userId: string,
            balance: {
                [key: string]: {
                    available: number,
                    locked: number
                }
            }
        }
    } |
    {
        type: "TICKER_FETCHED",
        payload: {
            symbol: string,
            priceChange: string,
            priceChangePercent: string,
            lastPrice: string,
            high: string,
            low: string,
            volume: string,
            quoteVolume: string,
            firstPrice: string,
            trades: string
        }
    }