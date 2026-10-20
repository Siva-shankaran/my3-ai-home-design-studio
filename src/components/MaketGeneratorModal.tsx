/* Hallmark · macrostructure: Workbench · theme: Charcoal-Silver-SignalRed · tone: architectural-stationery */
import React, { useState } from 'react';
import { 
  X, Sparkles, Layers, Maximize2, Check, ArrowRight, ArrowLeft, 
  DoorOpen, Home, Sliders, CheckCircle2, Compass, Zap
} from 'lucide-react';
import type { MaketGeneratorParams, MaketFootprintShape, MaketRoomRequirement, Project } from '../types';
import { designService } from '../services/designService';

interface MaketGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPlanGenerated: (project: Project) => void;
}

const DEFAULT_ROOMS: MaketRoomRequirement[] = [
  { id: 'master_bedroom', category: 'master_bedroom', label: 'Master Bedroom', count: 1, targetSqft: 180, required: true },
  { id: 'bedroom', category: 'bedroom', label: 'Secondary Bedroom', count: 1, targetSqft: 200 },
  { id: 'living_room', category: 'living_room', label: 'Open Great Living Room', count: 1, targetSqft: 240, required: true },
  { id: 'dining_room', category: 'dining_room', label: 'Dining Room', count: 1, targetSqft: 120 },
  { id: 'kitchen', category: 'kitchen', label: 'Chef Kitchen', count: 1, targetSqft: 200, required: true },
  { id: 'full_bathroom', category: 'full_bathroom', label: 'Full Bathroom', count: 1, targetSqft: 80, required: true },
  { id: 'half_bathroom', category: 'half_bathroom', label: 'Half Bathroom (Powder)', count: 1, targetSqft: 35 },
  { id: 'office', category: 'office', label: 'Home Office / Study', count: 1, targetSqft: 100 },
  { id: 'laundry', category: 'laundry', label: 'Laundry & Utility', count: 1, targetSqft: 80 },
  { id: 'pantry', category: 'pantry', label: 'Walk-in Pantry', count: 1, targetSqft: 30 },
  { id: 'walk_in', category: 'walk_in', label: 'Walk-in Wardrobe', count: 1, targetSqft: 75 },
  { id: 'entry', category: 'entry', label: 'Front Entry Foyer', count: 1, targetSqft: 40 }
];

const SHAPES: Array<{ id: MaketFootprintShape; label: string; desc: string; svgPath: string }> = [
  { 
    id: 'square', 
    label: 'Square / Rectangular', 
    desc: 'Cost-efficient, maximum volume-to-surface envelope', 
    svgPath: 'M4 4h32v32H4z' 
  },
  { 
    id: 'l_shape', 
    label: 'L - Shape', 
    desc: 'Zoned privacy wings with sheltered backyard patio', 
    svgPath: 'M4 4h18v16h14v16H4z' 
  },
  { 
    id: 'u_shape', 
    label: 'U - Shape', 
    desc: 'Central courtyard atrium with multi-directional daylight', 
    svgPath: 'M4 4h12v18h8V4h12v32H4z' 
  },
  { 
    id: 't_shape', 
    label: 'T - Shape', 
    desc: 'Distinct living vs sleeping wings, prominent entrance', 
    svgPath: 'M4 4h32v14H24v18h-8V18H4z' 
  },
  { 
    id: 'h_shape', 
    label: 'H - Shape', 
    desc: 'Dual courtyard cross-ventilation, split wing architecture', 
    svgPath: 'M4 4h10v12h12V4h10v32H26V24H14v12H4z' 
  },
  { 
    id: 'plus_shape', 
    label: 'Plus Shape', 
    desc: 'Four corner exterior exposures, 360-degree perimeter views', 
    svgPath: 'M14 4h12v10h10v12H26v10H14V26H4V14h10z' 
  },
  { 
    id: 'z_shape', 
    label: 'Z - Shape', 
    desc: 'Stepped modern profile with front and rear terraces', 
    svgPath: 'M4 4h20v14h12v18H16V22H4z' 
  }
];

export const MaketGeneratorModal: React.FC<MaketGeneratorModalProps> = ({
  isOpen,
  onClose,
  onPlanGenerated
}) => {
  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5>(1);
  const [isGenerating, setIsGenerating] = useState(false);

  // Stage 1: Floors
  const [floorCount, setFloorCount] = useState<1 | 2 | 3>(1);

  // Stage 2: Area
  const [targetSqft, setTargetSqft] = useState<number>(1300);

  // Stage 3: Footprint Shape
  const [shape, setShape] = useState<MaketFootprintShape>('square');

  // Stage 4: Rooms checklist
  const [rooms, setRooms] = useState<MaketRoomRequirement[]>(DEFAULT_ROOMS);

  // Stage 5: Front Door & Style
  const [frontDoorWall, setFrontDoorWall] = useState<'front' | 'back' | 'left' | 'right'>('front');
  const [frontDoorAlignment, setFrontDoorAlignment] = useState<'start' | 'center' | 'end'>('center');
  const [style, setStyle] = useState<'Coastal' | 'Modern' | 'Minimalist' | 'Scandinavian' | 'Contemporary'>('Coastal');
  const [projectName, setProjectName] = useState<string>('Maket Residential Layout');

  if (!isOpen) return null;

  const updateRoomCount = (id: string, delta: number) => {
    setRooms(prev => prev.map(r => {
      if (r.id === id) {
        const newCount = Math.max(0, r.count + delta);
        return { ...r, count: newCount };
      }
      return r;
    }));
  };

  const handleLoadSamplePlan = () => {
    setIsGenerating(true);
    setTimeout(() => {
      const sample = designService.getMaketSampleProject();
      onPlanGenerated(sample);
      setIsGenerating(false);
      onClose();
    }, 300);
  };

  const handleGenerateCustom = async () => {
    setIsGenerating(true);
    try {
      const activeRooms = rooms.filter(r => r.count > 0);
      const generated = await designService.generateMaketFlowPlan({
        floorCount,
        targetSqft,
        shape,
        rooms: activeRooms,
        frontDoorWall,
        frontDoorAlignment,
        style,
        projectName: projectName || `${floorCount}-Story ${shape.replace('_', ' ').toUpperCase()} Home (${targetSqft} sqft)`
      });
      onPlanGenerated(generated);
      onClose();
    } catch (err) {
      console.error('Failed to generate Maket plan:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const totalSelectedRoomsCount = rooms.reduce((acc, r) => acc + r.count, 0);

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 select-none animate-fadeIn font-sans">
      <div className="bg-[var(--color-paper-2)] border border-[var(--color-rule)] rounded-lg w-full max-w-3xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Header Bar */}
        <div className="p-4 sm:p-5 bg-[var(--color-paper-3)] border-b border-[var(--color-rule)] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded bg-[#dc2626]/10 border border-[#dc2626]/40 flex items-center justify-center text-[#dc2626]">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono uppercase tracking-wider text-[#dc2626] font-bold">MAKET.AI PIPELINE</span>
                <span className="text-[10px] bg-[#dc2626]/15 text-[#dc2626] border border-[#dc2626]/30 px-1.5 py-0.2 rounded font-mono font-semibold">MEX 0.2</span>
              </div>
              <h2 className="text-base sm:text-lg font-bold text-[var(--color-ink)] font-display tracking-tight">
                Architectural Floorplan Generator
              </h2>
            </div>
          </div>

          <button 
            onClick={onClose}
            className="w-8 h-8 rounded border border-[var(--color-rule)] flex items-center justify-center hover:bg-[var(--color-paper)] text-[var(--color-muted)] hover:text-[var(--color-ink)] transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Quick Load Sample Ribbon */}
        <div className="bg-gradient-to-r from-[#dc2626]/10 via-[#dc2626]/5 to-transparent px-4 sm:px-6 py-2.5 border-b border-[#dc2626]/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-xs text-[var(--color-ink)]">
            <Zap className="w-4 h-4 text-[#dc2626] shrink-0" />
            <span>
              <strong>Sample Asset:</strong> 1-Story Home (2 beds, 1.5 baths — 1,300 sqft, 16 zones, 27 fixtures, 11 cameras)
            </span>
          </div>
          <button
            onClick={handleLoadSamplePlan}
            disabled={isGenerating}
            className="px-3 py-1 bg-[#dc2626] hover:bg-[#b91c1c] text-white rounded text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer whitespace-nowrap shadow-sm"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Load Sample Plan</span>
          </button>
        </div>

        {/* Step Indicator Tabs */}
        <div className="grid grid-cols-5 border-b border-[var(--color-rule)] bg-[var(--color-paper)] text-xs font-mono">
          {[
            { num: 1, label: 'Levels' },
            { num: 2, label: 'Area' },
            { num: 3, label: 'Footprint' },
            { num: 4, label: 'Program' },
            { num: 5, label: 'Entrance' }
          ].map(s => (
            <button
              key={s.num}
              onClick={() => setStep(s.num as any)}
              className={`py-2 px-1 sm:px-2 flex flex-col sm:flex-row items-center justify-center gap-1 border-r border-[var(--color-rule)] last:border-r-0 transition ${
                step === s.num 
                  ? 'bg-[#dc2626]/15 text-[#dc2626] font-bold border-b-2 border-b-[#dc2626]' 
                  : step > s.num
                  ? 'text-[var(--color-ink)] hover:bg-[var(--color-paper-2)]'
                  : 'text-[var(--color-muted)] hover:bg-[var(--color-paper-2)]'
              }`}
            >
              <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${
                step === s.num ? 'bg-[#dc2626] text-white' : step > s.num ? 'bg-[var(--color-ink)] text-[var(--color-paper)]' : 'bg-[var(--color-rule)] text-[var(--color-muted)]'
              }`}>
                {s.num}
              </span>
              <span className="hidden sm:inline">{s.label}</span>
            </button>
          ))}
        </div>

        {/* Wizard Step Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-6">
          
          {/* STEP 1: Floor Count */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <span className="text-[11px] font-mono text-[#dc2626] font-bold">STAGE 1/5 // LEVEL SPECIFICATION</span>
                <h3 className="text-base font-bold text-[var(--color-ink)]">How many floors does your project require?</h3>
                <p className="text-xs text-[var(--color-muted)] font-mono mt-0.5">
                  Maket calculates vertical egress, wet wall stack alignment, and ceiling heights automatically.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                {[
                  { count: 1, label: '1 - Story', sub: 'Single-level ranch / bungalow', desc: 'No stairs, zero barrier accessibility, rapid framing' },
                  { count: 2, label: '2 - Story', sub: 'Standard modern duplex', desc: 'Ground-level living with private upper sleeping quarters' },
                  { count: 3, label: '3 - Story', sub: 'Urban triplex / townhouse', desc: 'Compact footprint, rooftop terrace, vertical zoning' }
                ].map(opt => (
                  <div
                    key={opt.count}
                    onClick={() => setFloorCount(opt.count as any)}
                    className={`p-4 rounded border transition cursor-pointer flex flex-col justify-between ${
                      floorCount === opt.count
                        ? 'border-[#dc2626] bg-[#dc2626]/10 shadow-sm'
                        : 'border-[var(--color-rule)] bg-[var(--color-paper)] hover:border-[var(--color-muted)]'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-bold text-[var(--color-ink)]">{opt.label}</span>
                        {floorCount === opt.count && <Check className="w-4 h-4 text-[#dc2626]" />}
                      </div>
                      <div className="text-xs font-semibold text-[#dc2626] font-mono">{opt.sub}</div>
                      <p className="text-[11px] text-[var(--color-muted)] mt-2 font-mono leading-relaxed">{opt.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* STEP 2: Target Area */}
          {step === 2 && (
            <div className="space-y-5">
              <div>
                <span className="text-[11px] font-mono text-[#dc2626] font-bold">STAGE 2/5 // GROSS FOOTPRINT ENVELOPE</span>
                <h3 className="text-base font-bold text-[var(--color-ink)]">What is your target floor area?</h3>
                <p className="text-xs text-[var(--color-muted)] font-mono mt-0.5">
                  Maket MEX 0.2 scales internal room aspect ratios proportionally to maintain IRC clearances.
                </p>
              </div>

              <div className="p-4 rounded border border-[var(--color-rule)] bg-[var(--color-paper)] space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-semibold text-[var(--color-ink)]">GROSS BUILT AREA</span>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold font-mono text-[#dc2626]">{targetSqft.toLocaleString()}</span>
                    <span className="text-xs font-mono text-[var(--color-muted)]">SQ FT ({Math.round(targetSqft * 0.092903)} M²)</span>
                  </div>
                </div>

                <input
                  type="range"
                  min={800}
                  max={4500}
                  step={50}
                  value={targetSqft}
                  onChange={(e) => setTargetSqft(Number(e.target.value))}
                  className="w-full accent-[#dc2626] cursor-pointer"
                />

                <div className="grid grid-cols-4 gap-2 pt-2">
                  {[
                    { label: 'Compact', sqft: 950 },
                    { label: 'Maket Sample', sqft: 1300 },
                    { label: 'Mid-Family', sqft: 2200 },
                    { label: 'Estate', sqft: 3600 }
                  ].map(b => (
                    <button
                      key={b.sqft}
                      onClick={() => setTargetSqft(b.sqft)}
                      className={`py-1.5 px-2 rounded text-xs font-mono border transition cursor-pointer ${
                        targetSqft === b.sqft
                          ? 'bg-[#dc2626] text-white border-[#dc2626]'
                          : 'border-[var(--color-rule)] hover:bg-[var(--color-paper-2)] text-[var(--color-ink)]'
                      }`}
                    >
                      {b.label} ({b.sqft})
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Footprint Shape Presets */}
          {step === 3 && (
            <div className="space-y-4">
              <div>
                <span className="text-[11px] font-mono text-[#dc2626] font-bold">STAGE 3/5 // GEOMETRIC FOOTPRINT</span>
                <h3 className="text-base font-bold text-[var(--color-ink)]">Select the architectural envelope shape</h3>
                <p className="text-xs text-[var(--color-muted)] font-mono mt-0.5">
                  Pre-configured polygon configurations matching Maket&apos;s internal boundary optimizer.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {SHAPES.map(s => (
                  <div
                    key={s.id}
                    onClick={() => setShape(s.id)}
                    className={`p-3 rounded border transition cursor-pointer flex flex-col justify-between ${
                      shape === s.id
                        ? 'border-[#dc2626] bg-[#dc2626]/10 shadow-sm'
                        : 'border-[var(--color-rule)] bg-[var(--color-paper)] hover:border-[var(--color-muted)]'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-[var(--color-ink)] font-mono">{s.label}</span>
                        {shape === s.id && <Check className="w-3.5 h-3.5 text-[#dc2626]" />}
                      </div>

                      <div className="h-16 flex items-center justify-center bg-[var(--color-paper-2)] rounded border border-[var(--color-rule)] mb-2">
                        <svg className="w-10 h-10 text-[#dc2626]" viewBox="0 0 40 40" fill="none">
                          <path d={s.svgPath} fill="currentColor" fillOpacity={0.25} stroke="currentColor" strokeWidth={2} />
                        </svg>
                      </div>

                      <p className="text-[10px] text-[var(--color-muted)] font-mono leading-tight">{s.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* STEP 4: Room Checklist & Program */}
          {step === 4 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-mono text-[#dc2626] font-bold">STAGE 4/5 // ROOM PROGRAMMING</span>
                  <h3 className="text-base font-bold text-[var(--color-ink)]">Configure room zones & count</h3>
                  <p className="text-xs text-[var(--color-muted)] font-mono mt-0.5">
                    Total rooms selected: <strong>{totalSelectedRoomsCount}</strong>
                  </p>
                </div>
                <button
                  onClick={() => setRooms(DEFAULT_ROOMS)}
                  className="text-xs text-[#dc2626] hover:underline font-mono cursor-pointer"
                >
                  Reset Defaults
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-72 overflow-y-auto pr-1">
                {rooms.map(r => (
                  <div
                    key={r.id}
                    className="p-2.5 rounded border border-[var(--color-rule)] bg-[var(--color-paper)] flex items-center justify-between"
                  >
                    <div>
                      <div className="text-xs font-semibold text-[var(--color-ink)] flex items-center gap-1.5">
                        <span>{r.label}</span>
                        {r.required && (
                          <span className="text-[9px] bg-[#dc2626]/10 text-[#dc2626] font-mono px-1 rounded">Required</span>
                        )}
                      </div>
                      <div className="text-[10px] text-[var(--color-muted)] font-mono">
                        Target ~{r.targetSqft} sqft
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateRoomCount(r.id, -1)}
                        disabled={r.required && r.count <= 1}
                        className="w-6 h-6 rounded border border-[var(--color-rule)] flex items-center justify-center hover:bg-[var(--color-paper-2)] disabled:opacity-40 text-xs font-mono font-bold cursor-pointer"
                      >
                        -
                      </button>
                      <span className="w-5 text-center text-xs font-mono font-bold text-[var(--color-ink)]">
                        {r.count}
                      </span>
                      <button
                        onClick={() => updateRoomCount(r.id, 1)}
                        className="w-6 h-6 rounded border border-[var(--color-rule)] flex items-center justify-center hover:bg-[var(--color-paper-2)] text-xs font-mono font-bold cursor-pointer"
                      >
                        +
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* STEP 5: Entrance & Finishes */}
          {step === 5 && (
            <div className="space-y-4">
              <div>
                <span className="text-[11px] font-mono text-[#dc2626] font-bold">STAGE 5/5 // ORIENTATION & FINISHES</span>
                <h3 className="text-base font-bold text-[var(--color-ink)]">Front Entrance & Architectural Style</h3>
                <p className="text-xs text-[var(--color-muted)] font-mono mt-0.5">
                  Establishes street access orientation, entryway foyer connection, and 3D rendering textures.
                </p>
              </div>

              <div className="space-y-3">
                <label className="block text-xs font-mono font-semibold text-[var(--color-ink)]">
                  PROJECT IDENTIFIER / TITLE
                </label>
                <input
                  type="text"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  className="w-full bg-[var(--color-paper)] border border-[var(--color-rule)] rounded px-3 py-2 text-xs font-mono text-[var(--color-ink)] focus:outline-none focus:border-[#dc2626]"
                  placeholder="e.g. Modern Coastal 1-Story Residence"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                <div className="space-y-2">
                  <label className="block text-xs font-mono font-semibold text-[var(--color-ink)]">
                    FRONT ENTRY WALL
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {(['front', 'back', 'left', 'right'] as const).map(w => (
                      <button
                        key={w}
                        onClick={() => setFrontDoorWall(w)}
                        className={`py-1.5 px-3 rounded text-xs font-mono border capitalize transition cursor-pointer ${
                          frontDoorWall === w
                            ? 'bg-[#dc2626] text-white border-[#dc2626]'
                            : 'border-[var(--color-rule)] bg-[var(--color-paper)] hover:bg-[var(--color-paper-2)] text-[var(--color-ink)]'
                        }`}
                      >
                        {w} Wall
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-xs font-mono font-semibold text-[var(--color-ink)]">
                    ARCHITECTURAL FINISH STYLE
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {(['Coastal', 'Modern', 'Minimalist', 'Scandinavian', 'Contemporary'] as const).map(st => (
                      <button
                        key={st}
                        onClick={() => setStyle(st)}
                        className={`py-1.5 px-3 rounded text-xs font-mono border transition cursor-pointer ${
                          style === st
                            ? 'bg-[#dc2626] text-white border-[#dc2626]'
                            : 'border-[var(--color-rule)] bg-[var(--color-paper)] hover:bg-[var(--color-paper-2)] text-[var(--color-ink)]'
                        }`}
                      >
                        {st}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Requirement Summary Card */}
              <div className="p-3 bg-[var(--color-paper)] rounded border border-[var(--color-rule)] text-xs font-mono space-y-1">
                <div className="font-bold text-[var(--color-ink)] mb-1">GENERATION SUMMARY //</div>
                <div className="text-[var(--color-muted)] flex justify-between">
                  <span>Enclosure:</span>
                  <span className="text-[var(--color-ink)]">{floorCount} Floor(s) · {targetSqft} sqft · {shape.toUpperCase()}</span>
                </div>
                <div className="text-[var(--color-muted)] flex justify-between">
                  <span>Program:</span>
                  <span className="text-[var(--color-ink)]">{totalSelectedRoomsCount} Zones Selected</span>
                </div>
                <div className="text-[var(--color-muted)] flex justify-between">
                  <span>Access:</span>
                  <span className="text-[var(--color-ink)]">{frontDoorWall.toUpperCase()} Wall ({frontDoorAlignment}) · {style} Finish</span>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Footer Navigation Bar */}
        <div className="p-4 bg-[var(--color-paper-3)] border-t border-[var(--color-rule)] flex items-center justify-between">
          <button
            onClick={() => setStep(prev => Math.max(1, prev - 1) as any)}
            disabled={step === 1 || isGenerating}
            className="px-3.5 py-1.5 rounded border border-[var(--color-rule)] text-xs font-mono font-semibold flex items-center gap-1.5 hover:bg-[var(--color-paper)] disabled:opacity-40 transition cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Previous</span>
          </button>

          <div className="flex items-center gap-2">
            {step < 5 ? (
              <button
                onClick={() => setStep(prev => Math.min(5, prev + 1) as any)}
                className="px-4 py-1.5 bg-[var(--color-ink)] text-[var(--color-paper)] hover:opacity-90 rounded text-xs font-mono font-semibold flex items-center gap-1.5 transition cursor-pointer"
              >
                <span>Continue</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                onClick={handleGenerateCustom}
                disabled={isGenerating}
                className="px-5 py-2 bg-[#dc2626] hover:bg-[#b91c1c] text-white rounded text-xs font-mono font-semibold flex items-center gap-2 transition cursor-pointer shadow-md disabled:opacity-50"
              >
                <Sparkles className="w-4 h-4" />
                <span>{isGenerating ? 'Synthesizing Plan...' : 'Generate Maket Plan'}</span>
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
