import type { ProjectDesign } from '../../types/project.ts';

export interface DxfExportOptions {
  floorIndex?: number;
  unitScale?: number; // 1 = feet, 12 = inches, 304.8 = mm
  includeFurniture?: boolean;
  includeStructure?: boolean;
  includeGrid?: boolean;
}

export class DxfWriter {
  private lines: string[] = [];

  constructor() {
    this.lines = [];
  }

  private add(code: number | string, val: string | number) {
    this.lines.push(String(code));
    this.lines.push(String(val));
  }

  private addHeader() {
    this.add(0, 'SECTION');
    this.add(2, 'HEADER');
    this.add(9, '$ACADVER');
    this.add(1, 'AC1009'); // Standard DXF R11/R12 universally importable
    this.add(9, '$INSUNITS');
    this.add(70, 1); // 1 = Inches, 2 = Feet, 4 = Millimeters
    this.add(0, 'ENDSEC');
  }

  private addTables() {
    this.add(0, 'SECTION');
    this.add(2, 'TABLES');

    // Layer table
    this.add(0, 'TABLE');
    this.add(2, 'LAYER');
    this.add(70, 10);

    const layers = [
      { name: '0', color: 7 },
      { name: 'PLOT_BOUNDARY', color: 1 }, // Red
      { name: 'SETBACKS', color: 8 }, // Gray dashed
      { name: 'WALLS_EXTERIOR', color: 7 }, // White/Black thick
      { name: 'WALLS_INTERIOR', color: 8 }, // Gray
      { name: 'ROOM_LABELS', color: 4 }, // Cyan
      { name: 'DOORS', color: 1 }, // Red
      { name: 'WINDOWS', color: 3 }, // Green
      { name: 'FURNITURE', color: 9 }, // Light gray
      { name: 'COLUMNS', color: 6 }, // Magenta
      { name: 'FOOTINGS', color: 5 }, // Blue
      { name: 'GRID_AXES', color: 2 }, // Yellow
      { name: 'DIMENSIONS', color: 2 }, // Yellow
      { name: 'TITLEBLOCK', color: 7 }, // White
    ];

    for (const l of layers) {
      this.add(0, 'LAYER');
      this.add(2, l.name);
      this.add(70, 0);
      this.add(62, l.color);
      this.add(6, 'CONTINUOUS');
    }

    this.add(0, 'ENDTAB');
    this.add(0, 'ENDSEC');
  }

  private addLine(layer: string, x1: number, y1: number, x2: number, y2: number) {
    this.add(0, 'LINE');
    this.add(8, layer);
    this.add(10, x1.toFixed(3));
    this.add(20, y1.toFixed(3));
    this.add(30, '0.0');
    this.add(11, x2.toFixed(3));
    this.add(21, y2.toFixed(3));
    this.add(31, '0.0');
  }

  private addCircle(layer: string, cx: number, cy: number, radius: number) {
    this.add(0, 'CIRCLE');
    this.add(8, layer);
    this.add(10, cx.toFixed(3));
    this.add(20, cy.toFixed(3));
    this.add(30, '0.0');
    this.add(40, radius.toFixed(3));
  }

  private addText(
    layer: string,
    text: string,
    x: number,
    y: number,
    height: number = 0.8,
    rotationDeg: number = 0
  ) {
    this.add(0, 'TEXT');
    this.add(8, layer);
    this.add(10, x.toFixed(3));
    this.add(20, y.toFixed(3));
    this.add(30, '0.0');
    this.add(40, height.toFixed(3));
    this.add(1, text);
    if (rotationDeg !== 0) {
      this.add(50, rotationDeg.toFixed(1));
    }
  }

  public generate(project: ProjectDesign, options: DxfExportOptions = {}): string {
    const scale = options.unitScale ?? 12; // default: 12 (convert feet to inches)
    const floorIndex = options.floorIndex ?? 0;
    const floor = project.floors.find((f) => f.floorIndex === floorIndex) || project.floors[0];

    this.lines = [];
    this.addHeader();
    this.addTables();

    this.add(0, 'SECTION');
    this.add(2, 'ENTITIES');

    // 1. Plot boundary & Setbacks
    const brief = project.briefSnapshot;
    const plotWidth = brief?.plot?.width || 30;
    const plotDepth = brief?.plot?.depth || 40;
    const pw = plotWidth * scale;
    const pd = plotDepth * scale;

    // Plot boundary rectangle
    this.addLine('PLOT_BOUNDARY', 0, 0, pw, 0);
    this.addLine('PLOT_BOUNDARY', pw, 0, pw, pd);
    this.addLine('PLOT_BOUNDARY', pw, pd, 0, pd);
    this.addLine('PLOT_BOUNDARY', 0, pd, 0, 0);

    // Setback lines
    const sf = (brief?.regulations?.setbacks?.frontFt ?? 5) * scale;
    const sr = (brief?.regulations?.setbacks?.rearFt ?? 5) * scale;
    const sl = (brief?.regulations?.setbacks?.side1Ft ?? 3.5) * scale;
    const srt = (brief?.regulations?.setbacks?.side2Ft ?? 3.5) * scale;

    this.addLine('SETBACKS', sl, sf, pw - srt, sf);
    this.addLine('SETBACKS', pw - srt, sf, pw - srt, pd - sr);
    this.addLine('SETBACKS', pw - srt, pd - sr, sl, pd - sr);
    this.addLine('SETBACKS', sl, pd - sr, sl, sf);

    // 2. Walls & Openings
    if (floor && floor.walls) {
      for (const wall of floor.walls) {
        const layer = wall.isExterior ? 'WALLS_EXTERIOR' : 'WALLS_INTERIOR';
        const x1 = wall.start.x * scale;
        const y1 = wall.start.y * scale;
        const x2 = wall.end.x * scale;
        const y2 = wall.end.y * scale;
        this.addLine(layer, x1, y1, x2, y2);

        // Openings
        if (wall.openings && wall.openings.length > 0) {
          const dx = wall.end.x - wall.start.x;
          const dy = wall.end.y - wall.start.y;
          const len = Math.hypot(dx, dy);
          if (len > 0) {
            const ux = dx / len;
            const uy = dy / len;
            for (const op of wall.openings) {
              const opStartDist = op.offsetFromStartFt;
              const opEndDist = op.offsetFromStartFt + op.widthFt;
              const ox1 = (wall.start.x + ux * opStartDist) * scale;
              const oy1 = (wall.start.y + uy * opStartDist) * scale;
              const ox2 = (wall.start.x + ux * opEndDist) * scale;
              const oy2 = (wall.start.y + uy * opEndDist) * scale;
              const opLayer = op.type === 'DOOR' ? 'DOORS' : 'WINDOWS';
              this.addLine(opLayer, ox1, oy1, ox2, oy2);
              this.addText(
                opLayer,
                op.scheduleCode,
                (ox1 + ox2) / 2,
                (oy1 + oy2) / 2,
                0.5 * scale
              );
            }
          }
        }
      }
    }

    // 3. Rooms and Area Labels
    if (floor && floor.rooms) {
      for (const room of floor.rooms) {
        if (room.polygon && room.polygon.length >= 3) {
          for (let i = 0; i < room.polygon.length; i++) {
            const p1 = room.polygon[i];
            const p2 = room.polygon[(i + 1) % room.polygon.length];
            this.addLine('ROOM_LABELS', p1.x * scale, p1.y * scale, p2.x * scale, p2.y * scale);
          }

          let cx = 0;
          let cy = 0;
          for (const p of room.polygon) {
            cx += p.x;
            cy += p.y;
          }
          cx = (cx / room.polygon.length) * scale;
          cy = (cy / room.polygon.length) * scale;

          this.addText('ROOM_LABELS', room.name.toUpperCase(), cx, cy + 0.6 * scale, 0.75 * scale);
          this.addText(
            'ROOM_LABELS',
            `${room.carpetAreaSqFt.toFixed(1)} SQ.FT`,
            cx,
            cy - 0.6 * scale,
            0.55 * scale
          );
        }

        // Furniture
        if (options.includeFurniture !== false && room.furniture) {
          for (const furn of room.furniture) {
            const fx = furn.position.x * scale;
            const fy = furn.position.y * scale;
            const fw = (furn.widthFt ?? 3) * scale;
            const fd = (furn.depthFt ?? 3) * scale;
            this.addLine('FURNITURE', fx - fw / 2, fy - fd / 2, fx + fw / 2, fy - fd / 2);
            this.addLine('FURNITURE', fx + fw / 2, fy - fd / 2, fx + fw / 2, fy + fd / 2);
            this.addLine('FURNITURE', fx + fw / 2, fy + fd / 2, fx - fw / 2, fy + fd / 2);
            this.addLine('FURNITURE', fx - fw / 2, fy + fd / 2, fx - fw / 2, fy - fd / 2);
            this.addText('FURNITURE', furn.symbolCode, fx, fy, 0.3 * scale);
          }
        }
      }
    }

    // 4. Structural Columns & Footings
    if (options.includeStructure !== false && project.structuralColumns) {
      for (const col of project.structuralColumns) {
        const cx = col.position.x * scale;
        const cy = col.position.y * scale;
        const cw = (col.widthInches / 12) * scale;
        const cd = (col.depthInches / 12) * scale;

        this.addLine('COLUMNS', cx - cw / 2, cy - cd / 2, cx + cw / 2, cy - cd / 2);
        this.addLine('COLUMNS', cx + cw / 2, cy - cd / 2, cx + cw / 2, cy + cd / 2);
        this.addLine('COLUMNS', cx + cw / 2, cy + cd / 2, cx - cw / 2, cy + cd / 2);
        this.addLine('COLUMNS', cx - cw / 2, cy + cd / 2, cx - cw / 2, cy - cd / 2);
        this.addText('COLUMNS', col.code, cx, cy, 0.4 * scale);

        const ftg = project.structuralFootings?.find((f) => f.columnId === col.id);
        if (ftg) {
          const fw = ftg.widthFt * scale;
          const fl = ftg.lengthFt * scale;
          this.addLine('FOOTINGS', cx - fl / 2, cy - fw / 2, cx + fl / 2, cy - fw / 2);
          this.addLine('FOOTINGS', cx + fl / 2, cy - fw / 2, cx + fl / 2, cy + fw / 2);
          this.addLine('FOOTINGS', cx + fl / 2, cy + fw / 2, cx - fl / 2, cy + fw / 2);
          this.addLine('FOOTINGS', cx - fl / 2, cy + fw / 2, cx - fl / 2, cy - fw / 2);
          this.addText('FOOTINGS', ftg.code, cx - fl / 2 + 0.5 * scale, cy - fw / 2 + 0.5 * scale, 0.35 * scale);
        }
      }
    }

    // 5. Grid Axes
    if (options.includeGrid !== false && project.structuralColumns && project.structuralColumns.length > 0) {
      const xPositions = Array.from(new Set(project.structuralColumns.map((c) => Math.round(c.position.x * 10) / 10))).sort((a, b) => a - b);
      const yPositions = Array.from(new Set(project.structuralColumns.map((c) => Math.round(c.position.y * 10) / 10))).sort((a, b) => a - b);

      const minY = -2 * scale;
      const maxY = (plotDepth + 2) * scale;
      const minX = -2 * scale;
      const maxX = (plotWidth + 2) * scale;

      xPositions.forEach((x, idx) => {
        const gx = x * scale;
        this.addLine('GRID_AXES', gx, minY, gx, maxY);
        this.addCircle('GRID_AXES', gx, minY - 1 * scale, 0.8 * scale);
        this.addText('GRID_AXES', String(idx + 1), gx - 0.3 * scale, minY - 1.2 * scale, 0.6 * scale);
      });

      yPositions.forEach((y, idx) => {
        const gy = y * scale;
        const letter = String.fromCharCode(65 + idx);
        this.addLine('GRID_AXES', minX, gy, maxX, gy);
        this.addCircle('GRID_AXES', minX - 1 * scale, gy, 0.8 * scale);
        this.addText('GRID_AXES', letter, minX - 1.3 * scale, gy - 0.3 * scale, 0.6 * scale);
      });
    }

    // 6. Title Block & Engineering Disclaimer
    const titleX = 0;
    const titleY = -6 * scale;
    this.addText('TITLEBLOCK', `PROJECT: ${project.conceptTitle.toUpperCase()}`, titleX, titleY, 1.2 * scale);
    this.addText('TITLEBLOCK', `SCHEME: ${project.archetype} | BUILT-UP AREA: ${project.totalBuiltUpSqFt} SQ.FT`, titleX, titleY - 1.5 * scale, 0.8 * scale);
    this.addText('TITLEBLOCK', 'ENGINEERING DISCLAIMER: PRELIMINARY ESTIMATE FOR PLANNING ONLY.', titleX, titleY - 3.0 * scale, 0.7 * scale);
    this.addText('TITLEBLOCK', 'MUST BE VERIFIED AND SIGNED BY A LICENSED STRUCTURAL ENGINEER BEFORE CONSTRUCTION.', titleX, titleY - 4.2 * scale, 0.6 * scale);

    this.add(0, 'ENDSEC');
    this.add(0, 'EOF');

    return this.lines.join('\n');
  }
}

export function exportProjectToDxf(project: ProjectDesign, options?: DxfExportOptions): string {
  const writer = new DxfWriter();
  return writer.generate(project, options);
}
