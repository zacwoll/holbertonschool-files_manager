import { v4 as uuidv4 } from 'uuid';
import redisClient from '../utils/redis';
import '../utils/helpers';

class AuthController {
    static async getConnect(request, response) {

        // get credentials from request
        // validate credentials
        // generate token and key
        // Set into redis client
        // Return token as response
    }

    static async getDisconnect(request, response) {
        // get the key
        // if no key return Unauthorized
        // del the key from the redis cache
        // return successful response, if unauthorized it's clean anyway
    }
}

module.exports = AuthController;
