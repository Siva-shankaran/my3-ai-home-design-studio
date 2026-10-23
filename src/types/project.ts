import type { DesignBrief, Point2D } from '../engine/intake/schemas.ts';

export type { Point2D };

export type RoomType =
  | 'FOYER'
  | 'LIVING'
  | 'DINING'
  | 'KITCHEN'
  | 'BEDROOM'
  | 'MASTER_BEDROOM'
  | 'BATHROOM'
  | 'POOJA'
  | 'THINNAI'
  | 'COURTYARD'
  | 'STAIRCASE'
  | 'UTILITY'
  | 'BALCONY'
  | 'CAR_PORCH'
  | 'CORRIDOR';

export interface FurniturePlacement {
  id: string;
  symbolCode: string; // e.g. 'BED_KING', 'SOFA_3SEATER', 'DINING_6', 'WC', 'WASHBASIN', 'POOJA_UNIT'
  position: Point2D;
  rotationDeg: number;
  widthFt: number;
  depthFt: number;
  clearanceBox: {
    minX: number;
    minY: number;
    maxX: number;
    maxY: number;
  };
}

export interface RoomInstance {
  id: string;
  floorIndex: number;
  name: string;
  type: RoomType;
  polygon: Point2D[];
  carpetAreaSqFt: number;
  dimensionsText: string; // e.g. "12'0\" x 14'6\""
  levelOffsetFt: number;
  flooringType: 'VITRIFIED_TILE' | 'MARBLE' | 'HARDWOOD' | 'KOTA_STONE' | 'CERAMIC_ANTISKID';
  furniture: FurniturePlacement[];
  vastuZone?: string;
  daylightRatio: number;
  minCeilingHeightFt: number;
}

export interface Opening {
  id: string;
  wallId: string;
  type: 'DOOR' | 'WINDOW' | 'VENTILATOR' | 'ARCHWAY';
  offsetFromStartFt: number;
  widthFt: number;
  heightFt: number;
  sillHeightFt: number;
  swingDirection?: 'INWARD_LEFT' | 'INWARD_RIGHT' | 'OUTWARD_LEFT' | 'OUTWARD_RIGHT';
  scheduleCode: string; // D1, D2, W1, V1
}

export interface WallSegment {
  id: string;
  floorIndex: number;
  start: Point2D;
  end: Point2D;
  thicknessInches: number; // 9" exterior/load-bearing, 4.5" interior partition
  isExterior: boolean;
  isLoadBearing: boolean;
  openings: Opening[];
}

export interface StaircaseModel {
  id: string;
  floorIndex: number;
  type: 'INTERNAL_DOG_LEGGED' | 'INTERNAL_OPEN_WELL' | 'EXTERNAL' | 'SPIRAL';
  flightWidthFt: number;
  riserInches: number; // default 7"
  treadInches: number; // default 10"
  treadsCount: number;
  landingDepthFt: number;
  upDirectionDeg: number;
  headroomClearanceFt: number;
  polygon: Point2D[];
}

export interface ArchitecturalFloor {
  floorIndex: number; // 0 = Ground, 1 = First, 2 = Second, 3 = Terrace
  floorName: string;
  levelFt: number;
  rooms: RoomInstance[];
  walls: WallSegment[];
  staircases: StaircaseModel[];
  builtUpAreaSqFt: number;
  carpetAreaSqFt: number;
  circulationSqFt: number;
}

export interface ColumnInstance {
  id: string;
  code: string; // C1, C2, C3...
  position: Point2D;
  widthInches: number; // 9"
  depthInches: number; // 9", 12", 15"
  reinforcement: string; // e.g. "4-16# + 2-12#"
  stirrups: string; // e.g. "8# @ 150 c/c"
  factoredAxialLoadKN: number;
}

export interface FootingInstance {
  id: string;
  columnId: string;
  code: string; // F1, F2...
  center: Point2D;
  lengthFt: number;
  widthFt: number;
  totalDepthFt: number; // D_f below ground
  concreteVolumeCuM: number;
  rebarMeshWeightKg: number;
  pccThicknessInches: number; // 3"
}

export interface BOQItem {
  category: string;
  itemDescription: string;
  quantity: number;
  unit: string;
  unitRateINR: number;
  amountINR: number;
  standardClause?: string;
}

export interface BOQSummary {
  concreteVolumeM20M3: number;
  concreteVolumeM25M3: number;
  cementBagsCount: number;
  steelKgByDiameter: {
    dia8mmKg: number;
    dia10mmKg: number;
    dia12mmKg: number;
    dia16mmKg: number;
    dia20mmKg: number;
    totalKg: number;
  };
  steelKgPerSqFt: number;
  coarseAggregateM3: number;
  riverSandM3: number;
  brickCount: number;
  plasterAreaSqFt: number;
  flooringAreaByTypeSqFt: Record<string, number>;
  doorsCount: number;
  windowsCount: number;
  estimatedCostRangeINR: {
    min: number;
    max: number;
  };
  itemsTable: BOQItem[];
}

export interface AuditCheckItem {
  id: string;
  category: 'REQUIREMENTS' | 'GEOMETRY' | 'BUILDING_CODE' | 'LIVABILITY' | 'STRUCTURE' | 'QUANTITIES';
  name: string;
  description: string;
  status: 'PASS' | 'WARNING' | 'FAIL';
  actualValue: string;
  requiredValue: string;
  clauseReference?: string;
  autoFixAvailable: boolean;
}

export interface VerificationReport {
  overallStatus: 'PASS' | 'PASS_WITH_WARNINGS' | 'FAIL';
  scorePercent: number; // 0 - 100
  items: AuditCheckItem[];
  semanticCriticNotes?: string[];
  disclaimer: string;
}

export interface ProjectDesign {
  id: string;
  briefId: string;
  briefSnapshot: DesignBrief;
  archetype: 'COMPACT_EFFICIENT' | 'OPEN_CONTEMPORARY' | 'COURTYARD_PREMIUM';
  conceptTitle: string;
  conceptRationale: string;
  fingerprintHash: string;
  diversityScoreFromOthers: number;
  floors: ArchitecturalFloor[];
  totalBuiltUpSqFt: number;
  totalCarpetSqFt: number;
  carpetEfficiencyPercent: number;
  circulationPercent: number;
  daylightScore: number;
  vastuScore: number;
  structuralColumns: ColumnInstance[];
  structuralFootings: FootingInstance[];
  boqSummary: BOQSummary;
  verificationReport: VerificationReport;
  threeSceneData?: any;
  // Hearth interior design state & seeding
  seed?: number;
  sofa?: '2-seater' | '3-seater' | 'L-shape';
  sofaC?: string;
  bed?: 'Single' | 'Queen' | 'King';
  bedC?: string;
  rugC?: string;
  curC?: string;
  wall?: string;
  flr?: 'oak' | 'tile' | 'marble' | 'granite' | 'concrete';
  flB?: 'oak' | 'tile' | 'marble' | 'granite' | 'concrete';
  flW?: 'oak' | 'tile' | 'marble' | 'granite' | 'concrete';
  lt?: 'warm' | 'neutral' | 'cool';
  car?: 'None' | 'Hatchback' | 'Sedan' | 'SUV';
  laundry?: number;
  conceptName?: string;
  conceptTagline?: string;
  roomMoods?: Record<string, { mood: string }>;
}
