import { createClient } from "redis";

async function main() {
    const redisClient = createClient();
    await redisClient.connect();
    console.log("Connected to Redis");
    while (true) {
        const message = await redisClient.lPop("messages" as string);
        if (!message) {
            console.log("No message in queue");
            await new Promise(resolve => setTimeout(resolve, 1000));
            continue;
        } else {
            const parsedMessage = JSON.parse(message);
            console.log("Received message:", parsedMessage);
            const { clientId, message: msg } = parsedMessage;
            const { type, data } = msg;
            console.log("Type:", type);
            console.log("Data:", data);
            // Process the message here
        }
    }
}

main().catch(err => {
    console.error("Error connecting to Redis", err);
});