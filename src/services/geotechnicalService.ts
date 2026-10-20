import type { GeotechnicalData, FoundationConcept, TamilNaduDistrict } from '../types/index.ts';

export const geotechnicalService = {
  /**
   * Evaluates soil investigation data and returns foundation concepts with engineering trade-offs
   */
  evaluateFoundationSystem(
    geotech: GeotechnicalData,
    district: string = 'Chennai',
    floors: number = 2
  ): FoundationConcept[] {
    const sbc = geotech.safeBearingCapacityKpa || 150; // default benchmark if not investigated
    const waterTable = geotech.groundwaterDepthMeters ?? 2.5;
    const isCoastal = district === 'Chennai' || district === 'Chengalpattu' || district === 'Cuddalore';

    const concepts: FoundationConcept[] = [];

    // Concept 1: Isolated Column Footing (Trapezoidal / Stepped)
    const isIsolatedSuitable = sbc >= 150 && waterTable > 1.5;
    concepts.push({
      type: 'isolated_footing',
      title: 'Isolated RCC Trapezoidal Footing System',
      description: 'Individual reinforced concrete footings cast under each column, connected by ground plinth beams.',
      recommendedDepthMeters: 1.5,
      suitabilityScore: isIsolatedSuitable ? 95 : 55,
      plinthBeamSize: '230 × 380 mm (9" × 15") Grade M25 Concrete',
      missingDataChecklist: [
        geotech.hasReport ? '✓ Soil borehole investigation attached' : '⚠ Soil test report missing; SBC value is unverified',
        geotech.groundwaterDepthMeters !== undefined ? '✓ Seasonal water table confirmed' : '⚠ Monsoon water table depth unconfirmed',
        '⚠ Structural column axial load schedule from ETABS / STAAD pending review'
      ],
      tradeOffs: [
        'Most economical foundation system for firm soils in Tamil Nadu (Coimbatore, Salem, Trichy, upland Chennai).',
        'Susceptible to differential settlement if soil bearing capacity varies across the plot footprint.'
      ],
      constructionPrecaution: 'Ensure anti-termite treatment at plinth level and minimum 75mm lean concrete (PCC 1:4:8) sub-base before placing footing rebar.'
    });

    // Concept 2: Combined Footing
    concepts.push({
      type: 'combined_footing',
      title: 'Combined Strip / Strap Footing for Boundary Columns',
      description: 'Shared footing for columns located right at the plot boundary wall where footing projection is restricted.',
      recommendedDepthMeters: 1.8,
      suitabilityScore: 85,
      plinthBeamSize: '230 × 450 mm (9" × 18") with heavy top cantilever rebar',
      missingDataChecklist: [
        '⚠ Boundary offset from adjacent property walls requires physical tape verification',
        '⚠ Surcharge load from neighboring structures not yet assessed'
      ],
      tradeOffs: [
        'Prevents eccentricity on boundary columns without encroaching on neighbor property.',
        'Requires thicker footing depth and higher steel reinforcement to resist negative bending moments.'
      ],
      constructionPrecaution: 'Provide expansion joint gap filler between the new boundary foundation and adjacent existing building.'
    });

    // Concept 3: Raft (Mat) Foundation
    const isRaftSuitable = sbc < 120 || waterTable < 1.5 || isCoastal;
    concepts.push({
      type: 'raft_foundation',
      title: 'RCC Raft / Mat Foundation with Plinth Grid',
      description: 'Continuous reinforced concrete slab covering the entire building footprint, distributing structural loads evenly.',
      recommendedDepthMeters: 1.2,
      suitabilityScore: isRaftSuitable ? 90 : 60,
      plinthBeamSize: '300 × 500 mm (12" × 20") stiffener ribs',
      missingDataChecklist: [
        '⚠ Soil modulus of subgrade reaction (k-value) required for slab thickness design',
        '⚠ Water-proofing membrane and sump tank integration required'
      ],
      tradeOffs: [
        'Superior protection against differential settlement in soft soils, marine clay, or high water table areas.',
        'Significantly higher concrete volume and steel consumption compared to isolated footings (+35% cost).'
      ],
      constructionPrecaution: 'Incorporate crystalline waterproofing admixtures in concrete mix and seal all construction cold joints with PVC waterstops.'
    });

    // Concept 4: Bored Cast-in-situ Pile Foundation
    const isPileSuitable = isCoastal && (sbc < 100 || floors >= 3);
    concepts.push({
      type: 'pile_foundation',
      title: 'Bored Cast-in-Situ Concrete Piles (Friction + End-Bearing)',
      description: 'Deep foundation transferring building loads through soft marine clay strata to competent bedrock/dense sand.',
      recommendedDepthMeters: 8.0,
      suitabilityScore: isPileSuitable ? 88 : 40,
      plinthBeamSize: 'Grade beams 300 × 600 mm linking pile caps',
      missingDataChecklist: [
        '⚠ Confirmatory borehole terminating at least 3m into hard rock required',
        '⚠ Routine pile load test (compression & lateral) required per IS 2911'
      ],
      tradeOffs: [
        'Eliminates settlement risks in coastal reclaimed areas, marshy tracts, or deep expansive black cotton soils.',
        'Requires specialized hydraulic piling rigs and rigorous site testing, adding fixed mobilization expenses.'
      ],
      constructionPrecaution: 'Maintain continuous concrete pour using tremie pipe to prevent necking or soil ingress in bentonite slurry.'
    });

    // Sort by suitability score descending
    return concepts.sort((a, b) => b.suitabilityScore - a.suitabilityScore);
  },

  /**
   * Regional soil defaults across Tamil Nadu districts
   */
  getRegionalSoilDefaults(district: TamilNaduDistrict | string): {
    typicalSoil: string;
    estimatedSbcKpa: number;
    typicalWaterTableMeters: number;
    recommendedFoundationType: string;
    engineeringAdvisory: string;
  } {
    switch (district) {
      case 'Chennai':
        return {
          typicalSoil: 'Coastal Sand / Soft Marine Clay in OMR-Velachery, Sandy Loam in Central Chennai',
          estimatedSbcKpa: 120,
          typicalWaterTableMeters: 1.8,
          recommendedFoundationType: 'Raft Foundation or Under-reamed Piles in coastal clay; Isolated footings in hard rock zones (Guindy/St. Thomas Mount)',
          engineeringAdvisory: 'High vulnerability to waterlogging during North-East Monsoon (Oct-Dec). Minimum plinth level must be 2.5 ft above road crown.'
        };
      case 'Coimbatore':
        return {
          typicalSoil: 'Red Gravelly Loam with Weathered Gneiss Rock at shallow depth',
          estimatedSbcKpa: 220,
          typicalWaterTableMeters: 6.0,
          recommendedFoundationType: 'Isolated RCC Trapezoidal Footing resting on hard gravel',
          engineeringAdvisory: 'Favorable soil bearing capacity. Foundation depth of 1.5m typically reaches competent strata.'
        };
      case 'Madurai':
        return {
          typicalSoil: 'Red Soil transitioning to expansive Black Cotton Clay in southern pockets',
          estimatedSbcKpa: 160,
          typicalWaterTableMeters: 4.0,
          recommendedFoundationType: 'Isolated Footings on red soil; Under-reamed piles if deep black cotton clay is encountered',
          engineeringAdvisory: 'Check soil swelling/shrinkage index if building in black cotton pockets around Melur/Thirumangalam.'
        };
      case 'Salem':
        return {
          typicalSoil: 'Hard Charnockite Rock / Quartz-rich Red Soil',
          estimatedSbcKpa: 250,
          typicalWaterTableMeters: 7.0,
          recommendedFoundationType: 'Shallow Isolated Footings anchored to firm rock',
          engineeringAdvisory: 'Excellent bearing capacity. Shallow footing depth (1.2m) is usually sufficient.'
        };
      case 'Tiruchirappalli':
        return {
          typicalSoil: 'Alluvial River Sand near Cauvery basin; Gravelly Clay in upland areas',
          estimatedSbcKpa: 150,
          typicalWaterTableMeters: 2.2,
          recommendedFoundationType: 'Combined Footings or Raft Foundation near river belts',
          engineeringAdvisory: 'High water permeability near Srirangam and river floodplains. Dewatering required during foundation excavation.'
        };
      default:
        return {
          typicalSoil: 'Red Gravelly Sandy Loam',
          estimatedSbcKpa: 180,
          typicalWaterTableMeters: 3.5,
          recommendedFoundationType: 'Isolated RCC Trapezoidal Footing with continuous Plinth Beam',
          engineeringAdvisory: 'Conduct confirmatory borehole soil test to determine verified Safe Bearing Capacity (SBC) before structural design.'
        };
    }
  }
};
