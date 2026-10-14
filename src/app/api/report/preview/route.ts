import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { buildReport } from '@/lib/hours-report/buildReport';
import { parseClockify } from '@/lib/hours-report/parseClockify';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: 'You must be signed in.' }, { status: 401 });

  try {
    const body = await request.json() as { raw?: unknown };
    if (typeof body.raw !== 'string' || !body.raw.trim()) {
      return NextResponse.json({ error: 'Paste a Clockify report before previewing it.' }, { status: 400 });
    }

    const parsed = parseClockify(body.raw);
    if (!parsed.entries.length) {
      return NextResponse.json({ error: 'No Clockify entries found.' }, { status: 400 });
    }

    return NextResponse.json({
      entries: parsed.entries,
      report: buildReport(parsed.entries),
      warnings: parsed.warnings,
    });
  } catch {
    return NextResponse.json({ error: 'Unable to preview the hours report.' }, { status: 400 });
  }
}
