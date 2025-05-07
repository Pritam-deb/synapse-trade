import { createClient } from "redis";
import { Engine } from "./trade/engine";
async function main() {
    const engine = new Engine();
    const redisClient = createClient();
    await redisClient.connect();
    console.log("Connected to Redis");
    while (true) {
        const message = await redisClient.lPop("messages" as string);
        if (!message) {
            console.log("No message in queue");
            await new Promise(resolve => setTimeout(resolve, 10000));
            continue;
        } else {
            const parsedMessage = JSON.parse(message);
            console.log("Received message:", parsedMessage);
            const { clientId, message: msg } = parsedMessage;
            const { type, data } = msg;
            // console.log("Type:", type);
            // console.log("Data:", data);
            // Process the message here
            engine.process(parsedMessage);
        }
    }
}

main().catch(err => {
    console.error("Error connecting to Redis", err);
});