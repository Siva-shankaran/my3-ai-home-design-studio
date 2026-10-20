# Design — MY3 Desings

A locked design system for MY3 Desings (AI Home Design, Architectural CAD & Civil Engineering Studio). Engineered under the Hallmark Anti-AI-Slop framework.

/* Hallmark · macrostructure: Workbench / Split-Studio · theme: Ivory-Emerald · tone: architectural-stationery */

## 1. Genre
**modern-minimal** (Precision architectural software & civil engineering studio, executed in the Le Corbusier / Vitra / Architectural Monograph register).

## 2. Macrostructure Family
- **Marketing / Entry**: `15-split-studio` + `05-workbench`. Left column provides architectural brief specification and live parameter dials; right column provides live vector blueprint proof with structural columns, dimension callouts, and TNCDBR-2019 compliance stamps.
- **Studio / CAD / 3D**: `05-workbench`. High-density, ruler-drawn CAD canvas with multi-floor isolation, real dimension tags, 2D vector snapping, and Three.js WebGL spatial modeler with authentic material physically-based rendering (PBR).
- **Modals / Inspectors**: Swiss hairline ruled sheets with 1px border dividers, zero drop-shadow blur, and tight 4px–6px technical radii.

## 3. Theme Tokens (Warm Ivory + Emerald Green + Vermilion)
Executed on archival warm ivory parchment with ruler-drawn hairlines, deep forest-charcoal ink, deep architectural emerald green as the primary structural signal, and crisp vermilion as the precision annotation and callout signal.

```css
:root, [data-theme="ivory-emerald"] {
  --color-paper:        oklch(96.8% 0.016 88);   /* #fcf9f2 - Warm Ivory archival drafting sheet */
  --color-paper-2:      oklch(94.0% 0.020 86);   /* #f4eee1 - Elevated toolbars & panel surfaces */
  --color-paper-3:      oklch(90.5% 0.024 84);   /* #eae0cd - Interactive chips, cards & inputs */
  --color-rule:         oklch(82.5% 0.018 80);   /* #d5c8b2 - Precision ruler-drawn hairline */
  --color-rule-2:       oklch(68.0% 0.024 76);   /* #ae9e85 - Structural divider rule */
  --color-muted:        oklch(48.0% 0.025 155);  /* #52665e - Dimension callouts & technical metadata */
  --color-neutral:      oklch(36.0% 0.028 155);  /* #3a4e46 - Secondary labels */
  --color-ink-2:        oklch(26.0% 0.030 155);  /* #23352d - Body copy */
  --color-ink:          oklch(16.5% 0.035 155);  /* #10211a - Deep forest charcoal ink (never #000) */

  /* Signals */
  --color-accent:       oklch(48.0% 0.165 158);  /* #057a55 - Deep Architectural Emerald Green */
  --color-accent-ink:   oklch(98.5% 0.008 88);   /* Warm Ivory text on emerald */
  --color-vermilion:    oklch(58.0% 0.225 32);   /* #df3b20 - Crisp Architectural Vermilion */
  --color-vermilion-ink:oklch(99.0% 0.005 88);   /* Warm Ivory text on vermilion */
  --color-focus:        oklch(48.0% 0.165 158);
  --color-graphite:     oklch(14.0% 0.025 155);  /* #0d1914 - Dark CAD blueprint contrast ground */

  /* Technical radii — drawn with a ruler, zero generic rounded-full pills */
  --radius-card:        6px;
  --radius-pill:        4px;
  --radius-input:       4px;
  --shadow-card:        none;                   /* depth comes from borders, not blur */
}
```

## 4. Typography
- **Display**: `Space Grotesk`, weights 500 / 600 / 700, style `normal` (Roman only, zero italic headers per Gate 38a). Letter-spacing: `-0.03em`.
- **Body**: `Inter`, weights 400 / 500, line-height 1.5. Clean, authoritative legibility.
- **Engineering & Dimension Readouts**: `JetBrains Mono`, weights 400 / 500 / 600. All dimensions (`14' - 6" × 18' - 0"`), coordinates, structural column IDs (`C1`, `C2`), TNCDBR rules, and BOQ meters.

## 5. Navigation & Multi-Step Routing
- **Step 1 (First Land)**: Entry URL `/` or `#/landing` always loads the **Landing Page** first.
- **Step 2 (Projects / Selection)**: "Generate Plan" / "Launch CAD Canvas" routes to the **Dashboard** (`#/dashboard`).
- **Step 3 (CAD Vector Drafting)**: Selecting or generating a plan opens the **2D CAD Canvas** (`#/editor2d`).
- **Step 4 (Spatial Studio)**: Clicking 3D Studio opens the **3D Studio** (`#/studio3d`).
- Direct URL hash preservation: When a user refreshes on `#/dashboard` or `#/editor2d`, they remain on that step; fresh visits without a hash always land on the Landing Page first.
