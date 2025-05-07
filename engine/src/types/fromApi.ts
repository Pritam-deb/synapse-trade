export const GET_DEPTH = 'GET_DEPTH';

export type MessageFromApi =
    {
        type: typeof GET_DEPTH,
        data: {
            market: string,
        }
    }