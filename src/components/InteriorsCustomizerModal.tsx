import React, { useState } from 'react';
import type { Room, FurnitureItem } from '../types';
import type { Language } from '../services/i18n';
import { materialCatalogService, type MaterialSwatch } from '../services/materialCatalogService';
import { 
  X, Check, Sparkles, Palette, 
  Layers, ShieldCheck, ChevronRight, Wand2
} from 'lucide-react';

interface InteriorsCustomizerModalProps {
  isOpen: boolean;
  onClose: () => void;
  room: Room | null;
  furnitureItem: FurnitureItem | null;
  language: Language;
  onApplyFinish: (options: {
    targetType: 'room' | 'furniture';
    targetId: string;
    category: 'flooring' | 'wall' | 'furniture' | 'rug';
    value: string;
    swatchName: string;
  }) => void;
}

export const InteriorsCustomizerModal: React.FC<InteriorsCustomizerModalProps> = ({
  isOpen,
  onClose,
  room,
  furnitureItem,
  language,
  onApplyFinish
}) => {
  const [selectedTab, setSelectedTab] = useState<'flooring' | 'wall' | 'furniture' | 'rug'>('flooring');

  if (!isOpen || (!room && !furnitureItem)) return null;

  const targetTitle = room 
    ? (language === 'ta' && room.nameTamil ? room.nameTamil : room.name)
    : (furnitureItem?.name || 'Furniture Item');

  const handleSelectSwatch = (swatch: MaterialSwatch) => {
    if (room) {
      onApplyFinish({
        targetType: 'room',
        targetId: room.id,
        category: swatch.category,
        value: swatch.id,
        swatchName: language === 'ta' ? swatch.nameTamil : swatch.name
      });
    } else if (furnitureItem) {
      onApplyFinish({
        targetType: 'furniture',
        targetId: furnitureItem.id,
        category: 'furniture',
        value: swatch.id,
        swatchName: language === 'ta' ? swatch.nameTamil : swatch.name
      });
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-slate-900 border border-slate-700/80 rounded-3xl p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-tr from-amber-500 to-rose-500 text-white rounded-2xl shadow-lg">
              <Palette className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-white tracking-tight">
                  {language === 'ta' ? 'உள்துறை & வண்ண தேர்வு' : 'Interiors, Flooring & Colors Studio'}
                </h3>
                <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full font-mono border border-amber-500/40">
                  Image 1 Palette
                </span>
              </div>
              <p className="text-xs text-slate-400">
                {language === 'ta'
                  ? `${targetTitle} அறைக்கு புதிய தரை மற்றும் சுவரை தேர்வு செய்யுங்கள்`
                  : `Customize architectural finishes for ${targetTitle}`}
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

        {/* Whole-Home Architectural Tip */}
        <div className="bg-slate-950/80 p-3 rounded-2xl border border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-amber-500/10 text-amber-400 rounded-xl border border-amber-500/20">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-xs text-white">
                {language === 'ta' ? 'முழு வீடு வடிவமைப்பு:' : 'Whole-Home Harmony:'}
              </span>
              <p className="text-[11px] text-slate-400">
                {language === 'ta'
                  ? 'கீழே உள்ள தீம்களைப் பயன்படுத்தி முழு வீட்டையும் ஒரே கிளிக்கில் மாற்றலாம்.'
                  : 'Or use Whole-Home Themes on the canvas toolbar to transform all rooms together.'}
              </p>
            </div>
          </div>
          <span className="text-[10px] bg-blue-600/20 text-blue-300 px-2 py-0.5 rounded-full font-mono border border-blue-500/30">
            Coordinated
          </span>
        </div>

        {/* Category Tabs */}
        <div className="flex items-center gap-1.5 bg-slate-950 p-1.5 rounded-2xl border border-slate-800 text-xs">
          <button
            onClick={() => setSelectedTab('flooring')}
            className={`flex-1 py-1.5 px-3 rounded-xl font-medium transition ${
              selectedTab === 'flooring' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            {language === 'ta' ? 'தரை ஓடுகள்' : 'Flooring Tiles'}
          </button>
          <button
            onClick={() => setSelectedTab('wall')}
            className={`flex-1 py-1.5 px-3 rounded-xl font-medium transition ${
              selectedTab === 'wall' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            {language === 'ta' ? 'சுவர் வண்ணங்கள்' : 'Wall Finishes'}
          </button>
          <button
            onClick={() => setSelectedTab('furniture')}
            className={`flex-1 py-1.5 px-3 rounded-xl font-medium transition ${
              selectedTab === 'furniture' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            {language === 'ta' ? 'மரச்சாமான்கள்' : 'Furniture Upholstery'}
          </button>
          <button
            onClick={() => setSelectedTab('rug')}
            className={`flex-1 py-1.5 px-3 rounded-xl font-medium transition ${
              selectedTab === 'rug' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            {language === 'ta' ? 'கம்பளங்கள்' : 'Designer Rugs'}
          </button>
        </div>

        {/* Swatches Grid */}
        <div className="grid grid-cols-2 gap-3">
          {selectedTab === 'flooring' && materialCatalogService.flooringSwatches.map(swatch => (
            <div
              key={swatch.id}
              onClick={() => handleSelectSwatch(swatch)}
              className="p-3 bg-slate-950 hover:bg-slate-800/80 border border-slate-800 hover:border-blue-500/60 rounded-2xl cursor-pointer transition group flex items-start space-x-3"
            >
              <div 
                className="w-10 h-10 rounded-xl border border-slate-700 shadow-inner shrink-0 flex items-center justify-center relative overflow-hidden"
                style={{ backgroundColor: swatch.primaryColor }}
              >
                {swatch.textureType === 'mosaic' && (
                  <div className="absolute inset-0 grid grid-cols-2 grid-rows-2">
                    <div className="bg-slate-900" />
                    <div className="bg-white" />
                    <div className="bg-white" />
                    <div className="bg-slate-900" />
                  </div>
                )}
                {swatch.textureType === 'deck' && (
                  <div className="absolute inset-0 flex flex-col justify-between py-1">
                    <div className="h-[2px] bg-amber-950" />
                    <div className="h-[2px] bg-amber-950" />
                    <div className="h-[2px] bg-amber-950" />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-bold text-xs text-slate-200 group-hover:text-blue-400 transition truncate">
                  {language === 'ta' ? swatch.nameTamil : swatch.name}
                </div>
                <div className="text-[10px] text-slate-400 line-clamp-1 mt-0.5">{swatch.description}</div>
                <div className="text-[9px] text-blue-400 font-mono mt-1">{swatch.suggestedFor}</div>
              </div>
            </div>
          ))}

          {selectedTab === 'wall' && materialCatalogService.wallSwatches.map(swatch => (
            <div
              key={swatch.id}
              onClick={() => handleSelectSwatch(swatch)}
              className="p-3 bg-slate-950 hover:bg-slate-800/80 border border-slate-800 hover:border-amber-500/60 rounded-2xl cursor-pointer transition group flex items-start space-x-3"
            >
              <div 
                className="w-10 h-10 rounded-xl border border-slate-700 shadow-inner shrink-0 relative overflow-hidden"
                style={{ backgroundColor: swatch.primaryColor }}
              >
                {swatch.textureType === 'slats' && (
                  <div className="absolute inset-0 flex justify-between px-1">
                    <div className="w-[2px] bg-amber-950" />
                    <div className="w-[2px] bg-amber-950" />
                    <div className="w-[2px] bg-amber-950" />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-bold text-xs text-slate-200 group-hover:text-amber-400 transition truncate">
                  {language === 'ta' ? swatch.nameTamil : swatch.name}
                </div>
                <div className="text-[10px] text-slate-400 line-clamp-1 mt-0.5">{swatch.description}</div>
                <div className="text-[9px] text-amber-400 font-mono mt-1">{swatch.suggestedFor}</div>
              </div>
            </div>
          ))}

          {selectedTab === 'furniture' && materialCatalogService.furnitureSwatches.map(swatch => (
            <div
              key={swatch.id}
              onClick={() => handleSelectSwatch(swatch)}
              className="p-3 bg-slate-950 hover:bg-slate-800/80 border border-slate-800 hover:border-rose-500/60 rounded-2xl cursor-pointer transition group flex items-start space-x-3"
            >
              <div 
                className="w-10 h-10 rounded-xl border border-slate-700 shadow-inner shrink-0 flex items-center justify-center"
                style={{ backgroundColor: swatch.primaryColor }}
              >
                {swatch.id === 'burgundy_velvet' && (
                  <span className="text-amber-300 font-bold text-xs">+</span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-bold text-xs text-slate-200 group-hover:text-rose-400 transition truncate">
                  {language === 'ta' ? swatch.nameTamil : swatch.name}
                </div>
                <div className="text-[10px] text-slate-400 line-clamp-1 mt-0.5">{swatch.description}</div>
                <div className="text-[9px] text-rose-400 font-mono mt-1">{swatch.suggestedFor}</div>
              </div>
            </div>
          ))}

          {selectedTab === 'rug' && materialCatalogService.rugSwatches.map(swatch => (
            <div
              key={swatch.id}
              onClick={() => handleSelectSwatch(swatch)}
              className="p-3 bg-slate-950 hover:bg-slate-800/80 border border-slate-800 hover:border-emerald-500/60 rounded-2xl cursor-pointer transition group flex items-start space-x-3"
            >
              <div 
                className="w-10 h-10 rounded-xl border border-slate-700 shadow-inner shrink-0"
                style={{ backgroundColor: swatch.primaryColor }}
              />
              <div className="flex-1 min-w-0">
                <div className="font-bold text-xs text-slate-200 group-hover:text-emerald-400 transition truncate">
                  {language === 'ta' ? swatch.nameTamil : swatch.name}
                </div>
                <div className="text-[10px] text-slate-400 line-clamp-1 mt-0.5">{swatch.description}</div>
                <div className="text-[9px] text-emerald-400 font-mono mt-1">{swatch.suggestedFor}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span>Clicking any swatch dispatches the engineer/carpenter to verify & apply live.</span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-medium transition"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
