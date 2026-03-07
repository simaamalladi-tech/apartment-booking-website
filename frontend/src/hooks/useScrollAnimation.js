import { useEffect } from 'react';

/**
 * Observes elements with scroll-animation classes and adds 'visible' 
 * class when they enter the viewport. Call once on mount.
 */
export default function useScrollAnimation() {
  useEffect(() => {
    const selectors = '.fade-in-up, .fade-in-left, .fade-in-right, .fade-in-scale, .stagger-children';

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target); // animate only once
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: '0px 0px -40px 0px'
      }
    );

    // Small delay so DOM is painted before observing
    const timer = setTimeout(() => {
      document.querySelectorAll(selectors).forEach((el) => {
        observer.observe(el);
      });
    }, 100);

    return () => {
      clearTimeout(timer);
      observer.disconnect();
    };
  }, []);
}
