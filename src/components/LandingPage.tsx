/* Hallmark · macrostructure: Split-Studio / Workbench · theme: Ivory-Emerald · tone: architectural-stationery */
import React, { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';
import { 
  Compass, ArrowRight, Layers, MessageSquare, 
  CheckCircle2, Ruler, Box, Grid, Shield, 
  Sparkles, FileText, Cpu, Download, ArrowUpRight,
  Maximize2, Eye, Building2, HardHat
} from 'lucide-react';

interface LandingPageProps {
  onGetStarted: () => void;
  onExploreDemo: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted, onExploreDemo }) => {
  const [heroPrompt, setHeroPrompt] = useState('3 bedrooms, 2 bathrooms, 2,400 sq ft, 2 floors, open-concept living with central courtyard');
  const [previewFloor, setPreviewFloor] = useState<0 | 1>(0);

  const containerRef = useRef<HTMLDivElement>(null);
  const blueprintRoomsRef = useRef<HTMLDivElement>(null);

  const presets = [
    { label: '2,400 sq ft Duplex · G+1', prompt: '3-bed, 2,400 sq ft, 2 floors, open kitchen, master balcony, CMDA setback compliant' },
    { label: 'Vastu Courtyard Home', prompt: 'Traditional Thinnai & central Muttram courtyard, 4 bedrooms, puja room in North-East, 2 floors' },
    { label: '1,500 sq ft Modern Villa', prompt: '3-bed, 2-bath, contemporary facade, upper terrace garden, open living dining' }
  ];

  // GSAP Entrance Timeline & Performance Safety
  useEffect(() => {
    const prefersReducedMotion = typeof window !== 'undefined' && 
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'power2.out', force3D: true } });

      // 1. Hero entrance
      tl.from('.gsap-hero-badge', { y: -12, opacity: 0, duration: 0.45 })
        .from('.gsap-hero-title', { y: 22, opacity: 0, duration: 0.65, ease: 'power3.out' }, '-=0.25')
        .from('.gsap-hero-desc', { y: 14, opacity: 0, duration: 0.5 }, '-=0.35')
        .from('.gsap-hero-console', { y: 18, opacity: 0, scale: 0.98, duration: 0.55 }, '-=0.25')
        .from('.gsap-preset-pill', { scale: 0.9, opacity: 0, stagger: 0.04, duration: 0.35 }, '-=0.2')
        .from('.gsap-hero-actions', { y: 10, opacity: 0, duration: 0.4 }, '-=0.15')
        .from('.gsap-verify-chip', { y: 8, opacity: 0, stagger: 0.05, duration: 0.35 }, '-=0.2')
        .from('.gsap-blueprint-card', { x: 25, opacity: 0, duration: 0.65, ease: 'power3.out' }, '-=0.6')
        .from('.blueprint-column', { scale: 0, opacity: 0, stagger: 0.035, duration: 0.4, ease: 'back.out(2)' }, '-=0.3')
        .from('.blueprint-room', { opacity: 0, scale: 0.96, stagger: 0.04, duration: 0.4 }, '-=0.25');

      // 2. Feature matrix stagger
      gsap.from('.gsap-capability-card', {
        y: 22,
        opacity: 0,
        stagger: 0.08,
        duration: 0.5,
        ease: 'power2.out',
        delay: 0.5,
        force3D: true
      });

      // 3. Materials stagger
      gsap.from('.gsap-material-card', {
        y: 18,
        opacity: 0,
        stagger: 0.06,
        duration: 0.45,
        ease: 'power2.out',
        delay: 0.7,
        force3D: true
      });

      // 4. Pricing tiers stagger
      gsap.from('.gsap-tier-card', {
        y: 22,
        opacity: 0,
        stagger: 0.08,
        duration: 0.5,
        ease: 'power2.out',
        delay: 0.85,
        force3D: true
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  // Animate floor transition when switching Ground <-> 1F
  useEffect(() => {
    if (!blueprintRoomsRef.current) return;
    const prefersReducedMotion = typeof window !== 'undefined' && 
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    gsap.fromTo(
      blueprintRoomsRef.current.querySelectorAll('.blueprint-room'),
      { opacity: 0, y: 6 },
      { opacity: 1, y: 0, stagger: 0.04, duration: 0.35, ease: 'power2.out', force3D: true }
    );
  }, [previewFloor]);

  return (
    <div ref={containerRef} className="w-full h-full overflow-y-auto overflow-x-hidden bg-[var(--color-paper)] text-[var(--color-ink)] select-none font-sans">
      {/* ──────────────────────────────────────────────────────────────
          HERO SECTION — Haute Editorial Studio Style (Creative Momentum)
          High-Fashion Serif Typography + Sculptural Electric Vermilion
          ────────────────────────────────────────────────────────────── */}
      <section className="relative pt-10 sm:pt-16 pb-14 sm:pb-20 px-3.5 sm:px-6 md:px-8 border-b border-[var(--color-rule)] bg-[var(--color-paper)]">
        {/* Subtle Ambient Editorial Aura */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#c4b5fd]/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-10 left-10 w-80 h-80 bg-[#ff3823]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto space-y-8 relative z-10">
          
          {/* Top Micro Marginalia Strip */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[var(--color-rule)] pb-4 text-[11px] font-mono tracking-wider text-[var(--color-muted)]">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[var(--color-accent)] animate-pulse" />
              <span className="text-[var(--color-ink)] font-bold">IDEAS THAT MOVE —</span>
              <span>TAMIL NADU AI ARCHITECTURAL STUDIO</span>
            </div>

            <div className="hidden md:flex items-center gap-6">
              <span>PEOPLE · SPACES · CODE — A HIGHER STANDARD.</span>
              <span className="text-[var(--color-ink)] font-semibold">13.0827° N, 80.2707° E · CHENNAI</span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            
            {/* Left Column (Lg: cols 1-7): Big Editorial Headline & Capsule CTAs */}
            <div className="lg:col-span-7 space-y-6 sm:space-y-8">
              
              <div className="space-y-4">
                <h1 className="gsap-hero-title text-5xl sm:text-7xl md:text-8xl lg:text-[92px] font-serif text-[var(--color-ink)] tracking-tight leading-[0.98]">
                  Architectural<br />
                  <span className="italic font-normal text-[var(--color-ink)]">Momentum</span>
                </h1>
                
                <p className="gsap-hero-desc text-sm sm:text-base md:text-lg text-[var(--color-muted)] leading-relaxed max-w-xl font-sans pt-2">
                  A space for bold residential ideas, structural clarity, and AI-powered spatial collaboration. Turn requirements into verified 2D CAD vector blueprints and immersive 3D WebGL architecture.
                </p>
              </div>

              {/* Capsule Action Buttons (Sample Inspired) */}
              <div className="gsap-hero-actions flex flex-wrap items-center gap-3.5 pt-1">
                <button
                  onClick={onGetStarted}
                  className="px-7 py-3.5 rounded-full border-2 border-[var(--color-ink)] hover:bg-[var(--color-ink)] hover:text-white text-[var(--color-ink)] font-mono text-xs uppercase tracking-widest font-bold transition flex items-center gap-3 group cursor-pointer shadow-sm bg-transparent"
                >
                  <span>EXPLORE CAD STUDIO</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
                </button>

                <button
                  onClick={onExploreDemo}
                  className="px-6 py-3.5 rounded-full bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-white font-mono text-xs uppercase tracking-widest font-bold transition flex items-center gap-2 shadow-md hover:shadow-lg cursor-pointer"
                >
                  <Eye className="w-4 h-4" />
                  <span>3D SPATIAL TOUR</span>
                </button>
              </div>

              {/* Architectural Prompt Console */}
              <div className="gsap-hero-console bg-[var(--color-paper-2)] border border-[var(--color-rule)] rounded-2xl p-4 sm:p-5 space-y-3.5 shadow-sm">
                <div className="flex items-center justify-between text-[11px] font-mono text-[var(--color-muted)] border-b border-[var(--color-rule)] pb-2.5">
                  <span className="flex items-center gap-1.5 text-[var(--color-ink)] font-bold">
                    <Cpu className="w-3.5 h-3.5 text-[var(--color-accent)]" />
                    NEURAL PLAN SYNTHESIZER
                  </span>
                  <span className="text-[var(--color-accent)] font-semibold">NVIDIA NIM // Nemotron 3.5</span>
                </div>

                <div className="relative">
                  <textarea
                    rows={2}
                    value={heroPrompt}
                    onChange={(e) => setHeroPrompt(e.target.value)}
                    placeholder="Describe room program, dimensions, and floor distribution..."
                    className="w-full bg-[var(--color-paper)] border border-[var(--color-rule)] rounded-xl p-3 text-xs text-[var(--color-ink)] font-mono placeholder-[var(--color-muted)] focus:outline-none focus:border-[var(--color-accent)] transition resize-none"
                  />
                </div>

                {/* Architectural Presets */}
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <span className="text-[10px] text-[var(--color-muted)] font-mono font-bold">PRESETS:</span>
                  {presets.map((item, idx) => (
                    <button
                      key={idx}
                      onClick={() => setHeroPrompt(item.prompt)}
                      className="gsap-preset-pill text-[10px] text-[var(--color-ink-2)] hover:text-[var(--color-accent)] bg-[var(--color-paper-3)] hover:bg-[var(--color-paper)] px-3 py-1 rounded-full border border-[var(--color-rule)] font-mono transition cursor-pointer"
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Technical Verification Strip */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-[11px] font-mono text-[var(--color-muted)] border-t border-[var(--color-rule)]">
                <div className="gsap-verify-chip flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[var(--color-accent)] shrink-0" />
                  <span>0.01m Vector Snap</span>
                </div>
                <div className="gsap-verify-chip flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[var(--color-accent)] shrink-0" />
                  <span>IS 456 RCC Columns</span>
                </div>
                <div className="gsap-verify-chip flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[var(--color-accent)] shrink-0" />
                  <span>TNCDBR-2019 Pass</span>
                </div>
              </div>
            </div>

            {/* Right Column (Lg: cols 8-12): The Live Workbench Blueprint Showcase */}
            <div className="lg:col-span-5 w-full">
              <div className="gsap-blueprint-card bg-[var(--color-paper-2)] border border-[var(--color-rule)] rounded-3xl overflow-hidden shadow-xl max-w-full sm:max-w-md mx-auto relative group">
                {/* Workbench Header Bar */}
                <div className="h-12 bg-[var(--color-paper-3)] border-b border-[var(--color-rule)] px-4 flex items-center justify-between text-xs font-mono">
                  <div className="flex items-center space-x-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[var(--color-accent)]" />
                    <span className="text-[var(--color-ink)] font-bold text-[11px] sm:text-xs">VIEWPORT // BLUEPRINT</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => setPreviewFloor(0)}
                      className={`px-3 py-1 text-[11px] font-mono rounded-full transition cursor-pointer ${
                        previewFloor === 0 
                          ? 'bg-[var(--color-ink)] text-white font-bold' 
                          : 'text-[var(--color-muted)] hover:text-[var(--color-ink)] bg-[var(--color-paper)]'
                      }`}
                    >
                      G: GROUND
                    </button>
                    <button
                      onClick={() => setPreviewFloor(1)}
                      className={`px-3 py-1 text-[11px] font-mono rounded-full transition cursor-pointer ${
                        previewFloor === 1 
                          ? 'bg-[var(--color-ink)] text-white font-bold' 
                          : 'text-[var(--color-muted)] hover:text-[var(--color-ink)] bg-[var(--color-paper)]'
                      }`}
                    >
                      1F: UPPER
                    </button>
                  </div>
                </div>

                {/* Vector Blueprint Drawing Frame */}
                <div className="h-80 sm:h-96 bg-[var(--color-paper)] relative p-4 cad-grid overflow-hidden flex items-center justify-center">
                  {/* Top metadata tags */}
                  <div className="absolute top-3 left-3 text-[10px] font-mono text-[var(--color-muted)] flex items-center gap-2">
                    <span>SCALE 1:50</span>
                    <span>•</span>
                    <span>30' × 50' PLOT</span>
                  </div>

                  <div className="absolute top-3 right-3 text-[10px] font-mono text-[var(--color-accent)] bg-[var(--color-accent-subtle)] border border-[var(--color-accent)]/30 px-2 py-0.5 rounded-full font-bold">
                    ✓ TNCDBR PASS
                  </div>

                  {/* Simulated 2D Architectural Drawing Canvas */}
                  <div className="relative w-full max-w-[300px] h-64 sm:h-72 border-2 border-[var(--color-ink)] bg-[var(--color-paper-2)] rounded-xl p-2 shadow-inner">
                    {/* Structural Columns in Sculptural Vermilion */}
                    <div className="blueprint-column absolute -top-1.5 -left-1.5 w-3 h-3 bg-[var(--color-accent)] border border-black shadow-sm" title="Column C1" />
                    <div className="blueprint-column absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-[var(--color-accent)] border border-black shadow-sm" title="Column C2" />
                    <div className="blueprint-column absolute -top-1.5 -right-1.5 w-3 h-3 bg-[var(--color-accent)] border border-black shadow-sm" title="Column C3" />
                    <div className="blueprint-column absolute bottom-1/2 -left-1.5 -translate-y-1/2 w-3 h-3 bg-[var(--color-accent)] border border-black shadow-sm" title="Column C4" />
                    <div className="blueprint-column absolute bottom-1/2 -right-1.5 -translate-y-1/2 w-3 h-3 bg-[var(--color-accent)] border border-black shadow-sm" title="Column C5" />
                    <div className="blueprint-column absolute -bottom-1.5 -left-1.5 w-3 h-3 bg-[var(--color-accent)] border border-black shadow-sm" title="Column C6" />
                    <div className="blueprint-column absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-[var(--color-accent)] border border-black shadow-sm" title="Column C7" />
                    <div className="blueprint-column absolute -bottom-1.5 -right-1.5 w-3 h-3 bg-[var(--color-accent)] border border-black shadow-sm" title="Column C8" />

                    {previewFloor === 0 ? (
                      /* Ground Floor Layout */
                      <div ref={blueprintRoomsRef} className="w-full h-full grid grid-cols-2 grid-rows-2 gap-2 p-1 text-[10px] font-mono">
                        {/* Living & Dining */}
                        <div className="blueprint-room border border-[var(--color-rule)] bg-[var(--color-paper)] rounded-lg p-2 flex flex-col justify-between">
                          <div className="flex justify-between items-start text-[var(--color-ink)]">
                            <span className="font-bold">LIVING ROOM</span>
                            <span className="text-[9px] text-[var(--color-muted)]">18' × 14'</span>
                          </div>
                          <div className="text-[8px] text-[var(--color-muted)]">WARM OAK // 42" CLEAR</div>
                        </div>

                        {/* Kitchen & Pantry */}
                        <div className="blueprint-room border border-[var(--color-accent)]/40 bg-[var(--color-accent-subtle)] rounded-lg p-2 flex flex-col justify-between">
                          <div className="flex justify-between items-start text-[var(--color-accent)]">
                            <span className="font-bold">KITCHEN</span>
                            <span className="text-[9px] text-[var(--color-muted)]">12' × 10'</span>
                          </div>
                          <div className="text-[8px] text-[var(--color-accent)] font-bold">SE CORNER (AGNI)</div>
                        </div>

                        {/* Guest Bedroom */}
                        <div className="blueprint-room border border-[var(--color-rule)] bg-[var(--color-paper)] rounded-lg p-2 flex flex-col justify-between">
                          <div className="flex justify-between items-start text-[var(--color-ink)]">
                            <span className="font-bold">BEDROOM 1</span>
                            <span className="text-[9px] text-[var(--color-muted)]">14' × 12'</span>
                          </div>
                          <div className="text-[8px] text-[var(--color-muted)]">ATTACHED BATH</div>
                        </div>

                        {/* Central Muttram / Courtyard */}
                        <div className="blueprint-room border border-[#c3b5f7] bg-[#ede7fb] rounded-lg p-2 flex flex-col justify-between">
                          <div className="flex justify-between items-start text-[var(--color-ink)]">
                            <span className="font-bold">MUTTRAM COURT</span>
                            <span className="text-[9px] text-[var(--color-muted)]">10' × 10'</span>
                          </div>
                          <div className="text-[8px] text-[var(--color-accent)] font-bold">OPEN SKYLIGHT</div>
                        </div>
                      </div>
                    ) : (
                      /* First Floor Layout */
                      <div ref={blueprintRoomsRef} className="w-full h-full grid grid-cols-2 grid-rows-2 gap-2 p-1 text-[10px] font-mono">
                        {/* Master Suite */}
                        <div className="blueprint-room border border-[var(--color-rule)] bg-[var(--color-paper)] rounded-lg p-2 flex flex-col justify-between">
                          <div className="flex justify-between items-start text-[var(--color-ink)]">
                            <span className="font-bold">MASTER SUITE</span>
                            <span className="text-[9px] text-[var(--color-muted)]">16' × 14'</span>
                          </div>
                          <div className="text-[8px] text-[var(--color-muted)]">WALK-IN CLOSET</div>
                        </div>

                        {/* Bedroom 2 */}
                        <div className="blueprint-room border border-[var(--color-rule)] bg-[var(--color-paper)] rounded-lg p-2 flex flex-col justify-between">
                          <div className="flex justify-between items-start text-[var(--color-ink)]">
                            <span className="font-bold">BEDROOM 2</span>
                            <span className="text-[9px] text-[var(--color-muted)]">14' × 12'</span>
                          </div>
                          <div className="text-[8px] text-[var(--color-muted)]">STUDY ALCOVE</div>
                        </div>

                        {/* Family Lounge */}
                        <div className="blueprint-room border border-[var(--color-rule)] bg-[var(--color-paper)] rounded-lg p-2 flex flex-col justify-between">
                          <div className="flex justify-between items-start text-[var(--color-ink)]">
                            <span className="font-bold">FAMILY LOUNGE</span>
                            <span className="text-[9px] text-[var(--color-muted)]">14' × 10'</span>
                          </div>
                          <div className="text-[8px] text-[var(--color-muted)]">MEZZANINE VOID</div>
                        </div>

                        {/* Open Balcony */}
                        <div className="blueprint-room border border-[var(--color-accent)]/40 bg-[var(--color-accent-subtle)] rounded-lg p-2 flex flex-col justify-between">
                          <div className="flex justify-between items-start text-[var(--color-accent)]">
                            <span className="font-bold">BALCONY TERRACE</span>
                            <span className="text-[9px] text-[var(--color-muted)]">12' × 8'</span>
                          </div>
                          <div className="text-[8px] text-[var(--color-accent)] font-bold">CANTILEVER SLAB</div>
                        </div>
                      </div>
                    )}

                    {/* Dimension Line Callout */}
                    <div className="absolute -bottom-5 left-0 right-0 flex items-center justify-between text-[8px] sm:text-[9px] font-mono text-[var(--color-accent)] font-bold">
                      <span className="border-l border-[var(--color-accent)] h-2" />
                      <span className="bg-[var(--color-paper)] px-1">← WIDTH: 30' - 0" →</span>
                      <span className="border-r border-[var(--color-accent)] h-2" />
                    </div>
                  </div>

                  {/* Vastu Compass Widget */}
                  <div className="absolute bottom-3 right-3 bg-[var(--color-paper)] border border-[var(--color-rule)] px-2.5 py-1.5 rounded-full text-[9px] font-mono flex items-center gap-1.5 shadow-sm">
                    <Compass className="w-3.5 h-3.5 text-[var(--color-accent)]" />
                    <span className="text-[var(--color-ink)] font-bold">VASTU: 100% PASS</span>
                  </div>
                </div>

                {/* Workbench Telemetry Footer */}
                <div className="bg-[var(--color-paper-3)] border-t border-[var(--color-rule)] px-4 py-3 flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono text-[var(--color-muted)]">
                  <div className="flex flex-wrap items-center gap-3 sm:gap-4">
                    <span>AREA: <span className="text-[var(--color-ink)] font-bold">2,400 SQ FT</span></span>
                    <span>FSI: <span className="text-[var(--color-ink)] font-bold">1.65</span></span>
                    <span>VENT: <span className="text-[var(--color-accent)] font-bold">18.4%</span></span>
                  </div>
                  <div className="text-[var(--color-accent)] hover:text-[var(--color-accent-hover)] font-bold cursor-pointer flex items-center gap-1" onClick={onExploreDemo}>
                    <span>LAUNCH CAD</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>
      {/* ──────────────────────────────────────────────────────────────
          ARCHITECTURAL WORKFLOW MATRIX (Swiss 12-Column Hairline Grid)
          Zero cards, zero drop-shadow blur — hairlines do the work
          ────────────────────────────────────────────────────────────── */}
      <section className="py-12 sm:py-16 px-3.5 sm:px-6 md:px-8 border-b border-[var(--color-rule)]">
        <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8">
          <div>
            <div className="text-[11px] font-mono uppercase tracking-wider text-[#dc2626] font-bold">SYSTEM CAPABILITIES</div>
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-[var(--color-ink)] tracking-tight mt-1 font-display">
              End-to-end architectural engineering in one workspace.
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 border-t border-l border-[var(--color-rule)]">
            {/* Feature 1 */}
            <div className="gsap-capability-card p-5 sm:p-6 border-r border-b border-[var(--color-rule)] space-y-3 bg-[var(--color-paper-2)]/40">
              <div className="w-7 h-7 rounded bg-red-50 text-[#dc2626] border border-red-200 flex items-center justify-center font-mono text-xs font-bold">
                01
              </div>
              <h3 className="text-base font-bold text-[var(--color-ink)] font-display">Neural CAD Synthesis</h3>
              <p className="text-xs text-[var(--color-ink-2)] leading-relaxed font-sans">
                Recalculate wall coordinates, doorway swings, and room adjacencies instantaneously with Nemotron 3.5 architectural reasoning.
              </p>
              <div className="pt-2 text-[10px] font-mono text-[var(--color-muted)]">
                TAG: AI_WALL_ENGINE // SNAP_0.01M
              </div>
            </div>

            {/* Feature 2 */}
            <div className="gsap-capability-card p-5 sm:p-6 border-r border-b border-[var(--color-rule)] space-y-3 bg-[var(--color-paper-2)]/40">
              <div className="w-7 h-7 rounded bg-red-50 text-[#dc2626] border border-red-200 flex items-center justify-center font-mono text-xs font-bold">
                02
              </div>
              <h3 className="text-base font-bold text-[var(--color-ink)] font-display">TNCDBR-2019 Validation</h3>
              <p className="text-xs text-[var(--color-ink-2)] leading-relaxed font-sans">
                Automated statutory setback checks under Rule 35, FSI ratios, rainwater harvesting cistern sizing, and NBC 2016 ventilation guidelines.
              </p>
              <div className="pt-2 text-[10px] font-mono text-[var(--color-muted)]">
                TAG: STATUTORY_CHECK // CMDA_DTCP
              </div>
            </div>

            {/* Feature 3 */}
            <div className="gsap-capability-card p-5 sm:p-6 border-r border-b border-[var(--color-rule)] space-y-3 bg-[var(--color-paper-2)]/40">
              <div className="w-7 h-7 rounded bg-red-50 text-[#dc2626] border border-red-200 flex items-center justify-center font-mono text-xs font-bold">
                03
              </div>
              <h3 className="text-base font-bold text-[var(--color-ink)] font-display">IS 456 Structural Grid</h3>
              <p className="text-xs text-[var(--color-ink-2)] leading-relaxed font-sans">
                Automated reinforced concrete column layout (M25 grade), maximum span verification (≤ 4.5m), and geotechnical foundation rankings.
              </p>
              <div className="pt-2 text-[10px] font-mono text-[var(--color-muted)]">
                TAG: IS_456:2000 // RCC_COLUMN_GRID
              </div>
            </div>

            {/* Feature 4 */}
            <div className="gsap-capability-card p-5 sm:p-6 border-r border-b border-[var(--color-rule)] space-y-3 bg-[var(--color-paper-2)]/40">
              <div className="w-7 h-7 rounded bg-red-50 text-[#dc2626] border border-red-200 flex items-center justify-center font-mono text-xs font-bold">
                04
              </div>
              <h3 className="text-base font-bold text-[var(--color-ink)] font-display">DeepSeek Blueprint Digitizer</h3>
              <p className="text-xs text-[var(--color-ink-2)] leading-relaxed font-sans">
                Upload scanned hand sketches or municipal blueprint PDFs. DeepSeek V4.1 Flash vectorizes raster lines into native CAD geometry.
              </p>
              <div className="pt-2 text-[10px] font-mono text-[var(--color-muted)]">
                TAG: VISION_OCR // PDF_TO_DXF
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ──────────────────────────────────────────────────────────────
          INTERIOR MATERIALS & COHESIVE THEMES
          Authentic physical swatches on Moonlight Silver
          ────────────────────────────────────────────────────────────── */}
      <section className="py-12 sm:py-16 px-3.5 sm:px-6 md:px-8 border-b border-[var(--color-rule)] bg-[var(--color-paper-2)]/50">
        <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <div className="text-[11px] font-mono uppercase tracking-wider text-[#dc2626] font-bold">TACTILE FINISHES & FIXTURES</div>
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-[var(--color-ink)] tracking-tight mt-1 font-display">
                Curated whole-home material palettes.
              </h2>
            </div>
            <button
              onClick={onExploreDemo}
              className="text-xs font-mono text-[#dc2626] hover:text-[#b91c1c] font-semibold flex items-center gap-1.5 self-start md:self-auto cursor-pointer"
            >
              <span>INSPECT MATERIAL CATALOG</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Theme 1: Chettinad */}
            <div className="gsap-material-card bg-[var(--color-paper)] border border-[var(--color-rule)] p-4 rounded-md space-y-3 shadow-sm hover:border-[#dc2626] transition">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="font-bold text-[var(--color-ink)]">CHETTINAD HERITAGE</span>
                <span className="text-[10px] text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-300 font-bold">TRADITIONAL</span>
              </div>
              <div className="h-16 rounded overflow-hidden grid grid-cols-3 gap-0.5 border border-[var(--color-rule)]">
                <div className="bg-[#b45309]" title="Terracotta Tile" />
                <div className="bg-[#78350f]" title="Burma Teakwood" />
                <div className="bg-[#d97706]" title="Brushed Brass" />
              </div>
              <p className="text-[11px] text-[var(--color-ink-2)] font-sans">
                Athangudi handmade tiles, reclaimed teakwood door frames, and carved brass hardware.
              </p>
            </div>

            {/* Theme 2: Minimalist Scandinavian */}
            <div className="gsap-material-card bg-[var(--color-paper)] border border-[var(--color-rule)] p-4 rounded-md space-y-3 shadow-sm hover:border-[#dc2626] transition">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="font-bold text-[var(--color-ink)]">MINIMALIST SCANDI</span>
                <span className="text-[10px] text-[var(--color-ink)] bg-slate-100 px-1.5 py-0.5 rounded border border-slate-300 font-bold">CONTEMPORARY</span>
              </div>
              <div className="h-16 rounded overflow-hidden grid grid-cols-3 gap-0.5 border border-[var(--color-rule)]">
                <div className="bg-[#dcd6cd]" title="White Oak" />
                <div className="bg-[#f1f5f9]" title="Alabaster White" />
                <div className="bg-[#0f172a]" title="Matte Black Steel" />
              </div>
              <p className="text-[11px] text-[var(--color-ink-2)] font-sans">
                Natural white oak flooring, crisp alabaster walls, and architectural matte black profiles.
              </p>
            </div>

            {/* Theme 3: Contemporary Luxury */}
            <div className="gsap-material-card bg-[var(--color-paper)] border border-[var(--color-rule)] p-4 rounded-md space-y-3 shadow-sm hover:border-[#dc2626] transition">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="font-bold text-[var(--color-ink)]">ITALIAN LUXURY</span>
                <span className="text-[10px] text-purple-700 bg-purple-50 px-1.5 py-0.5 rounded border border-purple-300 font-bold">PREMIUM</span>
              </div>
              <div className="h-16 rounded overflow-hidden grid grid-cols-3 gap-0.5 border border-[var(--color-rule)]">
                <div className="bg-[#e2e8f0]" title="Carrara Marble" />
                <div className="bg-[#422006]" title="Walnut Wood" />
                <div className="bg-[#eab308]" title="Warm 2700K LED" />
              </div>
              <p className="text-[11px] text-[var(--color-ink-2)] font-sans">
                Veined Carrara marble slabs, fluted American walnut, and warm amber staircase cove lighting.
              </p>
            </div>

            {/* Theme 4: Industrial Loft */}
            <div className="gsap-material-card bg-[var(--color-paper)] border border-[var(--color-rule)] p-4 rounded-md space-y-3 shadow-sm hover:border-[#dc2626] transition">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="font-bold text-[var(--color-ink)]">URBAN INDUSTRIAL</span>
                <span className="text-[10px] text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-300 font-bold">MODERN</span>
              </div>
              <div className="h-16 rounded overflow-hidden grid grid-cols-3 gap-0.5 border border-[var(--color-rule)]">
                <div className="bg-[#64748b]" title="Polished Concrete" />
                <div className="bg-[#1e293b]" title="Exposed Steel I-Beam" />
                <div className="bg-[#991b1b]" title="Exposed Brick" />
              </div>
              <p className="text-[11px] text-[var(--color-ink-2)] font-sans">
                Polished concrete screed, exposed structural brickwork, and structural steel window mullions.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ──────────────────────────────────────────────────────────────
          HONEST TIER SPECIFICATION (Hallmark Honest Pricing Grid)
          Zero fake marketing claims
          ────────────────────────────────────────────────────────────── */}
      <section className="py-12 sm:py-16 px-3.5 sm:px-6 md:px-8 border-b border-[var(--color-rule)]">
        <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8">
          <div>
            <div className="text-[11px] font-mono uppercase tracking-wider text-[#dc2626] font-bold">STUDIO ACCESS TIERS</div>
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-[var(--color-ink)] tracking-tight mt-1 font-display">
              Transparent project licensing.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 border-t border-l border-[var(--color-rule)]">
            {/* Starter Free */}
            <div className="gsap-tier-card p-5 sm:p-6 border-r border-b border-[var(--color-rule)] space-y-4 bg-[var(--color-paper-2)]/40 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="text-xs font-mono text-[var(--color-muted)] font-bold">TIER // 01 FREE</div>
                <div className="text-2xl font-bold text-[var(--color-ink)] font-mono">$0</div>
                <p className="text-xs text-[var(--color-ink-2)] font-sans">
                  Ideal for homeowners drafting an initial floor plan concept.
                </p>
                <div className="space-y-2 pt-2 text-xs font-mono text-[var(--color-ink-2)]">
                  <div className="flex items-center gap-2">✓ 30 AI Generation Credits</div>
                  <div className="flex items-center gap-2">✓ Single-Floor 2D CAD Vector Editor</div>
                  <div className="flex items-center gap-2">✓ 3D Spatial Model Viewer</div>
                  <div className="flex items-center gap-2">✓ WebGL Orbit Camera Controls</div>
                </div>
              </div>
              <button
                onClick={onGetStarted}
                className="w-full mt-4 py-2 bg-[var(--color-paper-3)] hover:bg-[var(--color-paper)] text-[var(--color-ink)] border border-[var(--color-rule)] rounded text-xs font-mono font-semibold transition cursor-pointer"
              >
                OPEN FREE WORKSPACE
              </button>
            </div>

            {/* Pro Studio (Highlighted with Signal Red tag) */}
            <div className="gsap-tier-card p-5 sm:p-6 border-2 border-[#dc2626] space-y-4 bg-[var(--color-paper)] flex flex-col justify-between relative shadow-md">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-[#dc2626] font-bold">TIER // 02 PRO STUDIO</span>
                  <span className="text-[10px] font-mono text-white bg-[#dc2626] px-2 py-0.5 rounded font-bold">RECOMMENDED</span>
                </div>
                <div className="text-2xl font-bold text-[var(--color-ink)] font-mono">$20 <span className="text-xs text-[var(--color-muted)]">/ project</span></div>
                <p className="text-xs text-[var(--color-ink-2)] font-sans">
                  Complete architectural workflow for residential home construction.
                </p>
                <div className="space-y-2 pt-2 text-xs font-mono text-[var(--color-ink)]">
                  <div className="flex items-center gap-2 text-[#dc2626] font-semibold">✓ 300 AI Generation Credits</div>
                  <div className="flex items-center gap-2 text-[#dc2626] font-semibold">✓ Multi-Floor G+1 / G+2 CAD Canvas</div>
                  <div className="flex items-center gap-2 text-[#dc2626] font-semibold">✓ AI Conversational Chat Plan Editor</div>
                  <div className="flex items-center gap-2 text-[#dc2626] font-semibold">✓ DeepSeek Blueprint Vision Digitizer</div>
                  <div className="flex items-center gap-2 text-[#dc2626] font-semibold">✓ DXF R14 & Vector PDF Export</div>
                  <div className="flex items-center gap-2 text-[#dc2626] font-semibold">✓ TNCDBR-2019 Rule 35 Setback Audits</div>
                </div>
              </div>
              <button
                onClick={onGetStarted}
                className="w-full mt-4 py-2 bg-[#dc2626] hover:bg-[#b91c1c] text-white rounded text-xs font-mono font-semibold transition cursor-pointer shadow-xs"
              >
                START PRO WORKSPACE
              </button>
            </div>

            {/* Enterprise Builder */}
            <div className="gsap-tier-card p-5 sm:p-6 border-r border-b border-[var(--color-rule)] space-y-4 bg-[var(--color-paper-2)]/40 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="text-xs font-mono text-[var(--color-muted)] font-bold">TIER // 03 ENTERPRISE</div>
                <div className="text-2xl font-bold text-[var(--color-ink)] font-mono">$100 <span className="text-xs text-[var(--color-muted)]">/ mo</span></div>
                <p className="text-xs text-[var(--color-ink-2)] font-sans">
                  For civil engineering firms and builders managing multiple developments.
                </p>
                <div className="space-y-2 pt-2 text-xs font-mono text-[var(--color-ink-2)]">
                  <div className="flex items-center gap-2">✓ 3,000 AI Credits / month</div>
                  <div className="flex items-center gap-2">✓ Unlimited High-Res Blueprint Digitization</div>
                  <div className="flex items-center gap-2">✓ Automated Bill of Quantities (BOQ) Exports</div>
                  <div className="flex items-center gap-2">✓ Geotechnical Soil Profile Integration</div>
                  <div className="flex items-center gap-2">✓ Custom Contractor Branding & Pitch Deck</div>
                </div>
              </div>
              <button
                onClick={onGetStarted}
                className="w-full mt-4 py-2 bg-[var(--color-paper-3)] hover:bg-[var(--color-paper)] text-[var(--color-ink)] border border-[var(--color-rule)] rounded text-xs font-mono font-semibold transition cursor-pointer"
              >
                REQUEST ENTERPRISE SEATS
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ──────────────────────────────────────────────────────────────
          DENSE ARCHITECTURAL COLOPHON (Hallmark Ft4 Archetype)
          Ruler-drawn hairline colophon with technical references
          ────────────────────────────────────────────────────────────── */}
      <footer className="py-10 sm:py-12 px-3.5 sm:px-6 md:px-8 bg-[#0f172a] text-xs font-mono text-[#cbd5e1] border-t border-[#334155]">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
            <div className="space-y-2">
              <div className="flex items-center space-x-2 text-white font-bold">
                <Compass className="w-4 h-4 text-[#dc2626]" />
                <span className="font-display">MY3 DESINGS</span>
              </div>
              <p className="text-[11px] text-[#94a3b8] font-sans">
                AI Home Design Studio & Civil Engineering Platform. Engineered for precision residential planning.
              </p>
              <div className="text-[10px] text-[#64748b] pt-1">
                PALETTE: CHARCOAL GREY · MOONLIGHT SILVER · SIGNAL RED // v2.4.0
              </div>
            </div>

            <div className="space-y-2">
              <span className="text-[11px] font-bold text-white uppercase tracking-wider">ENGINEERING CODES</span>
              <ul className="space-y-1 text-[11px] text-[#94a3b8]">
                <li>• TNCDBR-2019 (Rule 35 Residential)</li>
                <li>• IS 456:2000 (Plain & Reinforced Concrete)</li>
                <li>• NBC 2016 (National Building Code of India)</li>
                <li>• IRC 2024 (Residential Code Integration)</li>
              </ul>
            </div>

            <div className="space-y-2">
              <span className="text-[11px] font-bold text-white uppercase tracking-wider">OUTPUT FORMATS</span>
              <ul className="space-y-1 text-[11px] text-[#94a3b8]">
                <li>• AutoCAD DXF (Release 14 Standard)</li>
                <li>• Scale-Calibrated Vector PDF (A3/A4)</li>
                <li>• Scalable Vector Graphics (SVG 1.1)</li>
                <li>• Bill of Quantities (BOQ Spreadsheet)</li>
              </ul>
            </div>

            <div className="space-y-2">
              <span className="text-[11px] font-bold text-white uppercase tracking-wider">STUDIO ACTIONS</span>
              <div className="space-y-1 text-[11px]">
                <div><button onClick={onGetStarted} className="text-red-400 hover:text-white hover:underline cursor-pointer">New Plan Generation →</button></div>
                <div><button onClick={onExploreDemo} className="text-red-400 hover:text-white hover:underline cursor-pointer">2D CAD Canvas Viewport →</button></div>
                <div><button onClick={onExploreDemo} className="text-red-400 hover:text-white hover:underline cursor-pointer">3D Spatial Studio →</button></div>
              </div>
            </div>
          </div>

          <div className="pt-8 border-t border-[#334155] flex flex-col md:flex-row items-center justify-between text-[11px] text-[#64748b] gap-4">
            <div>
              © 2026 MY3 Desings. All rights reserved. Architectural and structural validations require stamped verification by a registered licensed engineer.
            </div>
            <div className="flex space-x-4">
              <span>SECURITY: MULTI-TENANT ISOLATED</span>
              <span>•</span>
              <span>THEME: CHARCOAL-SILVER-SIGNAL-RED</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
