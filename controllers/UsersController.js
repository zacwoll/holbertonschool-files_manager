const Queue = require('bull');
const crypto = require('crypto');
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
    const hashedPassword = crypto.createHash('SHA1').update(password).digest('hex');

    // Creating User and inserting into DB
    const result = await users.insertOne({ email, password: hashedPassword });
    const createdUser = { id: result.ops[0]._id, email: result.ops[0].email };

    // Adding new user to userQueue
    userQueue.add({ userId: createdUser.id });
    response.statusCode = 201;
    return response.json(createdUser);
  }
}

module.exports = UsersController;
