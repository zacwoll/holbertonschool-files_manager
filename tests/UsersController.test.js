import crypto from 'crypto';
import { ObjectID } from 'mongodb';
import chai, { expect } from 'chai';
import chaiHttp from 'chai-http';
import app from '../server';
import dbClient from '../utils/db';
import redisClient from '../utils/redis';
import { getRandomInt, credsFromAuthHeaderString, findUserByCreds } from '../utils/helpers';

chai.use(chaiHttp);
const randomUserId = getRandomInt(1, 99999999);
const randomPassword = getRandomInt(1, 99999999);

describe('UsersController', () => {
  beforeEach(async () => {
    await dbClient.users.deleteMany({});
    await dbClient.files.deleteMany({});
    await dbClient.users.insertOne({ email: 'bob@dylan.com', password: '89cad29e3ebc1035b29b1478a8e70854f25fa2b2' });
  });

  afterEach(async () => {
    await dbClient.users.deleteMany({});
    await dbClient.files.deleteMany({});
  });

  it('POST /users with a random new user', (done) => {
    const bodyData = {
      email: `testuser${randomUserId}@email.com`,
      password: `${randomPassword}abcde`,
    };
    chai.request(app)
      .post('/users')
      .send(bodyData)
      .end(async (err, res) => {
        expect(err).to.be.null;
        expect(res).to.have.status(201);
        expect(res.body).to.have.property('email');
        expect(res.body).to.have.property('id');
        expect(res.body.email).to.equal(bodyData.email);

        const userArray = await dbClient.users.find({
          _id: ObjectID(res.body.id),
          email: bodyData.email,
        }).toArray();
        const user = userArray[0];
        const hashedPassword = crypto.createHash('SHA1').update(bodyData.password).digest('hex');
        expect(userArray.length).to.be.greaterThan(0);
        expect(user.email).to.equal(bodyData.email);
        expect(user._id.toString()).to.equal(ObjectID(res.body.id).toString());
        expect(user.password).to.equal(hashedPassword);
        done();
      });
  });

  it('POST /users with user that already exists', (done) => {
    const bodyData = {
      email: 'bob@dylan.com',
      password: 'toto1234!',
    };
    chai.request(app)
      .post('/users')
      .send(bodyData)
      .end((err, res) => {
        expect(err).to.be.null;
        expect(res).to.have.status(400);
        expect(res.body.error).to.equal('Already exist');
        done();
      });
  });

  it('POST /users with missing email', (done) => {
    const bodyData = {
      password: `${randomPassword}abcde`,
    };
    chai.request(app)
      .post('/users')
      .send(bodyData)
      .end((err, res) => {
        expect(err).to.be.null;
        expect(res).to.have.status(400);
        expect(res.body.error).to.equal('Missing email');
        done();
      });
  });

  it('POST /users with missing password', (done) => {
    const bodyData = {
      email: `testuser${randomUserId}@email.com`,
    };
    chai.request(app)
      .post('/users')
      .send(bodyData)
      .end((err, res) => {
        expect(err).to.be.null;
        expect(res).to.have.status(400);
        expect(res.body).to.deep.equal({ error: 'Missing password' });
        done();
      });
  });

  it('GET /users/me with invalid user', (done) => {
    const headerData = { 'X-Token': '031bffac-3edc-4e51-aaae-1c121317da8a' };
    chai.request(app)
      .get('/users/me')
      .send(headerData)
      .end((err, res) => {
        expect(err).to.be.null;
        expect(res).to.have.status(401);
        expect(res.body.error).to.equal('Unauthorized');
        done();
      });
  });
});