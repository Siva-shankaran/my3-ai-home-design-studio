import test from 'node:test';
import assert from 'node:assert/strict';
import { auditProject, ENGINEERING_DISCLAIMER } from '../src/engine/investigator/investigatorEngine.ts';
import { solveLayoutForArchetype } from '../src/engine/solver/bspSolver.ts';
import type { DesignBrief } from '../src/engine/intake/schemas.ts';

function createAuditBrief(): DesignBrief {
  return {
    version: '2.0',
    projectId: 'test-audit-brief',
    projectName: 'Audit Villa',
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

test('Layer 3 Investigator: Audits clean generated design and returns PASS status', () => {
  const brief = createAuditBrief();
  const design = solveLayoutForArchetype(brief, 'COMPACT_EFFICIENT');

  const report = auditProject(design, brief);

  assert.ok(report.scorePercent >= 80, `Expected score >= 80, got ${report.scorePercent}`);
  assert.ok(report.overallStatus === 'PASS' || report.overallStatus === 'PASS_WITH_WARNINGS');
  assert.equal(report.disclaimer, ENGINEERING_DISCLAIMER);
  assert.ok(report.items.length >= 7, 'Expected at least 7 comprehensive check items');

  // Verify non-overlap check passed
  const overlapCheck = report.items.find(i => i.id === 'geo-room-overlaps');
  assert.ok(overlapCheck);
  assert.equal(overlapCheck.status, 'PASS');

  // Verify setback containment passed
  const setbackCheck = report.items.find(i => i.id === 'geo-setback-containment');
  assert.ok(setbackCheck);
  assert.equal(setbackCheck.status, 'PASS');
});

test('Layer 3 Investigator: Catches artificial room overlaps and flags FAIL', () => {
  const brief = createAuditBrief();
  const design = solveLayoutForArchetype(brief, 'COMPACT_EFFICIENT');

  // Deliberately corrupt layout by shifting room 2 directly over room 1
  if (design.floors[0].rooms.length >= 2) {
    design.floors[0].rooms[1].polygon = [...design.floors[0].rooms[0].polygon];
  }

  const report = auditProject(design, brief);
  const overlapCheck = report.items.find(i => i.id === 'geo-room-overlaps');
  assert.ok(overlapCheck);
  assert.equal(overlapCheck.status, 'FAIL');
  assert.equal(report.overallStatus, 'FAIL');
});
