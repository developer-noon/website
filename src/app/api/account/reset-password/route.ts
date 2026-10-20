import bcrypt from 'bcryptjs';
import { createHash } from 'crypto';
import { ObjectId } from 'mongodb';
import { NextResponse } from 'next/server';
import { getMongoDatabase } from '@/lib/mongodb';
import { sendEmail } from '@/lib/email';
import { escapeHtml } from '@/lib/html';
import { APP_NAME } from '@/lib/brand';
import { clientIp, consumeRateLimit } from '@/lib/rate-limit';

export async function POST(request: Request) {
  try {
    if (!await consumeRateLimit(`reset-ip:${clientIp(request)}`, 30, 60 * 60 * 1000)) {
      return NextResponse.json({ error: 'Too many attempts. Try again later.' }, { status: 429 });
    }
    const body = await request.json() as { token?: unknown; newPassword?: unknown; confirmPassword?: unknown };
    const token = typeof body.token === 'string' ? body.token : '';
    const newPassword = typeof body.newPassword === 'string' ? body.newPassword : '';
    const confirmPassword = typeof body.confirmPassword === 'string' ? body.confirmPassword : '';
    if (!token || !newPassword || !confirmPassword) return NextResponse.json({ error: 'Reset link, new password, and confirmation are required.' }, { status: 400 });
    if (newPassword.length < 8) return NextResponse.json({ error: 'New password must be at least 8 characters long.' }, { status: 400 });
    if (newPassword.length > 128) return NextResponse.json({ error: 'New password must be 128 characters or fewer.' }, { status: 400 });
    if (newPassword !== confirmPassword) return NextResponse.json({ error: 'New passwords do not match.' }, { status: 400 });

    const database = await getMongoDatabase();
    const tokenHash = createHash('sha256').update(token).digest('hex');
    const reset = await database.collection<{ userId: string; tokenHash: string; expiresAt: Date }>('passwordResetTokens').findOne({ tokenHash, expiresAt: { $gt: new Date() } });
    if (!reset) return NextResponse.json({ error: 'This password link is invalid or expired.' }, { status: 400 });

    if (!ObjectId.isValid(reset.userId)) return NextResponse.json({ error: 'This password link is invalid.' }, { status: 400 });
    const user = await database.collection<{ _id: ObjectId; email?: string; name?: string }>('users').findOne({ _id: new ObjectId(reset.userId) });
    if (!user?.email) return NextResponse.json({ error: 'Account not found.' }, { status: 404 });
    const password = await bcrypt.hash(newPassword, 12);
    await database.collection('users').updateOne({ _id: new ObjectId(reset.userId) }, { $set: { password, updatedAt: new Date() } });
    await database.collection('passwordResetTokens').deleteMany({ userId: reset.userId });
    await sendEmail({
      to: user.email,
      subject: `Your ${APP_NAME} password was updated`,
      text: `Hi ${user.name ?? 'there'}, your ${APP_NAME} password was updated successfully. If you did not make this change, contact support immediately.`,
      html: `<p>Hi ${escapeHtml(user.name ?? 'there')},</p><p>Your ${APP_NAME} password was updated successfully.</p><p><strong>If you did not make this change, contact support immediately.</strong></p>`,
    });
    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to update your password.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
