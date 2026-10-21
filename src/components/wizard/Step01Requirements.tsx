import React, { useState, useEffect, useMemo } from 'react';
import { 
  DesignBrief, 
  DesignBriefSchema, 
  PlotPolygon, 
  RoomPreference, 
  RegulatoryAndVastu 
} from '../../engine/intake/schemas';
import { parsePlotInput } from '../../engine/intake/parser';
import { checkFeasibility, FeasibilityResult } from '../../engine/intake/feasibility';
import { 
  Building2, 
  Compass, 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  HelpCircle, 
  ArrowRight,
  Shield,
  Layers,
  Camera,
  RotateCcw
} from 'lucide-react';

interface Step01RequirementsProps {
  initialBrief?: DesignBrief | null;
  onSubmit: (brief: DesignBrief) => void;
  onOpenAssumptionMode?: () => void;
}

export const Step01Requirements: React.FC<Step01RequirementsProps> = ({
  initialBrief,
  onSubmit,
  onOpenAssumptionMode
}) => {
  // Dimension input state
  const [dimInput, setDimInput] = useState<string>(
    initialBrief ? `${initialBrief.plot.width}x${initialBrief.plot.depth}` : '30x40'
  );
  const [displayUnit, setDisplayUnit] = useState<DesignBrief['displayUnit']>(
    initialBrief?.displayUnit || 'FEET_INCHES'
  );
  const [roadFacingSide, setRoadFacingSide] = useState<'NORTH' | 'SOUTH' | 'EAST' | 'WEST'>(
    initialBrief?.plot?.roadFacingSide || 'NORTH'
  );
  const [isCornerPlot, setIsCornerPlot] = useState<boolean>(
    initialBrief?.plot?.isCornerPlot || false
  );
  const [roadWidthFt, setRoadWidthFt] = useState<number>(
    initialBrief?.plot?.roadWidthFt || 30
  );
  const [slopePercent, setSlopePercent] = useState<number>(
    initialBrief?.plot?.slopePercent || 0
  );

  // Building & floors
  const [floors, setFloors] = useState<'G' | 'G_PLUS_1' | 'G_PLUS_2' | 'G_PLUS_3'>(
    initialBrief?.building?.floors || 'G_PLUS_1'
  );
  const [hasLiftProvision, setHasLiftProvision] = useState<boolean>(
    initialBrief?.building?.hasLiftProvision || false
  );
  const [targetBuiltUpSqFt, setTargetBuiltUpSqFt] = useState<number>(
    initialBrief?.building?.targetBuiltUpSqFt || 1800
  );

  // Program / Rooms
  const [bedrooms, setBedrooms] = useState<number>(
    initialBrief?.program?.bedrooms || 3
  );
  const [bathrooms, setBathrooms] = useState<number>(
    initialBrief?.program?.bathrooms || 3
  );
  const [kitchenType, setKitchenType] = useState<'OPEN' | 'SEMI_OPEN' | 'CLOSED'>(
    initialBrief?.program?.kitchenType || 'SEMI_OPEN'
  );
  const [poojaRoom, setPoojaRoom] = useState<boolean>(
    initialBrief?.program?.poojaRoom ?? true
  );
  const [courtyardMuttram, setCourtyardMuttram] = useState<boolean>(
    initialBrief?.program?.courtyardMuttram || false
  );
  const [thinnaiVerandah, setThinnaiVerandah] = useState<boolean>(
    initialBrief?.program?.thinnaiVerandah || false
  );
  const [cars, setCars] = useState<number>(
    initialBrief?.program?.parkingSpaces?.cars ?? 1
  );

  // Regulations
  const [codeProfile, setCodeProfile] = useState<'TNCDBR_2019' | 'NBC_2016' | 'IRC'>(
    initialBrief?.regulations?.codeProfile || 'TNCDBR_2019'
  );
  const [vastuPreference, setVastuPreference] = useState<'STRICT' | 'FLEXIBLE' | 'OFF'>(
    initialBrief?.regulations?.vastuPreference || 'FLEXIBLE'
  );
  const [soilType, setSoilType] = useState<RegulatoryAndVastu['soilType']>(
    initialBrief?.regulations?.soilType || 'LOAM'
  );

  // Setbacks (Editable with auto-derive)
  const [frontSetback, setFrontSetback] = useState<number>(5);
  const [rearSetback, setRearSetback] = useState<number>(5);
  const [side1Setback, setSide1Setback] = useState<number>(3);
  const [side2Setback, setSide2Setback] = useState<number>(3);

  // Free text NLP prompt
  const [freeText, setFreeText] = useState<string>('');
  const [isParsingText, setIsParsingText] = useState<boolean>(false);

  // Parsed dimensions
  const parsedPlot = useMemo(() => parsePlotInput(dimInput), [dimInput]);

  // Auto-adjust setbacks when plot size changes if not manually overridden
  useEffect(() => {
    if (parsedPlot.widthFt > 40) {
      setFrontSetback(8);
      setRearSetback(6);
      setSide1Setback(5);
      setSide2Setback(5);
    } else if (parsedPlot.widthFt <= 25) {
      setFrontSetback(4);
      setRearSetback(3);
      setSide1Setback(2.5);
      setSide2Setback(2.5);
    } else {
      setFrontSetback(5);
      setRearSetback(5);
      setSide1Setback(3);
      setSide2Setback(3);
    }
  }, [parsedPlot.widthFt]);

  // Construct draft brief for live feasibility checking
  const currentBriefCandidate: DesignBrief = useMemo(() => {
    const w = parsedPlot.widthFt;
    const d = parsedPlot.depthFt;
    return {
      version: '2.0',
      projectId: initialBrief?.projectId || crypto.randomUUID(),
      projectName: 'MY3 Residential Villa',
      clientName: 'Private Client',
      createdAt: new Date().toISOString(),
      entryMode: 'STRUCTURED',
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
        roadFacingSide,
        roadWidthFt,
        isCornerPlot,
        slopePercent,
      },
      building: {
        floors,
        targetBuiltUpSqFt,
        hasLiftProvision,
        ceilingHeightFt: 10,
      },
      program: {
        bedrooms,
        bathrooms,
        attachedBaths: Math.max(1, bathrooms - 1),
        kitchenType,
        hasUtilityWash: true,
        livingDiningArrangement: 'COMBINED_OPEN',
        parkingSpaces: {
          cars,
          bikes: 2,
          isCovered: true,
        },
        staircaseType: 'INTERNAL_DOG_LEGGED',
        poojaRoom,
        studyOffice: false,
        balconiesCount: 1,
        courtyardMuttram,
        thinnaiVerandah,
        terraceGarden: false,
      },
      regulations: {
        codeProfile,
        setbacks: {
          frontFt: frontSetback,
          rearFt: rearSetback,
          side1Ft: side1Setback,
          side2Ft: side2Setback,
          isAutoDerived: true,
        },
        vastuPreference,
        budgetBand: 'STANDARD',
        soilType,
        city: 'Chennai',
      },
      displayUnit,
      rawFreeTextPrompt: freeText,
    };
  }, [
    parsedPlot,
    roadFacingSide,
    roadWidthFt,
    isCornerPlot,
    slopePercent,
    floors,
    targetBuiltUpSqFt,
    hasLiftProvision,
    bedrooms,
    bathrooms,
    kitchenType,
    poojaRoom,
    courtyardMuttram,
    thinnaiVerandah,
    cars,
    codeProfile,
    frontSetback,
    rearSetback,
    side1Setback,
    side2Setback,
    vastuPreference,
    soilType,
    displayUnit,
    freeText,
    initialBrief?.projectId,
  ]);

  // Live Feasibility Evaluation
  const feasibility: FeasibilityResult = useMemo(
    () => checkFeasibility(currentBriefCandidate),
    [currentBriefCandidate]
  );

  const handleFreeTextParse = async () => {
    if (!freeText.trim()) return;
    setIsParsingText(true);
    try {
      const res = await fetch('/api/ai/parse-brief', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: freeText }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.extracted) {
          if (data.extracted.plotWidth && data.extracted.plotDepth) {
            setDimInput(`${data.extracted.plotWidth}x${data.extracted.plotDepth}`);
          }
          if (data.extracted.bedrooms) setBedrooms(data.extracted.bedrooms);
          if (data.extracted.floors) setFloors(data.extracted.floors);
          if (data.extracted.roadFacingSide) setRoadFacingSide(data.extracted.roadFacingSide);
          if (data.extracted.thinnaiVerandah !== undefined) setThinnaiVerandah(data.extracted.thinnaiVerandah);
          if (data.extracted.courtyardMuttram !== undefined) setCourtyardMuttram(data.extracted.courtyardMuttram);
        }
      }
    } catch (e) {
      console.warn('Free text parse fallback', e);
    } finally {
      setIsParsingText(false);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!feasibility.isFeasible) {
      return;
    }
    onSubmit(currentBriefCandidate);
  };

  return (
    <div className="w-full space-y-8 animate-fadeIn">
      {/* Mode Choice Header Banner */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-5 bg-[var(--color-paper-2)] border border-[var(--color-rule-2)] rounded-lg">
        <div>
          <span className="text-[11px] font-mono uppercase tracking-widest text-[var(--color-accent)] font-semibold">
            01 Intake Configuration
          </span>
          <h1 className="font-serif text-2xl sm:text-3xl text-[var(--color-ink)] mt-0.5">
            Define Plot & Residential Program
          </h1>
          <p className="text-xs sm:text-sm text-[var(--color-muted)] font-sans mt-1">
            Choose between precise dimensional input or AI plot vision estimation.
          </p>
        </div>

        {onOpenAssumptionMode && (
          <button
            type="button"
            onClick={onOpenAssumptionMode}
            className="flex items-center gap-2 px-4 py-2.5 rounded text-xs font-mono uppercase tracking-wider bg-[var(--color-paper)] border border-[var(--color-accent)] text-[var(--color-accent)] hover:bg-[var(--color-accent)] hover:text-white transition shadow-sm cursor-pointer whitespace-nowrap"
          >
            <Camera className="w-4 h-4" />
            <span>Mode B: Photo / Sketch Upload</span>
          </button>
        )}
      </div>

      <form onSubmit={handleFormSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Input Form (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* 1. Plot Dimensions & Unit */}
          <div className="p-5 bg-[var(--color-paper-2)] border border-[var(--color-rule-2)] rounded-lg space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-xs font-mono uppercase tracking-wider text-[var(--color-ink)] font-semibold flex items-center gap-2">
                <Building2 className="w-4 h-4 text-[var(--color-accent)]" />
                <span>Plot Dimensions or Area</span>
              </label>
              <div className="flex items-center gap-1 text-[11px] font-mono text-[var(--color-muted)]">
                <span>Unit:</span>
                <select
                  value={displayUnit}
                  onChange={e => setDisplayUnit(e.target.value as any)}
                  className="bg-[var(--color-paper)] border border-[var(--color-rule-2)] px-2 py-0.5 rounded text-[11px]"
                >
                  <option value="FEET_INCHES">Feet & Inches (e.g. 30' x 40')</option>
                  <option value="FEET">Feet Decimal</option>
                  <option value="METERS">Meters (e.g. 9m x 12m)</option>
                  <option value="CENT">Tamil Nadu Cent (1 cent = 435.6 sqft)</option>
                  <option value="GROUND">Ground (1 ground = 2,400 sqft)</option>
                  <option value="SQFT">Total Sq Ft</option>
                </select>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <input
                type="text"
                value={dimInput}
                onChange={e => setDimInput(e.target.value)}
                placeholder="e.g. 30x40, 30'6&quot; x 40', 2 cents, 1 ground"
                className="flex-1 bg-[var(--color-paper)] border border-[var(--color-rule-2)] px-3.5 py-2.5 rounded font-mono text-sm focus:outline-none focus:ring-1 focus:ring-[var(--color-accent)]"
              />
              <div className="px-3.5 py-2.5 bg-[var(--color-paper-3)] border border-[var(--color-rule-2)] rounded font-mono text-xs text-[var(--color-ink)] whitespace-nowrap">
                {parsedPlot.widthFt} ft × {parsedPlot.depthFt} ft ({parsedPlot.areaSqFt} sq ft)
              </div>
            </div>

            {/* Road Facing & Corner Plot */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
              <div>
                <label className="text-[11px] font-mono text-[var(--color-muted)] block mb-1">Road Facing</label>
                <select
                  value={roadFacingSide}
                  onChange={e => setRoadFacingSide(e.target.value as any)}
                  className="w-full bg-[var(--color-paper)] border border-[var(--color-rule-2)] px-2.5 py-2 rounded text-xs font-mono"
                >
                  <option value="NORTH">North Facing (Kubera)</option>
                  <option value="EAST">East Facing (Surya)</option>
                  <option value="SOUTH">South Facing (Yama)</option>
                  <option value="WEST">West Facing (Varuna)</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-mono text-[var(--color-muted)] block mb-1">Road Width (ft)</label>
                <input
                  type="number"
                  min={10}
                  max={120}
                  value={roadWidthFt}
                  onChange={e => setRoadWidthFt(Number(e.target.value))}
                  className="w-full bg-[var(--color-paper)] border border-[var(--color-rule-2)] px-2.5 py-2 rounded text-xs font-mono"
                />
              </div>

              <div className="flex items-center pt-5">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-mono select-none">
                  <input
                    type="checkbox"
                    checked={isCornerPlot}
                    onChange={e => setIsCornerPlot(e.target.checked)}
                    className="accent-[var(--color-accent)] rounded"
                  />
                  <span>Corner Plot (Dual Face)</span>
                </label>
              </div>
            </div>
          </div>

          {/* 2. Floors & Target Built-Up Area */}
          <div className="p-5 bg-[var(--color-paper-2)] border border-[var(--color-rule-2)] rounded-lg space-y-4">
            <label className="text-xs font-mono uppercase tracking-wider text-[var(--color-ink)] font-semibold flex items-center gap-2">
              <Layers className="w-4 h-4 text-[var(--color-accent)]" />
              <span>Building Floors & Built-Up Area</span>
            </label>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: 'G', label: 'Ground (G)', desc: '1 Floor' },
                { id: 'G_PLUS_1', label: 'Duplex (G+1)', desc: '2 Floors' },
                { id: 'G_PLUS_2', label: 'Triplex (G+2)', desc: '3 Floors' },
                { id: 'G_PLUS_3', label: 'G+3 Residence', desc: '4 Floors' },
              ].map(opt => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setFloors(opt.id as any)}
                  className={`p-3 text-left rounded border transition cursor-pointer ${
                    floors === opt.id
                      ? 'border-[var(--color-accent)] bg-[var(--color-accent-subtle)] text-[var(--color-accent)] font-semibold'
                      : 'border-[var(--color-rule-2)] bg-[var(--color-paper)] text-[var(--color-ink)] hover:border-[var(--color-rule)]'
                  }`}
                >
                  <div className="text-xs font-mono">{opt.label}</div>
                  <div className="text-[10px] text-[var(--color-muted)] font-mono">{opt.desc}</div>
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="text-[11px] font-mono text-[var(--color-muted)] block mb-1">
                  Target Built-Up Area (sq ft)
                </label>
                <input
                  type="number"
                  step={50}
                  min={300}
                  max={8000}
                  value={targetBuiltUpSqFt}
                  onChange={e => setTargetBuiltUpSqFt(Number(e.target.value))}
                  className="w-full bg-[var(--color-paper)] border border-[var(--color-rule-2)] px-3 py-2 rounded text-xs font-mono"
                />
              </div>

              {(floors === 'G_PLUS_2' || floors === 'G_PLUS_3') && (
                <div className="flex items-center pt-6">
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-mono select-none">
                    <input
                      type="checkbox"
                      checked={hasLiftProvision}
                      onChange={e => setHasLiftProvision(e.target.checked)}
                      className="accent-[var(--color-accent)] rounded"
                    />
                    <span>Include Elevator / Lift Shaft</span>
                  </label>
                </div>
              )}
            </div>
          </div>

          {/* 3. Room Program & Regional Tamil Features */}
          <div className="p-5 bg-[var(--color-paper-2)] border border-[var(--color-rule-2)] rounded-lg space-y-4">
            <label className="text-xs font-mono uppercase tracking-wider text-[var(--color-ink)] font-semibold flex items-center gap-2">
              <Compass className="w-4 h-4 text-[var(--color-accent)]" />
              <span>Room Program & Cultural Elements</span>
            </label>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="text-[11px] font-mono text-[var(--color-muted)] block mb-1">Bedrooms</label>
                <select
                  value={bedrooms}
                  onChange={e => setBedrooms(Number(e.target.value))}
                  className="w-full bg-[var(--color-paper)] border border-[var(--color-rule-2)] px-2.5 py-2 rounded text-xs font-mono"
                >
                  {[1, 2, 3, 4, 5, 6].map(n => (
                    <option key={n} value={n}>{n} BHK</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[11px] font-mono text-[var(--color-muted)] block mb-1">Bathrooms</label>
                <select
                  value={bathrooms}
                  onChange={e => setBathrooms(Number(e.target.value))}
                  className="w-full bg-[var(--color-paper)] border border-[var(--color-rule-2)] px-2.5 py-2 rounded text-xs font-mono"
                >
                  {[1, 2, 3, 4, 5, 6].map(n => (
                    <option key={n} value={n}>{n} Bath</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[11px] font-mono text-[var(--color-muted)] block mb-1">Kitchen Type</label>
                <select
                  value={kitchenType}
                  onChange={e => setKitchenType(e.target.value as any)}
                  className="w-full bg-[var(--color-paper)] border border-[var(--color-rule-2)] px-2.5 py-2 rounded text-xs font-mono"
                >
                  <option value="SEMI_OPEN">Semi-Open</option>
                  <option value="OPEN">Open Concept</option>
                  <option value="CLOSED">Traditional Closed</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-mono text-[var(--color-muted)] block mb-1">Car Parking</label>
                <select
                  value={cars}
                  onChange={e => setCars(Number(e.target.value))}
                  className="w-full bg-[var(--color-paper)] border border-[var(--color-rule-2)] px-2.5 py-2 rounded text-xs font-mono"
                >
                  <option value={0}>None / Street</option>
                  <option value={1}>1 Car Porch</option>
                  <option value={2}>2 Cars</option>
                </select>
              </div>
            </div>

            {/* Regional Architecture Checkboxes */}
            <div className="pt-2 border-t border-[var(--color-rule)] space-y-2">
              <span className="text-[11px] font-mono text-[var(--color-muted)] block uppercase tracking-wider">
                Regional Architectural Features (Tamil Nadu & South India)
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <label className="flex items-center gap-2 p-2 bg-[var(--color-paper)] border border-[var(--color-rule-2)] rounded text-xs font-mono cursor-pointer">
                  <input
                    type="checkbox"
                    checked={poojaRoom}
                    onChange={e => setPoojaRoom(e.target.checked)}
                    className="accent-[var(--color-accent)] rounded"
                  />
                  <span>Pooja Sanctuary</span>
                </label>

                <label className="flex items-center gap-2 p-2 bg-[var(--color-paper)] border border-[var(--color-rule-2)] rounded text-xs font-mono cursor-pointer">
                  <input
                    type="checkbox"
                    checked={thinnaiVerandah}
                    onChange={e => setThinnaiVerandah(e.target.checked)}
                    className="accent-[var(--color-accent)] rounded"
                  />
                  <span>Thinnai Verandah</span>
                </label>

                <label className="flex items-center gap-2 p-2 bg-[var(--color-paper)] border border-[var(--color-rule-2)] rounded text-xs font-mono cursor-pointer">
                  <input
                    type="checkbox"
                    checked={courtyardMuttram}
                    onChange={e => setCourtyardMuttram(e.target.checked)}
                    className="accent-[var(--color-accent)] rounded"
                  />
                  <span>Muttram Courtyard</span>
                </label>
              </div>
            </div>
          </div>

          {/* 4. Natural Language Assistant */}
          <div className="p-4 bg-[var(--color-paper-2)] border border-[var(--color-rule-2)] rounded-lg space-y-2">
            <label className="text-[11px] font-mono uppercase tracking-wider text-[var(--color-ink)] flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[var(--color-accent)]" />
              <span>Describe specific details in plain text</span>
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={freeText}
                onChange={e => setFreeText(e.target.value)}
                placeholder="e.g. 30x40 north facing plot with thinnai in front, 3bhk duplex, vastushastra compliant"
                className="flex-1 bg-[var(--color-paper)] border border-[var(--color-rule-2)] px-3 py-2 rounded text-xs font-sans focus:outline-none focus:ring-1 focus:ring-[var(--color-accent)]"
              />
              <button
                type="button"
                onClick={handleFreeTextParse}
                disabled={isParsingText || !freeText.trim()}
                className="px-3 py-2 bg-[var(--color-paper-3)] border border-[var(--color-rule-2)] rounded text-xs font-mono hover:bg-[var(--color-paper)] transition disabled:opacity-40"
              >
                {isParsingText ? 'Parsing...' : 'Apply Prompt'}
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Feasibility Audit & Setbacks (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Feasibility Summary Card */}
          <div className={`p-5 rounded-lg border transition-all ${
            feasibility.status === 'blocked'
              ? 'bg-red-50/70 border-red-200 text-red-950'
              : feasibility.status === 'warn'
              ? 'bg-amber-50/70 border-amber-200 text-amber-950'
              : 'bg-emerald-50/60 border-emerald-200 text-emerald-950'
          }`}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                {feasibility.status === 'blocked' && <XCircle className="w-5 h-5 text-red-600" />}
                {feasibility.status === 'warn' && <AlertTriangle className="w-5 h-5 text-amber-600" />}
                {feasibility.status === 'ok' && <CheckCircle2 className="w-5 h-5 text-emerald-600" />}
                <span className="font-mono text-xs uppercase tracking-wider font-bold">
                  {feasibility.status === 'blocked'
                    ? 'Feasibility Blocked'
                    : feasibility.status === 'warn'
                    ? 'Feasibility Warning'
                    : 'Feasibility Passed'}
                </span>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/80 border border-current">
                {feasibility.typologyRecommendation} TYPOLOGY
              </span>
            </div>

            <div className="text-xs font-mono space-y-1 mb-4 bg-white/60 p-3 rounded border border-current/20">
              <div>Gross Plot Area: <span className="font-bold">{parsedPlot.areaSqFt} sq ft</span></div>
              <div>Buildable Footprint: <span className="font-bold">{feasibility.buildableEnvelope.widthFt.toFixed(1)} ft × {feasibility.buildableEnvelope.depthFt.toFixed(1)} ft ({feasibility.buildableEnvelope.areaSqFt} sq ft)</span></div>
              <div>Code Profile: <span className="font-bold">{codeProfile}</span></div>
            </div>

            {/* Issues List */}
            {feasibility.issues.length > 0 && (
              <div className="space-y-2 mb-4">
                {feasibility.issues.map((issue, idx) => (
                  <div key={idx} className="p-2.5 rounded bg-white/80 border border-current/20 text-xs">
                    <div className="font-semibold">{issue.message}</div>
                    <div className="text-[11px] opacity-80 mt-0.5">💡 {issue.fixSuggestion}</div>
                  </div>
                ))}
              </div>
            )}

            <button
              type="submit"
              disabled={!feasibility.isFeasible}
              className={`w-full py-3 rounded text-xs font-mono uppercase tracking-wider font-bold flex items-center justify-center gap-2 transition shadow-sm ${
                feasibility.isFeasible
                  ? 'bg-[var(--color-accent)] text-white hover:opacity-95 cursor-pointer'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              <span>Generate 3 Architectural Designs</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Setbacks & Regulatory Settings */}
          <div className="p-5 bg-[var(--color-paper-2)] border border-[var(--color-rule-2)] rounded-lg space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-xs font-mono uppercase tracking-wider text-[var(--color-ink)] font-semibold flex items-center gap-2">
                <Shield className="w-4 h-4 text-[var(--color-accent)]" />
                <span>Building Setbacks & Codes</span>
              </label>
              <select
                value={codeProfile}
                onChange={e => setCodeProfile(e.target.value as any)}
                className="bg-[var(--color-paper)] border border-[var(--color-rule-2)] px-2 py-0.5 rounded text-[11px] font-mono"
              >
                <option value="TNCDBR_2019">Tamil Nadu TNCDBR-2019</option>
                <option value="NBC_2016">National Building Code 2016</option>
                <option value="IRC">International Residential Code</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs font-mono">
              <div>
                <label className="text-[10px] text-[var(--color-muted)] block mb-1">Front Setback (ft)</label>
                <input
                  type="number"
                  step={0.5}
                  min={0}
                  value={frontSetback}
                  onChange={e => setFrontSetback(Number(e.target.value))}
                  className="w-full bg-[var(--color-paper)] border border-[var(--color-rule-2)] p-2 rounded"
                />
              </div>

              <div>
                <label className="text-[10px] text-[var(--color-muted)] block mb-1">Rear Setback (ft)</label>
                <input
                  type="number"
                  step={0.5}
                  min={0}
                  value={rearSetback}
                  onChange={e => setRearSetback(Number(e.target.value))}
                  className="w-full bg-[var(--color-paper)] border border-[var(--color-rule-2)] p-2 rounded"
                />
              </div>

              <div>
                <label className="text-[10px] text-[var(--color-muted)] block mb-1">Side 1 Setback (ft)</label>
                <input
                  type="number"
                  step={0.5}
                  min={0}
                  value={side1Setback}
                  onChange={e => setSide1Setback(Number(e.target.value))}
                  className="w-full bg-[var(--color-paper)] border border-[var(--color-rule-2)] p-2 rounded"
                />
              </div>

              <div>
                <label className="text-[10px] text-[var(--color-muted)] block mb-1">Side 2 Setback (ft)</label>
                <input
                  type="number"
                  step={0.5}
                  min={0}
                  value={side2Setback}
                  onChange={e => setSide2Setback(Number(e.target.value))}
                  className="w-full bg-[var(--color-paper)] border border-[var(--color-rule-2)] p-2 rounded"
                />
              </div>
            </div>

            {/* Vastu & Soil */}
            <div className="grid grid-cols-2 gap-3 pt-2 border-t border-[var(--color-rule)]">
              <div>
                <label className="text-[10px] font-mono text-[var(--color-muted)] block mb-1">Vastu Shastra</label>
                <select
                  value={vastuPreference}
                  onChange={e => setVastuPreference(e.target.value as any)}
                  className="w-full bg-[var(--color-paper)] border border-[var(--color-rule-2)] p-2 rounded text-xs font-mono"
                >
                  <option value="STRICT">Strict Vastu</option>
                  <option value="FLEXIBLE">Flexible Vastu</option>
                  <option value="OFF">Modern (Off)</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-mono text-[var(--color-muted)] block mb-1">Soil Foundation</label>
                <select
                  value={soilType}
                  onChange={e => setSoilType(e.target.value as any)}
                  className="w-full bg-[var(--color-paper)] border border-[var(--color-rule-2)] p-2 rounded text-xs font-mono"
                >
                  <option value="LOAM">Medium Sandy Loam (200 kN/m²)</option>
                  <option value="CLAYEY">Clayey Soil (150 kN/m²)</option>
                  <option value="BLACK_COTTON">Black Cotton Soil (100 kN/m²)</option>
                  <option value="HARD_MOORUM_ROCK">Hard Moorum / Rock (350 kN/m²)</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};
