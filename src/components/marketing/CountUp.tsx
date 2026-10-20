'use client';

import { useEffect, useState } from 'react';

/** Counts from zero to `to` when it mounts. Reduced-motion users get a zero-length count, so the value lands at once. */
export default function CountUp({ to, decimals = 0, prefix = '', suffix = '', duration = 1600 }: { to: number; decimals?: number; prefix?: string; suffix?: string; duration?: number }) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    const length = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : duration;
    let frame = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const progress = length === 0 ? 1 : Math.min(1, (now - start) / length);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(to * eased);
      if (progress < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [to, duration]);

  return (
    <>
      {prefix}
      {value.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}
      {suffix}
    </>
  );
}
