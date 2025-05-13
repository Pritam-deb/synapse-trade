import { Client } from "pg";
import { createClient } from "redis";
import { DbMessage } from "./types";


const pgClient = new Client({
    user: 'admin',
    host: 'localhost',
    database: 'synapse_db',
    password: 'adminpassword',
    port: 5432,
});

async function main() {
    await pgClient.connect();
    const redisClient = createClient();
    await redisClient.connect();
    console.log("Connected to Redis");
    console.log("Connected to Postgres");
    while (true) {
        const message = await redisClient.lPop("db_processor");
        if (message) {
            const dbMessage: DbMessage = JSON.parse(message);
            console.log("Received message from Redis:", dbMessage);
            // Process the message and insert it into the database
            if (dbMessage.type === "TRADE_ADDED") {
                const { id, isBuyerMaker, price, quantity, quoteQuantity, timestamp, market } = dbMessage.data;
                const convertedTimestamp = new Date(timestamp * 1000);
                await pgClient.query(
                    'INSERT INTO usdc_prices ( price, time) VALUES ($1, $2)',
                    [price, convertedTimestamp]
                );
            } else if (dbMessage.type === "ORDER_UPDATE") {
                //     const { orderId, executedQty } = dbMessage.data;
                //     await pgClient.query(
                //         'UPDATE orders SET executed_qty = $1 WHERE order_id = $2',
                //         [executedQty, orderId]
                //     );
                // }
            }
        }
    }
}

main().catch(err => {
    console.error("Error in main function:", err);
}).finally(() => {
    pgClient.end();
});