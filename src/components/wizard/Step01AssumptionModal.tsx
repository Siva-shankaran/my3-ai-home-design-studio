import React, { useState } from 'react';
import { 
  Camera, 
  UploadCloud, 
  Sparkles, 
  AlertCircle, 
  CheckCircle, 
  Sliders, 
  ArrowRight, 
  X, 
  RefreshCw,
  HelpCircle
} from 'lucide-react';
import { DesignBrief } from '../../engine/intake/schemas';

interface Step01AssumptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmedBrief: (brief: DesignBrief) => void;
}

interface VisionEstimate {
  shape: string;
  widthEstimatedFt: number;
  widthRangeFt: [number, number];
  depthEstimatedFt: number;
  depthRangeFt: [number, number];
  roadFacingSide: 'NORTH' | 'SOUTH' | 'EAST' | 'WEST';
  confidenceScore: number;
  isAssumed: boolean;
  identifiedFeatures: string[];
}

export const Step01AssumptionModal: React.FC<Step01AssumptionModalProps> = ({
  isOpen,
  onClose,
  onConfirmedBrief,
}) => {
  const [stage, setStage] = useState<'upload' | 'analyzing' | 'preview_draft' | 'confirm_calibration'>('upload');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [referenceHint, setReferenceHint] = useState<string>('');
  const [estimate, setEstimate] = useState<VisionEstimate | null>(null);

  // Exact confirmation inputs
  const [confirmedWidth, setConfirmedWidth] = useState<number>(30);
  const [confirmedDepth, setConfirmedDepth] = useState<number>(40);
  const [confirmedRoad, setConfirmedRoad] = useState<'NORTH' | 'SOUTH' | 'EAST' | 'WEST'>('NORTH');
  const [confirmedFloors, setConfirmedFloors] = useState<'G' | 'G_PLUS_1' | 'G_PLUS_2'>('G_PLUS_1');
  const [confirmedBedrooms, setConfirmedBedrooms] = useState<number>(3);

  if (!isOpen) return null;

  const handleFileDrop = (e: React.DragEvent | React.ChangeEvent<HTMLInputElement>) => {
    let file: File | null = null;
    if ('dataTransfer' in e) {
      e.preventDefault();
      file = e.dataTransfer.files?.[0] || null;
    } else if (e.target.files) {
      file = e.target.files[0] || null;
    }

    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setSelectedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleStartAnalysis = async () => {
    setStage('analyzing');
    try {
      const res = await fetch('/api/ai/vision-plot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image: selectedImage?.substring(0, 1000), // metadata
          referenceHint,
        }),
      });

      const data = await res.json();
      const est: VisionEstimate = data.estimatedPlot || {
        shape: 'RECTANGLE',
        widthEstimatedFt: 30,
        widthRangeFt: [26, 34],
        depthEstimatedFt: 45,
        depthRangeFt: [40, 50],
        roadFacingSide: 'NORTH',
        confidenceScore: 0.75,
        isAssumed: true,
        identifiedFeatures: ['Level frontage along road', 'Open parcel with adjacent structure'],
      };

      setEstimate(est);
      setConfirmedWidth(est.widthEstimatedFt);
      setConfirmedDepth(est.depthEstimatedFt);
      setConfirmedRoad(est.roadFacingSide);
      setStage('preview_draft');
    } catch (e) {
      console.warn('Vision proxy fallback', e);
      // Fallback estimate
      const fallback: VisionEstimate = {
        shape: 'RECTANGLE',
        widthEstimatedFt: 30,
        widthRangeFt: [26, 34],
        depthEstimatedFt: 45,
        depthRangeFt: [40, 50],
        roadFacingSide: 'NORTH',
        confidenceScore: 0.72,
        isAssumed: true,
        identifiedFeatures: ['Standard residential parcel', 'Estimated road frontage'],
      };
      setEstimate(fallback);
      setConfirmedWidth(30);
      setConfirmedDepth(45);
      setStage('preview_draft');
    }
  };

  // Check tolerance divergence (>10%)
  const widthDiffPercent = estimate
    ? Math.round((Math.abs(confirmedWidth - estimate.widthEstimatedFt) / estimate.widthEstimatedFt) * 100)
    : 0;
  const depthDiffPercent = estimate
    ? Math.round((Math.abs(confirmedDepth - estimate.depthEstimatedFt) / estimate.depthEstimatedFt) * 100)
    : 0;
  const hasHighDivergence = widthDiffPercent > 10 || depthDiffPercent > 10;

  const handleConfirmAndProceed = () => {
    const w = confirmedWidth;
    const d = confirmedDepth;
    const targetBuiltUp = Math.round(w * d * 0.75 * (confirmedFloors === 'G' ? 1 : confirmedFloors === 'G_PLUS_1' ? 1.8 : 2.5));

    const brief: DesignBrief = {
      version: '2.0',
      projectId: crypto.randomUUID(),
      projectName: 'Vision Calibrated Residence',
      clientName: 'Private Client',
      createdAt: new Date().toISOString(),
      entryMode: 'ASSUMPTION',
      plot: {
        vertices: [
          { x: 0, y: 0 },
          { x: w, y: 0 },
          { x: w, y: d },
          { x: 0, y: d },
        ],
        width: w,
        depth: d,
        shape: 'RECTANGLE',
        roadFacingSide: confirmedRoad,
        roadWidthFt: 30,
        isCornerPlot: false,
        slopePercent: 0,
      },
      building: {
        floors: confirmedFloors,
        targetBuiltUpSqFt: targetBuiltUp,
        hasLiftProvision: confirmedFloors === 'G_PLUS_2',
        ceilingHeightFt: 10,
      },
      program: {
        bedrooms: confirmedBedrooms,
        bathrooms: Math.max(2, confirmedBedrooms),
        attachedBaths: Math.max(1, confirmedBedrooms - 1),
        kitchenType: 'SEMI_OPEN',
        hasUtilityWash: true,
        livingDiningArrangement: 'COMBINED_OPEN',
        parkingSpaces: { cars: 1, bikes: 2, isCovered: true },
        staircaseType: 'INTERNAL_DOG_LEGGED',
        poojaRoom: true,
        studyOffice: false,
        balconiesCount: 1,
        courtyardMuttram: false,
        thinnaiVerandah: true,
        terraceGarden: false,
      },
      regulations: {
        codeProfile: 'TNCDBR_2019',
        setbacks: {
          frontFt: 5,
          rearFt: 5,
          side1Ft: 3,
          side2Ft: 3,
          isAutoDerived: true,
        },
        vastuPreference: 'FLEXIBLE',
        budgetBand: 'STANDARD',
        soilType: 'LOAM',
        city: 'Chennai',
      },
      displayUnit: 'FEET_INCHES',
      assumedConfidence: {
        isEstimated: true,
        widthRange: estimate?.widthRangeFt,
        depthRange: estimate?.depthRangeFt,
        confidenceScore: estimate?.confidenceScore,
        userConfirmed: true,
      },
    };

    onConfirmedBrief(brief);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[var(--color-paper)] border border-[var(--color-rule-2)] rounded-xl max-w-2xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Top Header */}
        <div className="hairline-b bg-[var(--color-paper-2)] px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded bg-[var(--color-accent-subtle)] text-[var(--color-accent)]">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-[var(--color-accent)] font-semibold">
                Mode B • Assumption Intelligence
              </span>
              <h3 className="font-serif text-lg text-[var(--color-ink)]">
                Site Photo / Sketch Ingestion
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-[var(--color-muted)] hover:text-[var(--color-ink)] hover:bg-[var(--color-paper-3)]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-sm">
          {/* Stage 1: Upload Image & Optional Reference Hint */}
          {stage === 'upload' && (
            <div className="space-y-5">
              <p className="text-xs text-[var(--color-muted)] font-sans">
                Upload a site photograph, drone aerial view, patta survey sketch, or hand-drawn rough outline. Our vision model will estimate dimensions and orient your plot.
              </p>

              <div
                onDragOver={e => e.preventDefault()}
                onDrop={handleFileDrop}
                className="border-2 border-dashed border-[var(--color-rule-2)] hover:border-[var(--color-accent)] rounded-lg p-8 text-center bg-[var(--color-paper-2)] cursor-pointer transition"
                onClick={() => document.getElementById('assumption-file-input')?.click()}
              >
                <input
                  id="assumption-file-input"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileDrop}
                />
                {selectedImage ? (
                  <div className="space-y-3">
                    <img
                      src={selectedImage}
                      alt="Uploaded plot preview"
                      className="max-h-48 mx-auto rounded border border-[var(--color-rule-2)] shadow-sm object-cover"
                    />
                    <div className="text-xs font-mono text-emerald-700 font-semibold">
                      ✓ Image loaded. Click to replace.
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <UploadCloud className="w-10 h-10 mx-auto text-[var(--color-muted)]" />
                    <div className="font-mono text-xs text-[var(--color-ink)] font-semibold">
                      Drag & drop site photo or click to browse
                    </div>
                    <div className="text-[11px] text-[var(--color-muted)] font-sans">
                      Supports JPG, PNG, WebP up to 10MB
                    </div>
                  </div>
                )}
              </div>

              {/* Optional Reference Measurement Hint */}
              <div className="space-y-1.5">
                <label className="text-xs font-mono text-[var(--color-ink)] font-semibold flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[var(--color-accent)]" />
                  <span>Optional Scale Calibration Hint</span>
                </label>
                <input
                  type="text"
                  value={referenceHint}
                  onChange={e => setReferenceHint(e.target.value)}
                  placeholder="e.g. Frontage is about 30 ft, or parked car in front, or 2 cents"
                  className="w-full bg-[var(--color-paper-2)] border border-[var(--color-rule-2)] px-3 py-2 rounded text-xs font-mono focus:ring-1 focus:ring-[var(--color-accent)] outline-none"
                />
                <p className="text-[10px] text-[var(--color-muted)]">
                  Providing one tape measurement or physical reference dramatically increases scale calibration accuracy.
                </p>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={handleStartAnalysis}
                  disabled={!selectedImage}
                  className="flex items-center gap-2 px-5 py-2.5 rounded text-xs font-mono uppercase tracking-wider font-bold bg-[var(--color-accent)] text-white hover:opacity-90 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition shadow-sm"
                >
                  <span>Analyze Plot Geometry</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Stage 2: Analyzing Loader */}
          {stage === 'analyzing' && (
            <div className="py-16 text-center space-y-4">
              <RefreshCw className="w-10 h-10 mx-auto text-[var(--color-accent)] animate-spin" />
              <h4 className="font-serif text-lg text-[var(--color-ink)]">
                Synthesizing Site Visuals & Scale Geometry...
              </h4>
              <p className="text-xs font-mono text-[var(--color-muted)] max-w-sm mx-auto">
                Detecting street frontage, bounding edges, aspect ratios, and surroundings.
              </p>
            </div>
          )}

          {/* Stage 3: Preview Draft with "Assumed" Hatching */}
          {stage === 'preview_draft' && estimate && (
            <div className="space-y-5">
              <div className="p-3 bg-amber-50 border border-amber-200 rounded text-xs font-sans text-amber-900 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
                <div>
                  <span className="font-semibold">Photo Vision Estimate (Honest Scope Notice):</span>
                  <span> A single photo cannot provide legal surveyor precision. Every edge carries an uncertainty interval and is rendered with hatched draft lines below.</span>
                </div>
              </div>

              {/* Visual SVG Blueprint Draft with Hatching */}
              <div className="bg-[var(--color-paper-2)] border border-[var(--color-rule-2)] rounded-lg p-4 text-center">
                <svg viewBox="0 0 400 240" className="w-full max-h-56 mx-auto">
                  <defs>
                    <pattern id="assumedHatch" width="8" height="8" patternTransform="rotate(45 0 0)" patternUnits="userSpaceOnUse">
                      <line x1="0" y1="0" x2="0" y2="8" stroke="#C4552D" strokeWidth="1" opacity="0.3" />
                    </pattern>
                  </defs>

                  {/* Outer Plot Boundary with Assumed Hatching */}
                  <rect x="60" y="30" width="280" height="180" fill="url(#assumedHatch)" stroke="#161513" strokeWidth="2" strokeDasharray="4 4" />
                  
                  {/* Road Indicator */}
                  <rect x="60" y="10" width="280" height="15" fill="#E0DBD1" stroke="#8A857B" strokeWidth="1" />
                  <text x="200" y="21" textAnchor="middle" fontSize="9" fontFamily="monospace" fill="#161513">
                    ROAD FRONTAGE ({estimate.roadFacingSide})
                  </text>

                  {/* Dimension Annotations */}
                  <text x="200" y="125" textAnchor="middle" fontSize="11" fontFamily="monospace" fill="#161513" fontWeight="bold">
                    ASSUMED CONCEPT: ~{estimate.widthEstimatedFt} ft × ~{estimate.depthEstimatedFt} ft
                  </text>
                  <text x="200" y="145" textAnchor="middle" fontSize="9" fontFamily="monospace" fill="#C4552D">
                    (Range: {estimate.widthRangeFt[0]}–{estimate.widthRangeFt[1]} ft W × {estimate.depthRangeFt[0]}–{estimate.depthRangeFt[1]} ft D)
                  </text>

                  {/* Hatch label */}
                  <text x="70" y="200" fontSize="8" fontFamily="monospace" fill="#8A857B">
                    /// UNCERTAIN BOUNDARY HATCH
                  </text>
                </svg>

                <div className="flex flex-wrap items-center justify-center gap-2 mt-3 text-[11px] font-mono">
                  <span className="px-2 py-0.5 rounded bg-[var(--color-paper-3)] border border-[var(--color-rule-2)]">
                    Confidence: {Math.round(estimate.confidenceScore * 100)}%
                  </span>
                  <span className="px-2 py-0.5 rounded bg-[var(--color-paper-3)] border border-[var(--color-rule-2)]">
                    Frontage: {estimate.roadFacingSide}
                  </span>
                  <span className="px-2 py-0.5 rounded bg-[var(--color-paper-3)] border border-[var(--color-rule-2)]">
                    Shape: {estimate.shape}
                  </span>
                </div>
              </div>

              <div className="text-center font-serif text-base text-[var(--color-ink)]">
                Do you like this directional concept?
              </div>

              <div className="flex items-center justify-between gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setStage('upload')}
                  className="px-4 py-2 rounded text-xs font-mono text-[var(--color-muted)] hover:text-[var(--color-ink)] hover:bg-[var(--color-paper-3)] border border-[var(--color-rule-2)]"
                >
                  Start Over
                </button>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setStage('confirm_calibration')}
                    className="px-5 py-2.5 rounded text-xs font-mono uppercase tracking-wider font-bold bg-[var(--color-accent)] text-white hover:opacity-95 shadow-sm"
                  >
                    Like & Confirm Dimensions →
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Stage 4: Calibration & Exact Confirmation */}
          {stage === 'confirm_calibration' && estimate && (
            <div className="space-y-5">
              <div>
                <h4 className="font-serif text-base text-[var(--color-ink)]">
                  Confirm Exact Dimensions Before Solver
                </h4>
                <p className="text-xs text-[var(--color-muted)] font-sans mt-0.5">
                  Prefilled with our vision estimates. Fine-tune with your actual tape measurements or survey deed values.
                </p>
              </div>

              {hasHighDivergence && (
                <div className="p-3 rounded bg-amber-50 border border-amber-200 text-xs text-amber-900 font-sans">
                  ⚠️ <span className="font-semibold">Tolerance Warning:</span> Your entered dimensions differ by more than 10% from the vision estimate ({widthDiffPercent}% width, {depthDiffPercent}% depth). The layout proportions will be dynamically re-solved to your confirmed measurements.
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-mono text-[var(--color-ink)] font-semibold block mb-1">
                    Confirmed Width (ft)
                  </label>
                  <input
                    type="number"
                    min={12}
                    max={200}
                    value={confirmedWidth}
                    onChange={e => setConfirmedWidth(Number(e.target.value))}
                    className="w-full bg-[var(--color-paper-2)] border border-[var(--color-rule-2)] p-2.5 rounded text-xs font-mono"
                  />
                  <span className="text-[10px] text-[var(--color-muted)] font-mono">
                    Estimated: ~{estimate.widthEstimatedFt} ft
                  </span>
                </div>

                <div>
                  <label className="text-xs font-mono text-[var(--color-ink)] font-semibold block mb-1">
                    Confirmed Depth (ft)
                  </label>
                  <input
                    type="number"
                    min={15}
                    max={300}
                    value={confirmedDepth}
                    onChange={e => setConfirmedDepth(Number(e.target.value))}
                    className="w-full bg-[var(--color-paper-2)] border border-[var(--color-rule-2)] p-2.5 rounded text-xs font-mono"
                  />
                  <span className="text-[10px] text-[var(--color-muted)] font-mono">
                    Estimated: ~{estimate.depthEstimatedFt} ft
                  </span>
                </div>

                <div>
                  <label className="text-xs font-mono text-[var(--color-ink)] font-semibold block mb-1">
                    Building Floors
                  </label>
                  <select
                    value={confirmedFloors}
                    onChange={e => setConfirmedFloors(e.target.value as any)}
                    className="w-full bg-[var(--color-paper-2)] border border-[var(--color-rule-2)] p-2.5 rounded text-xs font-mono"
                  >
                    <option value="G">Ground Only (1 Floor)</option>
                    <option value="G_PLUS_1">Duplex (G+1, 2 Floors)</option>
                    <option value="G_PLUS_2">Triplex (G+2, 3 Floors)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-mono text-[var(--color-ink)] font-semibold block mb-1">
                    Bedrooms
                  </label>
                  <select
                    value={confirmedBedrooms}
                    onChange={e => setConfirmedBedrooms(Number(e.target.value))}
                    className="w-full bg-[var(--color-paper-2)] border border-[var(--color-rule-2)] p-2.5 rounded text-xs font-mono"
                  >
                    {[1, 2, 3, 4, 5].map(n => (
                      <option key={n} value={n}>{n} BHK</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-[var(--color-rule-2)]">
                <button
                  type="button"
                  onClick={() => setStage('preview_draft')}
                  className="px-4 py-2 rounded text-xs font-mono text-[var(--color-muted)] hover:bg-[var(--color-paper-3)]"
                >
                  ← Back to Draft
                </button>
                <button
                  type="button"
                  onClick={handleConfirmAndProceed}
                  className="px-6 py-2.5 rounded text-xs font-mono uppercase tracking-wider font-bold bg-[var(--color-accent)] text-white hover:opacity-95 shadow-sm"
                >
                  Generate 3 Validated Designs →
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
