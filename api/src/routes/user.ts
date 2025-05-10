import { Router } from "express";
import { RedisManager } from "../RedisManager";
import { USER_BALANCE } from "../types";

export const userRouter = Router();
userRouter.get("/balance", async (req, res) => {
    const response = await RedisManager.getInstance().sendAndAwait({
        type: USER_BALANCE,
        data: {
            userId: req.query.userId as string,
        }
    });
    res.json(response.payload);
})