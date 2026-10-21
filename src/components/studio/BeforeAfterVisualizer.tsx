import React, { useState, useRef, useEffect } from 'react';
import { 
  SplitSquareVertical, 
  Sparkles, 
  Palette, 
  Layers, 
  Eye, 
  Maximize2,
  Check,
  RotateCw,
  Sun
} from 'lucide-react';

export interface StylePreset {
  id: string;
  name: string;
  subtitle: string;
  accent: string;
  floorMaterial: string;
  wallMaterial: string;
  woodwork: string;
  lighting: string;
  description: string;
  cadOverlayColor: string;
  renderImage: string;
  wireframeImage: string;
}

export const VISUALIZER_STYLES: StylePreset[] = [
  {
    id: 'chettinad',
    name: 'Chettinad Heritage',
    subtitle: 'Burma Teak, Athangudi Tiles & Central Mutram',
    accent: '#9A3412',
    floorMaterial: 'Athangudi Handmade Terracotta Tiles',
    wallMaterial: 'Limewash Ivory & Exposed Laterite Stone',
    woodwork: 'Carved Burma Teak Pillars & Joinery',
    lighting: 'Warm 2700K Brass Pendant & Natural Courtyard Skylight',
    description: 'Traditional Tamil architectural grandeur with sunken central muttram, high thermal mass, and natural cross-ventilation.',
    cadOverlayColor: '#EA580C',
    renderImage: 'https://images.unsplash.com/photo-1590381105924-c72589b9ef3f?auto=format&fit=crop&w=1200&q=85',
    wireframeImage: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=85'
  },
  {
    id: 'warm_minimal',
    name: 'Warm Minimalist',
    subtitle: 'Travertine Stone, White Oak & Soft Plaster',
    accent: '#B45309',
    floorMaterial: 'Honed Beige Travertine Large Format Slabs',
    wallMaterial: 'Micro-cement Warm Alabaster Plaster',
    woodwork: 'Quarter-sawn White Oak Fluted Paneling',
    lighting: 'Architectural Cove 3000K + Recessed Trimless Spots',
    description: 'Calm, monolithic spatial geometry with concealed storage, floor-to-ceiling frameless glazing, and tactile natural stone surfaces.',
    cadOverlayColor: '#D97706',
    renderImage: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1200&q=85',
    wireframeImage: 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=1200&q=85'
  },
  {
    id: 'tropical_brutalist',
    name: 'Tropical Brutalism',
    subtitle: 'Board-Formed Concrete, Laterite & Lush Courtyards',
    accent: '#059669',
    floorMaterial: 'Polished Grey IPS Oxide & Kota Stone',
    wallMaterial: 'Board-formed Exposed RCC & Red Laterite Block',
    woodwork: 'Reclaimed Jackfruit Wood & Matte Black Steel',
    lighting: 'Dramatic Grazing Uplights & Filtered Pergola Shadows',
    description: 'Inspired by Geoffrey Bawa and tropical modernism—raw honest concrete balanced by indoor monstera planters and deep cantilevers.',
    cadOverlayColor: '#059669',
    renderImage: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=1200&q=85',
    wireframeImage: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=85'
  },
  {
    id: 'japandi',
    name: 'Japandi Sanctuary',
    subtitle: 'Ash Timber, Wabi-Sabi Texture & Shoji Screens',
    accent: '#4F46E5',
    floorMaterial: 'Wide-Plank Brushed Ash Wood & Tatami Inserts',
    wallMaterial: 'Textured Kyoto Clay & Shikkui Plaster',
    woodwork: 'Japanese Cedar (Sugiban) & Slatted Screens',
    lighting: 'Diffused Paper Lantern Glow & Low-Glare Task Lights',
    description: 'Harmonious fusion of Scandinavian functionality and Japanese wabi-sabi restraint. Low-profile furniture and serene garden sightlines.',
    cadOverlayColor: '#6366F1',
    renderImage: 'https://images.unsplash.com/photo-1540518614846-7ede433c4b69?auto=format&fit=crop&w=1200&q=85',
    wireframeImage: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=85'
  },
  {
    id: 'contemporary_villa',
    name: 'Contemporary Luxury Villa',
    subtitle: 'Statuario Marble, Bronze Glass & Double-Height Volume',
    accent: '#2563EB',
    floorMaterial: 'Bookmatched Italian Statuario Marble',
    wallMaterial: 'Fluted Charcoal Stone & Suede Acoustic Panels',
    woodwork: 'Smoked Walnut Veneer & Champagne Anodized Brass',
    lighting: 'Smart DALI Tunable Linear Profiles & Statement Chandelier',
    description: 'High-contrast luxury featuring cantilevered balconies, frameless corner windows, and seamless indoor-outdoor deck integration.',
    cadOverlayColor: '#2563EB',
    renderImage: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=85',
    wireframeImage: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=85'
  }
];

interface BeforeAfterVisualizerProps {
  initialStyleId?: string;
  spaceTitle?: string;
  onApplyStyle?: (style: StylePreset) => void;
}

export const BeforeAfterVisualizer: React.FC<BeforeAfterVisualizerProps> = ({
  initialStyleId = 'chettinad',
  spaceTitle = 'Grand Living & Sunlit Courtyard Mutram',
  onApplyStyle
}) => {
  const [selectedStyleId, setSelectedStyleId] = useState<string>(initialStyleId);
  const [sliderPosition, setSliderPosition] = useState<number>(50);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const currentStyle = VISUALIZER_STYLES.find(s => s.id === selectedStyleId) || VISUALIZER_STYLES[0];

  const handlePointerDown = (e: React.PointerEvent) => {
    setIsDragging(true);
    updateSlider(e.clientX);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    updateSlider(e.clientX);
  };

  const handlePointerUp = () => {
    setIsDragging(false);
  };

  const updateSlider = (clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    const percent = Math.round((x / rect.width) * 100);
    setSliderPosition(percent);
  };

  return (
    <div className="flex flex-col h-full w-full bg-[var(--color-paper)] font-sans overflow-hidden">
      {/* Top Bar with Style Selector */}
      <div className="p-4 bg-[var(--color-paper-2)] border-b border-[var(--color-rule-2)] flex flex-wrap items-center justify-between gap-3">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-widest text-[var(--color-accent)] font-semibold">
            BIM Wireframe vs Photorealistic Architectural Render
          </span>
          <h2 className="font-serif text-lg text-[var(--color-ink)]">
            {spaceTitle} — {currentStyle.name}
          </h2>
        </div>

        {/* Style Preset Selector Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto text-xs font-mono py-1">
          {VISUALIZER_STYLES.map(style => {
            const isSelected = selectedStyleId === style.id;
            return (
              <button
                key={style.id}
                type="button"
                onClick={() => {
                  setSelectedStyleId(style.id);
                  if (onApplyStyle) onApplyStyle(style);
                }}
                className={`px-3 py-1.5 rounded-full border transition cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                  isSelected
                    ? 'border-[var(--color-accent)] bg-[var(--color-accent)] text-white font-bold shadow-xs'
                    : 'border-[var(--color-rule-2)] bg-[var(--color-paper)] text-[var(--color-muted)] hover:text-[var(--color-ink)]'
                }`}
              >
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: style.accent }} />
                <span>{style.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Split-Screen Visualizer Viewport */}
      <div className="flex-1 relative overflow-hidden bg-black select-none">
        <div
          ref={containerRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          className="relative w-full h-full cursor-ew-resize overflow-hidden"
        >
          {/* AFTER: Photorealistic Architectural Render (Full Background) */}
          <img
            src={currentStyle.renderImage}
            alt="Photorealistic Architectural Render"
            className="absolute inset-0 w-full h-full object-cover"
          />

          {/* Label Badge Right (After) */}
          <div className="absolute top-4 right-4 z-20 px-3 py-1 rounded bg-black/75 text-white backdrop-blur-md border border-white/20 font-mono text-xs uppercase tracking-wider flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>AI Architectural Render ({currentStyle.name})</span>
          </div>

          {/* BEFORE: Wireframe BIM CAD Geometry (Clipped by slider position) */}
          <div
            className="absolute inset-y-0 left-0 overflow-hidden"
            style={{ width: `${sliderPosition}%` }}
          >
            <div className="relative w-full h-full bg-slate-900">
              <img
                src={currentStyle.wireframeImage}
                alt="Wireframe BIM CAD"
                className="absolute inset-0 w-full h-full object-cover filter grayscale contrast-125"
                style={{ width: `${containerRef.current ? containerRef.current.clientWidth : 1000}px`, maxWidth: 'none' }}
              />
              {/* CAD blueprint grid overlay */}
              <div 
                className="absolute inset-0 bg-blue-950/40 mix-blend-color-dodge pointer-events-none"
                style={{
                  backgroundImage: 'radial-gradient(circle, rgba(56, 189, 248, 0.25) 1px, transparent 1px)',
                  backgroundSize: '24px 24px'
                }}
              />
            </div>

            {/* Label Badge Left (Before) */}
            <div className="absolute top-4 left-4 z-20 px-3 py-1 rounded bg-black/75 text-white backdrop-blur-md border border-white/20 font-mono text-xs uppercase tracking-wider flex items-center gap-2">
              <Layers className="w-3.5 h-3.5 text-sky-400" />
              <span>BIM CAD Wireframe</span>
            </div>
          </div>

          {/* Draggable Divider Line & Handle */}
          <div
            className="absolute inset-y-0 z-30 w-0.5 bg-white shadow-[0_0_12px_rgba(255,255,255,0.8)]"
            style={{ left: `${sliderPosition}%` }}
          >
            <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-white text-slate-900 shadow-xl border-2 border-slate-900 flex items-center justify-center cursor-ew-resize">
              <SplitSquareVertical className="w-4 h-4 rotate-90" />
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Material Specification Board */}
      <div className="p-4 bg-[var(--color-paper-2)] border-t border-[var(--color-rule-2)] grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
        <div className="p-2.5 rounded bg-[var(--color-paper)] border border-[var(--color-rule-2)]">
          <span className="text-[10px] text-[var(--color-muted)] uppercase block">Flooring Specification</span>
          <span className="font-semibold text-[var(--color-ink)] mt-0.5 block truncate">{currentStyle.floorMaterial}</span>
        </div>
        <div className="p-2.5 rounded bg-[var(--color-paper)] border border-[var(--color-rule-2)]">
          <span className="text-[10px] text-[var(--color-muted)] uppercase block">Wall &amp; Cladding</span>
          <span className="font-semibold text-[var(--color-ink)] mt-0.5 block truncate">{currentStyle.wallMaterial}</span>
        </div>
        <div className="p-2.5 rounded bg-[var(--color-paper)] border border-[var(--color-rule-2)]">
          <span className="text-[10px] text-[var(--color-muted)] uppercase block">Joinery &amp; Millwork</span>
          <span className="font-semibold text-[var(--color-ink)] mt-0.5 block truncate">{currentStyle.woodwork}</span>
        </div>
        <div className="p-2.5 rounded bg-[var(--color-paper)] border border-[var(--color-rule-2)]">
          <span className="text-[10px] text-[var(--color-muted)] uppercase block">Ambient Lighting</span>
          <span className="font-semibold text-[var(--color-ink)] mt-0.5 block truncate">{currentStyle.lighting}</span>
        </div>
      </div>
    </div>
  );
};
