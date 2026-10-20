/**
 * Authoritative Area Calculations & Spatial Metrics Engine
 * Computes exact room areas, built-up areas, carpet areas, perimeters, and plot metrics.
 */

import { TOLERANCE } from './units.ts';
import type { RoomRect } from './intersections.ts';

export interface RoomAreaMetric {
  id: string;
  name: string;
  floor: number;
  widthFeet: number;
  heightFeet: number;
  areaSqft: number;
  areaSqm: number;
  percentageOfFloor: number;
  isCirculation: boolean;
}

export interface FloorAreaBreakdown {
  floor: number;
  plinthAreaSqft: number;
  carpetAreaSqft: number;
  circulationAreaSqft: number;
  circulationPercentage: number;
  roomCount: number;
  exteriorPerimeterFeet: number;
}

export interface ComprehensiveAreaReport {
  totalGrossBuiltupSqft: number;
  totalCarpetAreaSqft: number;
  totalCirculationAreaSqft: number;
  overallCirculationPercentage: number;
  floorBreakdown: FloorAreaBreakdown[] & Record<number, FloorAreaBreakdown>;
  rooms: RoomAreaMetric[];
  // Conveniences
  totalCarpetArea?: number;
  totalBuiltUpArea?: number;
  circulationPercentage?: number;
  roomBreakdown?: RoomAreaMetric[];
  plotMetrics?: {
    plotAreaSqft: number;
    groundCoveragePercent: number;
    achievedFSI: number;
  };
}

export const AreaCalculations = {
  /**
   * Calculates individual room area accurately from dimensions.
   */
  calculateRoomArea(room: RoomRect): number {
    const w = Math.max(0, room.width);
    const h = Math.max(0, room.height);
    return Number((w * h).toFixed(2));
  },

  /**
   * Determines if a room is primarily circulation space (halls, corridors, entryways, stairs).
   */
  isCirculationRoom(room: RoomRect): boolean {
    const nm = room.name.toLowerCase();
    return (
      nm.includes('corridor') ||
      nm.includes('hallway') ||
      nm.includes('passage') ||
      nm.includes('stair') ||
      nm.includes('entry') ||
      nm.includes('foyer') ||
      nm.includes('circulation')
    );
  },

  /**
   * Computes the bounding envelope and exterior perimeter for a floor.
   */
  computeFloorPerimeter(floorRooms: RoomRect[]): number {
    if (floorRooms.length === 0) return 0;

    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    for (const r of floorRooms) {
      minX = Math.min(minX, r.x);
      minY = Math.min(minY, r.y);
      maxX = Math.max(maxX, r.x + r.width);
      maxY = Math.max(maxY, r.y + r.height);
    }

    const envelopeWidth = Math.max(0, maxX - minX);
    const envelopeHeight = Math.max(0, maxY - minY);

    return Number(((envelopeWidth + envelopeHeight) * 2).toFixed(1));
  },

  /**
   * Generates a complete mathematical area audit for a project.
   */
  generateAreaReport(
    rooms: RoomRect[], 
    plotWidthFeet?: number, 
    plotDepthFeet?: number
  ): ComprehensiveAreaReport {
    const floorsPresent = Array.from(new Set(rooms.map(r => r.floor || 1))).sort((a, b) => a - b);
    const roomMetrics: RoomAreaMetric[] = [];
    const floorBreakdowns: FloorAreaBreakdown[] = [];

    let totalGrossSqft = 0;
    let totalCarpetSqft = 0;
    let totalCirculationSqft = 0;
    let groundFloorPlinthSqft = 0;

    for (const floor of floorsPresent) {
      const floorRooms = rooms.filter(r => (r.floor || 1) === floor);
      let floorTotalSqft = 0;
      let floorCarpetSqft = 0;
      let floorCirculationSqft = 0;

      for (const r of floorRooms) {
        const area = this.calculateRoomArea(r);
        floorTotalSqft += area;
        const isCirc = this.isCirculationRoom(r);
        if (isCirc) {
          floorCirculationSqft += area;
        } else {
          floorCarpetSqft += area;
        }
      }

      floorTotalSqft = Number(floorTotalSqft.toFixed(1));
      floorCarpetSqft = Number(floorCarpetSqft.toFixed(1));
      floorCirculationSqft = Number(floorCirculationSqft.toFixed(1));

      if (floor === 1) {
        groundFloorPlinthSqft = floorTotalSqft;
      }

      totalGrossSqft += floorTotalSqft;
      totalCarpetSqft += floorCarpetSqft;
      totalCirculationSqft += floorCirculationSqft;

      const circulationPct = floorTotalSqft > 0 
        ? Number(((floorCirculationSqft / floorTotalSqft) * 100).toFixed(1)) 
        : 0;

      const perimeter = this.computeFloorPerimeter(floorRooms);

      floorBreakdowns.push({
        floor,
        plinthAreaSqft: floorTotalSqft,
        carpetAreaSqft: floorCarpetSqft,
        circulationAreaSqft: floorCirculationSqft,
        circulationPercentage: circulationPct,
        roomCount: floorRooms.length,
        exteriorPerimeterFeet: perimeter
      });

      // Populate room metrics with percentage
      for (const r of floorRooms) {
        const area = this.calculateRoomArea(r);
        const pct = floorTotalSqft > 0 ? Number(((area / floorTotalSqft) * 100).toFixed(1)) : 0;
        roomMetrics.push({
          id: r.id,
          name: r.name,
          floor,
          widthFeet: r.width,
          heightFeet: r.height,
          areaSqft: area,
          areaSqm: Number((area * 0.092903).toFixed(1)),
          percentageOfFloor: pct,
          isCirculation: this.isCirculationRoom(r)
        });
      }
    }

    const overallCirculationPct = totalGrossSqft > 0 
      ? Number(((totalCirculationSqft / totalGrossSqft) * 100).toFixed(1)) 
      : 0;

    const floorMap: any = [...floorBreakdowns];
    for (const fb of floorBreakdowns) {
      floorMap[fb.floor] = fb;
    }

    const report: ComprehensiveAreaReport = {
      totalGrossBuiltupSqft: Number(totalGrossSqft.toFixed(1)),
      totalCarpetAreaSqft: Number(totalCarpetSqft.toFixed(1)),
      totalCirculationAreaSqft: Number(totalCirculationSqft.toFixed(1)),
      overallCirculationPercentage: overallCirculationPct,
      floorBreakdown: floorMap,
      rooms: roomMetrics,
      totalCarpetArea: Number(totalCarpetSqft.toFixed(1)),
      totalBuiltUpArea: Number(totalGrossSqft.toFixed(1)),
      circulationPercentage: overallCirculationPct,
      roomBreakdown: roomMetrics
    };

    if (plotWidthFeet && plotDepthFeet && plotWidthFeet > 0 && plotDepthFeet > 0) {
      const plotArea = plotWidthFeet * plotDepthFeet;
      const coveragePct = Number(((groundFloorPlinthSqft / plotArea) * 100).toFixed(1));
      const achievedFsi = Number((totalGrossSqft / plotArea).toFixed(2));

      report.plotMetrics = {
        plotAreaSqft: plotArea,
        groundCoveragePercent: coveragePct,
        achievedFSI: achievedFsi
      };
    }

    return report;
  }
};
