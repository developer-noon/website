import { auth } from '@/auth';
import { getMongoDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { NextResponse } from 'next/server';
import type { Session } from 'next-auth';
import type { WorkspaceDocument, WorkspaceMembershipDocument } from '@/lib/workspaces';

function getSessionUser(session: Session | null) {
  const user = session?.user as { id?: string; name?: string | null; email?: string | null } | undefined;
  return user?.id && ObjectId.isValid(user.id) && user.email ? {
    id: user.id,
    name: user.name ?? 'A teammate',
    email: user.email.trim().toLowerCase(),
  } : null;
}

export async function GET() {
  const user = getSessionUser(await auth());
  if (!user) return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });

  const database = await getMongoDatabase();
  const memberships = await database.collection<WorkspaceMembershipDocument>('workspaceMemberships').find({ userId: user.id }).toArray();
  const workspaceIds = memberships
    .map((membership) => membership.workspaceId)
    .filter((workspaceId) => ObjectId.isValid(workspaceId))
    .map((workspaceId) => new ObjectId(workspaceId));
  const workspaces = workspaceIds.length
    ? await database.collection<WorkspaceDocument>('workspaces').find({ _id: { $in: workspaceIds } }).toArray()
    : [];

  return NextResponse.json({
    workspaces: workspaces.map((workspace) => ({
      id: workspace._id?.toString(),
      name: workspace.name,
      description: workspace.description,
      role: memberships.find((membership) => membership.workspaceId === workspace._id?.toString())?.role ?? 'member',
      createdAt: workspace.createdAt,
    })),
  });
}

export async function POST(request: Request) {
  const user = getSessionUser(await auth());
  if (!user) return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });

  try {
    const body = await request.json() as { name?: unknown; description?: unknown };
    const name = typeof body.name === 'string' ? body.name.trim() : '';
    const description = typeof body.description === 'string' ? body.description.trim() : '';
    if (!name) return NextResponse.json({ error: 'Workspace name is required.' }, { status: 400 });
    if (name.length > 100 || description.length > 300) return NextResponse.json({ error: 'Workspace name or description is too long.' }, { status: 400 });

    const database = await getMongoDatabase();
    const createdAt = new Date();
    const workspaceResult = await database.collection<WorkspaceDocument>('workspaces').insertOne({
      name,
      description,
      ownerId: user.id,
      createdAt,
    });
    await database.collection<WorkspaceMembershipDocument>('workspaceMemberships').insertOne({
      workspaceId: workspaceResult.insertedId.toString(),
      userId: user.id,
      email: user.email,
      name: user.name,
      role: 'owner',
      createdAt,
    });

    return NextResponse.json({ workspace: { id: workspaceResult.insertedId.toString(), name, description, role: 'owner', createdAt } }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Unable to create workspace.' }, { status: 500 });
  }
}
