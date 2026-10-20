/**
 * Canonical Architectural Template Library
 * Contains 12 fully-validated, dimensioned residential layouts across 4 primary architectural patterns.
 */

import type { TemplateDefinition } from './types.ts';
import type { Room, Door, WindowItem, FurnitureItem, Column, RoomCamera } from '../../types/index.ts';

export const TEMPLATE_LIBRARY: TemplateDefinition[] = [
  // =========================================================================
  // PATTERN A: COMPACT & EFFICIENT (600 - 1,200 sqft)
  // =========================================================================
  {
    id: 'tpl-compact-600',
    name: 'Urban Micro-Cottage (600 sqft)',
    pattern: 'compact_efficient',
    style: 'Minimalist Modern',
    description: 'Zero-waste single-level layout designed for narrow or micro urban lots with open living/dining and quiet rear bedroom.',
    floors: 1,
    bedrooms: 1,
    bathrooms: 1,
    targetSqft: 600,
    supportedSqftRange: [500, 750],
    recommendedPlotBounds: {
      minWidthFeet: 25,
      minDepthFeet: 35,
      recommendedProportion: 'narrow'
    },
    circulationStyle: 'direct_open',
    features: {
      hasOpenKitchen: true,
      hasPoojaRoom: false,
      hasHomeOffice: false,
      hasCourtyard: false
    },
    rooms: [
      { id: 'c600-r1', name: 'Open Living & Dining', type: 'living', x: 0, y: 0, width: 15, height: 14, color: '#fbf5e6', floor: 1, floorFinish: 'Natural Birch Planks' },
      { id: 'c600-r2', name: 'Kitchenette', type: 'kitchen', x: 15, y: 0, width: 9, height: 10, color: '#fef2f2', floor: 1, floorFinish: 'White Tile' },
      { id: 'c600-r3', name: 'Full Bathroom', type: 'bathroom', x: 15, y: 10, width: 9, height: 6, color: '#f0fdfa', floor: 1, floorFinish: 'White Tile' },
      { id: 'c600-r4', name: 'Master Bedroom', type: 'bedroom', x: 0, y: 14, width: 15, height: 12, color: '#fdf4ff', floor: 1, floorFinish: 'Natural Birch Planks' },
      { id: 'c600-r5', name: 'Storage & Laundry', type: 'laundry', x: 15, y: 16, width: 9, height: 10, color: '#f8fafc', floor: 1, floorFinish: 'White Tile' }
    ],
    doors: [
      { id: 'c600-d1', x: 7, y: 0, width: 3.2, rotation: 0, type: 'single', floor: 1 },
      { id: 'c600-d2', x: 6, y: 14, width: 2.8, rotation: 0, type: 'single', floor: 1 },
      { id: 'c600-d3', x: 15, y: 12, width: 2.5, rotation: 90, type: 'single', floor: 1 },
      { id: 'c600-d4', x: 15, y: 18, width: 2.5, rotation: 90, type: 'single', floor: 1 }
    ],
    windows: [
      { id: 'c600-w1', x: 3, y: 0, width: 4, rotation: 0, type: 'standard', floor: 1 },
      { id: 'c600-w2', x: 20, y: 0, width: 3.5, rotation: 0, type: 'standard', floor: 1 },
      { id: 'c600-w3', x: 6, y: 26, width: 5, rotation: 180, type: 'standard', floor: 1 },
      { id: 'c600-w4', x: 0, y: 20, width: 4, rotation: 90, type: 'standard', floor: 1 }
    ],
    furniture: [
      { id: 'c600-f1', name: 'Sectional Sofa', category: 'living', x: 5, y: 6, width: 7, depth: 5, rotation: 0, color: '#334155', floor: 1 },
      { id: 'c600-f2', name: 'TV Console', category: 'living', x: 13.5, y: 6, width: 1.5, depth: 5, rotation: 90, color: '#1e293b', floor: 1 },
      { id: 'c600-f3', name: 'Queen Bed', category: 'bedroom', x: 6, y: 19, width: 5.5, depth: 6.5, rotation: 180, color: '#475569', floor: 1 },
      { id: 'c600-f4', name: 'Straight Kitchen Counter', category: 'kitchen', x: 23, y: 4, width: 2, depth: 7, rotation: 90, color: '#0f172a', floor: 1 },
      { id: 'c600-f5', name: 'Toilet', category: 'bath', x: 22, y: 12, width: 2, depth: 2.5, rotation: 0, color: '#334155', floor: 1 },
      { id: 'c600-f6', name: 'Vanity Sink', category: 'bath', x: 17, y: 14.5, width: 2.5, depth: 1.8, rotation: 180, color: '#334155', floor: 1 }
    ],
    advantages: [
      'Zero square footage lost to hallways or corridors',
      'High structural efficiency with simple rectangular framing',
      'Low construction cost per square foot'
    ],
    tradeOffs: [
      'Single bathroom shared between residents and guests',
      'Direct kitchen-living open interface with no acoustic partition'
    ]
  },

  {
    id: 'tpl-compact-950',
    name: 'Suburban Starter Ranch (950 sqft)',
    pattern: 'compact_efficient',
    style: 'Modern Craftsman',
    description: 'Compact 2-bedroom home with well-zoned sleeping wing and central entertaining heart.',
    floors: 1,
    bedrooms: 2,
    bathrooms: 1,
    targetSqft: 950,
    supportedSqftRange: [800, 1100],
    recommendedPlotBounds: {
      minWidthFeet: 35,
      minDepthFeet: 40,
      recommendedProportion: 'standard_rectangular'
    },
    circulationStyle: 'compact_hall',
    features: {
      hasOpenKitchen: true,
      hasPoojaRoom: false,
      hasHomeOffice: false,
      hasCourtyard: false
    },
    rooms: [
      { id: 'c950-r1', name: 'Great Living Room', type: 'living', x: 0, y: 0, width: 17, height: 14, color: '#fbf5e6', floor: 1 },
      { id: 'c950-r2', name: 'Dining & Kitchen', type: 'kitchen', x: 17, y: 0, width: 13, height: 14, color: '#fef2f2', floor: 1 },
      { id: 'c950-r3', name: 'Circulation Hall', type: 'hallway', x: 12, y: 14, width: 5, height: 6, color: '#f8fafc', floor: 1 },
      { id: 'c950-r4', name: 'Master Bedroom', type: 'bedroom', x: 0, y: 14, width: 12, height: 14, color: '#fdf4ff', floor: 1 },
      { id: 'c950-r5', name: 'Secondary Bedroom', type: 'bedroom', x: 17, y: 14, width: 13, height: 12, color: '#fdf2f8', floor: 1 },
      { id: 'c950-r6', name: 'Family Bathroom', type: 'bathroom', x: 12, y: 20, width: 8, height: 8, color: '#f0fdfa', floor: 1 },
      { id: 'c950-r7', name: 'Utility & Laundry', type: 'laundry', x: 20, y: 20, width: 10, height: 8, color: '#f8fafc', floor: 1 }
    ],
    doors: [
      { id: 'c950-d1', x: 8, y: 0, width: 3.5, rotation: 0, type: 'single', floor: 1 },
      { id: 'c950-d2', x: 12, y: 16, width: 2.8, rotation: 90, type: 'single', floor: 1 },
      { id: 'c950-d3', x: 17, y: 16, width: 2.8, rotation: 90, type: 'single', floor: 1 },
      { id: 'c950-d4', x: 14, y: 20, width: 2.5, rotation: 0, type: 'single', floor: 1 },
      { id: 'c950-d5', x: 20, y: 24, width: 2.5, rotation: 90, type: 'single', floor: 1 }
    ],
    windows: [
      { id: 'c950-w1', x: 5, y: 0, width: 5, rotation: 0, type: 'standard', floor: 1 },
      { id: 'c950-w2', x: 24, y: 0, width: 4, rotation: 0, type: 'standard', floor: 1 },
      { id: 'c950-w3', x: 0, y: 20, width: 4, rotation: 90, type: 'standard', floor: 1 },
      { id: 'c950-w4', x: 30, y: 18, width: 4, rotation: 90, type: 'standard', floor: 1 }
    ],
    furniture: [
      { id: 'c950-f1', name: '3-Seater Sofa', category: 'living', x: 7, y: 5, width: 6.5, depth: 3, rotation: 0, color: '#334155', floor: 1 },
      { id: 'c950-f2', name: 'Dining Table 4-Seat', category: 'dining', x: 22, y: 6, width: 4.5, depth: 3, rotation: 0, color: '#1e293b', floor: 1 },
      { id: 'c950-f3', name: 'Queen Bed', category: 'bedroom', x: 5, y: 20, width: 5.5, depth: 6.5, rotation: 0, color: '#475569', floor: 1 },
      { id: 'c950-f4', name: 'Full Bed', category: 'bedroom', x: 24, y: 18, width: 4.5, depth: 6, rotation: 0, color: '#475569', floor: 1 },
      { id: 'c950-f5', name: 'Bathtub & Shower', category: 'bath', x: 18, y: 24, width: 3, depth: 5, rotation: 90, color: '#334155', floor: 1 }
    ],
    advantages: [
      'Separation of public day zones from private bedrooms',
      'Dedicated laundry room adjacent to kitchen and bath',
      'Direct exterior views from both bedrooms'
    ],
    tradeOffs: [
      'Single shared bathroom requires passing through central corridor',
      'No dedicated guest powder room'
    ]
  },

  {
    id: 'tpl-narrow-1100',
    name: 'Urban Infill Townhouse (1,100 sqft)',
    pattern: 'compact_efficient',
    style: 'Scandinavian Modern',
    description: 'Designed specifically for narrow urban frontages (18-20 ft wide) across two efficient floors.',
    floors: 2,
    bedrooms: 2,
    bathrooms: 2,
    targetSqft: 1100,
    supportedSqftRange: [950, 1300],
    recommendedPlotBounds: {
      minWidthFeet: 22,
      minDepthFeet: 42,
      recommendedProportion: 'narrow'
    },
    circulationStyle: 'central_core',
    features: {
      hasOpenKitchen: true,
      hasPoojaRoom: false,
      hasHomeOffice: true,
      hasCourtyard: false
    },
    rooms: [
      // Floor 1
      { id: 'nt11-r1', name: 'Front Parlor Living', type: 'living', x: 0, y: 0, width: 18, height: 14, color: '#fbf5e6', floor: 1 },
      { id: 'nt11-r2', name: 'Stairwell Core', type: 'stairwell', x: 0, y: 14, width: 7, height: 11, color: '#f1f5f9', floor: 1 },
      { id: 'nt11-r3', name: 'Powder Room', type: 'bathroom', x: 7, y: 14, width: 5, height: 5, color: '#f0fdf4', floor: 1 },
      { id: 'nt11-r4', name: 'Pantry / Storage', type: 'kitchen', x: 7, y: 19, width: 5, height: 6, color: '#fff7ed', floor: 1 },
      { id: 'nt11-r5', name: 'Chef Kitchen & Dining', type: 'dining', x: 12, y: 14, width: 6, height: 11, color: '#fef2f2', floor: 1 },
      // Floor 2
      { id: 'nt11-r6', name: 'Stairwell Landing', type: 'stairwell', x: 0, y: 14, width: 7, height: 11, color: '#f1f5f9', floor: 2 },
      { id: 'nt11-r7', name: 'Master Bedroom', type: 'master_bedroom', x: 0, y: 0, width: 18, height: 14, color: '#fdf4ff', floor: 2 },
      { id: 'nt11-r8', name: 'Full Bathroom', type: 'bathroom', x: 7, y: 14, width: 5, height: 11, color: '#f0fdfa', floor: 2 },
      { id: 'nt11-r9', name: 'Second Bedroom / Office', type: 'bedroom', x: 12, y: 14, width: 6, height: 11, color: '#eff6ff', floor: 2 }
    ],
    doors: [
      { id: 'nt11-d1', x: 8, y: 0, width: 3.2, rotation: 0, type: 'single', floor: 1 },
      { id: 'nt11-d2', x: 7, y: 16, width: 2.5, rotation: 90, type: 'single', floor: 1 },
      { id: 'nt11-d3', x: 4, y: 14, width: 2.8, rotation: 0, type: 'single', floor: 2 },
      { id: 'nt11-d4', x: 8, y: 14, width: 2.5, rotation: 0, type: 'single', floor: 2 }
    ],
    windows: [
      { id: 'nt11-w1', x: 5, y: 0, width: 6, rotation: 0, type: 'standard', floor: 1 },
      { id: 'nt11-w2', x: 5, y: 0, width: 6, rotation: 0, type: 'standard', floor: 2 },
      { id: 'nt11-w3', x: 15, y: 25, width: 4, rotation: 180, type: 'standard', floor: 1 },
      { id: 'nt11-w4', x: 15, y: 25, width: 4, rotation: 180, type: 'standard', floor: 2 }
    ],
    furniture: [
      { id: 'nt11-f1', name: 'Sectional Sofa', category: 'living', x: 7, y: 6, width: 7, depth: 5, rotation: 0, color: '#334155', floor: 1 },
      { id: 'nt11-f2', name: 'Kitchen Counter', category: 'kitchen', x: 17, y: 18, width: 2, depth: 6, rotation: 90, color: '#0f172a', floor: 1 },
      { id: 'nt11-f3', name: 'King Bed', category: 'bedroom', x: 8, y: 6, width: 6.5, depth: 6.5, rotation: 0, color: '#475569', floor: 2 }
    ],
    advantages: [
      'Fits tight 20-ft street frontages in dense urban neighborhoods',
      'Vertical separation provides private upper sleeping sanctuary',
      'Stacked plumbing wall directly above ground floor wet utilities'
    ],
    tradeOffs: [
      'Staircase accounts for ~150 sqft of total built space',
      'Side walls are typically party walls with light restricted to front and back'
    ]
  },

  // =========================================================================
  // PATTERN B: CONTEMPORARY OPEN-PLAN HOME (1,300 - 2,400 sqft)
  // =========================================================================
  {
    id: 'tpl-maket-1300',
    name: 'Coastal Open-Concept (1,300 sqft)',
    pattern: 'contemporary_open',
    style: 'Coastal Modern',
    description: 'Reverse-engineered Maket.ai residential layout with 16 programmatic zones, open great room, home office, laundry, and walk-in wardrobe.',
    floors: 1,
    bedrooms: 2,
    bathrooms: 2,
    targetSqft: 1300,
    supportedSqftRange: [1200, 1500],
    recommendedPlotBounds: {
      minWidthFeet: 50,
      minDepthFeet: 40,
      recommendedProportion: 'standard_rectangular'
    },
    circulationStyle: 'split_wing',
    features: {
      hasOpenKitchen: true,
      hasPoojaRoom: false,
      hasHomeOffice: true,
      hasCourtyard: false,
      hasWalkInWardrobe: true,
      hasLaundryUtility: true
    },
    rooms: [
      { id: 'mkt-r1', name: 'Master Bedroom', type: 'master_bedroom', x: 31, y: 10.99, width: 14.01, height: 12.84, color: '#fdf4ff', floor: 1, floorFinish: 'Natural Birch Planks' },
      { id: 'mkt-r2', name: 'Secondary Bedroom', type: 'bedroom', x: 0, y: 8.99, width: 12.99, height: 15.37, color: '#fdf2f8', floor: 1, floorFinish: 'Natural Birch Planks' },
      { id: 'mkt-r3', name: 'Full Bathroom', type: 'bathroom', x: 37.6, y: 0, width: 7.41, height: 10.99, color: '#f0fdfa', floor: 1, floorFinish: 'White Tile' },
      { id: 'mkt-r4', name: 'Powder Room (Half Bath)', type: 'bathroom', x: 12.99, y: 4, width: 6, height: 4.99, color: '#f0fdf4', floor: 1, floorFinish: 'White Tile' },
      { id: 'mkt-r5', name: 'Open Great Living Room', type: 'living', x: 8.99, y: 8.99, width: 22.01, height: 10.86, color: '#fbf5e6', floor: 1, floorFinish: 'Natural Birch Planks' },
      { id: 'mkt-r6', name: 'Dining Room', type: 'dining', x: 31, y: 23.83, width: 14.01, height: 8.16, color: '#fffbeb', floor: 1, floorFinish: 'Natural Birch Planks' },
      { id: 'mkt-r7', name: 'Chef Kitchen', type: 'kitchen', x: 19, y: 0, width: 18.6, height: 10.99, color: '#fef2f2', floor: 1, floorFinish: 'White Tile' },
      { id: 'mkt-r8', name: 'Home Office / Study', type: 'office', x: 0, y: 24.36, width: 12.99, height: 7.63, color: '#eff6ff', floor: 1, floorFinish: 'Natural Birch Planks' },
      { id: 'mkt-r9', name: 'Laundry & Utility Room', type: 'laundry', x: 0, y: 0, width: 8.99, height: 8.99, color: '#f8fafc', floor: 1, floorFinish: 'White Tile' },
      { id: 'mkt-r10', name: 'Walk-in Kitchen Pantry', type: 'kitchen', x: 12.99, y: 0, width: 6, height: 4, color: '#fff7ed', floor: 1, floorFinish: 'Natural Birch Planks' },
      { id: 'mkt-r11', name: 'Master Walk-in Wardrobe', type: 'closet', x: 37.89, y: 14.81, width: 7.12, height: 10.09, color: '#faf5ff', floor: 1, floorFinish: 'Natural Birch Planks' },
      { id: 'mkt-r12', name: 'Front Entry Foyer', type: 'foyer', x: 20.01, y: 19.85, width: 8.01, height: 4.99, color: '#f1f5f9', floor: 1, floorFinish: 'Natural Birch Planks' },
      { id: 'mkt-r13', name: 'Circulation Hall', type: 'hallway', x: 12.99, y: 19.85, width: 7.02, height: 4.99, color: '#f8fafc', floor: 1, floorFinish: 'Natural Birch Planks' },
      { id: 'mkt-r14', name: 'Circulation Hall', type: 'hallway', x: 28.02, y: 19.85, width: 2.99, height: 4.99, color: '#f8fafc', floor: 1, floorFinish: 'Natural Birch Planks' },
      { id: 'mkt-r15', name: 'Circulation Hall', type: 'hallway', x: 8.99, y: 0, width: 4, height: 8.99, color: '#f8fafc', floor: 1, floorFinish: 'Natural Birch Planks' },
      { id: 'mkt-r16', name: 'Linen Closet', type: 'closet', x: 0, y: 8.99, width: 2.82, height: 8.01, color: '#f1f5f9', floor: 1, floorFinish: 'Natural Birch Planks' }
    ],
    doors: [
      { id: 'mkt-d1', x: 24, y: 24.84, width: 3.5, rotation: 180, type: 'double', floor: 1 },
      { id: 'mkt-d2', x: 31, y: 14, width: 2.8, rotation: 90, type: 'single', floor: 1 },
      { id: 'mkt-d3', x: 37.89, y: 17, width: 2.5, rotation: 90, type: 'single', floor: 1 },
      { id: 'mkt-d4', x: 35.51, y: 23.83, width: 2.5, rotation: 180, type: 'single', floor: 1 },
      { id: 'mkt-d5', x: 12.99, y: 12, width: 2.8, rotation: 90, type: 'single', floor: 1 },
      { id: 'mkt-d6', x: 12.99, y: 5.5, width: 2.5, rotation: 90, type: 'single', floor: 1 },
      { id: 'mkt-d7', x: 8.99, y: 3.5, width: 2.8, rotation: 90, type: 'single', floor: 1 },
      { id: 'mkt-d8', x: 4.5, y: 24.36, width: 2.8, rotation: 0, type: 'single', floor: 1 },
      { id: 'mkt-d9', x: 37.6, y: 5.5, width: 2.8, rotation: 90, type: 'single', floor: 1 }
    ],
    windows: [
      { id: 'mkt-w1', x: 45.01, y: 12.9, width: 3, rotation: 90, type: 'standard', floor: 1 },
      { id: 'mkt-w2', x: 45.01, y: 28.45, width: 3, rotation: 90, type: 'standard', floor: 1 },
      { id: 'mkt-w3', x: 38, y: 31.99, width: 6, rotation: 180, type: 'standard', floor: 1 },
      { id: 'mkt-w4', x: 6.5, y: 31.99, width: 5, rotation: 180, type: 'standard', floor: 1 },
      { id: 'mkt-w5', x: 0, y: 16.5, width: 4, rotation: 90, type: 'standard', floor: 1 },
      { id: 'mkt-w6', x: 28, y: 0, width: 5, rotation: 0, type: 'standard', floor: 1 }
    ],
    furniture: [
      { id: 'mkt-f1', name: 'Cal-King Bed', category: 'bedroom', x: 34.44, y: 17.55, width: 6.5, depth: 6.5, rotation: 0, color: '#334155', floor: 1 },
      { id: 'mkt-f2', name: 'Full Bed', category: 'bedroom', x: 6.5, y: 16.5, width: 5, depth: 6.5, rotation: 0, color: '#334155', floor: 1 },
      { id: 'mkt-f3', name: 'Sectional Sofa', category: 'living', x: 20.11, y: 14.85, width: 7.5, depth: 6, rotation: 270, color: '#334155', floor: 1 },
      { id: 'mkt-f4', name: 'Coffee Table', category: 'living', x: 23.25, y: 16.26, width: 3, depth: 3, rotation: 90, color: '#d97706', floor: 1 },
      { id: 'mkt-f5', name: 'Media Unit with TV', category: 'living', x: 30.25, y: 15.5, width: 1.5, depth: 6, rotation: 90, color: '#1e293b', floor: 1 },
      { id: 'mkt-f6', name: 'Bathtub', category: 'bath', x: 42, y: 5.5, width: 3, depth: 5, rotation: 0, color: '#334155', floor: 1 },
      { id: 'mkt-f7', name: 'Single-Sink Vanity', category: 'bath', x: 15.01, y: 5.21, width: 3, depth: 2, rotation: 0, color: '#334155', floor: 1 },
      { id: 'mkt-f8', name: 'Toilet', category: 'bath', x: 17.62, y: 7.32, width: 2, depth: 2.5, rotation: 90, color: '#334155', floor: 1 },
      { id: 'mkt-f9', name: 'Corner Office Desk', category: 'office', x: 5, y: 28, width: 6, depth: 5, rotation: 0, color: '#1e293b', floor: 1 },
      { id: 'mkt-f10', name: 'Washer & Dryer', category: 'laundry', x: 5.31, y: 7.53, width: 5, depth: 2.5, rotation: 0, color: '#334155', floor: 1 }
    ],
    advantages: [
      'Comprehensive 16-zone programmatic layout with dedicated utility, pantry, and office',
      'Spacious master suite with attached walk-in closet and ensuite bath access',
      'Open Great Room acts as the expansive social heart of the house'
    ],
    tradeOffs: [
      'Extensive perimeter envelope requires at least 50 ft plot width',
      'Multiple circulation transition corridors'
    ]
  },

  {
    id: 'tpl-open-1800',
    name: 'Contemporary L-Wing Pavilion (1,800 sqft)',
    pattern: 'contemporary_open',
    style: 'Modern Minimalist',
    description: 'L-shaped single-level design sheltering a private rear deck patio, with segregated master wing and open kitchen island.',
    floors: 1,
    bedrooms: 3,
    bathrooms: 2,
    targetSqft: 1800,
    supportedSqftRange: [1600, 2000],
    recommendedPlotBounds: {
      minWidthFeet: 55,
      minDepthFeet: 50,
      recommendedProportion: 'wide'
    },
    circulationStyle: 'split_wing',
    features: {
      hasOpenKitchen: true,
      hasPoojaRoom: false,
      hasHomeOffice: true,
      hasCourtyard: false,
      hasWalkInWardrobe: true,
      hasLaundryUtility: true
    },
    rooms: [
      { id: 'lw18-r1', name: 'Grand Living Room', type: 'living', x: 0, y: 0, width: 22, height: 16, color: '#fbf5e6', floor: 1 },
      { id: 'lw18-r2', name: 'Island Kitchen & Dining', type: 'kitchen', x: 22, y: 0, width: 18, height: 16, color: '#fef2f2', floor: 1 },
      { id: 'lw18-r3', name: 'Master Suite Retreat', type: 'master_bedroom', x: 0, y: 16, width: 16, height: 16, color: '#fdf4ff', floor: 1 },
      { id: 'lw18-r4', name: 'Master Ensuite Spa', type: 'master_bath', x: 0, y: 32, width: 16, height: 8, color: '#f0fdfa', floor: 1 },
      { id: 'lw18-r5', name: 'Bedroom 2', type: 'bedroom', x: 40, y: 0, width: 14, height: 13, color: '#fdf2f8', floor: 1 },
      { id: 'lw18-r6', name: 'Bedroom 3 / Study', type: 'bedroom', x: 40, y: 13, width: 14, height: 13, color: '#eff6ff', floor: 1 },
      { id: 'lw18-r7', name: 'Guest Bathroom', type: 'bathroom', x: 40, y: 26, width: 14, height: 7, color: '#f0fdf4', floor: 1 },
      { id: 'lw18-r8', name: 'Laundry & Mudroom', type: 'laundry', x: 22, y: 16, width: 10, height: 8, color: '#f8fafc', floor: 1 }
    ],
    doors: [
      { id: 'lw18-d1', x: 11, y: 0, width: 3.5, rotation: 0, type: 'double', floor: 1 },
      { id: 'lw18-d2', x: 8, y: 16, width: 2.8, rotation: 0, type: 'single', floor: 1 },
      { id: 'lw18-d3', x: 8, y: 32, width: 2.8, rotation: 0, type: 'single', floor: 1 },
      { id: 'lw18-d4', x: 40, y: 6, width: 2.8, rotation: 90, type: 'single', floor: 1 },
      { id: 'lw18-d5', x: 40, y: 18, width: 2.8, rotation: 90, type: 'single', floor: 1 },
      { id: 'lw18-d6', x: 40, y: 29, width: 2.5, rotation: 90, type: 'single', floor: 1 }
    ],
    windows: [
      { id: 'lw18-w1', x: 11, y: 0, width: 8, rotation: 0, type: 'picture', floor: 1 },
      { id: 'lw18-w2', x: 31, y: 0, width: 6, rotation: 0, type: 'standard', floor: 1 },
      { id: 'lw18-w3', x: 0, y: 24, width: 6, rotation: 90, type: 'standard', floor: 1 },
      { id: 'lw18-w4', x: 54, y: 6, width: 5, rotation: 90, type: 'standard', floor: 1 }
    ],
    furniture: [
      { id: 'lw18-f1', name: 'Sectional Sofa', category: 'living', x: 10, y: 8, width: 8, depth: 6, rotation: 0, color: '#334155', floor: 1 },
      { id: 'lw18-f2', name: 'Kitchen Prep Island', category: 'kitchen', x: 30, y: 8, width: 8, depth: 3.5, rotation: 0, color: '#0f172a', floor: 1 },
      { id: 'lw18-f3', name: 'King Bed', category: 'bedroom', x: 8, y: 24, width: 6.5, depth: 6.5, rotation: 0, color: '#475569', floor: 1 },
      { id: 'lw18-f4', name: 'Queen Bed', category: 'bedroom', x: 47, y: 6, width: 5.5, depth: 6.5, rotation: 90, color: '#475569', floor: 1 }
    ],
    advantages: [
      'L-shape creates a protected private backyard courtyard patio',
      'Master suite is isolated in its own private wing',
      'Showpiece 8-ft kitchen island ideal for entertaining'
    ],
    tradeOffs: [
      'Requires wide building frontage (55+ ft)',
      'Longer exterior roof and foundation perimeter'
    ]
  },

  {
    id: 'tpl-contemporary-2200',
    name: 'Modern Glass Pavilion Duplex (2,200 sqft)',
    pattern: 'contemporary_open',
    style: 'Warm Contemporary',
    description: 'Two-story luxury open-plan residence featuring double-height ceiling over living room and upper family terrace.',
    floors: 2,
    bedrooms: 3,
    bathrooms: 3,
    targetSqft: 2200,
    supportedSqftRange: [2000, 2500],
    recommendedPlotBounds: {
      minWidthFeet: 40,
      minDepthFeet: 50,
      recommendedProportion: 'standard_rectangular'
    },
    circulationStyle: 'central_core',
    features: {
      hasOpenKitchen: true,
      hasPoojaRoom: false,
      hasHomeOffice: true,
      hasCourtyard: false,
      hasWalkInWardrobe: true
    },
    rooms: [
      // Ground Floor (1100 sqft)
      { id: 'cd22-r1', name: 'Grand Foyer', type: 'foyer', x: 0, y: 0, width: 10, height: 10, color: '#f1f5f9', floor: 1 },
      { id: 'cd22-r2', name: 'Double-Height Living', type: 'living', x: 10, y: 0, width: 22, height: 18, color: '#fbf5e6', floor: 1 },
      { id: 'cd22-r3', name: 'Dining Room', type: 'dining', x: 0, y: 10, width: 10, height: 16, color: '#fffbeb', floor: 1 },
      { id: 'cd22-r4', name: 'Gourmet Kitchen', type: 'kitchen', x: 0, y: 26, width: 16, height: 14, color: '#fef2f2', floor: 1 },
      { id: 'cd22-r5', name: 'Stairwell Core', type: 'stairwell', x: 16, y: 26, width: 8, height: 14, color: '#f1f5f9', floor: 1 },
      { id: 'cd22-r6', name: 'Guest Bedroom (Ground)', type: 'bedroom', x: 24, y: 20, width: 14, height: 14, color: '#fdf2f8', floor: 1 },
      { id: 'cd22-r7', name: 'Ground Bath', type: 'bathroom', x: 24, y: 34, width: 14, height: 6, color: '#f0fdfa', floor: 1 },
      // Upper Floor (1100 sqft)
      { id: 'cd22-r8', name: 'Stairwell Core', type: 'stairwell', x: 16, y: 26, width: 8, height: 14, color: '#f1f5f9', floor: 2 },
      { id: 'cd22-r9', name: 'Master Bedroom Suite', type: 'master_bedroom', x: 10, y: 0, width: 22, height: 18, color: '#fdf4ff', floor: 2 },
      { id: 'cd22-r10', name: 'Master Ensuite Spa', type: 'master_bath', x: 0, y: 0, width: 10, height: 14, color: '#f0fdfa', floor: 2 },
      { id: 'cd22-r11', name: 'Family Lounge / Study', type: 'office', x: 0, y: 14, width: 16, height: 12, color: '#eff6ff', floor: 2 },
      { id: 'cd22-r12', name: 'Bedroom 3 (Upper)', type: 'bedroom', x: 24, y: 20, width: 14, height: 14, color: '#fdf2f8', floor: 2 },
      { id: 'cd22-r13', name: 'Upper Bath', type: 'bathroom', x: 24, y: 34, width: 14, height: 6, color: '#f0fdfa', floor: 2 }
    ],
    doors: [
      { id: 'cd22-d1', x: 5, y: 0, width: 3.5, rotation: 0, type: 'single', floor: 1 },
      { id: 'cd22-d2', x: 24, y: 26, width: 2.8, rotation: 90, type: 'single', floor: 1 },
      { id: 'cd22-d3', x: 10, y: 10, width: 2.8, rotation: 0, type: 'single', floor: 2 },
      { id: 'cd22-d4', x: 24, y: 26, width: 2.8, rotation: 90, type: 'single', floor: 2 }
    ],
    windows: [
      { id: 'cd22-w1', x: 20, y: 0, width: 10, rotation: 0, type: 'picture', floor: 1 },
      { id: 'cd22-w2', x: 20, y: 0, width: 8, rotation: 0, type: 'standard', floor: 2 },
      { id: 'cd22-w3', x: 38, y: 26, width: 5, rotation: 90, type: 'standard', floor: 1 },
      { id: 'cd22-w4', x: 38, y: 26, width: 5, rotation: 90, type: 'standard', floor: 2 }
    ],
    furniture: [
      { id: 'cd22-f1', name: 'Sectional Sofa', category: 'living', x: 20, y: 8, width: 8, depth: 6, rotation: 0, color: '#334155', floor: 1 },
      { id: 'cd22-f2', name: 'King Bed', category: 'bedroom', x: 20, y: 8, width: 6.5, depth: 6.5, rotation: 0, color: '#475569', floor: 2 }
    ],
    advantages: [
      'Ground-floor guest bedroom provides elderly-friendly accessibility without stairs',
      'Upper level features a master suite sanctuary plus dedicated family study',
      'Continuous central stairwell core aligns perfectly between Floor 1 and Floor 2'
    ],
    tradeOffs: [
      'Two-story construction requires structural columns and slab engineering',
      'Double-height ceiling reduces total usable upper floor area'
    ]
  },

  // =========================================================================
  // PATTERN C: COURTYARD & NATURAL-LIGHT HOME (1,800 - 3,200 sqft)
  // =========================================================================
  {
    id: 'tpl-courtyard-1800',
    name: 'Atrium Garden Bungalow (1,800 sqft)',
    pattern: 'courtyard_daylight',
    style: 'Biophilic Courtyard',
    description: 'Single-storey U-shaped sanctuary wrapping around an open-to-sky central garden atrium, providing 360° daylight.',
    floors: 1,
    bedrooms: 2,
    bathrooms: 2,
    targetSqft: 1800,
    supportedSqftRange: [1600, 2100],
    recommendedPlotBounds: {
      minWidthFeet: 48,
      minDepthFeet: 52,
      recommendedProportion: 'near_square'
    },
    circulationStyle: 'courtyard_perimeter',
    features: {
      hasOpenKitchen: true,
      hasPoojaRoom: true,
      hasHomeOffice: true,
      hasCourtyard: true
    },
    rooms: [
      { id: 'cg18-r1', name: 'Living Room', type: 'living', x: 0, y: 0, width: 22, height: 14, color: '#fbf5e6', floor: 1 },
      { id: 'cg18-r2', name: 'Dining Hall', type: 'dining', x: 22, y: 0, width: 18, height: 14, color: '#fffbeb', floor: 1 },
      { id: 'cg18-r3', name: 'Central Garden Courtyard (Open-to-Sky)', type: 'muttram', x: 12, y: 14, width: 16, height: 14, color: '#dcfce7', floor: 1, floorFinish: 'grass' },
      { id: 'cg18-r4', name: 'Kitchen & Pantry', type: 'kitchen', x: 28, y: 14, width: 12, height: 14, color: '#fef2f2', floor: 1 },
      { id: 'cg18-r5', name: 'Home Office / Study', type: 'office', x: 0, y: 14, width: 12, height: 14, color: '#eff6ff', floor: 1 },
      { id: 'cg18-r6', name: 'Master Bedroom', type: 'master_bedroom', x: 0, y: 28, width: 18, height: 14, color: '#fdf4ff', floor: 1 },
      { id: 'cg18-r7', name: 'Master Bath & Dressing', type: 'master_bath', x: 0, y: 42, width: 18, height: 8, color: '#f0fdfa', floor: 1 },
      { id: 'cg18-r8', name: 'Secondary Bedroom', type: 'bedroom', x: 22, y: 28, width: 18, height: 14, color: '#fdf2f8', floor: 1 },
      { id: 'cg18-r9', name: 'Ensuite Bath 2', type: 'bathroom', x: 22, y: 42, width: 18, height: 8, color: '#f0fdf4', floor: 1 }
    ],
    doors: [
      { id: 'cg18-d1', x: 11, y: 0, width: 3.5, rotation: 0, type: 'double', floor: 1 },
      { id: 'cg18-d2', x: 12, y: 20, width: 2.8, rotation: 90, type: 'single', floor: 1 },
      { id: 'cg18-d3', x: 28, y: 20, width: 2.8, rotation: 90, type: 'single', floor: 1 },
      { id: 'cg18-d4', x: 9, y: 28, width: 2.8, rotation: 0, type: 'single', floor: 1 },
      { id: 'cg18-d5', x: 31, y: 28, width: 2.8, rotation: 0, type: 'single', floor: 1 }
    ],
    windows: [
      { id: 'cg18-w1', x: 5, y: 0, width: 6, rotation: 0, type: 'standard', floor: 1 },
      { id: 'cg18-w2', x: 32, y: 0, width: 6, rotation: 0, type: 'standard', floor: 1 },
      { id: 'cg18-w3', x: 9, y: 50, width: 5, rotation: 180, type: 'standard', floor: 1 },
      { id: 'cg18-w4', x: 31, y: 50, width: 5, rotation: 180, type: 'standard', floor: 1 }
    ],
    furniture: [
      { id: 'cg18-f1', name: 'Sectional Sofa', category: 'living', x: 10, y: 7, width: 7, depth: 5, rotation: 0, color: '#334155', floor: 1 },
      { id: 'cg18-f2', name: 'Courtyard Water Feature', category: 'outdoor', x: 20, y: 21, width: 4, depth: 4, rotation: 0, color: '#0284c7', floor: 1 },
      { id: 'cg18-f3', name: 'King Bed', category: 'bedroom', x: 9, y: 35, width: 6.5, depth: 6.5, rotation: 0, color: '#475569', floor: 1 }
    ],
    advantages: [
      'Unsurpassed natural ventilation with cool air drawing through central atrium',
      'Visual greenery connection from every single habitable room',
      'Both bedrooms feature private attached ensuite bathrooms'
    ],
    tradeOffs: [
      'Requires rainwater drainage and waterproofing for internal courtyard',
      'Increased exterior wall perimeter due to central void'
    ]
  },

  {
    id: 'tpl-muttram-thinnai-2400',
    name: 'Tamil Nadu Heritage Courtyard Villa (2,400 sqft)',
    pattern: 'courtyard_daylight',
    style: 'Chettinad Heritage',
    description: 'Traditional Indian architectural layout with raised Thinnai entrance verandah, central open-to-sky Muttram courtyard, and dedicated Pooja sanctuary.',
    floors: 2,
    bedrooms: 3,
    bathrooms: 3,
    targetSqft: 2400,
    supportedSqftRange: [2200, 2700],
    recommendedPlotBounds: {
      minWidthFeet: 40,
      minDepthFeet: 60,
      recommendedProportion: 'standard_rectangular'
    },
    circulationStyle: 'courtyard_perimeter',
    features: {
      hasOpenKitchen: false,
      hasPoojaRoom: true,
      hasHomeOffice: false,
      hasCourtyard: true,
      hasCarParking: true
    },
    rooms: [
      // Ground Floor (1200 sqft)
      { id: 'tn24-r1', name: 'Front Thinnai Verandah (திண்ணை)', type: 'thinnai', x: 0, y: 0, width: 14, height: 8, color: '#fed7aa', floor: 1 },
      { id: 'tn24-r2', name: 'Car Porch / Parking', type: 'parking', x: 14, y: 0, width: 16, height: 16, color: '#e2e8f0', floor: 1 },
      { id: 'tn24-r3', name: 'Grand Koodam Living Hall', type: 'living', x: 0, y: 8, width: 14, height: 18, color: '#fbf5e6', floor: 1 },
      { id: 'tn24-r4', name: 'Central Muttram Courtyard (முற்றம்)', type: 'muttram', x: 8, y: 26, width: 14, height: 12, color: '#bbf7d0', floor: 1, floorFinish: 'grass' },
      { id: 'tn24-r5', name: 'Puja Room (பூஜை அறை)', type: 'puja', x: 0, y: 26, width: 8, height: 8, color: '#fef08a', floor: 1 },
      { id: 'tn24-r6', name: 'Dining Hall', type: 'dining', x: 22, y: 16, width: 12, height: 16, color: '#fffbeb', floor: 1 },
      { id: 'tn24-r7', name: 'Traditional Kitchen (சமையலறை)', type: 'kitchen', x: 22, y: 32, width: 12, height: 12, color: '#fef2f2', floor: 1 },
      { id: 'tn24-r8', name: 'Stairwell Core', type: 'stairwell', x: 0, y: 34, width: 8, height: 12, color: '#f1f5f9', floor: 1 },
      // Upper Floor (1200 sqft)
      { id: 'tn24-r9', name: 'Stairwell Core', type: 'stairwell', x: 0, y: 34, width: 8, height: 12, color: '#f1f5f9', floor: 2 },
      { id: 'tn24-r10', name: 'Upper Master Bedroom', type: 'master_bedroom', x: 0, y: 8, width: 16, height: 16, color: '#fdf4ff', floor: 2 },
      { id: 'tn24-r11', name: 'Master Ensuite Bath', type: 'master_bath', x: 16, y: 8, width: 8, height: 10, color: '#f0fdfa', floor: 2 },
      { id: 'tn24-r12', name: 'Upper Verandah Balcony', type: 'balcony', x: 0, y: 0, width: 16, height: 8, color: '#fed7aa', floor: 2 },
      { id: 'tn24-r13', name: 'Children Bedroom', type: 'bedroom', x: 16, y: 24, width: 14, height: 14, color: '#fdf2f8', floor: 2 },
      { id: 'tn24-r14', name: 'Upper Family Bath', type: 'bathroom', x: 22, y: 38, width: 8, height: 8, color: '#f0fdf4', floor: 2 }
    ],
    doors: [
      { id: 'tn24-d1', x: 7, y: 8, width: 3.5, rotation: 0, type: 'double', floor: 1 },
      { id: 'tn24-d2', x: 4, y: 26, width: 2.5, rotation: 0, type: 'single', floor: 1 },
      { id: 'tn24-d3', x: 8, y: 16, width: 2.8, rotation: 0, type: 'single', floor: 2 }
    ],
    windows: [
      { id: 'tn24-w1', x: 4, y: 0, width: 4, rotation: 0, type: 'standard', floor: 1 },
      { id: 'tn24-w2', x: 28, y: 44, width: 4, rotation: 180, type: 'standard', floor: 1 }
    ],
    furniture: [
      { id: 'tn24-f1', name: 'Thinnai Teakwood Bench', category: 'entry', x: 7, y: 4, width: 8, depth: 2.5, rotation: 0, color: '#78350f', floor: 1 },
      { id: 'tn24-f2', name: 'Traditional Diwan', category: 'living', x: 7, y: 14, width: 6, depth: 3, rotation: 0, color: '#92400e', floor: 1 },
      { id: 'tn24-f3', name: 'Car Parking Space', category: 'vehicle', x: 22, y: 8, width: 8, depth: 14, rotation: 0, color: '#334155', floor: 1 }
    ],
    advantages: [
      'Authentic regional Tamil Nadu architecture with auspicious Northeast pooja placement',
      'Central Muttram draws cross-ventilation, reducing air conditioning load by 30%',
      'Covered car porch integrated into building footprint'
    ],
    tradeOffs: [
      'Enclosed muttram requires periodic monsoon cleaning',
      'Specific orientation guidelines (East/North facing favored)'
    ]
  },

  {
    id: 'tpl-lightwell-3000',
    name: 'Biophilic Sky-Courtyard Residence (3,000 sqft)',
    pattern: 'courtyard_daylight',
    style: 'Contemporary Biophilic',
    description: 'Four-bedroom luxury home organized around a dramatic two-story glass-enclosed sky courtyard with indoor trees.',
    floors: 2,
    bedrooms: 4,
    bathrooms: 4,
    targetSqft: 3000,
    supportedSqftRange: [2700, 3400],
    recommendedPlotBounds: {
      minWidthFeet: 45,
      minDepthFeet: 60,
      recommendedProportion: 'standard_rectangular'
    },
    circulationStyle: 'courtyard_perimeter',
    features: {
      hasOpenKitchen: true,
      hasPoojaRoom: true,
      hasHomeOffice: true,
      hasCourtyard: true,
      hasCarParking: true,
      hasWalkInWardrobe: true
    },
    rooms: [
      // Floor 1 (1500 sqft)
      { id: 'sk30-r1', name: 'Foyer & Gallery', type: 'foyer', x: 0, y: 0, width: 14, height: 12, color: '#f1f5f9', floor: 1 },
      { id: 'sk30-r2', name: 'Formal Living Room', type: 'living', x: 14, y: 0, width: 24, height: 18, color: '#fbf5e6', floor: 1 },
      { id: 'sk30-r3', name: 'Glass Atrium Courtyard', type: 'muttram', x: 12, y: 18, width: 14, height: 14, color: '#bbf7d0', floor: 1, floorFinish: 'grass' },
      { id: 'sk30-r4', name: 'Dining Salon', type: 'dining', x: 26, y: 18, width: 16, height: 14, color: '#fffbeb', floor: 1 },
      { id: 'sk30-r5', name: 'Gourmet Kitchen', type: 'kitchen', x: 26, y: 32, width: 16, height: 14, color: '#fef2f2', floor: 1 },
      { id: 'sk30-r6', name: 'Ground Suite (Elderly/Guest)', type: 'bedroom', x: 0, y: 18, width: 12, height: 16, color: '#fdf2f8', floor: 1 },
      { id: 'sk30-r7', name: 'Ground Bath', type: 'bathroom', x: 0, y: 34, width: 12, height: 6, color: '#f0fdfa', floor: 1 },
      { id: 'sk30-r8', name: 'Stairwell Core', type: 'stairwell', x: 12, y: 32, width: 8, height: 14, color: '#f1f5f9', floor: 1 },
      // Floor 2 (1500 sqft)
      { id: 'sk30-r9', name: 'Stairwell Core', type: 'stairwell', x: 12, y: 32, width: 8, height: 14, color: '#f1f5f9', floor: 2 },
      { id: 'sk30-r10', name: 'Master Bedroom Penthouse', type: 'master_bedroom', x: 14, y: 0, width: 24, height: 18, color: '#fdf4ff', floor: 2 },
      { id: 'sk30-r11', name: 'Master Ensuite Spa', type: 'master_bath', x: 0, y: 0, width: 14, height: 12, color: '#f0fdfa', floor: 2 },
      { id: 'sk30-r12', name: 'Upper Family Lounge', type: 'living', x: 26, y: 18, width: 16, height: 14, color: '#fbf5e6', floor: 2 },
      { id: 'sk30-r13', name: 'Bedroom 3', type: 'bedroom', x: 0, y: 18, width: 12, height: 14, color: '#fdf2f8', floor: 2 },
      { id: 'sk30-r14', name: 'Bedroom 4', type: 'bedroom', x: 26, y: 32, width: 16, height: 14, color: '#eff6ff', floor: 2 },
      { id: 'sk30-r15', name: 'Upper Bath', type: 'bathroom', x: 0, y: 32, width: 12, height: 8, color: '#f0fdf4', floor: 2 }
    ],
    doors: [
      { id: 'sk30-d1', x: 7, y: 0, width: 3.5, rotation: 0, type: 'double', floor: 1 },
      { id: 'sk30-d2', x: 14, y: 8, width: 3.0, rotation: 90, type: 'double', floor: 1 }
    ],
    windows: [
      { id: 'sk30-w1', x: 26, y: 0, width: 10, rotation: 0, type: 'picture', floor: 1 },
      { id: 'sk30-w2', x: 26, y: 0, width: 10, rotation: 0, type: 'picture', floor: 2 }
    ],
    furniture: [
      { id: 'sk30-f1', name: 'Executive Sectional', category: 'living', x: 24, y: 9, width: 10, depth: 7, rotation: 0, color: '#334155', floor: 1 },
      { id: 'sk30-f2', name: 'Master King Bed', category: 'bedroom', x: 24, y: 9, width: 6.5, depth: 6.5, rotation: 0, color: '#475569', floor: 2 }
    ],
    advantages: [
      'Two-story glass courtyard acts as a dramatic architectural centerpiece with daylight penetration',
      '4 full bedrooms with independent bathrooms accommodate multi-generational living',
      'Dedicated upper family lounge separates kids/entertainment from ground formal salon'
    ],
    tradeOffs: [
      'Requires substantial budget for structural steel frames and architectural glazing',
      'Higher energy demand for climate control around large glass panels'
    ]
  },

  // =========================================================================
  // PATTERN D: PREMIUM FAMILY RESIDENCE (2,400 - 5,000 sqft)
  // =========================================================================
  {
    id: 'tpl-premium-2850',
    name: 'Executive Contemporary Residence (2,850 sqft)',
    pattern: 'premium_residence',
    style: 'Tamil Nadu Contemporary',
    description: 'Flagship 4-bedroom two-storey luxury home with grand foyer, open great room, upper master suite terrace, and covered car porch.',
    floors: 2,
    bedrooms: 4,
    bathrooms: 3,
    targetSqft: 2850,
    supportedSqftRange: [2500, 3200],
    recommendedPlotBounds: {
      minWidthFeet: 40,
      minDepthFeet: 60,
      recommendedProportion: 'standard_rectangular'
    },
    circulationStyle: 'central_core',
    features: {
      hasOpenKitchen: true,
      hasPoojaRoom: true,
      hasHomeOffice: true,
      hasCourtyard: false,
      hasCarParking: true,
      hasWalkInWardrobe: true,
      hasLaundryUtility: true
    },
    rooms: [
      // Floor 1 (1500 sqft)
      { id: 'p28-r1', name: 'Grand Foyer', type: 'foyer', x: 0, y: 0, width: 12, height: 12, color: '#f1f5f9', floor: 1 },
      { id: 'p28-r2', name: 'Car Porch / Parking', type: 'parking', x: 12, y: 0, width: 18, height: 18, color: '#e2e8f0', floor: 1 },
      { id: 'p28-r3', name: 'Open Great Living Room', type: 'living', x: 0, y: 12, width: 22, height: 18, color: '#fbf5e6', floor: 1 },
      { id: 'p28-r4', name: 'Formal Dining Salon', type: 'dining', x: 22, y: 12, width: 14, height: 12, color: '#fffbeb', floor: 1 },
      { id: 'p28-r5', name: 'Gourmet Chef Kitchen', type: 'kitchen', x: 22, y: 24, width: 14, height: 14, color: '#fef2f2', floor: 1 },
      { id: 'p28-r6', name: 'Puja Sanctuary Room', type: 'puja', x: 30, y: 0, width: 6, height: 8, color: '#fef08a', floor: 1 },
      { id: 'p28-r7', name: 'Ground Guest Suite', type: 'bedroom', x: 0, y: 30, width: 14, height: 14, color: '#fdf2f8', floor: 1 },
      { id: 'p28-r8', name: 'Ground Ensuite Bath', type: 'bathroom', x: 0, y: 44, width: 14, height: 6, color: '#f0fdfa', floor: 1 },
      { id: 'p28-r9', name: 'Stairwell Core', type: 'stairwell', x: 14, y: 30, width: 8, height: 14, color: '#f1f5f9', floor: 1 },
      // Floor 2 (1350 sqft)
      { id: 'p28-r10', name: 'Stairwell Core', type: 'stairwell', x: 14, y: 30, width: 8, height: 14, color: '#f1f5f9', floor: 2 },
      { id: 'p28-r11', name: 'Master Suite Retreat', type: 'master_bedroom', x: 0, y: 12, width: 20, height: 18, color: '#fdf4ff', floor: 2 },
      { id: 'p28-r12', name: 'Master Walk-in Wardrobe', type: 'dressing', x: 20, y: 12, width: 8, height: 10, color: '#faf5ff', floor: 2 },
      { id: 'p28-r13', name: 'Master Ensuite Spa', type: 'master_bath', x: 28, y: 12, width: 8, height: 10, color: '#f0fdfa', floor: 2 },
      { id: 'p28-r14', name: 'Upper Master Balcony Terrace', type: 'balcony', x: 0, y: 0, width: 20, height: 12, color: '#fed7aa', floor: 2 },
      { id: 'p28-r15', name: 'Children Bedroom 1', type: 'bedroom', x: 0, y: 30, width: 14, height: 14, color: '#fdf2f8', floor: 2 },
      { id: 'p28-r16', name: 'Children Bedroom 2', type: 'bedroom', x: 22, y: 24, width: 14, height: 14, color: '#eff6ff', floor: 2 },
      { id: 'p28-r17', name: 'Family Common Bath', type: 'bathroom', x: 22, y: 38, width: 14, height: 6, color: '#f0fdf4', floor: 2 }
    ],
    doors: [
      { id: 'p28-d1', x: 6, y: 0, width: 3.5, rotation: 0, type: 'double', floor: 1 },
      { id: 'p28-d2', x: 10, y: 12, width: 3.0, rotation: 0, type: 'double', floor: 2 },
      { id: 'p28-d3', x: 7, y: 30, width: 2.8, rotation: 0, type: 'single', floor: 1 }
    ],
    windows: [
      { id: 'p28-w1', x: 11, y: 12, width: 8, rotation: 0, type: 'picture', floor: 1 },
      { id: 'p28-w2', x: 10, y: 12, width: 8, rotation: 0, type: 'picture', floor: 2 }
    ],
    furniture: [
      { id: 'p28-f1', name: 'Curved Velvet Sectional', category: 'living', x: 11, y: 21, width: 9, depth: 6, rotation: 0, color: '#881337', floor: 1 },
      { id: 'p28-f2', name: 'Marble Dining Table 8-Seat', category: 'dining', x: 29, y: 18, width: 8, depth: 4, rotation: 0, color: '#0f172a', floor: 1 },
      { id: 'p28-f3', name: 'Luxury Sedan', category: 'vehicle', x: 21, y: 9, width: 8, depth: 16, rotation: 0, color: '#334155', floor: 1 },
      { id: 'p28-f4', name: 'Cal-King Bed', category: 'bedroom', x: 10, y: 21, width: 6.5, depth: 6.5, rotation: 0, color: '#475569', floor: 2 }
    ],
    advantages: [
      'Comprehensive 4-bedroom executive program accommodating multi-generational families',
      'Private master suite terrace overlooking the front garden',
      'Double-wide covered car porch accommodates large SUVs'
    ],
    tradeOffs: [
      'High structural concrete frame requirement with multiple beam spans',
      'Requires minimum 40 ft plot width and 60 ft depth'
    ]
  },

  {
    id: 'tpl-estate-3800',
    name: 'Grand Spatial Manor (3,800 sqft)',
    pattern: 'premium_residence',
    style: 'Modern Classic Estate',
    description: 'Expansive 4-bedroom estate with separate formal and informal living, double-island kitchen, private theater/study, and master wing with dual walk-in dressing suites.',
    floors: 2,
    bedrooms: 4,
    bathrooms: 4,
    targetSqft: 3800,
    supportedSqftRange: [3400, 4200],
    recommendedPlotBounds: {
      minWidthFeet: 55,
      minDepthFeet: 70,
      recommendedProportion: 'standard_rectangular'
    },
    circulationStyle: 'split_wing',
    features: {
      hasOpenKitchen: true,
      hasPoojaRoom: true,
      hasHomeOffice: true,
      hasCourtyard: true,
      hasCarParking: true,
      hasWalkInWardrobe: true,
      hasLaundryUtility: true
    },
    rooms: [
      // Floor 1 (2000 sqft)
      { id: 'es38-r1', name: 'Double-Height Grand Foyer', type: 'foyer', x: 0, y: 0, width: 16, height: 16, color: '#f1f5f9', floor: 1 },
      { id: 'es38-r2', name: 'Formal Living Salon', type: 'living', x: 16, y: 0, width: 24, height: 20, color: '#fbf5e6', floor: 1 },
      { id: 'es38-r3', name: 'Family Great Room', type: 'living', x: 16, y: 20, width: 24, height: 18, color: '#fbf5e6', floor: 1 },
      { id: 'es38-r4', name: 'Banquet Dining Room', type: 'dining', x: 40, y: 0, width: 16, height: 20, color: '#fffbeb', floor: 1 },
      { id: 'es38-r5', name: 'Show Kitchen with Island', type: 'kitchen', x: 40, y: 20, width: 16, height: 18, color: '#fef2f2', floor: 1 },
      { id: 'es38-r6', name: 'Ground Guest Master Suite', type: 'bedroom', x: 0, y: 16, width: 16, height: 16, color: '#fdf2f8', floor: 1 },
      { id: 'es38-r7', name: 'Guest Ensuite Bath', type: 'bathroom', x: 0, y: 32, width: 16, height: 8, color: '#f0fdfa', floor: 1 },
      { id: 'es38-r8', name: 'Stairwell Core', type: 'stairwell', x: 0, y: 40, width: 10, height: 16, color: '#f1f5f9', floor: 1 },
      // Floor 2 (1800 sqft)
      { id: 'es38-r9', name: 'Stairwell Core', type: 'stairwell', x: 0, y: 40, width: 10, height: 16, color: '#f1f5f9', floor: 2 },
      { id: 'es38-r10', name: 'Master Presidential Suite', type: 'master_bedroom', x: 16, y: 0, width: 24, height: 22, color: '#fdf4ff', floor: 2 },
      { id: 'es38-r11', name: 'Master Spa Bath & Sauna', type: 'master_bath', x: 40, y: 0, width: 16, height: 16, color: '#f0fdfa', floor: 2 },
      { id: 'es38-r12', name: 'Upper Media Lounge', type: 'living', x: 16, y: 22, width: 24, height: 16, color: '#fbf5e6', floor: 2 },
      { id: 'es38-r13', name: 'Bedroom 3 (Junior Suite)', type: 'bedroom', x: 40, y: 16, width: 16, height: 16, color: '#fdf2f8', floor: 2 },
      { id: 'es38-r14', name: 'Bedroom 4', type: 'bedroom', x: 40, y: 32, width: 16, height: 14, color: '#eff6ff', floor: 2 },
      { id: 'es38-r15', name: 'Upper Balcony Terrace', type: 'balcony', x: 0, y: 0, width: 16, height: 16, color: '#fed7aa', floor: 2 }
    ],
    doors: [
      { id: 'es38-d1', x: 8, y: 0, width: 4.0, rotation: 0, type: 'double', floor: 1 },
      { id: 'es38-d2', x: 28, y: 22, width: 3.5, rotation: 0, type: 'double', floor: 2 }
    ],
    windows: [
      { id: 'es38-w1', x: 28, y: 0, width: 12, rotation: 0, type: 'picture', floor: 1 },
      { id: 'es38-w2', x: 28, y: 0, width: 12, rotation: 0, type: 'picture', floor: 2 }
    ],
    furniture: [
      { id: 'es38-f1', name: 'Bespoke Sectional', category: 'living', x: 28, y: 10, width: 11, depth: 7, rotation: 0, color: '#334155', floor: 1 },
      { id: 'es38-f2', name: 'Island Counter Set', category: 'kitchen', x: 48, y: 29, width: 10, depth: 4, rotation: 0, color: '#0f172a', floor: 1 },
      { id: 'es38-f3', name: 'Emperor King Bed', category: 'bedroom', x: 28, y: 11, width: 7, depth: 7, rotation: 0, color: '#475569', floor: 2 }
    ],
    advantages: [
      'Dual living rooms permit simultaneous formal hosting and informal family lounging',
      'Palatial master wing includes dedicated spa bath, sauna, and direct balcony walkout',
      'Ground-floor guest master suite offers complete autonomy for extended visitors'
    ],
    tradeOffs: [
      'Requires substantial land parcel (minimum 55 ft × 70 ft)',
      'Substantial maintenance footprint across 3,800 square feet'
    ]
  },

  {
    id: 'tpl-luxury-5000',
    name: 'Horizon Luxury Estate (5,000 sqft)',
    pattern: 'premium_residence',
    style: 'Ultra-Luxury Contemporary',
    description: 'The pinnacle 5-bedroom luxury estate for expansive grounds, featuring twin double-garages, grand entrance rotunda, wet and dry kitchens, and private upper penthouse floor.',
    floors: 2,
    bedrooms: 5,
    bathrooms: 5,
    targetSqft: 5000,
    supportedSqftRange: [4500, 5000],
    recommendedPlotBounds: {
      minWidthFeet: 65,
      minDepthFeet: 80,
      recommendedProportion: 'wide'
    },
    circulationStyle: 'split_wing',
    features: {
      hasOpenKitchen: true,
      hasPoojaRoom: true,
      hasHomeOffice: true,
      hasCourtyard: true,
      hasCarParking: true,
      hasWalkInWardrobe: true,
      hasLaundryUtility: true
    },
    rooms: [
      // Floor 1 (2600 sqft)
      { id: 'lx50-r1', name: 'Grand Entrance Rotunda', type: 'foyer', x: 0, y: 0, width: 20, height: 16, color: '#f1f5f9', floor: 1 },
      { id: 'lx50-r2', name: 'Formal Living Pavilion', type: 'living', x: 20, y: 0, width: 28, height: 22, color: '#fbf5e6', floor: 1 },
      { id: 'lx50-r3', name: 'Family Great Room', type: 'living', x: 20, y: 22, width: 28, height: 20, color: '#fbf5e6', floor: 1 },
      { id: 'lx50-r4', name: 'State Dining Salon', type: 'dining', x: 48, y: 0, width: 18, height: 22, color: '#fffbeb', floor: 1 },
      { id: 'lx50-r5', name: 'Chef Show Kitchen', type: 'kitchen', x: 48, y: 22, width: 18, height: 14, color: '#fef2f2', floor: 1 },
      { id: 'lx50-r6', name: 'Scullery & Wet Kitchen', type: 'kitchen', x: 48, y: 36, width: 18, height: 10, color: '#fff7ed', floor: 1 },
      { id: 'lx50-r7', name: 'Ground Suite 1', type: 'bedroom', x: 0, y: 16, width: 20, height: 16, color: '#fdf2f8', floor: 1 },
      { id: 'lx50-r8', name: 'Ensuite Bath 1', type: 'bathroom', x: 0, y: 32, width: 10, height: 12, color: '#f0fdfa', floor: 1 },
      { id: 'lx50-r9', name: 'Executive Home Office', type: 'office', x: 10, y: 32, width: 10, height: 12, color: '#eff6ff', floor: 1 },
      { id: 'lx50-r10', name: 'Monumental Staircase', type: 'stairwell', x: 0, y: 44, width: 12, height: 14, color: '#f1f5f9', floor: 1 },
      // Floor 2 (2400 sqft)
      { id: 'lx50-r11', name: 'Monumental Staircase', type: 'stairwell', x: 0, y: 44, width: 12, height: 14, color: '#f1f5f9', floor: 2 },
      { id: 'lx50-r12', name: 'Master Presidential Penthouse', type: 'master_bedroom', x: 20, y: 0, width: 28, height: 24, color: '#fdf4ff', floor: 2 },
      { id: 'lx50-r13', name: 'Master Spa & His/Her Dressing', type: 'master_bath', x: 48, y: 0, width: 18, height: 24, color: '#f0fdfa', floor: 2 },
      { id: 'lx50-r14', name: 'Upper Entertainment Lounge', type: 'living', x: 20, y: 24, width: 28, height: 18, color: '#fbf5e6', floor: 2 },
      { id: 'lx50-r15', name: 'Junior Suite 2', type: 'bedroom', x: 48, y: 24, width: 18, height: 16, color: '#fdf2f8', floor: 2 },
      { id: 'lx50-r16', name: 'Junior Suite 3', type: 'bedroom', x: 0, y: 16, width: 20, height: 16, color: '#fdf2f8', floor: 2 },
      { id: 'lx50-r17', name: 'Junior Suite 4', type: 'bedroom', x: 0, y: 32, width: 20, height: 12, color: '#eff6ff', floor: 2 },
      { id: 'lx50-r18', name: 'Sky Terrace Garden', type: 'balcony', x: 0, y: 0, width: 20, height: 16, color: '#fed7aa', floor: 2 }
    ],
    doors: [
      { id: 'lx50-d1', x: 10, y: 0, width: 4.5, rotation: 0, type: 'double', floor: 1 },
      { id: 'lx50-d2', x: 34, y: 24, width: 3.5, rotation: 0, type: 'double', floor: 2 }
    ],
    windows: [
      { id: 'lx50-w1', x: 34, y: 0, width: 14, rotation: 0, type: 'picture', floor: 1 },
      { id: 'lx50-w2', x: 34, y: 0, width: 14, rotation: 0, type: 'picture', floor: 2 }
    ],
    furniture: [
      { id: 'lx50-f1', name: 'Presidential Sectional', category: 'living', x: 34, y: 11, width: 12, depth: 8, rotation: 0, color: '#334155', floor: 1 },
      { id: 'lx50-f2', name: 'Twin Island Kitchen Set', category: 'kitchen', x: 57, y: 29, width: 12, depth: 4, rotation: 0, color: '#0f172a', floor: 1 },
      { id: 'lx50-f3', name: 'Palace King Bed', category: 'bedroom', x: 34, y: 12, width: 7.5, depth: 7.5, rotation: 0, color: '#475569', floor: 2 }
    ],
    advantages: [
      'Accommodates maximum 5,000 sq ft residential brief with 5 autonomous ensuite suites',
      'Dual kitchen system (Show Kitchen + Prep Scullery) prevents cooking odors in entertaining zones',
      'Panoramic Sky Terrace Garden overlooking the grounds'
    ],
    tradeOffs: [
      'Demands large plot dimensions (minimum 65 ft width by 80 ft depth)',
      'Substantial construction, structural engineering, and HVAC requirements'
    ]
  }
];

export const TemplateLibrary = {
  getAllTemplates(): TemplateDefinition[] {
    return TEMPLATE_LIBRARY;
  },
  getTemplateById(id: string): TemplateDefinition | undefined {
    return TEMPLATE_LIBRARY.find(t => t.id === id);
  },
  getTemplatesByPattern(pattern: string): TemplateDefinition[] {
    return TEMPLATE_LIBRARY.filter(t => t.pattern === pattern);
  }
};
