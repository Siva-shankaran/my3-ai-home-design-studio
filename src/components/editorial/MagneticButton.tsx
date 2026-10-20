import React, { useRef, useEffect } from 'react';
import gsap from 'gsap';

interface MagneticButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  strength?: number; // Distance pull strength (default 0.35)
  className?: string;
}

export const MagneticButton: React.FC<MagneticButtonProps> = ({
  children,
  strength = 0.35,
  className = '',
  ...props
}) => {
  const btnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const el = btnRef.current;
    if (!el || typeof window === 'undefined') return;

    // Only enable magnetic effect on fine pointers (desktop mouse)
    const isFinePointer = window.matchMedia('(pointer: fine)').matches;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!isFinePointer || prefersReducedMotion) return;

    const onMouseMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      const relX = e.clientX - (rect.left + rect.width / 2);
      const relY = e.clientY - (rect.top + rect.height / 2);

      gsap.to(el, {
        x: relX * strength,
        y: relY * strength,
        duration: 0.3,
        ease: 'power2.out'
      });
    };

    const onMouseLeave = () => {
      gsap.to(el, {
        x: 0,
        y: 0,
        duration: 0.5,
        ease: 'elastic.out(1, 0.4)'
      });
    };

    el.addEventListener('mousemove', onMouseMove);
    el.addEventListener('mouseleave', onMouseLeave);

    return () => {
      el.removeEventListener('mousemove', onMouseMove);
      el.removeEventListener('mouseleave', onMouseLeave);
      gsap.killTweensOf(el);
    };
  }, [strength]);

  return (
    <button
      ref={btnRef}
      className={`relative inline-flex items-center justify-center transition-colors focus-visible:outline-2 focus-visible:outline-[var(--color-accent)] ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};
