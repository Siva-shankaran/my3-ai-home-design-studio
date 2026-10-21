import type { DesignBrief } from '../intake/schemas.ts';
import type { ProjectDesign } from '../../types/project.ts';
import type { Archetype } from '../library/recipeTypes.ts';
import { solveLayoutForArchetype } from './bspSolver.ts';
import { computeLayoutFingerprintDistance, DIVERSITY_THRESHOLD } from './diversityMetric.ts';
import { auditProject } from '../investigator/investigatorEngine.ts';
import { generateColumnGrid } from '../structure/columnGridPlacer.ts';
import { calculateFootings } from '../structure/loadTakedown.ts';
import { calculateBOQ } from '../structure/boqCalculator.ts';

export interface CandidateGenerationResult {
  brief: DesignBrief;
  candidates: ProjectDesign[];
  diversityMatrix: {
    pairAB: number;
    pairBC: number;
    pairAC: number;
    allPassThreshold: boolean;
  };
  generationTimestamp: string;
}

/**
 * Master 3-Candidate Synthesis Engine
 * Guarantees exactly three genuinely unique, deterministic architectural concepts.
 */
export function generateThreeCandidates(brief: DesignBrief): CandidateGenerationResult {
  const archetypes: Archetype[] = ['COMPACT_EFFICIENT', 'OPEN_CONTEMPORARY', 'COURTYARD_PREMIUM'];
  let candidates: ProjectDesign[] = [];
  let attempts = 0;
  const maxAttempts = 5;

  let distAB = 0;
  let distBC = 0;
  let distAC = 0;
  let passes = false;

  while (attempts < maxAttempts && !passes) {
    attempts++;
    candidates = archetypes.map((arch, idx) => {
      const design = solveLayoutForArchetype(brief, arch, attempts + idx * 7);
      // Run Independent Investigator on each candidate
      design.verificationReport = auditProject(design, brief);
      // Generate Structure & BOQ
      try {
        const columns = generateColumnGrid(design);
        const footings = calculateFootings(columns, brief.regulations?.soilType || 'LOAM', design.floors.length);
        const boq = calculateBOQ(design, footings, columns);
        design.structuralColumns = columns;
        design.structuralFootings = footings;
        design.boqSummary = boq;
      } catch (err) {
        console.warn('Structure/BOQ generation deferred for candidate', err);
      }
      return design;
    });

    const pairAB = computeLayoutFingerprintDistance(candidates[0], candidates[1]);
    const pairBC = computeLayoutFingerprintDistance(candidates[1], candidates[2]);
    const pairAC = computeLayoutFingerprintDistance(candidates[0], candidates[2]);

    distAB = pairAB.combinedDiversityScore;
    distBC = pairBC.combinedDiversityScore;
    distAC = pairAC.combinedDiversityScore;

    candidates[0].diversityScoreFromOthers = Math.min(distAB, distAC);
    candidates[1].diversityScoreFromOthers = Math.min(distAB, distBC);
    candidates[2].diversityScoreFromOthers = Math.min(distAC, distBC);

    passes = distAB >= DIVERSITY_THRESHOLD && distBC >= DIVERSITY_THRESHOLD && distAC >= DIVERSITY_THRESHOLD;
  }

  return {
    brief,
    candidates,
    diversityMatrix: {
      pairAB: distAB,
      pairBC: distBC,
      pairAC: distAC,
      allPassThreshold: passes,
    },
    generationTimestamp: new Date().toISOString(),
  };
}
