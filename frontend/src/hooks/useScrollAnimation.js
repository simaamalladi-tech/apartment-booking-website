import { useEffect, useLayoutEffect } from 'react';

/**
 * Scroll animation hook - progressive enhancement approach.
 * Elements are VISIBLE by default (no opacity:0 in CSS).
 * JS only hides below-fold elements, then animates them in on scroll.
 * This guarantees content is never blank even if JS has timing issues.
 */
export default function useScrollAnimation() {
  const selectors = '.fade-in-up, .fade-in-left, .fade-in-right, .fade-in-scale, .stagger-children';

  // Step 1: Before paint, hide ONLY below-fold elements
  useLayoutEffect(() => {
    const elements = document.querySelectorAll(selectors);
    elements.forEach((el) => {
      const rect = el.getBoundingClientRect();
      // Only hide elements that are clearly below the viewport
      if (rect.top > window.innerHeight) {
        el.classList.add('scroll-hidden');
      }
      // In-viewport elements: leave them visible (CSS default)
    });
  });

  // Step 2: Observe hidden elements and animate them in on scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.remove('scroll-hidden');
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.05,
        rootMargin: '50px 0px 0px 0px'
      }
    );

    // Only observe elements that were hidden
    const hiddenElements = document.querySelectorAll('.scroll-hidden');
    hiddenElements.forEach((el) => observer.observe(el));

    return () => {
      observer.disconnect();
    };
  }, []);
}
