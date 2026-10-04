import { auth } from '@/auth';
import { getMongoDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { NextResponse } from 'next/server';
import type { Session } from 'next-auth';

function getSessionUserId(session: Session | null) {
  const user = session?.user as { id?: string } | undefined;
  return user?.id && ObjectId.isValid(user.id) ? user.id : null;
}

export async function GET() {
  const session = await auth();
  const userId = getSessionUserId(session);
  if (!userId) return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });

  const database = await getMongoDatabase();
  const user = await database.collection('users').findOne(
    { _id: new ObjectId(userId) },
    { projection: { name: 1, email: 1, phone: 1, company: 1, role: 1, image: 1, picture: 1 } },
  );
  if (!user) return NextResponse.json({ error: 'Account not found.' }, { status: 404 });
  return NextResponse.json({ user: { name: user.name ?? '', email: user.email ?? '', phone: user.phone ?? '', company: user.company ?? '', role: user.role ?? 'user', image: user.image ?? user.picture ?? '' } });
}

export async function PATCH(request: Request) {
  const session = await auth();
  const userId = getSessionUserId(session);
  if (!userId) return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });

  try {
    const body = await request.json() as { name?: unknown; phone?: unknown; company?: unknown };
    if (typeof body.name !== 'string' || !body.name.trim()) {
      return NextResponse.json({ error: 'Name is required.' }, { status: 400 });
    }
    const database = await getMongoDatabase();
    const result = await database.collection('users').updateOne(
      { _id: new ObjectId(userId) },
      { $set: { name: body.name.trim(), phone: typeof body.phone === 'string' ? body.phone.trim() : '', company: typeof body.company === 'string' ? body.company.trim() : '', updatedAt: new Date() } },
    );
    if (!result.matchedCount) return NextResponse.json({ error: 'Account not found.' }, { status: 404 });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'Unable to update your profile.' }, { status: 400 });
  }
}

export async function DELETE() {
  const session = await auth();
  const userId = getSessionUserId(session);
  if (!userId) return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });

  const database = await getMongoDatabase();
  const objectUserId = new ObjectId(userId);
  await Promise.all([
    database.collection('users').deleteOne({ _id: objectUserId }),
    database.collection('accounts').deleteMany({ $or: [{ userId }, { userId: objectUserId }] }),
    database.collection('sessions').deleteMany({ $or: [{ userId }, { userId: objectUserId }] }),
    database.collection('officeHoursTrack').deleteMany({ userId }),
    database.collection('newsletter_brand_profiles').deleteMany({ userId }),
    database.collection('newsletter_sessions').deleteMany({ userId }),
  ]);
  return NextResponse.json({ ok: true });
}
