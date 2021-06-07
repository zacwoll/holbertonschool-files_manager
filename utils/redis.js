import redis from 'redis';
const { promisify } = require('util');

class RedisClient {
    // Every client must create and connect to redis
    constructor() {
        this.client = redis.createClient();
        this.client.on('error', (error) => console.error(`Redis client not connected to the server: ${error.message}`));
    }

    // Returns status of client
    isAlive() {
        return this.client.connected;
    }

    // Returns value at key from redis store
    async get(key) {
        const asyncGet = promisify(this.client.get).bind(this.client);
        const value = await asyncGet(key).catch(console.error);
        return value;
    }

    // Sets value into redis store
    async set(key, value, duration) {
        const asyncSet = promisify(this.client.set).bind(this.client);
        await asyncSet(key, value, 'EX', duration).catch(console.error);
    }

    // Deletes value at redis store
    async del(key) {
        const asyncDel = promisify(this.client.del).bind(this.client);
        await asyncDel(key).catch(console.error);
    }
}

const redisClient = new RedisClient();
module.exports = redisClient;