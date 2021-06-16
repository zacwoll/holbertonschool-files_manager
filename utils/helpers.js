import redisClient from './redis';
import dbClient from './db';
import crypto from 'crypto'

function hashPassword(password) {
  return crypto.createHash('SHA1').update(password).digest('hex');
}

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

async function userAuthentication(request) {
  const fullAuthHeader = request.headers.authorization;
  // AuthHeader is Ym9iQGR5bGFuLmNvbTp0b3RvMTIzNCE=
  const b64AuthHeader = fullAuthHeader.replace('Basic ', '');
  const auth = Buffer.from(b64AuthHeader, 'base64').toString();
  if (!auth.includes(':')) return null;
  const email = auth.split(':')[0];
  const password = auth.split(':')[1];
  const hashedPassword = hashPassword(password);
  return { email, password: hashedPassword };
}

export {
  checkAuth, findUserById, userAuthentication, hashPassword
};
