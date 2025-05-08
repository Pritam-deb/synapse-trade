export const GET_DEPTH = 'GET_DEPTH';
export const GET_OPEN_ORDERS = 'GET_OPEN_ORDERS'
export type MessageFromApi =
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