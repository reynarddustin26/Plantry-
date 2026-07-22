'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

// Adds `.visible` to every `.fade-up` element once it scrolls into view.
// Re-runs on every route change (via usePathname) because app/layout.tsx
// does not remount on client-side navigation — a mount-only effect here
// would only ever see the elements present on the very first page load.
export function useScrollAnimation() {
  const pathname = usePathname();

  useEffect(() => {
    // Deferred a frame so the observer's very first callback (which fires
    // near-instantly for elements already in view, e.g. product cards above
    // the fold) never lands in the same tick as React/Next dev mode's
    // post-hydration diffing — that race otherwise gets misreported as a
    // hydration mismatch even though it's a normal post-mount DOM update.
    let cleanupObserver: (() => void) | undefined;

    const raf = requestAnimationFrame(() => {
      const elements = document.querySelectorAll<HTMLElement>('.fade-up:not(.visible)');
      if (elements.length === 0) return;

      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        elements.forEach((el) => el.classList.add('visible'));
        return;
      }

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add('visible');
              observer.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.15 },
      );

      elements.forEach((el) => observer.observe(el));
      cleanupObserver = () => observer.disconnect();
    });

    return () => {
      cancelAnimationFrame(raf);
      cleanupObserver?.();
    };
  }, [pathname]);
}
