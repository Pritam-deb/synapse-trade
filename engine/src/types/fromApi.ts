export const GET_DEPTH = 'GET_DEPTH';
export const GET_OPEN_ORDERS = 'GET_OPEN_ORDERS'
export const CREATE_ORDER = 'CREATE_ORDER';
export const CANCEL_ORDER = "CANCEL_ORDER";
export const USER_BALANCE = 'USER_BALANCE';
export const GET_TICKER = 'GET_TICKER';
export type MessageFromApi =
    {
        type: typeof CREATE_ORDER,
        data: {
            market: string,
            side: 'buy' | 'sell',
            price: string,
            quantity: string,
            userId: string,
        }
    } |
    {
        type: typeof GET_DEPTH,
        data: {
            market: string,
        }
    } |
    {
        type: typeof GET_OPEN_ORDERS,
        data: {
            userId: string,
            market: string,
        }
    } |
    {
        type: typeof USER_BALANCE,
        data: {
            userId: string,
        }
    } |
    {
        type: typeof CANCEL_ORDER,
        data: {
            market: string,
            orderId: string,
        }
    } |
    {
        type: typeof GET_TICKER,
        data: {
            market: string,
        }
    }
