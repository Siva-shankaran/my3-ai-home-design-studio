import React, { useState } from 'react';
import type { ProjectDesign } from '../../types/project.ts';
import { SimpleZipWriter } from '../../engine/export/zipBundler.ts';
import { exportFloorPlanToSvg } from '../../engine/export/svgExporter.ts';
import { exportProjectToDxf } from '../../engine/export/dxfWriter.ts';
import { generatePdfIssueSetArrayBuffer } from '../../engine/export/pdfIssueSet.ts';
import { 
  Download, 
  LogOut, 
  X, 
  FileArchive, 
  CheckCircle2, 
  Layers, 
  FileText, 
  Box, 
  Table, 
  Sparkles,
  Loader2
} from 'lucide-react';

interface LogoutDownloadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmLogout: () => void;
  activeProject?: ProjectDesign | null;
}

export const LogoutDownloadModal: React.FC<LogoutDownloadModalProps> = ({
  isOpen,
  onClose,
  onConfirmLogout,
  activeProject
}) => {
  const [isBundling, setIsBundling] = useState(false);

  if (!isOpen) return null;

  const handleDownloadAndLogout = async () => {
    setIsBundling(true);
    try {
      const zip = new SimpleZipWriter();
      const projName = activeProject?.conceptTitle ? activeProject.conceptTitle.replace(/\s+/g, '_') : 'MY3_Home_Design';
      const seed = activeProject?.seed || 10482;

      // 1. Vector SVG Floor Plan
      if (activeProject && activeProject.floors && activeProject.floors.length > 0) {
        const svgStr = exportFloorPlanToSvg(activeProject, { floorIndex: 0 });
        zip.addFile(`${projName}_Floor01_Plan.svg`, svgStr);
      }

      // 2. Layered AutoCAD DXF
      if (activeProject) {
        const dxfStr = exportProjectToDxf(activeProject);
        zip.addFile(`${projName}_AutoCAD.dxf`, dxfStr);
      }

      // 3. 15-Sheet PDF Issue Set
      if (activeProject) {
        try {
          const pdfBuffer = await generatePdfIssueSetArrayBuffer(activeProject);
          zip.addFile(`${projName}_Architectural_Drawings.pdf`, new Uint8Array(pdfBuffer));
        } catch (pdfErr) {
          console.warn('[Logout Download] PDF generation fallback:', pdfErr);
        }
      }

      // 4. Project State JSON
      const stateJson = JSON.stringify(activeProject || { name: projName, seed }, null, 2);
      zip.addFile(`${projName}_State.json`, stateJson);

      // 5. BOQ Material CSV
      let csvContent = 'Item No,Description,Quantity,Unit,Rate (INR),Amount (INR)\n';
      if (activeProject?.boqSummary?.itemsTable) {
        activeProject.boqSummary.itemsTable.forEach((item, idx) => {
          csvContent += `${idx + 1},"${item.itemDescription.replace(/"/g, '""')}",${item.quantity},"${item.unit}",${item.unitRateINR},${item.amountINR}\n`;
        });
      } else {
        csvContent += '1,"RCC Concrete M25",125,"m3",6500,812500\n2,"Fe500 TMT Steel",3850,"kg",72,277200\n';
      }
      zip.addFile(`${projName}_BOQ_Schedule.csv`, csvContent);

      // 6. Build and trigger ZIP download
      const zipBytes = zip.buildZip();
      const blob = new Blob([zipBytes.buffer as ArrayBuffer], { type: 'application/zip' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${projName}_Seed${seed}_Complete_Archive.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('[Logout Download Error]:', err);
    } finally {
      setIsBundling(false);
      onConfirmLogout();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn font-sans">
      <div className="relative w-full max-w-lg bg-[var(--color-paper)] border border-[var(--color-rule)] rounded-xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-6 bg-[var(--color-paper-2)] border-b border-[var(--color-rule-2)] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[var(--color-accent)]/10 text-[var(--color-accent)] flex items-center justify-center border border-[var(--color-accent)]/20">
              <FileArchive className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-[var(--color-accent)] font-semibold">
                Session Safety &amp; Backup
              </span>
              <h2 className="font-serif text-xl text-[var(--color-ink)]">
                Download Before You Log Out?
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-[var(--color-muted)] hover:text-[var(--color-ink)] transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <p className="text-xs text-[var(--color-muted)] font-sans leading-relaxed">
            Your current design session contains high-precision architectural geometry, material specifications, and structural schedules. You can export the entire standalone package now so you never lose your progress.
          </p>

          {/* Archive Manifest Card */}
          <div className="p-4 rounded-lg bg-[var(--color-paper-2)] border border-[var(--color-rule-2)] space-y-2.5 font-mono text-xs">
            <div className="flex items-center justify-between text-[11px] text-[var(--color-ink)] font-bold pb-2 border-b border-[var(--color-rule-2)]">
              <span>ARCHIVE MANIFEST (.ZIP)</span>
              <span className="text-[var(--color-accent)]">SEED #{activeProject?.seed || 10482}</span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div className="flex items-center gap-2 text-[var(--color-ink)]">
                <Layers className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
                <span>Vector SVG Floor Plan</span>
              </div>
              <div className="flex items-center gap-2 text-[var(--color-ink)]">
                <Box className="w-3.5 h-3.5 text-indigo-600 flex-shrink-0" />
                <span>Layered AutoCAD (.DXF)</span>
              </div>
              <div className="flex items-center gap-2 text-[var(--color-ink)]">
                <FileText className="w-3.5 h-3.5 text-red-600 flex-shrink-0" />
                <span>15-Sheet PDF Issue Set</span>
              </div>
              <div className="flex items-center gap-2 text-[var(--color-ink)]">
                <Table className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                <span>Civil BOQ Quantities (.CSV)</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 space-y-2">
            <button
              type="button"
              disabled={isBundling}
              onClick={handleDownloadAndLogout}
              className="w-full py-3 rounded font-mono text-xs uppercase tracking-wider font-bold bg-[var(--color-accent)] text-white hover:opacity-95 transition shadow-sm cursor-pointer flex items-center justify-center gap-2"
            >
              {isBundling ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Packaging Architecture Deliverables...</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>Download Full Archive &amp; Log Out</span>
                </>
              )}
            </button>

            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={onConfirmLogout}
                className="flex-1 py-2.5 rounded font-mono text-xs uppercase tracking-wider text-[var(--color-muted)] hover:text-red-700 bg-[var(--color-paper-2)] hover:bg-red-50 border border-[var(--color-rule-2)] transition cursor-pointer flex items-center justify-center gap-1.5"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Log Out Without Downloading</span>
              </button>
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded font-mono text-xs uppercase tracking-wider text-[var(--color-ink)] bg-[var(--color-paper-2)] border border-[var(--color-rule-2)] hover:bg-[var(--color-paper)] transition cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
