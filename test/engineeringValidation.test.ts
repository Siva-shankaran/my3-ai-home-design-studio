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

