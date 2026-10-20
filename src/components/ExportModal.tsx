import React, { useState } from 'react';
import type { Project } from '../types';
import type { Language } from '../services/i18n';
import { exportService } from '../services/exportService';
import { 
  X, Download, FileText, Compass, Image as ImageIcon, 
  Check, Copy, Share2, Layers, Award, Printer, Sparkles
} from 'lucide-react';

interface ExportModalProps {
  project: Project;
  isOpen: boolean;
  onClose: () => void;
  language?: Language;
  unit?: 'imperial' | 'metric';
}

export const ExportModal: React.FC<ExportModalProps> = ({ 
  project, 
  isOpen, 
  onClose,
  language = 'en',
  unit = 'imperial'
}) => {
  const [copied, setCopied] = useState(false);
  const [isExporting, setIsExporting] = useState<string | null>(null);

  if (!isOpen) return null;

  // 1. Professional Architectural Sheet PDF Export
  const handleExportPdf = () => {
    setIsExporting('pdf');
    try {
      exportService.generateArchitecturalPdf(project, { language, unit });
    } catch (err) {
      console.error('PDF Export Error:', err);
    } finally {
      setTimeout(() => setIsExporting(null), 1000);
    }
  };

  // 2. Vector CAD SVG Export
  const handleExportSvg = () => {
    setIsExporting('svg');
    try {
      exportService.downloadSvg(project, { language, unit, showColumns: true });
    } catch (err) {
      console.error('SVG Export Error:', err);
    } finally {
      setTimeout(() => setIsExporting(null), 1000);
    }
  };

  // 3. 300 DPI High-Resolution PNG Render
  const handleExportPng = async () => {
    setIsExporting('png');
    try {
      await exportService.downloadHighResPng(project, 1, { language, unit });
    } catch (err) {
      console.error('PNG Export Error:', err);
    } finally {
      setTimeout(() => setIsExporting(null), 1000);
    }
  };

  // 4. Generates AutoCAD compatible DXF ASCII format
  const exportDXF = () => {
    setIsExporting('dxf');
    let dxf = "0\nSECTION\n2\nHEADER\n0\nENDSEC\n0\nSECTION\n2\nENTITIES\n";

    project.rooms.forEach(r => {
      const x1 = r.x * 12; // inches
      const y1 = r.y * 12;
      const x2 = (r.x + r.width) * 12;
      const y2 = (r.y + r.height) * 12;

      // 4 perimeter lines for DXF
      dxf += `0\nLINE\n8\nWALLS\n10\n${x1}\n20\n${y1}\n30\n0.0\n11\n${x2}\n21\n${y1}\n31\n0.0\n`;
      dxf += `0\nLINE\n8\nWALLS\n10\n${x2}\n20\n${y1}\n30\n0.0\n11\n${x2}\n21\n${y2}\n31\n0.0\n`;
      dxf += `0\nLINE\n8\nWALLS\n10\n${x2}\n20\n${y2}\n30\n0.0\n11\n${x1}\n21\n${y2}\n31\n0.0\n`;
      dxf += `0\nLINE\n8\nWALLS\n10\n${x1}\n20\n${y2}\n30\n0.0\n11\n${x1}\n21\n${y1}\n31\n0.0\n`;

      // Room Text entity
      const cx = (x1 + x2) / 2;
      const cy = (y1 + y2) / 2;
      dxf += `0\nTEXT\n8\nLABELS\n10\n${cx}\n20\n${cy}\n30\n0.0\n40\n14.0\n1\n${r.name}\n`;
    });

    dxf += "0\nENDSEC\n0\nEOF\n";

    const blob = new Blob([dxf], { type: 'application/dxf' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${project.name.replace(/\s+/g, '_')}_CAD.dxf`;
    a.click();
    URL.revokeObjectURL(url);
    setTimeout(() => setIsExporting(null), 800);
  };

  const exportJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(project, null, 2));
    const dlAnchorElem = document.createElement('a');
    dlAnchorElem.setAttribute("href", dataStr);
    dlAnchorElem.setAttribute("download", `${project.name.replace(/\s+/g, '_')}_MY3_Model.json`);
    dlAnchorElem.click();
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-[var(--color-paper)] border border-[var(--color-rule)] rounded-2xl p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto text-[var(--color-ink)] font-sans">
        <div className="flex items-center justify-between border-b border-[var(--color-rule)] pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-[#dc2626]/10 text-[#dc2626] rounded-xl border border-[#dc2626]/20">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-[var(--color-ink)] flex items-center gap-2 font-display">
                <span>Export & Professional Deliverables</span>
                <span className="text-[10px] bg-[#dc2626]/10 text-[#dc2626] px-2 py-0.5 rounded font-mono font-bold border border-[#dc2626]/30">
                  TNCDBR / IS 962
                </span>
              </h3>
              <p className="text-xs text-[var(--color-muted)] font-mono mt-0.5">
                {language === 'ta' 
                  ? 'கட்டிட வரைபடம், PDF வரைபட தாள், வெக்டர் CAD மற்றும் உயர் படங்களை தரவிறக்கம் செய்யுங்கள்'
                  : 'Download submission-ready architectural sheets, vector drawings, and presentation renders'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-[var(--color-muted)] hover:text-[var(--color-ink)] hover:bg-[var(--color-paper-2)] rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {/* 1. Architectural Sheet PDF Export (FLAGSHIP) */}
          <div 
            onClick={handleExportPdf}
            className="p-4 bg-[var(--color-paper-2)] hover:bg-[var(--color-paper-3)] border-2 border-[#dc2626] rounded-xl flex flex-col justify-between cursor-pointer transition group shadow-sm relative overflow-hidden"
          >
            <div className="absolute top-2 right-2 flex items-center gap-1 bg-[#dc2626] text-white text-[9px] font-mono font-bold px-2 py-0.5 rounded uppercase tracking-wider shadow">
              <Award className="w-3 h-3" />
              <span>Recommended</span>
            </div>
            <div>
              <div className="flex items-center space-x-3 mb-2">
                <div className="p-2.5 bg-[#dc2626] text-white rounded-lg shadow-sm group-hover:scale-105 transition">
                  <Printer className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-[var(--color-ink)] text-sm group-hover:text-[#dc2626] transition font-display">
                    Architectural Sheet (PDF)
                  </h4>
                  <span className="text-[10px] text-[#dc2626] font-mono font-medium">A3 Landscape Drawing</span>
                </div>
              </div>
              <p className="text-xs text-[var(--color-ink-2)] line-clamp-2">
                Official layout with border, title block, room schedule, RCC column chart, and engineer stamp.
              </p>
            </div>
            <div className="mt-3 pt-2.5 border-t border-[var(--color-rule)] flex items-center justify-between">
              <span className="text-[11px] font-mono text-[var(--color-muted)]">Municipal & Client Ready</span>
              <span className="text-xs font-mono font-bold text-white bg-[#dc2626] hover:bg-[#b91c1c] px-2.5 py-1 rounded border border-[#dc2626] flex items-center gap-1 shadow-xs">
                {isExporting === 'pdf' ? <Sparkles className="w-3 h-3 animate-spin" /> : <Download className="w-3 h-3" />}
                .PDF
              </span>
            </div>
          </div>

          {/* 2. Scalable Vector Graphics (SVG) */}
          <div 
            onClick={handleExportSvg}
            className="p-4 bg-[var(--color-paper-2)] hover:bg-[var(--color-paper-3)] border border-[var(--color-rule)] hover:border-[#dc2626] rounded-xl flex flex-col justify-between cursor-pointer transition group"
          >
            <div>
              <div className="flex items-center space-x-3 mb-2">
                <div className="p-2.5 bg-[var(--color-paper)] text-[var(--color-ink)] rounded-lg border border-[var(--color-rule)] group-hover:scale-105 transition">
                  <Layers className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-[var(--color-ink)] text-sm group-hover:text-[#dc2626] transition font-display">
                    Scalable Vector Drawing (SVG)
                  </h4>
                  <span className="text-[10px] text-[var(--color-muted)] font-mono">Layered Vector Elements</span>
                </div>
              </div>
              <p className="text-xs text-[var(--color-ink-2)]">
                Layered vector geometry with separate walls, doors, furniture, columns, and dimensions.
              </p>
            </div>
            <div className="mt-3 pt-2.5 border-t border-[var(--color-rule)] flex items-center justify-between">
              <span className="text-[11px] font-mono text-[var(--color-muted)]">Illustrator / Inkscape</span>
              <span className="text-xs font-mono font-semibold text-[var(--color-ink)] group-hover:text-white group-hover:bg-[#0f172a] bg-[var(--color-paper)] px-2.5 py-1 rounded border border-[var(--color-rule)] flex items-center gap-1 transition">
                {isExporting === 'svg' ? <Sparkles className="w-3 h-3 animate-spin" /> : <Download className="w-3 h-3" />}
                .SVG
              </span>
            </div>
          </div>

          {/* 3. 300 DPI High-Resolution PNG */}
          <div 
            onClick={handleExportPng}
            className="p-4 bg-[var(--color-paper-2)] hover:bg-[var(--color-paper-3)] border border-[var(--color-rule)] hover:border-[#dc2626] rounded-xl flex flex-col justify-between cursor-pointer transition group"
          >
            <div>
              <div className="flex items-center space-x-3 mb-2">
                <div className="p-2.5 bg-[var(--color-paper)] text-[var(--color-ink)] rounded-lg border border-[var(--color-rule)] group-hover:scale-105 transition">
                  <ImageIcon className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-[var(--color-ink)] text-sm group-hover:text-[#dc2626] transition font-display">
                    300 DPI Ultra-HD Render (PNG)
                  </h4>
                  <span className="text-[10px] text-[var(--color-muted)] font-mono">3600 x 2400 Resolution</span>
                </div>
              </div>
              <p className="text-xs text-[var(--color-ink-2)]">
                Lossless presentation image with realistic wood plank textures, tile patterns, and drawing sheet borders.
              </p>
            </div>
            <div className="mt-3 pt-2.5 border-t border-[var(--color-rule)] flex items-center justify-between">
              <span className="text-[11px] font-mono text-[var(--color-muted)]">High-Res Print & Portfolio</span>
              <span className="text-xs font-mono font-semibold text-[var(--color-ink)] group-hover:text-white group-hover:bg-[#0f172a] bg-[var(--color-paper)] px-2.5 py-1 rounded border border-[var(--color-rule)] flex items-center gap-1 transition">
                {isExporting === 'png' ? <Sparkles className="w-3 h-3 animate-spin" /> : <Download className="w-3 h-3" />}
                .PNG
              </span>
            </div>
          </div>

          {/* 4. AutoCAD DXF Export */}
          <div 
            onClick={exportDXF}
            className="p-4 bg-[var(--color-paper-2)] hover:bg-[var(--color-paper-3)] border border-[var(--color-rule)] hover:border-[#dc2626] rounded-xl flex flex-col justify-between cursor-pointer transition group"
          >
            <div>
              <div className="flex items-center space-x-3 mb-2">
                <div className="p-2.5 bg-[var(--color-paper)] text-[var(--color-ink)] rounded-lg border border-[var(--color-rule)] group-hover:scale-105 transition">
                  <Compass className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-[var(--color-ink)] text-sm group-hover:text-[#dc2626] transition font-display">
                    AutoCAD DXF Vector File
                  </h4>
                  <span className="text-[10px] text-[var(--color-muted)] font-mono">Engineering CAD Format</span>
                </div>
              </div>
              <p className="text-xs text-[var(--color-ink-2)]">
                Standard DXF ASCII entities compatible with AutoCAD, Revit, SketchUp, ArchiCAD, and BricsCAD.
              </p>
            </div>
            <div className="mt-3 pt-2.5 border-t border-[var(--color-rule)] flex items-center justify-between">
              <span className="text-[11px] font-mono text-[var(--color-muted)]">Civil & Structural Engineers</span>
              <span className="text-xs font-mono font-semibold text-[var(--color-ink)] group-hover:text-white group-hover:bg-[#0f172a] bg-[var(--color-paper)] px-2.5 py-1 rounded border border-[var(--color-rule)] flex items-center gap-1 transition">
                {isExporting === 'dxf' ? <Sparkles className="w-3 h-3 animate-spin" /> : <Download className="w-3 h-3" />}
                .DXF
              </span>
            </div>
          </div>
        </div>

        {/* BIM Data & Sharing row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-1">
          {/* Architectural JSON / BIM Data */}
          <div 
            onClick={exportJSON}
            className="p-3.5 bg-[var(--color-paper-2)] hover:bg-[var(--color-paper-3)] border border-[var(--color-rule)] hover:border-[#dc2626] rounded-xl flex items-center justify-between cursor-pointer transition group"
          >
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-[var(--color-paper)] text-[var(--color-ink)] rounded-lg border border-[var(--color-rule)]">
                <FileText className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-bold text-[var(--color-ink)] text-xs group-hover:text-[#dc2626] transition">MY3 BIM JSON Data</h4>
                <p className="text-[11px] font-mono text-[var(--color-muted)]">Parametric model coordinates & rules</p>
              </div>
            </div>
            <span className="text-[10px] font-mono text-[var(--color-ink)] bg-[var(--color-paper)] border border-[var(--color-rule)] px-2.5 py-1 rounded">.JSON</span>
          </div>

          {/* Shareable Project Link */}
          <div className="p-3.5 bg-[var(--color-paper-2)] border border-[var(--color-rule)] rounded-xl flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-[#dc2626]/10 text-[#dc2626] rounded-lg border border-[#dc2626]/20">
                <Share2 className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-bold text-[var(--color-ink)] text-xs">Shareable Client Link</h4>
                <p className="text-[11px] font-mono text-[var(--color-muted)]">Live 3D walkthrough with client</p>
              </div>
            </div>
            <button
              onClick={handleCopyLink}
              className="px-3 py-1.5 bg-[#0f172a] hover:bg-[#1e293b] text-white rounded-lg text-xs font-mono font-semibold flex items-center gap-1.5 transition cursor-pointer"
            >
              {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
        </div>

        <div className="pt-2 border-t border-[var(--color-rule)] flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-[var(--color-paper-2)] hover:bg-[var(--color-paper-3)] border border-[var(--color-rule)] text-[var(--color-ink)] rounded-lg text-xs font-mono font-bold transition cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
