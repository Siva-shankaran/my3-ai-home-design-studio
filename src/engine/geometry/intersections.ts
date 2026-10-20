/**
 * Geometric Intersections & Conflict Detection Engine
 */

import { TOLERANCE } from './units.ts';
import type { Point2D, BoundingBox2D } from './units.ts';

export interface RoomRect {
  id: string;
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  floor?: number;
}

export interface OverlapConflict {
  room1Id: string;
  room1Name: string;
  room2Id: string;
  room2Name: string;
  overlapAreaSqft: number;
  intersectionBox: BoundingBox2D;
}

export interface SetbackViolation {
  roomId: string;
  roomName: string;
  boundarySide: 'front' | 'rear' | 'left' | 'right';
  encroachmentFeet: number;
}

export const Intersections = {
  /**
   * Checks whether two rectangular rooms overlap by more than the tolerance.
   * Note: Rooms that touch at an edge (shared wall) are NOT overlapping.
   */
  checkRoomsOverlap(r1: RoomRect, r2: RoomRect, tolerance: number = 0.1): boolean {
    if (r1.id === r2.id) return false;
    if (r1.floor !== undefined && r2.floor !== undefined && r1.floor !== r2.floor) return false;

    const noOverlapX = (r1.x + r1.width <= r2.x + tolerance) || (r2.x + r2.width <= r1.x + tolerance);
    const noOverlapY = (r1.y + r1.height <= r2.y + tolerance) || (r2.y + r2.height <= r1.y + tolerance);

    return !(noOverlapX || noOverlapY);
  },

  /**
   * Computes the intersection bounding box and area between two rooms, if any.
   */
  computeOverlap(r1: RoomRect, r2: RoomRect): OverlapConflict | null {
    if (r1.id === r2.id) return null;
    if (r1.floor !== undefined && r2.floor !== undefined && r1.floor !== r2.floor) return null;

    const x1 = Math.max(r1.x, r2.x);
    const y1 = Math.max(r1.y, r2.y);
    const x2 = Math.min(r1.x + r1.width, r2.x + r2.width);
    const y2 = Math.min(r1.y + r1.height, r2.y + r2.height);

    const width = x2 - x1;
    const height = y2 - y1;

    // Must exceed tolerance to be considered an overlap rather than a shared boundary
    if (width > TOLERANCE && height > TOLERANCE) {
      const overlapArea = Number((width * height).toFixed(2));
      return {
        room1Id: r1.id,
        room1Name: r1.name,
        room2Id: r2.id,
        room2Name: r2.name,
        overlapAreaSqft: overlapArea,
        intersectionBox: {
          minX: x1,
          minY: y1,
          maxX: x2,
          maxY: y2,
          width,
          height
        }
      };
    }

    return null;
  },

  /**
   * Calculates the exact overlap area between two rooms (0 if they do not overlap).
   */
  calculateOverlapArea(r1: RoomRect, r2: RoomRect): number {
    const conflict = this.computeOverlap(r1, r2);
    return conflict ? conflict.overlapAreaSqft : 0;
  },

  /**
   * Finds all overlapping room pairs on a given floor or across all floors.
   */
  findAllRoomOverlaps(rooms: RoomRect[]): OverlapConflict[] {
    const overlaps: OverlapConflict[] = [];

    for (let i = 0; i < rooms.length; i++) {
      for (let j = i + 1; j < rooms.length; j++) {
        const conflict = this.computeOverlap(rooms[i], rooms[j]);
        if (conflict) {
          overlaps.push(conflict);
        }
      }
    }

    return overlaps;
  },

  /**
   * Validates whether rooms adhere to the buildable envelope defined by plot boundaries and setbacks.
   */
  validateSetbacks(
    rooms: RoomRect[],
    plotOrWidth: number | { width: number; depth: number },
    plotDepthOrSetbacks: number | { front: number; rear: number; left: number; right: number },
    setbacksOrFloor?: { front: number; rear: number; left: number; right: number } | number,
    maybeFloor: number = 1
  ): { isValid: boolean; violations: SetbackViolation[] } & SetbackViolation[] {
    let plotWidth = 0;
    let plotDepth = 0;
    let setbacks = { front: 0, rear: 0, left: 0, right: 0 };
    let floor = 1;

    if (typeof plotOrWidth === 'object') {
      plotWidth = plotOrWidth.width;
      plotDepth = plotOrWidth.depth;
      setbacks = plotDepthOrSetbacks as { front: number; rear: number; left: number; right: number };
      floor = typeof setbacksOrFloor === 'number' ? setbacksOrFloor : 1;
    } else {
      plotWidth = plotOrWidth;
      plotDepth = plotDepthOrSetbacks as number;
      setbacks = setbacksOrFloor as { front: number; rear: number; left: number; right: number };
      floor = maybeFloor;
    }

    const violations: SetbackViolation[] = [];

    // Buildable envelope bounds
    const minX = setbacks.left;
    const maxX = plotWidth - setbacks.right;
    const minY = setbacks.front;
    const maxY = plotDepth - setbacks.rear;

    const floorRooms = rooms.filter(r => (r.floor || 1) === floor);

    for (const room of floorRooms) {
      // Left boundary check
      if (room.x < minX - TOLERANCE) {
        violations.push({
          roomId: room.id,
          roomName: room.name,
          boundarySide: 'left',
          encroachmentFeet: Number((minX - room.x).toFixed(2))
        });
      }

      // Right boundary check
      if (room.x + room.width > maxX + TOLERANCE) {
        violations.push({
          roomId: room.id,
          roomName: room.name,
          boundarySide: 'right',
          encroachmentFeet: Number(((room.x + room.width) - maxX).toFixed(2))
        });
      }

      // Front boundary check
      if (room.y < minY - TOLERANCE) {
        violations.push({
          roomId: room.id,
          roomName: room.name,
          boundarySide: 'front',
          encroachmentFeet: Number((minY - room.y).toFixed(2))
        });
      }

      // Rear boundary check
      if (room.y + room.height > maxY + TOLERANCE) {
        violations.push({
          roomId: room.id,
          roomName: room.name,
          boundarySide: 'rear',
          encroachmentFeet: Number(((room.y + room.height) - maxY).toFixed(2))
        });
      }
    }

    const result = Object.assign(violations, {
      isValid: violations.length === 0,
      violations
    });
    return result;
  },

  /**
   * Line segment intersection check (p1 -> p2 with q1 -> q2).
   */
  segmentsIntersect(p1: Point2D, p2: Point2D, q1: Point2D, q2: Point2D): boolean {
    const ccw = (a: Point2D, b: Point2D, c: Point2D) => (c.y - a.y) * (b.x - a.x) > (b.y - a.y) * (c.x - a.x);
    return (ccw(p1, q1, q2) !== ccw(p2, q1, q2)) && (ccw(p1, p2, q1) !== ccw(p1, p2, q2));
  }
};
