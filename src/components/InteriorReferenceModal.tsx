import React, { useState } from 'react';
import type { Project } from '../types';
import type { Language } from '../services/i18n';
import { materialCatalogService, type WholeHomeTheme } from '../services/materialCatalogService';
import { 
  X, Sparkles, Image as ImageIcon, Eye, Download, 
  Layers, Check, Palette, ArrowRight, Compass
} from 'lucide-react';

interface InteriorReferenceModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: Project;
  language: Language;
  onApplyTheme: (themeId: string) => void;
}

export const InteriorReferenceModal: React.FC<InteriorReferenceModalProps> = ({
  isOpen,
  onClose,
  project,
  language,
  onApplyTheme
}) => {
  const [selectedRoomCategory, setSelectedRoomCategory] = useState<'living' | 'master_bed' | 'kitchen' | 'bath'>('living');
  const [activeThemeId, setActiveThemeId] = useState<string>('modern_urban_loft');

  if (!isOpen) return null;

  const currentTheme = materialCatalogService.wholeHomeThemes.find(t => t.id === activeThemeId) || materialCatalogService.wholeHomeThemes[0];

  const roomRenders: Record<'living' | 'master_bed' | 'kitchen' | 'bath', { title: string; titleTamil: string; url: string; description: string }> = {
    living: {
      title: 'Modern Urban Living Room (Image 2 Reference)',
      titleTamil: 'நவீன வரவேற்பறை தோற்றம்',
      url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1600&q=85',
      description: 'Open living room with floor-to-ceiling panoramic glass facade, textured area rug, fluted natural oak wall paneling, and burgundy royal velvet sectional seating.'
    },
    master_bed: {
      title: 'Primary Master Suite',
      titleTamil: 'முதன்மையான படுக்கையறை',
      url: 'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?auto=format&fit=crop&w=1600&q=85',
      description: 'Warm natural oak hardwood flooring, king bed with upholstered teak headboard, dual bedside ambient lamps, and soft blush silk sheen rug.'
    },
    kitchen: {
      title: 'Chef Kitchen & Dining Space',
      titleTamil: 'நவீன சமையலறை மற்றும் உணவறை',
      url: 'https://images.unsplash.com/photo-1600565193348-f74bd3c7ccdf?auto=format&fit=crop&w=1600&q=85',
      description: 'Polished quartz island with breakfast bar stools, Sahara Noir black marble dining table with golden lightning veins, and recessed ceiling cove lighting.'
    },
    bath: {
      title: 'Luxury En-Suite Bathroom',
      titleTamil: 'சொகுசு குளியலறை',
      url: 'https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?auto=format&fit=crop&w=1600&q=85',
      description: 'Book-matched Italian marble, deep soaking freestanding porcelain bathtub, LED backlit floating vanity, and frameless glass shower enclosure.'
    }
  };

  const activeRender = roomRenders[selectedRoomCategory];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-5xl bg-slate-900 border border-slate-700/80 rounded-3xl p-6 shadow-2xl space-y-5 max-h-[92vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-tr from-amber-500 to-rose-500 text-white rounded-2xl shadow-lg">
              <ImageIcon className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-white tracking-tight">
                  {language === 'ta' ? '3D உள்துறை காட்சி பலகை' : '3D Interior Presentation & Material Board'}
                </h3>
                <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full font-mono border border-amber-500/40">
                  Image 2 Desk Presentation Style
                </span>
              </div>
              <p className="text-xs text-slate-400">
                {language === 'ta'
                  ? 'கட்டிட வரைபடம் மற்றும் 3D உள்துறை வடிவமைப்பு மாதிரியை அருகருகே ஒப்பிட்டு பாருங்கள்'
                  : 'Compare 2D architectural layout side-by-side with photorealistic 3D interior renders & material chips'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Room Category Navigation */}
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-1.5 bg-slate-950 p-1.5 rounded-2xl border border-slate-800 text-xs">
            {(['living', 'master_bed', 'kitchen', 'bath'] as const).map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedRoomCategory(cat)}
                className={`py-1.5 px-3.5 rounded-xl font-medium transition ${
                  selectedRoomCategory === cat
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {cat === 'living' ? (language === 'ta' ? 'வரவேற்பறை' : 'Living Room') :
                 cat === 'master_bed' ? (language === 'ta' ? 'முதன்மை படுக்கையறை' : 'Master Suite') :
                 cat === 'kitchen' ? (language === 'ta' ? 'சமையல் & உணவு' : 'Kitchen & Dining') :
                 (language === 'ta' ? 'குளியலறை' : 'Luxury Bath')}
              </button>
            ))}
          </div>

          {/* Whole-Home Instant Theme Apply Button */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 hidden sm:inline">Apply Theme to Whole House:</span>
            <select
              value={activeThemeId}
              onChange={(e) => {
                setActiveThemeId(e.target.value);
                onApplyTheme(e.target.value);
              }}
              className="bg-slate-950 border border-amber-500/50 text-amber-300 font-bold text-xs py-1.5 px-3 rounded-xl focus:outline-none focus:ring-1 focus:ring-amber-400 cursor-pointer"
            >
              {materialCatalogService.wholeHomeThemes.map(t => (
                <option key={t.id} value={t.id} className="bg-slate-900 text-white">
                  {language === 'ta' ? t.nameTamil : t.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Main Presentation Board (Side-by-Side Blueprint + 3D Render matching Image 2!) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 bg-slate-950/80 p-4 rounded-3xl border border-slate-800">
          {/* Left: 2D Floor Plan Blueprint Summary (5 Cols) */}
          <div className="lg:col-span-5 bg-slate-900/90 rounded-2xl p-4 border border-slate-800 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <Compass className="w-4 h-4 text-blue-400" />
                  <span className="font-bold text-xs text-white uppercase tracking-wider">
                    {project.name}
                  </span>
                </div>
                <span className="text-[11px] font-mono text-blue-400 bg-blue-600/20 px-2 py-0.5 rounded border border-blue-500/30">
                  {project.sqft} SQ FT
                </span>
              </div>

              <div className="py-4 space-y-2.5 text-xs">
                <div className="flex justify-between text-slate-300">
                  <span className="text-slate-500">Active Theme:</span>
                  <span className="font-semibold text-amber-300">{currentTheme.name}</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span className="text-slate-500">Living Flooring:</span>
                  <span className="font-mono text-slate-200">Terrazzo Tile / Merino Marble</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span className="text-slate-500">Bedrooms Flooring:</span>
                  <span className="font-mono text-slate-200">Natural Oak Hardwood</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span className="text-slate-500">Balcony Deck:</span>
                  <span className="font-mono text-slate-200">Mahogany Deckwood</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span className="text-slate-500">Staircase Lighting:</span>
                  <span className="font-mono text-amber-400">LED Step Cove Lighting</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span className="text-slate-500">Sofa Upholstery:</span>
                  <span className="font-semibold text-rose-300">Burgundy Royal Velvet</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span className="text-slate-500">Dining Table Top:</span>
                  <span className="font-semibold text-amber-300">Sahara Noir Marble</span>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800">
              <button
                onClick={() => {
                  onApplyTheme(activeThemeId);
                  onClose();
                }}
                className="w-full py-2.5 bg-gradient-to-r from-amber-600 to-rose-600 hover:from-amber-500 hover:to-rose-500 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 shadow-lg"
              >
                <Sparkles className="w-4 h-4 text-amber-200" />
                <span>Apply This Theme to Entire Home</span>
              </button>
            </div>
          </div>

          {/* Right: Photorealistic 3D Interior Render (7 Cols matching Image 2!) */}
          <div className="lg:col-span-7 flex flex-col space-y-3">
            <div className="relative rounded-2xl overflow-hidden border border-slate-800 aspect-[16/10] bg-slate-900 shadow-2xl group">
              <img
                src={activeRender.url}
                alt={activeRender.title}
                className="w-full h-full object-cover group-hover:scale-105 transition duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20" />
              
              <div className="absolute bottom-3 left-3 right-3 text-white">
                <h4 className="font-bold text-sm tracking-tight text-white flex items-center gap-2">
                  <span>{activeRender.title}</span>
                  <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full backdrop-blur-sm">
                    4K Architectural Render
                  </span>
                </h4>
                <p className="text-xs text-slate-300 line-clamp-2 mt-1">
                  {activeRender.description}
                </p>
              </div>
            </div>

            {/* Bottom: Material Swatch Chips (Matching Image 2 Desk Swatches!) */}
            <div className="bg-slate-900/90 p-3 rounded-2xl border border-slate-800">
              <span className="text-[11px] font-bold text-slate-400 block mb-2">
                {language === 'ta' ? 'பயன்படுத்தப்படும் பொருட்கள் (Material Chips):' : 'Material Finishes & Specification Chips:'}
              </span>
              <div className="grid grid-cols-6 gap-2">
                {materialCatalogService.flooringSwatches.slice(0, 6).map(swatch => (
                  <div key={swatch.id} className="flex flex-col items-center text-center">
                    <div 
                      className="w-9 h-9 rounded-xl border border-slate-700 shadow-md flex items-center justify-center overflow-hidden"
                      style={{ backgroundColor: swatch.primaryColor }}
                    >
                      {swatch.id === 'chequered_mosaic' && (
                        <div className="w-full h-full grid grid-cols-2 grid-rows-2">
                          <div className="bg-slate-900" />
                          <div className="bg-white" />
                          <div className="bg-white" />
                          <div className="bg-slate-900" />
                        </div>
                      )}
                    </div>
                    <span className="text-[9px] text-slate-400 mt-1 truncate max-w-[55px]">
                      {swatch.name.split(' ')[0]}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end pt-2 border-t border-slate-800">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-medium transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
