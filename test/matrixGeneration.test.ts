import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { generateThreeCandidates } from '../src/engine/solver/candidateSynthesizer.ts';
import { auditProject } from '../src/engine/investigator/investigatorEngine.ts';
import { exportProjectToDxf } from '../src/engine/export/dxfWriter.ts';
import { exportFloorPlanToSvg } from '../src/engine/export/svgExporter.ts';
import { PdfIssueSetGenerator } from '../src/engine/export/pdfIssueSet.ts';
import type { DesignBrief } from '../src/engine/intake/schemas.ts';

function buildMatrixBrief(params: {
  width: number;
  depth: number;
  floors: 'G' | 'G_PLUS_1' | 'G_PLUS_2';
  bedrooms: number;
  facing: 'NORTH' | 'SOUTH' | 'EAST' | 'WEST';
  soilType?: 'CLAYEY' | 'SANDY' | 'LOAM' | 'BLACK_COTTON' | 'HARD_MOORUM_ROCK';
}): DesignBrief {
  const w = params.width;
  const d = params.depth;
  return {
    version: '2.0',
    projectId: `matrix-brief-${w}x${d}-${params.floors}`,
    projectName: `Matrix Villa ${w}x${d} ${params.facing}`,
    clientName: 'Parametric Test Runner',
    createdAt: new Date().toISOString(),
    entryMode: 'STRUCTURED',
    plot: {
      vertices: [{ x: 0, y: 0 }, { x: w, y: 0 }, { x: w, y: d }, { x: 0, y: d }],
      width: w,
      depth: d,
      shape: 'RECTANGLE',
      roadFacingSide: params.facing,
      roadWidthFt: 30,
      isCornerPlot: false,
      slopePercent: 0,
    },
    building: {
      floors: params.floors,
      targetBuiltUpSqFt: w * d * (params.floors === 'G' ? 0.65 : params.floors === 'G_PLUS_1' ? 1.3 : 1.9),
      hasLiftProvision: false,
      ceilingHeightFt: 10,
    },
    program: {
      bedrooms: params.bedrooms,
      bathrooms: Math.max(2, params.bedrooms),
      attachedBaths: Math.max(1, params.bedrooms - 1),
      kitchenType: 'SEMI_OPEN',
      hasUtilityWash: true,
      livingDiningArrangement: 'COMBINED_OPEN',
      parkingSpaces: { cars: 1, bikes: 2, isCovered: true },
      staircaseType: 'INTERNAL_DOG_LEGGED',
      poojaRoom: true,
      studyOffice: params.bedrooms >= 4,
      balconiesCount: params.floors === 'G' ? 0 : 2,
      courtyardMuttram: false,
      thinnaiVerandah: false,
      terraceGarden: false,
    },
    regulations: {
      codeProfile: 'TNCDBR_2019',
      setbacks: {
        frontFt: 5,
        rearFt: 5,
        side1Ft: 3.5,
        side2Ft: 3.5,
        isAutoDerived: true,
      },
      vastuPreference: 'FLEXIBLE',
      budgetBand: 'STANDARD',
      soilType: params.soilType || 'LOAM',
      city: 'Chennai',
    },
    displayUnit: 'FEET_INCHES',
  };
}

describe('Layer 6 Matrix Stress Test: Diverse Parameter Combinations', () => {
  // Matrix parameter sets covering small urban plots, standard suburban plots, large estate villas
  const testMatrix = [
    { width: 30, depth: 40, floors: 'G_PLUS_1' as const, bedrooms: 3, facing: 'NORTH' as const },
    { width: 30, depth: 50, floors: 'G_PLUS_1' as const, bedrooms: 3, facing: 'EAST' as const },
    { width: 40, depth: 60, floors: 'G_PLUS_2' as const, bedrooms: 4, facing: 'SOUTH' as const },
    { width: 25, depth: 40, floors: 'G' as const, bedrooms: 2, facing: 'WEST' as const },
    { width: 35, depth: 55, floors: 'G_PLUS_1' as const, bedrooms: 4, facing: 'NORTH' as const },
    { width: 45, depth: 65, floors: 'G_PLUS_2' as const, bedrooms: 5, facing: 'EAST' as const, soilType: 'CLAYEY' as const },
  ];

  test('Matrix Test: Zero Room Overlaps across all matrix variations', () => {
    for (const params of testMatrix) {
      const brief = buildMatrixBrief(params);
      const { candidates } = generateThreeCandidates(brief);

      assert.equal(candidates.length, 3, `Must generate 3 candidates for ${params.width}x${params.depth}`);

      for (const candidate of candidates) {
        const report = auditProject(candidate, brief);
        const overlapItem = report.items.find((i) => i.id === 'geo-room-overlaps');
        assert.ok(overlapItem, 'Must have geo-room-overlaps audit item');
        assert.equal(
          overlapItem.status,
          'PASS',
          `Archetype ${candidate.archetype} for ${params.width}x${params.depth} must have zero room overlaps!`
        );
      }
    }
  });

  test('Matrix Test: Hungarian Pairwise Diversity Metric >= 0.35 across all configurations', () => {
    for (const params of testMatrix) {
      const brief = buildMatrixBrief(params);
      const { diversityMatrix } = generateThreeCandidates(brief);

      assert.ok(
        diversityMatrix.pairAB >= 0.35,
        `Pair A-B diversity ${diversityMatrix.pairAB.toFixed(3)} must be >= 0.35 for ${params.width}x${params.depth}`
      );
      assert.ok(
        diversityMatrix.pairBC >= 0.35,
        `Pair B-C diversity ${diversityMatrix.pairBC.toFixed(3)} must be >= 0.35 for ${params.width}x${params.depth}`
      );
      assert.ok(
        diversityMatrix.pairAC >= 0.35,
        `Pair A-C diversity ${diversityMatrix.pairAC.toFixed(3)} must be >= 0.35 for ${params.width}x${params.depth}`
      );
    }
  });

  test('Matrix Test: Structural & BOQ Benchmarks adhere to IS 456 rules', () => {
    for (const params of testMatrix) {
      const brief = buildMatrixBrief(params);
      const { candidates } = generateThreeCandidates(brief);

      for (const cand of candidates) {
        assert.ok(cand.structuralColumns.length >= 4, 'Must have at least 4 corner columns');
        assert.ok(cand.structuralFootings.length >= 4, 'Must have footings for all columns');
        assert.ok(cand.boqSummary.cementBagsCount > 0, 'Cement bags count must be positive');
        assert.ok(
          cand.boqSummary.steelKgPerSqFt >= 2.5 && cand.boqSummary.steelKgPerSqFt <= 6.0,
          `Steel kg/sqft (${cand.boqSummary.steelKgPerSqFt.toFixed(2)}) must be within engineering bounds`
        );
      }
    }
  });

  test('Matrix Test: Universal Export Suite generates valid DXF, SVG, and PDF for matrix candidates', () => {
    const brief = buildMatrixBrief(testMatrix[0]);
    const { candidates } = generateThreeCandidates(brief);
    const candidate = candidates[0];

    // DXF test
    const dxf = exportProjectToDxf(candidate);
    assert.ok(dxf.includes('WALLS_EXTERIOR'));

    // SVG test
    const svg = exportFloorPlanToSvg(candidate, { floorIndex: 0 });
    assert.ok(svg.includes('<svg'));

    // PDF 15-Sheet test
    const pdfGen = new PdfIssueSetGenerator({ paperSize: 'A3' });
    const pdf = pdfGen.generateFullIssueSet(candidate);
    assert.equal(pdf.getNumberOfPages(), 15);
  });
});
