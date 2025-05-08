import { Order } from "../trade/orderbook"

export type MessageToApi = 
{
    type: "DEPTH",
    payload: {
        bids: [string, string][],
        asks: [string, string][],
    }
} |
{
    type: "OPEN_ORDERS",
    payload: Order[]
}