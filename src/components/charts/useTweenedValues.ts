'use client';

import { useEffect, useRef, useState } from 'react';
import { gsap } from '@/components/motion/gsap';

/**
 * Animates a list of numbers from their previous values to `target` with GSAP.
 * New items start from zero. With reduced motion the values jump straight to the target.
 */
export function useTweenedValues(target: number[], duration = 1) {
  const signature = target.join(',');
  const [values, setValues] = useState<number[]>(() => target.map(() => 0));
  const current = useRef<number[]>(values);

  useEffect(() => {
    const next = signature ? signature.split(',').map(Number) : [];
    const from = next.map((_, index) => current.current[index] ?? 0);
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const progress = { t: 0 };
    const tween = gsap.to(progress, {
      t: 1,
      duration: reduced ? 0 : duration,
      ease: 'power3.out',
      onUpdate: () => {
        const frame = next.map((value, index) => from[index] + (value - from[index]) * progress.t);
        current.current = frame;
        setValues(frame);
      },
    });
    return () => {
      tween.kill();
    };
  }, [signature, duration]);

  return values;
}
