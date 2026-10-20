import { NextResponse } from 'next/server';
import { sendEmail } from '@/lib/email';
import { escapeHtml } from '@/lib/html';
import { APP_NAME } from '@/lib/brand';
import { clientIp, consumeRateLimit } from '@/lib/rate-limit';

export async function POST(request: Request) {
  const supportEmail = process.env.SUPPORT_EMAIL;
  if (!supportEmail) {
    return NextResponse.json({ error: 'Contact form is not available right now. Please try again later.' }, { status: 503 });
  }

  const body = await request.json().catch(() => ({})) as { name?: unknown; email?: unknown; company?: unknown; message?: unknown };
  const name = typeof body.name === 'string' ? body.name.trim() : '';
  const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
  const company = typeof body.company === 'string' ? body.company.trim() : '';
  const message = typeof body.message === 'string' ? body.message.trim() : '';

  if (!name || name.length > 100) return NextResponse.json({ error: 'Enter your name.' }, { status: 400 });
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) return NextResponse.json({ error: 'Enter a valid email address.' }, { status: 400 });
  if (company.length > 120) return NextResponse.json({ error: 'Company name is too long.' }, { status: 400 });
  if (message.length < 10 || message.length > 3000) return NextResponse.json({ error: 'Message must be between 10 and 3000 characters.' }, { status: 400 });

  if (!await consumeRateLimit(`contact:${clientIp(request)}`, 5, 60 * 60 * 1000)) {
    return NextResponse.json({ error: 'Too many messages from this network. Try again later.' }, { status: 429 });
  }

  try {
    await sendEmail({
      to: supportEmail,
      subject: `${APP_NAME} enquiry from ${name}`,
      text: `Name: ${name}\nEmail: ${email}\nCompany: ${company || '-'}\n\n${message}`,
      html: `<p><strong>Name:</strong> ${escapeHtml(name)}</p><p><strong>Email:</strong> ${escapeHtml(email)}</p><p><strong>Company:</strong> ${escapeHtml(company || '-')}</p><p style="white-space:pre-wrap">${escapeHtml(message)}</p>`,
    });
  } catch {
    return NextResponse.json({ error: 'We could not send your message. Please email us directly.' }, { status: 502 });
  }
  return NextResponse.json({ ok: true });
}
