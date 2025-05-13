import axios from "axios";

const BASE_URL = "http://localhost:3000";
const TOTAL_BIDS = 10;
const TOTAL_ASK = 10;
const MARKET = "USDC_INR";
const USER_ID = ["1", "2", "5"];

async function main() {
    const price = 1000 + Math.random() * 10;
    //only orders of 1 user is fetched here
    const openOrders = await axios.get(`${BASE_URL}/order/open?userId=${USER_ID}&market=${MARKET}`);

    const totalBids = openOrders.data.filter((o: any) => o.side === "buy").length;
    const totalAsks = openOrders.data.filter((o: any) => o.side === "sell").length;

    // const cancelledBids = await cancelBidsMoreThan(openOrders.data, price);
    // const cancelledAsks = await cancelAsksLessThan(openOrders.data, price);

    let bidsToAdd = TOTAL_BIDS - totalBids
    // - cancelledBids;
    let asksToAdd = TOTAL_ASK - totalAsks
    // - cancelledAsks;
    console.log("Bids to add: ", bidsToAdd, "Asks to add: ", asksToAdd);
    while (bidsToAdd > 0 || asksToAdd > 0) {
        if (bidsToAdd > 0) {
            const res = await axios.post(`${BASE_URL}/order/create`, {
                market: MARKET,
                price: (price - Math.random() * 1).toFixed(1).toString(),
                quantity: getRandomQuantity().toString(),
                side: "buy",
                userId: getRandomUserId()
            });
            console.log("Bids added: ", res.data);
            if (res.data.orderId !== '') {
                bidsToAdd--;
            }
        }
        if (asksToAdd > 0) {
            const res = await axios.post(`${BASE_URL}/order/create`, {
                market: MARKET,
                price: (price + Math.random() * 1).toFixed(1).toString(),
                quantity: getRandomQuantity().toString(),
                side: "sell",
                userId: getRandomUserId()
            });
            console.log("Asks added: ", res.data);
            if (res.data.orderId !== '') {
                asksToAdd--;
            }
        }
        console.log("Bids to add: ", bidsToAdd, "Asks to add: ", asksToAdd);
        await new Promise(resolve => setTimeout(resolve, 1000));
    }

    await new Promise(resolve => {
        console.log("Waiting for 30 minutes before next iteration");
        setTimeout(resolve, 1000 * 60 * 30);
    });

    main();
}

function getRandomUserId() {
    return USER_ID[Math.floor(Math.random() * USER_ID.length)];
}
function getRandomQuantity() {
    return (Math.floor(Math.random() * 9) + 1) * 100;
}


async function cancelBidsMoreThan(openOrders: any[], price: number) {
    let promises: any[] = [];
    openOrders.map(o => {
        if (o.side === "buy" && (o.price > price || Math.random() < 0.1)) {
            promises.push(axios.delete(`${BASE_URL}/order`, {
                data: {
                    orderId: o.orderId,
                    market: MARKET
                }
            }));
        }
    });
    await Promise.all(promises);
    return promises.length;
}

async function cancelAsksLessThan(openOrders: any[], price: number) {
    let promises: any[] = [];
    openOrders.map(o => {
        if (o.side === "sell" && (o.price < price || Math.random() < 0.5)) {
            promises.push(axios.delete(`${BASE_URL}/order`, {
                data: {
                    orderId: o.orderId,
                    market: MARKET
                }
            }));
        }
    });

    await Promise.all(promises);
    return promises.length;
}

main();