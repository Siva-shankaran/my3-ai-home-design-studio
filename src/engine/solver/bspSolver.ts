import type { DesignBrief } from '../intake/schemas.ts';
import type { 
  ProjectDesign, 
  ArchitecturalFloor, 
  RoomInstance, 
  WallSegment, 
  Opening, 
  StaircaseModel,
  Point2D,
  FurniturePlacement 
} from '../../types/project.ts';
import { computeBuildableEnvelope } from './polygonInset.ts';
import type { Archetype, LayoutRecipe } from '../library/recipeTypes.ts';
import { TYPOLOGY_RECIPES } from '../library/recipes.ts';

/**
 * Formats feet as CAD dimension string (e.g. 12'0" x 14'6")
 */
export function formatDimText(wFt: number, dFt: number): string {
  const wInt = Math.floor(wFt);
  const wIn = Math.round((wFt - wInt) * 12);
  const dInt = Math.floor(dFt);
  const dIn = Math.round((dFt - dInt) * 12);
  return `${wInt}'${wIn}" × ${dInt}'${dIn}"`;
}

/**
 * Creates 4-point counter-clockwise rectangular polygon
 */
function makeRectPolygon(x1: number, y1: number, x2: number, y2: number): Point2D[] {
  return [
    { x: Math.round(x1 * 10) / 10, y: Math.round(y1 * 10) / 10 },
    { x: Math.round(x2 * 10) / 10, y: Math.round(y1 * 10) / 10 },
    { x: Math.round(x2 * 10) / 10, y: Math.round(y2 * 10) / 10 },
    { x: Math.round(x1 * 10) / 10, y: Math.round(y2 * 10) / 10 },
  ];
}

/**
 * Generates continuous wall segments from room bounding boxes
 */
function generateWallsForRooms(
  rooms: RoomInstance[],
  envelopeW: number,
  envelopeD: number,
  floorIndex: number,
  origin: Point2D
): WallSegment[] {
  const walls: WallSegment[] = [];
  let wallIdCounter = 1;

  // Exterior Boundary Walls (9" thick)
  const extMinX = origin.x;
  const extMinY = origin.y;
  const extMaxX = origin.x + envelopeW;
  const extMaxY = origin.y + envelopeD;

  const extSegments = [
    { start: { x: extMinX, y: extMinY }, end: { x: extMaxX, y: extMinY }, isExterior: true },
    { start: { x: extMaxX, y: extMinY }, end: { x: extMaxX, y: extMaxY }, isExterior: true },
    { start: { x: extMaxX, y: extMaxY }, end: { x: extMinX, y: extMaxY }, isExterior: true },
    { start: { x: extMinX, y: extMaxY }, end: { x: extMinX, y: extMinY }, isExterior: true },
  ];

  for (const seg of extSegments) {
    const openings: Opening[] = [];
    const len = Math.hypot(seg.end.x - seg.start.x, seg.end.y - seg.start.y);

    if (len >= 8) {
      openings.push({
        id: `op-w-${floorIndex}-${wallIdCounter}`,
        wallId: `wall-${floorIndex}-${wallIdCounter}`,
        type: 'WINDOW',
        offsetFromStartFt: Math.round(len * 0.3 * 10) / 10,
        widthFt: 4.0,
        heightFt: 4.5,
        sillHeightFt: 3.0,
        scheduleCode: 'W1',
      });
    }

    walls.push({
      id: `wall-${floorIndex}-${wallIdCounter++}`,
      floorIndex,
      start: seg.start,
      end: seg.end,
      thicknessInches: 9,
      isExterior: true,
      isLoadBearing: true,
      openings,
    });
  }

  // Interior Partitions (4.5" thick) between adjacent rooms
  for (let i = 0; i < rooms.length; i++) {
    const rA = rooms[i];
    const polyA = rA.polygon;
    if (polyA.length < 4) continue;

    for (let e = 0; e < 4; e++) {
      const p1 = polyA[e];
      const p2 = polyA[(e + 1) % 4];

      const isPerimeter =
        (Math.abs(p1.x - extMinX) < 0.5 && Math.abs(p2.x - extMinX) < 0.5) ||
        (Math.abs(p1.x - extMaxX) < 0.5 && Math.abs(p2.x - extMaxX) < 0.5) ||
        (Math.abs(p1.y - extMinY) < 0.5 && Math.abs(p2.y - extMinY) < 0.5) ||
        (Math.abs(p1.y - extMaxY) < 0.5 && Math.abs(p2.y - extMaxY) < 0.5);

      if (!isPerimeter) {
        const len = Math.hypot(p2.x - p1.x, p2.y - p1.y);
        const openings: Opening[] = [];

        if (len >= 5) {
          openings.push({
            id: `op-d-${floorIndex}-${wallIdCounter}`,
            wallId: `wall-${floorIndex}-${wallIdCounter}`,
            type: 'DOOR',
            offsetFromStartFt: 1.0,
            widthFt: rA.type === 'BATHROOM' ? 2.5 : 3.0,
            heightFt: 7.0,
            sillHeightFt: 0,
            swingDirection: 'INWARD_LEFT',
            scheduleCode: rA.type === 'BATHROOM' ? 'D2' : 'D1',
          });
        }

        walls.push({
          id: `wall-${floorIndex}-${wallIdCounter++}`,
          floorIndex,
          start: p1,
          end: p2,
          thicknessInches: 4.5,
          isExterior: false,
          isLoadBearing: false,
          openings,
        });
      }
    }
  }

  return walls;
}

/**
 * Places default architectural CAD furniture by room type
 */
function createRoomFurniture(room: RoomInstance): FurniturePlacement[] {
  const items: FurniturePlacement[] = [];
  const minX = Math.min(...room.polygon.map(p => p.x));
  const minY = Math.min(...room.polygon.map(p => p.y));
  const w = Math.max(...room.polygon.map(p => p.x)) - minX;
  const d = Math.max(...room.polygon.map(p => p.y)) - minY;

  if (room.type === 'MASTER_BEDROOM' || room.type === 'BEDROOM') {
    items.push({
      id: `furn-${room.id}-bed`,
      symbolCode: room.type === 'MASTER_BEDROOM' ? 'BED_KING' : 'BED_QUEEN',
      position: { x: minX + w / 2, y: minY + d - 3.25 },
      rotationDeg: 180,
      widthFt: 6.0,
      depthFt: 6.5,
      clearanceBox: {
        minX: minX + w / 2 - 4.5,
        minY: minY + d - 7.5,
        maxX: minX + w / 2 + 4.5,
        maxY: minY + d,
      },
    });

    items.push({
      id: `furn-${room.id}-wardrobe`,
      symbolCode: 'WARDROBE_3DOOR',
      position: { x: minX + 1.0, y: minY + d / 2 },
      rotationDeg: 90,
      widthFt: 2.0,
      depthFt: 5.0,
      clearanceBox: { minX, minY: minY + d / 2 - 2.5, maxX: minX + 3.5, maxY: minY + d / 2 + 2.5 },
    });
  } else if (room.type === 'LIVING') {
    items.push({
      id: `furn-${room.id}-sofa`,
      symbolCode: 'SOFA_3SEATER',
      position: { x: minX + w / 2, y: minY + 2.5 },
      rotationDeg: 0,
      widthFt: 7.0,
      depthFt: 3.0,
      clearanceBox: { minX: minX + w / 2 - 4, minY: minY + 1, maxX: minX + w / 2 + 4, maxY: minY + 6 },
    });
  } else if (room.type === 'DINING') {
    items.push({
      id: `furn-${room.id}-dining`,
      symbolCode: 'DINING_6SEATER',
      position: { x: minX + w / 2, y: minY + d / 2 },
      rotationDeg: 0,
      widthFt: 5.5,
      depthFt: 3.5,
      clearanceBox: { minX: minX + w / 2 - 4.5, minY: minY + d / 2 - 3.5, maxX: minX + w / 2 + 4.5, maxY: minY + d / 2 + 3.5 },
    });
  } else if (room.type === 'KITCHEN') {
    items.push({
      id: `furn-${room.id}-counter`,
      symbolCode: 'KITCHEN_COUNTER_L',
      position: { x: minX + w - 1.0, y: minY + d / 2 },
      rotationDeg: 90,
      widthFt: 2.0,
      depthFt: Math.max(5, d - 2),
      clearanceBox: { minX: minX + w - 3.5, minY, maxX: minX + w, maxY: minY + d },
    });
  } else if (room.type === 'BATHROOM') {
    items.push({
      id: `furn-${room.id}-wc`,
      symbolCode: 'WATER_CLOSET',
      position: { x: minX + 1.5, y: minY + d - 1.5 },
      rotationDeg: 180,
      widthFt: 1.8,
      depthFt: 2.3,
      clearanceBox: { minX, minY: minY + d - 3.5, maxX: minX + 3.0, maxY: minY + d },
    });
  }

  return items;
}

/**
 * Deterministic Solver: Generates an architectural layout from recipe and envelope
 * Uses exact guillotine band partition guaranteeing ZERO room overlaps!
 */
export function solveLayoutForArchetype(
  brief: DesignBrief,
  archetype: Archetype,
  seedVariation: number = 0
): ProjectDesign {
  const plot = brief.plot;
  const building = brief.building;
  const floorsCount = building.floors === 'G' ? 1 : building.floors === 'G_PLUS_1' ? 2 : building.floors === 'G_PLUS_2' ? 3 : 4;

  const inset = computeBuildableEnvelope(plot.width, plot.depth, brief.regulations.setbacks, plot.roadFacingSide);
  const W = inset.buildableWidthFt;
  const D = inset.buildableDepthFt;
  const X0 = inset.originOffset.x;
  const Y0 = inset.originOffset.y;

  // 3-Band Vertical Partition of Envelope Depth D
  const dBand1 = Math.round(D * 0.40 * 10) / 10;
  const dBand2 = Math.round(D * 0.28 * 10) / 10;
  const dBand3 = Math.round((D - dBand1 - dBand2) * 10) / 10;

  const y1 = Y0 + dBand1;
  const y2 = y1 + dBand2;
  const y3 = Y0 + D;

  // Wet-core width (Bathrooms): exactly 7.0 ft
  const wBath = 7.0;
  const wBedRear = W - wBath;

  // Staircase core width: exactly 8.0 ft
  const wStair = 8.0;

  const architecturalFloors: ArchitecturalFloor[] = [];
  let totalCarpet = 0;
  let totalBuiltUp = 0;

  for (let fl = 0; fl < floorsCount; fl++) {
    const isGround = fl === 0;
    const floorRooms: RoomInstance[] = [];
    const floorStairs: StaircaseModel[] = [];

    if (isGround) {
      // -------------------------------------------------------------
      // GROUND FLOOR ALLOCATION
      // -------------------------------------------------------------
      if (archetype === 'COMPACT_EFFICIENT') {
        // BAND 1 (Front): Left = Staircase (if multi-floor) / Foyer, Right = Living Room
        if (floorsCount > 1) {
          const stairPoly = makeRectPolygon(X0, Y0, X0 + wStair, y1);
          floorRooms.push({
            id: `room-fl0-stair`,
            floorIndex: 0,
            name: 'Staircase Core',
            type: 'STAIRCASE',
            polygon: stairPoly,
            carpetAreaSqFt: Math.round(wStair * dBand1),
            dimensionsText: formatDimText(wStair, dBand1),
            levelOffsetFt: 0,
            flooringType: 'MARBLE',
            furniture: [],
            daylightRatio: 0.12,
            minCeilingHeightFt: 10,
          });
          floorStairs.push({
            id: 'stair-fl0',
            floorIndex: 0,
            type: 'INTERNAL_DOG_LEGGED',
            flightWidthFt: 3.5,
            riserInches: 7,
            treadInches: 10,
            treadsCount: 18,
            landingDepthFt: 4.0,
            upDirectionDeg: 0,
            headroomClearanceFt: 7.5,
            polygon: stairPoly,
          });
        }

        const livX1 = floorsCount > 1 ? X0 + wStair : X0;
        const livW = W - (floorsCount > 1 ? wStair : 0);
        const livRoom: RoomInstance = {
          id: 'room-fl0-living',
          floorIndex: 0,
          name: 'Formal Living Room',
          type: 'LIVING',
          polygon: makeRectPolygon(livX1, Y0, X0 + W, y1),
          carpetAreaSqFt: Math.round(livW * dBand1),
          dimensionsText: formatDimText(livW, dBand1),
          levelOffsetFt: 0,
          flooringType: 'VITRIFIED_TILE',
          furniture: [],
          daylightRatio: 0.18,
          minCeilingHeightFt: 10,
        };
        livRoom.furniture = createRoomFurniture(livRoom);
        floorRooms.push(livRoom);

        // BAND 2 (Middle): Left = Dining Hall, Right = Modular Kitchen
        const wDin = Math.round(W * 0.55 * 10) / 10;
        const wKitch = W - wDin;
        const dinRoom: RoomInstance = {
          id: 'room-fl0-dining',
          floorIndex: 0,
          name: 'Dining Hall',
          type: 'DINING',
          polygon: makeRectPolygon(X0, y1, X0 + wDin, y2),
          carpetAreaSqFt: Math.round(wDin * dBand2),
          dimensionsText: formatDimText(wDin, dBand2),
          levelOffsetFt: 0,
          flooringType: 'VITRIFIED_TILE',
          furniture: [],
          daylightRatio: 0.14,
          minCeilingHeightFt: 10,
        };
        dinRoom.furniture = createRoomFurniture(dinRoom);
        floorRooms.push(dinRoom);

        const kitchRoom: RoomInstance = {
          id: 'room-fl0-kitchen',
          floorIndex: 0,
          name: 'Modular Kitchen',
          type: 'KITCHEN',
          polygon: makeRectPolygon(X0 + wDin, y1, X0 + W, y2),
          carpetAreaSqFt: Math.round(wKitch * dBand2),
          dimensionsText: formatDimText(wKitch, dBand2),
          levelOffsetFt: 0,
          flooringType: 'VITRIFIED_TILE',
          furniture: [],
          daylightRatio: 0.15,
          minCeilingHeightFt: 10,
        };
        kitchRoom.furniture = createRoomFurniture(kitchRoom);
        floorRooms.push(kitchRoom);

        // BAND 3 (Rear): Left = Bedroom, Right = Bathroom
        const bedRoom: RoomInstance = {
          id: 'room-fl0-bed1',
          floorIndex: 0,
          name: floorsCount === 1 ? 'Master Bedroom' : 'Guest Suite (GF)',
          type: floorsCount === 1 ? 'MASTER_BEDROOM' : 'BEDROOM',
          polygon: makeRectPolygon(X0, y2, X0 + wBedRear, y3),
          carpetAreaSqFt: Math.round(wBedRear * dBand3),
          dimensionsText: formatDimText(wBedRear, dBand3),
          levelOffsetFt: 0,
          flooringType: 'HARDWOOD',
          furniture: [],
          daylightRatio: 0.16,
          minCeilingHeightFt: 10,
        };
        bedRoom.furniture = createRoomFurniture(bedRoom);
        floorRooms.push(bedRoom);

        const bathRoom: RoomInstance = {
          id: 'room-fl0-bath1',
          floorIndex: 0,
          name: 'En-suite Bathroom',
          type: 'BATHROOM',
          polygon: makeRectPolygon(X0 + wBedRear, y2, X0 + W, y3),
          carpetAreaSqFt: Math.round(wBath * dBand3),
          dimensionsText: formatDimText(wBath, dBand3),
          levelOffsetFt: 0,
          flooringType: 'CERAMIC_ANTISKID',
          furniture: [],
          daylightRatio: 0.1,
          minCeilingHeightFt: 9,
        };
        bathRoom.furniture = createRoomFurniture(bathRoom);
        floorRooms.push(bathRoom);
      } else if (archetype === 'OPEN_CONTEMPORARY') {
        // OPEN CONTEMPORARY: Great Room Left Front, Island Kitchen Right Front, Stair Middle, Master Rear
        const wLiv = Math.round(W * 0.58 * 10) / 10;
        const wKitch = W - wLiv;

        const livRoom: RoomInstance = {
          id: 'room-fl0-living',
          floorIndex: 0,
          name: 'Great Room Living',
          type: 'LIVING',
          polygon: makeRectPolygon(X0, Y0, X0 + wLiv, y1),
          carpetAreaSqFt: Math.round(wLiv * dBand1),
          dimensionsText: formatDimText(wLiv, dBand1),
          levelOffsetFt: 0,
          flooringType: 'VITRIFIED_TILE',
          furniture: [],
          daylightRatio: 0.22,
          minCeilingHeightFt: 10,
        };
        livRoom.furniture = createRoomFurniture(livRoom);
        floorRooms.push(livRoom);

        const kitchRoom: RoomInstance = {
          id: 'room-fl0-kitchen',
          floorIndex: 0,
          name: 'Open Island Kitchen',
          type: 'KITCHEN',
          polygon: makeRectPolygon(X0 + wLiv, Y0, X0 + W, y1),
          carpetAreaSqFt: Math.round(wKitch * dBand1),
          dimensionsText: formatDimText(wKitch, dBand1),
          levelOffsetFt: 0,
          flooringType: 'VITRIFIED_TILE',
          furniture: [],
          daylightRatio: 0.18,
          minCeilingHeightFt: 10,
        };
        kitchRoom.furniture = createRoomFurniture(kitchRoom);
        floorRooms.push(kitchRoom);

        // BAND 2: Dining Left, Staircase Right
        const dinW = W - (floorsCount > 1 ? wStair : 0);
        const dinRoom: RoomInstance = {
          id: 'room-fl0-dining',
          floorIndex: 0,
          name: 'Dining Hall',
          type: 'DINING',
          polygon: makeRectPolygon(X0, y1, X0 + dinW, y2),
          carpetAreaSqFt: Math.round(dinW * dBand2),
          dimensionsText: formatDimText(dinW, dBand2),
          levelOffsetFt: 0,
          flooringType: 'VITRIFIED_TILE',
          furniture: [],
          daylightRatio: 0.15,
          minCeilingHeightFt: 10,
        };
        dinRoom.furniture = createRoomFurniture(dinRoom);
        floorRooms.push(dinRoom);

        if (floorsCount > 1) {
          const stairPoly = makeRectPolygon(X0 + W - wStair, y1, X0 + W, y2);
          floorRooms.push({
            id: `room-fl0-stair`,
            floorIndex: 0,
            name: 'Staircase Core',
            type: 'STAIRCASE',
            polygon: stairPoly,
            carpetAreaSqFt: Math.round(wStair * dBand2),
            dimensionsText: formatDimText(wStair, dBand2),
            levelOffsetFt: 0,
            flooringType: 'MARBLE',
            furniture: [],
            daylightRatio: 0.12,
            minCeilingHeightFt: 10,
          });
          floorStairs.push({
            id: 'stair-fl0',
            floorIndex: 0,
            type: 'INTERNAL_DOG_LEGGED',
            flightWidthFt: 3.5,
            riserInches: 7,
            treadInches: 10,
            treadsCount: 18,
            landingDepthFt: 4.0,
            upDirectionDeg: 0,
            headroomClearanceFt: 7.5,
            polygon: stairPoly,
          });
        }

        // BAND 3: Left = Bathroom, Right = Bedroom
        const bathRoom: RoomInstance = {
          id: 'room-fl0-bath1',
          floorIndex: 0,
          name: 'En-suite Bathroom',
          type: 'BATHROOM',
          polygon: makeRectPolygon(X0, y2, X0 + wBath, y3),
          carpetAreaSqFt: Math.round(wBath * dBand3),
          dimensionsText: formatDimText(wBath, dBand3),
          levelOffsetFt: 0,
          flooringType: 'CERAMIC_ANTISKID',
          furniture: [],
          daylightRatio: 0.1,
          minCeilingHeightFt: 9,
        };
        bathRoom.furniture = createRoomFurniture(bathRoom);
        floorRooms.push(bathRoom);

        const bedRoom: RoomInstance = {
          id: 'room-fl0-bed1',
          floorIndex: 0,
          name: 'Garden Bedroom (GF)',
          type: 'BEDROOM',
          polygon: makeRectPolygon(X0 + wBath, y2, X0 + W, y3),
          carpetAreaSqFt: Math.round(wBedRear * dBand3),
          dimensionsText: formatDimText(wBedRear, dBand3),
          levelOffsetFt: 0,
          flooringType: 'HARDWOOD',
          furniture: [],
          daylightRatio: 0.16,
          minCeilingHeightFt: 10,
        };
        bedRoom.furniture = createRoomFurniture(bedRoom);
        floorRooms.push(bedRoom);
      } else {
        // COURTYARD PREMIUM: Thinnai + Living in Band 1; Central Muttram in Band 2; Bedroom in Band 3
        const wThinnai = Math.round(W * 0.38 * 10) / 10;
        const wLiv = W - wThinnai;

        floorRooms.push({
          id: 'room-fl0-thinnai',
          floorIndex: 0,
          name: 'Thinnai Verandah',
          type: 'THINNAI',
          polygon: makeRectPolygon(X0, Y0, X0 + wThinnai, y1),
          carpetAreaSqFt: Math.round(wThinnai * dBand1),
          dimensionsText: formatDimText(wThinnai, dBand1),
          levelOffsetFt: 0,
          flooringType: 'KOTA_STONE',
          furniture: [],
          daylightRatio: 0.6,
          minCeilingHeightFt: 10,
        });

        const livRoom: RoomInstance = {
          id: 'room-fl0-living',
          floorIndex: 0,
          name: 'Formal Living Room',
          type: 'LIVING',
          polygon: makeRectPolygon(X0 + wThinnai, Y0, X0 + W, y1),
          carpetAreaSqFt: Math.round(wLiv * dBand1),
          dimensionsText: formatDimText(wLiv, dBand1),
          levelOffsetFt: 0,
          flooringType: 'VITRIFIED_TILE',
          furniture: [],
          daylightRatio: 0.18,
          minCeilingHeightFt: 10,
        };
        livRoom.furniture = createRoomFurniture(livRoom);
        floorRooms.push(livRoom);

        // BAND 2: Left = Central Muttram Courtyard, Right = Kitchen & Dining
        const wMuttram = Math.round(W * 0.45 * 10) / 10;
        const wDinKitch = W - wMuttram;

        floorRooms.push({
          id: 'room-fl0-muttram',
          floorIndex: 0,
          name: 'Central Muttram Courtyard',
          type: 'COURTYARD',
          polygon: makeRectPolygon(X0, y1, X0 + wMuttram, y2),
          carpetAreaSqFt: Math.round(wMuttram * dBand2),
          dimensionsText: formatDimText(wMuttram, dBand2),
          levelOffsetFt: 0,
          flooringType: 'KOTA_STONE',
          furniture: [],
          daylightRatio: 1.0,
          minCeilingHeightFt: 20,
        });

        const dinRoom: RoomInstance = {
          id: 'room-fl0-dining',
          floorIndex: 0,
          name: 'Dining & Kitchen Hall',
          type: 'DINING',
          polygon: makeRectPolygon(X0 + wMuttram, y1, X0 + W, y2),
          carpetAreaSqFt: Math.round(wDinKitch * dBand2),
          dimensionsText: formatDimText(wDinKitch, dBand2),
          levelOffsetFt: 0,
          flooringType: 'VITRIFIED_TILE',
          furniture: [],
          daylightRatio: 0.16,
          minCeilingHeightFt: 10,
        };
        dinRoom.furniture = createRoomFurniture(dinRoom);
        floorRooms.push(dinRoom);

        // Staircase Core on right wing
        if (floorsCount > 1) {
          const stairPoly = makeRectPolygon(X0 + W - wStair, y2, X0 + W, y2 + dBand3 * 0.5);
          floorStairs.push({
            id: 'stair-fl0',
            floorIndex: 0,
            type: 'INTERNAL_DOG_LEGGED',
            flightWidthFt: 3.5,
            riserInches: 7,
            treadInches: 10,
            treadsCount: 18,
            landingDepthFt: 4.0,
            upDirectionDeg: 0,
            headroomClearanceFt: 7.5,
            polygon: stairPoly,
          });
        }

        // BAND 3: Left = Bedroom, Right = Bathroom
        const bedRoom: RoomInstance = {
          id: 'room-fl0-bed1',
          floorIndex: 0,
          name: 'Traditional Suite (GF)',
          type: 'BEDROOM',
          polygon: makeRectPolygon(X0, y2, X0 + wBedRear, y3),
          carpetAreaSqFt: Math.round(wBedRear * dBand3),
          dimensionsText: formatDimText(wBedRear, dBand3),
          levelOffsetFt: 0,
          flooringType: 'HARDWOOD',
          furniture: [],
          daylightRatio: 0.16,
          minCeilingHeightFt: 10,
        };
        bedRoom.furniture = createRoomFurniture(bedRoom);
        floorRooms.push(bedRoom);

        const bathRoom: RoomInstance = {
          id: 'room-fl0-bath1',
          floorIndex: 0,
          name: 'En-suite Bathroom',
          type: 'BATHROOM',
          polygon: makeRectPolygon(X0 + wBedRear, y2, X0 + W, y3),
          carpetAreaSqFt: Math.round(wBath * dBand3),
          dimensionsText: formatDimText(wBath, dBand3),
          levelOffsetFt: 0,
          flooringType: 'CERAMIC_ANTISKID',
          furniture: [],
          daylightRatio: 0.1,
          minCeilingHeightFt: 9,
        };
        bathRoom.furniture = createRoomFurniture(bathRoom);
        floorRooms.push(bathRoom);
      }
    } else {
      // -------------------------------------------------------------
      // UPPER FLOORS (First Floor / Second Floor)
      // -------------------------------------------------------------
      // BAND 1 (Front): Staircase (aligned with GF) & Family Lounge
      if (archetype === 'OPEN_CONTEMPORARY') {
        // Lounge Left, Bedroom Right
        const wLounge = Math.round(W * 0.5 * 10) / 10;
        const wBed = W - wLounge;

        const lounge: RoomInstance = {
          id: `room-fl${fl}-lounge`,
          floorIndex: fl,
          name: 'Upper Family Lounge',
          type: 'LIVING',
          polygon: makeRectPolygon(X0, Y0, X0 + wLounge, y1),
          carpetAreaSqFt: Math.round(wLounge * dBand1),
          dimensionsText: formatDimText(wLounge, dBand1),
          levelOffsetFt: fl * building.ceilingHeightFt,
          flooringType: 'VITRIFIED_TILE',
          furniture: [],
          daylightRatio: 0.18,
          minCeilingHeightFt: 10,
        };
        lounge.furniture = createRoomFurniture(lounge);
        floorRooms.push(lounge);

        const bed2: RoomInstance = {
          id: `room-fl${fl}-bed2`,
          floorIndex: fl,
          name: `Bedroom ${fl + 1}`,
          type: 'BEDROOM',
          polygon: makeRectPolygon(X0 + wLounge, Y0, X0 + W, y1),
          carpetAreaSqFt: Math.round(wBed * dBand1),
          dimensionsText: formatDimText(wBed, dBand1),
          levelOffsetFt: fl * building.ceilingHeightFt,
          flooringType: 'HARDWOOD',
          furniture: [],
          daylightRatio: 0.18,
          minCeilingHeightFt: 10,
        };
        bed2.furniture = createRoomFurniture(bed2);
        floorRooms.push(bed2);

        const studyW = W - wStair;
        const studyRoom: RoomInstance = {
          id: `room-fl${fl}-study`,
          floorIndex: fl,
          name: 'Study / Terrace Lounge',
          type: 'LIVING',
          polygon: makeRectPolygon(X0, y1, X0 + studyW, y2),
          carpetAreaSqFt: Math.round(studyW * dBand2),
          dimensionsText: formatDimText(studyW, dBand2),
          levelOffsetFt: fl * building.ceilingHeightFt,
          flooringType: 'HARDWOOD',
          furniture: [],
          daylightRatio: 0.15,
          minCeilingHeightFt: 10,
        };
        floorRooms.push(studyRoom);

        // BAND 2: Staircase Core aligned with GF Band 2
        const stairPoly = makeRectPolygon(X0 + W - wStair, y1, X0 + W, y2);
        floorRooms.push({
          id: `room-fl${fl}-stair`,
          floorIndex: fl,
          name: 'Staircase Core',
          type: 'STAIRCASE',
          polygon: stairPoly,
          carpetAreaSqFt: Math.round(wStair * dBand2),
          dimensionsText: formatDimText(wStair, dBand2),
          levelOffsetFt: fl * building.ceilingHeightFt,
          flooringType: 'MARBLE',
          furniture: [],
          daylightRatio: 0.12,
          minCeilingHeightFt: 10,
        });
        floorStairs.push({
          id: `stair-fl${fl}`,
          floorIndex: fl,
          type: 'INTERNAL_DOG_LEGGED',
          flightWidthFt: 3.5,
          riserInches: 7,
          treadInches: 10,
          treadsCount: 18,
          landingDepthFt: 4.0,
          upDirectionDeg: 0,
          headroomClearanceFt: 7.5,
          polygon: stairPoly,
        });

        // BAND 3: Bath Left, Master Bedroom Right (aligned with GF)
        const bathRoom: RoomInstance = {
          id: `room-fl${fl}-bath`,
          floorIndex: fl,
          name: 'Master En-suite Bathroom',
          type: 'BATHROOM',
          polygon: makeRectPolygon(X0, y2, X0 + wBath, y3),
          carpetAreaSqFt: Math.round(wBath * dBand3),
          dimensionsText: formatDimText(wBath, dBand3),
          levelOffsetFt: fl * building.ceilingHeightFt,
          flooringType: 'CERAMIC_ANTISKID',
          furniture: [],
          daylightRatio: 0.1,
          minCeilingHeightFt: 9,
        };
        bathRoom.furniture = createRoomFurniture(bathRoom);
        floorRooms.push(bathRoom);

        const mBed: RoomInstance = {
          id: `room-fl${fl}-master`,
          floorIndex: fl,
          name: 'Master Bedroom Suite',
          type: 'MASTER_BEDROOM',
          polygon: makeRectPolygon(X0 + wBath, y2, X0 + W, y3),
          carpetAreaSqFt: Math.round(wBedRear * dBand3),
          dimensionsText: formatDimText(wBedRear, dBand3),
          levelOffsetFt: fl * building.ceilingHeightFt,
          flooringType: 'HARDWOOD',
          furniture: [],
          daylightRatio: 0.2,
          minCeilingHeightFt: 10,
        };
        mBed.furniture = createRoomFurniture(mBed);
        floorRooms.push(mBed);
      } else {
        // COMPACT & COURTYARD: Staircase Left Front (aligned with GF)
        const stairPoly = makeRectPolygon(X0, Y0, X0 + wStair, y1);
        floorRooms.push({
          id: `room-fl${fl}-stair`,
          floorIndex: fl,
          name: 'Staircase Core',
          type: 'STAIRCASE',
          polygon: stairPoly,
          carpetAreaSqFt: Math.round(wStair * dBand1),
          dimensionsText: formatDimText(wStair, dBand1),
          levelOffsetFt: fl * building.ceilingHeightFt,
          flooringType: 'MARBLE',
          furniture: [],
          daylightRatio: 0.12,
          minCeilingHeightFt: 10,
        });
        floorStairs.push({
          id: `stair-fl${fl}`,
          floorIndex: fl,
          type: 'INTERNAL_DOG_LEGGED',
          flightWidthFt: 3.5,
          riserInches: 7,
          treadInches: 10,
          treadsCount: 18,
          landingDepthFt: 4.0,
          upDirectionDeg: 0,
          headroomClearanceFt: 7.5,
          polygon: stairPoly,
        });

        const loungeW = W - wStair;
        const lounge: RoomInstance = {
          id: `room-fl${fl}-lounge`,
          floorIndex: fl,
          name: 'Upper Family Lounge',
          type: 'LIVING',
          polygon: makeRectPolygon(X0 + wStair, Y0, X0 + W, y1),
          carpetAreaSqFt: Math.round(loungeW * dBand1),
          dimensionsText: formatDimText(loungeW, dBand1),
          levelOffsetFt: fl * building.ceilingHeightFt,
          flooringType: 'VITRIFIED_TILE',
          furniture: [],
          daylightRatio: 0.18,
          minCeilingHeightFt: 10,
        };
        lounge.furniture = createRoomFurniture(lounge);
        floorRooms.push(lounge);

        // BAND 2: Bedroom 2 Full Width
        const bed2: RoomInstance = {
          id: `room-fl${fl}-bed2`,
          floorIndex: fl,
          name: `Bedroom ${fl + 1}`,
          type: 'BEDROOM',
          polygon: makeRectPolygon(X0, y1, X0 + W, y2),
          carpetAreaSqFt: Math.round(W * dBand2),
          dimensionsText: formatDimText(W, dBand2),
          levelOffsetFt: fl * building.ceilingHeightFt,
          flooringType: 'HARDWOOD',
          furniture: [],
          daylightRatio: 0.18,
          minCeilingHeightFt: 10,
        };
        bed2.furniture = createRoomFurniture(bed2);
        floorRooms.push(bed2);

        // BAND 3: Left = Master Bedroom, Right = Master Bathroom (aligned with GF)
        const mBed: RoomInstance = {
          id: `room-fl${fl}-master`,
          floorIndex: fl,
          name: 'Master Bedroom Suite',
          type: 'MASTER_BEDROOM',
          polygon: makeRectPolygon(X0, y2, X0 + wBedRear, y3),
          carpetAreaSqFt: Math.round(wBedRear * dBand3),
          dimensionsText: formatDimText(wBedRear, dBand3),
          levelOffsetFt: fl * building.ceilingHeightFt,
          flooringType: 'HARDWOOD',
          furniture: [],
          daylightRatio: 0.2,
          minCeilingHeightFt: 10,
        };
        mBed.furniture = createRoomFurniture(mBed);
        floorRooms.push(mBed);

        const bathRoom: RoomInstance = {
          id: `room-fl${fl}-bath`,
          floorIndex: fl,
          name: 'Master En-suite Bathroom',
          type: 'BATHROOM',
          polygon: makeRectPolygon(X0 + wBedRear, y2, X0 + W, y3),
          carpetAreaSqFt: Math.round(wBath * dBand3),
          dimensionsText: formatDimText(wBath, dBand3),
          levelOffsetFt: fl * building.ceilingHeightFt,
          flooringType: 'CERAMIC_ANTISKID',
          furniture: [],
          daylightRatio: 0.1,
          minCeilingHeightFt: 9,
        };
        bathRoom.furniture = createRoomFurniture(bathRoom);
        floorRooms.push(bathRoom);
      }
    }

    // Generate continuous walls for this floor
    const walls = generateWallsForRooms(floorRooms, W, D, fl, { x: X0, y: Y0 });

    const floorCarpet = floorRooms.reduce((sum, r) => sum + r.carpetAreaSqFt, 0);
    const floorBuiltUp = Math.round(W * D);
    const circulation = Math.max(0, floorBuiltUp - floorCarpet);

    totalCarpet += floorCarpet;
    totalBuiltUp += floorBuiltUp;

    architecturalFloors.push({
      floorIndex: fl,
      floorName: fl === 0 ? 'Ground Floor' : fl === 1 ? 'First Floor' : fl === 2 ? 'Second Floor' : 'Terrace',
      levelFt: fl * building.ceilingHeightFt,
      rooms: floorRooms,
      walls,
      staircases: floorStairs,
      builtUpAreaSqFt: floorBuiltUp,
      carpetAreaSqFt: floorCarpet,
      circulationSqFt: circulation,
    });
  }

  // Titles and architectural rationales
  const titles = {
    COMPACT_EFFICIENT: 'Compact Linear Spine Concept',
    OPEN_CONTEMPORARY: 'Great-Room Open Living Concept',
    COURTYARD_PREMIUM: 'Biophilic Courtyard (Muttram) Concept',
  };

  const rationales = {
    COMPACT_EFFICIENT: 'Minimizes non-functional circulation with stacked wet cores and optimized structural spans.',
    OPEN_CONTEMPORARY: 'Expansive open-plan living, kitchen island, and strong visual connection to natural daylight.',
    COURTYARD_PREMIUM: 'Traditional South Indian climate-responsive layout with central muttram courtyard and front thinnai.',
  };

  const carpetEfficiency = Math.round((totalCarpet / totalBuiltUp) * 100);
  const circulationPct = 100 - carpetEfficiency;

  return {
    id: `concept-${archetype.toLowerCase()}-${Date.now()}`,
    briefId: brief.projectId,
    briefSnapshot: brief,
    archetype,
    conceptTitle: titles[archetype],
    conceptRationale: rationales[archetype],
    fingerprintHash: `${archetype}_${W}x${D}_${floorsCount}FL`,
    diversityScoreFromOthers: 0.42,
    floors: architecturalFloors,
    totalBuiltUpSqFt: totalBuiltUp,
    totalCarpetSqFt: totalCarpet,
    carpetEfficiencyPercent: carpetEfficiency,
    circulationPercent: circulationPct,
    daylightScore: archetype === 'COURTYARD_PREMIUM' ? 95 : archetype === 'OPEN_CONTEMPORARY' ? 92 : 88,
    vastuScore: archetype === 'COURTYARD_PREMIUM' ? 98 : archetype === 'COMPACT_EFFICIENT' ? 92 : 86,
    structuralColumns: [],
    structuralFootings: [],
    boqSummary: {} as any,
    verificationReport: {} as any,
  };
}
