import React, { useState, useEffect } from 'react';
import { ArrowUp } from 'lucide-react';

/**
 * BackToTopButton
 * Smoothly scrolls the window to top when clicked.
 * Becomes visible after scrolling past 300px or reaching near the bottom of the page.
 */
export default function BackToTopButton() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY || document.documentElement.scrollTop;
      // Show when scrolled down more than 350px
      if (scrollY > 350) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  return (
    <button
      type="button"
      onClick={scrollToTop}
      aria-label="Back to top"
      title="Scroll back to top"
      className={`fixed bottom-6 right-6 z-40 p-3 rounded-full bg-brand-navy hover:bg-brand-navyDark text-brand-gold border-2 border-brand-gold/80 shadow-2xl transition-all duration-300 transform flex items-center justify-center group focus:outline-none focus:ring-2 focus:ring-brand-gold focus:ring-offset-2 ${
        isVisible
          ? 'opacity-100 translate-y-0 pointer-events-auto scale-100'
          : 'opacity-0 translate-y-6 pointer-events-none scale-75'
      }`}
    >
      <ArrowUp className="w-5 h-5 transition-transform duration-200 group-hover:-translate-y-1" />
      <span className="sr-only">Back to top</span>
    </button>
  );
}
