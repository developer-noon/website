'use client';

import { MoonIcon, SunIcon } from '@heroicons/react/24/outline';
import { useSyncExternalStore } from 'react';

type Theme = 'dark' | 'light';

function subscribe(onChange: () => void) {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
  return () => observer.disconnect();
}

function getTheme(): Theme {
  return document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light';
}

/** The server always renders light, which is the default theme. The client reads the saved choice. */
function getServerTheme(): Theme {
  return 'light';
}

export default function ThemeToggle() {
  const theme = useSyncExternalStore(subscribe, getTheme, getServerTheme);

  function toggle() {
    const next: Theme = theme === 'light' ? 'dark' : 'light';
    if (next === 'dark') document.documentElement.dataset.theme = 'dark';
    else delete document.documentElement.dataset.theme;
    try {
      localStorage.setItem('theme', next);
    } catch {
      // Storage can be blocked (private mode); the choice then lasts only for this page visit.
    }
  }

  const Icon = theme === 'light' ? MoonIcon : SunIcon;
  const label = theme === 'light' ? 'Switch to dark theme' : 'Switch to light theme';

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={label}
      title={label}
      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[var(--color-border-strong)] text-[var(--color-ink)] transition-colors hover:border-[var(--color-primary)]"
    >
      <Icon className="h-5 w-5" aria-hidden="true" />
    </button>
  );
}
