import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';

export const CustomCursor: React.FC = () => {
  const cursorRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);
  const [cursorText, setCursorText] = useState<string>('');
  const [isVisible, setIsVisible] = useState<boolean>(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Strict pointer fine check (desktop only, no touch devices)
    const isFinePointer = window.matchMedia('(pointer: fine)').matches;
    if (!isFinePointer) return;

    const cursor = cursorRef.current;
    if (!cursor) return;

    const pos = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    const mouse = { x: pos.x, y: pos.y };

    // Move cursor with smooth GSAP lag
    const xSet = gsap.quickSetter(cursor, 'x', 'px');
    const ySet = gsap.quickSetter(cursor, 'y', 'px');

    const handleMouseMove = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      if (!isVisible) setIsVisible(true);

      // Check hovered element for cursor directives
      const target = e.target as HTMLElement | null;
      const hoverDirective = target?.closest('[data-cursor]')?.getAttribute('data-cursor');

      if (hoverDirective) {
        setCursorText(hoverDirective.toUpperCase());
        gsap.to(cursor, {
          width: 64,
          height: 64,
          backgroundColor: '#C4552D',
          opacity: 0.95,
          duration: 0.25,
          ease: 'power2.out'
        });
      } else if (target?.tagName === 'IMG' || target?.closest('.editorial-card')) {
        setCursorText('VIEW');
        gsap.to(cursor, {
          width: 56,
          height: 56,
          backgroundColor: '#161513',
          opacity: 0.9,
          duration: 0.25,
          ease: 'power2.out'
        });
      } else {
        setCursorText('');
        gsap.to(cursor, {
          width: 10,
          height: 10,
          backgroundColor: '#C4552D',
          opacity: 0.7,
          duration: 0.2,
          ease: 'power2.out'
        });
      }
    };

    const handleMouseLeave = () => {
      setIsVisible(false);
    };

    window.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseleave', handleMouseLeave);

    const tickerCallback = () => {
      pos.x += (mouse.x - pos.x) * 0.2;
      pos.y += (mouse.y - pos.y) * 0.2;
      xSet(pos.x);
      ySet(pos.y);
    };

    gsap.ticker.add(tickerCallback);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
      gsap.ticker.remove(tickerCallback);
    };
  }, [isVisible]);

  return (
    <div
      ref={cursorRef}
      className={`fixed top-0 left-0 -translate-x-1/2 -translate-y-1/2 rounded-full pointer-events-none z-50 flex items-center justify-center text-white transition-opacity duration-200 select-none ${
        isVisible ? 'opacity-100' : 'opacity-0'
      }`}
      style={{
        width: 10,
        height: 10,
        backgroundColor: '#C4552D',
        willChange: 'transform'
      }}
    >
      <span
        ref={textRef}
        className="font-mono text-[9px] font-bold tracking-widest uppercase pointer-events-none"
      >
        {cursorText}
      </span>
    </div>
  );
};
