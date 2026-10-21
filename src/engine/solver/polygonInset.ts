import type { Point2D } from '../../types/project.ts';
import type { RegulatoryAndVastu } from '../intake/schemas.ts';

export interface InsetResult {
  buildablePolygon: Point2D[];
  buildableWidthFt: number;
  buildableDepthFt: number;
  buildableAreaSqFt: number;
  originOffset: Point2D;
}

/**
 * Computes the buildable envelope polygon by insetting plot boundaries by setbacks.
 */
export function computeBuildableEnvelope(
  plotWidth: number,
  plotDepth: number,
  setbacks: RegulatoryAndVastu['setbacks'],
  roadFacingSide: 'NORTH' | 'SOUTH' | 'EAST' | 'WEST' = 'NORTH'
): InsetResult {
  // Map setbacks according to road orientation
  // In our local coordinate system:
  // (0,0) is Front-Left corner, X is width, Y is depth
  let front = setbacks.frontFt;
  let rear = setbacks.rearFt;
  let left = setbacks.side1Ft;
  let right = setbacks.side2Ft;

  if (roadFacingSide === 'SOUTH') {
    // Road is at the bottom (max Y)
    front = setbacks.rearFt;
    rear = setbacks.frontFt;
  } else if (roadFacingSide === 'EAST') {
    left = setbacks.frontFt;
    right = setbacks.rearFt;
  } else if (roadFacingSide === 'WEST') {
    right = setbacks.frontFt;
    left = setbacks.rearFt;
  }

  const minX = left;
  const minY = front;
  const maxX = Math.max(minX, plotWidth - right);
  const maxY = Math.max(minY, plotDepth - rear);

  const buildableWidthFt = Math.max(0, maxX - minX);
  const buildableDepthFt = Math.max(0, maxY - minY);
  const buildableAreaSqFt = Math.round(buildableWidthFt * buildableDepthFt);

  const buildablePolygon: Point2D[] = [
    { x: minX, y: minY },
    { x: maxX, y: minY },
    { x: maxX, y: maxY },
    { x: minX, y: maxY },
  ];

  return {
    buildablePolygon,
    buildableWidthFt,
    buildableDepthFt,
    buildableAreaSqFt,
    originOffset: { x: minX, y: minY },
  };
}
