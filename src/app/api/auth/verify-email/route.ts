import { NextResponse } from 'next/server';
import { verifyEmailCode } from '@/lib/email-verification';

export async function POST(request: Request) {
  try {
    const body = await request.json() as { email?: unknown; code?: unknown };
    const email = typeof body.email === 'string' ? body.email : '';
    const code = typeof body.code === 'string' ? body.code.trim() : '';
    if (!email || !/^\d{6}$/.test(code)) return NextResponse.json({ error: 'Enter the six-digit verification code.' }, { status: 400 });

    const token = await verifyEmailCode(email, code);
    if (!token) return NextResponse.json({ error: 'That code is invalid or expired.' }, { status: 400 });
    return NextResponse.json({ ok: true, verificationToken: token });
  } catch {
    return NextResponse.json({ error: 'Unable to verify your email.' }, { status: 500 });
  }
}
