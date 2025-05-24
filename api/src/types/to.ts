import { CANCEL_ORDER, CREATE_ORDER, GET_DEPTH, GET_OPEN_ORDERS, USER_BALANCE } from ".";

export type MessageToEngine =
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
        type: typeof CREATE_ORDER,
        data: {
            market: string,
            side: 'buy' | 'sell',
            price: string,
            quantity: string,
            userId: string,
        }
    } | {
        type: typeof CANCEL_ORDER,
        data: {
            orderId: string,
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
        type: 'GET_TICKER',
        data: {
            market: string,
        }
    }