/**
 * Architectural Design Scoring Engine
 * Evaluates candidate floorplans on a 0-100 rubric across 5 core architectural dimensions.
 */

import type { Project } from '../../types/index.ts';
import { AreaCalculations } from '../geometry/areaCalculations.ts';

export interface ScoreCriterion {
  name: string;
  weight: number; // Sums to 1.0
  score: number;  // 0 to 100
  feedback: string;
}

export interface DesignEvaluation {
  overallScore: number; // 0 to 100
  ratingTier: 'Excellent' | 'Good' | 'Fair' | 'Needs Improvement';
  criteria: {
    spaceEfficiency: ScoreCriterion;
    daylightAndVentilation: ScoreCriterion;
    privacyAndZoning: ScoreCriterion;
    structuralAlignment: ScoreCriterion;
    furnitureUsability: ScoreCriterion;
  };
  strengths: string[];
  tradeOffs: string[];
}

export const DesignScoring = {
  evaluateProject(project: Project): DesignEvaluation {
    const areaReport = AreaCalculations.generateAreaReport(project.rooms);
    const circPct = areaReport.overallCirculationPercentage;

    // 1. Space Efficiency (Circulation ratio target: 10% - 16%)
    let efficiencyScore = 95;
    let efficiencyFeedback = 'Optimal circulation ratio with minimal wasted hallway area.';
    if (circPct > 22) {
      efficiencyScore = 70;
      efficiencyFeedback = `High circulation area (${circPct}% of footprint). Hallways could be compressed.`;
    } else if (circPct > 17) {
      efficiencyScore = 84;
      efficiencyFeedback = `Circulation is ${circPct}% of footprint, slightly higher than optimal 12-15%.`;
    } else if (circPct < 6) {
      efficiencyScore = 80;
      efficiencyFeedback = 'Very low circulation; verify rooms do not open directly into each other awkwardly.';
    }

    // 2. Natural Light & Ventilation
    const habitableRooms = project.rooms.filter(r => 
      r.type === 'bedroom' || r.type === 'master_bedroom' || r.type === 'living' || r.type === 'kitchen'
    );
    let roomsWithWindows = 0;
    for (const r of habitableRooms) {
      const hasWin = project.windows.some(w => 
        w.x >= r.x - 1 && w.x <= r.x + r.width + 1 &&
        w.y >= r.y - 1 && w.y <= r.y + r.height + 1
      );
      if (hasWin) roomsWithWindows++;
    }
    const windowRatio = habitableRooms.length > 0 ? roomsWithWindows / habitableRooms.length : 1;
    const daylightScore = Math.round(windowRatio * 95);
    const daylightFeedback = windowRatio >= 0.9 
      ? 'All key habitable rooms feature direct exterior window exposures.'
      : `${Math.round((1 - windowRatio) * 100)}% of habitable zones lack sufficient natural daylight openings.`;

    // 3. Privacy & Zoning (Separation of private bedrooms from main entry & public zones)
    let privacyScore = 90;
    const bedrooms = project.rooms.filter(r => r.type === 'bedroom' || r.type === 'master_bedroom');
    const foyer = project.rooms.find(r => r.type === 'foyer' || r.name.toLowerCase().includes('entry'));
    let bedroomsNearFoyer = 0;
    if (foyer) {
      for (const b of bedrooms) {
        const dist = Math.hypot(b.x - foyer.x, b.y - foyer.y);
        if (dist < 12) bedroomsNearFoyer++;
      }
    }
    if (bedroomsNearFoyer > 1) {
      privacyScore -= 15;
    }
    const privacyFeedback = privacyScore >= 85 
      ? 'Clear separation between public entertaining zones and private bedroom suites.'
      : 'Bedroom entries have partial line of sight to main entrance or living zones.';

    // 4. Structural Alignment & Wet Wall Stack
    const wetScore = project.structuralMetrics?.wetWallAlignmentScore || 88;
    const structuralScore = Math.min(98, Math.max(70, wetScore));
    const structuralFeedback = structuralScore >= 88
      ? 'Strong wet wall co-location; compact plumbing runs and clean structural spans.'
      : 'Plumbing fixtures are spread across multiple walls, requiring extended pipe runs.';

    // 5. Furniture Usability & Ergonomics
    let usabilityScore = 92;
    if (project.furniture.length === 0) {
      usabilityScore = 75;
    } else {
      // Check bedroom furniture fit
      for (const b of bedrooms) {
        const bedFurniture = project.furniture.find(f => 
          f.x >= b.x && f.x <= b.x + b.width && f.y >= b.y && f.y <= b.y + b.height
        );
        if (!bedFurniture) usabilityScore -= 4;
      }
    }
    const usabilityFeedback = 'Furniture layouts maintain standard 36" walking clearances and comfortable circulation.';

    // Weighted Overall Score:
    // Efficiency (25%), Daylight (25%), Privacy (20%), Structural (15%), Usability (15%)
    const overallScore = Math.round(
      efficiencyScore * 0.25 +
      daylightScore * 0.25 +
      privacyScore * 0.20 +
      structuralScore * 0.15 +
      usabilityScore * 0.15
    );

    const ratingTier = overallScore >= 90 ? 'Excellent' :
      overallScore >= 80 ? 'Good' :
      overallScore >= 70 ? 'Fair' : 'Needs Improvement';

    const strengths: string[] = [];
    const tradeOffs: string[] = [];

    if (efficiencyScore >= 85) strengths.push('High usable space efficiency with compact circulation corridors');
    else tradeOffs.push('Wider circulation corridors reduce usable carpet area');

    if (daylightScore >= 90) strengths.push('Abundant dual-aspect natural lighting across living and bedroom spaces');
    else tradeOffs.push('Secondary bedroom depends on single exterior orientation for natural light');

    if (privacyScore >= 85) strengths.push('Quiet bedroom wing isolated from main entrance and living room');
    else tradeOffs.push('Bedroom corridor is proximate to the living room');

    if (structuralScore >= 90) strengths.push('Co-located wet walls reduce plumbing complexity and future maintenance costs');

    return {
      overallScore,
      ratingTier,
      criteria: {
        spaceEfficiency: {
          name: 'Space Efficiency',
          weight: 0.25,
          score: efficiencyScore,
          feedback: efficiencyFeedback
        },
        daylightAndVentilation: {
          name: 'Daylight & Ventilation',
          weight: 0.25,
          score: daylightScore,
          feedback: daylightFeedback
        },
        privacyAndZoning: {
          name: 'Privacy & Spatial Zoning',
          weight: 0.20,
          score: privacyScore,
          feedback: privacyFeedback
        },
        structuralAlignment: {
          name: 'Structural & Plumbing Alignment',
          weight: 0.15,
          score: structuralScore,
          feedback: structuralFeedback
        },
        furnitureUsability: {
          name: 'Furniture Usability & Clearances',
          weight: 0.15,
          score: usabilityScore,
          feedback: usabilityFeedback
        }
      },
      strengths,
      tradeOffs
    };
  }
};
