import bcrypt from 'bcryptjs';
import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB || 'website';
const email = (process.env.ADMIN_EMAIL || '').trim().toLowerCase();
const password = process.env.ADMIN_PASSWORD || '';

if (!uri || !email || !password) {
  throw new Error('MONGODB_URI, ADMIN_EMAIL, and ADMIN_PASSWORD are required.');
}

const client = await MongoClient.connect(uri);
try {
  const database = client.db(dbName);
  const passwordHash = await bcrypt.hash(password, 12);
  await database.collection('users').updateOne(
    { email },
    {
      $set: {
        name: process.env.ADMIN_NAME || 'Hammad Noon',
        email,
        password: passwordHash,
        role: 'admin',
        provider: 'credentials',
        updatedAt: new Date(),
      },
      $setOnInsert: { createdAt: new Date() },
    },
    { upsert: true },
  );
  console.log(`Admin account ready for ${email}`);
} finally {
  await client.close();
}
