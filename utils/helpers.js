import redisClient from './redis';
import dbClient from './db';

// checks authentication against verified information
async function checkAuth(request) {
  const token = request.headers['x-token'];
  const key = `auth_${token}`;
  const userId = await redisClient.get(key);
  return userId || null;
}

// TODO: There should only be one user by userID, find a way to collapse result
async function findUserById(userId) {
  const userExistsArray = await dbClient.users.find(`ObjectId("${userId}")`).toArray();
  return userExistsArray[0] || null;
}

export {
  checkAuth, findUserById
};
