import test from 'node:test';
import assert from 'node:assert/strict';
import { TYPOLOGY_RECIPES } from '../src/engine/library/recipes.ts';
import { computeBuildableEnvelope } from '../src/engine/solver/polygonInset.ts';
import { solveLayoutForArchetype } from '../src/engine/solver/bspSolver.ts';
import { computeLayoutFingerprintDistance, DIVERSITY_THRESHOLD } from '../src/engine/solver/diversityMetric.ts';
import { generateThreeCandidates } from '../src/engine/solver/candidateSynthesizer.ts';
import type { DesignBrief } from '../src/engine/intake/schemas.ts';

function createBrief(w: number = 30, d: number = 40, floors: any = 'G_PLUS_1'): DesignBrief {
  return {
    version: '2.0',
    projectId: 'test-solver-brief',
    projectName: 'Solver Test Project',
    clientName: 'Client',
    createdAt: new Date().toISOString(),
    entryMode: 'STRUCTURED',
    plot: {
      vertices: [{ x: 0, y: 0 }, { x: w, y: 0 }, { x: w, y: d }, { x: 0, y: d }],
      width: w,
      depth: d,
      shape: 'RECTANGLE',
      roadFacingSide: 'NORTH',
      roadWidthFt: 30,
      isCornerPlot: false,
      slopePercent: 0,
    },
    building: {
      floors,
      targetBuiltUpSqFt: 1800,
      hasLiftProvision: false,
      ceilingHeightFt: 10,
    },
    program: {
      bedrooms: 3,
      bathrooms: 3,
      attachedBaths: 2,
      kitchenType: 'SEMI_OPEN',
      hasUtilityWash: true,
      livingDiningArrangement: 'COMBINED_OPEN',
      parkingSpaces: { cars: 1, bikes: 2, isCovered: true },
      staircaseType: 'INTERNAL_DOG_LEGGED',
      poojaRoom: true,
      studyOffice: false,
      balconiesCount: 1,
      courtyardMuttram: true,
      thinnaiVerandah: true,
      terraceGarden: false,
    },
    regulations: {
      codeProfile: 'TNCDBR_2019',
      setbacks: {
        frontFt: 5,
        rearFt: 5,
        side1Ft: 3,
        side2Ft: 3,
        isAutoDerived: true,
      },
      vastuPreference: 'FLEXIBLE',
      budgetBand: 'STANDARD',
      soilType: 'LOAM',
      city: 'Chennai',
    },
    displayUnit: 'FEET_INCHES',
  };
}

test('Layer 2 Library: 48 Architectural Recipes exist and are valid', () => {
  assert.ok(TYPOLOGY_RECIPES.length >= 48, `Expected at least 48 recipes, got ${TYPOLOGY_RECIPES.length}`);
  for (const r of TYPOLOGY_RECIPES) {
    assert.ok(r.id.startsWith('rcp-'));
    assert.ok(r.rooms.length >= 4);
    assert.ok(r.floorsCount >= 1 && r.floorsCount <= 4);
  }
});

test('Layer 2 Solver: Polygon Inset correctly calculates buildable envelope', () => {
  const inset = computeBuildableEnvelope(30, 40, {
    frontFt: 5,
    rearFt: 5,
    side1Ft: 3,
    side2Ft: 3,
    isAutoDerived: true,
  });

  assert.equal(inset.buildableWidthFt, 24);
  assert.equal(inset.buildableDepthFt, 30);
  assert.equal(inset.buildableAreaSqFt, 720);
  assert.equal(inset.originOffset.x, 3);
  assert.equal(inset.originOffset.y, 5);
});

test('Layer 2 Solver: Multi-floor vertical core alignment (stair & wet cores align)', () => {
  const brief = createBrief(30, 45, 'G_PLUS_1');
  const design = solveLayoutForArchetype(brief, 'COMPACT_EFFICIENT');

  assert.equal(design.floors.length, 2);
  const gf = design.floors[0];
  const ff = design.floors[1];

  // Check staircase core is present and has identical dimensions on both floors
  const gfStair = gf.rooms.find(r => r.type === 'STAIRCASE');
  const ffStair = ff.rooms.find(r => r.type === 'STAIRCASE');
  assert.ok(gfStair, 'Ground floor staircase missing');
  assert.ok(ffStair, 'First floor staircase missing');
  assert.equal(gfStair.carpetAreaSqFt, ffStair.carpetAreaSqFt);
  assert.deepEqual(gfStair.polygon, ffStair.polygon);

  // Check wet-core alignment (bathrooms)
  const gfBath = gf.rooms.find(r => r.type === 'BATHROOM');
  const ffBath = ff.rooms.find(r => r.type === 'BATHROOM');
  assert.ok(gfBath, 'GF bathroom missing');
  assert.ok(ffBath, 'FF bathroom missing');
  assert.equal(gfBath.carpetAreaSqFt, ffBath.carpetAreaSqFt);
  assert.deepEqual(gfBath.polygon, ffBath.polygon);
});

test('Layer 2 Diversity: Pairwise Layout Fingerprint Distance exceeds threshold (>= 0.35)', () => {
  const brief = createBrief(32, 48, 'G_PLUS_1');
  const result = generateThreeCandidates(brief);

  assert.equal(result.candidates.length, 3);
  const [candA, candB, candC] = result.candidates;

  assert.equal(candA.archetype, 'COMPACT_EFFICIENT');
  assert.equal(candB.archetype, 'OPEN_CONTEMPORARY');
  assert.equal(candC.archetype, 'COURTYARD_PREMIUM');

  // Verify diversity matrix
  assert.ok(result.diversityMatrix.pairAB >= DIVERSITY_THRESHOLD, `Pair AB diversity failed: ${result.diversityMatrix.pairAB}`);
  assert.ok(result.diversityMatrix.pairBC >= DIVERSITY_THRESHOLD, `Pair BC diversity failed: ${result.diversityMatrix.pairBC}`);
  assert.ok(result.diversityMatrix.pairAC >= DIVERSITY_THRESHOLD, `Pair AC diversity failed: ${result.diversityMatrix.pairAC}`);
  assert.equal(result.diversityMatrix.allPassThreshold, true);
});
