import { createHash, randomInt, randomBytes, timingSafeEqual } from 'crypto';
import { getMongoDatabase } from '@/lib/mongodb';

const collectionName = 'emailVerifications';
const verificationLifetimeMs = 15 * 60 * 1000;
const maxCodeAttempts = 5;

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
        attempts: 0,
        createdAt: new Date(),
      },
      $unset: { verifiedAt: '' },
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

/**
 * Checks a six-digit code. Each guess is counted atomically before it is compared,
 * so a code is locked after `maxCodeAttempts` tries however the requests interleave.
 */
export async function verifyEmailCode(email: string, code: string) {
  const database = await getMongoDatabase();
  const collection = database.collection<{ _id: unknown; codeHash: string }>(collectionName);
  const pending = await collection.findOneAndUpdate(
    {
      email: normalizeEmail(email),
      expiresAt: { $gt: new Date() },
      verifiedAt: { $exists: false },
      attempts: { $lt: maxCodeAttempts },
    },
    { $inc: { attempts: 1 } },
    { returnDocument: 'before' },
  );
  if (!pending) return null;

  const matches = timingSafeEqual(Buffer.from(pending.codeHash), Buffer.from(hash(code)));
  if (!matches) return null;

  const token = randomBytes(32).toString('hex');
  await collection.updateOne(
    { _id: pending._id },
    { $set: { verifiedAt: new Date(), verificationTokenHash: hash(token), expiresAt: new Date(Date.now() + verificationLifetimeMs) } },
  );
  return token;
}
