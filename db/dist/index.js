"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const pg_1 = require("pg");
const redis_1 = require("redis");
const pgClient = new pg_1.Client({
    user: 'admin',
    host: 'localhost',
    database: 'synapse_db',
    password: 'adminpassword',
    port: 5432,
});
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        yield pgClient.connect();
        const redisClient = (0, redis_1.createClient)();
        yield redisClient.connect();
        console.log("Connected to Redis");
        console.log("Connected to Postgres");
        while (true) {
            const message = yield redisClient.lPop("db_processor");
            if (message) {
                const dbMessage = JSON.parse(message);
                // Process the message and insert it into the database
                if (dbMessage.type === "TRADE_ADDED") {
                    const { id, isBuyerMaker, price, quantity, quoteQuantity, timestamp, market } = dbMessage.data;
                    const convertedTimestamp = new Date(timestamp);
                    yield pgClient.query('INSERT INTO usdc_prices ( price, time, volume, currency_code) VALUES ($1, $2, $3, $4)', [price, convertedTimestamp, quantity, market.split('_')[1]]);
                }
                else if (dbMessage.type === "ORDER_UPDATE") {
                    const { orderId, executedQty } = dbMessage.data;
                    yield pgClient.query('UPDATE orders SET executed_qty = $1 WHERE order_id = $2', [executedQty, orderId]);
                }
            }
        }
    });
}
main().catch(err => {
    console.error("Error in main function:", err);
}).finally(() => {
    pgClient.end();
});
