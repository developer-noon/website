import { auth } from '@/auth';
import { getMongoDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { NextResponse } from 'next/server';
import type { Session } from 'next-auth';
import bcrypt from 'bcryptjs';
import { sendEmail } from '@/lib/email';
import { createHash, randomBytes } from 'crypto';

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

export async function PUT(request: Request) {
  const session = await auth();
  const userId = getSessionUserId(session);
  if (!userId) return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });

  try {
    const body = await request.json() as { currentPassword?: unknown };
    if (typeof body.currentPassword !== 'string' || !body.currentPassword) {
      return NextResponse.json({ error: 'Your current password is required.' }, { status: 400 });
    }

    const database = await getMongoDatabase();
    const user = await database.collection<{ email?: string; password?: string; name?: string }>('users').findOne({ _id: new ObjectId(userId) });
    if (!user?.email) return NextResponse.json({ error: 'Account not found.' }, { status: 404 });
    if (!user.password || !await bcrypt.compare(body.currentPassword, user.password)) {
      return NextResponse.json({ error: 'Current password is incorrect.' }, { status: 401 });
    }

    const token = randomBytes(32).toString('hex');
    await database.collection('passwordResetTokens').insertOne({
      userId,
      tokenHash: createHash('sha256').update(token).digest('hex'),
      expiresAt: new Date(Date.now() + 30 * 60 * 1000),
      createdAt: new Date(),
    });
    const origin = process.env.AUTH_URL ?? process.env.NEXTAUTH_URL ?? new URL(request.url).origin;
    const resetUrl = `${origin}/dashboard/account/reset-password?token=${encodeURIComponent(token)}`;
    await sendEmail({
      to: user.email,
      subject: 'Confirm your OfficeHoursTrack password update',
      text: `Hi ${user.name ?? 'there'}, use this link to choose a new OfficeHoursTrack password: ${resetUrl}\n\nThis link expires in 30 minutes. If you did not request this, you can ignore this email.`,
      html: `<p>Hi ${user.name ?? 'there'},</p><p>Click the button below to choose a new OfficeHoursTrack password.</p><p><a href="${resetUrl}" style="display:inline-block;padding:12px 18px;background:#2563eb;color:#fff;text-decoration:none">Update password</a></p><p>This link expires in 30 minutes. If you did not request this, you can ignore this email.</p>`,
    });
    return NextResponse.json({ ok: true, message: 'A password update link was sent to your email.' });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to update your password.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE() {
  const session = await auth();
  const userId = getSessionUserId(session);
  if (!userId) return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });

  const database = await getMongoDatabase();
  const objectUserId = new ObjectId(userId);
  const ownedWorkspaces = await database.collection('workspaces').find({ ownerId: userId }, { projection: { _id: 1 } }).toArray();
  const workspaceIds = ownedWorkspaces.map((workspace) => workspace._id?.toString()).filter((id): id is string => Boolean(id));
  const account = await database.collection('users').findOne({ _id: objectUserId }, { projection: { email: 1 } });

  await database.collection('accountDeletionLogs').insertOne({
    userId,
    email: account?.email ?? '',
    deletedAt: new Date(),
    reason: 'User requested account deletion',
    dataDeleted: true,
  });

  await Promise.all([
    database.collection('users').deleteOne({ _id: objectUserId }),
    database.collection('accounts').deleteMany({ $or: [{ userId }, { userId: objectUserId }] }),
    database.collection('sessions').deleteMany({ $or: [{ userId }, { userId: objectUserId }] }),
    database.collection('officeHoursTrack').deleteMany({ userId }),
    database.collection('newsletter_brand_profiles').deleteMany({ userId }),
    database.collection('newsletter_sessions').deleteMany({ userId }),
    database.collection('hoursReports').deleteMany({ userId: { $in: [userId, objectUserId] } }),
    database.collection('emailVerifications').deleteMany({ email: account?.email ?? '' }),
    database.collection('workspaceMemberships').deleteMany({ userId }),
    database.collection('workspaceInvitations').deleteMany({ $or: [{ invitedBy: userId }, { email: account?.email ?? '' }] }),
    workspaceIds.length ? database.collection('workspaceMemberships').deleteMany({ workspaceId: { $in: workspaceIds } }) : Promise.resolve(),
    workspaceIds.length ? database.collection('workspaceInvitations').deleteMany({ workspaceId: { $in: workspaceIds } }) : Promise.resolve(),
    workspaceIds.length ? database.collection('workspaces').deleteMany({ _id: { $in: ownedWorkspaces.map((workspace) => workspace._id).filter((id): id is ObjectId => Boolean(id)) } }) : Promise.resolve(),
  ]);
  return NextResponse.json({ ok: true });
}
