import { Units } from '../geometry/units.ts';

export interface ParsedPlotDimensions {
  widthFt: number;
  depthFt: number;
  areaSqFt: number;
  detectedUnit: 'FEET' | 'FEET_INCHES' | 'METERS' | 'CENT' | 'GROUND' | 'SQFT' | 'SQM';
  isAreaOnly: boolean;
  rawInput: string;
}

/**
 * Maps Tamil numerals (௧, ௨, ௩, ...) to Arabic numerals
 */
const TAMIL_NUMERALS_MAP: Record<string, string> = {
  '௦': '0',
  '௧': '1',
  '௨': '2',
  '௩': '3',
  '௪': '4',
  '௫': '5',
  '௬': '6',
  '௭': '7',
  '௮': '8',
  '௯': '9',
  '௰': '10',
  '௱': '100',
  '௲': '1000',
};

export function convertTamilNumerals(input: string): string {
  let result = input;
  for (const [tamilChar, arabic] of Object.entries(TAMIL_NUMERALS_MAP)) {
    result = result.replaceAll(tamilChar, arabic);
  }
  return result;
}

/**
 * Parses individual length expressions (e.g. "30'6\"", "30.5", "12m", "40'") into canonical feet.
 */
export function parseLengthToFeet(str: string): number | null {
  if (!str) return null;
  const s = convertTamilNumerals(str.trim().toLowerCase());

  // Check meters (e.g. "9.5m", "9.5 meters")
  const meterMatch = s.match(/^([\d.]+)\s*(?:m|meter|meters)$/i);
  if (meterMatch) {
    const val = parseFloat(meterMatch[1]);
    return isNaN(val) ? null : val * Units.METERS_TO_FT;
  }

  // Check feet and inches (e.g. 30'6", 30ft 6in, 30'-6")
  const ftInMatch = s.match(/^(\d+(?:\.\d+)?)\s*(?:'|ft|feet)\s*[- ]*\s*(\d+(?:\.\d+)?)\s*(?:"|in|inch|inches)?$/i);
  if (ftInMatch) {
    const feet = parseFloat(ftInMatch[1]);
    const inches = parseFloat(ftInMatch[2]);
    if (!isNaN(feet) && !isNaN(inches)) {
      return feet + (inches / 12);
    }
  }

  // Check feet only (e.g. "30'", "30ft", "30 feet")
  const ftMatch = s.match(/^([\d.]+)\s*(?:'|ft|feet)$/i);
  if (ftMatch) {
    const val = parseFloat(ftMatch[1]);
    return isNaN(val) ? null : val;
  }

  // Check plain number (assume feet)
  const plainNum = parseFloat(s);
  if (!isNaN(plainNum)) {
    return plainNum;
  }

  return null;
}

/**
 * Master parser for dimension inputs
 * Accepts:
 * - "30x40", "30*40", "30 by 40", "30'6\" x 40'"
 * - "9m x 12m", "9m × 12m"
 * - "2 cents", "1.5 ground", "1200 sqft", "150 sqm"
 * - Tamil numerals e.g. "௩௦x௪௦"
 */
export function parsePlotInput(input: string): ParsedPlotDimensions {
  const sanitized = convertTamilNumerals(input.trim());

  // 1. Check regional land units (cent, ground)
  const centMatch = sanitized.match(/^([\d.]+)\s*(?:cent|cents)$/i);
  if (centMatch) {
    const cents = parseFloat(centMatch[1]);
    const areaSqFt = cents * Units.CENT_TO_SQFT;
    // Typical 1:1.5 proportion for inferred rectangle
    const widthFt = Math.sqrt(areaSqFt / 1.5);
    const depthFt = widthFt * 1.5;
    return {
      widthFt: Math.round(widthFt * 10) / 10,
      depthFt: Math.round(depthFt * 10) / 10,
      areaSqFt: Math.round(areaSqFt),
      detectedUnit: 'CENT',
      isAreaOnly: true,
      rawInput: input,
    };
  }

  const groundMatch = sanitized.match(/^([\d.]+)\s*(?:ground|grounds)$/i);
  if (groundMatch) {
    const grounds = parseFloat(groundMatch[1]);
    const areaSqFt = grounds * Units.GROUND_TO_SQFT;
    const widthFt = Math.sqrt(areaSqFt / 1.5);
    const depthFt = widthFt * 1.5;
    return {
      widthFt: Math.round(widthFt * 10) / 10,
      depthFt: Math.round(depthFt * 10) / 10,
      areaSqFt: Math.round(areaSqFt),
      detectedUnit: 'GROUND',
      isAreaOnly: true,
      rawInput: input,
    };
  }

  // 2. Check area-only (e.g. "1200 sqft", "150 sqm")
  const sqftMatch = sanitized.match(/^([\d.]+)\s*(?:sqft|sq\.ft|square feet)$/i);
  if (sqftMatch) {
    const areaSqFt = parseFloat(sqftMatch[1]);
    const widthFt = Math.sqrt(areaSqFt / 1.4);
    const depthFt = widthFt * 1.4;
    return {
      widthFt: Math.round(widthFt * 10) / 10,
      depthFt: Math.round(depthFt * 10) / 10,
      areaSqFt: Math.round(areaSqFt),
      detectedUnit: 'SQFT',
      isAreaOnly: true,
      rawInput: input,
    };
  }

  const sqmMatch = sanitized.match(/^([\d.]+)\s*(?:sqm|sq\.m|square meters)$/i);
  if (sqmMatch) {
    const areaSqm = parseFloat(sqmMatch[1]);
    const areaSqFt = Units.sqmToSqft(areaSqm);
    const widthFt = Math.sqrt(areaSqFt / 1.4);
    const depthFt = widthFt * 1.4;
    return {
      widthFt: Math.round(widthFt * 10) / 10,
      depthFt: Math.round(depthFt * 10) / 10,
      areaSqFt: Math.round(areaSqFt),
      detectedUnit: 'SQM',
      isAreaOnly: true,
      rawInput: input,
    };
  }

  // 3. Dimensional Pair: e.g. "30x40", "30 by 40", "9m × 12m"
  const splitRegex = /\s*(?:x|by|\*|×)\s*/i;
  const parts = sanitized.split(splitRegex);

  if (parts.length === 2) {
    const w = parseLengthToFeet(parts[0]);
    const d = parseLengthToFeet(parts[1]);

    if (w !== null && d !== null && w > 0 && d > 0) {
      const isMeters = parts[0].includes('m') || parts[1].includes('m');
      const isFtIn = parts[0].includes("'") || parts[0].includes('"') || parts[1].includes("'");
      return {
        widthFt: Math.round(w * 100) / 100,
        depthFt: Math.round(d * 100) / 100,
        areaSqFt: Math.round(w * d),
        detectedUnit: isMeters ? 'METERS' : isFtIn ? 'FEET_INCHES' : 'FEET',
        isAreaOnly: false,
        rawInput: input,
      };
    }
  }

  // Fallback defaults to 30x40 standard residential plot
  return {
    widthFt: 30,
    depthFt: 40,
    areaSqFt: 1200,
    detectedUnit: 'FEET',
    isAreaOnly: false,
    rawInput: input,
  };
}
