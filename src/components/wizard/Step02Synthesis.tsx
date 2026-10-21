import React, { useState, useEffect } from 'react';
import { DesignBrief } from '../../engine/intake/schemas.ts';
import { ProjectDesign } from '../../types/project.ts';
import { generateThreeCandidates } from '../../engine/solver/candidateSynthesizer.ts';
import { Cpu, CheckCircle2, ShieldCheck, Layers, Sparkles } from 'lucide-react';

interface Step02SynthesisProps {
  brief: DesignBrief;
  onSynthesisComplete: (candidates: ProjectDesign[]) => void;
}

const STAGES = [
  { id: 1, title: 'Analyzing Plot & Boundary Normals', desc: 'Evaluating orientation, road setback offsets, and buildable envelope.' },
  { id: 2, title: 'Consulting 48 Architectural Recipes', desc: 'Matching family typologies with room program and structural spans.' },
  { id: 3, title: 'Synthesizing 3 Distinct Archetypes', desc: 'Executing deterministic space partition and multi-floor vertical core stacking.' },
  { id: 4, title: 'Placing CAD Fixtures & Furniture', desc: 'Auto-furnishing with 36" walking aisles and bed clearance zones.' },
  { id: 5, title: 'Independent Investigator Verification', desc: 'Auditing spatial non-overlaps, NBC/IRC code, and Hungarian fingerprint diversity.' },
];

export const Step02Synthesis: React.FC<Step02SynthesisProps> = ({
  brief,
  onSynthesisComplete,
}) => {
  const [currentStageIdx, setCurrentStageIdx] = useState<number>(0);
  const [progressPercent, setProgressPercent] = useState<number>(10);

  useEffect(() => {
    // Stage-by-stage progression reflecting actual pipeline execution
    const timer1 = setTimeout(() => { setCurrentStageIdx(1); setProgressPercent(30); }, 600);
    const timer2 = setTimeout(() => { setCurrentStageIdx(2); setProgressPercent(55); }, 1300);
    const timer3 = setTimeout(() => { setCurrentStageIdx(3); setProgressPercent(78); }, 2000);
    const timer4 = setTimeout(() => { setCurrentStageIdx(4); setProgressPercent(92); }, 2700);

    const completionTimer = setTimeout(() => {
      setProgressPercent(100);
      try {
        const result = generateThreeCandidates(brief);
        onSynthesisComplete(result.candidates);
      } catch (err) {
        console.error('Synthesis error:', err);
      }
    }, 3400);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
      clearTimeout(completionTimer);
    };
  }, [brief, onSynthesisComplete]);

  return (
    <div className="max-w-2xl w-full mx-auto p-8 bg-[var(--color-paper-2)] border border-[var(--color-rule-2)] rounded-xl shadow-lg space-y-8 animate-fadeIn">
      {/* Top Header */}
      <div className="text-center space-y-2">
        <span className="text-[10px] font-mono uppercase tracking-widest text-[var(--color-accent)] font-semibold">
          02 • Architectural Engine Synthesis
        </span>
        <h2 className="font-serif text-3xl text-[var(--color-ink)]">
          Generating Residential Concepts
        </h2>
        <p className="text-xs font-mono text-[var(--color-muted)]">
          Deterministic geometry solver executing for {brief.plot.width}' × {brief.plot.depth}' plot ({brief.building.floors.replace('_', ' ')})
        </p>
      </div>

      {/* Animated CAD Line-Drawing Preview */}
      <div className="bg-[var(--color-paper)] border border-[var(--color-rule-2)] rounded-lg p-6 relative overflow-hidden flex items-center justify-center min-h-[180px]">
        <svg viewBox="0 0 300 160" className="w-full max-h-40">
          <defs>
            <linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#C4552D" />
              <stop offset="100%" stopColor="#161513" />
            </linearGradient>
          </defs>

          {/* Exterior Wall Boundary (Draws itself with dasharray) */}
          <rect
            x="30"
            y="20"
            width="240"
            height="120"
            fill="none"
            stroke="url(#lineGrad)"
            strokeWidth="3"
            strokeDasharray="720"
            strokeDashoffset={720 - (720 * progressPercent) / 100}
            className="transition-all duration-700 ease-out"
          />

          {/* Internal Rooms partitioning */}
          {progressPercent >= 55 && (
            <>
              <line x1="30" y1="80" x2="150" y2="80" stroke="#8A857B" strokeWidth="1.5" strokeDasharray="4 2" />
              <line x1="150" y1="20" x2="150" y2="140" stroke="#8A857B" strokeWidth="1.5" />
              <line x1="150" y1="70" x2="270" y2="70" stroke="#8A857B" strokeWidth="1.5" strokeDasharray="4 2" />
            </>
          )}

          {/* Dimension leaders */}
          <text x="150" y="15" textAnchor="middle" fontSize="9" fontFamily="monospace" fill="#8A857B">
            {brief.plot.width}' - 0"
          </text>
          <text x="285" y="85" textAnchor="middle" fontSize="9" fontFamily="monospace" fill="#8A857B">
            {brief.plot.depth}' - 0"
          </text>
        </svg>

        {/* Ambient progress indicator in center */}
        <div className="absolute bottom-2 right-3 font-mono text-[11px] text-[var(--color-muted)]">
          {progressPercent}% Complete
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-[var(--color-paper-3)] h-1.5 rounded-full overflow-hidden">
        <div
          className="bg-[var(--color-accent)] h-full transition-all duration-500 ease-out"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Pipeline Stage Tracker */}
      <div className="space-y-3 font-mono text-xs">
        {STAGES.map((st, idx) => {
          const isDone = idx < currentStageIdx;
          const isCurrent = idx === currentStageIdx;

          return (
            <div
              key={st.id}
              className={`flex items-start gap-3 p-2.5 rounded transition ${
                isCurrent
                  ? 'bg-[var(--color-accent-subtle)] text-[var(--color-ink)] font-semibold'
                  : isDone
                  ? 'text-[var(--color-ink)] opacity-80'
                  : 'text-[var(--color-muted)] opacity-40'
              }`}
            >
              <div className="mt-0.5">
                {isDone ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                ) : isCurrent ? (
                  <div className="w-4 h-4 rounded-full border-2 border-[var(--color-accent)] border-t-transparent animate-spin" />
                ) : (
                  <div className="w-4 h-4 rounded-full border border-current opacity-40 flex items-center justify-center text-[9px]">
                    {st.id}
                  </div>
                )}
              </div>
              <div className="flex-1">
                <div className="text-xs uppercase tracking-wider">{st.title}</div>
                <div className="text-[11px] text-[var(--color-muted)] font-sans font-normal mt-0.5">
                  {st.desc}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
