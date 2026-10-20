import { getMongoDatabase } from '@/lib/mongodb';

type RateLimitDocument = { _id: string; count: number; resetAt: Date };

let indexReady: Promise<unknown> | null = null;

/**
 * Counts an attempt against `key` and returns false once `limit` attempts
 * have been made inside the current window. Backed by MongoDB so limits hold
 * across serverless instances.
 */
export async function consumeRateLimit(key: string, limit: number, windowMs: number) {
  const database = await getMongoDatabase();
  const collection = database.collection<RateLimitDocument>('rateLimits');
  indexReady ??= collection.createIndex({ resetAt: 1 }, { expireAfterSeconds: 0 }).catch(() => null);
  await indexReady;

  const now = new Date();
  const current = await collection.findOneAndUpdate(
    { _id: key, resetAt: { $gt: now } },
    { $inc: { count: 1 } },
    { returnDocument: 'after' },
  );
  if (current) return current.count <= limit;

  await collection.updateOne(
    { _id: key },
    { $set: { count: 1, resetAt: new Date(now.getTime() + windowMs) } },
    { upsert: true },
  );
  return true;
}

export function clientIp(request: Request) {
  const forwarded = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim();
  return forwarded || request.headers.get('x-real-ip') || 'unknown';
}
