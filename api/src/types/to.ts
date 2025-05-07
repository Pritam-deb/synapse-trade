import { GET_DEPTH } from ".";

export type MessageToEngine =
    {
        type: typeof GET_DEPTH,
        data: {
            market: string,
        }
    }