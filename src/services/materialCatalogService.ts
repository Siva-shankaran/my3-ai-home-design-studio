export interface MaterialSwatch {
  id: string;
  name: string;
  nameTamil: string;
  category: 'flooring' | 'wall' | 'furniture' | 'rug';
  primaryColor: string;
  secondaryColor?: string;
  textureType: 'plank' | 'terrazzo' | 'marble' | 'deck' | 'mosaic' | 'tile' | 'solid' | 'slats';
  description: string;
  suggestedFor: string;
}

export interface WholeHomeThemeSettings {
  livingFloor: string;
  bedFloor: string;
  masterBathFloor: string;
  commonBathFloor: string;
  balconyFloor: string;
  thinnaiFloor: string;
  livingWall: string;
  bedWall: string;
  livingRug: string;
  bedRug: string;
  sofaColor: string;
  sofaMaterial: string;
  diningMaterial: string;
  lightingColor: string;
}

export interface WholeHomeTheme {
  id: string;
  name: string;
  nameTamil: string;
  tagline: string;
  badge: string;
  description: string;
  previewColor: string;
  referenceImageUrl: string;
  swatchIds: string[];
  settings: WholeHomeThemeSettings;
}

export const materialCatalogService = {
  // Flooring Materials (Matching Image 1: Specification Palette)
  flooringSwatches: [
    {
      id: 'terrazzo',
      name: 'Terrazzo Tile',
      nameTamil: 'டெர்ராஸ்ஸோ தரை ஓடுகள்',
      category: 'flooring',
      primaryColor: '#f1f5f9',
      secondaryColor: '#94a3b8',
      textureType: 'terrazzo',
      description: 'Luminous light grey terrazzo with subtle grey quartz & marble aggregate flecks.',
      suggestedFor: 'Living, Dining, Corridor'
    },
    {
      id: 'hardwood',
      name: 'Natural Oak Hardwood',
      nameTamil: 'இயற்கை ஓக் மரத்தரை',
      category: 'flooring',
      primaryColor: '#fbf5e6',
      secondaryColor: '#e5d5ba',
      textureType: 'plank',
      description: 'Warm Scandinavian natural oak wood planks with horizontal grain seams.',
      suggestedFor: 'Master Bedroom, Guest Bed'
    },
    {
      id: 'merino_marble',
      name: 'Italian Merino Marble',
      nameTamil: 'இத்தாலிய மெரினோ மார்பிள்',
      category: 'flooring',
      primaryColor: '#f8fafc',
      secondaryColor: '#cbd5e1',
      textureType: 'marble',
      description: 'High-gloss polished Italian white marble with delicate grey feather veining.',
      suggestedFor: 'Great Living Hall, Foyer'
    },
    {
      id: 'mahogany_deck',
      name: 'Mahogany Deckwood',
      nameTamil: 'மஹோகனி மர டெக்',
      category: 'flooring',
      primaryColor: '#78350f',
      secondaryColor: '#451a03',
      textureType: 'deck',
      description: 'Weatherproof grooved hardwood deck planks with dark expansion joints.',
      suggestedFor: 'Balcony, Open Terrace, Deck'
    },
    {
      id: 'athangudi',
      name: 'Athangudi Terracotta',
      nameTamil: 'ஆத்தங்குடி கைவினை ஓடுகள்',
      category: 'flooring',
      primaryColor: '#fed7aa',
      secondaryColor: '#ea580c',
      textureType: 'tile',
      description: 'Traditional Tamil Nadu handmade red oxide & terracotta heritage tiles.',
      suggestedFor: 'Thinnai, Sitout, Courtyard'
    },
    {
      id: 'chequered_mosaic',
      name: 'Solid Mosaic Chequered',
      nameTamil: 'கருப்பு வெள்ளை மொசைக்',
      category: 'flooring',
      primaryColor: '#1e293b',
      secondaryColor: '#ffffff',
      textureType: 'mosaic',
      description: 'Classic high-contrast black & white checkerboard mosaic tiles.',
      suggestedFor: 'Powder Room, Foyer, Entry'
    },
    {
      id: 'avocado_marble',
      name: 'Avocado Serpentine Marble',
      nameTamil: 'அவகேடோ பச்சை மார்பிள்',
      category: 'flooring',
      primaryColor: '#dcfce7',
      secondaryColor: '#15803d',
      textureType: 'marble',
      description: 'Earthy jade green serpentine marble with olive green crystalline veins.',
      suggestedFor: 'Guest Bath, Wash Room'
    },
    {
      id: 'rossa_marble',
      name: 'Rossa Portugallo Marble',
      nameTamil: 'ரோஸா இளஞ்சிவப்பு மார்பிள்',
      category: 'flooring',
      primaryColor: '#ffe4e6',
      secondaryColor: '#e11d48',
      textureType: 'marble',
      description: 'Warm salmon-pink Portuguese marble with gold & rose mineral striations.',
      suggestedFor: 'Master En-suite, Dressing'
    }
  ] as MaterialSwatch[],

  // Wall Finishes & Colors
  wallSwatches: [
    {
      id: 'charcoal_slate',
      name: 'Charcoal Solid Slate',
      nameTamil: 'கரிம ஸ்லேட் சுவர்',
      category: 'wall',
      primaryColor: '#18181b',
      secondaryColor: '#09090b',
      textureType: 'solid',
      description: 'Architectural solid charcoal dark border wall for maximum structural clarity.',
      suggestedFor: 'All Structural Envelopes'
    },
    {
      id: 'oak_veneer',
      name: 'Natural Oak Veneer Slats',
      nameTamil: 'இயற்கை ஓக் மர பேனலிங்',
      category: 'wall',
      primaryColor: '#854d0e',
      secondaryColor: '#451a03',
      textureType: 'slats',
      description: 'Warm vertical fluted oak wood architectural feature wall paneling.',
      suggestedFor: 'Living Accent Wall, Master Bed'
    },
    {
      id: 'terracotta_clay',
      name: 'Madurai Terracotta Clay',
      nameTamil: 'சுடுமண் பூச்சு சுவர்',
      category: 'wall',
      primaryColor: '#c2410c',
      secondaryColor: '#9a3412',
      textureType: 'solid',
      description: 'Warm breathable red clay lime plaster traditional finish.',
      suggestedFor: 'Courtyard, Puja, Sitout'
    },
    {
      id: 'warm_alabaster',
      name: 'Warm Alabaster White',
      nameTamil: 'அலாபாஸ்டர் வெள்ளை',
      category: 'wall',
      primaryColor: '#fafaf9',
      secondaryColor: '#e7e5e4',
      textureType: 'solid',
      description: 'Soft luminous off-white wall finish with 90% light reflectance.',
      suggestedFor: 'Bedrooms, Living, Hall'
    },
    {
      id: 'sage_green',
      name: 'Nilgiri Sage Mineral',
      nameTamil: 'நீலகிரி மூலிகை பச்சை',
      category: 'wall',
      primaryColor: '#065f46',
      secondaryColor: '#047857',
      textureType: 'solid',
      description: 'Calming botanical muted green mineral pigment wall treatment.',
      suggestedFor: 'Master Bedroom, Study Office'
    },
    {
      id: 'sahara_accent',
      name: 'Sahara Noir Accent Stone',
      nameTamil: 'சஹாரா பிளாக் மார்பிள் சுவர்',
      category: 'wall',
      primaryColor: '#09090b',
      secondaryColor: '#eab308',
      textureType: 'marble',
      description: 'Dramatic black marble feature slab with golden lightning veins.',
      suggestedFor: 'TV Unit Backdrop, Dining Wall'
    }
  ] as MaterialSwatch[],

  // Furniture Upholstery & Tops (Matching Image 1 Sofa & Tables)
  furnitureSwatches: [
    {
      id: 'burgundy_velvet',
      name: 'Burgundy Royal Velvet',
      nameTamil: 'மெரூன் வெல்வெட் துணி',
      category: 'furniture',
      primaryColor: '#881337',
      secondaryColor: '#4c0519',
      textureType: 'solid',
      description: 'Rich royal wine burgundy plush velvet upholstery (as featured in Image 1).',
      suggestedFor: 'Sectional Sofa, Accent Chairs'
    },
    {
      id: 'cream_boucle',
      name: 'Nordic Cream Bouclé',
      nameTamil: 'கிரீம் நிற லினன்',
      category: 'furniture',
      primaryColor: '#ffffff',
      secondaryColor: '#94a3b8',
      textureType: 'solid',
      description: 'Soft tactile ivory bouclé fabric with charcoal piping.',
      suggestedFor: 'Sofa Cushions, Bed Headboard'
    },
    {
      id: 'emerald_velvet',
      name: 'Imperial Emerald Velvet',
      nameTamil: 'மரகத பச்சை வெல்வெட்',
      category: 'furniture',
      primaryColor: '#064e3b',
      secondaryColor: '#022c22',
      textureType: 'solid',
      description: 'Deep jewel emerald green upholstery with gold brass metal feet.',
      suggestedFor: 'Living Lounge, Dining Chairs'
    },
    {
      id: 'sahara_noir_top',
      name: 'Sahara Noir Black Marble Top',
      nameTamil: 'சஹாரா கறுப்பு மார்பிள் மேஜை',
      category: 'furniture',
      primaryColor: '#0f172a',
      secondaryColor: '#d97706',
      textureType: 'marble',
      description: 'Solid polished black marble top with golden veins (as featured in Image 1).',
      suggestedFor: 'Dining Table, Coffee Table'
    },
    {
      id: 'teak_wood',
      name: 'Burma Teakwood Natural',
      nameTamil: 'பர்மா தேக்கு மரம்',
      category: 'furniture',
      primaryColor: '#78350f',
      secondaryColor: '#451a03',
      textureType: 'plank',
      description: 'Kiln-dried solid seasoned teakwood with organic grain patterns.',
      suggestedFor: 'Bed Frame, Dining Table, Credenza'
    },
    {
      id: 'charcoal_leather',
      name: 'Charcoal Italian Leather',
      nameTamil: 'இத்தாலிய தோல்',
      category: 'furniture',
      primaryColor: '#334155',
      secondaryColor: '#1e293b',
      textureType: 'solid',
      description: 'Buttery full-grain charcoal grey aniline leather upholstery.',
      suggestedFor: 'Recliner, Office Chair'
    }
  ] as MaterialSwatch[],

  // Designer Area Rugs (Image 1 Swatches)
  rugSwatches: [
    {
      id: 'viscaya',
      name: 'Viscaya Woven Wool Rug',
      nameTamil: 'விஸ்காயா கம்பளம்',
      category: 'rug',
      primaryColor: '#e2e8f0',
      secondaryColor: '#64748b',
      textureType: 'tile',
      description: 'Textured charcoal and beige woven flat-weave area rug (Image 1 pattern).',
      suggestedFor: 'Living Room, Master Bed'
    },
    {
      id: 'chroma',
      name: 'Chroma Abstract Rug',
      nameTamil: 'க்ரோமா வண்ண கம்பளம்',
      category: 'rug',
      primaryColor: '#cbd5e1',
      secondaryColor: '#c2410c',
      textureType: 'terrazzo',
      description: 'Artistic brushstrokes in slate, terracotta, and cream wool.',
      suggestedFor: 'Dining Hall, Great Lounge'
    },
    {
      id: 'genesis',
      name: 'Genesis Terracotta Medallion',
      nameTamil: 'ஜெனிசிஸ் செம்மண் கம்பளம்',
      category: 'rug',
      primaryColor: '#fee2e2',
      secondaryColor: '#b91c1c',
      textureType: 'tile',
      description: 'Rich earth tones and crimson center medallion rug.',
      suggestedFor: 'Bedroom 1, Study'
    },
    {
      id: 'afterglow',
      name: 'Afterglow Blush Silk Rug',
      nameTamil: 'ஆஃப்டர்குளோ பட்டு கம்பளம்',
      category: 'rug',
      primaryColor: '#fef2f2',
      secondaryColor: '#f43f5e',
      textureType: 'solid',
      description: 'Lustrous champagne and soft rose bamboo silk sheen rug.',
      suggestedFor: 'Master Suite, Dressing'
    }
  ] as MaterialSwatch[],

  // Whole-Home Interior Themes (Instant Full-House Transformation)
  wholeHomeThemes: [
    {
      id: 'modern_urban_loft',
      name: 'Modern Urban Loft',
      nameTamil: 'நவீன நகர்ப்புற சொகுசு வடிவம்',
      tagline: 'Terrazzo Tiles • Burgundy Velvet • Sahara Noir Table • Fluted Oak Veneer',
      badge: 'MATCHES IMAGE 1 & 2',
      description: 'Sophisticated metropolitan aesthetic featuring luminous terrazzo tiles, royal wine velvet sectional sofa with gold buttons, Sahara Noir marble dining top, and warm LED step lighting.',
      previewColor: '#881337',
      referenceImageUrl: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1600&q=85',
      swatchIds: ['terrazzo', 'hardwood', 'burgundy_velvet', 'sahara_noir_top', 'viscaya', 'mahogany_deck'],
      settings: {
        livingFloor: 'terrazzo',
        bedFloor: 'hardwood',
        masterBathFloor: 'rossa_marble',
        commonBathFloor: 'avocado_marble',
        balconyFloor: 'mahogany_deck',
        thinnaiFloor: 'athangudi',
        livingWall: 'charcoal_slate',
        bedWall: 'oak_veneer',
        livingRug: 'viscaya',
        bedRug: 'afterglow',
        sofaColor: '#881337',
        sofaMaterial: 'burgundy_velvet',
        diningMaterial: 'sahara_noir_top',
        lightingColor: '#fbbf24'
      }
    },
    {
      id: 'merino_luxury_villa',
      name: 'Italian Merino Luxury Villa',
      nameTamil: 'இத்தாலிய மெரினோ மார்பிள் இல்லம்',
      tagline: 'Merino Marble • Rossa Portugallo • Ivory Bouclé • Ambient Lighting',
      badge: 'FLAGSHIP SPECIFICATION',
      description: 'High-end architectural luxury featuring book-matched Italian Merino Marble floors, Rossa Portugallo en-suite bath, ivory bouclé seating, and Sahara Noir feature backdrops.',
      previewColor: '#f8fafc',
      referenceImageUrl: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1600&q=85',
      swatchIds: ['merino_marble', 'rossa_marble', 'cream_boucle', 'sahara_noir_top', 'chroma', 'mahogany_deck'],
      settings: {
        livingFloor: 'merino_marble',
        bedFloor: 'hardwood',
        masterBathFloor: 'rossa_marble',
        commonBathFloor: 'rossa_marble',
        balconyFloor: 'mahogany_deck',
        thinnaiFloor: 'merino_marble',
        livingWall: 'charcoal_slate',
        bedWall: 'oak_veneer',
        livingRug: 'chroma',
        bedRug: 'afterglow',
        sofaColor: '#ffffff',
        sofaMaterial: 'cream_boucle',
        diningMaterial: 'sahara_noir_top',
        lightingColor: '#fef08a'
      }
    },
    {
      id: 'scandinavian_oak',
      name: 'Scandinavian Warm Oak',
      nameTamil: 'ஸ்காண்டிநேவியன் இயற்கை ஓக் மரம்',
      tagline: 'Blonde Oak Hardwood • Warm Alabaster • Emerald Velvet • Fluted Slats',
      badge: 'WARM MINIMALIST',
      description: 'Serene Scandinavian design with seamless blonde natural oak hardwood planks throughout living and bedrooms, Nilgiri sage walls, and soft woven wool rugs.',
      previewColor: '#fbf5e6',
      referenceImageUrl: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1600&q=85',
      swatchIds: ['hardwood', 'avocado_marble', 'emerald_velvet', 'teak_wood', 'viscaya'],
      settings: {
        livingFloor: 'hardwood',
        bedFloor: 'hardwood',
        masterBathFloor: 'avocado_marble',
        commonBathFloor: 'terrazzo',
        balconyFloor: 'mahogany_deck',
        thinnaiFloor: 'hardwood',
        livingWall: 'warm_alabaster',
        bedWall: 'sage_green',
        livingRug: 'viscaya',
        bedRug: 'viscaya',
        sofaColor: '#064e3b',
        sofaMaterial: 'emerald_velvet',
        diningMaterial: 'teak_wood',
        lightingColor: '#fef3c7'
      }
    },
    {
      id: 'chettinad_heritage',
      name: 'Chettinad Heritage & Athangudi',
      nameTamil: 'செட்டிநாடு பாரம்பரியம் & ஆத்தங்குடி',
      tagline: 'Athangudi Terracotta • Burma Teakwood • Muttram Lawn • Brass Accents',
      badge: 'TAMIL NADU HERITAGE',
      description: 'Authentic Tamil Nadu luxury with vibrant handmade Athangudi terracotta tiles, open-to-sky central muttram courtyard lawn, carved Burma teakwood furniture, and red oxide verandahs.',
      previewColor: '#fed7aa',
      referenceImageUrl: 'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=1600&q=85',
      swatchIds: ['athangudi', 'merino_marble', 'teak_wood', 'genesis', 'mahogany_deck'],
      settings: {
        livingFloor: 'athangudi',
        bedFloor: 'hardwood',
        masterBathFloor: 'avocado_marble',
        commonBathFloor: 'athangudi',
        balconyFloor: 'mahogany_deck',
        thinnaiFloor: 'athangudi',
        livingWall: 'terracotta_clay',
        bedWall: 'oak_veneer',
        livingRug: 'genesis',
        bedRug: 'genesis',
        sofaColor: '#78350f',
        sofaMaterial: 'teak_wood',
        diningMaterial: 'teak_wood',
        lightingColor: '#fbbf24'
      }
    }
  ],

  /**
   * Transforms the ENTIRE house instantaneously to a cohesive luxury theme
   * Changes all floors, walls, rugs, furniture upholstery, and table tops at once
   */
  applyWholeHomeTheme(project: any, themeId: string): any {
    const theme = this.wholeHomeThemes.find(t => t.id === themeId) || this.wholeHomeThemes[0];
    const s = theme.settings;

    const updatedRooms = (project.rooms || []).map((r: any) => {
      let floorFinish = s.livingFloor;
      let wallFinish = s.livingWall;
      let rugPattern = 'none';

      if (r.type === 'master_bedroom') {
        floorFinish = s.bedFloor;
        wallFinish = s.bedWall;
        rugPattern = s.bedRug;
      } else if (r.type === 'bedroom') {
        floorFinish = s.bedFloor;
        rugPattern = 'genesis';
      } else if (r.type === 'living') {
        floorFinish = s.livingFloor;
        wallFinish = s.livingWall;
        rugPattern = s.livingRug;
      } else if (r.type === 'kitchen' || r.type === 'dining') {
        floorFinish = s.livingFloor;
      } else if (r.type === 'master_bath') {
        floorFinish = s.masterBathFloor;
      } else if (r.type === 'bathroom') {
        floorFinish = s.commonBathFloor;
      } else if (r.type === 'balcony' || r.type === 'patio') {
        floorFinish = s.balconyFloor;
      } else if (r.type === 'thinnai') {
        floorFinish = s.thinnaiFloor;
      } else if (r.type === 'muttram') {
        floorFinish = 'grass';
      }

      return {
        ...r,
        floorFinish,
        wallFinish,
        rugPattern
      };
    });

    const updatedFurniture = (project.furniture || []).map((f: any) => {
      if (f.category === 'living') {
        return {
          ...f,
          color: s.sofaColor,
          fabricColor: s.sofaColor,
          material: s.sofaMaterial
        };
      }
      if (f.category === 'dining') {
        return {
          ...f,
          color: s.diningMaterial === 'sahara_noir_top' ? '#0f172a' : '#78350f',
          material: s.diningMaterial
        };
      }
      if (f.category === 'bedroom') {
        return {
          ...f,
          color: '#78350f',
          material: 'teak_wood'
        };
      }
      return f;
    });

    return {
      ...project,
      rooms: updatedRooms,
      furniture: updatedFurniture,
      currentThemeId: theme.id,
      updatedAt: 'Just now'
    };
  },

  getAllSwatches(): MaterialSwatch[] {
    return [
      ...this.flooringSwatches,
      ...this.wallSwatches,
      ...this.furnitureSwatches,
      ...this.rugSwatches
    ];
  },

  getSwatchById(id: string): MaterialSwatch | undefined {
    return this.getAllSwatches().find(s => s.id === id);
  }
};

