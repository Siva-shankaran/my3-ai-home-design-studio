/**
 * Polygon Geometry & Boundary Mathematics Engine
 */

import { TOLERANCE } from './units.ts';
import type { Point2D, BoundingBox2D } from './units.ts';

export interface Polygon2D {
  vertices: Point2D[];
}

export const PolygonGeometry = {
  /**
   * Computes the signed area of a 2D polygon using the Shoelace formula (Gauss's area formula).
   * Positive for counter-clockwise vertices, negative for clockwise.
   */
  computeSignedArea(vertices: Point2D[]): number {
    const n = vertices.length;
    if (n < 3) return 0;

    let area = 0;
    for (let i = 0; i < n; i++) {
      const j = (i + 1) % n;
      area += vertices[i].x * vertices[j].y;
      area -= vertices[j].x * vertices[i].y;
    }
    return area / 2;
  },

  /**
   * Returns the absolute area of a 2D polygon in square feet.
   */
  computeArea(vertices: Point2D[]): number {
    return Math.abs(this.computeSignedArea(vertices));
  },

  /**
   * Computes the axis-aligned bounding box (AABB) of an array of points.
   */
  computeBoundingBox(points: Point2D[]): BoundingBox2D {
    if (points.length === 0) {
      return { minX: 0, minY: 0, maxX: 0, maxY: 0, width: 0, height: 0 };
    }

    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;

    for (const p of points) {
      if (p.x < minX) minX = p.x;
      if (p.y < minY) minY = p.y;
      if (p.x > maxX) maxX = p.x;
      if (p.y > maxY) maxY = p.y;
    }

    return {
      minX,
      minY,
      maxX,
      maxY,
      width: Math.max(0, maxX - minX),
      height: Math.max(0, maxY - minY)
    };
  },

  /**
   * Computes the geometric centroid (center of mass) of a polygon.
   */
  computeCentroid(vertices: Point2D[]): Point2D {
    const n = vertices.length;
    if (n === 0) return { x: 0, y: 0 };
    if (n === 1) return { x: vertices[0].x, y: vertices[0].y };
    if (n === 2) return { x: (vertices[0].x + vertices[1].x) / 2, y: (vertices[0].y + vertices[1].y) / 2 };

    let cx = 0;
    let cy = 0;
    const signedArea = this.computeSignedArea(vertices);

    // Degenerate polygon fallback
    if (Math.abs(signedArea) < TOLERANCE) {
      let sumX = 0;
      let sumY = 0;
      for (const p of vertices) {
        sumX += p.x;
        sumY += p.y;
      }
      return { x: sumX / n, y: sumY / n };
    }

    for (let i = 0; i < n; i++) {
      const j = (i + 1) % n;
      const factor = (vertices[i].x * vertices[j].y - vertices[j].x * vertices[i].y);
      cx += (vertices[i].x + vertices[j].x) * factor;
      cy += (vertices[i].y + vertices[j].y) * factor;
    }

    return {
      x: cx / (6 * signedArea),
      y: cy / (6 * signedArea)
    };
  },

  /**
   * Ray-casting point-in-polygon test.
   */
  isPointInside(point: Point2D, polygon: Point2D[]): boolean {
    const n = polygon.length;
    let inside = false;

    for (let i = 0, j = n - 1; i < n; j = i++) {
      const xi = polygon[i].x, yi = polygon[i].y;
      const xj = polygon[j].x, yj = polygon[j].y;

      const intersect = ((yi > point.y) !== (yj > point.y)) &&
        (point.x < (xj - xi) * (point.y - yi) / (yj - yi + 1e-12) + xi);
      if (intersect) inside = !inside;
    }

    return inside;
  },

  /**
   * Checks if an axis-aligned box is completely inside a container boundary box.
   */
  isBoxInside(inner: BoundingBox2D, outer: BoundingBox2D): boolean {
    return (
      inner.minX >= outer.minX - TOLERANCE &&
      inner.minY >= outer.minY - TOLERANCE &&
      inner.maxX <= outer.maxX + TOLERANCE &&
      inner.maxY <= outer.maxY + TOLERANCE
    );
  },

  calculateShoelaceArea(vertices: Point2D[]): number {
    return this.computeArea(vertices);
  },

  calculateCentroid(vertices: Point2D[]): Point2D {
    return this.computeCentroid(vertices);
  },

  isPointInPolygon(point: Point2D, polygon: Point2D[]): boolean {
    return this.isPointInside(point, polygon);
  }
};

export const Polygon = PolygonGeometry;
