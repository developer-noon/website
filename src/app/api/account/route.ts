import { auth } from '@/auth';
import { getMongoDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { NextResponse } from 'next/server';
import type { Session } from 'next-auth';
import bcrypt from 'bcryptjs';
import { sendEmail } from '@/lib/email';

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
    const body = await request.json() as { currentPassword?: unknown; newPassword?: unknown; confirmPassword?: unknown };
    if (typeof body.currentPassword !== 'string' || typeof body.newPassword !== 'string' || typeof body.confirmPassword !== 'string') {
      return NextResponse.json({ error: 'Current password, new password, and confirmation are required.' }, { status: 400 });
    }
    if (body.newPassword.length < 8) return NextResponse.json({ error: 'New password must be at least 8 characters long.' }, { status: 400 });
    if (body.newPassword.length > 128) return NextResponse.json({ error: 'New password must be 128 characters or fewer.' }, { status: 400 });
    if (body.newPassword !== body.confirmPassword) return NextResponse.json({ error: 'New passwords do not match.' }, { status: 400 });
    if (body.currentPassword === body.newPassword) return NextResponse.json({ error: 'New password must be different from your current password.' }, { status: 400 });

    const database = await getMongoDatabase();
    const user = await database.collection<{ email?: string; password?: string; name?: string }>('users').findOne({ _id: new ObjectId(userId) });
    if (!user?.email) return NextResponse.json({ error: 'Account not found.' }, { status: 404 });
    if (!user.password || !await bcrypt.compare(body.currentPassword, user.password)) {
      return NextResponse.json({ error: 'Current password is incorrect.' }, { status: 401 });
    }

    const password = await bcrypt.hash(body.newPassword, 12);
    await database.collection('users').updateOne({ _id: new ObjectId(userId) }, { $set: { password, updatedAt: new Date() } });
    await sendEmail({
      to: user.email,
      subject: 'Your OfficeHoursTrack password was updated',
      text: `Hi ${user.name ?? 'there'}, your OfficeHoursTrack password was updated successfully. If you did not make this change, contact support immediately.`,
      html: `<p>Hi ${user.name ?? 'there'},</p><p>Your OfficeHoursTrack password was updated successfully.</p><p><strong>If you did not make this change, contact support immediately.</strong></p>`,
    });
    return NextResponse.json({ ok: true });
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
