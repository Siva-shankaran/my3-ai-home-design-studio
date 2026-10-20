import React, { useRef, useState, useEffect, useCallback } from 'react';
import type { Room, FurnitureItem, Door, WindowItem, Project, Column, RoomCamera } from '../types';
import { type Language, getRoomDisplayName, translations } from '../services/i18n';
import { materialCatalogService, type MaterialSwatch, type WholeHomeTheme } from '../services/materialCatalogService';
import { InteriorsCustomizerModal } from './InteriorsCustomizerModal';
import { InteriorReferenceModal } from './InteriorReferenceModal';
import { Units } from '../engine/geometry/units';
import { FurnitureSymbolRenderer } from '../engine/furniture/furnitureLibrary';
import { 
  ZoomIn, ZoomOut, Maximize2, Move, Square, 
  Trash2, RotateCw, Eye, Ruler, Palette, Columns2,
  Layers, Check, SlidersHorizontal, Download, Sparkles, Building,
  Wand2, Info, X, Image as ImageIcon, ArrowRight, ShieldCheck, Camera
} from 'lucide-react';

interface CADCanvas2DProps {
  project: Project;
  onUpdateProject: (updated: Project) => void;
  selectedTool: 'select' | 'room' | 'wall' | 'door' | 'window' | 'measure' | 'furniture';
  unit: 'imperial' | 'metric';
  activeFloor: number;
  language?: Language;
  cadStyleMode?: 'presentation' | 'cad';
  isMultiFloorSideBySide?: boolean;
  onSelectFloor?: (floor: number) => void;
  onToggleSideBySide?: (sideBySide: boolean) => void;
  onToggleCadStyle?: (mode: 'presentation' | 'cad') => void;
  onToggleLanguage?: (lang: Language) => void;
  onOpenExport?: () => void;
  onOpenInteriorReferences?: () => void;
  onToggleStatsDrawer?: () => void;
}

export const CADCanvas2D: React.FC<CADCanvas2DProps> = ({
  project,
  onUpdateProject,
  selectedTool,
  unit,
  activeFloor,
  language = 'en',
  cadStyleMode = 'presentation',
  isMultiFloorSideBySide = false,
  onSelectFloor,
  onToggleSideBySide,
  onToggleCadStyle,
  onToggleLanguage,
  onOpenExport,
  onOpenInteriorReferences,
  onToggleStatsDrawer
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Viewport transformation
  const [scale, setScale] = useState<number>(1.1);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 90, y: 70 });
  const [isPanning, setIsPanning] = useState<boolean>(false);
  const [startPan, setStartPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [mouseMovedDistance, setMouseMovedDistance] = useState<number>(0);

  // Selection state
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
  const [selectedFurnitureId, setSelectedFurnitureId] = useState<string | null>(null);

  // Engineer Layer Visibility Controls
  const [showWalls, setShowWalls] = useState<boolean>(true);
  const [showDimensions, setShowDimensions] = useState<boolean>(true);
  const [showFurniture, setShowFurniture] = useState<boolean>(true);
  const [showColumns, setShowColumns] = useState<boolean>(false);
  const [showLabels, setShowLabels] = useState<boolean>(true);
  const [showCameras, setShowCameras] = useState<boolean>(false);

  // Interactive Material & Whole-Home Theme State
  const [customizerOpen, setCustomizerOpen] = useState<boolean>(false);
  const [activeCustomizingRoom, setActiveCustomizingRoom] = useState<Room | null>(null);
  const [activeCustomizingFurniture, setActiveCustomizingFurniture] = useState<FurnitureItem | null>(null);
  const [activeWholeHomeTheme, setActiveWholeHomeTheme] = useState<string>('modern_urban_loft');
  const [isInteriorRefOpen, setIsInteriorRefOpen] = useState<boolean>(false);
  const [toastNotification, setToastNotification] = useState<string | null>(null);

  // Conversion: 1 unit in model = 1 foot. Scale factor for pixels
  const GRID_SIZE = 20; // 20px per foot at scale 1.0

  const formatDistance = (feet: number) => {
    return Units.formatDistance(feet, unit);
  };

  const formatArea = (sqft: number) => {
    return Units.formatArea(sqft, unit);
  };

  /**
   * Applies Whole-Home Theme at once (Transforms all rooms, walls, rugs, and furnishings together)
   */
  const handleApplyWholeHomeTheme = useCallback((themeId: string) => {
    setActiveWholeHomeTheme(themeId);
    const updated = materialCatalogService.applyWholeHomeTheme(project, themeId);
    onUpdateProject(updated);

    const themeObj = materialCatalogService.wholeHomeThemes.find(t => t.id === themeId);
    const name = language === 'ta' ? themeObj?.nameTamil || themeObj?.name : themeObj?.name;
    setToastNotification(`✨ ${name || 'Theme'} ${language === 'ta' ? 'முழு வீட்டிற்கும் மாற்றப்பட்டது!' : 'Applied to Entire Home! (All rooms, walls & furnishings updated)'}`);
    setTimeout(() => setToastNotification(null), 4000);
  }, [project, onUpdateProject, language]);

  // Main Canvas Render Pipeline
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Handle high DPI
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const isPresentation = cadStyleMode === 'presentation';

    // Clear background: Warm light off-white (#fafaf9) in presentation mode
    ctx.fillStyle = isPresentation ? '#fafaf9' : '#080c14';
    ctx.fillRect(0, 0, rect.width, rect.height);

    ctx.save();
    ctx.translate(pan.x, pan.y);
    ctx.scale(scale, scale);

    // 1. Draw Architectural Grid
    drawGrid(ctx, rect.width, rect.height, isPresentation);

    // 2. Render Floor Plans (Single floor OR Side-by-Side Multi-floor mode)
    if (isMultiFloorSideBySide && project.floors >= 2) {
      // Ground Floor Plan (Left)
      ctx.save();
      drawFloorPlan(
        ctx, 
        1, 
        0, 
        0, 
        language === 'ta' ? 'தரைத்தளம் (GROUND FLOOR)' : 'GROUND FLOOR PLAN',
        isPresentation
      );
      ctx.restore();

      // First Floor Plan (Right, shifted by 52 feet)
      const floor2OffsetX = 52 * GRID_SIZE;
      ctx.save();
      ctx.translate(floor2OffsetX, 0);
      drawFloorPlan(
        ctx, 
        2, 
        0, 
        0, 
        language === 'ta' ? 'முதல் தளம் (FIRST FLOOR)' : 'FIRST FLOOR PLAN',
        isPresentation
      );
      ctx.restore();
    } else {
      // Single active floor centered
      const floorTitle = activeFloor === 1 
        ? (language === 'ta' ? 'தரைத்தளம் (GROUND FLOOR)' : 'GROUND FLOOR PLAN')
        : (language === 'ta' ? 'முதல் தளம் (FIRST FLOOR)' : 'FIRST FLOOR PLAN');
      drawFloorPlan(ctx, activeFloor, 0, 0, floorTitle, isPresentation);
    }

    ctx.restore();
  }, [
    project, scale, pan, selectedRoomId, selectedFurnitureId, 
    showDimensions, showWalls, showFurniture, showColumns, showLabels,
    unit, activeFloor, language, cadStyleMode, isMultiFloorSideBySide
  ]);

  /**
   * Draws dot grid in presentation mode (Maket.ai style) or technical grid in CAD mode
   */
  const drawGrid = (ctx: CanvasRenderingContext2D, _width: number, _height: number, isPresentation: boolean) => {
    ctx.save();
    const startX = -1000;
    const endX = 4000;
    const startY = -1000;
    const endY = 4000;

    if (isPresentation) {
      ctx.fillStyle = '#cbd5e1';
      const dotSpacing = GRID_SIZE;
      for (let x = startX; x <= endX; x += dotSpacing) {
        for (let y = startY; y <= endY; y += dotSpacing) {
          ctx.beginPath();
          ctx.arc(x, y, 1.0, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    } else {
      ctx.lineWidth = 0.5;
      ctx.strokeStyle = 'rgba(30, 41, 59, 0.35)';
      ctx.beginPath();
      for (let x = startX; x <= endX; x += GRID_SIZE) {
        ctx.moveTo(x, startY);
        ctx.lineTo(x, endY);
      }
      for (let y = startY; y <= endY; y += GRID_SIZE) {
        ctx.moveTo(startX, y);
        ctx.lineTo(endX, y);
      }
      ctx.stroke();
    }
    ctx.restore();
  };

  /**
   * Draws a complete floor plan for a specific level
   */
  const drawFloorPlan = (
    ctx: CanvasRenderingContext2D,
    floorNum: number,
    _offsetX: number,
    _offsetY: number,
    titleBanner: string,
    isPresentation: boolean
  ) => {
    const rooms = project.rooms.filter(r => (r.floor || 1) === floorNum);

    // 1. Draw Plot Setback Boundary
    if (floorNum === 1 && rooms.length > 0) {
      drawPlotBoundary(ctx, rooms, isPresentation);
    }

    // 2. Draw Rooms with Luxury Image 1 Finishes (Terrazzo, Hardwood, Merino Marble, etc.)
    rooms.forEach(room => {
      drawRoom(ctx, room, room.id === selectedRoomId, isPresentation);
      if (room.type === 'stairwell' || room.name.toLowerCase().includes('stair')) {
        drawStaircase(ctx, room, floorNum, isPresentation);
      }
    });

    // 3. Draw Doors & Windows
    if (showWalls) {
      project.doors
        .filter(door => (door.floor || 1) === floorNum)
        .forEach(door => drawDoor(ctx, door, isPresentation));

      project.windows
        .filter(win => (win.floor || 1) === floorNum)
        .forEach(win => drawWindow(ctx, win, isPresentation));
    }

    // 4. Draw Furniture (Beds, Sofas, Marble Dining Tables, Fixtures)
    if (showFurniture) {
      project.furniture
        .filter(item => (item.floor || 1) === floorNum)
        .forEach(item => {
          drawFurniture(ctx, item, item.id === selectedFurnitureId, isPresentation);
        });
    }

    // 5. Draw RCC Structural Columns
    if (showColumns) {
      const currentColumns = (project.columns || []).filter(c => (c.floor || 1) === floorNum);
      currentColumns.forEach(col => {
        drawColumn(ctx, col, isPresentation);
      });
    }

    // 6. Draw 3D Viewpoint Cameras (Maket.ai Spec - toggleable to preserve drafting clarity)
    if (showCameras && project.cameras && project.cameras.length > 0) {
      project.cameras
        .filter(cam => (cam.level || 1) === floorNum)
        .forEach(cam => {
          drawCamera(ctx, cam, isPresentation);
        });
    }

    // 7. Draw Floor Title Header Banner
    drawFloorTitleBanner(ctx, rooms, titleBanner, isPresentation);
  };

  /**
   * Draws 3D Perspective Camera viewpoints with FOV projection cones (Maket.ai style)
   */
  const drawCamera = (ctx: CanvasRenderingContext2D, cam: RoomCamera, isPresentation: boolean) => {
    const cx = cam.position[0] * GRID_SIZE;
    const cy = cam.position[1] * GRID_SIZE;
    const fovRad = ((cam.fov || 50) * Math.PI) / 180;
    const rayLen = 18;

    ctx.save();

    // 1. Subtle FOV Vision Cone
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, rayLen, -fovRad / 2, fovRad / 2);
    ctx.closePath();
    ctx.fillStyle = 'rgba(220, 38, 38, 0.05)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(220, 38, 38, 0.35)';
    ctx.lineWidth = 0.8;
    ctx.setLineDash([2, 2]);
    ctx.stroke();
    ctx.setLineDash([]);

    // 2. Camera Lens Dot
    ctx.beginPath();
    ctx.arc(cx, cy, 3, 0, Math.PI * 2);
    ctx.fillStyle = '#dc2626';
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.restore();
  };

  /**
   * Draws Plot Boundary with Setbacks & Entry Gate
   */
  const drawPlotBoundary = (ctx: CanvasRenderingContext2D, rooms: Room[], isPresentation: boolean) => {
    if (rooms.length === 0) return;

    const minX = Math.min(...rooms.map(r => r.x));
    const maxX = Math.max(...rooms.map(r => r.x + r.width));
    const minY = Math.min(...rooms.map(r => r.y));
    const maxY = Math.max(...rooms.map(r => r.y + r.height));

    const marginFt = 4;
    const plotX = (minX - marginFt) * GRID_SIZE;
    const plotY = (minY - marginFt) * GRID_SIZE;
    const plotW = (maxX - minX + marginFt * 2) * GRID_SIZE;
    const plotH = (maxY - minY + marginFt * 2 + 4) * GRID_SIZE;

    ctx.save();
    ctx.strokeStyle = isPresentation ? '#cbd5e1' : '#64748b';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([6, 4]);
    ctx.strokeRect(plotX, plotY, plotW, plotH);
    ctx.setLineDash([]);

    // Front Entrance GATE Marker
    const gateW = 10 * GRID_SIZE;
    const gateX = plotX + plotW * 0.55;
    const gateY = plotY + plotH;

    ctx.fillStyle = isPresentation ? '#fafaf9' : '#080c14';
    ctx.fillRect(gateX - 2, gateY - 3, gateW + 4, 6);

    ctx.strokeStyle = '#2563eb';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(gateX, gateY);
    ctx.lineTo(gateX + gateW, gateY);
    ctx.stroke();

    ctx.fillStyle = '#2563eb';
    ctx.font = 'bold 10px JetBrains Mono, monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillText('ENTRY GATE (தளம்)', gateX + gateW / 2, gateY + 4);

    if (showDimensions) {
      const plotWidthFt = Math.round(maxX - minX + marginFt * 2);
      const plotDepthFt = Math.round(maxY - minY + marginFt * 2 + 4);

      ctx.fillStyle = isPresentation ? '#64748b' : '#94a3b8';
      ctx.font = 'bold 10px JetBrains Mono, monospace';
      ctx.textAlign = 'center';
      ctx.fillText(`${plotWidthFt}' - 0"`, plotX + plotW / 2, plotY - 10);

      ctx.save();
      ctx.translate(plotX - 12, plotY + plotH / 2);
      ctx.rotate(-Math.PI / 2);
      ctx.fillText(`${plotDepthFt}' - 0"`, 0, 0);
      ctx.restore();
    }

    ctx.restore();
  };

  /**
   * Draws a Room with Real Architectural Material Finishes (Image 1 Style)
   */
  const drawRoom = (
    ctx: CanvasRenderingContext2D, 
    room: Room, 
    isSelected: boolean,
    isPresentation: boolean
  ) => {
    const px = room.x * GRID_SIZE;
    const py = room.y * GRID_SIZE;
    const pw = room.width * GRID_SIZE;
    const ph = room.height * GRID_SIZE;

    ctx.save();

    // 1. FLOOR MATERIAL TEXTURES (Matching Image 1 Specifications)
    if (isPresentation) {
      const finish = room.floorFinish || (
        room.type === 'master_bedroom' || room.type === 'bedroom' ? 'hardwood' :
        room.type === 'bathroom' ? 'avocado_marble' :
        room.type === 'master_bath' ? 'rossa_marble' :
        room.type === 'thinnai' ? 'athangudi' :
        room.type === 'balcony' || room.type === 'patio' ? 'mahogany_deck' :
        room.type === 'muttram' ? 'grass' : 'terrazzo'
      );

      if (finish === 'terrazzo') {
        // Terrazzo Tile (Image 1)
        ctx.fillStyle = '#f1f5f9';
        ctx.fillRect(px, py, pw, ph);
        drawTerrazzoFlecks(ctx, px, py, pw, ph);
        drawTileGrid(ctx, px, py, pw, ph, 24, '#e2e8f0');

      } else if (finish === 'hardwood') {
        // Natural Warm Oak Hardwood Planks (Warm Honey Oak Tone)
        ctx.fillStyle = '#fbf5e6';
        ctx.fillRect(px, py, pw, ph);
        drawWoodPlankGrid(ctx, px, py, pw, ph, '#dfcfb2', 15);

      } else if (finish === 'merino_marble') {
        // Italian Merino Marble with feather veins (Image 1)
        ctx.fillStyle = '#f8fafc';
        ctx.fillRect(px, py, pw, ph);
        drawMarbleVeins(ctx, px, py, pw, ph, 'rgba(148, 163, 184, 0.45)');
        drawTileGrid(ctx, px, py, pw, ph, 30, 'rgba(203, 213, 225, 0.35)');

      } else if (finish === 'mahogany_deck') {
        // Mahogany Deckwood with dark expansion grooves (Image 1)
        ctx.fillStyle = '#78350f';
        ctx.fillRect(px, py, pw, ph);
        drawDeckGrooves(ctx, px, py, pw, ph, '#451a03', 10);

      } else if (finish === 'athangudi') {
        // Athangudi Terracotta heritage tiles
        ctx.fillStyle = '#fed7aa';
        ctx.fillRect(px, py, pw, ph);
        drawTileGrid(ctx, px, py, pw, ph, 18, 'rgba(234, 88, 12, 0.3)');

      } else if (finish === 'chequered_mosaic') {
        // Solid Mosaic Chequered black & white (Image 1)
        drawChequeredMosaic(ctx, px, py, pw, ph, 14);

      } else if (finish === 'avocado_marble') {
        // Avocado Serpentine green marble (Image 1)
        ctx.fillStyle = '#dcfce7';
        ctx.fillRect(px, py, pw, ph);
        drawMarbleVeins(ctx, px, py, pw, ph, 'rgba(22, 101, 52, 0.4)');

      } else if (finish === 'rossa_marble') {
        // Rossa Portugallo salmon pink marble (Image 1)
        ctx.fillStyle = '#ffe4e6';
        ctx.fillRect(px, py, pw, ph);
        drawMarbleVeins(ctx, px, py, pw, ph, 'rgba(225, 29, 72, 0.35)');

      } else if (finish === 'grass') {
        // Central Courtyard Lawn
        ctx.fillStyle = '#16a34a';
        ctx.fillRect(px, py, pw, ph);
        drawPottedPlant(ctx, px + pw / 2, py + ph / 2, 11);

      } else {
        ctx.fillStyle = '#f8fafc';
        ctx.fillRect(px, py, pw, ph);
      }

      // Designer Area Rug (Viscaya, Chroma, Genesis, Afterglow from Image 1)
      if (room.rugPattern && room.rugPattern !== 'none') {
        drawAreaRug(ctx, px, py, pw, ph, room.rugPattern);
      }

    } else {
      // CAD Blueprint mode
      ctx.fillStyle = isSelected ? 'rgba(56, 189, 248, 0.12)' : '#0d131f';
      ctx.fillRect(px, py, pw, ph);
    }

    // 2. WALL TREATMENT (Solid Charcoal Slate or Natural Oak Veneer Slats)
    if (showWalls) {
      if (room.wallFinish === 'veneer' && isPresentation) {
        // Fluted Oak Veneer Feature Wall along perimeter
        drawWoodVeneerWall(ctx, px, py, pw, ph);
      }

      ctx.lineWidth = isSelected ? 5 : (isPresentation ? 6 : 3.5);
      ctx.lineJoin = 'miter';
      ctx.strokeStyle = isSelected 
        ? '#0284c7' 
        : (room.wallColor || (isPresentation ? '#18181b' : '#38bdf8'));
      ctx.strokeRect(px, py, pw, ph);
    }

    // 3. SELECTION / TOUCH HIGHLIGHT PULSE
    if (isSelected) {
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 2;
      ctx.setLineDash([4, 4]);
      ctx.strokeRect(px - 3, py - 3, pw + 6, ph + 6);
      ctx.setLineDash([]);
    }

    // 4. SMART ROOM LABEL BADGE
    if (showLabels) {
      drawSmartRoomBadge(ctx, room, px, py, pw, ph, isPresentation);
    }

    ctx.restore();
  };

  /**
   * Draws realistic Terrazzo flecks (Image 1 pattern)
   */
  const drawTerrazzoFlecks = (
    ctx: CanvasRenderingContext2D, 
    x: number, 
    y: number, 
    w: number, 
    h: number
  ) => {
    ctx.save();
    const fleckColors = ['#94a3b8', '#cbd5e1', '#64748b', '#e2e8f0'];
    const count = Math.round((w * h) / 120);

    for (let i = 0; i < count; i++) {
      // Deterministic pseudo-random fleck based on offset
      const fx = x + ((i * 37) % Math.round(w));
      const fy = y + ((i * 59) % Math.round(h));
      const color = fleckColors[i % fleckColors.length];
      const r = (i % 3 === 0) ? 1.5 : 1.0;

      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(fx, fy, r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  };

  /**
   * Draws organic marble feather veins
   */
  const drawMarbleVeins = (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    w: number,
    h: number,
    color: string
  ) => {
    ctx.save();
    ctx.strokeStyle = color;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x + w * 0.1, y);
    ctx.bezierCurveTo(x + w * 0.3, y + h * 0.4, x + w * 0.6, y + h * 0.3, x + w * 0.9, y + h);
    ctx.moveTo(x, y + h * 0.6);
    ctx.bezierCurveTo(x + w * 0.4, y + h * 0.5, x + w * 0.5, y + h * 0.8, x + w * 0.7, y + h);
    ctx.stroke();
    ctx.restore();
  };

  /**
   * Draws Mahogany Deck grooves with screw fixings
   */
  const drawDeckGrooves = (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    w: number,
    h: number,
    color: string,
    spacing: number
  ) => {
    ctx.save();
    ctx.strokeStyle = color;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    for (let dy = y; dy <= y + h; dy += spacing) {
      ctx.moveTo(x, dy);
      ctx.lineTo(x + w, dy);
    }
    ctx.stroke();
    ctx.restore();
  };

  /**
   * Draws solid mosaic chequered tile pattern (Image 1 pattern)
   */
  const drawChequeredMosaic = (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    w: number,
    h: number,
    tileSize: number
  ) => {
    ctx.save();
    for (let tx = x; tx < x + w; tx += tileSize) {
      for (let ty = y; ty < y + h; ty += tileSize) {
        const colIdx = Math.floor((tx - x) / tileSize);
        const rowIdx = Math.floor((ty - y) / tileSize);
        const isBlack = (colIdx + rowIdx) % 2 === 0;

        ctx.fillStyle = isBlack ? '#1e293b' : '#ffffff';
        ctx.fillRect(tx, ty, Math.min(tileSize, x + w - tx), Math.min(tileSize, y + h - ty));
      }
    }
    ctx.restore();
  };

  /**
   * Draws fluted wood veneer slats along walls
   */
  const drawWoodVeneerWall = (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    w: number,
    h: number
  ) => {
    ctx.save();
    ctx.strokeStyle = '#854d0e';
    ctx.lineWidth = 1.5;
    const slatGap = 5;
    for (let sx = x + 3; sx <= x + w - 3; sx += slatGap) {
      ctx.beginPath();
      ctx.moveTo(sx, y + 2);
      ctx.lineTo(sx, y + 8);
      ctx.stroke();
    }
    ctx.restore();
  };

  /**
   * Draws Designer Area Rugs (Image 1 Patterns: Viscaya, Chroma, Genesis, Afterglow)
   */
  const drawAreaRug = (
    ctx: CanvasRenderingContext2D,
    rx: number,
    ry: number,
    rw: number,
    rh: number,
    pattern: string
  ) => {
    const rugW = rw * 0.7;
    const rugH = rh * 0.62;
    const rugX = rx + (rw - rugW) / 2;
    const rugY = ry + (rh - rugH) / 2;

    ctx.save();
    if (pattern === 'viscaya') {
      // Viscaya textured charcoal/beige rug (Image 1)
      ctx.fillStyle = '#e2e8f0';
      ctx.fillRect(rugX, rugY, rugW, rugH);
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 1.2;
      ctx.strokeRect(rugX, rugY, rugW, rugH);

      // Subtle diagonal woven weave
      ctx.strokeStyle = 'rgba(100, 116, 139, 0.2)';
      ctx.lineWidth = 0.5;
      for (let offset = -rugH; offset <= rugW + rugH; offset += 8) {
        ctx.beginPath();
        ctx.moveTo(rugX + Math.max(0, offset), rugY);
        ctx.lineTo(rugX + Math.min(rugW, offset + rugH), rugY + rugH);
        ctx.stroke();
      }

    } else if (pattern === 'chroma') {
      // Chroma Abstract Rug (Image 1)
      ctx.fillStyle = '#cbd5e1';
      ctx.fillRect(rugX, rugY, rugW, rugH);
      ctx.fillStyle = '#c2410c';
      ctx.beginPath();
      ctx.arc(rugX + rugW * 0.35, rugY + rugH * 0.5, Math.min(rugW, rugH) * 0.25, 0, Math.PI * 2);
      ctx.fill();

    } else if (pattern === 'genesis') {
      // Genesis Terracotta Medallion (Image 1)
      ctx.fillStyle = '#fee2e2';
      ctx.fillRect(rugX, rugY, rugW, rugH);
      ctx.strokeStyle = '#b91c1c';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(rugX, rugY, rugW, rugH);
      ctx.beginPath();
      ctx.arc(rugX + rugW / 2, rugY + rugH / 2, Math.min(rugW, rugH) * 0.25, 0, Math.PI * 2);
      ctx.stroke();

    } else if (pattern === 'afterglow') {
      // Afterglow Blush Silk Rug (Image 1)
      ctx.fillStyle = '#fef2f2';
      ctx.fillRect(rugX, rugY, rugW, rugH);
      ctx.strokeStyle = '#f43f5e';
      ctx.lineWidth = 1;
      ctx.strokeRect(rugX, rugY, rugW, rugH);
    }
    ctx.restore();
  };

  /**
   * Draws Architectural Staircase with warm golden/amber under-tread LED cove lighting,
   * glass balustrades with illuminated handrails, step numbering, and directional indicators.
   */
  const drawStaircase = (
    ctx: CanvasRenderingContext2D,
    room: Room,
    floorNum: number,
    isPresentation: boolean
  ) => {
    const rx = room.x * GRID_SIZE;
    const ry = room.y * GRID_SIZE;
    const rw = room.width * GRID_SIZE;
    const rh = room.height * GRID_SIZE;

    ctx.save();
    // Stairwell background
    ctx.fillStyle = isPresentation ? '#f8fafc' : '#0a0f1d';
    ctx.fillRect(rx, ry, rw, rh);

    const numTreads = 14;
    const treadHeight = rh / (numTreads + 1);

    // Render each step tread
    for (let i = 0; i < numTreads; i++) {
      const stepY = ry + i * treadHeight;

      // Tread surface fill
      ctx.fillStyle = isPresentation ? (i % 2 === 0 ? '#f1f5f9' : '#e2e8f0') : '#1e293b';
      ctx.fillRect(rx + 4, stepY, rw - 8, treadHeight);

      // Tread nosing edge line
      ctx.strokeStyle = isPresentation ? '#94a3b8' : '#38bdf8';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(rx + 4, stepY + treadHeight);
      ctx.lineTo(rx + rw - 4, stepY + treadHeight);
      ctx.stroke();

      // ELEGANT AMBER / GOLDEN LED UNDER-TREAD COVE LIGHTING GLOW
      if (isPresentation) {
        const ledGlow = ctx.createLinearGradient(rx, stepY + treadHeight - 1, rx, stepY + treadHeight + 6);
        ledGlow.addColorStop(0, 'rgba(251, 191, 36, 0.85)'); // Warm amber 2700K cove light
        ledGlow.addColorStop(0.4, 'rgba(245, 158, 11, 0.35)');
        ledGlow.addColorStop(1, 'rgba(245, 158, 11, 0)');
        ctx.fillStyle = ledGlow;
        ctx.fillRect(rx + 6, stepY + treadHeight, rw - 12, 6);

        // Warm golden LED diode strip line
        ctx.strokeStyle = '#fbbf24';
        ctx.lineWidth = 1.25;
        ctx.beginPath();
        ctx.moveTo(rx + 8, stepY + treadHeight);
        ctx.lineTo(rx + rw - 8, stepY + treadHeight);
        ctx.stroke();
      }

      // Step Riser Numbering
      ctx.fillStyle = isPresentation ? '#64748b' : '#94a3b8';
      ctx.font = 'bold 8px JetBrains Mono, monospace';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.fillText(`${i + 1}`, rx + 8, stepY + treadHeight / 2);
    }

    // Glass Balustrade & Illuminated Handrail Stringer
    if (isPresentation) {
      // Frosted tempered glass panel line
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.85)';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(rx + rw - 6, ry);
      ctx.lineTo(rx + rw - 6, ry + rh);
      ctx.stroke();

      // Handrail top LED warm strip
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(rx + rw - 8, ry);
      ctx.lineTo(rx + rw - 8, ry + rh);
      ctx.stroke();
    }

    // Directional Walking Arrow: UP ↑ (Floor 1) or DN ↓ (Floor 2)
    const midX = rx + rw / 2;
    const arrowY = ry + rh * 0.45;
    const isUp = floorNum === 1;

    ctx.strokeStyle = '#2563eb';
    ctx.fillStyle = '#2563eb';
    ctx.lineWidth = 2;
    ctx.beginPath();
    if (isUp) {
      ctx.moveTo(midX, arrowY + 25);
      ctx.lineTo(midX, arrowY - 25);
      ctx.lineTo(midX - 6, arrowY - 15);
      ctx.moveTo(midX, arrowY - 25);
      ctx.lineTo(midX + 6, arrowY - 15);
    } else {
      ctx.moveTo(midX, arrowY - 25);
      ctx.lineTo(midX, arrowY + 25);
      ctx.lineTo(midX - 6, arrowY + 15);
      ctx.moveTo(midX, arrowY + 25);
      ctx.lineTo(midX + 6, arrowY + 15);
    }
    ctx.stroke();

    // Floor Indicator text
    ctx.fillStyle = '#1e3a8a';
    ctx.font = 'bold 9px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillText(isUp ? 'UP (16 RISERS • LED) ↑' : 'DN (TO GROUND) ↓', midX, arrowY + 30);

    ctx.restore();
  };

  /**
   * Draws Slatted Shoe Cabinet Console, Entryway Bench Cushion, Key Tray & Hooks
   */
  const drawShoeStandConsole = (
    ctx: CanvasRenderingContext2D,
    item: FurnitureItem,
    pw: number,
    pd: number,
    isPresentation: boolean
  ) => {
    ctx.save();
    if (isPresentation) {
      // Teak carcass
      ctx.fillStyle = item.color || '#92400e';
      ctx.fillRect(-pw / 2, -pd / 2, pw, pd);
      ctx.strokeStyle = '#451a03';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(-pw / 2, -pd / 2, pw, pd);

      // Slatted shoe cabinet doors (horizontal louvers on left 60%)
      const cabinetW = pw * 0.58;
      ctx.fillStyle = '#78350f';
      ctx.fillRect(-pw / 2 + 2, -pd / 2 + 2, cabinetW, pd - 4);
      ctx.strokeStyle = '#b45309';
      ctx.lineWidth = 0.75;
      for (let ly = -pd / 2 + 5; ly <= pd / 2 - 5; ly += 3.5) {
        ctx.beginPath();
        ctx.moveTo(-pw / 2 + 4, ly);
        ctx.lineTo(-pw / 2 + cabinetW - 2, ly);
        ctx.stroke();
      }

      // Padded upholstered entryway bench cushion on right 40%
      const benchW = pw * 0.38;
      const benchX = -pw / 2 + cabinetW + 4;
      ctx.fillStyle = '#f1f5f9';
      ctx.fillRect(benchX, -pd / 2 + 2, benchW, pd - 4);
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 1;
      ctx.strokeRect(benchX, -pd / 2 + 2, benchW, pd - 4);

      // Button tufting on bench cushion
      ctx.fillStyle = '#64748b';
      ctx.beginPath();
      ctx.arc(benchX + benchW / 2, 0, 1.5, 0, Math.PI * 2);
      ctx.fill();

      // Brass key tray / catchall dish on top of cabinet
      ctx.fillStyle = '#f59e0b';
      ctx.beginPath();
      ctx.ellipse(-pw / 2 + cabinetW * 0.45, -pd * 0.1, 4, 2.5, 0, 0, Math.PI * 2);
      ctx.fill();

      // Brass coat hooks
      ctx.strokeStyle = '#d97706';
      ctx.lineWidth = 1.5;
      [-pw / 2 + 6, -pw / 2 + 14].forEach(hx => {
        ctx.beginPath();
        ctx.arc(hx, -pd / 2 - 2, 1.5, 0, Math.PI * 2);
        ctx.stroke();
      });

      // Label
      ctx.fillStyle = '#fef3c7';
      ctx.font = 'bold 7px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('SHOE CONSOLE', 0, pd / 2 + 8);
    } else {
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(-pw / 2, -pd / 2, pw, pd);
    }
    ctx.restore();
  };

  /**
   * Draws Laundry Room Station with Front-Load Washer & Dryer (W & D),
   * glass drum doors, detergent cabinets, laundry basket, and folding counter.
   */
  const drawLaundryStation = (
    ctx: CanvasRenderingContext2D,
    _item: FurnitureItem,
    pw: number,
    pd: number,
    isPresentation: boolean
  ) => {
    ctx.save();
    if (isPresentation) {
      // White quartz folding counter housing
      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(-pw / 2, -pd / 2, pw, pd);
      ctx.strokeStyle = '#cbd5e1';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(-pw / 2, -pd / 2, pw, pd);

      const appW = pw * 0.44;
      const appH = pd * 0.85;

      // 1. WASHER (Left)
      const washX = -pw / 2 + 3;
      const washY = -pd / 2 + (pd - appH) / 2;
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(washX, washY, appW, appH);
      ctx.strokeStyle = '#94a3b8';
      ctx.strokeRect(washX, washY, appW, appH);

      const drumR = Math.min(appW, appH) * 0.35;
      const drumCenterX = washX + appW / 2;
      const drumCenterY = washY + appH / 2;

      // Chrome outer ring
      ctx.fillStyle = '#e2e8f0';
      ctx.beginPath();
      ctx.arc(drumCenterX, drumCenterY, drumR + 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#64748b';
      ctx.lineWidth = 1;
      ctx.stroke();

      // Dark tempered glass window with water reflection
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.arc(drumCenterX, drumCenterY, drumR, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#38bdf8';
      ctx.beginPath();
      ctx.arc(drumCenterX, drumCenterY + 2, drumR * 0.6, 0.2 * Math.PI, 0.8 * Math.PI);
      ctx.fill();

      // Washer "W" emblem
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 8px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('W', drumCenterX, drumCenterY - 1);

      // 2. DRYER (Right)
      const dryX = pw / 2 - 3 - appW;
      const dryY = washY;
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(dryX, dryY, appW, appH);
      ctx.strokeStyle = '#94a3b8';
      ctx.strokeRect(dryX, dryY, appW, appH);

      const dryDrumCenterX = dryX + appW / 2;
      const dryDrumCenterY = dryY + appH / 2;

      ctx.fillStyle = '#e2e8f0';
      ctx.beginPath();
      ctx.arc(dryDrumCenterX, dryDrumCenterY, drumR + 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#64748b';
      ctx.stroke();

      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.arc(dryDrumCenterX, dryDrumCenterY, drumR, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#f59e0b';
      ctx.beginPath();
      ctx.arc(dryDrumCenterX, dryDrumCenterY + 2, drumR * 0.6, 0.2 * Math.PI, 0.8 * Math.PI);
      ctx.fill();

      // Dryer "D" emblem
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 8px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('D', dryDrumCenterX, dryDrumCenterY - 1);

      // Digital status LED lights
      ctx.fillStyle = '#10b981';
      ctx.beginPath();
      ctx.arc(washX + appW * 0.8, washY + 4, 1.5, 0, Math.PI * 2);
      ctx.arc(dryX + appW * 0.8, dryY + 4, 1.5, 0, Math.PI * 2);
      ctx.fill();

      // Label
      ctx.fillStyle = '#334155';
      ctx.font = 'bold 7px Inter, sans-serif';
      ctx.fillText('LAUNDRY (W & D)', 0, pd / 2 + 8);
    } else {
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(-pw / 2, -pd / 2, pw, pd);
    }
    ctx.restore();
  };

  /**
   * Draws Kitchen Fixtures: Refrigerator, Cooktop & Chimney Hood, Double Sink, and Island
   */
  const drawKitchenStation = (
    ctx: CanvasRenderingContext2D,
    item: FurnitureItem,
    pw: number,
    pd: number,
    isPresentation: boolean
  ) => {
    ctx.save();
    const itemName = item.name.toLowerCase();

    if (itemName.includes('fridge') || itemName.includes('refrigerator')) {
      // FRENCH DOUBLE-DOOR REFRIGERATOR WITH ICE DISPENSER
      if (isPresentation) {
        ctx.fillStyle = '#475569';
        ctx.fillRect(-pw / 2, -pd / 2, pw, pd);
        ctx.strokeStyle = '#1e293b';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(-pw / 2, -pd / 2, pw, pd);

        // Split double doors
        ctx.strokeStyle = '#0f172a';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, -pd / 2);
        ctx.lineTo(0, pd / 2);
        ctx.stroke();

        // Ice & Water Dispenser panel on Left door
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(-pw * 0.38, -pd * 0.2, pw * 0.28, pd * 0.4);
        ctx.fillStyle = '#38bdf8';
        ctx.beginPath();
        ctx.arc(-pw * 0.24, 0, 2, 0, Math.PI * 2);
        ctx.fill();

        // Chrome vertical door handles
        ctx.fillStyle = '#e2e8f0';
        ctx.fillRect(-4, -pd * 0.35, 2.5, pd * 0.7);
        ctx.fillRect(1.5, -pd * 0.35, 2.5, pd * 0.7);

        ctx.fillStyle = '#94a3b8';
        ctx.font = 'bold 7px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('FRIDGE (DISPENSER)', 0, pd / 2 + 8);
      } else {
        ctx.strokeStyle = '#38bdf8';
        ctx.strokeRect(-pw / 2, -pd / 2, pw, pd);
      }

    } else if (itemName.includes('island')) {
      // WATERFALL MARBLE ISLAND WITH BAR STOOLS
      if (isPresentation) {
        ctx.fillStyle = '#f8fafc';
        ctx.fillRect(-pw / 2, -pd / 2, pw, pd);
        drawMarbleVeins(ctx, -pw / 2, -pd / 2, pw, pd, 'rgba(148, 163, 184, 0.4)');
        ctx.strokeStyle = '#cbd5e1';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(-pw / 2, -pd / 2, pw, pd);

        // Bar stools along bottom edge
        const stoolR = Math.min(pw, pd) * 0.22;
        const stoolY = pd / 2 + stoolR * 0.7;
        [-pw * 0.28, 0, pw * 0.28].forEach(sx => {
          ctx.fillStyle = '#881337'; // Burgundy velvet upholstery
          ctx.beginPath();
          ctx.arc(sx, stoolY, stoolR, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = '#d97706'; // Brass rim
          ctx.lineWidth = 1;
          ctx.stroke();
        });

        ctx.fillStyle = '#64748b';
        ctx.font = 'bold 7px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('PREP ISLAND', 0, 0);
      } else {
        ctx.strokeStyle = '#38bdf8';
        ctx.strokeRect(-pw / 2, -pd / 2, pw, pd);
      }

    } else {
      // KITCHEN COUNTER WITH 4-BURNER COOKTOP, CHIMNEY HOOD & DOUBLE UNDERMOUNT SINK
      if (isPresentation) {
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(-pw / 2, -pd / 2, pw, pd);
        ctx.strokeStyle = '#0f172a';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(-pw / 2, -pd / 2, pw, pd);

        // 1. 4-Burner Glass Hob Cooktop (Left side)
        const hobW = pw * 0.35;
        const hobH = pd * 0.75;
        const hobX = -pw / 2 + pw * 0.08;
        const hobY = -hobH / 2;

        ctx.fillStyle = '#0f172a';
        ctx.fillRect(hobX, hobY, hobW, hobH);
        ctx.strokeStyle = '#475569';
        ctx.lineWidth = 1;
        ctx.strokeRect(hobX, hobY, hobW, hobH);

        const burnerR = Math.min(hobW, hobH) * 0.16;
        [
          [hobX + hobW * 0.28, hobY + hobH * 0.28],
          [hobX + hobW * 0.72, hobY + hobH * 0.28],
          [hobX + hobW * 0.28, hobY + hobH * 0.72],
          [hobX + hobW * 0.72, hobY + hobH * 0.72],
        ].forEach(([bx, by]) => {
          ctx.fillStyle = '#d97706';
          ctx.beginPath();
          ctx.arc(bx, by, burnerR, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = '#451a03';
          ctx.lineWidth = 0.75;
          ctx.stroke();
        });

        // Overhead Stainless Extraction Chimney Glow
        ctx.save();
        const hoodGlow = ctx.createRadialGradient(hobX + hobW / 2, 0, 2, hobX + hobW / 2, 0, hobW * 0.8);
        hoodGlow.addColorStop(0, 'rgba(254, 240, 138, 0.45)');
        hoodGlow.addColorStop(1, 'rgba(254, 240, 138, 0)');
        ctx.fillStyle = hoodGlow;
        ctx.fillRect(hobX - 4, -pd / 2, hobW + 8, pd);
        ctx.restore();

        // 2. Double Undermount Stainless Sink (Right side)
        const sinkW = pw * 0.38;
        const sinkH = pd * 0.72;
        const sinkX = pw / 2 - sinkW - pw * 0.08;
        const sinkY = -sinkH / 2;

        ctx.fillStyle = '#cbd5e1';
        ctx.fillRect(sinkX, sinkY, sinkW, sinkH);
        ctx.strokeStyle = '#64748b';
        ctx.lineWidth = 1;
        ctx.strokeRect(sinkX, sinkY, sinkW, sinkH);

        const basinW = sinkW * 0.44;
        ctx.fillStyle = '#94a3b8';
        ctx.fillRect(sinkX + 2, sinkY + 2, basinW, sinkH - 4);
        ctx.fillRect(sinkX + sinkW - basinW - 2, sinkY + 2, basinW, sinkH - 4);

        // Faucet
        ctx.strokeStyle = '#e2e8f0';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(sinkX + sinkW / 2, sinkY - 2);
        ctx.lineTo(sinkX + sinkW / 2, 0);
        ctx.stroke();

        ctx.fillStyle = '#94a3b8';
        ctx.font = 'bold 7px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('COOKTOP & SINK', 0, pd / 2 + 8);
      } else {
        ctx.strokeStyle = '#38bdf8';
        ctx.strokeRect(-pw / 2, -pd / 2, pw, pd);
      }
    }
    ctx.restore();
  };

  /**
   * Draws Floating OLED TV Entertainment Credenza with ambient backlighting
   */
  const drawTVMediaCredenza = (
    ctx: CanvasRenderingContext2D,
    _item: FurnitureItem,
    pw: number,
    pd: number,
    isPresentation: boolean
  ) => {
    ctx.save();
    if (isPresentation) {
      // Ambient wall lighting glow behind TV
      const glow = ctx.createLinearGradient(0, -pd / 2, 0, pd / 2);
      glow.addColorStop(0, 'rgba(56, 189, 248, 0.45)');
      glow.addColorStop(0.5, 'rgba(129, 140, 248, 0.35)');
      glow.addColorStop(1, 'rgba(56, 189, 248, 0)');
      ctx.fillStyle = glow;
      ctx.fillRect(-pw * 1.5, -pd / 2 - 6, pw * 3, pd + 12);

      // Fluted wood console
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(-pw / 2, -pd / 2, pw, pd);
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(-pw / 2, -pd / 2, pw, pd);

      // Fluted slats
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 0.8;
      for (let sy = -pd / 2 + 2; sy <= pd / 2 - 2; sy += 3) {
        ctx.beginPath();
        ctx.moveTo(-pw / 2 + 2, sy);
        ctx.lineTo(pw / 2 - 2, sy);
        ctx.stroke();
      }

      // Ultra-slim OLED TV Screen
      const tvW = pw * 0.4;
      const tvH = pd * 0.82;
      ctx.fillStyle = '#020617';
      ctx.fillRect(-tvW / 2, -tvH / 2, tvW, tvH);
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 1.2;
      ctx.strokeRect(-tvW / 2, -tvH / 2, tvW, tvH);

      // Soundbar
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(tvW / 2 + 1, -tvH * 0.35, 3, tvH * 0.7);

      ctx.fillStyle = '#94a3b8';
      ctx.font = 'bold 7px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('OLED MEDIA CONSOLE', 0, pd / 2 + 8);
    } else {
      ctx.strokeStyle = '#38bdf8';
      ctx.strokeRect(-pw / 2, -pd / 2, pw, pd);
    }
    ctx.restore();
  };

  /**
   * Draws Luxury Bathroom Fixtures: Freestanding Bathtub, Vanity Basin with LED Mirror, WC
   */
  const drawBathroomFixtures = (
    ctx: CanvasRenderingContext2D,
    item: FurnitureItem,
    pw: number,
    pd: number,
    isPresentation: boolean
  ) => {
    ctx.save();
    const itemName = item.name.toLowerCase();

    if (itemName.includes('tub')) {
      // FREESTANDING SOAKING BATHTUB WITH CHROME FLOOR MIXER
      if (isPresentation) {
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.roundRect(-pw / 2, -pd / 2, pw, pd, pd / 2);
        ctx.fill();
        ctx.strokeStyle = '#94a3b8';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        ctx.fillStyle = '#f1f5f9';
        ctx.beginPath();
        ctx.roundRect(-pw / 2 + 3, -pd / 2 + 3, pw - 6, pd - 6, (pd - 6) / 2);
        ctx.fill();

        ctx.fillStyle = 'rgba(56, 189, 248, 0.3)';
        ctx.beginPath();
        ctx.roundRect(-pw / 2 + 6, -pd / 2 + 6, pw - 12, pd - 12, (pd - 12) / 2);
        ctx.fill();

        // Chrome mixer
        ctx.fillStyle = '#64748b';
        ctx.beginPath();
        ctx.arc(pw / 2 - 5, 0, 2.5, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#475569';
        ctx.font = 'bold 7px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('SOAKING TUB', 0, pd / 2 + 8);
      } else {
        ctx.strokeStyle = '#38bdf8';
        ctx.strokeRect(-pw / 2, -pd / 2, pw, pd);
      }

    } else if (itemName.includes('sink') || itemName.includes('vanity')) {
      // WALL-HUNG VANITY WITH LED ILLUMINATED MIRROR
      if (isPresentation) {
        ctx.fillStyle = '#f8fafc';
        ctx.fillRect(-pw / 2, -pd / 2, pw, pd);
        ctx.strokeStyle = '#94a3b8';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(-pw / 2, -pd / 2, pw, pd);

        const basinR = Math.min(pw, pd) * 0.32;
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(0, 0, basinR, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#cbd5e1';
        ctx.stroke();

        // LED mirror backlighting glow
        ctx.save();
        const mirrorGlow = ctx.createLinearGradient(0, -pd / 2, 0, -pd / 2 - 8);
        mirrorGlow.addColorStop(0, 'rgba(254, 240, 138, 0.6)');
        mirrorGlow.addColorStop(1, 'rgba(254, 240, 138, 0)');
        ctx.fillStyle = mirrorGlow;
        ctx.fillRect(-pw / 2, -pd / 2 - 8, pw, 8);
        ctx.restore();

        ctx.fillStyle = '#475569';
        ctx.font = 'bold 7px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('VANITY SINK', 0, pd / 2 + 8);
      } else {
        ctx.strokeStyle = '#38bdf8';
        ctx.strokeRect(-pw / 2, -pd / 2, pw, pd);
      }

    } else {
      // Wall-hung toilet
      if (isPresentation) {
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.roundRect(-pw / 2, -pd / 2, pw, pd * 0.4, 3);
        ctx.fill();
        ctx.strokeStyle = '#94a3b8';
        ctx.stroke();

        ctx.fillStyle = '#f1f5f9';
        ctx.beginPath();
        ctx.ellipse(0, pd * 0.15, pw * 0.4, pd * 0.35, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#cbd5e1';
        ctx.stroke();
      } else {
        ctx.strokeStyle = '#38bdf8';
        ctx.strokeRect(-pw / 2, -pd / 2, pw, pd);
      }
    }
    ctx.restore();
  };

  /**
   * Draws Bedroom Wardrobes and Dressing Vanity Tables
   */
  const drawWardrobeAndVanity = (
    ctx: CanvasRenderingContext2D,
    item: FurnitureItem,
    pw: number,
    pd: number,
    isPresentation: boolean
  ) => {
    ctx.save();
    const itemName = item.name.toLowerCase();

    if (itemName.includes('wardrobe') || itemName.includes('closet')) {
      if (isPresentation) {
        ctx.fillStyle = '#334155';
        ctx.fillRect(-pw / 2, -pd / 2, pw, pd);
        ctx.strokeStyle = '#1e293b';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(-pw / 2, -pd / 2, pw, pd);

        const panelW = pw / 3;
        for (let i = 0; i < 3; i++) {
          const px = -pw / 2 + i * panelW;
          ctx.fillStyle = (i % 2 === 0) ? '#475569' : '#64748b';
          ctx.fillRect(px + 1, -pd / 2 + 1, panelW - 2, pd - 2);
          ctx.strokeStyle = '#94a3b8';
          ctx.lineWidth = 0.75;
          ctx.strokeRect(px + 1, -pd / 2 + 1, panelW - 2, pd - 2);

          // Diagonal mirror reflection sheen
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(px + 4, -pd / 2 + 4);
          ctx.lineTo(px + panelW - 4, pd / 2 - 4);
          ctx.stroke();
        }

        ctx.fillStyle = '#f8fafc';
        ctx.font = 'bold 7px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('SLIDING WARDROBE', 0, pd / 2 + 8);
      } else {
        ctx.strokeStyle = '#38bdf8';
        ctx.strokeRect(-pw / 2, -pd / 2, pw, pd);
      }

    } else if (itemName.includes('vanity') || itemName.includes('dressing')) {
      if (isPresentation) {
        ctx.fillStyle = '#92400e';
        ctx.fillRect(-pw / 2, -pd / 2, pw, pd);
        ctx.strokeStyle = '#451a03';
        ctx.strokeRect(-pw / 2, -pd / 2, pw, pd);

        const mirrorW = pw * 0.7;
        ctx.fillStyle = '#fef08a';
        ctx.fillRect(-mirrorW / 2, -pd / 2 - 2, mirrorW, 2);

        // Stool
        ctx.fillStyle = '#881337';
        ctx.beginPath();
        ctx.arc(0, pd / 2 + 4, 3.5, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#fef3c7';
        ctx.font = 'bold 7px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('DRESSING VANITY', 0, pd / 2 + 12);
      } else {
        ctx.strokeStyle = '#38bdf8';
        ctx.strokeRect(-pw / 2, -pd / 2, pw, pd);
      }
    }
    ctx.restore();
  };

  /**
   * Draws an Executive Luxury Sedan / SUV with aerodynamic body contours,
   * panoramic sunroof, tinted glass windshield/rear, alloy rims, side mirrors,
   * and glowing jewel LED headlamps and tail-lights.
   */
  const drawArchitecturalCar = (
    ctx: CanvasRenderingContext2D,
    item: FurnitureItem,
    pw: number,
    pd: number,
    isPresentation: boolean
  ) => {
    ctx.save();
    if (isPresentation) {
      const carColor = item.color || '#0f172a'; // Deep obsidian black or dark metallic
      
      // 1. Drop shadow under chassis
      ctx.shadowColor = 'rgba(0, 0, 0, 0.28)';
      ctx.shadowBlur = 8;
      ctx.shadowOffsetY = 4;
      
      // 2. Main aerodynamic body contour with smooth rounded corners
      ctx.fillStyle = carColor;
      ctx.beginPath();
      ctx.roundRect(-pw / 2, -pd / 2, pw, pd, [pw * 0.28, pw * 0.28, pw * 0.18, pw * 0.18]);
      ctx.fill();
      ctx.shadowColor = 'transparent';

      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // 3. 4 Alloy Wheels / Performance Tires tucked in arches
      ctx.fillStyle = '#020617';
      const tireW = Math.max(3.5, pw * 0.13);
      const tireH = Math.max(7, pd * 0.18);
      const frontWheelY = -pd * 0.28;
      const rearWheelY = pd * 0.26;
      [-pw / 2 - 1, pw / 2 - tireW + 1].forEach(wx => {
        // Tires
        ctx.fillRect(wx, frontWheelY, tireW, tireH);
        ctx.fillRect(wx, rearWheelY, tireW, tireH);
        // Chrome alloy rim
        ctx.fillStyle = '#94a3b8';
        ctx.fillRect(wx + 1, frontWheelY + 2, tireW - 2, tireH - 4);
        ctx.fillRect(wx + 1, rearWheelY + 2, tireW - 2, tireH - 4);
        ctx.fillStyle = '#020617';
      });

      // 4. Hood character accent lines
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(-pw * 0.28, -pd * 0.44);
      ctx.lineTo(-pw * 0.20, -pd * 0.26);
      ctx.moveTo(pw * 0.28, -pd * 0.44);
      ctx.lineTo(pw * 0.20, -pd * 0.26);
      ctx.stroke();

      // 5. Front Windshield (curved dark glass with blue-sky reflection)
      const cabinW = pw * 0.78;
      const cabinH = pd * 0.52;
      const cabinY = -pd * 0.20;
      
      ctx.fillStyle = '#1e293b';
      ctx.beginPath();
      ctx.roundRect(-cabinW / 2, cabinY, cabinW, cabinH, 4);
      ctx.fill();
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 1;
      ctx.stroke();

      // Windshield glass gradient
      const glassGrad = ctx.createLinearGradient(0, cabinY, 0, cabinY + cabinH * 0.35);
      glassGrad.addColorStop(0, '#38bdf8');
      glassGrad.addColorStop(1, '#0f172a');
      ctx.fillStyle = glassGrad;
      ctx.beginPath();
      ctx.roundRect(-cabinW * 0.44, cabinY + 2, cabinW * 0.88, cabinH * 0.28, 2);
      ctx.fill();

      // 6. Panoramic Sunroof / Glass Roof in Center of Cabin
      ctx.fillStyle = '#020617';
      ctx.fillRect(-cabinW * 0.35, cabinY + cabinH * 0.34, cabinW * 0.7, cabinH * 0.32);
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 0.8;
      ctx.strokeRect(-cabinW * 0.35, cabinY + cabinH * 0.34, cabinW * 0.7, cabinH * 0.32);

      // 7. Rear Windshield Glass
      ctx.fillStyle = '#1e293b';
      ctx.beginPath();
      ctx.roundRect(-cabinW * 0.42, cabinY + cabinH * 0.70, cabinW * 0.84, cabinH * 0.24, 2);
      ctx.fill();

      // 8. Aerodynamic Side Mirrors with turn-signal indicators
      ctx.fillStyle = carColor;
      ctx.fillRect(-pw / 2 - 4, -pd * 0.14, 4, 3);
      ctx.fillRect(pw / 2, -pd * 0.14, 4, 3);
      ctx.fillStyle = '#f59e0b';
      ctx.fillRect(-pw / 2 - 4, -pd * 0.14, 1.5, 3);
      ctx.fillRect(pw / 2 + 2.5, -pd * 0.14, 1.5, 3);

      // 9. Jewel-like LED Headlamps (Front - Top)
      ctx.fillStyle = '#fef08a'; // Bright warm amber/white
      ctx.beginPath();
      ctx.ellipse(-pw * 0.32, -pd / 2 + 2.5, pw * 0.12, 2.5, -0.2, 0, Math.PI * 2);
      ctx.ellipse(pw * 0.32, -pd / 2 + 2.5, pw * 0.12, 2.5, 0.2, 0, Math.PI * 2);
      ctx.fill();

      // Forward LED Light Cone Glow
      const headlampGlow = ctx.createLinearGradient(0, -pd / 2, 0, -pd / 2 - 14);
      headlampGlow.addColorStop(0, 'rgba(254, 240, 138, 0.45)');
      headlampGlow.addColorStop(1, 'rgba(254, 240, 138, 0)');
      ctx.fillStyle = headlampGlow;
      ctx.fillRect(-pw * 0.45, -pd / 2 - 14, pw * 0.9, 14);

      // 10. Red Jewel LED Tail-lights (Rear - Bottom)
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.roundRect(-pw * 0.38, pd / 2 - 3, pw * 0.76, 2.5, 1);
      ctx.fill();

      // Architectural label
      ctx.fillStyle = '#94a3b8';
      ctx.font = 'bold 7.5px JetBrains Mono, monospace';
      ctx.textAlign = 'center';
      ctx.fillText('LUXURY SEDAN', 0, pd / 2 + 10);
    } else {
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(-pw / 2, -pd / 2, pw, pd);
      ctx.strokeRect(-pw * 0.35, -pd * 0.25, pw * 0.7, pd * 0.5);
    }
    ctx.restore();
  };

  /**
   * Draws an Automated Wrought-Iron / Slatted Compound Entrance Gate
   * with heavy stone piers, brass lamps, and sliding/swing tracks.
   */
  const drawCompoundGate = (
    ctx: CanvasRenderingContext2D,
    _item: FurnitureItem,
    pw: number,
    pd: number,
    isPresentation: boolean
  ) => {
    ctx.save();
    if (isPresentation) {
      // 1. Left & Right Masonry Gate Piers
      const pierW = Math.max(6, pw * 0.08);
      const pierD = Math.max(10, pd * 1.8);
      const pierY = -pierD / 2;

      // Left Pier
      ctx.fillStyle = '#334155';
      ctx.fillRect(-pw / 2, pierY, pierW, pierD);
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(-pw / 2, pierY, pierW, pierD);

      // Right Pier
      ctx.fillStyle = '#334155';
      ctx.fillRect(pw / 2 - pierW, pierY, pierW, pierD);
      ctx.strokeRect(pw / 2 - pierW, pierY, pierW, pierD);

      // Brass Pillar Lanterns atop Piers
      ctx.fillStyle = '#f59e0b';
      ctx.beginPath();
      ctx.arc(-pw / 2 + pierW / 2, pierY + 2, 2.5, 0, Math.PI * 2);
      ctx.arc(pw / 2 - pierW / 2, pierY + 2, 2.5, 0, Math.PI * 2);
      ctx.fill();

      // 2. Main Gate Sliding Track & Anthracite Louvered Leaf
      const gateW = pw - pierW * 2 - 4;
      const gateX = -pw / 2 + pierW + 2;

      // Steel frame
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(gateX, -pd / 2, gateW, pd);
      ctx.strokeStyle = '#020617';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(gateX, -pd / 2, gateW, pd);

      // Modern horizontal security louvers
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 1;
      const louverCount = Math.max(4, Math.floor(gateW / 6));
      const louverStep = gateW / louverCount;
      for (let lx = gateX + louverStep; lx < gateX + gateW; lx += louverStep) {
        ctx.beginPath();
        ctx.moveTo(lx, -pd / 2 + 1);
        ctx.lineTo(lx, pd / 2 - 1);
        ctx.stroke();
      }

      // Motorized automation gear track & center latch
      ctx.fillStyle = '#94a3b8';
      ctx.fillRect(gateX + gateW / 2 - 3, -pd / 2 - 1, 6, pd + 2);

      // Architectural label
      ctx.fillStyle = '#f59e0b';
      ctx.font = 'bold 7px JetBrains Mono, monospace';
      ctx.textAlign = 'center';
      ctx.fillText('COMPOUND ENTRANCE GATE', 0, pd / 2 + 10);
    } else {
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(-pw / 2, -pd / 2, pw, pd);
    }
    ctx.restore();
  };

  /**
   * Draws a clean translucent pill badge with room name & dimensions
   */
  const drawSmartRoomBadge = (
    ctx: CanvasRenderingContext2D,
    room: Room,
    px: number,
    py: number,
    pw: number,
    ph: number,
    isPresentation: boolean
  ) => {
    // If room is too narrow or tiny (e.g. linen closet, corridor strip), suppress or draw micro-label to prevent collision
    if (pw < 40 || ph < 30) {
      if (pw >= 28 && ph >= 20) {
        ctx.save();
        ctx.font = '600 7.5px JetBrains Mono, monospace';
        ctx.fillStyle = isPresentation ? '#475569' : '#94a3b8';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(room.name.split(' ')[0].toUpperCase(), px + pw / 2, py + ph / 2);
        ctx.restore();
      }
      return;
    }

    const displayName = getRoomDisplayName(room.type, room.name, room.nameTamil, language);
    const dimText = `${formatDistance(room.width)} × ${formatDistance(room.height)}`;

    const badgeX = px + pw / 2;
    // Position comfortably in center-upper zone
    const badgeY = py + ph / 2;

    ctx.save();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    ctx.font = '600 10px Inter, sans-serif';
    const titleWidth = ctx.measureText(displayName.toUpperCase()).width;
    ctx.font = '500 8.5px JetBrains Mono, monospace';
    const dimWidth = ctx.measureText(dimText).width;

    const pillW = Math.max(titleWidth, dimWidth) + 14;
    const pillH = showDimensions ? 24 : 16;

    if (isPresentation) {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.88)';
      ctx.beginPath();
      ctx.roundRect(badgeX - pillW / 2, badgeY - pillH / 2, pillW, pillH, 4);
      ctx.fill();

      ctx.strokeStyle = '#e2e8f0';
      ctx.lineWidth = 0.8;
      ctx.stroke();

      ctx.fillStyle = '#0f172a';
      ctx.font = '600 9.5px Inter, sans-serif';
      ctx.fillText(displayName.toUpperCase(), badgeX, showDimensions ? badgeY - 5 : badgeY);

      if (showDimensions) {
        ctx.fillStyle = '#64748b';
        ctx.font = '500 8px JetBrains Mono, monospace';
        ctx.fillText(dimText, badgeX, badgeY + 6);
      }
    } else {
      ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
      ctx.beginPath();
      ctx.roundRect(badgeX - pillW / 2, badgeY - pillH / 2, pillW, pillH, 4);
      ctx.fill();

      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 0.8;
      ctx.stroke();

      ctx.fillStyle = '#f8fafc';
      ctx.font = '600 9.5px Inter, sans-serif';
      ctx.fillText(displayName.toUpperCase(), badgeX, showDimensions ? badgeY - 5 : badgeY);

      if (showDimensions) {
        ctx.fillStyle = '#38bdf8';
        ctx.font = '500 8px JetBrains Mono, monospace';
        ctx.fillText(dimText, badgeX, badgeY + 6);
      }
    }

    ctx.restore();
  };

  const drawTileGrid = (
    ctx: CanvasRenderingContext2D, 
    x: number, 
    y: number, 
    w: number, 
    h: number, 
    tileSize: number, 
    color: string
  ) => {
    ctx.save();
    ctx.strokeStyle = color;
    ctx.lineWidth = 0.5;
    ctx.beginPath();
    for (let tx = x; tx <= x + w; tx += tileSize) {
      ctx.moveTo(tx, y);
      ctx.lineTo(tx, y + h);
    }
    for (let ty = y; ty <= y + h; ty += tileSize) {
      ctx.moveTo(x, ty);
      ctx.lineTo(x + w, ty);
    }
    ctx.stroke();
    ctx.restore();
  };

  const drawWoodPlankGrid = (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    w: number,
    h: number,
    color: string = '#dfcfb2',
    plankH: number = 14
  ) => {
    ctx.save();
    ctx.strokeStyle = color;
    ctx.lineWidth = 0.85;
    ctx.beginPath();
    let rowIndex = 0;
    for (let py = y; py <= y + h; py += plankH) {
      ctx.moveTo(x, py);
      ctx.lineTo(x + w, py);
      // Staggered butt joints for authentic architectural wood flooring
      const staggerOffset = (rowIndex % 3) * 35;
      for (let px = x + staggerOffset; px < x + w; px += 90) {
        ctx.moveTo(px, py);
        ctx.lineTo(px, Math.min(y + h, py + plankH));
      }
      rowIndex++;
    }
    ctx.stroke();
    ctx.restore();
  };

  const drawPottedPlant = (ctx: CanvasRenderingContext2D, x: number, y: number, radius: number = 7) => {
    ctx.save();
    ctx.translate(x, y);

    ctx.fillStyle = '#b45309';
    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#451a03';
    ctx.beginPath();
    ctx.arc(0, 0, radius * 0.75, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#16a34a';
    for (let i = 0; i < 8; i++) {
      const angle = (i * Math.PI) / 4;
      ctx.beginPath();
      ctx.ellipse(
        Math.cos(angle) * (radius * 0.9),
        Math.sin(angle) * (radius * 0.9),
        radius * 0.55,
        radius * 0.35,
        angle,
        0,
        Math.PI * 2
      );
      ctx.fill();
    }
    ctx.restore();
  };

  const drawDoor = (ctx: CanvasRenderingContext2D, door: Door, isPresentation: boolean) => {
    const px = door.x * GRID_SIZE;
    const py = door.y * GRID_SIZE;
    const pw = door.width * GRID_SIZE;

    ctx.save();
    ctx.translate(px, py);
    ctx.rotate((door.rotation * Math.PI) / 180);

    ctx.strokeStyle = isPresentation ? '#fafaf9' : '#080c14';
    ctx.lineWidth = 7;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(pw, 0);
    ctx.stroke();

    ctx.strokeStyle = isPresentation ? 'rgba(148, 163, 184, 0.7)' : 'rgba(56, 189, 248, 0.6)';
    ctx.lineWidth = 1.25;
    ctx.beginPath();
    ctx.arc(0, 0, pw, 0, Math.PI / 2);
    ctx.stroke();

    ctx.strokeStyle = isPresentation ? '#475569' : '#38bdf8';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(0, pw);
    ctx.stroke();

    ctx.restore();
  };

  const drawWindow = (ctx: CanvasRenderingContext2D, win: WindowItem, isPresentation: boolean) => {
    const px = win.x * GRID_SIZE;
    const py = win.y * GRID_SIZE;
    const pw = win.width * GRID_SIZE;

    ctx.save();
    ctx.translate(px, py);
    ctx.rotate((win.rotation * Math.PI) / 180);

    ctx.fillStyle = isPresentation ? '#38bdf8' : '#38bdf8';
    ctx.fillRect(0, -2, pw, 4);

    ctx.strokeStyle = isPresentation ? '#ffffff' : '#e2e8f0';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(0, -3, pw, 6);

    ctx.restore();
  };

  /**
   * Draws Furniture: Sectional Sofa (Burgundy Velvet from Image 1), Marble Dining Table, Beds
   */
  const drawFurniture = (
    ctx: CanvasRenderingContext2D, 
    item: FurnitureItem, 
    isSelected: boolean,
    isPresentation: boolean
  ) => {
    const px = item.x * GRID_SIZE;
    const py = item.y * GRID_SIZE;
    const pw = item.width * GRID_SIZE;
    const pd = item.depth * GRID_SIZE;

    ctx.save();
    ctx.translate(px, py);
    ctx.rotate((item.rotation * Math.PI) / 180);

    if (isSelected || item.isAnimated) {
      ctx.save();
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.7)';
      ctx.lineWidth = 2;
      ctx.setLineDash([4, 4]);
      ctx.strokeRect(-pw / 2 - 4, -pd / 2 - 4, pw + 8, pd + 8);
      ctx.restore();
    }

    const nm = item.name.toLowerCase();

    if (item.category === 'vehicle' || nm.includes('car') || nm.includes('sedan') || nm.includes('suv')) {
      drawArchitecturalCar(ctx, item, pw, pd, isPresentation);
    } else if (item.category === 'outdoor' || nm.includes('gate') || nm.includes('compound')) {
      drawCompoundGate(ctx, item, pw, pd, isPresentation);
    } else {
      FurnitureSymbolRenderer.renderSymbol(ctx, item, pw, pd, isPresentation);
    }

    ctx.restore();
  };

  const drawColumn = (ctx: CanvasRenderingContext2D, col: Column, isPresentation: boolean) => {
    const cw = (col.width || 0.75) * GRID_SIZE;
    const cd = (col.depth || 1.25) * GRID_SIZE;
    const px = col.x * GRID_SIZE - cw / 2;
    const py = col.y * GRID_SIZE - cd / 2;

    ctx.save();
    ctx.fillStyle = isPresentation ? '#0f172a' : '#090d16';
    ctx.fillRect(px, py, cw, cd);

    ctx.save();
    ctx.beginPath();
    ctx.rect(px, py, cw, cd);
    ctx.clip();
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 1;
    const spacing = 4;
    for (let offset = -cd; offset <= cw + cd; offset += spacing) {
      ctx.beginPath();
      ctx.moveTo(px + offset, py);
      ctx.lineTo(px + offset + cd, py + cd);
      ctx.stroke();
    }
    ctx.restore();

    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(px, py, cw, cd);

    if (col.label) {
      ctx.fillStyle = '#0284c7';
      ctx.font = 'bold 9px JetBrains Mono, monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'bottom';
      ctx.fillText(col.label, px + cw / 2, py - 2);
    }

    ctx.restore();
  };

  const drawFloorTitleBanner = (
    ctx: CanvasRenderingContext2D, 
    rooms: Room[], 
    titleBanner: string,
    isPresentation: boolean
  ) => {
    if (rooms.length === 0) return;

    const minX = Math.min(...rooms.map(r => r.x));
    const maxX = Math.max(...rooms.map(r => r.x + r.width));
    const maxY = Math.max(...rooms.map(r => r.y + r.height));

    const centerX = ((minX + maxX) / 2) * GRID_SIZE;
    const bottomY = (maxY + 8) * GRID_SIZE;

    ctx.save();
    ctx.fillStyle = isPresentation ? '#0f172a' : '#f8fafc';
    ctx.font = '900 16px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillText(titleBanner, centerX, bottomY);

    ctx.strokeStyle = '#2563eb';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(centerX - 100, bottomY + 22);
    ctx.lineTo(centerX + 100, bottomY + 22);
    ctx.stroke();

    ctx.restore();
  };

  /**
   * Handle Click on Canvas to Open Material Customizer or Select Element
   */
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    // If user was dragging / panning, do not treat as click
    if (mouseMovedDistance > 5) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();

    // Convert screen coordinates to world coordinates (in feet)
    const clickX = (e.clientX - rect.left - pan.x) / (scale * GRID_SIZE);
    const clickY = (e.clientY - rect.top - pan.y) / (scale * GRID_SIZE);

    // 1. Check Furniture Click
    const hitFurniture = project.furniture.find(f => 
      (f.floor || 1) === activeFloor &&
      Math.abs(clickX - f.x) <= f.width / 2 &&
      Math.abs(clickY - f.y) <= f.depth / 2
    );

    if (hitFurniture) {
      setSelectedFurnitureId(hitFurniture.id);
      setActiveCustomizingFurniture(hitFurniture);
      setActiveCustomizingRoom(null);
      setCustomizerOpen(true);
      return;
    }

    // 2. Check Room Click
    const hitRoom = project.rooms.find(r => 
      (r.floor || 1) === activeFloor &&
      clickX >= r.x && clickX <= r.x + r.width &&
      clickY >= r.y && clickY <= r.y + r.height
    );

    if (hitRoom) {
      setSelectedRoomId(hitRoom.id);
      setActiveCustomizingRoom(hitRoom);
      setActiveCustomizingFurniture(null);
      setCustomizerOpen(true);
    }
  };

  return (
    <div ref={containerRef} className="w-full h-full relative overflow-hidden select-none bg-stone-100 dark:bg-slate-950">
      <canvas
        ref={canvasRef}
        className="w-full h-full block cursor-pointer"
        style={{ touchAction: 'none' }}
        onMouseDown={(e) => {
          if (e.button === 0) {
            setIsPanning(true);
            setStartPan({ x: e.clientX - pan.x, y: e.clientY - pan.y });
            setMouseMovedDistance(0);
          }
        }}
        onMouseMove={(e) => {
          if (isPanning) {
            const dist = Math.hypot(e.clientX - (startPan.x + pan.x), e.clientY - (startPan.y + pan.y));
            setMouseMovedDistance(d => d + dist);
            setPan({ x: e.clientX - startPan.x, y: e.clientY - startPan.y });
          }
        }}
        onMouseUp={() => setIsPanning(false)}
        onMouseLeave={() => setIsPanning(false)}
        onTouchStart={(e) => {
          if (e.touches.length === 1) {
            setIsPanning(true);
            setStartPan({ x: e.touches[0].clientX - pan.x, y: e.touches[0].clientY - pan.y });
            setMouseMovedDistance(0);
          }
        }}
        onTouchMove={(e) => {
          if (isPanning && e.touches.length === 1) {
            const dist = Math.hypot(e.touches[0].clientX - (startPan.x + pan.x), e.touches[0].clientY - (startPan.y + pan.y));
            setMouseMovedDistance(d => d + dist);
            setPan({ x: e.touches[0].clientX - startPan.x, y: e.touches[0].clientY - startPan.y });
          }
        }}
        onTouchEnd={() => setIsPanning(false)}
        onClick={handleCanvasClick}
        onWheel={(e) => {
          e.preventDefault();
          const zoomFactor = e.deltaY < 0 ? 1.08 : 0.92;
          setScale(s => Math.min(Math.max(s * zoomFactor, 0.4), 4.0));
        }}
      />

      {/* SUCCESS VERIFICATION TOAST */}
      {toastNotification && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-40 animate-in fade-in zoom-in-95 duration-200">
          <div className="bg-emerald-950/95 border border-emerald-500/60 text-emerald-200 px-4 py-2 rounded-2xl shadow-2xl backdrop-blur-md flex items-center gap-2 text-xs font-bold">
            <Check className="w-4 h-4 text-emerald-400" />
            <span>{toastNotification}</span>
          </div>
        </div>
      )}

      {/* TOP FLOATING ENGINEER VIEW & LAYER CONTROLLER */}
      <div className="absolute top-3 sm:top-4 left-1/2 -translate-x-1/2 flex items-center bg-[var(--color-paper-2)]/95 border border-[var(--color-rule)] rounded-md p-1.5 shadow-md z-20 space-x-1.5 sm:space-x-2 text-xs font-mono text-[var(--color-ink)] max-w-[calc(100vw-1.5rem)] overflow-x-auto scrollbar-none">
        {/* Floor Selection */}
        <div className="flex items-center bg-[var(--color-paper)] rounded p-0.5 border border-[var(--color-rule)]">
          <button
            onClick={() => {
              if (onToggleSideBySide) onToggleSideBySide(false);
              if (onSelectFloor) onSelectFloor(1);
            }}
            className={`px-2.5 py-1 rounded text-[11px] font-semibold transition flex items-center gap-1.5 ${
              !isMultiFloorSideBySide && activeFloor === 1
                ? 'bg-[#057a55] text-[#fcf9f2]'
                : 'text-[var(--color-muted)] hover:text-[var(--color-ink)]'
            }`}
          >
            <Building className="w-3.5 h-3.5" />
            <span>{language === 'ta' ? 'தரைத்தளம்' : 'G: Ground'}</span>
          </button>

          <button
            onClick={() => {
              if (onToggleSideBySide) onToggleSideBySide(false);
              if (onSelectFloor) onSelectFloor(2);
            }}
            className={`px-2.5 py-1 rounded text-[11px] font-semibold transition flex items-center gap-1.5 ${
              !isMultiFloorSideBySide && activeFloor === 2
                ? 'bg-[#057a55] text-[#fcf9f2]'
                : 'text-[var(--color-muted)] hover:text-[var(--color-ink)]'
            }`}
          >
            <Building className="w-3.5 h-3.5" />
            <span>{language === 'ta' ? 'முதல் தளம்' : '1F: First'}</span>
          </button>

          <button
            onClick={() => {
              if (onToggleSideBySide) onToggleSideBySide(!isMultiFloorSideBySide);
            }}
            className={`px-2.5 py-1 rounded text-[11px] font-semibold transition flex items-center gap-1.5 ${
              isMultiFloorSideBySide
                ? 'bg-[#057a55] text-[#fcf9f2]'
                : 'text-[var(--color-muted)] hover:text-[var(--color-ink)]'
            }`}
          >
            <Columns2 className="w-3.5 h-3.5" />
            <span>{language === 'ta' ? 'இரு தளங்கள்' : 'Side-by-Side'}</span>
          </button>
        </div>

        <div className="w-[1px] h-5 bg-[var(--color-rule)] my-auto" />

        {/* Engineer Layer Visibility Toggles */}
        <div className="flex items-center space-x-1">
          <button
            onClick={() => setShowWalls(w => !w)}
            className={`px-2 py-1 rounded text-[11px] font-mono font-medium transition flex items-center gap-1.5 cursor-pointer ${
              showWalls ? 'bg-[#dc2626]/10 text-[#dc2626] border border-[#dc2626]/40 font-bold' : 'text-[var(--color-muted)] hover:text-[var(--color-ink)]'
            }`}
            title="Toggle Structural Walls"
          >
            <Layers className="w-3.5 h-3.5" />
            <span>{language === 'ta' ? 'சுவர்கள்' : 'Blueprint'}</span>
          </button>

          <button
            onClick={() => setShowDimensions(d => !d)}
            className={`px-2 py-1 rounded text-[11px] font-mono font-medium transition flex items-center gap-1.5 cursor-pointer ${
              showDimensions ? 'bg-[#dc2626]/10 text-[#dc2626] border border-[#dc2626]/40 font-bold' : 'text-[var(--color-muted)] hover:text-[var(--color-ink)]'
            }`}
            title="Toggle Dimensions"
          >
            <Ruler className="w-3.5 h-3.5" />
            <span>{language === 'ta' ? 'அளவுகள்' : 'Dims'}</span>
          </button>

          <button
            onClick={() => setShowFurniture(f => !f)}
            className={`px-2 py-1 rounded text-[11px] font-mono font-medium transition flex items-center gap-1.5 cursor-pointer ${
              showFurniture ? 'bg-[#dc2626]/10 text-[#dc2626] border border-[#dc2626]/40 font-bold' : 'text-[var(--color-muted)] hover:text-[var(--color-ink)]'
            }`}
            title="Toggle Interior Furniture"
          >
            <Square className="w-3.5 h-3.5" />
            <span>{language === 'ta' ? 'உள்துறை' : 'Furn'}</span>
          </button>

          <button
            onClick={() => setShowColumns(c => !c)}
            className={`px-2 py-1 rounded text-[11px] font-mono font-medium transition flex items-center gap-1.5 cursor-pointer ${
              showColumns ? 'bg-[#0f172a] text-white font-bold' : 'text-[var(--color-muted)] hover:text-[var(--color-ink)] bg-[var(--color-paper)]'
            }`}
            title="Toggle RCC Column Grid"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>{language === 'ta' ? 'RCC தூண்கள்' : 'Grid / RCC'}</span>
          </button>

          <button
            onClick={() => setShowLabels(l => !l)}
            className={`px-2 py-1 rounded text-[11px] font-mono font-medium transition flex items-center gap-1.5 cursor-pointer ${
              showLabels ? 'bg-[#dc2626]/10 text-[#dc2626] border border-[#dc2626]/40 font-bold' : 'text-[var(--color-muted)] hover:text-[var(--color-ink)]'
            }`}
            title="Toggle Room Labels"
          >
            <span>{language === 'ta' ? 'பெயர்கள்' : 'Labels'}</span>
          </button>
        </div>

        <div className="w-[1px] h-5 bg-[var(--color-rule)] my-auto" />

        {/* Style mode */}
        <button
          onClick={() => {
            if (onToggleCadStyle) {
              onToggleCadStyle(cadStyleMode === 'presentation' ? 'cad' : 'presentation');
            }
          }}
          className="px-2 py-1 hover:bg-[var(--color-paper-3)] text-[var(--color-ink)] rounded transition flex items-center gap-1.5 border border-[var(--color-rule)] cursor-pointer"
        >
          <Palette className="w-3.5 h-3.5 text-[#dc2626]" />
          <span className="font-semibold text-[10px] font-mono">
            {cadStyleMode === 'presentation' ? 'Maket Studio' : 'CAD Blueprint'}
          </span>
        </button>

        {/* Quick Language switch pill */}
        <button
          onClick={() => {
            if (onToggleLanguage) {
              onToggleLanguage(language === 'en' ? 'ta' : 'en');
            }
          }}
          className="px-2 py-1 bg-[var(--color-paper)] hover:bg-[var(--color-paper-3)] text-[#dc2626] rounded text-[10px] font-mono font-bold border border-[var(--color-rule)] transition cursor-pointer"
        >
          {language === 'en' ? 'தமிழ்' : 'EN'}
        </button>

        {onOpenExport && (
          <button
            onClick={onOpenExport}
            className="px-2.5 py-1 bg-[#dc2626] hover:bg-[#b91c1c] text-white rounded text-[10px] font-mono font-bold flex items-center gap-1 transition cursor-pointer shadow-xs"
          >
            <Download className="w-3 h-3" />
            <span>PDF/SVG</span>
          </button>
        )}
      </div>

      {/* BOTTOM WHOLE-HOME TRANSFORMATION SUITE (Instant 1-Click Whole-House Theme Change) */}
      <div className="absolute bottom-3 sm:bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center bg-[var(--color-paper-2)]/95 border border-[var(--color-rule)] rounded-md p-1 sm:p-1.5 shadow-md space-x-1.5 sm:space-x-2 text-xs font-mono text-[var(--color-ink)] max-w-[calc(100vw-1.5rem)] overflow-x-auto scrollbar-none">
        <div className="flex items-center space-x-1.5 px-2 border-r border-[var(--color-rule)] shrink-0">
          <Wand2 className="w-3.5 h-3.5 text-[#dc2626]" />
          <span className="font-bold text-[11px] text-[var(--color-ink)] whitespace-nowrap">
            {language === 'ta' ? 'முழு வீடு தீம்கள்:' : 'Themes:'}
          </span>
        </div>

        {/* Whole-Home Instant Theme Pills */}
        <div className="flex items-center space-x-2 overflow-x-auto max-w-2xl py-0.5">
          {materialCatalogService.wholeHomeThemes.map(theme => {
            const isCurrent = activeWholeHomeTheme === theme.id;
            return (
              <button
                key={theme.id}
                onClick={() => handleApplyWholeHomeTheme(theme.id)}
                className={`group flex items-center space-x-2 px-2.5 py-1 rounded border transition cursor-pointer shrink-0 ${
                  isCurrent 
                    ? 'bg-[#dc2626]/10 border-[#dc2626] text-[#dc2626] font-bold' 
                    : 'bg-[var(--color-paper)] hover:bg-[var(--color-paper-3)] border-[var(--color-rule)] text-[var(--color-ink-2)]'
                }`}
                title={`Transform entire house with ${theme.name}`}
              >
                {/* 3 Swatch Microdots preview */}
                <div className="flex -space-x-1">
                  <div className="w-2.5 h-2.5 rounded-none border border-slate-700" style={{ backgroundColor: theme.previewColor }} />
                  <div className="w-2.5 h-2.5 rounded-none border border-slate-700" style={{ backgroundColor: theme.settings.sofaColor }} />
                  <div className="w-2.5 h-2.5 rounded-none border border-slate-700" style={{ backgroundColor: theme.settings.lightingColor }} />
                </div>
                <div className="text-left">
                  <div className="font-bold text-[10px] whitespace-nowrap">
                    {language === 'ta' ? theme.nameTamil : theme.name}
                  </div>
                </div>
                {isCurrent && <Check className="w-3 h-3 text-[#dc2626] ml-0.5" />}
              </button>
            );
          })}

          <div className="w-[1px] h-5 bg-[var(--color-rule)] my-auto shrink-0" />

          {/* 3D Interior References Modal Button */}
          <button
            onClick={() => {
              if (onOpenInteriorReferences) {
                onOpenInteriorReferences();
              } else {
                setIsInteriorRefOpen(true);
              }
            }}
            className="px-2.5 py-1 bg-[var(--color-paper)] hover:bg-[var(--color-paper-3)] border border-[var(--color-rule)] text-[var(--color-ink)] font-semibold rounded text-[10px] flex items-center space-x-1.5 transition whitespace-nowrap cursor-pointer shrink-0"
            title="View 3D Interior Reference Renders & Moodboard"
          >
            <ImageIcon className="w-3 h-3 text-[#dc2626]" />
            <span>{language === 'ta' ? '3D உள்துறை போர்டு' : '3D Interior Board'}</span>
          </button>

          {onToggleStatsDrawer && (
            <button
              onClick={onToggleStatsDrawer}
              className="px-2.5 py-1 bg-[#dc2626]/10 hover:bg-[#dc2626]/20 border border-[#dc2626]/40 text-[#dc2626] font-semibold rounded text-[10px] flex items-center space-x-1.5 transition whitespace-nowrap cursor-pointer shrink-0 shadow-sm"
              title="Inspect Plan Schedule, 3D Cameras & Fixtures (Maket Spec)"
            >
              <Camera className="w-3 h-3" />
              <span>{language === 'ta' ? 'அட்டவணை & கேமரா' : 'Schedule & Cameras'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Floating Canvas Viewport Zoom & HUD Controls */}
      <div className="absolute bottom-16 sm:bottom-4 left-3 sm:left-4 flex items-center bg-[var(--color-paper-2)]/95 border border-[var(--color-rule)] rounded-md p-1 shadow-md space-x-1 z-20 font-mono text-[var(--color-ink)]">
        <button
          onClick={() => setScale(s => Math.min(s * 1.2, 4.0))}
          className="p-1.5 hover:bg-[var(--color-paper-3)] text-[var(--color-muted)] hover:text-[var(--color-ink)] rounded transition cursor-pointer"
          title="Zoom In"
        >
          <ZoomIn className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => setScale(s => Math.max(s * 0.8, 0.4))}
          className="p-1.5 hover:bg-[var(--color-paper-3)] text-[var(--color-muted)] hover:text-[var(--color-ink)] rounded transition cursor-pointer"
          title="Zoom Out"
        >
          <ZoomOut className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => { setScale(1.1); setPan({ x: 90, y: 70 }); }}
          className="p-1.5 hover:bg-[var(--color-paper-3)] text-[var(--color-muted)] hover:text-[var(--color-ink)] rounded transition cursor-pointer"
          title="Reset View"
        >
          <Maximize2 className="w-3.5 h-3.5" />
        </button>

        <div className="w-[1px] h-4 bg-[var(--color-rule)] my-auto" />

        <div className="px-2 py-0.5 rounded text-[10px] text-[var(--color-muted)] bg-[var(--color-paper)]">
          {Math.round(scale * 100)}%
        </div>
      </div>

      {/* Interactive Touch-to-Change Single Finish Modal (Direct commit without worker animation) */}
      <InteriorsCustomizerModal
        isOpen={customizerOpen}
        onClose={() => setCustomizerOpen(false)}
        room={activeCustomizingRoom}
        furnitureItem={activeCustomizingFurniture}
        language={language}
        onApplyFinish={(opts) => {
          const updatedRooms = project.rooms.map(r => {
            if (r.id === opts.targetId) {
              if (opts.category === 'flooring') return { ...r, floorFinish: opts.value };
              if (opts.category === 'wall') return { ...r, wallFinish: opts.value };
              if (opts.category === 'rug') return { ...r, rugPattern: opts.value };
            }
            return r;
          });
          const updatedFurniture = project.furniture.map(f => {
            if (opts.targetType === 'furniture' && f.id === opts.targetId) {
              return { ...f, fabricColor: opts.value, material: opts.value };
            }
            return f;
          });
          onUpdateProject({
            ...project,
            rooms: updatedRooms,
            furniture: updatedFurniture,
            updatedAt: 'Just now'
          });
          setToastNotification(`✓ ${opts.swatchName} updated`);
          setTimeout(() => setToastNotification(null), 3000);
          setCustomizerOpen(false);
        }}
      />

      {/* 3D Interior Reference Visuals Modal (Side-by-side Blueprint + 4K Renders) */}
      <InteriorReferenceModal
        isOpen={isInteriorRefOpen}
        onClose={() => setIsInteriorRefOpen(false)}
        project={project}
        language={language}
        onApplyTheme={handleApplyWholeHomeTheme}
      />
    </div>
  );
};
