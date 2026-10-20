/**
 * Architectural Template Library Types
 */

import type { Room, Door, WindowItem, FurnitureItem, Column, RoomCamera } from '../../types/index.ts';

export type ArchitecturalPattern = 
  | 'compact_efficient'     // Pattern A: 600 - 1,200 sqft, zero-waste circulation
  | 'contemporary_open'     // Pattern B: 1,200 - 2,400 sqft, open-concept living/kitchen
  | 'courtyard_daylight'    // Pattern C: 1,800 - 3,200 sqft, central courtyard / muttram / lightwell
  | 'premium_residence';    // Pattern D: 2,400 - 5,000 sqft, executive master suite, family lounge

export type PlotProportion = 'narrow' | 'standard_rectangular' | 'near_square' | 'wide';

export interface TemplateDefinition {
  id: string;
  name: string;
  pattern: ArchitecturalPattern;
  style: string;
  description: string;
  floors: 1 | 2;
  bedrooms: number;
  bathrooms: number;
  targetSqft: number;
  supportedSqftRange: [number, number]; // [min, max]
  recommendedPlotBounds: {
    minWidthFeet: number;
    minDepthFeet: number;
    recommendedProportion: PlotProportion;
  };
  circulationStyle: 'direct_open' | 'compact_hall' | 'courtyard_perimeter' | 'split_wing' | 'central_core';
  features: {
    hasOpenKitchen: boolean;
    hasPoojaRoom?: boolean;
    hasHomeOffice?: boolean;
    hasCourtyard?: boolean;
    hasCarParking?: boolean;
    hasWalkInWardrobe?: boolean;
    hasLaundryUtility?: boolean;
  };
  rooms: Room[];
  doors: Door[];
  windows: WindowItem[];
  furniture: FurnitureItem[];
  columns?: Column[];
  cameras?: RoomCamera[];
  advantages: string[];
  tradeOffs: string[];
}
