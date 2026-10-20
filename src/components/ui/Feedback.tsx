import {
  ArrowPathIcon,
  CheckIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';

type IconType = typeof CheckIcon;

export type Tone = 'success' | 'error' | 'warning' | 'info' | 'loading';

const tones: Record<Tone, { bg: string; fg: string; Icon: IconType }> = {
  success: { bg: 'var(--color-success-bg)', fg: 'var(--color-success)', Icon: CheckIcon },
  error: { bg: 'var(--color-danger-bg)', fg: 'var(--color-danger)', Icon: XMarkIcon },
  warning: { bg: 'var(--color-warning-bg)', fg: 'var(--color-warning)', Icon: ExclamationTriangleIcon },
  info: { bg: 'var(--color-info-bg)', fg: 'var(--color-info)', Icon: InformationCircleIcon },
  loading: { bg: 'var(--color-surface-raised)', fg: 'var(--color-ink)', Icon: ArrowPathIcon },
};

/** Round icon that carries a status on its own. Pair with a short label when space allows. */
export function StatusIcon({ tone, size = 'md' }: { tone: Tone; size?: 'sm' | 'md' | 'lg' }) {
  const { bg, fg, Icon } = tones[tone];
  const box = size === 'lg' ? 'h-20 w-20' : size === 'md' ? 'h-10 w-10' : 'h-7 w-7';
  const glyph = size === 'lg' ? 'h-10 w-10' : size === 'md' ? 'h-5 w-5' : 'h-4 w-4';
  return (
    <span
      className={`pop-in inline-flex shrink-0 items-center justify-center rounded-full ${box}`}
      style={{ backgroundColor: bg, color: fg }}
      role="img"
      aria-label={tone}
    >
      <Icon className={`${glyph} ${tone === 'loading' ? 'spin' : ''}`} aria-hidden="true" />
    </span>
  );
}

/** Inline status row: an icon plus a few words. Shown next to forms and actions. */
export function Feedback({ tone, label, className = '' }: { tone: Tone; label?: string; className?: string }) {
  const role = tone === 'error' ? 'alert' : 'status';
  return (
    <div role={role} className={`flex items-center gap-3 rounded-2xl px-3 py-2.5 ${className}`} style={{ backgroundColor: tones[tone].bg }}>
      <StatusIcon tone={tone} size="sm" />
      {label ? <span className="text-sm font-semibold" style={{ color: tones[tone].fg }}>{label}</span> : null}
    </div>
  );
}
