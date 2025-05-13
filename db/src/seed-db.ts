const { Client } = require('pg');

const client = new Client({
    user: 'admin',
    host: 'localhost',
    database: 'synapse_db',
    password: 'adminpassword',
    port: 5432,
});

async function initializeDB() {
    await client.connect();

    await client.query(`
        DROP TABLE IF EXISTS "usdc_prices";
        CREATE TABLE "usdc_prices"(
            time            TIMESTAMP WITH TIME ZONE NOT NULL,
            price   DOUBLE PRECISION,
            volume      DOUBLE PRECISION,
            currency_code   VARCHAR (10)
        );
        
        SELECT create_hypertable('usdc_prices', 'time', 'price', 2);
    `);

    await client.query(`
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


    await client.query(`
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

    await client.query(`
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

    await client.query(`
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

    await client.end();
    console.log("Database initialized successfully");
}

initializeDB().catch(console.error);
