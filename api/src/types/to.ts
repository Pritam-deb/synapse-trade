import { GET_DEPTH, GET_OPEN_ORDERS } from ".";

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
    }