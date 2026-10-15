import { createHash, randomBytes } from 'crypto';
import { ObjectId } from 'mongodb';
import { getMongoDatabase } from '@/lib/mongodb';
import { sendEmail } from '@/lib/email';

export type WorkspaceDocument = {
  _id?: ObjectId;
  name: string;
  description: string;
  ownerId: string;
  createdAt: Date;
};

export type WorkspaceMembershipDocument = {
  _id?: ObjectId;
  workspaceId: string;
  userId: string;
  email: string;
  name: string;
  role: 'owner' | 'member';
  createdAt: Date;
};

export type WorkspaceInvitationDocument = {
  _id?: ObjectId;
  workspaceId: string;
  email: string;
  invitedBy: string;
  tokenHash: string;
  status: 'pending' | 'accepted' | 'expired';
  expiresAt: Date;
  createdAt: Date;
};

export function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export function hashInvitationToken(token: string) {
  return createHash('sha256').update(token).digest('hex');
}

export function createInvitationToken() {
  return randomBytes(32).toString('hex');
}

export async function sendWorkspaceInvitation(input: {
  email: string;
  inviterName: string;
  workspaceName: string;
  token: string;
  origin: string;
}) {
  const invitationUrl = `${input.origin}/dashboard/workspace/invite?token=${encodeURIComponent(input.token)}`;

  await sendEmail({
    to: input.email,
    subject: `Join ${input.workspaceName} on OfficeHoursTrack`,
    text: `${input.inviterName} invited you to join ${input.workspaceName} on OfficeHoursTrack.\n\nAccept the invitation: ${invitationUrl}\n\nThis invitation expires in 7 days.`,
    html: `<p>${input.inviterName} invited you to join <strong>${input.workspaceName}</strong> on OfficeHoursTrack.</p><p><a href="${invitationUrl}">Accept the invitation</a></p><p>This invitation expires in 7 days.</p>`,
  });
}

export async function getWorkspaceForOwner(workspaceId: string, userId: string) {
  if (!ObjectId.isValid(workspaceId)) return null;
  const database = await getMongoDatabase();
  return database.collection<WorkspaceDocument>('workspaces').findOne({
    _id: new ObjectId(workspaceId),
    ownerId: userId,
  });
}
