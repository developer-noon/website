'use client';

/** Accessible on/off toggle. The knob slides and the track changes colour. */
export default function Switch({
  checked,
  onChange,
  label,
  disabled = false,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-8 w-14 shrink-0 items-center rounded-full border-2 transition-colors duration-300 disabled:cursor-not-allowed disabled:opacity-50 ${
        checked ? 'border-[var(--color-ink)] bg-[var(--color-primary)]' : 'border-[var(--color-border-strong)] bg-[var(--color-surface-raised)]'
      }`}
    >
      <span
        className={`inline-block h-5 w-5 rounded-full bg-[var(--color-ink)] shadow-sm transition-transform duration-300 ${checked ? 'translate-x-7' : 'translate-x-1'}`}
        aria-hidden="true"
      />
    </button>
  );
}
