import React from 'react';
import { 
  FileText, 
  Cpu, 
  LayoutGrid, 
  Layers, 
  Hammer, 
  ShieldCheck, 
  DownloadCloud,
  Check
} from 'lucide-react';

export type WizardStepId = 
  | 'requirements'      // 01
  | 'synthesis'         // 02
  | 'three_designs'     // 03
  | 'studio'            // 04
  | 'construction'      // 05
  | 'verification'      // 06
  | 'export';           // 07

export interface WizardStepMeta {
  id: WizardStepId;
  number: string;
  label: string;
  shortLabel: string;
  icon: React.ComponentType<{ className?: string }>;
}

export const WIZARD_STEPS: WizardStepMeta[] = [
  { id: 'requirements', number: '01', label: 'Requirements', shortLabel: 'Brief', icon: FileText },
  { id: 'synthesis', number: '02', label: 'Synthesis', shortLabel: 'AI Engine', icon: Cpu },
  { id: 'three_designs', number: '03', label: 'Three Concepts', shortLabel: 'Concepts', icon: LayoutGrid },
  { id: 'studio', number: '04', label: 'Architectural Studio', shortLabel: 'Studio', icon: Layers },
  { id: 'construction', number: '05', label: 'Construction Package', shortLabel: 'Structure', icon: Hammer },
  { id: 'verification', number: '06', label: 'Verification Report', shortLabel: 'Audit', icon: ShieldCheck },
  { id: 'export', number: '07', label: 'Issue Set Export', shortLabel: 'Export', icon: DownloadCloud },
];

interface StudioStepTrackerProps {
  currentStep: WizardStepId;
  completedSteps?: WizardStepId[];
  onStepClick?: (step: WizardStepId) => void;
  className?: string;
  isUnsaved?: boolean;
}

export const StudioStepTracker: React.FC<StudioStepTrackerProps> = ({
  currentStep = 'requirements',
  completedSteps = [],
  onStepClick,
  className = '',
  isUnsaved = false,
}) => {
  const currentIdx = WIZARD_STEPS.findIndex(s => s.id === currentStep);

  return (
    <div
      role="region"
      aria-label="Architectural workflow navigation tracker"
      className={`hairline-b bg-[var(--color-paper-2)] px-3 sm:px-6 py-2.5 flex items-center justify-between text-xs font-mono overflow-x-auto no-scrollbar select-none z-30 sticky top-0 ${className}`}
    >
      <div className="flex items-center space-x-1 sm:space-x-2 md:space-x-3 min-w-max mx-auto">
        {WIZARD_STEPS.map((step, idx) => {
          const isDone = completedSteps.includes(step.id) || idx < currentIdx;
          const isCurrent = step.id === currentStep;
          const isClickable = isDone || isCurrent || idx === currentIdx + 1;
          const Icon = step.icon;

          return (
            <React.Fragment key={step.id}>
              <button
                type="button"
                onClick={() => isClickable && onStepClick?.(step.id)}
                disabled={!isClickable}
                title={`${step.number} ${step.label}`}
                className={`group flex items-center gap-1.5 py-1 px-2.5 rounded-[var(--radius-pill)] transition-all ${
                  isClickable ? 'cursor-pointer' : 'cursor-not-allowed opacity-40'
                } ${
                  isCurrent
                    ? 'text-[var(--color-accent)] font-semibold bg-[var(--color-accent-subtle)] ring-1 ring-[var(--color-accent)]/30'
                    : isDone
                    ? 'text-[var(--color-ink)] hover:bg-[var(--color-paper-3)] hover:text-[var(--color-accent)]'
                    : 'text-[var(--color-muted)] hover:text-[var(--color-ink)]'
                }`}
                aria-current={isCurrent ? 'step' : undefined}
              >
                <span className="text-[10px] opacity-70 font-mono tracking-tighter">
                  {isDone && !isCurrent ? (
                    <Check className="w-3 h-3 text-emerald-600 inline" />
                  ) : (
                    step.number
                  )}
                </span>
                <Icon className={`w-3.5 h-3.5 transition-transform group-hover:scale-110 ${isCurrent ? 'text-[var(--color-accent)]' : ''}`} />
                <span className="hidden md:inline uppercase text-[10px] tracking-wider font-medium">
                  {step.label}
                </span>
                <span className="inline md:hidden uppercase text-[10px] tracking-wider font-medium">
                  {step.shortLabel}
                </span>
              </button>

              {idx < WIZARD_STEPS.length - 1 && (
                <span className="text-[var(--color-rule-2)] text-[9px] select-none opacity-60">
                  /
                </span>
              )}
            </React.Fragment>
          );
        })}
      </div>

      {isUnsaved && (
        <div className="hidden lg:flex items-center gap-1.5 text-[11px] text-amber-700 font-sans ml-4 px-2 py-0.5 rounded bg-amber-50 border border-amber-200">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
          <span>Unsaved edits</span>
        </div>
      )}
    </div>
  );
};
