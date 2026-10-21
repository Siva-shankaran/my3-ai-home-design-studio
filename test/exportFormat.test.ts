import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { generateThreeCandidates } from '../src/engine/solver/candidateSynthesizer.ts';
import { exportProjectToDxf, DxfWriter } from '../src/engine/export/dxfWriter.ts';
import { exportFloorPlanToSvg } from '../src/engine/export/svgExporter.ts';
import { PdfIssueSetGenerator } from '../src/engine/export/pdfIssueSet.ts';
import { SimpleZipWriter, bundleCompleteProjectZip } from '../src/engine/export/zipBundler.ts';
import { STANDARD_ISSUE_SHEETS } from '../src/engine/export/exportTypes.ts';
import type { DesignBrief } from '../src/engine/intake/schemas.ts';

function createBrief(w: number = 30, d: number = 50): DesignBrief {
  return {
    version: '2.0',
    projectId: 'test-export-brief',
    projectName: 'Export Test Villa',
    clientName: 'Test Client',
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
      soilType: 'LOAM',
      city: 'Chennai',
    },
    displayUnit: 'FEET_INCHES',
  };
}

describe('Layer 5 Export Suite: DXF, SVG, 15-Sheet PDF & ZIP Bundler', () => {
  const brief = createBrief(30, 50);
  const result = generateThreeCandidates(brief);
  const sampleProject = result.candidates[0];

  test('AutoCAD DXF: Generates valid R12/2000 structure with required layers and disclaimer', () => {
    const dxf = exportProjectToDxf(sampleProject);
    assert.ok(typeof dxf === 'string', 'DXF must be a string');
    assert.ok(dxf.includes('HEADER'), 'DXF must have HEADER section');
    assert.ok(dxf.includes('TABLES'), 'DXF must have TABLES section');
    assert.ok(dxf.includes('ENTITIES'), 'DXF must have ENTITIES section');
    assert.ok(dxf.includes('EOF'), 'DXF must end with EOF');

    // Verify architectural & structural layers
    assert.ok(dxf.includes('WALLS_EXTERIOR'), 'DXF must define WALLS_EXTERIOR layer');
    assert.ok(dxf.includes('ROOM_LABELS'), 'DXF must define ROOM_LABELS layer');
    assert.ok(dxf.includes('COLUMNS'), 'DXF must define COLUMNS layer');
    assert.ok(dxf.includes('FOOTINGS'), 'DXF must define FOOTINGS layer');
    assert.ok(dxf.includes('GRID_AXES'), 'DXF must define GRID_AXES layer');

    // Mandatory legal disclaimer check
    assert.ok(
      dxf.includes('ENGINEERING DISCLAIMER'),
      'DXF must contain engineering disclaimer in title block'
    );
  });

  test('Architectural Vector SVG: Generates complete valid SVG with title block and north arrow', () => {
    const svg = exportFloorPlanToSvg(sampleProject, { floorIndex: 0 });
    assert.ok(svg.startsWith('<?xml') || svg.includes('<svg'), 'Must produce valid SVG markup');
    assert.ok(svg.includes('viewBox='), 'SVG must define viewBox');
    assert.ok(svg.includes('plot-bnd'), 'SVG must render plot boundary');
    assert.ok(svg.includes('room-poly'), 'SVG must render room polygons');
    assert.ok(svg.includes('col-shape'), 'SVG must render structural columns');
    assert.ok(svg.includes('North Arrow'), 'SVG must render north orientation arrow');
    assert.ok(svg.includes('PRELIMINARY ENGINEERING INTENT'), 'SVG must have disclaimer');
  });

  test('Professional 15-Sheet PDF Issue Set: Generates 15 landscape sheets matching index', () => {
    assert.equal(STANDARD_ISSUE_SHEETS.length, 15, 'Issue set must specify exactly 15 standard sheets');

    const gen = new PdfIssueSetGenerator({ paperSize: 'A3' });
    const doc = gen.generateFullIssueSet(sampleProject);

    // Verify page count
    assert.equal(doc.getNumberOfPages(), 15, 'PDF must generate exactly 15 landscape sheets');

    // Verify binary output
    const ab = doc.output('arraybuffer');
    assert.ok(ab.byteLength > 10000, 'PDF buffer must be greater than 10KB');
  });

  test('Zero-Dependency ZIP Packager: Bundles all drawing deliverables with valid PK signature', () => {
    const zipBytes = bundleCompleteProjectZip(sampleProject);
    assert.ok(zipBytes instanceof Uint8Array, 'Output must be Uint8Array');
    assert.ok(zipBytes.length > 5000, 'Zip file must have substantial content');

    // Check standard ZIP signature: 0x50 0x4B 0x03 0x04 ('PK\x03\x04')
    assert.equal(zipBytes[0], 0x50, 'Byte 0 must be P');
    assert.equal(zipBytes[1], 0x4b, 'Byte 1 must be K');
    assert.equal(zipBytes[2], 0x03, 'Byte 2 must be 3');
    assert.equal(zipBytes[3], 0x04, 'Byte 3 must be 4');
  });
});
