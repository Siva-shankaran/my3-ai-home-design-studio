import type { LayoutRecipe, PlotFamily, FloorLevel, Archetype } from './recipeTypes.ts';

/**
 * Helper to build standard room requirements based on BHK and floors
 */
function buildRecipeRooms(bhk: number, floorsCount: number, archetype: Archetype): LayoutRecipe['rooms'] {
  const rooms: LayoutRecipe['rooms'] = [];

  // Ground Floor Core
  rooms.push({
    type: 'LIVING',
    name: 'Formal Living Room',
    nameTamil: 'வரவேற்பறை',
    minAreaSqFt: archetype === 'OPEN_CONTEMPORARY' ? 180 : 140,
    preferredAreaSqFt: archetype === 'OPEN_CONTEMPORARY' ? 220 : 160,
    maxAreaSqFt: 300,
    minWidthFt: 11,
    minAspectRatio: 0.8,
    maxAspectRatio: 1.6,
    floorIndex: 0,
    requiresExteriorWall: true,
    requiresPlumbing: false,
    vastuZone: 'NE',
  });

  rooms.push({
    type: 'DINING',
    name: 'Dining Hall',
    nameTamil: 'உணவருந்தும் கூடம்',
    minAreaSqFt: 90,
    preferredAreaSqFt: 120,
    maxAreaSqFt: 180,
    minWidthFt: 9,
    minAspectRatio: 0.8,
    maxAspectRatio: 1.4,
    floorIndex: 0,
    requiresExteriorWall: false,
    requiresPlumbing: false,
    vastuZone: 'E',
  });

  rooms.push({
    type: 'KITCHEN',
    name: 'Modular Kitchen',
    nameTamil: 'சமையலறை',
    minAreaSqFt: 70,
    preferredAreaSqFt: 95,
    maxAreaSqFt: 140,
    minWidthFt: 7.5,
    minAspectRatio: 0.8,
    maxAspectRatio: 1.5,
    floorIndex: 0,
    requiresExteriorWall: true,
    requiresPlumbing: true,
    vastuZone: 'SE',
  });

  rooms.push({
    type: 'UTILITY',
    name: 'Utility & Wash Area',
    nameTamil: 'பயன்பாட்டு அறை',
    minAreaSqFt: 30,
    preferredAreaSqFt: 45,
    maxAreaSqFt: 60,
    minWidthFt: 4.5,
    minAspectRatio: 0.6,
    maxAspectRatio: 2.0,
    floorIndex: 0,
    requiresExteriorWall: true,
    requiresPlumbing: true,
    vastuZone: 'SE',
  });

  rooms.push({
    type: 'POOJA',
    name: 'Pooja Sanctuary',
    nameTamil: 'பூஜை அறை',
    minAreaSqFt: 20,
    preferredAreaSqFt: 30,
    maxAreaSqFt: 50,
    minWidthFt: 4,
    minAspectRatio: 0.8,
    maxAspectRatio: 1.3,
    floorIndex: 0,
    requiresExteriorWall: false,
    requiresPlumbing: false,
    vastuZone: 'NE',
  });

  // Staircase (if multi-floor)
  if (floorsCount > 1) {
    rooms.push({
      type: 'STAIRCASE',
      name: 'Dog-Legged Stair Core',
      nameTamil: 'படிக்கட்டு',
      minAreaSqFt: 65,
      preferredAreaSqFt: 80,
      maxAreaSqFt: 100,
      minWidthFt: 6.5,
      minAspectRatio: 0.6,
      maxAspectRatio: 1.7,
      floorIndex: 0,
      requiresExteriorWall: true,
      requiresPlumbing: false,
      vastuZone: 'S',
    });
  }

  // Regional Thinnai / Verandah
  if (archetype === 'COURTYARD_PREMIUM') {
    rooms.push({
      type: 'THINNAI',
      name: 'Thinnai Entrance Verandah',
      nameTamil: 'திண்ணை',
      minAreaSqFt: 50,
      preferredAreaSqFt: 75,
      maxAreaSqFt: 120,
      minWidthFt: 6,
      minAspectRatio: 0.6,
      maxAspectRatio: 2.5,
      floorIndex: 0,
      requiresExteriorWall: true,
      requiresPlumbing: false,
      vastuZone: 'N',
    });

    rooms.push({
      type: 'COURTYARD',
      name: 'Central Muttram Courtyard',
      nameTamil: 'முற்றம்',
      minAreaSqFt: 70,
      preferredAreaSqFt: 100,
      maxAreaSqFt: 150,
      minWidthFt: 8,
      minAspectRatio: 0.9,
      maxAspectRatio: 1.1,
      floorIndex: 0,
      requiresExteriorWall: false,
      requiresPlumbing: false,
      vastuZone: 'CENTER',
    });
  }

  // Ground Floor Bedrooms
  const groundBedrooms = floorsCount === 1 ? bhk : Math.min(bhk, 1);
  for (let b = 1; b <= groundBedrooms; b++) {
    const isMaster = b === 1;
    rooms.push({
      type: isMaster ? 'MASTER_BEDROOM' : 'BEDROOM',
      name: isMaster ? 'Master Bedroom (GF)' : `Bedroom ${b} (GF)`,
      nameTamil: isMaster ? 'தலைமை படுக்கையறை' : `படுக்கையறை ${b}`,
      minAreaSqFt: isMaster ? 130 : 100,
      preferredAreaSqFt: isMaster ? 160 : 120,
      maxAreaSqFt: isMaster ? 220 : 160,
      minWidthFt: isMaster ? 11 : 10,
      minAspectRatio: 0.8,
      maxAspectRatio: 1.4,
      floorIndex: 0,
      requiresExteriorWall: true,
      requiresPlumbing: false,
      vastuZone: 'SW',
    });

    rooms.push({
      type: 'BATHROOM',
      name: isMaster ? 'Master En-suite' : `Bathroom ${b}`,
      nameTamil: 'குளியலறை',
      minAreaSqFt: 30,
      preferredAreaSqFt: 42,
      maxAreaSqFt: 60,
      minWidthFt: 4.5,
      minAspectRatio: 0.6,
      maxAspectRatio: 1.8,
      floorIndex: 0,
      requiresExteriorWall: true,
      requiresPlumbing: true,
      vastuZone: 'NW',
    });
  }

  // Upper Floor Bedrooms
  if (floorsCount > 1) {
    const upperBeds = bhk - groundBedrooms;
    for (let ub = 1; ub <= upperBeds; ub++) {
      const targetFloor = ub > 2 && floorsCount > 2 ? 2 : 1;
      rooms.push({
        type: ub === 1 ? 'MASTER_BEDROOM' : 'BEDROOM',
        name: ub === 1 ? 'Master Bedroom (FF)' : `Bedroom ${groundBedrooms + ub}`,
        nameTamil: 'படுக்கையறை',
        minAreaSqFt: ub === 1 ? 140 : 105,
        preferredAreaSqFt: ub === 1 ? 175 : 125,
        maxAreaSqFt: 220,
        minWidthFt: 10.5,
        minAspectRatio: 0.8,
        maxAspectRatio: 1.4,
        floorIndex: targetFloor,
        requiresExteriorWall: true,
        requiresPlumbing: false,
        vastuZone: 'SW',
      });

      rooms.push({
        type: 'BATHROOM',
        name: `Upper Bathroom ${ub}`,
        nameTamil: 'குளியலறை',
        minAreaSqFt: 30,
        preferredAreaSqFt: 40,
        maxAreaSqFt: 55,
        minWidthFt: 4.5,
        minAspectRatio: 0.6,
        maxAspectRatio: 1.8,
        floorIndex: targetFloor,
        requiresExteriorWall: true,
        requiresPlumbing: true,
        vastuZone: 'NW',
      });
    }

    // Family lounge on first floor
    rooms.push({
      type: 'LIVING',
      name: 'Family Lounge (FF)',
      nameTamil: 'குடும்ப கூடம்',
      minAreaSqFt: 110,
      preferredAreaSqFt: 140,
      maxAreaSqFt: 200,
      minWidthFt: 9.5,
      minAspectRatio: 0.8,
      maxAspectRatio: 1.5,
      floorIndex: 1,
      requiresExteriorWall: true,
      requiresPlumbing: false,
      vastuZone: 'NE',
    });
  }

  return rooms;
}

/**
 * Standard Adjacency Rules
 */
const DEFAULT_ADJACENCIES = [
  { roomA: 'KITCHEN', roomB: 'DINING', weight: 10 },
  { roomA: 'DINING', roomB: 'LIVING', weight: 8 },
  { roomA: 'KITCHEN', roomB: 'UTILITY', weight: 9 },
  { roomA: 'MASTER_BEDROOM', roomB: 'BATHROOM', weight: 10 },
  { roomA: 'POOJA', roomB: 'LIVING', weight: 5 },
  { roomA: 'POOJA', roomB: 'BATHROOM', weight: -20 }, // Strictly forbidden
  { roomA: 'KITCHEN', roomB: 'BATHROOM', weight: -15 }, // Forbidden adjacent wall
];

/**
 * Generate 48 Predefined Architectural Recipes
 */
export function generateRecipes(): LayoutRecipe[] {
  const recipes: LayoutRecipe[] = [];
  const families: PlotFamily[] = ['STANDARD', 'WIDE', 'NARROW_DEEP', 'CORNER', 'IRREGULAR'];
  const levels: { level: FloorLevel; count: number }[] = [
    { level: 'G', count: 1 },
    { level: 'G_PLUS_1', count: 2 },
    { level: 'G_PLUS_2', count: 3 },
    { level: 'G_PLUS_3', count: 4 },
  ];
  const archetypes: Archetype[] = ['COMPACT_EFFICIENT', 'OPEN_CONTEMPORARY', 'COURTYARD_PREMIUM'];

  let idCounter = 1;

  for (const fam of families) {
    for (const lvl of levels) {
      for (const arch of archetypes) {
        // Vary BHK based on floors and family
        const bhk = lvl.count === 1 ? (arch === 'COMPACT_EFFICIENT' ? 1 : 2) : lvl.count === 2 ? 3 : lvl.count === 3 ? 4 : 5;

        let zoning: LayoutRecipe['zoningSpine'] = 'LINEAR_FRONT_TO_BACK';
        let wetCore: LayoutRecipe['wetCoreAxis'] = 'LEFT_FLANK';
        let stairPos: LayoutRecipe['staircasePosition'] = 'FOYER_FRONT';

        if (arch === 'OPEN_CONTEMPORARY') {
          zoning = 'SIDE_SPLIT';
          wetCore = 'RIGHT_FLANK';
          stairPos = 'CENTRAL_CORE';
        } else if (arch === 'COURTYARD_PREMIUM') {
          zoning = 'CENTRAL_COURTYARD';
          wetCore = 'REAR_CORNER';
          stairPos = 'FOYER_FRONT';
        }

        if (fam === 'NARROW_DEEP') {
          zoning = 'LINEAR_FRONT_TO_BACK';
          stairPos = 'CENTRAL_CORE';
        } else if (fam === 'WIDE') {
          zoning = 'SIDE_SPLIT';
        }

        const recipe: LayoutRecipe = {
          id: `rcp-${idCounter.toString().padStart(3, '0')}`,
          code: `${fam.substring(0, 3)}_${lvl.level}_${bhk}BHK_${arch.substring(0, 4)}`,
          name: `${fam.replace('_', ' ')} ${lvl.level} ${bhk}-BHK ${arch === 'COMPACT_EFFICIENT' ? 'Compact' : arch === 'OPEN_CONTEMPORARY' ? 'Open' : 'Courtyard'}`,
          plotFamily: fam,
          level: lvl.level,
          floorsCount: lvl.count,
          bhk,
          archetype: arch,
          description: `Architecturally balanced ${bhk}-BHK layout tailored for ${fam.toLowerCase()} plot conditions with ${arch.toLowerCase()} circulation.`,
          keyFeatures: [
            arch === 'COURTYARD_PREMIUM' ? 'Traditional Muttram & Thinnai' : arch === 'OPEN_CONTEMPORARY' ? 'Expansive Great Room' : 'Zero Circulation Loss',
            `Optimized ${lvl.level} Structural Vertical Stacking`,
            'TNCDBR-2019 / NBC 2016 Compliant Room Sizes',
          ],
          zoningSpine: zoning,
          wetCoreAxis: wetCore,
          staircasePosition: stairPos,
          rooms: buildRecipeRooms(bhk, lvl.count, arch),
          adjacencies: DEFAULT_ADJACENCIES,
          regionalElements: {
            hasThinnai: arch === 'COURTYARD_PREMIUM',
            hasMuttram: arch === 'COURTYARD_PREMIUM',
            hasPooja: true,
            hasCarPorch: bhk >= 2,
          },
        };

        recipes.push(recipe);
        idCounter++;
        if (recipes.length >= 48) break;
      }
      if (recipes.length >= 48) break;
    }
    if (recipes.length >= 48) break;
  }

  return recipes;
}

export const TYPOLOGY_RECIPES = generateRecipes();
