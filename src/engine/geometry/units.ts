/**
 * Canonical Geometry & Measurement Units Engine
 * Provides deterministic mathematical conversions, formatting, and tolerances.
 */

export const TOLERANCE = 0.001; // Floating point geometric tolerance

export interface DistanceUnits {
  feet: number;
  inches: number;
  fraction?: string;
}

export interface MetricUnits {
  meters: number;
  centimeters: number;
}

export interface Point2D {
  x: number;
  y: number;
}

export interface BoundingBox2D {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
  width: number;
  height: number;
}

export const Units = {
  // Conversion constants
  FT_TO_METERS: 0.3048,
  METERS_TO_FT: 3.280839895,
  SQFT_TO_SQM: 0.09290304,
  SQM_TO_SQFT: 10.7639104,
  CENT_TO_SQFT: 435.6,
  GROUND_TO_SQFT: 2400.0,

  toMeters(feet: number): number {
    return Number((feet * this.FT_TO_METERS).toFixed(3));
  },

  feetToMeters(feet: number): number {
    return this.toMeters(feet);
  },

  toFeet(meters: number): number {
    return Number((meters * this.METERS_TO_FT).toFixed(2));
  },

  metersToFeet(meters: number): number {
    return this.toFeet(meters);
  },

  toSquareMeters(sqft: number): number {
    return Number((sqft * this.SQFT_TO_SQM).toFixed(1));
  },

  sqftToSqm(sqft: number): number {
    return this.toSquareMeters(sqft);
  },

  toSquareFeet(sqm: number): number {
    return Math.round(sqm * this.SQM_TO_SQFT);
  },

  sqmToSqft(sqm: number): number {
    return this.toSquareFeet(sqm);
  },

  /**
   * Correctly formats feet and inches without ever printing 12 inches (e.g. 9' 0", NEVER 8' 12")
   */
  formatFeetInches(feet: number): string {
    if (isNaN(feet)) return "0' 0\"";
    const sign = feet < 0 ? '-' : '';
    const absFeet = Math.abs(feet);
    let wholeFeet = Math.floor(absFeet);
    let inches = Math.round((absFeet - wholeFeet) * 12);

    if (inches === 12) {
      wholeFeet += 1;
      inches = 0;
    }

    return `${sign}${wholeFeet}' ${inches}"`;
  },

  /**
   * Formats distance according to selected UI unit ('imperial' or 'metric')
   */
  formatDistance(feet: number, unit: 'imperial' | 'metric' = 'imperial'): string {
    if (unit === 'metric') {
      return `${this.toMeters(feet).toFixed(2)} m`;
    }
    return this.formatFeetInches(feet);
  },

  /**
   * Formats area according to selected UI unit
   */
  formatArea(sqft: number, unit: 'imperial' | 'metric' = 'imperial'): string {
    if (unit === 'metric') {
      return `${this.toSquareMeters(sqft).toFixed(1)} m²`;
    }
    return `${Math.round(sqft).toLocaleString()} sq ft`;
  },

  /**
   * Parses user input strings like "14'6\"", "14.5", "14 ft", "4.5m" into numeric feet
   */
  parseDistance(input: string): number {
    if (!input) return 0;
    const str = input.trim().toLowerCase();

    // Metric parsing e.g. "4.5m", "4.5 m", "450cm"
    if (str.endsWith('m') && !str.endsWith('mm')) {
      const val = parseFloat(str.replace('m', ''));
      return isNaN(val) ? 0 : this.toFeet(val);
    }
    if (str.endsWith('cm')) {
      const val = parseFloat(str.replace('cm', ''));
      return isNaN(val) ? 0 : this.toFeet(val / 100);
    }

    // Feet & Inches e.g. 14'6", 14' 6", 14'-6"
    const ftInMatch = str.match(/^(\d+(?:\.\d+)?)\s*['’ft\s-]+\s*(\d+(?:\.\d+)?)\s*["”in]?$/);
    if (ftInMatch) {
      const ft = parseFloat(ftInMatch[1]);
      const inches = parseFloat(ftInMatch[2]);
      return Number((ft + (inches / 12)).toFixed(2));
    }

    // Plain feet e.g. 14', 14.5
    const num = parseFloat(str);
    return isNaN(num) ? 0 : num;
  },

  parseFeetInches(input: string): number {
    return this.parseDistance(input);
  }
};
