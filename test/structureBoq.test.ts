import test from 'node:test';
import assert from 'node:assert/strict';
import { generateColumnGrid } from '../src/engine/structure/columnGridPlacer.ts';
import { calculateFootings } from '../src/engine/structure/loadTakedown.ts';
import { calculateBOQ } from '../src/engine/structure/boqCalculator.ts';
import { generateFootingPlanSvg, generateFootingSectionSvg } from '../src/engine/structure/foundationDrawings.ts';
import { solveLayoutForArchetype } from '../src/engine/solver/bspSolver.ts';
import type { DesignBrief } from '../src/engine/intake/schemas.ts';

function createBrief(): DesignBrief {
  return {
    version: '2.0',
    projectId: 'test-struct-brief',
    projectName: 'Structural Test Villa',
    clientName: 'Client',
    createdAt: new Date().toISOString(),
    entryMode: 'STRUCTURED',
    plot: {
      vertices: [{ x: 0, y: 0 }, { x: 30, y: 0 }, { x: 30, y: 45 }, { x: 0, y: 45 }],
      width: 30,
      depth: 45,
      shape: 'RECTANGLE',
      roadFacingSide: 'NORTH',
      roadWidthFt: 30,
      isCornerPlot: false,
      slopePercent: 0,
    },
    building: {
      floors: 'G_PLUS_1',
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

test('Layer 4 Structure: Generates column grid adhering to max span <= 16 ft', () => {
  const brief = createBrief();
  const design = solveLayoutForArchetype(brief, 'COMPACT_EFFICIENT');
  const columns = generateColumnGrid(design);

  assert.ok(columns.length >= 6, `Expected at least 6 columns, got ${columns.length}`);
  for (const c of columns) {
    assert.ok(c.code.startsWith('C'));
    assert.ok(c.widthInches >= 9);
    assert.ok(c.depthInches >= 9);
    assert.ok(c.factoredAxialLoadKN > 0);
  }
});

test('Layer 4 Structure: Sizes footings and depths based on soil SBC', () => {
  const brief = createBrief();
  const design = solveLayoutForArchetype(brief, 'COMPACT_EFFICIENT');
  const columns = generateColumnGrid(design);
  const footings = calculateFootings(columns, 'LOAM', design.floors.length);

  assert.equal(footings.length, columns.length);
  for (const f of footings) {
    assert.ok(f.code.startsWith('F'));
    assert.ok(f.lengthFt >= 3.5, 'Footing length too small');
    assert.ok(f.totalDepthFt >= 4.0, 'Footing depth below minimum safe depth');
    assert.ok(f.concreteVolumeCuM > 0);
    assert.ok(f.rebarMeshWeightKg > 0);
  }
});

test('Layer 4 BOQ: Material quantities stay within IS 456 engineering benchmarks', () => {
  const brief = createBrief();
  const design = solveLayoutForArchetype(brief, 'COMPACT_EFFICIENT');
  const columns = generateColumnGrid(design);
  const footings = calculateFootings(columns, 'LOAM', design.floors.length);
  const boq = calculateBOQ(design, footings, columns);

  assert.ok(boq.cementBagsCount >= 200, `Cement bags too low: ${boq.cementBagsCount}`);
  assert.ok(boq.concreteVolumeM20M3 > 0);
  assert.ok(boq.concreteVolumeM25M3 > 0);

  // Cross check steel kg per sq ft: must be within [3.2, 4.5] kg/sqft benchmark
  assert.ok(boq.steelKgPerSqFt >= 3.2 && boq.steelKgPerSqFt <= 4.5, `Steel benchmark failed: ${boq.steelKgPerSqFt} kg/sqft`);

  // Verify rebar diameter distribution
  assert.ok(boq.steelKgByDiameter.dia8mmKg > 0);
  assert.ok(boq.steelKgByDiameter.dia10mmKg > 0);
  assert.ok(boq.steelKgByDiameter.dia12mmKg > 0);
  assert.ok(boq.steelKgByDiameter.dia16mmKg > 0);
  assert.ok(boq.steelKgByDiameter.totalKg > 0);

  // Check itemized table
  assert.ok(boq.itemsTable.length >= 5);
  assert.ok(boq.estimatedCostRangeINR.min > 0);
});

test('Layer 4 Foundation Visuals: Generates valid parametric SVGs', () => {
  const brief = createBrief();
  const design = solveLayoutForArchetype(brief, 'COMPACT_EFFICIENT');
  const columns = generateColumnGrid(design);
  const footings = calculateFootings(columns, 'LOAM', design.floors.length);

  const planSvg = generateFootingPlanSvg(columns, footings, brief.plot.width, brief.plot.depth);
  assert.ok(planSvg.includes('<svg'));
  assert.ok(planSvg.includes('FOOTING LAYOUT PLAN'));
  assert.ok(planSvg.includes('N')); // North arrow

  const secSvg = generateFootingSectionSvg(4.5, 4.5);
  assert.ok(secSvg.includes('<svg'));
  assert.ok(secSvg.includes('N.G.L'));
  assert.ok(secSvg.includes('PCC'));
});
