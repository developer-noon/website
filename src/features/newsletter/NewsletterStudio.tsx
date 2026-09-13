'use client';

import {
  ArrowDownTrayIcon,
  ArrowPathIcon,
  CheckCircleIcon,
  ClipboardDocumentIcon,
  CodeBracketIcon,
  EyeIcon,
  PaperAirplaneIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';
import { useState } from 'react';
import type { NewsletterBrief, NewsletterDraft, NewsletterStyle, NewsletterTone } from './types';

const styleOptions: Array<{ value: NewsletterStyle; label: string; action: string; description: string }> = [
  { value: 'minimal-editorial', label: 'High-End Minimal & Editorial', action: 'Go Premium & Clean', description: 'Quiet type, generous space, and a polished magazine feel.' },
  { value: 'neo-brutalism', label: 'Brutalism & Neo-Brutalism', action: 'Make It Loud & Edgy', description: 'Hard edges, loud contrast, and an unapologetic CTA.' },
  { value: 'dark-cyberpunk', label: 'Dark Mode & Cyberpunk', action: 'Switch to Dark Tech', description: 'Dark surfaces with electric contrast for technical brands.' },
  { value: 'swiss-bauhaus', label: 'Swiss Design / Bauhaus', action: 'Keep It Bold & Structured', description: 'Grid discipline, clear hierarchy, and functional color.' },
  { value: 'kinetic', label: 'Kinetic & Interactive Style', action: 'Add Modern Motion', description: 'Energetic color and modular rhythm for a dynamic read.' },
  { value: 'frosted-glass', label: 'Glassmorphism / Frosted Neo-Glass', action: 'Add Soft Depth', description: 'Translucent-feeling surfaces with calm modern contrast.' },
  { value: 'retro-y2k', label: 'Retro-Futurism / Y2K Minimal', action: 'Bring Back the Future', description: 'Playful digital nostalgia without losing structure.' },
  { value: 'organic-earthy', label: 'Organic / Earthy Minimal', action: 'Warm It Up', description: 'Natural tones and editorial warmth for human brands.' },
];

const toneOptions: Array<{ value: NewsletterTone; label: string; description: string }> = [
  { value: 'professional', label: 'Professional', description: 'Polished, credible, and composed.' },
  { value: 'friendly', label: 'Friendly', description: 'Helpful, open, and easy to trust.' },
  { value: 'conversational', label: 'Conversational', description: 'Natural, direct, and personal.' },
  { value: 'bold', label: 'Bold', description: 'Clear opinions and energetic momentum.' },
  { value: 'warm', label: 'Warm', description: 'Thoughtful, human, and encouraging.' },
  { value: 'concise', label: 'Concise', description: 'Tight language with no wasted words.' },
];

const fontOptions = [
  { value: 'Arial, Helvetica, sans-serif', label: 'Modern Sans' },
  { value: 'Georgia, Times New Roman, serif', label: 'Editorial Serif' },
  { value: 'Verdana, Geneva, sans-serif', label: 'Humanist Sans' },
  { value: 'Trebuchet MS, Arial, sans-serif', label: 'Friendly Grotesk' },
  { value: 'Courier New, Courier, monospace', label: 'Technical Mono' },
];

const initialBrief: NewsletterBrief = {
  businessName: '',
  audience: '',
  voice: 'clear, helpful, and confident',
  tone: 'professional',
  topic: '',
  keyMessages: '',
  offer: '',
  offerUrl: '',
  socialProof: '',
  callToAction: 'Explore the offer',
  primaryColor: '#0B353B',
  secondaryColor: '#4A5C5F',
  accentColor: '#ABFFAE',
  backgroundColor: '#F3F7F6',
  surfaceColor: '#FFFFFF',
  textColor: '#0B353B',
  mutedColor: '#4A5C5F',
  textOnPrimaryColor: '#FFFFFF',
  textOnAccentColor: '#0B353B',
  borderColor: '#DCE7E5',
  logoUrl: '',
  websiteUrl: '',
  brandTagline: '',
  footerNote: '',
  fontFamily: 'Arial, Helvetica, sans-serif',
  style: 'minimal-editorial',
};

function downloadFile(filename: string, content: string, type: string) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export default function NewsletterStudio() {
  const [brief, setBrief] = useState(initialBrief);
  const [draft, setDraft] = useState<NewsletterDraft | null>(null);
  const [activePreview, setActivePreview] = useState<'preview' | 'html' | 'text'>('preview');
  const [isGenerating, setIsGenerating] = useState(false);
  const [notice, setNotice] = useState('');

  const updateBrief = (field: keyof NewsletterBrief, value: string) => {
    setBrief((current) => ({ ...current, [field]: value }));
  };

  const generate = async () => {
    setIsGenerating(true);
    setNotice('');
    try {
      const response = await fetch('/api/newsletter/generate/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...brief, refreshSeed: crypto.randomUUID() }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error ?? 'Generation failed.');
      setDraft(payload.draft);
      setNotice(`${payload.provider === 'gemini' ? 'Gemini draft' : 'Draft'} generated and ready for review.`);
    } catch (error) {
      setNotice(error instanceof Error ? error.message : 'Generation failed.');
    } finally {
      setIsGenerating(false);
    }
  };

  const approve = () => {
    if (!draft) return;
    setDraft({ ...draft, status: 'approved' });
    setNotice('Newsletter approved for export.');
  };

  const copy = async (value: string) => {
    await navigator.clipboard.writeText(value);
    setNotice('Copied to clipboard.');
  };

  return (
    <div className="mx-auto max-w-[1440px] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8 flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
        <div>
          <p className="eyebrow"><SparklesIcon className="h-4 w-4" aria-hidden="true" /> Newsletter studio</p>
          <h1 className="mt-4 text-4xl font-semibold tracking-[-0.07em] text-[#0B353B] sm:text-5xl">Build this week’s send.</h1>
          <p className="mt-3 max-w-2xl text-[#4A5C5F]">Shape the brief, generate a first draft, then review the email before it leaves the studio.</p>
        </div>
        {notice ? <p className="max-w-sm text-sm font-medium text-[#0B353B]">{notice}</p> : null}
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(320px,0.78fr)_minmax(0,1.22fr)]">
        <section className="brand-card p-6 sm:p-8">
          <div className="flex items-center justify-between gap-4">
            <div><h2 className="text-xl font-semibold">Weekly brief</h2><p className="mt-1 text-sm text-[#4A5C5F]">Required context first.</p></div>
            <span className="rounded-full bg-[#F3F7F6] px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-[#4A5C5F]">MVP</span>
          </div>
          <div className="mt-6 space-y-4">
            <div className="rounded-2xl border border-[#0B353B]/10 bg-[#F3F7F6] p-4">
              <div className="flex items-start justify-between gap-3"><div><p className="text-sm font-semibold">Visual direction</p><p className="mt-1 text-xs text-[#4A5C5F]">{styleOptions.find((option) => option.value === brief.style)?.action}</p></div><SparklesIcon className="h-5 w-5 text-[#0B353B]" aria-hidden="true" /></div>
              <select value={brief.style} onChange={(event) => updateBrief('style', event.target.value as NewsletterStyle)} className="mt-3 w-full rounded-xl border border-[#0B353B]/12 bg-white px-3.5 py-3 text-sm font-medium outline-none focus:border-[#0B353B]/35 focus:ring-4 focus:ring-[#ABFFAE]/30">
                {styleOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
              </select>
              <p className="mt-2 text-xs leading-5 text-[#4A5C5F]">{styleOptions.find((option) => option.value === brief.style)?.description}</p>
            </div>
            <Field label="Business name" value={brief.businessName} onChange={(value) => updateBrief('businessName', value)} placeholder="Northstar Studio" />
            <Field label="Target audience" value={brief.audience} onChange={(value) => updateBrief('audience', value)} placeholder="Independent service businesses" />
            <Field label="Weekly topic" value={brief.topic} onChange={(value) => updateBrief('topic', value)} placeholder="How to make a homepage convert better" />
            <Field label="Brand voice" value={brief.voice} onChange={(value) => updateBrief('voice', value)} placeholder="Warm, direct, practical" />
            <label className="block"><span className="mb-2 block text-sm font-medium">Writing tone</span><select value={brief.tone} onChange={(event) => updateBrief('tone', event.target.value as NewsletterTone)} className="w-full rounded-xl border border-[#0B353B]/12 bg-[#FAFAF9] px-3.5 py-3 text-sm outline-none focus:border-[#0B353B]/35 focus:ring-4 focus:ring-[#ABFFAE]/30">{toneOptions.map((option) => <option key={option.value} value={option.value}>{option.label} · {option.description}</option>)}</select></label>
            <TextField label="Key messages" value={brief.keyMessages} onChange={(value) => updateBrief('keyMessages', value)} placeholder="One message per line" />
            <TextField label="Offer or product highlight" value={brief.offer} onChange={(value) => updateBrief('offer', value)} placeholder="A homepage clarity audit" />
            <Field label="Offer URL" value={brief.offerUrl} onChange={(value) => updateBrief('offerUrl', value)} placeholder="https://example.com/audit" type="url" />
            <TextField label="Social proof" value={brief.socialProof} onChange={(value) => updateBrief('socialProof', value)} placeholder="Customer quote or proof point" />
            <Field label="Call to action" value={brief.callToAction} onChange={(value) => updateBrief('callToAction', value)} placeholder="Book your audit" />
            <div className="border-t border-[#0B353B]/10 pt-5">
              <div className="mb-3"><p className="text-sm font-semibold">Brand kit</p><p className="mt-1 text-xs leading-5 text-[#4A5C5F]">Styles change layout and energy only. Every color in the email comes from this kit.</p></div>
              <div className="space-y-4">
                <Field label="Logo URL" value={brief.logoUrl} onChange={(value) => updateBrief('logoUrl', value)} placeholder="https://your-site.com/logo.png" type="url" />
                <Field label="Website URL" value={brief.websiteUrl} onChange={(value) => updateBrief('websiteUrl', value)} placeholder="https://your-site.com" type="url" />
                <Field label="Brand tagline" value={brief.brandTagline} onChange={(value) => updateBrief('brandTagline', value)} placeholder="Make better work feel simpler" />
                <TextField label="Footer note" value={brief.footerNote} onChange={(value) => updateBrief('footerNote', value)} placeholder="Your address, unsubscribe note, or legal footer" />
                <label className="block"><span className="mb-2 block text-sm font-medium">Email font</span><select value={brief.fontFamily} onChange={(event) => updateBrief('fontFamily', event.target.value)} className="w-full rounded-xl border border-[#0B353B]/12 bg-[#FAFAF9] px-3.5 py-3 text-sm outline-none focus:border-[#0B353B]/35 focus:ring-4 focus:ring-[#ABFFAE]/30">{fontOptions.map((font) => <option key={font.value} value={font.value}>{font.label}</option>)}</select></label>
                <div className="grid grid-cols-2 gap-4">
                  <ColorField label="Primary" value={brief.primaryColor} onChange={(value) => updateBrief('primaryColor', value)} />
                  <ColorField label="Secondary" value={brief.secondaryColor} onChange={(value) => updateBrief('secondaryColor', value)} />
                  <ColorField label="Accent" value={brief.accentColor} onChange={(value) => updateBrief('accentColor', value)} />
                  <ColorField label="Border" value={brief.borderColor} onChange={(value) => updateBrief('borderColor', value)} />
                  <ColorField label="Background" value={brief.backgroundColor} onChange={(value) => updateBrief('backgroundColor', value)} />
                  <ColorField label="Surface" value={brief.surfaceColor} onChange={(value) => updateBrief('surfaceColor', value)} />
                  <ColorField label="Text" value={brief.textColor} onChange={(value) => updateBrief('textColor', value)} />
                  <ColorField label="Muted text" value={brief.mutedColor} onChange={(value) => updateBrief('mutedColor', value)} />
                  <ColorField label="Text on primary" value={brief.textOnPrimaryColor} onChange={(value) => updateBrief('textOnPrimaryColor', value)} />
                  <ColorField label="Text on accent" value={brief.textOnAccentColor} onChange={(value) => updateBrief('textOnAccentColor', value)} />
                </div>
              </div>
            </div>
          </div>
          <button type="button" onClick={generate} disabled={isGenerating} className="cta-primary mt-6 w-full disabled:cursor-not-allowed disabled:opacity-60">
            <SparklesIcon className="h-5 w-5" aria-hidden="true" /> {isGenerating ? 'Building draft...' : 'Generate newsletter'}
          </button>
        </section>

        <section className="min-w-0 rounded-[24px] border border-[#0B353B]/10 bg-white p-4 shadow-[0_18px_40px_rgba(12,31,35,0.06)] sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#0B353B]/10 pb-4">
            <div><h2 className="text-xl font-semibold">Review workspace</h2><p className="mt-1 text-sm text-[#4A5C5F]">{draft ? `${draft.status === 'approved' ? 'Approved' : 'Draft'} · ${draft.subjectLines.length} subject lines` : 'Your generated email will appear here.'}</p></div>
            {draft ? <div className="flex flex-wrap gap-2"><button type="button" onClick={generate} disabled={isGenerating} title="Generate another version" className="inline-flex items-center gap-2 rounded-full border border-[#0B353B]/15 px-4 py-2 text-sm font-semibold disabled:opacity-60"><ArrowPathIcon className={`h-4 w-4 ${isGenerating ? 'animate-spin' : ''}`} aria-hidden="true" /> Refresh</button><button type="button" onClick={approve} disabled={draft.status === 'approved'} className="inline-flex items-center gap-2 rounded-full bg-[#ABFFAE] px-4 py-2 text-sm font-semibold text-[#0B353B] disabled:opacity-60"><CheckCircleIcon className="h-4 w-4" aria-hidden="true" /> {draft.status === 'approved' ? 'Approved' : 'Approve'}</button><button type="button" onClick={() => downloadFile('newsletter.html', draft.html, 'text/html')} className="inline-flex items-center gap-2 rounded-full border border-[#0B353B]/15 px-4 py-2 text-sm font-semibold"><ArrowDownTrayIcon className="h-4 w-4" aria-hidden="true" /> HTML</button></div> : null}
          </div>
          {draft ? <>
            <div className="mt-5 flex flex-wrap gap-2"><Tab active={activePreview === 'preview'} onClick={() => setActivePreview('preview')} icon={<EyeIcon className="h-4 w-4" aria-hidden="true" />}>Preview</Tab><Tab active={activePreview === 'html'} onClick={() => setActivePreview('html')} icon={<CodeBracketIcon className="h-4 w-4" aria-hidden="true" />}>HTML</Tab><Tab active={activePreview === 'text'} onClick={() => setActivePreview('text')} icon={<ClipboardDocumentIcon className="h-4 w-4" aria-hidden="true" />}>Plain text</Tab></div>
            <div className="mt-5 rounded-2xl bg-[#F3F7F6] p-4"><div className="flex flex-wrap gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-[#4A5C5F]"><span className="rounded-full bg-white px-3 py-1">{styleOptions.find((option) => option.value === draft.style)?.label}</span><span className="rounded-full bg-white px-3 py-1">{toneOptions.find((option) => option.value === draft.tone)?.label}</span></div><p className="mt-4 text-xs font-semibold uppercase tracking-[0.14em] text-[#4A5C5F]">Subject options</p><div className="mt-3 grid gap-2 sm:grid-cols-3">{draft.subjectLines.map((subject) => <p key={subject} className="rounded-xl bg-white p-3 text-sm font-medium">{subject}</p>)}</div><p className="mt-4 text-sm text-[#4A5C5F]"><strong className="text-[#0B353B]">Preview:</strong> {draft.previewText}</p></div>
            <div className="mt-5 overflow-hidden rounded-2xl border border-[#0B353B]/10 bg-[#F3F7F6]">
              {activePreview === 'preview' ? <iframe title="Newsletter preview" srcDoc={draft.html} className="h-[680px] w-full bg-[#F3F7F6]" sandbox="" /> : <div className="relative"><button type="button" onClick={() => copy(activePreview === 'html' ? draft.html : draft.plainText)} className="absolute right-3 top-3 inline-flex items-center gap-2 rounded-full bg-white px-3 py-2 text-xs font-semibold shadow-sm"><ClipboardDocumentIcon className="h-4 w-4" aria-hidden="true" /> Copy</button><pre className="max-h-[680px] overflow-auto whitespace-pre-wrap p-5 pt-16 text-xs leading-6 text-[#0B353B]">{activePreview === 'html' ? draft.html : draft.plainText}</pre></div>}
            </div>
          </> : <div className="flex min-h-[680px] items-center justify-center p-8 text-center text-sm text-[#4A5C5F]"><div><PaperAirplaneIcon className="mx-auto h-10 w-10 text-[#0B353B]/30" aria-hidden="true" /><p className="mt-4">Complete the brief to create a reviewable draft.</p></div></div>}
        </section>
      </div>
    </div>
  );
}

function Field({ label, value, onChange, placeholder, type = 'text' }: { label: string; value: string; onChange: (value: string) => void; placeholder: string; type?: string }) {
  return <label className="block"><span className="mb-2 block text-sm font-medium">{label}</span><input type={type} value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} className="w-full rounded-xl border border-[#0B353B]/12 bg-[#FAFAF9] px-3.5 py-3 text-sm outline-none transition focus:border-[#0B353B]/35 focus:ring-4 focus:ring-[#ABFFAE]/30" /></label>;
}

function TextField({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (value: string) => void; placeholder: string }) {
  return <label className="block"><span className="mb-2 block text-sm font-medium">{label}</span><textarea value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} rows={3} className="w-full resize-y rounded-xl border border-[#0B353B]/12 bg-[#FAFAF9] px-3.5 py-3 text-sm outline-none transition focus:border-[#0B353B]/35 focus:ring-4 focus:ring-[#ABFFAE]/30" /></label>;
}

function ColorField({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return <label className="block"><span className="mb-2 block text-sm font-medium">{label}</span><span className="flex items-center gap-2 rounded-xl border border-[#0B353B]/12 bg-[#FAFAF9] p-2"><input type="color" value={value} onChange={(event) => onChange(event.target.value)} className="h-8 w-8 cursor-pointer rounded-lg border-0 bg-transparent" /><input value={value} onChange={(event) => onChange(event.target.value)} className="min-w-0 w-full bg-transparent text-sm uppercase outline-none" /></span></label>;
}

function Tab({ active, onClick, icon, children }: { active: boolean; onClick: () => void; icon: React.ReactNode; children: React.ReactNode }) {
  return <button type="button" onClick={onClick} className={`inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm font-semibold ${active ? 'bg-[#0B353B] text-white' : 'bg-[#F3F7F6] text-[#4A5C5F]'}`}>{icon}{children}</button>;
}
