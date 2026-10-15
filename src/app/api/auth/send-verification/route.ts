import { NextResponse } from 'next/server';
import { sendEmail } from '@/lib/email';
import { createEmailVerification } from '@/lib/email-verification';
import { getMongoDatabase } from '@/lib/mongodb';

export async function POST(request: Request) {
  try {
    const body = await request.json() as { email?: unknown };
    const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return NextResponse.json({ error: 'Enter a valid email address.' }, { status: 400 });

    const database = await getMongoDatabase();
    if (await database.collection('users').findOne({ email }, { projection: { _id: 1 } })) {
      return NextResponse.json({ error: 'An account with this email already exists.' }, { status: 409 });
    }

    const verification = await createEmailVerification(email);
    await sendEmail({
      to: verification.email,
      subject: 'Verify your OfficeHoursTrack email',
      text: `Your OfficeHoursTrack verification code is ${verification.code}. It expires in 15 minutes.`,
      html: `<p>Your OfficeHoursTrack verification code is:</p><p style="font-size:28px;font-weight:700;letter-spacing:6px">${verification.code}</p><p>This code expires in 15 minutes.</p>`,
    });
    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to send verification email.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
