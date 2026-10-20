/**
 * Comprehensive Architectural Floorplan Validation Engine
 * Validates geometric integrity, habitable clearances, IRC/NBC minimum dimensions,
 * window light/ventilation access, and circulation connectivity.
 */

import type { Room, Project } from '../../types/index.ts';
import { Intersections } from '../geometry/intersections.ts';
import type { OverlapConflict, SetbackViolation } from '../geometry/intersections.ts';
import { WallGeneration } from '../geometry/wallGeneration.ts';

export interface ValidationIssue {
  severity: 'error' | 'warning' | 'info';
  category: 'geometry' | 'habitable_code' | 'ventilation' | 'circulation' | 'setback';
  code: string;
  message: string;
  remedialSuggestion?: string;
  affectedRoomId?: string;
}

export interface ValidationSummary {
  isValid: boolean;
  hasCriticalErrors?: boolean;
  issues?: ValidationIssue[];
  score: number; // 0 to 100
  errors: ValidationIssue[];
  warnings: ValidationIssue[];
  info: ValidationIssue[];
  overlapConflicts: OverlapConflict[];
  setbackViolations: SetbackViolation[];
}

export const FloorPlanValidator = {
  // IRC 2024 & NBC 2016 Minimum Habitable Dimensions
  MIN_HABITABLE_ROOM_SQFT: 70, // IRC minimum for habitable sleeping room
  RECOMMENDED_BEDROOM_SQFT: 100, // NBC standard for single bedroom
  MIN_ROOM_WIDTH_FEET: 7.0, // Minimum clear width for habitable rooms
  MIN_BATHROOM_SQFT: 28, // Powder room minimum
  MIN_FULL_BATH_SQFT: 40, // Full bath with shower/tub

  /**
   * Validates a project floor plan against architectural standards.
   */
  validateFloorPlan(project: Project): ValidationSummary {
    const issues: ValidationIssue[] = [];

    // 1. Overlap Conflict Checks
    const overlaps = Intersections.findAllRoomOverlaps(project.rooms);
    for (const ov of overlaps) {
      issues.push({
        severity: 'error',
        category: 'geometry',
        code: 'ROOM_OVERLAP',
        message: `Collision detected between "${ov.room1Name}" and "${ov.room2Name}" (${ov.overlapAreaSqft} sq ft overlap).`,
        remedialSuggestion: 'Adjust room dimensions or coordinates to ensure adjacent rooms share walls without intersecting.',
        affectedRoomId: ov.room1Id
      });
    }

    // 2. Setback Checks (if site profile supplied)
    let setbackViolations: SetbackViolation[] = [];
    if (project.siteProfile && project.siteProfile.plotWidth && project.siteProfile.plotDepth) {
      const setbacks = {
        front: project.siteProfile.frontSetbackRequiredFeet || 5,
        rear: project.siteProfile.rearSetbackRequiredFeet || 5,
        left: project.siteProfile.sideSetbackRequiredFeet || 3.3,
        right: project.siteProfile.sideSetbackRequiredFeet || 3.3
      };

      setbackViolations = Intersections.validateSetbacks(
        project.rooms,
        project.siteProfile.plotWidth,
        project.siteProfile.plotDepth,
        setbacks,
        1
      );

      for (const sb of setbackViolations) {
        issues.push({
          severity: 'error',
          category: 'setback',
          code: 'SETBACK_ENCROACHMENT',
          message: `Room "${sb.roomName}" encroaches into ${sb.boundarySide} setback by ${sb.encroachmentFeet} ft.`,
          remedialSuggestion: `Relocate or trim room away from the ${sb.boundarySide} boundary line to respect statutory setbacks.`,
          affectedRoomId: sb.roomId
        });
      }
    }

    // 3. Habitable Room Dimension & Area Checks (IRC / NBC)
    for (const room of project.rooms) {
      const area = room.width * room.height;
      const minDimension = Math.min(room.width, room.height);

      if (room.type === 'bedroom' || room.type === 'master_bedroom') {
        if (area < this.MIN_HABITABLE_ROOM_SQFT) {
          issues.push({
            severity: 'error',
            category: 'habitable_code',
            code: 'BEDROOM_TOO_SMALL',
            message: `Bedroom "${room.name}" (${area.toFixed(1)} sq ft) is below IRC legal minimum of ${this.MIN_HABITABLE_ROOM_SQFT} sq ft.`,
            remedialSuggestion: 'Expand bedroom dimensions to at least 10 ft × 10 ft (100 sq ft).',
            affectedRoomId: room.id
          });
        } else if (area < this.RECOMMENDED_BEDROOM_SQFT) {
          issues.push({
            severity: 'warning',
            category: 'habitable_code',
            code: 'BEDROOM_COMPACT',
            message: `Bedroom "${room.name}" (${area.toFixed(1)} sq ft) is functional but compact for modern furniture clearances.`,
            remedialSuggestion: 'Consider expanding to 120+ sq ft for queen bed + dual nightstands clearance.',
            affectedRoomId: room.id
          });
        }

        if (minDimension < this.MIN_ROOM_WIDTH_FEET) {
          issues.push({
            severity: 'error',
            category: 'habitable_code',
            code: 'BEDROOM_TOO_NARROW',
            message: `Bedroom "${room.name}" minimum width (${minDimension.toFixed(1)} ft) is below standard 7.0 ft clear width.`,
            remedialSuggestion: 'Ensure bedroom width is at least 8.0 ft for standard bed placement.',
            affectedRoomId: room.id
          });
        }
      }

      if (room.type === 'bathroom' || room.type === 'master_bath') {
        const isPowder = room.name.toLowerCase().includes('half') || room.name.toLowerCase().includes('powder');
        const minReq = isPowder ? this.MIN_BATHROOM_SQFT : this.MIN_FULL_BATH_SQFT;
        if (area < minReq) {
          issues.push({
            severity: 'warning',
            category: 'habitable_code',
            code: 'BATHROOM_COMPACT',
            message: `Bathroom "${room.name}" (${area.toFixed(1)} sq ft) is under recommended ${minReq} sq ft clearance.`,
            remedialSuggestion: 'Allow at least 5 ft × 8 ft (40 sq ft) for a 3-fixture full bathroom.',
            affectedRoomId: room.id
          });
        }
      }
    }

    // 4. Exterior Natural Light / Window Check
    const exteriorWalls = project.walls.filter(w => w.type === 'exterior');
    for (const room of project.rooms) {
      if (room.type === 'bedroom' || room.type === 'master_bedroom' || room.type === 'living') {
        const hasWindow = project.windows.some(win => {
          const inBounds = win.x >= room.x - 1 && win.x <= room.x + room.width + 1 &&
                           win.y >= room.y - 1 && win.y <= room.y + room.height + 1;
          return inBounds && (win.floor || 1) === (room.floor || 1);
        });

        if (!hasWindow) {
          issues.push({
            severity: 'warning',
            category: 'ventilation',
            code: 'NO_NATURAL_LIGHT',
            message: `Habitable room "${room.name}" lacks an exterior window for daylight and egress.`,
            remedialSuggestion: 'Place a standard window along an exterior perimeter wall.',
            affectedRoomId: room.id
          });
        }
      }
    }

    // 5. Multi-Floor Vertical Circulation Check
    if (project.floors >= 2) {
      const fl1Stairs = project.rooms.filter(r => (r.floor || 1) === 1 && (r.type === 'stairwell' || r.name.toLowerCase().includes('stair')));
      const fl2Stairs = project.rooms.filter(r => (r.floor || 1) === 2 && (r.type === 'stairwell' || r.name.toLowerCase().includes('stair')));

      if (fl1Stairs.length === 0 || fl2Stairs.length === 0) {
        issues.push({
          severity: 'error',
          category: 'circulation',
          code: 'MISSING_VERTICAL_CIRCULATION',
          message: 'Multi-floor building requires continuous stairwell core on both levels.',
          remedialSuggestion: 'Add a 6 ft × 12 ft staircase at the same (x, y) coordinates on Ground and Upper floor.'
        });
      }
    }

    const errors = issues.filter(i => i.severity === 'error');
    const warnings = issues.filter(i => i.severity === 'warning');
    const info = issues.filter(i => i.severity === 'info');

    // Score deduction algorithm: Start at 100, -20 per error, -5 per warning
    const rawScore = 100 - (errors.length * 20) - (warnings.length * 5);
    const score = Math.max(0, Math.min(100, rawScore));

    return {
      isValid: errors.length === 0,
      hasCriticalErrors: errors.length > 0,
      issues,
      score,
      errors,
      warnings,
      info,
      overlapConflicts: overlaps,
      setbackViolations
    };
  },

  /**
   * Convenience validator for raw room, door, and window arrays
   */
  validateLayout(
    rooms: any[],
    doors: any[] = [],
    windows: any[] = [],
    floor: number = 1
  ): ValidationSummary & { hasCriticalErrors: boolean; issues: ValidationIssue[] } {
    const mockProject: any = {
      id: 'mock-validate',
      name: 'Validation Run',
      sqft: rooms.reduce((acc, r) => acc + (r.width * r.height), 0),
      floors: Math.max(1, ...rooms.map(r => r.floor || 1)),
      rooms,
      walls: [],
      doors,
      windows,
      furniture: []
    };

    const res = this.validateFloorPlan(mockProject);
    return {
      ...res,
      hasCriticalErrors: res.errors.length > 0,
      issues: [...res.errors, ...res.warnings, ...res.info]
    };
  }
};
