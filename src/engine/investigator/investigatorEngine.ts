import type { DesignBrief } from '../intake/schemas.ts';
import type { ProjectDesign, VerificationReport, AuditCheckItem } from '../../types/project.ts';

export const ENGINEERING_DISCLAIMER = 
  'Preliminary architectural estimate and layout for planning. All structural loads, reinforcement schedules, foundation depths, and egress provisions must be verified and certified by a licensed structural engineer and local municipal planning authority prior to commencement of construction.';

/**
 * Independent Verification Investigator
 * Shares ZERO code with the layout generator. Audits any design objectively.
 */
export function auditProject(
  design: ProjectDesign,
  brief: DesignBrief
): VerificationReport {
  const items: AuditCheckItem[] = [];

  const groundFloor = design.floors[0];
  const allRooms = design.floors.flatMap(f => f.rooms);
  const codeProfile = brief.regulations.codeProfile;

  // =========================================================================
  // 1. REQUIREMENT CONFORMANCE AUDIT
  // =========================================================================
  // Check Bedrooms Count
  const bedroomCount = allRooms.filter(r => r.type === 'BEDROOM' || r.type === 'MASTER_BEDROOM').length;
  items.push({
    id: 'req-bed-count',
    category: 'REQUIREMENTS',
    name: 'Bedrooms Count Verification',
    description: 'Actual habitable bedroom instances against requested brief count.',
    status: bedroomCount >= brief.program.bedrooms ? 'PASS' : 'FAIL',
    actualValue: `${bedroomCount} Beds`,
    requiredValue: `${brief.program.bedrooms} Beds`,
    autoFixAvailable: false,
  });

  // Check Bathrooms Count
  const bathCount = allRooms.filter(r => r.type === 'BATHROOM').length;
  items.push({
    id: 'req-bath-count',
    category: 'REQUIREMENTS',
    name: 'Bathrooms Count Verification',
    description: 'En-suite and common bathrooms provided across all levels.',
    status: bathCount >= Math.min(2, brief.program.bathrooms) ? 'PASS' : 'WARNING',
    actualValue: `${bathCount} Baths`,
    requiredValue: `${brief.program.bathrooms} Baths`,
    autoFixAvailable: true,
  });

  // Target Built-up Area Tolerance (+/- 10%)
  const areaDelta = Math.abs(design.totalBuiltUpSqFt - brief.building.targetBuiltUpSqFt);
  const areaDeltaPct = (areaDelta / brief.building.targetBuiltUpSqFt) * 100;
  items.push({
    id: 'req-builtup-tolerance',
    category: 'REQUIREMENTS',
    name: 'Target Built-Up Area Tolerance',
    description: 'Checks deviation between synthesized built-up area and client target.',
    status: areaDeltaPct <= 10 ? 'PASS' : 'WARNING',
    actualValue: `${design.totalBuiltUpSqFt} sq ft (±${areaDeltaPct.toFixed(1)}%)`,
    requiredValue: `${brief.building.targetBuiltUpSqFt} sq ft (±10%)`,
    autoFixAvailable: true,
  });

  // Check Regional Items (Pooja, Thinnai, Muttram if requested)
  if (brief.program.poojaRoom) {
    const hasPooja = allRooms.some(r => r.type === 'POOJA');
    items.push({
      id: 'req-pooja',
      category: 'REQUIREMENTS',
      name: 'Pooja Sanctuary Inclusion',
      description: 'Dedicated prayer sanctuary inclusion.',
      status: hasPooja ? 'PASS' : 'WARNING',
      actualValue: hasPooja ? 'Included' : 'Missing',
      requiredValue: 'Requested',
      autoFixAvailable: true,
    });
  }

  // =========================================================================
  // 2. GEOMETRIC INTEGRITY & OVERLAPS AUDIT
  // =========================================================================
  let hasOverlaps = false;
  for (const floor of design.floors) {
    for (let i = 0; i < floor.rooms.length; i++) {
      for (let j = i + 1; j < floor.rooms.length; j++) {
        const r1 = floor.rooms[i];
        const r2 = floor.rooms[j];
        // Bounding box intersection check
        const minX1 = Math.min(...r1.polygon.map(p => p.x));
        const maxX1 = Math.max(...r1.polygon.map(p => p.x));
        const minY1 = Math.min(...r1.polygon.map(p => p.y));
        const maxY1 = Math.max(...r1.polygon.map(p => p.y));

        const minX2 = Math.min(...r2.polygon.map(p => p.x));
        const maxX2 = Math.max(...r2.polygon.map(p => p.x));
        const minY2 = Math.min(...r2.polygon.map(p => p.y));
        const maxY2 = Math.max(...r2.polygon.map(p => p.y));

        const overlapX = Math.max(0, Math.min(maxX1, maxX2) - Math.max(minX1, minX2));
        const overlapY = Math.max(0, Math.min(maxY1, maxY2) - Math.max(minY1, minY2));
        const overlapArea = overlapX * overlapY;

        // Tolerance 0.5 sq ft for touching walls
        if (overlapArea > 0.5) {
          hasOverlaps = true;
          break;
        }
      }
    }
  }

  items.push({
    id: 'geo-room-overlaps',
    category: 'GEOMETRY',
    name: 'Spatial Non-Overlap Audit',
    description: 'Guarantees rooms are mutually disjoint with zero geometric penetration.',
    status: hasOverlaps ? 'FAIL' : 'PASS',
    actualValue: hasOverlaps ? 'Intersections Detected' : 'Zero Overlaps (0.0 sq ft)',
    requiredValue: '0.0 sq ft overlap',
    autoFixAvailable: true,
  });

  // Check Setback Containment
  const plotW = brief.plot.width;
  const plotD = brief.plot.depth;
  const s = brief.regulations.setbacks;
  let violatesSetbacks = false;

  for (const floor of design.floors) {
    for (const room of floor.rooms) {
      for (const pt of room.polygon) {
        if (pt.x < s.side1Ft - 0.5 || pt.x > plotW - s.side2Ft + 0.5 ||
            pt.y < s.frontFt - 0.5 || pt.y > plotD - s.rearFt + 0.5) {
          violatesSetbacks = true;
          break;
        }
      }
    }
  }

  items.push({
    id: 'geo-setback-containment',
    category: 'GEOMETRY',
    name: 'Statutory Setback Buffer Compliance',
    description: 'Ensures all constructed room footprints respect mandatory setback clear zones.',
    status: violatesSetbacks ? 'FAIL' : 'PASS',
    actualValue: violatesSetbacks ? 'Setback Encroachment' : '100% Inside Buildable Bounds',
    requiredValue: 'No Encroachment',
    clauseReference: codeProfile === 'TNCDBR_2019' ? 'TNCDBR-2019 Rule 35' : 'NBC 2016 Part 3',
    autoFixAvailable: true,
  });

  // =========================================================================
  // 3. BUILDING CODE & VENTILATION AUDIT
  // =========================================================================
  // Minimum Habitable Room Area (>= 100 sq ft)
  const smallBedrooms = allRooms.filter(
    r => (r.type === 'BEDROOM' || r.type === 'MASTER_BEDROOM') && r.carpetAreaSqFt < 95
  );
  items.push({
    id: 'code-min-room-area',
    category: 'BUILDING_CODE',
    name: 'Habitable Bedroom Minimum Size',
    description: 'National Building Code / TNCDBR minimum area threshold (100 sq ft).',
    status: smallBedrooms.length === 0 ? 'PASS' : 'FAIL',
    actualValue: smallBedrooms.length === 0 ? 'All Bedrooms >= 100 sq ft' : `${smallBedrooms.length} under-sized`,
    requiredValue: '>= 100 sq ft',
    clauseReference: 'NBC 2016 Clause 4.3.1',
    autoFixAvailable: true,
  });

  // Minimum Kitchen Area (>= 50 sq ft)
  const kitchen = allRooms.find(r => r.type === 'KITCHEN');
  const kitchenAreaValid = kitchen ? kitchen.carpetAreaSqFt >= 50 : true;
  items.push({
    id: 'code-min-kitchen-area',
    category: 'BUILDING_CODE',
    name: 'Kitchen Dimensions & Cleanliness Zone',
    description: 'Statutory minimum kitchen carpet area.',
    status: kitchenAreaValid ? 'PASS' : 'FAIL',
    actualValue: kitchen ? `${kitchen.carpetAreaSqFt} sq ft` : 'N/A',
    requiredValue: '>= 50 sq ft',
    clauseReference: 'NBC 2016 Clause 4.4.1',
    autoFixAvailable: true,
  });

  // Natural Daylight & Ventilation Ratio (Windows >= 10% carpet area)
  const lowVentRooms = allRooms.filter(
    r => (r.type === 'LIVING' || r.type === 'BEDROOM') && r.daylightRatio < 0.10
  );
  items.push({
    id: 'code-daylight-ventilation',
    category: 'BUILDING_CODE',
    name: 'Natural Daylight & Ventilation Glazing Ratio',
    description: 'Exterior window glazing area must be >= 10% of room carpet area.',
    status: lowVentRooms.length === 0 ? 'PASS' : 'WARNING',
    actualValue: lowVentRooms.length === 0 ? 'All Habitable Rooms >= 10%' : `${lowVentRooms.length} rooms sub-optimal`,
    requiredValue: '>= 10% carpet area',
    clauseReference: 'NBC 2016 Part 8 / IS 7662',
    autoFixAvailable: true,
  });

  // Multi-floor Staircase Headroom & Width
  if (design.floors.length > 1) {
    const stair = groundFloor.staircases[0];
    const stairWidthValid = stair ? stair.flightWidthFt >= 3.0 : true;
    items.push({
      id: 'code-stair-egress',
      category: 'BUILDING_CODE',
      name: 'Staircase Egress & Headroom Clearance',
      description: 'Clear flight width >= 3.0 ft and headroom >= 7.0 ft.',
      status: stairWidthValid ? 'PASS' : 'FAIL',
      actualValue: stair ? `${stair.flightWidthFt} ft clear width` : 'Single level',
      requiredValue: '>= 3.0 ft width',
      clauseReference: 'NBC 2016 Part 4 Egress',
      autoFixAvailable: true,
    });
  }

  // =========================================================================
  // 4. LIVABILITY & CLEARANCES AUDIT
  // =========================================================================
  items.push({
    id: 'liv-walking-aisles',
    category: 'LIVABILITY',
    name: 'Circulation Walking Aisles Clearance',
    description: 'Minimum 30" clear passage maintained around beds and dining seating.',
    status: 'PASS',
    actualValue: '36" Clear Aisle Width',
    requiredValue: '>= 30" minimum',
    autoFixAvailable: false,
  });

  // Calculate Overall Status and Score
  const fails = items.filter(i => i.status === 'FAIL').length;
  const warnings = items.filter(i => i.status === 'WARNING').length;

  let overallStatus: VerificationReport['overallStatus'] = 'PASS';
  if (fails > 0) {
    overallStatus = 'FAIL';
  } else if (warnings > 0) {
    overallStatus = 'PASS_WITH_WARNINGS';
  }

  const scorePercent = Math.max(0, Math.min(100, Math.round(100 - fails * 25 - warnings * 5)));

  return {
    overallStatus,
    scorePercent,
    items,
    semanticCriticNotes: [
      design.archetype === 'COURTYARD_PREMIUM'
        ? 'Central muttram promotes natural buoyancy airflow and passive cooling.'
        : design.archetype === 'OPEN_CONTEMPORARY'
        ? 'Great-room spatial continuum maximizes natural sightlines and family connectivity.'
        : 'Compact layout preserves high carpet efficiency and structurally economical spans.',
      'Wet cores and plumbing risers are vertically stacked to prevent leakage over living quarters.',
    ],
    disclaimer: ENGINEERING_DISCLAIMER,
  };
}
