import React, { useState, useEffect, useRef } from 'react';
import { Home, Compass, Box, FolderKanban, Menu } from 'lucide-react';

interface BottomDockProps {
  currentView: 'landing' | 'dashboard' | 'editor2d' | 'studio3d';
  onNavigate: (view: 'landing' | 'dashboard' | 'editor2d' | 'studio3d') => void;
  onOpenMenu: () => void;
}

export const BottomDock: React.FC<BottomDockProps> = ({
  currentView,
  onNavigate,
  onOpenMenu
}) => {
  const [isVisible, setIsVisible] = useState<boolean>(true);
  const lastScrollY = useRef<number>(0);

  // Auto-hide on scroll down, show on scroll up
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > lastScrollY.current + 8 && currentScrollY > 60) {
        setIsVisible(false); // Scrolling down
      } else if (currentScrollY < lastScrollY.current - 8) {
        setIsVisible(true); // Scrolling up
      }
      lastScrollY.current = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { id: 'landing', label: 'Home', icon: Home, action: () => onNavigate('landing') },
    { id: 'editor2d', label: 'Studio', icon: Compass, action: () => onNavigate('editor2d') },
    { id: 'studio3d', label: '3D Space', icon: Box, action: () => onNavigate('studio3d') },
    { id: 'dashboard', label: 'Archive', icon: FolderKanban, action: () => onNavigate('dashboard') },
    { id: 'menu', label: 'Menu', icon: Menu, action: onOpenMenu }
  ];

  return (
    <nav
      role="navigation"
      aria-label="Mobile Navigation Dock"
      className={`fixed bottom-0 inset-x-0 z-40 md:hidden bg-[var(--color-paper-2)]/95 backdrop-blur-md border-t border-[var(--color-rule)] px-3 pt-1 pb-[calc(0.5rem+env(safe-area-inset-bottom))] transition-transform duration-300 ${
        isVisible ? 'translate-y-0' : 'translate-y-full'
      }`}
    >
      <div className="flex items-center justify-around max-w-md mx-auto">
        {navItems.map((item) => {
          const isActive = currentView === item.id;
          const Icon = item.icon;

          return (
            <button
              key={item.id}
              onClick={item.action}
              className={`min-w-[48px] min-h-[48px] flex flex-col items-center justify-center gap-1 transition cursor-pointer ${
                isActive
                  ? 'text-[var(--color-accent)] font-bold'
                  : 'text-[var(--color-muted)] hover:text-[var(--color-ink)]'
              }`}
              aria-label={item.label}
              aria-current={isActive ? 'page' : undefined}
            >
              <Icon className="w-4 h-4" />
              <span className="font-mono text-[9px] tracking-wider uppercase">
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
