/**
 * EXAMPLE CONTENT. These entries describe how the product is used. They are not customer results.
 * While `sample` is true, the page shows a visible "Example" badge on that item.
 * Metrics are real product limits from the app, not measured outcomes.
 */

export type Project = {
  id: string;
  sample: boolean;
  title: string;
  client: string;
  discipline: string;
  /** Accent colour for the generated artwork. */
  accent: string;
  shape: 'orbit' | 'grid' | 'wave' | 'stack';
};

export const showcase: Project[] = [
  { id: 'orbit', sample: true, title: 'A day on site', client: 'Example client', discipline: 'Live timer and daily log', accent: '#9FE870', shape: 'orbit' },
  { id: 'grid', sample: true, title: 'A week across three clients', client: 'Example consultant', discipline: 'One timer per client site', accent: '#FFC091', shape: 'grid' },
  { id: 'wave', sample: true, title: 'Month-end billing cycle', client: 'Example agency', discipline: 'Cycles and printable reports', accent: '#38C8FF', shape: 'wave' },
  { id: 'stack', sample: true, title: 'Importing last quarter', client: 'Example contractor', discipline: 'Clockify CSV import', accent: '#FFC091', shape: 'stack' },
];

export type CaseStudy = {
  id: string;
  sample: boolean;
  title: string;
  challenge: string;
  approach: string;
  /** Counted up when the card scrolls in. `value` is the product limit shown. */
  metrics: { label: string; value: number; suffix?: string; prefix?: string }[];
  accent: string;
};

export const caseStudies: CaseStudy[] = [
  {
    id: 'case-a',
    sample: true,
    title: 'An independent consultant with three client sites',
    challenge: 'Hours were scattered across notebooks and calendars, so month-end invoices took days.',
    approach: 'One timer per client site, a monthly billing cycle per client, and a printable report for each invoice.',
    metrics: [
      { label: 'Commission tiers on payout', value: 4 },
      { label: 'Days to invite a teammate', value: 7 },
      { label: 'Digits in a sign-up code', value: 6 },
    ],
    accent: '#9FE870',
  },
  {
    id: 'case-b',
    sample: true,
    title: 'An agency tracking hours across accounts',
    challenge: 'Team time was spread across accounts with no shared view of who worked on what.',
    approach: 'A workspace with owner and member roles, invitations sent to one email address, and a team member on every entry.',
    metrics: [
      { label: 'Roles per workspace', value: 2 },
      { label: 'Days an invite stays valid', value: 7 },
      { label: 'Minutes a reset link lasts', value: 30 },
    ],
    accent: '#FFC091',
  },
  {
    id: 'case-c',
    sample: true,
    title: 'An on-site contractor billing from actual days',
    challenge: 'Billing from memory missed days on site and under-stated the hours worked.',
    approach: 'Record arrival and departure each day, then import a Clockify export to fill in past weeks.',
    metrics: [
      { label: 'Commission tiers on payout', value: 4 },
      { label: 'Import format accepted', value: 1, suffix: ' CSV' },
      { label: 'Minutes a code stays valid', value: 15 },
    ],
    accent: '#38C8FF',
  },
];
