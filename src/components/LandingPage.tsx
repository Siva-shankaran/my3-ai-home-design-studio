import React, { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Flip } from 'gsap/Flip';
import { 
  ArrowRight, ArrowUpRight, Compass, Box, Eye, Check, 
  X, Layers, Sliders, Palette, Download, Maximize2 
} from 'lucide-react';
import { BeforeAfterSlider } from './editorial/BeforeAfterSlider';
import { MagneticButton } from './editorial/MagneticButton';
import { SectionRail } from './editorial/SectionRail';

gsap.registerPlugin(ScrollTrigger, Flip);

interface LandingPageProps {
  onGetStarted: () => void;
  onExploreDemo: () => void;
  onOpenConcepts?: () => void;
}

interface GalleryItem {
  id: string;
  title: string;
  category: string;
  location: string;
  sqft: number;
  year: string;
  image: string;
  palette: string[];
  description: string;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onGetStarted,
  onExploreDemo,
  onOpenConcepts
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const horizontalTrackRef = useRef<HTMLDivElement>(null);
  const horizontalSectionRef = useRef<HTMLDivElement>(null);

  // Gallery Flip Expand State
  const [selectedGalleryItem, setSelectedGalleryItem] = useState<GalleryItem | null>(null);
  const detailModalRef = useRef<HTMLDivElement>(null);

  const sectionMarkers = [
    { id: 'hero', number: '00', label: 'Overview' },
    { id: 'section-redesign', number: '01', label: 'Redesign' },
    { id: 'section-staging', number: '02', label: 'Staging' },
    { id: 'section-styles', number: '03', label: 'Styles' },
    { id: 'section-furniture', number: '04', label: 'Furniture' },
    { id: 'section-palette', number: '05', label: 'Materials' },
    { id: 'section-export', number: '06', label: 'Export' },
    { id: 'gallery', number: '07', label: 'Archive' }
  ];

  const styleCards = [
    {
      id: 'nordic',
      number: '01',
      title: 'Nordic Minimalist',
      materials: 'Smoked Birch · Honed Calacatta · Linen',
      image: 'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=900&q=80',
      description: 'Airy spatial volume, muted neutrals, warm pale wood and clean light ingress.'
    },
    {
      id: 'tamilnadu',
      number: '02',
      title: 'Tamil Nadu Contemporary',
      materials: 'Athangudi Tile · Teak Wood · Red Brick',
      image: 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=900&q=80',
      description: 'Courtyard lightwells, shaded thinnai verandahs and passive monsoon ventilation.'
    },
    {
      id: 'midcentury',
      number: '03',
      title: 'Mid-Century Modern',
      materials: 'American Walnut · Brass · Bouclé',
      image: 'https://images.unsplash.com/photo-1556912172-45b7abe8b7e1?auto=format&fit=crop&w=900&q=80',
      description: 'Organic architectural geometry, gentle curves and expressive conversational layout.'
    },
    {
      id: 'wabisabi',
      number: '04',
      title: 'Japanese Wabi-Sabi',
      materials: 'Lime Wash · Charred Cedar · Tatami',
      image: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=900&q=80',
      description: 'Imperfect natural finishes, silent contemplation and sculptural simplicity.'
    },
    {
      id: 'industrial',
      number: '05',
      title: 'Industrial Loft',
      materials: 'Blackened Steel · Exposed Masonry · Concrete',
      image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=900&q=80',
      description: 'Double-height ceilings, structural honest expression and tailored lighting.'
    },
    {
      id: 'parisian',
      number: '06',
      title: 'Parisian Haussmann',
      materials: 'Herringbone Oak · Wall Mouldings · Marble',
      image: 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=900&q=80',
      description: 'Classical proportions, sculptural fireplace focal point and lofty floor-to-ceiling French windows.'
    }
  ];

  const galleryItems: GalleryItem[] = [
    {
      id: 'gal-1',
      title: 'The Stone Pavilion',
      category: 'Residential Redesign',
      location: 'Chennai, TN',
      sqft: 2850,
      year: '2026',
      image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
      palette: ['#F4F1EA', '#8A857B', '#C4552D', '#161513'],
      description: 'A monolithic open-concept residence balancing floor-to-ceiling architectural glazing with deep sheltered eaves.'
    },
    {
      id: 'gal-2',
      title: 'Muttram Sanctuary',
      category: 'Courtyard Architecture',
      location: 'Thanjavur, TN',
      sqft: 2400,
      year: '2026',
      image: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80',
      palette: ['#EAE5DB', '#C4552D', '#5E5950', '#1B1A18'],
      description: 'Reimagining the classic Tamil courtyard home with thermal mass walls, central rain atrium, and polished lime plaster.'
    },
    {
      id: 'gal-3',
      title: 'Minimalist Hill Villa',
      category: 'Virtual Staging',
      location: 'Kodaikanal, TN',
      sqft: 1800,
      year: '2025',
      image: 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1200&q=80',
      palette: ['#FAF8F5', '#8A857B', '#2C2A26', '#E0DBD1'],
      description: 'Tiered hillside structure oriented toward valley daylight with smoked oak timber flooring and bespoke cantilevered hearth.'
    },
    {
      id: 'gal-4',
      title: 'The Glass House Study',
      category: 'Interior Transformation',
      location: 'Bengaluru, KA',
      sqft: 2200,
      year: '2026',
      image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80',
      palette: ['#F4F1EA', '#C4552D', '#161513', '#CBC4B6'],
      description: 'Adaptive reuse of an empty urban shell into a gallery-grade home office and reading sanctuary.'
    },
    {
      id: 'gal-5',
      title: 'Haute Coastal Bungalow',
      category: 'Full Home Synthesis',
      location: 'ECR, Chennai',
      sqft: 3400,
      year: '2026',
      image: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1200&q=80',
      palette: ['#F4F1EA', '#8A857B', '#A94420', '#1B1A18'],
      description: 'Louvered cross-breeze corridors, honed travertine kitchen counter, and shaded outdoor timber deck.'
    },
    {
      id: 'gal-6',
      title: 'Monochrome Penthouse',
      category: 'Urban Living',
      location: 'Coimbatore, TN',
      sqft: 1950,
      year: '2025',
      image: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=1200&q=80',
      palette: ['#EAE5DB', '#5E5950', '#161513', '#E0DBD1'],
      description: 'Restrained architectural palette designed for evening entertaining and quiet acoustic privacy.'
    }
  ];

  // GSAP MatchMedia Animations & ScrollTriggers
  useEffect(() => {
    if (typeof window === 'undefined' || !containerRef.current) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const mm = gsap.matchMedia();

    // Desktop Animation Context (>= 1024px)
    mm.add('(min-width: 1024px)', () => {
      // 1. Hero Entrance: line split, clip-path image reveal, power4.out ease
      const heroTl = gsap.timeline({ defaults: { ease: 'power4.out' } });

      heroTl
        .from('.hero-headline-line', {
          y: '100%',
          opacity: 0,
          duration: 1.1,
          stagger: 0.15
        })
        .from(
          '.hero-subtitle',
          { y: 20, opacity: 0, duration: 0.8 },
          '-=0.7'
        )
        .from(
          '.hero-cta',
          { scale: 0.95, opacity: 0, duration: 0.6 },
          '-=0.5'
        )
        .fromTo(
          '.hero-slider-mask',
          { clipPath: 'polygon(0% 100%, 100% 100%, 100% 100%, 0% 100%)' },
          { clipPath: 'polygon(0% 0%, 100% 0%, 100% 0%, 0% 100%)', duration: 1.3, ease: 'power4.inOut' },
          '-=0.9'
        );

      // 2. Horizontal Scroll Showcase for Section 03 (Style Presets)
      const track = horizontalTrackRef.current;
      const section = horizontalSectionRef.current;

      if (track && section) {
        const totalScroll = track.scrollWidth - section.clientWidth;

        gsap.to(track, {
          x: -totalScroll,
          ease: 'none',
          scrollTrigger: {
            trigger: section,
            pin: true,
            scrub: 1,
            start: 'top top',
            end: () => `+=${totalScroll}`,
            invalidateOnRefresh: true
          }
        });
      }

      // 3. Line-draw dividers on scroll
      gsap.utils.toArray<HTMLElement>('.hairline-reveal').forEach((line) => {
        gsap.fromTo(
          line,
          { scaleX: 0, transformOrigin: 'left center' },
          {
            scaleX: 1,
            duration: 0.9,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: line,
              start: 'top 85%'
            }
          }
        );
      });

      // 4. Parallax effect on editorial image containers
      gsap.utils.toArray<HTMLElement>('.parallax-img').forEach((img) => {
        gsap.to(img, {
          yPercent: -12,
          ease: 'none',
          scrollTrigger: {
            trigger: img,
            start: 'top bottom',
            end: 'bottom top',
            scrub: true
          }
        });
      });
    });

    // Mobile / Tablet Animation Context (< 1024px): Simplified fades, zero pinning
    mm.add('(max-width: 1023px)', () => {
      gsap.from('.hero-headline-line', {
        y: 20,
        opacity: 0,
        stagger: 0.1,
        duration: 0.8,
        ease: 'power2.out'
      });
    });

    return () => mm.revert();
  }, []);

  // GSAP Flip Gallery Detail Open
  const handleOpenGalleryDetail = (item: GalleryItem, e: React.MouseEvent<HTMLElement>) => {
    setSelectedGalleryItem(item);
  };

  const handleCloseGalleryDetail = () => {
    setSelectedGalleryItem(null);
  };

  return (
    <div
      ref={containerRef}
      className="w-full min-h-screen bg-[var(--color-paper)] text-[var(--color-ink)] selection:bg-[var(--color-accent)] selection:text-white font-sans overflow-x-hidden"
    >
      {/* Desktop Section Progress Rail */}
      <SectionRail sections={sectionMarkers} />

      {/* ──────────────────────────────────────────────────────────────
          HERO SECTION — Editorial Magazine Cover Aesthetic
          Split Headline (Fraunces Display Serif) + One Terracotta CTA + Before/After Slider
          ────────────────────────────────────────────────────────────── */}
      <section
        id="hero"
        ref={heroRef}
        className="relative min-h-[90vh] lg:min-h-screen px-4 sm:px-8 lg:px-16 pt-16 sm:pt-24 pb-16 flex flex-col justify-between hairline-b"
      >
        {/* Top Editorial Marginalia */}
        <div className="flex items-center justify-between font-mono text-[11px] text-[var(--color-muted)] tracking-wider uppercase hairline-b pb-4">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-accent)]" />
            <span className="text-[var(--color-ink)] font-semibold">ISSUE 26.1</span>
            <span>// ARCHITECTURAL REDESIGN STUDIO</span>
          </div>

          <div className="hidden sm:flex items-center gap-6">
            <span>RESIDENTIAL AI ENGINE</span>
            <span>•</span>
            <span>NO TEMPLATES · PURE PROPORTION</span>
          </div>
        </div>

        {/* Center Grid: Split Editorial Headline & Before/After Hero Slider */}
        <div className="my-auto py-8 lg:py-12 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-center">
          
          {/* Left Column: Split Headline & One Clear CTA */}
          <div className="lg:col-span-6 space-y-6 sm:space-y-8">
            <div className="space-y-2">
              <span className="editorial-label block text-[var(--color-accent)] font-semibold">
                AI HOME DESIGN STUDIO
              </span>

              <h1 className="font-display text-4xl sm:text-6xl lg:text-7xl xl:text-[84px] leading-[0.94] tracking-tight text-[var(--color-ink)]">
                <div className="overflow-hidden">
                  <span className="hero-headline-line block">Architecture</span>
                </div>
                <div className="overflow-hidden">
                  <span className="hero-headline-line block italic font-normal text-[var(--color-ink)]">
                    Transformed.
                  </span>
                </div>
              </h1>
            </div>

            <p className="hero-subtitle text-sm sm:text-base lg:text-lg text-[var(--color-neutral)] leading-relaxed max-w-lg font-body">
              Upload any room photograph or blueprint. Our deterministic architectural engine synthesizes 
              bespoke spatial layouts, material palettes, and 3D models with the precision of a master architect.
            </p>

            <div className="hero-cta flex flex-wrap items-center gap-4 pt-2">
              <MagneticButton
                onClick={onGetStarted}
                className="px-7 py-3.5 rounded-[var(--radius-card)] bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-white font-mono text-xs font-medium tracking-wider uppercase shadow-sm group cursor-pointer"
              >
                <span>Start Designing</span>
                <ArrowRight className="w-4 h-4 ml-2.5 group-hover:translate-x-1 transition-transform" />
              </MagneticButton>

              <button
                onClick={onExploreDemo}
                className="px-6 py-3.5 rounded-[var(--radius-card)] border border-[var(--color-rule)] bg-[var(--color-paper-2)] hover:bg-[var(--color-paper-3)] text-[var(--color-ink)] font-mono text-xs font-medium tracking-wider uppercase transition cursor-pointer"
              >
                Inspect 3D Walkthrough
              </button>
            </div>

            {/* Architecture Metrics Strip */}
            <div className="pt-6 hairline-t grid grid-cols-3 gap-4 font-mono text-xs">
              <div>
                <span className="text-[var(--color-muted)] block text-[10px] uppercase">LATENCY</span>
                <span className="font-bold text-[var(--color-ink)]">3.2s Synthesis</span>
              </div>
              <div>
                <span className="text-[var(--color-muted)] block text-[10px] uppercase">ACCURACY</span>
                <span className="font-bold text-[var(--color-ink)]">100% Geometry</span>
              </div>
              <div>
                <span className="text-[var(--color-muted)] block text-[10px] uppercase">STANDARDS</span>
                <span className="font-bold text-[var(--color-ink)]">IRC / NBC 2024</span>
              </div>
            </div>
          </div>

          {/* Right Column: Interactive Before/After Split Slider */}
          <div className="lg:col-span-6 hero-slider-mask">
            <div className="relative">
              <BeforeAfterSlider
                beforeImage="https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1400&q=80"
                afterImage="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1400&q=80"
                beforeLabel="RAW CONCRETE SHELL"
                afterLabel="HONED OAK & LIMESTONE"
                className="h-[360px] sm:h-[460px] lg:h-[520px] w-full shadow-lg"
                enableScrollTrigger={false}
              />
              <div className="mt-3 flex items-center justify-between text-[11px] font-mono text-[var(--color-muted)]">
                <span>FIGURE 01: RAW SITE INSPECTION VS AI FINISHED LIVING CORE</span>
                <span className="hidden sm:inline">DRAG CENTER DIVIDER</span>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Section Hairline Divider with Drawing Animation */}
        <div className="hairline-reveal w-full h-[1px] bg-[var(--color-rule)]" />
      </section>

      {/* ──────────────────────────────────────────────────────────────
          FEATURE 01 — ROOM REDESIGN (Scroll-Scrubbed Before/After)
          ────────────────────────────────────────────────────────────── */}
      <section id="section-redesign" className="py-20 sm:py-32 px-4 sm:px-8 lg:px-16 hairline-b">
        <div className="max-w-7xl mx-auto space-y-12">
          
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div className="space-y-1">
              <span className="section-num">01 / CAPABILITY</span>
              <h2 className="font-display text-3xl sm:text-5xl text-[var(--color-ink)] tracking-tight">
                Architectural Room Redesign
              </h2>
            </div>
            <p className="font-mono text-xs text-[var(--color-muted)] max-w-sm uppercase tracking-wider">
              Detects structural load-bearing boundaries, preserves exterior window openings, and re-articulates interiors.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-8">
              <BeforeAfterSlider
                beforeImage="https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=1400&q=80"
                afterImage="https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1400&q=80"
                beforeLabel="ORIGINAL SPACE"
                afterLabel="ARCHITECTURAL FINISH"
                className="h-[380px] sm:h-[480px] w-full"
                enableScrollTrigger={true}
              />
            </div>

            <div className="lg:col-span-4 space-y-6 font-mono text-xs">
              <div className="p-5 rounded-[var(--radius-card)] bg-[var(--color-paper-2)] border border-[var(--color-rule)] space-y-3">
                <span className="text-[10px] text-[var(--color-accent)] font-bold uppercase tracking-wider">
                  STRUCTURAL RESPECT
                </span>
                <h3 className="font-display text-xl text-[var(--color-ink)] font-normal">
                  Zero Wall Fabrications
                </h3>
                <p className="text-[var(--color-neutral)] leading-relaxed font-body">
                  Unlike generative photo filters that hallucinate impossible windows in shared party walls, 
                  MY3 preserves real CAD vector perimeters and validates IRC egress requirements.
                </p>
              </div>

              <div className="p-5 rounded-[var(--radius-card)] bg-[var(--color-paper-2)] border border-[var(--color-rule)] space-y-2">
                <div className="flex justify-between items-center text-[var(--color-muted)]">
                  <span>WALL RETENTION</span>
                  <span className="font-bold text-[var(--color-ink)]">100%</span>
                </div>
                <div className="w-full bg-[var(--color-paper-3)] h-1 rounded-full overflow-hidden">
                  <div className="w-full h-full bg-[var(--color-accent)]" />
                </div>
                <span className="text-[10px] text-[var(--color-muted)] block pt-1">
                  Verified structural envelope adherence
                </span>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ──────────────────────────────────────────────────────────────
          FEATURE 02 — VIRTUAL STAGING
          ────────────────────────────────────────────────────────────── */}
      <section id="section-staging" className="py-20 sm:py-32 px-4 sm:px-8 lg:px-16 hairline-b bg-[var(--color-paper-2)]">
        <div className="max-w-7xl mx-auto space-y-12">
          
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div className="space-y-1">
              <span className="section-num">02 / INTERIORS</span>
              <h2 className="font-display text-3xl sm:text-5xl text-[var(--color-ink)] tracking-tight">
                Editorial Virtual Staging
              </h2>
            </div>
            <p className="font-mono text-xs text-[var(--color-muted)] max-w-sm uppercase tracking-wider">
              Curated furniture pieces adhering strictly to 36" conversational clearance corridors.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            <div className="lg:col-span-5 space-y-6">
              <p className="text-base sm:text-lg text-[var(--color-neutral)] leading-relaxed font-body">
                Empty rooms fail to convey their true potential. Our spatial placement engine populates 
                residences with dimensioned, architect-selected furnishings—sofas, dining credenzas, 
                and lighting—proportioned precisely for the square footage.
              </p>

              <div className="space-y-3 font-mono text-xs">
                <div className="flex items-center gap-3 p-3 bg-[var(--color-paper)] border border-[var(--color-rule)] rounded-[var(--radius-card)]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-accent)]" />
                  <span className="font-semibold text-[var(--color-ink)]">Human Clearance Check:</span>
                  <span className="text-[var(--color-muted)]">36" Primary Pathway Maintained</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-[var(--color-paper)] border border-[var(--color-rule)] rounded-[var(--radius-card)]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-accent)]" />
                  <span className="font-semibold text-[var(--color-ink)]">Acoustic Balance:</span>
                  <span className="text-[var(--color-muted)]">Soft Furnishings + Hard Oak Flooring</span>
                </div>
              </div>
            </div>

            <div className="lg:col-span-7 rounded-[var(--radius-card)] overflow-hidden border border-[var(--color-rule)]">
              <img
                src="https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1400&q=80"
                alt="Staged Interior"
                className="w-full h-[400px] sm:h-[480px] object-cover hover:scale-102 transition-transform duration-700"
                loading="lazy"
              />
            </div>

          </div>

        </div>
      </section>

      {/* ──────────────────────────────────────────────────────────────
          FEATURE 03 — STYLE PRESETS (Horizontal-Scroll Showcase on Desktop)
          ────────────────────────────────────────────────────────────── */}
      <section
        id="section-styles"
        ref={horizontalSectionRef}
        className="relative py-20 sm:py-24 px-4 sm:px-8 lg:px-16 hairline-b bg-[var(--color-dark)] text-[var(--color-paper)] overflow-hidden"
      >
        <div className="max-w-7xl mx-auto space-y-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[10px] font-mono tracking-widest text-[var(--color-accent)] uppercase">
                03 / ARCHITECTURAL STYLES
              </span>
              <h2 className="font-display text-3xl sm:text-5xl text-white tracking-tight mt-1">
                Curated Design Movements
              </h2>
            </div>
            <span className="hidden md:inline-block font-mono text-xs text-[var(--color-muted)]">
              SCROLL HORIZONTALLY →
            </span>
          </div>
        </div>

        {/* Horizontal Track (Scrubbed with GSAP ScrollTrigger on Desktop) */}
        <div
          ref={horizontalTrackRef}
          className="flex gap-6 pb-6 overflow-x-auto lg:overflow-visible no-scrollbar"
        >
          {styleCards.map((style) => (
            <div
              key={style.id}
              className="min-w-[280px] sm:min-w-[360px] lg:min-w-[420px] rounded-[var(--radius-card)] border border-[#2E2B27] bg-[#242220] overflow-hidden flex flex-col group shrink-0"
              data-cursor="view"
            >
              <div className="h-60 sm:h-72 overflow-hidden relative">
                <img
                  src={style.image}
                  alt={style.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
                <div className="absolute top-3 left-3 px-2 py-0.5 rounded bg-black/60 text-white font-mono text-[10px] font-bold">
                  {style.number}
                </div>
              </div>

              <div className="p-5 sm:p-6 space-y-3 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-display text-xl sm:text-2xl text-white tracking-tight">
                    {style.title}
                  </h3>
                  <p className="font-mono text-[10px] text-[var(--color-accent)] uppercase tracking-wider mt-1">
                    {style.materials}
                  </p>
                  <p className="text-xs text-[var(--color-muted)] leading-relaxed mt-2.5 font-body">
                    {style.description}
                  </p>
                </div>

                <div className="pt-4 border-t border-[#2E2B27] flex items-center justify-between text-xs font-mono">
                  <span className="text-[var(--color-muted)]">SPECIFICATION READY</span>
                  <ArrowUpRight className="w-4 h-4 text-[var(--color-accent)] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ──────────────────────────────────────────────────────────────
          FEATURE 04 — FURNITURE SWAP
          ────────────────────────────────────────────────────────────── */}
      <section id="section-furniture" className="py-20 sm:py-32 px-4 sm:px-8 lg:px-16 hairline-b">
        <div className="max-w-7xl mx-auto space-y-12">
          
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div className="space-y-1">
              <span className="section-num">04 / CATALOGUE</span>
              <h2 className="font-display text-3xl sm:text-5xl text-[var(--color-ink)] tracking-tight">
                Intelligent Furniture Swap
              </h2>
            </div>
            <p className="font-mono text-xs text-[var(--color-muted)] max-w-sm uppercase tracking-wider">
              Replace fixtures while maintaining real architectural clearance envelopes.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-[var(--radius-card)] bg-[var(--color-paper-2)] border border-[var(--color-rule)] space-y-4">
              <div className="w-10 h-10 rounded bg-[var(--color-accent-subtle)] text-[var(--color-accent)] flex items-center justify-center font-mono font-bold text-xs">
                01
              </div>
              <h3 className="font-display text-xl text-[var(--color-ink)]">
                Proportion Guardrails
              </h3>
              <p className="text-xs text-[var(--color-neutral)] leading-relaxed font-body">
                Swapping a Queen for a California King checks if 2.5 ft side walking paths remain viable. 
                If not, our validator issues an IRC clearance alert.
              </p>
            </div>

            <div className="p-6 rounded-[var(--radius-card)] bg-[var(--color-paper-2)] border border-[var(--color-rule)] space-y-4">
              <div className="w-10 h-10 rounded bg-[var(--color-accent-subtle)] text-[var(--color-accent)] flex items-center justify-center font-mono font-bold text-xs">
                02
              </div>
              <h3 className="font-display text-xl text-[var(--color-ink)]">
                Authentic CAD Line-work
              </h3>
              <p className="text-xs text-[var(--color-neutral)] leading-relaxed font-body">
                Porcelain toilets, kitchen cooktop burners, double vanities, and dining suites are rendered 
                with authentic architectural line-weights matching Maket.ai.
              </p>
            </div>

            <div className="p-6 rounded-[var(--radius-card)] bg-[var(--color-paper-2)] border border-[var(--color-rule)] space-y-4">
              <div className="w-10 h-10 rounded bg-[var(--color-accent-subtle)] text-[var(--color-accent)] flex items-center justify-center font-mono font-bold text-xs">
                03
              </div>
              <h3 className="font-display text-xl text-[var(--color-ink)]">
                Instant 2D/3D Parity
              </h3>
              <p className="text-xs text-[var(--color-neutral)] leading-relaxed font-body">
                Any fixture placed or rotated in the 2D CAD blueprint instantly manifests in the 3D WebGL 
                dollhouse with physical lighting and shadow casting.
              </p>
            </div>
          </div>

        </div>
      </section>

      {/* ──────────────────────────────────────────────────────────────
          FEATURE 05 — COLOUR & MATERIAL PALETTE
          ────────────────────────────────────────────────────────────── */}
      <section id="section-palette" className="py-20 sm:py-32 px-4 sm:px-8 lg:px-16 hairline-b bg-[var(--color-paper-2)]">
        <div className="max-w-7xl mx-auto space-y-12">
          
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div className="space-y-1">
              <span className="section-num">05 / FINISHES</span>
              <h2 className="font-display text-3xl sm:text-5xl text-[var(--color-ink)] tracking-tight">
                Architectural Material Moodboard
              </h2>
            </div>
            <p className="font-mono text-xs text-[var(--color-muted)] max-w-sm uppercase tracking-wider">
              Natural plaster, smoked oak, honed limestone, and brushed bronze.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {[
              { name: 'Warm Paper Plaster', hex: '#F4F1EA', desc: 'Matte mineral lime-wash' },
              { name: 'Smoked French Oak', hex: '#5A4632', desc: 'Brushed plank flooring' },
              { name: 'Honed Travertine', hex: '#E2DDD5', desc: 'Bathroom vanity & hearth' },
              { name: 'Sculptural Terracotta', hex: '#C4552D', desc: 'Single tactile accent tile' },
              { name: 'Charcoal Obsidian Ink', hex: '#161513', desc: 'Powder-coated steel framing' }
            ].map((swatch, idx) => (
              <div
                key={idx}
                className="p-4 rounded-[var(--radius-card)] bg-[var(--color-paper)] border border-[var(--color-rule)] space-y-3"
              >
                <div
                  className="w-full h-24 rounded border border-black/10 shadow-xs"
                  style={{ backgroundColor: swatch.hex }}
                />
                <div>
                  <div className="font-mono text-[11px] font-bold text-[var(--color-ink)]">
                    {swatch.name}
                  </div>
                  <div className="font-mono text-[10px] text-[var(--color-accent)]">
                    {swatch.hex}
                  </div>
                  <div className="font-body text-[11px] text-[var(--color-muted)] mt-1">
                    {swatch.desc}
                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ──────────────────────────────────────────────────────────────
          FEATURE 06 — EXPORT & CLIENT PRESENTATION
          ────────────────────────────────────────────────────────────── */}
      <section id="section-export" className="py-20 sm:py-32 px-4 sm:px-8 lg:px-16 hairline-b">
        <div className="max-w-7xl mx-auto space-y-12">
          
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div className="space-y-1">
              <span className="section-num">06 / DELIVERABLES</span>
              <h2 className="font-display text-3xl sm:text-5xl text-[var(--color-ink)] tracking-tight">
                CAD Vectors & Presentation Boards
              </h2>
            </div>
            <p className="font-mono text-xs text-[var(--color-muted)] max-w-sm uppercase tracking-wider">
              Export professional vector SVGs, dimensioned PDF schedules, and executive client pitches.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div className="rounded-[var(--radius-card)] overflow-hidden border border-[var(--color-rule)]">
              <img
                src="https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=1200&q=80"
                alt="Architectural Blueprint Pitch"
                className="w-full h-[360px] object-cover"
                loading="lazy"
              />
            </div>

            <div className="space-y-4 font-mono text-xs">
              <div className="p-4 rounded-[var(--radius-card)] bg-[var(--color-paper-2)] border border-[var(--color-rule)] flex items-start gap-3">
                <Download className="w-4 h-4 text-[var(--color-accent)] shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-[var(--color-ink)] block">Vector SVG & DXF Interchange</span>
                  <span className="text-[var(--color-muted)] font-body text-[11px] block mt-0.5">
                    Open directly in AutoCAD, Revit, or Rhino without loss of millimeter coordinate fidelity.
                  </span>
                </div>
              </div>

              <div className="p-4 rounded-[var(--radius-card)] bg-[var(--color-paper-2)] border border-[var(--color-rule)] flex items-start gap-3">
                <Palette className="w-4 h-4 text-[var(--color-accent)] shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-[var(--color-ink)] block">Executive Client Pitch Deck</span>
                  <span className="text-[var(--color-muted)] font-body text-[11px] block mt-0.5">
                    Generates material moodboard, bill of quantities (BOQ), and daylight schedule in 1 click.
                  </span>
                </div>
              </div>

              <div className="p-4 rounded-[var(--radius-card)] bg-[var(--color-paper-2)] border border-[var(--color-rule)] flex items-start gap-3">
                <Box className="w-4 h-4 text-[var(--color-accent)] shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-[var(--color-ink)] block">3D Isometric Teleports</span>
                  <span className="text-[var(--color-muted)] font-body text-[11px] block mt-0.5">
                    11 room cameras allow clients to inspect bedroom clearances and kitchen workflow interactively.
                  </span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ──────────────────────────────────────────────────────────────
          SECTION 07 — GALLERY (Masonry Grid with GSAP Flip Detail Expand)
          ────────────────────────────────────────────────────────────── */}
      <section id="gallery" className="py-20 sm:py-32 px-4 sm:px-8 lg:px-16 hairline-b bg-[var(--color-paper-2)]">
        <div className="max-w-7xl mx-auto space-y-12">
          
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div className="space-y-1">
              <span className="section-num">07 / ARCHIVE</span>
              <h2 className="font-display text-3xl sm:text-5xl text-[var(--color-ink)] tracking-tight">
                Project Gallery
              </h2>
            </div>
            <p className="font-mono text-xs text-[var(--color-muted)] max-w-sm uppercase tracking-wider">
              Click any architectural project to expand specifications and layout metrics.
            </p>
          </div>

          {/* Masonry Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {galleryItems.map((item) => (
              <div
                key={item.id}
                onClick={(e) => handleOpenGalleryDetail(item, e)}
                className="editorial-card group rounded-[var(--radius-card)] overflow-hidden border border-[var(--color-rule)] bg-[var(--color-paper)] cursor-pointer hover:border-[var(--color-accent)] transition-all duration-300 flex flex-col"
                data-cursor="view"
              >
                <div className="h-64 sm:h-72 overflow-hidden relative">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  <div className="absolute top-3 left-3 px-2 py-0.5 rounded bg-black/60 text-white font-mono text-[10px] font-bold">
                    {item.sqft} SQ FT
                  </div>
                </div>

                <div className="p-5 space-y-2 flex-1 flex flex-col justify-between">
                  <div>
                    <span className="font-mono text-[10px] text-[var(--color-accent)] uppercase tracking-wider">
                      {item.category} // {item.location}
                    </span>
                    <h3 className="font-display text-xl text-[var(--color-ink)] group-hover:text-[var(--color-accent)] transition-colors mt-0.5">
                      {item.title}
                    </h3>
                    <p className="text-xs text-[var(--color-muted)] font-body line-clamp-2 mt-1">
                      {item.description}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-[var(--color-rule)] flex items-center justify-between text-xs font-mono text-[var(--color-muted)]">
                    <span>{item.year}</span>
                    <span className="text-[var(--color-ink)] font-semibold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                      VIEW SPECIMEN →
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ──────────────────────────────────────────────────────────────
          GALLERY DETAIL EXPAND MODAL (GSAP FLIP / SMOOTH OVERLAY)
          ────────────────────────────────────────────────────────────── */}
      {selectedGalleryItem && (
        <div
          ref={detailModalRef}
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 sm:p-8 animate-fadeIn"
        >
          <div className="bg-[var(--color-paper)] rounded-[var(--radius-card)] border border-[var(--color-rule)] max-w-4xl w-full max-h-[90vh] overflow-y-auto flex flex-col shadow-2xl">
            
            <div className="p-4 sm:p-6 border-b border-[var(--color-rule)] flex items-center justify-between">
              <div>
                <span className="font-mono text-[10px] text-[var(--color-accent)] uppercase tracking-wider font-bold">
                  PROJECT INSPECTION // {selectedGalleryItem.category}
                </span>
                <h3 className="font-display text-2xl sm:text-3xl text-[var(--color-ink)] mt-0.5">
                  {selectedGalleryItem.title}
                </h3>
              </div>

              <button
                onClick={handleCloseGalleryDetail}
                className="w-9 h-9 rounded border border-[var(--color-rule)] flex items-center justify-center text-[var(--color-muted)] hover:text-[var(--color-ink)] hover:border-[var(--color-ink)] transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 sm:p-6 space-y-6">
              <div className="h-72 sm:h-96 rounded-[var(--radius-card)] overflow-hidden border border-[var(--color-rule)]">
                <img
                  src={selectedGalleryItem.image}
                  alt={selectedGalleryItem.title}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-mono text-xs">
                <div className="p-3 bg-[var(--color-paper-2)] border border-[var(--color-rule)] rounded">
                  <span className="text-[10px] text-[var(--color-muted)] uppercase block">TOTAL BUILT-UP</span>
                  <span className="text-sm font-bold text-[var(--color-ink)]">{selectedGalleryItem.sqft} sq ft</span>
                </div>
                <div className="p-3 bg-[var(--color-paper-2)] border border-[var(--color-rule)] rounded">
                  <span className="text-[10px] text-[var(--color-muted)] uppercase block">LOCATION</span>
                  <span className="text-sm font-bold text-[var(--color-ink)]">{selectedGalleryItem.location}</span>
                </div>
                <div className="p-3 bg-[var(--color-paper-2)] border border-[var(--color-rule)] rounded">
                  <span className="text-[10px] text-[var(--color-muted)] uppercase block">STATUS</span>
                  <span className="text-sm font-bold text-[var(--color-accent)]">Verified Architecture</span>
                </div>
              </div>

              <p className="text-sm text-[var(--color-neutral)] leading-relaxed font-body">
                {selectedGalleryItem.description}
              </p>

              <div className="pt-4 border-t border-[var(--color-rule)] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[10px] text-[var(--color-muted)] uppercase">PALETTE:</span>
                  <div className="flex gap-1.5">
                    {selectedGalleryItem.palette.map((color, idx) => (
                      <span
                        key={idx}
                        className="w-5 h-5 rounded-full border border-black/20"
                        style={{ backgroundColor: color }}
                        title={color}
                      />
                    ))}
                  </div>
                </div>

                <MagneticButton
                  onClick={() => {
                    handleCloseGalleryDetail();
                    onGetStarted();
                  }}
                  className="px-5 py-2.5 rounded-[var(--radius-card)] bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-white font-mono text-xs font-semibold tracking-wider uppercase transition cursor-pointer"
                >
                  Load in Studio
                </MagneticButton>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ──────────────────────────────────────────────────────────────
          PRICING / CTA & QUIET MINIMAL EDITORIAL FOOTER
          ────────────────────────────────────────────────────────────── */}
      <footer className="py-20 sm:py-28 px-4 sm:px-8 lg:px-16 bg-[var(--color-dark)] text-[var(--color-paper)] hairline-t">
        <div className="max-w-7xl mx-auto space-y-16">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-end justify-between">
            <div className="lg:col-span-8 space-y-4">
              <span className="font-mono text-[10px] text-[var(--color-accent)] uppercase tracking-widest block">
                BEGIN SPATIAL PLANNING
              </span>
              <h2 className="font-display text-4xl sm:text-6xl text-white tracking-tight leading-tight">
                Ready to create your home with architectural integrity?
              </h2>
            </div>

            <div className="lg:col-span-4 flex lg:justify-end">
              <MagneticButton
                onClick={onGetStarted}
                className="px-8 py-4 rounded-[var(--radius-card)] bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-white font-mono text-xs font-medium tracking-wider uppercase transition shadow-md cursor-pointer"
              >
                <span>Launch Studio</span>
                <ArrowRight className="w-4 h-4 ml-2" />
              </MagneticButton>
            </div>
          </div>

          <div className="pt-12 border-t border-[#2E2B27] grid grid-cols-1 md:grid-cols-4 gap-8 font-mono text-xs text-[var(--color-muted)]">
            <div className="space-y-2">
              <span className="text-white font-bold block">MY3 DESIGNS</span>
              <p className="text-[11px] leading-relaxed font-body">
                Deterministic residential architecture and interior transformation studio.
              </p>
            </div>

            <div className="space-y-2">
              <span className="text-white font-bold block">STANDARDS</span>
              <ul className="space-y-1 text-[11px]">
                <li>IRC 2024 Building Code</li>
                <li>NBC 2016 Spatial Rules</li>
                <li>TNCDBR-2019 Setbacks</li>
              </ul>
            </div>

            <div className="space-y-2">
              <span className="text-white font-bold block">PLATFORM</span>
              <ul className="space-y-1 text-[11px]">
                <li>2D CAD Vector Engine</li>
                <li>Three.js WebGL Spatial</li>
                <li>NVIDIA NIM Intelligence</li>
              </ul>
            </div>

            <div className="space-y-2">
              <span className="text-white font-bold block">COLOPHON</span>
              <p className="text-[11px] leading-relaxed">
                Typeset in Fraunces and Inter Tight. All rights reserved © 2026.
              </p>
            </div>
          </div>

        </div>
      </footer>
    </div>
  );
};
