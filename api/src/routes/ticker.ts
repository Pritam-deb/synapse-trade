
import { Router } from "express";
import { RedisManager } from "../RedisManager";

export const tickersRouter = Router();

tickersRouter.get("/", async (req, res) => {
    res.json([
        {
            "firstPrice": "82.50",
            "high": "84.00",
            "lastPrice": "83.50",
            "low": "81.70",
            "priceChange": "1.00",
            "priceChangePercent": "1.21",
            "quoteVolume": "1035000.00",
            "symbol": "USDC_INR",
            "trades": "120",
            "volume": "12500.00"
        }
    ]);
});

tickersRouter.get("/fetch", async (req, res) => {
    const { symbol } = req.query;
    const response = await RedisManager.getInstance().sendAndAwait({
        type: "GET_TICKER",
        data: {
            market: symbol as string,
        }
    })
    res.json(response.payload);
    // res.json({
    //     "firstPrice": "82.50",
    //     "high": "84.00",
    //     "lastPrice": "83.50",
    //     "low": "81.70",
    //     "priceChange": "1.00",
    //     "priceChangePercent": "1.21",
    //     "quoteVolume": "1035000.00",
    //     "symbol": symbol,
    //     "trades": "120",
    //     "volume": "12500.00"
    // });
})