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
const { Client } = require('pg');
const client = new Client({
    user: 'admin',
    host: 'localhost',
    database: 'synapse_db',
    password: 'adminpassword',
    port: 5432,
});
function initializeDB() {
    return __awaiter(this, void 0, void 0, function* () {
        yield client.connect();
        yield client.query(`
        DROP TABLE IF EXISTS "usdc_prices";
        CREATE TABLE "usdc_prices"(
            time            TIMESTAMP WITH TIME ZONE NOT NULL,
            price   DOUBLE PRECISION,
            volume      DOUBLE PRECISION,
            currency_code   VARCHAR (10)
        );
        
        SELECT create_hypertable('usdc_prices', 'time', 'price', 2);
    `);
        yield client.query(`
        DROP TABLE IF EXISTS "orders";
        CREATE TABLE "orders"(
            
            order_id        VARCHAR (50) NOT NULL,
            market          VARCHAR (50) NOT NULL,
            side            VARCHAR (10) NOT NULL,
            price           DOUBLE PRECISION,
            quantity        DOUBLE PRECISION,
            executed_qty    DOUBLE PRECISION,
            status          VARCHAR (10) NOT NULL,
            created_at      TIMESTAMP WITH TIME ZONE NOT NULL,
            updated_at      TIMESTAMP WITH TIME ZONE NOT NULL,
            PRIMARY KEY (order_id)
        );
    `);
        yield client.query(`
        CREATE MATERIALIZED VIEW IF NOT EXISTS klines_1m AS
        SELECT
            time_bucket('1 minute', time) AS bucket,
            first(price, time) AS open,
            max(price) AS high,
            min(price) AS low,
            last(price, time) AS close,
            sum(volume) AS volume,
            currency_code
        FROM usdc_prices
        GROUP BY bucket, currency_code;
    `);
        yield client.query(`
        CREATE MATERIALIZED VIEW IF NOT EXISTS klines_1h AS
        SELECT
            time_bucket('1 hour', time) AS bucket,
            first(price, time) AS open,
            max(price) AS high,
            min(price) AS low,
            last(price, time) AS close,
            sum(volume) AS volume,
            currency_code
        FROM usdc_prices
        GROUP BY bucket, currency_code;
    `);
        yield client.query(`
        CREATE MATERIALIZED VIEW IF NOT EXISTS klines_1w AS
        SELECT
            time_bucket('1 week', time) AS bucket,
            first(price, time) AS open,
            max(price) AS high,
            min(price) AS low,
            last(price, time) AS close,
            sum(volume) AS volume,
            currency_code
        FROM usdc_prices
        GROUP BY bucket, currency_code;
    `);
        yield client.end();
        console.log("Database initialized successfully");
    });
}
initializeDB().catch(console.error);
