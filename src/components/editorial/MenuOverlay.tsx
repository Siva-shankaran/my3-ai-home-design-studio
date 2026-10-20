import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { X, ArrowUpRight } from 'lucide-react';

interface MenuItem {
  number: string;
  title: string;
  category: string;
  action: () => void;
  previewImage: string;
}

interface MenuOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (view: 'landing' | 'dashboard' | 'editor2d' | 'studio3d') => void;
  onOpenConcepts?: () => void;
  onOpenInteriorRef?: () => void;
}

export const MenuOverlay: React.FC<MenuOverlayProps> = ({
  isOpen,
  onClose,
  onNavigate,
  onOpenConcepts,
  onOpenInteriorRef
}) => {
  const overlayRef = useRef<HTMLDivElement>(null);
  const linksContainerRef = useRef<HTMLDivElement>(null);
  const [activePreview, setActivePreview] = useState<string>(
    'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80'
  );

  const menuItems: MenuItem[] = [
    {
      number: '01',
      title: 'Architectural Studio',
      category: '2D Vector CAD & Space Planning',
      action: () => { onNavigate('editor2d'); onClose(); },
      previewImage: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80'
    },
    {
      number: '02',
      title: '3D Spatial Model',
      category: 'WebGL Dollhouse & Sunlight Walkthrough',
      action: () => { onNavigate('studio3d'); onClose(); },
      previewImage: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80'
    },
    {
      number: '03',
      title: 'Project Archive',
      category: 'All Blueprints & Saved Revisions',
      action: () => { onNavigate('dashboard'); onClose(); },
      previewImage: 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1200&q=80'
    },
    {
      number: '04',
      title: '3-Concept Synthesis',
      category: 'Deterministic Layout Generator',
      action: () => {
        onClose();
        if (onOpenConcepts) onOpenConcepts();
        else onNavigate('editor2d');
      },
      previewImage: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80'
    },
    {
      number: '05',
      title: 'Room Redesign & Staging',
      category: 'Bespoke Furniture & Architectural Transformations',
      action: () => { onNavigate('landing'); onClose(); },
      previewImage: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1200&q=80'
    },
    {
      number: '06',
      title: 'Materials & Moodboard',
      category: 'Oak, Honed Travertine & Lime-wash Finishes',
      action: () => {
        onClose();
        if (onOpenInteriorRef) onOpenInteriorRef();
        else onNavigate('editor2d');
      },
      previewImage: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=1200&q=80'
    }
  ];

  // Clip-path wipe animation
  useEffect(() => {
    const el = overlayRef.current;
    if (!el) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (isOpen) {
      document.body.style.overflow = 'hidden';

      if (prefersReducedMotion) {
        gsap.set(el, { display: 'flex', opacity: 1 });
      } else {
        gsap.set(el, { display: 'flex' });
        gsap.fromTo(
          el,
          { clipPath: 'polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%)' },
          { clipPath: 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)', duration: 0.65, ease: 'power4.inOut' }
        );

        if (linksContainerRef.current) {
          gsap.fromTo(
            linksContainerRef.current.querySelectorAll('.menu-item'),
            { opacity: 0, y: 30 },
            { opacity: 1, y: 0, duration: 0.5, stagger: 0.06, ease: 'power3.out', delay: 0.25 }
          );
        }
      }
    } else {
      document.body.style.overflow = '';
      if (!prefersReducedMotion) {
        gsap.to(el, {
          clipPath: 'polygon(0% 100%, 100% 100%, 100% 100%, 0% 100%)',
          duration: 0.45,
          ease: 'power3.in',
          onComplete: () => {
            gsap.set(el, { display: 'none' });
          }
        });
      } else {
        gsap.set(el, { display: 'none' });
      }
    }

    // Keyboard ESC listener
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  return (
    <div
      ref={overlayRef}
      role="dialog"
      aria-modal="true"
      aria-label="Site Navigation Menu"
      className="fixed inset-0 z-50 bg-[var(--color-dark)] text-[var(--color-paper)] flex-col justify-between p-6 sm:p-12 hidden select-none overflow-y-auto"
      style={{ willChange: 'clip-path' }}
    >
      {/* Top Header in Menu */}
      <div className="flex items-center justify-between border-b border-[#2E2B27] pb-5">
        <div className="flex items-center gap-2">
          <span className="font-serif text-lg tracking-tight font-medium text-white">MY3 DESIGNS</span>
          <span className="text-[10px] font-mono tracking-widest text-[var(--color-accent)] uppercase">
            // INDEX
          </span>
        </div>

        <button
          onClick={onClose}
          className="w-10 h-10 rounded border border-[#2E2B27] flex items-center justify-center text-[var(--color-muted)] hover:text-white hover:border-white transition cursor-pointer"
          aria-label="Close menu"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Main Links + Desktop Hover Preview Layout */}
      <div className="my-auto py-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Links Column */}
        <div ref={linksContainerRef} className="lg:col-span-7 flex flex-col space-y-4 sm:space-y-6">
          {menuItems.map((item) => (
            <div
              key={item.number}
              onClick={item.action}
              onMouseEnter={() => setActivePreview(item.previewImage)}
              className="menu-item group flex items-baseline gap-4 sm:gap-6 cursor-pointer border-b border-transparent hover:border-[#2E2B27] pb-2 transition"
            >
              <span className="font-mono text-xs sm:text-sm text-[var(--color-accent)] font-semibold">
                {item.number}
              </span>
              <div>
                <h2 className="font-display text-2xl sm:text-4xl lg:text-5xl tracking-tight text-[#EAE5DB] group-hover:text-white group-hover:translate-x-2 transition-transform duration-300">
                  {item.title}
                </h2>
                <p className="font-mono text-[10px] sm:text-xs text-[var(--color-muted)] tracking-wider uppercase mt-1">
                  {item.category}
                </p>
              </div>
              <ArrowUpRight className="w-4 h-4 text-[var(--color-muted)] opacity-0 group-hover:opacity-100 group-hover:text-[var(--color-accent)] transition-all ml-auto self-center" />
            </div>
          ))}
        </div>

        {/* Live Hover Image Preview (Desktop Only) */}
        <div className="hidden lg:block lg:col-span-5 h-[420px] rounded-[var(--radius-card)] overflow-hidden border border-[#2E2B27] bg-[#141312] relative">
          <img
            src={activePreview}
            alt="Feature Preview"
            className="w-full h-full object-cover transition-opacity duration-400"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
          <div className="absolute bottom-4 left-4 right-4 pointer-events-none">
            <span className="font-mono text-[10px] uppercase tracking-widest text-[var(--color-accent)] font-bold">
              PORTFOLIO SPECIMEN
            </span>
            <p className="font-serif text-sm text-white italic">
              Computational Architecture & Haute Interior Design
            </p>
          </div>
        </div>
      </div>

      {/* Bottom Footer in Menu */}
      <div className="border-t border-[#2E2B27] pt-5 flex flex-col sm:flex-row items-start sm:items-center justify-between text-xs font-mono text-[var(--color-muted)] gap-3">
        <div>
          <span>STUDIO: </span>
          <span className="text-white">CHENNAI // GLOBAL CAD DISPATCH</span>
        </div>
        <div className="flex gap-4">
          <span>LAT: 13.0827° N</span>
          <span>•</span>
          <span>TNCDBR-2019 / IRC COMPLIANT</span>
        </div>
      </div>
    </div>
  );
};
