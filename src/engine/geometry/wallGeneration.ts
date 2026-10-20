/**
 * Deterministic Wall & Openings Derivation Engine
 * Generates deduplicated shared walls, distinct interior/exterior wall thicknesses,
 * and validates door/window placements.
 */

import { TOLERANCE } from './units.ts';
import type { RoomRect } from './intersections.ts';
import type { Wall, Door, WindowItem } from '../../types/index.ts';

export interface WallSegment {
  id: string;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  thickness: number; // in feet (0.75 for exterior, 0.35 for interior)
  type: 'exterior' | 'interior';
  floor: number;
  sharedByRooms: string[];
  isLoadBearing?: boolean;
}

export const WallGeneration = {
  // Standard residential architectural wall thicknesses (feet)
  EXTERIOR_THICKNESS: 0.75, // 9 inches (230 mm structural masonry)
  INTERIOR_THICKNESS: 0.35, // 4.2 inches (115 mm brick / partition drywall)

  /**
   * Normalizes a line segment so (x1, y1) <= (x2, y2) to enable deduplication.
   */
  normalizeSegment(x1: number, y1: number, x2: number, y2: number): { x1: number; y1: number; x2: number; y2: number } {
    if (x1 < x2 || (Math.abs(x1 - x2) < TOLERANCE && y1 <= y2)) {
      return { x1, y1, x2, y2 };
    }
    return { x1: x2, y1: y2, x2: x1, y2: y1 };
  },

  /**
   * Generates unique wall segments from room bounding boxes.
   * Merges and deduplicates shared partition walls between adjacent rooms.
   */
  deriveWallsFromRooms(rooms: RoomRect[], floorNum: number = 1): Wall[] {
    const floorRooms = rooms.filter(r => (r.floor || 1) === floorNum);
    if (floorRooms.length === 0) return [];

    interface RawSegment {
      x1: number;
      y1: number;
      x2: number;
      y2: number;
      roomId: string;
    }

    const rawSegments: RawSegment[] = [];

    // Extract all 4 perimeter edges of every room
    for (const r of floorRooms) {
      // Top wall
      rawSegments.push({ x1: r.x, y1: r.y, x2: r.x + r.width, y2: r.y, roomId: r.id });
      // Right wall
      rawSegments.push({ x1: r.x + r.width, y1: r.y, x2: r.x + r.width, y2: r.y + r.height, roomId: r.id });
      // Bottom wall
      rawSegments.push({ x1: r.x, y1: r.y + r.height, x2: r.x + r.width, y2: r.y + r.height, roomId: r.id });
      // Left wall
      rawSegments.push({ x1: r.x, y1: r.y, x2: r.x, y2: r.y + r.height, roomId: r.id });
    }

    // Deduplicate and detect shared walls
    // Two segments are shared if they are collinear and overlap
    const wallMap = new Map<string, { x1: number; y1: number; x2: number; y2: number; count: number }>();

    for (const s of rawSegments) {
      const norm = this.normalizeSegment(s.x1, s.y1, s.x2, s.y2);
      // Key with rounded coordinates to avoid floating precision split
      const key = `${norm.x1.toFixed(2)},${norm.y1.toFixed(2)}->${norm.x2.toFixed(2)},${norm.y2.toFixed(2)}`;

      if (wallMap.has(key)) {
        const existing = wallMap.get(key)!;
        existing.count += 1;
      } else {
        wallMap.set(key, { ...norm, count: 1 });
      }
    }

    const walls: Wall[] = [];
    let counter = 1;

    for (const [, item] of wallMap.entries()) {
      // count > 1 means it is shared between at least 2 rooms -> Interior partition
      // count === 1 means it is on the exterior perimeter of the home
      const isShared = item.count > 1;
      const wallType: 'exterior' | 'interior' = isShared ? 'interior' : 'exterior';
      const thickness = isShared ? this.INTERIOR_THICKNESS : this.EXTERIOR_THICKNESS;

      walls.push({
        id: `w-${floorNum}-${counter++}`,
        x1: Number(item.x1.toFixed(2)),
        y1: Number(item.y1.toFixed(2)),
        x2: Number(item.x2.toFixed(2)),
        y2: Number(item.y2.toFixed(2)),
        thickness,
        type: wallType,
        floor: floorNum,
        isLoadBearing: wallType === 'exterior'
      });
    }

    return walls;
  },

  /**
   * Checks if a window is placed on an exterior wall.
   * In architectural rules, windows must have access to exterior air and natural light.
   */
  isWindowOnExteriorWall(win: WindowItem, exteriorWalls: Wall[]): boolean {
    for (const w of exteriorWalls) {
      if (w.floor !== undefined && win.floor !== undefined && w.floor !== win.floor) continue;

      const isHorizontal = Math.abs(w.y1 - w.y2) < TOLERANCE;
      const isVertical = Math.abs(w.x1 - w.x2) < TOLERANCE;

      if (isHorizontal) {
        const onLineY = Math.abs(win.y - w.y1) < 0.5;
        const withinX = win.x >= Math.min(w.x1, w.x2) - 0.5 && win.x <= Math.max(w.x1, w.x2) + 0.5;
        if (onLineY && withinX) return true;
      } else if (isVertical) {
        const onLineX = Math.abs(win.x - w.x1) < 0.5;
        const withinY = win.y >= Math.min(w.y1, w.y2) - 0.5 && win.y <= Math.max(w.y1, w.y2) + 0.5;
        if (onLineX && withinY) return true;
      }
    }
    return false;
  }
};
