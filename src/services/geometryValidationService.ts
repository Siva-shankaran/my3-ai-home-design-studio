import type { Room, Wall, Column, SiteProfile, Project } from '../types/index.ts';

export interface ValidationIssue {
  severity: 'error' | 'warning' | 'info';
  category: 'boundary' | 'setback' | 'columns' | 'stairs' | 'plumbing_stack' | 'room_size';
  message: string;
  affectedElementIds?: string[];
  remedialAction?: string;
}

export interface ValidationReport {
  isValid: boolean;
  issues: ValidationIssue[];
  metrics: {
    grossBuiltupAreaSqft: number;
    carpetAreaSqft: number;
    plotCoveragePercent: number;
    achievedFSI: number;
    columnVerticalAlignmentScore: number; // 0-100%
    wetStackScore: number; // 0-100%
  };
}

export const geometryValidationService = {
  /**
   * Evaluates canonical geometric consistency and engineering clearances
   */
  validateProjectGeometry(project: Project): ValidationReport {
    const issues: ValidationIssue[] = [];
    const rooms = project.rooms || [];
    const floor1Rooms = rooms.filter(r => (r.floor || 1) === 1);
    const floor2Rooms = rooms.filter(r => r.floor === 2);

    // 1. Gross Built-up Area and Carpet Area
    const f1Area = floor1Rooms.reduce((acc, r) => acc + (r.width * r.height), 0);
    const f2Area = floor2Rooms.reduce((acc, r) => acc + (r.width * r.height), 0);
    const grossBuiltupArea = f1Area + f2Area;
    const carpetArea = Math.round(grossBuiltupArea * 0.78); // approx 78% carpet area in RCC framed residential

    // 2. Site Boundary & Setbacks Check
    let plotCoveragePercent = 0;
    let achievedFSI = 0;

    if (project.siteProfile) {
      const site = project.siteProfile;
      const plotArea = site.plotAreaSqft || (site.plotWidth * site.plotDepth);
      if (plotArea > 0) {
        plotCoveragePercent = Math.round((f1Area / plotArea) * 100);
        achievedFSI = Number((grossBuiltupArea / plotArea).toFixed(2));

        if (plotCoveragePercent > (site.maxPlotCoveragePercent || 70)) {
          issues.push({
            severity: 'error',
            category: 'setback',
            message: `Ground floor coverage of ${plotCoveragePercent}% exceeds the TNCDBR maximum permitted limit of ${site.maxPlotCoveragePercent || 70}%.`,
            remedialAction: 'Increase setbacks or shift habitable spaces to upper floor.'
          });
        }

        // Boundary containment
        const maxX = Math.max(...rooms.map(r => r.x + r.width), 0);
        const maxY = Math.max(...rooms.map(r => r.y + r.height), 0);

        if (maxX > site.plotWidth || maxY > site.plotDepth) {
          issues.push({
            severity: 'error',
            category: 'boundary',
            message: `Building envelope (${maxX}' × ${maxY}') extends beyond the site plot boundary (${site.plotWidth}' × ${site.plotDepth}').`,
            remedialAction: 'Adjust room dimensions to fit inside the plot boundary.'
          });
        }

        // Check Front Setback
        const minX = Math.min(...rooms.map(r => r.x), 0);
        const reqFront = site.frontSetbackRequiredFeet || 5;
        if (minX < reqFront) {
          issues.push({
            severity: 'warning',
            category: 'setback',
            message: `Front setback is approximately ${minX.toFixed(1)} ft; TNCDBR requires minimum ${reqFront} ft based on road width.`,
            remedialAction: `Shift front wall backward by ${(reqFront - minX).toFixed(1)} ft.`
          });
        }
      }
    }

    // 3. Minimum Habitable Room Sizes (TNCDBR Rule 39 & NBC Part 3)
    // Habitable rooms (living, bedrooms) must be >= 9.5 m² (102 sq ft) with min width 2.4 m (8 ft)
    rooms.forEach(r => {
      const area = r.width * r.height;
      if (r.type === 'bedroom' || r.type === 'master_bedroom' || r.type === 'living') {
        if (area < 100) {
          issues.push({
            severity: 'error',
            category: 'room_size',
            message: `${r.name} area (${area} sq ft) is below the TNCDBR/NBC minimum standard of 100 sq ft (9.5 m²).`,
            affectedElementIds: [r.id],
            remedialAction: 'Increase room width or height to at least 10 ft.'
          });
        }
        if (r.width < 8 || r.height < 8) {
          issues.push({
            severity: 'warning',
            category: 'room_size',
            message: `${r.name} dimension (${r.width}' × ${r.height}') has a side under 8'-0" (2.4 m), violating TNCDBR Rule 39.`,
            affectedElementIds: [r.id],
            remedialAction: 'Maintain minimum 8 ft clear dimension.'
          });
        }
      }
    });

    // 4. Staircase Continuity & Dimension Check
    const f1Stairs = floor1Rooms.filter(r => r.type === 'stairwell');
    const f2Stairs = floor2Rooms.filter(r => r.type === 'stairwell');

    if (project.floors >= 2) {
      if (f1Stairs.length === 0 || f2Stairs.length === 0) {
        issues.push({
          severity: 'error',
          category: 'stairs',
          message: 'Multi-floor building is missing a continuous stairwell connecting Level 1 and Level 2.',
          remedialAction: 'Add matching stairwell footprints to both floors.'
        });
      } else {
        const s1 = f1Stairs[0];
        const s2 = f2Stairs[0];
        const dx = Math.abs(s1.x - s2.x);
        const dy = Math.abs(s1.y - s2.y);
        if (dx > 1 || dy > 1) {
          issues.push({
            severity: 'error',
            category: 'stairs',
            message: `Upper floor stair landing is misaligned from ground floor staircase by ${Math.max(dx, dy).toFixed(1)} ft.`,
            affectedElementIds: [s1.id, s2.id],
            remedialAction: 'Align staircase (x, y) coordinates on both floors for vertical load transfer.'
          });
        }
        if (s1.width < 6) {
          issues.push({
            severity: 'warning',
            category: 'stairs',
            message: `Stairwell width (${s1.width} ft) provides narrow flight width. Minimum 3 ft per flight (6 ft total dog-legged) required by NBC.`,
            affectedElementIds: [s1.id]
          });
        }
      }
    }

    // 5. Column Grid Vertical Alignment
    let columnAlignmentScore = 100;
    const columns = project.columns || [];
    const f1Cols = columns.filter(c => (c.floor || 1) === 1);
    const f2Cols = columns.filter(c => c.floor === 2);

    if (f2Cols.length > 0 && f1Cols.length > 0) {
      let alignedCount = 0;
      f2Cols.forEach(c2 => {
        const match = f1Cols.find(c1 => Math.abs(c1.x - c2.x) < 0.5 && Math.abs(c1.y - c2.y) < 0.5);
        if (match) {
          alignedCount++;
        } else {
          issues.push({
            severity: 'error',
            category: 'columns',
            message: `Column ${c2.label || c2.id} on Level 2 has no supporting column beneath it on Level 1 (Floating Column).`,
            affectedElementIds: [c2.id],
            remedialAction: 'Align column with Level 1 grid or design a heavy transfer girder.'
          });
        }
      });
      columnAlignmentScore = Math.round((alignedCount / f2Cols.length) * 100);
    }

    // 6. Wet-Wall Stacking Score
    const f1Wet = floor1Rooms.filter(r => r.type === 'kitchen' || r.type === 'bathroom');
    const f2Wet = floor2Rooms.filter(r => r.type === 'bathroom' || r.type === 'master_bath' || r.type === 'laundry');
    let wetStackScore = 95;
    if (f1Wet.length > 0 && f2Wet.length > 0) {
      const stackedCount = f2Wet.filter(r2 => 
        f1Wet.some(r1 => Math.abs(r1.x - r2.x) < 12 && Math.abs(r1.y - r2.y) < 12)
      ).length;
      wetStackScore = Math.round((stackedCount / f2Wet.length) * 100);
      if (wetStackScore < 70) {
        issues.push({
          severity: 'warning',
          category: 'plumbing_stack',
          message: `Upper floor wet rooms are dispersed (${wetStackScore}% alignment), increasing horizontal plumbing runs over dry living areas.`,
          remedialAction: 'Group upper bathrooms directly above ground floor kitchen/baths.'
        });
      }
    }

    const hasErrors = issues.some(i => i.severity === 'error');

    return {
      isValid: !hasErrors,
      issues,
      metrics: {
        grossBuiltupAreaSqft: grossBuiltupArea,
        carpetAreaSqft: carpetArea,
        plotCoveragePercent,
        achievedFSI,
        columnVerticalAlignmentScore: columnAlignmentScore,
        wetStackScore
      }
    };
  },

  /**
   * Generates a standard RCC Column Grid at room corners & 12-16ft intervals
   */
  generateRccColumnGrid(rooms: Room[]): Column[] {
    const columns: Column[] = [];
    const cornerPoints = new Map<string, { x: number; y: number; floors: Set<number> }>();

    rooms.forEach(r => {
      const floor = r.floor || 1;
      const pts = [
        { x: r.x, y: r.y },
        { x: r.x + r.width, y: r.y },
        { x: r.x, y: r.y + r.height },
        { x: r.x + r.width, y: r.y + r.height }
      ];

      pts.forEach(p => {
        // Round to nearest foot to merge adjacent room corners
        const key = `${Math.round(p.x)}_${Math.round(p.y)}`;
        if (!cornerPoints.has(key)) {
          cornerPoints.set(key, { x: Math.round(p.x), y: Math.round(p.y), floors: new Set([floor]) });
        } else {
          cornerPoints.get(key)!.floors.add(floor);
        }
      });
    });

    let colIndex = 1;
    cornerPoints.forEach(({ x, y, floors }) => {
      // In RCC framed construction, any column supporting an upper floor must start from the foundation on Floor 1
      if (floors.has(2)) {
        floors.add(1);
      }
      floors.forEach(floor => {
        columns.push({
          id: `col-${floor}-${colIndex}`,
          x,
          y,
          width: 0.75, // 9 inches (230 mm)
          depth: 1.25, // 15 inches (380 mm) standard Tamil Nadu residential RCC column
          floor,
          reinforcementDetails: '4-T16 + 2-T12 Main, 8mm Ring @ 150mm c/c',
          label: `C${colIndex}`
        });
      });
      colIndex++;
    });

    return columns;
  },

  /**
   * Layout fingerprint for similarity and duplication checking
   */
  calculateLayoutFingerprint(rooms: Room[]): string {
    const sorted = [...rooms].sort((a, b) => a.x - b.x || a.y - b.y);
    const summary = sorted.map(r => `${r.type}:${r.floor || 1}:${Math.round(r.x)},${Math.round(r.y)}:${Math.round(r.width)}x${Math.round(r.height)}`).join('|');
    let hash = 0;
    for (let i = 0; i < summary.length; i++) {
      hash = ((hash << 5) - hash) + summary.charCodeAt(i);
      hash |= 0;
    }
    return `FP-${Math.abs(hash).toString(16).toUpperCase()}`;
  }
};
