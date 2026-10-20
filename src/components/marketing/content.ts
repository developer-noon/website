import {
  ArrowUpTrayIcon,
  BanknotesIcon,
  BriefcaseIcon,
  CalendarDaysIcon,
  ChartBarIcon,
  ClockIcon,
  DocumentChartBarIcon,
  DocumentTextIcon,
  ShieldCheckIcon,
  UserGroupIcon,
} from '@heroicons/react/24/outline';

type Icon = typeof ClockIcon;

export type Feature = {
  title: string;
  text: string;
  points: string[];
  Icon: Icon;
};

export const features: Feature[] = [
  {
    title: 'Live timer and daily log',
    text: 'Start a timer for the task in front of you, or type times straight into the daily grid. Every edit saves as you type.',
    points: ['One-click start and stop', 'Office arrival and departure per day', 'Search and filter by date range'],
    Icon: ClockIcon,
  },
  {
    title: 'Clients, projects, and team',
    text: 'Organize every entry under a client and project, and record which team member did the work.',
    points: ['Hourly rate per client', 'Projects created automatically', 'Team members on every entry'],
    Icon: UserGroupIcon,
  },
  {
    title: 'Clockify CSV import',
    text: 'Bring in an existing Clockify export. Dates, arrivals, departures, tasks, and hours are read and matched to your clients.',
    points: ['Maps the columns for you', 'Repeating dates are filled in', 'Clients are created automatically'],
    Icon: ArrowUpTrayIcon,
  },
  {
    title: 'Billing cycles and reports',
    text: 'Close a month to lock its hours into a cycle. Generate a clean, printable report for any client from unbilled time.',
    points: ['Monthly cycle ledger', 'Reports from oldest unbilled hours', 'Print or save as PDF'],
    Icon: CalendarDaysIcon,
  },
  {
    title: 'Analytics at a glance',
    text: 'See total, billed, and unbilled hours per client for this month, last month, this year, or any custom range.',
    points: ['Per-client breakdown', 'Tracked value across active clients', 'Office span versus client hours'],
    Icon: ChartBarIcon,
  },
  {
    title: 'Pay structure and payout',
    text: 'Set base pay and your currency conversion, then watch the payout update as hours grow through commission tiers.',
    points: ['Commission tiers at 75, 100, 150, and 200 hours', 'Effective hourly rate', 'Weekly pace estimate'],
    Icon: BanknotesIcon,
  },
  {
    title: 'Team workspaces',
    text: 'Create a workspace and invite teammates by email. Invitations expire after seven days and only the invited address can accept.',
    points: ['Owner and member roles', 'Invitations sent to a specific email', 'Accepted from the signed-in account'],
    Icon: ShieldCheckIcon,
  },
  {
    title: 'Hours reports from Clockify',
    text: 'Paste or upload a Clockify report and turn it into a downloadable hours report with totals per category.',
    points: ['Saved report history', 'Warnings for unreadable rows', 'Ready to send to a client'],
    Icon: DocumentChartBarIcon,
  },
];

export const steps = [
  {
    title: 'Log your hours',
    text: 'Use the live timer while you work, type entries into the grid, or import a Clockify export.',
  },
  {
    title: 'Organize by client',
    text: 'Every entry lands under a client and project, with the team member who worked on it.',
  },
  {
    title: 'Close the cycle',
    text: 'Lock a month, share a client report, and see exactly what you are paid when the hours are final.',
  },
];

export const faqs = [
  {
    question: 'Do I need to install anything?',
    answer: 'No. Deeds n Doings runs in your browser. Sign in from any modern desktop or mobile browser.',
  },
  {
    question: 'How do I sign in?',
    answer: 'Use your email and password, or continue with a verified Google account. You can also turn on two-step verification with an authenticator app.',
  },
  {
    question: 'Can I import my existing Clockify data?',
    answer: 'Yes. Export a CSV from Clockify with the Date, Office Arrival, Client, Tasks, Hours, and Office Logged OFF columns, then import it in the Hours track.',
  },
  {
    question: 'Who can see my hours?',
    answer: 'Only you, plus any teammates you invite to a workspace. Every record is scoped to your account on the server.',
  },
  {
    question: 'What happens if I lose my phone with the authenticator?',
    answer: 'There are no recovery codes yet, so keep your authenticator app backed up or on a device you can always reach. If you lose access, contact support to verify your identity and reset two-step verification.',
  },
];

/* Who the product is for. Copy describes their day, not product features. */
export const personas = [
  {
    title: 'Independent consultants',
    text: 'You split your week across several client offices. Log each site separately and see what every client owes at month end.',
    points: ['One timer per client site', 'Monthly cycle per client', 'Printable report for each invoice'],
  },
  {
    title: 'Agencies and teams',
    text: 'Your people work on-site for different accounts. Track each person, each project, and each billing cycle in one workspace.',
    points: ['Team members on every entry', 'Invite people by email', 'Owner and member roles'],
  },
  {
    title: 'On-site contractors',
    text: 'Office arrival and departure matter as much as the task list. Record both, then bill from the hours that were actually worked.',
    points: ['Arrival and departure per day', 'Clockify CSV import', 'Commission tiers on payout'],
  },
];

/* A single client day, used by the timeline visual. Hours are illustrative. */
export const clientDay = [
  { client: 'Client A', start: 9, end: 11.5, tone: 'primary' },
  { client: 'Client B', start: 11.5, end: 13, tone: 'mint' },
  { client: 'Client A', start: 13.5, end: 16, tone: 'primary' },
  { client: 'Client C', start: 16, end: 17.5, tone: 'ink' },
];

/* One sample day per persona, in the same order as `personas`. */
export const personaDays = [
  [
    { client: 'Client A', start: 9, end: 11, tone: 'primary' },
    { client: 'Client B', start: 11.5, end: 13, tone: 'mint' },
    { client: 'Client C', start: 14, end: 16.5, tone: 'ink' },
  ],
  [
    { client: 'Team', start: 9, end: 12, tone: 'primary' },
    { client: 'Project X', start: 13, end: 17, tone: 'mint' },
  ],
  [
    { client: 'Arrive', start: 9, end: 10, tone: 'mint' },
    { client: 'On site', start: 10, end: 16.5, tone: 'primary' },
    { client: 'Leave', start: 16.5, end: 17.5, tone: 'ink' },
  ],
];

/*
 * Pricing tiers. PLACEHOLDER VALUES: prices and limits are not decided and billing is not connected.
 * Change them here; the pricing page reads from this list only.
 */
export const billingLive = false;

export const tiers = [
  {
    name: 'Free',
    price: '$0',
    period: 'forever',
    text: 'Start tracking one client site and see how a billing cycle works.',
    cta: 'Start free',
    href: '/signup',
    highlight: false,
    points: ['1 client', 'Live timer and daily log', 'Monthly billing cycle', 'Printable report', 'Two-step sign-in'],
  },
  {
    name: 'Pro',
    price: '$12',
    period: 'per month',
    text: 'For consultants with several client sites and a monthly invoice run.',
    cta: 'Choose Pro',
    href: '/signup',
    highlight: true,
    points: ['Unlimited clients and projects', 'Clockify CSV import', 'Analytics by client', 'Commission tiers and payout', 'Unlimited reports'],
  },
  {
    name: 'Team',
    price: '$29',
    period: 'per month',
    text: 'For agencies and teams who share one workspace across accounts.',
    cta: 'Choose Team',
    href: '/contact',
    highlight: false,
    points: ['Everything in Pro', 'Team workspace with roles', 'Invitations by email', 'Team members on every entry', 'Priority support'],
  },
];

export const productModules = [
  { title: 'Live timer and daily log', text: 'Start a timer on arrival or type the day into the grid.', href: '/dashboard/pay-structure?tab=hours', Icon: ClockIcon },
  { title: 'Clients and projects', text: 'Every entry is filed under a client, a project, and a team member.', href: '/dashboard/pay-structure?tab=clients', Icon: BriefcaseIcon },
  { title: 'Billing cycles', text: 'Lock a month into a cycle so unbilled time is always visible.', href: '/dashboard/pay-structure?tab=income', Icon: CalendarDaysIcon },
  { title: 'Client reports', text: 'Printable reports from the oldest unbilled hours.', href: '/dashboard/pay-structure?tab=reports', Icon: DocumentTextIcon },
  { title: 'Analytics', text: 'Total, billed, and unbilled hours for any date range.', href: '/dashboard/pay-structure?tab=analytics', Icon: ChartBarIcon },
  { title: 'Pay structure', text: 'Base pay, currency, and commission tiers in one place.', href: '/dashboard/pay-structure?tab=pay', Icon: BanknotesIcon },
  { title: 'Team workspace', text: 'Invite teammates by email and share one set of clients.', href: '/dashboard/workspace', Icon: UserGroupIcon },
  { title: 'Hours report PDF', text: 'Turn a Clockify report into a downloadable hours report.', href: '/dashboard/hours-report', Icon: DocumentChartBarIcon },
];
