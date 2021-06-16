import { v4 as uuidv4 } from 'uuid';
import redisClient from '../utils/redis';
import { userAuthentication, findUserByAuth, findUserIdByToken } from '../utils/helpers';

class AuthController {
    static async getConnect(request, response) {
        // Authenticate user by generated token
        const auth = await userAuthentication(request);
        if (!auth) return response.status(401).json({ error: 'Unauthorized' });

        // Get user from authentication items
        const user = await findUserByAuth(auth.email, auth.password);
        if (!user) return response.status(401).json({ error: 'Unauthorized' });

        // Generate Token to return and Key to set in redis cache
        const token = uuidv4();
        const key = `auth_${token}`;

        // Set in Redis store
        await redisClient.set(key, user._id.toString(), 60 * 60 * 24);

        // Return the generated Token
        return response.json({ token });
    }

    static async getDisconnect(request, response) {
        // retrieve the user from the token
        const user = await findUserIdByToken(request);
        if (!user) return response.status(401).json({ error: 'Unauthorized' });
        console.log(user);
        // del the key from the redis cache
        await redisClient.del(user);
        // return successful response, if unauthorized it's clean anyway
        return response.status(204).end();
    }
}

module.exports = AuthController;
