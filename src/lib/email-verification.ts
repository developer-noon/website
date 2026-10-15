import { createHash, randomInt, randomBytes } from 'crypto';
import { getMongoDatabase } from '@/lib/mongodb';

const collectionName = 'emailVerifications';
const verificationLifetimeMs = 15 * 60 * 1000;

export function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function hash(value: string) {
  return createHash('sha256').update(value).digest('hex');
}

export async function createEmailVerification(email: string) {
  const normalizedEmail = normalizeEmail(email);
  const code = String(randomInt(100000, 1000000));
  const token = randomBytes(32).toString('hex');
  const database = await getMongoDatabase();
  await database.collection(collectionName).updateOne(
    { email: normalizedEmail },
    {
      $set: {
        email: normalizedEmail,
        codeHash: hash(code),
        verificationTokenHash: hash(token),
        expiresAt: new Date(Date.now() + verificationLifetimeMs),
        createdAt: new Date(),
      },
      $unset: { verifiedAt: '', attempts: '' },
    },
    { upsert: true },
  );
  return { code, token, email: normalizedEmail };
}

export async function consumeEmailVerification(email: string, token: string) {
  const database = await getMongoDatabase();
  const result = await database.collection(collectionName).findOneAndDelete({
    email: normalizeEmail(email),
    verificationTokenHash: hash(token),
    expiresAt: { $gt: new Date() },
  });
  return Boolean(result);
}

export async function verifyEmailCode(email: string, code: string) {
  const database = await getMongoDatabase();
  const token = randomBytes(32).toString('hex');
  const result = await database.collection(collectionName).findOneAndUpdate(
    {
      email: normalizeEmail(email),
      codeHash: hash(code),
      expiresAt: { $gt: new Date() },
    },
    { $set: { verifiedAt: new Date(), verificationTokenHash: hash(token), expiresAt: new Date(Date.now() + verificationLifetimeMs) } },
    { returnDocument: 'after' },
  );
  return result ? token : null;
}
