/**
 * Structural Engineering Configuration & IS Standards Benchmarks
 * Referenced Codes:
 * - IS 456:2000 (Plain & Reinforced Concrete Code of Practice)
 * - IS 875 (Parts 1 & 2):1987 (Design Loads for Buildings)
 * - IS 1893:2016 (Criteria for Earthquake Resistant Design)
 * - SP 34 (Handbook on Concrete Reinforcement and Detailing)
 */

export interface SoilProfile {
  type: string;
  name: string;
  sbcKPa: number; // Safe Bearing Capacity in kN/m²
  recommendedFooting: 'ISOLATED_PAD' | 'COMBINED_STRIP' | 'RAFT';
  minDepthFt: number;
}

export const STRUCTURE_CONFIG = {
  // Geotechnical Soil SBC Defaults (kN/m²)
  soilProfiles: {
    LOAM: {
      type: 'LOAM',
      name: 'Medium Sandy Loam',
      sbcKPa: 200,
      recommendedFooting: 'ISOLATED_PAD',
      minDepthFt: 4.5,
    },
    CLAYEY: {
      type: 'CLAYEY',
      name: 'Clayey Soil',
      sbcKPa: 150,
      recommendedFooting: 'ISOLATED_PAD',
      minDepthFt: 5.0,
    },
    BLACK_COTTON: {
      type: 'BLACK_COTTON',
      name: 'Black Cotton / Expansive Clay',
      sbcKPa: 100,
      recommendedFooting: 'COMBINED_STRIP',
      minDepthFt: 6.0,
    },
    HARD_MOORUM_ROCK: {
      type: 'HARD_MOORUM_ROCK',
      name: 'Hard Moorum / Weathered Rock',
      sbcKPa: 350,
      recommendedFooting: 'ISOLATED_PAD',
      minDepthFt: 4.0,
    },
  } as Record<string, SoilProfile>,

  // IS 875 Load Factors (kN/m²)
  loads: {
    slabDeadLoadKNm2: 3.125, // 125mm slab (0.125m * 25 kN/m³)
    floorFinishKNm2: 1.0,
    residentialLiveLoadKNm2: 2.0, // IS 875 Part 2
    balconyStairLiveLoadKNm2: 3.0,
    wallLoadPerMeterHeightKNm: 4.37, // 9" brick masonry (0.23m * 19 kN/m³)
    loadFactor: 1.5, // IS 456 limit state factored design load
  },

  // Concrete Mix & Cement Factors (per cubic meter)
  concrete: {
    m20: {
      grade: 'M20',
      characteristicStrengthMpa: 20,
      cementBagsPerM3: 8.2, // 410 kg/m³
      sandM3PerM3: 0.45,
      coarseAggregateM3PerM3: 0.85,
    },
    m25: {
      grade: 'M25',
      characteristicStrengthMpa: 25,
      cementBagsPerM3: 8.8, // 440 kg/m³
      sandM3PerM3: 0.42,
      coarseAggregateM3PerM3: 0.82,
    },
  },

  // Steel Reinforcement Benchmarks (kg per m³ of element)
  steelDensities: {
    footingsKgM3: 35, // 10mm rebar mesh
    columnsKgM3: 145, // Longitudinal bars + stirrups
    plinthBeamsKgM3: 110,
    roofBeamsKgM3: 105,
    slabsKgM3: 70, // 8mm / 10mm distribution
  },

  // Rebar kg per square foot benchmark for residential RCC frame
  steelBenchmarkKgPerSqFt: {
    min: 3.2,
    target: 3.85,
    max: 4.5,
  },

  // Standard PWD / Market Material Rates (INR 2026 Tamil Nadu Index)
  ratesINR: {
    cementBag50Kg: 380,
    steelRebarKg: 68,
    concreteM20M3: 4600,
    concreteM25M3: 5200,
    riverSandM3: 2100,
    aggregateM3: 1650,
    brickPerUnit: 11,
    plasterSqFt: 35,
    vitrifiedFlooringSqFt: 110,
    graniteCounterSqFt: 180,
    labourPerSqFt: 450,
  },
};
