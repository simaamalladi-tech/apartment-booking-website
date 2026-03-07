import { useEffect } from 'react';

/**
 * Observes elements with scroll-animation classes and adds 'visible' 
 * class when they enter the viewport. Elements already in the viewport
 * are made visible immediately (no animation delay).
 */
export default function useScrollAnimation() {
  useEffect(() => {
    const selectors = '.fade-in-up, .fade-in-left, .fade-in-right, .fade-in-scale, .stagger-children';

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

    // Use requestAnimationFrame to ensure DOM is painted
    requestAnimationFrame(() => {
      const elements = document.querySelectorAll(selectors);
      elements.forEach((el) => {
        const rect = el.getBoundingClientRect();
        // Elements already in or above the viewport: show immediately
        if (rect.top < window.innerHeight + 50) {
          el.classList.add('visible');
        } else {
          // Only observe elements below the fold for scroll animation
          observer.observe(el);
        }
      });
    });

    return () => {
      observer.disconnect();
    };
  }, []);
}
