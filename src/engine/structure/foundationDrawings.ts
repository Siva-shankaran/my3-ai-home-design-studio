import type { ColumnInstance, FootingInstance } from '../../types/project.ts';

/**
 * Generates Parametric Footing Layout Plan SVG
 */
export function generateFootingPlanSvg(
  columns: ColumnInstance[],
  footings: FootingInstance[],
  plotWidth: number,
  plotDepth: number
): string {
  const svgW = 600;
  const svgH = 450;
  const margin = 50;
  const scaleX = (svgW - margin * 2) / Math.max(1, plotWidth);
  const scaleY = (svgH - margin * 2) / Math.max(1, plotDepth);

  const elements: string[] = [];

  // Background and boundary
  elements.push(`<rect x="0" y="0" width="${svgW}" height="${svgH}" fill="#F4F1EA" stroke="#161513" stroke-width="2"/>`);
  elements.push(`<text x="${svgW / 2}" y="30" text-anchor="middle" font-family="sans-serif" font-size="14" font-weight="bold" fill="#161513">FOUNDATION &amp; FOOTING LAYOUT PLAN (1:50)</text>`);

  // Outer plot boundary
  elements.push(`<rect x="${margin}" y="${margin}" width="${plotWidth * scaleX}" height="${plotDepth * scaleY}" fill="none" stroke="#8A857B" stroke-dasharray="4 4" stroke-width="1.5"/>`);

  // Draw Footings & Columns
  for (let i = 0; i < footings.length; i++) {
    const f = footings[i];
    const c = columns.find(col => col.id === f.columnId) || columns[i];
    const cx = margin + f.center.x * scaleX;
    const cy = margin + f.center.y * scaleY;
    const fSizeX = f.lengthFt * scaleX;
    const fSizeY = f.widthFt * scaleY;

    // Footing outline (Dashed)
    elements.push(`
      <rect x="${cx - fSizeX / 2}" y="${cy - fSizeY / 2}" width="${fSizeX}" height="${fSizeY}" fill="#e2e8f0" fill-opacity="0.5" stroke="#161513" stroke-width="1.5" stroke-dasharray="3 3"/>
    `);

    // Column solid concrete hatch (Dark filled)
    const cSizeX = (c.widthInches / 12) * scaleX * 2.5;
    const cSizeY = (c.depthInches / 12) * scaleY * 2.5;
    elements.push(`
      <rect x="${cx - cSizeX / 2}" y="${cy - cSizeY / 2}" width="${cSizeX}" height="${cSizeY}" fill="#161513"/>
    `);

    // Labels
    elements.push(`
      <text x="${cx}" y="${cy - fSizeY / 2 - 4}" text-anchor="middle" font-family="monospace" font-size="8" font-weight="bold" fill="#C4552D">${f.code} (${f.lengthFt}'×${f.widthFt}')</text>
      <text x="${cx}" y="${cy + fSizeY / 2 + 10}" text-anchor="middle" font-family="monospace" font-size="7" fill="#161513">${c.code}</text>
    `);
  }

  // Engineering Legend & North Arrow
  elements.push(`
    <g transform="translate(${svgW - 90}, 50)">
      <circle cx="20" cy="20" r="16" fill="none" stroke="#161513" stroke-width="1.5"/>
      <path d="M 20 6 L 25 24 L 20 20 L 15 24 Z" fill="#C4552D"/>
      <text x="20" y="32" text-anchor="middle" font-family="sans-serif" font-size="8" font-weight="bold" fill="#161513">N</text>
    </g>
  `);

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${svgW} ${svgH}">${elements.join('\n')}</svg>`;
}

/**
 * Generates Parametric Cross-Sectional Detail of Isolated RCC Trapezoidal Footing SVG
 */
export function generateFootingSectionSvg(
  footingLengthFt: number = 4.5,
  depthFt: number = 4.5
): string {
  const svgW = 600;
  const svgH = 420;

  return `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${svgW} ${svgH}">
    <rect width="${svgW}" height="${svgH}" fill="#F4F1EA" stroke="#161513" stroke-width="2"/>
    <text x="${svgW / 2}" y="28" text-anchor="middle" font-family="sans-serif" font-size="13" font-weight="bold" fill="#161513">
      TYPICAL ISOLATED TRAPEZOIDAL RCC FOOTING SECTION (IS 456 / SP 34)
    </text>

    <!-- Natural Ground Level (NGL) -->
    <line x1="40" y1="90" x2="560" y2="90" stroke="#8A857B" stroke-width="2" stroke-dasharray="6 3"/>
    <text x="50" y="82" font-family="monospace" font-size="9" fill="#161513">N.G.L ±0'-0"</text>

    <!-- Plinth Beam Level (+1'-6") -->
    <rect x="260" y="50" width="80" height="40" fill="#cbd5e1" stroke="#161513" stroke-width="1.5"/>
    <text x="300" y="74" text-anchor="middle" font-family="monospace" font-size="8" font-weight="bold" fill="#161513">PLINTH BEAM (9"×15")</text>

    <!-- Column Pedestal Shaft -->
    <rect x="275" y="90" width="50" height="150" fill="#e2e8f0" stroke="#161513" stroke-width="1.5"/>

    <!-- Trapezoidal RCC Sloped Footing Pad -->
    <polygon points="120,330 480,330 480,300 325,240 275,240 120,300" fill="#e2e8f0" stroke="#161513" stroke-width="2"/>

    <!-- Rebar Bottom Mesh (Fe500 10mm @ 150 c/c) -->
    <line x1="135" y1="318" x2="465" y2="318" stroke="#C4552D" stroke-width="3"/>
    <circle cx="170" cy="318" r="3" fill="#C4552D"/>
    <circle cx="210" cy="318" r="3" fill="#C4552D"/>
    <circle cx="250" cy="318" r="3" fill="#C4552D"/>
    <circle cx="290" cy="318" r="3" fill="#C4552D"/>
    <circle cx="330" cy="318" r="3" fill="#C4552D"/>
    <circle cx="370" cy="318" r="3" fill="#C4552D"/>
    <circle cx="410" cy="318" r="3" fill="#C4552D"/>
    <circle cx="450" cy="318" r="3" fill="#C4552D"/>

    <!-- Column Main Starter Dowels with 90 deg hooks -->
    <path d="M 285 50 L 285 315 L 250 315" fill="none" stroke="#161513" stroke-width="2.5"/>
    <path d="M 315 50 L 315 315 L 350 315" fill="none" stroke="#161513" stroke-width="2.5"/>

    <!-- 75mm PCC (1:4:8) Bed -->
    <rect x="105" y="330" width="390" height="20" fill="#cbd5e1" stroke="#161513" stroke-width="1.5"/>
    <text x="300" y="344" text-anchor="middle" font-family="monospace" font-size="8" fill="#161513">3" (75mm) LEAN CONCRETE PCC (1:4:8) BED</text>

    <!-- 50mm Sand Cushion -->
    <rect x="105" y="350" width="390" height="15" fill="#fef3c7" stroke="#8A857B" stroke-dasharray="2 2" stroke-width="1"/>
    <text x="300" y="361" text-anchor="middle" font-family="monospace" font-size="7" fill="#8A857B">2" COMPACTED SAND CUSHION</text>

    <!-- Dimension Annotations & Leaders -->
    <line x1="90" y1="90" x2="90" y2="350" stroke="#C4552D" stroke-width="1.5"/>
    <text x="75" y="220" text-anchor="middle" font-family="monospace" font-size="10" font-weight="bold" fill="#C4552D" transform="rotate(-90 75 220)">
      DEPTH D_f = ${depthFt}'-0"
    </text>

    <line x1="120" y1="385" x2="480" y2="385" stroke="#161513" stroke-width="1.5"/>
    <text x="300" y="400" text-anchor="middle" font-family="monospace" font-size="10" font-weight="bold" fill="#161513">
      FOOTING WIDTH B = ${footingLengthFt}'-0"
    </text>
  </svg>`;
}
