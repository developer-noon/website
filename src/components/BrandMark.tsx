/** Deeds n Doings monogram: two interlocking D letters on a forest tile with lime strokes. */
export default function BrandMark({ className = 'h-10 w-10' }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
      <rect width="64" height="64" rx="18" fill="var(--color-forest)" />
      <g fill="none" stroke="var(--color-primary)" strokeWidth="5" strokeLinejoin="round" strokeLinecap="round">
        <path d="M10 14V50H22A18 18 0 0 0 22 14Z" />
        <path d="M24 14V50H36A18 18 0 0 0 36 14Z" />
      </g>
    </svg>
  );
}
