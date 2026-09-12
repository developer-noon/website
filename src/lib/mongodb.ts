import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB || 'website';

const globalForMongo = globalThis as typeof globalThis & {
  mongoClient?: MongoClient;
  mongoClientPromise?: Promise<MongoClient>;
};

const getClientPromise = () => {
  if (!uri) {
    throw new Error('Please add your MONGODB_URI to the environment variables.');
  }

  if (!globalForMongo.mongoClientPromise) {
    const uriWithDatabase = uri.replace(
      /^(mongodb(?:\+srv)?:\/\/[^/]+)\/?(?=\?|$)/,
      `$1/${dbName}`,
    );
    globalForMongo.mongoClient = new MongoClient(uriWithDatabase);
    globalForMongo.mongoClientPromise = globalForMongo.mongoClient.connect();
  }

  return globalForMongo.mongoClientPromise;
};

export async function getMongoDatabase() {
  const mongoClient = await getClientPromise();
  return mongoClient.db(dbName);
}

const clientPromiseForAdapter = Promise.resolve().then(getClientPromise);

export default clientPromiseForAdapter;
