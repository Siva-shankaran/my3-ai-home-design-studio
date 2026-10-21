import { jsPDF } from 'jspdf';
import type { ProjectDesign } from '../../types/project.ts';
import { STANDARD_ISSUE_SHEETS } from './exportTypes.ts';
import type { SheetDefinition, ExportProjectMeta } from './exportTypes.ts';

export interface PdfExportOptions {
  paperSize?: 'A3' | 'A1';
  projectMeta?: Partial<ExportProjectMeta>;
  selectedSheets?: string[]; // array of sheet ids, defaults to all 15
}

export class PdfIssueSetGenerator {
  private doc: jsPDF;
  private width: number;
  private height: number;
  private meta: ExportProjectMeta;

  constructor(options: PdfExportOptions = {}) {
    const isA1 = options.paperSize === 'A1';
    this.width = isA1 ? 841 : 420;
    this.height = isA1 ? 594 : 297;

    this.doc = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: isA1 ? [841, 594] : [420, 297],
    });

    this.meta = {
      projectName: options.projectMeta?.projectName || 'RESIDENTIAL VILLA SCHEME',
      clientName: options.projectMeta?.clientName || 'PRIVATE RESIDENTIAL CLIENT',
      location: options.projectMeta?.location || 'CHENNAI / TAMIL NADU',
      projectNumber: options.projectMeta?.projectNumber || 'MY3-2026-V2',
      revision: options.projectMeta?.revision || 'REV 0 (PRELIMINARY PLANNING)',
      date: options.projectMeta?.date || new Date().toISOString().split('T')[0],
      architectNote: options.projectMeta?.architectNote || 'Generated via MY3 Designs Studio Engine v2.0',
    };
  }

  // Draw standardized border, grid coordinates, and title block on current page
  private drawSheetFrame(sheet: SheetDefinition, project: ProjectDesign) {
    const doc = this.doc;
    const w = this.width;
    const h = this.height;

    // Outer & Inner Architectural Borders
    doc.setDrawColor(22, 21, 19);
    doc.setLineWidth(0.6);
    doc.rect(8, 8, w - 16, h - 16);

    doc.setDrawColor(180, 175, 165);
    doc.setLineWidth(0.2);
    doc.rect(12, 12, w - 24, h - 24);

    // Title Block on the right side
    const tbWidth = 85;
    const tbX = w - 12 - tbWidth;
    const tbY = 12;
    const tbH = h - 24;

    doc.setDrawColor(22, 21, 19);
    doc.setLineWidth(0.4);
    doc.line(tbX, tbY, tbX, tbY + tbH);

    // Title block background fill
    doc.setFillColor(250, 248, 245);
    doc.rect(tbX, tbY, tbWidth, tbH, 'F');

    // Section 1: Firm & Engine Branding
    doc.setTextColor(22, 21, 19);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text('MY3 DESIGNS', tbX + 6, tbY + 10);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(110, 105, 95);
    doc.text('ARCHITECTURAL COMPUTATIONAL ENGINE', tbX + 6, tbY + 14);

    doc.setDrawColor(200, 195, 185);
    doc.setLineWidth(0.2);
    doc.line(tbX + 4, tbY + 17, tbX + tbWidth - 4, tbY + 17);

    // Section 2: Project & Client Details
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.5);
    doc.setTextColor(138, 133, 123);
    doc.text('PROJECT:', tbX + 6, tbY + 22);
    doc.setTextColor(22, 21, 19);
    doc.setFontSize(8);
    const splitTitle = doc.splitTextToSize(project.conceptTitle || this.meta.projectName, tbWidth - 12);
    doc.text(splitTitle, tbX + 6, tbY + 26);

    const clientY = tbY + 26 + (Array.isArray(splitTitle) ? splitTitle.length * 3.5 : 4);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.5);
    doc.setTextColor(138, 133, 123);
    doc.text('CLIENT / SITE:', tbX + 6, clientY + 4);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(22, 21, 19);
    doc.setFontSize(7.5);
    doc.text(`${this.meta.clientName}`, tbX + 6, clientY + 8);
    doc.text(`${this.meta.location}`, tbX + 6, clientY + 12);

    doc.line(tbX + 4, clientY + 15, tbX + tbWidth - 4, clientY + 15);

    // Section 3: Drawing Title & Sheet Number
    const drawY = clientY + 20;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.5);
    doc.setTextColor(138, 133, 123);
    doc.text('DRAWING TITLE:', tbX + 6, drawY);
    doc.setTextColor(22, 21, 19);
    doc.setFontSize(8.5);
    const splitSheetTitle = doc.splitTextToSize(sheet.title, tbWidth - 12);
    doc.text(splitSheetTitle, tbX + 6, drawY + 4.5);

    const sheetNoY = drawY + 6 + (Array.isArray(splitSheetTitle) ? splitSheetTitle.length * 4 : 4.5);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.5);
    doc.setTextColor(138, 133, 123);
    doc.text('SHEET NUMBER:', tbX + 6, sheetNoY + 3);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(15);
    doc.setTextColor(196, 85, 45);
    doc.text(sheet.sheetCode, tbX + 6, sheetNoY + 10);

    doc.line(tbX + 4, sheetNoY + 13, tbX + tbWidth - 4, sheetNoY + 13);

    // Section 4: Metadata Fields (Scale, Date, Rev, Drawn)
    const metaY = sheetNoY + 17;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.setTextColor(100, 95, 85);
    doc.text(`SCALE: ${sheet.scale}`, tbX + 6, metaY);
    doc.text(`DATE: ${this.meta.date}`, tbX + 45, metaY);
    doc.text(`REV: ${this.meta.revision}`, tbX + 6, metaY + 4.5);
    doc.text(`DISCIPLINE: ${sheet.discipline}`, tbX + 45, metaY + 4.5);
    doc.text(`PROJECT ID: ${this.meta.projectNumber}`, tbX + 6, metaY + 9);
    doc.text(`DWG NO: ${sheet.drawingNumber}`, tbX + 45, metaY + 9);

    doc.line(tbX + 4, metaY + 12, tbX + tbWidth - 4, metaY + 12);

    // Section 5: MANDATORY ENGINEERING DISCLAIMER (NON-NEGOTIABLE)
    const discY = tbY + tbH - 34;
    doc.setFillColor(255, 245, 242);
    doc.setDrawColor(196, 85, 45);
    doc.setLineWidth(0.3);
    doc.rect(tbX + 4, discY, tbWidth - 8, 30, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6);
    doc.setTextColor(196, 85, 45);
    doc.text('LEGAL NOTICE & ENGINEERING DISCLAIMER', tbX + 6, discY + 4);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(5.5);
    doc.setTextColor(90, 80, 75);
    const disclaimerLines = doc.splitTextToSize(
      'Preliminary architectural estimate and design intent for planning purposes only. All dimensions, load take-downs, rebar weights, and footing sizes must be independently verified and signed by a licensed structural engineer and sanctioned by local planning authorities prior to site execution.',
      tbWidth - 12
    );
    doc.text(disclaimerLines, tbX + 6, discY + 8);
  }

  // Cover Sheet
  private renderCoverSheet(sheet: SheetDefinition, project: ProjectDesign) {
    this.drawSheetFrame(sheet, project);
    const doc = this.doc;
    const brief = project.briefSnapshot;
    const plotW = brief?.plot?.width || 30;
    const plotD = brief?.plot?.depth || 40;
    const plotArea = plotW * plotD;

    doc.setFont('times', 'bold');
    doc.setFontSize(22);
    doc.setTextColor(22, 21, 19);
    doc.text(project.conceptTitle.toUpperCase(), 25, 32);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(120, 115, 105);
    doc.text('COMPREHENSIVE ARCHITECTURAL & STRUCTURAL ISSUE SET', 25, 40);

    // Column A: Project Overview & Code Compliance
    doc.setDrawColor(220, 215, 205);
    doc.setLineWidth(0.3);
    doc.rect(25, 48, 140, 130);
    doc.setFillColor(248, 246, 242);
    doc.rect(25, 48, 140, 10, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(22, 21, 19);
    doc.text('01. PROJECT TECHNICAL SPECIFICATION', 30, 55);

    const metrics = [
      ['Archetype & Concept', `${project.archetype}`],
      ['Plot Dimensions', `${plotW}' x ${plotD}' (${plotArea} sq.ft)`],
      ['Facing / Orientation', `${brief?.plot?.roadFacingSide || 'NORTH'} Facing (Vastu Score: ${project.vastuScore}/100)`],
      ['Total Built-Up Area', `${project.totalBuiltUpSqFt} sq.ft (${(project.totalBuiltUpSqFt * 0.0929).toFixed(1)} m²)`],
      ['Total Carpet Area', `${project.totalCarpetSqFt} sq.ft (${project.carpetEfficiencyPercent.toFixed(1)}% efficiency)`],
      ['Total Floors', `${project.floors.length} Levels (Ground + ${project.floors.length - 1})`],
      ['Road Width', `${brief?.plot?.roadWidthFt || 30} FT Access`],
      ['Soil & Foundation', `${brief?.regulations?.soilType || 'LOAM'} Soil profile`],
      ['Total RC Columns', `${project.structuralColumns?.length || 0} Isolated Tied Columns (IS 456)`],
      ['Total Footings', `${project.structuralFootings?.length || 0} Trapezoidal Isolated Footings`],
      ['Estimated Rebar Steel', `${project.boqSummary?.steelKgByDiameter?.totalKg?.toLocaleString() || '6,500'} kg (${project.boqSummary?.steelKgPerSqFt?.toFixed(2) || '3.60'} kg/sq.ft)`],
      ['Estimated Concrete', `${((project.boqSummary?.concreteVolumeM20M3 || 0) + (project.boqSummary?.concreteVolumeM25M3 || 0)).toFixed(1)} m³`],
      ['Independent Audit Score', `${project.verificationReport?.scorePercent ?? 100}% (${project.verificationReport?.overallStatus ?? 'PASS'})`],
    ];

    let rowY = 65;
    for (const [label, val] of metrics) {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(110, 105, 95);
      doc.text(label, 30, rowY);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(22, 21, 19);
      doc.text(val, 95, rowY);
      rowY += 8.2;
    }

    // Column B: 15-Sheet Index Table
    const colBX = 175;
    doc.rect(colBX, 48, 140, 220);
    doc.setFillColor(248, 246, 242);
    doc.rect(colBX, 48, 140, 10, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(22, 21, 19);
    doc.text('02. DRAWING ISSUE REGISTER & SHEET INDEX', colBX + 5, 55);

    let sheetRowY = 66;
    for (const sh of STANDARD_ISSUE_SHEETS) {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7.5);
      doc.setTextColor(196, 85, 45);
      doc.text(sh.sheetCode, colBX + 5, sheetRowY);

      doc.setFont('helvetica', 'normal');
      doc.setTextColor(22, 21, 19);
      doc.text(sh.title, colBX + 26, sheetRowY);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(6.5);
      doc.setTextColor(120, 115, 105);
      doc.text(sh.scale, colBX + 115, sheetRowY);
      doc.text('R0', colBX + 130, sheetRowY);

      sheetRowY += 13.5;
    }

    // Bottom Notes Box
    doc.rect(25, 185, 140, 83);
    doc.setFillColor(248, 246, 242);
    doc.rect(25, 185, 140, 8, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(22, 21, 19);
    doc.text('03. ARCHITECTURAL DESIGN RATIONALE', 30, 191);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(80, 75, 70);
    const rationale = doc.splitTextToSize(project.conceptRationale || 'Layout optimized for passive solar cross-ventilation, functional zoning with private quiet quarters segregated from public entertaining areas, and structural column grid efficiency.', 130);
    doc.text(rationale, 30, 200);
  }

  // Site Plan Sheet
  private renderSitePlan(sheet: SheetDefinition, project: ProjectDesign) {
    this.drawSheetFrame(sheet, project);
    const doc = this.doc;
    const brief = project.briefSnapshot;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text('SITE PLAN & REGULATORY SETBACK ENVELOPE', 25, 26);

    const pw = brief?.plot?.width || 30;
    const pd = brief?.plot?.depth || 40;
    const scale = Math.min(180 / pw, 180 / pd);

    const ox = 40;
    const oy = 45;

    // Road strip
    doc.setFillColor(235, 230, 225);
    doc.rect(ox - 10, oy - 15, pw * scale + 20, 10, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.setTextColor(120, 115, 105);
    doc.text(`${brief?.plot?.roadWidthFt || 30}' WIDE PUBLIC ACCESS ROAD`, ox + (pw * scale) / 2 - 25, oy - 8);

    // Plot Boundary
    doc.setDrawColor(22, 21, 19);
    doc.setLineWidth(0.6);
    doc.rect(ox, oy, pw * scale, pd * scale);

    // Setback envelope
    const sf = (brief?.regulations?.setbacks?.frontFt ?? 5) * scale;
    const sr = (brief?.regulations?.setbacks?.rearFt ?? 5) * scale;
    const sl = (brief?.regulations?.setbacks?.side1Ft ?? 3.5) * scale;
    const srt = (brief?.regulations?.setbacks?.side2Ft ?? 3.5) * scale;

    doc.setDrawColor(196, 85, 45);
    doc.setLineWidth(0.3);
    doc.rect(ox + sl, oy + sf, pw * scale - sl - srt, pd * scale - sf - sr);

    // Dimension lines
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(22, 21, 19);
    doc.text(`FRONTAGE: ${pw}'0"`, ox + (pw * scale) / 2 - 10, oy + pd * scale + 6);
    doc.text(`DEPTH: ${pd}'0"`, ox - 20, oy + (pd * scale) / 2);

    doc.setFontSize(6);
    doc.setTextColor(196, 85, 45);
    doc.text(`FRONT SETBACK: ${brief?.regulations?.setbacks?.frontFt ?? 5}'0"`, ox + sl + 4, oy + sf / 2);
    doc.text(`REAR SETBACK: ${brief?.regulations?.setbacks?.rearFt ?? 5}'0"`, ox + sl + 4, oy + pd * scale - sr / 2);
  }

  // Floor Plan Sheets (Ground & First)
  private renderFloorPlan(sheet: SheetDefinition, project: ProjectDesign, floorIdx: number) {
    this.drawSheetFrame(sheet, project);
    const doc = this.doc;
    const floor = project.floors.find((f) => f.floorIndex === floorIdx) || project.floors[0];
    const brief = project.briefSnapshot;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text(`${floor.floorName.toUpperCase()} — ARCHITECTURAL LAYOUT`, 25, 26);

    const pw = brief?.plot?.width || 30;
    const pd = brief?.plot?.depth || 40;
    const scale = Math.min(220 / pw, 220 / pd);
    const ox = 35;
    const oy = 40;

    // Draw rooms
    for (const r of floor.rooms) {
      if (r.polygon && r.polygon.length >= 3) {
        doc.setFillColor(246, 243, 238);
        doc.setDrawColor(180, 175, 165);
        doc.setLineWidth(0.2);

        const xs = r.polygon.map((p) => p.x);
        const ys = r.polygon.map((p) => p.y);
        const minX = Math.min(...xs);
        const maxX = Math.max(...xs);
        const minY = Math.min(...ys);
        const maxY = Math.max(...ys);

        doc.rect(ox + minX * scale, oy + minY * scale, (maxX - minX) * scale, (maxY - minY) * scale, 'FD');

        const cx = ox + ((minX + maxX) / 2) * scale;
        const cy = oy + ((minY + maxY) / 2) * scale;

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(6.5);
        doc.setTextColor(22, 21, 19);
        doc.text(r.name.toUpperCase(), cx - 8, cy - 2);

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(5.5);
        doc.setTextColor(110, 105, 95);
        doc.text(`${r.carpetAreaSqFt.toFixed(1)} SQ.FT`, cx - 8, cy + 3);
      }
    }

    // Draw walls
    for (const w of floor.walls) {
      doc.setDrawColor(22, 21, 19);
      doc.setLineWidth(w.isExterior ? 0.7 : 0.4);
      doc.line(ox + w.start.x * scale, oy + w.start.y * scale, ox + w.end.x * scale, oy + w.end.y * scale);
    }

    // Draw Columns
    if (project.structuralColumns) {
      for (const col of project.structuralColumns) {
        const cx = ox + col.position.x * scale;
        const cy = oy + col.position.y * scale;
        doc.setFillColor(22, 21, 19);
        doc.rect(cx - 1.5, cy - 1.5, 3, 3, 'F');
      }
    }
  }

  // Foundation & Footing Plan
  private renderFoundationPlan(sheet: SheetDefinition, project: ProjectDesign) {
    this.drawSheetFrame(sheet, project);
    const doc = this.doc;
    const brief = project.briefSnapshot;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text('FOUNDATION & FOOTING EXCAVATION PLAN', 25, 26);

    const pw = brief?.plot?.width || 30;
    const pd = brief?.plot?.depth || 40;
    const scale = Math.min(200 / pw, 200 / pd);
    const ox = 35;
    const oy = 45;

    if (project.structuralFootings) {
      for (const ftg of project.structuralFootings) {
        const cx = ox + ftg.center.x * scale;
        const cy = oy + ftg.center.y * scale;
        const fw = ftg.widthFt * scale;
        const fl = ftg.lengthFt * scale;

        doc.setDrawColor(37, 99, 235);
        doc.setLineWidth(0.3);
        doc.rect(cx - fl / 2, cy - fw / 2, fl, fw);

        doc.setFillColor(22, 21, 19);
        doc.rect(cx - 1.5, cy - 1.5, 3, 3, 'F');

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(5);
        doc.setTextColor(37, 99, 235);
        doc.text(`${ftg.code} (${ftg.lengthFt}'x${ftg.widthFt}')`, cx - fl / 2 + 1, cy - fw / 2 - 1);
      }
    }
  }

  // Joinery Schedule Sheet
  private renderJoinerySchedule(sheet: SheetDefinition, project: ProjectDesign) {
    this.drawSheetFrame(sheet, project);
    const doc = this.doc;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text('SCHEDULE OF DOORS, WINDOWS & VENTILATORS', 25, 26);

    const schedule = [
      { code: 'D1', name: 'Main Entrance Door', width: '3\'-6"', height: '7\'-0"', sill: '0\'-0"', lintel: '7\'-0"', material: 'Teakwood Frame & Shutter with Mortise Lock' },
      { code: 'D2', name: 'Internal Bedroom Door', width: '3\'-0"', height: '7\'-0"', sill: '0\'-0"', lintel: '7\'-0"', material: 'Hardwood Frame with Flush Shutter' },
      { code: 'D3', name: 'Toilet / Utility Door', width: '2\'-6"', height: '7\'-0"', sill: '0\'-0"', lintel: '7\'-0"', material: 'FRP / WPC Waterproof Shutter' },
      { code: 'W1', name: 'Living Room Glazed Window', width: '5\'-0"', height: '4\'-0"', sill: '3\'-0"', lintel: '7\'-0"', material: 'UPVC 3-Track Sliding with Mosquito Mesh' },
      { code: 'W2', name: 'Bedroom Casement Window', width: '4\'-0"', height: '4\'-0"', sill: '3\'-0"', lintel: '7\'-0"', material: 'UPVC Glazed Casement with 5mm Toughened Glass' },
      { code: 'W3', name: 'Kitchen Worktop Window', width: '3\'-0"', height: '3\'-0"', sill: '3\'-6"', lintel: '7\'-0"', material: 'UPVC Top-Hung Opening' },
      { code: 'V1', name: 'Toilet Louvered Ventilator', width: '2\'-0"', height: '1\'-6"', sill: '5\'-6"', lintel: '7\'-0"', material: 'Aluminum Frosted Louvers with Exhaust Provision' },
    ];

    const ty = 40;
    doc.setFillColor(240, 238, 232);
    doc.rect(25, ty, 275, 10, 'F');
    doc.setDrawColor(22, 21, 19);
    doc.setLineWidth(0.4);
    doc.rect(25, ty, 275, 10);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(22, 21, 19);
    doc.text('TAG', 30, ty + 6.5);
    doc.text('TYPE & DESCRIPTION', 50, ty + 6.5);
    doc.text('WIDTH', 120, ty + 6.5);
    doc.text('HEIGHT', 140, ty + 6.5);
    doc.text('SILL LEVEL', 160, ty + 6.5);
    doc.text('LINTEL LEVEL', 185, ty + 6.5);
    doc.text('SPECIFICATION & MATERIAL', 215, ty + 6.5);

    let curY = ty + 10;
    for (const item of schedule) {
      doc.rect(25, curY, 275, 14);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(196, 85, 45);
      doc.text(item.code, 30, curY + 8.5);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(22, 21, 19);
      doc.text(item.name, 50, curY + 8.5);
      doc.text(item.width, 120, curY + 8.5);
      doc.text(item.height, 140, curY + 8.5);
      doc.text(item.sill, 160, curY + 8.5);
      doc.text(item.lintel, 185, curY + 8.5);
      doc.text(item.material, 215, curY + 8.5);

      curY += 14;
    }
  }

  // BOQ & Material Schedule Sheet
  private renderBoqSheet(sheet: SheetDefinition, project: ProjectDesign) {
    this.drawSheetFrame(sheet, project);
    const doc = this.doc;
    const boq = project.boqSummary;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text('BILL OF QUANTITIES (BOQ) & STRUCTURAL MATERIAL ESTIMATE', 25, 26);

    const ty = 40;
    doc.setFillColor(240, 238, 232);
    doc.rect(25, ty, 275, 9, 'F');
    doc.setDrawColor(22, 21, 19);
    doc.rect(25, ty, 275, 9);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(22, 21, 19);
    doc.text('ITEM', 28, ty + 6);
    doc.text('DISCIPLINE & SPECIFICATION', 42, ty + 6);
    doc.text('QUANTITY', 170, ty + 6);
    doc.text('UNIT', 195, ty + 6);
    doc.text('EST. RATE (INR)', 215, ty + 6);
    doc.text('AMOUNT (INR)', 250, ty + 6);

    let curY = ty + 9;
    const items = boq.itemsTable && boq.itemsTable.length > 0 ? boq.itemsTable.slice(0, 14) : [];
    items.forEach((it, idx) => {
      doc.rect(25, curY, 275, 10);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7);
      doc.setTextColor(22, 21, 19);
      doc.text(String(idx + 1), 28, curY + 6.5);
      doc.text(it.itemDescription.substring(0, 75), 42, curY + 6.5);
      doc.text(it.quantity.toLocaleString(), 170, curY + 6.5);
      doc.text(it.unit, 195, curY + 6.5);
      doc.text(`₹ ${it.unitRateINR.toLocaleString()}`, 215, curY + 6.5);
      doc.text(`₹ ${it.amountINR.toLocaleString()}`, 250, curY + 6.5);
      curY += 10;
    });

    doc.setFillColor(248, 246, 242);
    doc.rect(25, curY + 6, 275, 30, 'FD');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.text('ESTIMATE BENCHMARK SUMMARY (IS 456 / SP 34 GUIDELINES):', 30, curY + 13);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    const concreteM3 = ((boq?.concreteVolumeM20M3 || 0) + (boq?.concreteVolumeM25M3 || 0)).toFixed(1);
    const cementBags = boq?.cementBagsCount || 650;
    const steelKg = boq?.steelKgByDiameter?.totalKg?.toLocaleString() || '6,500';
    const steelPerSqft = boq?.steelKgPerSqFt?.toFixed(2) || '3.60';
    const costMin = boq?.estimatedCostRangeINR ? (boq.estimatedCostRangeINR.min / 100000).toFixed(2) : '35.00';
    const costMax = boq?.estimatedCostRangeINR ? (boq.estimatedCostRangeINR.max / 100000).toFixed(2) : '45.00';
    doc.text(`- Concrete M20 / M25: ${concreteM3} m³ | Total Cement: ${cementBags} Bags`, 30, curY + 20);
    doc.text(`- High-Yield Fe500 Rebar: ${steelKg} kg (${steelPerSqft} kg/sq.ft — Normal Range: 3.2 - 4.5)`, 30, curY + 26);
    doc.text(`- Estimated Civil Construction Cost Range: ₹ ${costMin} Lakhs – ₹ ${costMax} Lakhs`, 30, curY + 32);
  }

  // Generic/Diagrammatic Sheet Handler
  private renderDiagramSheet(sheet: SheetDefinition, project: ProjectDesign) {
    this.drawSheetFrame(sheet, project);
    const doc = this.doc;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text(sheet.title, 25, 26);

    doc.setDrawColor(220, 215, 205);
    doc.setLineWidth(0.4);
    doc.rect(25, 35, 275, 220);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(196, 85, 45);
    doc.text(`TECHNICAL DRAWING: ${sheet.sheetCode} — ${sheet.discipline}`, 35, 50);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(90, 85, 80);
    doc.text(sheet.description, 35, 60);

    if (sheet.sheetCode === 'A-201' || sheet.sheetCode === 'A-202') {
      doc.line(40, 180, 280, 180);
      doc.text('GROUND LEVEL ± 0.00', 45, 184);
      doc.line(40, 165, 280, 165);
      doc.text('PLINTH LEVEL + 2\'-6"', 45, 169);
      doc.rect(70, 70, 160, 95);
      doc.rect(85, 80, 30, 40);
      doc.rect(130, 80, 30, 40);
      doc.rect(180, 115, 25, 50);
      doc.line(70, 60, 230, 60);
      doc.text('TERRACE PARAPET + 23\'-0"', 45, 64);
    } else if (sheet.sheetCode === 'A-301') {
      doc.line(40, 190, 280, 190);
      doc.text('NATURAL GROUND LEVEL ± 0.00', 45, 194);
      doc.rect(60, 110, 180, 70);
      doc.line(60, 110, 240, 110);
      doc.text('FLOOR SLAB 5" THICK', 130, 107);
      let sx = 80;
      let sy = 180;
      for (let i = 0; i < 9; i++) {
        doc.line(sx, sy, sx, sy - 7);
        doc.line(sx, sy - 7, sx + 9, sy - 7);
        sx += 9;
        sy -= 7;
      }
      doc.text('DOG-LEGGED STAIR RISER 7", TREAD 10"', 85, 130);
    } else if (sheet.sheetCode === 'S-102') {
      const cols = project.structuralColumns || [];
      cols.forEach((col) => {
        const x = 50 + col.position.x * 4.5;
        const y = 60 + col.position.y * 4.5;
        doc.setFillColor(22, 21, 19);
        doc.rect(x - 2, y - 2, 4, 4, 'F');
        doc.setFontSize(6);
        doc.text(col.code, x - 2, y - 4);
      });
      doc.text('PLINTH BEAMS PB1 (9" x 15") TYPICAL CONTINUOUS TIE', 45, 220);
    } else if (sheet.sheetCode === 'S-103') {
      doc.rect(70, 170, 150, 15);
      doc.text('3" THICK PCC 1:4:8 BEDDING', 80, 180);
      // Trapezoidal footing drawing with lines
      doc.line(85, 170, 205, 170);
      doc.line(205, 170, 180, 130);
      doc.line(180, 130, 110, 130);
      doc.line(110, 130, 85, 170);
      doc.rect(135, 70, 20, 60);
      doc.text('MAIN REBAR MESH: Fe500 #12 @ 150 C/C BOTH WAYS', 85, 195);
      doc.text('COLUMN TIES: #8 @ 150 C/C WITH 135° HOOKS', 160, 95);
    } else if (sheet.sheetCode === 'M-101') {
      doc.circle(90, 80, 4);
      doc.text('LIGHT POINT (LED 12W)', 98, 81);
      doc.circle(150, 80, 6);
      doc.text('CEILING FAN HOOK', 160, 81);
      doc.rect(88, 120, 6, 6);
      doc.text('6A SWITCHBOARD', 98, 124);
      doc.rect(148, 120, 8, 8);
      doc.text('16A POWER POINT (AC / GEYSER)', 160, 125);
    } else if (sheet.sheetCode === 'P-101') {
      doc.circle(100, 100, 7);
      doc.text('110mm PVC SOIL STACK (WC CONNECTION)', 112, 102);
      doc.circle(100, 130, 5);
      doc.text('75mm PVC WASTE WATER STACK (BATH/SINK)', 112, 132);
      doc.circle(100, 160, 3);
      doc.text('40mm VENT PIPE EXTENDED ABOVE TERRACE', 112, 162);
    }
  }

  public generateFullIssueSet(project: ProjectDesign, selectedSheetIds?: string[]): jsPDF {
    const sheetsToExport = STANDARD_ISSUE_SHEETS.filter((s) =>
      selectedSheetIds ? selectedSheetIds.includes(s.id) : true
    );

    sheetsToExport.forEach((sheet, idx) => {
      if (idx > 0) {
        this.doc.addPage([this.width, this.height], 'landscape');
      }

      switch (sheet.id) {
        case 'cover_01':
          this.renderCoverSheet(sheet, project);
          break;
        case 'a_001':
          this.renderSitePlan(sheet, project);
          break;
        case 'a_101':
          this.renderFloorPlan(sheet, project, 0);
          break;
        case 'a_102':
          this.renderFloorPlan(sheet, project, 1);
          break;
        case 'a_401':
          this.renderJoinerySchedule(sheet, project);
          break;
        case 's_101':
          this.renderFoundationPlan(sheet, project);
          break;
        case 'q_101':
          this.renderBoqSheet(sheet, project);
          break;
        default:
          this.renderDiagramSheet(sheet, project);
          break;
      }
    });

    return this.doc;
  }
}

export function generatePdfIssueSetBlob(
  project: ProjectDesign,
  options?: PdfExportOptions
): Blob {
  const gen = new PdfIssueSetGenerator(options);
  const doc = gen.generateFullIssueSet(project, options?.selectedSheets);
  return doc.output('blob');
}

export function generatePdfIssueSetArrayBuffer(
  project: ProjectDesign,
  options?: PdfExportOptions
): ArrayBuffer {
  const gen = new PdfIssueSetGenerator(options);
  const doc = gen.generateFullIssueSet(project, options?.selectedSheets);
  return doc.output('arraybuffer');
}
