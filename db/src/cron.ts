import { Client } from 'pg';

const client = new Client({
    user: 'admin',
    host: 'localhost',
    database: 'synapse_db',
    password: 'adminpassword',
    port: 5432,
});
client.connect();

async function refreshViews() {

    await client.query('REFRESH MATERIALIZED VIEW klines_1m');
    await client.query('REFRESH MATERIALIZED VIEW klines_1h');
    await client.query('REFRESH MATERIALIZED VIEW klines_1w');

    console.log("Materialized views refreshed successfully");
}

refreshViews().catch(console.error);

setInterval(() => {
    refreshViews()
}, 1000 * 10);