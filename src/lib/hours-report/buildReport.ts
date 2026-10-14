import { fmt, toSecs } from './time';
import type { Category, Entry, Report, ReportSection } from './types';

const sections: { key: Category; title: string }[] = [
  { key: 'video', title: 'VIDEO EDITING' },
  { key: 'admin', title: 'BUSINESS ADMIN' },
];

export function buildReport(entries: Entry[]): Report {
  const reportSections: ReportSection[] = sections.map(({ key, title }) => {
    const rows = entries.filter((entry) => entry.category === key);
    return { title, rows, total: fmt(rows.reduce((sum, row) => sum + toSecs(row.time), 0)) };
  });
  return { sections: reportSections, grandTotal: fmt(reportSections.reduce((sum, section) => sum + toSecs(section.total), 0)) };
}
