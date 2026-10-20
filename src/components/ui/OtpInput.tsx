'use client';

import { useRef, type ClipboardEvent, type KeyboardEvent } from 'react';

/** Six separate digit boxes. Handles typing, backspace, arrow keys, and pasting a full code. */
export default function OtpInput({
  value,
  onChange,
  disabled = false,
  invalid = false,
  label,
  autoFocus = false,
}: {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  invalid?: boolean;
  label: string;
  autoFocus?: boolean;
}) {
  const refs = useRef<(HTMLInputElement | null)[]>([]);
  const digits = Array.from({ length: 6 }, (_, index) => value[index] ?? '');

  const focusAt = (index: number) => refs.current[Math.max(0, Math.min(5, index))]?.focus();

  const setDigit = (index: number, digit: string) => {
    const next = digits.map((current, position) => (position === index ? digit : current)).join('').slice(0, 6);
    onChange(next.replace(/\s/g, ''));
  };

  const handleChange = (index: number, raw: string) => {
    const cleaned = raw.replace(/\D/g, '');
    if (!cleaned) return;
    if (cleaned.length > 1) {
      onChange(cleaned.slice(0, 6));
      focusAt(Math.min(cleaned.length, 5));
      return;
    }
    setDigit(index, cleaned);
    focusAt(index + 1);
  };

  const handleKey = (index: number, event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Backspace' && !digits[index] && index > 0) {
      event.preventDefault();
      setDigit(index - 1, '');
      focusAt(index - 1);
    } else if (event.key === 'ArrowLeft') {
      focusAt(index - 1);
    } else if (event.key === 'ArrowRight') {
      focusAt(index + 1);
    }
  };

  const handlePaste = (event: ClipboardEvent<HTMLInputElement>) => {
    const pasted = event.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!pasted) return;
    event.preventDefault();
    onChange(pasted);
    focusAt(Math.min(pasted.length, 5));
  };

  return (
    <div role="group" aria-label={label} className={`flex justify-between gap-2 sm:gap-3 ${invalid ? 'shake' : ''}`}>
      {digits.map((digit, index) => (
        <input
          key={index}
          ref={(element) => { refs.current[index] = element; }}
          inputMode="numeric"
          autoComplete={index === 0 ? 'one-time-code' : 'off'}
          aria-label={`Digit ${index + 1}`}
          maxLength={1}
          value={digit}
          disabled={disabled}
          autoFocus={autoFocus && index === 0}
          onChange={(event) => handleChange(index, event.target.value)}
          onKeyDown={(event) => handleKey(index, event)}
          onPaste={handlePaste}
          onFocus={(event) => event.target.select()}
          aria-invalid={invalid || undefined}
          className={`h-14 w-full min-w-0 max-w-[3.25rem] rounded-2xl border-2 bg-[var(--color-surface)] text-center font-mono text-2xl font-bold text-[var(--color-ink)] outline-none transition-all duration-200 focus:border-[var(--color-ink)] focus:shadow-[var(--ring)] disabled:bg-[var(--color-bg-subtle)] ${
            invalid ? 'border-[var(--color-danger)]' : digit ? 'border-[var(--color-ink)]' : 'border-[var(--color-border-strong)]'
          }`}
        />
      ))}
    </div>
  );
}
