import React, { useState } from 'react';
import { ProjectDesign } from '../../types/project.ts';
import { DesignBrief } from '../../engine/intake/schemas.ts';
import { 
  Check, 
  ArrowRight, 
  Sparkles, 
  Maximize2, 
  ShieldCheck, 
  RefreshCw, 
  Compass, 
  Sun, 
  Layers,
  IndianRupee,
  Eye,
  X
} from 'lucide-react';

interface Step03ThreeDesignsProps {
  brief: DesignBrief;
  candidates: ProjectDesign[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onAcceptAndEdit: (id: string) => void;
  onRegenerate: () => void;
}

export const Step03ThreeDesigns: React.FC<Step03ThreeDesignsProps> = ({
  brief,
  candidates,
  selectedId,
  onSelect,
  onAcceptAndEdit,
  onRegenerate,
}) => {
  const [previewDesign, setPreviewDesign] = useState<ProjectDesign | null>(null);

  const activeId = selectedId || candidates[0]?.id;

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-5 bg-[var(--color-paper-2)] border border-[var(--color-rule-2)] rounded-lg">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-widest text-[var(--color-accent)] font-semibold">
            03 • Architectural Concepts Selection
          </span>
          <h1 className="font-serif text-2xl sm:text-3xl text-[var(--color-ink)] mt-0.5">
            Compare Three Distinct Architectural Solutions
          </h1>
          <p className="text-xs sm:text-sm text-[var(--color-muted)] font-sans mt-1">
            Every candidate represents a genuinely unique spatial topology enforced by mathematical fingerprint distance.
          </p>
        </div>

        <button
          type="button"
          onClick={onRegenerate}
          className="flex items-center gap-2 px-4 py-2 rounded text-xs font-mono uppercase tracking-wider bg-[var(--color-paper)] border border-[var(--color-rule-2)] hover:border-[var(--color-accent)] text-[var(--color-ink)] transition cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5 text-[var(--color-accent)]" />
          <span>Regenerate Concepts</span>
        </button>
      </div>

      {/* 3 Staggered Candidate Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {candidates.map((cand, idx) => {
          const isSelected = cand.id === activeId;
          const letter = idx === 0 ? 'A' : idx === 1 ? 'B' : 'C';

          return (
            <div
              key={cand.id}
              onClick={() => onSelect(cand.id)}
              className={`flex flex-col rounded-xl border transition-all cursor-pointer relative overflow-hidden ${
                isSelected
                  ? 'border-[var(--color-accent)] bg-[var(--color-paper)] shadow-xl ring-2 ring-[var(--color-accent)]/20'
                  : 'border-[var(--color-rule-2)] bg-[var(--color-paper-2)] hover:border-[var(--color-rule)] hover:shadow-md'
              }`}
            >
              {/* Concept Archetype Badge */}
              <div className="px-5 pt-5 pb-3 flex items-center justify-between border-b border-[var(--color-rule)]">
                <div className="flex items-center gap-2">
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center font-mono text-xs font-bold ${
                    isSelected ? 'bg-[var(--color-accent)] text-white' : 'bg-[var(--color-paper-3)] text-[var(--color-ink)]'
                  }`}>
                    {letter}
                  </span>
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--color-accent)] font-semibold">
                      {cand.archetype.replace('_', ' ')}
                    </span>
                    <h3 className="font-serif text-lg text-[var(--color-ink)] leading-tight">
                      {cand.conceptTitle}
                    </h3>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setPreviewDesign(cand);
                  }}
                  className="p-1.5 rounded hover:bg-[var(--color-paper-3)] text-[var(--color-muted)] hover:text-[var(--color-ink)]"
                  title="Full preview"
                >
                  <Maximize2 className="w-4 h-4" />
                </button>
              </div>

              {/* SVG 2D Thumbnail Blueprint */}
              <div className="p-4 bg-[var(--color-paper-3)] flex items-center justify-center min-h-[170px] border-b border-[var(--color-rule)] relative">
                <svg viewBox="0 0 240 160" className="w-full max-h-36">
                  {/* Outer Walls */}
                  <rect x="20" y="10" width="200" height="140" fill="#F4F1EA" stroke="#161513" strokeWidth="2" />
                  
                  {/* Room Polygons */}
                  {cand.floors[0]?.rooms.map((r) => {
                    const minX = Math.min(...r.polygon.map(p => p.x));
                    const maxX = Math.max(...r.polygon.map(p => p.x));
                    const minY = Math.min(...r.polygon.map(p => p.y));
                    const maxY = Math.max(...r.polygon.map(p => p.y));
                    const plotW = brief.plot.width;
                    const plotD = brief.plot.depth;
                    const svgX = 20 + (minX / plotW) * 200;
                    const svgY = 10 + (minY / plotD) * 140;
                    const svgW = ((maxX - minX) / plotW) * 200;
                    const svgH = ((maxY - minY) / plotD) * 140;

                    return (
                      <g key={r.id}>
                        <rect
                          x={svgX}
                          y={svgY}
                          width={svgW}
                          height={svgH}
                          fill={r.type === 'COURTYARD' ? '#e0f2fe' : r.type === 'THINNAI' ? '#fef3c7' : '#ffffff'}
                          stroke="#161513"
                          strokeWidth="1"
                        />
                        <text
                          x={svgX + svgW / 2}
                          y={svgY + svgH / 2}
                          textAnchor="middle"
                          dominantBaseline="middle"
                          fontSize="7"
                          fontFamily="monospace"
                          fill="#161513"
                          opacity="0.8"
                        >
                          {r.type.substring(0, 4)}
                        </text>
                      </g>
                    );
                  })}
                </svg>

                <div className="absolute top-2 right-2 px-2 py-0.5 rounded bg-black/70 text-white text-[9px] font-mono">
                  {cand.floors.length} Floors • {brief.program.bedrooms} BHK
                </div>
              </div>

              {/* Rationale & Metrics Body */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <p className="text-xs text-[var(--color-muted)] font-sans leading-relaxed">
                  {cand.conceptRationale}
                </p>

                {/* Key Architectural Metrics */}
                <div className="grid grid-cols-2 gap-2 text-xs font-mono pt-2 border-t border-[var(--color-rule)]">
                  <div className="p-2 rounded bg-[var(--color-paper-2)] border border-[var(--color-rule-2)]">
                    <span className="text-[10px] text-[var(--color-muted)] block">Built-Up Area</span>
                    <span className="font-bold">{cand.totalBuiltUpSqFt} sq ft</span>
                  </div>

                  <div className="p-2 rounded bg-[var(--color-paper-2)] border border-[var(--color-rule-2)]">
                    <span className="text-[10px] text-[var(--color-muted)] block">Carpet Efficiency</span>
                    <span className="font-bold text-emerald-700">{cand.carpetEfficiencyPercent}%</span>
                  </div>

                  <div className="p-2 rounded bg-[var(--color-paper-2)] border border-[var(--color-rule-2)]">
                    <span className="text-[10px] text-[var(--color-muted)] block">Daylight Score</span>
                    <span className="font-bold">{cand.daylightScore}/100</span>
                  </div>

                  <div className="p-2 rounded bg-[var(--color-paper-2)] border border-[var(--color-rule-2)]">
                    <span className="text-[10px] text-[var(--color-muted)] block">Vastu Score</span>
                    <span className="font-bold">{cand.vastuScore}/100</span>
                  </div>
                </div>

                {/* Fingerprint Diversity Chip */}
                <div className="flex items-center justify-between text-[11px] font-mono text-[var(--color-muted)] px-1">
                  <span>Fingerprint Distance:</span>
                  <span className="font-bold text-[var(--color-accent)]">
                    {cand.diversityScoreFromOthers.toFixed(2)} (Unique)
                  </span>
                </div>

                {/* Accept & Edit Button */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onAcceptAndEdit(cand.id);
                  }}
                  className={`w-full py-2.5 rounded text-xs font-mono uppercase tracking-wider font-bold flex items-center justify-center gap-2 transition ${
                    isSelected
                      ? 'bg-[var(--color-accent)] text-white hover:opacity-90 shadow-sm'
                      : 'bg-[var(--color-paper-3)] border border-[var(--color-rule-2)] hover:bg-[var(--color-paper)] text-[var(--color-ink)]'
                  }`}
                >
                  <span>Accept Concept {letter} & Launch Studio</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Full Preview Modal */}
      {previewDesign && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[var(--color-paper)] border border-[var(--color-rule-2)] rounded-xl max-w-4xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="hairline-b bg-[var(--color-paper-2)] px-6 py-4 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-[var(--color-accent)] font-semibold">
                  Architectural Blueprint Preview
                </span>
                <h3 className="font-serif text-xl text-[var(--color-ink)]">
                  {previewDesign.conceptTitle}
                </h3>
              </div>
              <button
                onClick={() => setPreviewDesign(null)}
                className="p-1 rounded text-[var(--color-muted)] hover:text-[var(--color-ink)] hover:bg-[var(--color-paper-3)]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-6 text-xs font-mono">
              <div className="bg-[var(--color-paper-3)] border border-[var(--color-rule-2)] rounded-lg p-6 text-center">
                <svg viewBox="0 0 500 320" className="w-full max-h-96 mx-auto">
                  {/* Detailed Floor plan render */}
                  <rect x="40" y="20" width="420" height="280" fill="#F4F1EA" stroke="#161513" strokeWidth="2.5" />
                  {previewDesign.floors[0]?.rooms.map((r, i) => {
                    const minX = Math.min(...r.polygon.map(p => p.x));
                    const maxX = Math.max(...r.polygon.map(p => p.x));
                    const minY = Math.min(...r.polygon.map(p => p.y));
                    const maxY = Math.max(...r.polygon.map(p => p.y));
                    const plotW = brief.plot.width;
                    const plotD = brief.plot.depth;
                    const svgX = 40 + (minX / plotW) * 420;
                    const svgY = 20 + (minY / plotD) * 280;
                    const svgW = ((maxX - minX) / plotW) * 420;
                    const svgH = ((maxY - minY) / plotD) * 280;

                    return (
                      <g key={r.id}>
                        <rect
                          x={svgX}
                          y={svgY}
                          width={svgW}
                          height={svgH}
                          fill={r.type === 'COURTYARD' ? '#e0f2fe' : r.type === 'THINNAI' ? '#fef3c7' : '#ffffff'}
                          stroke="#161513"
                          strokeWidth="1.5"
                        />
                        <text
                          x={svgX + svgW / 2}
                          y={svgY + svgH / 2 - 4}
                          textAnchor="middle"
                          fontSize="9"
                          fontFamily="sans-serif"
                          fontWeight="bold"
                          fill="#161513"
                        >
                          {r.name}
                        </text>
                        <text
                          x={svgX + svgW / 2}
                          y={svgY + svgH / 2 + 8}
                          textAnchor="middle"
                          fontSize="8"
                          fontFamily="monospace"
                          fill="#8A857B"
                        >
                          {r.dimensionsText} ({r.carpetAreaSqFt} sqft)
                        </text>
                      </g>
                    );
                  })}
                </svg>
              </div>

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setPreviewDesign(null)}
                  className="px-4 py-2 rounded border border-[var(--color-rule-2)] hover:bg-[var(--color-paper-3)]"
                >
                  Close Preview
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setPreviewDesign(null);
                    onAcceptAndEdit(previewDesign.id);
                  }}
                  className="px-6 py-2 rounded bg-[var(--color-accent)] text-white hover:opacity-95 font-bold uppercase tracking-wider"
                >
                  Accept & Edit In Studio →
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
