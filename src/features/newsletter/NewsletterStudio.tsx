'use client';

import { ArrowDownTrayIcon, ArrowPathIcon, CheckCircleIcon, ClipboardDocumentIcon, EyeIcon, LinkIcon, PlusIcon, SparklesIcon } from '@heroicons/react/24/outline';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import type { NewsletterBrief, NewsletterDraft, NewsletterResource, NewsletterSession } from './types';

type Tab = 'theme' | 'sessions' | 'submissions' | 'newsletter';

const initialBrief: NewsletterBrief = {
  businessName: '', audience: '', voice: 'clear, helpful, and confident', tone: 'professional', topic: '', keyMessages: '', offer: '', offerUrl: '', socialProof: '', callToAction: 'Explore the offer',
  primaryColor: '#0B353B', secondaryColor: '#4A5C5F', accentColor: '#ABFFAE', backgroundColor: '#F3F7F6', surfaceColor: '#FFFFFF', textColor: '#0B353B', mutedColor: '#4A5C5F', textOnPrimaryColor: '#FFFFFF', textOnAccentColor: '#0B353B', borderColor: '#DCE7E5', logoUrl: '', websiteUrl: '', brandTagline: '', footerNote: '', fontFamily: 'Arial, Helvetica, sans-serif', style: 'minimal-editorial',
};

export default function NewsletterStudio() {
  const [brief, setBrief] = useState(initialBrief);
  const [sessions, setSessions] = useState<NewsletterSession[]>([]);
  const [selectedSessionId, setSelectedSessionId] = useState('');
  const [candidates, setCandidates] = useState<NewsletterResource[]>([]);
  const [draft, setDraft] = useState<NewsletterDraft | null>(null);
  const [tab, setTab] = useState<Tab>(() => {
    if (typeof window === 'undefined') return 'sessions';
    const requestedTab = new URLSearchParams(window.location.search).get('tab');
    return requestedTab && ['theme', 'sessions', 'submissions', 'newsletter'].includes(requestedTab) ? requestedTab as Tab : 'sessions';
  });
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState('');
  const [manualUrl, setManualUrl] = useState('');
  const [manualTitle, setManualTitle] = useState('');
  const [manualResource, setManualResource] = useState<NewsletterResource | null>(null);
  const [preview, setPreview] = useState<'preview' | 'html' | 'text'>('preview');
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryTab = searchParams.get('tab');
  const activeTab: Tab = queryTab && ['theme', 'sessions', 'submissions', 'newsletter'].includes(queryTab) ? queryTab as Tab : tab;

  useEffect(() => {
    void fetch('/api/newsletter/curate').then(async (response) => {
      if (!response.ok) return;
      const payload = await response.json() as { brief?: NewsletterBrief | null; sessions: NewsletterSession[] };
      if (payload.brief) setBrief(payload.brief);
      setSessions(payload.sessions);
      if (payload.sessions[0]) setSelectedSessionId((current) => current || payload.sessions[0].id);
    });
  }, []);

  const updateBrief = (field: keyof NewsletterBrief, value: string) => setBrief((current) => ({ ...current, [field]: value }));

  const navigateTab = (nextTab: Tab) => {
    setTab(nextTab);
    router.replace(`/dashboard/newsletter/?tab=${nextTab}`, { scroll: false });
  };

  async function api(body: Record<string, unknown>) {
    const response = await fetch('/api/newsletter/curate', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    const payload = await response.json();
    if (!response.ok) throw new Error(payload.error || 'Something went wrong.');
    return payload as { resources?: NewsletterResource[]; resource?: NewsletterResource; session?: NewsletterSession };
  }

  async function saveBrand() {
    setBusy('brand');
    try { await api({ action: 'save-brand', brief }); setNotice('Brand theme saved.'); }
    catch (error) { setNotice(error instanceof Error ? error.message : 'Could not save the brand theme.'); }
    finally { setBusy(''); }
  }

  async function createSession(kind: 'current' | 'upcoming') {
    setBusy('session');
    try {
      const payload = await api({ action: 'create-session', topic: brief.topic, kind });
      if (payload.session) { setSessions((current) => [...current.filter((item) => item.id !== payload.session!.id), payload.session!].sort((a, b) => a.startsOn.localeCompare(b.startsOn))); setSelectedSessionId(payload.session.id); }
      setNotice('Weekly session ready.');
    } catch (error) { setNotice(error instanceof Error ? error.message : 'Could not create session.'); }
    finally { setBusy(''); }
  }

  async function discover() {
    setBusy('discover');
    try {
      const payload = await api({ action: 'discover', sessionId: selectedSessionId });
      setCandidates(payload.resources ?? []); navigateTab('submissions'); setNotice(`${payload.resources?.length ?? 0} relevant articles found with AI.`);
    } catch (error) { setNotice(error instanceof Error ? error.message : 'AI research failed.'); }
    finally { setBusy(''); }
  }

  async function previewManual() {
    setBusy('manual');
    try { const payload = await api({ action: 'manual', url: manualUrl, title: manualTitle }); setManualResource(payload.resource ?? null); setNotice('Source summary ready.'); }
    catch (error) { setNotice(error instanceof Error ? error.message : 'Could not read that link.'); }
    finally { setBusy(''); }
  }

  async function addResource(resource: NewsletterResource) {
    if (!selectedSessionId) { setNotice('Create or select a session first.'); navigateTab('sessions'); return; }
    setBusy(resource.id);
    try {
      const payload = await api({ action: 'add', sessionId: selectedSessionId, resource });
      if (payload.session) setSessions((current) => current.map((item) => item.id === payload.session!.id ? payload.session! : item));
      setCandidates((current) => current.filter((item) => item.id !== resource.id)); setManualResource(null); setManualUrl(''); setManualTitle(''); setNotice('Article added to the session.');
    } catch (error) { setNotice(error instanceof Error ? error.message : 'Could not add the article.'); }
    finally { setBusy(''); }
  }

  async function generate() {
    setBusy('generate');
    try {
      const response = await fetch('/api/newsletter/generate/', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ sessionId: selectedSessionId }) });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || 'Generation failed.');
      setDraft(payload.draft); navigateTab('newsletter'); setNotice('Newsletter generated from the saved brand and session.');
    } catch (error) { setNotice(error instanceof Error ? error.message : 'Generation failed.'); }
    finally { setBusy(''); }
  }

  async function updateSession(sessionId: string, values: { title?: string; topic?: string }) {
    try { const payload = await api({ action: 'update-session', sessionId, ...values }); if (payload.session) setSessions((current) => current.map((item) => item.id === sessionId ? payload.session! : item)); setNotice('Session updated.'); }
    catch (error) { setNotice(error instanceof Error ? error.message : 'Could not update session.'); }
  }

  async function deleteSession(sessionId: string) {
    if (!window.confirm('Delete this session and its articles?')) return;
    try { await api({ action: 'delete-session', sessionId }); setSessions((current) => current.filter((item) => item.id !== sessionId)); if (selectedSessionId === sessionId) setSelectedSessionId(''); setNotice('Session deleted.'); }
    catch (error) { setNotice(error instanceof Error ? error.message : 'Could not delete session.'); }
  }

  async function deleteResource(sessionId: string, resourceId: string) {
    try { const payload = await api({ action: 'delete-resource', sessionId, resourceId }); if (payload.session) setSessions((current) => current.map((item) => item.id === sessionId ? payload.session! : item)); setNotice('Article removed.'); }
    catch (error) { setNotice(error instanceof Error ? error.message : 'Could not remove article.'); }
  }

  return <div className="mx-auto max-w-[1440px] px-4 py-8 sm:px-6 lg:px-8">
    <header className="mb-8 flex flex-col justify-between gap-5 lg:flex-row lg:items-end"><div><p className="eyebrow"><SparklesIcon className="h-4 w-4" aria-hidden="true" /> Newsletter workspace</p><h1 className="mt-4 text-4xl font-semibold tracking-[-0.07em] text-[#0B353B] sm:text-5xl">A better send, every week.</h1><p className="mt-3 max-w-2xl text-[#4A5C5F]">Research, shape, and generate one useful email from a living weekly session.</p></div>{notice ? <p className="max-w-sm text-sm font-medium text-[#0B353B]">{notice}</p> : null}</header>
    <div>
      {activeTab === 'theme' ? <ThemeTab brief={brief} updateBrief={updateBrief} save={saveBrand} busy={busy} /> : null}
      {activeTab === 'sessions' ? <SessionsTab sessions={sessions} selectedSessionId={selectedSessionId} select={setSelectedSessionId} create={createSession} update={updateSession} remove={deleteSession} removeResource={deleteResource} busy={busy} /> : null}
      {activeTab === 'submissions' ? <SubmissionsTab candidates={candidates} sessions={sessions} selectedSessionId={selectedSessionId} select={setSelectedSessionId} manualUrl={manualUrl} manualTitle={manualTitle} setManualUrl={setManualUrl} setManualTitle={setManualTitle} manualResource={manualResource} previewManual={previewManual} discover={discover} add={addResource} busy={busy} /> : null}
      {activeTab === 'newsletter' ? <NewsletterTab draft={draft} preview={preview} setPreview={setPreview} generate={generate} busy={busy} /> : null}
    </div>
  </div>;
}

function ThemeTab({ brief, updateBrief, save, busy }: { brief: NewsletterBrief; updateBrief: (field: keyof NewsletterBrief, value: string) => void; save: () => void; busy: string }) {
  return <section className="grid gap-6"><div className="brand-card p-6 sm:p-8"><SectionHeading eyebrow="Brand system" title="Build the brand foundation" copy="This information is saved and reused across newsletter sessions." /><div className="mt-6 grid gap-4 md:grid-cols-2"><Field label="Business name" value={brief.businessName} onChange={(value) => updateBrief('businessName', value)} placeholder="Northstar Studio" /><Field label="Audience" value={brief.audience} onChange={(value) => updateBrief('audience', value)} placeholder="Independent service businesses" /><Field label="Brand voice" value={brief.voice} onChange={(value) => updateBrief('voice', value)} placeholder="Warm, direct, practical" /><Field label="Website URL" value={brief.websiteUrl} onChange={(value) => updateBrief('websiteUrl', value)} placeholder="https://your-site.com" type="url" /><Field label="Logo URL" value={brief.logoUrl} onChange={(value) => updateBrief('logoUrl', value)} placeholder="https://your-site.com/logo.png" type="url" /><Field label="Brand tagline" value={brief.brandTagline} onChange={(value) => updateBrief('brandTagline', value)} placeholder="Make better work feel simpler" /></div><button type="button" className="cta-primary mt-6" onClick={save} disabled={busy === 'brand'}><CheckCircleIcon className="h-5 w-5" aria-hidden="true" /> {busy === 'brand' ? 'Saving...' : 'Save brand theme'}</button></div><div className="brand-card p-6 sm:p-8"><SectionHeading eyebrow="Theme kit" title="Keep the palette consistent" copy="These brand colors are shared by every send." /><div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{(['primaryColor', 'secondaryColor', 'accentColor', 'backgroundColor', 'surfaceColor', 'textColor', 'mutedColor', 'borderColor'] as const).map((field) => <ColorField key={field} label={field.replace('Color', '')} value={brief[field]} onChange={(value) => updateBrief(field, value)} />)}</div></div></section>;
}

function SessionsTab({ sessions, selectedSessionId, select, create, update, remove, removeResource, busy }: { sessions: NewsletterSession[]; selectedSessionId: string; select: (id: string) => void; create: (kind: 'current' | 'upcoming') => void; update: (id: string, values: { title?: string; topic?: string }) => void; remove: (id: string) => void; removeResource: (sessionId: string, resourceId: string) => void; busy: string }) {
  const [open, setOpen] = useState('');
  const [editing, setEditing] = useState('');
  const [title, setTitle] = useState('');
  const [topic, setTopic] = useState('');
  return <section className="grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)]"><div className="brand-card h-fit p-6 sm:p-8"><SectionHeading eyebrow="Publishing rhythm" title="Plan the next useful thing" copy="Each session owns its articles and is scheduled around Friday." /><div className="mt-6 grid gap-3"><button type="button" className="cta-primary" onClick={() => create('current')} disabled={busy === 'session'}><PlusIcon className="h-5 w-5" aria-hidden="true" /> Create this week</button><button type="button" className="cta-secondary" onClick={() => create('upcoming')} disabled={busy === 'session'}><ArrowPathIcon className="h-5 w-5" aria-hidden="true" /> Create upcoming week</button></div></div><div className="space-y-3">{sessions.length ? sessions.map((session) => <article key={session.id} className={`overflow-hidden rounded-2xl border bg-white ${selectedSessionId === session.id ? 'border-[#0B353B]' : 'border-[#0B353B]/10'}`}><button type="button" className="w-full p-5 text-left" onClick={() => { select(session.id); setOpen(open === session.id ? '' : session.id); }}><p className="text-xs font-bold uppercase tracking-[0.14em] text-[#4A5C5F]">Friday {session.startsOn} to {session.endsOn}</p><div className="mt-2 flex items-start justify-between gap-4"><div><h2 className="text-xl font-semibold">{session.title}</h2><p className="mt-1 text-sm text-[#4A5C5F]">{session.resources.length} article{session.resources.length === 1 ? '' : 's'} · {session.topic}</p></div><span className="rounded-full bg-[#ABFFAE]/40 px-3 py-1 text-xs font-semibold uppercase">{session.status}</span></div></button>{open === session.id ? <div className="border-t border-[#0B353B]/10 bg-[#F3F7F6] p-5"><div className="flex flex-wrap gap-2"><button type="button" className="cta-secondary text-sm" onClick={() => { setEditing(session.id); setTitle(session.title); setTopic(session.topic); }}>Edit session</button><button type="button" className="rounded-full border border-red-900/20 px-4 py-2 text-sm font-semibold text-red-900" onClick={() => remove(session.id)}>Delete session</button></div>{editing === session.id ? <div className="mt-4 grid gap-3 rounded-2xl bg-white p-4"><Field label="Session name" value={title} onChange={setTitle} placeholder="Week of Friday" /><Field label="Topic" value={topic} onChange={setTopic} placeholder="Weekly topic" /><button type="button" className="cta-primary" onClick={() => { update(session.id, { title, topic }); setEditing(''); }}>Save session</button></div> : null}<div className="mt-5 space-y-2">{session.resources.length ? session.resources.map((resource) => <details key={resource.id} className="rounded-xl border border-[#0B353B]/10 bg-white p-4"><summary className="cursor-pointer font-semibold">{resource.title}</summary><div className="mt-3 border-t border-[#0B353B]/10 pt-3 text-sm text-[#4A5C5F]"><p>{resource.description}</p><a href={resource.url} target="_blank" rel="noreferrer" className="mt-2 block truncate font-semibold text-[#0B353B]">{resource.url}</a><button type="button" className="mt-3 font-semibold text-red-900" onClick={() => removeResource(session.id, resource.id)}>Remove article</button></div></details>) : <p className="rounded-xl border border-dashed border-[#0B353B]/15 p-4 text-sm text-[#4A5C5F]">No articles in this session yet.</p>}</div></div> : null}</article>) : <Empty title="No sessions yet" copy="Create this week to begin." />}</div></section>;
}

function SubmissionsTab({ candidates, sessions, selectedSessionId, select, manualUrl, manualTitle, setManualUrl, setManualTitle, manualResource, previewManual, discover, add, busy }: { candidates: NewsletterResource[]; sessions: NewsletterSession[]; selectedSessionId: string; select: (id: string) => void; manualUrl: string; manualTitle: string; setManualUrl: (value: string) => void; setManualTitle: (value: string) => void; manualResource: NewsletterResource | null; previewManual: () => void; discover: () => void; add: (resource: NewsletterResource) => void; busy: string }) {
  return <section className="space-y-6"><div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]"><div className="brand-card p-6 sm:p-8"><SectionHeading eyebrow="Manual submission" title="Bring your own source" copy="Paste a link and generate a short page summary for review." /><div className="mt-6 space-y-4"><Field label="Article URL" value={manualUrl} onChange={setManualUrl} placeholder="https://example.com/article" type="url" /><Field label="Optional title" value={manualTitle} onChange={setManualTitle} placeholder="Use the page title" /><button type="button" className="cta-primary w-full" onClick={previewManual} disabled={busy === 'manual'}><LinkIcon className="h-5 w-5" aria-hidden="true" /> {busy === 'manual' ? 'Reading link...' : 'Generate source summary'}</button>{manualResource ? <ResourceCard resource={manualResource} sessions={sessions} selectedSessionId={selectedSessionId} select={select} add={add} busy={busy} /> : null}</div></div><div className="brand-card p-6 sm:p-8"><SectionHeading eyebrow="AI research" title="Find relevant articles" copy="Gemini searches current resources using the selected session topic and saved audience." /><button type="button" className="cta-secondary mt-6" onClick={discover} disabled={busy === 'discover'}><SparklesIcon className="h-5 w-5" aria-hidden="true" /> {busy === 'discover' ? 'Searching with AI...' : 'Find relevant articles'}</button></div></div><div className="space-y-3">{candidates.length ? candidates.map((resource) => <ResourceCard key={resource.id} resource={resource} sessions={sessions} selectedSessionId={selectedSessionId} select={select} add={add} busy={busy} />) : <Empty title="Your research queue is clear" copy="Use AI research or add a source manually." />}</div></section>;
}

function ResourceCard({ resource, sessions, selectedSessionId, select, add, busy }: { resource: NewsletterResource; sessions: NewsletterSession[]; selectedSessionId: string; select: (id: string) => void; add: (resource: NewsletterResource) => void; busy: string }) { return <article className="rounded-2xl border border-[#0B353B]/10 bg-white p-5"><p className="text-xs font-bold uppercase tracking-[0.12em] text-[#4A5C5F]">{resource.source} · {resource.addedBy === 'ai' ? 'Found with AI' : 'Manual'}</p><h3 className="mt-2 text-lg font-semibold">{resource.title}</h3><p className="mt-2 text-sm leading-6 text-[#4A5C5F]">{resource.description}</p><a href={resource.url} target="_blank" rel="noreferrer" className="mt-3 block truncate text-xs font-semibold text-[#0B353B]">{resource.url}</a><div className="mt-4 flex flex-wrap gap-2"><select value={selectedSessionId} onChange={(event) => select(event.target.value)} className="input max-w-xs text-xs"><option value="">Choose session</option>{sessions.map((session) => <option key={session.id} value={session.id}>{session.title}</option>)}</select><button type="button" onClick={() => add(resource)} disabled={!selectedSessionId || busy === resource.id} className="cta-primary text-sm disabled:opacity-50"><PlusIcon className="h-4 w-4" aria-hidden="true" /> Add to session</button></div></article>; }

function NewsletterTab({ draft, preview, setPreview, generate, busy }: { draft: NewsletterDraft | null; preview: 'preview' | 'html' | 'text'; setPreview: (value: 'preview' | 'html' | 'text') => void; generate: () => void; busy: string }) { return <section className="rounded-[24px] border border-[#0B353B]/10 bg-white p-4 shadow-[0_18px_40px_rgba(12,31,35,0.06)] sm:p-6"><div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#0B353B]/10 pb-4"><div><p className="eyebrow">Single email layout</p><h2 className="mt-3 text-2xl font-semibold">Review and approve</h2><p className="mt-1 text-sm text-[#4A5C5F]">The saved brand and selected session articles are used automatically.</p></div><div className="flex flex-wrap gap-2"><button type="button" onClick={generate} disabled={busy === 'generate'} className="cta-primary"><SparklesIcon className="h-5 w-5" aria-hidden="true" /> {busy === 'generate' ? 'Building...' : draft ? 'Regenerate' : 'Generate newsletter'}</button>{draft ? <button type="button" onClick={() => downloadFile('newsletter.html', draft.html, 'text/html')} className="cta-secondary"><ArrowDownTrayIcon className="h-5 w-5" aria-hidden="true" /> HTML</button> : null}</div></div>{draft ? <><div className="mt-5 flex flex-wrap gap-2"><PreviewTab active={preview === 'preview'} onClick={() => setPreview('preview')} icon={<EyeIcon className="h-4 w-4" aria-hidden="true" />}>Preview</PreviewTab><PreviewTab active={preview === 'html'} onClick={() => setPreview('html')} icon={<ClipboardDocumentIcon className="h-4 w-4" aria-hidden="true" />}>HTML</PreviewTab><PreviewTab active={preview === 'text'} onClick={() => setPreview('text')} icon={<ClipboardDocumentIcon className="h-4 w-4" aria-hidden="true" />}>Plain text</PreviewTab></div><div className="mt-5 rounded-2xl bg-[#F3F7F6] p-4"><p className="text-xs font-bold uppercase tracking-[0.12em] text-[#4A5C5F]">Subject options</p><div className="mt-3 grid gap-2 sm:grid-cols-3">{draft.subjectLines.map((subject) => <p key={subject} className="rounded-xl bg-white p-3 text-sm font-medium">{subject}</p>)}</div><p className="mt-4 text-sm text-[#4A5C5F]">{draft.resources?.length ?? 0} curated articles included.</p></div><div className="mt-5 overflow-hidden rounded-2xl border border-[#0B353B]/10 bg-[#F3F7F6]">{preview === 'preview' ? <iframe title="Newsletter preview" srcDoc={draft.html} className="h-[680px] w-full bg-[#F3F7F6]" sandbox="" /> : <pre className="max-h-[680px] overflow-auto whitespace-pre-wrap p-5 text-xs leading-6 text-[#0B353B]">{preview === 'html' ? draft.html : draft.plainText}</pre>}</div></> : <Empty title="No draft yet" copy="Select a session and generate the first send." />}</section>; }

function downloadFile(filename: string, content: string, type: string) { const blob = new Blob([content], { type }); const url = URL.createObjectURL(blob); const link = document.createElement('a'); link.href = url; link.download = filename; link.click(); URL.revokeObjectURL(url); }
function SectionHeading({ eyebrow, title, copy }: { eyebrow: string; title: string; copy: string }) { return <div><p className="text-xs font-bold uppercase tracking-[0.14em] text-[#4A5C5F]">{eyebrow}</p><h2 className="mt-2 text-2xl font-semibold tracking-[-0.04em]">{title}</h2><p className="mt-2 max-w-xl text-sm leading-6 text-[#4A5C5F]">{copy}</p></div>; }
function Field({ label, value, onChange, placeholder, type = 'text' }: { label: string; value: string; onChange: (value: string) => void; placeholder: string; type?: string }) { return <label className="block"><span className="mb-2 block text-sm font-medium">{label}</span><input type={type} value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} className="input" /></label>; }
function ColorField({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) { return <label className="block"><span className="mb-2 block text-sm font-medium capitalize">{label}</span><span className="flex items-center gap-2 rounded-xl border border-[#0B353B]/12 bg-[#FAFAF9] p-2"><input type="color" value={value} onChange={(event) => onChange(event.target.value)} className="h-8 w-8 cursor-pointer rounded-lg border-0 bg-transparent" /><input value={value} onChange={(event) => onChange(event.target.value)} className="min-w-0 w-full bg-transparent text-sm uppercase outline-none" /></span></label>; }
function PreviewTab({ active, onClick, icon, children }: { active: boolean; onClick: () => void; icon: React.ReactNode; children: React.ReactNode }) { return <button type="button" onClick={onClick} className={`inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm font-semibold ${active ? 'bg-[#0B353B] text-white' : 'bg-[#F3F7F6] text-[#4A5C5F]'}`}>{icon}{children}</button>; }
function Empty({ title, copy }: { title: string; copy: string }) { return <div className="flex min-h-48 items-center justify-center rounded-2xl border border-dashed border-[#0B353B]/15 p-8 text-center"><div><CheckCircleIcon className="mx-auto h-8 w-8 text-[#0B353B]/30" aria-hidden="true" /><h3 className="mt-3 font-semibold">{title}</h3><p className="mt-1 text-sm text-[#4A5C5F]">{copy}</p></div></div>; }