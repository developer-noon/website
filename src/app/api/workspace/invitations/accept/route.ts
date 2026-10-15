import { auth } from '@/auth';
import { getMongoDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { NextResponse } from 'next/server';
import { hashInvitationToken, normalizeEmail, type WorkspaceInvitationDocument, type WorkspaceMembershipDocument } from '@/lib/workspaces';

export async function POST(request: Request) {
  const session = await auth();
  const user = session?.user as { id?: string; name?: string | null; email?: string | null } | undefined;
  if (!user?.id || !ObjectId.isValid(user.id) || !user.email) return NextResponse.json({ error: 'Sign in before accepting an invitation.' }, { status: 401 });

  try {
    const body = await request.json() as { token?: unknown };
    const token = typeof body.token === 'string' ? body.token : '';
    const database = await getMongoDatabase();
    const invitation = await database.collection<WorkspaceInvitationDocument>('workspaceInvitations').findOne({ tokenHash: hashInvitationToken(token) });
    if (!invitation || invitation.status !== 'pending' || invitation.expiresAt < new Date()) return NextResponse.json({ error: 'This invitation is invalid or has expired.' }, { status: 400 });
    if (invitation.email !== normalizeEmail(user.email)) return NextResponse.json({ error: `This invitation was sent to ${invitation.email}. Sign in with that email address.` }, { status: 403 });

    await database.collection<WorkspaceMembershipDocument>('workspaceMemberships').updateOne(
      { workspaceId: invitation.workspaceId, userId: user.id },
      { $setOnInsert: { workspaceId: invitation.workspaceId, userId: user.id, email: normalizeEmail(user.email), name: user.name ?? 'Teammate', role: 'member', createdAt: new Date() } },
      { upsert: true },
    );
    await database.collection<WorkspaceInvitationDocument>('workspaceInvitations').updateOne({ _id: invitation._id }, { $set: { status: 'accepted' } });
    return NextResponse.json({ ok: true, workspaceId: invitation.workspaceId });
  } catch {
    return NextResponse.json({ error: 'Unable to accept invitation.' }, { status: 500 });
  }
}
