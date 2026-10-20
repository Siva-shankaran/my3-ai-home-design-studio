# MY3 Desings — AI Architectural Design, Civil Engineering & Construction Studio

[![Vercel Deployment](https://img.shields.io/badge/Deploy-Vercel-black?style=for-the-badge&logo=vercel)](https://vercel.com/new/clone?repository-url=https://github.com/Siva-shankaran/my3-ai-home-design-studio)
[![Deploy to Render](https://img.shields.io/badge/Deploy-Render-46E3B7?style=for-the-badge&logo=render)](https://render.com/deploy?repo=https://github.com/Siva-shankaran/my3-ai-home-design-studio)
[![Build Status](https://img.shields.io/badge/Build-Passing-22c55e?style=for-the-badge&logo=githubactions)](https://github.com/Siva-shankaran/my3-ai-home-design-studio)
[![TNCDBR-2019 Compliant](https://img.shields.io/badge/Standard-TNCDBR--2019%20%2F%20IS%20456-dc2626?style=for-the-badge)](https://github.com/Siva-shankaran/my3-ai-home-design-studio)

> **Tamil Nadu-First AI Home-Design Platform**: Transforming initial residential ideas into fully documented, municipality-compliant, 2D/3D editable architectural blueprints for homeowners, architects, civil engineers, and builders.

---

## 🏛️ Platform Highlights

1. **Precision 2D Vector CAD Engine:**
   - Multi-floor drafting canvas with real-time room resizing, wall geometry snap, automated dimension chains, and RCC column grids.
   - Dual-render modes: **Presentation Maket Studio** (Warm Oak plank textures, tile patterns, furniture layouts) and **Technical CAD Drafting Mode**.

2. **3D WebGL Spatial Studio (Three.js):**
   - True multi-floor stacking, interactive orbital cameras, real-time sun angle/shadow simulation, and exploded structural floor inspections.

3. **Tamil Nadu Design Intelligence:**
   - **TNCDBR-2019 Compliance Engine**: Live verification of FSI limits, max 70% ground coverage, mandatory road setback clearances, and staircase ratios.
   - **Local Land Unit Conversion**: Instant calculations across Square Feet, Tamil Nadu **Cents** (1 Cent = 435.6 sq ft), and Chennai **Grounds** (1 Ground = 2,400 sq ft).
   - **Geotechnical Soil Stratum & Foundation Concepting**: Automated recommendations across Isolated Pad Footings, Raft/Mat Slabs, and Under-Reamed Piles based on regional district soil profiles (Chennai, Coimbatore, Madurai, Trichy, Salem).
   - **Regional BOQ & Material Estimator**: Automated Bill of Quantities calculating 53-Grade Cement bags, Fe550D TMT Steel metric tonnes, M-Sand (cft), and Class-1 clay bricks with live INR pricing.
   - **Vernacular Presets**: One-click generation of traditional Chettinad *Thinnai* verandahs, carved teak pillars, central open-to-sky *Muttram* courtyards, and Chennai 30×40 urban duplex configurations.

4. **Talk to Your Plan (Nemotron-3.5 AI Assistant):**
   - Natural language conversational edits: *"Expand living room by 20%"*, *"Add guest powder room"*, *"Verify IRC egress windows"*.
   - Generates structured, schema-constrained plan updates with transparent reasoning traces and engineering notes.

5. **DeepSeek V4.1 Blueprint Digitizer:**
   - Vectorizes uploaded raster sketches or PDF blueprints into fully editable CAD geometry.

6. **Executive Export Suite:**
   - **A3 Landscape Architectural Sheet (PDF)**: Includes official municipal drawing sheet borders, title block, room schedule, column schedule, and engineer stamp.
   - **Scalable Vector Graphics (SVG)**: Layered vector geometry with separated layers for walls, dimensions, columns, and furniture.
   - **300 DPI Ultra-HD Render (PNG)**: Lossless presentation imagery with textures and dimensions.
   - **AutoCAD DXF Vector File**: Standard ASCII entities compatible with AutoCAD, Revit, SketchUp, and ArchiCAD.

---

## 🎨 Architectural Design Language (Hallmark Theme)

The UI adheres strictly to the **Charcoal Grey + Moonlight Silver + Signal Red** precision drafting palette:
- **Charcoal Grey (`#0f172a`, `#18181b`)**: Structural ink typography, authoritative high-contrast borders, and grounding dark accents.
- **Moonlight Silver (`#f8fafc`, `#f1f5f9`, `#e2e8f0`, `#cbd5e1`)**: Luminous metallic drafting paper surfaces, frosted toolbars, and hairline grid dividers.
- **Signal Red (`#dc2626`, `#ef4444`)**: Surgical engineering accent for active CAD tools, brand compass, primary CTAs, and compliance notifications.
- **Warm Oak Flooring (`#fbf5e6` with `#dfcfb2` wood grain planks)**: Elegantly rendered interior floors with 1-click whole-home moodboard transformation (Scandinavian Hygge, Contemporary Tamil Nadu, Chettinad Heritage, Japandi Minimalist).

---

## 🚀 Quick Deployment Guide

### Option 1: Deploy to Vercel (1-Click)

1. Click the **Deploy to Vercel** button above or import the repository into [Vercel](https://vercel.com).
2. Set the Framework Preset to **Vite**.
3. In **Environment Variables**, add:
   - `VITE_NVIDIA_BASE_URL`: `https://integrate.api.nvidia.com/v1`
   - `VITE_NVIDIA_NEMOTRON_KEY`: Your NVIDIA NIM Nemotron API Key
   - `VITE_NVIDIA_DEEPSEEK_KEY`: Your NVIDIA NIM DeepSeek API Key
4. Deploy! Vercel will automatically read [`vercel.json`](./vercel.json) for SPA client-side routing.

### Option 2: Deploy to Render (Static Site or Blueprint)

1. Connect your repository to [Render](https://render.com).
2. Choose **Static Site**:
   - **Build Command**: `npm run build`
   - **Publish Directory**: `dist`
   - **Rewrite Rules**: Source: `/*`, Destination: `/index.html`
3. Or deploy using the included [`render.yaml`](./render.yaml) Blueprint!

### Option 3: Continuous Monitoring with UptimeRobot

Keep your live production deployment verified and monitored 24/7 with [UptimeRobot](https://uptimerobot.com):

1. Log in to **UptimeRobot** and click **+ Add New Monitor**.
2. **Monitor Type**: `HTTP(s)`
3. **Friendly Name**: `MY3 AI Home Design Studio`
4. **URL (or IP)**: `https://<your-deployed-app-url>/health.json` (or your root URL `https://<your-app-url>/`)
5. **Monitoring Interval**: `5 minutes`
6. **Alert Contacts**: Select your email or Slack channel.
7. Click **Create Monitor**. The dedicated [`public/health.json`](./public/health.json) endpoint will return instant `200 OK` responses without loading 3D WebGL assets!

---

## 💻 Local Development Setup

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher

### Installation

```bash
# 1. Clone repository
git clone https://github.com/Siva-shankaran/my3-ai-home-design-studio.git
cd my3-ai-home-design-studio

# 2. Install dependencies
npm install

# 3. Configure environment
cp .env.example .env.local
# Add your NVIDIA API keys to .env.local

# 4. Run development server
npm run dev

# 5. Execute engineering test suite
npm test

# 6. Production build verification
npm run build
```

---

## 🧪 Automated Test Suite

The platform includes an automated testing framework verifying engineering constraints and geometric integrity:

```bash
npm test
```

Test validations covered:
- Multi-floor geometry continuity and boundary polygon validation.
- RCC Column grid alignment and structural load paths.
- TNCDBR-2019 legal rule evaluation and clause verification.
- Geotechnical SBC (Safe Bearing Capacity) and foundation recommendation engine.
- Tamil Nadu BOQ material calculator and Cents/Grounds conversions.
- Traditional Chettinad Thinnai & Muttram courtyard generator.
- Multi-language Tamil (தமிழ்) / English i18n string sanitizer.
- Vector SVG CAD export layer generation.

---

## 📄 License & Credits

Built with precision by **MY3 Desings**.
Architectural standards referenced: **TNCDBR-2019**, **National Building Code of India (NBC 2016)**, and **IS 456:2000**.
