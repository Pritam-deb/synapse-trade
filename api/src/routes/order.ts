import { RedisManager } from "../RedisManager";
import { Router } from "express";
import { GET_OPEN_ORDERS, CREATE_ORDER, CANCEL_ORDER } from "../types";

export const orderRouter = Router();

orderRouter.get("/open", async (req, res) => {
    const response = await RedisManager.getInstance().sendAndAwait({
        type: GET_OPEN_ORDERS,
        data: {
            userId: req.query.userId as string,
            market: req.query.market as string,
        }
    });
    res.json(response.payload)
})

orderRouter.post("/create", async (req, res) => {
    const { market, side, price, quantity, userId } = req.body;
    const response = await RedisManager.getInstance().sendAndAwait({
        type: CREATE_ORDER,
        data: {
            market,
            side,
            price,
            quantity,
            userId,
        }
    });
    res.json(response.payload);
});

orderRouter.delete("/", async (req, res) => {
    const { orderId, market } = req.body;
    const response = await RedisManager.getInstance().sendAndAwait({
        type: CANCEL_ORDER,
        data: {
            orderId,
            market
        }
    });
    res.json(response.payload);
});