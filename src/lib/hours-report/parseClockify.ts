import type { Category, Entry } from './types';
import { fmt, toSecs } from './time';

export function categoryFromProject(label: string): Category | null {
  const normalized = label.trim().toLowerCase();
  if (normalized.startsWith('admin')) return 'admin';
  if (normalized.startsWith('video editing') || normalized.startsWith('youtube')) return 'video';
  return null;
}

const LINK = /^\s*(?:\d+\s*)?(?:\*{1,2})?\[([^\]]+)\]\(\s*\[?https?:\/\//;
const TIME = /^\d{1,3}:\d{2}:\d{2}$/;
const DATE = /^\d{2}\/\d{2}\/\d{4}$/;
const COUNT = /^\d+$/;

export interface ParseResult {
  entries: Entry[];
  warnings: string[];
}

export function parseClockify(raw: string): ParseResult {
  const lines = raw.split(/\r?\n/).map((line) => line.trimEnd()).filter((line) => line.trim() !== '');
  const entries: Entry[] = [];
  const warnings: string[] = [];
  const dailyTotals: Record<string, string> = {};
  let date = '';
  let category: Category | null = null;
  let hasDailyTotal = false;
  let waitingForProjectTotal = false;
  let pendingTask = '';
  let expectingProject = false;

  for (let index = 0; index < lines.length; index += 1) {
    const match = lines[index].match(LINK);
    if (match) {
      const label = match[1];
      const time = lines.slice(index + 1, index + 3).map((line) => line.trim()).find((line) => TIME.test(line)) ?? '';
      if (!time) continue;

      if (DATE.test(label.trim())) {
        date = label.trim();
        dailyTotals[date] = time;
        category = null;
      } else if (categoryFromProject(label)) {
        category = categoryFromProject(label);
      } else if (date && category) {
        entries.push({ date, category, project: label.trim(), time });
      }
      continue;
    }

    const line = lines[index].trim();
    if (COUNT.test(line)) {
      expectingProject = true;
      continue;
    }

    if (DATE.test(line)) {
      date = line;
      category = null;
      hasDailyTotal = false;
      waitingForProjectTotal = false;
      pendingTask = '';
      expectingProject = false;
      continue;
    }

    if (TIME.test(line)) {
      if (!date) continue;
      if (!hasDailyTotal) {
        dailyTotals[date] = line;
        hasDailyTotal = true;
      } else if (waitingForProjectTotal) {
        waitingForProjectTotal = false;
      } else if (pendingTask && category) {
        entries.push({ date, category, project: pendingTask, time: line });
        pendingTask = '';
      }
      continue;
    }

    const plainCategory = expectingProject ? categoryFromProject(line) : null;
    if (plainCategory) {
      category = plainCategory;
      waitingForProjectTotal = true;
      pendingTask = '';
      expectingProject = false;
      continue;
    }

    if (date && category && hasDailyTotal) {
      pendingTask = line;
    }
  }

  const sums: Record<string, number> = {};
  for (const entry of entries) sums[entry.date] = (sums[entry.date] ?? 0) + toSecs(entry.time);
  for (const [day, total] of Object.entries(dailyTotals)) {
    if (fmt(sums[day] ?? 0) !== total) warnings.push(`${day}: entries add up to ${fmt(sums[day] ?? 0)} but Clockify says ${total}.`);
  }
  return { entries, warnings };
}
