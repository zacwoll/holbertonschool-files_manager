import { MongoClient } from 'mongodb';

// Database client object
class DBClient {
  constructor() {
    this.host = process.env.DB_HOST || 'localhost';
    this.port = process.env.DB_PORT || 27017;
    this.dbName = process.env.DB_DATABASE || 'files_manager';
    this.connected = false;
    this.connectToClient();
  }

  // Set up connection and set data from DB
  async connectToClient() {
    MongoClient(`mongodb://${this.host}:${this.port}`, { useUnifiedTopology: true })
      .connect()
      .then(async (client) => {
        this.client = client;
        this.connected = true;
        this.db = this.client.db(this.dbName);
        this.files = await this.db.collection('files');
        this.users = await this.db.collection('users');
      })
      .catch(console.error);
  }

  // returns connection stats of the db
  isAlive() { return this.connected; }

  // Returns the # of users
  async nbUsers() { return this.users.countDocuments(); }

  // Returns the # of files
  async nbFiles() { return this.files.countDocuments(); }
}

const dbClient = new DBClient();
export default dbClient;