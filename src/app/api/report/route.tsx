import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { buildReport } from '@/lib/hours-report/buildReport';
import { parseClockify } from '@/lib/hours-report/parseClockify';
import { renderHoursReportPdf } from '@/lib/hours-report/renderPdf';
import { toSecs } from '@/lib/hours-report/time';
import type { Entry } from '@/lib/hours-report/types';
import { getMongoDatabase } from '@/lib/mongodb';
import { randomUUID } from 'node:crypto';

export const runtime = 'nodejs';

type RequestBody = { client?: unknown; name?: unknown; email?: unknown; date?: unknown; raw?: unknown; entries?: unknown };

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: 'You must be signed in.' }, { status: 401 });

  let body: RequestBody;
  try {
    body = await request.json() as RequestBody;
  } catch {
    return NextResponse.json({ error: 'A valid JSON report request is required.' }, { status: 400 });
  }

  const warnings: string[] = [];
  let entries: Entry[] = [];
  if (typeof body.raw === 'string' && body.raw.trim()) {
    const parsed = parseClockify(body.raw);
    entries = parsed.entries;
    warnings.push(...parsed.warnings);
  } else if (Array.isArray(body.entries)) {
    entries = body.entries.filter((entry): entry is Entry => {
      if (!entry || typeof entry !== 'object') return false;
      const candidate = entry as Partial<Entry>;
      return typeof candidate.date === 'string' && (candidate.category === 'admin' || candidate.category === 'video')
        && typeof candidate.project === 'string' && typeof candidate.time === 'string';
    });
  }
  if (!entries.length) return NextResponse.json({ error: 'No Clockify entries found.' }, { status: 400 });

  const today = new Date();
  const date = typeof body.date === 'string' && body.date.trim()
    ? body.date
    : `${String(today.getDate()).padStart(2, '0')}.${String(today.getMonth() + 1).padStart(2, '0')}.${today.getFullYear()}`;
  const report = buildReport(entries);
  const meta = {
    client: typeof body.client === 'string' ? body.client.trim() : '',
    name: typeof body.name === 'string' ? body.name.trim() : '',
    email: typeof body.email === 'string' ? body.email.trim() : '',
    date,
  };
  if (!meta.client) return NextResponse.json({ error: 'Client is required.' }, { status: 400 });
  const userId = (session.user as { id?: string }).id;
  if (!userId) return NextResponse.json({ error: 'Your account is missing an identifier.' }, { status: 401 });
  const database = await getMongoDatabase();
  const saved = {
    id: randomUUID(),
    userId,
    client: meta.client,
    name: meta.name,
    email: meta.email,
    reportDate: meta.date,
    createdAt: new Date(),
    totalHours: report.grandTotal,
    totalSeconds: entries.reduce((sum, entry) => sum + toSecs(entry.time), 0),
    entries,
  };
  const pdf = await renderHoursReportPdf(report, meta);
  await database.collection('hoursReports').insertOne(saved);
  return new NextResponse(new Uint8Array(pdf), {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'attachment; filename="Hours_Report.pdf"',
      'X-Report-Warnings': encodeURIComponent(JSON.stringify(warnings)),
      'X-Report-Id': saved.id,
      'Cache-Control': 'private, no-store',
    },
  });
}
