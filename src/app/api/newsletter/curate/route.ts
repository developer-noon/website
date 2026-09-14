import { ObjectId } from 'mongodb';
import { NextResponse } from 'next/server';
import type { Session } from 'next-auth';
import { auth } from '@/auth';
import { getMongoDatabase } from '@/lib/mongodb';
import { describeResource, discoverResources, resourceFromUrl } from '@/features/newsletter/resources';
import type { NewsletterBrief, NewsletterResource, NewsletterSession } from '@/features/newsletter/types';

type SessionDocument = Omit<NewsletterSession, 'id'> & { _id?: ObjectId; userId: string; createdAt: Date; updatedAt: Date };

type BrandDocument = { _id: ObjectId; userId: string; brief: NewsletterBrief; updatedAt: Date };

function getUserId(session: Session | null) {
  const user = session?.user as (Session['user'] & { id?: string }) | undefined;
  return user?.id || user?.email || '';
}

function serializeSession(document: SessionDocument): NewsletterSession {
  return { ...document, id: document._id?.toString() ?? '' };
}

function dateOnly(date: Date) {
  return date.toISOString().slice(0, 10);
}

function fridayAfter(date: Date) {
  const result = new Date(date);
  result.setUTCHours(0, 0, 0, 0);
  const daysUntilFriday = (5 - result.getUTCDay() + 7) % 7;
  result.setUTCDate(result.getUTCDate() + daysUntilFriday);
  return result;
}

function weekDates(start: Date) {
  const end = new Date(start);
  end.setUTCDate(start.getUTCDate() + 6);
  return { startsOn: dateOnly(start), endsOn: dateOnly(end) };
}

function validSessionId(value: string | undefined) {
  return Boolean(value && ObjectId.isValid(value));
}

export async function GET() {
  const userId = getUserId(await auth());
  if (!userId) return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });

  const database = await getMongoDatabase();
  const [brand, sessions] = await Promise.all([
    database.collection<BrandDocument>('newsletter_brand_profiles').findOne({ userId }),
    database.collection<SessionDocument>('newsletter_sessions').find({ userId }).sort({ startsOn: 1 }).limit(40).toArray(),
  ]);
  return NextResponse.json({ brief: brand?.brief ?? null, sessions: sessions.map(serializeSession) });
}

export async function POST(request: Request) {
  const userId = getUserId(await auth());
  if (!userId) return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });

  try {
    const input = await request.json() as {
      action?: 'discover' | 'manual' | 'save-brand' | 'create-session' | 'update-session' | 'delete-session' | 'add' | 'delete-resource';
      topic?: string;
      audience?: string;
      title?: string;
      url?: string;
      sessionId?: string;
      resourceId?: string;
      resource?: NewsletterResource;
      brief?: NewsletterBrief;
      status?: NewsletterSession['status'];
      kind?: 'current' | 'upcoming';
    };
    const database = await getMongoDatabase();
    const sessions = database.collection<SessionDocument>('newsletter_sessions');

    if (input.action === 'discover') {
      const savedBrand = await database.collection<BrandDocument>('newsletter_brand_profiles').findOne({ userId });
      const selectedSession = validSessionId(input.sessionId)
        ? await sessions.findOne({ _id: new ObjectId(input.sessionId), userId })
        : null;
      const topic = input.topic?.trim() || selectedSession?.topic?.trim() || savedBrand?.brief.topic?.trim();
      const audience = input.audience?.trim() || savedBrand?.brief.audience?.trim() || 'a professional audience';
      if (!topic) return NextResponse.json({ error: 'Create or select a session with a topic before researching.' }, { status: 400 });
      return NextResponse.json({ resources: await discoverResources(topic, audience) });
    }

    if (input.action === 'manual') {
      if (!input.url?.trim() || !/^https?:\/\//i.test(input.url.trim())) return NextResponse.json({ error: 'Enter a full http(s) URL.' }, { status: 400 });
      return NextResponse.json({ resource: await describeResource(input.url.trim(), input.title?.trim()) });
    }

    if (input.action === 'save-brand' && input.brief) {
      await database.collection<BrandDocument>('newsletter_brand_profiles').updateOne(
        { userId },
        { $set: { userId, brief: input.brief, updatedAt: new Date() } },
        { upsert: true },
      );
      return NextResponse.json({ brief: input.brief });
    }

    if (input.action === 'create-session') {
      const today = new Date();
      let start = new Date(today);
      if (input.kind === 'upcoming') {
        const latest = await sessions.find({ userId }).sort({ startsOn: -1 }).limit(1).next();
        start = latest ? new Date(`${latest.startsOn}T00:00:00.000Z`) : fridayAfter(today);
        start.setUTCDate(start.getUTCDate() + 7);
      } else {
        start = fridayAfter(today);
      }
      const dates = weekDates(start);
      const existing = await sessions.findOne({ userId, startsOn: dates.startsOn });
      if (existing) return NextResponse.json({ session: serializeSession(existing), alreadyExists: true });
      const document = {
        userId,
        title: input.title?.trim() || `Week of ${dates.startsOn}`,
        topic: input.topic?.trim() || 'Weekly insights',
        ...dates,
        status: 'planned' as const,
        resources: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      const result = await sessions.insertOne(document);
      return NextResponse.json({ session: serializeSession({ ...document, _id: result.insertedId } as SessionDocument) });
    }

    if (input.action === 'update-session' && validSessionId(input.sessionId)) {
      const updates: Partial<NewsletterSession> & { updatedAt: Date } = { updatedAt: new Date() };
      if (input.title?.trim()) updates.title = input.title.trim();
      if (input.topic?.trim()) updates.topic = input.topic.trim();
      if (input.status) updates.status = input.status;
      const result = await sessions.findOneAndUpdate({ _id: new ObjectId(input.sessionId), userId }, { $set: updates }, { returnDocument: 'after' });
      if (!result) return NextResponse.json({ error: 'Session not found.' }, { status: 404 });
      return NextResponse.json({ session: serializeSession(result as SessionDocument) });
    }

    if (input.action === 'delete-session' && validSessionId(input.sessionId)) {
      const result = await sessions.deleteOne({ _id: new ObjectId(input.sessionId), userId });
      return NextResponse.json({ deleted: result.deletedCount === 1 });
    }

    if (input.action === 'add' && validSessionId(input.sessionId) && input.resource?.url) {
      const resource = resourceFromUrl({ ...input.resource, addedBy: input.resource.addedBy ?? 'manual' });
      const result = await sessions.findOneAndUpdate(
        { _id: new ObjectId(input.sessionId), userId },
        { $addToSet: { resources: resource }, $set: { updatedAt: new Date(), status: 'ready' } },
        { returnDocument: 'after' },
      );
      if (!result) return NextResponse.json({ error: 'Session not found.' }, { status: 404 });
      return NextResponse.json({ session: serializeSession(result as SessionDocument), resource });
    }

    if (input.action === 'delete-resource' && validSessionId(input.sessionId) && input.resourceId) {
      const result = await sessions.findOneAndUpdate(
        { _id: new ObjectId(input.sessionId), userId },
        { $pull: { resources: { id: input.resourceId } }, $set: { updatedAt: new Date() } },
        { returnDocument: 'after' },
      );
      if (!result) return NextResponse.json({ error: 'Session not found.' }, { status: 404 });
      return NextResponse.json({ session: serializeSession(result as SessionDocument) });
    }

    return NextResponse.json({ error: 'Unknown newsletter action.' }, { status: 400 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to update newsletter data.';
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
