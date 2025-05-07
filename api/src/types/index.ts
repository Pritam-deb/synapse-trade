export const GET_DEPTH = 'GET_DEPTH';

export type MessageFromOrderbook =
    {
        type: 'DEPTH',
        payload: {
            market: string,
            bids: [string, string][],
            asks: [string, string][],
        }
    }