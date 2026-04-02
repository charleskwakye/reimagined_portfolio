'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';

export default function ClientInteraction() {
  const initialized = useRef(false);
  const lastPathRef = useRef('');
  const pathname = usePathname();

  // Track route changes
  useEffect(() => {
    if (pathname && pathname !== lastPathRef.current) {
      // Update the last path reference
      if (lastPathRef.current) {
        // Route change detected, no logging needed anymore
      }
      lastPathRef.current = pathname;
    }
  }, [pathname]);

  // Add hover effects for cards and buttons
  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    // Add hover effects to content cards after hydration
    const cards = document.querySelectorAll('.bg-card');
    cards.forEach(card => {
      const cardElement = card as HTMLElement;
      cardElement.addEventListener('mouseenter', () => {
        cardElement.classList.add('shadow-md');
        cardElement.classList.add('border-primary/20');
        cardElement.style.transform = 'translateY(-2px)';
      });

      cardElement.addEventListener('mouseleave', () => {
        cardElement.classList.remove('shadow-md');
        cardElement.classList.remove('border-primary/20');
        cardElement.style.transform = 'translateY(0)';
      });
    });
  }, []);

  return null;
}
