import { RedisManager } from "../RedisManager";
import { Router } from "express";
import { GET_OPEN_ORDERS } from "../types";

export const orderRouter = Router();

orderRouter.get("/open",async (req, res)=>{
    const response = await RedisManager.getInstance().sendAndAwait({
        type: GET_OPEN_ORDERS,
        data: {
            userId: req.query.userId as string,
            market: req.query.market as string,
        }
    });
    res.json(response.payload)
})