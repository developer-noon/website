import { auth } from '@/auth';
import { getMongoDatabase } from '@/lib/mongodb';
import { formatDuration, sanitizeOfficeHoursStore, type OfficeHoursStore } from '@/lib/office-hours';
import { PDFDocument, StandardFonts, type PDFPage, rgb } from 'pdf-lib';
import { NextResponse } from 'next/server';

type RouteContext = { params: Promise<{ reportId: string }> };

const margin = 42;
const pageWidth = 595;
const pageHeight = 842;
const black = rgb(0.09, 0.09, 0.09);
const gray = rgb(0.4, 0.4, 0.4);
const lightGray = rgb(0.92, 0.92, 0.92);

function drawFooter(page: PDFPage, pageNumber: number, font: Awaited<ReturnType<PDFDocument['embedFont']>>) {
  page.drawLine({ start: { x: margin, y: 34 }, end: { x: pageWidth - margin, y: 34 }, thickness: 0.5, color: lightGray });
  page.drawText(`Page ${pageNumber}`, { x: pageWidth - margin - 42, y: 20, size: 8, font, color: gray });
}

function wrapText(text: string, maxCharacters: number) {
  const words = text.trim().split(/\s+/);
  const lines: string[] = [];
  let line = '';
  for (const word of words) {
    if ((line ? `${line} ` : '').length + word.length > maxCharacters && line) {
      lines.push(line);
      line = word;
    } else {
      line = line ? `${line} ${word}` : word;
    }
  }
  if (line) lines.push(line);
  return lines.length ? lines : [''];
}

export async function GET(_request: Request, context: RouteContext) {
  const session = await auth();
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!userId) return NextResponse.json({ error: 'You must be signed in.' }, { status: 401 });

  const { reportId } = await context.params;
  if (!reportId || reportId.length > 120) {
    return NextResponse.json({ error: 'A valid report is required.' }, { status: 400 });
  }

  const database = await getMongoDatabase();
  const record = await database.collection<{ userId: string; store: OfficeHoursStore }>('officeHoursTrack').findOne({ userId }, { projection: { _id: 0, store: 1 } });
  if (!record?.store) return NextResponse.json({ error: 'Report not found.' }, { status: 404 });

  const store = sanitizeOfficeHoursStore(record.store);
  const report = store.reports.find((item) => item.id === reportId);
  if (!report) return NextResponse.json({ error: 'Report not found.' }, { status: 404 });

  const client = store.clients.find((item) => item.id === report.clientId);
  if (!client) return NextResponse.json({ error: 'Report client not found.' }, { status: 422 });

  const pdf = await PDFDocument.create();
  const regular = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
  let pageNumber = 1;
  let page = pdf.addPage([pageWidth, pageHeight]);
  let y = pageHeight - margin;

  const addPage = () => {
    drawFooter(page, pageNumber, regular);
    pageNumber += 1;
    page = pdf.addPage([pageWidth, pageHeight]);
    y = pageHeight - margin;
  };
  const ensureSpace = (height: number) => {
    if (y - height < 54) addPage();
  };
  const text = (value: string, size: number, options: { font?: typeof regular; color?: typeof black; x?: number; y?: number } = {}) => {
    page.drawText(value, { x: options.x ?? margin, y: options.y ?? y, size, font: options.font ?? regular, color: options.color ?? black });
  };

  text('REPORT', 22, { font: bold });
  y -= 28;
  text(report.number, 9, { color: gray });
  y -= 25;
  page.drawLine({ start: { x: margin, y }, end: { x: pageWidth - margin, y }, thickness: 1, color: black });
  y -= 24;
  text(client.name, 14, { font: bold });
  y -= 17;
  if (client.company && client.company !== client.name) {
    text(client.company, 9, { color: gray });
    y -= 15;
  }
  text(`Through ${report.periodEnd}`, 9, { color: gray });
  y -= 28;

  page.drawRectangle({ x: margin, y: y - 17, width: pageWidth - margin * 2, height: 24, color: lightGray });
  text('DATE', 8, { font: bold, color: gray, y: y - 9 });
  text('PROJECT / TASK', 8, { font: bold, color: gray, x: margin + 92, y: y - 9 });
  text('TIME', 8, { font: bold, color: gray, x: pageWidth - margin - 45, y: y - 9 });
  y -= 34;

  for (const line of report.lines) {
    const entry = store.entries.find((item) => item.id === line.entryId);
    if (!entry) continue;
    const project = store.projects.find((item) => item.id === entry.projectId);
    const member = store.team.find((item) => item.id === entry.memberId);
    const taskLines = wrapText(`${member?.name ?? 'Unknown person'} · ${project?.name ?? 'General'} / ${entry.task || 'Untitled task'}`, 58);
    const rowHeight = Math.max(19, taskLines.length * 11 + 8);
    ensureSpace(rowHeight);
    text(entry.date, 8, { y: y - 10 });
    taskLines.forEach((taskLine, index) => text(taskLine, 8, { x: margin + 92, y: y - 10 - index * 11 }));
    text(formatDuration(line.seconds), 8, { x: pageWidth - margin - 52, y: y - 10 });
    page.drawLine({ start: { x: margin, y: y - rowHeight }, end: { x: pageWidth - margin, y: y - rowHeight }, thickness: 0.35, color: lightGray });
    y -= rowHeight;
  }

  ensureSpace(48);
  y -= 18;
  page.drawLine({ start: { x: margin, y }, end: { x: pageWidth - margin, y }, thickness: 1, color: black });
  y -= 22;
  text('TOTAL HOURS', 9, { font: bold });
  text(formatDuration(report.hours * 3600), 11, { font: bold, x: pageWidth - margin - 64 });
  y -= 26;
  text(report.billedAt ? `Billed and closed on ${report.billedAt.slice(0, 10)}` : 'Not billed · Hours reserved', 8, { color: gray });
  drawFooter(page, pageNumber, regular);

  const bytes = await pdf.save();
  return new NextResponse(Buffer.from(bytes), {
    status: 200,
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${report.number.replace(/[^a-zA-Z0-9_-]/g, '-')}.pdf"`,
      'Cache-Control': 'private, no-store',
    },
  });
}
