import React, { useState } from 'react';
import type { 
  Project, TamilNaduDistrict, PlanningAuthority, SiteProfile, 
  GeotechnicalData, FoundationConcept 
} from '../types';
import { tamilNaduRulesService } from '../services/tamilNaduRulesService';
import { geotechnicalService } from '../services/geotechnicalService';
import { tamilNaduCostService } from '../services/tamilNaduCostService';
import { designService } from '../services/designService';
import { 
  MapPin, Landmark, Building2, ShieldCheck, Ruler, 
  Layers, Sparkles, AlertTriangle, CheckCircle2, ChevronRight,
  TrendingUp, RefreshCw, HardHat, FileSpreadsheet, Compass
} from 'lucide-react';

interface TamilNaduStudioPanelProps {
  project: Project;
  onUpdateProject: (updated: Project) => void;
  onClose: () => void;
}

const DISTRICT_LIST: TamilNaduDistrict[] = [
  'Chennai',
  'Coimbatore',
  'Madurai',
  'Tiruchirappalli',
  'Salem',
  'Tirunelveli',
  'Kanchipuram',
  'Chengalpattu',
  'Vellore',
  'Erode',
  'Tiruppur',
  'Thanjavur'
];

export const TamilNaduStudioPanel: React.FC<TamilNaduStudioPanelProps> = ({
  project,
  onUpdateProject,
  onClose
}) => {
  const currentSite: SiteProfile = project.siteProfile || {
    state: 'Tamil Nadu',
    district: 'Chennai',
    planningAuthority: 'CMDA',
    plotWidth: 40,
    plotDepth: 60,
    plotAreaSqft: 2400,
    plotAreaCents: 5.51,
    plotAreaGrounds: 1.0,
    roadWidthFeet: 30,
    roadFacingSide: 'North',
    frontSetbackRequiredFeet: 5,
    rearSetbackRequiredFeet: 5,
    sideSetbackRequiredFeet: 3.3,
    permittedFSI: 1.75,
    maxPlotCoveragePercent: 70
  };

  const [district, setDistrict] = useState<TamilNaduDistrict>((currentSite.district as TamilNaduDistrict) || 'Chennai');
  const [authority, setAuthority] = useState<PlanningAuthority>(currentSite.planningAuthority || (district === 'Chennai' ? 'CMDA' : 'DTCP'));
  const [plotWidth, setPlotWidth] = useState<number>(currentSite.plotWidth || 40);
  const [plotDepth, setPlotDepth] = useState<number>(currentSite.plotDepth || 60);
  const [roadWidth, setRoadWidth] = useState<number>(currentSite.roadWidthFeet || 30);
  const [roadFacing, setRoadFacing] = useState<string>(currentSite.roadFacingSide || 'North');

  // Soil selection
  const regionalDefaults = geotechnicalService.getRegionalSoilDefaults(district);
  const [selectedSoil, setSelectedSoil] = useState<string>(regionalDefaults.typicalSoil);

  // Derived metrics
  const plotAreaSqft = plotWidth * plotDepth;
  const plotCents = Number((plotAreaSqft / 435.6).toFixed(2));
  const plotGrounds = Number((plotAreaSqft / 2400).toFixed(2));

  const floor1Rooms = project.rooms.filter(r => (r.floor || 1) === 1);
  const f1Area = floor1Rooms.reduce((acc, r) => acc + (r.width * r.height), 0);
  const coveragePercent = plotAreaSqft > 0 ? Math.round((f1Area / plotAreaSqft) * 100) : 0;
  const isCoverageCompliant = coveragePercent <= 70;

  // Setback rules
  const requiredFrontSetback = roadWidth >= 30 ? 10 : 5;

  // Live rules evaluation
  const liveProject: Project = {
    ...project,
    siteProfile: {
      ...currentSite,
      district,
      planningAuthority: authority,
      plotWidth,
      plotDepth,
      plotAreaSqft,
      plotAreaCents: plotCents,
      plotAreaGrounds: plotGrounds,
      roadWidthFeet: roadWidth,
      roadFacingSide: roadFacing as any,
      frontSetbackRequiredFeet: requiredFrontSetback
    }
  };

  const rules = tamilNaduRulesService.evaluateTNCDBR(liveProject);
  const costEstimate = tamilNaduCostService.calculateCostEstimate(
    project.sqft || 2400,
    district,
    false
  );

  const geotechData: GeotechnicalData = {
    hasReport: true,
    safeBearingCapacityKpa: regionalDefaults.estimatedSbcKpa,
    groundwaterDepthMeters: regionalDefaults.typicalWaterTableMeters,
    geotechnicalConsultantNotes: selectedSoil,
    isVerifiedByEngineer: false
  };

  const foundations: FoundationConcept[] = geotechnicalService.evaluateFoundationSystem(
    geotechData,
    district,
    project.floors || 2
  );
  const recommendedFoundation = foundations[0];

  const handleApplySiteConfig = () => {
    const updated = designService.enrichWithStructuralMetrics(liveProject, {
      sqft: project.sqft || 2400,
      floors: project.floors || 2,
      bedrooms: 4,
      bathrooms: 3,
      style: project.style || 'Tamil Nadu Vernacular',
      district,
      planningAuthority: authority,
      lotWidth: plotWidth,
      lotDepth: plotDepth,
      roadWidthFeet: roadWidth,
      orientation: roadFacing as any
    });
    onUpdateProject(updated);
  };

  const handleApplyTraditionalThinnaiPreset = () => {
    const traditional = designService.buildTraditionalThinnaiCourtyardHome(
      `Traditional Thinnai & Muttram Courtyard Home in ${district}`,
      {
        sqft: 2400,
        floors: project.floors || 2,
        bedrooms: 4,
        bathrooms: 3,
        style: 'Traditional Tamil Nadu Vernacular',
        district,
        planningAuthority: authority,
        lotWidth: plotWidth,
        lotDepth: plotDepth,
        roadWidthFeet: roadWidth,
        orientation: roadFacing as any
      }
    );
    onUpdateProject(traditional);
  };

  const handleApplyChennaiUrbanPreset = () => {
    const urban = designService.buildEngineeredMultiFloorPlan(
      'Chennai 30x40 Urban Contemporary G+1 Duplex with Parking and Terrace',
      {
        sqft: 2100,
        floors: 2,
        bedrooms: 3,
        bathrooms: 3,
        style: 'Contemporary',
        district: 'Chennai',
        planningAuthority: 'CMDA',
        lotWidth: 30,
        lotDepth: 40,
        roadWidthFeet: 30,
        orientation: 'North'
      }
    );
    onUpdateProject(urban);
  };

  return (
    <div className="w-96 bg-[var(--color-paper)] border-l border-[var(--color-rule)] flex flex-col h-full shadow-xl z-20 select-none animate-slide-in text-[var(--color-ink)] font-sans">
      {/* Panel Top Header */}
      <div className="p-4 border-b border-[var(--color-rule)] bg-[var(--color-paper-2)] flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 bg-[#dc2626]/10 text-[#dc2626] rounded-xl border border-[#dc2626]/20">
            <Landmark className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="font-bold text-sm text-[var(--color-ink)] font-display">Tamil Nadu Site Studio</h3>
              <span className="text-[10px] bg-[#0f172a] text-white font-mono px-1.5 py-0.5 rounded">
                TNCDBR-2019
              </span>
            </div>
            <p className="text-[11px] text-[var(--color-muted)] font-mono">Civil Codes, Soil & Regional Presets</p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-1.5 text-[var(--color-muted)] hover:text-[var(--color-ink)] rounded hover:bg-[var(--color-paper-3)] transition text-xs cursor-pointer"
        >
          ✕
        </button>
      </div>

      {/* Scrollable Content Body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
        {/* 1. Regional Architectural Presets */}
        <div className="p-3 bg-[var(--color-paper-2)] border border-[var(--color-rule)] rounded-xl space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="font-bold text-[var(--color-ink)] flex items-center gap-1.5 font-display">
              <Sparkles className="w-3.5 h-3.5 text-[#dc2626]" />
              Tamil Nadu Vernacular Presets
            </span>
            <span className="text-[10px] text-[var(--color-muted)] font-mono">1-Click Apply</span>
          </div>

          <div className="grid grid-cols-1 gap-2">
            <button
              onClick={handleApplyTraditionalThinnaiPreset}
              className="w-full text-left p-2.5 bg-[var(--color-paper)] hover:bg-[var(--color-paper-3)] border border-[var(--color-rule)] hover:border-[#dc2626] rounded-lg transition group cursor-pointer"
            >
              <div className="font-bold text-[var(--color-ink)] flex items-center justify-between">
                <span>Traditional Thinnai & Muttram</span>
                <ChevronRight className="w-3.5 h-3.5 text-[#dc2626] group-hover:translate-x-0.5 transition" />
              </div>
              <p className="text-[10px] text-[var(--color-muted)] mt-0.5 leading-snug">
                Features front Thinnai verandah, carved teak pillars, open Muttram courtyard, and NE Puja shrine.
              </p>
            </button>

            <button
              onClick={handleApplyChennaiUrbanPreset}
              className="w-full text-left p-2.5 bg-[var(--color-paper)] hover:bg-[var(--color-paper-3)] border border-[var(--color-rule)] hover:border-[#dc2626] rounded-lg transition group cursor-pointer"
            >
              <div className="font-bold text-[var(--color-ink)] flex items-center justify-between">
                <span>Chennai Urban Duplex (30×40 Plot)</span>
                <ChevronRight className="w-3.5 h-3.5 text-[#dc2626] group-hover:translate-x-0.5 transition" />
              </div>
              <p className="text-[10px] text-[var(--color-muted)] mt-0.5 leading-snug">
                Compact G+1 layout optimized for CMDA setback clearances, parking stilt, and rainwater harvesting.
              </p>
            </button>
          </div>
        </div>

        {/* 2. Site Jurisdiction & District */}
        <div className="p-3 bg-[var(--color-paper-2)] border border-[var(--color-rule)] rounded-xl space-y-3">
          <div className="flex items-center justify-between border-b border-[var(--color-rule)] pb-2">
            <span className="font-bold text-[var(--color-ink)] flex items-center gap-1.5 font-display">
              <MapPin className="w-3.5 h-3.5 text-[#dc2626]" />
              Jurisdiction & Location
            </span>
            <span className="text-[10px] text-[#dc2626] font-mono font-bold">{district}</span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] text-[var(--color-muted)] block mb-1 font-mono">Tamil Nadu District</label>
              <select
                value={district}
                onChange={(e) => {
                  const d = e.target.value as TamilNaduDistrict;
                  setDistrict(d);
                  if (d === 'Chennai') setAuthority('CMDA');
                  else setAuthority('DTCP');
                }}
                className="w-full bg-[var(--color-paper)] border border-[var(--color-rule)] rounded p-1.5 text-[var(--color-ink)] focus:outline-none focus:border-[#dc2626] font-mono"
              >
                {DISTRICT_LIST.map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[10px] text-[var(--color-muted)] block mb-1 font-mono">Planning Authority</label>
              <select
                value={authority}
                onChange={(e) => setAuthority(e.target.value as PlanningAuthority)}
                className="w-full bg-[var(--color-paper)] border border-[var(--color-rule)] rounded p-1.5 text-[var(--color-ink)] focus:outline-none focus:border-[#dc2626] font-mono"
              >
                <option value="CMDA">CMDA (Chennai Metro)</option>
                <option value="DTCP">DTCP (Town & Country)</option>
                <option value="Local_Body_Panchayat">Panchayat / Local Body</option>
              </select>
            </div>
          </div>
        </div>

        {/* 3. Plot Dimensions & Regional Land Units */}
        <div className="p-3 bg-[var(--color-paper-2)] border border-[var(--color-rule)] rounded-xl space-y-3">
          <div className="flex items-center justify-between border-b border-[var(--color-rule)] pb-2">
            <span className="font-bold text-[var(--color-ink)] flex items-center gap-1.5 font-display">
              <Ruler className="w-3.5 h-3.5 text-[#dc2626]" />
              Plot Dimensions & Units
            </span>
            <span className="text-[10px] text-[#dc2626] font-mono font-bold">{plotAreaSqft} sq ft</span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] text-[var(--color-muted)] block mb-1 font-mono">Plot Width (ft)</label>
              <input
                type="number"
                min="15"
                max="200"
                value={plotWidth}
                onChange={(e) => setPlotWidth(Number(e.target.value) || 0)}
                className="w-full bg-[var(--color-paper)] border border-[var(--color-rule)] rounded p-1.5 text-[var(--color-ink)] font-mono"
              />
            </div>

            <div>
              <label className="text-[10px] text-[var(--color-muted)] block mb-1 font-mono">Plot Depth (ft)</label>
              <input
                type="number"
                min="20"
                max="300"
                value={plotDepth}
                onChange={(e) => setPlotDepth(Number(e.target.value) || 0)}
                className="w-full bg-[var(--color-paper)] border border-[var(--color-rule)] rounded p-1.5 text-[var(--color-ink)] font-mono"
              />
            </div>
          </div>

          {/* Regional Land Unit Conversions */}
          <div className="grid grid-cols-2 gap-2 p-2 bg-[var(--color-paper)] border border-[var(--color-rule)] rounded-lg text-center">
            <div>
              <span className="text-[10px] text-[var(--color-muted)] block font-mono">Tamil Nadu Cents</span>
              <span className="text-sm font-bold text-[var(--color-ink)] font-mono">{plotCents} Cents</span>
              <span className="text-[9px] text-[var(--color-muted)] block font-mono">1 Cent = 435.6 sqft</span>
            </div>
            <div>
              <span className="text-[10px] text-[var(--color-muted)] block font-mono">Chennai Grounds</span>
              <span className="text-sm font-bold text-[var(--color-ink)] font-mono">{plotGrounds} Grounds</span>
              <span className="text-[9px] text-[var(--color-muted)] block font-mono">1 Ground = 2400 sqft</span>
            </div>
          </div>

          {/* Road Width & Facing */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] text-[var(--color-muted)] block mb-1 font-mono">Abutting Road Width</label>
              <select
                value={roadWidth}
                onChange={(e) => setRoadWidth(Number(e.target.value))}
                className="w-full bg-[var(--color-paper)] border border-[var(--color-rule)] rounded p-1.5 text-[var(--color-ink)] font-mono"
              >
                <option value={20}>20 ft Road (&lt; 30')</option>
                <option value={30}>30 ft Standard Road</option>
                <option value={40}>40 ft Main Road</option>
                <option value={60}>60 ft Commercial Arterial</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] text-[var(--color-muted)] block mb-1 font-mono">Plot Road Facing</label>
              <select
                value={roadFacing}
                onChange={(e) => setRoadFacing(e.target.value)}
                className="w-full bg-[var(--color-paper)] border border-[var(--color-rule)] rounded p-1.5 text-[var(--color-ink)] font-mono"
              >
                <option value="North">North (Kuberan / Wealth)</option>
                <option value="East">East (Indran / Health)</option>
                <option value="South">South (Yaman)</option>
                <option value="West">West (Varunan)</option>
                <option value="NE">North-East (Easanya)</option>
              </select>
            </div>
          </div>
        </div>

        {/* 4. Live TNCDBR-2019 Rule Compliance Check */}
        <div className="p-3 bg-[var(--color-paper-2)] border border-[var(--color-rule)] rounded-xl space-y-3">
          <div className="flex items-center justify-between border-b border-[var(--color-rule)] pb-2">
            <span className="font-bold text-[var(--color-ink)] flex items-center gap-1.5 font-display">
              <ShieldCheck className="w-3.5 h-3.5 text-[#dc2626]" />
              TNCDBR-2019 Live Check
            </span>
            <span className={`text-[10px] font-bold font-mono px-2 py-0.5 rounded border ${
              isCoverageCompliant 
                ? 'bg-emerald-50 text-emerald-800 border-emerald-300' 
                : 'bg-red-50 text-[#dc2626] border-red-300'
            }`}>
              {coveragePercent}% / 70% Max
            </span>
          </div>

          {/* Plot Coverage Progress Bar */}
          <div className="space-y-1">
            <div className="flex justify-between text-[10px] font-mono">
              <span className="text-[var(--color-muted)]">Ground Floor Coverage</span>
              <span className={isCoverageCompliant ? 'text-emerald-700 font-bold' : 'text-[#dc2626] font-bold'}>
                {f1Area} of {plotAreaSqft} sq ft
              </span>
            </div>
            <div className="w-full h-2 bg-[var(--color-paper-3)] rounded-full overflow-hidden">
              <div 
                className={`h-full transition-all duration-300 ${
                  isCoverageCompliant ? 'bg-[#0f172a]' : 'bg-[#dc2626]'
                }`}
                style={{ width: `${Math.min(coveragePercent, 100)}%` }}
              />
            </div>
          </div>

          {/* Key Rule Checklist */}
          <div className="space-y-1.5">
            {rules.slice(0, 4).map(r => (
              <div key={r.ruleId} className="flex items-start gap-2 p-2 bg-[var(--color-paper)] border border-[var(--color-rule)] rounded-lg">
                {r.status === 'PASS' ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                ) : r.status === 'REQUIRES_PROFESSIONAL_VERIFICATION' ? (
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                ) : (
                  <AlertTriangle className="w-3.5 h-3.5 text-[#dc2626] shrink-0 mt-0.5" />
                )}
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[var(--color-ink)] text-[11px]">{r.ruleName}</span>
                    <span className="text-[9px] font-mono text-[var(--color-muted)]">{r.clause}</span>
                  </div>
                  <p className="text-[10px] text-[var(--color-muted)] leading-snug mt-0.5">{r.explanation}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 5. Geotechnical & Foundation Concept */}
        <div className="p-3 bg-[var(--color-paper-2)] border border-[var(--color-rule)] rounded-xl space-y-2.5">
          <div className="flex items-center justify-between border-b border-[var(--color-rule)] pb-2">
            <span className="font-bold text-[var(--color-ink)] flex items-center gap-1.5 font-display">
              <HardHat className="w-3.5 h-3.5 text-[#dc2626]" />
              Soil & Foundation Concept
            </span>
            <span className="text-[10px] text-[#dc2626] font-mono font-bold">
              {regionalDefaults.estimatedSbcKpa} kN/m²
            </span>
          </div>

          <div>
            <label className="text-[10px] text-[var(--color-muted)] block mb-1 font-mono">Observed Subsoil Strata</label>
            <input
              type="text"
              value={selectedSoil}
              onChange={(e) => setSelectedSoil(e.target.value)}
              className="w-full bg-[var(--color-paper)] border border-[var(--color-rule)] rounded p-1.5 text-[var(--color-ink)] text-[11px] font-mono"
            />
          </div>

          {recommendedFoundation && (
            <div className="p-2.5 bg-[var(--color-paper)] border border-[var(--color-rule)] rounded-lg space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-[var(--color-ink)] text-[11px] font-display">{recommendedFoundation.title}</span>
                <span className="text-[9px] font-mono text-[#dc2626] font-bold">{recommendedFoundation.suitabilityScore}% Suitability</span>
              </div>
              <p className="text-[10px] text-[var(--color-muted)] leading-snug">{recommendedFoundation.description}</p>
              <div className="text-[10px] text-[var(--color-muted)] pt-1 flex items-center gap-2 font-mono">
                <span>Depth: <strong className="text-[var(--color-ink)]">{recommendedFoundation.recommendedDepthMeters}m BGL</strong></span>
                <span>•</span>
                <span>Plinth: <strong className="text-[var(--color-ink)]">{recommendedFoundation.plinthBeamSize}</strong></span>
              </div>
            </div>
          )}
        </div>

        {/* 6. Tamil Nadu Cost & BOQ Summary */}
        <div className="p-3 bg-[var(--color-paper-2)] border border-[var(--color-rule)] rounded-xl space-y-2.5">
          <div className="flex items-center justify-between border-b border-[var(--color-rule)] pb-2">
            <span className="font-bold text-[var(--color-ink)] flex items-center gap-1.5 font-display">
              <FileSpreadsheet className="w-3.5 h-3.5 text-[#dc2626]" />
              TN Cost & Material BOQ
            </span>
            <span className="text-sm font-bold text-[#dc2626] font-mono">
              {tamilNaduCostService.formatIndianRupees(costEstimate.totalCostInr)}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-1.5 text-[10px] text-[var(--color-ink)] font-mono">
            <div className="p-2 bg-[var(--color-paper)] border border-[var(--color-rule)] rounded-lg">
              <span className="text-[var(--color-muted)] block text-[9px]">53-Grade Cement</span>
              <span className="font-bold text-[var(--color-ink)]">{costEstimate.materialsBreakdown.cementBags.toLocaleString()} Bags</span>
            </div>
            <div className="p-2 bg-[var(--color-paper)] border border-[var(--color-rule)] rounded-lg">
              <span className="text-[var(--color-muted)] block text-[9px]">Fe550D TMT Steel</span>
              <span className="font-bold text-[var(--color-ink)]">{(costEstimate.materialsBreakdown.steelKg / 1000).toFixed(1)} MT</span>
            </div>
            <div className="p-2 bg-[var(--color-paper)] border border-[var(--color-rule)] rounded-lg">
              <span className="text-[var(--color-muted)] block text-[9px]">M-Sand</span>
              <span className="font-bold text-[var(--color-ink)]">{costEstimate.materialsBreakdown.mSandCft.toLocaleString()} cft</span>
            </div>
            <div className="p-2 bg-[var(--color-paper)] border border-[var(--color-rule)] rounded-lg">
              <span className="text-[var(--color-muted)] block text-[9px]">Class-1 Bricks</span>
              <span className="font-bold text-[var(--color-ink)]">{costEstimate.materialsBreakdown.bricksNos.toLocaleString()} Nos</span>
            </div>
          </div>
        </div>

        {/* Apply Configuration Button */}
        <div className="pt-2">
          <button
            onClick={handleApplySiteConfig}
            className="w-full py-2.5 bg-[#dc2626] hover:bg-[#b91c1c] text-white rounded-lg font-mono font-bold flex items-center justify-center gap-2 shadow-xs transition cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Update Site & Recalculate Columns</span>
          </button>
        </div>
      </div>
    </div>
  );
};
