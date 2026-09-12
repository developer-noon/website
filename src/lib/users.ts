import bcrypt from 'bcryptjs';
import { ObjectId } from 'mongodb';
import { getMongoDatabase } from '@/lib/mongodb';

export type UserRecord = {
  _id?: ObjectId;
  id?: string;
  name: string;
  email: string;
  password?: string;
  phone?: string;
  role?: string;
  company?: string;
  googleId?: string;
  provider?: string;
  picture?: string;
  lastLogin?: Date;
  createdAt?: Date;
};

export async function findUserByEmail(email: string): Promise<(UserRecord & { id: string }) | null> {
  const db = await getMongoDatabase();
  const user = await db.collection<UserRecord>('users').findOne({ email: email.trim().toLowerCase() });

  if (!user) {
    return null;
  }

  return {
    ...user,
    id: user._id?.toString() ?? '',
  };
}

export async function findUserById(id: string): Promise<(UserRecord & { id: string }) | null> {
  const db = await getMongoDatabase();
  const user = await db.collection<UserRecord>('users').findOne({ _id: new ObjectId(id) });

  if (!user) {
    return null;
  }

  return {
    ...user,
    id: user._id?.toString() ?? '',
  };
}

export async function createUser(input: {
  name: string;
  email: string;
  password: string;
  phone?: string;
  role?: string;
  company?: string;
}): Promise<UserRecord & { id: string; password?: string }> {
  const db = await getMongoDatabase();
  const email = input.email.trim().toLowerCase();

  const existingUser = await db.collection<UserRecord>('users').findOne({ email });
  if (existingUser) {
    throw new Error('A user with this email already exists.');
  }

  const passwordHash = await bcrypt.hash(input.password, 12);
  const result = await db.collection<UserRecord>('users').insertOne({
    name: input.name.trim(),
    email,
    password: passwordHash,
    phone: input.phone?.trim() ?? '',
    role: input.role ?? 'user',
    company: input.company?.trim() ?? '',
    createdAt: new Date(),
  });

  const createdUser = await db.collection<UserRecord>('users').findOne({ _id: result.insertedId });

  if (!createdUser) {
    throw new Error('User creation failed.');
  }

  return {
    ...createdUser,
    id: createdUser._id?.toString() ?? '',
    password: undefined,
  };
}
