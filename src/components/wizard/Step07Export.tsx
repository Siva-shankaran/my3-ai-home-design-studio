import React, { useState } from 'react';
import type { ProjectDesign } from '../../types/project.ts';
import { STANDARD_ISSUE_SHEETS, SheetDefinition, PaperSize, ExportFormat } from '../../engine/export/exportTypes.ts';
import { exportProjectToDxf } from '../../engine/export/dxfWriter.ts';
import { exportFloorPlanToSvg } from '../../engine/export/svgExporter.ts';
import { generatePdfIssueSetBlob } from '../../engine/export/pdfIssueSet.ts';
import { bundleCompleteProjectZip } from '../../engine/export/zipBundler.ts';
import {
  FileText,
  Download,
  CheckCircle2,
  AlertTriangle,
  Layers,
  FileCode2,
  FolderArchive,
  Compass,
  Printer,
  ChevronRight,
  ShieldCheck,
  Eye,
  FileDown,
} from 'lucide-react';

interface Step07ExportProps {
  project: ProjectDesign;
  onResetOrNew?: () => void;
}

export const Step07Export: React.FC<Step07ExportProps> = ({ project, onResetOrNew }) => {
  const [selectedSheetId, setSelectedSheetId] = useState<string>('cover_01');
  const [paperSize, setPaperSize] = useState<PaperSize>('A3');
  const [activeFormat, setActiveFormat] = useState<ExportFormat>('ZIP');
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [exportSuccessMessage, setExportSuccessMessage] = useState<string | null>(null);

  const selectedSheet = STANDARD_ISSUE_SHEETS.find((s) => s.id === selectedSheetId) || STANDARD_ISSUE_SHEETS[0];

  // Client-side instant download helper
  const triggerBrowserDownload = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDownloadZip = () => {
    setIsExporting(true);
    setExportSuccessMessage(null);
    try {
      const zipBytes = bundleCompleteProjectZip(project);
      const blob = new Blob([zipBytes.buffer as ArrayBuffer], { type: 'application/zip' });
      const filename = `MY3_${project.conceptTitle.replace(/[^a-zA-Z0-9_-]/g, '_')}_Complete_Package.zip`;
      triggerBrowserDownload(blob, filename);
      setExportSuccessMessage('Complete ZIP drawing package downloaded successfully.');
    } catch (e) {
      console.error('ZIP Export failed:', e);
    } finally {
      setIsExporting(false);
    }
  };

  const handleDownloadPdf = () => {
    setIsExporting(true);
    setExportSuccessMessage(null);
    try {
      const blob = generatePdfIssueSetBlob(project, { paperSize });
      const filename = `MY3_${project.conceptTitle.replace(/[^a-zA-Z0-9_-]/g, '_')}_${paperSize}_15_Sheets.pdf`;
      triggerBrowserDownload(blob, filename);
      setExportSuccessMessage(`15-Sheet ${paperSize} PDF issue set downloaded successfully.`);
    } catch (e) {
      console.error('PDF Export failed:', e);
    } finally {
      setIsExporting(false);
    }
  };

  const handleDownloadDxf = () => {
    setIsExporting(true);
    setExportSuccessMessage(null);
    try {
      const dxf = exportProjectToDxf(project);
      const blob = new Blob([dxf], { type: 'application/dxf' });
      const filename = `MY3_${project.conceptTitle.replace(/[^a-zA-Z0-9_-]/g, '_')}_CAD.dxf`;
      triggerBrowserDownload(blob, filename);
      setExportSuccessMessage('AutoCAD DXF drawing with distinct layers downloaded.');
    } catch (e) {
      console.error('DXF Export failed:', e);
    } finally {
      setIsExporting(false);
    }
  };

  const handleDownloadSvg = () => {
    setIsExporting(true);
    setExportSuccessMessage(null);
    try {
      const svg = exportFloorPlanToSvg(project, { floorIndex: 0 });
      const blob = new Blob([svg], { type: 'image/svg+xml' });
      const filename = `MY3_${project.conceptTitle.replace(/[^a-zA-Z0-9_-]/g, '_')}_Ground_Plan.svg`;
      triggerBrowserDownload(blob, filename);
      setExportSuccessMessage('Vector architectural SVG downloaded.');
    } catch (e) {
      console.error('SVG Export failed:', e);
    } finally {
      setIsExporting(false);
    }
  };

  const handleDownloadCurrentFormat = () => {
    switch (activeFormat) {
      case 'PDF_A3':
      case 'PDF_A1':
        handleDownloadPdf();
        break;
      case 'DXF':
        handleDownloadDxf();
        break;
      case 'SVG':
        handleDownloadSvg();
        break;
      case 'ZIP':
      default:
        handleDownloadZip();
        break;
    }
  };

  // Group sheets by discipline
  const disciplines: Array<'GENERAL' | 'ARCHITECTURAL' | 'STRUCTURAL' | 'SERVICES' | 'QUANTITIES'> = [
    'GENERAL',
    'ARCHITECTURAL',
    'STRUCTURAL',
    'SERVICES',
    'QUANTITIES',
  ];

  return (
    <div className="flex flex-col gap-8 w-full max-w-7xl mx-auto pb-16">
      {/* 1. Header Banner */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 hairline-b">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="font-mono text-xs uppercase tracking-widest text-[var(--color-terracotta)] font-semibold">
              Milestone 07 — Production Delivery
            </span>
            <span className="font-mono text-[10px] uppercase px-2 py-0.5 rounded bg-[var(--color-paper-3)] text-[var(--color-muted)]">
              GFC / Tender Issue
            </span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl text-[var(--color-ink)] tracking-tight">
            Professional Architectural &amp; Structural Issue Set
          </h1>
          <p className="font-mono text-xs text-[var(--color-muted)] mt-1 max-w-2xl">
            15-Sheet landscape drawing package, layered AutoCAD DXF, high-resolution vector SVGs, and IS 456
            reinforcement schedule.
          </p>
        </div>

        {/* Global Primary Download Action */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleDownloadZip}
            disabled={isExporting}
            className="flex items-center gap-2.5 px-6 py-3 rounded bg-[var(--color-ink)] text-[var(--color-paper)] font-mono text-xs uppercase tracking-wider hover:bg-[var(--color-terracotta)] transition cursor-pointer shadow-sm disabled:opacity-50"
          >
            <FolderArchive className="w-4 h-4" />
            <span>{isExporting ? 'Generating Bundle...' : 'Download Full ZIP Bundle'}</span>
          </button>
        </div>
      </div>

      {/* Mandatory Engineering Disclaimer Callout */}
      <div className="flex items-start gap-3.5 p-4 rounded bg-[#FFF8F6] border border-[#F3D7D0]">
        <AlertTriangle className="w-5 h-5 text-[var(--color-terracotta)] shrink-0 mt-0.5" />
        <div className="text-xs">
          <span className="font-bold text-[var(--color-terracotta)] uppercase tracking-wide">
            Statutory &amp; Engineering Notice:
          </span>{' '}
          <span className="text-[var(--color-ink)]">
            This package contains preliminary architectural and computational estimates prepared for planning,
            tender estimation, and council submission discussions. All structural load take-downs, rebar schedules,
            and foundation depths must be formally inspected, vetted, and signed by a licensed structural engineer
            prior to excavation or site work.
          </span>
        </div>
      </div>

      {exportSuccessMessage && (
        <div className="flex items-center gap-2 p-3.5 rounded bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-mono">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{exportSuccessMessage}</span>
        </div>
      )}

      {/* 2. Format & Configuration Selector Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded bg-[var(--color-paper-2)] hairline">
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono uppercase text-[var(--color-muted)] mr-2">Deliverable:</span>
          <button
            type="button"
            onClick={() => setActiveFormat('ZIP')}
            className={`px-3 py-1.5 rounded text-xs font-mono transition cursor-pointer flex items-center gap-1.5 ${
              activeFormat === 'ZIP'
                ? 'bg-[var(--color-ink)] text-[var(--color-paper)] font-medium shadow-sm'
                : 'bg-transparent text-[var(--color-ink)] hover:bg-[var(--color-paper-3)]'
            }`}
          >
            <FolderArchive className="w-3.5 h-3.5" />
            <span>Complete ZIP (All Files)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveFormat('PDF_A3')}
            className={`px-3 py-1.5 rounded text-xs font-mono transition cursor-pointer flex items-center gap-1.5 ${
              activeFormat === 'PDF_A3' || activeFormat === 'PDF_A1'
                ? 'bg-[var(--color-ink)] text-[var(--color-paper)] font-medium shadow-sm'
                : 'bg-transparent text-[var(--color-ink)] hover:bg-[var(--color-paper-3)]'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>15-Sheet PDF</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveFormat('DXF')}
            className={`px-3 py-1.5 rounded text-xs font-mono transition cursor-pointer flex items-center gap-1.5 ${
              activeFormat === 'DXF'
                ? 'bg-[var(--color-ink)] text-[var(--color-paper)] font-medium shadow-sm'
                : 'bg-transparent text-[var(--color-ink)] hover:bg-[var(--color-paper-3)]'
            }`}
          >
            <FileCode2 className="w-3.5 h-3.5" />
            <span>AutoCAD DXF</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveFormat('SVG')}
            className={`px-3 py-1.5 rounded text-xs font-mono transition cursor-pointer flex items-center gap-1.5 ${
              activeFormat === 'SVG'
                ? 'bg-[var(--color-ink)] text-[var(--color-paper)] font-medium shadow-sm'
                : 'bg-transparent text-[var(--color-ink)] hover:bg-[var(--color-paper-3)]'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Vector SVG</span>
          </button>
        </div>

        {/* Paper Size & Action */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 text-xs font-mono">
            <span className="text-[var(--color-muted)] mr-1">Sheet Size:</span>
            <button
              type="button"
              onClick={() => setPaperSize('A3')}
              className={`px-2.5 py-1 rounded text-[11px] font-mono cursor-pointer transition ${
                paperSize === 'A3'
                  ? 'bg-[var(--color-paper-3)] font-bold text-[var(--color-ink)]'
                  : 'text-[var(--color-muted)] hover:text-[var(--color-ink)]'
              }`}
            >
              A3 (420×297)
            </button>
            <button
              type="button"
              onClick={() => setPaperSize('A1')}
              className={`px-2.5 py-1 rounded text-[11px] font-mono cursor-pointer transition ${
                paperSize === 'A1'
                  ? 'bg-[var(--color-paper-3)] font-bold text-[var(--color-ink)]'
                  : 'text-[var(--color-muted)] hover:text-[var(--color-ink)]'
              }`}
            >
              A1 (841×594)
            </button>
          </div>

          <button
            type="button"
            onClick={handleDownloadCurrentFormat}
            disabled={isExporting}
            className="flex items-center gap-1.5 px-4 py-2 rounded bg-[var(--color-terracotta)] text-white font-mono text-xs uppercase tracking-wider hover:brightness-110 transition cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download {activeFormat.replace('_', ' ')}</span>
          </button>
        </div>
      </div>

      {/* 3. Master Two-Column Workspace: Sheet Index vs Live Sheet Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Navigator: 15-Sheet Index Register (4 Cols) */}
        <div className="lg:col-span-4 flex flex-col gap-4">
          <div className="p-4 rounded bg-[var(--color-paper-2)] hairline">
            <div className="flex items-center justify-between pb-3 hairline-b mb-3">
              <span className="font-serif text-sm font-bold text-[var(--color-ink)]">
                Issue Set Register (15 Sheets)
              </span>
              <span className="font-mono text-[10px] text-[var(--color-muted)] uppercase">Rev 0</span>
            </div>

            <div className="flex flex-col gap-4 max-h-[640px] overflow-y-auto pr-1">
              {disciplines.map((disc) => {
                const sheetsInDisc = STANDARD_ISSUE_SHEETS.filter((s) => s.discipline === disc);
                if (sheetsInDisc.length === 0) return null;
                return (
                  <div key={disc} className="flex flex-col gap-1.5">
                    <span className="font-mono text-[10px] uppercase tracking-wider text-[var(--color-muted)] px-1">
                      {disc}
                    </span>
                    {sheetsInDisc.map((sh) => {
                      const isSelected = sh.id === selectedSheetId;
                      return (
                        <button
                          key={sh.id}
                          type="button"
                          onClick={() => setSelectedSheetId(sh.id)}
                          className={`flex items-center justify-between p-2.5 rounded text-left transition cursor-pointer ${
                            isSelected
                              ? 'bg-[var(--color-ink)] text-[var(--color-paper)] shadow-sm'
                              : 'bg-[var(--color-paper)] hover:bg-[var(--color-paper-3)] text-[var(--color-ink)]'
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <span
                              className={`font-mono text-xs font-bold px-1.5 py-0.5 rounded ${
                                isSelected
                                  ? 'bg-[var(--color-terracotta)] text-white'
                                  : 'bg-[var(--color-paper-2)] text-[var(--color-terracotta)]'
                              }`}
                            >
                              {sh.sheetCode}
                            </span>
                            <div className="flex flex-col">
                              <span className="font-medium text-xs truncate max-w-[170px]">{sh.title}</span>
                              <span
                                className={`text-[10px] font-mono ${
                                  isSelected ? 'text-[var(--color-paper-3)]' : 'text-[var(--color-muted)]'
                                }`}
                              >
                                Scale: {sh.scale}
                              </span>
                            </div>
                          </div>
                          <ChevronRight
                            className={`w-3.5 h-3.5 shrink-0 ${
                              isSelected ? 'text-[var(--color-paper)]' : 'text-[var(--color-muted)]'
                            }`}
                          />
                        </button>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Stage: Interactive Sheet Previewer (8 Cols) */}
        <div className="lg:col-span-8 flex flex-col gap-4">
          <div className="p-4 rounded bg-[var(--color-paper-2)] hairline flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-[var(--color-muted)]" />
              <span className="font-mono text-xs uppercase text-[var(--color-ink)] font-semibold">
                Preview: {selectedSheet.sheetCode} — {selectedSheet.title}
              </span>
            </div>
            <div className="flex items-center gap-3 font-mono text-[11px] text-[var(--color-muted)]">
              <span>DWG: {selectedSheet.drawingNumber}</span>
              <span>•</span>
              <span>Scale: {selectedSheet.scale}</span>
            </div>
          </div>

          {/* Sheet Canvas Visualizer */}
          <div className="p-4 sm:p-8 rounded bg-white hairline shadow-sm flex flex-col items-center justify-center min-h-[500px] overflow-hidden">
            {selectedSheet.id === 'a_101' || selectedSheet.id === 'a_102' ? (
              <div
                className="w-full max-w-2xl overflow-auto border border-stone-200 rounded p-2 bg-[#FAF8F5]"
                dangerouslySetInnerHTML={{
                  __html: exportFloorPlanToSvg(project, {
                    floorIndex: selectedSheet.id === 'a_102' ? 1 : 0,
                    pixelsPerFoot: 16,
                  }),
                }}
              />
            ) : (
              <div className="w-full max-w-2xl flex flex-col gap-4 p-6 bg-[#FAF8F5] border border-stone-200 rounded">
                <div className="flex justify-between items-start hairline-b pb-4">
                  <div>
                    <span className="font-mono text-[10px] text-[var(--color-terracotta)] font-bold uppercase tracking-wider">
                      MY3 DESIGNS ISSUE SET
                    </span>
                    <h3 className="font-serif text-2xl text-[var(--color-ink)]">{selectedSheet.title}</h3>
                    <p className="text-xs text-[var(--color-muted)] font-mono mt-0.5">{selectedSheet.description}</p>
                  </div>
                  <div className="text-right font-mono text-xs">
                    <span className="px-2 py-1 rounded bg-[var(--color-ink)] text-white font-bold">
                      {selectedSheet.sheetCode}
                    </span>
                  </div>
                </div>

                {/* Conceptual preview body */}
                <div className="py-8 flex flex-col items-center justify-center text-center gap-3">
                  <div className="w-16 h-16 rounded-full bg-stone-100 flex items-center justify-center text-stone-500">
                    <Compass className="w-8 h-8 text-[var(--color-ink)]" />
                  </div>
                  <span className="font-mono text-xs font-medium text-[var(--color-ink)]">
                    Vector Architectural Sheet Formatted for {paperSize} Landscape Output
                  </span>
                  <p className="text-[11px] text-[var(--color-muted)] max-w-md font-mono">
                    Full vector geometry, title blocks, dimension strings, and schedules are embedded into the PDF &amp;
                    CAD bundle. Click Download to retrieve the vector deliverable.
                  </p>
                </div>

                {/* Bottom title block imitation */}
                <div className="grid grid-cols-3 gap-3 p-3 bg-white rounded border border-stone-200 text-[10px] font-mono">
                  <div>
                    <span className="text-[var(--color-muted)] block">PROJECT:</span>
                    <span className="font-bold text-[var(--color-ink)]">{project.conceptTitle}</span>
                  </div>
                  <div>
                    <span className="text-[var(--color-muted)] block">DISCIPLINE:</span>
                    <span className="font-bold text-[var(--color-ink)]">{selectedSheet.discipline}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[var(--color-muted)] block">STATUS:</span>
                    <span className="font-bold text-emerald-600">PRELIMINARY APPROVED</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
