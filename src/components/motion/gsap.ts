'use client';

import { useEffect, useLayoutEffect, type RefObject } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

export const MOTION_OK = '(prefers-reduced-motion: no-preference)';
export const MOTION_OK_WIDE = '(prefers-reduced-motion: no-preference) and (min-width: 768px)';

/**
 * Runs a scroll animation setup scoped to `scope`, only when `query` matches.
 * While it runs, the root gets `data-motion="on"`, so CSS can switch from the static
 * fallback layout (reduced motion, no JS, small screens) to the animated one.
 * Everything GSAP created is reverted on unmount or when the media query stops matching.
 *
 * Pass a module-level `setup` function so the effect runs once.
 */
export function useScrollMotion(
  scope: RefObject<HTMLElement | null>,
  setup: (root: HTMLElement) => void | (() => void),
  query: string = MOTION_OK,
) {
  useIsomorphicLayoutEffect(() => {
    const root = scope.current;
    if (!root) return;
    const media = gsap.matchMedia(root);
    media.add(query, () => {
      root.dataset.motion = 'on';
      const cleanup = setup(root);
      return () => {
        cleanup?.();
        delete root.dataset.motion;
      };
    });
    return () => media.revert();
  }, [scope, setup, query]);
}

export { gsap, ScrollTrigger };
