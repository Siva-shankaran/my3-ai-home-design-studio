import type { Project, RuleCheckResult, SiteProfile } from '../types/index.ts';

export const tamilNaduRulesService = {
  /**
   * Evaluates project compliance against Tamil Nadu Combined Development and Building Rules, 2019 (TNCDBR-2019)
   * and National Building Code of India (NBC 2016)
   */
  evaluateTNCDBR(project: Project): RuleCheckResult[] {
    const results: RuleCheckResult[] = [];
    const rooms = project.rooms || [];
    const floor1Rooms = rooms.filter(r => (r.floor || 1) === 1);
    const site = project.siteProfile;

    const f1Area = floor1Rooms.reduce((acc, r) => acc + (r.width * r.height), 0);
    const totalBuiltup = project.sqft || rooms.reduce((acc, r) => acc + (r.width * r.height), 0);
    const plotArea = site ? (site.plotAreaSqft || site.plotWidth * site.plotDepth) : 2400; // default 1 ground = 2400 sqft

    // -------------------------------------------------------------------------
    // Rule 1: TNCDBR-2019 Rule 36 — Maximum Plot Coverage
    // -------------------------------------------------------------------------
    const coveragePercent = Math.round((f1Area / plotArea) * 100);
    const maxCoverage = 70; // 70% max coverage for residential non-high rise
    results.push({
      ruleId: 'TNCDBR-RULE-36-COVERAGE',
      ruleName: 'Maximum Plot Coverage Limit',
      standard: 'TNCDBR_2019',
      clause: 'Rule 36, Table 1 — Non-High Rise Residential',
      officialSource: 'Tamil Nadu Combined Development and Building Rules, 2019',
      status: coveragePercent <= maxCoverage ? 'PASS' : 'POTENTIAL_ISSUE',
      requiredValue: `Max ${maxCoverage}%`,
      actualValue: `${coveragePercent}%`,
      explanation: coveragePercent <= maxCoverage
        ? `Ground floor footprint (${f1Area} sq ft) occupies ${coveragePercent}% of the plot, which is compliant with the 70% maximum limit.`
        : `Ground floor footprint (${f1Area} sq ft) occupies ${coveragePercent}% of the plot, exceeding the 70% threshold. Requires open space expansion.`,
      remedialSuggestion: coveragePercent > maxCoverage ? 'Shift habitable spaces to upper floor to reduce ground footprint.' : undefined
    });

    // -------------------------------------------------------------------------
    // Rule 2: TNCDBR-2019 Rule 36 — Floor Space Index (FSI)
    // -------------------------------------------------------------------------
    const achievedFSI = Number((totalBuiltup / plotArea).toFixed(2));
    const permittedFSI = site?.roadWidthFeet && site.roadWidthFeet >= 30 ? 2.0 : 1.5;
    results.push({
      ruleId: 'TNCDBR-RULE-36-FSI',
      ruleName: 'Permissible Floor Space Index (FSI)',
      standard: 'TNCDBR_2019',
      clause: 'Rule 36, Table 1 — Residential FSI by Road Width',
      officialSource: 'Tamil Nadu Government Gazette Extraordinary No. 43, 2019',
      status: achievedFSI <= permittedFSI ? 'PASS' : 'POTENTIAL_ISSUE',
      requiredValue: `Max ${permittedFSI} FSI`,
      actualValue: `${achievedFSI} FSI`,
      explanation: achievedFSI <= permittedFSI
        ? `Achieved FSI of ${achievedFSI} is within the allowable limit of ${permittedFSI} for a road width of ${site?.roadWidthFeet || 30} ft.`
        : `Achieved FSI of ${achievedFSI} exceeds the permitted limit of ${permittedFSI}. Municipal planning approval may require premium FSI or reduction in built-up area.`,
      remedialSuggestion: achievedFSI > permittedFSI ? 'Review CMDA/DTCP Premium FSI eligibility or reduce gross floor area.' : undefined
    });

    // -------------------------------------------------------------------------
    // Rule 3: TNCDBR-2019 Rule 35 — Front Road Setback
    // -------------------------------------------------------------------------
    const minFrontDistance = floor1Rooms.length > 0 ? Math.min(...floor1Rooms.map(r => r.x)) : 0;
    const requiredFrontSetback = site?.roadWidthFeet && site.roadWidthFeet >= 30 ? 10 : 5; // 3.0m vs 1.5m
    results.push({
      ruleId: 'TNCDBR-RULE-35-FRONT-SETBACK',
      ruleName: 'Minimum Front Road Setback',
      standard: 'TNCDBR_2019',
      clause: 'Rule 35, Table 2 — Setback Requirements',
      officialSource: 'Housing and Urban Development Department, Govt of Tamil Nadu',
      status: minFrontDistance >= requiredFrontSetback ? 'PASS' : 'POTENTIAL_ISSUE',
      requiredValue: `${requiredFrontSetback} ft (${(requiredFrontSetback * 0.3048).toFixed(1)} m)`,
      actualValue: `${minFrontDistance.toFixed(1)} ft`,
      explanation: minFrontDistance >= requiredFrontSetback
        ? `Front setback of ${minFrontDistance.toFixed(1)} ft complies with the required ${requiredFrontSetback} ft setback for road access.`
        : `Front setback is only ${minFrontDistance.toFixed(1)} ft, which is less than the mandatory ${requiredFrontSetback} ft buffer from the road boundary.`,
      remedialSuggestion: minFrontDistance < requiredFrontSetback ? `Recede front building line by ${(requiredFrontSetback - minFrontDistance).toFixed(1)} ft.` : undefined
    });

    // -------------------------------------------------------------------------
    // Rule 4: TNCDBR-2019 Rule 39 — Habitable Room Dimensions & Height
    // -------------------------------------------------------------------------
    const bedrooms = rooms.filter(r => r.type === 'bedroom' || r.type === 'master_bedroom');
    const undersizedBedrooms = bedrooms.filter(b => (b.width * b.height) < 100 || b.width < 8 || b.height < 8);
    results.push({
      ruleId: 'TNCDBR-RULE-39-HABITABLE-ROOMS',
      ruleName: 'Minimum Habitable Room Size (Bedrooms)',
      standard: 'TNCDBR_2019',
      clause: 'Rule 39(1) & (2) — Habitable Room Clearances',
      officialSource: 'TNCDBR 2019 & NBC 2016 Part 3 Clause 12.2',
      status: undersizedBedrooms.length === 0 ? 'PASS' : 'POTENTIAL_ISSUE',
      requiredValue: 'Min 100 sq ft (9.5 m²), Min Width 8 ft (2.4 m)',
      actualValue: undersizedBedrooms.length === 0 ? 'All bedrooms compliant' : `${undersizedBedrooms.length} bedroom(s) below standard`,
      explanation: undersizedBedrooms.length === 0
        ? 'All bedrooms satisfy the minimum area requirement of 100 sq ft (9.5 m²) and minimum width of 8.0 ft (2.4 m).'
        : `The following rooms are undersized: ${undersizedBedrooms.map(b => `${b.name} (${b.width * b.height} sqft)`).join(', ')}.`,
      remedialSuggestion: undersizedBedrooms.length > 0 ? 'Resize bedroom footprints to ensure minimum 8ft width.' : undefined
    });

    // -------------------------------------------------------------------------
    // Rule 5: TNCDBR-2019 Rule 42 — Mandatory Rainwater Harvesting (RWH)
    // -------------------------------------------------------------------------
    results.push({
      ruleId: 'TNCDBR-RULE-42-RWH',
      ruleName: 'Mandatory Rainwater Harvesting (RWH)',
      standard: 'TNCDBR_2019',
      clause: 'Rule 42 — Rain Water Harvesting Structures',
      officialSource: 'Tamil Nadu Act No. 37 of 2003 & TNCDBR 2019',
      status: 'REQUIRES_PROFESSIONAL_VERIFICATION',
      requiredValue: 'Rooftop runoff collection + 1.5m dia recharge pit',
      actualValue: 'Site layout includes rainwater collection provision',
      explanation: 'Rainwater harvesting is legally mandatory for all buildings in Tamil Nadu. The design must specify a dedicated desilting chamber, percolation pit, and connection to a recharge well.',
      remedialSuggestion: 'Include detail drawing of 1.5m diameter gravel-filled recharge pit in the municipal submission sheet.'
    });

    // -------------------------------------------------------------------------
    // Rule 6: NBC 2016 Part 4 / TNCDBR Rule 39(12) — Staircase Width & Riser
    // -------------------------------------------------------------------------
    const stairs = rooms.filter(r => r.type === 'stairwell');
    const isStairValid = stairs.length > 0 && stairs[0].width >= 6;
    results.push({
      ruleId: 'NBC-PART-4-STAIRCASE',
      ruleName: 'Staircase Flight Width and Headroom',
      standard: 'NBC_2016',
      clause: 'NBC 2016 Part 4 Fire & Life Safety / TNCDBR 39(12)',
      officialSource: 'National Building Code of India 2016, Bureau of Indian Standards',
      status: isStairValid ? 'PASS' : stairs.length === 0 ? 'MISSING_DATA' : 'POTENTIAL_ISSUE',
      requiredValue: 'Min 3.0 ft (900 mm) clear flight width',
      actualValue: stairs.length > 0 ? `${(stairs[0].width / 2).toFixed(1)} ft per flight` : 'No stairwell detected',
      explanation: isStairValid
        ? 'Staircase dimensions provide sufficient flight width and fire egress clearance.'
        : 'Staircase flight width is below the 900mm (3.0 ft) minimum requirement for residential safe escape.'
    });

    // -------------------------------------------------------------------------
    // Rule 7: IS 1893:2016 — Seismic Zone III RCC Ductile Detailing
    // -------------------------------------------------------------------------
    results.push({
      ruleId: 'IS-1893-SEISMIC-ZONE-III',
      ruleName: 'Seismic Zone III Ductile Detailing Requirement',
      standard: 'NBC_2016',
      clause: 'IS 1893 (Part 1): 2016 & IS 13920: 2016',
      officialSource: 'Bureau of Indian Standards — Criteria for Earthquake Resistant Design',
      status: 'REQUIRES_PROFESSIONAL_VERIFICATION',
      requiredValue: 'Zone III (Zone Factor Z = 0.16)',
      actualValue: `${site?.district || 'Tamil Nadu'} is classified under Seismic Zone III`,
      explanation: 'Most of Tamil Nadu (including Chennai, Coimbatore, Cuddalore) falls under Seismic Zone III. RCC frame beam-column joints require ductile tie detailing per IS 13920:2016.',
      remedialSuggestion: 'Registered Structural Engineer must provide ductile column tie spacing schedule (min 8mm dia ties @ 100mm c/c at joint zones).'
    });

    return results;
  }
};
