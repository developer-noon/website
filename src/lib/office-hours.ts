export type OfficeHoursClient = { id: string; name: string; company: string; rate: number; status: 'Active' | 'Archived' };
export type OfficeHoursProject = { id: string; clientId: string; name: string; status: 'Active' | 'Archived' };
export type OfficeHoursTeamMember = { id: string; name: string; email: string; status: 'Active' | 'Archived' };
export type OfficeHoursEntry = { id: string; date: string; arrival: string; leaving: string; clientId: string; projectId: string; memberId: string; task: string; hours: string; cycleId: string; billed: boolean; startedAt?: string; stoppedAt?: string };
export type OfficeHoursReportLine = { entryId: string; seconds: number };
export type OfficeHoursReport = {
  id: string;
  number: string;
  clientId: string;
  label: string;
  hours: number;
  amount: number;
  createdAt: string;
  periodEnd: string;
  kind: 'monthly' | 'hours';
  lines: OfficeHoursReportLine[];
  billedAt?: string;
};
export type OfficeHoursStore = {
  clients: OfficeHoursClient[];
  projects: OfficeHoursProject[];
  team: OfficeHoursTeamMember[];
  entries: OfficeHoursEntry[];
  cycles: { id: string; label: string; closedAt: string; notes: string }[];
  reports: OfficeHoursReport[];
  basePay: number;
  exchangeRate: number;
  officeStart: string;
  officeEnd: string;
  activeTimer?: { entryId: string; startedAt: string };
};

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
  const source = (store && typeof store === 'object' ? store : {}) as Partial<OfficeHoursStore>;
  const rawClients = Array.isArray(source.clients) ? source.clients : [];
  const rawEntries = Array.isArray(source.entries) ? source.entries : [];
  const rawProjects = Array.isArray(source.projects) ? source.projects : [];
  const rawTeam = Array.isArray(source.team) ? source.team : [];
  const rawReports = Array.isArray(source.reports) ? source.reports : [];
  const clients = rawClients
    .filter((client) => client && typeof client.id === 'string' && typeof client.name === 'string' && client.name.trim())
    .map((client) => ({ ...client, name: client.name.trim() }));
  const clientIds = new Set(clients.map((client) => client.id));
  const projects = rawProjects.filter((project) => project && typeof project.id === 'string' && clientIds.has(project.clientId) && typeof project.name === 'string').map((project) => ({
    ...project,
    status: project.status === 'Archived' ? 'Archived' as const : 'Active' as const,
  }));
  for (const client of clients) {
    if (!projects.some((project) => project.clientId === client.id)) {
      projects.push({ id: `project-${client.id}-general`, clientId: client.id, name: 'General', status: 'Active' });
    }
  }
  const projectIds = new Set(projects.map((project) => project.id));
  const projectByClient = new Map(projects.map((project) => [project.clientId, project]));
  const team = rawTeam.filter((member) => member && typeof member.id === 'string' && typeof member.name === 'string').map((member) => ({
    id: member.id,
    name: member.name.trim() || 'Team member',
    email: typeof member.email === 'string' ? member.email.trim() : '',
    status: member.status === 'Archived' ? 'Archived' as const : 'Active' as const,
  }));
  const teamIds = new Set(team.map((member) => member.id));
  const defaultMemberId = team.find((member) => member.status === 'Active')?.id ?? '';
  const seenEntries = new Set<string>();
  return {
    ...store,
    clients,
    projects,
    team,
    reports: rawReports.filter((report) => report && typeof report.id === 'string' && clientIds.has(report.clientId)).map((report) => ({
      ...report,
      hours: Math.max(0, Number(report.hours) || 0),
      amount: Math.max(0, Number(report.amount) || 0),
      billedAt: typeof report.billedAt === 'string' ? report.billedAt : undefined,
      lines: Array.isArray(report.lines) ? report.lines.filter((line) => line && typeof line.entryId === 'string' && Number(line.seconds) > 0).map((line) => ({ entryId: line.entryId, seconds: Math.round(Number(line.seconds)) })) : [],
    })),
    entries: rawEntries.filter((entry) => entry && typeof entry.id === 'string' && typeof entry.date === 'string' && clientIds.has(entry.clientId)).map((entry) => ({
      ...entry,
      projectId: typeof entry.projectId === 'string' && projectIds.has(entry.projectId) ? entry.projectId : projectByClient.get(entry.clientId)?.id ?? '',
      memberId: typeof entry.memberId === 'string' && teamIds.has(entry.memberId) ? entry.memberId : defaultMemberId,
      billed: Boolean(entry.billed),
      hours: formatDuration(durationToSeconds(entry.hours)),
    })).filter((entry) => {
      const key = [entry.date, entry.arrival, entry.leaving, entry.clientId, entry.task, entry.hours, entry.cycleId].join('|');
      if (seenEntries.has(key)) return false;
      seenEntries.add(key);
      return true;
    }),
  };
}
