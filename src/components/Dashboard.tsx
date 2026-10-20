/* Hallmark · macrostructure: Workbench · theme: Charcoal-Silver-SignalRed · tone: architectural-stationery */
import React, { useState } from 'react';
import { Project } from '../types';
import { designService, ArchitecturalPlanConstraints } from '../services/designService';
import { 
  Plus, Sparkles, Pencil, UploadCloud, Compass, 
  Clock, ArrowRight, Grid, Box, Trash2, Search, SlidersHorizontal, Loader2, Award,
  Layers, CheckCircle2
} from 'lucide-react';

interface DashboardProps {
  projects: Project[];
  onSelectProject: (project: Project) => void;
  onCreateProject: (project: Project) => void;
  onDeleteProject: (id: string) => void;
  onOpenDigitizer: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  projects,
  onSelectProject,
  onCreateProject,
  onDeleteProject,
  onOpenDigitizer
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'prompt' | 'scratch'>('prompt');
  const [searchQuery, setSearchQuery] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  // Generation parameters
  const [promptText, setPromptText] = useState('4 bedrooms, 3 bathrooms, open great room, chef kitchen island, upper master balcony');
  const [params, setParams] = useState<ArchitecturalPlanConstraints>({
    sqft: 2850,
    floors: 2,
    bedrooms: 4,
    bathrooms: 3,
    style: 'Tamil Nadu Contemporary',
    luxuryTier: 'Premium'
  });

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const generated = await designService.generateArchitecturalPlan(promptText, params);
      onCreateProject(generated);
      setIsModalOpen(false);
    } catch (err) {
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleStartBlank = () => {
    const blankProj = designService.buildEngineeredMultiFloorPlan('Custom Blueprint from Scratch', {
      sqft: params.sqft,
      floors: params.floors,
      bedrooms: params.bedrooms,
      bathrooms: params.bathrooms,
      style: params.style,
      luxuryTier: 'Standard'
    });

    onCreateProject(blankProj);
    setIsModalOpen(false);
  };

  const filteredProjects = projects.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.style.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="w-full h-full overflow-y-auto bg-[var(--color-paper)] text-[var(--color-ink)] p-4 sm:p-6 md:p-8 select-none font-sans">
      <div className="max-w-7xl mx-auto space-y-5 sm:space-y-6">
        
        {/* Architectural Workbench Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[var(--color-rule)] pb-5">
          <div>
            <div className="text-[11px] font-mono text-[#dc2626] font-bold tracking-wider">PROJECT REPOSITORY // ARCHITECTURAL INDEX</div>
            <h1 className="text-xl sm:text-2xl font-bold text-[var(--color-ink)] tracking-tight mt-0.5 flex items-center gap-2.5 font-display">
              <span>Architectural Workspace</span>
              <span className="text-xs bg-[#dc2626]/10 text-[#dc2626] font-mono px-2 py-0.5 rounded border border-[#dc2626]/30 font-semibold">
                {projects.length} Blueprints
              </span>
            </h1>
            <p className="text-xs text-[var(--color-muted)] mt-1 font-mono">
              2D CAD vector layouts, TNCDBR-2019 compliance audits, and spatial 3D WebGL synthesis.
            </p>
          </div>

          <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 font-mono">
            <button
              onClick={onOpenDigitizer}
              className="flex-1 sm:flex-none justify-center px-3.5 py-2 bg-[var(--color-paper-2)] hover:bg-[var(--color-paper-3)] text-[var(--color-ink)] border border-[var(--color-rule)] rounded text-xs font-semibold flex items-center gap-2 transition cursor-pointer"
            >
              <UploadCloud className="w-4 h-4 text-[#dc2626]" />
              <span>DIGITIZE PLAN</span>
            </button>

            <button
              onClick={() => { setIsModalOpen(true); setModalMode('prompt'); }}
              className="flex-1 sm:flex-none justify-center px-4 py-2 bg-[#dc2626] hover:bg-[#b91c1c] text-white rounded text-xs font-semibold flex items-center gap-2 transition cursor-pointer shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>NEW BLUEPRINT</span>
            </button>
          </div>
        </div>

        {/* Search & Telemetry Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4">
          <div className="relative flex-1 max-w-full sm:max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-muted)]" />
            <input
              type="text"
              placeholder="Search blueprints by title, style, or room program..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[var(--color-paper-2)] border border-[var(--color-rule)] rounded pl-9 pr-3 py-1.5 text-xs text-[var(--color-ink)] font-mono placeholder-[var(--color-muted)] focus:outline-none focus:border-[#dc2626] transition"
            />
          </div>
          <div className="text-[11px] font-mono text-[var(--color-muted)] hidden sm:block">
            ACTIVE STANDARD: <span className="text-[var(--color-ink)] font-semibold">TNCDBR-2019 / IS 456</span>
          </div>
        </div>

        {/* Project Grid (Swiss Cells with Ruler Dividers) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredProjects.map(project => (
            <div
              key={project.id}
              onClick={() => onSelectProject(project)}
              className="group relative bg-[var(--color-paper-2)] hover:bg-[var(--color-paper-3)] border border-[var(--color-rule)] hover:border-[#dc2626] rounded-md overflow-hidden transition cursor-pointer flex flex-col justify-between shadow-sm"
            >
              {/* Preview Canvas Miniature */}
              <div className="h-44 bg-[var(--color-paper)] p-4 relative overflow-hidden flex items-center justify-center border-b border-[var(--color-rule)] cad-grid">
                {/* Structural Miniature Layout */}
                <div className="relative z-10 w-44 h-32 border border-[#dc2626]/60 rounded bg-[var(--color-paper-2)] p-1.5 flex flex-wrap gap-1 items-center justify-center">
                  {project.rooms.slice(0, 4).map((r, i) => (
                    <div 
                      key={i} 
                      className="rounded text-[8px] font-mono text-center flex items-center justify-center p-1 border border-[#dc2626]/30 text-[#0f172a] bg-[#dc2626]/10 font-semibold"
                      style={{ 
                        width: `${Math.min(r.width * 3.5, 75)}px`, 
                        height: `${Math.min(r.height * 3.5, 50)}px`
                      }}
                    >
                      {r.name.split(' ')[0]}
                    </div>
                  ))}
                </div>

                <div className="absolute bottom-2 left-3 right-3 flex items-center justify-between text-[10px] text-[var(--color-muted)] font-mono">
                  <span>{project.rooms.length} ROOMS · {project.floors || 2}F</span>
                  <span className="font-semibold text-[#dc2626]">{project.sqft} SQ FT</span>
                </div>
              </div>

              {/* Card Footer Details */}
              <div className="p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-bold text-[var(--color-ink)] text-sm group-hover:text-[#dc2626] transition font-display">{project.name}</h3>
                    <p className="text-xs text-[var(--color-ink-2)] line-clamp-1 mt-0.5 font-sans">{project.description}</p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteProject(project.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-red-50 text-[var(--color-muted)] hover:text-[#dc2626] rounded transition"
                    title="Delete blueprint"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-[var(--color-rule)] text-[11px] font-mono">
                  <span className="text-[var(--color-muted)] flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {project.updatedAt}
                  </span>
                  <span className="text-[#dc2626] font-semibold group-hover:translate-x-0.5 transition flex items-center gap-1">
                    OPEN CAD STUDIO
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Creation Modal (Swiss Ruled Workbench) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-[var(--color-paper)] border border-[var(--color-rule)] rounded-md p-4 sm:p-6 space-y-4 sm:space-y-5 font-mono shadow-2xl text-[var(--color-ink)]">
            <div className="flex items-center justify-between border-b border-[var(--color-rule)] pb-3">
              <div>
                <div className="text-[10px] text-[#dc2626] uppercase tracking-wider font-bold">PROJECT INITIATION // BLUEPRINT ENGINE</div>
                <h3 className="text-base font-bold text-[var(--color-ink)] font-display">Create Architectural Project</h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-[var(--color-muted)] hover:text-[var(--color-ink)] px-2 py-1 text-sm rounded hover:bg-[var(--color-paper-2)] cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Selection Archetypes */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button
                onClick={() => setModalMode('prompt')}
                className={`p-3 rounded border text-left transition flex flex-col justify-between ${
                  modalMode === 'prompt' 
                    ? 'bg-red-50/80 border-[#dc2626] text-[var(--color-ink)]' 
                    : 'bg-[var(--color-paper-2)] border-[var(--color-rule)] text-[var(--color-muted)] hover:border-[var(--color-rule-2)]'
                }`}
              >
                <Sparkles className="w-4 h-4 text-[#dc2626] mb-2" />
                <div>
                  <h4 className="font-bold text-xs text-[var(--color-ink)]">Neural Synthesis</h4>
                  <p className="text-[10px] text-[var(--color-muted)] font-sans mt-0.5">Prompt-driven layout with automated wall placement</p>
                </div>
              </button>

              <button
                onClick={handleStartBlank}
                className="p-3 rounded border border-[var(--color-rule)] bg-[var(--color-paper-2)] hover:border-[var(--color-rule-2)] text-left transition flex flex-col justify-between text-[var(--color-muted)]"
              >
                <Pencil className="w-4 h-4 text-[#0f172a] mb-2" />
                <div>
                  <h4 className="font-bold text-xs text-[var(--color-ink)]">Manual CAD Draft</h4>
                  <p className="text-[10px] text-[var(--color-muted)] font-sans mt-0.5">Start with a blank grid and draw walls with snap</p>
                </div>
              </button>

              <button
                onClick={() => { setIsModalOpen(false); onOpenDigitizer(); }}
                className="p-3 rounded border border-[var(--color-rule)] bg-[var(--color-paper-2)] hover:border-[var(--color-rule-2)] text-left transition flex flex-col justify-between text-[var(--color-muted)]"
              >
                <UploadCloud className="w-4 h-4 text-[#dc2626] mb-2" />
                <div>
                  <h4 className="font-bold text-xs text-[var(--color-ink)]">DeepSeek Digitizer</h4>
                  <p className="text-[10px] text-[var(--color-muted)] font-sans mt-0.5">Vectorize PDF blueprint or raster hand-sketch</p>
                </div>
              </button>
            </div>

            {/* Prompt Mode Fields */}
            {modalMode === 'prompt' && (
              <div className="space-y-4 pt-1">
                <div>
                  <label className="text-[11px] text-[var(--color-ink)] block mb-1 font-bold">ARCHITECTURAL BRIEF // ROOM REQUIREMENTS</label>
                  <textarea
                    rows={3}
                    value={promptText}
                    onChange={(e) => setPromptText(e.target.value)}
                    placeholder="e.g. 2,400 sq ft, 3 bedrooms, 2 bathrooms, open kitchen, 2 floors..."
                    className="w-full bg-[var(--color-paper-2)] border border-[var(--color-rule)] rounded p-2.5 text-xs text-[var(--color-ink)] placeholder-[var(--color-muted)] focus:outline-none focus:border-[#dc2626] font-mono transition resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div>
                    <label className="text-[10px] text-[var(--color-muted)] block mb-1">PLOT / BUILT-UP (SQ FT)</label>
                    <input
                      type="number"
                      value={params.sqft}
                      onChange={(e) => setParams({ ...params, sqft: Number(e.target.value) })}
                      className="w-full bg-[var(--color-paper-2)] border border-[var(--color-rule)] rounded px-2.5 py-1.5 text-xs text-[var(--color-ink)] font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-[var(--color-muted)] block mb-1">FLOOR COUNT</label>
                    <select
                      value={params.floors}
                      onChange={(e) => setParams({ ...params, floors: Number(e.target.value) })}
                      className="w-full bg-[var(--color-paper-2)] border border-[var(--color-rule)] rounded px-2.5 py-1.5 text-xs text-[var(--color-ink)] font-mono"
                    >
                      <option value={1}>1 Floor (Ground)</option>
                      <option value={2}>2 Floors (G+1 Duplex)</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] text-[var(--color-muted)] block mb-1">BEDROOMS</label>
                    <select
                      value={params.bedrooms}
                      onChange={(e) => setParams({ ...params, bedrooms: Number(e.target.value) })}
                      className="w-full bg-[var(--color-paper-2)] border border-[var(--color-rule)] rounded px-2.5 py-1.5 text-xs text-[var(--color-ink)] font-mono"
                    >
                      <option value={1}>1 Bed</option>
                      <option value={2}>2 Beds</option>
                      <option value={3}>3 Beds</option>
                      <option value={4}>4 Beds</option>
                      <option value={5}>5+ Beds</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] text-[var(--color-muted)] block mb-1">BATHROOMS</label>
                    <select
                      value={params.bathrooms}
                      onChange={(e) => setParams({ ...params, bathrooms: Number(e.target.value) })}
                      className="w-full bg-[var(--color-paper-2)] border border-[var(--color-rule)] rounded px-2.5 py-1.5 text-xs text-[var(--color-ink)] font-mono"
                    >
                      <option value={1}>1 Bath</option>
                      <option value={2}>2 Baths</option>
                      <option value={3}>3 Baths</option>
                      <option value={4}>4 Baths</option>
                    </select>
                  </div>
                </div>

                <div className="pt-3 border-t border-[var(--color-rule)] flex justify-end space-x-2">
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="px-3 py-1.5 text-[var(--color-muted)] hover:text-[var(--color-ink)] text-xs font-mono transition"
                  >
                    CANCEL
                  </button>
                  <button
                    disabled={isGenerating}
                    onClick={handleGenerate}
                    className="bg-[#dc2626] hover:bg-[#b91c1c] disabled:opacity-50 text-white px-4 py-1.5 rounded text-xs font-mono font-semibold flex items-center gap-2 transition cursor-pointer shadow-sm"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>SYNTHESIZING CAD BLUEPRINT...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>GENERATE BLUEPRINT</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
