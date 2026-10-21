export type PlotFamily = 'STANDARD' | 'WIDE' | 'NARROW_DEEP' | 'CORNER' | 'IRREGULAR';
export type FloorLevel = 'G' | 'G_PLUS_1' | 'G_PLUS_2' | 'G_PLUS_3';
export type Archetype = 'COMPACT_EFFICIENT' | 'OPEN_CONTEMPORARY' | 'COURTYARD_PREMIUM';

export interface RoomProgramRequirement {
  type: string;
  name: string;
  nameTamil?: string;
  minAreaSqFt: number;
  preferredAreaSqFt: number;
  maxAreaSqFt: number;
  minWidthFt: number;
  minAspectRatio: number; // width / depth >= min
  maxAspectRatio: number; // width / depth <= max
  floorIndex: number; // 0 = G, 1 = First, etc.
  requiresExteriorWall: boolean;
  requiresPlumbing: boolean;
  vastuZone?: 'NE' | 'NW' | 'SE' | 'SW' | 'E' | 'W' | 'N' | 'S' | 'CENTER';
}

export interface AdjacencyRule {
  roomA: string;
  roomB: string;
  weight: number; // Positive = strong connection (e.g. Kitchen <-> Dining = 10); Negative = forbidden (e.g. Bath <-> Pooja = -20)
}

export interface LayoutRecipe {
  id: string;
  code: string;
  name: string;
  plotFamily: PlotFamily;
  level: FloorLevel;
  floorsCount: number;
  bhk: number;
  archetype: Archetype;
  description: string;
  keyFeatures: string[];
  zoningSpine: 'LINEAR_FRONT_TO_BACK' | 'SIDE_SPLIT' | 'CENTRAL_COURTYARD' | 'PERIMETER_PINWHEEL';
  wetCoreAxis: 'LEFT_FLANK' | 'RIGHT_FLANK' | 'REAR_CORNER' | 'CENTRAL_STACK';
  staircasePosition: 'FOYER_FRONT' | 'CENTRAL_CORE' | 'REAR_WING' | 'EXTERNAL';
  rooms: RoomProgramRequirement[];
  adjacencies: AdjacencyRule[];
  regionalElements: {
    hasThinnai: boolean;
    hasMuttram: boolean;
    hasPooja: boolean;
    hasCarPorch: boolean;
  };
}
