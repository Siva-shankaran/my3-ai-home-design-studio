export type RoomType = 
  | 'living' 
  | 'bedroom' 
  | 'master_bedroom' 
  | 'bathroom' 
  | 'master_bath' 
  | 'kitchen' 
  | 'dining' 
  | 'garage' 
  | 'patio' 
  | 'office' 
  | 'hallway' 
  | 'closet'
  | 'stairwell'
  | 'laundry'
  | 'balcony'
  | 'foyer'
  | 'thinnai'       // Traditional Tamil Nadu front verandah / seating portico
  | 'muttram'       // Traditional central open-to-sky courtyard
  | 'puja'          // Prayer / sacred sanctuary room
  | 'parking'       // Car porch / covered parking (Images 1, 2, 3)
  | 'dressing'      // Walk-in dressing closet
  | 'wash'          // Utility wash / service area
  | 'utility';

export interface Room {
  id: string;
  name: string;
  nameTamil?: string;
  type: RoomType;
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  floor: number;
  ceilingHeight?: number;
  isLoadBearing?: boolean;
  egressCompliant?: boolean;
  floorFinish?: string;
  wallColor?: string;
  wallFinish?: string;
  rugPattern?: string;
}

export interface Wall {
  id: string;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  thickness: number;
  type: 'exterior' | 'interior';
  floor?: number;
  isLoadBearing?: boolean;
}

export interface Door {
  id: string;
  x: number;
  y: number;
  width: number;
  rotation: number;
  type: 'single' | 'double' | 'sliding';
  floor?: number;
  roomId?: string;
}

export interface WindowItem {
  id: string;
  x: number;
  y: number;
  width: number;
  rotation: number;
  type: 'standard' | 'bay' | 'picture';
  floor?: number;
  isEgress?: boolean;
}

export interface FurnitureItem {
  id: string;
  name: string;
  category: 'living' | 'bedroom' | 'dining' | 'kitchen' | 'office' | 'bath' | 'outdoor' | 'entry' | 'laundry' | 'fixture' | 'stair' | 'vehicle';
  x: number;
  y: number;
  width: number;
  depth: number;
  rotation: number;
  color: string;
  floor?: number;
  custom?: boolean;
  isAnimated?: boolean;
  fabricColor?: string;
  material?: string;
}

export interface Column {
  id: string;
  x: number;
  y: number;
  width: number; // e.g., 0.75 ft (9 inches / 230mm)
  depth: number; // e.g., 1.25 ft (15 inches / 380mm)
  floor?: number;
  reinforcementDetails?: string; // e.g. "4-T16 + 2-T12, 8mm ties @ 150mm c/c"
  label?: string; // e.g. "C1", "C2"
}

export interface RenderImage {
  id: string;
  url: string;
  prompt: string;
  style: string;
  floor?: number;
  timestamp: string;
}

export interface StructuralMetrics {
  totalGrossSqft: number;
  floor1Sqft: number;
  floor2Sqft: number;
  exteriorWallPerimeterFeet: number;
  wetWallAlignmentScore: number; // 0-100%
  ircEgressCompliant: boolean;
  estimatedBuildingCostUsd: number;
  recommendedBeamSpans: string[];
}

export type TamilNaduDistrict = 
  | 'Chennai' 
  | 'Coimbatore' 
  | 'Madurai' 
  | 'Tiruchirappalli' 
  | 'Salem' 
  | 'Tirunelveli' 
  | 'Kanchipuram' 
  | 'Chengalpattu' 
  | 'Vellore' 
  | 'Erode' 
  | 'Tiruppur' 
  | 'Thanjavur';

export type PlanningAuthority = 'CMDA' | 'DTCP' | 'Local_Body_Panchayat';

export interface SiteProfile {
  state: 'Tamil Nadu' | 'Other';
  district: TamilNaduDistrict | string;
  planningAuthority: PlanningAuthority;
  plotWidth: number; // in feet
  plotDepth: number; // in feet
  plotAreaSqft: number;
  plotAreaCents: number; // 1 Cent = 435.6 sq ft
  plotAreaGrounds: number; // 1 Ground = 2400 sq ft
  roadWidthFeet: number; // Road width in front of plot (affects TNCDBR FSI and setbacks)
  roadFacingSide: 'North' | 'South' | 'East' | 'West';
  siteSlope?: 'Flat' | 'Gentle' | 'Steep';
  waterLoggingHistory?: boolean;
  soilType?: 'Red_Gravel' | 'Marine_Clay' | 'Black_Cotton' | 'Weathered_Rock' | 'Sandy_Loam';
  frontSetbackRequiredFeet?: number;
  rearSetbackRequiredFeet?: number;
  sideSetbackRequiredFeet?: number;
  permittedFSI?: number;
  maxPlotCoveragePercent?: number;
}

export type RuleStatus = 
  | 'PASS' 
  | 'POTENTIAL_ISSUE' 
  | 'REQUIRES_PROFESSIONAL_VERIFICATION' 
  | 'MISSING_DATA';

export interface RuleCheckResult {
  ruleId: string;
  ruleName: string;
  standard: 'TNCDBR_2019' | 'NBC_2016' | 'IRC_2024';
  clause: string;
  officialSource: string;
  status: RuleStatus;
  requiredValue?: string | number;
  actualValue?: string | number;
  explanation: string;
  remedialSuggestion?: string;
}

export interface SoilLayer {
  depthFromMeters: number;
  depthToMeters: number;
  strataDescription: string;
  sptNValue?: number;
}

export interface GeotechnicalData {
  hasReport: boolean;
  reportDocumentName?: string;
  boreholeDepthMeters?: number;
  groundwaterDepthMeters?: number;
  safeBearingCapacityKpa?: number; // e.g. 150 kN/m²
  soilLayers?: SoilLayer[];
  geotechnicalConsultantNotes?: string;
  isVerifiedByEngineer: boolean;
}

export type FoundationType = 
  | 'isolated_footing' 
  | 'combined_footing' 
  | 'raft_foundation' 
  | 'pile_foundation';

export interface FoundationConcept {
  type: FoundationType;
  title: string;
  description: string;
  recommendedDepthMeters: number;
  suitabilityScore: number; // 0-100
  plinthBeamSize: string; // e.g. "230 x 380 mm (9\" x 15\")"
  missingDataChecklist: string[];
  tradeOffs: string[];
  constructionPrecaution: string;
}

export interface TamilNaduCostEstimate {
  plinthAreaSqft: number;
  superBuiltupAreaSqft: number;
  ratePerSqftInr: number;
  totalCostInr: number;
  district: string;
  materialsBreakdown: {
    cementBags: number;
    steelKg: number;
    mSandCft: number;
    coarseAggregateCft: number;
    bricksNos: number;
  };
  costComponentSplit: {
    substructureFoundationInr: number;
    rccStructureInr: number;
    brickworkPlasteringInr: number;
    flooringFinishesInr: number;
    plumbingElectricalInr: number;
    paintingFixturesInr: number;
  };
}

export interface ProfessionalReviewRecord {
  id: string;
  status: 'preliminary_software_check' | 'pending_structural_review' | 'engineer_approved' | 'architect_verified' | 'reviewed';
  reviewerName?: string;
  registrationNumber?: string; // Council of Architecture (CA/XXXX) or TN RSE Grade
  registeredEngineerName?: string;
  licenseNumber?: string;
  consultancyFirm?: string;
  role?: 'structural_engineer' | 'architect';
  notes?: string;
  reviewedAt?: string;
  missingInformationChecklist: string[];
}

export interface RoomCamera {
  id: string;
  name: string;
  level: number;
  position: [number, number]; // [x, y] coordinates in feet
  fov: number;
  active?: boolean;
}

export type MaketFootprintShape = 'square' | 'l_shape' | 'u_shape' | 't_shape' | 'h_shape' | 'plus_shape' | 'z_shape';

export interface MaketRoomRequirement {
  id: string;
  category: string;
  label: string;
  count: number;
  targetSqft?: number;
  iconName?: string;
  isOutdoor?: boolean;
  required?: boolean;
}

export interface MaketGeneratorParams {
  floorCount: 1 | 2 | 3;
  targetSqft: number;
  shape: MaketFootprintShape;
  rooms: MaketRoomRequirement[];
  frontDoorWall: 'front' | 'back' | 'left' | 'right';
  frontDoorAlignment: 'start' | 'center' | 'end';
  style: 'Coastal' | 'Modern' | 'Minimalist' | 'Scandinavian' | 'Contemporary';
  projectName?: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  sqft: number;
  floors: number;
  status: 'draft' | 'in_progress' | 'rendered';
  createdAt: string;
  updatedAt: string;
  rooms: Room[];
  walls: Wall[];
  doors: Door[];
  windows: WindowItem[];
  furniture: FurnitureItem[];
  columns?: Column[];
  cameras?: RoomCamera[];
  renders: RenderImage[];
  style: string;
  structuralMetrics?: StructuralMetrics;
  siteProfile?: SiteProfile;
  geotechnicalData?: GeotechnicalData;
  foundationConcept?: FoundationConcept;
  ruleCheckResults?: RuleCheckResult[];
  tnCostEstimate?: TamilNaduCostEstimate;
  professionalReview?: ProfessionalReviewRecord;
  language?: 'en' | 'ta';
}

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  role: 'homeowner' | 'architect' | 'civil_engineer' | 'builder' | 'realtor';
  credits: number;
  plan: 'Starter' | 'Pro' | 'Studio';
  companyName?: string;
  licenseNumber?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  thinking?: string;
  timestamp: string;
  appliedChanges?: string[];
  structuralNotes?: string[];
  ruleAlerts?: string[];
}

export interface EmailDispatchPayload {
  toEmail: string;
  recipientName: string;
  subject: string;
  projectName: string;
  blueprintPdfUrl?: string;
  dxfUrl?: string;
  renderPreviews?: string[];
  structuralSummary?: string;
  tnComplianceSummary?: string;
}

export interface EngineerConsultationRequest {
  id: string;
  projectId: string;
  clientName: string;
  clientEmail: string;
  question: string;
  category: 'structural_beam' | 'load_bearing_wall' | 'permit_egress' | 'foundation' | 'plumbing_stack';
  status: 'pending' | 'answered';
  aiEngineerResponse?: string;
  createdAt: string;
}

// v2 Unified Architectural Architecture & Schemas
export * from '../engine/intake/schemas';
export * from './project';

