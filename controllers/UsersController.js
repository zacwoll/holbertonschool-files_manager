const Queue = require('bull');
const dbClient = require('../utils/db');
const crypto = require('crypto');

class UsersController {
    static async postNew(request, response) {
        const userQueue = new Queue('userQueue');
        const { email } = request.body;
        const { password } = request.body;
        const users = dbClient.db.collection('users');
        const hashedPassword = await userInputValidation(response, email, password);

        const result = await users.insertOne({ email, password: hashedPassword });
        const createdUser = { id: result.ops[0]._id, email: result.ops[0].email };
        userQueue.add({ userId: createdUser.id });
        response.statusCode = 201;
        return response.json(createdUser);
    }
}

// Potentially break up function into validation & password hashing
async function userInputValidation(response, email, password) {
    if (!email) {
        response.statusCode = 400;
        return response.json({ error: 'Missing email' });
    }
    if (!password) {
        response.statusCode = 400;
        return response.json({ error: 'Missing password' });
    }

    const users = dbClient.db.collection('users');
    const existingUsers = await users.find({ email }).toArray();
    if (existingUsers.length > 0) {
        response.statusCode = 400;
        return response.json({ error: 'Already exists'});
    }

    const hashedPassword = crypto.createHash('SHA1').update(password).digest('hex');
    return hashedPassword;
}

module.exports = UsersController;