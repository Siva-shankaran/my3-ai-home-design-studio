import React, { useState } from 'react';
import { Project, FurnitureItem } from '../types';
import { 
  Armchair, Bed, Utensils, Laptop, Bath, 
  Plus, Sparkles, Check, Move
} from 'lucide-react';

interface FurniturePanelProps {
  project: Project;
  onUpdateProject: (updated: Project) => void;
  unit: 'imperial' | 'metric';
}

export const FurniturePanel: React.FC<FurniturePanelProps> = ({ project, onUpdateProject, unit }) => {
  const [activeCategory, setActiveCategory] = useState<'all' | 'living' | 'bedroom' | 'dining' | 'kitchen' | 'office'>('all');
  
  // Custom furniture inputs
  const [customName, setCustomName] = useState('');
  const [customWidth, setCustomWidth] = useState(6);
  const [customDepth, setCustomDepth] = useState(3);
  const [customCategory, setCustomCategory] = useState<'living' | 'bedroom' | 'dining' | 'kitchen' | 'office' | 'bath'>('living');

  const catalog: Array<{ name: string; category: FurnitureItem['category']; width: number; depth: number; color: string }> = [
    { name: 'Sectional L-Sofa', category: 'living', width: 9.5, depth: 7, color: '#475569' },
    { name: '3-Seater Sofa', category: 'living', width: 7, depth: 3.2, color: '#64748b' },
    { name: 'Coffee Table', category: 'living', width: 4, depth: 2.5, color: '#94a3b8' },
    { name: 'Accent Armchair', category: 'living', width: 3, depth: 3, color: '#334155' },
    { name: 'King Size Bed', category: 'bedroom', width: 6.5, depth: 7, color: '#6366f1' },
    { name: 'Queen Size Bed', category: 'bedroom', width: 5.5, depth: 6.5, color: '#818cf8' },
    { name: 'Bedside Nightstand', category: 'bedroom', width: 2, depth: 1.8, color: '#475569' },
    { name: '6-Person Dining Table', category: 'dining', width: 6.5, depth: 3.5, color: '#78350f' },
    { name: '8-Person Dining Set', category: 'dining', width: 8.5, depth: 4, color: '#92400e' },
    { name: 'Kitchen Prep Island', category: 'kitchen', width: 8, depth: 3.5, color: '#e2e8f0' },
    { name: 'Executive Desk', category: 'office', width: 5.5, depth: 2.8, color: '#334155' },
    { name: 'Bookshelf Unit', category: 'office', width: 4.5, depth: 1.2, color: '#64748b' },
  ];

  const filteredCatalog = activeCategory === 'all' 
    ? catalog 
    : catalog.filter(item => item.category === activeCategory);

  const handleAddFurniture = (item: { name: string; category: FurnitureItem['category']; width: number; depth: number; color: string }) => {
    // Center in primary room
    const targetRoom = project.rooms[0] || { x: 10, y: 10, width: 20, height: 20 };
    const newItem: FurnitureItem = {
      id: `f-${Date.now()}`,
      name: item.name,
      category: item.category,
      x: targetRoom.x + targetRoom.width / 2,
      y: targetRoom.y + targetRoom.height / 2,
      width: item.width,
      depth: item.depth,
      rotation: 0,
      color: item.color
    };

    onUpdateProject({
      ...project,
      furniture: [...project.furniture, newItem]
    });
  };

  const handleAddCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customName.trim()) return;

    handleAddFurniture({
      name: customName.trim(),
      category: customCategory,
      width: Number(customWidth),
      depth: Number(customDepth),
      color: '#0284c7'
    });

    setCustomName('');
  };

  return (
    <div className="w-80 h-full flex flex-col bg-slate-900 border-r border-slate-800 text-xs">
      <div className="p-4 border-b border-slate-800">
        <h3 className="font-semibold text-slate-200 text-sm flex items-center gap-1.5">
          <Armchair className="w-4 h-4 text-blue-400" />
          <span>Bring Your Own Furniture</span>
        </h3>
        <p className="text-[11px] text-slate-400 mt-1">
          Place real-world catalog pieces or enter exact measurements of your existing furniture.
        </p>
      </div>

      {/* Category Tabs */}
      <div className="flex border-b border-slate-800 px-2 py-1.5 overflow-x-auto gap-1">
        {(['all', 'living', 'bedroom', 'dining', 'kitchen', 'office'] as const).map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-2.5 py-1 rounded-md text-[11px] font-medium capitalize transition whitespace-nowrap ${
              activeCategory === cat ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Catalog Grid */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        <div className="grid grid-cols-1 gap-2">
          {filteredCatalog.map((item, i) => (
            <div
              key={i}
              className="group p-2.5 bg-slate-950/70 border border-slate-800/80 hover:border-blue-500/60 rounded-xl flex items-center justify-between transition cursor-pointer"
              onClick={() => handleAddFurniture(item)}
            >
              <div>
                <h5 className="font-medium text-slate-200 group-hover:text-blue-400 transition">{item.name}</h5>
                <span className="text-[10px] text-slate-500 font-mono">
                  {item.width}' × {item.depth}' ({Math.round(item.width * 12)}" × {Math.round(item.depth * 12)}")
                </span>
              </div>
              <button 
                className="p-1.5 bg-slate-800 group-hover:bg-blue-600 text-slate-300 group-hover:text-white rounded-lg transition"
                title="Add to Canvas"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Custom Item Dimension Form */}
      <div className="p-3 border-t border-slate-800 bg-slate-950/80">
        <h5 className="font-semibold text-slate-300 text-[11px] mb-2 flex items-center gap-1">
          <Plus className="w-3.5 h-3.5 text-blue-400" />
          <span>Add Your Custom Sized Piece</span>
        </h5>
        <form onSubmit={handleAddCustom} className="space-y-2">
          <input
            type="text"
            required
            placeholder="e.g. My Velvet Ottoman"
            value={customName}
            onChange={(e) => setCustomName(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500"
          />
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] text-slate-400 block mb-0.5">Width ({unit === 'metric' ? 'm' : 'ft'})</label>
              <input
                type="number"
                step="0.5"
                min="1"
                max="30"
                value={customWidth}
                onChange={(e) => setCustomWidth(parseFloat(e.target.value) || 1)}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2 py-1 text-xs text-slate-200 font-mono"
              />
            </div>
            <div>
              <label className="text-[10px] text-slate-400 block mb-0.5">Depth ({unit === 'metric' ? 'm' : 'ft'})</label>
              <input
                type="number"
                step="0.5"
                min="1"
                max="30"
                value={customDepth}
                onChange={(e) => setCustomDepth(parseFloat(e.target.value) || 1)}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2 py-1 text-xs text-slate-200 font-mono"
              />
            </div>
          </div>
          <button
            type="submit"
            className="w-full bg-slate-800 hover:bg-blue-600 text-slate-200 hover:text-white py-1.5 rounded-lg text-xs font-medium transition"
          >
            Insert onto Plan
          </button>
        </form>
      </div>
    </div>
  );
};
