import { createClient, RedisClientType } from "redis";

import { MessageFromOrderbook } from "./types";
import { MessageToEngine } from "./types/to";

export class RedisManager {
    private client: RedisClientType;
    private publisher: RedisClientType;
    private static instance: RedisManager;

    private constructor() {
        this.client = createClient();
        this.client.connect();
        this.publisher = createClient();
        this.publisher.connect();
    }

    public static getInstance() {
        if (!this.instance) {
            this.instance = new RedisManager();
        }
        return this.instance;
    }

    public sendAndAwait(message: MessageToEngine) {
        return new Promise<MessageFromOrderbook>((resolve, reject) => {
            const clientId = this.getRandomClientId();
            this.client.subscribe(clientId, (message: string) => {
                this.client.unsubscribe(clientId);
                resolve(JSON.parse(message) as MessageFromOrderbook);
            });
            this.client.on('error', (err) => {
                console.error('Redis Client Error', err);
                reject(err);
            });
            this.publisher.lPush("messages", JSON.stringify({ clientId, message }));
        })
    }

    public getRandomClientId() {
        return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    }
}