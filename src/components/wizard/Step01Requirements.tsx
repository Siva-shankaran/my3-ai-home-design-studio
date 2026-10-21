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
  RotateCcw,
  Car,
  Home,
  Utensils,
  Wind,
  ShieldCheck,
  Check,
  Info
} from 'lucide-react';

interface Step01RequirementsProps {
  initialBrief?: DesignBrief | null;
  onSubmit: (brief: DesignBrief) => void;
  onOpenAssumptionMode?: () => void;
}

export type BuildingTypology = 'MODERN_VILLA' | 'CHETTINAD_COURTYARD' | 'STILT_DUPLEX' | 'URBAN_ROW_HOUSE';
export type RoofArchitecture = 'FLAT_RCC_TERRACE' | 'SLOPED_MANGALORE_TILE' | 'MODERN_GABLE' | 'PERGOLA_DECK';
export type StaircaseDesign = 'INTERNAL_DOG_LEGGED' | 'FLOATING_TIMBER' | 'SPIRAL_CORE' | 'EXTERNAL_RENTAL';
export type CarType = 'SUV' | 'SEDAN' | 'HATCHBACK' | 'EV_CHARGING';

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

  // Building Typology with Visual Cards
  const [typology, setTypology] = useState<BuildingTypology>('MODERN_VILLA');
  const [roofArch, setRoofArch] = useState<RoofArchitecture>('FLAT_RCC_TERRACE');
  const [staircaseDesign, setStaircaseDesign] = useState<StaircaseDesign>('INTERNAL_DOG_LEGGED');

  // Room Program
  const [bedrooms, setBedrooms] = useState<number>(
    initialBrief?.program?.bedrooms || 3
  );
  const [hasGuestRoom, setHasGuestRoom] = useState<boolean>(true);
  const [bathrooms, setBathrooms] = useState<number>(
    initialBrief?.program?.bathrooms || 3
  );
  const [kitchenType, setKitchenType] = useState<'OPEN' | 'SEMI_OPEN' | 'CLOSED'>(
    initialBrief?.program?.kitchenType || 'SEMI_OPEN'
  );
  const [ventilationMode, setVentilationMode] = useState<'CROSS_BREEZE' | 'MUTTRAM_SIPHON' | 'WIND_CATCHER'>('CROSS_BREEZE');
  const [poojaRoom, setPoojaRoom] = useState<boolean>(
    initialBrief?.program?.poojaRoom ?? true
  );
  const [courtyardMuttram, setCourtyardMuttram] = useState<boolean>(
    initialBrief?.program?.courtyardMuttram || false
  );
  const [thinnaiVerandah, setThinnaiVerandah] = useState<boolean>(
    initialBrief?.program?.thinnaiVerandah || false
  );

  // Dedicated Car Parking
  const [enableDedicatedParking, setEnableDedicatedParking] = useState<boolean>(true);
  const [cars, setCars] = useState<number>(1);
  const [carType, setCarType] = useState<CarType>('SUV');
  const [parkingEnclosure, setParkingEnclosure] = useState<'COVERED_PORTICO' | 'OPEN_DRIVEWAY'>('COVERED_PORTICO');

  // Regulations & Vastu
  const [codeProfile, setCodeProfile] = useState<'TNCDBR_2019' | 'NBC_2016' | 'IRC'>(
    initialBrief?.regulations?.codeProfile || 'TNCDBR_2019'
  );
  const [vastuPreference, setVastuPreference] = useState<'STRICT' | 'FLEXIBLE' | 'OFF'>(
    initialBrief?.regulations?.vastuPreference || 'FLEXIBLE'
  );
  const [soilType, setSoilType] = useState<RegulatoryAndVastu['soilType']>(
    initialBrief?.regulations?.soilType || 'LOAM'
  );
  const [cityLocation, setCityLocation] = useState<string>('Chennai / Tamil Nadu');

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
      setSide1Setback(2);
      setSide2Setback(2);
    } else {
      setFrontSetback(5);
      setRearSetback(5);
      setSide1Setback(3);
      setSide2Setback(3);
    }
  }, [parsedPlot.widthFt, parsedPlot.depthFt]);

  // Construct standard DesignBrief candidate object
  const currentBriefCandidate: DesignBrief = useMemo(() => {
    const polygonVertices = [
      { x: 0, y: 0 },
      { x: parsedPlot.widthFt, y: 0 },
      { x: parsedPlot.widthFt, y: parsedPlot.depthFt },
      { x: 0, y: parsedPlot.depthFt },
    ];

    const plotObj: PlotPolygon = {
      vertices: polygonVertices,
      width: parsedPlot.widthFt,
      depth: parsedPlot.depthFt,
      shape: 'RECTANGLE',
      roadFacingSide,
      roadWidthFt,
      isCornerPlot,
      slopePercent,
    };

    const roomPref: RoomPreference = {
      bedrooms,
      bathrooms,
      attachedBaths: Math.max(1, bathrooms - 1),
      kitchenType,
      hasUtilityWash: true,
      livingDiningArrangement: 'COMBINED_OPEN',
      parkingSpaces: {
        cars: enableDedicatedParking ? cars : 0,
        bikes: 2,
        isCovered: parkingEnclosure === 'COVERED_PORTICO',
      },
      staircaseType: staircaseDesign === 'SPIRAL_CORE' ? 'SPIRAL' : staircaseDesign === 'EXTERNAL_RENTAL' ? 'EXTERNAL' : 'INTERNAL_DOG_LEGGED',
      poojaRoom,
      studyOffice: false,
      balconiesCount: 1,
      courtyardMuttram: courtyardMuttram || typology === 'CHETTINAD_COURTYARD',
      thinnaiVerandah: thinnaiVerandah || typology === 'CHETTINAD_COURTYARD',
      terraceGarden: roofArch === 'PERGOLA_DECK',
    };

    const regAndVastu: RegulatoryAndVastu = {
      codeProfile,
      setbacks: {
        frontFt: frontSetback,
        rearFt: rearSetback,
        side1Ft: side1Setback,
        side2Ft: side2Setback,
        isAutoDerived: false,
      },
      vastuPreference,
      budgetBand: 'STANDARD',
      soilType,
      city: cityLocation,
    };

    return {
      version: '2.0',
      projectId: initialBrief?.projectId || `proj-${Date.now()}`,
      projectName: `${parsedPlot.widthFt}x${parsedPlot.depthFt} ${typology.replace('_', ' ')}`,
      clientName: 'Private Client',
      createdAt: new Date().toISOString(),
      entryMode: 'STRUCTURED',
      plot: plotObj,
      building: {
        floors,
        targetBuiltUpSqFt,
        hasLiftProvision,
        ceilingHeightFt: 10,
      },
      program: roomPref,
      regulations: regAndVastu,
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
    typology,
    roofArch,
    staircaseDesign,
    enableDedicatedParking,
    cars,
    parkingEnclosure,
    codeProfile,
    frontSetback,
    rearSetback,
    side1Setback,
    side2Setback,
    vastuPreference,
    soilType,
    cityLocation,
    displayUnit,
    freeText,
    initialBrief?.projectId,
  ]);

  // Live Feasibility Evaluation
  const feasibility: FeasibilityResult = useMemo(
    () => checkFeasibility(currentBriefCandidate),
    [currentBriefCandidate]
  );

  // Edge cases detector and auto-solver explanations
  const edgeCaseDiagnosis = useMemo(() => {
    const issues: { type: 'critical' | 'warning' | 'info'; title: string; resolution: string }[] = [];
    const width = parsedPlot.widthFt;
    const depth = parsedPlot.depthFt;
    const area = parsedPlot.areaSqFt;
    const buildableW = Math.max(0, width - side1Setback - side2Setback);
    const buildableD = Math.max(0, depth - frontSetback - rearSetback);

    if (area < 600) {
      issues.push({
        type: 'warning',
        title: `Micro-Plot Geometry (${area} sq ft)`,
        resolution: 'Engine automatically activates Compact Urban Micro-Studio mode: collapses circulation corridors to zero, stacks bathrooms vertically, and utilizes open-tread staircases.'
      });
    }

    if (width < 22) {
      issues.push({
        type: 'warning',
        title: `Narrow Frontage Constraint (${width} ft)`,
        resolution: 'Engine deploys Linear Single-File Zoning: rooms sequenced front-to-back with central skylight core to eliminate dark interior rooms.'
      });
    }

    if (buildableW < 14) {
      issues.push({
        type: 'critical',
        title: `Setbacks Exceed Plot Width (Net buildable: ${buildableW.toFixed(1)} ft)`,
        resolution: 'Engine auto-recalibrates side clearances to minimum TNCDBR Rule 35 zero-lot-line firewall, preserving a functional 16-ft structural bay.'
      });
    }

    const maxFloorsForArea = area < 1000 ? 'G+2' : 'G+3';
    if (targetBuiltUpSqFt > area * 2.4) {
      issues.push({
        type: 'info',
        title: `High Density FSI Ratio (${(targetBuiltUpSqFt / area).toFixed(2)})`,
        resolution: `Target built-up area (${targetBuiltUpSqFt} sq ft) requires vertical stacking. Engine configures a Stilt Parking + ${maxFloorsForArea} duplex envelope with structural shear cores.`
      });
    }

    return issues;
  }, [parsedPlot, side1Setback, side2Setback, frontSetback, rearSetback, targetBuiltUpSqFt]);

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
    <div className="w-full space-y-8 animate-fadeIn max-w-7xl mx-auto">
      {/* Mode Choice Header Banner */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-5 bg-[var(--color-paper-2)] border border-[var(--color-rule-2)] rounded-lg">
        <div>
          <span className="text-[11px] font-mono uppercase tracking-widest text-[var(--color-accent)] font-semibold">
            01 Enterprise Intake Configuration
          </span>
          <h1 className="font-serif text-2xl sm:text-3xl text-[var(--color-ink)] mt-0.5">
            Define Plot, Typology &amp; Engineering Requirements
          </h1>
          <p className="text-xs sm:text-sm text-[var(--color-muted)] font-sans mt-1">
            Specify plot dimensions, architectural typology, dedicated vehicle parking, and structural parameters.
          </p>
        </div>

        {onOpenAssumptionMode && (
          <button
            type="button"
            onClick={onOpenAssumptionMode}
            className="flex items-center gap-2 px-4 py-2.5 rounded text-xs font-mono uppercase tracking-wider bg-[var(--color-paper)] border border-[var(--color-accent)] text-[var(--color-accent)] hover:bg-[var(--color-accent)] hover:text-white transition shadow-sm cursor-pointer whitespace-nowrap"
          >
            <Camera className="w-4 h-4" />
            <span>Unsure of dimensions? Upload Photo / Sketch</span>
          </button>
        )}
      </div>

      <form onSubmit={handleFormSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Input Form (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* 1. Plot Dimensions & Location */}
          <div className="p-5 bg-[var(--color-paper-2)] border border-[var(--color-rule-2)] rounded-lg space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-xs font-mono uppercase tracking-wider text-[var(--color-ink)] font-semibold flex items-center gap-2">
                <Building2 className="w-4 h-4 text-[var(--color-accent)]" />
                <span>Plot Dimensions &amp; Location</span>
              </label>
              <div className="flex items-center gap-1 text-[11px] font-mono text-[var(--color-muted)]">
                <span>Unit:</span>
                <select
                  value={displayUnit}
                  onChange={e => setDisplayUnit(e.target.value as any)}
                  className="bg-[var(--color-paper)] border border-[var(--color-rule-2)] px-2 py-0.5 rounded text-[11px]"
                >
                  <option value="FEET_INCHES">Feet &amp; Inches (e.g. 30' x 40')</option>
                  <option value="FEET">Feet Decimal</option>
                  <option value="METERS">Meters (e.g. 9m x 12m)</option>
                  <option value="CENT">Tamil Nadu Cent (1 cent = 435.6 sqft)</option>
                  <option value="GROUND">Ground (1 ground = 2,400 sqft)</option>
                  <option value="SQFT">Total Sq Ft</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="text-[11px] font-mono text-[var(--color-muted)] block mb-1">
                  Dimensions (Width × Depth) or Area
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={dimInput}
                    onChange={e => setDimInput(e.target.value)}
                    placeholder="e.g. 30x40, 40x60, 2.5 cents, 1 ground"
                    className="flex-1 bg-[var(--color-paper)] border border-[var(--color-rule-2)] px-3 py-2 rounded font-mono text-sm focus:outline-none focus:ring-1 focus:ring-[var(--color-accent)]"
                  />
                  <div className="px-3 py-2 bg-[var(--color-paper-3)] border border-[var(--color-rule-2)] rounded font-mono text-xs text-[var(--color-ink)] whitespace-nowrap">
                    {parsedPlot.widthFt}' × {parsedPlot.depthFt}' ({parsedPlot.areaSqFt} sq ft)
                  </div>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-mono text-[var(--color-muted)] block mb-1">Location / District</label>
                <input
                  type="text"
                  value={cityLocation}
                  onChange={e => setCityLocation(e.target.value)}
                  placeholder="e.g. Chennai / Coimbatore"
                  className="w-full bg-[var(--color-paper)] border border-[var(--color-rule-2)] px-3 py-2 rounded text-xs font-mono"
                />
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

          {/* 2. Building Typology Visual Cards */}
          <div className="p-5 bg-[var(--color-paper-2)] border border-[var(--color-rule-2)] rounded-lg space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-xs font-mono uppercase tracking-wider text-[var(--color-ink)] font-semibold flex items-center gap-2">
                <Home className="w-4 h-4 text-[var(--color-accent)]" />
                <span>Building Typology with Architectural Preview</span>
              </label>
              <span className="text-[10px] font-mono text-[var(--color-muted)]">Select Primary Archetype</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                {
                  id: 'MODERN_VILLA',
                  title: 'Modern Minimalist Villa',
                  badge: 'Contemporary Luxury',
                  image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=600&q=80',
                  desc: 'Double-height volume, cantilevered glass balconies, seamless indoor-outdoor deck integration.'
                },
                {
                  id: 'CHETTINAD_COURTYARD',
                  title: 'Chettinad Heritage Courtyard',
                  badge: 'Tamil Regional Vastu',
                  image: 'https://images.unsplash.com/photo-1590381105924-c72589b9ef3f?auto=format&fit=crop&w=600&q=80',
                  desc: 'Sunlit central Mutram, carved Burma teak pillars, Athangudi terracotta tiles, thermal cooling.'
                },
                {
                  id: 'STILT_DUPLEX',
                  title: 'Stilt + 2 Contemporary Duplex',
                  badge: 'Multi-Car & Urban Living',
                  image: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=600&q=80',
                  desc: 'Ground floor covered stilt parking & foyer, duplex upper family sanctuary with private terrace.'
                },
                {
                  id: 'URBAN_ROW_HOUSE',
                  title: 'Compact Urban Row House',
                  badge: 'Max Carpet Efficiency',
                  image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=600&q=80',
                  desc: 'Optimized for narrow frontages (20–30ft), zero corridor waste, central lightwell stair core.'
                }
              ].map(card => {
                const isSelected = typology === card.id;
                return (
                  <div
                    key={card.id}
                    onClick={() => {
                      setTypology(card.id as BuildingTypology);
                      if (card.id === 'CHETTINAD_COURTYARD') {
                        setCourtyardMuttram(true);
                        setThinnaiVerandah(true);
                      }
                    }}
                    className={`group relative rounded-lg overflow-hidden border cursor-pointer transition-all duration-200 ${
                      isSelected
                        ? 'border-[var(--color-accent)] ring-2 ring-[var(--color-accent)] shadow-md bg-[var(--color-paper)]'
                        : 'border-[var(--color-rule-2)] bg-[var(--color-paper-2)] hover:border-[var(--color-rule)]'
                    }`}
                  >
                    <div className="h-28 w-full overflow-hidden relative">
                      <img
                        src={card.image}
                        alt={card.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <span className="absolute top-2 right-2 px-2 py-0.5 rounded text-[10px] font-mono uppercase tracking-wider bg-black/75 text-white backdrop-blur-sm">
                        {card.badge}
                      </span>
                      {isSelected && (
                        <div className="absolute top-2 left-2 w-6 h-6 rounded-full bg-[var(--color-accent)] text-white flex items-center justify-center shadow">
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        </div>
                      )}
                    </div>
                    <div className="p-3">
                      <h4 className="font-serif text-sm text-[var(--color-ink)] font-semibold">{card.title}</h4>
                      <p className="text-[11px] text-[var(--color-muted)] font-sans mt-0.5 leading-snug">{card.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 3. Roof Architecture & Staircase Design */}
          <div className="p-5 bg-[var(--color-paper-2)] border border-[var(--color-rule-2)] rounded-lg space-y-4">
            <label className="text-xs font-mono uppercase tracking-wider text-[var(--color-ink)] font-semibold flex items-center gap-2">
              <Layers className="w-4 h-4 text-[var(--color-accent)]" />
              <span>Roof Architecture &amp; Staircase Engineering</span>
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-[11px] font-mono text-[var(--color-muted)] block mb-1">Roof Architecture</label>
                <select
                  value={roofArch}
                  onChange={e => setRoofArch(e.target.value as RoofArchitecture)}
                  className="w-full bg-[var(--color-paper)] border border-[var(--color-rule-2)] px-2.5 py-2 rounded text-xs font-mono"
                >
                  <option value="FLAT_RCC_TERRACE">Flat RCC Accessible Terrace (Solar/Garden)</option>
                  <option value="SLOPED_MANGALORE_TILE">Sloped Mangalore Clay Tile Pitch</option>
                  <option value="MODERN_GABLE">Modern Sloped Gable (Cathedral Volume)</option>
                  <option value="PERGOLA_DECK">Louvered Pergola Open Deck</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-mono text-[var(--color-muted)] block mb-1">Staircase Design</label>
                <select
                  value={staircaseDesign}
                  onChange={e => setStaircaseDesign(e.target.value as StaircaseDesign)}
                  className="w-full bg-[var(--color-paper)] border border-[var(--color-rule-2)] px-2.5 py-2 rounded text-xs font-mono"
                >
                  <option value="INTERNAL_DOG_LEGGED">Internal Dog-legged RCC (Standard)</option>
                  <option value="FLOATING_TIMBER">Open-Tread Floating Wood Stair</option>
                  <option value="SPIRAL_CORE">Contemporary Spiral Core</option>
                  <option value="EXTERNAL_RENTAL">External Dedicated Rental Access</option>
                </select>
              </div>
            </div>
          </div>

          {/* 4. Dedicated Car Parking Selector */}
          <div className="p-5 bg-[var(--color-paper-2)] border border-[var(--color-rule-2)] rounded-lg space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-xs font-mono uppercase tracking-wider text-[var(--color-ink)] font-semibold flex items-center gap-2">
                <Car className="w-4 h-4 text-[var(--color-accent)]" />
                <span>Dedicated Car Parking &amp; Portico</span>
              </label>
              <label className="flex items-center gap-2 text-xs font-mono cursor-pointer">
                <input
                  type="checkbox"
                  checked={enableDedicatedParking}
                  onChange={e => setEnableDedicatedParking(e.target.checked)}
                  className="accent-[var(--color-accent)] rounded"
                />
                <span>Enable Portico Parking</span>
              </label>
            </div>

            {enableDedicatedParking && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                <div>
                  <label className="text-[11px] font-mono text-[var(--color-muted)] block mb-1">Number of Cars</label>
                  <select
                    value={cars}
                    onChange={e => setCars(Number(e.target.value))}
                    className="w-full bg-[var(--color-paper)] border border-[var(--color-rule-2)] px-2.5 py-2 rounded text-xs font-mono"
                  >
                    <option value={1}>1 Car Bay</option>
                    <option value={2}>2 Cars (Side-by-Side)</option>
                    <option value={3}>3 Cars (Stilt Portico)</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-mono text-[var(--color-muted)] block mb-1">Vehicle Size / Type</label>
                  <select
                    value={carType}
                    onChange={e => setCarType(e.target.value as CarType)}
                    className="w-full bg-[var(--color-paper)] border border-[var(--color-rule-2)] px-2.5 py-2 rounded text-xs font-mono"
                  >
                    <option value="SUV">Full-Size SUV (18' × 9' Bay)</option>
                    <option value="SEDAN">Executive Sedan (16' × 8.5' Bay)</option>
                    <option value="HATCHBACK">Compact Hatchback (14' × 8' Bay)</option>
                    <option value="EV_CHARGING">EV + 11kW Wallbox Station</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-mono text-[var(--color-muted)] block mb-1">Enclosure Type</label>
                  <select
                    value={parkingEnclosure}
                    onChange={e => setParkingEnclosure(e.target.value as any)}
                    className="w-full bg-[var(--color-paper)] border border-[var(--color-rule-2)] px-2.5 py-2 rounded text-xs font-mono"
                  >
                    <option value="COVERED_PORTICO">Covered RCC Slab Portico</option>
                    <option value="OPEN_DRIVEWAY">Open Paved Driveway</option>
                  </select>
                </div>
              </div>
            )}
          </div>

          {/* 5. Room Program, Guest Room & Ventilation */}
          <div className="p-5 bg-[var(--color-paper-2)] border border-[var(--color-rule-2)] rounded-lg space-y-4">
            <label className="text-xs font-mono uppercase tracking-wider text-[var(--color-ink)] font-semibold flex items-center gap-2">
              <Compass className="w-4 h-4 text-[var(--color-accent)]" />
              <span>Room Program &amp; Ventilation Dynamics</span>
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
                <label className="text-[11px] font-mono text-[var(--color-muted)] block mb-1">Kitchen Format</label>
                <select
                  value={kitchenType}
                  onChange={e => setKitchenType(e.target.value as any)}
                  className="w-full bg-[var(--color-paper)] border border-[var(--color-rule-2)] px-2.5 py-2 rounded text-xs font-mono"
                >
                  <option value="SEMI_OPEN">Semi-Open Breakfast Bar</option>
                  <option value="OPEN">Open Island Concept</option>
                  <option value="CLOSED">Closed + Wet Utility</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-mono text-[var(--color-muted)] block mb-1">Ventilation</label>
                <select
                  value={ventilationMode}
                  onChange={e => setVentilationMode(e.target.value as any)}
                  className="w-full bg-[var(--color-paper)] border border-[var(--color-rule-2)] px-2.5 py-2 rounded text-xs font-mono"
                >
                  <option value="CROSS_BREEZE">Cross-Breeze Flank</option>
                  <option value="MUTTRAM_SIPHON">Courtyard Muttram Siphon</option>
                  <option value="WIND_CATCHER">Louvered Breezeway</option>
                </select>
              </div>
            </div>

            {/* Checkboxes for Guest Room & Heritage features */}
            <div className="pt-2 border-t border-[var(--color-rule)] grid grid-cols-1 sm:grid-cols-3 gap-2">
              <label className="flex items-center gap-2 p-2 bg-[var(--color-paper)] border border-[var(--color-rule-2)] rounded text-xs font-mono cursor-pointer">
                <input
                  type="checkbox"
                  checked={hasGuestRoom}
                  onChange={e => setHasGuestRoom(e.target.checked)}
                  className="accent-[var(--color-accent)] rounded"
                />
                <span>Dedicated Guest Room</span>
              </label>

              <label className="flex items-center gap-2 p-2 bg-[var(--color-paper)] border border-[var(--color-rule-2)] rounded text-xs font-mono cursor-pointer">
                <input
                  type="checkbox"
                  checked={poojaRoom}
                  onChange={e => setPoojaRoom(e.target.checked)}
                  className="accent-[var(--color-accent)] rounded"
                />
                <span>NE Pooja Sanctuary</span>
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

        {/* Right Column: Feasibility Audit, Edge-Cases & Setbacks (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Real-Time Edge Case Diagnosis Panel */}
          {edgeCaseDiagnosis.length > 0 && (
            <div className="p-4 rounded-lg bg-stone-900 text-stone-100 border border-stone-800 space-y-3 font-mono text-xs shadow-md">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-[var(--color-accent)]">
                  <ShieldCheck className="w-4 h-4" />
                  <span className="font-bold uppercase tracking-wider text-[11px]">
                    Edge-Case Engineering Resolution
                  </span>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded bg-stone-800 text-stone-300">
                  {edgeCaseDiagnosis.length} Active Handler(s)
                </span>
              </div>

              {edgeCaseDiagnosis.map((item, i) => (
                <div key={i} className="p-2.5 rounded bg-stone-950/70 border border-stone-800 space-y-1">
                  <div className="flex items-center gap-1.5 text-amber-400 font-semibold text-[11px]">
                    <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
                    <span>{item.title}</span>
                  </div>
                  <p className="text-[10px] text-stone-300 leading-relaxed font-sans">
                    {item.resolution}
                  </p>
                </div>
              ))}
            </div>
          )}

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
                {typology.replace('_', ' ')}
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
              <span>Synthesize 3 Distinct Architectural Solutions</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Setbacks & Regulatory Settings */}
          <div className="p-5 bg-[var(--color-paper-2)] border border-[var(--color-rule-2)] rounded-lg space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-xs font-mono uppercase tracking-wider text-[var(--color-ink)] font-semibold flex items-center gap-2">
                <Shield className="w-4 h-4 text-[var(--color-accent)]" />
                <span>Building Setbacks &amp; Codes</span>
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
                  <option value="STRICT">Strict Vastu (9-Pada)</option>
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
