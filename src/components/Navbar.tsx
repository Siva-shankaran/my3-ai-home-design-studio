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
  currentView: 'landing' | 'dashboard' | 'editor2d' | 'studio3d';
  onNavigate: (view: 'landing' | 'dashboard' | 'editor2d' | 'studio3d') => void;
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
  onToggleSideBySide
}) => {
  const [showLanguagePopover, setShowLanguagePopover] = useState<boolean>(false);
  const t = translations[language];

  return (
    <header className="h-13 border-b border-[var(--color-rule)] bg-[var(--color-paper-2)] px-2.5 sm:px-4 flex items-center justify-between z-30 select-none font-sans text-[var(--color-ink)]">
      {/* Brand Logo & Studio Identifier */}
      <div className="flex items-center space-x-2 sm:space-x-6">
        <div 
          onClick={() => onNavigate('landing')}
          className="flex items-center space-x-2.5 cursor-pointer group"
          title="Return to Landing Page"
        >
          <div className="w-8 h-8 rounded-full bg-[var(--color-accent)] text-white flex items-center justify-center font-bold shadow-sm group-hover:bg-[var(--color-accent-hover)] transition shrink-0">
            <Compass className="w-4 h-4 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-serif font-bold text-base text-[var(--color-ink)] tracking-tight">MY3 <span className="italic font-normal">Desings</span></span>
              <span className="hidden sm:inline-block text-[10px] bg-[var(--color-accent-subtle)] text-[var(--color-accent)] px-2 py-0.5 rounded-full border border-[var(--color-accent)]/20 font-mono font-bold">STUDIO</span>
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
        {/* Metric / Imperial toggle */}
        <button
          onClick={onToggleUnit}
          className="px-2 sm:px-2.5 py-1 bg-[var(--color-paper-3)] hover:bg-[var(--color-paper)] border border-[var(--color-rule)] rounded text-[11px] sm:text-xs text-[var(--color-ink-2)] transition cursor-pointer"
          title="Toggle Measurement Units"
        >
          {unit === 'imperial' ? t.feet : t.meters}
        </button>

        {/* Language Switcher Button */}
        <div className="relative">
          <button
            onClick={onToggleLanguage}
            className={`px-2 sm:px-2.5 py-1 rounded text-[11px] sm:text-xs font-mono flex items-center space-x-1 sm:space-x-1.5 border transition cursor-pointer ${
              language === 'ta'
                ? 'bg-[#dc2626] border-[#dc2626] text-white font-bold'
                : 'bg-[var(--color-paper-3)] border-[var(--color-rule)] text-[var(--color-ink)] hover:border-[var(--color-rule-2)]'
            }`}
            title="Switch Language: English / தமிழ்"
          >
            <Globe className="w-3.5 h-3.5 text-[#dc2626]" />
            <span>{language === 'en' ? 'EN' : 'தமிழ்'}</span>
          </button>

          {/* Navigation Popover Guide */}
          {showLanguagePopover && (
            <div className="absolute right-0 top-11 z-50 w-72 max-w-[calc(100vw-1rem)] p-3 bg-[var(--color-paper)] border border-[var(--color-rule)] rounded shadow-xl font-mono">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-1.5 text-[var(--color-ink)] font-bold text-xs">
                  <Globe className="w-3.5 h-3.5 text-[#dc2626]" />
                  <span>{t.languagePopTitle}</span>
                </div>
                <button 
                  onClick={() => setShowLanguagePopover(false)} 
                  className="text-[var(--color-muted)] hover:text-[var(--color-ink)] text-xs px-1 cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <p className="text-[11px] text-[var(--color-ink-2)] mt-1.5 leading-relaxed font-sans">
                {t.languagePopDesc}
              </p>

              <div className="mt-2.5 flex items-center justify-between pt-2 border-t border-[var(--color-rule)]">
                <button
                  onClick={() => {
                    onToggleLanguage();
                    setShowLanguagePopover(false);
                  }}
                  className="px-2 py-1 bg-[#dc2626] hover:bg-[#b91c1c] text-white rounded text-[10px] font-bold transition flex items-center gap-1"
                >
                  <span>{language === 'en' ? 'Switch to தமிழ்' : 'Switch to English'}</span>
                </button>
                <button
                  onClick={() => setShowLanguagePopover(false)}
                  className="px-2 py-1 bg-[var(--color-paper-3)] hover:bg-[var(--color-paper-2)] text-[var(--color-muted)] rounded text-[10px]"
                >
                  {t.languagePopAction}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* AI Credits Meter */}
        <div className="flex items-center space-x-1.5 bg-[var(--color-paper-3)] border border-[var(--color-rule)] px-2.5 py-1 rounded text-[var(--color-ink)]">
          <Sparkles className="w-3.5 h-3.5 text-[#dc2626]" />
          <span className="font-bold text-[var(--color-ink)]">{user.credits}</span>
          <span className="text-[var(--color-muted)] text-[10px] hidden sm:inline">{t.credits}</span>
        </div>

        {/* Step-by-Step Guided Tour Button */}
        {onOpenTour && (
          <button
            onClick={onOpenTour}
            className="bg-[var(--color-paper-3)] hover:bg-[var(--color-paper)] text-[var(--color-ink)] border border-[var(--color-rule)] px-2.5 sm:px-3 py-1 rounded text-xs font-mono flex items-center space-x-1.5 transition cursor-pointer"
            title="Step-by-Step Architectural Platform Guide"
          >
            <HelpCircle className="w-3.5 h-3.5 text-[#dc2626]" />
            <span className="hidden sm:inline">{language === 'ta' ? 'வழிகாட்டி' : 'Guide'}</span>
          </button>
        )}

        {/* 3D Interior References Board Button */}
        {activeProject && currentView !== 'landing' && onOpenInteriorReferences && (
          <button
            onClick={onOpenInteriorReferences}
            className="bg-slate-100 hover:bg-slate-200 text-[var(--color-ink)] border border-[var(--color-rule)] px-3 py-1 rounded text-xs font-mono flex items-center space-x-1.5 transition"
            title="Open 3D Interior Reference Visuals & Material Moodboard"
          >
            <Palette className="w-3.5 h-3.5 text-[#dc2626]" />
            <span className="hidden sm:inline">{language === 'ta' ? '3D உள்துறை' : '3D Interiors'}</span>
          </button>
        )}

        {/* Client Pitch Presentation Button */}
        {activeProject && currentView !== 'landing' && onOpenPitch && (
          <button
            onClick={onOpenPitch}
            className="bg-[var(--color-paper-3)] hover:bg-[var(--color-paper)] text-[var(--color-ink)] border border-[var(--color-rule)] px-3 py-1 rounded text-xs font-mono flex items-center space-x-1.5 transition"
            title="Open Executive Client Presentation & Material Board"
          >
            <Award className="w-3.5 h-3.5 text-[#dc2626]" />
            <span className="hidden sm:inline">{t.clientPitch}</span>
          </button>
        )}

        {/* Export Button (Signal Red Primary CTA) */}
        {activeProject && currentView !== 'landing' && (
          <button
            onClick={onOpenExport}
            className="bg-[#dc2626] hover:bg-[#b91c1c] text-white px-3.5 py-1 rounded text-xs font-mono font-semibold flex items-center space-x-1.5 transition shadow-xs"
          >
            <Download className="w-3.5 h-3.5 text-white" />
            <span>EXPORT</span>
          </button>
        )}

        {/* User Profile Tag */}
        <div className="flex items-center space-x-1.5 bg-[var(--color-paper-3)] border border-[var(--color-rule)] px-2 py-1 rounded">
          <div className="w-5 h-5 rounded bg-[#0f172a] text-white flex items-center justify-center font-bold text-[10px]">
            {user.name.charAt(0)}
          </div>
          <span className="hidden sm:inline text-xs text-[var(--color-ink)] font-mono">{user.name}</span>
        </div>
      </div>
    </header>
  );
};
