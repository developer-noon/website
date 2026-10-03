export const ALLOWED_OFFICE_HOUR_CLIENTS = ['SUMMER HUNTINGTON', 'PERIOP CONCEPTS', 'Ava Taylor'] as const;

export type OfficeHoursClient = { id: string; name: string; company: string; rate: number; status: 'Active' | 'Archived' };
export type OfficeHoursEntry = { id: string; date: string; arrival: string; leaving: string; clientId: string; task: string; hours: string; cycleId: string };
export type OfficeHoursStore = {
  clients: OfficeHoursClient[];
  entries: OfficeHoursEntry[];
  cycles: { id: string; label: string; closedAt: string; notes: string }[];
  basePay: number;
  exchangeRate: number;
  officeStart: string;
  officeEnd: string;
};

export function allowedClientName(name: string) {
  return ALLOWED_OFFICE_HOUR_CLIENTS.find((allowedName) => allowedName.toLowerCase() === name.trim().toLowerCase());
}

export function durationToSeconds(value: string | number) {
  if (typeof value === 'number') return Math.max(0, Math.round(value * 3600));
  const parts = value.trim().split(':').map(Number);
  if (parts.some((part) => !Number.isFinite(part))) return 0;
  if (parts.length === 3) return Math.max(0, parts[0] * 3600 + parts[1] * 60 + parts[2]);
  if (parts.length === 2) return Math.max(0, parts[0] * 3600 + parts[1] * 60);
  return 0;
}

export function formatDuration(seconds: number) {
  const safeSeconds = Math.max(0, Math.round(seconds));
  const hours = Math.floor(safeSeconds / 3600);
  const minutes = Math.floor((safeSeconds % 3600) / 60);
  const remainingSeconds = safeSeconds % 60;
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
}

export function sanitizeOfficeHoursStore(store: OfficeHoursStore): OfficeHoursStore {
  const existingClients = store.clients.filter((client) => allowedClientName(client.name)).map((client) => ({
    ...client,
    name: allowedClientName(client.name) ?? client.name,
  }));
  const clients = ALLOWED_OFFICE_HOUR_CLIENTS.map((name) => existingClients.find((client) => client.name.toLowerCase() === name.toLowerCase()) ?? ({
    id: `client-${name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
    name,
    company: name,
    rate: 2475,
    status: 'Active' as const,
  }));
  const clientIds = new Set(clients.map((client) => client.id));
  const seenEntries = new Set<string>();
  return {
    ...store,
    clients,
    entries: store.entries.filter((entry) => clientIds.has(entry.clientId)).map((entry) => ({
      ...entry,
      hours: formatDuration(durationToSeconds(entry.hours)),
    })).filter((entry) => {
      const key = [entry.date, entry.arrival, entry.leaving, entry.clientId, entry.task, entry.hours, entry.cycleId].join('|');
      if (seenEntries.has(key)) return false;
      seenEntries.add(key);
      return true;
    }),
  };
}
