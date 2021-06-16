import redisClient from './redis';
import dbClient from './db';
import crypto from 'crypto'

function hashPassword(password) {
  return crypto.createHash('SHA1').update(password).digest('hex');
}

async function getAuthToken(request) {
  const token = request.header['x-token'];
  return `auth_${token}`;
}

// checks authentication against verified information
// returns userId of user
async function findUserIdByToken(request) {
  const key = await getAuthToken(request);
  const userId = await redisClient.get(key);
  return userId || null;
}

// TODO: There should only be one user by userID, find a way to collapse result
// Gets user by userId
// Returns exactly the first user found
async function findUserById(userId) {
  const userExistsArray = await dbClient.users.find(`ObjectId("${userId}")`).toArray();
  return userExistsArray[0] || null;
}

async function userAuthentication(request) {
  const fullAuthHeader = request.headers.authorization;
  // AuthHeader is 'Basic [Basic email:password in base64]'
  const b64AuthHeader = fullAuthHeader.replace('Basic ', '');
  const auth = Buffer.from(b64AuthHeader, 'base64').toString();
  if (!auth.includes(':')) return null;
  const email = auth.split(':')[0];
  const password = auth.split(':')[1];
  const hashedPassword = hashPassword(password);
  return { email, password: hashedPassword };
}

// Searches DB for user returns first of list of all users by auth
async function findUserByAuth(email, hashedPassword) {
  const userExistsArray = await dbClient.users.find({ email, password: hashedPassword }).toArray();
  return userExistsArray.length === 0 ? null : userExistsArray[0];
}

export {
  findUserIdByToken, findUserById, userAuthentication, hashPassword, findUserByAuth
};
