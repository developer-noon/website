import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { getMongoDatabase } from '@/lib/mongodb';

type SavedReport = {
  id: string;
  userId: string;
  client: string;
  name: string;
  email: string;
  reportDate: string;
  createdAt: Date;
  totalHours: string;
  entries: unknown[];
};

export async function GET() {
  const session = await auth();
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!userId) return NextResponse.json({ error: 'You must be signed in.' }, { status: 401 });

  const database = await getMongoDatabase();
  const reports = await database.collection<SavedReport>('hoursReports')
    .find({ userId }, { projection: { _id: 0, userId: 0, entries: 0 } })
    .sort({ createdAt: -1 })
    .limit(100)
    .toArray();
  return NextResponse.json({ reports });
}
