export type Language = 'en' | 'ta';

export interface Translations {
  projects: string;
  cadCanvas: string;
  studio3d: string;
  clientPitch: string;
  credits: string;
  level1: string;
  level2: string;
  feet: string;
  meters: string;
  switchLanguage: string;
  languagePopTitle: string;
  languagePopDesc: string;
  languagePopAction: string;
  presentationMode: string;
  cadMode: string;
  sideBySideMode: string;
  singleFloorMode: string;
  // Room names
  roomLiving: string;
  roomMasterBedroom: string;
  roomBedroom: string;
  roomKitchen: string;
  roomDining: string;
  roomBathroom: string;
  roomMasterBath: string;
  roomPuja: string;
  roomThinnai: string;
  roomMuttram: string;
  roomStairwell: string;
  roomBalcony: string;
  roomParking: string;
  roomDressing: string;
  roomWash: string;
  roomFoyer: string;
  roomOffice: string;
  // Engineer Layer Controls
  blueprint: string;
  dimensions: string;
  furniture: string;
  columns: string;
  labels: string;
  groundFloor: string;
  firstFloor: string;
  bothFloors: string;
  engineerView: string;
  exportPdf: string;
  exportSvg: string;
  exportPng: string;
}

export const translations: Record<Language, Translations> = {
  en: {
    projects: 'Projects',
    cadCanvas: '2D Presentation CAD',
    studio3d: '3D WebGL Studio',
    clientPitch: 'Client Presentation Pitch',
    credits: 'Credits',
    level1: 'Level 1 (Ground)',
    level2: 'Level 2 (First)',
    feet: "FEET (')",
    meters: 'METERS (m)',
    switchLanguage: 'English / தமிழ்',
    languagePopTitle: '🌐 Switch to Tamil (தமிழ்) anytime!',
    languagePopDesc: 'You can easily switch the entire platform between English and தமிழ் at any moment from this button.',
    languagePopAction: 'Got it!',
    presentationMode: 'Realistic Architectural Color',
    cadMode: 'Technical CAD Blueprint',
    sideBySideMode: 'Multi-Floor Side-by-Side',
    singleFloorMode: 'Single Floor View',
    roomLiving: 'Living Room',
    roomMasterBedroom: 'Master Bedroom',
    roomBedroom: 'Bedroom',
    roomKitchen: 'Kitchen',
    roomDining: 'Dining',
    roomBathroom: 'Toilet',
    roomMasterBath: 'Master Bath',
    roomPuja: 'Puja Shrine',
    roomThinnai: 'Thinnai Verandah',
    roomMuttram: 'Courtyard',
    roomStairwell: 'Staircase',
    roomBalcony: 'Balcony',
    roomParking: 'Car Porch',
    roomDressing: 'Dressing',
    roomWash: 'Wash Area',
    roomFoyer: 'Foyer',
    roomOffice: 'Study / Office',
    blueprint: 'Walls / Structure',
    dimensions: 'Dimensions',
    furniture: 'Furniture',
    columns: 'RCC Columns / Grid',
    labels: 'Room Labels',
    groundFloor: 'Ground Floor',
    firstFloor: 'First Floor',
    bothFloors: 'Side-by-Side',
    engineerView: 'Engineers Layer Controller',
    exportPdf: 'Architectural Sheet (PDF)',
    exportSvg: 'Vector CAD (SVG)',
    exportPng: '300 DPI Render (PNG)'
  },
  ta: {
    projects: 'திட்டங்கள்',
    cadCanvas: '2D கட்டிட வரைபடம்',
    studio3d: '3D நேரடி தோற்றம்',
    clientPitch: 'வாடிக்கையாளர் திட்ட விளக்கம்',
    credits: 'மதிப்புகள்',
    level1: 'தரைத்தளம் (Level 1)',
    level2: 'முதல் தளம் (Level 2)',
    feet: "அடி (')",
    meters: 'மீட்டர் (m)',
    switchLanguage: 'தமிழ் / English',
    languagePopTitle: '🌐 மொழியை எளிதாக மாற்றலாம்!',
    languagePopDesc: 'விருப்பப்படி ஆங்கிலம் மற்றும் தமிழ் (தமிழ் கட்டிடக்கலை பெயர்கள்) இடையே எப்போது வேண்டுமானாலும் மாறலாம்.',
    languagePopAction: 'புரிந்தது!',
    presentationMode: 'வண்ணமயமான கட்டிட வடிவமைப்பு',
    cadMode: 'தொழில்நுட்ப ப்ளூபிரிண்ட்',
    sideBySideMode: 'இரு தளங்கள் அருகருகே',
    singleFloorMode: 'தனித் தளம் தோற்றம்',
    roomLiving: 'கூடம்',
    roomMasterBedroom: 'முதன்மையான படுக்கையறை',
    roomBedroom: 'படுக்கையறை',
    roomKitchen: 'சமையலறை',
    roomDining: 'சாப்பாட்டு கூடம்',
    roomBathroom: 'கழிப்பறை',
    roomMasterBath: 'இணைக்கப்பட்ட குளியலறை',
    roomPuja: 'பூஜை அறை',
    roomThinnai: 'திண்ணை',
    roomMuttram: 'முற்றம்',
    roomStairwell: 'படிக்கட்டு',
    roomBalcony: 'மாடி பால்கனி',
    roomParking: 'கார் போர்ட்டிகோ',
    roomDressing: 'உடை மாற்றும் அறை',
    roomWash: 'கழுவும் இடம்',
    roomFoyer: 'முகப்பு',
    roomOffice: 'படிக்கும் அறை',
    blueprint: 'கட்டிட சுவர்கள்',
    dimensions: 'அளவீடுகள்',
    furniture: 'மரச்சாமான்கள்',
    columns: 'RCC தூண்கள்',
    labels: 'அறை பெயர்கள்',
    groundFloor: 'தரைத்தளம்',
    firstFloor: 'முதல் தளம்',
    bothFloors: 'இரு தளங்கள்',
    engineerView: 'பொறியாளர் அடுக்கு கட்டுப்பாடுகள்',
    exportPdf: 'கட்டிட வரைபட தாள் (PDF)',
    exportSvg: 'வெக்டர் வரைபடம் (SVG)',
    exportPng: 'உயர் படக்காட்சி (PNG)'
  }
};

/**
 * Strips any embedded Tamil in parentheses from English string to avoid duplication
 */
export const cleanEnglishName = (name: string): string => {
  if (!name) return '';
  return name.replace(/\s*\([^)]*[\u0B80-\u0BFF][^)]*\)/g, '').trim();
};

export const getRoomDisplayName = (
  type: string, 
  englishName: string, 
  tamilName?: string, 
  lang: Language = 'en'
): string => {
  if (lang === 'ta') {
    if (tamilName) {
      // Clean up any english text in parentheses from tamil name
      return tamilName.replace(/\s*\([A-Za-z0-9\s\/\-]+\)/g, '').trim();
    }
    const t = translations.ta;
    switch (type) {
      case 'living': return t.roomLiving;
      case 'master_bedroom': return t.roomMasterBedroom;
      case 'bedroom': return t.roomBedroom;
      case 'kitchen': return t.roomKitchen;
      case 'dining': return t.roomDining;
      case 'bathroom': return t.roomBathroom;
      case 'master_bath': return t.roomMasterBath;
      case 'puja': return t.roomPuja;
      case 'thinnai': return t.roomThinnai;
      case 'muttram': return t.roomMuttram;
      case 'stairwell': return t.roomStairwell;
      case 'balcony': return t.roomBalcony;
      case 'parking': case 'patio': return t.roomParking;
      case 'dressing': return t.roomDressing;
      case 'wash': case 'laundry': return t.roomWash;
      case 'foyer': return t.roomFoyer;
      case 'office': return t.roomOffice;
      default: return englishName ? cleanEnglishName(englishName) : 'அறை';
    }
  }

  // English default: Clean out any embedded Tamil in parentheses
  return cleanEnglishName(englishName);
};
