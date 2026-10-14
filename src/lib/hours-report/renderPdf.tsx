import path from 'node:path';
import { readFile } from 'node:fs/promises';
import { renderToBuffer } from '@react-pdf/renderer';
import { ReportDocument } from '@/components/hours-report/ReportDocument';
import type { Report, ReportMeta } from './types';

export async function renderHoursReportPdf(report: Report, meta: ReportMeta) {
  const logoPath = path.join(process.cwd(), 'public', 'brandefy-logo.png');
  const logoSrc = `data:image/png;base64,${(await readFile(logoPath)).toString('base64')}`;
  const pdf = await renderToBuffer(<ReportDocument report={report} meta={meta} logoSrc={logoSrc} />);
  return new Uint8Array(pdf);
}
