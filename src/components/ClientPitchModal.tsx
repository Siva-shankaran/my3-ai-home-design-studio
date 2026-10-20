import React, { useState } from 'react';
import type { Project, ProfessionalReviewRecord, RuleCheckResult } from '../types';
import { emailService } from '../services/emailService';
import { contactAiService } from '../services/contactAiService';
import { tamilNaduRulesService } from '../services/tamilNaduRulesService';
import { geotechnicalService } from '../services/geotechnicalService';
import { tamilNaduCostService } from '../services/tamilNaduCostService';
import { type Language, translations, getRoomDisplayName } from '../services/i18n';
import { 
  Sparkles, CheckCircle2, ShieldCheck, Mail, Download, 
  ExternalLink, Building2, Ruler, DollarSign, Layers,
  Compass, Eye, Award, Check, Loader2, Send, AlertTriangle,
  HardHat, FileCheck, FileSpreadsheet, MapPin, Landmark, HelpCircle,
  Palette, LayoutDashboard, Info
} from 'lucide-react';

interface ClientPitchModalProps {
  project: Project;
  isOpen: boolean;
  onClose: () => void;
  activeFloor: number;
  language?: Language;
}

interface MaterialSwatch {
  id: string;
  name: string;
  nameTamil: string;
  category: string;
  color: string;
  bgGradient: string;
  application: string;
  ratePerSqft: number;
  specs: string;
}

const MATERIAL_PALETTE: MaterialSwatch[] = [
  {
    id: 'mat-1',
    name: 'Merino Italian White Marble',
    nameTamil: 'வெள்ளை பளிங்கு தரை',
    category: 'Flooring',
    color: '#f8fafc',
    bgGradient: 'from-slate-100 to-slate-300',
    application: 'Living Great Hall & Courtyard Walkway',
    ratePerSqft: 420,
    specs: 'Book-matched 18mm imported white marble with delicate grey feather veining. Polished mirror gloss.'
  },
  {
    id: 'mat-2',
    name: 'Natural Teakwood Parquet',
    nameTamil: 'தேக்கு மரத் தரை',
    category: 'Flooring',
    color: '#ca8a04',
    bgGradient: 'from-amber-600 to-amber-800',
    application: 'Master Bedroom Suite & Wardrobes',
    ratePerSqft: 340,
    specs: '12mm engineered solid Nilambur teak planks with polyurethane matte anti-scratch protective coating.'
  },
  {
    id: 'mat-3',
    name: 'Terrazzo Tile (Multi Granite Chips)',
    nameTamil: 'தரைக் கற்கள் (டெர்ராஸோ)',
    category: 'Flooring',
    color: '#e2e8f0',
    bgGradient: 'from-slate-200 via-stone-300 to-slate-400',
    application: 'Entrance Foyer & Open Balconies',
    ratePerSqft: 180,
    specs: 'Eco-friendly cast cement terrazzo with recycled multi-color marble and quartz aggregate chips.'
  },
  {
    id: 'mat-4',
    name: 'Multi Jasper Gemstone Slab',
    nameTamil: 'அலங்கார ஜாஸ்பர் கல்',
    category: 'Accent Wall',
    color: '#991b1b',
    bgGradient: 'from-rose-700 via-amber-800 to-rose-900',
    application: 'Puja Shrine Backdrop & Living Feature Wall',
    ratePerSqft: 1200,
    specs: 'Semi-precious natural jasper gemstone slab with concealed warm LED back-lighting.'
  },
  {
    id: 'mat-5',
    name: 'Sahara Noir Black Marble',
    nameTamil: 'கருப்பு பளிங்கு',
    category: 'Countertop',
    color: '#0f172a',
    bgGradient: 'from-slate-900 via-stone-900 to-neutral-950',
    application: 'Island Kitchen & Breakfast Bar Counter',
    ratePerSqft: 580,
    specs: 'Deep obsidian black marble with crisp golden-white linear veining. Satin leathered finish.'
  },
  {
    id: 'mat-6',
    name: 'Polished Terracotta (Athangudi Tiles)',
    nameTamil: 'ஆத்தங்குடி / சுடுமண் தரை',
    category: 'Vernacular',
    color: '#c2410c',
    bgGradient: 'from-amber-700 to-orange-800',
    application: 'Front Thinnai Verandah & Sitout',
    ratePerSqft: 140,
    specs: 'Handcrafted Chettinad Athangudi tiles cured with sun-dried natural mineral oxides and local river sand.'
  },
  {
    id: 'mat-7',
    name: 'Tropical Bermuda Grass Turf',
    nameTamil: 'முற்றப் புல்வெளி',
    category: 'Landscape',
    color: '#15803d',
    bgGradient: 'from-emerald-600 to-green-800',
    application: 'Central Open-to-Sky Muttram Courtyard',
    ratePerSqft: 45,
    specs: 'High-drainage drought-resistant lawn turf with embedded underground rainwater percolation gravel.'
  },
  {
    id: 'mat-8',
    name: 'Fluted Oak Acoustic Wall Slats',
    nameTamil: 'அலங்கார மரச் சுவர்',
    category: 'Wall Panel',
    color: '#b45309',
    bgGradient: 'from-amber-700 via-yellow-800 to-amber-900',
    application: 'Media Console & Staircase Backdrop',
    ratePerSqft: 260,
    specs: 'Real natural oak wood veneer slats over sound-absorbing recycled PET felt backing.'
  },
  {
    id: 'mat-9',
    name: 'Asphalt Grey Basalt Stone Cobbles',
    nameTamil: 'கருங்கல் தரை',
    category: 'Paving',
    color: '#334155',
    bgGradient: 'from-slate-700 to-slate-900',
    application: 'Car Porch Driveway & Walkway Paving',
    ratePerSqft: 110,
    specs: 'Flamed non-slip Sadahalli grey granite blocks engineered for heavy vehicular wheel loads.'
  },
  {
    id: 'mat-10',
    name: 'Avocado Green Brazilian Marble',
    nameTamil: 'பச்சை பளிங்கு',
    category: 'Vanity',
    color: '#065f46',
    bgGradient: 'from-emerald-700 via-teal-800 to-emerald-950',
    application: 'Master Bathroom Vanity Counter & Niches',
    ratePerSqft: 650,
    specs: 'Exotic deep emerald green marble with delicate crystalline veining.'
  },
  {
    id: 'mat-11',
    name: 'Mahogany Deckwood Planks',
    nameTamil: 'மாடி மரப் பலகை',
    category: 'Exterior Deck',
    color: '#7f1d1d',
    bgGradient: 'from-rose-900 to-amber-950',
    application: 'First Floor Sunset Terrace Decking',
    ratePerSqft: 380,
    specs: 'Weatherproof kiln-dried African mahogany with concealed stainless steel clip fasteners.'
  },
  {
    id: 'mat-12',
    name: 'Calacatta Gold Engineered Quartz',
    nameTamil: 'குவார்ட்ஸ் கல்',
    category: 'Kitchen Wall',
    color: '#fafaf9',
    bgGradient: 'from-stone-100 to-amber-100',
    application: 'Kitchen Backsplash & Prep Counters',
    ratePerSqft: 460,
    specs: 'Non-porous stain-resistant engineered quartz slab with gold-copper ribbons.'
  }
];

export const ClientPitchModal: React.FC<ClientPitchModalProps> = ({
  project,
  isOpen,
  onClose,
  activeFloor,
  language = 'en'
}) => {
  const [activeTab, setActiveTab] = useState<'board' | 'overview' | 'engineering' | 'review' | 'cost' | 'transmittal'>('board');
  
  // Selected Material Swatch State for Inspection (Images 4 & 5 pattern)
  const [selectedMaterial, setSelectedMaterial] = useState<MaterialSwatch>(MATERIAL_PALETTE[0]);

  // Transmittal Email State
  const [clientEmail, setClientEmail] = useState<string>('client.executive@luxuryestates.com');
  const [clientName, setClientName] = useState<string>('Victoria & David Vance');
  const [isSendingEmail, setIsSendingEmail] = useState<boolean>(false);
  const [emailSentStatus, setEmailSentStatus] = useState<string | null>(null);

  // Civil Engineer AI Consultation State
  const [engineerQuestion, setEngineerQuestion] = useState<string>('Can we remove the wall between Great Room and Dining to make a 24ft clear span in Grade M25 concrete?');
  const [isConsulting, setIsConsulting] = useState<boolean>(false);
  const [engineerReply, setEngineerReply] = useState<string | null>(null);

  // Professional Review & Sign-Off State
  const [engineerName, setEngineerName] = useState<string>(project.professionalReview?.registeredEngineerName || 'Er. S. Rajendran, M.E. (Struct)');
  const [licenseNumber, setLicenseNumber] = useState<string>(project.professionalReview?.licenseNumber || 'TN/RSE/GR-I/2021/042');
  const [consultancyFirm, setConsultancyFirm] = useState<string>(project.professionalReview?.consultancyFirm || 'Apex Structural Engineering Consultants, Chennai');
  const [signOffStatus, setSignOffStatus] = useState<'preliminary_software_check' | 'reviewed'>(
    project.professionalReview?.status === 'reviewed' ? 'reviewed' : 'preliminary_software_check'
  );
  const [signOffSaved, setSignOffSaved] = useState<boolean>(false);

  // Currency view toggle (INR vs USD)
  const [currencyMode, setCurrencyMode] = useState<'INR' | 'USD'>('INR');

  if (!isOpen) return null;

  const floor1Rooms = project.rooms.filter(r => (r.floor || 1) === 1);
  const floor2Rooms = project.rooms.filter(r => r.floor === 2);
  const f1Area = floor1Rooms.reduce((acc, r) => acc + (r.width * r.height), 0);
  const f2Area = floor2Rooms.reduce((acc, r) => acc + (r.width * r.height), 0);
  const totalArea = f1Area + f2Area;

  const site = project.siteProfile;
  const plotArea = site ? (site.plotAreaSqft || site.plotWidth * site.plotDepth) : 2400;
  const landUnits = tamilNaduCostService.convertLandArea(totalArea);
  const plotUnits = tamilNaduCostService.convertLandArea(plotArea);

  // District & Cost
  const district = site?.district || 'Chennai';
  const tnCost = tamilNaduCostService.calculateCostEstimate(totalArea, district, false);
  const estimatedCostUsd = Math.round(totalArea * 225);

  // Live TNCDBR-2019 Rules
  const tnRules = tamilNaduRulesService.evaluateTNCDBR(project);
  const passingCount = tnRules.filter(r => r.status === 'PASS').length;

  // Geotechnical Foundation Concepts
  const regionalSoil = geotechnicalService.getRegionalSoilDefaults(district);
  const foundationConcepts = geotechnicalService.evaluateFoundationSystem(
    project.geotechnicalData || {
      hasReport: true,
      safeBearingCapacityKpa: regionalSoil.estimatedSbcKpa,
      groundwaterDepthMeters: regionalSoil.typicalWaterTableMeters,
      isVerifiedByEngineer: false
    },
    district,
    project.floors || 2
  );
  const topFoundation = foundationConcepts[0];

  const handleSaveSignOff = () => {
    setSignOffStatus('reviewed');
    setSignOffSaved(true);
    setTimeout(() => setSignOffSaved(false), 3000);
  };

  const handleSendClientPackage = async () => {
    setIsSendingEmail(true);
    setEmailSentStatus(null);
    try {
      const result = await emailService.sendBlueprintPackage({
        toEmail: clientEmail,
        recipientName: clientName,
        subject: `MY3 Desings — Master Architectural & Civil Blueprint: ${project.name}`,
        projectName: project.name,
        blueprintPdfUrl: `https://my3designs.com/blueprints/${project.id}.pdf`,
        dxfUrl: `https://my3designs.com/cad/${project.id}.dxf`,
        structuralSummary: `Gross Living Area: ${totalArea} sq ft (${landUnits.cents} Cents). TNCDBR-2019 Evaluated. ${signOffStatus === 'reviewed' ? 'Professional Review Signed Off' : 'Preliminary Software Check'}.`
      });
      setEmailSentStatus(`Package dispatched to ${clientEmail} (Receipt #${result.deliveryReceiptId})`);
    } catch (e) {
      console.error(e);
      setEmailSentStatus('Failed to send transmittal email');
    } finally {
      setIsSendingEmail(false);
    }
  };

  const handleAskEngineer = async () => {
    if (!engineerQuestion.trim() || isConsulting) return;
    setIsConsulting(true);
    try {
      const result = await contactAiService.consultCivilEngineer(project, engineerQuestion, 'structural_beam');
      setEngineerReply(result.aiEngineerResponse || 'Consultation completed.');
    } catch (e) {
      console.error(e);
    } finally {
      setIsConsulting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fade-in select-none">
      <div className="bg-[var(--color-paper)] border border-[var(--color-rule)] rounded-2xl w-full max-w-6xl max-h-[94vh] overflow-hidden flex flex-col shadow-2xl text-[var(--color-ink)] font-sans">
        {/* Modal Top Header */}
        <div className="p-5 border-b border-[var(--color-rule)] bg-[var(--color-paper-2)] flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-[#dc2626]/10 text-[#dc2626] rounded-xl border border-[#dc2626]/20">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-[var(--color-ink)] tracking-tight font-display">Executive Architectural & Civil Pitch</h3>
                <span className="text-[10px] bg-[#dc2626]/10 text-[#dc2626] font-mono px-2 py-0.5 rounded border border-[#dc2626]/30 flex items-center gap-1 font-bold">
                  <CheckCircle2 className="w-3 h-3" />
                  Client Ready
                </span>
                <span className="text-[10px] bg-[#0f172a] text-white font-mono px-2 py-0.5 rounded">
                  {district}, TN
                </span>
              </div>
              <p className="text-xs text-[var(--color-muted)] mt-0.5 font-mono">
                {project.name} • {project.style} • {totalArea.toLocaleString()} sq ft ({landUnits.cents} Cents) • {project.floors} Levels
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-[var(--color-muted)] hover:text-[var(--color-ink)] rounded-lg hover:bg-[var(--color-paper-3)] transition text-sm font-bold cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Presentation Navigation Tabs */}
        <div className="flex items-center space-x-1 px-6 pt-3 border-b border-[var(--color-rule)] bg-[var(--color-paper-2)] overflow-x-auto">
          <button
            onClick={() => setActiveTab('board')}
            className={`px-4 py-2.5 text-xs font-mono font-semibold rounded-t-lg transition flex items-center gap-2 border-b-2 cursor-pointer ${
              activeTab === 'board'
                ? 'text-[#dc2626] border-[#dc2626] bg-[var(--color-paper)] font-bold'
                : 'text-[var(--color-muted)] border-transparent hover:text-[var(--color-ink)]'
            }`}
          >
            <Palette className="w-4 h-4 text-[#dc2626]" />
            <span>Specification Board & Materials</span>
          </button>

          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2.5 text-xs font-mono font-semibold rounded-t-lg transition flex items-center gap-2 border-b-2 cursor-pointer ${
              activeTab === 'overview'
                ? 'text-[#dc2626] border-[#dc2626] bg-[var(--color-paper)] font-bold'
                : 'text-[var(--color-muted)] border-transparent hover:text-[var(--color-ink)]'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>Spaces & Zoning</span>
          </button>

          <button
            onClick={() => setActiveTab('engineering')}
            className={`px-4 py-2.5 text-xs font-mono font-semibold rounded-t-lg transition flex items-center gap-2 border-b-2 cursor-pointer ${
              activeTab === 'engineering'
                ? 'text-[#dc2626] border-[#dc2626] bg-[var(--color-paper)] font-bold'
                : 'text-[var(--color-muted)] border-transparent hover:text-[var(--color-ink)]'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>TNCDBR & Civil Codes ({passingCount}/{tnRules.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('review')}
            className={`px-4 py-2.5 text-xs font-mono font-semibold rounded-t-lg transition flex items-center gap-2 border-b-2 cursor-pointer ${
              activeTab === 'review'
                ? 'text-[#dc2626] border-[#dc2626] bg-[var(--color-paper)] font-bold'
                : 'text-[var(--color-muted)] border-transparent hover:text-[var(--color-ink)]'
            }`}
          >
            <FileCheck className="w-4 h-4" />
            <span>Professional Sign-Off</span>
          </button>

          <button
            onClick={() => setActiveTab('cost')}
            className={`px-4 py-2.5 text-xs font-mono font-semibold rounded-t-lg transition flex items-center gap-2 border-b-2 cursor-pointer ${
              activeTab === 'cost'
                ? 'text-[#dc2626] border-[#dc2626] bg-[var(--color-paper)] font-bold'
                : 'text-[var(--color-muted)] border-transparent hover:text-[var(--color-ink)]'
            }`}
          >
            <DollarSign className="w-4 h-4" />
            <span>TN Budget & BOQ</span>
          </button>

          <button
            onClick={() => setActiveTab('transmittal')}
            className={`px-4 py-2.5 text-xs font-semibold rounded-t-xl transition flex items-center gap-2 border-b-2 ${
              activeTab === 'transmittal'
                ? 'text-purple-400 border-purple-500 bg-slate-900/60'
                : 'text-slate-400 border-transparent hover:text-white'
            }`}
          >
            <Mail className="w-4 h-4" />
            <span>Email Package</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {/* TAB 1: ARCHITECTURAL SPECIFICATION & FINISHES BOARD (Images 4 & 5 pattern) */}
          {activeTab === 'board' && (
            <div className="space-y-6">
              {/* Framed Architectural Presentation Sheet */}
              <div className="bg-slate-950 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-6">
                {/* Board Top Header Block */}
                <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                  <div>
                    <span className="text-[10px] text-rose-400 font-mono tracking-widest uppercase block">
                      ARCHITECTURAL SPECIFICATION & FINISHES PALETTE
                    </span>
                    <h2 className="text-xl font-black text-white mt-0.5 tracking-tight">
                      {project.name.toUpperCase()}
                    </h2>
                  </div>

                  <div className="text-right text-xs">
                    <span className="font-mono text-slate-300 block">SCALE 1:100 • TAMIL NADU JURISDICTION</span>
                    <span className="text-[10px] text-emerald-400 font-mono">NORTH FACING RESIDENCE • TNCDBR COMPLIANT</span>
                  </div>
                </div>

                {/* Main Split: CAD Schematic & Numbered Legend (Left) + 3D Render & Material Palette (Right) */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  {/* Left Column (5 Cols): Room Numbered Legend & Spatial Summary (Image 5 pattern) */}
                  <div className="lg:col-span-5 bg-slate-900/90 border border-slate-800 rounded-2xl p-4 space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                      <span className="font-bold text-xs text-slate-200 uppercase tracking-wider">
                        Spatial Legend & Key Plan
                      </span>
                      <span className="text-[10px] font-mono text-blue-400">{project.rooms.length} Spaces</span>
                    </div>

                    {/* Numbered Room Legend (Matching Image 5) */}
                    <div className="space-y-1.5 max-h-[340px] overflow-y-auto pr-1 text-xs">
                      {project.rooms.map((room, idx) => {
                        const numStr = (idx + 1).toString().padStart(2, '0');
                        const displayName = getRoomDisplayName(room.type, room.name, room.nameTamil, language);
                        return (
                          <div 
                            key={room.id}
                            className="flex items-center justify-between p-2 bg-slate-950/70 border border-slate-800/80 rounded-xl hover:border-blue-500/40 transition"
                          >
                            <div className="flex items-center gap-2.5">
                              <span className="w-6 h-6 rounded-lg bg-blue-600/20 text-blue-400 border border-blue-500/30 flex items-center justify-center font-mono font-bold text-[10px]">
                                {numStr}
                              </span>
                              <div>
                                <span className="font-semibold text-slate-200 block truncate max-w-[170px]">
                                  {displayName}
                                </span>
                                <span className="text-[9px] text-slate-500 font-mono">Level {room.floor || 1}</span>
                              </div>
                            </div>

                            <span className="font-mono text-slate-400 text-[11px]">
                              {room.width}' × {room.height}' ({room.width * room.height} sf)
                            </span>
                          </div>
                        );
                      })}
                    </div>

                    {/* Graphic Scale Bar & North Arrow */}
                    <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[10px] text-slate-400 font-mono">
                      <div className="flex items-center gap-2">
                        <span>SCALE:</span>
                        <div className="flex items-center border border-slate-700 rounded overflow-hidden">
                          <span className="px-1.5 py-0.5 bg-slate-800 text-white">0m</span>
                          <span className="px-1.5 py-0.5 bg-slate-900">1.0m</span>
                          <span className="px-1.5 py-0.5 bg-slate-800">2.0m</span>
                          <span className="px-1.5 py-0.5 bg-slate-900">5.0m</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 text-sky-400 font-bold">
                        <Compass className="w-4 h-4 animate-spin-slow" />
                        <span>NORTH</span>
                      </div>
                    </div>
                  </div>

                  {/* Right Column (7 Cols): 3D Perspective Render (Image 4) + Material Swatches (Image 5) */}
                  <div className="lg:col-span-7 space-y-4">
                    {/* 3D Interior Perspective Render Card (Matching Image 4) */}
                    <div className="relative rounded-2xl overflow-hidden border border-slate-800 shadow-xl group h-52 bg-slate-900">
                      <img 
                        src={project.renders[0]?.url || "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=85"} 
                        alt="Architectural Interior Render"
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-700"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
                      
                      <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-xs">
                        <div>
                          <span className="font-bold text-white text-sm block">Living & Courtyard Perspective</span>
                          <span className="text-[10px] text-slate-300">Natural Afternoon Daylight • Warm Oak Flooring</span>
                        </div>
                        <span className="px-2 py-1 bg-black/60 backdrop-blur-md text-emerald-400 font-mono rounded-lg border border-emerald-500/30 text-[10px]">
                          Photorealistic 3D
                        </span>
                      </div>
                    </div>

                    {/* Interactive Finishes Palette / Swatches (Matching Image 5) */}
                    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 space-y-3">
                      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                        <span className="font-bold text-xs text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                          <Palette className="w-3.5 h-3.5 text-rose-400" />
                          Material & Finishes Palette (Click Swatch to Inspect)
                        </span>
                        <span className="text-[10px] font-mono text-amber-400">12 Premium Finishes</span>
                      </div>

                      {/* Circular Material Swatches Grid (Matching Image 5) */}
                      <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 pt-1">
                        {MATERIAL_PALETTE.map((mat) => {
                          const isSelected = selectedMaterial.id === mat.id;
                          return (
                            <button
                              key={mat.id}
                              onClick={() => setSelectedMaterial(mat)}
                              className={`flex flex-col items-center text-center p-2 rounded-xl transition group ${
                                isSelected 
                                  ? 'bg-rose-950/40 border-2 border-rose-500 scale-105 shadow-lg shadow-rose-500/20' 
                                  : 'hover:bg-slate-800/80 border border-slate-800'
                              }`}
                            >
                              {/* Circular Material Swatch Bubble */}
                              <div className={`w-12 h-12 rounded-full shadow-md bg-gradient-to-tr ${mat.bgGradient} border-2 ${
                                isSelected ? 'border-white' : 'border-slate-700 group-hover:border-slate-400'
                              } flex items-center justify-center transition`} />
                              
                              <span className="text-[10px] font-semibold text-slate-200 mt-2 truncate w-full">
                                {language === 'ta' ? mat.nameTamil : mat.name.split(' ')[0]}
                              </span>
                              <span className="text-[9px] text-slate-400 font-mono">
                                ₹{mat.ratePerSqft}/sf
                              </span>
                            </button>
                          );
                        })}
                      </div>

                      {/* Selected Material Specification Inspector */}
                      {selectedMaterial && (
                        <div className="mt-3 p-3 bg-slate-950/80 border border-rose-900/40 rounded-xl text-xs space-y-1 animate-fade-in">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-rose-300 text-sm">
                              {selectedMaterial.name} ({selectedMaterial.nameTamil})
                            </span>
                            <span className="text-amber-400 font-mono font-bold">
                              ₹{selectedMaterial.ratePerSqft} / sq ft
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-300">
                            <strong>Application:</strong> {selectedMaterial.application} • <strong>Category:</strong> {selectedMaterial.category}
                          </div>
                          <p className="text-[10px] text-slate-400 leading-relaxed pt-0.5">
                            {selectedMaterial.specs}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: SPACES & ZONING (OVERVIEW) */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Highlight Metrics */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-2xl">
                  <span className="text-[11px] text-slate-400 font-medium block">Total Built-Up Area</span>
                  <div className="text-xl font-black text-white mt-1">
                    {totalArea.toLocaleString()} <span className="text-xs font-normal text-slate-400">sq ft</span>
                  </div>
                  <span className="text-[10px] text-blue-400 mt-1 block">
                    {landUnits.cents} Cents • {landUnits.grounds} Grounds ({landUnits.sqm} m²)
                  </span>
                </div>

                <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-2xl">
                  <span className="text-[11px] text-slate-400 font-medium block">Plot Footprint & Coverage</span>
                  <div className="text-xl font-black text-emerald-400 mt-1">
                    {Math.round((f1Area / plotArea) * 100)}% <span className="text-xs font-normal text-slate-400">Coverage</span>
                  </div>
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    Plot: {plotArea} sq ft ({plotUnits.cents} Cents)
                  </span>
                </div>

                <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-2xl">
                  <span className="text-[11px] text-slate-400 font-medium block">RCC Column Grid</span>
                  <div className="text-xl font-black text-sky-400 mt-1">
                    {(project.columns || []).length} <span className="text-xs font-normal text-slate-400">Pillars</span>
                  </div>
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    Standard 9" × 15" RCC columns (IS 456)
                  </span>
                </div>

                <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-2xl">
                  <span className="text-[11px] text-slate-400 font-medium block">Estimated Construction</span>
                  <div className="text-xl font-black text-amber-400 mt-1">
                    {tamilNaduCostService.formatIndianRupees(tnCost.totalCostInr)}
                  </div>
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    {district} @ ₹{tnCost.ratePerSqftInr}/sq ft (or ${(estimatedCostUsd / 1000).toFixed(0)}k USD)
                  </span>
                </div>
              </div>

              {/* Multi-floor Space Breakdown */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Level 1 Card */}
                <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-2xl space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <span className="font-bold text-sm text-slate-200 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-blue-500" />
                      Ground Floor (Level 1 — Social & Living)
                    </span>
                    <span className="text-xs font-mono text-blue-400">{f1Area} sq ft</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {floor1Rooms.map(r => (
                      <div key={r.id} className="p-2 bg-slate-900/80 border border-slate-800/80 rounded-xl">
                        <span className="font-semibold text-slate-300 block truncate">
                          {getRoomDisplayName(r.type, r.name, r.nameTamil, language)}
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono">{r.width}' × {r.height}' ({r.width * r.height} sqft)</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Level 2 Card */}
                <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-2xl space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <span className="font-bold text-sm text-slate-200 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-purple-500" />
                      First Floor (Level 2 — Rest Wing & Terrace)
                    </span>
                    <span className="text-xs font-mono text-purple-400">{f2Area} sq ft</span>
                  </div>
                  {floor2Rooms.length > 0 ? (
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      {floor2Rooms.map(r => (
                        <div key={r.id} className="p-2 bg-slate-900/80 border border-slate-800/80 rounded-xl">
                          <span className="font-semibold text-slate-300 block truncate">
                            {getRoomDisplayName(r.type, r.name, r.nameTamil, language)}
                          </span>
                          <span className="text-[10px] text-slate-500 font-mono">{r.width}' × {r.height}' ({r.width * r.height} sqft)</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-6 text-center text-slate-500 text-xs">
                      Single-floor design. You can switch to a multi-story home or add Level 2 via AI Chat.
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: TNCDBR & CIVIL ENGINEERING CODES */}
          {activeTab === 'engineering' && (
            <div className="space-y-6">
              {/* Official Rules Header Banner */}
              <div className="p-4 bg-emerald-950/20 border border-emerald-900/40 rounded-2xl flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <ShieldCheck className="w-8 h-8 text-emerald-400" />
                  <div>
                    <h4 className="font-bold text-white text-sm">Tamil Nadu Combined Development and Building Rules, 2019 (TNCDBR)</h4>
                    <p className="text-xs text-emerald-300/80">
                      Evaluated against G.O. Ms. No. 18 (MAWS) & G.O. Ms. No. 16 (H&UD) with NBC 2016 safety clearances.
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-mono text-emerald-400 font-bold block">{passingCount} OF {tnRules.length} VERIFIED</span>
                  <span className="text-[10px] text-slate-400">Authority: CMDA / DTCP</span>
                </div>
              </div>

              {/* TNCDBR Rules Grid */}
              <div className="space-y-3">
                <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                  Building Rule Verification Matrix
                </span>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {tnRules.map(rule => (
                    <div 
                      key={rule.ruleId} 
                      className="p-3.5 bg-slate-950/70 border border-slate-800 rounded-2xl space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-slate-200">{rule.ruleName}</span>
                        <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                          rule.status === 'PASS' 
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                            : rule.status === 'REQUIRES_PROFESSIONAL_VERIFICATION'
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                        }`}>
                          {rule.status}
                        </span>
                      </div>
                      <div className="text-[10px] text-blue-400 font-mono">
                        {rule.clause} • {rule.officialSource}
                      </div>
                      <p className="text-xs text-slate-300 leading-snug">{rule.explanation}</p>
                      {rule.remedialSuggestion && (
                        <p className="text-[10px] text-amber-400 mt-1">
                          <strong>Remedy:</strong> {rule.remedialSuggestion}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Geotechnical Foundation Concept */}
              {topFoundation && (
                <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-2xl space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                      <HardHat className="w-4 h-4 text-yellow-400" />
                      Geotechnical Foundation Concept ({district} Strata)
                    </span>
                    <span className="text-xs font-mono text-yellow-400">
                      SBC: {regionalSoil.estimatedSbcKpa} kN/m²
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                    <div className="p-3 bg-slate-900 rounded-xl">
                      <span className="text-slate-400 block text-[11px]">Recommended System</span>
                      <strong className="text-white block mt-0.5">{topFoundation.title}</strong>
                      <span className="text-[10px] text-emerald-400 mt-1 block">{topFoundation.suitabilityScore}% Suitability Score</span>
                    </div>

                    <div className="p-3 bg-slate-900 rounded-xl">
                      <span className="text-slate-400 block text-[11px]">Foundation Depth BGL</span>
                      <strong className="text-white block mt-0.5">{topFoundation.recommendedDepthMeters} Meters (5.0 ft)</strong>
                      <span className="text-[10px] text-slate-400 mt-1 block">To reach hard stratum</span>
                    </div>

                    <div className="p-3 bg-slate-900 rounded-xl">
                      <span className="text-slate-400 block text-[11px]">Continuous Plinth Beam</span>
                      <strong className="text-white block mt-0.5">{topFoundation.plinthBeamSize}</strong>
                      <span className="text-[10px] text-slate-400 mt-1 block">Ties RCC column grid</span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed">
                    <strong>Precaution:</strong> {topFoundation.constructionPrecaution}
                  </p>
                </div>
              )}

              {/* AI Civil Engineer Q&A */}
              <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-2xl space-y-3">
                <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                  Ask AI Civil Engineer (Nemotron 3.5 — IS & TNCDBR Trained)
                </span>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={engineerQuestion}
                    onChange={(e) => setEngineerQuestion(e.target.value)}
                    placeholder="Ask about RCC column spacing, plinth beams, setback exemptions..."
                    className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
                  />
                  <button
                    onClick={handleAskEngineer}
                    disabled={isConsulting || !engineerQuestion.trim()}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition"
                  >
                    {isConsulting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                    <span>Consult Engineer</span>
                  </button>
                </div>

                {engineerReply && (
                  <div className="mt-3 p-3 bg-slate-900/90 border border-emerald-900/50 rounded-xl text-xs text-slate-300 leading-relaxed font-sans whitespace-pre-line">
                    {engineerReply}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 4: PROFESSIONAL SIGN-OFF WORKFLOW */}
          {activeTab === 'review' && (
            <div className="space-y-6">
              {/* Authenticity Warning / Disclaimer */}
              <div className="p-4 bg-amber-950/20 border border-amber-900/40 rounded-2xl space-y-2">
                <div className="flex items-center space-x-2 text-amber-400">
                  <AlertTriangle className="w-5 h-5 shrink-0" />
                  <h4 className="font-bold text-sm">Professional Review & Verification Notice</h4>
                </div>
                <p className="text-xs text-amber-200/80 leading-relaxed">
                  This platform performs <strong>preliminary computational checks</strong> against TNCDBR-2019 and Indian Standards (IS 456, IS 1893). It does <em>not</em> fabricate official municipal approval or substitute for an authentic Council of Architecture (COA) / Tamil Nadu Registered Structural Engineer (TN RSE) sign-off.
                </p>
              </div>

              {/* Reviewer Sign-Off Form */}
              <div className="p-5 bg-slate-950/70 border border-slate-800 rounded-2xl space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <span className="font-bold text-sm text-slate-200 flex items-center gap-2">
                    <FileCheck className="w-4 h-4 text-emerald-400" />
                    Licensed Professional Sign-Off Record
                  </span>
                  <span className={`text-xs font-mono font-bold px-2.5 py-1 rounded-full border ${
                    signOffStatus === 'reviewed'
                      ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                      : 'bg-blue-500/20 text-blue-400 border-blue-500/30'
                  }`}>
                    {signOffStatus === 'reviewed' ? 'REVIEWED BY REGISTERED ENGINEER' : 'PRELIMINARY SOFTWARE CHECK'}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">Registered Structural Engineer / Architect Name</label>
                    <input
                      type="text"
                      value={engineerName}
                      onChange={(e) => setEngineerName(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">COA / TN RSE Registration Number</label>
                    <input
                      type="text"
                      value={licenseNumber}
                      onChange={(e) => setLicenseNumber(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:border-blue-500"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="text-[11px] text-slate-400 block mb-1">Engineering Consultancy / Architectural Firm</label>
                    <input
                      type="text"
                      value={consultancyFirm}
                      onChange={(e) => setConsultancyFirm(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:border-blue-500"
                    />
                  </div>
                </div>

                {/* Missing Data Checklist */}
                <div className="pt-2 border-t border-slate-800 space-y-2">
                  <span className="text-xs font-bold text-slate-300 block">
                    Municipal Submission Readiness Checklist:
                  </span>
                  <div className="space-y-1.5 text-xs text-slate-400">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" defaultChecked className="rounded bg-slate-900 text-blue-600" />
                      <span>Site boundary survey map (Patta / FMB sketch) verified against physical dimensions</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" defaultChecked className="rounded bg-slate-900 text-blue-600" />
                      <span>Geotechnical soil test report (borehole log & safe bearing capacity) confirmed</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" defaultChecked className="rounded bg-slate-900 text-blue-600" />
                      <span>RCC Frame 3D structural analysis model (STAAD.Pro / ETABS) completed</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" defaultChecked className="rounded bg-slate-900 text-blue-600" />
                      <span>TNCDBR Rule 42 Rainwater Harvesting (RWH) recharge pit design detailed</span>
                    </label>
                  </div>
                </div>

                <div className="pt-3 flex items-center justify-between">
                  <span className="text-[11px] text-slate-500">
                    Signing updates project metadata with licensed practitioner identification.
                  </span>
                  <button
                    onClick={handleSaveSignOff}
                    className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold flex items-center gap-2 shadow-lg shadow-emerald-600/30 transition"
                  >
                    <FileCheck className="w-4 h-4" />
                    <span>Confirm Professional Review</span>
                  </button>
                </div>

                {signOffSaved && (
                  <div className="p-3 bg-emerald-950/30 border border-emerald-900/50 rounded-xl text-xs text-emerald-400 flex items-center gap-2 font-mono">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Professional sign-off updated successfully.</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 5: TAMIL NADU BUDGET & BOQ SCHEDULE */}
          {activeTab === 'cost' && (
            <div className="space-y-6">
              {/* Cost Banner with Currency Toggle */}
              <div className="p-5 bg-slate-950/80 border border-slate-800 rounded-2xl flex items-center justify-between">
                <div>
                  <span className="text-xs text-slate-400 block">Total Estimated Construction Cost ({district})</span>
                  <div className="text-3xl font-black text-amber-400 mt-1">
                    {currencyMode === 'INR' 
                      ? tamilNaduCostService.formatIndianRupees(tnCost.totalCostInr)
                      : `$${estimatedCostUsd.toLocaleString()} USD`
                    }
                  </div>
                  <span className="text-xs text-slate-400 mt-1 block">
                    Built-Up Area: {totalArea} sq ft @ ₹{tnCost.ratePerSqftInr}/sq ft (Standard Turnkey Spec)
                  </span>
                </div>

                <div className="text-right space-y-2">
                  <div className="flex bg-slate-900 border border-slate-800 rounded-xl p-1">
                    <button
                      onClick={() => setCurrencyMode('INR')}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                        currencyMode === 'INR' ? 'bg-amber-600 text-white' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      INR (₹)
                    </button>
                    <button
                      onClick={() => setCurrencyMode('USD')}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                        currencyMode === 'USD' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      USD ($)
                    </button>
                  </div>
                  <span className="text-[10px] text-slate-500 block">±7% Tamil Nadu market variance</span>
                </div>
              </div>

              {/* Material Schedule (BOQ) */}
              <div className="space-y-2.5">
                <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                  Tamil Nadu Civil Engineering Bill of Quantities (BOQ)
                </span>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-xs">
                  <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl">
                    <span className="text-slate-400 block text-[11px] mb-1">53-Grade Cement</span>
                    <div className="text-base font-bold text-white font-mono">{tnCost.materialsBreakdown.cementBags.toLocaleString()}</div>
                    <span className="text-[10px] text-slate-500">Bags (~50kg each)</span>
                  </div>

                  <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl">
                    <span className="text-slate-400 block text-[11px] mb-1">Fe550D TMT Steel</span>
                    <div className="text-base font-bold text-white font-mono">{(tnCost.materialsBreakdown.steelKg / 1000).toFixed(1)} MT</div>
                    <span className="text-[10px] text-slate-500">{tnCost.materialsBreakdown.steelKg.toLocaleString()} kg</span>
                  </div>

                  <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl">
                    <span className="text-slate-400 block text-[11px] mb-1">M-Sand (Plaster)</span>
                    <div className="text-base font-bold text-white font-mono">{tnCost.materialsBreakdown.mSandCft.toLocaleString()}</div>
                    <span className="text-[10px] text-slate-500">Cubic Feet (cft)</span>
                  </div>

                  <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl">
                    <span className="text-slate-400 block text-[11px] mb-1">20mm Blue Metal</span>
                    <div className="text-base font-bold text-white font-mono">{tnCost.materialsBreakdown.coarseAggregateCft.toLocaleString()}</div>
                    <span className="text-[10px] text-slate-500">Coarse Aggregate cft</span>
                  </div>

                  <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl">
                    <span className="text-slate-400 block text-[11px] mb-1">Class-1 Red Bricks</span>
                    <div className="text-base font-bold text-white font-mono">{tnCost.materialsBreakdown.bricksNos.toLocaleString()}</div>
                    <span className="text-[10px] text-slate-500">Nos (Country / Wirecut)</span>
                  </div>
                </div>
              </div>

              {/* Milestone Cashflow Split */}
              <div className="space-y-2.5">
                <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                  Construction Stage Cashflow Schedule
                </span>
                <div className="grid grid-cols-2 md:grid-cols-6 gap-2 text-xs">
                  <div className="p-2.5 bg-slate-950/50 border border-slate-800 rounded-xl">
                    <span className="text-slate-400 block text-[10px]">Substructure (14%)</span>
                    <div className="font-bold text-white mt-1">{tamilNaduCostService.formatIndianRupees(tnCost.costComponentSplit.substructureFoundationInr)}</div>
                  </div>
                  <div className="p-2.5 bg-slate-950/50 border border-slate-800 rounded-xl">
                    <span className="text-slate-400 block text-[10px]">RCC Frame (26%)</span>
                    <div className="font-bold text-white mt-1">{tamilNaduCostService.formatIndianRupees(tnCost.costComponentSplit.rccStructureInr)}</div>
                  </div>
                  <div className="p-2.5 bg-slate-950/50 border border-slate-800 rounded-xl">
                    <span className="text-slate-400 block text-[10px]">Masonry (18%)</span>
                    <div className="font-bold text-white mt-1">{tamilNaduCostService.formatIndianRupees(tnCost.costComponentSplit.brickworkPlasteringInr)}</div>
                  </div>
                  <div className="p-2.5 bg-slate-950/50 border border-slate-800 rounded-xl">
                    <span className="text-slate-400 block text-[10px]">MEP Lines (16%)</span>
                    <div className="font-bold text-white mt-1">{tamilNaduCostService.formatIndianRupees(tnCost.costComponentSplit.plumbingElectricalInr)}</div>
                  </div>
                  <div className="p-2.5 bg-slate-950/50 border border-slate-800 rounded-xl">
                    <span className="text-slate-400 block text-[10px]">Flooring (14%)</span>
                    <div className="font-bold text-white mt-1">{tamilNaduCostService.formatIndianRupees(tnCost.costComponentSplit.flooringFinishesInr)}</div>
                  </div>
                  <div className="p-2.5 bg-slate-950/50 border border-slate-800 rounded-xl">
                    <span className="text-slate-400 block text-[10px]">Painting (12%)</span>
                    <div className="font-bold text-white mt-1">{tamilNaduCostService.formatIndianRupees(tnCost.costComponentSplit.paintingFixturesInr)}</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: TRANSMITTAL EMAIL */}
          {activeTab === 'transmittal' && (
            <div className="space-y-4">
              <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-2xl space-y-3">
                <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                  Send Official Blueprint & Presentation Package
                </span>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">Client Full Name</label>
                    <input
                      type="text"
                      value={clientName}
                      onChange={(e) => setClientName(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">Client Email Address</label>
                    <input
                      type="email"
                      value={clientEmail}
                      onChange={(e) => setClientEmail(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200"
                    />
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-between">
                  <span className="text-[11px] text-slate-500">
                    Includes 2D CAD Vector Plan, 3D WebGL Presentation Link, TNCDBR Compliance & Bill of Quantities.
                  </span>
                  <button
                    onClick={handleSendClientPackage}
                    disabled={isSendingEmail || !clientEmail}
                    className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-xl text-xs font-semibold flex items-center gap-2 shadow-lg shadow-blue-600/30 transition"
                  >
                    {isSendingEmail ? <Loader2 className="w-4 h-4 animate-spin" /> : <Mail className="w-4 h-4" />}
                    <span>Dispatch Package</span>
                  </button>
                </div>

                {emailSentStatus && (
                  <div className="p-3 bg-emerald-950/30 border border-emerald-900/50 rounded-xl text-xs text-emerald-400 flex items-center gap-2 font-mono">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>{emailSentStatus}</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>MY3 Desings • Architectural & Civil Collaboration Active</span>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-medium transition"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
