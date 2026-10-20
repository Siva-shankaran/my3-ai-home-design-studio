/* Hallmark · macrostructure: Workbench · theme: Charcoal-Silver-SignalRed · tone: architectural-stationery */
import React, { useState } from 'react';
import { 
  X, Sparkles, Layers, CheckCircle2, ArrowRight, ArrowLeft, 
  Ruler, Building, ShieldCheck, Eye, Compass, Home, Sliders,
  Check, Maximize2, FileText, ChevronRight, AlertTriangle
} from 'lucide-react';
import { Project } from '../types';
import { CandidateGenerator, UserDesignRequirements, DesignCandidate } from '../engine/generator/candidateGenerator';
import { Units } from '../engine/geometry/units';

interface DesignConceptModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectDesign: (project: Project, targetView: 'editor2d' | 'studio3d') => void;
}

export const DesignConceptModal: React.FC<DesignConceptModalProps> = ({
  isOpen,
  onClose,
  onSelectDesign
}) => {
  // Wizard state: 'input' -> 'review' -> 'results'
  const [wizardStep, setWizardStep] = useState<'input' | 'results'>('input');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);

  // User Requirements Form
  const [plotWidth, setPlotWidth] = useState<number>(45);
  const [plotDepth, setPlotDepth] = useState<number>(60);
  const [targetSqft, setTargetSqft] = useState<number>(2200);
  const [floors, setFloors] = useState<1 | 2>(2);
  const [bedrooms, setBedrooms] = useState<number>(3);
  const [bathrooms, setBathrooms] = useState<number>(3);
  const [style, setStyle] = useState<string>('Contemporary Open-Plan');
  const [roadFacing, setRoadFacing] = useState<'North' | 'South' | 'East' | 'West'>('North');
  
  // Lifestyle feature toggles
  const [hasCourtyard, setHasCourtyard] = useState<boolean>(false);
  const [hasPoojaRoom, setHasPoojaRoom] = useState<boolean>(true);
  const [hasHomeOffice, setHasHomeOffice] = useState<boolean>(true);
  const [hasCarParking, setHasCarParking] = useState<boolean>(true);

  // Natural language query input
  const [nlPrompt, setNlPrompt] = useState<string>('');

  // Generated Candidates
  const [candidates, setCandidates] = useState<DesignCandidate[]>([]);
  const [selectedCandidateIndex, setSelectedCandidateIndex] = useState<number>(0);
  const [comparisonView, setComparisonView] = useState<boolean>(false);

  if (!isOpen) return null;

  const plotArea = plotWidth * plotDepth;
  const setbacks = { front: 5, rear: 5, left: 3.5, right: 3.5 };
  const buildableWidth = Math.max(10, plotWidth - (setbacks.left + setbacks.right));
  const buildableDepth = Math.max(10, plotDepth - (setbacks.front + setbacks.rear));
  const maxGroundFootprint = buildableWidth * buildableDepth;

  const handleParseNlPrompt = () => {
    if (!nlPrompt.trim()) return;
    const lower = nlPrompt.toLowerCase();

    // Parse sqft
    const sqftMatch = lower.match(/(\d{3,4})\s*(?:sq\s*ft|sqft|square\s*feet)/);
    if (sqftMatch) setTargetSqft(parseInt(sqftMatch[1]));

    // Parse bedrooms
    const bedMatch = lower.match(/(\d+)\s*(?:bed|bedroom|bhk)/);
    if (bedMatch) setBedrooms(parseInt(bedMatch[1]));

    // Parse floors
    if (lower.includes('two storey') || lower.includes('two-storey') || lower.includes('2 story') || lower.includes('2-story') || lower.includes('duplex')) {
      setFloors(2);
    } else if (lower.includes('single storey') || lower.includes('1 story') || lower.includes('bungalow') || lower.includes('ranch')) {
      setFloors(1);
    }

    // Features
    if (lower.includes('courtyard') || lower.includes('muttram') || lower.includes('atrium')) setHasCourtyard(true);
    if (lower.includes('pooja') || lower.includes('puja') || lower.includes('prayer')) setHasPoojaRoom(true);
    if (lower.includes('office') || lower.includes('study')) setHasHomeOffice(true);
    if (lower.includes('parking') || lower.includes('garage') || lower.includes('car')) setHasCarParking(true);
  };

  const handleGenerateThreeDesigns = () => {
    setIsGenerating(true);
    setTimeout(() => {
      const requirements: UserDesignRequirements = {
        plotWidthFeet: plotWidth,
        plotDepthFeet: plotDepth,
        targetSqft,
        floors,
        bedrooms,
        bathrooms,
        style,
        roadFacingSide: roadFacing,
        hasCourtyard,
        hasPoojaRoom,
        hasHomeOffice,
        hasCarParking,
        setbacks
      };

      const results = CandidateGenerator.generateThreeCandidates(requirements);
      setCandidates(results);
      setSelectedCandidateIndex(0);
      setIsGenerating(false);
      setWizardStep('results');
    }, 400);
  };

  const activeCandidate = candidates[selectedCandidateIndex] || candidates[0];

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 font-sans select-none animate-fadeIn">
      <div className="bg-[var(--color-paper-2)] border border-[var(--color-rule)] rounded-lg w-full max-w-5xl max-h-[94vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Modal Top Header */}
        <div className="px-5 py-4 bg-[var(--color-paper-3)] border-b border-[var(--color-rule)] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-[#dc2626]/10 border border-[#dc2626]/40 flex items-center justify-center text-[#dc2626]">
              <Building className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono text-[#dc2626] font-bold tracking-wider">
                  DETERMINISTIC ARCHITECTURAL ENGINE //
                </span>
                <span className="text-[10px] bg-[#dc2626]/10 text-[#dc2626] font-mono px-1.5 py-0.2 rounded font-semibold border border-[#dc2626]/30">
                  3-CONCEPT SYNTHESIS
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-bold text-[var(--color-ink)] font-display">
                {wizardStep === 'input' ? 'Residential Requirements & Plot Definition' : 'Architectural Design Concepts (3 Alternatives)'}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {wizardStep === 'results' && (
              <button
                onClick={() => setComparisonView(v => !v)}
                className={`px-3 py-1 rounded text-xs font-mono border transition cursor-pointer ${
                  comparisonView 
                    ? 'bg-[#dc2626] text-white border-[#dc2626]' 
                    : 'bg-[var(--color-paper)] border-[var(--color-rule)] text-[var(--color-ink)] hover:bg-[var(--color-paper-2)]'
                }`}
              >
                {comparisonView ? 'Hide Comparison Table' : 'Compare 3 Options'}
              </button>
            )}

            <button
              onClick={onClose}
              className="w-8 h-8 rounded border border-[var(--color-rule)] flex items-center justify-center hover:bg-[var(--color-paper)] text-[var(--color-muted)] hover:text-[var(--color-ink)] transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* =====================================================================
            STEP 1: REQUIREMENTS INPUT WIZARD
        ===================================================================== */}
        {wizardStep === 'input' && (
          <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1">
            
            {/* Natural Language Prompt Assistant */}
            <div className="p-4 rounded-lg border border-[var(--color-rule)] bg-[var(--color-paper)] space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-[var(--color-ink)] flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#dc2626]" />
                  <span>NATURAL LANGUAGE ARCHITECTURAL PROMPT (OPTIONAL)</span>
                </span>
                <span className="text-[10px] font-mono text-[var(--color-muted)]">AI Prompt Parser</span>
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g. Modern 2,200 sqft, 2-storey home with 3 bedrooms, central courtyard, and car porch"
                  value={nlPrompt}
                  onChange={(e) => setNlPrompt(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleParseNlPrompt(); }}
                  className="flex-1 bg-[var(--color-paper-2)] border border-[var(--color-rule)] rounded px-3 py-2 text-xs font-mono text-[var(--color-ink)] focus:outline-none focus:border-[#dc2626]"
                />
                <button
                  onClick={handleParseNlPrompt}
                  className="px-3 py-1.5 bg-[var(--color-ink)] text-[var(--color-paper)] rounded text-xs font-mono font-semibold hover:opacity-90 transition cursor-pointer whitespace-nowrap"
                >
                  Auto-Fill
                </button>
              </div>
            </div>

            {/* Plot Dimensions & Setback Calculations */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              
              <div className="p-4 rounded-lg border border-[var(--color-rule)] bg-[var(--color-paper)] space-y-4">
                <div className="text-xs font-mono font-bold text-[#dc2626]">
                  01 // PLOT ENVELOPE & SETBACKS
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-mono text-[var(--color-muted)] mb-1">
                      PLOT WIDTH (FRONTAGE)
                    </label>
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        min={20}
                        max={150}
                        value={plotWidth}
                        onChange={(e) => setPlotWidth(Math.max(20, Number(e.target.value)))}
                        className="w-full bg-[var(--color-paper-2)] border border-[var(--color-rule)] rounded px-2.5 py-1.5 text-xs font-mono font-bold text-[var(--color-ink)]"
                      />
                      <span className="text-xs font-mono text-[var(--color-muted)]">FT</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-mono text-[var(--color-muted)] mb-1">
                      PLOT DEPTH
                    </label>
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        min={30}
                        max={200}
                        value={plotDepth}
                        onChange={(e) => setPlotDepth(Math.max(30, Number(e.target.value)))}
                        className="w-full bg-[var(--color-paper-2)] border border-[var(--color-rule)] rounded px-2.5 py-1.5 text-xs font-mono font-bold text-[var(--color-ink)]"
                      />
                      <span className="text-xs font-mono text-[var(--color-muted)]">FT</span>
                    </div>
                  </div>
                </div>

                {/* Plot Area distinction box */}
                <div className="p-3 bg-[var(--color-paper-2)] rounded border border-[var(--color-rule)] text-xs font-mono space-y-1">
                  <div className="flex justify-between text-[var(--color-muted)]">
                    <span>Total Land Plot Area:</span>
                    <span className="font-bold text-[var(--color-ink)]">{plotArea.toLocaleString()} sq ft ({Number((plotArea / 435.6).toFixed(1))} Cents)</span>
                  </div>
                  <div className="flex justify-between text-[var(--color-muted)]">
                    <span>Statutory Setbacks:</span>
                    <span className="text-[var(--color-ink)]">Front 5&apos; · Rear 5&apos; · Sides 3.5&apos;</span>
                  </div>
                  <div className="flex justify-between text-[var(--color-muted)]">
                    <span>Max Ground Footprint:</span>
                    <span className="font-bold text-emerald-600">{maxGroundFootprint.toLocaleString()} sq ft ({Math.round(maxGroundFootprint / plotArea * 100)}% coverage)</span>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-mono text-[var(--color-muted)] mb-1">
                    ROAD ORIENTATION
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {(['North', 'South', 'East', 'West'] as const).map(dir => (
                      <button
                        key={dir}
                        onClick={() => setRoadFacing(dir)}
                        className={`py-1 rounded text-xs font-mono border transition cursor-pointer ${
                          roadFacing === dir
                            ? 'bg-[#dc2626] text-white border-[#dc2626]'
                            : 'border-[var(--color-rule)] bg-[var(--color-paper-2)] text-[var(--color-ink)]'
                        }`}
                      >
                        {dir}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* House Requirements */}
              <div className="p-4 rounded-lg border border-[var(--color-rule)] bg-[var(--color-paper)] space-y-4">
                <div className="text-xs font-mono font-bold text-[#dc2626]">
                  02 // RESIDENCE PROGRAM & SPECIFICATION
                </div>

                {/* Target Sqft Slider */}
                <div>
                  <div className="flex justify-between items-center mb-1 text-xs font-mono">
                    <span className="text-[var(--color-muted)]">TARGET BUILT-UP AREA</span>
                    <span className="font-bold text-[#dc2626] text-sm">{targetSqft.toLocaleString()} SQ FT</span>
                  </div>
                  <input
                    type="range"
                    min={600}
                    max={5000}
                    step={50}
                    value={targetSqft}
                    onChange={(e) => setTargetSqft(Number(e.target.value))}
                    className="w-full accent-[#dc2626] cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] font-mono text-[var(--color-muted)]">
                    <span>600 (Compact)</span>
                    <span>1,300 (Maket)</span>
                    <span>2,850 (Villa)</span>
                    <span>5,000 (Estate)</span>
                  </div>
                </div>

                {/* Floors, Bedrooms, Bathrooms */}
                <div className="grid grid-cols-3 gap-2 pt-1">
                  <div>
                    <label className="block text-[10px] font-mono text-[var(--color-muted)] mb-1">FLOORS</label>
                    <div className="grid grid-cols-2 gap-1">
                      {[1, 2].map(fl => (
                        <button
                          key={fl}
                          onClick={() => setFloors(fl as any)}
                          className={`py-1 rounded text-xs font-mono border transition cursor-pointer ${
                            floors === fl
                              ? 'bg-[#dc2626] text-white border-[#dc2626]'
                              : 'border-[var(--color-rule)] bg-[var(--color-paper-2)] text-[var(--color-ink)]'
                          }`}
                        >
                          {fl}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-mono text-[var(--color-muted)] mb-1">BEDROOMS</label>
                    <div className="flex items-center gap-1">
                      <button 
                        onClick={() => setBedrooms(b => Math.max(1, b - 1))}
                        className="w-6 h-6 rounded border border-[var(--color-rule)] flex items-center justify-center font-bold text-xs"
                      >
                        -
                      </button>
                      <span className="flex-1 text-center font-mono font-bold text-xs">{bedrooms}</span>
                      <button 
                        onClick={() => setBedrooms(b => Math.min(5, b + 1))}
                        className="w-6 h-6 rounded border border-[var(--color-rule)] flex items-center justify-center font-bold text-xs"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-mono text-[var(--color-muted)] mb-1">BATHROOMS</label>
                    <div className="flex items-center gap-1">
                      <button 
                        onClick={() => setBathrooms(b => Math.max(1, b - 1))}
                        className="w-6 h-6 rounded border border-[var(--color-rule)] flex items-center justify-center font-bold text-xs"
                      >
                        -
                      </button>
                      <span className="flex-1 text-center font-mono font-bold text-xs">{bathrooms}</span>
                      <button 
                        onClick={() => setBathrooms(b => Math.min(5, b + 1))}
                        className="w-6 h-6 rounded border border-[var(--color-rule)] flex items-center justify-center font-bold text-xs"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>

                {/* Specific Features Toggles */}
                <div className="pt-2">
                  <div className="text-[10px] font-mono text-[var(--color-muted)] mb-1.5 uppercase">LIFESTYLE FEATURES</div>
                  <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                    <label className="flex items-center gap-2 p-1.5 rounded border border-[var(--color-rule)] cursor-pointer hover:bg-[var(--color-paper-2)]">
                      <input type="checkbox" checked={hasCourtyard} onChange={(e) => setHasCourtyard(e.target.checked)} className="accent-[#dc2626]" />
                      <span>Courtyard / Atrium</span>
                    </label>
                    <label className="flex items-center gap-2 p-1.5 rounded border border-[var(--color-rule)] cursor-pointer hover:bg-[var(--color-paper-2)]">
                      <input type="checkbox" checked={hasPoojaRoom} onChange={(e) => setHasPoojaRoom(e.target.checked)} className="accent-[#dc2626]" />
                      <span>Pooja Room (பூஜை)</span>
                    </label>
                    <label className="flex items-center gap-2 p-1.5 rounded border border-[var(--color-rule)] cursor-pointer hover:bg-[var(--color-paper-2)]">
                      <input type="checkbox" checked={hasHomeOffice} onChange={(e) => setHasHomeOffice(e.target.checked)} className="accent-[#dc2626]" />
                      <span>Home Office / Study</span>
                    </label>
                    <label className="flex items-center gap-2 p-1.5 rounded border border-[var(--color-rule)] cursor-pointer hover:bg-[var(--color-paper-2)]">
                      <input type="checkbox" checked={hasCarParking} onChange={(e) => setHasCarParking(e.target.checked)} className="accent-[#dc2626]" />
                      <span>Car Porch / Parking</span>
                    </label>
                  </div>
                </div>

              </div>
            </div>

          </div>
        )}

        {/* =====================================================================
            STEP 2: 3-CONCEPT ARCHITECTURAL COMPARISON & SELECTION WORKSPACE
        ===================================================================== */}
        {wizardStep === 'results' && candidates.length > 0 && (
          <div className="p-4 sm:p-6 overflow-y-auto space-y-5 flex-1">
            
            {/* Candidate Selector Tabs */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {candidates.map((c, idx) => {
                const isSelected = selectedCandidateIndex === idx;
                return (
                  <div
                    key={c.id}
                    onClick={() => setSelectedCandidateIndex(idx)}
                    className={`p-3.5 rounded-lg border transition cursor-pointer flex flex-col justify-between ${
                      isSelected 
                        ? 'border-[#dc2626] bg-[#dc2626]/10 shadow-md ring-1 ring-[#dc2626]' 
                        : 'border-[var(--color-rule)] bg-[var(--color-paper)] hover:border-[var(--color-muted)]'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-[var(--color-paper-2)] border border-[var(--color-rule)] font-bold">
                          Option 0{c.optionIndex}
                        </span>
                        <span className="text-xs font-mono font-bold text-[#dc2626]">
                          Score: {c.evaluation.overallScore}/100
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-[var(--color-ink)] mt-1">
                        {c.strategyLabel}
                      </h4>
                      <div className="text-xs font-mono text-[var(--color-muted)] mt-0.5">
                        {c.project.sqft.toLocaleString()} sqft · {c.project.floors} Floor(s) · {c.project.rooms.filter(r => r.type === 'bedroom' || r.type === 'master_bedroom').length} Beds
                      </div>
                    </div>

                    <div className="mt-3 pt-2 border-t border-[var(--color-rule)]/60 flex items-center justify-between text-[11px] font-mono">
                      <span className="text-emerald-600 flex items-center gap-1 font-semibold">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Valid Geometry</span>
                      </span>
                      <span className="text-[#dc2626] hover:underline flex items-center gap-0.5">
                        <span>Inspect</span>
                        <ChevronRight className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Comparison Table View (When Toggled) */}
            {comparisonView && (
              <div className="p-4 rounded-lg border border-[var(--color-rule)] bg-[var(--color-paper)] overflow-x-auto text-xs font-mono">
                <div className="font-bold text-[#dc2626] mb-3">SIDE-BY-SIDE CONCEPT COMPARISON //</div>
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-[var(--color-rule)] text-[var(--color-muted)]">
                      <th className="py-2 pr-4">CRITERIA</th>
                      {candidates.map(c => (
                        <th key={c.id} className="py-2 px-3 font-bold text-[var(--color-ink)]">
                          Option 0{c.optionIndex}: {c.strategyLabel}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--color-rule)]">
                    <tr>
                      <td className="py-2 text-[var(--color-muted)]">Gross Built-Up Area</td>
                      {candidates.map(c => <td key={c.id} className="py-2 px-3 font-bold">{c.project.sqft} sqft</td>)}
                    </tr>
                    <tr>
                      <td className="py-2 text-[var(--color-muted)]">Total Programmatic Rooms</td>
                      {candidates.map(c => <td key={c.id} className="py-2 px-3">{c.project.rooms.length} Rooms</td>)}
                    </tr>
                    <tr>
                      <td className="py-2 text-[var(--color-muted)]">Circulation Ratio</td>
                      {candidates.map(c => <td key={c.id} className="py-2 px-3">{c.evaluation.criteria.spaceEfficiency.score}% efficiency</td>)}
                    </tr>
                    <tr>
                      <td className="py-2 text-[var(--color-muted)]">Natural Light Access</td>
                      {candidates.map(c => <td key={c.id} className="py-2 px-3">{c.evaluation.criteria.daylightAndVentilation.score}/100</td>)}
                    </tr>
                    <tr>
                      <td className="py-2 text-[var(--color-muted)]">Primary Advantage</td>
                      {candidates.map(c => <td key={c.id} className="py-2 px-3 text-emerald-600 font-semibold">{c.evaluation.strengths[0] || 'Optimized layout'}</td>)}
                    </tr>
                    <tr>
                      <td className="py-2 text-[var(--color-muted)]">Trade-Off</td>
                      {candidates.map(c => <td key={c.id} className="py-2 px-3 text-[var(--color-muted)]">{c.evaluation.tradeOffs[0] || 'Standard trade-offs'}</td>)}
                    </tr>
                  </tbody>
                </table>
              </div>
            )}

            {/* Active Candidate Deep Dive */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              
              {/* Floor Plan Miniature Schematic */}
              <div className="p-4 rounded-lg border border-[var(--color-rule)] bg-[var(--color-paper)] flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-mono font-bold text-[var(--color-ink)]">2D SCHEMATIC PREVIEW</span>
                    <span className="text-[10px] font-mono text-[var(--color-muted)]">Ground Floor</span>
                  </div>

                  {/* Lightweight Vector Blueprint Map */}
                  <div className="w-full h-48 bg-[var(--color-paper-2)] border border-[var(--color-rule)] rounded p-2 relative overflow-hidden flex items-center justify-center cad-grid">
                    <div className="relative w-44 h-36 border-2 border-[#dc2626]/70 rounded bg-white/60 p-1 flex flex-wrap gap-1 items-center justify-center">
                      {activeCandidate.project.rooms.slice(0, 6).map((r, i) => (
                        <div
                          key={i}
                          className="rounded text-[8px] font-mono text-center flex items-center justify-center border border-slate-400 bg-slate-100 text-slate-800 font-bold p-0.5"
                          style={{
                            width: `${Math.min(r.width * 2.5, 60)}px`,
                            height: `${Math.min(r.height * 2.5, 45)}px`
                          }}
                        >
                          {r.name.split(' ')[0]}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="pt-3 flex gap-2">
                  <button
                    onClick={() => onSelectDesign(activeCandidate.project, 'editor2d')}
                    className="flex-1 py-2 bg-[#dc2626] hover:bg-[#b91c1c] text-white rounded text-xs font-mono font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer shadow-sm"
                  >
                    <Ruler className="w-3.5 h-3.5" />
                    <span>Open in 2D Editor</span>
                  </button>
                  <button
                    onClick={() => onSelectDesign(activeCandidate.project, 'studio3d')}
                    className="flex-1 py-2 bg-[var(--color-paper-2)] hover:bg-[var(--color-paper-3)] border border-[var(--color-rule)] text-[var(--color-ink)] rounded text-xs font-mono font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>View in 3D Studio</span>
                  </button>
                </div>
              </div>

              {/* Room Schedule & Dimensions Breakdown */}
              <div className="p-4 rounded-lg border border-[var(--color-rule)] bg-[var(--color-paper)] space-y-3">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="font-bold text-[var(--color-ink)]">ROOM SCHEDULE</span>
                  <span className="text-[var(--color-muted)]">{activeCandidate.project.rooms.length} Programmatic Zones</span>
                </div>

                <div className="space-y-1.5 max-h-52 overflow-y-auto pr-1 text-xs font-mono">
                  {activeCandidate.project.rooms.map(r => (
                    <div key={r.id} className="p-2 rounded bg-[var(--color-paper-2)] border border-[var(--color-rule)] flex justify-between items-center">
                      <div className="font-semibold text-[var(--color-ink)] truncate max-w-[150px]">
                        {r.name}
                      </div>
                      <div className="text-right text-[var(--color-muted)]">
                        {r.width}&apos; × {r.height}&apos; · <span className="font-bold text-[#dc2626]">{Math.round(r.width * r.height)} sqft</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Evaluation & Scoring Breakdown */}
              <div className="p-4 rounded-lg border border-[var(--color-rule)] bg-[var(--color-paper)] space-y-3">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="font-bold text-[var(--color-ink)]">ARCHITECTURAL AUDIT</span>
                  <span className="font-bold text-emerald-600">{activeCandidate.evaluation.ratingTier}</span>
                </div>

                <div className="space-y-2 text-xs font-mono">
                  {Object.values(activeCandidate.evaluation.criteria).map(crit => (
                    <div key={crit.name} className="space-y-0.5">
                      <div className="flex justify-between text-[11px]">
                        <span className="text-[var(--color-muted)]">{crit.name}</span>
                        <span className="font-bold text-[var(--color-ink)]">{crit.score}/100</span>
                      </div>
                      <div className="w-full bg-[var(--color-paper-2)] h-1.5 rounded-full overflow-hidden">
                        <div 
                          className="bg-[#dc2626] h-full rounded-full" 
                          style={{ width: `${crit.score}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="p-2.5 bg-emerald-50 text-emerald-900 border border-emerald-200 rounded text-[11px] font-mono leading-tight">
                  <strong>Strength:</strong> {activeCandidate.evaluation.strengths[0]}
                </div>
              </div>

            </div>

          </div>
        )}

        {/* Modal Bottom Actions */}
        <div className="px-5 py-3.5 bg-[var(--color-paper-3)] border-t border-[var(--color-rule)] flex items-center justify-between">
          {wizardStep === 'results' ? (
            <button
              onClick={() => setWizardStep('input')}
              className="px-3.5 py-1.5 rounded border border-[var(--color-rule)] text-xs font-mono font-semibold flex items-center gap-1.5 hover:bg-[var(--color-paper)] transition cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Modify Requirements</span>
            </button>
          ) : (
            <div className="text-xs font-mono text-[var(--color-muted)]">
              Deterministic geometry engine · Zero mock hallucinations
            </div>
          )}

          {wizardStep === 'input' && (
            <button
              onClick={handleGenerateThreeDesigns}
              disabled={isGenerating}
              className="px-5 py-2 bg-[#dc2626] hover:bg-[#b91c1c] text-white rounded text-xs font-mono font-semibold flex items-center gap-2 transition cursor-pointer shadow-md disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4" />
              <span>{isGenerating ? 'Synthesizing 3 Concepts...' : 'Generate 3 Architectural Designs'}</span>
            </button>
          )}

          {wizardStep === 'results' && (
            <button
              onClick={() => onSelectDesign(activeCandidate.project, 'editor2d')}
              className="px-5 py-2 bg-[#dc2626] hover:bg-[#b91c1c] text-white rounded text-xs font-mono font-semibold flex items-center gap-2 transition cursor-pointer shadow-md"
            >
              <span>Accept & Edit Option 0{activeCandidate.optionIndex}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>

      </div>
    </div>
  );
};
