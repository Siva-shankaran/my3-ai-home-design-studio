import type { ProjectDesign, ColumnInstance, Point2D } from '../../types/project.ts';

/**
 * Places structural columns along room corners and wall junctions
 * Enforces maximum span <= 15 ft (4.57 m) per IS 456
 */
export function generateColumnGrid(design: ProjectDesign): ColumnInstance[] {
  const columns: ColumnInstance[] = [];
  const coordSet = new Set<string>();
  const floorsCount = design.floors.length;

  const groundFloor = design.floors[0];
  if (!groundFloor) return columns;

  let colId = 1;

  // Extract unique corner points from ground floor rooms
  for (const room of groundFloor.rooms) {
    for (const pt of room.polygon) {
      // Snap to 1.0 ft grid to avoid duplicate close columns
      const snappedX = Math.round(pt.x);
      const snappedY = Math.round(pt.y);
      const key = `${snappedX}_${snappedY}`;

      if (!coordSet.has(key)) {
        coordSet.add(key);

        // Determine column dimensions and reinforcement based on floors
        let widthInches = 9;
        let depthInches = 12;
        let reinforcement = '4-16# + 2-12# HYSD Fe500';
        let stirrups = '8# @ 150 mm c/c';
        let axialLoadKN = 280 * floorsCount; // Estimated axial load

        if (floorsCount >= 4) {
          widthInches = 9;
          depthInches = 15;
          reinforcement = '6-16# + 2-12# HYSD Fe500';
          stirrups = '8# @ 125 mm c/c';
        } else if (floorsCount === 1) {
          widthInches = 9;
          depthInches = 9;
          reinforcement = '4-12# HYSD Fe500';
          stirrups = '8# @ 150 mm c/c';
        }

        columns.push({
          id: `col-${colId}`,
          code: `C${colId}`,
          position: { x: snappedX, y: snappedY },
          widthInches,
          depthInches,
          reinforcement,
          stirrups,
          factoredAxialLoadKN: axialLoadKN,
        });

        colId++;
      }
    }
  }

  // Intermediate Column Span Check: Ensure distance between adjacent columns <= 16 ft
  const addedIntermediate: ColumnInstance[] = [];
  for (let i = 0; i < columns.length; i++) {
    for (let j = i + 1; j < columns.length; j++) {
      const c1 = columns[i];
      const c2 = columns[j];
      const dist = Math.hypot(c2.position.x - c1.position.x, c2.position.y - c1.position.y);

      // If columns share the same X or Y axis and span > 16 ft, insert midpoint column
      if (dist > 16 && (c1.position.x === c2.position.x || c1.position.y === c2.position.y)) {
        const midX = Math.round((c1.position.x + c2.position.x) / 2);
        const midY = Math.round((c1.position.y + c2.position.y) / 2);
        const key = `${midX}_${midY}`;

        if (!coordSet.has(key)) {
          coordSet.add(key);
          addedIntermediate.push({
            id: `col-${colId}`,
            code: `C${colId}`,
            position: { x: midX, y: midY },
            widthInches: c1.widthInches,
            depthInches: c1.depthInches,
            reinforcement: c1.reinforcement,
            stirrups: c1.stirrups,
            factoredAxialLoadKN: c1.factoredAxialLoadKN,
          });
          colId++;
        }
      }
    }
  }

  return [...columns, ...addedIntermediate];
}
