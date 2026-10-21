import { z } from 'zod';

/**
 * 2D Geometric Point
 */
export const Point2DSchema = z.object({
  x: z.number(),
  y: z.number(),
});
export type Point2D = z.infer<typeof Point2DSchema>;

/**
 * Plot Boundary Polygon & Environmental Orientation
 */
export const PlotPolygonSchema = z.object({
  vertices: z.array(Point2DSchema).min(3, 'A plot must have at least 3 vertices'),
  width: z.number().positive('Plot width must be greater than 0'),
  depth: z.number().positive('Plot depth must be greater than 0'),
  shape: z.enum(['RECTANGLE', 'TRAPEZOID', 'L_SHAPE', 'IRREGULAR_POLYGON']),
  roadFacingSide: z.enum(['NORTH', 'SOUTH', 'EAST', 'WEST']),
  roadWidthFt: z.number().positive().default(30),
  isCornerPlot: z.boolean().default(false),
  secondaryRoadFacingSide: z.enum(['NORTH', 'SOUTH', 'EAST', 'WEST']).optional(),
  slopePercent: z.number().default(0),
});
export type PlotPolygon = z.infer<typeof PlotPolygonSchema>;

/**
 * Room & Functional Spatial Requirements
 */
export const RoomPreferenceSchema = z.object({
  bedrooms: z.number().int().min(1).max(7).default(3),
  bathrooms: z.number().int().min(1).max(8).default(3),
  attachedBaths: z.number().int().min(0).default(2),
  kitchenType: z.enum(['OPEN', 'SEMI_OPEN', 'CLOSED']).default('SEMI_OPEN'),
  hasUtilityWash: z.boolean().default(true),
  livingDiningArrangement: z.enum(['COMBINED_OPEN', 'SEPARATED', 'FORMAL_INFORMAL']).default('COMBINED_OPEN'),
  parkingSpaces: z.object({
    cars: z.number().int().min(0).max(4).default(1),
    bikes: z.number().int().min(0).max(6).default(2),
    isCovered: z.boolean().default(true),
  }).default({ cars: 1, bikes: 2, isCovered: true }),
  staircaseType: z.enum(['INTERNAL_DOG_LEGGED', 'INTERNAL_OPEN_WELL', 'EXTERNAL', 'SPIRAL']).default('INTERNAL_DOG_LEGGED'),
  poojaRoom: z.boolean().default(true),
  studyOffice: z.boolean().default(false),
  balconiesCount: z.number().int().min(0).default(1),
  courtyardMuttram: z.boolean().default(false),
  thinnaiVerandah: z.boolean().default(false),
  terraceGarden: z.boolean().default(false),
});
export type RoomPreference = z.infer<typeof RoomPreferenceSchema>;

/**
 * Building Codes, Setbacks & Cultural Constraints
 */
export const RegulatoryAndVastuSchema = z.object({
  codeProfile: z.enum(['TNCDBR_2019', 'NBC_2016', 'IRC']).default('TNCDBR_2019'),
  setbacks: z.object({
    frontFt: z.number().min(0).default(5),
    rearFt: z.number().min(0).default(5),
    side1Ft: z.number().min(0).default(3),
    side2Ft: z.number().min(0).default(3),
    isAutoDerived: z.boolean().default(true),
  }),
  vastuPreference: z.enum(['STRICT', 'FLEXIBLE', 'OFF']).default('FLEXIBLE'),
  budgetBand: z.enum(['AFFORDABLE', 'STANDARD', 'PREMIUM', 'LUXURY']).default('STANDARD'),
  soilType: z.enum(['CLAYEY', 'SANDY', 'LOAM', 'BLACK_COTTON', 'HARD_MOORUM_ROCK']).default('LOAM'),
  city: z.string().default('Chennai'),
});
export type RegulatoryAndVastu = z.infer<typeof RegulatoryAndVastuSchema>;

/**
 * Complete Validated Design Brief Schema
 * The single source of truth passed into the architecture synthesis engine.
 */
export const DesignBriefSchema = z.object({
  version: z.literal('2.0').default('2.0'),
  projectId: z.string().uuid(),
  projectName: z.string().min(1).default('Residential Villa Project'),
  clientName: z.string().default('Private Client'),
  createdAt: z.string().datetime(),
  entryMode: z.enum(['STRUCTURED', 'ASSUMPTION']),
  plot: PlotPolygonSchema,
  building: z.object({
    floors: z.enum(['G', 'G_PLUS_1', 'G_PLUS_2', 'G_PLUS_3']).default('G_PLUS_1'),
    targetBuiltUpSqFt: z.number().positive(),
    hasLiftProvision: z.boolean().default(false),
    ceilingHeightFt: z.number().positive().default(10),
  }),
  program: RoomPreferenceSchema,
  regulations: RegulatoryAndVastuSchema,
  displayUnit: z.enum(['FEET_INCHES', 'FEET', 'METERS', 'SQFT', 'SQM', 'CENT', 'GROUND']).default('FEET_INCHES'),
  rawFreeTextPrompt: z.string().optional(),
  assumedConfidence: z.object({
    isEstimated: z.boolean().default(false),
    widthRange: z.tuple([z.number(), z.number()]).optional(),
    depthRange: z.tuple([z.number(), z.number()]).optional(),
    confidenceScore: z.number().min(0).max(1).optional(),
    userConfirmed: z.boolean().default(false),
  }).optional(),
});
export type DesignBrief = z.infer<typeof DesignBriefSchema>;

/**
 * AI-Emitted Design Intent Schema (Topology only - No coordinates allowed)
 */
export const DesignIntentSchema = z.object({
  briefId: z.string(),
  archetype: z.enum(['COMPACT_EFFICIENT', 'OPEN_CONTEMPORARY', 'COURTYARD_PREMIUM']),
  conceptTitle: z.string(),
  conceptRationale: z.string(),
  zoningSpine: z.enum(['FRONT_TO_BACK', 'SIDE_BY_SIDE', 'CENTRAL_COURTYARD_CIRCULAR']),
  wetCoreAxis: z.enum(['LEFT_FLANK', 'RIGHT_FLANK', 'REAR_CORNER', 'CENTRAL_STACK']),
  staircasePosition: z.enum(['FOYER_LEFT', 'FOYER_RIGHT', 'CENTRAL_SPINE', 'REAR_EXTERNAL']),
  roomSequence: z.array(z.string()),
  forbiddenAdjacencies: z.array(z.tuple([z.string(), z.string()])).default([]),
  priorityDaylightRooms: z.array(z.string()).default(['LIVING', 'MASTER_BEDROOM']),
  regionalMotifs: z.array(z.string()).default([]),
});
export type DesignIntent = z.infer<typeof DesignIntentSchema>;
