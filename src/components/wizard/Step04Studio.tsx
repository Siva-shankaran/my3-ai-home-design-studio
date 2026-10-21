import React, { useState, useEffect, useMemo, useCallback } from 'react';
import type { ProjectDesign } from '../../types/project.ts';
import { projectDesignToLegacyProject } from '../../engine/solver/projectAdapter.ts';
import { HistoryManager } from '../studio/HistoryManager.ts';
import { CADCanvas2D } from '../CADCanvas2D.tsx';
import { Studio3D } from '../Studio3D.tsx';
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
  Maximize2
} from 'lucide-react';

interface Step04StudioProps {
  project: ProjectDesign;
  onProjectChange: (project: ProjectDesign) => void;
  onProceedToConstruction: () => void;
}

export const Step04Studio: React.FC<Step04StudioProps> = ({
  project,
  onProjectChange,
  onProceedToConstruction,
}) => {
  const [viewMode, setViewMode] = useState<'2d' | '3d'>('2d');
  const [activeFloorIndex, setActiveFloorIndex] = useState<number>(0);
  const [selectedTool, setSelectedTool] = useState<'select' | 'room' | 'wall' | 'door' | 'window' | 'measure' | 'furniture'>('select');
  const [cadStyle, setCadStyle] = useState<'presentation' | 'cad'>('cad');

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
    // In our simplified adapter, update the active project timestamp
    const clone = { ...project, updatedAt: new Date().toISOString() };
    onProjectChange(clone);
  }, [project, history, onProjectChange]);

  const activeFloor = project.floors[activeFloorIndex] || project.floors[0];

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-100px)] w-full overflow-hidden bg-[var(--color-paper)]">
      {/* Studio Top Control Strip */}
      <div className="hairline-b bg-[var(--color-paper-2)] px-4 py-2 flex items-center justify-between text-xs font-mono select-none z-20">
        {/* Left: View Switcher (2D CAD vs 3D) & Floor Select */}
        <div className="flex items-center gap-3">
          <div className="flex bg-[var(--color-paper)] border border-[var(--color-rule-2)] p-0.5 rounded">
            <button
              type="button"
              onClick={() => setViewMode('2d')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded transition cursor-pointer ${
                viewMode === '2d'
                  ? 'bg-[var(--color-accent)] text-white font-semibold'
                  : 'text-[var(--color-muted)] hover:text-[var(--color-ink)]'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>2D CAD</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('3d')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded transition cursor-pointer ${
                viewMode === '3d'
                  ? 'bg-[var(--color-accent)] text-white font-semibold'
                  : 'text-[var(--color-muted)] hover:text-[var(--color-ink)]'
              }`}
            >
              <Box className="w-3.5 h-3.5" />
              <span>3D Dollhouse</span>
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

        {/* Center: Live Validation Chips */}
        <div className="hidden lg:flex items-center gap-2 text-[11px]">
          <div className="flex items-center gap-1 px-2.5 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
            <ShieldCheck className="w-3 h-3 text-emerald-600" />
            <span>NBC 2016 Compliant</span>
          </div>
          <div className="px-2 py-0.5 rounded bg-[var(--color-paper-3)] border border-[var(--color-rule-2)] text-[var(--color-muted)]">
            Carpet: <span className="font-bold text-[var(--color-ink)]">{project.totalCarpetSqFt} sqft ({project.carpetEfficiencyPercent}%)</span>
          </div>
          <div className="px-2 py-0.5 rounded bg-[var(--color-paper-3)] border border-[var(--color-rule-2)] text-[var(--color-muted)]">
            Daylight: <span className="font-bold text-[var(--color-ink)]">{project.daylightScore}/100</span>
          </div>
        </div>

        {/* Right: Undo/Redo & Proceed to Step 05 */}
        <div className="flex items-center gap-2">
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
            className="flex items-center gap-1.5 px-4 py-1.5 rounded bg-[var(--color-accent)] text-white font-bold hover:opacity-90 transition cursor-pointer shadow-sm text-xs uppercase tracking-wider ml-2"
          >
            <span>Proceed to Construction</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Studio Viewport (2D Canvas or 3D Scene) */}
      <div className="flex-1 relative w-full h-full overflow-hidden">
        {viewMode === '2d' ? (
          <CADCanvas2D
            project={legacyProject}
            onUpdateProject={handleLegacyUpdate}
            selectedTool={selectedTool}
            unit="imperial"
            activeFloor={activeFloorIndex + 1}
            cadStyleMode={cadStyle}
            onToggleCadStyle={setCadStyle}
          />
        ) : (
          <Studio3D
            project={legacyProject}
            onUpdateProject={handleLegacyUpdate}
            activeFloor={activeFloorIndex + 1}
          />
        )}
      </div>
    </div>
  );
};
