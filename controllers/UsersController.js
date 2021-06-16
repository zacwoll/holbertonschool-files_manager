import { findUserById, findUserIdByToken, hashPassword } from '../utils/helpers';

const Queue = require('bull');
const dbClient = require('../utils/db');

class UsersController {
  static async postNew(request, response) {
    const userQueue = new Queue('userQueue');
    const { email } = request.body;
    const { password } = request.body;
    const users = dbClient.db.collection('users');
    // Input Validation
    if (!email) return response.status(400).json({ error: 'Missing email' });
    if (!password) return response.status(400).json({ error: 'Missing password' });
    const usersWithEmail = await dbClient.users.find({ email }).toArray();
    if (usersWithEmail.length > 0) return response.status(400).json({ error: 'Already exists' });
    // Validated User, Hashing pwd
    const hashedPassword = hashPassword(password);

    // Creating User and inserting into DB
    const result = await users.insertOne({ email, password: hashedPassword });
    const createdUser = { id: result.ops[0]._id, email: result.ops[0].email };

    // Adding new user to userQueue
    userQueue.add({ userId: createdUser.id });
    response.statusCode = 201;
    return response.json(createdUser);
  }

  static async getMe(request, response) {
    const userId = await findUserIdByToken(request);
    if (!userId) return response.status(401).json({ error: 'Unauthorized' });
    const user = await findUserById(userId);
    if (!user) return response.status(401).json({ error: 'Unauthorized' });
    return response.json({ id: user._id, email: user.email });
  }
}

module.exports = UsersController;
