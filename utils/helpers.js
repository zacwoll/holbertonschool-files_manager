import redisClient from './redis';
import dbClient from './db';
import crypto from 'crypto'
import { ObjectId, ObjectID } from 'bson';

function hashPassword(password) {
  return crypto.createHash('SHA1').update(password).digest('hex');
}

async function getAuthToken(request) {
  const token = request.headers['x-token'];
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

async function findFile(request, response, files, userId) {
  // Get the fileId from the request
  const fileId = request.params.id;

  // find file with or without userId
  let fileArray;
  if (userId !== 'null') {
    fileArray = await files.find({ _id: ObjectID(fileId) }).toArray();
  } else {
    fileArray = await files.find(
      { userId: ObjectID(userId), _id: ObjectID(fileId)}
    ).toArray();
  }
  return fileArray.length > 0 ? fileArray[0] : null;
}

async function respondWithFile(response, file, userId) {
  return response.json({
    id: file._id,
    userId,
    name: file.name,
    type: file.type,
    isPublic: file.isPublic,
    parentId: file.parentId,
  });
}

async function findFilesByParentId(response, files, page, searchTerm, searchValue) {
  let folders;
  if (searchTerm === 'userId') {
    folders = await files.aggregate([
      { $match: { userId: ObjectID(searchValue) } },
      { $skip: page * 20 },
      { $limit: 20 },
    ]).toArray();
  } else if (searchTerm === 'parentId') {
    folders = await files.aggregate([
      { $match: { parentId: ObjectId(searchValue) } },
      { $skip: page * 20 },
      { $limit: 20 },
    ]).toArray();
  }
  if (folders.length === 0) return response.json([]);
  const data = folders.map((file) => ({
    id: file._id,
    userId: file.userId,
    name: file.name,
    type: file.type,
    isPublic: file.isPublic,
    parentId: file.parentId,
  }));
  return response.json(data);
}


export {
  findUserIdByToken, findUserById, userAuthentication, hashPassword, findUserByAuth, findFile, respondWithFile, findFilesByParentId
};
