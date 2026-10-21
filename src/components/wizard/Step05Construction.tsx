import React, { useState, useMemo } from 'react';
import type { ProjectDesign } from '../../types/project.ts';
import { generateColumnGrid } from '../../engine/structure/columnGridPlacer.ts';
import { calculateFootings } from '../../engine/structure/loadTakedown.ts';
import { calculateBOQ } from '../../engine/structure/boqCalculator.ts';
import { generateFootingPlanSvg, generateFootingSectionSvg } from '../../engine/structure/foundationDrawings.ts';
import { STRUCTURE_CONFIG } from '../../engine/structure/structure.config.ts';
import { 
  Hammer, 
  Layers, 
  FileSpreadsheet, 
  ShieldAlert, 
  ArrowRight, 
  Info, 
  Settings2,
  CheckCircle2,
  Building,
  Download
} from 'lucide-react';

interface Step05ConstructionProps {
  project: ProjectDesign;
  onProceedToVerification: () => void;
}

export const Step05Construction: React.FC<Step05ConstructionProps> = ({
  project,
  onProceedToVerification,
}) => {
  const [activeTab, setActiveTab] = useState<'drawings' | 'columns' | 'boq' | 'basis'>('drawings');
  const [drawingView, setDrawingView] = useState<'plan' | 'section'>('plan');

  // Compute Structural Elements & BOQ Parametrically
  const columns = useMemo(() => generateColumnGrid(project), [project]);
  const footings = useMemo(
    () => calculateFootings(columns, project.briefSnapshot.regulations.soilType, project.floors.length),
    [columns, project]
  );
  const boq = useMemo(() => calculateBOQ(project, footings, columns), [project, footings, columns]);

  // Generate SVGs
  const footingPlanSvg = useMemo(
    () => generateFootingPlanSvg(columns, footings, project.briefSnapshot.plot.width, project.briefSnapshot.plot.depth),
    [columns, footings, project]
  );
  const avgFootingSize = footings.length > 0 ? footings[0].lengthFt : 4.5;
  const avgDepth = footings.length > 0 ? footings[0].totalDepthFt : 4.5;
  const footingSectionSvg = useMemo(
    () => generateFootingSectionSvg(avgFootingSize, avgDepth),
    [avgFootingSize, avgDepth]
  );

  return (
    <div className="space-y-8 animate-fadeIn max-w-6xl mx-auto w-full">
      {/* Top Banner with Engineering Disclaimer */}
      <div className="p-4 bg-amber-50/80 border border-amber-300 rounded-lg text-amber-950 flex items-start gap-3">
        <ShieldAlert className="w-5 h-5 text-amber-700 flex-shrink-0 mt-0.5" />
        <div className="text-xs font-sans">
          <span className="font-bold uppercase tracking-wider font-mono">Mandatory Engineering Disclaimer: </span>
          <span>
            Preliminary estimate and architectural layouts generated for planning purposes. Structural grid, reinforcement schedules, and foundation sizing are computed per IS 456 / IS 875 benchmarks and must be verified and certified by a licensed structural engineer and local municipal planning authority prior to construction.
          </span>
        </div>
      </div>

      {/* Main Title & Action Bar */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-5 bg-[var(--color-paper-2)] border border-[var(--color-rule-2)] rounded-lg">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-widest text-[var(--color-accent)] font-semibold">
            05 • Structural Engineering & Material Package
          </span>
          <h1 className="font-serif text-2xl sm:text-3xl text-[var(--color-ink)] mt-0.5">
            Foundation Layout & Bill of Quantities (BOQ)
          </h1>
          <p className="text-xs text-[var(--color-muted)] font-mono mt-1">
            IS 456:2000 Column Grid • {columns.length} RCC Columns • {footings.length} Isolated Footings • Fe500 Steel
          </p>
        </div>

        <button
          type="button"
          onClick={onProceedToVerification}
          className="flex items-center gap-2 px-5 py-2.5 rounded text-xs font-mono uppercase tracking-wider font-bold bg-[var(--color-accent)] text-white hover:opacity-95 shadow-sm cursor-pointer whitespace-nowrap"
        >
          <span>Audit Verification Report</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Tab Navigation */}
      <div className="flex border-b border-[var(--color-rule)] gap-2 text-xs font-mono">
        {[
          { id: 'drawings', label: '1. Foundation SVGs', icon: Layers },
          { id: 'columns', label: '2. Column Schedule', icon: Building },
          { id: 'boq', label: '3. Materials & BOQ', icon: FileSpreadsheet },
          { id: 'basis', label: '4. Basis of Estimate', icon: Settings2 },
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 border-b-2 font-semibold transition cursor-pointer ${
                isActive
                  ? 'border-[var(--color-accent)] text-[var(--color-accent)]'
                  : 'border-transparent text-[var(--color-muted)] hover:text-[var(--color-ink)]'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: Foundation SVGs */}
      {activeTab === 'drawings' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setDrawingView('plan')}
                className={`px-3 py-1.5 rounded text-xs font-mono cursor-pointer border ${
                  drawingView === 'plan'
                    ? 'bg-[var(--color-accent)] text-white border-[var(--color-accent)] font-bold'
                    : 'bg-[var(--color-paper-2)] border-[var(--color-rule-2)] text-[var(--color-ink)]'
                }`}
              >
                Footing Layout Plan (1:50)
              </button>
              <button
                type="button"
                onClick={() => setDrawingView('section')}
                className={`px-3 py-1.5 rounded text-xs font-mono cursor-pointer border ${
                  drawingView === 'section'
                    ? 'bg-[var(--color-accent)] text-white border-[var(--color-accent)] font-bold'
                    : 'bg-[var(--color-paper-2)] border-[var(--color-rule-2)] text-[var(--color-ink)]'
                }`}
              >
                Trapezoidal Footing Section Detail
              </button>
            </div>
            <span className="text-[11px] font-mono text-[var(--color-muted)]">
              Vector CAD SVGs ready for issue sheets
            </span>
          </div>

          <div className="p-6 bg-[var(--color-paper-2)] border border-[var(--color-rule-2)] rounded-lg flex items-center justify-center">
            {drawingView === 'plan' ? (
              <div
                className="w-full max-w-2xl mx-auto shadow-sm"
                dangerouslySetInnerHTML={{ __html: footingPlanSvg }}
              />
            ) : (
              <div
                className="w-full max-w-2xl mx-auto shadow-sm"
                dangerouslySetInnerHTML={{ __html: footingSectionSvg }}
              />
            )}
          </div>
        </div>
      )}

      {/* TAB 2: Column Schedule Table */}
      {activeTab === 'columns' && (
        <div className="p-5 bg-[var(--color-paper-2)] border border-[var(--color-rule-2)] rounded-lg space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-serif text-lg text-[var(--color-ink)]">
              Reinforced Concrete Column Schedule (IS 456:2000)
            </h3>
            <span className="text-xs font-mono text-[var(--color-muted)]">
              Concrete Grade M25 • HYSD Fe500 Rebar
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono border-collapse">
              <thead>
                <tr className="border-b border-[var(--color-rule)] bg-[var(--color-paper-3)] text-[var(--color-muted)]">
                  <th className="p-2.5">Mark</th>
                  <th className="p-2.5">Grid Position</th>
                  <th className="p-2.5">Dimensions (b × D)</th>
                  <th className="p-2.5">Longitudinal Rebar</th>
                  <th className="p-2.5">Lateral Ties / Stirrups</th>
                  <th className="p-2.5 text-right">Factored Axial Pu</th>
                </tr>
              </thead>
              <tbody>
                {columns.map(c => (
                  <tr key={c.id} className="border-b border-[var(--color-rule-2)] hover:bg-[var(--color-paper)]">
                    <td className="p-2.5 font-bold text-[var(--color-accent)]">{c.code}</td>
                    <td className="p-2.5">X: {c.position.x}' - Y: {c.position.y}'</td>
                    <td className="p-2.5">{c.widthInches}" × {c.depthInches}" (230 × 300 mm)</td>
                    <td className="p-2.5">{c.reinforcement}</td>
                    <td className="p-2.5">{c.stirrups}</td>
                    <td className="p-2.5 text-right font-semibold">{c.factoredAxialLoadKN} kN</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: Bill of Quantities (BOQ) */}
      {activeTab === 'boq' && (
        <div className="space-y-6">
          {/* Key Metric Highlights Card */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-lg bg-[var(--color-paper-2)] border border-[var(--color-rule-2)] font-mono text-xs">
              <span className="text-[10px] text-[var(--color-muted)] uppercase block">Cement Bags (50kg)</span>
              <span className="text-xl font-bold text-[var(--color-ink)] mt-1 block">
                {boq.cementBagsCount} Bags
              </span>
              <span className="text-[10px] text-[var(--color-muted)]">M20/M25 &amp; Masonry</span>
            </div>

            <div className="p-4 rounded-lg bg-[var(--color-paper-2)] border border-[var(--color-rule-2)] font-mono text-xs">
              <span className="text-[10px] text-[var(--color-muted)] uppercase block">Steel Rebar (Fe500)</span>
              <span className="text-xl font-bold text-[var(--color-accent)] mt-1 block">
                {boq.steelKgByDiameter.totalKg.toLocaleString()} kg
              </span>
              <span className="text-[10px] text-emerald-700 font-semibold">{boq.steelKgPerSqFt} kg / sq ft</span>
            </div>

            <div className="p-4 rounded-lg bg-[var(--color-paper-2)] border border-[var(--color-rule-2)] font-mono text-xs">
              <span className="text-[10px] text-[var(--color-muted)] uppercase block">Total RCC Concrete</span>
              <span className="text-xl font-bold text-[var(--color-ink)] mt-1 block">
                {(boq.concreteVolumeM20M3 + boq.concreteVolumeM25M3).toFixed(1)} m³
              </span>
              <span className="text-[10px] text-[var(--color-muted)]">M20: {boq.concreteVolumeM20M3}m³ • M25: {boq.concreteVolumeM25M3}m³</span>
            </div>

            <div className="p-4 rounded-lg bg-[var(--color-paper-2)] border border-[var(--color-rule-2)] font-mono text-xs">
              <span className="text-[10px] text-[var(--color-muted)] uppercase block">Estimated Structure Cost</span>
              <span className="text-xl font-bold text-emerald-700 mt-1 block">
                ₹{(boq.estimatedCostRangeINR.min / 100000).toFixed(1)}L – ₹{(boq.estimatedCostRangeINR.max / 100000).toFixed(1)}L
              </span>
              <span className="text-[10px] text-[var(--color-muted)]">Tamil Nadu 2026 PWD Index</span>
            </div>
          </div>

          {/* Steel Reinforcement Schedule by Diameter */}
          <div className="p-5 bg-[var(--color-paper-2)] border border-[var(--color-rule-2)] rounded-lg space-y-3 font-mono text-xs">
            <h4 className="font-serif text-sm text-[var(--color-ink)] font-semibold">
              Steel Reinforcement Breakdown by Rebar Diameter (SP 34)
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              <div className="p-2.5 rounded bg-[var(--color-paper)] border border-[var(--color-rule-2)]">
                <span className="text-[10px] text-[var(--color-muted)] block">8mm (Stirrups)</span>
                <span className="font-bold text-sm">{boq.steelKgByDiameter.dia8mmKg} kg</span>
              </div>
              <div className="p-2.5 rounded bg-[var(--color-paper)] border border-[var(--color-rule-2)]">
                <span className="text-[10px] text-[var(--color-muted)] block">10mm (Slab/Footing)</span>
                <span className="font-bold text-sm">{boq.steelKgByDiameter.dia10mmKg} kg</span>
              </div>
              <div className="p-2.5 rounded bg-[var(--color-paper)] border border-[var(--color-rule-2)]">
                <span className="text-[10px] text-[var(--color-muted)] block">12mm (Beam/Col)</span>
                <span className="font-bold text-sm">{boq.steelKgByDiameter.dia12mmKg} kg</span>
              </div>
              <div className="p-2.5 rounded bg-[var(--color-paper)] border border-[var(--color-rule-2)]">
                <span className="text-[10px] text-[var(--color-muted)] block">16mm (Main Column)</span>
                <span className="font-bold text-sm">{boq.steelKgByDiameter.dia16mmKg} kg</span>
              </div>
              <div className="p-2.5 rounded bg-[var(--color-paper)] border border-[var(--color-rule-2)]">
                <span className="text-[10px] text-[var(--color-muted)] block">20mm (Ground Beam)</span>
                <span className="font-bold text-sm">{boq.steelKgByDiameter.dia20mmKg} kg</span>
              </div>
            </div>
          </div>

          {/* Itemized BOQ Table */}
          <div className="p-5 bg-[var(--color-paper-2)] border border-[var(--color-rule-2)] rounded-lg space-y-3">
            <h4 className="font-serif text-sm text-[var(--color-ink)] font-semibold">
              Itemized Bill of Quantities (BOQ)
            </h4>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono border-collapse">
                <thead>
                  <tr className="border-b border-[var(--color-rule)] bg-[var(--color-paper-3)] text-[var(--color-muted)]">
                    <th className="p-2.5">Category</th>
                    <th className="p-2.5">Description</th>
                    <th className="p-2.5">IS Standard</th>
                    <th className="p-2.5 text-right">Quantity</th>
                    <th className="p-2.5 text-right">Unit Rate</th>
                    <th className="p-2.5 text-right">Amount (INR)</th>
                  </tr>
                </thead>
                <tbody>
                  {boq.itemsTable.map((item, idx) => (
                    <tr key={idx} className="border-b border-[var(--color-rule-2)] hover:bg-[var(--color-paper)]">
                      <td className="p-2.5 font-bold text-[10px]">{item.category}</td>
                      <td className="p-2.5 font-sans">{item.itemDescription}</td>
                      <td className="p-2.5 text-[10px] text-[var(--color-muted)]">{item.standardClause}</td>
                      <td className="p-2.5 text-right font-bold">{item.quantity} {item.unit}</td>
                      <td className="p-2.5 text-right">₹{item.unitRateINR.toLocaleString()}</td>
                      <td className="p-2.5 text-right font-bold text-[var(--color-ink)]">₹{item.amountINR.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: Basis of Estimate */}
      {activeTab === 'basis' && (
        <div className="p-5 bg-[var(--color-paper-2)] border border-[var(--color-rule-2)] rounded-lg space-y-4 font-mono text-xs">
          <div className="flex items-center gap-2">
            <Settings2 className="w-4 h-4 text-[var(--color-accent)]" />
            <h3 className="font-serif text-base text-[var(--color-ink)]">
              Structural Engineering Assumptions &amp; Standards
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded bg-[var(--color-paper)] border border-[var(--color-rule-2)] space-y-2">
              <span className="font-bold text-[var(--color-accent)] uppercase tracking-wider block">
                Geotechnical &amp; Sub-structure
              </span>
              <p className="text-xs text-[var(--color-muted)] font-sans">
                Soil Profile: <span className="font-bold text-[var(--color-ink)]">{project.briefSnapshot.regulations.soilType}</span> (SBC = 200 kN/m²). Minimum footing depth is set to 4.5 ft below ground level to reach firm hardpan strata.
              </p>
              <div className="text-[11px] text-[var(--color-muted)]">
                Standard: IS 1904 (Code of practice for structural foundations)
              </div>
            </div>

            <div className="p-4 rounded bg-[var(--color-paper)] border border-[var(--color-rule-2)] space-y-2">
              <span className="font-bold text-[var(--color-accent)] uppercase tracking-wider block">
                Super-structure &amp; Load Combinations
              </span>
              <p className="text-xs text-[var(--color-muted)] font-sans">
                Dead loads calculated using 25 kN/m³ for RCC and 19 kN/m³ for brick masonry. Imposed live loads taken as 2.0 kN/m² for rooms and 3.0 kN/m² for stairs per IS 875 Part 2.
              </p>
              <div className="text-[11px] text-[var(--color-muted)]">
                Standard: IS 875 (Parts 1 &amp; 2) and IS 456 Clause 36 limit states
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
