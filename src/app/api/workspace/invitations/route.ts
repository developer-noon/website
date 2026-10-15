import { auth } from '@/auth';
import { getMongoDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { NextResponse } from 'next/server';
import type { Session } from 'next-auth';
import { createInvitationToken, getWorkspaceForOwner, hashInvitationToken, normalizeEmail, sendWorkspaceInvitation, type WorkspaceInvitationDocument } from '@/lib/workspaces';

function getUser(session: Session | null) {
  const user = session?.user as { id?: string; name?: string | null; email?: string | null } | undefined;
  return user?.id && ObjectId.isValid(user.id) && user.email ? { id: user.id, name: user.name ?? 'A teammate', email: normalizeEmail(user.email) } : null;
}

export async function GET(request: Request) {
  const user = getUser(await auth());
  if (!user) return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });

  const token = new URL(request.url).searchParams.get('token');
  if (!token) return NextResponse.json({ error: 'Invitation token is required.' }, { status: 400 });
  const database = await getMongoDatabase();
  const invitation = await database.collection<WorkspaceInvitationDocument>('workspaceInvitations').findOne({ tokenHash: hashInvitationToken(token) });
  if (!invitation || invitation.status !== 'pending' || invitation.expiresAt < new Date()) {
    return NextResponse.json({ error: 'This invitation is invalid or has expired.' }, { status: 404 });
  }
  const workspace = await database.collection('workspaces').findOne({ _id: new ObjectId(invitation.workspaceId) }, { projection: { name: 1, description: 1 } });
  if (!workspace) return NextResponse.json({ error: 'Workspace not found.' }, { status: 404 });
  return NextResponse.json({ invitation: { email: invitation.email, workspaceName: workspace.name, description: workspace.description } });
}

export async function POST(request: Request) {
  const user = getUser(await auth());
  if (!user) return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });

  try {
    const body = await request.json() as { workspaceId?: unknown; email?: unknown };
    const workspaceId = typeof body.workspaceId === 'string' ? body.workspaceId : '';
    const email = typeof body.email === 'string' ? normalizeEmail(body.email) : '';
    if (!ObjectId.isValid(workspaceId) || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'A valid workspace and email address are required.' }, { status: 400 });
    }
    const workspace = await getWorkspaceForOwner(workspaceId, user.id);
    if (!workspace) return NextResponse.json({ error: 'Only the workspace owner can send invitations.' }, { status: 403 });

    const database = await getMongoDatabase();
    const existingMember = await database.collection('workspaceMemberships').findOne({ workspaceId, email });
    if (existingMember) return NextResponse.json({ error: 'This person is already a workspace member.' }, { status: 409 });
    const pendingInvitation = await database.collection<WorkspaceInvitationDocument>('workspaceInvitations').findOne({ workspaceId, email, status: 'pending', expiresAt: { $gt: new Date() } });
    if (pendingInvitation) return NextResponse.json({ error: 'An invitation is already pending for this email.' }, { status: 409 });

    const token = createInvitationToken();
    await sendWorkspaceInvitation({
      email,
      inviterName: user.name,
      workspaceName: workspace.name,
      token,
      origin: process.env.AUTH_URL ?? process.env.NEXTAUTH_URL ?? new URL(request.url).origin,
    });
    await database.collection<WorkspaceInvitationDocument>('workspaceInvitations').insertOne({
      workspaceId,
      email,
      invitedBy: user.id,
      tokenHash: hashInvitationToken(token),
      status: 'pending',
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      createdAt: new Date(),
    });
    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to send invitation.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
