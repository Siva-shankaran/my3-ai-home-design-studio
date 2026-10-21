import type { ProjectDesign, BOQSummary, BOQItem, FootingInstance, ColumnInstance } from '../../types/project.ts';
import { STRUCTURE_CONFIG } from './structure.config.ts';

/**
 * Calculates complete Bill of Quantities (BOQ) with cement bags and steel kg by diameter
 */
export function calculateBOQ(
  design: ProjectDesign,
  footings: FootingInstance[],
  columns: ColumnInstance[]
): BOQSummary {
  const builtUpSqFt = design.totalBuiltUpSqFt;
  const floorsCount = design.floors.length;
  const rates = STRUCTURE_CONFIG.ratesINR;

  // 1. Concrete Volumes (m³)
  // Slabs: 125mm thickness across built-up area
  const slabAreaM2 = builtUpSqFt * 0.092903;
  const slabConcreteM3 = slabAreaM2 * 0.125;

  // Footings concrete
  const footingsConcreteM3 = footings.reduce((sum, f) => sum + f.concreteVolumeCuM, 0);

  // Columns concrete
  const columnVolumeEachM3 = columns.reduce((sum, c) => {
    const wM = (c.widthInches * 0.0254);
    const dM = (c.depthInches * 0.0254);
    const hM = 3.0 * floorsCount; // ~10ft per floor
    return sum + (wM * dM * hM);
  }, 0);

  // Plinth and Roof Beams concrete (estimated ~25% of slab volume)
  const beamsConcreteM3 = slabConcreteM3 * 0.25;

  // Total M20 (Slabs, Beams, Footings) & M25 (Columns)
  const concreteVolumeM20M3 = Number((slabConcreteM3 + footingsConcreteM3 + beamsConcreteM3).toFixed(2));
  const concreteVolumeM25M3 = Number(columnVolumeEachM3.toFixed(2));
  const totalConcreteM3 = concreteVolumeM20M3 + concreteVolumeM25M3;

  // 2. Cement Bags Count
  const cementFromM20 = concreteVolumeM20M3 * STRUCTURE_CONFIG.concrete.m20.cementBagsPerM3;
  const cementFromM25 = concreteVolumeM25M3 * STRUCTURE_CONFIG.concrete.m25.cementBagsPerM3;
  // Masonry and Plaster cement: ~0.15 bags per sqft of built-up
  const cementFromFinishes = builtUpSqFt * 0.15;
  const totalCementBags = Math.round(cementFromM20 + cementFromM25 + cementFromFinishes);

  // 3. Steel Reinforcement (kg by diameter)
  // Target: 3.85 kg per sq ft of built-up area
  const totalSteelKg = Math.round(builtUpSqFt * STRUCTURE_CONFIG.steelBenchmarkKgPerSqFt.target);

  // Standard diameter distribution for residential framing:
  // - 8mm (stirrups & ties): ~20%
  // - 10mm (slab & footing mesh): ~30%
  // - 12mm (beam & column longitudinal): ~25%
  // - 16mm (primary column & main beam): ~20%
  // - 20mm (heavy ground beams): ~5%
  const steelKgByDiameter = {
    dia8mmKg: Math.round(totalSteelKg * 0.20),
    dia10mmKg: Math.round(totalSteelKg * 0.30),
    dia12mmKg: Math.round(totalSteelKg * 0.25),
    dia16mmKg: Math.round(totalSteelKg * 0.20),
    dia20mmKg: Math.round(totalSteelKg * 0.05),
    totalKg: totalSteelKg,
  };
  const steelKgPerSqFt = Number((totalSteelKg / builtUpSqFt).toFixed(2));

  // 4. Aggregates and River Sand
  const riverSandM3 = Number((totalConcreteM3 * 0.45 + builtUpSqFt * 0.015).toFixed(1));
  const coarseAggregateM3 = Number((totalConcreteM3 * 0.85).toFixed(1));

  // 5. Masonry & Plaster
  const brickCount = Math.round(builtUpSqFt * 8.5); // 8.5 bricks per sq ft built-up
  const plasterAreaSqFt = Math.round(builtUpSqFt * 2.8); // Internal + External wall plaster

  // 6. Detailed Itemized BOQ Table
  const itemsTable: BOQItem[] = [
    {
      category: 'EARTHWORK & FOUNDATION',
      itemDescription: 'Earthwork excavation in all soils and 75mm PCC (1:4:8) bed',
      quantity: Math.round(footings.length * 4.5),
      unit: 'm³',
      unitRateINR: 650,
      amountINR: Math.round(footings.length * 4.5 * 650),
      standardClause: 'IS 1200 Part 1',
    },
    {
      category: 'CONCRETE WORKS',
      itemDescription: 'Reinforced Cement Concrete Grade M20 for Footings, Slabs & Beams',
      quantity: concreteVolumeM20M3,
      unit: 'm³',
      unitRateINR: rates.concreteM20M3,
      amountINR: Math.round(concreteVolumeM20M3 * rates.concreteM20M3),
      standardClause: 'IS 456 Clause 6',
    },
    {
      category: 'CONCRETE WORKS',
      itemDescription: 'Reinforced Cement Concrete Grade M25 for Columns',
      quantity: concreteVolumeM25M3,
      unit: 'm³',
      unitRateINR: rates.concreteM25M3,
      amountINR: Math.round(concreteVolumeM25M3 * rates.concreteM25M3),
      standardClause: 'IS 456 Clause 6',
    },
    {
      category: 'REINFORCEMENT STEEL',
      itemDescription: 'High Yield Strength Deformed (HYSD) Fe500 Rebar (8mm to 20mm)',
      quantity: totalSteelKg,
      unit: 'kg',
      unitRateINR: rates.steelRebarKg,
      amountINR: Math.round(totalSteelKg * rates.steelRebarKg),
      standardClause: 'IS 1786 / SP 34',
    },
    {
      category: 'MASONRY WORKS',
      itemDescription: 'First-class wire-cut red clay brickwork in CM 1:6',
      quantity: brickCount,
      unit: 'Nos',
      unitRateINR: rates.brickPerUnit,
      amountINR: Math.round(brickCount * rates.brickPerUnit),
      standardClause: 'IS 2212',
    },
    {
      category: 'FINISHING & PLASTER',
      itemDescription: 'Smooth cement plastering (12mm internal + 20mm external sponge)',
      quantity: plasterAreaSqFt,
      unit: 'sq ft',
      unitRateINR: rates.plasterSqFt,
      amountINR: Math.round(plasterAreaSqFt * rates.plasterSqFt),
      standardClause: 'IS 1661',
    },
    {
      category: 'FLOOR FINISHES',
      itemDescription: '600x600mm double-charged vitrified tile flooring with skirting',
      quantity: design.totalCarpetSqFt,
      unit: 'sq ft',
      unitRateINR: rates.vitrifiedFlooringSqFt,
      amountINR: Math.round(design.totalCarpetSqFt * rates.vitrifiedFlooringSqFt),
      standardClause: 'IS 1443',
    },
  ];

  const totalItemizedCost = itemsTable.reduce((sum, item) => sum + item.amountINR, 0);
  const minCost = Math.round(totalItemizedCost * 0.95);
  const maxCost = Math.round(totalItemizedCost * 1.15);

  return {
    concreteVolumeM20M3,
    concreteVolumeM25M3,
    cementBagsCount: totalCementBags,
    steelKgByDiameter,
    steelKgPerSqFt,
    coarseAggregateM3,
    riverSandM3,
    brickCount,
    plasterAreaSqFt,
    flooringAreaByTypeSqFt: {
      vitrified: design.totalCarpetSqFt,
      bathroomTile: Math.round(design.totalCarpetSqFt * 0.12),
    },
    doorsCount: 6 * floorsCount,
    windowsCount: 8 * floorsCount,
    estimatedCostRangeINR: {
      min: minCost,
      max: maxCost,
    },
    itemsTable,
  };
}
