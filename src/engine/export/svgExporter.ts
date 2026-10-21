import type { ProjectDesign, ArchitecturalFloor } from '../../types/project.ts';

export interface SvgExportOptions {
  floorIndex?: number;
  pixelsPerFoot?: number;
  showFurniture?: boolean;
  showColumns?: boolean;
  showGrid?: boolean;
  showDimensions?: boolean;
  paperBackground?: boolean;
}

export function exportFloorPlanToSvg(project: ProjectDesign, options: SvgExportOptions = {}): string {
  const ppf = options.pixelsPerFoot ?? 20; // 20 pixels per foot
  const floorIndex = options.floorIndex ?? 0;
  const floor: ArchitecturalFloor =
    project.floors.find((f) => f.floorIndex === floorIndex) || project.floors[0];

  const brief = project.briefSnapshot;
  const plotW = brief?.plot?.width || 30;
  const plotD = brief?.plot?.depth || 40;

  const marginX = 80;
  const marginY = 80;
  const titleBlockHeight = 110;

  const width = Math.max(800, plotW * ppf + marginX * 2);
  const height = plotD * ppf + marginY * 2 + titleBlockHeight;

  const ox = marginX;
  const oy = marginY;

  const toPxX = (x: number) => ox + x * ppf;
  const toPxY = (y: number) => oy + y * ppf;

  let svg = `<?xml version="1.0" encoding="UTF-8"?>\n`;
  svg += `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">\n`;
  svg += `<defs>\n`;
  svg += `  <style>\n`;
  svg += `    .bg { fill: ${options.paperBackground !== false ? '#FAF8F5' : '#FFFFFF'}; }\n`;
  svg += `    .plot-bnd { stroke: #161513; stroke-width: 1.5; stroke-dasharray: 6 3; fill: none; }\n`;
  svg += `    .setback-bnd { stroke: #C4552D; stroke-width: 0.8; stroke-dasharray: 4 4; fill: none; opacity: 0.5; }\n`;
  svg += `    .room-poly { fill: #F4EFEA; stroke: #161513; stroke-width: 1.2; }\n`;
  svg += `    .wall-ext { stroke: #161513; stroke-width: 6; stroke-linecap: square; }\n`;
  svg += `    .wall-int { stroke: #161513; stroke-width: 3; stroke-linecap: square; }\n`;
  svg += `    .opening-door { stroke: #C4552D; stroke-width: 1.5; }\n`;
  svg += `    .opening-window { stroke: #2563EB; stroke-width: 2.5; stroke-linecap: square; }\n`;
  svg += `    .door-swing { fill: none; stroke: #C4552D; stroke-width: 1; stroke-dasharray: 2 2; }\n`;
  svg += `    .col-shape { fill: #161513; stroke: #C4552D; stroke-width: 1; }\n`;
  svg += `    .text-title { font-family: 'Instrument Serif', Georgia, serif; font-size: 16px; font-weight: bold; fill: #161513; }\n`;
  svg += `    .text-sub { font-family: 'DM Sans', Inter, sans-serif; font-size: 10px; fill: #6B655B; letter-spacing: 0.05em; }\n`;
  svg += `    .text-room { font-family: 'DM Sans', Inter, sans-serif; font-size: 11px; font-weight: 600; fill: #161513; text-anchor: middle; }\n`;
  svg += `    .text-area { font-family: 'Courier New', monospace; font-size: 9px; fill: #8A857B; text-anchor: middle; }\n`;
  svg += `    .grid-line { stroke: #D6D0C4; stroke-width: 0.8; stroke-dasharray: 8 4; }\n`;
  svg += `    .disclaimer-box { fill: #FFF9F7; stroke: #C4552D; stroke-width: 1; }\n`;
  svg += `  </style>\n`;
  svg += `</defs>\n\n`;

  // Background
  svg += `<!-- Background -->\n<rect width="100%" height="100%" class="bg" />\n\n`;

  // Outer Border & Grid Rulers
  svg += `<!-- Architectural Border -->\n`;
  svg += `<rect x="15" y="15" width="${width - 30}" height="${height - 30}" fill="none" stroke="#161513" stroke-width="1.5" />\n`;
  svg += `<rect x="20" y="20" width="${width - 40}" height="${height - 40}" fill="none" stroke="#D6D0C4" stroke-width="0.75" />\n\n`;

  // Plot Boundary & Setback
  svg += `<!-- Plot Boundary & Setbacks -->\n`;
  svg += `<rect x="${toPxX(0)}" y="${toPxY(0)}" width="${plotW * ppf}" height="${plotD * ppf}" class="plot-bnd" />\n`;
  const sf = brief?.regulations?.setbacks?.frontFt ?? 5;
  const sr = brief?.regulations?.setbacks?.rearFt ?? 5;
  const sl = brief?.regulations?.setbacks?.side1Ft ?? 3.5;
  const srt = brief?.regulations?.setbacks?.side2Ft ?? 3.5;
  svg += `<rect x="${toPxX(sl)}" y="${toPxY(sf)}" width="${(plotW - sl - srt) * ppf}" height="${(plotD - sf - sr) * ppf}" class="setback-bnd" />\n\n`;

  // Rooms
  svg += `<!-- Room Polygons & Tags -->\n`;
  if (floor && floor.rooms) {
    for (const r of floor.rooms) {
      if (r.polygon && r.polygon.length >= 3) {
        const pts = r.polygon.map((p) => `${toPxX(p.x)},${toPxY(p.y)}`).join(' ');
        svg += `<polygon points="${pts}" class="room-poly" />\n`;

        // Centroid for text
        let cx = 0;
        let cy = 0;
        for (const p of r.polygon) {
          cx += p.x;
          cy += p.y;
        }
        cx /= r.polygon.length;
        cy /= r.polygon.length;

        svg += `<text x="${toPxX(cx)}" y="${toPxY(cy) - 4}" class="text-room">${r.name.toUpperCase()}</text>\n`;
        svg += `<text x="${toPxX(cx)}" y="${toPxY(cy) + 9}" class="text-area">${r.carpetAreaSqFt.toFixed(1)} SQ.FT</text>\n`;
      }
    }
  }

  // Walls
  svg += `\n<!-- Walls -->\n`;
  if (floor && floor.walls) {
    for (const w of floor.walls) {
      const cls = w.isExterior ? 'wall-ext' : 'wall-int';
      svg += `<line x1="${toPxX(w.start.x)}" y1="${toPxY(w.start.y)}" x2="${toPxX(w.end.x)}" y2="${toPxY(w.end.y)}" class="${cls}" />\n`;

      // Openings
      if (w.openings) {
        const dx = w.end.x - w.start.x;
        const dy = w.end.y - w.start.y;
        const len = Math.hypot(dx, dy);
        if (len > 0) {
          const ux = dx / len;
          const uy = dy / len;
          for (const op of w.openings) {
            const x1 = toPxX(w.start.x + ux * op.offsetFromStartFt);
            const y1 = toPxY(w.start.y + uy * op.offsetFromStartFt);
            const x2 = toPxX(w.start.x + ux * (op.offsetFromStartFt + op.widthFt));
            const y2 = toPxY(w.start.y + uy * (op.offsetFromStartFt + op.widthFt));
            if (op.type === 'DOOR') {
              svg += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" class="opening-door" />\n`;
            } else {
              svg += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" class="opening-window" />\n`;
            }
          }
        }
      }
    }
  }

  // Columns
  if (options.showColumns !== false && project.structuralColumns) {
    svg += `\n<!-- Structural Columns -->\n`;
    for (const col of project.structuralColumns) {
      const cx = toPxX(col.position.x);
      const cy = toPxY(col.position.y);
      const cw = (col.widthInches / 12) * ppf;
      const cd = (col.depthInches / 12) * ppf;
      svg += `<rect x="${cx - cw / 2}" y="${cy - cd / 2}" width="${cw}" height="${cd}" class="col-shape" />\n`;
    }
  }

  // North Arrow
  const naX = width - 70;
  const naY = 55;
  svg += `\n<!-- North Arrow -->\n`;
  svg += `<g transform="translate(${naX}, ${naY})">\n`;
  svg += `  <circle cx="0" cy="0" r="18" fill="none" stroke="#161513" stroke-width="1.2" />\n`;
  svg += `  <polygon points="0,-15 5,-2 0,-5" fill="#C4552D" />\n`;
  svg += `  <polygon points="0,-15 -5,-2 0,-5" fill="#161513" />\n`;
  svg += `  <line x1="0" y1="0" x2="0" y2="15" stroke="#161513" stroke-width="1" />\n`;
  svg += `  <text x="0" y="-18" font-family="'DM Sans', sans-serif" font-size="10" font-weight="bold" fill="#C4552D" text-anchor="middle">N</text>\n`;
  svg += `</g>\n`;

  // Scale Bar
  const sbX = ox;
  const sbY = height - titleBlockHeight - 15;
  svg += `\n<!-- Graphical Scale Bar -->\n`;
  svg += `<g transform="translate(${sbX}, ${sbY})">\n`;
  svg += `  <line x1="0" y1="0" x2="${10 * ppf}" y2="0" stroke="#161513" stroke-width="2" />\n`;
  svg += `  <line x1="0" y1="-4" x2="0" y2="4" stroke="#161513" stroke-width="2" />\n`;
  svg += `  <line x1="${5 * ppf}" y1="-3" x2="${5 * ppf}" y2="3" stroke="#161513" stroke-width="1.5" />\n`;
  svg += `  <line x1="${10 * ppf}" y1="-4" x2="${10 * ppf}" y2="4" stroke="#161513" stroke-width="2" />\n`;
  svg += `  <text x="0" y="-6" font-family="'DM Sans', sans-serif" font-size="8" fill="#161513" text-anchor="middle">0</text>\n`;
  svg += `  <text x="${5 * ppf}" y="-6" font-family="'DM Sans', sans-serif" font-size="8" fill="#161513" text-anchor="middle">5'</text>\n`;
  svg += `  <text x="${10 * ppf}" y="-6" font-family="'DM Sans', sans-serif" font-size="8" fill="#161513" text-anchor="middle">10 FT</text>\n`;
  svg += `</g>\n`;

  // Professional Title Block
  const tbX = 25;
  const tbY = height - titleBlockHeight - 5;
  const tbW = width - 50;
  const tbH = titleBlockHeight - 15;

  svg += `\n<!-- Professional Title Block -->\n`;
  svg += `<rect x="${tbX}" y="${tbY}" width="${tbW}" height="${tbH}" fill="#FFFFFF" stroke="#161513" stroke-width="1" />\n`;
  svg += `<line x1="${tbX + 260}" y1="${tbY}" x2="${tbX + 260}" y2="${tbY + tbH}" stroke="#D6D0C4" stroke-width="1" />\n`;
  svg += `<line x1="${tbX + 540}" y1="${tbY}" x2="${tbX + 540}" y2="${tbY + tbH}" stroke="#D6D0C4" stroke-width="1" />\n`;

  // Col 1: Studio & Scheme
  svg += `<text x="${tbX + 15}" y="${tbY + 22}" class="text-title">MY3 DESIGNS STUDIO</text>\n`;
  svg += `<text x="${tbX + 15}" y="${tbY + 38}" class="text-sub">ARCHITECTURAL DESIGN &amp; DOCUMENTATION ENGINE</text>\n`;
  svg += `<text x="${tbX + 15}" y="${tbY + 56}" class="text-sub">SCHEME: ${project.conceptTitle}</text>\n`;
  svg += `<text x="${tbX + 15}" y="${tbY + 70}" class="text-sub">TYPOLOGY: ${project.archetype}</text>\n`;

  // Col 2: Drawing Info
  svg += `<text x="${tbX + 280}" y="${tbY + 22}" class="text-title">${floor.floorName.toUpperCase()} PLAN</text>\n`;
  svg += `<text x="${tbX + 280}" y="${tbY + 38}" class="text-sub">DRAWING NO: MY3-ARC-10${floorIndex + 1} | REV: 0</text>\n`;
  svg += `<text x="${tbX + 280}" y="${tbY + 56}" class="text-sub">BUILT-UP AREA: ${floor.builtUpAreaSqFt} SQ.FT | CARPET: ${floor.carpetAreaSqFt} SQ.FT</text>\n`;
  svg += `<text x="${tbX + 280}" y="${tbY + 70}" class="text-sub">SCALE: 1:100 (OR 1/4" = 1\'-0") | ORIENTATION: ${brief?.plot?.roadFacingSide || 'NORTH'}</text>\n`;

  // Col 3: Disclaimer
  svg += `<rect x="${tbX + 555}" y="${tbY + 10}" width="${tbW - 570}" height="${tbH - 20}" class="disclaimer-box" />\n`;
  svg += `<text x="${tbX + 565}" y="${tbY + 26}" font-family="'DM Sans', sans-serif" font-size="9" font-weight="bold" fill="#C4552D">PRELIMINARY ENGINEERING INTENT</text>\n`;
  svg += `<text x="${tbX + 565}" y="${tbY + 40}" font-family="'DM Sans', sans-serif" font-size="7.5" fill="#6B655B">Must be verified and signed by a licensed structural engineer</text>\n`;
  svg += `<text x="${tbX + 565}" y="${tbY + 52}" font-family="'DM Sans', sans-serif" font-size="7.5" fill="#6B655B">&amp; local planning authority (CMDA / DTCP) before construction.</text>\n`;
  svg += `<text x="${tbX + 565}" y="${tbY + 66}" font-family="'DM Sans', sans-serif" font-size="7.5" fill="#8A857B">Issued for planning &amp; architectural design estimation only.</text>\n`;

  svg += `</svg>\n`;
  return svg;
}
