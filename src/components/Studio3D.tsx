import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Project, Room, FurnitureItem } from '../types';
import { aiService } from '../services/aiService';
import { 
  Sparkles, Camera, Sun, Compass, Layers, 
  RotateCcw, Download, CheckCircle2, Loader2, Image as ImageIcon, Play, Pause, Eye
} from 'lucide-react';

interface Studio3DProps {
  project: Project;
  onUpdateProject: (updated: Project) => void;
  activeFloor?: number;
}

export const Studio3D: React.FC<Studio3DProps> = ({ 
  project, 
  onUpdateProject,
  activeFloor = 1 
}) => {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);

  // 3D Controls State
  const [wallHeight, setWallHeight] = useState<number>(9); // 9ft standard ceilings
  const [lightingPreset, setLightingPreset] = useState<'daylight' | 'golden' | 'night'>('daylight');
  const [isGeneratingRender, setIsGeneratingRender] = useState<boolean>(false);
  const [selectedStyle, setSelectedStyle] = useState<string>('Modern Minimalist');
  const [renderPrompt, setRenderPrompt] = useState<string>(
    'Photorealistic interior, Scandinavian modern oak floors, large floor-to-ceiling glass, soft afternoon lighting, high architectural detail'
  );
  const [activeTab, setActiveTab] = useState<'viewport' | 'renders'>('viewport');

  // Multi-floor 3D view modes: 'active' (active floor only), 'stacked' (complete multi-story), 'exploded' (upper floor elevated)
  const [floorMode, setFloorMode] = useState<'active' | 'stacked' | 'exploded'>('stacked');
  const [isAutoRotating, setIsAutoRotating] = useState<boolean>(false);
  const isAutoRotatingRef = useRef(false);

  // Mouse interaction state for orbital camera
  const isMouseDownRef = useRef(false);
  const mousePosRef = useRef({ x: 0, y: 0 });
  const cameraAngleRef = useRef({ theta: Math.PI / 4, phi: Math.PI / 3, radius: 85 });

  useEffect(() => {
    isAutoRotatingRef.current = isAutoRotating;
  }, [isAutoRotating]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // 1. Setup Three.js Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(lightingPreset === 'night' ? '#040711' : '#090d16');
    sceneRef.current = scene;

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(
      45,
      container.clientWidth / container.clientHeight,
      0.1,
      1000
    );
    cameraRef.current = camera;
    updateCameraPosition();

    // 3. Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowMap;
    rendererRef.current = renderer;

    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // 4. Lighting Setup
    const ambientLight = new THREE.AmbientLight(0xffffff, lightingPreset === 'night' ? 0.2 : 0.6);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(
      lightingPreset === 'golden' ? 0xffb74d : lightingPreset === 'night' ? 0x93c5fd : 0xfff5ea, 
      lightingPreset === 'night' ? 0.4 : 1.3
    );
    dirLight.position.set(40, 60, 40);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 2048;
    dirLight.shadow.mapSize.height = 2048;
    scene.add(dirLight);

    // Subtle blue fill light
    const fillLight = new THREE.DirectionalLight(0x38bdf8, 0.35);
    fillLight.position.set(-30, 40, -30);
    scene.add(fillLight);

    // 5. Ground Plane
    const groundGeo = new THREE.PlaneGeometry(350, 350);
    const groundMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.9 });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.1;
    ground.receiveShadow = true;
    scene.add(ground);

    // 6. Build 3D Architectural Meshes from 2D Project
    build3DModel(scene, project, wallHeight, floorMode, activeFloor);

    // 7. Render Loop with Auto-Tour Support
    let animId: number;
    const animate = () => {
      animId = requestAnimationFrame(animate);
      if (isAutoRotatingRef.current && !isMouseDownRef.current) {
        cameraAngleRef.current.theta += 0.003;
        updateCameraPosition();
      }
      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if (!container || !renderer || !camera) return;
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
    };
  }, [project, wallHeight, lightingPreset, floorMode, activeFloor]);

  const updateCameraPosition = () => {
    if (!cameraRef.current) return;
    const { theta, phi, radius } = cameraAngleRef.current;
    const x = radius * Math.sin(phi) * Math.sin(theta);
    const y = radius * Math.cos(phi);
    const z = radius * Math.sin(phi) * Math.cos(theta);

    cameraRef.current.position.set(x, Math.max(y, 8), z);
    cameraRef.current.lookAt(22, 0, 20); // Focus toward center of home layout
  };

  const build3DModel = (
    scene: THREE.Scene, 
    proj: Project, 
    height: number, 
    mode: 'active' | 'stacked' | 'exploded',
    currentFloor: number
  ) => {
    // Clear previous architectural meshes (keep lights & ground)
    const toRemove: THREE.Object3D[] = [];
    scene.children.forEach(obj => {
      if (obj.userData?.isArchObject) toRemove.push(obj);
    });
    toRemove.forEach(obj => scene.remove(obj));

    // Room Floors & Walls Materials
    const wallMaterial = new THREE.MeshStandardMaterial({
      color: 0xf1f5f9,
      roughness: 0.5,
      metalness: 0.05
    });

    const floorTextures: Record<string, number> = {
      living: 0xca8a04, // Warm hardwood
      kitchen: 0x94a3b8, // Polished slate
      bathroom: 0x0284c7, // Ceramic azure tile
      master_bath: 0x0ea5e9,
      master_bedroom: 0x854d0e, // Rich walnut
      bedroom: 0xa16207,
      patio: 0x78716c, // Flagstone
      balcony: 0x64748b, // Architectural concrete terrace
      office: 0x334155,
      stairwell: 0x475569,
      laundry: 0x059669,
      foyer: 0xd97706,
      closet: 0x7c3aed,
      thinnai: 0xb45309, // Polished Terracotta / Red Oxide (Traditional Verandah)
      muttram: 0x78716c, // Natural Stone Courtyard with open sky
      puja: 0xf59e0b     // Warm Teak & Sacred Brass Shrine
    };

    // Filter rooms according to floorMode
    const roomsToRender = proj.rooms.filter(r => {
      if (mode === 'active') {
        return (r.floor || 1) === currentFloor;
      }
      return true;
    });

    roomsToRender.forEach(room => {
      const rx = room.x;
      const ry = room.y;
      const rw = room.width;
      const rh = room.height;
      const roomFloor = room.floor || 1;

      // Vertical elevation offset
      let baseY = 0;
      if (mode === 'active') {
        baseY = 0;
      } else if (roomFloor === 2) {
        baseY = mode === 'exploded' ? height + 14 : height + 0.3;
      }

      // 1. Room Floor Slab (Respects floorFinish if specified)
      let floorColor = floorTextures[room.type] || 0xd97706;
      if (room.floorFinish === 'hardwood') {
        floorColor = 0xc89658; // Rich Warm Oak
      } else if (room.floorFinish === 'athangudi') {
        floorColor = 0xb45309; // Chettinad Terracotta
      } else if (room.floorFinish === 'merino_marble') {
        floorColor = 0xf8fafc; // White Italian Marble
      } else if (room.floorFinish === 'avocado_marble') {
        floorColor = 0x15803d; // Green Serpentine Marble
      } else if (room.floorFinish === 'rossa_marble') {
        floorColor = 0xf43f5e; // Salmon Pink Marble
      } else if (room.floorFinish === 'mahogany_deck') {
        floorColor = 0x78350f; // Mahogany Deckwood
      } else if (room.floorFinish === 'chequered_mosaic') {
        floorColor = 0x1e293b; // Chequered Slate
      }

      const floorGeo = new THREE.BoxGeometry(rw, 0.3, rh);
      const floorMat = new THREE.MeshStandardMaterial({
        color: floorColor,
        roughness: 0.4
      });
      const floorMesh = new THREE.Mesh(floorGeo, floorMat);
      floorMesh.position.set(rx + rw / 2, baseY + 0.15, ry + rh / 2);
      floorMesh.receiveShadow = true;
      floorMesh.userData = { isArchObject: true };
      scene.add(floorMesh);

      // 2. Extruded Walls (4 perimeter walls per room)
      const wallThickness = 0.55;
      const wallH = room.ceilingHeight || height;

      // North Wall
      createWallSegment(scene, rx + rw / 2, baseY, ry, rw, wallThickness, wallH, wallMaterial);
      // South Wall
      createWallSegment(scene, rx + rw / 2, baseY, ry + rh, rw, wallThickness, wallH, wallMaterial);
      // West Wall
      createWallSegment(scene, rx, baseY, ry + rh / 2, wallThickness, rh, wallH, wallMaterial);
      // East Wall
      createWallSegment(scene, rx + rw, baseY, ry + rh / 2, wallThickness, rh, wallH, wallMaterial);

      // 3. Stairwell 3D Treads with Golden LED Under-Tread Cove Lighting
      if (room.type === 'stairwell' || room.name.toLowerCase().includes('stair')) {
        const numSteps = 12;
        const stepDepth = rh / numSteps;
        const stepRise = (height + 0.3) / numSteps;
        const stairMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.3 });
        const ledMat = new THREE.MeshBasicMaterial({ color: 0xfbbf24 });

        for (let i = 0; i < numSteps; i++) {
          const stepGeo = new THREE.BoxGeometry(rw * 0.8, 0.25, stepDepth * 0.9);
          const stepMesh = new THREE.Mesh(stepGeo, stairMat);
          stepMesh.position.set(
            rx + rw / 2,
            baseY + (i + 1) * stepRise,
            ry + i * stepDepth + stepDepth / 2
          );
          stepMesh.castShadow = true;
          stepMesh.receiveShadow = true;
          stepMesh.userData = { isArchObject: true };
          scene.add(stepMesh);

          // Golden LED Cove Lighting Strip under each tread
          const ledGeo = new THREE.BoxGeometry(rw * 0.78, 0.06, 0.1);
          const ledMesh = new THREE.Mesh(ledGeo, ledMat);
          ledMesh.position.set(
            rx + rw / 2,
            baseY + (i + 1) * stepRise - 0.14,
            ry + i * stepDepth + stepDepth / 2 + stepDepth * 0.42
          );
          ledMesh.userData = { isArchObject: true };
          scene.add(ledMesh);
        }

        // Ambient Warm Golden Stairwell Light
        const stairLight = new THREE.PointLight(0xfbbf24, 0.9, 18);
        stairLight.position.set(rx + rw / 2, baseY + height * 0.5, ry + rh / 2);
        stairLight.userData = { isArchObject: true };
        scene.add(stairLight);
      }
    });

    // 4. Furniture 3D Placement with Tailored Geometries
    const furnitureToRender = proj.furniture.filter(f => {
      if (mode === 'active') {
        return (f.floor || 1) === currentFloor;
      }
      return true;
    });

    furnitureToRender.forEach(item => {
      const itemFloor = item.floor || 1;
      let baseY = 0.3;
      if (mode === 'active') {
        baseY = 0.3;
      } else if (itemFloor === 2) {
        baseY = (mode === 'exploded' ? height + 14.3 : height + 0.6);
      }

      const fMat = new THREE.MeshStandardMaterial({
        color: new THREE.Color(item.color || '#475569'),
        roughness: 0.5
      });

      const nm = item.name.toLowerCase();

      // Tailored 3D architectural furniture geometry
      if (item.category === 'entry' || nm.includes('shoe')) {
        // Shoe stand console + bench cushion
        const shoeGeo = new THREE.BoxGeometry(item.width, 1.8, item.depth);
        const shoeMat = new THREE.MeshStandardMaterial({ color: 0x92400e, roughness: 0.6 });
        const shoeMesh = new THREE.Mesh(shoeGeo, shoeMat);
        shoeMesh.position.set(item.x, baseY + 0.9, item.y);
        shoeMesh.rotation.y = -(item.rotation * Math.PI) / 180;
        shoeMesh.castShadow = true;
        shoeMesh.userData = { isArchObject: true };
        scene.add(shoeMesh);

        // Upholstered seat cushion
        const cushGeo = new THREE.BoxGeometry(item.width * 0.4, 0.3, item.depth * 0.9);
        const cushMat = new THREE.MeshStandardMaterial({ color: 0xf1f5f9, roughness: 0.8 });
        const cushMesh = new THREE.Mesh(cushGeo, cushMat);
        cushMesh.position.set(item.x + item.width * 0.25, baseY + 1.95, item.y);
        cushMesh.rotation.y = -(item.rotation * Math.PI) / 180;
        cushMesh.userData = { isArchObject: true };
        scene.add(cushMesh);

      } else if (item.category === 'laundry' || nm.includes('laundry') || nm.includes('washer')) {
        // Laundry station washer & dryer
        const lGeo = new THREE.BoxGeometry(item.width, 2.8, item.depth);
        const lMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.3 });
        const lMesh = new THREE.Mesh(lGeo, lMat);
        lMesh.position.set(item.x, baseY + 1.4, item.y);
        lMesh.rotation.y = -(item.rotation * Math.PI) / 180;
        lMesh.castShadow = true;
        lMesh.userData = { isArchObject: true };
        scene.add(lMesh);

        // Circular front-load inspection windows
        const drumGeo = new THREE.CylinderGeometry(0.65, 0.65, 0.1, 16);
        const drumMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.1, metalness: 0.8 });
        [-item.width * 0.24, item.width * 0.24].forEach(dx => {
          const drumMesh = new THREE.Mesh(drumGeo, drumMat);
          drumMesh.rotation.x = Math.PI / 2;
          drumMesh.position.set(item.x + dx, baseY + 1.4, item.y + item.depth / 2 + 0.05);
          drumMesh.userData = { isArchObject: true };
          scene.add(drumMesh);
        });

      } else if (item.category === 'kitchen' || nm.includes('kitchen') || nm.includes('fridge') || nm.includes('island')) {
        if (nm.includes('fridge')) {
          // French double door refrigerator
          const frGeo = new THREE.BoxGeometry(item.width, 5.8, item.depth);
          const frMat = new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.8, roughness: 0.3 });
          const frMesh = new THREE.Mesh(frGeo, frMat);
          frMesh.position.set(item.x, baseY + 2.9, item.y);
          frMesh.rotation.y = -(item.rotation * Math.PI) / 180;
          frMesh.castShadow = true;
          frMesh.userData = { isArchObject: true };
          scene.add(frMesh);
        } else if (nm.includes('island')) {
          // Marble waterfall island
          const islGeo = new THREE.BoxGeometry(item.width, 2.6, item.depth);
          const islMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.2 });
          const islMesh = new THREE.Mesh(islGeo, islMat);
          islMesh.position.set(item.x, baseY + 1.3, item.y);
          islMesh.rotation.y = -(item.rotation * Math.PI) / 180;
          islMesh.castShadow = true;
          islMesh.userData = { isArchObject: true };
          scene.add(islMesh);
        } else {
          // Granite Counter with Hob & Sink
          const cGeo = new THREE.BoxGeometry(item.width, 2.6, item.depth);
          const cMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.4 });
          const cMesh = new THREE.Mesh(cGeo, cMat);
          cMesh.position.set(item.x, baseY + 1.3, item.y);
          cMesh.rotation.y = -(item.rotation * Math.PI) / 180;
          cMesh.castShadow = true;
          cMesh.userData = { isArchObject: true };
          scene.add(cMesh);
        }

      } else if (item.category === 'bath' || nm.includes('tub') || nm.includes('vanity-sink')) {
        if (nm.includes('tub')) {
          // Freestanding Soaking Bathtub
          const tubGeo = new THREE.BoxGeometry(item.width, 1.8, item.depth);
          const tubMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.2 });
          const tubMesh = new THREE.Mesh(tubGeo, tubMat);
          tubMesh.position.set(item.x, baseY + 0.9, item.y);
          tubMesh.rotation.y = -(item.rotation * Math.PI) / 180;
          tubMesh.castShadow = true;
          tubMesh.userData = { isArchObject: true };
          scene.add(tubMesh);
        } else {
          // Floating Vanity Counter
          const vGeo = new THREE.BoxGeometry(item.width, 2.2, item.depth);
          const vMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.3 });
          const vMesh = new THREE.Mesh(vGeo, vMat);
          vMesh.position.set(item.x, baseY + 1.1, item.y);
          vMesh.rotation.y = -(item.rotation * Math.PI) / 180;
          vMesh.castShadow = true;
          vMesh.userData = { isArchObject: true };
          scene.add(vMesh);
        }

      } else if (item.category === 'bedroom') {
        if (nm.includes('wardrobe')) {
          // Sliding mirrored wardrobe
          const wGeo = new THREE.BoxGeometry(item.width, 6.5, item.depth);
          const wMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.5, roughness: 0.3 });
          const wMesh = new THREE.Mesh(wGeo, wMat);
          wMesh.position.set(item.x, baseY + 3.25, item.y);
          wMesh.rotation.y = -(item.rotation * Math.PI) / 180;
          wMesh.castShadow = true;
          wMesh.userData = { isArchObject: true };
          scene.add(wMesh);
        } else if (nm.includes('vanity') || nm.includes('dressing')) {
          // Dressing vanity table
          const dvGeo = new THREE.BoxGeometry(item.width, 2.4, item.depth);
          const dvMat = new THREE.MeshStandardMaterial({ color: 0x92400e, roughness: 0.5 });
          const dvMesh = new THREE.Mesh(dvGeo, dvMat);
          dvMesh.position.set(item.x, baseY + 1.2, item.y);
          dvMesh.rotation.y = -(item.rotation * Math.PI) / 180;
          dvMesh.castShadow = true;
          dvMesh.userData = { isArchObject: true };
          scene.add(dvMesh);
        } else {
          // Mattress
          const bedGeo = new THREE.BoxGeometry(item.width, 1.4, item.depth);
          const bedMesh = new THREE.Mesh(bedGeo, fMat);
          bedMesh.position.set(item.x, baseY + 0.7, item.y);
          bedMesh.rotation.y = -(item.rotation * Math.PI) / 180;
          bedMesh.castShadow = true;
          bedMesh.userData = { isArchObject: true };
          scene.add(bedMesh);

          // Headboard with Warm LED Cove lighting
          const hbGeo = new THREE.BoxGeometry(item.width, 3.2, 0.6);
          const hbMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.6 });
          const hbMesh = new THREE.Mesh(hbGeo, hbMat);
          hbMesh.position.set(item.x, baseY + 1.6, item.y - item.depth / 2 + 0.3);
          hbMesh.castShadow = true;
          hbMesh.userData = { isArchObject: true };
          scene.add(hbMesh);
        }

      } else if (item.category === 'living') {
        if (nm.includes('tv') || nm.includes('credenza') || nm.includes('console')) {
          // Floating OLED TV Credenza
          const crGeo = new THREE.BoxGeometry(item.width, 1.4, item.depth);
          const crMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.6 });
          const crMesh = new THREE.Mesh(crGeo, crMat);
          crMesh.position.set(item.x, baseY + 0.7, item.y);
          crMesh.rotation.y = -(item.rotation * Math.PI) / 180;
          crMesh.castShadow = true;
          crMesh.userData = { isArchObject: true };
          scene.add(crMesh);

          // Thin OLED TV Screen
          const tvGeo = new THREE.BoxGeometry(item.width * 0.8, 2.8, 0.2);
          const tvMat = new THREE.MeshBasicMaterial({ color: 0x020617 });
          const tvMesh = new THREE.Mesh(tvGeo, tvMat);
          tvMesh.position.set(item.x, baseY + 2.8, item.y);
          tvMesh.rotation.y = -(item.rotation * Math.PI) / 180;
          tvMesh.userData = { isArchObject: true };
          scene.add(tvMesh);

          // Ambient LED Glow behind TV
          const tvLight = new THREE.PointLight(0x38bdf8, 0.6, 6);
          tvLight.position.set(item.x, baseY + 2.8, item.y - 0.2);
          tvLight.userData = { isArchObject: true };
          scene.add(tvLight);
        } else {
          // Sofa base & cushions (Burgundy Royal Velvet from Image 1!)
          const sofaColor = item.fabricColor || item.color || '#881337';
          const sofaMat = new THREE.MeshStandardMaterial({ color: new THREE.Color(sofaColor), roughness: 0.7 });
          const sofaGeo = new THREE.BoxGeometry(item.width, 1.8, item.depth);
          const sofaMesh = new THREE.Mesh(sofaGeo, sofaMat);
          sofaMesh.position.set(item.x, baseY + 0.9, item.y);
          sofaMesh.rotation.y = -(item.rotation * Math.PI) / 180;
          sofaMesh.castShadow = true;
          sofaMesh.userData = { isArchObject: true };
          scene.add(sofaMesh);
        }
      } else if (item.category === 'vehicle' || nm.includes('car') || nm.includes('sedan') || nm.includes('suv')) {
        // Luxury Executive Sedan 3D Model
        const carGroup = new THREE.Group();
        carGroup.position.set(item.x, baseY, item.y);
        carGroup.rotation.y = -(item.rotation * Math.PI) / 180;

        // 1. Aerodynamic Lower Body Chassis
        const bodyGeo = new THREE.BoxGeometry(item.width * 0.85, 1.3, item.depth * 0.95);
        const bodyMat = new THREE.MeshStandardMaterial({
          color: new THREE.Color(item.color || '#0f172a'),
          metalness: 0.85,
          roughness: 0.25
        });
        const bodyMesh = new THREE.Mesh(bodyGeo, bodyMat);
        bodyMesh.position.set(0, 0.8, 0);
        bodyMesh.castShadow = true;
        carGroup.add(bodyMesh);

        // 2. Tapered Glass Greenhouse Cabin
        const cabinGeo = new THREE.BoxGeometry(item.width * 0.72, 1.1, item.depth * 0.52);
        const cabinMat = new THREE.MeshStandardMaterial({
          color: 0x1e293b,
          metalness: 0.95,
          roughness: 0.1
        });
        const cabinMesh = new THREE.Mesh(cabinGeo, cabinMat);
        cabinMesh.position.set(0, 1.9, -item.depth * 0.05);
        cabinMesh.castShadow = true;
        carGroup.add(cabinMesh);

        // 3. 4 Rubber Tires with Alloy Rims
        const tireMat = new THREE.MeshStandardMaterial({ color: 0x020617, roughness: 0.9 });
        const rimMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.9, roughness: 0.2 });
        const tireGeo = new THREE.CylinderGeometry(0.55, 0.55, 0.35, 16);
        const rimGeo = new THREE.CylinderGeometry(0.35, 0.35, 0.38, 16);

        const tireX = item.width * 0.42;
        const frontZ = -item.depth * 0.28;
        const rearZ = item.depth * 0.28;

        [
          [-tireX, frontZ], [tireX, frontZ],
          [-tireX, rearZ], [tireX, rearZ]
        ].forEach(([tx, tz]) => {
          const tMesh = new THREE.Mesh(tireGeo, tireMat);
          tMesh.rotation.z = Math.PI / 2;
          tMesh.position.set(tx, 0.55, tz);
          carGroup.add(tMesh);

          const rMesh = new THREE.Mesh(rimGeo, rimMat);
          rMesh.rotation.z = Math.PI / 2;
          rMesh.position.set(tx, 0.55, tz);
          carGroup.add(rMesh);
        });

        // 4. Jewel LED Headlamps
        const headlampMat = new THREE.MeshBasicMaterial({ color: 0xfef08a });
        const hlGeo = new THREE.BoxGeometry(item.width * 0.2, 0.25, 0.15);
        [-item.width * 0.26, item.width * 0.26].forEach(hx => {
          const hlMesh = new THREE.Mesh(hlGeo, headlampMat);
          hlMesh.position.set(hx, 0.9, -item.depth * 0.47);
          carGroup.add(hlMesh);
        });

        // 5. Red LED Tail-light Bar
        const tailMat = new THREE.MeshBasicMaterial({ color: 0xef4444 });
        const tailGeo = new THREE.BoxGeometry(item.width * 0.65, 0.2, 0.15);
        const tailMesh = new THREE.Mesh(tailGeo, tailMat);
        tailMesh.position.set(0, 0.95, item.depth * 0.47);
        carGroup.add(tailMesh);

        carGroup.userData = { isArchObject: true };
        scene.add(carGroup);

      } else if (item.category === 'outdoor' || nm.includes('gate') || nm.includes('compound')) {
        // Automated Compound Entrance Gate 3D Model
        const gateGroup = new THREE.Group();
        gateGroup.position.set(item.x, baseY, item.y);
        gateGroup.rotation.y = -(item.rotation * Math.PI) / 180;

        const pierW = 1.4;
        const pierH = 4.8;
        const pierD = 1.4;
        const pierMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.8 });
        const pierGeo = new THREE.BoxGeometry(pierW, pierH, pierD);

        // Left & Right Masonry Gate Piers
        const leftPier = new THREE.Mesh(pierGeo, pierMat);
        leftPier.position.set(-item.width / 2 + pierW / 2, pierH / 2, 0);
        leftPier.castShadow = true;
        gateGroup.add(leftPier);

        const rightPier = new THREE.Mesh(pierGeo, pierMat);
        rightPier.position.set(item.width / 2 - pierW / 2, pierH / 2, 0);
        rightPier.castShadow = true;
        gateGroup.add(rightPier);

        // Brass Pier Lanterns
        const lanternMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.3, metalness: 0.8 });
        const lanternGeo = new THREE.BoxGeometry(0.6, 0.7, 0.6);
        [-item.width / 2 + pierW / 2, item.width / 2 - pierW / 2].forEach(px => {
          const lMesh = new THREE.Mesh(lanternGeo, lanternMat);
          lMesh.position.set(px, pierH + 0.35, 0);
          gateGroup.add(lMesh);
        });

        // Sliding Anthracite Louvered Gate Leaf
        const leafW = item.width - pierW * 2 - 0.4;
        const leafH = 4.0;
        const leafGeo = new THREE.BoxGeometry(leafW, leafH, 0.3);
        const leafMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.7, roughness: 0.4 });
        const leafMesh = new THREE.Mesh(leafGeo, leafMat);
        leafMesh.position.set(0, leafH / 2 + 0.2, 0);
        leafMesh.castShadow = true;
        gateGroup.add(leafMesh);

        gateGroup.userData = { isArchObject: true };
        scene.add(gateGroup);

      } else {
        // General architectural furniture block
        const fGeo = new THREE.BoxGeometry(item.width, 2.2, item.depth);
        const fMesh = new THREE.Mesh(fGeo, fMat);
        fMesh.position.set(item.x, baseY + 1.1, item.y);
        fMesh.rotation.y = -(item.rotation * Math.PI) / 180;
        fMesh.castShadow = true;
        fMesh.userData = { isArchObject: true };
        scene.add(fMesh);
      }
    });

    // 5. Render RCC Structural Columns in 3D (IS 456 / TNCDBR Standard)
    const columnsToRender = (proj.columns || []).filter(c => {
      if (mode === 'active') {
        return (c.floor || 1) === currentFloor;
      }
      return true;
    });

    const columnMaterial = new THREE.MeshStandardMaterial({
      color: 0x475569, // Reinforced concrete slate grey
      roughness: 0.85,
      metalness: 0.1
    });

    columnsToRender.forEach(col => {
      const cw = col.width || 0.75; // 9 inches
      const cd = col.depth || 1.25; // 15 inches
      const colFloor = col.floor || 1;
      let baseY = 0;
      if (mode === 'active') {
        baseY = 0;
      } else if (colFloor === 2) {
        baseY = mode === 'exploded' ? height + 14 : height + 0.3;
      }

      const colGeo = new THREE.BoxGeometry(cw, height, cd);
      const colMesh = new THREE.Mesh(colGeo, columnMaterial);
      colMesh.position.set(col.x, baseY + height / 2, col.y);
      colMesh.castShadow = true;
      colMesh.receiveShadow = true;
      colMesh.userData = { isArchObject: true };
      scene.add(colMesh);
    });
  };

  const createWallSegment = (
    scene: THREE.Scene,
    x: number,
    baseY: number,
    z: number,
    w: number,
    d: number,
    h: number,
    mat: THREE.Material
  ) => {
    const geo = new THREE.BoxGeometry(w, h, d);
    const wall = new THREE.Mesh(geo, mat);
    wall.position.set(x, baseY + h / 2, z);
    wall.castShadow = true;
    wall.receiveShadow = true;
    wall.userData = { isArchObject: true };
    scene.add(wall);
  };

  // Mouse camera navigation
  const handleMouseDown = (e: React.MouseEvent) => {
    isMouseDownRef.current = true;
    mousePosRef.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isMouseDownRef.current) return;
    const deltaX = e.clientX - mousePosRef.current.x;
    const deltaY = e.clientY - mousePosRef.current.y;
    mousePosRef.current = { x: e.clientX, y: e.clientY };

    cameraAngleRef.current.theta -= deltaX * 0.008;
    cameraAngleRef.current.phi = Math.max(0.1, Math.min(Math.PI / 2.1, cameraAngleRef.current.phi - deltaY * 0.008));
    updateCameraPosition();
  };

  const handleMouseUp = () => {
    isMouseDownRef.current = false;
  };

  const handleWheel = (e: React.WheelEvent) => {
    const delta = e.deltaY * 0.05;
    cameraAngleRef.current.radius = Math.max(15, Math.min(180, cameraAngleRef.current.radius + delta));
    updateCameraPosition();
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      isMouseDownRef.current = true;
      mousePosRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isMouseDownRef.current || e.touches.length !== 1) return;
    const deltaX = e.touches[0].clientX - mousePosRef.current.x;
    const deltaY = e.touches[0].clientY - mousePosRef.current.y;
    mousePosRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };

    cameraAngleRef.current.theta -= deltaX * 0.008;
    cameraAngleRef.current.phi = Math.max(0.1, Math.min(Math.PI / 2.1, cameraAngleRef.current.phi - deltaY * 0.008));
    updateCameraPosition();
  };

  const handleTouchEnd = () => {
    isMouseDownRef.current = false;
  };

  const handleGenerateRender = async () => {
    setIsGeneratingRender(true);
    try {
      const renderUrl = await aiService.generate3DRender(renderPrompt, selectedStyle);
      const newRender = {
        id: `render-${Date.now()}`,
        url: renderUrl,
        prompt: renderPrompt,
        style: selectedStyle,
        floor: activeFloor,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      const updated = {
        ...project,
        renders: [newRender, ...(project.renders || [])]
      };
      onUpdateProject(updated);
      setActiveTab('renders');
    } catch (e) {
      console.error(e);
    } finally {
      setIsGeneratingRender(false);
    }
  };

  return (
    <div className="relative w-full h-full flex flex-col overflow-hidden bg-slate-950 select-none">
      {/* Top Floating Controls */}
      <div className="absolute top-3 sm:top-4 left-2 sm:left-4 right-2 sm:right-4 z-20 flex flex-wrap gap-2 items-center justify-between pointer-events-none">
        <div className="flex items-center space-x-2 bg-slate-900/90 backdrop-blur-md border border-slate-800 p-1.5 rounded-xl shadow-2xl pointer-events-auto">
          <button
            onClick={() => setActiveTab('viewport')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition flex items-center gap-1.5 ${
              activeTab === 'viewport' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            <span>3D Model Studio</span>
          </button>
          <button
            onClick={() => setActiveTab('renders')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition flex items-center gap-1.5 ${
              activeTab === 'renders' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5" />
            <span>Render Gallery ({project.renders?.length || 0})</span>
          </button>
        </div>

        {/* Multi-Floor & Presentation Controls */}
        <div className="flex items-center space-x-2 bg-slate-900/90 backdrop-blur-md border border-slate-800 p-1.5 rounded-xl shadow-2xl pointer-events-auto text-xs">
          {/* Multi-Floor View Switcher */}
          <div className="flex items-center bg-slate-950 p-0.5 rounded-lg border border-slate-800">
            <button
              onClick={() => setFloorMode('active')}
              className={`px-2 py-1 rounded-md text-[11px] font-medium transition ${
                floorMode === 'active' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Floor {activeFloor} Only
            </button>
            <button
              onClick={() => setFloorMode('stacked')}
              className={`px-2 py-1 rounded-md text-[11px] font-medium transition ${
                floorMode === 'stacked' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Stacked (Both Floors)
            </button>
            <button
              onClick={() => setFloorMode('exploded')}
              className={`px-2 py-1 rounded-md text-[11px] font-medium transition ${
                floorMode === 'exploded' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Exploded 3D View
            </button>
          </div>

          {/* Auto Tour Button */}
          <button
            onClick={() => setIsAutoRotating(!isAutoRotating)}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium flex items-center gap-1.5 transition ${
              isAutoRotating ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-300 hover:text-white'
            }`}
            title="Auto-rotate orbital client tour"
          >
            {isAutoRotating ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            <span>{isAutoRotating ? 'Pause Tour' : 'Auto Tour'}</span>
          </button>

          <div className="w-[1px] h-4 bg-slate-800" />

          {/* Sun Preset */}
          <span className="text-slate-400 px-1 flex items-center gap-1">
            <Sun className="w-3.5 h-3.5 text-amber-400" />
            Sun:
          </span>
          <button
            onClick={() => setLightingPreset('daylight')}
            className={`px-2 py-0.5 rounded transition ${lightingPreset === 'daylight' ? 'bg-slate-800 text-blue-400 font-medium' : 'text-slate-400'}`}
          >
            Noon
          </button>
          <button
            onClick={() => setLightingPreset('golden')}
            className={`px-2 py-0.5 rounded transition ${lightingPreset === 'golden' ? 'bg-slate-800 text-amber-400 font-medium' : 'text-slate-400'}`}
          >
            Golden
          </button>
          <button
            onClick={() => setLightingPreset('night')}
            className={`px-2 py-0.5 rounded transition ${lightingPreset === 'night' ? 'bg-slate-800 text-indigo-400 font-medium' : 'text-slate-400'}`}
          >
            Night
          </button>
        </div>
      </div>

      {activeTab === 'viewport' ? (
        <>
          {/* Main WebGL Viewport */}
          <div
            ref={mountRef}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onWheel={handleWheel}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            style={{ touchAction: 'none' }}
            className="w-full h-full cursor-grab active:cursor-grabbing"
          />

          {/* AI Photorealistic Render Prompt Bar */}
          <div className="absolute bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 z-20 w-11/12 max-w-3xl bg-slate-900/95 backdrop-blur-md border border-slate-800 p-2.5 sm:p-3 rounded-2xl shadow-2xl">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
              <div className="w-full sm:w-44">
                <select
                  value={selectedStyle}
                  onChange={(e) => setSelectedStyle(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-2 text-xs text-slate-300 font-medium focus:outline-none focus:border-blue-500 w-full cursor-pointer"
                >
                  <option value="Modern Minimalist">Modern Minimalist</option>
                  <option value="Scandinavian">Scandinavian</option>
                  <option value="Japandi">Japandi Style</option>
                  <option value="Industrial Loft">Industrial Loft</option>
                  <option value="Coastal Contemporary">Coastal Contemporary</option>
                </select>
              </div>

              <div className="flex-1">
                <input
                  type="text"
                  value={renderPrompt}
                  onChange={(e) => setRenderPrompt(e.target.value)}
                  placeholder="Describe materials, lighting, time of day..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>

              <button
                disabled={isGeneratingRender}
                onClick={handleGenerateRender}
                className="w-full sm:w-auto justify-center bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-xs font-semibold flex items-center space-x-1.5 shadow-lg shadow-blue-600/30 transition disabled:opacity-50 cursor-pointer"
              >
                {isGeneratingRender ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Rendering...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Generate Render</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </>
      ) : (
        /* Renders Gallery Grid */
        <div className="w-full h-full overflow-y-auto p-8 pt-20">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-bold text-white">Synthesized 3D Renders</h3>
                <p className="text-sm text-slate-400">High-fidelity architectural renderings generated from your CAD layout</p>
              </div>
              <button
                onClick={() => setActiveTab('viewport')}
                className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-4 py-2 rounded-xl text-xs font-medium flex items-center gap-1.5 transition"
              >
                <Camera className="w-4 h-4" />
                <span>Take New Shot</span>
              </button>
            </div>

            {(!project.renders || project.renders.length === 0) ? (
              <div className="border border-dashed border-slate-800 rounded-3xl p-16 text-center">
                <ImageIcon className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                <h4 className="text-slate-300 font-semibold mb-1">No Renders Generated Yet</h4>
                <p className="text-xs text-slate-500 max-w-md mx-auto mb-4">
                  Switch back to 3D view and click "Generate Render" to create high-resolution photorealistic architectural shots.
                </p>
                <button
                  onClick={() => setActiveTab('viewport')}
                  className="bg-blue-600 text-white px-4 py-2 rounded-xl text-xs font-medium inline-flex items-center gap-2"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Generate Your First Render</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {project.renders.map(r => (
                  <div key={r.id} className="group relative bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
                    <img 
                      src={r.url} 
                      alt={r.style} 
                      className="w-full h-72 object-cover transition duration-300 group-hover:scale-105" 
                    />
                    <div className="p-4 bg-slate-900 border-t border-slate-800 flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-slate-200 text-sm">{r.style}</span>
                          <span className="text-[10px] bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded-full border border-blue-500/20">4K Photoreal</span>
                        </div>
                        <p className="text-xs text-slate-400 line-clamp-1 mt-0.5">{r.prompt}</p>
                      </div>
                      <a
                        href={r.url}
                        target="_blank"
                        rel="noreferrer"
                        className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition"
                        title="Download Render"
                      >
                        <Download className="w-4 h-4" />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
