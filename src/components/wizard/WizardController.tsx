import React, { useState, useEffect, useCallback } from 'react';
import { StudioStepTracker, WizardStepId, WIZARD_STEPS } from '../editorial/StudioStepTracker';
import { DesignBrief } from '../../engine/intake/schemas';
import { ProjectDesign } from '../../types/project';
import { AlertTriangle, ArrowLeft, ArrowRight, Save, ShieldAlert } from 'lucide-react';
import { Step01Requirements } from './Step01Requirements';
import { Step01AssumptionModal } from './Step01AssumptionModal';
import { Step02Synthesis } from './Step02Synthesis';
import { Step03ThreeDesigns } from './Step03ThreeDesigns';
import { Step04Studio } from './Step04Studio';
import { Step05Construction } from './Step05Construction';
import { Step06Verification } from './Step06Verification';
import { Step07Export } from './Step07Export';

interface WizardControllerProps {
  initialBrief?: DesignBrief | null;
  onExitToLanding?: () => void;
  // Step render slots (can be provided as children or mapped props)
  renderRequirements?: (props: {
    brief: DesignBrief | null;
    onSubmit: (brief: DesignBrief) => void;
  }) => React.ReactNode;
  renderSynthesis?: (props: {
    brief: DesignBrief;
    onSynthesisComplete: (candidates: ProjectDesign[]) => void;
  }) => React.ReactNode;
  renderThreeDesigns?: (props: {
    brief: DesignBrief;
    candidates: ProjectDesign[];
    selectedId: string | null;
    onSelect: (id: string) => void;
    onAcceptAndEdit: (id: string) => void;
    onRegenerate: () => void;
  }) => React.ReactNode;
  renderStudio?: (props: {
    project: ProjectDesign;
    onProjectChange: (project: ProjectDesign) => void;
    onProceedToConstruction: () => void;
  }) => React.ReactNode;
  renderConstruction?: (props: {
    project: ProjectDesign;
    onProceedToVerification: () => void;
  }) => React.ReactNode;
  renderVerification?: (props: {
    project: ProjectDesign;
    onProceedToExport: () => void;
  }) => React.ReactNode;
  renderExport?: (props: {
    project: ProjectDesign;
  }) => React.ReactNode;
}

const STORAGE_KEY = 'my3_designs_v2_wizard_state';

export const WizardController: React.FC<WizardControllerProps> = ({
  initialBrief = null,
  onExitToLanding,
  renderRequirements,
  renderSynthesis,
  renderThreeDesigns,
  renderStudio,
  renderConstruction,
  renderVerification,
  renderExport,
}) => {
  const [currentStep, setCurrentStep] = useState<WizardStepId>('requirements');
  const [completedSteps, setCompletedSteps] = useState<WizardStepId[]>([]);
  const [brief, setBrief] = useState<DesignBrief | null>(initialBrief);
  const [candidates, setCandidates] = useState<ProjectDesign[]>([]);
  const [selectedDesignId, setSelectedDesignId] = useState<string | null>(null);
  const [activeProject, setActiveProject] = useState<ProjectDesign | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState<boolean>(false);
  const [autosaveEnabled, setAutosaveEnabled] = useState<boolean>(true);
  const [showExitConfirm, setShowExitConfirm] = useState<boolean>(false);
  const [isAssumptionModalOpen, setIsAssumptionModalOpen] = useState<boolean>(false);

  // Restore autosaved draft on mount if available
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved && !brief) {
        const parsed = JSON.parse(saved);
        if (parsed.brief) setBrief(parsed.brief);
        if (parsed.candidates && parsed.candidates.length > 0) setCandidates(parsed.candidates);
        if (parsed.selectedDesignId) setSelectedDesignId(parsed.selectedDesignId);
        if (parsed.activeProject) setActiveProject(parsed.activeProject);
        if (parsed.currentStep) setCurrentStep(parsed.currentStep);
        if (parsed.completedSteps) setCompletedSteps(parsed.completedSteps);
      }
    } catch (e) {
      console.warn('[WizardController] Failed to restore autosaved session', e);
    }
  }, []);

  // Autosave to localStorage on changes
  useEffect(() => {
    if (!autosaveEnabled) return;
    try {
      const snapshot = {
        currentStep,
        completedSteps,
        brief,
        candidates,
        selectedDesignId,
        activeProject,
        savedAt: new Date().toISOString(),
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
    } catch (e) {
      console.warn('[WizardController] LocalStorage autosave failed', e);
    }
  }, [currentStep, completedSteps, brief, candidates, selectedDesignId, activeProject, autosaveEnabled]);

  // Browser beforeunload interception for unsaved edits
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = 'Your architectural designs are not saved to a remote server. Are you sure you want to exit?';
        return e.returnValue;
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);

  const markStepComplete = useCallback((step: WizardStepId) => {
    setCompletedSteps(prev => (prev.includes(step) ? prev : [...prev, step]));
  }, []);

  const goToStep = useCallback((step: WizardStepId) => {
    setCurrentStep(step);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // Handlers for step transitions
  const handleRequirementsSubmit = useCallback((submittedBrief: DesignBrief) => {
    setBrief(submittedBrief);
    markStepComplete('requirements');
    goToStep('synthesis');
  }, [markStepComplete, goToStep]);

  const handleSynthesisComplete = useCallback((generatedCandidates: ProjectDesign[]) => {
    setCandidates(generatedCandidates);
    if (generatedCandidates.length > 0) {
      setSelectedDesignId(generatedCandidates[0].id);
      setActiveProject(generatedCandidates[0]);
    }
    markStepComplete('synthesis');
    goToStep('three_designs');
  }, [markStepComplete, goToStep]);

  const handleAcceptAndEdit = useCallback((designId: string) => {
    const chosen = candidates.find(c => c.id === designId) || candidates[0];
    if (chosen) {
      setSelectedDesignId(chosen.id);
      setActiveProject(chosen);
      markStepComplete('three_designs');
      goToStep('studio');
    }
  }, [candidates, markStepComplete, goToStep]);

  const handleProjectUpdate = useCallback((updated: ProjectDesign) => {
    setActiveProject(updated);
    setHasUnsavedChanges(true);
    setCandidates(prev => prev.map(c => (c.id === updated.id ? updated : c)));
  }, []);

  const currentIdx = WIZARD_STEPS.findIndex(s => s.id === currentStep);
  const canGoBack = currentIdx > 0;
  const canGoForward = currentIdx < WIZARD_STEPS.length - 1 && completedSteps.includes(currentStep);

  return (
    <div className="min-h-screen bg-[var(--color-paper)] text-[var(--color-ink)] flex flex-col font-sans selection:bg-[var(--color-accent)] selection:text-white">
      {/* Top Persistent Wizard Tracker */}
      <StudioStepTracker
        currentStep={currentStep}
        completedSteps={completedSteps}
        onStepClick={goToStep}
        isUnsaved={hasUnsavedChanges}
      />

      {/* Unsaved & Device Storage Notice Banner */}
      <div className="bg-[var(--color-paper-3)] hairline-b px-4 py-1.5 text-[11px] font-mono text-[var(--color-muted)] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          <span>Local session active (IndexedDB & LocalStorage). Plans are stored on your device only.</span>
        </div>
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-1 cursor-pointer">
            <input
              type="checkbox"
              checked={autosaveEnabled}
              onChange={e => setAutosaveEnabled(e.target.checked)}
              className="accent-[var(--color-accent)] rounded"
            />
            <span className="text-[10px] uppercase tracking-wider">Device Autosave</span>
          </label>
          {onExitToLanding && (
            <button
              onClick={() => (hasUnsavedChanges ? setShowExitConfirm(true) : onExitToLanding())}
              className="hover:text-[var(--color-ink)] underline cursor-pointer"
            >
              Exit Studio
            </button>
          )}
        </div>
      </div>

      {/* Main Step Workspace Container */}
      <main className="flex-1 flex flex-col relative">
        {currentStep === 'requirements' && (
          <div className="p-4 sm:p-8 max-w-5xl mx-auto w-full">
            {renderRequirements ? (
              renderRequirements({
                brief,
                onSubmit: handleRequirementsSubmit,
              })
            ) : (
              <>
                <Step01Requirements
                  initialBrief={brief}
                  onSubmit={handleRequirementsSubmit}
                  onOpenAssumptionMode={() => setIsAssumptionModalOpen(true)}
                />
                <Step01AssumptionModal
                  isOpen={isAssumptionModalOpen}
                  onClose={() => setIsAssumptionModalOpen(false)}
                  onConfirmedBrief={(confirmedBrief) => {
                    setIsAssumptionModalOpen(false);
                    handleRequirementsSubmit(confirmedBrief);
                  }}
                />
              </>
            )}
          </div>
        )}

        {currentStep === 'synthesis' && brief && (
          <div className="flex-1 flex flex-col justify-center items-center p-6">
            {renderSynthesis ? (
              renderSynthesis({
                brief,
                onSynthesisComplete: handleSynthesisComplete,
              })
            ) : (
              <Step02Synthesis
                brief={brief}
                onSynthesisComplete={handleSynthesisComplete}
              />
            )}
          </div>
        )}

        {currentStep === 'three_designs' && brief && (
          <div className="p-4 sm:p-8 max-w-7xl mx-auto w-full">
            {renderThreeDesigns ? (
              renderThreeDesigns({
                brief,
                candidates,
                selectedId: selectedDesignId,
                onSelect: setSelectedDesignId,
                onAcceptAndEdit: handleAcceptAndEdit,
                onRegenerate: () => goToStep('synthesis'),
              })
            ) : (
              <Step03ThreeDesigns
                brief={brief}
                candidates={candidates}
                selectedId={selectedDesignId}
                onSelect={setSelectedDesignId}
                onAcceptAndEdit={handleAcceptAndEdit}
                onRegenerate={() => goToStep('synthesis')}
              />
            )}
          </div>
        )}

        {currentStep === 'studio' && activeProject && (
          <div className="flex-1 flex flex-col">
            {renderStudio ? (
              renderStudio({
                project: activeProject,
                onProjectChange: handleProjectUpdate,
                onProceedToConstruction: () => {
                  markStepComplete('studio');
                  goToStep('construction');
                },
              })
            ) : (
              <Step04Studio
                project={activeProject}
                onProjectChange={handleProjectUpdate}
                onProceedToConstruction={() => {
                  markStepComplete('studio');
                  goToStep('construction');
                }}
              />
            )}
          </div>
        )}

        {currentStep === 'construction' && activeProject && (
          <div className="p-4 sm:p-8 max-w-6xl mx-auto w-full">
            {renderConstruction ? (
              renderConstruction({
                project: activeProject,
                onProceedToVerification: () => {
                  markStepComplete('construction');
                  goToStep('verification');
                },
              })
            ) : (
              <Step05Construction
                project={activeProject}
                onProceedToVerification={() => {
                  markStepComplete('construction');
                  goToStep('verification');
                }}
              />
            )}
          </div>
        )}

        {currentStep === 'verification' && activeProject && (
          <div className="p-4 sm:p-8 max-w-6xl mx-auto w-full">
            {renderVerification ? (
              renderVerification({
                project: activeProject,
                onProceedToExport: () => {
                  markStepComplete('verification');
                  goToStep('export');
                },
              })
            ) : (
              <Step06Verification
                project={activeProject}
                onProceedToExport={() => {
                  markStepComplete('verification');
                  goToStep('export');
                }}
              />
            )}
          </div>
        )}

        {currentStep === 'export' && activeProject && (
          <div className="p-4 sm:p-8 max-w-6xl mx-auto w-full">
            {renderExport ? (
              renderExport({
                project: activeProject,
              })
            ) : (
              <Step07Export
                project={activeProject}
                onResetOrNew={() => goToStep('requirements')}
              />
            )}
          </div>
        )}
      </main>

      {/* Floating Wizard Bottom Controls Bar */}
      <footer className="hairline-t bg-[var(--color-paper-2)]/90 backdrop-blur px-6 py-3 flex items-center justify-between z-20 sticky bottom-0">
        <button
          type="button"
          onClick={() => {
            if (canGoBack) {
              const prev = WIZARD_STEPS[currentIdx - 1].id;
              goToStep(prev);
            }
          }}
          disabled={!canGoBack}
          className={`flex items-center gap-2 px-4 py-2 rounded text-xs font-mono uppercase tracking-wider transition ${
            canGoBack
              ? 'hover:bg-[var(--color-paper-3)] text-[var(--color-ink)] cursor-pointer'
              : 'opacity-30 cursor-not-allowed text-[var(--color-muted)]'
          }`}
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back</span>
        </button>

        <div className="text-center hidden sm:block">
          <span className="text-[11px] font-mono text-[var(--color-muted)] uppercase tracking-widest">
            Step {WIZARD_STEPS[currentIdx].number} of {WIZARD_STEPS.length} — {WIZARD_STEPS[currentIdx].label}
          </span>
        </div>

        <button
          type="button"
          onClick={() => {
            if (canGoForward) {
              const next = WIZARD_STEPS[currentIdx + 1].id;
              goToStep(next);
            }
          }}
          disabled={!canGoForward}
          className={`flex items-center gap-2 px-4 py-2 rounded text-xs font-mono uppercase tracking-wider transition ${
            canGoForward
              ? 'bg-[var(--color-accent)] text-white hover:opacity-90 cursor-pointer shadow-sm'
              : 'opacity-30 cursor-not-allowed bg-[var(--color-paper-3)] text-[var(--color-muted)]'
          }`}
        >
          <span>Continue</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </footer>

      {/* Exit Confirmation Dialog */}
      {showExitConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[var(--color-paper)] border border-[var(--color-rule-2)] rounded-lg p-6 max-w-md w-full shadow-2xl">
            <div className="flex items-center gap-3 text-amber-600 mb-3">
              <ShieldAlert className="w-6 h-6 flex-shrink-0" />
              <h3 className="font-serif text-lg text-[var(--color-ink)]">Unsaved Architectural Edits</h3>
            </div>
            <p className="text-sm text-[var(--color-muted)] mb-6 font-sans">
              Your floor plans and modifications are stored only in your local browser cache. Closing this studio session without downloading may cause you to lose your custom adjustments.
            </p>
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowExitConfirm(false)}
                className="px-4 py-2 text-xs font-mono rounded border border-[var(--color-rule-2)] hover:bg-[var(--color-paper-3)]"
              >
                Keep Designing
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowExitConfirm(false);
                  onExitToLanding?.();
                }}
                className="px-4 py-2 text-xs font-mono rounded bg-red-600 text-white hover:bg-red-700"
              >
                Discard & Exit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
