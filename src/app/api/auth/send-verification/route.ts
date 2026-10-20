import { NextResponse } from 'next/server';
import { sendEmail } from '@/lib/email';
import { createEmailVerification } from '@/lib/email-verification';
import { getMongoDatabase } from '@/lib/mongodb';
import { APP_NAME } from '@/lib/brand';
import { clientIp, consumeRateLimit } from '@/lib/rate-limit';

/**
 * Sends a sign-up code. The response is identical whether or not the email already
 * has an account, so this endpoint cannot be used to discover registered addresses.
 */
export async function POST(request: Request) {
  const body = await request.json().catch(() => ({})) as { email?: unknown };
  const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) {
    return NextResponse.json({ error: 'Enter a valid email address.' }, { status: 400 });
  }

  const allowedByIp = await consumeRateLimit(`verify-ip:${clientIp(request)}`, 20, 60 * 60 * 1000);
  const allowedByEmail = await consumeRateLimit(`verify:${email}`, 5, 60 * 60 * 1000);
  if (!allowedByIp || !allowedByEmail) {
    return NextResponse.json({ error: 'Too many codes requested. Try again in a little while.' }, { status: 429 });
  }

  const database = await getMongoDatabase();
  if (!await database.collection('users').findOne({ email }, { projection: { _id: 1 } })) {
    const verification = await createEmailVerification(email);
    try {
      await sendEmail({
        to: verification.email,
        subject: `Verify your ${APP_NAME} email`,
        text: `Your ${APP_NAME} verification code is ${verification.code}. It expires in 15 minutes.`,
        html: `<p>Your ${APP_NAME} verification code is:</p><p style="font-size:28px;font-weight:700;letter-spacing:6px">${verification.code}</p><p>This code expires in 15 minutes.</p>`,
      });
    } catch (error) {
      console.error('Verification email failed', error);
      return NextResponse.json({ error: 'We could not send the verification email. Please try again shortly.' }, { status: 502 });
    }
  }
  return NextResponse.json({ ok: true, message: 'If this address is available, a verification code is on its way.' });
}
