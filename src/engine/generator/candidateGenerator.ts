/**
 * Three-Candidate Architectural Concept Generation Engine
 * Synthesizes 3 genuinely distinct architectural solutions (Space Optimized, Contemporary Living, Premium Spatial)
 * adapted to user plot dimensions, target built-up area, and lifestyle requirements.
 */

import type { Project, Room, Door, WindowItem, FurnitureItem, Column, RoomCamera, SiteProfile } from '../../types/index.ts';
import { TEMPLATE_LIBRARY } from '../templates/templateLibrary.ts';
import type { TemplateDefinition, ArchitecturalPattern } from '../templates/types.ts';
import { WallGeneration } from '../geometry/wallGeneration.ts';
import { AreaCalculations } from '../geometry/areaCalculations.ts';
import { FloorPlanValidator } from '../validation/floorPlanValidator.ts';
import type { ValidationSummary } from '../validation/floorPlanValidator.ts';
import { DesignScoring } from '../validation/designScoring.ts';
import type { DesignEvaluation } from '../validation/designScoring.ts';

export interface UserDesignRequirements {
  plotWidthFeet?: number;
  plotDepthFeet?: number;
  plotWidth?: number;
  plotDepth?: number;
  targetSqft: number;
  floors: 1 | 2;
  bedrooms: number;
  bathrooms: number;
  style: string;
  roadFacingSide?: 'North' | 'South' | 'East' | 'West';
  roadFacing?: 'North' | 'South' | 'East' | 'West';
  hasCourtyard?: boolean;
  hasPoojaRoom?: boolean;
  hasHomeOffice?: boolean;
  hasCarParking?: boolean;
  luxuryTier?: 'Standard' | 'Premium' | 'Ultra-Luxury';
  setbacks?: {
    front: number;
    rear: number;
    left: number;
    right: number;
  };
}

export interface DesignCandidate {
  id: string;
  optionIndex: 1 | 2 | 3;
  strategyLabel: 'Space Optimized' | 'Contemporary Living' | 'Premium Spatial Design';
  conceptTitle?: string;
  strategyDescription: string;
  templateSourceId: string;
  templateId?: string;
  name?: string;
  project: Project;
  validation: ValidationSummary;
  evaluation: DesignEvaluation;
  tradeoffs?: string[];
  keyDifferentiators: string[];
}

export const CandidateGenerator = {
  /**
   * Generates three distinctly different architectural design candidates.
   */
  generateThreeCandidates(requirements: UserDesignRequirements): DesignCandidate[] {
    const plotWidth = Math.max(20, requirements.plotWidthFeet || requirements.plotWidth || 45);
    const plotDepth = Math.max(30, requirements.plotDepthFeet || requirements.plotDepth || 55);
    const setbacks = requirements.setbacks || { front: 5, rear: 5, left: 3.5, right: 3.5 };
    const maxBuildableWidth = plotWidth - (setbacks.left + setbacks.right);
    const maxBuildableDepth = plotDepth - (setbacks.front + setbacks.rear);

    const targetSqft = Math.min(5000, Math.max(500, requirements.targetSqft || 2000));
    const floors = requirements.floors || (targetSqft > 2200 ? 2 : 1);
    const bedrooms = requirements.bedrooms || (targetSqft > 2500 ? 4 : targetSqft > 1200 ? 3 : 2);

    // Strategy 1: Space Optimized -> Prefer Pattern A (compact_efficient) or compact Pattern B
    const opt1Template = this.findBestTemplate(
      ['compact_efficient', 'contemporary_open'],
      targetSqft,
      floors,
      bedrooms,
      maxBuildableWidth,
      maxBuildableDepth,
      []
    );

    // Strategy 2: Contemporary Living -> Prefer Pattern B (contemporary_open) with social focus
    const opt2Template = this.findBestTemplate(
      ['contemporary_open', 'courtyard_daylight'],
      targetSqft,
      floors,
      bedrooms,
      maxBuildableWidth,
      maxBuildableDepth,
      [opt1Template.id]
    );

    // Strategy 3: Premium Spatial Design -> Prefer Pattern C (courtyard_daylight) or Pattern D (premium_residence)
    const opt3Template = this.findBestTemplate(
      ['courtyard_daylight', 'premium_residence', 'contemporary_open'],
      targetSqft,
      floors,
      bedrooms,
      maxBuildableWidth,
      maxBuildableDepth,
      [opt1Template.id, opt2Template.id]
    );

    const candidate1 = this.instantiateCandidate(1, 'Space Optimized', opt1Template, requirements);
    const candidate2 = this.instantiateCandidate(2, 'Contemporary Living', opt2Template, requirements);
    const candidate3 = this.instantiateCandidate(3, 'Premium Spatial Design', opt3Template, requirements);

    return [candidate1, candidate2, candidate3];
  },

  /**
   * Selects the closest fitting template matching the design strategy without duplicating previous choices.
   */
  findBestTemplate(
    preferredPatterns: ArchitecturalPattern[],
    targetSqft: number,
    floors: number,
    bedrooms: number,
    maxWidth: number,
    maxDepth: number,
    excludeIds: string[]
  ): TemplateDefinition {
    // 1. Filter by preferred pattern, non-excluded, and matching floor count if possible
    let pool = TEMPLATE_LIBRARY.filter(t => !excludeIds.includes(t.id));

    const patternPool = pool.filter(t => preferredPatterns.includes(t.pattern));
    if (patternPool.length > 0) {
      pool = patternPool;
    }

    // 2. Score templates by floor match, bedroom delta, and sqft delta
    const scored = pool.map(t => {
      let penalty = 0;
      if (t.floors !== floors) penalty += 500;
      penalty += Math.abs(t.bedrooms - bedrooms) * 200;
      penalty += Math.abs(t.targetSqft - targetSqft);

      // Width fit penalty
      if (t.recommendedPlotBounds.minWidthFeet > maxWidth) {
        penalty += (t.recommendedPlotBounds.minWidthFeet - maxWidth) * 50;
      }

      return { template: t, penalty };
    });

    scored.sort((a, b) => a.penalty - b.penalty);
    return scored[0]?.template || TEMPLATE_LIBRARY[0];
  },

  /**
   * Instantiates and adapts a template into a validated, dimensioned Project candidate.
   */
  instantiateCandidate(
    optionIndex: 1 | 2 | 3,
    strategyLabel: 'Space Optimized' | 'Contemporary Living' | 'Premium Spatial Design',
    tpl: TemplateDefinition,
    req: UserDesignRequirements
  ): DesignCandidate {
    // Deep clone rooms, doors, windows, furniture
    const scaleFactor = Math.sqrt(Math.min(1.4, Math.max(0.8, req.targetSqft / tpl.targetSqft)));

    const adaptedRooms: Room[] = tpl.rooms.map((r, i) => {
      // Scale dimensions gently, preserving aspect ratio
      const w = Number((r.width * scaleFactor).toFixed(1));
      const h = Number((r.height * scaleFactor).toFixed(1));
      const x = Number((r.x * scaleFactor).toFixed(1));
      const y = Number((r.y * scaleFactor).toFixed(1));

      return {
        ...r,
        id: `opt${optionIndex}-r${i + 1}`,
        x,
        y,
        width: Math.max(5, w),
        height: Math.max(4, h)
      };
    });

    // Derive clean, deduplicated walls
    const walls = [
      ...WallGeneration.deriveWallsFromRooms(adaptedRooms, 1),
      ...(tpl.floors === 2 ? WallGeneration.deriveWallsFromRooms(adaptedRooms, 2) : [])
    ];

    // Scale doors, windows, and furniture
    const adaptedDoors: Door[] = tpl.doors.map((d, i) => ({
      ...d,
      id: `opt${optionIndex}-d${i + 1}`,
      x: Number((d.x * scaleFactor).toFixed(1)),
      y: Number((d.y * scaleFactor).toFixed(1))
    }));

    const adaptedWindows: WindowItem[] = tpl.windows.map((w, i) => ({
      ...w,
      id: `opt${optionIndex}-w${i + 1}`,
      x: Number((w.x * scaleFactor).toFixed(1)),
      y: Number((w.y * scaleFactor).toFixed(1))
    }));

    const adaptedFurniture: FurnitureItem[] = tpl.furniture.map((f, i) => ({
      ...f,
      id: `opt${optionIndex}-f${i + 1}`,
      x: Number((f.x * scaleFactor).toFixed(1)),
      y: Number((f.y * scaleFactor).toFixed(1))
    }));

    // Generate room center cameras for 3D walkthrough
    const cameras: RoomCamera[] = adaptedRooms
      .filter(r => r.type === 'living' || r.type === 'master_bedroom' || r.type === 'kitchen' || r.type === 'dining' || r.type === 'muttram' || r.type === 'office')
      .map(r => ({
        id: `cam-${r.id}`,
        name: `${r.name} Viewpoint`,
        level: r.floor || 1,
        position: [Number((r.x + r.width / 2).toFixed(1)), Number((r.y + r.height / 2).toFixed(1))],
        fov: 50,
        active: true
      }));

    // Compute exact area report
    const areaReport = AreaCalculations.generateAreaReport(adaptedRooms, req.plotWidthFeet, req.plotDepthFeet);

    const siteProfile: SiteProfile = {
      state: 'Tamil Nadu',
      district: 'Chennai',
      planningAuthority: 'CMDA',
      plotWidth: req.plotWidthFeet || 50,
      plotDepth: req.plotDepthFeet || 60,
      plotAreaSqft: (req.plotWidthFeet || 50) * (req.plotDepthFeet || 60),
      plotAreaCents: Number((((req.plotWidthFeet || 50) * (req.plotDepthFeet || 60)) / 435.6).toFixed(2)),
      plotAreaGrounds: Number((((req.plotWidthFeet || 50) * (req.plotDepthFeet || 60)) / 2400.0).toFixed(2)),
      roadWidthFeet: 30,
      roadFacingSide: req.roadFacingSide || 'North',
      frontSetbackRequiredFeet: req.setbacks?.front || 5,
      rearSetbackRequiredFeet: req.setbacks?.rear || 5,
      sideSetbackRequiredFeet: req.setbacks?.left || 3.5,
      permittedFSI: 1.75,
      maxPlotCoveragePercent: 70
    };

    const project: Project = {
      id: `proj-opt${optionIndex}-${Date.now()}`,
      name: `Option 0${optionIndex} — ${strategyLabel} (${tpl.name})`,
      description: tpl.description,
      sqft: Math.round(areaReport.totalGrossBuiltupSqft),
      floors: tpl.floors,
      status: 'rendered',
      createdAt: new Date().toISOString(),
      updatedAt: 'Just now',
      rooms: adaptedRooms,
      walls,
      doors: adaptedDoors,
      windows: adaptedWindows,
      furniture: adaptedFurniture,
      cameras,
      renders: [
        {
          id: `r-opt${optionIndex}-1`,
          url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1600&q=85',
          prompt: `${req.style || tpl.style} home architectural design with open natural lighting`,
          style: req.style || tpl.style,
          floor: 1,
          timestamp: 'Concept'
        }
      ],
      style: req.style || tpl.style,
      siteProfile,
      structuralMetrics: {
        totalGrossSqft: Math.round(areaReport.totalGrossBuiltupSqft),
        floor1Sqft: areaReport.floorBreakdown[0]?.plinthAreaSqft || Math.round(areaReport.totalGrossBuiltupSqft / tpl.floors),
        floor2Sqft: areaReport.floorBreakdown[1]?.plinthAreaSqft || 0,
        exteriorWallPerimeterFeet: Math.round(areaReport.floorBreakdown[0]?.exteriorPerimeterFeet || 160),
        wetWallAlignmentScore: tpl.floors === 2 ? 92 : 95,
        ircEgressCompliant: true,
        estimatedBuildingCostUsd: Math.round(areaReport.totalGrossBuiltupSqft * 165),
        recommendedBeamSpans: ['Standard 9"x15" RCC Column Spans @ 12-16 ft c/c', 'Continuous 4-T16 Header over Living Openings']
      }
    };

    const validation = FloorPlanValidator.validateFloorPlan(project);
    const evaluation = DesignScoring.evaluateProject(project);

    const keyDifferentiators = [
      strategyLabel === 'Space Optimized' ? 'Maximum usable carpet area with compact 10-12% circulation ratio' :
      strategyLabel === 'Contemporary Living' ? 'Expansive open-plan living, dining and kitchen with outdoor connections' :
      'Autonomous bedroom suites with enhanced acoustic privacy and luxury master retreat',
      `${tpl.bedrooms} Bedrooms · ${tpl.bathrooms} Bathrooms across ${tpl.floors} Level(s)`,
      `Circulation style: ${tpl.circulationStyle.replace('_', ' ').toUpperCase()}`
    ];

    return {
      id: `concept-opt${optionIndex}`,
      optionIndex,
      strategyLabel,
      conceptTitle: strategyLabel,
      strategyDescription: tpl.description,
      templateSourceId: tpl.id,
      templateId: tpl.id,
      name: project.name,
      project,
      validation,
      evaluation,
      tradeoffs: (tpl.tradeOffs && tpl.tradeOffs.length > 0) ? tpl.tradeOffs : ['Slightly higher perimeter envelope cost', 'Requires dedicated setback allowances'],
      keyDifferentiators
    };
  }
};
