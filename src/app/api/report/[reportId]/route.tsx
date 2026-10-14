import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { buildReport } from '@/lib/hours-report/buildReport';
import { renderHoursReportPdf } from '@/lib/hours-report/renderPdf';
import type { Entry } from '@/lib/hours-report/types';
import { getMongoDatabase } from '@/lib/mongodb';

type SavedReport = { id: string; userId: string; client: string; name: string; email: string; reportDate: string; entries: Entry[] };
type RouteContext = { params: Promise<{ reportId: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const session = await auth();
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!userId) return NextResponse.json({ error: 'You must be signed in.' }, { status: 401 });

  const { reportId } = await context.params;
  const database = await getMongoDatabase();
  const saved = await database.collection<SavedReport>('hoursReports').findOne({ id: reportId, userId }, { projection: { _id: 0 } });
  if (!saved) return NextResponse.json({ error: 'Report not found.' }, { status: 404 });

  const pdf = await renderHoursReportPdf(buildReport(saved.entries), {
    client: saved.client,
    name: saved.name,
    email: saved.email,
    date: saved.reportDate,
  });
  return new NextResponse(pdf, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="Hours_Report_${saved.id}.pdf"`,
      'Cache-Control': 'private, no-store',
    },
  });
}
