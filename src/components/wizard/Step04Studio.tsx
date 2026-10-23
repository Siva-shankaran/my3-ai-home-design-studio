import React, { useState, useEffect, useMemo, useCallback } from 'react';
import type { ProjectDesign } from '../../types/project.ts';
import { projectDesignToLegacyProject } from '../../engine/solver/projectAdapter.ts';
import { HistoryManager } from '../studio/HistoryManager.ts';
import { CADCanvas2D } from '../CADCanvas2D.tsx';
import { Studio3D } from '../Studio3D.tsx';
import { MinuteDesignPanel, MinuteDesignConfig } from '../studio/MinuteDesignPanel.tsx';
import { BeforeAfterVisualizer } from '../studio/BeforeAfterVisualizer.tsx';
import { StudioChatDrawer } from '../studio/StudioChatDrawer.tsx';
import { 
  Layers, 
  Box, 
  RotateCcw, 
  RotateCw, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldCheck, 
  ArrowRight,
  Sun,
  Eye,
  Sliders,
  Maximize2,
  Palette,
  SplitSquareVertical,
  Hammer,
  MessageSquare,
  Dices,
  Sparkles
} from 'lucide-react';

interface Step04StudioProps {
  project: ProjectDesign;
  onProjectChange: (project: ProjectDesign) => void;
  onProceedToConstruction: () => void;
}

export type StudioTab = '2d' | '3d' | 'finishes' | 'visualizer';

export const Step04Studio: React.FC<Step04StudioProps> = ({
  project,
  onProjectChange,
  onProceedToConstruction,
}) => {
  const [activeTab, setActiveTab] = useState<StudioTab>('2d');
  const [activeFloorIndex, setActiveFloorIndex] = useState<number>(0);
  const [selectedTool, setSelectedTool] = useState<'select' | 'room' | 'wall' | 'door' | 'window' | 'measure' | 'furniture'>('select');
  const [cadStyle, setCadStyle] = useState<'presentation' | 'cad'>('cad');
  const [isChatOpen, setIsChatOpen] = useState(false);

  // Minute finishes configuration state mapped to project
  const minuteConfig: MinuteDesignConfig = useMemo(() => ({
    flooringId: project.flr || 'athangudi',
    sofaId: project.sofa || 'boucle_sectional',
    sanitaryId: 'geberit_grohe',
    carId: project.car || 'suv_fortuner',
    seed: project.seed || 10482,
    sofa: project.sofa || '3-seater',
    sofaC: project.sofaC || '#64748B',
    bed: project.bed || 'Queen',
    bedC: project.bedC || '#FFFFFF',
    rugC: project.rugC || '#E5E7EB',
    curC: project.curC || '#D1D5DB',
    wall: project.wall || '#F4EFEB',
    flr: project.flr || 'tile',
    flB: project.flB || 'marble',
    flW: project.flW || 'granite',
    lt: project.lt || 'warm',
    car: project.car || 'SUV',
    laundry: project.laundry ?? 1
  }), [project]);

  // Command History Manager for Undo/Redo
  const history = useMemo(() => new HistoryManager(), []);

  // Keyboard shortcut listener for Ctrl+Z and Ctrl+Shift+Z
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        if (e.shiftKey) {
          // Redo
          const next = history.redo(project);
          if (next) onProjectChange(next);
        } else {
          // Undo
          const prev = history.undo(project);
          if (prev) onProjectChange(prev);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [project, history, onProjectChange]);

  // Convert ProjectDesign to legacy format for CADCanvas2D and Studio3D
  const legacyProject = useMemo(() => projectDesignToLegacyProject(project), [project]);

  const handleLegacyUpdate = useCallback((updated: any) => {
    history.push(project);
    const clone = { ...project };
    onProjectChange(clone);
  }, [project, history, onProjectChange]);

  const handleMinuteConfigChange = (updates: Partial<MinuteDesignConfig>) => {
    history.push(project);
    const updated = {
      ...project,
      ...updates
    };
    onProjectChange(updated);
  };

  const handleApplyChatPatch = (patch: Record<string, any>, replyMsg: string) => {
    history.push(project);
    const updated: ProjectDesign = {
      ...project,
      ...patch
    };
    onProjectChange(updated);
  };

  const handleNewUniqueDesign = () => {
    history.push(project);
    const nextSeed = Math.floor(Math.random() * 900000) + 100000;
    const updated: ProjectDesign = {
      ...project,
      seed: nextSeed,
      conceptTitle: `${project.conceptTitle.split('•')[0].trim()} • Design #${nextSeed}`
    };
    onProjectChange(updated);
  };

  const handleGenerateAiConcept = async () => {
    try {
      const res = await fetch('/api/concept', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          state: project,
          seed: project.seed || 10482
        })
      });
      if (res.ok) {
        const data = await res.json();
        history.push(project);
        const updated: ProjectDesign = {
          ...project,
          conceptName: data.name,
          conceptTagline: data.tagline,
          roomMoods: data.rooms,
          ...(data.patch || {})
        };
        onProjectChange(updated);
      }
    } catch (e) {
      console.warn('AI concept call fallback:', e);
    }
  };

  const activeFloor = project.floors[activeFloorIndex] || project.floors[0];

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-100px)] w-full overflow-hidden bg-[var(--color-paper)] font-sans relative">
      {/* Studio Top Control Strip */}
      <div className="hairline-b bg-[var(--color-paper-2)] px-4 py-2 flex flex-wrap items-center justify-between text-xs font-mono select-none z-20 gap-2">
        {/* Left: View Switcher (2D CAD / 3D BIM / Finishes / Before-After Visualizer) */}
        <div className="flex items-center gap-2">
          <div className="flex bg-[var(--color-paper)] border border-[var(--color-rule-2)] p-0.5 rounded">
            <button
              type="button"
              onClick={() => setActiveTab('2d')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded transition cursor-pointer ${
                activeTab === '2d'
                  ? 'bg-[var(--color-accent)] text-white font-semibold shadow-xs'
                  : 'text-[var(--color-muted)] hover:text-[var(--color-ink)]'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>2D CAD</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('3d')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded transition cursor-pointer ${
                activeTab === '3d'
                  ? 'bg-[var(--color-accent)] text-white font-semibold shadow-xs'
                  : 'text-[var(--color-muted)] hover:text-[var(--color-ink)]'
              }`}
            >
              <Box className="w-3.5 h-3.5" />
              <span>3D Massing</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('finishes')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded transition cursor-pointer ${
                activeTab === 'finishes'
                  ? 'bg-[var(--color-accent)] text-white font-semibold shadow-xs'
                  : 'text-[var(--color-muted)] hover:text-[var(--color-ink)]'
              }`}
            >
              <Palette className="w-3.5 h-3.5" />
              <span>Hearth Studio</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('visualizer')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded transition cursor-pointer ${
                activeTab === 'visualizer'
                  ? 'bg-[var(--color-accent)] text-white font-semibold shadow-xs'
                  : 'text-[var(--color-muted)] hover:text-[var(--color-ink)]'
              }`}
            >
              <SplitSquareVertical className="w-3.5 h-3.5" />
              <span>Split Render</span>
            </button>
          </div>

          {/* Floor Level Selector */}
          <div className="flex items-center gap-1">
            {project.floors.map((fl, idx) => (
              <button
                key={fl.floorIndex}
                type="button"
                onClick={() => setActiveFloorIndex(idx)}
                className={`px-2.5 py-1 rounded border text-[11px] transition cursor-pointer ${
                  activeFloorIndex === idx
                    ? 'border-[var(--color-accent)] bg-[var(--color-accent-subtle)] text-[var(--color-accent)] font-bold'
                    : 'border-[var(--color-rule-2)] bg-[var(--color-paper)] text-[var(--color-muted)] hover:text-[var(--color-ink)]'
                }`}
              >
                {fl.floorName}
              </button>
            ))}
          </div>
        </div>

        {/* Center: Live Validation Chips & Seed Badge */}
        <div className="hidden xl:flex items-center gap-2 text-[11px]">
          <div className="flex items-center gap-1 px-2.5 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
            <ShieldCheck className="w-3 h-3 text-emerald-600" />
            <span>NBC 2016 Compliant</span>
          </div>
          <div className="px-2 py-0.5 rounded bg-[var(--color-paper-3)] border border-[var(--color-rule-2)] text-[var(--color-muted)]">
            Design Seed: <span className="font-bold text-[var(--color-ink)]">#{project.seed || 10482}</span>
          </div>
          <div className="px-2 py-0.5 rounded bg-[var(--color-paper-3)] border border-[var(--color-rule-2)] text-[var(--color-muted)]">
            Carpet: <span className="font-bold text-[var(--color-ink)]">{project.totalCarpetSqFt} sqft ({project.carpetEfficiencyPercent}%)</span>
          </div>
        </div>

        {/* Right: Actions, Re-seed, Undo/Redo & Proceed */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleNewUniqueDesign}
            title="🎲 Re-seed for 100% Unique Plan"
            className="flex items-center gap-1 px-2.5 py-1 rounded border border-[var(--color-rule-2)] bg-[var(--color-paper)] hover:border-[var(--color-accent)] text-[var(--color-ink)] transition cursor-pointer text-xs font-mono"
          >
            <Dices className="w-3.5 h-3.5 text-[var(--color-accent)]" />
            <span className="hidden sm:inline">Unique Design</span>
          </button>

          <button
            type="button"
            onClick={() => {
              const prev = history.undo(project);
              if (prev) onProjectChange(prev);
            }}
            disabled={!history.canUndo()}
            title="Undo (Ctrl+Z)"
            className="p-1.5 rounded border border-[var(--color-rule-2)] bg-[var(--color-paper)] text-[var(--color-muted)] hover:text-[var(--color-ink)] disabled:opacity-30 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => {
              const next = history.redo(project);
              if (next) onProjectChange(next);
            }}
            disabled={!history.canRedo()}
            title="Redo (Ctrl+Shift+Z)"
            className="p-1.5 rounded border border-[var(--color-rule-2)] bg-[var(--color-paper)] text-[var(--color-muted)] hover:text-[var(--color-ink)] disabled:opacity-30 cursor-pointer"
          >
            <RotateCw className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={onProceedToConstruction}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded bg-[var(--color-accent)] text-white font-bold hover:opacity-90 transition cursor-pointer shadow-sm text-xs uppercase tracking-wider ml-1"
          >
            <Hammer className="w-3.5 h-3.5" />
            <span>Proceed to Civil &amp; Steel</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Studio Viewport */}
      <div className="flex-1 relative w-full h-full overflow-hidden flex">
        {activeTab === '2d' && (
          <div className="w-full h-full">
            <CADCanvas2D
              project={legacyProject}
              onUpdateProject={handleLegacyUpdate}
              selectedTool={selectedTool}
              unit="imperial"
              activeFloor={activeFloorIndex + 1}
              cadStyleMode={cadStyle}
              onToggleCadStyle={setCadStyle}
            />
          </div>
        )}

        {activeTab === '3d' && (
          <div className="w-full h-full">
            <Studio3D
              project={legacyProject}
              onUpdateProject={handleLegacyUpdate}
              activeFloor={activeFloorIndex + 1}
            />
          </div>
        )}

        {activeTab === 'finishes' && (
          <div className="w-full h-full flex flex-col md:flex-row overflow-hidden">
            {/* Left: 2D plan reference */}
            <div className="flex-1 h-full border-r border-[var(--color-rule-2)] relative">
              <CADCanvas2D
                project={legacyProject}
                onUpdateProject={handleLegacyUpdate}
                selectedTool="select"
                unit="imperial"
                activeFloor={activeFloorIndex + 1}
                cadStyleMode="presentation"
              />
            </div>
            {/* Right: Minute Design Picker */}
            <div className="w-full md:w-96 h-full flex-shrink-0">
              <MinuteDesignPanel
                config={minuteConfig}
                onChange={handleMinuteConfigChange}
                onNewUniqueDesign={handleNewUniqueDesign}
                onGenerateAiConcept={handleGenerateAiConcept}
              />
            </div>
          </div>
        )}

        {activeTab === 'visualizer' && (
          <div className="w-full h-full">
            <BeforeAfterVisualizer
              spaceTitle={`${project.conceptTitle} • ${activeFloor.floorName}`}
            />
          </div>
        )}
      </div>

      {/* Floating AI Chatbot Button (💬) */}
      <button
        type="button"
        onClick={() => setIsChatOpen(prev => !prev)}
        className="fixed bottom-6 right-6 z-30 px-4 py-2.5 rounded-full bg-[var(--color-accent)] text-white shadow-2xl hover:scale-105 transition flex items-center gap-2 font-mono text-xs font-bold cursor-pointer border border-white/20"
      >
        <MessageSquare className="w-4 h-4" />
        <span>💬 AI Copilot</span>
      </button>

      {/* Interactive AI Chatbot Drawer */}
      <StudioChatDrawer
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        project={project}
        onApplyPatch={handleApplyChatPatch}
      />
    </div>
  );
};
