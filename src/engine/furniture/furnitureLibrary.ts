/**
 * Dimensioned Architectural Furniture & Fixture Library
 * Real-world standard dimensions, clearance envelopes, and 2D CAD symbol renderers
 * matching professional Maket.ai architectural conventions.
 */

import type { FurnitureItem } from '../../types/index.ts';

export interface FurnitureDefinition {
  type: string;
  name: string;
  category: 'living' | 'bedroom' | 'dining' | 'kitchen' | 'office' | 'bath' | 'laundry' | 'entry' | 'outdoor' | 'vehicle';
  widthFeet: number;
  depthFeet: number;
  clearanceFrontFeet: number;
  clearanceSidesFeet: number;
  defaultColor: string;
}

export const FURNITURE_CATALOG: Record<string, FurnitureDefinition> = {
  // BEDROOM
  'cal_king_bed': { type: 'cal_king_bed', name: 'Cal-King Bed', category: 'bedroom', widthFeet: 6.5, depthFeet: 7.0, clearanceFrontFeet: 3.0, clearanceSidesFeet: 2.5, defaultColor: '#ffffff' },
  'king_bed': { type: 'king_bed', name: 'King Bed', category: 'bedroom', widthFeet: 6.3, depthFeet: 6.7, clearanceFrontFeet: 3.0, clearanceSidesFeet: 2.5, defaultColor: '#ffffff' },
  'queen_bed': { type: 'queen_bed', name: 'Queen Bed', category: 'bedroom', widthFeet: 5.0, depthFeet: 6.7, clearanceFrontFeet: 2.5, clearanceSidesFeet: 2.0, defaultColor: '#ffffff' },
  'full_bed': { type: 'full_bed', name: 'Full Bed', category: 'bedroom', widthFeet: 4.5, depthFeet: 6.3, clearanceFrontFeet: 2.5, clearanceSidesFeet: 2.0, defaultColor: '#ffffff' },
  'nightstand': { type: 'nightstand', name: 'Nightstand', category: 'bedroom', widthFeet: 1.8, depthFeet: 1.5, clearanceFrontFeet: 1.5, clearanceSidesFeet: 0.5, defaultColor: '#b45309' },
  'wardrobe_sliding': { type: 'wardrobe_sliding', name: 'Sliding Wardrobe', category: 'bedroom', widthFeet: 6.0, depthFeet: 2.0, clearanceFrontFeet: 3.0, clearanceSidesFeet: 0, defaultColor: '#e2e8f0' },
  'dresser': { type: 'dresser', name: 'Dresser Chest', category: 'bedroom', widthFeet: 4.0, depthFeet: 1.8, clearanceFrontFeet: 3.0, clearanceSidesFeet: 0.5, defaultColor: '#cbd5e1' },

  // LIVING
  'sectional_sofa': { type: 'sectional_sofa', name: 'Sectional L-Sofa', category: 'living', widthFeet: 8.0, depthFeet: 6.0, clearanceFrontFeet: 2.5, clearanceSidesFeet: 1.5, defaultColor: '#f1f5f9' },
  'three_seat_sofa': { type: 'three_seat_sofa', name: '3-Seater Sofa', category: 'living', widthFeet: 7.0, depthFeet: 3.0, clearanceFrontFeet: 2.5, clearanceSidesFeet: 1.5, defaultColor: '#f1f5f9' },
  'two_seat_sofa': { type: 'two_seat_sofa', name: '2-Seater Loveseat', category: 'living', widthFeet: 5.0, depthFeet: 3.0, clearanceFrontFeet: 2.5, clearanceSidesFeet: 1.5, defaultColor: '#f1f5f9' },
  'armchair': { type: 'armchair', name: 'Lounge Armchair', category: 'living', widthFeet: 2.8, depthFeet: 2.8, clearanceFrontFeet: 2.0, clearanceSidesFeet: 1.0, defaultColor: '#f8fafc' },
  'coffee_table_round': { type: 'coffee_table_round', name: 'Round Coffee Table', category: 'living', widthFeet: 3.0, depthFeet: 3.0, clearanceFrontFeet: 1.5, clearanceSidesFeet: 1.5, defaultColor: '#d97706' },
  'tv_console': { type: 'tv_console', name: 'Media Credenza & TV', category: 'living', widthFeet: 6.0, depthFeet: 1.5, clearanceFrontFeet: 4.0, clearanceSidesFeet: 0, defaultColor: '#1e293b' },
  'area_rug': { type: 'area_rug', name: 'Living Area Rug', category: 'living', widthFeet: 9.0, depthFeet: 7.0, clearanceFrontFeet: 0, clearanceSidesFeet: 0, defaultColor: '#bae6fd' },

  // DINING
  'dining_table_6': { type: 'dining_table_6', name: '6-Seat Dining Table', category: 'dining', widthFeet: 6.0, depthFeet: 3.2, clearanceFrontFeet: 3.0, clearanceSidesFeet: 3.0, defaultColor: '#1e293b' },
  'dining_table_4': { type: 'dining_table_4', name: '4-Seat Dining Table', category: 'dining', widthFeet: 4.0, depthFeet: 3.0, clearanceFrontFeet: 2.5, clearanceSidesFeet: 2.5, defaultColor: '#1e293b' },
  'dining_table_round': { type: 'dining_table_round', name: 'Round Dining Table', category: 'dining', widthFeet: 4.5, depthFeet: 4.5, clearanceFrontFeet: 3.0, clearanceSidesFeet: 3.0, defaultColor: '#1e293b' },

  // KITCHEN
  'cooktop_sink_counter': { type: 'cooktop_sink_counter', name: 'Cooktop & Sink Counter', category: 'kitchen', widthFeet: 10.0, depthFeet: 2.2, clearanceFrontFeet: 3.5, clearanceSidesFeet: 0, defaultColor: '#cbd5e1' },
  'kitchen_island': { type: 'kitchen_island', name: 'Kitchen Prep Island', category: 'kitchen', widthFeet: 7.0, depthFeet: 3.5, clearanceFrontFeet: 3.5, clearanceSidesFeet: 3.5, defaultColor: '#0f172a' },
  'refrigerator': { type: 'refrigerator', name: 'French Door Refrigerator', category: 'kitchen', widthFeet: 3.0, depthFeet: 2.8, clearanceFrontFeet: 3.5, clearanceSidesFeet: 0.5, defaultColor: '#94a3b8' },

  // BATHROOM
  'toilet': { type: 'toilet', name: 'Porcelain Toilet (WC)', category: 'bath', widthFeet: 1.8, depthFeet: 2.4, clearanceFrontFeet: 2.5, clearanceSidesFeet: 1.2, defaultColor: '#ffffff' },
  'vanity_single': { type: 'vanity_single', name: 'Single-Sink Vanity', category: 'bath', widthFeet: 3.0, depthFeet: 1.8, clearanceFrontFeet: 2.5, clearanceSidesFeet: 0.5, defaultColor: '#ffffff' },
  'vanity_double': { type: 'vanity_double', name: 'Double-Sink Vanity', category: 'bath', widthFeet: 5.5, depthFeet: 1.8, clearanceFrontFeet: 2.5, clearanceSidesFeet: 0.5, defaultColor: '#ffffff' },
  'bathtub': { type: 'bathtub', name: 'Soaking Bathtub', category: 'bath', widthFeet: 5.0, depthFeet: 2.8, clearanceFrontFeet: 2.5, clearanceSidesFeet: 0, defaultColor: '#ffffff' },
  'walkin_shower': { type: 'walkin_shower', name: 'Glass Walk-in Shower', category: 'bath', widthFeet: 3.5, depthFeet: 3.5, clearanceFrontFeet: 2.5, clearanceSidesFeet: 0, defaultColor: '#e0f2fe' },

  // LAUNDRY
  'washer_dryer': { type: 'washer_dryer', name: 'Side-by-Side Washer & Dryer', category: 'laundry', widthFeet: 5.0, depthFeet: 2.5, clearanceFrontFeet: 3.5, clearanceSidesFeet: 0.5, defaultColor: '#ffffff' },
  'laundry_sink': { type: 'laundry_sink', name: 'Laundry Utility Sink', category: 'laundry', widthFeet: 2.2, depthFeet: 2.0, clearanceFrontFeet: 2.5, clearanceSidesFeet: 0.5, defaultColor: '#cbd5e1' },

  // OFFICE
  'office_desk_l': { type: 'office_desk_l', name: 'L-Shaped Office Desk', category: 'office', widthFeet: 5.5, depthFeet: 5.0, clearanceFrontFeet: 3.0, clearanceSidesFeet: 1.5, defaultColor: '#1e293b' },
  'office_chair': { type: 'office_chair', name: 'Ergonomic Task Chair', category: 'office', widthFeet: 2.2, depthFeet: 2.2, clearanceFrontFeet: 2.0, clearanceSidesFeet: 1.0, defaultColor: '#334155' }
};

export const FurnitureSymbolRenderer = {
  /**
   * Renders authentic 2D architectural CAD symbols for furniture matching Maket.ai standards.
   */
  renderSymbol(
    ctx: CanvasRenderingContext2D,
    item: FurnitureItem,
    pw: number,
    pd: number,
    isPresentation: boolean
  ) {
    const nm = item.name.toLowerCase();

    // 1. BED (Cal-King, King, Queen, Full)
    if (item.category === 'bedroom' && (nm.includes('bed') || nm.includes('king') || nm.includes('queen'))) {
      this.drawBed(ctx, pw, pd, isPresentation);
      return;
    }

    // 2. SOFA & SECTIONAL
    if (item.category === 'living' && (nm.includes('sofa') || nm.includes('sectional') || nm.includes('couch'))) {
      this.drawSectionalSofa(ctx, pw, pd, isPresentation);
      return;
    }

    // 3. COFFEE TABLE & RUGS
    if (nm.includes('coffee') || nm.includes('table_round')) {
      this.drawCoffeeTable(ctx, pw, pd, isPresentation);
      return;
    }

    // 4. TV MEDIA CONSOLE
    if (nm.includes('tv') || nm.includes('media') || nm.includes('credenza')) {
      this.drawTVConsole(ctx, pw, pd, isPresentation);
      return;
    }

    // 5. DINING TABLE & CHAIRS
    if (item.category === 'dining' || nm.includes('dining')) {
      this.drawDiningTable(ctx, pw, pd, isPresentation);
      return;
    }

    // 6. KITCHEN APPLIANCES & COUNTERS
    if (item.category === 'kitchen' || nm.includes('kitchen') || nm.includes('cooktop') || nm.includes('sink') || nm.includes('island') || nm.includes('fridge')) {
      this.drawKitchenFixture(ctx, nm, pw, pd, isPresentation);
      return;
    }

    // 7. BATHROOM FIXTURES
    if (item.category === 'bath' || nm.includes('toilet') || nm.includes('bath') || nm.includes('vanity') || nm.includes('tub') || nm.includes('shower')) {
      this.drawBathFixture(ctx, nm, pw, pd, isPresentation);
      return;
    }

    // 8. LAUNDRY
    if (item.category === 'laundry' || nm.includes('washer') || nm.includes('dryer')) {
      this.drawWasherDryer(ctx, pw, pd, isPresentation);
      return;
    }

    // 9. OFFICE DESK & CHAIR
    if (item.category === 'office' || nm.includes('desk') || nm.includes('chair')) {
      this.drawOfficeDesk(ctx, nm, pw, pd, isPresentation);
      return;
    }

    // 10. WARDROBE / CLOSET / DRESSER
    if (nm.includes('wardrobe') || nm.includes('dresser') || nm.includes('closet') || nm.includes('rack')) {
      this.drawWardrobe(ctx, pw, pd, isPresentation);
      return;
    }

    // 11. POTTED PLANTS
    if (nm.includes('plant') || nm.includes('tree') || nm.includes('flora')) {
      this.drawPottedPlant(ctx, Math.min(pw, pd) / 2);
      return;
    }

    // Fallback Clean Architectural Box
    ctx.fillStyle = isPresentation ? '#f8fafc' : '#1e293b';
    ctx.fillRect(-pw / 2, -pd / 2, pw, pd);
    ctx.strokeStyle = isPresentation ? '#94a3b8' : '#38bdf8';
    ctx.lineWidth = 1.2;
    ctx.strokeRect(-pw / 2, -pd / 2, pw, pd);
  },

  drawBed(ctx: CanvasRenderingContext2D, pw: number, pd: number, isPresentation: boolean) {
    // Mattress Base
    ctx.fillStyle = isPresentation ? '#ffffff' : '#0f172a';
    ctx.fillRect(-pw / 2, -pd / 2, pw, pd);
    ctx.strokeStyle = isPresentation ? '#94a3b8' : '#38bdf8';
    ctx.lineWidth = 1.2;
    ctx.strokeRect(-pw / 2, -pd / 2, pw, pd);

    // Headboard
    ctx.fillStyle = isPresentation ? '#64748b' : '#334155';
    ctx.fillRect(-pw / 2, -pd / 2, pw, pd * 0.12);

    // Pillows
    const pW = pw * 0.38;
    const pH = pd * 0.22;
    ctx.fillStyle = isPresentation ? '#f1f5f9' : '#1e293b';
    ctx.strokeStyle = isPresentation ? '#cbd5e1' : '#475569';
    ctx.lineWidth = 1;

    // Left pillow
    ctx.fillRect(-pw / 2 + pw * 0.08, -pd / 2 + pd * 0.16, pW, pH);
    ctx.strokeRect(-pw / 2 + pw * 0.08, -pd / 2 + pd * 0.16, pW, pH);

    // Right pillow
    ctx.fillRect(pw / 2 - pw * 0.08 - pW, -pd / 2 + pd * 0.16, pW, pH);
    ctx.strokeRect(pw / 2 - pw * 0.08 - pW, -pd / 2 + pd * 0.16, pW, pH);

    // Folded Duvet Line
    ctx.strokeStyle = isPresentation ? '#94a3b8' : '#475569';
    ctx.setLineDash([3, 3]);
    ctx.beginPath();
    ctx.moveTo(-pw / 2, pd / 2 - pd * 0.4);
    ctx.lineTo(pw / 2, pd / 2 - pd * 0.4);
    ctx.stroke();
    ctx.setLineDash([]);

    // Nightstands on both sides
    const nsW = 6;
    const nsD = 8;
    ctx.fillStyle = isPresentation ? '#cbd5e1' : '#334155';
    ctx.fillRect(-pw / 2 - nsW - 2, -pd / 2, nsW, nsD);
    ctx.fillRect(pw / 2 + 2, -pd / 2, nsW, nsD);
    ctx.strokeStyle = '#64748b';
    ctx.strokeRect(-pw / 2 - nsW - 2, -pd / 2, nsW, nsD);
    ctx.strokeRect(pw / 2 + 2, -pd / 2, nsW, nsD);
  },

  drawSectionalSofa(ctx: CanvasRenderingContext2D, pw: number, pd: number, isPresentation: boolean) {
    // Elegant L-shaped cream/beige sofa matching Maket Image 2
    ctx.fillStyle = isPresentation ? '#ffffff' : '#1e293b';
    ctx.strokeStyle = isPresentation ? '#64748b' : '#38bdf8';
    ctx.lineWidth = 1.2;

    // L-geometry path
    const mainD = pd * 0.45;
    const returnW = pw * 0.45;

    ctx.beginPath();
    ctx.moveTo(-pw / 2, -pd / 2);
    ctx.lineTo(pw / 2, -pd / 2);
    ctx.lineTo(pw / 2, -pd / 2 + mainD);
    ctx.lineTo(-pw / 2 + returnW, -pd / 2 + mainD);
    ctx.lineTo(-pw / 2 + returnW, pd / 2);
    ctx.lineTo(-pw / 2, pd / 2);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Backrest thickness line
    ctx.strokeStyle = isPresentation ? '#94a3b8' : '#475569';
    ctx.lineWidth = 1;
    ctx.strokeRect(-pw / 2, -pd / 2, pw, mainD * 0.35);
    ctx.strokeRect(-pw / 2, -pd / 2, returnW * 0.35, pd);

    // Subtle cushion seams
    const cushionCount = 3;
    const cStep = (pw - returnW) / cushionCount;
    for (let i = 1; i < cushionCount; i++) {
      ctx.beginPath();
      ctx.moveTo(-pw / 2 + returnW + i * cStep, -pd / 2 + mainD * 0.35);
      ctx.lineTo(-pw / 2 + returnW + i * cStep, -pd / 2 + mainD);
      ctx.stroke();
    }
  },

  drawCoffeeTable(ctx: CanvasRenderingContext2D, pw: number, pd: number, isPresentation: boolean) {
    const r = Math.min(pw, pd) * 0.4;
    ctx.fillStyle = isPresentation ? '#fef3c7' : '#334155';
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = isPresentation ? '#d97706' : '#64748b';
    ctx.lineWidth = 1.2;
    ctx.stroke();
  },

  drawTVConsole(ctx: CanvasRenderingContext2D, pw: number, pd: number, isPresentation: boolean) {
    ctx.fillStyle = isPresentation ? '#1e293b' : '#0f172a';
    ctx.fillRect(-pw / 2, -pd / 2, pw, pd);
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 1;
    ctx.strokeRect(-pw / 2, -pd / 2, pw, pd);

    // Slim screen line
    ctx.strokeStyle = isPresentation ? '#38bdf8' : '#94a3b8';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-pw * 0.4, 0);
    ctx.lineTo(pw * 0.4, 0);
    ctx.stroke();
  },

  drawDiningTable(ctx: CanvasRenderingContext2D, pw: number, pd: number, isPresentation: boolean) {
    ctx.fillStyle = isPresentation ? '#f8fafc' : '#1e293b';
    ctx.fillRect(-pw * 0.4, -pd * 0.35, pw * 0.8, pd * 0.7);
    ctx.strokeStyle = isPresentation ? '#475569' : '#38bdf8';
    ctx.lineWidth = 1.2;
    ctx.strokeRect(-pw * 0.4, -pd * 0.35, pw * 0.8, pd * 0.7);

    // Dining Chairs
    const chairW = pw * 0.2;
    const chairD = pd * 0.16;
    ctx.fillStyle = isPresentation ? '#ffffff' : '#334155';

    // Top & Bottom chairs
    [-pw * 0.25, pw * 0.05].forEach(cx => {
      ctx.fillRect(cx, -pd / 2, chairW, chairD);
      ctx.strokeRect(cx, -pd / 2, chairW, chairD);
      ctx.fillRect(cx, pd / 2 - chairD, chairW, chairD);
      ctx.strokeRect(cx, pd / 2 - chairD, chairW, chairD);
    });
  },

  drawKitchenFixture(ctx: CanvasRenderingContext2D, nm: string, pw: number, pd: number, isPresentation: boolean) {
    ctx.fillStyle = isPresentation ? '#f1f5f9' : '#1e293b';
    ctx.fillRect(-pw / 2, -pd / 2, pw, pd);
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 1.2;
    ctx.strokeRect(-pw / 2, -pd / 2, pw, pd);

    if (nm.includes('cooktop') || nm.includes('hob') || nm.includes('stove')) {
      // 4 Gas Burners
      const r = Math.min(pw, pd) * 0.14;
      ctx.fillStyle = '#334155';
      [-pw * 0.22, pw * 0.22].forEach(bx => {
        [-pd * 0.22, pd * 0.22].forEach(by => {
          ctx.beginPath();
          ctx.arc(bx, by, r, 0, Math.PI * 2);
          ctx.fill();
        });
      });
    } else if (nm.includes('sink')) {
      // Double bowl sink
      const bW = pw * 0.38;
      const bH = pd * 0.65;
      ctx.fillStyle = isPresentation ? '#e2e8f0' : '#0f172a';
      ctx.fillRect(-pw * 0.42, -bH / 2, bW, bH);
      ctx.strokeRect(-pw * 0.42, -bH / 2, bW, bH);
      ctx.fillRect(pw * 0.04, -bH / 2, bW, bH);
      ctx.strokeRect(pw * 0.04, -bH / 2, bW, bH);
    } else if (nm.includes('fridge')) {
      // French door split
      ctx.strokeStyle = '#475569';
      ctx.beginPath();
      ctx.moveTo(0, -pd / 2);
      ctx.lineTo(0, pd / 2);
      ctx.stroke();
    }
  },

  drawBathFixture(ctx: CanvasRenderingContext2D, nm: string, pw: number, pd: number, isPresentation: boolean) {
    if (nm.includes('toilet') || nm.includes('wc')) {
      // Clean Porcelain Toilet: Tank + Bowl
      ctx.fillStyle = '#ffffff';
      ctx.strokeStyle = '#64748b';
      ctx.lineWidth = 1.2;

      // Tank
      ctx.fillRect(-pw * 0.4, -pd / 2, pw * 0.8, pd * 0.35);
      ctx.strokeRect(-pw * 0.4, -pd / 2, pw * 0.8, pd * 0.35);

      // Oval Bowl
      ctx.beginPath();
      ctx.ellipse(0, pd * 0.12, pw * 0.32, pd * 0.35, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

    } else if (nm.includes('tub') || nm.includes('bath')) {
      // Bathtub with blue water/acrylic interior and drain
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(-pw / 2, -pd / 2, pw, pd);
      ctx.strokeStyle = '#0284c7';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(-pw / 2, -pd / 2, pw, pd);

      ctx.strokeStyle = '#38bdf8';
      ctx.beginPath();
      ctx.roundRect(-pw * 0.44, -pd * 0.42, pw * 0.88, pd * 0.84, 8);
      ctx.stroke();

      // Drain circle
      ctx.fillStyle = '#94a3b8';
      ctx.beginPath();
      ctx.arc(0, pd * 0.28, 2.5, 0, Math.PI * 2);
      ctx.fill();

    } else if (nm.includes('vanity') || nm.includes('sink')) {
      // Drop-in oval sink vanity
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(-pw / 2, -pd / 2, pw, pd);
      ctx.strokeStyle = '#64748b';
      ctx.lineWidth = 1.2;
      ctx.strokeRect(-pw / 2, -pd / 2, pw, pd);

      // Oval basin
      ctx.fillStyle = isPresentation ? '#f1f5f9' : '#0f172a';
      ctx.beginPath();
      ctx.ellipse(0, 0, pw * 0.35, pd * 0.3, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#94a3b8';
      ctx.stroke();

      // Faucet dot
      ctx.fillStyle = '#0284c7';
      ctx.beginPath();
      ctx.arc(0, -pd * 0.25, 2, 0, Math.PI * 2);
      ctx.fill();
    }
  },

  drawWasherDryer(ctx: CanvasRenderingContext2D, pw: number, pd: number, isPresentation: boolean) {
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(-pw / 2, -pd / 2, pw, pd);
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 1.2;
    ctx.strokeRect(-pw / 2, -pd / 2, pw, pd);

    // Split line between Washer and Dryer
    ctx.beginPath();
    ctx.moveTo(0, -pd / 2);
    ctx.lineTo(0, pd / 2);
    ctx.stroke();

    // Circular glass door viewports
    const r = Math.min(pw / 2, pd) * 0.32;
    ctx.fillStyle = isPresentation ? '#e2e8f0' : '#1e293b';
    ctx.beginPath();
    ctx.arc(-pw * 0.25, 0, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(pw * 0.25, 0, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  },

  drawOfficeDesk(ctx: CanvasRenderingContext2D, nm: string, pw: number, pd: number, isPresentation: boolean) {
    ctx.fillStyle = isPresentation ? '#f8fafc' : '#1e293b';
    ctx.fillRect(-pw / 2, -pd / 2, pw, pd);
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 1.2;
    ctx.strokeRect(-pw / 2, -pd / 2, pw, pd);

    // Computer Monitor
    ctx.strokeStyle = '#0284c7';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-pw * 0.25, -pd * 0.25);
    ctx.lineTo(pw * 0.25, -pd * 0.25);
    ctx.stroke();
  },

  drawWardrobe(ctx: CanvasRenderingContext2D, pw: number, pd: number, isPresentation: boolean) {
    ctx.fillStyle = isPresentation ? '#f8fafc' : '#1e293b';
    ctx.fillRect(-pw / 2, -pd / 2, pw, pd);
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 1.2;
    ctx.strokeRect(-pw / 2, -pd / 2, pw, pd);

    // Hanger rail lines
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 1;
    const count = 5;
    const step = pw / (count + 1);
    for (let i = 1; i <= count; i++) {
      ctx.beginPath();
      ctx.moveTo(-pw / 2 + i * step - 3, -pd * 0.2);
      ctx.lineTo(-pw / 2 + i * step + 3, pd * 0.2);
      ctx.stroke();
    }
  },

  drawPottedPlant(ctx: CanvasRenderingContext2D, radius: number) {
    ctx.fillStyle = '#16a34a';
    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, Math.PI * 2);
    ctx.fill();

    // 8 radial leaf fronds
    ctx.strokeStyle = '#15803d';
    ctx.lineWidth = 1.5;
    for (let a = 0; a < Math.PI * 2; a += Math.PI / 4) {
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(Math.cos(a) * radius * 1.3, Math.sin(a) * radius * 1.3);
      ctx.stroke();
    }
  }
};
