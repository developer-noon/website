import { createHash, randomBytes } from 'crypto';
import { NextResponse } from 'next/server';
import type { ObjectId } from 'mongodb';
import { getMongoDatabase } from '@/lib/mongodb';
import { sendEmail } from '@/lib/email';
import { escapeHtml } from '@/lib/html';
import { APP_NAME } from '@/lib/brand';
import { clientIp, consumeRateLimit } from '@/lib/rate-limit';

const genericResponse = { ok: true, message: 'If an account exists for that email, a reset link is on its way.' };

/**
 * Starts a password reset without revealing whether the email has an account.
 * Every valid request gets the same response, including rate-limited ones.
 */
export async function POST(request: Request) {
  const body = await request.json().catch(() => ({})) as { email?: unknown };
  const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) {
    return NextResponse.json({ error: 'Enter a valid email address.' }, { status: 400 });
  }

  const allowedByIp = await consumeRateLimit(`forgot-ip:${clientIp(request)}`, 20, 60 * 60 * 1000);
  const allowedByEmail = await consumeRateLimit(`forgot:${email}`, 5, 60 * 60 * 1000);
  if (!allowedByIp || !allowedByEmail) return NextResponse.json(genericResponse);

  const database = await getMongoDatabase();
  const user = await database.collection<{ _id: ObjectId; name?: string }>('users').findOne(
    { email },
    { projection: { _id: 1, name: 1 } },
  );
  if (!user) return NextResponse.json(genericResponse);

  const token = randomBytes(32).toString('hex');
  await database.collection('passwordResetTokens').insertOne({
    userId: user._id.toString(),
    tokenHash: createHash('sha256').update(token).digest('hex'),
    expiresAt: new Date(Date.now() + 30 * 60 * 1000),
    createdAt: new Date(),
  });

  const origin = process.env.AUTH_URL ?? process.env.NEXTAUTH_URL ?? new URL(request.url).origin;
  const resetUrl = `${origin.replace(/\/$/, '')}/reset-password?token=${encodeURIComponent(token)}`;
  const name = escapeHtml(user.name ?? 'there');
  try {
    await sendEmail({
      to: email,
      subject: `Reset your ${APP_NAME} password`,
      text: `Hi ${user.name ?? 'there'}, use this link to choose a new ${APP_NAME} password: ${resetUrl}\n\nThis link expires in 30 minutes. If you did not request this, you can ignore this email.`,
      html: `<p>Hi ${name},</p><p>Use the button below to choose a new ${APP_NAME} password.</p><p><a href="${escapeHtml(resetUrl)}" style="display:inline-block;padding:12px 18px;background:#9fe870;color:#163300;text-decoration:none;border-radius:8px">Reset password</a></p><p>This link expires in 30 minutes. If you did not request this, you can ignore this email.</p>`,
    });
  } catch (error) {
    // Log server-side only; the response stays generic so delivery failures do not reveal accounts.
    console.error('Password reset email failed', error);
  }
  return NextResponse.json(genericResponse);
}
