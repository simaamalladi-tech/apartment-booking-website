import { useEffect, useLayoutEffect } from 'react';

/**
 * Observes elements with scroll-animation classes and adds 'visible' 
 * class when they enter the viewport. Elements already in the viewport
 * are made visible immediately via useLayoutEffect (before browser paint)
 * to prevent any flash of invisible content.
 */
export default function useScrollAnimation() {
  const selectors = '.fade-in-up, .fade-in-left, .fade-in-right, .fade-in-scale, .stagger-children';

  // useLayoutEffect runs synchronously BEFORE the browser paints,
  // so in-viewport elements never flash invisible.
  useLayoutEffect(() => {
    const elements = document.querySelectorAll(selectors);
    elements.forEach((el) => {
      const rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight + 100) {
        el.classList.add('visible');
      }
    });
  });

  // useEffect sets up the IntersectionObserver for below-fold elements
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
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

    const elements = document.querySelectorAll(selectors);
    elements.forEach((el) => {
      if (!el.classList.contains('visible')) {
        observer.observe(el);
      }
    });

    return () => {
      observer.disconnect();
    };
  }, []);
}
