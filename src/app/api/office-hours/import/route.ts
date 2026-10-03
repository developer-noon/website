import { auth } from '@/auth';
import { getMongoDatabase } from '@/lib/mongodb';
import { NextResponse } from 'next/server';
import { allowedClientName, sanitizeOfficeHoursStore, type OfficeHoursEntry as Entry, type OfficeHoursStore } from '@/lib/office-hours';

function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let value = '';
  let quoted = false;

  for (let index = 0; index < text.length; index += 1) {
    const character = text[index];
    const next = text[index + 1];
    if (character === '"' && quoted && next === '"') {
      value += '"';
      index += 1;
    } else if (character === '"') {
      quoted = !quoted;
    } else if (character === ',' && !quoted) {
      row.push(value.trim());
      value = '';
    } else if ((character === '\n' || character === '\r') && !quoted) {
      if (character === '\r' && next === '\n') index += 1;
      row.push(value.trim());
      if (row.some((cell) => cell)) rows.push(row);
      row = [];
      value = '';
    } else {
      value += character;
    }
  }

  row.push(value.trim());
  if (row.some((cell) => cell)) rows.push(row);
  return rows;
}

function parseDate(value: string): string {
  const normalized = value.trim().replace(/,/g, '');
  const match = normalized.match(/^(\d{1,2})\s+([A-Za-z]+)\s+(\d{4})$/);
  if (!match) throw new Error(`Invalid date in CSV: ${value}`);

  const monthNames = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december'];
  const day = Number(match[1]);
  const month = monthNames.indexOf(match[2].toLowerCase());
  const year = Number(match[3]);
  const date = new Date(Date.UTC(year, month, day));
  if (month < 0 || date.getUTCFullYear() !== year || date.getUTCMonth() !== month || date.getUTCDate() !== day) {
    throw new Error(`Invalid date in CSV: ${value}`);
  }

  return `${String(year).padStart(4, '0')}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

function parseTime(value: string): string {
  const match = value.trim().match(/^(\d{1,2}):(\d{2})(?::\d{2})?\s*(am|pm)?$/i);
  if (!match) throw new Error(`Invalid time in CSV: ${value}`);
  let hour = Number(match[1]);
  const minute = Number(match[2]);
  const meridiem = match[3]?.toLowerCase();
  if (meridiem === 'pm' && hour !== 12) hour += 12;
  if (meridiem === 'am' && hour === 12) hour = 0;
  return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
}

function parseDuration(value: string): string {
  const match = value.trim().match(/^(\d+):(\d{2})(?::(\d{2}))?$/);
  if (!match) throw new Error(`Invalid duration in CSV: ${value}`);
  return `${String(Number(match[1])).padStart(2, '0')}:${match[2]}:${match[3] ?? '00'}`;
}

function makeId() {
  return crypto.randomUUID();
}

export async function POST(request: Request) {
  const session = await auth();
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!userId) return NextResponse.json({ error: 'You must be signed in to import hours.' }, { status: 401 });

  try {
    const formData = await request.formData();
    const file = formData.get('file');
    if (!(file instanceof File) || !file.name.toLowerCase().endsWith('.csv')) {
      return NextResponse.json({ error: 'Please choose a CSV file.' }, { status: 400 });
    }

    const rows = parseCsv(await file.text());
    const headers = rows.shift()?.map((header) => header.toLowerCase()) ?? [];
    const indexOf = (name: string) => headers.indexOf(name.toLowerCase());
    const dateIndex = indexOf('date');
    const arrivalIndex = indexOf('office arrival');
    const clientIndex = indexOf('client');
    const taskIndex = indexOf('tasks');
    const hoursIndex = indexOf('hours');
    const leavingIndex = indexOf('office logged off');
    if ([dateIndex, arrivalIndex, clientIndex, taskIndex, hoursIndex, leavingIndex].some((index) => index < 0)) {
      return NextResponse.json({ error: 'CSV must include Date, Office Arrival, Client, Tasks, Hours, and Office Logged OFF columns.' }, { status: 400 });
    }

    const database = await getMongoDatabase();
    const collection = database.collection<{ userId: string; store: OfficeHoursStore; updatedAt: Date }>('officeHoursTrack');
    const existing = await collection.findOne({ userId });
    const store: OfficeHoursStore = sanitizeOfficeHoursStore(existing?.store ?? {
      clients: [],
      entries: [],
      cycles: [],
      basePay: 50000,
      exchangeRate: 275,
      officeStart: '14:00',
      officeEnd: '00:00',
    });
    let currentDate = '';
    let currentArrival = store.officeStart;
    let currentLeaving = store.officeEnd;
    const clientsByName = new Map(store.clients.map((client) => [client.name.trim().toLowerCase(), client]));
    const importedEntries: Entry[] = [];

    for (const row of rows) {
      const clientName = row[clientIndex]?.trim();
      if (!clientName) continue;
      if (row[dateIndex]?.trim()) currentDate = parseDate(row[dateIndex].trim());
      if (row[arrivalIndex]?.trim()) currentArrival = parseTime(row[arrivalIndex].trim());
      if (row[leavingIndex]?.trim()) currentLeaving = parseTime(row[leavingIndex].trim());
      if (!currentDate) throw new Error(`A client row has no date before it: ${clientName}`);
      const canonicalName = allowedClientName(clientName);
      if (!canonicalName) continue;
      let client = clientsByName.get(canonicalName.toLowerCase());
      if (!client) {
        client = { id: makeId(), name: canonicalName, company: canonicalName, rate: 2475, status: 'Active' };
        clientsByName.set(canonicalName.toLowerCase(), client);
        store.clients.push(client);
      }
      importedEntries.push({
        id: makeId(),
        date: currentDate,
        arrival: currentArrival,
        leaving: currentLeaving,
        clientId: client.id,
        task: row[taskIndex]?.trim() ?? '',
        hours: parseDuration(row[hoursIndex]?.trim() ?? ''),
        cycleId: 'active',
      });
    }

    store.entries.push(...importedEntries);
    const sanitizedStore = sanitizeOfficeHoursStore(store);
    await collection.replaceOne({ userId }, { userId, store: sanitizedStore, updatedAt: new Date() }, { upsert: true });
    return NextResponse.json({ store: sanitizedStore, imported: importedEntries.length, clients: sanitizedStore.clients.length });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'CSV import failed.';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
