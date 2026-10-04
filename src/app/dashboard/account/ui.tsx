export function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <section className={`border border-[#e6ebf2] bg-white shadow-[0_8px_30px_rgba(15,23,42,0.04)] ${className}`}>{children}</section>;
}
