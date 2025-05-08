export const GET_DEPTH = 'GET_DEPTH';
export const GET_OPEN_ORDERS = 'GET_OPEN_ORDERS'
export const CREATE_ORDER = 'CREATE_ORDER';
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
    }