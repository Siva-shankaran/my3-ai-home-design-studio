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
  Info
} from 'lucide-react';

export interface MinuteDesignConfig {
  flooringId: string;
  sofaId: string;
  sanitaryId: string;
  carId: string;
}

export const FLOORING_OPTIONS = [
  {
    id: 'statuario',
    name: 'Italian Statuario Marble',
    subtitle: 'Bookmatched Polished White & Grey Veins',
    rate: '₹450 / sq.ft',
    image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=400&q=80',
    colorHex: '#F8FAFC',
    stroke: '#CBD5E1',
    description: 'High-gloss mirror polish imported marble with distinctive feather veining for grand living & dining spaces.'
  },
  {
    id: 'athangudi',
    name: 'Athangudi Heritage Tiles',
    subtitle: 'Handmade Chettinad Mineral Oxide',
    rate: '₹180 / sq.ft',
    image: 'https://images.unsplash.com/photo-1590381105924-c72589b9ef3f?auto=format&fit=crop&w=400&q=80',
    colorHex: '#C85A32',
    stroke: '#9A3412',
    description: 'Traditional glass-cast artisanal tiles cured in water tanks for 21 days; ages into a lustrous patina.'
  },
  {
    id: 'teak_parquet',
    name: 'Herringbone Teak Parquet',
    subtitle: 'Quarter-Sawn Seasoned Burma Teak',
    rate: '₹380 / sq.ft',
    image: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=400&q=80',
    colorHex: '#B45309',
    stroke: '#78350F',
    description: 'Warm acoustic dampening interlocking 45° herringbone wooden blocks for bedrooms and private lounges.'
  },
  {
    id: 'kota_stone',
    name: 'Polished Grey Kota Stone',
    subtitle: 'Fine-Grained Natural Limestone',
    rate: '₹120 / sq.ft',
    image: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=400&q=80',
    colorHex: '#64748B',
    stroke: '#334155',
    description: 'Non-porous, naturally cool underfoot, hardwearing stone perfect for tropical muttrams and verandas.'
  },
  {
    id: 'travertine',
    name: 'Honed Travertine Beige',
    subtitle: 'Filled Italian Natural Slabs',
    rate: '₹340 / sq.ft',
    image: 'https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&w=400&q=80',
    colorHex: '#E2D9CC',
    stroke: '#A8A29E',
    description: 'Subtle earthy texture with filled porosity and matte silky finish for modern minimalist interiors.'
  }
];

export const SOFA_OPTIONS = [
  {
    id: 'boucle_sectional',
    name: 'Minimalist Bouclé Sectional',
    badge: 'Contemporary Lounge',
    image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=400&q=80',
    description: 'Organic low-profile curved seating in textured off-white bouclé fabric with floating walnut plinth.'
  },
  {
    id: 'chesterfield',
    name: 'Chesterfield Tufted Leather',
    badge: 'Classic Heritage',
    image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=400&q=80',
    description: 'Deep button-tufted cognac Italian full-grain leather sofa with rolled arms and antique bronze studs.'
  },
  {
    id: 'scandi_oak',
    name: 'Scandinavian White Oak & Linen',
    badge: 'Japandi Restraint',
    image: 'https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?auto=format&fit=crop&w=400&q=80',
    description: 'Clean solid oak frame with feather-down cushions in neutral oatmeal linen.'
  },
  {
    id: 'chettinad_teak',
    name: 'Chettinad Carved Teak Diwan',
    badge: 'Tamil Tradition',
    image: 'https://images.unsplash.com/photo-1538688525198-9b88f6f53126?auto=format&fit=crop&w=400&q=80',
    description: 'Hand-carved Burma teak wooden daybed with turned brass legs, bolster pillows, and silk upholstery.'
  }
];

export const SANITARY_OPTIONS = [
  {
    id: 'geberit_grohe',
    name: 'Geberit Concealed Wall-Hung WC',
    badge: 'Premium Minimal',
    specs: 'Rimless ceramic, pneumatic dual-flush actuator, Grohe brushed brass thermostatic mixer.',
    image: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=400&q=80'
  },
  {
    id: 'kohler_vessel',
    name: 'Kohler Monolithic Stone Vessel',
    badge: 'Luxury Master Ensuite',
    specs: 'Countertop fluted vessel basin, Nero Marquina vanity counter, LED backlit anti-fog mirror.',
    image: 'https://images.unsplash.com/photo-1620626011761-996317b8d101?auto=format&fit=crop&w=400&q=80'
  },
  {
    id: 'utility_laundry',
    name: 'Dedicated Wet Utility & Laundry',
    badge: 'Service Core',
    specs: 'Stacked Bosch front-load washer & heat-pump dryer, deep granite wash tub, concealed broom tall unit.',
    image: 'https://images.unsplash.com/photo-1517646287270-a5a9ca602e5c?auto=format&fit=crop&w=400&q=80'
  }
];

export const CAR_OPTIONS = [
  {
    id: 'suv_fortuner',
    name: 'Full-Size Luxury SUV',
    model: 'Toyota Fortuner / Land Rover Defender',
    dimensions: "18'-0\" × 9'-0\" Bay Clearance",
    badge: 'Heavy Utility',
    image: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=400&q=80'
  },
  {
    id: 'sedan_luxury',
    name: 'Executive Sedan',
    model: 'BMW 3-Series / Honda City',
    dimensions: "16'-6\" × 8'-6\" Bay Clearance",
    badge: 'Aerodynamic Stature',
    image: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=400&q=80'
  },
  {
    id: 'ev_wallbox',
    name: 'Electric Vehicle + 11kW Wallbox',
    model: 'Tesla Model Y / Hyundai Ioniq 5',
    dimensions: "16'-0\" × 9'-0\" + Charging Station",
    badge: 'Zero Emission & Solar Sync',
    image: 'https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=400&q=80'
  }
];

interface MinuteDesignPanelProps {
  config: MinuteDesignConfig;
  onChange: (updates: Partial<MinuteDesignConfig>) => void;
  onApplyPresetStyle?: (styleName: string) => void;
}

export const MinuteDesignPanel: React.FC<MinuteDesignPanelProps> = ({
  config,
  onChange,
  onApplyPresetStyle
}) => {
  const [activeCategory, setActiveCategory] = useState<'flooring' | 'sofa' | 'sanitary' | 'car'>('flooring');

  return (
    <div className="flex flex-col h-full bg-[var(--color-paper)] border-l border-[var(--color-rule-2)] w-full font-sans overflow-hidden">
      {/* Category Tabs */}
      <div className="p-3 bg-[var(--color-paper-2)] border-b border-[var(--color-rule-2)] flex items-center justify-between">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-widest text-[var(--color-accent)] font-semibold">
            Bespoke Architecture Specs
          </span>
          <h3 className="font-serif text-base text-[var(--color-ink)]">
            Minute Design &amp; Material Finishes
          </h3>
        </div>
      </div>

      {/* Selector Pills */}
      <div className="grid grid-cols-4 p-2 gap-1 border-b border-[var(--color-rule-2)] bg-[var(--color-paper-3)] text-[11px] font-mono">
        <button
          type="button"
          onClick={() => setActiveCategory('flooring')}
          className={`py-1.5 px-2 rounded flex items-center justify-center gap-1.5 transition cursor-pointer ${
            activeCategory === 'flooring'
              ? 'bg-[var(--color-accent)] text-white font-bold shadow-xs'
              : 'text-[var(--color-muted)] hover:text-[var(--color-ink)]'
          }`}
        >
          <Palette className="w-3 h-3" />
          <span>Flooring</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveCategory('sofa')}
          className={`py-1.5 px-2 rounded flex items-center justify-center gap-1.5 transition cursor-pointer ${
            activeCategory === 'sofa'
              ? 'bg-[var(--color-accent)] text-white font-bold shadow-xs'
              : 'text-[var(--color-muted)] hover:text-[var(--color-ink)]'
          }`}
        >
          <Sofa className="w-3 h-3" />
          <span>Living</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveCategory('sanitary')}
          className={`py-1.5 px-2 rounded flex items-center justify-center gap-1.5 transition cursor-pointer ${
            activeCategory === 'sanitary'
              ? 'bg-[var(--color-accent)] text-white font-bold shadow-xs'
              : 'text-[var(--color-muted)] hover:text-[var(--color-ink)]'
          }`}
        >
          <Bath className="w-3 h-3" />
          <span>Sanitary</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveCategory('car')}
          className={`py-1.5 px-2 rounded flex items-center justify-center gap-1.5 transition cursor-pointer ${
            activeCategory === 'car'
              ? 'bg-[var(--color-accent)] text-white font-bold shadow-xs'
              : 'text-[var(--color-muted)] hover:text-[var(--color-ink)]'
          }`}
        >
          <Car className="w-3 h-3" />
          <span>Portico</span>
        </button>
      </div>

      {/* Tab Panels */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {/* 1. FLOORING SELECTION */}
        {activeCategory === 'flooring' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs font-mono text-[var(--color-muted)]">
              <span>Select Structural Floor Finish</span>
              <span>5 Verified Slabs</span>
            </div>

            {FLOORING_OPTIONS.map(opt => {
              const isSelected = config.flooringId === opt.id;
              return (
                <div
                  key={opt.id}
                  onClick={() => onChange({ flooringId: opt.id })}
                  className={`p-3 rounded-lg border transition-all cursor-pointer flex gap-3 ${
                    isSelected
                      ? 'border-[var(--color-accent)] bg-[var(--color-paper-2)] ring-1 ring-[var(--color-accent)]'
                      : 'border-[var(--color-rule-2)] bg-[var(--color-paper)] hover:border-[var(--color-rule)]'
                  }`}
                >
                  <div className="w-16 h-16 rounded overflow-hidden flex-shrink-0 relative border border-[var(--color-rule-2)]">
                    <img src={opt.image} alt={opt.name} className="w-full h-full object-cover" />
                    {isSelected && (
                      <div className="absolute inset-0 bg-[var(--color-accent)]/20 flex items-center justify-center">
                        <Check className="w-4 h-4 text-white drop-shadow" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="font-serif text-sm font-semibold text-[var(--color-ink)] truncate">
                        {opt.name}
                      </h4>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
                        {opt.rate}
                      </span>
                    </div>
                    <div className="text-[11px] font-mono text-[var(--color-accent)] mt-0.5">
                      {opt.subtitle}
                    </div>
                    <p className="text-[10px] text-[var(--color-muted)] font-sans mt-1 leading-snug line-clamp-2">
                      {opt.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* 2. SOFA / LIVING SELECTION */}
        {activeCategory === 'sofa' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs font-mono text-[var(--color-muted)]">
              <span>Living Room Seating Arrangement</span>
              <span>Bespoke Archetypes</span>
            </div>

            {SOFA_OPTIONS.map(opt => {
              const isSelected = config.sofaId === opt.id;
              return (
                <div
                  key={opt.id}
                  onClick={() => onChange({ sofaId: opt.id })}
                  className={`p-3 rounded-lg border transition-all cursor-pointer flex gap-3 ${
                    isSelected
                      ? 'border-[var(--color-accent)] bg-[var(--color-paper-2)] ring-1 ring-[var(--color-accent)]'
                      : 'border-[var(--color-rule-2)] bg-[var(--color-paper)] hover:border-[var(--color-rule)]'
                  }`}
                >
                  <div className="w-16 h-16 rounded overflow-hidden flex-shrink-0 relative border border-[var(--color-rule-2)]">
                    <img src={opt.image} alt={opt.name} className="w-full h-full object-cover" />
                    {isSelected && (
                      <div className="absolute inset-0 bg-[var(--color-accent)]/20 flex items-center justify-center">
                        <Check className="w-4 h-4 text-white drop-shadow" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="font-serif text-sm font-semibold text-[var(--color-ink)] truncate">
                        {opt.name}
                      </h4>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[var(--color-paper-3)] border border-[var(--color-rule-2)] text-[var(--color-muted)]">
                        {opt.badge}
                      </span>
                    </div>
                    <p className="text-[10px] text-[var(--color-muted)] font-sans mt-1 leading-snug">
                      {opt.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* 3. SANITARYWARE & UTILITY */}
        {activeCategory === 'sanitary' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs font-mono text-[var(--color-muted)]">
              <span>Plumbing Fixtures &amp; Utility Stack</span>
              <span>CPVC / Concealed</span>
            </div>

            {SANITARY_OPTIONS.map(opt => {
              const isSelected = config.sanitaryId === opt.id;
              return (
                <div
                  key={opt.id}
                  onClick={() => onChange({ sanitaryId: opt.id })}
                  className={`p-3 rounded-lg border transition-all cursor-pointer flex gap-3 ${
                    isSelected
                      ? 'border-[var(--color-accent)] bg-[var(--color-paper-2)] ring-1 ring-[var(--color-accent)]'
                      : 'border-[var(--color-rule-2)] bg-[var(--color-paper)] hover:border-[var(--color-rule)]'
                  }`}
                >
                  <div className="w-16 h-16 rounded overflow-hidden flex-shrink-0 relative border border-[var(--color-rule-2)]">
                    <img src={opt.image} alt={opt.name} className="w-full h-full object-cover" />
                    {isSelected && (
                      <div className="absolute inset-0 bg-[var(--color-accent)]/20 flex items-center justify-center">
                        <Check className="w-4 h-4 text-white drop-shadow" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="font-serif text-sm font-semibold text-[var(--color-ink)] truncate">
                        {opt.name}
                      </h4>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-blue-50 text-blue-800 border border-blue-200">
                        {opt.badge}
                      </span>
                    </div>
                    <p className="text-[10px] text-[var(--color-muted)] font-mono mt-1 leading-snug">
                      {opt.specs}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* 4. CAR PORTICO SELECTION */}
        {activeCategory === 'car' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs font-mono text-[var(--color-muted)]">
              <span>Portico Bay Vehicle Scale</span>
              <span>Bay Dimension Verified</span>
            </div>

            {CAR_OPTIONS.map(opt => {
              const isSelected = config.carId === opt.id;
              return (
                <div
                  key={opt.id}
                  onClick={() => onChange({ carId: opt.id })}
                  className={`p-3 rounded-lg border transition-all cursor-pointer flex gap-3 ${
                    isSelected
                      ? 'border-[var(--color-accent)] bg-[var(--color-paper-2)] ring-1 ring-[var(--color-accent)]'
                      : 'border-[var(--color-rule-2)] bg-[var(--color-paper)] hover:border-[var(--color-rule)]'
                  }`}
                >
                  <div className="w-16 h-16 rounded overflow-hidden flex-shrink-0 relative border border-[var(--color-rule-2)]">
                    <img src={opt.image} alt={opt.name} className="w-full h-full object-cover" />
                    {isSelected && (
                      <div className="absolute inset-0 bg-[var(--color-accent)]/20 flex items-center justify-center">
                        <Check className="w-4 h-4 text-white drop-shadow" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="font-serif text-sm font-semibold text-[var(--color-ink)] truncate">
                        {opt.name}
                      </h4>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-50 text-amber-900 border border-amber-200">
                        {opt.badge}
                      </span>
                    </div>
                    <div className="text-[11px] font-mono text-[var(--color-accent)] mt-0.5">
                      {opt.model}
                    </div>
                    <p className="text-[10px] text-[var(--color-muted)] font-mono mt-1">
                      📐 {opt.dimensions}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
