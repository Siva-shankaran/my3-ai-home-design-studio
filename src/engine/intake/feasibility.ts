import type { DesignBrief } from './schemas.ts';

export type FeasibilityStatus = 'ok' | 'warn' | 'blocked';

export interface FeasibilityIssue {
  code: string;
  category: 'PLOT' | 'SETBACK' | 'PROGRAM' | 'FSI' | 'EGRESS' | 'TYPOLOGY';
  severity: 'BLOCKED' | 'WARN';
  message: string;
  fixSuggestion: string;
  oneClickFixAction?: string;
}

export interface FeasibilityResult {
  status: FeasibilityStatus;
  isFeasible: boolean;
  issues: FeasibilityIssue[];
  buildableEnvelope: {
    widthFt: number;
    depthFt: number;
    areaSqFt: number;
  };
  typologyRecommendation: 'STANDARD' | 'NARROW_DEEP' | 'WIDE' | 'CORNER' | 'POLYGON';
}

/**
 * Floor multiplier mapping
 */
const FLOOR_MULTIPLIER: Record<string, number> = {
  G: 1,
  G_PLUS_1: 2,
  G_PLUS_2: 3,
  G_PLUS_3: 4,
};

/**
 * Minimum area benchmarks per room
 */
const MIN_ROOM_AREAS = {
  LIVING: 120,
  DINING: 80,
  KITCHEN: 50,
  BEDROOM: 100,
  MASTER_BEDROOM: 130,
  BATHROOM: 25,
  STAIRCASE: 70,
  CORRIDOR: 40,
  POOJA: 15,
};

/**
 * Feasibility Edge-case Engine
 * Audits a DesignBrief before passing to the geometric solvers.
 */
export function checkFeasibility(brief: DesignBrief): FeasibilityResult {
  const issues: FeasibilityIssue[] = [];
  const plot = brief.plot;
  const building = brief.building;
  const program = brief.program;
  const setbacks = brief.regulations.setbacks;

  const plotArea = plot.width * plot.depth;
  const floorsCount = FLOOR_MULTIPLIER[building.floors] || 2;

  // 1. Plot Dimensions & Sanity Checks
  if (plot.width <= 0 || plot.depth <= 0 || isNaN(plot.width) || isNaN(plot.depth)) {
    issues.push({
      code: 'ERR_INVALID_DIMENSIONS',
      category: 'PLOT',
      severity: 'BLOCKED',
      message: 'Plot dimensions must be valid positive numbers.',
      fixSuggestion: 'Please enter positive numeric dimensions for width and depth.',
    });
  }

  if (plotArea < 100) {
    issues.push({
      code: 'ERR_ABSURD_SMALL',
      category: 'PLOT',
      severity: 'BLOCKED',
      message: `Plot area (${plotArea} sq ft) is below the minimum habitable threshold (100 sq ft).`,
      fixSuggestion: 'Residential building plots must be at least 150–200 sq ft for micro-dwellings.',
    });
  }

  if (plotArea > 100000) {
    issues.push({
      code: 'ERR_ABSURD_LARGE',
      category: 'PLOT',
      severity: 'BLOCKED',
      message: `Plot area (${plotArea} sq ft) exceeds single-residence residential studio limits (1,00,000 sq ft).`,
      fixSuggestion: 'Please subdivide or input the specific residential building envelope footprint.',
    });
  }

  // 2. Setbacks and Net Buildable Envelope
  const buildableWidth = plot.width - (setbacks.side1Ft + setbacks.side2Ft);
  const buildableDepth = plot.depth - (setbacks.frontFt + setbacks.rearFt);

  if (setbacks.side1Ft + setbacks.side2Ft >= plot.width || setbacks.frontFt + setbacks.rearFt >= plot.depth) {
    issues.push({
      code: 'ERR_SETBACKS_EXCEED_PLOT',
      category: 'SETBACK',
      severity: 'BLOCKED',
      message: 'Total setback distances exceed or equal the entire plot dimension.',
      fixSuggestion: 'Reduce side or front/rear setbacks to allow a buildable footprint.',
      oneClickFixAction: 'RESET_SETBACKS_MINIMUM',
    });
  } else if (buildableWidth < 8) {
    issues.push({
      code: 'ERR_BUILDABLE_WIDTH_NARROW',
      category: 'SETBACK',
      severity: 'BLOCKED',
      message: `Net buildable width (${buildableWidth.toFixed(1)} ft) is less than 8 ft after setbacks.`,
      fixSuggestion: 'Building codes require at least 8 ft clear width for habitable rooms. Reduce side setbacks if permissible under TNCDBR/IRC.',
      oneClickFixAction: 'REDUCE_SIDE_SETBACKS',
    });
  }

  const buildableFootprintArea = Math.max(0, buildableWidth) * Math.max(0, buildableDepth);
  const maxPossibleBuiltUp = buildableFootprintArea * floorsCount;

  // 3. Target Built-Up vs Buildable Area / FSI
  if (building.targetBuiltUpSqFt > maxPossibleBuiltUp) {
    issues.push({
      code: 'WARN_TARGET_EXCEEDS_ENVELOPE',
      category: 'FSI',
      severity: 'WARN',
      message: `Target area (${building.targetBuiltUpSqFt} sq ft) exceeds maximum buildable envelope (${Math.round(maxPossibleBuiltUp)} sq ft across ${floorsCount} floors).`,
      fixSuggestion: 'Consider adding a floor level (e.g. G+2) or adjusting setbacks.',
      oneClickFixAction: 'ADD_FLOOR_OR_SCALE_TARGET',
    });
  }

  // 4. Program Feasibility (BHK vs Target Built-Up Area)
  // Calculate minimum reasonable square footage for the program
  const minRequiredGroundSqFt =
    MIN_ROOM_AREAS.LIVING +
    MIN_ROOM_AREAS.DINING +
    MIN_ROOM_AREAS.KITCHEN +
    MIN_ROOM_AREAS.STAIRCASE +
    MIN_ROOM_AREAS.CORRIDOR +
    (program.poojaRoom ? MIN_ROOM_AREAS.POOJA : 0) +
    MIN_ROOM_AREAS.MASTER_BEDROOM +
    MIN_ROOM_AREAS.BATHROOM * 2;

  const totalMinAreaEstimate = minRequiredGroundSqFt + (program.bedrooms - 1) * (MIN_ROOM_AREAS.BEDROOM + MIN_ROOM_AREAS.BATHROOM);

  if (building.targetBuiltUpSqFt < totalMinAreaEstimate * 0.75) {
    issues.push({
      code: 'WARN_PROGRAM_CRAMPED',
      category: 'PROGRAM',
      severity: 'WARN',
      message: `Target built-up area (${building.targetBuiltUpSqFt} sq ft) is very compact for a ${program.bedrooms} BHK home (standard minimum is ~${Math.round(totalMinAreaEstimate)} sq ft).`,
      fixSuggestion: `Recommended to increase target area to at least ${Math.round(totalMinAreaEstimate)} sq ft or reduce bedroom count.`,
      oneClickFixAction: 'INCREASE_TARGET_AREA',
    });
  }

  // 5. Bedroom / Bathroom Mismatch
  if (program.bathrooms > program.bedrooms + 2) {
    issues.push({
      code: 'WARN_BATH_BED_MISMATCH',
      category: 'PROGRAM',
      severity: 'WARN',
      message: `Unusually high bathroom count (${program.bathrooms} baths for ${program.bedrooms} bedrooms).`,
      fixSuggestion: 'Check if some bathrooms can be combined as common utilities.',
    });
  }

  // 6. Typology Selection & Narrow-Plot Detection
  let typologyRecommendation: 'STANDARD' | 'NARROW_DEEP' | 'WIDE' | 'CORNER' | 'POLYGON' = 'STANDARD';

  if (plot.shape !== 'RECTANGLE') {
    typologyRecommendation = 'POLYGON';
  } else if (plot.isCornerPlot) {
    typologyRecommendation = 'CORNER';
  } else if (plot.width <= 15 || plot.depth / plot.width >= 2.5) {
    typologyRecommendation = 'NARROW_DEEP';
    issues.push({
      code: 'WARN_NARROW_PLOT_TYPOLOGY',
      category: 'TYPOLOGY',
      severity: 'WARN',
      message: `Narrow frontage (${plot.width} ft) or deep aspect ratio (${(plot.depth / plot.width).toFixed(1)}:1) detected.`,
      fixSuggestion: 'Narrow-plot layout selected with central skylit staircase and longitudinal light-well.',
    });
  } else if (plot.width >= plot.depth * 1.5) {
    typologyRecommendation = 'WIDE';
  }

  // 7. Multi-floor (G+2 or G+3) Egress & Lift Checks
  if (floorsCount >= 3) {
    if (!building.hasLiftProvision && floorsCount >= 4) {
      issues.push({
        code: 'WARN_LIFT_CORE_RECOMMENDED',
        category: 'EGRESS',
        severity: 'WARN',
        message: 'For G+3 (4 floors), building codes strongly recommend provision for an elevator/lift shaft.',
        fixSuggestion: 'Enable lift provision to ensure accessible egress and senior living convenience.',
        oneClickFixAction: 'ENABLE_LIFT',
      });
    }
  }

  // 8. Slope / Geotechnical Warning
  if (plot.slopePercent > 5) {
    issues.push({
      code: 'WARN_STEEP_SLOPE',
      category: 'PLOT',
      severity: 'WARN',
      message: `Plot slope (${plot.slopePercent}%) exceeds 5%. Stepped foundations or retaining walls will be required.`,
      fixSuggestion: 'Preliminary structural package will incorporate stepped pad footing notes.',
    });
  }

  const hasBlocked = issues.some(i => i.severity === 'BLOCKED');
  const hasWarn = issues.some(i => i.severity === 'WARN');

  return {
    status: hasBlocked ? 'blocked' : hasWarn ? 'warn' : 'ok',
    isFeasible: !hasBlocked,
    issues,
    buildableEnvelope: {
      widthFt: Math.max(0, buildableWidth),
      depthFt: Math.max(0, buildableDepth),
      areaSqFt: Math.round(buildableFootprintArea),
    },
    typologyRecommendation,
  };
}
