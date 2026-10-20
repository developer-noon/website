import { ObjectId } from 'mongodb';
import { getMongoDatabase } from '@/lib/mongodb';
import { decryptTotpSecret, encryptTotpSecret, generateTotpSecret, verifyTotp } from '@/lib/totp';

export type TwoFactorState = {
  secret: string;
  enabled: boolean;
  lastUsedStep?: number;
};

type UserTwoFactorDocument = { _id: ObjectId; email?: string; twoFactor?: TwoFactorState };

const usersCollection = async () => (await getMongoDatabase()).collection<UserTwoFactorDocument>('users');

export async function getTwoFactorStatus(userId: string) {
  if (!ObjectId.isValid(userId)) return { enabled: false, pending: false };
  const user = await (await usersCollection()).findOne({ _id: new ObjectId(userId) }, { projection: { twoFactor: 1 } });
  return { enabled: Boolean(user?.twoFactor?.enabled), pending: Boolean(user?.twoFactor && !user.twoFactor.enabled) };
}

/** Creates a pending secret for a user who has not enabled two-step verification yet. */
export async function startTwoFactorSetup(userId: string) {
  const collection = await usersCollection();
  const secret = generateTotpSecret();
  const result = await collection.updateOne(
    { _id: new ObjectId(userId), 'twoFactor.enabled': { $ne: true } },
    { $set: { twoFactor: { secret: encryptTotpSecret(secret), enabled: false, lastUsedStep: -1 } } },
  );
  return result.matchedCount ? secret : null;
}

export async function getPendingTwoFactorSecret(userId: string) {
  const user = await (await usersCollection()).findOne({ _id: new ObjectId(userId) }, { projection: { twoFactor: 1 } });
  if (!user?.twoFactor || user.twoFactor.enabled) return null;
  return decryptTotpSecret(user.twoFactor.secret);
}

/** Enables two-step verification once the user proves the authenticator app works. */
export async function confirmTwoFactorSetup(userId: string, code: string) {
  const secret = await getPendingTwoFactorSecret(userId);
  if (!secret) return false;
  const step = verifyTotp(secret, code);
  if (step === null) return false;
  const result = await (await usersCollection()).updateOne(
    { _id: new ObjectId(userId), 'twoFactor.enabled': { $ne: true } },
    { $set: { 'twoFactor.enabled': true, 'twoFactor.lastUsedStep': step } },
  );
  return result.modifiedCount === 1;
}

export async function disableTwoFactor(userId: string) {
  await (await usersCollection()).updateOne({ _id: new ObjectId(userId) }, { $unset: { twoFactor: '' } });
}

/**
 * Checks the second factor during sign-in. Accounts without two-step verification
 * always pass. A code is accepted once: the matched time step is recorded atomically.
 */
export async function checkSecondFactor(userId: string, code: string) {
  const collection = await usersCollection();
  const user = await collection.findOne({ _id: new ObjectId(userId) }, { projection: { twoFactor: 1 } });
  if (!user?.twoFactor?.enabled) return true;

  const step = verifyTotp(decryptTotpSecret(user.twoFactor.secret), code, user.twoFactor.lastUsedStep ?? -1);
  if (step === null) return false;

  const result = await collection.updateOne(
    {
      _id: new ObjectId(userId),
      $or: [{ 'twoFactor.lastUsedStep': { $exists: false } }, { 'twoFactor.lastUsedStep': { $lt: step } }],
    },
    { $set: { 'twoFactor.lastUsedStep': step } },
  );
  return result.matchedCount === 1;
}
