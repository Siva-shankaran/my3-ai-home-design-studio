import React, { useState, useEffect } from 'react';

interface SectionMarker {
  id: string;
  number: string;
  label: string;
}

interface SectionRailProps {
  sections: SectionMarker[];
}

export const SectionRail: React.FC<SectionRailProps> = ({ sections }) => {
  const [activeSection, setActiveSection] = useState<string>(sections[0]?.id || '');

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleScroll = () => {
      const scrollPosition = window.scrollY + window.innerHeight * 0.4;

      for (let i = sections.length - 1; i >= 0; i--) {
        const el = document.getElementById(sections[i].id);
        if (el) {
          const top = el.offsetTop;
          if (scrollPosition >= top) {
            setActiveSection(sections[i].id);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [sections]);

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div
      role="navigation"
      aria-label="Section progress"
      className="hidden xl:flex fixed right-6 top-1/2 -translate-y-1/2 z-40 flex-col items-end space-y-4 select-none pointer-events-auto"
    >
      {sections.map((sec) => {
        const isActive = activeSection === sec.id;
        return (
          <button
            key={sec.id}
            onClick={() => scrollTo(sec.id)}
            className="group flex items-center gap-3 cursor-pointer py-1 text-right focus:outline-none"
            title={sec.label}
          >
            {/* Hover tooltip label */}
            <span
              className={`font-mono text-[10px] tracking-widest uppercase transition-all duration-200 ${
                isActive
                  ? 'text-[var(--color-accent)] font-bold opacity-100 translate-x-0'
                  : 'text-[var(--color-muted)] opacity-0 group-hover:opacity-100 translate-x-2 group-hover:translate-x-0'
              }`}
            >
              {sec.label}
            </span>

            {/* Number and tick mark */}
            <div className="flex items-center gap-1.5">
              <span
                className={`font-mono text-[10px] transition-colors ${
                  isActive ? 'text-[var(--color-ink)] font-bold' : 'text-[var(--color-muted)]'
                }`}
              >
                {sec.number}
              </span>
              <div
                className={`h-[1px] transition-all duration-300 ${
                  isActive
                    ? 'w-6 bg-[var(--color-accent)]'
                    : 'w-2 bg-[var(--color-rule)] group-hover:w-4 group-hover:bg-[var(--color-muted)]'
                }`}
              />
            </div>
          </button>
        );
      })}
    </div>
  );
};
