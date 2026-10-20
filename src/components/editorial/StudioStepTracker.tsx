import React from 'react';
import { UploadCloud, Palette, Cpu, Sliders, Download } from 'lucide-react';

export type StudioStep = 'upload' | 'style' | 'generate' | 'refine' | 'export';

interface StudioStepTrackerProps {
  currentStep?: StudioStep;
  onStepClick?: (step: StudioStep) => void;
  className?: string;
}

export const StudioStepTracker: React.FC<StudioStepTrackerProps> = ({
  currentStep = 'generate',
  onStepClick,
  className = ''
}) => {
  const steps: { id: StudioStep; number: string; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'upload', number: '01', label: 'Upload Plan', icon: UploadCloud },
    { id: 'style', number: '02', label: 'Style & Palette', icon: Palette },
    { id: 'generate', number: '03', label: 'AI Geometry', icon: Cpu },
    { id: 'refine', number: '04', label: 'Spatial Refine', icon: Sliders },
    { id: 'export', number: '05', label: 'CAD Export', icon: Download }
  ];

  const currentIdx = steps.findIndex(s => s.id === currentStep);

  return (
    <div
      role="region"
      aria-label="Studio workflow progress"
      className={`hairline-b bg-[var(--color-paper-2)] px-4 py-2 flex items-center justify-between text-xs font-mono overflow-x-auto no-scrollbar select-none ${className}`}
    >
      <div className="flex items-center space-x-1 sm:space-x-4 min-w-max mx-auto">
        {steps.map((step, idx) => {
          const isDone = idx < currentIdx;
          const isCurrent = idx === currentIdx;
          const Icon = step.icon;

          return (
            <React.Fragment key={step.id}>
              <button
                onClick={() => onStepClick && onStepClick(step.id)}
                className={`flex items-center gap-1.5 py-1 px-2 rounded-[var(--radius-pill)] transition cursor-pointer ${
                  isCurrent
                    ? 'text-[var(--color-accent)] font-bold bg-[var(--color-accent-subtle)]'
                    : isDone
                    ? 'text-[var(--color-ink)] hover:text-[var(--color-accent)]'
                    : 'text-[var(--color-muted)] hover:text-[var(--color-ink)]'
                }`}
                aria-current={isCurrent ? 'step' : undefined}
              >
                <span className="text-[10px] opacity-70">{step.number}</span>
                <Icon className="w-3.5 h-3.5" />
                <span className="hidden sm:inline tracking-wider uppercase text-[11px]">{step.label}</span>
              </button>

              {idx < steps.length - 1 && (
                <span className="text-[var(--color-rule-2)] text-[10px] select-none">
                  →
                </span>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};
