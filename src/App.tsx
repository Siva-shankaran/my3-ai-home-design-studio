/* Hallmark · macrostructure: Split-Studio / Workbench · theme: Ivory-Emerald · tone: architectural-stationery */
import React, { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';
import { Project, UserProfile } from './types';
import { designService } from './services/designService';
import { authService } from './services/authService';
import { Navbar } from './components/Navbar';
import { LandingPage } from './components/LandingPage';
import { Dashboard } from './components/Dashboard';
import { CADCanvas2D } from './components/CADCanvas2D';
import { Studio3D } from './components/Studio3D';
import { AiChatAssistant } from './components/AiChatAssistant';
import { FurniturePanel } from './components/FurniturePanel';
import { ExportModal } from './components/ExportModal';
import { PlanUploaderModal } from './components/PlanUploaderModal';
import { ClientPitchModal } from './components/ClientPitchModal';
import { TamilNaduStudioPanel } from './components/TamilNaduStudioPanel';
import { InteriorReferenceModal } from './components/InteriorReferenceModal';
import { GuidedTourModal } from './components/GuidedTourModal';
import { MaketGeneratorModal } from './components/MaketGeneratorModal';
import { DesignConceptModal } from './components/DesignConceptModal';
import { FloorplanStatsDrawer } from './components/FloorplanStatsDrawer';
import { materialCatalogService } from './services/materialCatalogService';
import { CustomCursor } from './components/editorial/CustomCursor';
import { MenuOverlay } from './components/editorial/MenuOverlay';
import { BottomDock } from './components/editorial/BottomDock';
import { StudioStepTracker } from './components/editorial/StudioStepTracker';
import { WizardController } from './components/wizard/WizardController';
import { AuthModal } from './components/auth/AuthModal';
import { useLenisSmoothScroll } from './animations/useLenisSmoothScroll';
import type { Language } from './services/i18n';
import { 
  Square, Move, DoorOpen, AppWindow, Armchair, 
  Ruler, MessageSquare, Box, Sparkles, Layers, Sliders, Award, Landmark
} from 'lucide-react';

// Sample flagship home project generated with real-world TNCDBR-2019 compliance & multi-floor stacking
const initialSampleProject: Project = designService.buildEngineeredMultiFloorPlan(
  '4-Bedroom Luxury Residence with Grand Foyer, Open Great Room, and Upper Master Suite Terrace',
  {
    sqft: 2850,
    floors: 2,
    bedrooms: 4,
    bathrooms: 3,
    style: 'Tamil Nadu Contemporary',
    district: 'Chennai',
    planningAuthority: 'CMDA',
    lotWidth: 40,
    lotDepth: 60,
    roadWidthFeet: 30,
    orientation: 'North',
    luxuryTier: 'Premium'
  }
);

initialSampleProject.renders = [
  {
    id: 'r-1',
    url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1600&q=85',
    prompt: 'Modern Minimalist luxury home with large glass facade and evening ambient lighting',
    style: 'Modern Minimalist',
    floor: 1,
    timestamp: 'Today 2:40 PM'
  }
];

// Reverse-engineered Maket.ai 1,300 sqft residential layout asset
const maketSampleProject: Project = designService.getMaketSampleProject();

export type AppView = 'landing' | 'dashboard' | 'editor2d' | 'studio3d' | 'wizard';

// Helper to determine initial view strictly from URL hash; defaults ALWAYS to 'landing'
const getInitialView = (): AppView => {
  if (typeof window !== 'undefined') {
    const raw = window.location.hash.replace(/^#\/?/, '').trim();
    if (raw === 'dashboard' || raw === 'editor2d' || raw === 'studio3d' || raw === 'wizard') {
      return raw as AppView;
    }
  }
  return 'landing'; // Default first view is always the Landing Page
};

export const App: React.FC = () => {
  // Navigation & Mode State — Defaults to Landing Page first, preserved step-by-step
  const [currentView, setCurrentView] = useState<AppView>(getInitialView);
  const [projects, setProjects] = useState<Project[]>([maketSampleProject, initialSampleProject]);
  const [activeProject, setActiveProject] = useState<Project>(maketSampleProject);

  // Maket AI Floorplan Generator & Inspector Drawer states
  const [isMaketModalOpen, setIsMaketModalOpen] = useState<boolean>(false);
  const [isConceptModalOpen, setIsConceptModalOpen] = useState<boolean>(false);
  const [isStatsDrawerOpen, setIsStatsDrawerOpen] = useState<boolean>(false);
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);

  // Initialize smooth scrolling with Lenis on landing page
  useLenisSmoothScroll(currentView === 'landing');

  const viewContainerRef = useRef<HTMLDivElement>(null);

  // GSAP Smooth Hardware-Accelerated View Transition
  useEffect(() => {
    if (!viewContainerRef.current) return;
    const prefersReducedMotion = typeof window !== 'undefined' && 
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    gsap.fromTo(
      viewContainerRef.current,
      { opacity: 0, y: 6 },
      { opacity: 1, y: 0, duration: 0.35, ease: 'power2.out', force3D: true }
    );
  }, [currentView]);

  // Synchronize URL hash when currentView changes
  const navigateTo = (view: AppView) => {
    setCurrentView(view);
    if (typeof window !== 'undefined') {
      window.location.hash = view === 'landing' ? '#/' : `#/${view}`;
    }
  };

  // Listen to browser Back/Forward navigation
  useEffect(() => {
    const onHashChange = () => {
      const raw = window.location.hash.replace(/^#\/?/, '').trim();
      if (raw === 'dashboard' || raw === 'editor2d' || raw === 'studio3d' || raw === 'wizard') {
        setCurrentView(raw as AppView);
      } else {
        setCurrentView('landing');
      }
    };
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  // Language & Visual Output Design Mode
  const [language, setLanguage] = useState<Language>('en'); // Default is English
  const [cadStyleMode, setCadStyleMode] = useState<'presentation' | 'cad'>('presentation');
  const [isMultiFloorSideBySide, setIsMultiFloorSideBySide] = useState<boolean>(false);

  // Studio Settings
  const [unit, setUnit] = useState<'imperial' | 'metric'>('imperial');
  const [activeFloor, setActiveFloor] = useState<number>(1);
  const [selectedTool, setSelectedTool] = useState<'select' | 'room' | 'wall' | 'door' | 'window' | 'measure' | 'furniture'>('select');
  // Side Panel is closed (null) by default for a clean, spacious architectural canvas
  const [sidePanel, setSidePanel] = useState<'chat' | 'furniture' | 'tamilNadu' | null>(null);

  // Modals
  const [isExportOpen, setIsExportOpen] = useState<boolean>(false);
  const [isDigitizerOpen, setIsDigitizerOpen] = useState<boolean>(false);
  const [isPitchOpen, setIsPitchOpen] = useState<boolean>(false);
  const [isInteriorRefOpen, setIsInteriorRefOpen] = useState<boolean>(false);
  // Startup guide popup is permanently closed by default as requested
  const [isTourOpen, setIsTourOpen] = useState<boolean>(false);

  // User session
  const [user, setUser] = useState<UserProfile>(authService.getCurrentUser());

  const handleUpdateProject = (updated: Project) => {
    setActiveProject(updated);
    setProjects(prev => prev.map(p => p.id === updated.id ? updated : p));
  };

  const handleCreateProject = (newProj: Project) => {
    setProjects(prev => [newProj, ...prev]);
    setActiveProject(newProj);
    navigateTo('editor2d');
  };

  const handleDeleteProject = (id: string) => {
    setProjects(prev => prev.filter(p => p.id !== id));
    if (activeProject.id === id && projects.length > 1) {
      setActiveProject(projects[0]);
    }
  };

  const handlePlanDigitized = (digitized: Partial<Project>) => {
    const newProj: Project = {
      ...initialSampleProject,
      id: `proj-${Date.now()}`,
      name: digitized.name || 'Digitized Blueprint',
      sqft: digitized.sqft || 2850,
      floors: digitized.floors || 2,
      rooms: digitized.rooms || initialSampleProject.rooms,
      furniture: digitized.furniture || initialSampleProject.furniture,
      updatedAt: 'Just now'
    };
    handleCreateProject(newProj);
  };

  return (
    <div className="w-screen h-screen flex flex-col bg-[var(--color-paper)] text-[var(--color-ink)] overflow-hidden font-sans">
      {/* Desktop Custom Cursor */}
      <CustomCursor />

      {/* Top Main Navbar */}
      <Navbar
        currentView={currentView}
        onNavigate={navigateTo}
        activeProject={activeProject}
        user={user}
        unit={unit}
        onToggleUnit={() => setUnit(u => u === 'imperial' ? 'metric' : 'imperial')}
        activeFloor={activeFloor}
        onSelectFloor={setActiveFloor}
        onOpenExport={() => setIsExportOpen(true)}
        onOpenPitch={() => setIsPitchOpen(true)}
        onOpenInteriorReferences={() => setIsInteriorRefOpen(true)}
        onOpenTour={() => setIsTourOpen(true)}
        onOpenMaketGenerator={() => setIsMaketModalOpen(true)}
        onOpenConceptGenerator={() => setIsConceptModalOpen(true)}
        onOpenMenu={() => setIsMenuOpen(true)}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        language={language}
        onToggleLanguage={() => setLanguage(l => l === 'en' ? 'ta' : 'en')}
        cadStyleMode={cadStyleMode}
        onToggleCadStyle={() => setCadStyleMode(m => m === 'presentation' ? 'cad' : 'presentation')}
        isMultiFloorSideBySide={isMultiFloorSideBySide}
        onToggleSideBySide={() => setIsMultiFloorSideBySide(s => !s)}
      />

      {/* Main Content Area */}
      <div ref={viewContainerRef} className="flex-1 relative overflow-hidden flex w-full h-full pb-14 md:pb-0">
        {currentView === 'landing' && (
          <div className="w-full h-full overflow-y-auto overflow-x-hidden">
            <LandingPage
              onGetStarted={() => {
                if (!authService.isExplicitlyAuthenticated()) {
                  setIsAuthModalOpen(true);
                } else {
                  navigateTo('wizard');
                }
              }}
              onExploreDemo={() => navigateTo('editor2d')}
              onOpenConcepts={() => {
                if (!authService.isExplicitlyAuthenticated()) {
                  setIsAuthModalOpen(true);
                } else {
                  navigateTo('wizard');
                }
              }}
            />
          </div>
        )}

        {currentView === 'wizard' && (
          <div className="w-full h-full overflow-y-auto overflow-x-hidden">
            <WizardController
              onExitToLanding={() => navigateTo('landing')}
            />
          </div>
        )}

        {currentView === 'dashboard' && (
          <Dashboard
            projects={projects}
            onSelectProject={(p) => { setActiveProject(p); navigateTo('editor2d'); }}
            onCreateProject={handleCreateProject}
            onDeleteProject={handleDeleteProject}
            onOpenDigitizer={() => setIsDigitizerOpen(true)}
            onOpenMaketGenerator={() => setIsMaketModalOpen(true)}
            onOpenConceptGenerator={() => setIsConceptModalOpen(true)}
          />
        )}

        {(currentView === 'editor2d' || currentView === 'studio3d') && (
          <div className="flex-1 flex flex-col w-full h-full overflow-hidden">
            {/* Architectural Studio Step Progress Tracker */}
            <StudioStepTracker
              currentStep="studio"
              completedSteps={['requirements', 'synthesis', 'three_designs']}
              onStepClick={(step) => {
                if (step !== 'studio') {
                  navigateTo('wizard');
                }
              }}
            />

            <div className="flex-1 relative overflow-hidden flex w-full h-full">
              {/* Left Vertical CAD Toolstrip (Terracotta Accent) */}
              <div className="w-11 sm:w-14 bg-[var(--color-paper-2)] border-r border-[var(--color-rule)] flex flex-col items-center py-2.5 sm:py-3 space-y-1.5 sm:space-y-2 z-10 select-none shrink-0">
                <button
                  onClick={() => setSelectedTool('select')}
                  className={`p-2 sm:p-2.5 rounded transition cursor-pointer ${selectedTool === 'select' ? 'bg-[var(--color-accent)] text-white shadow-xs' : 'text-[var(--color-muted)] hover:text-[var(--color-ink)] hover:bg-[var(--color-paper-3)]'}`}
                  title="Select & Move (V)"
                >
                  <Move className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setSelectedTool('room')}
                  className={`p-2 sm:p-2.5 rounded transition cursor-pointer ${selectedTool === 'room' ? 'bg-[var(--color-accent)] text-white shadow-xs' : 'text-[var(--color-muted)] hover:text-[var(--color-ink)] hover:bg-[var(--color-paper-3)]'}`}
                  title="Draw Room Box (R)"
                >
                  <Square className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setSidePanel(p => p === 'furniture' ? null : 'furniture')}
                  className={`p-2 sm:p-2.5 rounded transition cursor-pointer ${sidePanel === 'furniture' ? 'bg-[var(--color-accent)] text-white shadow-xs' : 'text-[var(--color-muted)] hover:text-[var(--color-ink)] hover:bg-[var(--color-paper-3)]'}`}
                  title="Bring Your Own Furniture"
                >
                  <Armchair className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setSidePanel(p => p === 'chat' ? null : 'chat')}
                  className={`p-2 sm:p-2.5 rounded transition cursor-pointer ${sidePanel === 'chat' ? 'bg-[var(--color-accent)] text-white shadow-xs' : 'text-[var(--color-muted)] hover:text-[var(--color-ink)] hover:bg-[var(--color-paper-3)]'}`}
                  title="Talk to Your Plan (AI Chat)"
                >
                  <MessageSquare className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setSidePanel(p => p === 'tamilNadu' ? null : 'tamilNadu')}
                  className={`p-2 sm:p-2.5 rounded transition cursor-pointer ${sidePanel === 'tamilNadu' ? 'bg-[var(--color-accent)] text-white shadow-xs' : 'text-[var(--color-accent)] hover:bg-[var(--color-paper-3)]'}`}
                  title="Tamil Nadu Site Studio (TNCDBR-2019, Soil & Presets)"
                >
                  <Landmark className="w-4 h-4" />
                </button>

                <div className="w-6 sm:w-8 h-[1px] bg-[var(--color-rule)] my-1.5 sm:my-2" />

                <button
                  onClick={() => setIsPitchOpen(true)}
                  className="p-2 sm:p-2.5 rounded bg-[var(--color-accent-subtle)] text-[var(--color-accent)] border border-[var(--color-accent)]/30 hover:bg-[var(--color-accent)] hover:text-white transition cursor-pointer"
                  title="Executive Client Presentation"
                >
                  <Award className="w-4 h-4" />
                </button>

                <button
                  onClick={() => setIsInteriorRefOpen(true)}
                  className="p-2 sm:p-2.5 rounded bg-[var(--color-paper-3)] text-[var(--color-ink)] border border-[var(--color-rule)] hover:bg-[var(--color-accent)] hover:text-white transition cursor-pointer"
                  title="3D Interior Reference Visuals"
                >
                  <Sparkles className="w-4 h-4" />
                </button>

                <button
                  onClick={() => setIsStatsDrawerOpen(prev => !prev)}
                  className={`p-2 sm:p-2.5 rounded transition cursor-pointer ${isStatsDrawerOpen ? 'bg-[var(--color-accent)] text-white shadow-xs' : 'text-[var(--color-muted)] hover:text-[var(--color-ink)] hover:bg-[var(--color-paper-3)]'}`}
                  title="Plan Schedule, 3D Cameras & Fixtures Inspector (Maket Spec)"
                >
                  <Layers className="w-4 h-4" />
                </button>
              </div>

              {/* Central Studio Viewport */}
              <div className="flex-1 relative overflow-hidden bg-[var(--color-paper)]">
                {currentView === 'editor2d' && (
                  <CADCanvas2D
                    project={activeProject}
                    onUpdateProject={handleUpdateProject}
                    selectedTool={selectedTool}
                    unit={unit}
                    activeFloor={activeFloor}
                    language={language}
                    cadStyleMode={cadStyleMode}
                    isMultiFloorSideBySide={isMultiFloorSideBySide}
                    onSelectFloor={setActiveFloor}
                    onToggleSideBySide={setIsMultiFloorSideBySide}
                    onToggleCadStyle={setCadStyleMode}
                    onToggleLanguage={setLanguage}
                    onOpenExport={() => setIsExportOpen(true)}
                    onOpenInteriorReferences={() => setIsInteriorRefOpen(true)}
                    onToggleStatsDrawer={() => setIsStatsDrawerOpen(prev => !prev)}
                  />
                )}

                {currentView === 'studio3d' && (
                  <Studio3D
                    project={activeProject}
                    onUpdateProject={handleUpdateProject}
                    activeFloor={activeFloor}
                  />
                )}
              </div>

              {/* Right Collapsible Feature Panels with Mobile Drawer Overlay */}
              {sidePanel === 'chat' && (
                <div className="fixed sm:static inset-y-0 right-0 z-40 sm:z-10 w-full sm:w-96 border-l border-[var(--color-rule)] bg-[var(--color-paper-2)] flex flex-col shadow-2xl sm:shadow-lg">
                  <div className="sm:hidden flex items-center justify-between p-2.5 border-b border-[var(--color-rule)] bg-[var(--color-paper-3)] font-mono text-xs">
                    <span className="font-bold text-[var(--color-ink)]">TALK TO YOUR PLAN</span>
                    <button onClick={() => setSidePanel(null)} className="px-2 py-0.5 bg-[var(--color-paper)] border border-[var(--color-rule)] rounded font-bold text-xs cursor-pointer">
                      ✕ CLOSE
                    </button>
                  </div>
                  <AiChatAssistant
                    project={activeProject}
                    onUpdateProject={handleUpdateProject}
                    activeFloor={activeFloor}
                  />
                </div>
              )}

              {sidePanel === 'furniture' && (
                <div className="fixed sm:static inset-y-0 right-0 z-40 sm:z-10 w-full sm:w-80 border-l border-[var(--color-rule)] bg-[var(--color-paper-2)] flex flex-col shadow-2xl sm:shadow-lg">
                  <div className="sm:hidden flex items-center justify-between p-2.5 border-b border-[var(--color-rule)] bg-[var(--color-paper-3)] font-mono text-xs">
                    <span className="font-bold text-[var(--color-ink)]">FURNITURE CATALOG</span>
                    <button onClick={() => setSidePanel(null)} className="px-2 py-0.5 bg-[var(--color-paper)] border border-[var(--color-rule)] rounded font-bold text-xs cursor-pointer">
                      ✕ CLOSE
                    </button>
                  </div>
                  <FurniturePanel
                    project={activeProject}
                    onUpdateProject={handleUpdateProject}
                    unit={unit}
                  />
                </div>
              )}

              {sidePanel === 'tamilNadu' && (
                <div className="fixed sm:static inset-y-0 right-0 z-40 sm:z-10 w-full sm:w-96 border-l border-[var(--color-rule)] bg-[var(--color-paper-2)] flex flex-col shadow-2xl sm:shadow-lg">
                  <div className="sm:hidden flex items-center justify-between p-2.5 border-b border-[var(--color-rule)] bg-[var(--color-paper-3)] font-mono text-xs">
                    <span className="font-bold text-[var(--color-ink)]">TAMIL NADU STUDIO</span>
                    <button onClick={() => setSidePanel(null)} className="px-2 py-0.5 bg-[var(--color-paper)] border border-[var(--color-rule)] rounded font-bold text-xs cursor-pointer">
                      ✕ CLOSE
                    </button>
                  </div>
                  <TamilNaduStudioPanel
                    project={activeProject}
                    onUpdateProject={handleUpdateProject}
                    onClose={() => setSidePanel(null)}
                  />
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Mobile Bottom Dock */}
      <BottomDock
        currentView={currentView}
        onNavigate={navigateTo}
        onOpenMenu={() => setIsMenuOpen(true)}
      />

      {/* Full-Screen Architectural Menu Overlay */}
      <MenuOverlay
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        onNavigate={navigateTo}
        onOpenConcepts={() => setIsConceptModalOpen(true)}
        onOpenInteriorRef={() => setIsInteriorRefOpen(true)}
      />

      {/* Global Modals */}
      {isExportOpen && (
        <ExportModal
          isOpen={isExportOpen}
          project={activeProject}
          onClose={() => setIsExportOpen(false)}
          unit={unit}
          language={language}
        />
      )}

      {isDigitizerOpen && (
        <PlanUploaderModal
          isOpen={isDigitizerOpen}
          onClose={() => setIsDigitizerOpen(false)}
          onPlanDigitized={handlePlanDigitized}
        />
      )}

      {isPitchOpen && (
        <ClientPitchModal
          isOpen={isPitchOpen}
          project={activeProject}
          onClose={() => setIsPitchOpen(false)}
          activeFloor={activeFloor}
          language={language}
        />
      )}

      {isInteriorRefOpen && (
        <InteriorReferenceModal
          isOpen={isInteriorRefOpen}
          onClose={() => setIsInteriorRefOpen(false)}
          project={activeProject}
          language={language}
          onApplyTheme={(themeId) => {
            const updated = materialCatalogService.applyWholeHomeTheme(activeProject, themeId);
            handleUpdateProject(updated);
          }}
        />
      )}

      {isTourOpen && (
        <GuidedTourModal
          isOpen={isTourOpen}
          onClose={() => setIsTourOpen(false)}
          onJumpToView={navigateTo}
        />
      )}

      {/* Maket.ai 5-Step Requirements Ingestion Floorplan Generator */}
      <MaketGeneratorModal
        isOpen={isMaketModalOpen}
        onClose={() => setIsMaketModalOpen(false)}
        onPlanGenerated={(newPlan) => {
          handleCreateProject(newPlan);
        }}
      />

      {/* Deterministic 3-Concept Architectural Synthesis Engine */}
      <DesignConceptModal
        isOpen={isConceptModalOpen}
        onClose={() => setIsConceptModalOpen(false)}
        onSelectDesign={(project, targetView) => {
          handleCreateProject(project);
          navigateTo(targetView);
          setIsConceptModalOpen(false);
        }}
      />

      {/* Maket.ai Plan Inspector & 3D Camera Teleports Schedule Drawer */}
      <FloorplanStatsDrawer
        isOpen={isStatsDrawerOpen}
        onClose={() => setIsStatsDrawerOpen(false)}
        project={activeProject}
        onSelectCamera={(cam) => {
          console.log('Teleporting 2D/3D viewport to viewpoint:', cam.name, cam.position);
        }}
        onFocusRoom={(roomId) => {
          console.log('Focusing room:', roomId);
        }}
      />

      {/* Enterprise Authentication Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={(newUser) => {
          setUser(newUser);
          authService.setExplicitlyAuthenticated(true);
          navigateTo('wizard');
        }}
      />
    </div>
  );
};

export default App;
