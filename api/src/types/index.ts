export const GET_DEPTH = 'GET_DEPTH';
export const GET_OPEN_ORDERS = 'GET_OPEN_ORDERS'
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
    }