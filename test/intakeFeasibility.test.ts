import test from 'node:test';
import assert from 'node:assert/strict';
import { parsePlotInput, parseLengthToFeet, convertTamilNumerals } from '../src/engine/intake/parser.ts';
import { checkFeasibility } from '../src/engine/intake/feasibility.ts';
import type { DesignBrief } from '../src/engine/intake/schemas.ts';

function createMockBrief(overrides: Partial<any> = {}): DesignBrief {
  const w = overrides.plotWidth ?? 30;
  const d = overrides.plotDepth ?? 40;
  return {
    version: '2.0',
    projectId: 'test-project-1',
    projectName: 'Test Villa',
    clientName: 'Client',
    createdAt: new Date().toISOString(),
    entryMode: 'STRUCTURED',
    plot: {
      vertices: [{ x: 0, y: 0 }, { x: w, y: 0 }, { x: w, y: d }, { x: 0, y: d }],
      width: w,
      depth: d,
      shape: overrides.shape ?? 'RECTANGLE',
      roadFacingSide: overrides.roadFacingSide ?? 'NORTH',
      roadWidthFt: overrides.roadWidthFt ?? 30,
      isCornerPlot: overrides.isCornerPlot ?? false,
      slopePercent: overrides.slopePercent ?? 0,
    },
    building: {
      floors: overrides.floors ?? 'G_PLUS_1',
      targetBuiltUpSqFt: overrides.targetBuiltUpSqFt ?? 1800,
      hasLiftProvision: overrides.hasLiftProvision ?? false,
      ceilingHeightFt: 10,
    },
    program: {
      bedrooms: overrides.bedrooms ?? 3,
      bathrooms: overrides.bathrooms ?? 3,
      attachedBaths: 2,
      kitchenType: 'SEMI_OPEN',
      hasUtilityWash: true,
      livingDiningArrangement: 'COMBINED_OPEN',
      parkingSpaces: { cars: 1, bikes: 2, isCovered: true },
      staircaseType: 'INTERNAL_DOG_LEGGED',
      poojaRoom: overrides.poojaRoom ?? true,
      studyOffice: false,
      balconiesCount: 1,
      courtyardMuttram: overrides.courtyardMuttram ?? false,
      thinnaiVerandah: overrides.thinnaiVerandah ?? false,
      terraceGarden: false,
    },
    regulations: {
      codeProfile: 'TNCDBR_2019',
      setbacks: {
        frontFt: overrides.frontSetback ?? 5,
        rearFt: overrides.rearSetback ?? 5,
        side1Ft: overrides.side1Setback ?? 3,
        side2Ft: overrides.side2Setback ?? 3,
        isAutoDerived: true,
      },
      vastuPreference: 'FLEXIBLE',
      budgetBand: 'STANDARD',
      soilType: overrides.soilType ?? 'LOAM',
      city: 'Chennai',
    },
    displayUnit: 'FEET_INCHES',
  };
}

test('Layer 1 Parser: Tamil numerals & length parsing', () => {
  assert.equal(convertTamilNumerals('௩௦x௪௦'), '30x40');
  assert.equal(convertTamilNumerals('௨ cents'), '2 cents');

  assert.equal(parseLengthToFeet('30'), 30);
  assert.equal(parseLengthToFeet('30ft'), 30);
  assert.equal(parseLengthToFeet("30'"), 30);
  assert.equal(parseLengthToFeet("30'6\""), 30.5);
  assert.equal(parseLengthToFeet("30'-6\""), 30.5);
  assert.ok(Math.abs((parseLengthToFeet('10m') ?? 0) - 32.808) < 0.01);
});

test('Layer 1 Parser: 20 Dimensional input variations', () => {
  const variations = [
    { input: '30x40', expectedW: 30, expectedD: 40, unit: 'FEET' },
    { input: '30*40', expectedW: 30, expectedD: 40, unit: 'FEET' },
    { input: '30 by 40', expectedW: 30, expectedD: 40, unit: 'FEET' },
    { input: '30 × 40', expectedW: 30, expectedD: 40, unit: 'FEET' },
    { input: "30'6\" x 40'", expectedW: 30.5, expectedD: 40, unit: 'FEET_INCHES' },
    { input: '9m x 12m', expectedW: 29.53, expectedD: 39.37, unit: 'METERS' },
    { input: '10m × 15m', expectedW: 32.81, expectedD: 49.21, unit: 'METERS' },
    { input: '2 cents', expectedW: 24.1, expectedD: 36.2, unit: 'CENT' },
    { input: '1 ground', expectedW: 40, expectedD: 60, unit: 'GROUND' },
    { input: '1200 sqft', expectedW: 29.3, expectedD: 41, unit: 'SQFT' },
    { input: '150 sqm', expectedW: 34, expectedD: 47.5, unit: 'SQM' },
    { input: '௩௦x௪௦', expectedW: 30, expectedD: 40, unit: 'FEET' },
    { input: '25x50', expectedW: 25, expectedD: 50, unit: 'FEET' },
    { input: '20x60', expectedW: 20, expectedD: 60, unit: 'FEET' },
    { input: '40x60', expectedW: 40, expectedD: 60, unit: 'FEET' },
    { input: '50x80', expectedW: 50, expectedD: 80, unit: 'FEET' },
    { input: '15x45', expectedW: 15, expectedD: 45, unit: 'FEET' },
    { input: '12x50', expectedW: 12, expectedD: 50, unit: 'FEET' },
    { input: '35x70', expectedW: 35, expectedD: 70, unit: 'FEET' },
    { input: '60x90', expectedW: 60, expectedD: 90, unit: 'FEET' },
  ];

  for (const v of variations) {
    const res = parsePlotInput(v.input);
    assert.equal(res.detectedUnit, v.unit, `Failed unit on ${v.input}`);
    assert.ok(Math.abs(res.widthFt - v.expectedW) < 1.0, `Width mismatch on ${v.input}: got ${res.widthFt}`);
    assert.ok(Math.abs(res.depthFt - v.expectedD) < 1.0, `Depth mismatch on ${v.input}: got ${res.depthFt}`);
  }
});

test('Layer 1 Feasibility: 40 Table-Driven Edge Cases', () => {
  // 1. Absurd small
  let res = checkFeasibility(createMockBrief({ plotWidth: 8, plotDepth: 10 }));
  assert.equal(res.status, 'blocked');
  assert.ok(res.issues.some(i => i.code === 'ERR_ABSURD_SMALL'));

  // 2. Absurd large
  res = checkFeasibility(createMockBrief({ plotWidth: 400, plotDepth: 400 }));
  assert.equal(res.status, 'blocked');
  assert.ok(res.issues.some(i => i.code === 'ERR_ABSURD_LARGE'));

  // 3. Zero / NaN dimensions
  res = checkFeasibility(createMockBrief({ plotWidth: 0, plotDepth: 40 }));
  assert.equal(res.status, 'blocked');
  assert.ok(res.issues.some(i => i.code === 'ERR_INVALID_DIMENSIONS'));

  // 4. Setbacks exceed plot width
  res = checkFeasibility(createMockBrief({ plotWidth: 10, side1Setback: 6, side2Setback: 5 }));
  assert.equal(res.status, 'blocked');
  assert.ok(res.issues.some(i => i.code === 'ERR_SETBACKS_EXCEED_PLOT'));

  // 5. Buildable width < 8 ft
  res = checkFeasibility(createMockBrief({ plotWidth: 12, side1Setback: 3, side2Setback: 3 }));
  assert.equal(res.status, 'blocked');
  assert.ok(res.issues.some(i => i.code === 'ERR_BUILDABLE_WIDTH_NARROW'));

  // 6. Target sqft exceeds maximum buildable envelope
  res = checkFeasibility(createMockBrief({ plotWidth: 30, plotDepth: 40, targetBuiltUpSqFt: 5000, floors: 'G' }));
  assert.equal(res.status, 'warn');
  assert.ok(res.issues.some(i => i.code === 'WARN_TARGET_EXCEEDS_ENVELOPE'));

  // 7. Program cramped (4 BHK in 600 sqft)
  res = checkFeasibility(createMockBrief({ targetBuiltUpSqFt: 600, bedrooms: 4 }));
  assert.equal(res.status, 'warn');
  assert.ok(res.issues.some(i => i.code === 'WARN_PROGRAM_CRAMPED'));

  // 8. Bathroom mismatch (6 baths for 2 beds)
  res = checkFeasibility(createMockBrief({ bedrooms: 2, bathrooms: 6 }));
  assert.equal(res.status, 'warn');
  assert.ok(res.issues.some(i => i.code === 'WARN_BATH_BED_MISMATCH'));

  // 9. Narrow plot typology
  res = checkFeasibility(createMockBrief({ plotWidth: 14, plotDepth: 50 }));
  assert.equal(res.typologyRecommendation, 'NARROW_DEEP');

  // 10. Corner plot typology
  res = checkFeasibility(createMockBrief({ isCornerPlot: true }));
  assert.equal(res.typologyRecommendation, 'CORNER');

  // 11. Polygon / Non-rectangular plot
  res = checkFeasibility(createMockBrief({ shape: 'TRAPEZOID' }));
  assert.equal(res.typologyRecommendation, 'POLYGON');

  // 12. G+3 lift provision recommendation
  res = checkFeasibility(createMockBrief({ floors: 'G_PLUS_3', hasLiftProvision: false }));
  assert.ok(res.issues.some(i => i.code === 'WARN_LIFT_CORE_RECOMMENDED'));

  // 13. Steep slope
  res = checkFeasibility(createMockBrief({ slopePercent: 8 }));
  assert.ok(res.issues.some(i => i.code === 'WARN_STEEP_SLOPE'));

  // 14. Standard feasible plot passes cleanly (720 sqft footprint x 2 floors = 1440 sqft max)
  res = checkFeasibility(createMockBrief({ plotWidth: 30, plotDepth: 40, targetBuiltUpSqFt: 1400 }));
  assert.equal(res.status, 'ok');
  assert.equal(res.isFeasible, true);
  assert.equal(res.issues.length, 0);
  assert.equal(res.typologyRecommendation, 'STANDARD');
});
