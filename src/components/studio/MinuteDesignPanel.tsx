import React, { useState } from 'react';
import { 
  Sparkles, 
  Palette, 
  Sofa, 
  Bath, 
  Car, 
  Check, 
  Layers, 
  Sliders, 
  Maximize2,
  Zap,
  Info,
  Sun,
  Bed,
  Dices,
  RefreshCw,
  Loader2
} from 'lucide-react';

export interface MinuteDesignConfig {
  flooringId: string;
  sofaId: string;
  sanitaryId: string;
  carId: string;
  // Hearth specific controls
  seed?: number;
  sofa?: '2-seater' | '3-seater' | 'L-shape';
  sofaC?: string;
  bed?: 'Single' | 'Queen' | 'King';
  bedC?: string;
  rugC?: string;
  curC?: string;
  wall?: string;
  flr?: 'oak' | 'tile' | 'marble' | 'granite' | 'concrete';
  flB?: 'oak' | 'tile' | 'marble' | 'granite' | 'concrete';
  flW?: 'oak' | 'tile' | 'marble' | 'granite' | 'concrete';
  lt?: 'warm' | 'neutral' | 'cool';
  car?: 'None' | 'Hatchback' | 'Sedan' | 'SUV';
  laundry?: number;
}

const COLOR_SWATCHES = [
  { name: 'Paper White', hex: '#F8F6F0' },
  { name: 'Warm Terracotta', hex: '#C4552D' },
  { name: 'Deep Charcoal', hex: '#262626' },
  { name: 'Sage Green', hex: '#4A6B56' },
  { name: 'Oatmeal Linen', hex: '#D8D2C2' },
  { name: 'Indigo Blue', hex: '#1E3A8A' },
  { name: 'Raw Umber', hex: '#78350F' },
  { name: 'Athangudi Red', hex: '#9A3412' }
];

const FLOOR_TYPES = [
  { id: 'oak', name: 'Nordic Oak Hardwood', desc: 'Warm natural quarter-sawn plank' },
  { id: 'tile', name: 'Athangudi Heritage Tile', desc: 'Handcrafted floral oxide tile' },
  { id: 'marble', name: 'Italian Statuario Marble', desc: 'Polished white feather-veined slab' },
  { id: 'granite', name: 'Polished Jet Black Granite', desc: 'Durable non-porous polished stone' },
  { id: 'concrete', name: 'Polished IPS Micro-Cement', desc: 'Seamless monolithic modern grey' }
];

interface MinuteDesignPanelProps {
  config: MinuteDesignConfig;
  onChange: (updates: Partial<MinuteDesignConfig>) => void;
  onNewUniqueDesign?: () => void;
  onGenerateAiConcept?: () => Promise<void>;
}

export const MinuteDesignPanel: React.FC<MinuteDesignPanelProps> = ({
  config,
  onChange,
  onNewUniqueDesign,
  onGenerateAiConcept
}) => {
  const [activeCategory, setActiveCategory] = useState<'furniture' | 'floors' | 'colors' | 'vehicle'>('furniture');
  const [isGeneratingConcept, setIsGeneratingConcept] = useState(false);

  const handleConceptClick = async () => {
    if (!onGenerateAiConcept || isGeneratingConcept) return;
    setIsGeneratingConcept(true);
    try {
      await onGenerateAiConcept();
    } finally {
      setIsGeneratingConcept(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[var(--color-paper)] border-l border-[var(--color-rule-2)] w-full font-sans overflow-hidden">
      {/* Top Bar with Seed and AI Concept Triggers */}
      <div className="p-3.5 bg-[var(--color-paper-2)] border-b border-[var(--color-rule-2)] flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono uppercase tracking-widest text-[var(--color-accent)] font-semibold">
              Hearth Interior Studio
            </span>
            <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-stone-200 text-stone-800">
              SEED #{config.seed || 10482}
            </span>
          </div>
          <h3 className="font-serif text-sm font-semibold text-[var(--color-ink)]">
            Minute Design &amp; Architectural Specifications
          </h3>
        </div>

        <div className="flex items-center gap-1.5">
          {onNewUniqueDesign && (
            <button
              type="button"
              onClick={onNewUniqueDesign}
              title="Re-seed Layout for 100% Unique Plan"
              className="p-1.5 rounded border border-[var(--color-rule-2)] bg-[var(--color-paper)] hover:border-[var(--color-accent)] text-[var(--color-ink)] transition cursor-pointer flex items-center gap-1 text-[11px] font-mono"
            >
              <Dices className="w-3.5 h-3.5 text-[var(--color-accent)]" />
              <span className="hidden sm:inline">New Plan</span>
            </button>
          )}

          {onGenerateAiConcept && (
            <button
              type="button"
              disabled={isGeneratingConcept}
              onClick={handleConceptClick}
              title="Generate Coordinated Interior Concept"
              className="px-2.5 py-1.5 rounded bg-[var(--color-accent)] text-white hover:opacity-90 transition cursor-pointer flex items-center gap-1.5 text-[11px] font-mono font-bold shadow-xs"
            >
              {isGeneratingConcept ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Sparkles className="w-3.5 h-3.5 text-amber-200" />
              )}
              <span>AI Concept</span>
            </button>
          )}
        </div>
      </div>

      {/* Category Pills */}
      <div className="grid grid-cols-4 p-2 gap-1 border-b border-[var(--color-rule-2)] bg-[var(--color-paper-3)] text-[11px] font-mono">
        <button
          type="button"
          onClick={() => setActiveCategory('furniture')}
          className={`py-1.5 px-2 rounded flex items-center justify-center gap-1.5 transition cursor-pointer ${
            activeCategory === 'furniture'
              ? 'bg-[var(--color-accent)] text-white font-bold shadow-xs'
              : 'text-[var(--color-muted)] hover:text-[var(--color-ink)]'
          }`}
        >
          <Sofa className="w-3 h-3" />
          <span>Interiors</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveCategory('floors')}
          className={`py-1.5 px-2 rounded flex items-center justify-center gap-1.5 transition cursor-pointer ${
            activeCategory === 'floors'
              ? 'bg-[var(--color-accent)] text-white font-bold shadow-xs'
              : 'text-[var(--color-muted)] hover:text-[var(--color-ink)]'
          }`}
        >
          <Layers className="w-3 h-3" />
          <span>Floors</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveCategory('colors')}
          className={`py-1.5 px-2 rounded flex items-center justify-center gap-1.5 transition cursor-pointer ${
            activeCategory === 'colors'
              ? 'bg-[var(--color-accent)] text-white font-bold shadow-xs'
              : 'text-[var(--color-muted)] hover:text-[var(--color-ink)]'
          }`}
        >
          <Palette className="w-3 h-3" />
          <span>Palette</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveCategory('vehicle')}
          className={`py-1.5 px-2 rounded flex items-center justify-center gap-1.5 transition cursor-pointer ${
            activeCategory === 'vehicle'
              ? 'bg-[var(--color-accent)] text-white font-bold shadow-xs'
              : 'text-[var(--color-muted)] hover:text-[var(--color-ink)]'
          }`}
        >
          <Car className="w-3 h-3" />
          <span>Portico</span>
        </button>
      </div>

      {/* Tab Panels */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* 1. FURNITURE: SOFA & BED */}
        {activeCategory === 'furniture' && (
          <div className="space-y-4 text-xs font-mono">
            {/* Sofa Form */}
            <div className="p-3 rounded-lg bg-[var(--color-paper-2)] border border-[var(--color-rule-2)] space-y-2">
              <label className="text-[11px] text-[var(--color-muted)] uppercase tracking-wider block">
                Living Hall Sofa Configuration
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                {(['2-seater', '3-seater', 'L-shape'] as const).map(s => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => onChange({ sofa: s })}
                    className={`py-1.5 px-2 rounded border text-center transition cursor-pointer ${
                      (config.sofa || '3-seater') === s
                        ? 'border-[var(--color-accent)] bg-[var(--color-accent)] text-white font-bold'
                        : 'border-[var(--color-rule-2)] bg-[var(--color-paper)] text-[var(--color-ink)]'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>

              <div className="pt-2">
                <span className="text-[10px] text-[var(--color-muted)] block mb-1">Sofa Upholstery Color</span>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={config.sofaC || '#64748B'}
                    onChange={e => onChange({ sofaC: e.target.value })}
                    className="w-8 h-8 rounded border border-[var(--color-rule-2)] cursor-pointer p-0.5 bg-transparent"
                  />
                  <input
                    type="text"
                    value={config.sofaC || '#64748B'}
                    onChange={e => onChange({ sofaC: e.target.value })}
                    className="w-24 bg-[var(--color-paper)] border border-[var(--color-rule-2)] px-2 py-1 rounded text-xs"
                  />
                </div>
              </div>
            </div>

            {/* Bed Configuration */}
            <div className="p-3 rounded-lg bg-[var(--color-paper-2)] border border-[var(--color-rule-2)] space-y-2">
              <label className="text-[11px] text-[var(--color-muted)] uppercase tracking-wider block">
                Master Suite Bed Dimension
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                {(['Single', 'Queen', 'King'] as const).map(b => (
                  <button
                    key={b}
                    type="button"
                    onClick={() => onChange({ bed: b })}
                    className={`py-1.5 px-2 rounded border text-center transition cursor-pointer ${
                      (config.bed || 'Queen') === b
                        ? 'border-[var(--color-accent)] bg-[var(--color-accent)] text-white font-bold'
                        : 'border-[var(--color-rule-2)] bg-[var(--color-paper)] text-[var(--color-ink)]'
                    }`}
                  >
                    {b}
                  </button>
                ))}
              </div>

              <div className="pt-2">
                <span className="text-[10px] text-[var(--color-muted)] block mb-1">Bed Linen Color</span>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={config.bedC || '#FFFFFF'}
                    onChange={e => onChange({ bedC: e.target.value })}
                    className="w-8 h-8 rounded border border-[var(--color-rule-2)] cursor-pointer p-0.5 bg-transparent"
                  />
                  <input
                    type="text"
                    value={config.bedC || '#FFFFFF'}
                    onChange={e => onChange({ bedC: e.target.value })}
                    className="w-24 bg-[var(--color-paper)] border border-[var(--color-rule-2)] px-2 py-1 rounded text-xs"
                  />
                </div>
              </div>
            </div>

            {/* Dedicated Laundry Core */}
            <div className="p-3 rounded-lg bg-[var(--color-paper-2)] border border-[var(--color-rule-2)] flex items-center justify-between">
              <div>
                <label className="text-xs font-bold text-[var(--color-ink)] block">
                  Dedicated Laundry Room
                </label>
                <span className="text-[10px] text-[var(--color-muted)] block">
                  Stacked front-load washer, dryer &amp; granite utility tub
                </span>
              </div>
              <input
                type="checkbox"
                checked={config.laundry === 1}
                onChange={e => onChange({ laundry: e.target.checked ? 1 : 0 })}
                className="w-4 h-4 accent-[var(--color-accent)] rounded cursor-pointer"
              />
            </div>
          </div>
        )}

        {/* 2. ZONED FLOORINGS */}
        {activeCategory === 'floors' && (
          <div className="space-y-4 text-xs font-mono">
            {/* Living Floor (flr) */}
            <div className="p-3 rounded-lg bg-[var(--color-paper-2)] border border-[var(--color-rule-2)] space-y-2">
              <label className="text-[11px] text-[var(--color-muted)] uppercase tracking-wider block">
                1. Living &amp; Foyer Flooring (`flr`)
              </label>
              <select
                value={config.flr || 'tile'}
                onChange={e => onChange({ flr: e.target.value as any })}
                className="w-full bg-[var(--color-paper)] border border-[var(--color-rule-2)] px-2.5 py-2 rounded text-xs"
              >
                {FLOOR_TYPES.map(f => (
                  <option key={f.id} value={f.id}>
                    {f.name} — {f.desc}
                  </option>
                ))}
              </select>
            </div>

            {/* Bedroom Floor (flB) */}
            <div className="p-3 rounded-lg bg-[var(--color-paper-2)] border border-[var(--color-rule-2)] space-y-2">
              <label className="text-[11px] text-[var(--color-muted)] uppercase tracking-wider block">
                2. Bedroom &amp; Private Wing Flooring (`flB`)
              </label>
              <select
                value={config.flB || 'marble'}
                onChange={e => onChange({ flB: e.target.value as any })}
                className="w-full bg-[var(--color-paper)] border border-[var(--color-rule-2)] px-2.5 py-2 rounded text-xs"
              >
                {FLOOR_TYPES.map(f => (
                  <option key={f.id} value={f.id}>
                    {f.name} — {f.desc}
                  </option>
                ))}
              </select>
            </div>

            {/* Kitchen & Wet Zone Floor (flW) */}
            <div className="p-3 rounded-lg bg-[var(--color-paper-2)] border border-[var(--color-rule-2)] space-y-2">
              <label className="text-[11px] text-[var(--color-muted)] uppercase tracking-wider block">
                3. Kitchen, Bath &amp; Laundry Flooring (`flW`)
              </label>
              <select
                value={config.flW || 'granite'}
                onChange={e => onChange({ flW: e.target.value as any })}
                className="w-full bg-[var(--color-paper)] border border-[var(--color-rule-2)] px-2.5 py-2 rounded text-xs"
              >
                {FLOOR_TYPES.map(f => (
                  <option key={f.id} value={f.id}>
                    {f.name} — {f.desc}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* 3. PALETTE, WALLS & LIGHTING */}
        {activeCategory === 'colors' && (
          <div className="space-y-4 text-xs font-mono">
            {/* Wall Color */}
            <div className="p-3 rounded-lg bg-[var(--color-paper-2)] border border-[var(--color-rule-2)] space-y-2">
              <label className="text-[11px] text-[var(--color-muted)] uppercase tracking-wider block">
                Wall Plaster &amp; Cladding Tone (`wall`)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={config.wall || '#F4EFEB'}
                  onChange={e => onChange({ wall: e.target.value })}
                  className="w-8 h-8 rounded border border-[var(--color-rule-2)] cursor-pointer p-0.5 bg-transparent"
                />
                <input
                  type="text"
                  value={config.wall || '#F4EFEB'}
                  onChange={e => onChange({ wall: e.target.value })}
                  className="w-24 bg-[var(--color-paper)] border border-[var(--color-rule-2)] px-2 py-1 rounded text-xs"
                />
              </div>

              {/* Swatches */}
              <div className="flex items-center gap-1.5 pt-1 overflow-x-auto">
                {COLOR_SWATCHES.map(sw => (
                  <button
                    key={sw.hex}
                    type="button"
                    onClick={() => onChange({ wall: sw.hex })}
                    className="w-5 h-5 rounded-full border border-stone-300 hover:scale-110 transition shadow-xs flex-shrink-0"
                    style={{ backgroundColor: sw.hex }}
                    title={sw.name}
                  />
                ))}
              </div>
            </div>

            {/* Lighting Temperature */}
            <div className="p-3 rounded-lg bg-[var(--color-paper-2)] border border-[var(--color-rule-2)] space-y-2">
              <label className="text-[11px] text-[var(--color-muted)] uppercase tracking-wider block flex items-center gap-1.5">
                <Sun className="w-3.5 h-3.5 text-amber-500" />
                <span>Ambient Lighting Temperature (`lt`)</span>
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                {[
                  { id: 'warm', label: 'Warm 2700K' },
                  { id: 'neutral', label: 'Neutral 4000K' },
                  { id: 'cool', label: 'Daylight 6000K' }
                ].map(ltOpt => (
                  <button
                    key={ltOpt.id}
                    type="button"
                    onClick={() => onChange({ lt: ltOpt.id as any })}
                    className={`py-1.5 px-1 rounded border text-center transition cursor-pointer text-[10px] ${
                      (config.lt || 'warm') === ltOpt.id
                        ? 'border-[var(--color-accent)] bg-[var(--color-accent)] text-white font-bold'
                        : 'border-[var(--color-rule-2)] bg-[var(--color-paper)] text-[var(--color-ink)]'
                    }`}
                  >
                    {ltOpt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Rugs & Curtains */}
            <div className="grid grid-cols-2 gap-2">
              <div className="p-2.5 rounded bg-[var(--color-paper-2)] border border-[var(--color-rule-2)] space-y-1">
                <label className="text-[10px] text-[var(--color-muted)] uppercase block">Rug Tone (`rugC`)</label>
                <div className="flex items-center gap-1.5">
                  <input
                    type="color"
                    value={config.rugC || '#E5E7EB'}
                    onChange={e => onChange({ rugC: e.target.value })}
                    className="w-6 h-6 rounded cursor-pointer p-0"
                  />
                  <span className="text-[11px] font-mono">{config.rugC || '#E5E7EB'}</span>
                </div>
              </div>

              <div className="p-2.5 rounded bg-[var(--color-paper-2)] border border-[var(--color-rule-2)] space-y-1">
                <label className="text-[10px] text-[var(--color-muted)] uppercase block">Curtain Linen (`curC`)</label>
                <div className="flex items-center gap-1.5">
                  <input
                    type="color"
                    value={config.curC || '#D1D5DB'}
                    onChange={e => onChange({ curC: e.target.value })}
                    className="w-6 h-6 rounded cursor-pointer p-0"
                  />
                  <span className="text-[11px] font-mono">{config.curC || '#D1D5DB'}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 4. CAR PORTICO & VEHICLE TYPE */}
        {activeCategory === 'vehicle' && (
          <div className="space-y-4 text-xs font-mono">
            <div className="p-3 rounded-lg bg-[var(--color-paper-2)] border border-[var(--color-rule-2)] space-y-3">
              <label className="text-[11px] text-[var(--color-muted)] uppercase tracking-wider block">
                Portico Bay Vehicle Scale &amp; 3D Model
              </label>

              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'SUV', title: 'Full-Size SUV', desc: "18'x9' bay, high clearance" },
                  { id: 'Sedan', title: 'Executive Sedan', desc: "16.5'x8.5' bay, aerodynamic" },
                  { id: 'Hatchback', title: 'Compact Hatchback', desc: "14'x8' bay, urban mobility" },
                  { id: 'None', title: 'No Vehicle', desc: 'Open landscaped courtyard' }
                ].map(v => (
                  <button
                    key={v.id}
                    type="button"
                    onClick={() => onChange({ car: v.id as any })}
                    className={`p-2.5 rounded border text-left transition cursor-pointer ${
                      (config.car || 'SUV') === v.id
                        ? 'border-[var(--color-accent)] bg-[var(--color-paper)] ring-1 ring-[var(--color-accent)]'
                        : 'border-[var(--color-rule-2)] bg-[var(--color-paper)] hover:border-[var(--color-rule)]'
                    }`}
                  >
                    <div className="font-bold text-[11px] text-[var(--color-ink)]">{v.title}</div>
                    <div className="text-[9px] text-[var(--color-muted)] mt-0.5">{v.desc}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
