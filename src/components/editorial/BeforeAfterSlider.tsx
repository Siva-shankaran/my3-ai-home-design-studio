import React, { useState, useRef, useEffect, useCallback } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

interface BeforeAfterSliderProps {
  beforeImage: string;
  afterImage: string;
  beforeLabel?: string;
  afterLabel?: string;
  className?: string;
  enableScrollTrigger?: boolean;
}

export const BeforeAfterSlider: React.FC<BeforeAfterSliderProps> = ({
  beforeImage,
  afterImage,
  beforeLabel = 'ORIGINAL SPACE',
  afterLabel = 'AI ARCHITECTURAL REDESIGN',
  className = '',
  enableScrollTrigger = false
}) => {
  const [sliderPosition, setSliderPosition] = useState<number>(50); // 0 to 100 percentage
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const dividerRef = useRef<HTMLDivElement>(null);

  const updatePosition = useCallback((clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const clampedPct = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPosition(clampedPct);
  }, []);

  const handleMouseDown = () => setIsDragging(true);
  const handleTouchStart = () => setIsDragging(true);

  useEffect(() => {
    const handleMouseUp = () => setIsDragging(false);
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) updatePosition(e.clientX);
    };
    const handleTouchMove = (e: TouchEvent) => {
      if (isDragging && e.touches[0]) updatePosition(e.touches[0].clientX);
    };

    if (isDragging) {
      window.addEventListener('mouseup', handleMouseUp);
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('touchend', handleMouseUp);
      window.addEventListener('touchmove', handleTouchMove);
    }

    return () => {
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchend', handleMouseUp);
      window.removeEventListener('touchmove', handleTouchMove);
    };
  }, [isDragging, updatePosition]);

  // Optional ScrollTrigger link to scrub slider on scroll down
  useEffect(() => {
    if (!enableScrollTrigger || !containerRef.current) return;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: containerRef.current,
        start: 'top 75%',
        end: 'bottom 25%',
        scrub: 1,
        onUpdate: (self) => {
          if (!isDragging) {
            setSliderPosition(15 + self.progress * 70); // Scrub from 15% to 85%
          }
        }
      });
    }, containerRef);

    return () => ctx.revert();
  }, [enableScrollTrigger, isDragging]);

  return (
    <div
      ref={containerRef}
      className={`relative overflow-hidden select-none cursor-ew-resize rounded-[var(--radius-card)] border border-[var(--color-rule)] bg-[var(--color-paper-2)] ${className}`}
      data-cursor="drag"
    >
      {/* After Image (Background) */}
      <img
        src={afterImage}
        alt={afterLabel}
        className="w-full h-full object-cover pointer-events-none"
        loading="lazy"
      />

      {/* Before Image (Clipped Overlay) */}
      <div
        className="absolute inset-0 overflow-hidden pointer-events-none"
        style={{ width: `${sliderPosition}%` }}
      >
        <img
          src={beforeImage}
          alt={beforeLabel}
          className="absolute inset-0 w-full h-full object-cover pointer-events-none"
          style={{ width: containerRef.current ? `${containerRef.current.clientWidth}px` : '100vw', maxWidth: 'none' }}
          loading="lazy"
        />
      </div>

      {/* Hairline Divider & Handle */}
      <div
        ref={dividerRef}
        className="absolute top-0 bottom-0 z-20 pointer-events-none"
        style={{ left: `${sliderPosition}%`, transform: 'translateX(-50%)' }}
      >
        {/* 1px hairline line */}
        <div className="w-[1px] h-full bg-white/90 shadow-[0_0_8px_rgba(0,0,0,0.4)] mx-auto" />

        {/* Center terracotta badge button */}
        <div
          onMouseDown={handleMouseDown}
          onTouchStart={handleTouchStart}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-[var(--color-accent)] text-white flex items-center justify-center shadow-lg border border-white/60 pointer-events-auto cursor-ew-resize active:scale-95 transition-transform"
          title="Drag to compare"
        >
          <div className="flex items-center gap-0.5 text-[10px] font-mono font-bold tracking-tighter">
            <span>‹</span>
            <span>›</span>
          </div>
        </div>
      </div>

      {/* Editorial Labels */}
      <div className="absolute top-3 left-3 z-10 pointer-events-none">
        <span className="font-mono text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-[var(--color-dark)]/80 text-[var(--color-paper)] backdrop-blur-xs border border-white/10">
          {beforeLabel}
        </span>
      </div>

      <div className="absolute top-3 right-3 z-10 pointer-events-none">
        <span className="font-mono text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-[var(--color-accent)] text-white shadow-sm border border-white/20">
          {afterLabel}
        </span>
      </div>
    </div>
  );
};
