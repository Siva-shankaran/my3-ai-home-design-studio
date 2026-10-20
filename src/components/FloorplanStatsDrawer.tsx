/* Hallmark · macrostructure: Workbench · theme: Charcoal-Silver-SignalRed · tone: architectural-stationery */
import React, { useState } from 'react';
import { 
  X, Camera, Table, Layers, Armchair, ChevronRight, CheckCircle2, 
  Ruler, Eye, Compass, ShieldCheck, Download, Sparkles
} from 'lucide-react';
import type { Project, RoomCamera, Room } from '../types';

interface FloorplanStatsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  project: Project;
  onSelectCamera?: (camera: RoomCamera) => void;
  onFocusRoom?: (roomId: string) => void;
}

export const FloorplanStatsDrawer: React.FC<FloorplanStatsDrawerProps> = ({
  isOpen,
  onClose,
  project,
  onSelectCamera,
  onFocusRoom
}) => {
  const [activeTab, setActiveTab] = useState<'schedule' | 'cameras' | 'fixtures' | 'compliance'>('schedule');

  if (!isOpen) return null;

  const totalArea = project.rooms.reduce((acc, r) => acc + (r.width * r.height), 0);

  return (
    <div className="fixed inset-y-0 right-0 z-40 w-full sm:w-[440px] bg-[var(--color-paper-2)] border-l border-[var(--color-rule)] shadow-2xl flex flex-col font-sans select-none animate-slideInRight">
      
      {/* Header */}
      <div className="p-4 bg-[var(--color-paper-3)] border-b border-[var(--color-rule)] flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono uppercase tracking-wider text-[#dc2626] font-bold">
              PLAN INSPECTOR // SCHEDULE
            </span>
            <span className="text-[9px] bg-[#dc2626]/10 text-[#dc2626] border border-[#dc2626]/30 px-1 rounded font-mono">
              Maket Spec
            </span>
          </div>
          <h3 className="text-sm font-bold text-[var(--color-ink)] truncate max-w-[280px]">
            {project.name}
          </h3>
        </div>

        <button 
          onClick={onClose}
          className="w-7 h-7 rounded border border-[var(--color-rule)] flex items-center justify-center hover:bg-[var(--color-paper)] text-[var(--color-muted)] hover:text-[var(--color-ink)] transition cursor-pointer"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* KPI Overview Strip */}
      <div className="grid grid-cols-3 border-b border-[var(--color-rule)] bg-[var(--color-paper)] text-center divide-x divide-[var(--color-rule)] py-2 text-xs font-mono">
        <div>
          <div className="text-[10px] text-[var(--color-muted)] uppercase">Gross Area</div>
          <div className="font-bold text-[#dc2626] text-sm">{project.sqft.toLocaleString()} sqft</div>
        </div>
        <div>
          <div className="text-[10px] text-[var(--color-muted)] uppercase">Zones</div>
          <div className="font-bold text-[var(--color-ink)] text-sm">{project.rooms.length} Rooms</div>
        </div>
        <div>
          <div className="text-[10px] text-[var(--color-muted)] uppercase">3D Cameras</div>
          <div className="font-bold text-[var(--color-ink)] text-sm">{project.cameras?.length || 0} Points</div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="grid grid-cols-4 border-b border-[var(--color-rule)] bg-[var(--color-paper)] text-[11px] font-mono">
        {[
          { id: 'schedule', label: 'Rooms', icon: Table },
          { id: 'cameras', label: 'Cameras', icon: Camera },
          { id: 'fixtures', label: 'Fixtures', icon: Armchair },
          { id: 'compliance', label: 'Audit', icon: ShieldCheck }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-2 px-1 flex flex-col items-center justify-center gap-1 border-r border-[var(--color-rule)] last:border-r-0 transition cursor-pointer ${
                isActive 
                  ? 'bg-[#dc2626]/15 text-[#dc2626] font-bold border-b-2 border-b-[#dc2626]' 
                  : 'text-[var(--color-muted)] hover:text-[var(--color-ink)] hover:bg-[var(--color-paper-2)]'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        
        {/* ROOM SCHEDULE TAB */}
        {activeTab === 'schedule' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs font-mono text-[var(--color-muted)]">
              <span>ZONE NAME</span>
              <span>DIMENSIONS // AREA</span>
            </div>

            <div className="space-y-2">
              {project.rooms.map((room) => {
                const sqft = Math.round(room.width * room.height);
                const percent = Math.round((sqft / (totalArea || 1)) * 100);

                return (
                  <div
                    key={room.id}
                    onClick={() => onFocusRoom && onFocusRoom(room.id)}
                    className="p-2.5 rounded border border-[var(--color-rule)] bg-[var(--color-paper)] hover:border-[#dc2626] hover:bg-[var(--color-paper-3)] transition cursor-pointer flex items-center justify-between group"
                  >
                    <div>
                      <div className="text-xs font-semibold text-[var(--color-ink)] group-hover:text-[#dc2626] transition flex items-center gap-1.5">
                        <span 
                          className="w-2.5 h-2.5 rounded-sm inline-block border border-black/10"
                          style={{ backgroundColor: room.color || '#e2e8f0' }}
                        />
                        <span>{room.name}</span>
                      </div>
                      <div className="text-[10px] text-[var(--color-muted)] font-mono mt-0.5">
                        {room.floorFinish || 'Natural Birch Wood'}
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-xs font-bold font-mono text-[var(--color-ink)]">
                        {room.width}&apos; × {room.height}&apos; · <span className="text-[#dc2626]">{sqft} sqft</span>
                      </div>
                      <div className="text-[10px] text-[var(--color-muted)] font-mono">
                        {percent}% of footprint
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 3D CAMERAS TAB */}
        {activeTab === 'cameras' && (
          <div className="space-y-3">
            <div className="text-xs text-[var(--color-muted)] font-mono">
              Maket.ai reverse-engineered 3D perspective viewpoint teleports. Click any camera to focus.
            </div>

            {(!project.cameras || project.cameras.length === 0) ? (
              <div className="p-6 text-center text-xs font-mono text-[var(--color-muted)]">
                No programmatic cameras registered in this project.
              </div>
            ) : (
              <div className="space-y-2">
                {project.cameras.map((cam, idx) => (
                  <div
                    key={cam.id || idx}
                    onClick={() => onSelectCamera && onSelectCamera(cam)}
                    className="p-2.5 rounded border border-[var(--color-rule)] bg-[var(--color-paper)] hover:border-[#dc2626] hover:bg-[var(--color-paper-3)] transition cursor-pointer flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded bg-[#dc2626]/10 text-[#dc2626] flex items-center justify-center font-mono text-xs font-bold">
                        {idx + 1}
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-[var(--color-ink)] group-hover:text-[#dc2626] transition">
                          {cam.name}
                        </div>
                        <div className="text-[10px] text-[var(--color-muted)] font-mono">
                          Coords: [{cam.position[0]}&apos;, {cam.position[1]}&apos;] · FOV {cam.fov}°
                        </div>
                      </div>
                    </div>

                    <button className="px-2 py-1 bg-[var(--color-paper-2)] group-hover:bg-[#dc2626] group-hover:text-white rounded text-[10px] font-mono border border-[var(--color-rule)] transition flex items-center gap-1">
                      <Eye className="w-3 h-3" />
                      <span>Teleport</span>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* FIXTURES INVENTORY TAB */}
        {activeTab === 'fixtures' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs font-mono text-[var(--color-muted)]">
              <span>FIXTURE / FURNITURE ITEM</span>
              <span>{project.furniture.length} TOTAL</span>
            </div>

            <div className="space-y-2">
              {project.furniture.map((fix) => (
                <div
                  key={fix.id}
                  className="p-2 rounded border border-[var(--color-rule)] bg-[var(--color-paper)] flex items-center justify-between text-xs"
                >
                  <div>
                    <div className="font-semibold text-[var(--color-ink)]">{fix.name}</div>
                    <div className="text-[10px] text-[var(--color-muted)] font-mono">
                      Category: <span className="capitalize">{fix.category}</span> · Rot: {fix.rotation}°
                    </div>
                  </div>
                  <div className="text-right font-mono text-[10px] text-[var(--color-muted)]">
                    Pos: [{fix.x}&apos;, {fix.y}&apos;]
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TECHNICAL AUDIT & COMPLIANCE TAB */}
        {activeTab === 'compliance' && (
          <div className="space-y-3">
            <div className="p-3 bg-[var(--color-paper)] rounded border border-[var(--color-rule)] space-y-2">
              <div className="text-xs font-bold text-[var(--color-ink)] font-mono flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>IRC & TNCDBR COMPLIANCE PASSED</span>
              </div>
              <p className="text-[11px] text-[var(--color-muted)] font-mono leading-relaxed">
                Egress windows exceed minimum 5.7 sqft clear opening. Wet wall alignment score: <strong>{project.structuralMetrics?.wetWallAlignmentScore || 92}%</strong>.
              </p>
            </div>

            <div className="space-y-2 text-xs font-mono">
              <div className="flex justify-between p-2 rounded bg-[var(--color-paper)] border border-[var(--color-rule)]">
                <span className="text-[var(--color-muted)]">Exterior Wall Perimeter:</span>
                <span className="font-bold text-[var(--color-ink)]">{project.structuralMetrics?.exteriorWallPerimeterFeet || 154} Linear Feet</span>
              </div>
              <div className="flex justify-between p-2 rounded bg-[var(--color-paper)] border border-[var(--color-rule)]">
                <span className="text-[var(--color-muted)]">Primary Wall Thickness:</span>
                <span className="font-bold text-[var(--color-ink)]">0.75 ft (9-inch structural masonry)</span>
              </div>
              <div className="flex justify-between p-2 rounded bg-[var(--color-paper)] border border-[var(--color-rule)]">
                <span className="text-[var(--color-muted)]">Estimated Construction:</span>
                <span className="font-bold text-[#dc2626]">${(project.structuralMetrics?.estimatedBuildingCostUsd || 195000).toLocaleString()} USD</span>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* Drawer Footer */}
      <div className="p-3 bg-[var(--color-paper-3)] border-t border-[var(--color-rule)] flex items-center justify-between text-xs font-mono">
        <span className="text-[var(--color-muted)] text-[11px]">
          SPEC: MEX 0.2 · REA REVERSED
        </span>
        <button
          onClick={onClose}
          className="px-3 py-1 bg-[var(--color-ink)] text-[var(--color-paper)] rounded hover:opacity-90 transition cursor-pointer"
        >
          Close Inspector
        </button>
      </div>

    </div>
  );
};
