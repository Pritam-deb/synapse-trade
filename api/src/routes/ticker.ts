
import { Router } from "express";

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
    res.json({
        "firstPrice": "82.50",
        "high": "84.00",
        "lastPrice": "83.50",
        "low": "81.70",
        "priceChange": "1.00",
        "priceChangePercent": "1.21",
        "quoteVolume": "1035000.00",
        "symbol": symbol,
        "trades": "120",
        "volume": "12500.00"
    });
})