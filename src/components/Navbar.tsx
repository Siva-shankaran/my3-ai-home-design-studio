/* Hallmark · macrostructure: Workbench · theme: Ivory-Emerald · tone: architectural-stationery */
import React, { useState } from 'react';
import { 
  Compass, Box, Layers, Download, Sparkles, 
  Home, Grid, User, ChevronDown, Ruler, Award,
  Globe, Palette, Columns2, Square, HelpCircle
} from 'lucide-react';
import type { UserProfile, Project } from '../types';
import { type Language, translations } from '../services/i18n';

interface NavbarProps {
  currentView: 'landing' | 'dashboard' | 'editor2d' | 'studio3d' | 'wizard';
  onNavigate: (view: 'landing' | 'dashboard' | 'editor2d' | 'studio3d' | 'wizard') => void;
  activeProject: Project | null;
  user: UserProfile;
  unit: 'imperial' | 'metric';
  onToggleUnit: () => void;
  activeFloor: number;
  onSelectFloor: (floor: number) => void;
  onOpenExport: () => void;
  onOpenPitch?: () => void;
  // Language Support
  language: Language;
  onToggleLanguage: () => void;
  // Visual Output Design Mode (Presentation vs Technical CAD)
  cadStyleMode?: 'presentation' | 'cad';
  onToggleCadStyle?: () => void;
  // Multi-Floor Side-by-Side View
  isMultiFloorSideBySide?: boolean;
  onToggleSideBySide?: () => void;
  // Interior References Board
  onOpenInteriorReferences?: () => void;
  // Guided Architectural Tour
  onOpenTour?: () => void;
  // Maket AI Floorplan Generator Wizard
  onOpenMaketGenerator?: () => void;
  // Deterministic 3-Concept Architectural Synthesis
  onOpenConceptGenerator?: () => void;
  // Full-Screen Editorial Menu
  onOpenMenu?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onNavigate,
  activeProject,
  user,
  unit,
  onToggleUnit,
  activeFloor,
  onSelectFloor,
  onOpenExport,
  onOpenPitch,
  onOpenInteriorReferences,
  onOpenTour,
  language,
  onToggleLanguage,
  cadStyleMode = 'presentation',
  onToggleCadStyle,
  isMultiFloorSideBySide = false,
  onToggleSideBySide,
  onOpenMaketGenerator,
  onOpenConceptGenerator,
  onOpenMenu
}) => {
  const [showLanguagePopover, setShowLanguagePopover] = useState<boolean>(false);
  const [isNavVisible, setIsNavVisible] = useState<boolean>(true);
  const lastScrollY = React.useRef<number>(0);

  React.useEffect(() => {
    if (typeof window === 'undefined') return;
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > lastScrollY.current + 8 && currentScrollY > 60) {
        setIsNavVisible(false);
      } else if (currentScrollY < lastScrollY.current - 8) {
        setIsNavVisible(true);
      }
      lastScrollY.current = currentScrollY;
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const t = translations[language];

  return (
    <header className={`h-13 border-b border-[var(--color-rule)] bg-[var(--color-paper-2)]/95 backdrop-blur-xs px-3 sm:px-6 flex items-center justify-between z-30 select-none font-sans text-[var(--color-ink)] transition-transform duration-300 ${
      !isNavVisible && currentView === 'landing' ? '-translate-y-full' : 'translate-y-0'
    }`}>
      {/* Brand Logo & Studio Identifier */}
      <div className="flex items-center space-x-2 sm:space-x-6">
        <div 
          onClick={() => onNavigate('landing')}
          className="flex items-center space-x-2.5 cursor-pointer group"
          title="Return to Landing Page"
        >
          <div className="w-7 h-7 rounded bg-[var(--color-accent)] text-white flex items-center justify-center font-bold shadow-xs group-hover:bg-[var(--color-accent-hover)] transition shrink-0">
            <Compass className="w-3.5 h-3.5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-display font-medium text-base text-[var(--color-ink)] tracking-tight">MY3 <span className="italic font-normal">Designs</span></span>
              <span className="hidden sm:inline-block text-[9px] bg-[var(--color-accent-subtle)] text-[var(--color-accent)] px-1.5 py-0.2 rounded border border-[var(--color-accent)]/20 font-mono font-bold tracking-wider">STUDIO</span>
            </div>
            <span className="text-[10px] text-[var(--color-muted)] hidden sm:block -mt-0.5 font-mono">
              {language === 'ta' ? 'AI கட்டிட வடிவமைப்பு தளம்' : 'AI Architectural Studio'}
            </span>
          </div>
        </div>

        {/* Desktop View Switcher Tabs */}
        {activeProject && currentView !== 'landing' && (
          <div className="hidden md:flex items-center bg-[var(--color-paper-3)] border border-[var(--color-rule)] p-1 rounded-full space-x-1 text-xs font-mono">
            <button
              onClick={() => onNavigate('dashboard')}
              className={`px-3.5 py-1 rounded-full transition flex items-center gap-1.5 cursor-pointer ${
                currentView === 'dashboard' ? 'bg-[var(--color-ink)] text-white font-semibold shadow-xs' : 'text-[var(--color-muted)] hover:text-[var(--color-ink)]'
              }`}
            >
              <Home className="w-3.5 h-3.5" />
              <span>{t.projects}</span>
            </button>
            <button
              onClick={() => onNavigate('editor2d')}
              className={`px-3.5 py-1 rounded-full transition flex items-center gap-1.5 cursor-pointer ${
                currentView === 'editor2d' ? 'bg-[var(--color-ink)] text-white font-semibold shadow-xs' : 'text-[var(--color-muted)] hover:text-[var(--color-ink)]'
              }`}
            >
              <Grid className="w-3.5 h-3.5" />
              <span>{t.cadCanvas}</span>
            </button>
            <button
              onClick={() => onNavigate('studio3d')}
              className={`px-3.5 py-1 rounded-full transition flex items-center gap-1.5 cursor-pointer ${
                currentView === 'studio3d' ? 'bg-[var(--color-ink)] text-white font-semibold shadow-xs' : 'text-[var(--color-muted)] hover:text-[var(--color-ink)]'
              }`}
            >
              <Box className="w-3.5 h-3.5" />
              <span>{t.studio3d}</span>
            </button>
          </div>
        )}

        {/* Mobile View Switcher Icons (Phone 320px-767px) */}
        {activeProject && currentView !== 'landing' && (
          <div className="flex md:hidden items-center bg-[var(--color-paper-3)] border border-[var(--color-rule)] p-1 rounded-full text-xs font-mono">
            <button
              onClick={() => onNavigate('dashboard')}
              className={`p-1.5 rounded-full transition cursor-pointer ${currentView === 'dashboard' ? 'bg-[var(--color-ink)] text-white' : 'text-[var(--color-muted)]'}`}
              title={t.projects}
            >
              <Home className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onNavigate('editor2d')}
              className={`p-1.5 rounded-full transition cursor-pointer ${currentView === 'editor2d' ? 'bg-[var(--color-ink)] text-white' : 'text-[var(--color-muted)]'}`}
              title={t.cadCanvas}
            >
              <Grid className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onNavigate('studio3d')}
              className={`p-1.5 rounded-full transition cursor-pointer ${currentView === 'studio3d' ? 'bg-[var(--color-ink)] text-white' : 'text-[var(--color-muted)]'}`}
              title={t.studio3d}
            >
              <Box className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* Middle Active Project Details & Floor / Style Controls */}
      {activeProject && currentView !== 'landing' && (
        <div className="hidden lg:flex items-center space-x-3 text-xs font-mono">
          <span className="font-semibold text-[var(--color-ink)] truncate max-w-[180px]">{activeProject.name}</span>
          <span className="text-[var(--color-rule-2)]">•</span>
          <span className="text-[var(--color-muted)]">
            {activeProject.sqft} sq ft ({Number((activeProject.sqft / 435.6).toFixed(1))} Cents)
          </span>

          {activeProject.siteProfile?.district && (
            <>
              <span className="text-[var(--color-rule-2)]">•</span>
              <span className="text-[#df3b20] font-semibold">
                {activeProject.siteProfile.district} ({activeProject.siteProfile.planningAuthority || 'CMDA'})
              </span>
            </>
          )}

          <span className="text-[var(--color-rule-2)]">•</span>

          {/* Floor Level Selector & Multi-Floor Side-by-Side Toggle */}
          <div className="flex items-center bg-[var(--color-paper-3)] border border-[var(--color-rule)] rounded p-0.5 space-x-0.5">
            {[1, 2].map(fl => (
              <button
                key={fl}
                onClick={() => onSelectFloor(fl)}
                className={`px-2 py-0.5 rounded text-[11px] font-mono transition ${
                  activeFloor === fl && !isMultiFloorSideBySide
                    ? 'bg-[#0f172a] text-white font-bold shadow-xs' 
                    : 'text-[var(--color-muted)] hover:text-[var(--color-ink)]'
                }`}
                title={fl === 1 ? t.level1 : t.level2}
              >
                {fl === 1 ? (language === 'ta' ? 'தரை' : 'G: Ground') : (language === 'ta' ? 'முதல்' : '1F: First')}
              </button>
            ))}

            {onToggleSideBySide && (
              <button
                onClick={onToggleSideBySide}
                className={`px-2 py-0.5 rounded text-[11px] font-mono transition flex items-center gap-1 ${
                  isMultiFloorSideBySide ? 'bg-[#0f172a] text-white font-bold shadow-xs' : 'text-[var(--color-muted)] hover:text-[var(--color-ink)]'
                }`}
                title="View Ground & First Floor side-by-side"
              >
                <Columns2 className="w-3 h-3 text-[#dc2626]" />
                <span>Side-by-Side</span>
              </button>
            )}
          </div>

          {/* CAD Visual Style Toggle (Presentation vs Technical Blueprint) */}
          {onToggleCadStyle && currentView === 'editor2d' && (
            <button
              onClick={onToggleCadStyle}
              className={`px-2.5 py-0.5 rounded text-[11px] font-mono border transition flex items-center gap-1.5 ${
                cadStyleMode === 'presentation'
                  ? 'bg-[var(--color-paper-3)] border-[var(--color-rule)] text-[var(--color-ink)] hover:bg-[var(--color-paper)]'
                  : 'bg-red-50 border-[#dc2626]/40 text-[#dc2626] hover:bg-red-100'
              }`}
              title="Toggle between Colored Presentation Plan and Technical CAD Blueprint"
            >
              <Palette className="w-3 h-3 text-[#dc2626]" />
              <span>{cadStyleMode === 'presentation' ? 'Presentation' : 'Blueprint'}</span>
            </button>
          )}
        </div>
      )}

      {/* Right Actions, Language Switcher & Profile */}
      <div className="flex items-center space-x-2 relative font-mono text-xs">
        {currentView === 'landing' ? (
          <>
            {/* Language Switcher */}
            <button
              onClick={onToggleLanguage}
              className="px-2.5 py-1 rounded-[var(--radius-card)] text-[11px] font-mono flex items-center space-x-1 border border-[var(--color-rule)] bg-[var(--color-paper-3)] text-[var(--color-ink)] hover:border-[var(--color-muted)] transition cursor-pointer"
              title="Switch Language: English / தமிழ்"
            >
              <Globe className="w-3 h-3 text-[var(--color-accent)]" />
              <span>{language === 'en' ? 'EN' : 'தமிழ்'}</span>
            </button>

            {/* Menu Button */}
            {onOpenMenu && (
              <button
                onClick={onOpenMenu}
                className="px-3 py-1.5 rounded-[var(--radius-card)] text-xs font-mono font-medium tracking-wider uppercase border border-[var(--color-rule)] bg-[var(--color-paper-2)] hover:bg-[var(--color-paper-3)] text-[var(--color-ink)] transition flex items-center gap-1.5 cursor-pointer"
                aria-label="Open Navigation Menu"
              >
                <span className="w-3 h-[1px] bg-[var(--color-ink)] block" />
                <span>Menu</span>
              </button>
            )}

            {/* Start Designing Primary Terracotta CTA */}
            <button
              onClick={() => onNavigate('wizard')}
              className="px-4 py-1.5 rounded-[var(--radius-card)] bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-white text-xs font-mono font-medium tracking-wider uppercase transition shadow-xs cursor-pointer"
            >
              Start Designing
            </button>
          </>
        ) : (
          <>
            {onOpenConceptGenerator && (
              <button
                onClick={onOpenConceptGenerator}
                className="flex items-center space-x-1.5 px-2.5 py-1 bg-[var(--color-accent-subtle)] hover:bg-[var(--color-paper-3)] border border-[var(--color-accent)]/40 text-[var(--color-accent)] font-semibold rounded-[var(--radius-card)] text-[11px] transition cursor-pointer shadow-xs"
                title="Generate 3 Distinct Architectural Concepts"
              >
                <Compass className="w-3.5 h-3.5 text-[var(--color-accent)]" />
                <span>3 Concepts</span>
              </button>
            )}

            {onOpenMaketGenerator && (
              <button
                onClick={onOpenMaketGenerator}
                className="hidden md:flex items-center space-x-1.5 px-2.5 py-1 bg-[var(--color-paper-3)] hover:bg-[var(--color-paper)] border border-[var(--color-rule)] text-[var(--color-ink)] font-semibold rounded-[var(--radius-card)] text-[11px] transition cursor-pointer shadow-xs"
                title="Open Maket.ai 5-Step Floorplan Generator Wizard"
              >
                <Sparkles className="w-3.5 h-3.5 text-[var(--color-accent)]" />
                <span>Maket Spec</span>
              </button>
            )}

            {/* Metric / Imperial toggle */}
            <button
              onClick={onToggleUnit}
              className="px-2 sm:px-2.5 py-1 bg-[var(--color-paper-3)] hover:bg-[var(--color-paper)] border border-[var(--color-rule)] rounded-[var(--radius-card)] text-[11px] sm:text-xs text-[var(--color-ink-2)] transition cursor-pointer"
              title="Toggle Measurement Units"
            >
              {unit === 'imperial' ? t.feet : t.meters}
            </button>

            {/* Language Switcher Button */}
            <div className="relative">
              <button
                onClick={onToggleLanguage}
                className={`px-2 sm:px-2.5 py-1 rounded-[var(--radius-card)] text-[11px] sm:text-xs font-mono flex items-center space-x-1 sm:space-x-1.5 border transition cursor-pointer ${
                  language === 'ta'
                    ? 'bg-[var(--color-accent)] border-[var(--color-accent)] text-white font-bold'
                    : 'bg-[var(--color-paper-3)] border-[var(--color-rule)] text-[var(--color-ink)] hover:border-[var(--color-rule-2)]'
                }`}
                title="Switch Language: English / தமிழ்"
              >
                <Globe className="w-3.5 h-3.5 text-[var(--color-accent)]" />
                <span>{language === 'en' ? 'EN' : 'தமிழ்'}</span>
              </button>
            </div>

            {/* Step-by-Step Guided Tour Button */}
            {onOpenTour && (
              <button
                onClick={onOpenTour}
                className="bg-[var(--color-paper-3)] hover:bg-[var(--color-paper)] text-[var(--color-ink)] border border-[var(--color-rule)] px-2.5 sm:px-3 py-1 rounded-[var(--radius-card)] text-xs font-mono flex items-center space-x-1.5 transition cursor-pointer"
                title="Step-by-Step Architectural Platform Guide"
              >
                <HelpCircle className="w-3.5 h-3.5 text-[var(--color-accent)]" />
                <span className="hidden sm:inline">{language === 'ta' ? 'வழிகாட்டி' : 'Guide'}</span>
              </button>
            )}

            {/* Menu Button */}
            {onOpenMenu && (
              <button
                onClick={onOpenMenu}
                className="px-2.5 py-1 rounded-[var(--radius-card)] text-xs font-mono border border-[var(--color-rule)] bg-[var(--color-paper-3)] hover:bg-[var(--color-paper)] text-[var(--color-ink)] transition cursor-pointer"
                title="Open Menu"
              >
                Menu
              </button>
            )}

            {/* Export Button (Terracotta Primary CTA) */}
            {activeProject && (
              <button
                onClick={onOpenExport}
                className="bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-white px-3.5 py-1 rounded-[var(--radius-card)] text-xs font-mono font-semibold flex items-center space-x-1.5 transition shadow-xs cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-white" />
                <span>EXPORT</span>
              </button>
            )}

            {/* User Profile Tag */}
            <div className="flex items-center space-x-1.5 bg-[var(--color-paper-3)] border border-[var(--color-rule)] px-2 py-1 rounded-[var(--radius-card)]">
              <div className="w-5 h-5 rounded-[var(--radius-pill)] bg-[var(--color-dark)] text-white flex items-center justify-center font-bold text-[10px]">
                {user.name.charAt(0)}
              </div>
              <span className="hidden sm:inline text-xs text-[var(--color-ink)] font-mono">{user.name}</span>
            </div>
          </>
        )}
      </div>
    </header>
  );
};
