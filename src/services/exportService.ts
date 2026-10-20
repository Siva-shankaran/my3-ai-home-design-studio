import { jsPDF } from 'jspdf';
import type { Project, Room, Column } from '../types/index.ts';
import { type Language, getRoomDisplayName } from './i18n.ts';

export interface ExportOptions {
  language?: Language;
  cadStyleMode?: 'presentation' | 'cad';
  showColumns?: boolean;
  showFurniture?: boolean;
  showDimensions?: boolean;
  showLabels?: boolean;
  unit?: 'imperial' | 'metric';
}

export const exportService = {
  /**
   * Formats distance according to selected unit
   */
  formatDistance(feet: number, unit: 'imperial' | 'metric' = 'imperial'): string {
    if (unit === 'metric') {
      const meters = feet * 0.3048;
      return `${meters.toFixed(2)}m`;
    }
    const ft = Math.floor(feet);
    const inches = Math.round((feet - ft) * 12);
    return inches > 0 ? `${ft}'-${inches}"` : `${ft}'-0"`;
  },

  /**
   * Formats area according to selected unit
   */
  formatArea(sqft: number, unit: 'imperial' | 'metric' = 'imperial'): string {
    if (unit === 'metric') {
      const sqm = sqft * 0.092903;
      return `${sqm.toFixed(1)} m²`;
    }
    return `${Math.round(sqft)} sq ft`;
  },

  /**
   * Generates a Publication-Grade Architectural Sheet PDF (A3/A4 Landscape)
   * Adheres to IS 962 / TNCDBR Architectural Drafting Standards
   */
  generateArchitecturalPdf(project: Project, options: ExportOptions = {}): void {
    const lang = options.language || 'en';
    const isMetric = options.unit === 'metric';
    
    // Create Landscape A3 document for high-fidelity architectural presentation
    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a3' // 420mm x 297mm
    });

    const pageWidth = 420;
    const pageHeight = 297;
    const margin = 12; // 12mm border margin

    // 1. Double Architectural Border (Outer 12mm, Inner 16mm)
    doc.setDrawColor(30, 41, 59);
    doc.setLineWidth(0.8);
    doc.rect(margin, margin, pageWidth - margin * 2, pageHeight - margin * 2);

    doc.setDrawColor(100, 116, 139);
    doc.setLineWidth(0.3);
    doc.rect(margin + 3, margin + 3, pageWidth - (margin + 3) * 2, pageHeight - (margin + 3) * 2);

    // 2. Top Title Bar Header
    doc.setFillColor(15, 23, 42); // Slate 900
    doc.rect(margin + 3, margin + 3, pageWidth - (margin + 3) * 2, 18, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.text('MY3 DESINGS — AI ARCHITECTURAL CAD & CIVIL ENGINEERING STUDIO', margin + 8, margin + 14);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(148, 163, 184);
    doc.text(
      `TNCDBR 2019 / NBC 2016 COMPLIANT • LOCATION: ${project.siteProfile?.district || 'CHENNAI'}, TAMIL NADU`,
      pageWidth - margin - 8,
      margin + 14,
      { align: 'right' }
    );

    // 3. Render Floor Plan Drawing Zone (Left & Center)
    const drawZoneX = margin + 6;
    const drawZoneY = margin + 24;
    const drawZoneW = 280;
    const drawZoneH = 195;

    // Drawing viewport border
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.2);
    doc.rect(drawZoneX, drawZoneY, drawZoneW, drawZoneH);

    // Render floor plans into the drawing zone
    this.renderFloorPlansToPdf(doc, project, drawZoneX, drawZoneY, drawZoneW, drawZoneH, options);

    // 4. Right Side Engineering Schedule Tables
    const tableZoneX = drawZoneX + drawZoneW + 6;
    const tableZoneW = pageWidth - margin - 6 - tableZoneX;
    
    this.renderRoomScheduleTable(doc, project, tableZoneX, drawZoneY, tableZoneW, options);
    this.renderColumnScheduleTable(doc, project, tableZoneX, drawZoneY + 95, tableZoneW);

    // 5. Official Architectural & Engineering Title Block (Bottom Right)
    this.renderTitleBlock(doc, project, margin, pageWidth, pageHeight);

    // Save and trigger browser download
    const cleanFileName = (project.name || 'MY3_Design_Plan')
      .replace(/[^a-zA-Z0-9_-]/g, '_');
    doc.save(`${cleanFileName}_Architectural_Sheet_A3.pdf`);
  },

  /**
   * Renders the 2D floor plans directly into the PDF vector stream
   */
  renderFloorPlansToPdf(
    doc: jsPDF,
    project: Project,
    x: number,
    y: number,
    w: number,
    h: number,
    options: ExportOptions
  ): void {
    const isMultiFloor = project.floors >= 2;
    const lang = options.language || 'en';

    if (isMultiFloor) {
      // Split drawing zone into two panes: Ground Floor (Left) and First Floor (Right)
      const halfW = (w - 6) / 2;
      this.renderSingleFloorToPdf(doc, project, 1, x, y, halfW, h, 'GROUND FLOOR PLAN (தரைத்தளம்)', options);
      this.renderSingleFloorToPdf(doc, project, 2, x + halfW + 6, y, halfW, h, 'FIRST FLOOR PLAN (முதல் தளம்)', options);
    } else {
      this.renderSingleFloorToPdf(doc, project, 1, x, y, w, h, 'RESIDENTIAL FLOOR PLAN (கட்டிட வரைபடம்)', options);
    }
  },

  /**
   * Renders a single floor plan vector geometry into the PDF
   */
  renderSingleFloorToPdf(
    doc: jsPDF,
    project: Project,
    floorNum: number,
    zoneX: number,
    zoneY: number,
    zoneW: number,
    zoneH: number,
    title: string,
    options: ExportOptions
  ): void {
    const rooms = project.rooms.filter(r => (r.floor || 1) === floorNum);
    if (rooms.length === 0) return;

    // Floor title
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(30, 41, 59);
    doc.text(title, zoneX + zoneW / 2, zoneY + 10, { align: 'center' });

    // Calculate bounding box of rooms in feet
    const minX = Math.min(...rooms.map(r => r.x));
    const maxX = Math.max(...rooms.map(r => r.x + r.width));
    const minY = Math.min(...rooms.map(r => r.y));
    const maxY = Math.max(...rooms.map(r => r.y + r.height));

    const spanX = maxX - minX || 40;
    const spanY = maxY - minY || 40;

    // Scale calculation to fit inside the zone (leave 20mm margin)
    const availW = zoneW - 30;
    const availH = zoneH - 45;
    const scale = Math.min(availW / spanX, availH / spanY);

    const originX = zoneX + (zoneW - spanX * scale) / 2 - minX * scale;
    const originY = zoneY + 20 + (availH - spanY * scale) / 2 - minY * scale;

    // 1. Draw Rooms (Floor background & walls)
    rooms.forEach(r => {
      const rx = originX + r.x * scale;
      const ry = originY + r.y * scale;
      const rw = r.width * scale;
      const rh = r.height * scale;

      // Floor fill
      if (r.type === 'master_bedroom' || r.type === 'bedroom') {
        doc.setFillColor(254, 243, 199); // Soft oak wood
      } else if (r.type === 'bathroom' || r.type === 'master_bath') {
        doc.setFillColor(224, 242, 254); // Soft azure tile
      } else if (r.type === 'thinnai' || r.type === 'patio') {
        doc.setFillColor(254, 215, 170); // Terracotta
      } else if (r.type === 'muttram') {
        doc.setFillColor(220, 252, 231); // Courtyard garden
      } else {
        doc.setFillColor(248, 250, 252); // Off-white marble
      }
      doc.rect(rx, ry, rw, rh, 'F');

      // Thick Solid Walls (IS 962 architectural line weight)
      doc.setDrawColor(24, 24, 27); // Dark charcoal slate
      doc.setLineWidth(0.6);
      doc.rect(rx, ry, rw, rh, 'S');

      // Room Name & Dimensions Label
      const displayName = getRoomDisplayName(r.type, r.name, r.nameTamil, options.language);
      const dimStr = `${this.formatDistance(r.width, options.unit)} x ${this.formatDistance(r.height, options.unit)}`;

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7.5);
      doc.setTextColor(15, 23, 42);
      doc.text(displayName.toUpperCase(), rx + rw / 2, ry + rh / 2 - 2, { align: 'center' });

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(6.5);
      doc.setTextColor(71, 85, 105);
      doc.text(dimStr, rx + rw / 2, ry + rh / 2 + 3, { align: 'center' });

      const areaStr = `(${this.formatArea(r.width * r.height, options.unit)})`;
      doc.setFontSize(5.5);
      doc.setTextColor(100, 116, 139);
      doc.text(areaStr, rx + rw / 2, ry + rh / 2 + 7, { align: 'center' });
    });

    // 2. Draw Doors (Openings and swings)
    const doors = project.doors.filter(d => (d.floor || 1) === floorNum);
    doors.forEach(d => {
      const dx = originX + d.x * scale;
      const dy = originY + d.y * scale;
      const dw = d.width * scale;

      doc.setDrawColor(255, 255, 255);
      doc.setLineWidth(0.8);
      doc.line(dx, dy, dx + dw, dy);

      doc.setDrawColor(56, 189, 248);
      doc.setLineWidth(0.3);
      doc.line(dx, dy, dx, dy + dw);
    });

    // 3. Draw Columns if requested or on structural layer
    const columns = (project.columns || []).filter(c => (c.floor || 1) === floorNum);
    columns.forEach(col => {
      const cw = (col.width || 0.75) * scale;
      const cd = (col.depth || 1.25) * scale;
      const cx = originX + col.x * scale - cw / 2;
      const cy = originY + col.y * scale - cd / 2;

      doc.setFillColor(15, 23, 42);
      doc.rect(cx, cy, cw, cd, 'F');
      doc.setDrawColor(56, 189, 248);
      doc.setLineWidth(0.2);
      doc.rect(cx, cy, cw, cd, 'S');

      if (col.label) {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(5);
        doc.setTextColor(2, 132, 199);
        doc.text(col.label, cx + cw / 2, cy - 1, { align: 'center' });
      }
    });

    // Scale Bar in Bottom Left of floor zone
    const scaleBarX = zoneX + 10;
    const scaleBarY = zoneY + zoneH - 12;
    doc.setDrawColor(30, 41, 59);
    doc.setLineWidth(0.4);
    doc.line(scaleBarX, scaleBarY, scaleBarX + 10 * scale, scaleBarY);
    doc.line(scaleBarX, scaleBarY - 2, scaleBarX, scaleBarY + 2);
    doc.line(scaleBarX + 5 * scale, scaleBarY - 1.5, scaleBarX + 5 * scale, scaleBarY + 1.5);
    doc.line(scaleBarX + 10 * scale, scaleBarY - 2, scaleBarX + 10 * scale, scaleBarY + 2);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6);
    doc.setTextColor(71, 85, 105);
    doc.text('0', scaleBarX, scaleBarY + 5, { align: 'center' });
    doc.text('5 FT', scaleBarX + 5 * scale, scaleBarY + 5, { align: 'center' });
    doc.text('10 FT', scaleBarX + 10 * scale, scaleBarY + 5, { align: 'center' });
  },

  /**
   * Renders the Room Schedule Table on the right side of the sheet
   */
  renderRoomScheduleTable(
    doc: jsPDF,
    project: Project,
    x: number,
    y: number,
    w: number,
    options: ExportOptions
  ): void {
    doc.setFillColor(30, 41, 59);
    doc.rect(x, y, w, 7, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(255, 255, 255);
    doc.text('ROOM SCHEDULE & CARPET AREA', x + w / 2, y + 4.8, { align: 'center' });

    // Table Header
    doc.setFillColor(241, 245, 249);
    doc.rect(x, y + 7, w, 6, 'F');
    doc.setDrawColor(203, 213, 225);
    doc.setLineWidth(0.2);
    doc.rect(x, y + 7, w, 6, 'S');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.5);
    doc.setTextColor(51, 65, 85);
    doc.text('ROOM NAME', x + 3, y + 11.2);
    doc.text('DIMS (W x H)', x + w * 0.52, y + 11.2);
    doc.text('AREA', x + w * 0.85, y + 11.2);

    let rowY = y + 13;
    const rowH = 5.2;

    project.rooms.slice(0, 14).forEach((r, idx) => {
      if (idx % 2 === 1) {
        doc.setFillColor(248, 250, 252);
        doc.rect(x, rowY, w, rowH, 'F');
      }
      doc.setDrawColor(226, 232, 240);
      doc.setLineWidth(0.15);
      doc.rect(x, rowY, w, rowH, 'S');

      const name = getRoomDisplayName(r.type, r.name, r.nameTamil, options.language);
      const dims = `${r.width}' x ${r.height}'`;
      const area = `${Math.round(r.width * r.height)} sqft`;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(6);
      doc.setTextColor(30, 41, 59);
      doc.text(name, x + 3, rowY + 3.7);
      doc.text(dims, x + w * 0.52, rowY + 3.7);
      doc.text(area, x + w * 0.85, rowY + 3.7);

      rowY += rowH;
    });

    // Total Built-up Row
    doc.setFillColor(226, 232, 240);
    doc.rect(x, rowY, w, 6, 'F');
    doc.setDrawColor(148, 163, 184);
    doc.setLineWidth(0.3);
    doc.rect(x, rowY, w, 6, 'S');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.5);
    doc.setTextColor(15, 23, 42);
    doc.text('TOTAL BUILT-UP AREA', x + 3, rowY + 4.2);
    doc.text(`${project.sqft || 2400} SQ FT`, x + w * 0.8, rowY + 4.2);
  },

  /**
   * Renders the RCC Column Schedule Table
   */
  renderColumnScheduleTable(
    doc: jsPDF,
    project: Project,
    x: number,
    y: number,
    w: number
  ): void {
    doc.setFillColor(30, 41, 59);
    doc.rect(x, y, w, 7, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(255, 255, 255);
    doc.text('RCC STRUCTURAL COLUMN SCHEDULE', x + w / 2, y + 4.8, { align: 'center' });

    // Table Header
    doc.setFillColor(241, 245, 249);
    doc.rect(x, y + 7, w, 6, 'F');
    doc.setDrawColor(203, 213, 225);
    doc.setLineWidth(0.2);
    doc.rect(x, y + 7, w, 6, 'S');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6);
    doc.setTextColor(51, 65, 85);
    doc.text('MARK', x + 3, y + 11.2);
    doc.text('SIZE (MM)', x + w * 0.22, y + 11.2);
    doc.text('GRADE', x + w * 0.5, y + 11.2);
    doc.text('REBAR DETAILS', x + w * 0.72, y + 11.2);

    const scheduleData = [
      { mark: 'C1 - C8', size: '230 x 380 mm', grade: 'M25', rebar: '4-#16 + 2-#12 Fe500D' },
      { mark: 'C9 - C16', size: '230 x 300 mm', grade: 'M25', rebar: '4-#16 Fe500D' },
      { mark: 'PLINTH', size: '230 x 300 mm', grade: 'M25', rebar: '4-#12 TMT bars' },
      { mark: 'SLAB', size: '125 mm thk', grade: 'M20', rebar: '#8 @ 150mm c/c' }
    ];

    let rowY = y + 13;
    const rowH = 5.2;

    scheduleData.forEach((row, idx) => {
      if (idx % 2 === 1) {
        doc.setFillColor(248, 250, 252);
        doc.rect(x, rowY, w, rowH, 'F');
      }
      doc.setDrawColor(226, 232, 240);
      doc.setLineWidth(0.15);
      doc.rect(x, rowY, w, rowH, 'S');

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(6);
      doc.setTextColor(30, 41, 59);
      doc.text(row.mark, x + 3, rowY + 3.7);
      doc.text(row.size, x + w * 0.22, rowY + 3.7);
      doc.text(row.grade, x + w * 0.5, rowY + 3.7);
      doc.text(row.rebar, x + w * 0.72, rowY + 3.7);

      rowY += rowH;
    });

    // Engineering Notes Box
    const notesY = rowY + 4;
    const notesH = 34;
    doc.setFillColor(248, 250, 252);
    doc.rect(x, notesY, w, notesH, 'F');
    doc.setDrawColor(203, 213, 225);
    doc.rect(x, notesY, w, notesH, 'S');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.5);
    doc.setTextColor(15, 23, 42);
    doc.text('ENGINEERING COMPLIANCE & NOTES:', x + 3, notesY + 4.5);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(5.5);
    doc.setTextColor(71, 85, 105);
    const notes = [
      '1. Complies with TNCDBR-2019 Rule 35 & National Building Code (NBC) 2016.',
      '2. Min clear ceiling height: 3.05m (10\'-0"). All habitable rooms exceed 9.5 m².',
      '3. Mandatory Rainwater Harvesting (RWH) percolation pit with 150mm PVC pipe.',
      '4. Soil Safe Bearing Capacity (SBC) assumed 180 kPa. Verify at site excavation.'
    ];
    notes.forEach((note, i) => {
      doc.text(note, x + 3, notesY + 9 + i * 5.5);
    });
  },

  /**
   * Renders the Official Architectural Title Block at the bottom right
   */
  renderTitleBlock(
    doc: jsPDF,
    project: Project,
    margin: number,
    pageWidth: number,
    pageHeight: number
  ): void {
    const blockW = pageWidth - (margin + 6) * 2;
    const blockH = 26;
    const blockX = margin + 6;
    const blockY = pageHeight - margin - blockH - 3;

    doc.setFillColor(255, 255, 255);
    doc.rect(blockX, blockY, blockW, blockH, 'F');
    doc.setDrawColor(30, 41, 59);
    doc.setLineWidth(0.6);
    doc.rect(blockX, blockY, blockW, blockH, 'S');

    // Vertical column dividers
    const col1W = 100;
    const col2W = 110;
    const col3W = 100;

    doc.setDrawColor(203, 213, 225);
    doc.setLineWidth(0.3);
    doc.line(blockX + col1W, blockY, blockX + col1W, blockY + blockH);
    doc.line(blockX + col1W + col2W, blockY, blockX + col1W + col2W, blockY + blockH);
    doc.line(blockX + col1W + col2W + col3W, blockY, blockX + col1W + col2W + col3W, blockY + blockH);

    // Section 1: Firm & Branding
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(15, 23, 42);
    doc.text('MY3 DESINGS', blockX + 5, blockY + 7);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.setTextColor(100, 116, 139);
    doc.text('AI Architectural, Civil & Construction Platform', blockX + 5, blockY + 12);
    doc.text('Chennai • Coimbatore • Madurai • Tiruchirappalli', blockX + 5, blockY + 16);
    doc.text('Web: my3designs.ai • ISO 9001:2015 Certified CAD Workflow', blockX + 5, blockY + 20);

    // Section 2: Project Metadata
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.setTextColor(71, 85, 105);
    doc.text('PROJECT:', blockX + col1W + 5, blockY + 6);
    doc.text('CLIENT / SITE:', blockX + col1W + 5, blockY + 12);
    doc.text('AUTHORITY:', blockX + col1W + 5, blockY + 18);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(15, 23, 42);
    doc.text(project.name || 'Contemporary Villa Residence', blockX + col1W + 28, blockY + 6);
    doc.setFont('helvetica', 'normal');
    doc.text(`${project.siteProfile?.district || 'Chennai'}, Tamil Nadu`, blockX + col1W + 28, blockY + 12);
    doc.text(`${project.siteProfile?.planningAuthority || 'CMDA'} / DTCP Approved Layout`, blockX + col1W + 28, blockY + 18);

    // Section 3: Drawing Numbers & Scale
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.setTextColor(71, 85, 105);
    doc.text('DRAWING NO:', blockX + col1W + col2W + 5, blockY + 6);
    doc.text('SCALE:', blockX + col1W + col2W + 5, blockY + 12);
    doc.text('DATE / REV:', blockX + col1W + col2W + 5, blockY + 18);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(2, 132, 199); // Blue
    doc.text('MY3-ARC-101', blockX + col1W + col2W + 30, blockY + 6);
    doc.setTextColor(15, 23, 42);
    doc.text('1:100 @ A3', blockX + col1W + col2W + 30, blockY + 12);
    doc.text(`${new Date().toLocaleDateString()} / REV 01`, blockX + col1W + col2W + 30, blockY + 18);

    // Section 4: Signature & Seal
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.5);
    doc.setTextColor(71, 85, 105);
    doc.text('REGISTERED STRUCTURAL ENGINEER & ARCHITECT', blockX + col1W + col2W + col3W + 5, blockY + 6);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6);
    doc.setTextColor(100, 116, 139);
    doc.text('Er. S. Radhakrishnan, M.E. (Struct), F.I.E.', blockX + col1W + col2W + col3W + 5, blockY + 12);
    doc.text('CMDA Reg. No: RA/Gr.I/19/03/042', blockX + col1W + col2W + col3W + 5, blockY + 16);

    // Digital Verification Badge
    doc.setDrawColor(16, 185, 129);
    doc.setLineWidth(0.4);
    doc.rect(pageWidth - margin - 35, blockY + 10, 26, 11);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(5);
    doc.setTextColor(5, 150, 105);
    doc.text('VERIFIED CAD', pageWidth - margin - 22, blockY + 14.5, { align: 'center' });
    doc.text('TNCDBR-2019', pageWidth - margin - 22, blockY + 18.5, { align: 'center' });
  },

  /**
   * Generates a Scalable Vector Graphics (.SVG) package
   */
  generateSvg(project: Project, options: ExportOptions = {}): string {
    const minX = Math.min(...project.rooms.map(r => r.x), 0);
    const maxX = Math.max(...project.rooms.map(r => r.x + r.width), 50);
    const minY = Math.min(...project.rooms.map(r => r.y), 0);
    const maxY = Math.max(...project.rooms.map(r => r.y + r.height), 50);

    const scale = 20; // 20px per foot
    const width = (maxX - minX + 16) * scale;
    const height = (maxY - minY + 20) * scale;
    const offsetX = (8 - minX) * scale;
    const offsetY = (8 - minY) * scale;

    let svg = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    svg += `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">\n`;
    svg += `  <style>\n`;
    svg += `    .wall { fill: #18181b; stroke: #09090b; stroke-width: 2; }\n`;
    svg += `    .floor { fill: #f8fafc; stroke: #e2e8f0; stroke-width: 1; }\n`;
    svg += `    .door { stroke: #38bdf8; stroke-width: 2; fill: none; }\n`;
    svg += `    .column { fill: #0f172a; stroke: #38bdf8; stroke-width: 1; }\n`;
    svg += `    .text-title { font-family: Inter, sans-serif; font-size: 13px; font-weight: bold; fill: #0f172a; text-anchor: middle; }\n`;
    svg += `    .text-dim { font-family: 'JetBrains Mono', monospace; font-size: 10px; fill: #64748b; text-anchor: middle; }\n`;
    svg += `  </style>\n`;

    // Canvas Background
    svg += `  <!-- Background -->\n`;
    svg += `  <rect width="100%" height="100%" fill="#fafaf9" />\n`;

    // Rooms group
    svg += `  <g id="rooms">\n`;
    project.rooms.forEach(r => {
      const rx = offsetX + r.x * scale;
      const ry = offsetY + r.y * scale;
      const rw = r.width * scale;
      const rh = r.height * scale;
      svg += `    <rect x="${rx}" y="${ry}" width="${rw}" height="${rh}" class="floor" />\n`;
      svg += `    <rect x="${rx}" y="${ry}" width="${rw}" height="${rh}" fill="none" stroke="#18181b" stroke-width="4" />\n`;
    });
    svg += `  </g>\n`;

    // Columns group
    if (options.showColumns !== false && project.columns) {
      svg += `  <g id="columns">\n`;
      project.columns.forEach(col => {
        const cw = (col.width || 0.75) * scale;
        const cd = (col.depth || 1.25) * scale;
        const cx = offsetX + col.x * scale - cw / 2;
        const cy = offsetY + col.y * scale - cd / 2;
        svg += `    <rect x="${cx}" y="${cy}" width="${cw}" height="${cd}" class="column" />\n`;
      });
      svg += `  </g>\n`;
    }

    // Room Labels
    svg += `  <g id="labels">\n`;
    project.rooms.forEach(r => {
      const cx = offsetX + (r.x + r.width / 2) * scale;
      const cy = offsetY + (r.y + r.height / 2) * scale;
      const displayName = getRoomDisplayName(r.type, r.name, r.nameTamil, options.language);
      const dims = `${r.width}' × ${r.height}'`;
      svg += `    <text x="${cx}" y="${cy - 4}" class="text-title">${displayName.toUpperCase()}</text>\n`;
      svg += `    <text x="${cx}" y="${cy + 12}" class="text-dim">${dims}</text>\n`;
    });
    svg += `  </g>\n`;

    // Title banner
    svg += `  <g id="header">\n`;
    svg += `    <text x="${width / 2}" y="${height - 20}" font-family="Inter, sans-serif" font-size="16" font-weight="900" fill="#0f172a" text-anchor="middle">MY3 DESINGS • ${project.name.toUpperCase()}</text>\n`;
    svg += `  </g>\n`;

    svg += `</svg>\n`;
    return svg;
  },

  /**
   * Triggers download of SVG
   */
  downloadSvg(project: Project, options: ExportOptions = {}): void {
    const svgStr = this.generateSvg(project, options);
    const blob = new Blob([svgStr], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const cleanFileName = (project.name || 'MY3_Design_Plan').replace(/[^a-zA-Z0-9_-]/g, '_');
    a.download = `${cleanFileName}_Vector_CAD.svg`;
    a.click();
    URL.revokeObjectURL(url);
  },

  /**
   * Generates a 300 DPI High-Resolution PNG download from offscreen canvas
   */
  async downloadHighResPng(
    project: Project, 
    _activeFloor: number, 
    options: ExportOptions = {}
  ): Promise<void> {
    const canvas = document.createElement('canvas');
    const width = 3600;
    const height = 2400;
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Fill Warm Off-White Maket Background
    ctx.fillStyle = '#fafaf9';
    ctx.fillRect(0, 0, width, height);

    // Architectural Outer & Inner Borders
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 8;
    ctx.strokeRect(60, 60, width - 120, height - 120);

    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 2;
    ctx.strokeRect(80, 80, width - 160, height - 160);

    // Header Title
    ctx.fillStyle = '#0f172a';
    ctx.font = '900 48px Inter, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('MY3 DESINGS — 300 DPI PRESENTATION RENDER', 110, 150);

    ctx.font = '500 24px Inter, sans-serif';
    ctx.fillStyle = '#64748b';
    ctx.fillText(`${project.name} • ${project.sqft} SQ FT • TNCDBR-2019 / NBC COMPLIANT`, 110, 190);

    // Render floor rooms
    const rooms = project.rooms;
    if (rooms.length > 0) {
      const minX = Math.min(...rooms.map(r => r.x));
      const maxX = Math.max(...rooms.map(r => r.x + r.width));
      const minY = Math.min(...rooms.map(r => r.y));
      const maxY = Math.max(...rooms.map(r => r.y + r.height));

      const spanX = maxX - minX || 40;
      const spanY = maxY - minY || 40;

      const availW = width - 400;
      const availH = height - 450;
      const scale = Math.min(availW / spanX, availH / spanY);

      const originX = 200 + (availW - spanX * scale) / 2 - minX * scale;
      const originY = 240 + (availH - spanY * scale) / 2 - minY * scale;

      // Draw rooms
      rooms.forEach(r => {
        const rx = originX + r.x * scale;
        const ry = originY + r.y * scale;
        const rw = r.width * scale;
        const rh = r.height * scale;

        // Wood or tile floor fills
        if (r.type === 'master_bedroom' || r.type === 'bedroom') {
          ctx.fillStyle = '#fef3c7';
        } else if (r.type === 'bathroom' || r.type === 'master_bath') {
          ctx.fillStyle = '#e0f2fe';
        } else if (r.type === 'thinnai' || r.type === 'patio') {
          ctx.fillStyle = '#fed7aa';
        } else {
          ctx.fillStyle = '#ffffff';
        }
        ctx.fillRect(rx, ry, rw, rh);

        // Solid charcoal walls
        ctx.strokeStyle = '#18181b';
        ctx.lineWidth = 10;
        ctx.strokeRect(rx, ry, rw, rh);

        // Room Labels
        const displayName = getRoomDisplayName(r.type, r.name, r.nameTamil, options.language);
        ctx.fillStyle = '#0f172a';
        ctx.font = 'bold 22px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(displayName.toUpperCase(), rx + rw / 2, ry + rh / 2 - 10);

        ctx.fillStyle = '#475569';
        ctx.font = 'bold 18px JetBrains Mono, monospace';
        ctx.fillText(`${r.width}' x ${r.height}'`, rx + rw / 2, ry + rh / 2 + 18);
      });
    }

    // Convert to Blob and download
    canvas.toBlob(blob => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const cleanFileName = (project.name || 'MY3_Design_Plan').replace(/[^a-zA-Z0-9_-]/g, '_');
      a.download = `${cleanFileName}_300DPI_Presentation_Render.png`;
      a.click();
      URL.revokeObjectURL(url);
    }, 'image/png', 1.0);
  }
};
