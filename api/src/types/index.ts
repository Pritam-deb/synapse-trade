export const GET_DEPTH = 'GET_DEPTH';
export const GET_OPEN_ORDERS = 'GET_OPEN_ORDERS'
export const CREATE_ORDER = 'CREATE_ORDER';
export const CANCEL_ORDER = 'CANCEL_ORDER';
export const USER_BALANCE = 'USER_BALANCE';
export type MessageFromOrderbook =
    {
        type: 'DEPTH',
        payload: {
            market: string,
            bids: [string, string][],
            asks: [string, string][],
        }
    } |
    {
        type: 'OPEN_ORDERS',
        payload: {
            orderId: string,
            executedQty: number,
            price: string,
            quantity: string,
            side: 'buy' | 'sell',
            userId: string
        }
    } |
    {
        type: 'ORDER_PLACED',
        payload: {
            orderId: string,
            executedQty: number,
            fills: [
                {
                    price: string,
                    pty: number,
                    tradeId: number,
                }
            ]
        }
    } | {
        type: "ORDER_CANCELLED",
        payload: {
            orderId: string,
            executedQty: number,
            remainingQty: number
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
    } |
    {
        type: "ORDER_REJECTED",
        payload: {
            orderId: string,
            reason: string
        }
    }

//user balance
// {
//     "INR": { "available": 100000, "locked": 20000 },
//     "USDC": { "available": 10000, "locked": 2000 }
//   }