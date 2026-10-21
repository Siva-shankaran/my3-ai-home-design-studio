export type SheetDiscipline = 'GENERAL' | 'ARCHITECTURAL' | 'STRUCTURAL' | 'SERVICES' | 'QUANTITIES';

export interface SheetDefinition {
  id: string;
  sheetCode: string;
  title: string;
  discipline: SheetDiscipline;
  scale: string;
  description: string;
  drawingNumber: string;
}

export const STANDARD_ISSUE_SHEETS: SheetDefinition[] = [
  {
    id: 'cover_01',
    sheetCode: 'COVER-01',
    title: 'PROJECT COVER & DRAWING INDEX',
    discipline: 'GENERAL',
    scale: 'N.T.S.',
    description: 'Project metadata, key building data, site zoning index, and issue register',
    drawingNumber: 'MY3-GEN-001',
  },
  {
    id: 'a_001',
    sheetCode: 'A-001',
    title: 'SITE PLAN & SETBACK VERIFICATION',
    discipline: 'ARCHITECTURAL',
    scale: '1:200',
    description: 'Plot boundaries, regulatory setbacks, road access, and buildable envelope',
    drawingNumber: 'MY3-ARC-001',
  },
  {
    id: 'a_101',
    sheetCode: 'A-101',
    title: 'GROUND FLOOR PLAN — FURNISHED',
    discipline: 'ARCHITECTURAL',
    scale: '1:100',
    description: 'Ground floor room layout, wall thicknesses, doors, windows, and area tags',
    drawingNumber: 'MY3-ARC-101',
  },
  {
    id: 'a_102',
    sheetCode: 'A-102',
    title: 'FIRST FLOOR PLAN — FURNISHED',
    discipline: 'ARCHITECTURAL',
    scale: '1:100',
    description: 'First floor layout, upper bedrooms, family lounge, balconies, and stair opening',
    drawingNumber: 'MY3-ARC-102',
  },
  {
    id: 'a_103',
    sheetCode: 'A-103',
    title: 'TERRACE & ROOF DRAINAGE PLAN',
    discipline: 'ARCHITECTURAL',
    scale: '1:100',
    description: 'Stair headroom, overhead water tank platform, solar area, and rainwater slopes',
    drawingNumber: 'MY3-ARC-103',
  },
  {
    id: 'a_201',
    sheetCode: 'A-201',
    title: 'FRONT & RIGHT ELEVATIONS',
    discipline: 'ARCHITECTURAL',
    scale: '1:100',
    description: 'Front facade architectural elevation, plinth levels, sill, lintel, and parapet heights',
    drawingNumber: 'MY3-ARC-201',
  },
  {
    id: 'a_202',
    sheetCode: 'A-202',
    title: 'REAR & LEFT ELEVATIONS',
    discipline: 'ARCHITECTURAL',
    scale: '1:100',
    description: 'Rear and side elevations showing fenestration and vertical rainwater shafts',
    drawingNumber: 'MY3-ARC-202',
  },
  {
    id: 'a_301',
    sheetCode: 'A-301',
    title: 'LONGITUDINAL BUILDING SECTION A-A\'',
    discipline: 'ARCHITECTURAL',
    scale: '1:50',
    description: 'Cut through living and vertical circulation showing floor heights and slab levels',
    drawingNumber: 'MY3-ARC-301',
  },
  {
    id: 'a_401',
    sheetCode: 'A-401',
    title: 'DOOR, WINDOW & JOINERY SCHEDULE',
    discipline: 'ARCHITECTURAL',
    scale: 'N.T.S.',
    description: 'Schedule of joinery tags D1, D2, W1, W2, V1, dimensions, sill/lintel, and materials',
    drawingNumber: 'MY3-ARC-401',
  },
  {
    id: 's_101',
    sheetCode: 'S-101',
    title: 'FOUNDATION & FOOTING LAYOUT',
    discipline: 'STRUCTURAL',
    scale: '1:100',
    description: 'Column centerlines, isolated footing sizes F1/F2, and excavation grid dimensions',
    drawingNumber: 'MY3-STR-101',
  },
  {
    id: 's_102',
    sheetCode: 'S-102',
    title: 'COLUMN GRID & PLINTH BEAM PLAN',
    discipline: 'STRUCTURAL',
    scale: '1:100',
    description: 'Structural grid axes A-E / 1-5, column marks C1-C12, and plinth tie beams PB1',
    drawingNumber: 'MY3-STR-102',
  },
  {
    id: 's_103',
    sheetCode: 'S-103',
    title: 'TYPICAL FOOTING & REBAR DETAILS',
    discipline: 'STRUCTURAL',
    scale: '1:25',
    description: 'Trapezoidal footing cross section, PCC bed 1:4:8, rebar mesh, and column lap splice',
    drawingNumber: 'MY3-STR-103',
  },
  {
    id: 'm_101',
    sheetCode: 'M-101',
    title: 'ELECTRICAL & LIGHTING CONCEPT',
    discipline: 'SERVICES',
    scale: '1:100',
    description: 'Switchboard positions, fan hooks, 6A/16A sockets, AC conduit points, and DB location',
    drawingNumber: 'MY3-MEP-101',
  },
  {
    id: 'p_101',
    sheetCode: 'P-101',
    title: 'PLUMBING & WET-CORE DRAINAGE',
    discipline: 'SERVICES',
    scale: '1:100',
    description: 'Soil and waste vertical stacks, toilet trap connections, and chamber routing',
    drawingNumber: 'MY3-MEP-201',
  },
  {
    id: 'q_101',
    sheetCode: 'Q-101',
    title: 'STRUCTURAL BOQ & MATERIAL SUMMARY',
    discipline: 'QUANTITIES',
    scale: 'N.T.S.',
    description: 'Bill of quantities: concrete m³, rebar steel kg by diameter, cement bags, and cost index',
    drawingNumber: 'MY3-QS-001',
  },
];

export interface ExportProjectMeta {
  projectName: string;
  clientName: string;
  location: string;
  projectNumber: string;
  revision: string;
  date: string;
  architectNote?: string;
}

export type PaperSize = 'A3' | 'A1';
export type ExportFormat = 'PDF_A3' | 'PDF_A1' | 'DXF' | 'SVG' | 'ZIP';
