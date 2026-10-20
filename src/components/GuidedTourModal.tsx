/* Hallmark · macrostructure: Guided Walkthrough / Stepper Modal · theme: Ivory-Emerald · tone: architectural-stationery */
import React, { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';
import { 
  Compass, Grid, Armchair, Landmark, Box, Download, 
  Sparkles, CheckCircle2, ArrowRight, ArrowLeft, X, 
  Ruler, Palette, ShieldCheck, Eye, Layers, Check
} from 'lucide-react';

interface GuidedTourModalProps {
  isOpen: boolean;
  onClose: () => void;
  onJumpToView?: (view: 'editor2d' | 'studio3d' | 'dashboard') => void;
}

interface TourStep {
  stepNumber: number;
  tag: string;
  title: string;
  subtitle: string;
  description: string;
  icon: React.ElementType;
  accentColor: string;
  badgeBg: string;
  badgeBorder: string;
  highlights: { title: string; desc: string }[];
  previewBadge: string;
}

const TOUR_STEPS: TourStep[] = [
  {
    stepNumber: 1,
    tag: 'MODULE 01 · 2D VECTOR CAD',
    title: 'Precision 2D CAD Drafting Canvas',
    subtitle: 'Draft, Snap & Refine Multi-Floor Architectural Plans',
    description: 'An interactive HTML5 Canvas CAD engine built with 1-foot millimeter-accurate snap grids, live dimension chains, and independent multi-floor isolation.',
    icon: Grid,
    accentColor: '#dc2626',
    badgeBg: 'bg-red-50',
    badgeBorder: 'border-red-200',
    previewBadge: '1-FT SNAP GRID · MULTI-FLOOR',
    highlights: [
      {
        title: 'Precision 1-Foot Snap Grid & Wall Drawing',
        desc: 'Snap wall junctions cleanly to the grid, create partition walls, and place swing/sliding doors with automatic opening subtractions.'
      },
      {
        title: 'Multi-Floor Stacking & Side-by-Side Mode',
        desc: 'Easily isolate Ground Floor (Level 1) and First Floor (Level 2), or toggle side-by-side view to inspect structural continuity simultaneously.'
      },
      {
        title: 'Presentation vs CAD Blueprint Styles',
        desc: 'Switch between tactile architectural presentation plans and high-contrast dark blueprint CAD schematics.'
      }
    ]
  },
  {
    stepNumber: 2,
    tag: 'MODULE 02 · TACTILE INTERIORS',
    title: 'Warm Oak Flooring & Curated Furnishings',
    subtitle: 'Warm Honey Oak Planks, Luxury Sedan, & Modern Kitchen Slab',
    description: 'Default layouts load pre-configured with warm natural oak hardwood planks, rich burgundy velvet upholstery, and meticulously rendered architectural fixtures.',
    icon: Armchair,
    accentColor: '#0f172a',
    badgeBg: 'bg-slate-100',
    badgeBorder: 'border-slate-300',
    previewBadge: 'WARM OAK · LUXURY CAR · SLABS',
    highlights: [
      {
        title: 'Natural Warm Oak Plank Flooring',
        desc: 'Living halls and master suites showcase warm honey oak planks (#fbf5e6) with authentic staggered butt-joints and grain detail.'
      },
      {
        title: 'Driveway Portico & Compound Entrance Gate',
        desc: 'Includes an Executive Luxury Sedan with aerodynamic top-down glass styling and an automated wrought-iron compound slider gate.'
      },
      {
        title: 'Chef Kitchen Slab, Island & Smart Laundry',
        desc: 'Italian black quartz counter with 4-burner hob, undermount sink, waterfall prep island with stools, and front-load washer/dryer laundry station.'
      },
      {
        title: 'Live Material Customizer',
        desc: 'Touch or click any room to switch between Chettinad Athangudi tiles, Italian Merino marble, Avocado serpentine, and Rossa Portugallo.'
      }
    ]
  },
  {
    stepNumber: 3,
    tag: 'MODULE 03 · CIVIL CODE INTELLIGENCE',
    title: 'Civil Engineering & Statutory Rules',
    subtitle: 'Automated TNCDBR-2019, IS 456 Columns & Vastu Compliance',
    description: 'Real-time engineering validation cross-references your design against Tamil Nadu building codes, geotechnical soil classifications, and sacred directional grids.',
    icon: Landmark,
    accentColor: '#dc2626',
    badgeBg: 'bg-red-50',
    badgeBorder: 'border-red-200',
    previewBadge: 'TNCDBR-2019 · IS 456 · VASTU',
    highlights: [
      {
        title: 'TNCDBR-2019 Rule 35 Setback Verification',
        desc: 'Instantly computes mandatory front, rear, and side setback yards based on your plot width, depth, and road width.'
      },
      {
        title: 'IS 456 Structural Column Grid (M25 Concrete)',
        desc: 'Automates column placement at wall intersections and verifies vertical stacking across floors to prevent shear drift.'
      },
      {
        title: 'Sacred Vastu Shastra Directional Audit',
        desc: 'Audits sacred zones: Puja shrine in North-East (Ishanya), Kitchen in South-East (Agni), and Primary Suite in South-West (Kuber).'
      },
      {
        title: 'Geotechnical Soil & Foundation Advice',
        desc: 'Tailors foundation types (isolated pad, raft, under-reamed piles) for Chennai clay, Coimbatore hard rock, and delta alluvium.'
      }
    ]
  },
  {
    stepNumber: 4,
    tag: 'MODULE 04 · 3D STUDIO & EXPORTS',
    title: '3D Spatial Studio & Professional Exports',
    subtitle: 'WebGL Orbital Lighting, Exploded Stacking & Scaled PDF Sets',
    description: 'Inspect your home in full 3D with realistic orbital sunlight, exploded vertical views, and export client-ready deliverables in vector PDF, DXF, and SVG.',
    icon: Box,
    accentColor: '#0f172a',
    badgeBg: 'bg-slate-100',
    badgeBorder: 'border-slate-300',
    previewBadge: 'THREE.JS 3D · SCALE PDF · DXF',
    highlights: [
      {
        title: 'Interactive Three.js WebGL 3D Studio',
        desc: 'Orbit, pan, and zoom through realistic multi-floor 3D models with day/evening lighting, stairwell cove lights, and custom furniture geometries.'
      },
      {
        title: 'Exploded Floor-to-Floor Stacking View',
        desc: 'Separate floor slabs vertically to inspect ceiling heights, column transfer paths, and plumbing shaft alignment.'
      },
      {
        title: 'Professional Vector PDF Sets & Title Blocks',
        desc: 'Download publication-grade architectural sheets with engineer review stamps, project metadata, and bill of quantities (BOQ).'
      },
      {
        title: 'AutoCAD DXF & Scalable SVG Output',
        desc: 'Export layered DXF files directly compatible with AutoCAD and Revit for construction site execution.'
      }
    ]
  }
];

export const GuidedTourModal: React.FC<GuidedTourModalProps> = ({
  isOpen,
  onClose,
  onJumpToView
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [dontShowAgain, setDontShowAgain] = useState<boolean>(false);
  const stepContainerRef = useRef<HTMLDivElement>(null);

  const activeStep = TOUR_STEPS[currentStepIndex];

  // GSAP Smooth Step Transition
  useEffect(() => {
    if (!isOpen || !stepContainerRef.current) return;
    
    const prefersReducedMotion = typeof window !== 'undefined' && 
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    gsap.fromTo(
      stepContainerRef.current,
      { opacity: 0, y: 12 },
      { opacity: 1, y: 0, duration: 0.3, ease: 'power2.out', force3D: true }
    );
  }, [currentStepIndex, isOpen]);

  if (!isOpen) return null;

  const handleNext = () => {
    if (currentStepIndex < TOUR_STEPS.length - 1) {
      setCurrentStepIndex(prev => prev + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrev = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(prev => prev - 1);
    }
  };

  const handleComplete = () => {
    if (dontShowAgain && typeof window !== 'undefined') {
      localStorage.setItem('my3_tour_completed', 'true');
    }
    onClose();
  };

  const StepIcon = activeStep.icon;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-xs select-none font-sans">
      <div 
        className="max-w-2xl w-full bg-[var(--color-paper)] border border-[var(--color-rule)] rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] sm:max-h-[88vh]"
        style={{
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(0, 0, 0, 0.05)'
        }}
      >
        {/* Modal Header */}
        <div className="px-4 sm:px-6 py-3.5 border-b border-[var(--color-rule)] bg-[var(--color-paper-2)] flex items-center justify-between">
          <div className="flex items-center space-x-2 sm:space-x-3">
            <div 
              className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold shadow-xs shrink-0"
              style={{ backgroundColor: activeStep.accentColor }}
            >
              <StepIcon className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold font-mono tracking-wider text-[var(--color-ink)]">
                  MY3 DESINGS · PLATFORM GUIDE
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded font-mono font-bold bg-red-50 text-[#dc2626] border border-red-200">
                  STEP {activeStep.stepNumber} OF {TOUR_STEPS.length}
                </span>
              </div>
              <span className="text-[11px] font-mono text-[var(--color-muted)]">
                Architectural CAD, Engineering Audits & Visual Presentation
              </span>
            </div>
          </div>

          <button
            onClick={handleComplete}
            className="p-1.5 rounded-lg text-[var(--color-muted)] hover:text-[var(--color-ink)] hover:bg-[var(--color-paper-3)] transition cursor-pointer"
            title="Close Guide (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Progress Indicators Bar */}
        <div className="grid grid-cols-4 border-b border-[var(--color-rule)] bg-[var(--color-paper-3)]/60 text-xs font-mono">
          {TOUR_STEPS.map((step, idx) => (
            <button
              key={step.stepNumber}
              onClick={() => setCurrentStepIndex(idx)}
              className={`py-2 px-2 text-center transition flex flex-col items-center gap-0.5 cursor-pointer border-r border-[var(--color-rule)] last:border-r-0 ${
                idx === currentStepIndex
                  ? 'bg-[var(--color-paper)] font-bold text-[var(--color-ink)] shadow-xs border-b-2 border-b-[#dc2626]'
                  : idx < currentStepIndex
                  ? 'text-[#dc2626] hover:bg-[var(--color-paper)]'
                  : 'text-[var(--color-muted)] hover:bg-[var(--color-paper)] hover:text-[var(--color-ink)]'
              }`}
            >
              <span className="text-[10px] uppercase tracking-wider">
                {idx < currentStepIndex ? '✓ ' : ''}0{step.stepNumber}
              </span>
              <span className="text-[10px] truncate max-w-full hidden sm:inline">
                {step.stepNumber === 1 ? '2D CAD' : step.stepNumber === 2 ? 'Interiors' : step.stepNumber === 3 ? 'Civil' : '3D Orbit'}
              </span>
            </button>
          ))}
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 font-sans" ref={stepContainerRef}>
          {/* Active Step Badge & Title */}
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${activeStep.badgeBg} ${activeStep.badgeBorder}`} style={{ color: activeStep.accentColor }}>
              {activeStep.tag}
            </span>
            <span className="text-[10px] font-mono bg-[var(--color-paper-3)] text-[var(--color-muted)] px-2 py-0.5 rounded border border-[var(--color-rule)]">
              {activeStep.previewBadge}
            </span>
          </div>

          <h2 className="text-lg sm:text-xl font-bold font-display text-[var(--color-ink)] tracking-tight">
            {activeStep.title}
          </h2>
          <p className="text-xs sm:text-sm font-medium text-[var(--color-muted)] mt-0.5 mb-3 font-mono">
            {activeStep.subtitle}
          </p>

          <p className="text-xs sm:text-sm text-[var(--color-ink-2)] leading-relaxed mb-4">
            {activeStep.description}
          </p>

          {/* Structured Key Highlights */}
          <div className="space-y-2.5 bg-[var(--color-paper-2)] border border-[var(--color-rule)] p-3.5 sm:p-4 rounded-lg">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[var(--color-muted)]">
              Key Capabilities & Features
            </span>
            {activeStep.highlights.map((h, i) => (
              <div key={i} className="flex items-start gap-2.5">
                <div 
                  className="w-4 h-4 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                  style={{ backgroundColor: `${activeStep.accentColor}20`, color: activeStep.accentColor }}
                >
                  <Check className="w-2.5 h-2.5 stroke-[3]" />
                </div>
                <div>
                  <div className="text-xs font-bold text-[var(--color-ink)]">
                    {h.title}
                  </div>
                  <div className="text-[11px] text-[var(--color-ink-2)] leading-normal mt-0.5">
                    {h.desc}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Quick View Jump Buttons */}
          <div className="mt-4 pt-3 border-t border-[var(--color-rule)] flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
            <span className="text-[11px] text-[var(--color-muted)]">Quick Jump:</span>
            <div className="flex items-center gap-1.5">
              {onJumpToView && (
                <>
                  <button
                    onClick={() => {
                      onJumpToView('editor2d');
                      handleComplete();
                    }}
                    className="px-2.5 py-1 bg-[var(--color-paper-3)] hover:bg-[var(--color-paper)] text-[var(--color-ink)] border border-[var(--color-rule)] rounded text-[11px] transition cursor-pointer flex items-center gap-1"
                  >
                    <Grid className="w-3 h-3 text-[#dc2626]" />
                    <span>Open 2D CAD</span>
                  </button>
                  <button
                    onClick={() => {
                      onJumpToView('studio3d');
                      handleComplete();
                    }}
                    className="px-2.5 py-1 bg-[var(--color-paper-3)] hover:bg-[var(--color-paper)] text-[var(--color-ink)] border border-[var(--color-rule)] rounded text-[11px] transition cursor-pointer flex items-center gap-1"
                  >
                    <Box className="w-3 h-3 text-[#0f172a]" />
                    <span>Open 3D Studio</span>
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Modal Footer Controls */}
        <div className="px-4 sm:px-6 py-3 border-t border-[var(--color-rule)] bg-[var(--color-paper-2)] flex flex-col sm:flex-row items-center justify-between gap-3 font-mono text-xs">
          {/* Don't show again checkbox */}
          <label className="flex items-center gap-2 cursor-pointer text-[11px] text-[var(--color-ink-2)] select-none">
            <input
              type="checkbox"
              checked={dontShowAgain}
              onChange={(e) => setDontShowAgain(e.target.checked)}
              className="rounded border-[var(--color-rule)] text-[#dc2626] focus:ring-[#dc2626] w-3.5 h-3.5"
            />
            <span>Don't show this guide on startup</span>
          </label>

          {/* Navigation Buttons */}
          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            {currentStepIndex > 0 && (
              <button
                onClick={handlePrev}
                className="px-3 py-1.5 bg-[var(--color-paper)] hover:bg-[var(--color-paper-3)] text-[var(--color-ink)] border border-[var(--color-rule)] rounded-md font-semibold transition cursor-pointer flex items-center gap-1.5"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Previous</span>
              </button>
            )}

            <button
              onClick={handleNext}
              className="px-4 py-1.5 bg-[#dc2626] hover:bg-[#b91c1c] text-white rounded-md font-bold transition shadow-xs cursor-pointer flex items-center gap-1.5"
            >
              <span>{currentStepIndex === TOUR_STEPS.length - 1 ? 'Start Designing' : 'Next Step'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
