import type { ColumnInstance, FootingInstance } from '../../types/project.ts';
import { STRUCTURE_CONFIG } from './structure.config.ts';

/**
 * Calculates footing dimensions and depths from column tributary axial loads
 * Formula: Required Footing Area A = (1.10 * P) / SBC
 */
export function calculateFootings(
  columns: ColumnInstance[],
  soilTypeKey: string = 'LOAM',
  floorsCount: number = 2
): FootingInstance[] {
  const profile = STRUCTURE_CONFIG.soilProfiles[soilTypeKey] || STRUCTURE_CONFIG.soilProfiles.LOAM;
  const sbc = profile.sbcKPa; // in kN/m²

  return columns.map((col, idx) => {
    const P = col.factoredAxialLoadKN; // kN
    // Required area in sq meters: A_m2 = (1.10 * P) / sbc
    const areaM2 = (1.10 * P) / sbc;
    const sideM = Math.sqrt(areaM2);
    // Convert to feet (1 m = 3.28084 ft)
    const sideFt = Math.max(3.5, Math.round(sideM * 3.28084 * 10) / 10);

    // Footing depth: minDepth adjusted by floors
    const depthFt = profile.minDepthFt + (floorsCount > 2 ? 0.5 : 0);

    // Footing concrete volume (m³)
    const lengthM = sideFt * 0.3048;
    const widthM = sideFt * 0.3048;
    const avgThicknessM = 0.40; // 400mm trapezoidal pad
    const volumeCuM = Number((lengthM * widthM * avgThicknessM).toFixed(2));

    // Rebar mesh weight (kg) based on density factor (35 kg/m³)
    const rebarWeightKg = Math.round(volumeCuM * STRUCTURE_CONFIG.steelDensities.footingsKgM3);

    return {
      id: `foot-${idx + 1}`,
      columnId: col.id,
      code: `F${idx + 1}`,
      center: col.position,
      lengthFt: sideFt,
      widthFt: sideFt,
      totalDepthFt: depthFt,
      concreteVolumeCuM: volumeCuM,
      rebarMeshWeightKg: rebarWeightKg,
      pccThicknessInches: 3,
    };
  });
}
