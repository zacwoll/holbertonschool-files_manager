const redisClient = require('../utils/redis');
const dbClient = require('../utils/db');

class AppController {
    static getStatus(request, response) {
        const status = {
            redis: redisClient.isAlive(),
            db: dbClient.isAlive()
        };
        return response.json(status);
    }

    static async getStats(request, response) {
        const stats = {
            users: await dbClient.nbUsers(),
            files: await dbClient.nbFiles()
        };
        return response.json(stats);
    }
}

module.exports = AppController;