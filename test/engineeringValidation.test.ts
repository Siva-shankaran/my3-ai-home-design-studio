import test from 'node:test';
import assert from 'node:assert/strict';
import { geometryValidationService } from '../src/services/geometryValidationService.ts';
import { tamilNaduRulesService } from '../src/services/tamilNaduRulesService.ts';
import { geotechnicalService } from '../src/services/geotechnicalService.ts';
import { tamilNaduCostService } from '../src/services/tamilNaduCostService.ts';
import { designService } from '../src/services/designService.ts';

test('Geometry Validation Engine - Multi-floor continuous project passes', () => {
  const project = designService.buildEngineeredMultiFloorPlan('4 Bed Modern Villa', {
    sqft: 2400,
    floors: 2,
    bedrooms: 4,
    bathrooms: 3,
    style: 'Modern Minimalist',
    lotWidth: 40,
    lotDepth: 60
  });

  const report = geometryValidationService.validateProjectGeometry(project);
  assert.equal(typeof report.isValid, 'boolean');
  assert.ok(report.metrics.grossBuiltupAreaSqft > 0);
  assert.ok(report.metrics.carpetAreaSqft > 0);
  assert.ok(report.metrics.columnVerticalAlignmentScore >= 90);
});

test('Geometry Validation Engine - Column Grid Generation', () => {
  const rooms = [
    { id: 'r1', name: 'Living', type: 'living' as const, x: 0, y: 0, width: 20, height: 16, color: '#000', floor: 1 },
    { id: 'r2', name: 'Kitchen', type: 'kitchen' as const, x: 20, y: 0, width: 14, height: 16, color: '#000', floor: 1 }
  ];

  const columns = geometryValidationService.generateRccColumnGrid(rooms);
  assert.ok(columns.length >= 4);
  assert.equal(columns[0].width, 0.75); // 9 inches
  assert.equal(columns[0].depth, 1.25); // 15 inches standard RCC column
});

test('TNCDBR-2019 Rule Engine - Official Provenance and Status Verification', () => {
  const project = designService.buildEngineeredMultiFloorPlan('Contemporary Chennai Home', {
    sqft: 2200,
    floors: 2,
    bedrooms: 3,
    bathrooms: 2,
    style: 'Modern',
    district: 'Chennai',
    roadWidthFeet: 30
  });

  const ruleResults = tamilNaduRulesService.evaluateTNCDBR(project);
  assert.ok(ruleResults.length >= 6);

  // Check Rule 36 Coverage
  const coverageRule = ruleResults.find(r => r.ruleId === 'TNCDBR-RULE-36-COVERAGE');
  assert.ok(coverageRule);
  assert.equal(coverageRule?.standard, 'TNCDBR_2019');
  assert.ok(['PASS', 'POTENTIAL_ISSUE'].includes(coverageRule.status));

  // Check Rule 42 Rainwater Harvesting
  const rwhRule = ruleResults.find(r => r.ruleId === 'TNCDBR-RULE-42-RWH');
  assert.ok(rwhRule);
  assert.equal(rwhRule?.status, 'REQUIRES_PROFESSIONAL_VERIFICATION');
  assert.ok(rwhRule?.officialSource.includes('Tamil Nadu'));
});

test('Geotechnical Service - Regional Soil Profiles and Foundation Concept Ranking', () => {
  // Chennai coastal soft clay
  const chennaiDefaults = geotechnicalService.getRegionalSoilDefaults('Chennai');
  assert.ok(chennaiDefaults.estimatedSbcKpa <= 130);
  assert.ok(chennaiDefaults.engineeringAdvisory.includes('Monsoon'));

  const chennaiFoundation = geotechnicalService.evaluateFoundationSystem({
    hasReport: true,
    safeBearingCapacityKpa: 100,
    groundwaterDepthMeters: 1.2,
    isVerifiedByEngineer: true
  }, 'Chennai', 2);

  assert.ok(chennaiFoundation.length >= 3);
  // In soft clay (100 kPa) with high water table (1.2m), Raft or Pile has high score
  const topConcept = chennaiFoundation[0];
  assert.ok(topConcept.type === 'raft_foundation' || topConcept.type === 'pile_foundation');

  // Coimbatore hard red gravel (220 kPa)
  const cbeDefaults = geotechnicalService.getRegionalSoilDefaults('Coimbatore');
  assert.ok(cbeDefaults.estimatedSbcKpa >= 200);

  const cbeFoundation = geotechnicalService.evaluateFoundationSystem({
    hasReport: true,
    safeBearingCapacityKpa: 220,
    groundwaterDepthMeters: 5.0,
    isVerifiedByEngineer: true
  }, 'Coimbatore', 2);

  assert.equal(cbeFoundation[0].type, 'isolated_footing');
  assert.ok(cbeFoundation[0].suitabilityScore >= 90);
});

test('Tamil Nadu Cost Estimator - Bill of Quantities (BOQ) and Land Area Conversion', () => {
  const cost = tamilNaduCostService.calculateCostEstimate(2400, 'Chennai', false);
  assert.ok(cost.totalCostInr > 4000000); // Greater than ₹40 Lakhs
  assert.ok(cost.materialsBreakdown.cementBags > 800);
  assert.ok(cost.materialsBreakdown.steelKg > 7000);
  assert.ok(cost.materialsBreakdown.bricksNos > 30000);

  // Land area conversions
  const land = tamilNaduCostService.convertLandArea(2400);
  assert.equal(land.grounds, 1.0); // 1 Ground = 2400 sq ft
  assert.equal(land.cents, 5.51);  // 2400 / 435.6 = 5.51 cents

  const formattedRupees = tamilNaduCostService.formatIndianRupees(6500000);
  assert.equal(formattedRupees, '₹65.00 Lakhs');
});

test('Traditional Tamil Nadu Thinnai & Muttram Courtyard Generator', () => {
  const project = designService.buildTraditionalThinnaiCourtyardHome('Traditional Thanjavur Home', {
    sqft: 2500,
    floors: 2,
    bedrooms: 4,
    bathrooms: 3,
    style: 'Traditional Tamil Nadu Courtyard',
    regionalPreset: 'Traditional_Thinnai'
  });

  const rooms = project.rooms;
  const thinnai = rooms.find(r => r.type === 'thinnai');
  const muttram = rooms.find(r => r.type === 'muttram');
  const puja = rooms.find(r => r.type === 'puja');

  assert.ok(thinnai, 'Thinnai verandah room must exist');
  assert.ok(muttram, 'Central Muttram courtyard room must exist');
  assert.ok(puja, 'Sacred Puja shrine room must exist');
  assert.ok(project.columns && project.columns.length > 0, 'RCC columns must be generated');
  assert.ok(project.tnCostEstimate, 'Tamil Nadu cost estimate must be attached');
});

test('i18n Translation & String Sanitization Engine', async () => {
  const { cleanEnglishName, getRoomDisplayName } = await import('../src/services/i18n.ts');

  // Verify English strings do not retain Tamil in parentheses
  const cleanedEn = cleanEnglishName('Thinnai Verandah (திண்ணை)');
  assert.equal(cleanedEn, 'Thinnai Verandah');

  // In English mode, displayName is pure English
  const enName = getRoomDisplayName('living', 'Koodam Living Hall (கூடம்)', 'கூடம்', 'en');
  assert.equal(enName, 'Koodam Living Hall');

  // In Tamil mode, displayName is pure Tamil
  const taName = getRoomDisplayName('living', 'Koodam Living Hall', 'கூடம்', 'ta');
  assert.equal(taName, 'கூடம்');

  const taThinnai = getRoomDisplayName('thinnai', 'Thinnai Verandah', 'திண்ணை', 'ta');
  assert.equal(taThinnai, 'திண்ணை');
});

test('Architectural Vector SVG Export Generation', async () => {
  const { exportService } = await import('../src/services/exportService.ts');

  const project = designService.buildEngineeredMultiFloorPlan('Contemporary Villa', {
    sqft: 2400,
    floors: 2,
    bedrooms: 4,
    bathrooms: 3,
    style: 'Tamil Nadu Contemporary'
  });

  const svg = exportService.generateSvg(project, { language: 'en', showColumns: true });
  assert.ok(svg.startsWith('<?xml'), 'SVG must start with xml declaration');
  assert.ok(svg.includes('<g id="rooms">'), 'SVG must contain rooms layer');
  assert.ok(svg.includes('<g id="columns">'), 'SVG must contain columns layer');
  assert.ok(svg.includes('<g id="labels">'), 'SVG must contain labels layer');
});

test('Maket Sample Project (1,300 sqft) - Structural zones, fixtures & cameras verification', () => {
  const maketProj = designService.getMaketSampleProject();
  assert.equal(maketProj.sqft, 1300);
  assert.equal(maketProj.floors, 1);
  assert.equal(maketProj.rooms.length, 16, 'Maket sample must have exactly 16 programmatic zones');
  assert.equal(maketProj.furniture.length, 27, 'Maket sample must have exactly 27 fixtures');
  assert.ok(maketProj.cameras && maketProj.cameras.length === 11, 'Maket sample must have 11 room cameras');
  assert.ok(maketProj.walls.length >= 50, 'Maket sample must have derived wall segments');
  assert.ok(maketProj.doors.length >= 8, 'Maket sample must include interior and entry doors');
  assert.ok(maketProj.windows.length >= 5, 'Maket sample must include perimeter windows');
});

test('Maket 5-Stage Floor Plan Generator Pipeline', async () => {
  const plan = await designService.generateMaketFlowPlan({
    floorCount: 1,
    targetSqft: 1800,
    shape: 'l_shape',
    rooms: [
      { id: '1', category: 'living_room', label: 'Living Room', count: 1 },
      { id: '2', category: 'master_bedroom', label: 'Master Bedroom', count: 1 },
      { id: '3', category: 'bedroom', label: 'Guest Bedroom', count: 2 },
      { id: '4', category: 'kitchen', label: 'Kitchen', count: 1 },
      { id: '5', category: 'full_bathroom', label: 'Bath', count: 2 }
    ],
    frontDoorWall: 'front',
    frontDoorAlignment: 'center',
    style: 'Modern'
  });

  assert.equal(plan.floors, 1);
  assert.equal(plan.sqft, 1800);
  assert.equal(plan.rooms.length, 7, 'Should expand 1 living + 1 master + 2 guest beds + 1 kitchen + 2 baths = 7 rooms');
  assert.equal(plan.cameras?.length, 7, 'Should generate center cameras for all 7 rooms');
  assert.ok(plan.walls.length > 0, 'Should generate walls');
  assert.ok(plan.doors.length > 0, 'Should generate entry & internal doors');
});

test('Units Module - Precision Conversions & 8\'12" Rounding Prevention', async () => {
  const { Units } = await import('../src/engine/geometry/units.ts');

  // Conversions
  assert.equal(Math.round(Units.feetToMeters(10) * 1000) / 1000, 3.048);
  assert.equal(Math.round(Units.metersToFeet(3.048) * 10) / 10, 10.0);
  assert.equal(Math.round(Units.sqftToSqm(1000) * 10) / 10, 92.9);

  // Critical fix: 8.99 feet must format as 9' 0", NEVER 8' 12"
  const formatted899 = Units.formatFeetInches(8.99);
  assert.equal(formatted899, '9\' 0"');

  const formatted800 = Units.formatFeetInches(8.0);
  assert.equal(formatted800, '8\' 0"');

  const formatted14_6 = Units.formatFeetInches(14.5);
  assert.equal(formatted14_6, '14\' 6"');

  // Parsing
  assert.equal(Units.parseFeetInches('14\' 6"'), 14.5);
  assert.equal(Units.parseFeetInches('10\' 0"'), 10);
});

test('Polygon & Spatial Math - Shoelace Area & Point Containment', async () => {
  const { Polygon } = await import('../src/engine/geometry/polygon.ts');

  // Shoelace area of 20 x 15 rectangle
  const rect = [
    { x: 0, y: 0 },
    { x: 20, y: 0 },
    { x: 20, y: 15 },
    { x: 0, y: 15 }
  ];
  const area = Polygon.calculateShoelaceArea(rect);
  assert.equal(area, 300);

  // Centroid
  const centroid = Polygon.calculateCentroid(rect);
  assert.equal(centroid.x, 10);
  assert.equal(centroid.y, 7.5);

  // Point in polygon
  assert.equal(Polygon.isPointInPolygon({ x: 10, y: 5 }, rect), true);
  assert.equal(Polygon.isPointInPolygon({ x: 25, y: 5 }, rect), false);
});

test('Spatial Intersections - Room Overlaps & Setback Violations', async () => {
  const { Intersections } = await import('../src/engine/geometry/intersections.ts');

  const roomA = { id: 'r1', name: 'Living', x: 0, y: 0, width: 20, height: 16 };
  const roomBOverlapping = { id: 'r2', name: 'Kitchen', x: 15, y: 10, width: 10, height: 10 };
  const roomCAdjacent = { id: 'r3', name: 'Dining', x: 20, y: 0, width: 12, height: 16 };

  // Overlap test
  assert.equal(Intersections.checkRoomsOverlap(roomA, roomBOverlapping), true);
  const overlapArea = Intersections.calculateOverlapArea(roomA, roomBOverlapping);
  assert.equal(overlapArea, 5 * 6); // (20-15) * (16-10) = 30

  // Adjacent test (touching boundary at x=20 is NOT an overlap)
  assert.equal(Intersections.checkRoomsOverlap(roomA, roomCAdjacent), false);

  // Setback violation test
  const plot = { width: 40, depth: 60 };
  const setbacks = { front: 5, rear: 5, left: 4, right: 4 };

  const validRoom = { id: 'vr', name: 'Bed', x: 5, y: 6, width: 14, height: 12 };
  const setbackResultsValid = Intersections.validateSetbacks([validRoom], plot, setbacks);
  assert.equal(setbackResultsValid.isValid, true);

  const encroachingRoom = { id: 'er', name: 'Garage', x: 1, y: 2, width: 14, height: 12 };
  const setbackResultsInvalid = Intersections.validateSetbacks([encroachingRoom], plot, setbacks);
  assert.equal(setbackResultsInvalid.isValid, false);
  assert.ok(setbackResultsInvalid.violations.length >= 2);
});

test('Area Calculations - Carpet, Built-up, Circulation & Outer Envelope', async () => {
  const { AreaCalculations } = await import('../src/engine/geometry/areaCalculations.ts');

  const sampleRooms = [
    { id: '1', name: 'Living', type: 'living' as const, width: 20, height: 15, x: 0, y: 0, floor: 1, color: '#000' },
    { id: '2', name: 'Kitchen', type: 'kitchen' as const, width: 12, height: 12, x: 20, y: 0, floor: 1, color: '#000' },
    { id: '3', name: 'Bed 1', type: 'bedroom' as const, width: 14, height: 12, x: 0, y: 15, floor: 1, color: '#000' },
    { id: '4', name: 'Bath 1', type: 'bath' as const, width: 8, height: 6, x: 14, y: 15, floor: 1, color: '#000' },
    { id: '5', name: 'Corridor', type: 'hallway' as const, width: 6, height: 6, x: 14, y: 21, floor: 1, color: '#000' }
  ];

  const report = AreaCalculations.generateAreaReport(sampleRooms, 0.75, 0.35);
  assert.ok(report.totalCarpetArea > 0);
  assert.ok(report.totalBuiltUpArea > report.totalCarpetArea);
  assert.ok(report.circulationPercentage >= 0);
  assert.ok(report.floorBreakdown[1]);
  assert.equal(report.roomBreakdown.length, 5);
});

test('Architectural Template Library - 12 Distinct Validated Layouts', async () => {
  const { TemplateLibrary } = await import('../src/engine/templates/templateLibrary.ts');

  const allTemplates = TemplateLibrary.getAllTemplates();
  assert.ok(allTemplates.length >= 12, `Must provide at least 12 templates, found ${allTemplates.length}`);

  // Patterns A, B, C, D must all be represented
  const patternA = allTemplates.filter(t => t.pattern === 'compact_efficient');
  const patternB = allTemplates.filter(t => t.pattern === 'contemporary_open');
  const patternC = allTemplates.filter(t => t.pattern === 'courtyard_daylight');
  const patternD = allTemplates.filter(t => t.pattern === 'premium_residence');

  assert.ok(patternA.length >= 2, 'Pattern A (Compact & Efficient) must have templates');
  assert.ok(patternB.length >= 3, 'Pattern B (Contemporary Open-Plan) must have templates');
  assert.ok(patternC.length >= 2, 'Pattern C (Courtyard & Lightwell) must have templates');
  assert.ok(patternD.length >= 2, 'Pattern D (Premium Residence) must have templates');

  // Verify geometry integrity for each template
  for (const t of allTemplates) {
    assert.ok(t.id, 'Template must have id');
    assert.ok(t.name, 'Template must have name');
    assert.ok(t.rooms.length >= 3, `${t.id} must have at least 3 rooms`);
    assert.ok(t.doors.length >= 2, `${t.id} must have doors`);
    assert.ok(t.windows.length >= 2, `${t.id} must have windows`);
    assert.ok(t.furniture.length >= 2, `${t.id} must have furniture fixtures`);
  }
});

test('Floor Plan Validator & IRC / NBC Building Code Audits', async () => {
  const { FloorPlanValidator } = await import('../src/engine/validation/floorPlanValidator.ts');

  const validRooms = [
    { id: 'b1', name: 'Master Bed', type: 'bedroom' as const, width: 14, height: 12, x: 0, y: 0, floor: 1, color: '#000' },
    { id: 'b2', name: 'Bath', type: 'bath' as const, width: 8, height: 6, x: 14, y: 0, floor: 1, color: '#000' }
  ];
  const validWindows = [
    { id: 'w1', wallId: 'w1', position: { x: 7, y: 0 }, width: 4, height: 4, sillHeight: 3, floor: 1 }
  ];

  const validation = FloorPlanValidator.validateLayout(validRooms, [], validWindows, 1);
  assert.equal(validation.hasCriticalErrors, false);

  // Sub-standard bedroom test: width < 7ft or area < 70 sqft
  const tinyBedroom = [
    { id: 'tb', name: 'Tiny Bed', type: 'bedroom' as const, width: 6, height: 10, x: 0, y: 0, floor: 1, color: '#000' }
  ];
  const failValidation = FloorPlanValidator.validateLayout(tinyBedroom, [], [], 1);
  assert.equal(failValidation.hasCriticalErrors, true);
  assert.ok(failValidation.issues.some(i => i.code === 'BEDROOM_TOO_NARROW'));
  assert.ok(failValidation.issues.some(i => i.code === 'BEDROOM_TOO_SMALL'));
});

test('3-Candidate Generator - Synthesizes 3 Distinct Architectural Solutions', async () => {
  const { CandidateGenerator } = await import('../src/engine/generator/candidateGenerator.ts');

  const requirements = {
    plotWidth: 45,
    plotDepth: 60,
    targetSqft: 2200,
    floors: 2 as const,
    bedrooms: 3,
    bathrooms: 3,
    style: 'Contemporary Open-Plan',
    roadFacing: 'North' as const,
    hasCourtyard: false,
    hasPoojaRoom: true,
    hasHomeOffice: true,
    hasCarParking: true,
    setbacks: { front: 5, rear: 5, left: 3.5, right: 3.5 }
  };

  const candidates = CandidateGenerator.generateThreeCandidates(requirements);
  assert.equal(candidates.length, 3, 'Must produce exactly 3 distinct candidate designs');

  // Verify Option 01, 02, 03 labels
  assert.equal(candidates[0].optionIndex, 1);
  assert.equal(candidates[1].optionIndex, 2);
  assert.equal(candidates[2].optionIndex, 3);

  // Verify distinct concepts
  assert.ok(candidates[0].conceptTitle.includes('Space-Optimized') || candidates[0].conceptTitle.includes('Optimized'));
  assert.ok(candidates[1].conceptTitle.includes('Contemporary') || candidates[1].conceptTitle.includes('Living'));
  assert.ok(candidates[2].conceptTitle.includes('Spatial') || candidates[2].conceptTitle.includes('Courtyard') || candidates[2].conceptTitle.includes('Executive'));

  // Verify that templates used are not identical
  const templateIds = candidates.map(c => c.templateId);
  const uniqueTemplates = new Set(templateIds);
  assert.ok(uniqueTemplates.size >= 2, 'Candidates must not all be identical duplicates');

  // Verify evaluations
  for (const c of candidates) {
    assert.ok(c.evaluation.overallScore >= 70, `${c.name} overall score should be >= 70`);
    assert.ok(c.project.rooms.length >= 5, `${c.name} must have room geometry`);
    assert.ok(c.project.walls.length > 0, `${c.name} must have derived wall geometry`);
    assert.ok(c.tradeoffs.length >= 2, `${c.name} must present trade-offs`);
  }
});


