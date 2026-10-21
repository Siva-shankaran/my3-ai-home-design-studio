import type { ProjectDesign, RoomInstance } from '../../types/project.ts';
import type { Project, Room, Wall, Door, WindowItem, FurnitureItem, Column } from '../../types/index.ts';

const ROOM_TYPE_COLOR_MAP: Record<string, string> = {
  LIVING: '#fbf5e6',
  DINING: '#fef3c7',
  KITCHEN: '#fef2f2',
  BEDROOM: '#fdf4ff',
  MASTER_BEDROOM: '#f5f3ff',
  BATHROOM: '#f0fdfa',
  POOJA: '#fefce8',
  THINNAI: '#fef3c7',
  COURTYARD: '#e0f2fe',
  STAIRCASE: '#f1f5f9',
  UTILITY: '#f8fafc',
};

/**
 * Maps new ProjectDesign to legacy Project model for 2D/3D studio components
 */
export function projectDesignToLegacyProject(design: ProjectDesign): Project {
  const legacyRooms: Room[] = [];
  const legacyWalls: Wall[] = [];
  const legacyDoors: Door[] = [];
  const legacyWindows: WindowItem[] = [];
  const legacyFurniture: FurnitureItem[] = [];
  const legacyColumns: Column[] = [];

  for (const floor of design.floors) {
    const flNum = floor.floorIndex + 1; // 1-based in legacy

    for (const r of floor.rooms) {
      const minX = Math.min(...r.polygon.map(p => p.x));
      const maxX = Math.max(...r.polygon.map(p => p.x));
      const minY = Math.min(...r.polygon.map(p => p.y));
      const maxY = Math.max(...r.polygon.map(p => p.y));
      const w = Math.max(1, maxX - minX);
      const h = Math.max(1, maxY - minY);

      legacyRooms.push({
        id: r.id,
        name: r.name,
        nameTamil: (r as any).nameTamil,
        type: (r.type.toLowerCase() as any),
        x: minX,
        y: minY,
        width: w,
        height: h,
        color: ROOM_TYPE_COLOR_MAP[r.type] || '#f8fafc',
        floor: flNum,
        floorFinish: r.flooringType.replace('_', ' ').toLowerCase(),
        isLoadBearing: false,
        egressCompliant: true,
      });

      // Map room furniture
      for (const f of r.furniture) {
        legacyFurniture.push({
          id: f.id,
          name: f.symbolCode.replace('_', ' '),
          category: (r.type.toLowerCase() as any),
          x: f.position.x,
          y: f.position.y,
          width: f.widthFt,
          depth: f.depthFt,
          rotation: f.rotationDeg,
          color: '#334155',
          floor: flNum,
        });
      }
    }

    // Map walls
    for (const w of floor.walls) {
      legacyWalls.push({
        id: w.id,
        x1: w.start.x,
        y1: w.start.y,
        x2: w.end.x,
        y2: w.end.y,
        thickness: w.thicknessInches / 12,
        type: w.isExterior ? 'exterior' : 'interior',
        floor: flNum,
      });

      // Map openings
      for (const op of w.openings) {
        const angle = Math.atan2(w.end.y - w.start.y, w.end.x - w.start.x);
        const opX = w.start.x + Math.cos(angle) * op.offsetFromStartFt;
        const opY = w.start.y + Math.sin(angle) * op.offsetFromStartFt;

        if (op.type === 'DOOR') {
          legacyDoors.push({
            id: op.id,
            x: opX,
            y: opY,
            width: op.widthFt,
            rotation: (angle * 180) / Math.PI,
            type: 'single',
            floor: flNum,
          });
        } else if (op.type === 'WINDOW') {
          legacyWindows.push({
            id: op.id,
            x: opX,
            y: opY,
            width: op.widthFt,
            rotation: (angle * 180) / Math.PI,
            type: 'standard',
            floor: flNum,
          });
        }
      }
    }
  }

  return {
    id: design.id,
    name: design.conceptTitle,
    description: design.conceptRationale,
    sqft: design.totalBuiltUpSqFt,
    floors: design.floors.length,
    status: 'draft',
    style: design.archetype.replace('_', ' '),
    rooms: legacyRooms,
    walls: legacyWalls,
    doors: legacyDoors,
    windows: legacyWindows,
    furniture: legacyFurniture,
    columns: legacyColumns,
    renders: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}
