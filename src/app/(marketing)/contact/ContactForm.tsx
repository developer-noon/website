'use client';

import { useState, type FormEvent } from 'react';
import { ArrowPathIcon, EnvelopeIcon } from '@heroicons/react/24/outline';
import { Feedback } from '@/components/ui/Feedback';
import EmptyState from '@/components/ui/EmptyState';

const field = 'field';

export default function ContactForm() {
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [error, setError] = useState('');

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries());
    setStatus('sending');
    setError('');
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const payload = await response.json().catch(() => ({})) as { error?: string };
      if (!response.ok) {
        setStatus('error');
        setError(payload.error ?? 'Could not send.');
        return;
      }
      setStatus('sent');
      form.reset();
    } catch {
      setStatus('error');
      setError('No connection.');
    }
  };

  if (status === 'sent') {
    return <EmptyState scene="mail" title="Message sent" text="We reply by email." action={<button type="button" onClick={() => setStatus('idle')} className="cta-secondary !py-3">Send another</button>} />;
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-5" noValidate>
      <div className="grid gap-5 sm:grid-cols-2">
        <label className="grid gap-2 text-sm font-bold text-[var(--color-ink)]">
          Name
          <input name="name" required maxLength={100} autoComplete="name" className={field} />
        </label>
        <label className="grid gap-2 text-sm font-bold text-[var(--color-ink)]">
          Email
          <input name="email" type="email" required maxLength={254} autoComplete="email" className={field} />
        </label>
      </div>
      <label className="grid gap-2 text-sm font-bold text-[var(--color-ink)]">
        Company
        <input name="company" maxLength={120} autoComplete="organization" className={field} />
      </label>
      <label className="grid gap-2 text-sm font-bold text-[var(--color-ink)]">
        Message
        <textarea name="message" required minLength={10} maxLength={3000} rows={5} className={`${field} resize-y`} />
      </label>

      {status === 'error' ? <Feedback tone="error" label={error} /> : null}

      <div>
        <button type="submit" disabled={status === 'sending'} className="cta-primary !py-4">
          {status === 'sending' ? <ArrowPathIcon className="h-5 w-5 spin" aria-hidden="true" /> : <EnvelopeIcon className="h-5 w-5" aria-hidden="true" />}
          Send
        </button>
      </div>
    </form>
  );
}
