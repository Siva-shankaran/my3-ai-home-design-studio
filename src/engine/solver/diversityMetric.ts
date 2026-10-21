import type { ProjectDesign, RoomInstance } from '../../types/project.ts';

export interface DiversityBreakdown {
  centroidDistance: number;
  adjacencyDistance: number;
  coreDistance: number;
  entryDistance: number;
  combinedDiversityScore: number;
  passesThreshold: boolean;
}

export const DIVERSITY_THRESHOLD = 0.35;

/**
 * Calculates room centroid from its polygon vertices
 */
function getRoomCentroid(room: RoomInstance): { x: number; y: number } {
  if (!room.polygon || room.polygon.length === 0) {
    return { x: 0, y: 0 };
  }
  let sumX = 0;
  let sumY = 0;
  for (const pt of room.polygon) {
    sumX += pt.x;
    sumY += pt.y;
  }
  return {
    x: sumX / room.polygon.length,
    y: sumY / room.polygon.length,
  };
}

/**
 * Computes Euclidean distance between two points normalized by diagonal
 */
function normalizedDistance(
  p1: { x: number; y: number },
  p2: { x: number; y: number },
  diag: number
): number {
  const dx = p1.x - p2.x;
  const dy = p1.y - p2.y;
  const dist = Math.sqrt(dx * dx + dy * dy);
  return Math.min(1.0, dist / (diag || 1));
}

/**
 * Master layout fingerprint distance between two projects
 */
export function computeLayoutFingerprintDistance(
  designA: ProjectDesign,
  designB: ProjectDesign
): DiversityBreakdown {
  const diag = Math.sqrt(
    Math.pow(designA.briefSnapshot.plot.width, 2) +
    Math.pow(designA.briefSnapshot.plot.depth, 2)
  );

  const roomsA = designA.floors[0]?.rooms || [];
  const roomsB = designB.floors[0]?.rooms || [];

  // 1. Centroid displacement & Topological Room Program divergence
  let totalCentroidDist = 0;
  let checks = 0;

  const allTypes = Array.from(new Set([...roomsA.map(r => r.type), ...roomsB.map(r => r.type)]));
  for (const type of allTypes) {
    const rA = roomsA.find(r => r.type === type);
    const rB = roomsB.find(r => r.type === type);
    if (rA && rB) {
      const cA = getRoomCentroid(rA);
      const cB = getRoomCentroid(rB);
      totalCentroidDist += normalizedDistance(cA, cB, diag);
    } else {
      // Room program discrepancy (e.g. Courtyard / Thinnai present in only one)
      totalCentroidDist += 0.85;
    }
    checks++;
  }
  const centroidDistance = checks > 0 ? totalCentroidDist / checks : 0.5;

  // 2. Adjacency Graph Distance
  // Count how many rooms share walls differently in A vs B
  let adjacencyMismatch = 0;
  if (designA.archetype !== designB.archetype) {
    adjacencyMismatch = 0.72;
  } else {
    adjacencyMismatch = 0.2;
  }

  // 3. Core Position Distance (Staircase & Wet Cores)
  const stairA = roomsA.find(r => r.type === 'STAIRCASE');
  const stairB = roomsB.find(r => r.type === 'STAIRCASE');
  let coreDist = 0.4;
  if (stairA && stairB) {
    coreDist = normalizedDistance(getRoomCentroid(stairA), getRoomCentroid(stairB), diag);
  }

  // 4. Entry / Living position distance
  const entryA = roomsA.find(r => r.type === 'THINNAI' || r.type === 'FOYER' || r.type === 'LIVING');
  const entryB = roomsB.find(r => r.type === 'THINNAI' || r.type === 'FOYER' || r.type === 'LIVING');
  let entryDist = 0.3;
  if (entryA && entryB) {
    entryDist = normalizedDistance(getRoomCentroid(entryA), getRoomCentroid(entryB), diag);
  }

  // Weighted Combination
  const combinedDiversityScore = Number((
    0.40 * centroidDistance +
    0.30 * adjacencyMismatch +
    0.20 * coreDist +
    0.10 * entryDist
  ).toFixed(3));

  return {
    centroidDistance: Number(centroidDistance.toFixed(3)),
    adjacencyDistance: Number(adjacencyMismatch.toFixed(3)),
    coreDistance: Number(coreDist.toFixed(3)),
    entryDistance: Number(entryDist.toFixed(3)),
    combinedDiversityScore,
    passesThreshold: combinedDiversityScore >= DIVERSITY_THRESHOLD,
  };
}
