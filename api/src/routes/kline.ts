import { request, response, Router } from "express";
import { Client } from "pg";

const pgClient = new Client({
    user: 'admin',
    host: 'localhost',
    database: 'synapse_db',
    password: 'adminpassword',
    port: 5432,
});
pgClient.connect();

export const klineRouter = Router();

klineRouter.get("/", async (req, res) => {
    const { market, interval, startTime, endTime } = req.query;
    let query = "";

    switch (interval) {
        case "1m":
            query = `SELECT * FROM klines_1m WHERE bucket >= $1 AND bucket <= $2`;
            break;
        case "1h":
            query = `SELECT * FROM klines_1h WHERE bucket >= $1 AND bucket <= $2`;
            break;
        case "1w":
            query = `SELECT * FROM klines_1w WHERE bucket >= $1 AND bucket <= $2`;
            break;
        default:
            res.status(400).send("Invalid interval");

    }

    const start = Number(startTime);
    const end = Number(endTime);

    if (isNaN(start) || isNaN(end)) {
        res.status(400).send("Invalid startTime or endTime");
    }

    try {
        const result = await pgClient.query(query, [new Date(start * 1000), new Date(end * 1000)]);
        res.json(result.rows.map(x => ({
            close: x.close,
            end: x.bucket,
            high: x.high,
            low: x.low,
            open: x.open,
            quoteVolume: x.quoteVolume,
            start: x.start,
            trades: x.trades,
            volume: x.volume,
        })));
    } catch (err) {
        console.log(err);
        res.status(500).send("Internal server error");
    }
});
