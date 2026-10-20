import type { TamilNaduCostEstimate, TamilNaduDistrict } from '../types/index.ts';

export interface DistrictRateProfile {
  district: string;
  standardRatePerSqftInr: number;
  premiumRatePerSqftInr: number;
  cementBagRateInr: number;
  steelKgRateInr: number;
  mSandCftRateInr: number;
  aggregateCftRateInr: number;
  brickRateInr: number;
  labourDailyWageInr: number;
}

const DISTRICT_RATES: Record<string, DistrictRateProfile> = {
  Chennai: {
    district: 'Chennai',
    standardRatePerSqftInr: 2550,
    premiumRatePerSqftInr: 3200,
    cementBagRateInr: 410,
    steelKgRateInr: 74,
    mSandCftRateInr: 68,
    aggregateCftRateInr: 52,
    brickRateInr: 12,
    labourDailyWageInr: 1100
  },
  Coimbatore: {
    district: 'Coimbatore',
    standardRatePerSqftInr: 2250,
    premiumRatePerSqftInr: 2850,
    cementBagRateInr: 395,
    steelKgRateInr: 72,
    mSandCftRateInr: 56,
    aggregateCftRateInr: 44,
    brickRateInr: 11,
    labourDailyWageInr: 950
  },
  Madurai: {
    district: 'Madurai',
    standardRatePerSqftInr: 2050,
    premiumRatePerSqftInr: 2600,
    cementBagRateInr: 390,
    steelKgRateInr: 72,
    mSandCftRateInr: 54,
    aggregateCftRateInr: 42,
    brickRateInr: 10,
    labourDailyWageInr: 850
  },
  Tiruchirappalli: {
    district: 'Tiruchirappalli',
    standardRatePerSqftInr: 2150,
    premiumRatePerSqftInr: 2700,
    cementBagRateInr: 395,
    steelKgRateInr: 73,
    mSandCftRateInr: 58,
    aggregateCftRateInr: 45,
    brickRateInr: 10.5,
    labourDailyWageInr: 900
  },
  Salem: {
    district: 'Salem',
    standardRatePerSqftInr: 2050,
    premiumRatePerSqftInr: 2600,
    cementBagRateInr: 385,
    steelKgRateInr: 71,
    mSandCftRateInr: 52,
    aggregateCftRateInr: 40,
    brickRateInr: 10,
    labourDailyWageInr: 850
  }
};

export const tamilNaduCostService = {
  /**
   * Generates a realistic engineering Bill of Quantities (BOQ) and cost estimate for Tamil Nadu
   */
  calculateCostEstimate(
    totalGrossSqft: number,
    district: string = 'Chennai',
    isPremium: boolean = false
  ): TamilNaduCostEstimate {
    const rateProfile = DISTRICT_RATES[district] || DISTRICT_RATES['Chennai'];
    const ratePerSqft = isPremium ? rateProfile.premiumRatePerSqftInr : rateProfile.standardRatePerSqftInr;
    const totalCostInr = Math.round(totalGrossSqft * ratePerSqft);
    const plinthAreaSqft = Math.round(totalGrossSqft * 0.88);

    // Engineering thumb-rules (based on Tamil Nadu PWD & standard residential RCC construction norms)
    // 1. Cement: ~0.42 bags per sq ft of built-up area
    const cementBags = Math.round(totalGrossSqft * 0.42);
    // 2. Structural Steel (Fe550D TMT bars): ~3.8 kg per sq ft of built-up area
    const steelKg = Math.round(totalGrossSqft * 3.8);
    // 3. M-Sand (Manufactured Sand for RCC & masonry): ~1.8 cft per sq ft
    const mSandCft = Math.round(totalGrossSqft * 1.8);
    // 4. Coarse Aggregate (20mm blue metal granite): ~1.35 cft per sq ft
    const coarseAggregateCft = Math.round(totalGrossSqft * 1.35);
    // 5. Bricks (First-class country wirecut or AAC blocks): ~19 bricks per sq ft
    const bricksNos = Math.round(totalGrossSqft * 19);

    return {
      plinthAreaSqft,
      superBuiltupAreaSqft: totalGrossSqft,
      ratePerSqftInr: ratePerSqft,
      totalCostInr,
      district: rateProfile.district,
      materialsBreakdown: {
        cementBags,
        steelKg,
        mSandCft,
        coarseAggregateCft,
        bricksNos
      },
      costComponentSplit: {
        substructureFoundationInr: Math.round(totalCostInr * 0.14),
        rccStructureInr: Math.round(totalCostInr * 0.26),
        brickworkPlasteringInr: Math.round(totalCostInr * 0.18),
        flooringFinishesInr: Math.round(totalCostInr * 0.14),
        plumbingElectricalInr: Math.round(totalCostInr * 0.16),
        paintingFixturesInr: Math.round(totalCostInr * 0.12)
      }
    };
  },

  /**
   * Helper to format Indian Currency in Lakhs and Crores (e.g. ₹58.4 Lakhs or ₹1.25 Crore)
   */
  formatIndianRupees(amountInr: number): string {
    if (amountInr >= 10000000) {
      return `₹${(amountInr / 10000000).toFixed(2)} Crore`;
    }
    if (amountInr >= 100000) {
      return `₹${(amountInr / 100000).toFixed(2)} Lakhs`;
    }
    return `₹${amountInr.toLocaleString('en-IN')}`;
  },

  /**
   * Helper to convert between Sq Ft, Cents, and Grounds
   */
  convertLandArea(sqft: number): { sqft: number; cents: number; grounds: number; sqm: number } {
    return {
      sqft: Math.round(sqft),
      cents: Number((sqft / 435.6).toFixed(2)),
      grounds: Number((sqft / 2400).toFixed(2)),
      sqm: Number((sqft * 0.092903).toFixed(1))
    };
  }
};
