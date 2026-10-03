import { auth } from '@/auth';
import { getMongoDatabase } from '@/lib/mongodb';
import { NextResponse } from 'next/server';
import { sanitizeOfficeHoursStore, type OfficeHoursStore } from '@/lib/office-hours';

export async function GET() {
  const session = await auth();
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!userId) return NextResponse.json({ error: 'You must be signed in.' }, { status: 401 });

  const database = await getMongoDatabase();
  const collection = database.collection<{ userId: string; store: OfficeHoursStore; updatedAt: Date }>('officeHoursTrack');
  const record = await collection.findOne({ userId }, { projection: { _id: 0, store: 1 } });
  if (!record?.store) return NextResponse.json({ store: null });
  const store = sanitizeOfficeHoursStore(record.store);
  await collection.updateOne({ userId }, { $set: { store, updatedAt: new Date() } });
  return NextResponse.json({ store });
}

export async function PUT(request: Request) {
  const session = await auth();
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!userId) return NextResponse.json({ error: 'You must be signed in.' }, { status: 401 });

  try {
    const body = await request.json() as { store?: unknown };
    if (!body.store || typeof body.store !== 'object') {
      return NextResponse.json({ error: 'A valid OfficeHoursTrack store is required.' }, { status: 400 });
    }
    const store = sanitizeOfficeHoursStore(body.store as OfficeHoursStore);
    const database = await getMongoDatabase();
    await database.collection('officeHoursTrack').updateOne(
      { userId },
      { $set: { store, updatedAt: new Date() } },
      { upsert: true },
    );
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'Unable to save OfficeHoursTrack data.' }, { status: 400 });
  }
}
