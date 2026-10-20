'use client';

import { CalendarDaysIcon, ClockIcon, FilmIcon, QueueListIcon } from '@heroicons/react/24/outline';
import ChartCard from '@/components/charts/ChartCard';
import { BarChart, Donut, HBarList, SERIES, StatTile, hours } from '@/components/charts/Charts';
import { fmt, sortKey, toSecs } from '@/lib/hours-report/time';
import type { Entry } from '@/lib/hours-report/types';

/** Live infographic for the report being edited. Every chart recalculates and re-animates when a row changes. */
export function ReportInsights({ entries }: { entries: Entry[] }) {
  const video = entries.filter((entry) => entry.category === 'video').reduce((sum, entry) => sum + toSecs(entry.time), 0);
  const admin = entries.filter((entry) => entry.category === 'admin').reduce((sum, entry) => sum + toSecs(entry.time), 0);
  const total = video + admin;

  const byDay = new Map<string, number>();
  entries.forEach((entry) => byDay.set(entry.date, (byDay.get(entry.date) ?? 0) + toSecs(entry.time)));
  const days = [...byDay.entries()]
    .sort(([a], [b]) => sortKey(a).localeCompare(sortKey(b)))
    .map(([date, value]) => ({ label: date.slice(0, 5), value, date }));

  const byTask = new Map<string, number>();
  entries.forEach((entry) => {
    const name = entry.project.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1').trim() || 'Untitled task';
    byTask.set(name, (byTask.get(name) ?? 0) + toSecs(entry.time));
  });
  const tasks = [...byTask.entries()].sort(([, a], [, b]) => b - a).slice(0, 6).map(([label, value]) => ({ label, value }));

  return (
    <div className="space-y-5">
      <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
        <StatTile label="Total" value={total} format={(value) => fmt(Math.round(value))} Icon={ClockIcon} />
        <StatTile label="Video" value={video} format={(value) => hours(value)} Icon={FilmIcon} />
        <StatTile label="Days worked" value={days.length} format={(value) => String(Math.round(value))} Icon={CalendarDaysIcon} />
        <StatTile label="Avg / day" value={days.length ? total / days.length : 0} format={(value) => hours(value)} Icon={QueueListIcon} />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_1.4fr]">
        <ChartCard
          title="Time split"
          table={{ columns: ['Category', 'Hours', 'Share'], rows: [['Video editing', fmt(video), `${total ? Math.round((video / total) * 100) : 0}%`], ['Business admin', fmt(admin), `${total ? Math.round((admin / total) * 100) : 0}%`]] }}
        >
          <Donut
            centerLabel="Total"
            format={(value) => hours(value)}
            segments={[
              { label: 'Video editing', value: video, color: SERIES[0] },
              { label: 'Business admin', value: admin, color: SERIES[1] },
            ]}
          />
        </ChartCard>

        <ChartCard title="Hours per day" table={{ columns: ['Date', 'Hours'], rows: days.map((day) => [day.date, fmt(day.value)]) }}>
          {days.length ? <BarChart data={days} format={(value) => hours(value)} /> : <p className="text-sm text-[var(--color-text-muted)]">No dated rows yet.</p>}
        </ChartCard>
      </div>

      <ChartCard title="Top tasks" subtitle="Where the most time went" table={{ columns: ['Task', 'Hours'], rows: tasks.map((task) => [task.label, fmt(task.value)]) }}>
        <HBarList data={tasks} format={(value) => hours(value)} />
      </ChartCard>
    </div>
  );
}

type SavedReport = { id: string; client: string; reportDate?: string; createdAt: string; totalHours: string };

/** Trend of saved reports, oldest to newest (last 12). */
export function HistoryTrend({ reports }: { reports: SavedReport[] }) {
  const recent = [...reports]
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
    .slice(-12);
  const data = recent.map((report) => ({ label: report.reportDate || new Date(report.createdAt).toLocaleDateString(), value: toSecs(report.totalHours) }));
  const total = data.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_2fr]">
      <div className="grid gap-6">
        <StatTile label="Reports" value={reports.length} format={(value) => String(Math.round(value))} Icon={QueueListIcon} />
        <StatTile label="Hours reported" value={total} format={(value) => hours(value)} Icon={ClockIcon} />
      </div>
      <ChartCard
        title="Hours per report"
        subtitle={`Last ${data.length}`}
        table={{ columns: ['Report', 'Client', 'Hours'], rows: recent.map((report) => [report.reportDate || report.createdAt.slice(0, 10), report.client, report.totalHours]) }}
      >
        <BarChart data={data} format={(value) => hours(value)} height={180} />
      </ChartCard>
    </div>
  );
}
