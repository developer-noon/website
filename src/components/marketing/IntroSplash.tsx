/**
 * Brand intro shown once per browser session, before the homepage. It is pure CSS:
 * the inline script in the root layout marks repeat visits, and reduced-motion users skip it.
 */
export default function IntroSplash() {
  return (
    <div className="intro-splash fixed inset-0 z-[100] flex flex-col items-center justify-center gap-8 bg-[var(--color-forest)]" aria-hidden="true">
      <svg viewBox="0 0 64 64" className="h-28 w-28">
        <rect width="64" height="64" rx="18" fill="var(--color-forest)" stroke="var(--color-primary)" strokeOpacity="0.25" strokeWidth="1" />
        <g fill="none" stroke="var(--color-primary)" strokeWidth="5" strokeLinejoin="round" strokeLinecap="round">
          <path className="intro-stroke" pathLength="100" style={{ animationDelay: '0.2s' }} d="M10 14V50H22A18 18 0 0 0 22 14Z" />
          <path className="intro-stroke" pathLength="100" style={{ animationDelay: '0.7s' }} d="M24 14V50H36A18 18 0 0 0 36 14Z" />
        </g>
      </svg>
      <span className="intro-word font-display text-2xl text-[var(--color-primary)]">Deeds n Doings</span>
    </div>
  );
}
