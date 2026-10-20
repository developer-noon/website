import type { ReactNode } from 'react';

type Scene = 'clock' | 'team' | 'report' | 'lock' | 'mail' | 'check' | 'missing';

/* Flat illustrations drawn in the brand palette. Each one is decorative; the text beside it says what happened. */
function Illustration({ scene }: { scene: Scene }) {
  const ink = 'var(--color-ink)';
  const lime = 'var(--color-primary)';
  const mint = 'var(--color-mint)';
  const paper = 'var(--color-surface)';

  const scenes: Record<Scene, ReactNode> = {
    clock: (
      <>
        <circle cx="60" cy="60" r="40" fill={mint} />
        <circle cx="60" cy="60" r="28" fill={paper} stroke={ink} strokeWidth="4" />
        <path d="M60 42v18l12 8" fill="none" stroke={ink} strokeWidth="4" strokeLinecap="round" />
        <circle cx="92" cy="30" r="8" fill={lime} />
      </>
    ),
    team: (
      <>
        <circle cx="45" cy="50" r="14" fill={ink} />
        <path d="M22 96c0-16 10-26 23-26s23 10 23 26z" fill={ink} />
        <circle cx="78" cy="46" r="14" fill={lime} />
        <path d="M55 92c0-16 10-26 23-26s23 10 23 26z" fill={lime} />
      </>
    ),
    report: (
      <>
        <rect x="30" y="22" width="60" height="78" rx="10" fill={paper} stroke={ink} strokeWidth="4" />
        <rect x="42" y="42" width="36" height="6" rx="3" fill={lime} />
        <rect x="42" y="58" width="36" height="6" rx="3" fill={mint} />
        <rect x="42" y="74" width="22" height="6" rx="3" fill={mint} />
      </>
    ),
    lock: (
      <>
        <rect x="32" y="54" width="56" height="44" rx="12" fill={lime} stroke={ink} strokeWidth="4" />
        <path d="M42 54V42a18 18 0 0136 0v12" fill="none" stroke={ink} strokeWidth="5" strokeLinecap="round" />
        <circle cx="60" cy="74" r="6" fill={ink} />
      </>
    ),
    mail: (
      <>
        <rect x="22" y="36" width="76" height="52" rx="10" fill={paper} stroke={ink} strokeWidth="4" />
        <path d="M26 42l34 26 34-26" fill="none" stroke={ink} strokeWidth="4" strokeLinejoin="round" />
        <circle cx="92" cy="34" r="9" fill={lime} />
      </>
    ),
    check: (
      <>
        <circle cx="60" cy="60" r="38" fill={lime} />
        <path d="M42 62l12 12 24-26" fill="none" stroke={ink} strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" />
      </>
    ),
    missing: (
      <>
        <circle cx="60" cy="60" r="38" fill={mint} />
        <path d="M46 48l28 28M74 48L46 76" stroke={ink} strokeWidth="6" strokeLinecap="round" />
      </>
    ),
  };

  return (
    <svg viewBox="0 0 120 120" className="h-28 w-28" aria-hidden="true">
      {scenes[scene]}
    </svg>
  );
}

/** Centered illustration with a short heading and an optional action. */
export default function EmptyState({
  scene,
  title,
  text,
  action,
}: {
  scene: Scene;
  title: string;
  text?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center px-6 py-12 text-center">
      <div className="float">
        <Illustration scene={scene} />
      </div>
      <h3 className="mt-6">{title}</h3>
      {text ? <p className="mt-2 max-w-sm text-sm text-[var(--color-text-muted)]">{text}</p> : null}
      {action ? <div className="mt-6">{action}</div> : null}
    </div>
  );
}

export { Illustration };
