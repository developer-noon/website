import { NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import bcrypt from 'bcryptjs';
import QRCode from 'qrcode';
import type { Session } from 'next-auth';
import { auth } from '@/auth';
import { getMongoDatabase } from '@/lib/mongodb';
import { consumeRateLimit } from '@/lib/rate-limit';
import { APP_NAME } from '@/lib/brand';
import { otpauthUri } from '@/lib/totp';
import { confirmTwoFactorSetup, disableTwoFactor, getPendingTwoFactorSecret, getTwoFactorStatus, startTwoFactorSetup, checkSecondFactor } from '@/lib/two-factor';

function getSessionUser(session: Session | null) {
  const user = session?.user as { id?: string; email?: string | null } | undefined;
  return user?.id && ObjectId.isValid(user.id) ? { id: user.id, email: user.email ?? '' } : null;
}

const setupWindow = 60 * 60 * 1000;

export async function GET() {
  const user = getSessionUser(await auth());
  if (!user) return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });
  return NextResponse.json(await getTwoFactorStatus(user.id));
}

/** Starts setup: generates a secret and returns it with a QR code. Nothing is enforced until it is confirmed. */
export async function POST() {
  const user = getSessionUser(await auth());
  if (!user) return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });
  if (!await consumeRateLimit(`2fa-setup:${user.id}`, 10, setupWindow)) {
    return NextResponse.json({ error: 'Too many setup attempts. Try again later.' }, { status: 429 });
  }

  const secret = await startTwoFactorSetup(user.id);
  if (!secret) {
    return NextResponse.json({ error: 'Turn off two-step verification before setting up a new authenticator.' }, { status: 409 });
  }

  const uri = otpauthUri(secret, user.email, APP_NAME);
  const qrCode = await QRCode.toDataURL(uri, { margin: 1, width: 220, color: { dark: '#0b0b14', light: '#ffffff' } });
  return NextResponse.json({ secret, uri, qrCode });
}

/** Confirms setup with a code from the authenticator app, which turns two-step verification on. */
export async function PUT(request: Request) {
  const user = getSessionUser(await auth());
  if (!user) return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });

  const body = await request.json().catch(() => ({})) as { code?: unknown };
  const code = typeof body.code === 'string' ? body.code.trim() : '';
  if (!await consumeRateLimit(`2fa-verify:${user.id}`, 10, 15 * 60 * 1000)) {
    return NextResponse.json({ error: 'Too many attempts. Try again later.' }, { status: 429 });
  }
  if (!await getPendingTwoFactorSecret(user.id)) {
    return NextResponse.json({ error: 'Start two-step setup first.' }, { status: 400 });
  }
  if (!await confirmTwoFactorSetup(user.id, code)) {
    return NextResponse.json({ error: 'That code is not correct. Check your authenticator app and try again.' }, { status: 400 });
  }
  return NextResponse.json({ ok: true });
}

/** Turns two-step verification off. Requires the password and a current code. */
export async function DELETE(request: Request) {
  const user = getSessionUser(await auth());
  if (!user) return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });

  const body = await request.json().catch(() => ({})) as { password?: unknown; code?: unknown };
  if (!await consumeRateLimit(`2fa-disable:${user.id}`, 5, 15 * 60 * 1000)) {
    return NextResponse.json({ error: 'Too many attempts. Try again later.' }, { status: 429 });
  }

  const database = await getMongoDatabase();
  const account = await database.collection<{ password?: string }>('users').findOne({ _id: new ObjectId(user.id) }, { projection: { password: 1 } });
  const password = typeof body.password === 'string' ? body.password : '';
  const code = typeof body.code === 'string' ? body.code.trim() : '';
  if (!account?.password || !await bcrypt.compare(password, account.password)) {
    return NextResponse.json({ error: 'Your password is incorrect.' }, { status: 401 });
  }
  if (!await checkSecondFactor(user.id, code)) {
    return NextResponse.json({ error: 'That authentication code is not correct.' }, { status: 400 });
  }

  await disableTwoFactor(user.id);
  return NextResponse.json({ ok: true });
}
