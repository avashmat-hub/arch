import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { RectAreaLightUniformsLib } from 'three/addons/lights/RectAreaLightUniformsLib.js';
import {
  RotateCw,
  Sun,
  BatteryCharging,
  Wind,
  ArrowRight,
  Eye,
  Compass,
  Check,
} from 'lucide-react';
import { SpecularCard } from './SpecularCard';

export type ShellColorKey = 'arctic' | 'steel' | 'obsidian';

export interface ConfiguratorTransferData {
  shell: ShellColorKey;
  stiltHeight: number;
  solar: boolean;
  battery: boolean;
  recuperation: boolean;
  autonomyDays: number;
  unitPriceMln: number;
}

interface CapsuleConfigurator3DProps {
  onApplyToCalculator: (config: ConfiguratorTransferData) => void;
}

const SHELL_FINISHES: {
  id: ShellColorKey;
  name: string;
  hex: string;
  threeColor: number;
  roughness: number;
  metalness: number;
  priceDelta: number;
}[] = [
  {
    id: 'arctic',
    name: 'Arctic White',
    hex: '#F3F4F6',
    threeColor: 0xf1f4f8,
    roughness: 0.24,
    metalness: 0.12,
    priceDelta: 0,
  },
  {
    id: 'steel',
    name: 'Steel Metallic',
    hex: '#D1D5DB',
    threeColor: 0xc2cbd4,
    roughness: 0.22,
    metalness: 0.72,
    priceDelta: 0.45,
  },
  {
    id: 'obsidian',
    name: 'Stealth Obsidian',
    hex: '#1A1F29',
    threeColor: 0x1b222e,
    roughness: 0.34,
    metalness: 0.52,
    priceDelta: 0.6,
  },
];

type CameraPreset = 'perspective' | 'facade' | 'truss';

/**
 * Helper to create a rounded-rectangle THREE.Shape centered at (0,0)
 */
function createRoundedRectShape(width: number, height: number, radius: number): THREE.Shape {
  const s = new THREE.Shape();
  const x = -width / 2;
  const y = -height / 2;
  const r = Math.min(radius, width / 2, height / 2);

  s.moveTo(x + r, y);
  s.lineTo(x + width - r, y);
  s.quadraticCurveTo(x + width, y, x + width, y + r);
  s.lineTo(x + width, y + height - r);
  s.quadraticCurveTo(x + width, y + height, x + width - r, y + height);
  s.lineTo(x + r, y + height);
  s.quadraticCurveTo(x, y + height, x, y + height - r);
  s.lineTo(x, y + r);
  s.quadraticCurveTo(x, y, x + r, y);
  return s;
}

/**
 * Helper to create procedural brushed metal/composite panel texture via Canvas2D
 */
function createPanelNormalCanvasTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.fillStyle = '#e8ecf0';
    ctx.fillRect(0, 0, 512, 512);
    // Subtle composite architectural panel seams
    ctx.strokeStyle = 'rgba(20, 26, 36, 0.22)';
    ctx.lineWidth = 2;
    for (let x = 0; x <= 512; x += 128) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, 512);
      ctx.stroke();
    }
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
    ctx.lineWidth = 1;
    for (let y = 0; y <= 512; y += 64) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(512, y);
      ctx.stroke();
    }
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/**
 * Helper to create a solar photovoltaic cell pattern texture
 */
function createSolarCellTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.fillStyle = '#091322';
    ctx.fillRect(0, 0, 256, 256);
    ctx.strokeStyle = 'rgba(0, 240, 255, 0.32)';
    ctx.lineWidth = 1.5;
    for (let i = 0; i <= 256; i += 32) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, 256);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, i);
      ctx.lineTo(256, i);
      ctx.stroke();
    }
    ctx.strokeStyle = 'rgba(209, 213, 219, 0.14)';
    ctx.lineWidth = 0.7;
    for (let i = 8; i < 256; i += 16) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, 256);
      ctx.stroke();
    }
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(3, 2);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/**
 * Helper to orient a cylinder strut between two 3D points
 */
function updateStrutBetween(
  mesh: THREE.Mesh,
  start: THREE.Vector3,
  end: THREE.Vector3,
  upAxis: THREE.Vector3,
  dirVec: THREE.Vector3
) {
  dirVec.subVectors(end, start);
  const len = dirVec.length();
  mesh.position.addVectors(start, end).multiplyScalar(0.5);
  mesh.scale.set(1, Math.max(len, 0.05), 1);
  if (len > 0.001) {
    mesh.quaternion.setFromUnitVectors(upAxis, dirVec.normalize());
  }
}

export const CapsuleConfigurator3D: React.FC<CapsuleConfigurator3DProps> = ({
  onApplyToCalculator,
}) => {
  const [shellColor, setShellColor] = useState<ShellColorKey>('arctic');
  const [stiltHeight, setStiltHeight] = useState<number>(3.6);
  const [solar, setSolar] = useState<boolean>(true);
  const [battery, setBattery] = useState<boolean>(true);
  const [recuperation, setRecuperation] = useState<boolean>(false);
  const [autoRotate, setAutoRotate] = useState<boolean>(true);
  const [cameraPreset, setCameraPreset] = useState<CameraPreset>('perspective');
  const [webglFailed, setWebglFailed] = useState<boolean>(false);
  const [transferred, setTransferred] = useState<boolean>(false);

  const canvasMountRef = useRef<HTMLDivElement>(null);

  // Live metrics calculation
  const selectedFinish = SHELL_FINISHES.find((f) => f.id === shellColor) ?? SHELL_FINISHES[0];
  const baseAutonomy = 3;
  const autonomyDays =
    baseAutonomy + (solar ? 9 : 0) + (battery ? 10 : 0) + (recuperation ? 8 : 0);

  const baseCostMln = 11.8;
  const stiltCost = Math.max(0, (stiltHeight - 1.5) * 0.42);
  const unitPriceMln = Number(
    (
      baseCostMln +
      selectedFinish.priceDelta +
      stiltCost +
      (solar ? 1.15 : 0) +
      (battery ? 1.45 : 0) +
      (recuperation ? 0.95 : 0)
    ).toFixed(2)
  );

  // Refs bridging React state into the single persistent Three.js scene
  const configRef = useRef({
    shellColor,
    stiltHeight,
    solar,
    battery,
    recuperation,
    autoRotate,
  });
  configRef.current = { shellColor, stiltHeight, solar, battery, recuperation, autoRotate };

  const cameraTargetPresetRef = useRef<{
    active: boolean;
    pos: THREE.Vector3;
    target: THREE.Vector3;
  }>({
    active: false,
    pos: new THREE.Vector3(7.4, 4.1, 7.8),
    target: new THREE.Vector3(0, 1.8, 0),
  });

  const sceneHandlersRef = useRef<{
    requestRender?: () => void;
    syncVisuals?: () => void;
  }>({});

  // Trigger visual update & render when React config state changes
  useEffect(() => {
    sceneHandlersRef.current.syncVisuals?.();
    sceneHandlersRef.current.requestRender?.();
  }, [shellColor, stiltHeight, solar, battery, recuperation, autoRotate]);

  // Camera preset transition
  const handleSelectCameraPreset = (preset: CameraPreset) => {
    setCameraPreset(preset);
    const yMid = stiltHeight * 0.48 + 0.9;
    if (preset === 'perspective') {
      cameraTargetPresetRef.current = {
        active: true,
        pos: new THREE.Vector3(7.4, yMid + 2.1, 7.6),
        target: new THREE.Vector3(0, yMid, 0),
      };
    } else if (preset === 'facade') {
      cameraTargetPresetRef.current = {
        active: true,
        pos: new THREE.Vector3(7.8, yMid + 0.6, 2.4),
        target: new THREE.Vector3(0.4, yMid + 0.3, 0),
      };
    } else {
      cameraTargetPresetRef.current = {
        active: true,
        pos: new THREE.Vector3(5.6, Math.max(1.2, stiltHeight * 0.35), 6.2),
        target: new THREE.Vector3(0.2, stiltHeight * 0.42, 0),
      };
    }
    sceneHandlersRef.current.requestRender?.();
  };

  // Mount WebGL Three.js Scene Once
  useEffect(() => {
    const container = canvasMountRef.current;
    if (!container) return;

    // Software WebGL detection per Three.js skill
    const isSoftwareGl = (() => {
      try {
        const probeCanvas = document.createElement('canvas');
        const gl = probeCanvas.getContext('webgl2') || probeCanvas.getContext('webgl');
        if (!gl) return true;
        const ext = gl.getExtension('WEBGL_debug_renderer_info');
        const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
        const gpu = String(gl.getParameter(param));
        gl.getExtension('WEBGL_lose_context')?.loseContext();
        return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
      } catch {
        return true;
      }
    })();

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: !isSoftwareGl,
        powerPreference: 'high-performance',
      });
    } catch {
      setWebglFailed(true);
      return;
    }

    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = !isSoftwareGl;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.setClearColor(0x0b0e14, 1);

    const width = Math.max(container.clientWidth, 320);
    const height = Math.max(container.clientHeight, 420);
    renderer.setSize(width, height);
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    const handleContextLost = (e: Event) => {
      e.preventDefault();
      setWebglFailed(true);
    };
    const handleContextRestored = () => setWebglFailed(false);
    renderer.domElement.addEventListener('webglcontextlost', handleContextLost);
    renderer.domElement.addEventListener('webglcontextrestored', handleContextRestored);

    // Scene + Horizon Fog matching Deep Obsidian #0B0E14
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0b0e14);
    scene.fog = new THREE.FogExp2(0x0b0e14, 0.036);

    // Mandatory Studio Environment Reflection via RoomEnvironment
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    const envRT = pmremGenerator.fromScene(new RoomEnvironment(), 0.04);
    scene.environment = envRT.texture;
    pmremGenerator.dispose();

    // Camera
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    camera.position.set(7.6, 4.3, 7.8);

    // OrbitControls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = !isSoftwareGl;
    controls.dampingFactor = 0.06;
    controls.enablePan = false;
    controls.minDistance = 5.2;
    controls.maxDistance = 16;
    controls.minPolarAngle = 0.25;
    controls.maxPolarAngle = Math.PI / 2 - 0.05;
    controls.target.set(0, 2.3, 0);
    controls.autoRotate = !isSoftwareGl && configRef.current.autoRotate;
    controls.autoRotateSpeed = 0.75;

    // Cancel camera preset animation if user manually interacts
    controls.addEventListener('start', () => {
      cameraTargetPresetRef.current.active = false;
    });

    // Balanced 3-Point Warm/Cool Studio Rig + HemisphereLight
    const hemiLight = new THREE.HemisphereLight(0x8ecae6, 0x1a222c, 0.65);
    scene.add(hemiLight);

    const keyLight = new THREE.DirectionalLight(0xfff1e0, 2.2);
    keyLight.position.set(8, 12, 7);
    keyLight.castShadow = !isSoftwareGl;
    keyLight.shadow.mapSize.set(1024, 1024);
    keyLight.shadow.camera.left = -7;
    keyLight.shadow.camera.right = 7;
    keyLight.shadow.camera.top = 7;
    keyLight.shadow.camera.bottom = -7;
    keyLight.shadow.bias = -0.0005;
    keyLight.shadow.normalBias = 0.02;
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0x00f0ff, 1.1);
    rimLight.position.set(-8, 6, -7);
    scene.add(rimLight);

    if (!isSoftwareGl) {
      RectAreaLightUniformsLib.init();
      const studioSoftbox = new THREE.RectAreaLight(0xd8f3ff, 2.2, 6, 3);
      studioSoftbox.position.set(0, 7.5, 4);
      studioSoftbox.lookAt(0, 2, 0);
      scene.add(studioSoftbox);
    }

    // Procedural Textures
    const panelTex = createPanelNormalCanvasTexture();
    panelTex.anisotropy = renderer.capabilities.getMaxAnisotropy();
    const solarTex = createSolarCellTexture();
    solarTex.anisotropy = renderer.capabilities.getMaxAnisotropy();

    // Shared Materials (varied roughness/metalness per Three.js skill)
    const hullMat = new THREE.MeshPhysicalMaterial({
      color: 0xf1f4f8,
      map: panelTex,
      roughness: 0.24,
      metalness: 0.14,
      clearcoat: 0.65,
      clearcoatRoughness: 0.18,
    });

    const darkFrameMat = new THREE.MeshStandardMaterial({
      color: 0x171e26,
      roughness: 0.35,
      metalness: 0.85,
    });

    const steelTrussMat = new THREE.MeshStandardMaterial({
      color: 0x3b4652,
      roughness: 0.32,
      metalness: 0.88,
    });

    const concreteMat = new THREE.MeshStandardMaterial({
      color: 0x4f5861,
      roughness: 0.86,
      metalness: 0.04,
    });

    const deckWoodMat = new THREE.MeshStandardMaterial({
      color: 0x5c4230,
      roughness: 0.72,
      metalness: 0.05,
    });

    const glassMat = new THREE.MeshPhysicalMaterial({
      color: 0x99d6ea,
      roughness: 0.06,
      metalness: 0.1,
      transmission: isSoftwareGl ? 0 : 0.78,
      transparent: true,
      opacity: isSoftwareGl ? 0.36 : 0.92,
      ior: 1.52,
      thickness: 0.25,
      clearcoat: 1.0,
      depthWrite: false,
    });

    const warmInteriorWallMat = new THREE.MeshStandardMaterial({
      color: 0x2c221b,
      emissive: 0xff5e00,
      emissiveIntensity: 0.45,
      roughness: 0.78,
      metalness: 0.05,
    });

    const amberEmissiveStripMat = new THREE.MeshStandardMaterial({
      color: 0xff8a33,
      emissive: 0xff5e00,
      emissiveIntensity: 2.6,
      roughness: 0.2,
    });

    const cyanAccentMat = new THREE.MeshStandardMaterial({
      color: 0x00f0ff,
      emissive: 0x00f0ff,
      emissiveIntensity: 1.6,
      roughness: 0.25,
    });

    const solarMat = new THREE.MeshPhysicalMaterial({
      color: 0x0b1628,
      map: solarTex,
      roughness: 0.14,
      metalness: 0.6,
      clearcoat: 0.9,
    });

    const slopeRockMat = new THREE.MeshStandardMaterial({
      color: 0x1c252f,
      roughness: 0.92,
      metalness: 0.08,
      flatShading: true,
    });

    // === 1. Cyan CAD Base Coordinate Grid & Measurement Rings ===
    const baseGrid = new THREE.GridHelper(18, 24, 0x00f0ff, 0x1a303d);
    baseGrid.position.y = 0.01;
    (baseGrid.material as THREE.Material).transparent = true;
    (baseGrid.material as THREE.Material).opacity = 0.42;
    scene.add(baseGrid);

    const ringGeo = new THREE.RingGeometry(4.65, 4.7, 72);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0x00f0ff,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.35,
      polygonOffset: true,
      polygonOffsetFactor: -1,
    });
    const compassRing = new THREE.Mesh(ringGeo, ringMat);
    compassRing.rotation.x = -Math.PI / 2;
    compassRing.position.y = 0.025;
    scene.add(compassRing);

    // Subtle Contact Shadow Disc
    const shadowCanvas = document.createElement('canvas');
    shadowCanvas.width = 256;
    shadowCanvas.height = 256;
    const sctx = shadowCanvas.getContext('2d');
    if (sctx) {
      const grad = sctx.createRadialGradient(128, 128, 16, 128, 128, 122);
      grad.addColorStop(0, 'rgba(0,0,0,0.62)');
      grad.addColorStop(1, 'rgba(0,0,0,0)');
      sctx.fillStyle = grad;
      sctx.fillRect(0, 0, 256, 256);
    }
    const contactTex = new THREE.CanvasTexture(shadowCanvas);
    const contactPlane = new THREE.Mesh(
      new THREE.PlaneGeometry(10.5, 8.5),
      new THREE.MeshBasicMaterial({
        map: contactTex,
        transparent: true,
        depthWrite: false,
      })
    );
    contactPlane.rotation.x = -Math.PI / 2;
    contactPlane.position.y = 0.015;
    scene.add(contactPlane);

    // === 2. Stylized Sloping Mountain Terrain Wedge ===
    const terrainGeo = new THREE.PlaneGeometry(11, 7.5, 16, 10);
    terrainGeo.rotateX(-Math.PI / 2);
    const posAttr = terrainGeo.attributes.position;
    for (let i = 0; i < posAttr.count; i++) {
      const vx = posAttr.getX(i);
      const vz = posAttr.getZ(i);
      // Subtle rocky micro-relief
      const noise = Math.sin(vx * 1.4) * Math.cos(vz * 1.3) * 0.14;
      posAttr.setY(i, noise);
    }
    terrainGeo.computeVertexNormals();
    const terrainMesh = new THREE.Mesh(terrainGeo, slopeRockMat);
    terrainMesh.receiveShadow = true;
    scene.add(terrainMesh);

    const terrainWire = new THREE.LineSegments(
      new THREE.WireframeGeometry(terrainGeo),
      new THREE.LineBasicMaterial({ color: 0x00f0ff, transparent: true, opacity: 0.14 })
    );
    terrainMesh.add(terrainWire);

    // === 3. Composite Multi-Part Futuristic Capsule Group ===
    const capsuleGroup = new THREE.Group();
    scene.add(capsuleGroup);

    // 3A. Main Extruded Rounded-Corner Rear/Mid Aerodynamic Shell
    const shellProfile = createRoundedRectShape(2.55, 2.05, 0.44);
    const mainHullGeo = new THREE.ExtrudeGeometry(shellProfile, {
      depth: 2.7,
      bevelEnabled: true,
      bevelThickness: 0.12,
      bevelSize: 0.08,
      bevelSegments: 5,
      curveSegments: 16,
    });
    mainHullGeo.rotateY(Math.PI / 2);
    mainHullGeo.translate(-2.3, 1.05, 0);
    const mainHull = new THREE.Mesh(mainHullGeo, hullMat);
    mainHull.castShadow = true;
    mainHull.receiveShadow = true;
    capsuleGroup.add(mainHull);

    // 3B. Front Panoramic Canopy Top Roof & Bottom Belly Frame (270° Open Window Bow)
    const canopyRoofGeo = new THREE.BoxGeometry(2.45, 0.24, 2.52);
    const canopyRoof = new THREE.Mesh(canopyRoofGeo, hullMat);
    canopyRoof.position.set(1.55, 1.98, 0);
    canopyRoof.castShadow = true;
    capsuleGroup.add(canopyRoof);

    const canopyFloorGeo = new THREE.BoxGeometry(2.45, 0.24, 2.52);
    const canopyFloor = new THREE.Mesh(canopyFloorGeo, hullMat);
    canopyFloor.position.set(1.55, 0.12, 0);
    canopyFloor.castShadow = true;
    capsuleGroup.add(canopyFloor);

    // Dark anodized exterior trim band & structural subframe chassis
    const chassisGeo = new THREE.BoxGeometry(5.1, 0.16, 2.3);
    const chassisMesh = new THREE.Mesh(chassisGeo, darkFrameMat);
    chassisMesh.position.set(0.2, -0.06, 0);
    chassisMesh.castShadow = true;
    capsuleGroup.add(chassisMesh);

    // 3C. Visible Warm-Lit Luxury Bedroom Interior inside the 270° Glass Bow
    const interiorFloor = new THREE.Mesh(
      new THREE.BoxGeometry(2.3, 0.08, 2.26),
      deckWoodMat
    );
    interiorFloor.position.set(1.5, 0.26, 0);
    capsuleGroup.add(interiorFloor);

    const headboardWall = new THREE.Mesh(
      new THREE.BoxGeometry(0.14, 1.56, 2.22),
      warmInteriorWallMat
    );
    headboardWall.position.set(0.45, 1.06, 0);
    capsuleGroup.add(headboardWall);

    // King-size luxury bed platform + mattress + pillows
    const bedBase = new THREE.Mesh(
      new THREE.BoxGeometry(1.38, 0.28, 1.38),
      darkFrameMat
    );
    bedBase.position.set(1.22, 0.44, 0);
    capsuleGroup.add(bedBase);

    const mattressMat = new THREE.MeshStandardMaterial({
      color: 0xeae5df,
      roughness: 0.85,
      metalness: 0.0,
    });
    const mattress = new THREE.Mesh(
      new THREE.BoxGeometry(1.3, 0.22, 1.3),
      mattressMat
    );
    mattress.position.set(1.22, 0.67, 0);
    capsuleGroup.add(mattress);

    // Warm Rift Amber (#FF5E00) LED ceiling cove + headboard glow strips
    const ceilingAmberLightStrip = new THREE.Mesh(
      new THREE.BoxGeometry(2.2, 0.05, 2.18),
      amberEmissiveStripMat
    );
    ceilingAmberLightStrip.position.set(1.52, 1.84, 0);
    capsuleGroup.add(ceilingAmberLightStrip);

    const interiorWarmLight = new THREE.PointLight(0xff6b1a, 5.5, 6.2, 1.6);
    interiorWarmLight.position.set(1.5, 1.45, 0);
    capsuleGroup.add(interiorWarmLight);

    // 3D. 270° Panoramic Glass Panels & Anodized Corner Mullions
    const frontGlass = new THREE.Mesh(new THREE.PlaneGeometry(2.38, 1.64), glassMat);
    frontGlass.rotation.y = Math.PI / 2;
    frontGlass.position.set(2.74, 1.05, 0);
    frontGlass.renderOrder = 4;
    capsuleGroup.add(frontGlass);

    const rightGlass = new THREE.Mesh(new THREE.PlaneGeometry(2.34, 1.64), glassMat);
    rightGlass.position.set(1.56, 1.05, 1.21);
    rightGlass.renderOrder = 4;
    capsuleGroup.add(rightGlass);

    const leftGlass = new THREE.Mesh(new THREE.PlaneGeometry(2.34, 1.64), glassMat);
    leftGlass.rotation.y = Math.PI;
    leftGlass.position.set(1.56, 1.05, -1.21);
    leftGlass.renderOrder = 4;
    capsuleGroup.add(leftGlass);

    // Corner panoramic structural mullions
    const mullionGeo = new THREE.BoxGeometry(0.08, 1.68, 0.08);
    const mullionPositions: [number, number, number][] = [
      [2.72, 1.05, 1.2],
      [2.72, 1.05, -1.2],
      [1.62, 1.05, 1.21],
      [1.62, 1.05, -1.21],
      [2.72, 1.05, 0],
    ];
    mullionPositions.forEach(([mx, my, mz]) => {
      const m = new THREE.Mesh(mullionGeo, darkFrameMat);
      m.position.set(mx, my, mz);
      capsuleGroup.add(m);
    });

    // Side technical entrance door on rear-right facade
    const entryDoor = new THREE.Mesh(
      new THREE.BoxGeometry(0.76, 1.54, 0.06),
      darkFrameMat
    );
    entryDoor.position.set(-1.15, 0.92, 1.32);
    capsuleGroup.add(entryDoor);

    const doorGlowHandle = new THREE.Mesh(
      new THREE.BoxGeometry(0.04, 0.36, 0.04),
      cyanAccentMat
    );
    doorGlowHandle.position.set(-0.88, 0.96, 1.36);
    capsuleGroup.add(doorGlowHandle);

    // 3E. Cantilevered Open Terrace with Timber Decking & Steel Safety Railing
    const terraceGroup = new THREE.Group();
    capsuleGroup.add(terraceGroup);

    const terraceDeck = new THREE.Mesh(
      new THREE.BoxGeometry(1.75, 0.14, 2.55),
      deckWoodMat
    );
    terraceDeck.position.set(-3.12, -0.02, 0);
    terraceDeck.castShadow = true;
    terraceDeck.receiveShadow = true;
    terraceGroup.add(terraceDeck);

    // Terrace steel perimeter frame + safety handrail posts
    const postGeo = new THREE.BoxGeometry(0.05, 0.92, 0.05);
    const postCoords: [number, number][] = [
      [-3.95, 1.22],
      [-3.95, 0],
      [-3.95, -1.22],
      [-3.1, 1.22],
      [-3.1, -1.22],
      [-2.35, 1.22],
      [-2.35, -1.22],
    ];
    postCoords.forEach(([px, pz]) => {
      const post = new THREE.Mesh(postGeo, darkFrameMat);
      post.position.set(px, 0.48, pz);
      terraceGroup.add(post);
    });

    const backRail = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.05, 2.5), darkFrameMat);
    backRail.position.set(-3.95, 0.94, 0);
    terraceGroup.add(backRail);

    const sideRailFront = new THREE.Mesh(new THREE.BoxGeometry(1.65, 0.05, 0.05), darkFrameMat);
    sideRailFront.position.set(-3.15, 0.94, 1.22);
    terraceGroup.add(sideRailFront);

    const sideRailBack = new THREE.Mesh(new THREE.BoxGeometry(1.65, 0.05, 0.05), darkFrameMat);
    sideRailBack.position.set(-3.15, 0.94, -1.22);
    terraceGroup.add(sideRailBack);

    // Mid horizontal cables on terrace
    const midCableBack = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.02, 2.48), steelTrussMat);
    midCableBack.position.set(-3.95, 0.5, 0);
    terraceGroup.add(midCableBack);

    // === 4. Optional Autonomous 3D Hardware Modules ===

    // 4A. Roof Solar Power Station
    const solarGroup = new THREE.Group();
    const solarFrame = new THREE.Mesh(new THREE.BoxGeometry(3.8, 0.08, 2.05), darkFrameMat);
    solarFrame.position.set(-0.2, 2.22, 0);
    solarGroup.add(solarFrame);
    const solarPanel = new THREE.Mesh(new THREE.BoxGeometry(3.66, 0.04, 1.92), solarMat);
    solarPanel.position.set(-0.2, 2.27, 0);
    solarPanel.rotation.z = -0.05;
    solarGroup.add(solarPanel);
    const solarCyanBusbar = new THREE.Mesh(new THREE.BoxGeometry(3.6, 0.025, 0.04), cyanAccentMat);
    solarCyanBusbar.position.set(-0.2, 2.3, 0.94);
    solarGroup.add(solarCyanBusbar);
    capsuleGroup.add(solarGroup);

    // 4B. LiFePO4 Energy Storage Battery Pod (armored under-chassis bay)
    const batteryGroup = new THREE.Group();
    const batteryBox = new THREE.Mesh(new THREE.BoxGeometry(1.65, 0.42, 1.55), darkFrameMat);
    batteryBox.position.set(-0.85, -0.34, 0);
    batteryBox.castShadow = true;
    batteryGroup.add(batteryBox);
    const batteryGlowBar1 = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.05, 0.04), cyanAccentMat);
    batteryGlowBar1.position.set(-0.85, -0.32, 0.78);
    batteryGroup.add(batteryGlowBar1);
    const batteryGlowBar2 = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.05, 0.04), cyanAccentMat);
    batteryGlowBar2.position.set(-0.85, -0.32, -0.78);
    batteryGroup.add(batteryGlowBar2);
    capsuleGroup.add(batteryGroup);

    // 4C. Air & Water Recuperation Manifold Pod (rear aerodynamic fairing)
    const recupGroup = new THREE.Group();
    const recupBody = new THREE.Mesh(new THREE.BoxGeometry(0.92, 0.42, 1.48), steelTrussMat);
    recupBody.position.set(-1.6, 2.32, 0);
    recupBody.castShadow = true;
    recupGroup.add(recupBody);
    const recupVent1 = new THREE.Mesh(
      new THREE.CylinderGeometry(0.16, 0.16, 0.12, 20),
      darkFrameMat
    );
    recupVent1.position.set(-1.6, 2.55, 0.36);
    recupGroup.add(recupVent1);
    const recupVent2 = new THREE.Mesh(
      new THREE.CylinderGeometry(0.16, 0.16, 0.12, 20),
      darkFrameMat
    );
    recupVent2.position.set(-1.6, 2.55, -0.36);
    recupGroup.add(recupVent2);
    const recupRing = new THREE.Mesh(
      new THREE.TorusGeometry(0.15, 0.02, 10, 24),
      cyanAccentMat
    );
    recupRing.rotation.x = Math.PI / 2;
    recupRing.position.set(-1.6, 2.61, 0.36);
    recupGroup.add(recupRing);
    capsuleGroup.add(recupGroup);

    // === 5. Dynamic X-Braced Steel Truss Piers & Concrete Anchor Footings ===
    const trussGroup = new THREE.Group();
    scene.add(trussGroup);

    const unitCylGeo = new THREE.CylinderGeometry(0.085, 0.085, 1, 10);
    const braceCylGeo = new THREE.CylinderGeometry(0.048, 0.048, 1, 8);
    const footingGeo = new THREE.BoxGeometry(0.42, 0.38, 0.42);

    // 4 main pier columns: 2 rear (higher ground on slope), 2 front (deep abyss cliffside)
    const pierCols = Array.from({ length: 4 }, () => {
      const m = new THREE.Mesh(unitCylGeo, steelTrussMat);
      m.castShadow = true;
      trussGroup.add(m);
      return m;
    });

    const footings = Array.from({ length: 4 }, () => {
      const f = new THREE.Mesh(footingGeo, concreteMat);
      f.castShadow = true;
      f.receiveShadow = true;
      trussGroup.add(f);
      return f;
    });

    // 8 diagonal X-braces (front plane, back plane, left plane, right plane)
    const xBraces = Array.from({ length: 8 }, () => {
      const b = new THREE.Mesh(braceCylGeo, steelTrussMat);
      b.castShadow = true;
      trussGroup.add(b);
      return b;
    });

    // Pre-allocated math helpers outside render loop (zero GC)
    const upAxis = new THREE.Vector3(0, 1, 0);
    const tmpDir = new THREE.Vector3();
    const topPts = [
      new THREE.Vector3(),
      new THREE.Vector3(),
      new THREE.Vector3(),
      new THREE.Vector3(),
    ];
    const botPts = [
      new THREE.Vector3(),
      new THREE.Vector3(),
      new THREE.Vector3(),
      new THREE.Vector3(),
    ];

    // Update dynamic geometry when config changes
    const syncVisuals = () => {
      const cfg = configRef.current;

      // Update shell material
      const fin = SHELL_FINISHES.find((f) => f.id === cfg.shellColor) ?? SHELL_FINISHES[0];
      hullMat.color.setHex(fin.threeColor);
      hullMat.roughness = fin.roughness;
      hullMat.metalness = fin.metalness;

      // Update autonomous option meshes
      solarGroup.visible = cfg.solar;
      batteryGroup.visible = cfg.battery;
      recupGroup.visible = cfg.recuperation;

      // Update Auto-Rotate
      controls.autoRotate = !isSoftwareGl && cfg.autoRotate;

      // Update capsule elevation & mountain slope tilt from stiltHeight (1.5m – 6.0m)
      const hFront = THREE.MathUtils.mapLinear(cfg.stiltHeight, 1.5, 6.0, 1.25, 4.15);
      const slopeAngle = THREE.MathUtils.mapLinear(cfg.stiltHeight, 1.5, 6.0, 0.14, 0.44);
      const hRear = Math.max(0.75, hFront - Math.tan(slopeAngle) * 3.4);

      capsuleGroup.position.y = hFront;

      // Slope terrain plane sits under the piers and tilts dynamically
      terrainMesh.rotation.z = -slopeAngle;
      terrainMesh.position.set(-0.6, hFront * 0.32 - 0.55, 0);

      // Anchor coordinates: [0]=front-right, [1]=front-left, [2]=rear-right, [3]=rear-left
      const xFront = 1.65;
      const xRear = -1.75;
      const zSpread = 0.96;

      const yTop = hFront - 0.12;
      const yBotFront = 0.15;
      const yBotRear = Math.min(yTop - 0.65, yTop - hRear);

      topPts[0].set(xFront, yTop, zSpread);
      topPts[1].set(xFront, yTop, -zSpread);
      topPts[2].set(xRear, yTop, zSpread);
      topPts[3].set(xRear, yTop, -zSpread);

      botPts[0].set(xFront, yBotFront, zSpread);
      botPts[1].set(xFront, yBotFront, -zSpread);
      botPts[2].set(xRear, yBotRear, zSpread);
      botPts[3].set(xRear, yBotRear, -zSpread);

      for (let i = 0; i < 4; i++) {
        updateStrutBetween(pierCols[i], botPts[i], topPts[i], upAxis, tmpDir);
        footings[i].position.set(botPts[i].x, botPts[i].y, botPts[i].z);
      }

      // X-Bracing pairs:
      // Front face (0-1)
      updateStrutBetween(xBraces[0], botPts[0], topPts[1], upAxis, tmpDir);
      updateStrutBetween(xBraces[1], botPts[1], topPts[0], upAxis, tmpDir);
      // Rear face (2-3)
      updateStrutBetween(xBraces[2], botPts[2], topPts[3], upAxis, tmpDir);
      updateStrutBetween(xBraces[3], botPts[3], topPts[2], upAxis, tmpDir);
      // Right side (0-2)
      updateStrutBetween(xBraces[4], botPts[0], topPts[2], upAxis, tmpDir);
      updateStrutBetween(xBraces[5], botPts[2], topPts[0], upAxis, tmpDir);
      // Left side (1-3)
      updateStrutBetween(xBraces[6], botPts[1], topPts[3], upAxis, tmpDir);
      updateStrutBetween(xBraces[7], botPts[3], topPts[1], upAxis, tmpDir);
    };

    syncVisuals();
    if (!isSoftwareGl) {
      renderer.compile(scene, camera);
    }

    // Paced Render Loop / On-demand helper compliant with Software WebGL guard
    let frameId = 0;
    let disposed = false;
    let renderBusy = false;
    let renderDirty = false;
    const clock = new THREE.Clock();

    function afterDraw(cb: () => void) {
      const gl = renderer.getContext() as WebGL2RenderingContext;
      if (gl && typeof gl.fenceSync === 'function') {
        const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
        gl.flush();
        const poll = () => {
          if (disposed) return;
          const state = sync && gl.getSyncParameter(sync, gl.SYNC_STATUS);
          if (state === gl.UNSIGNALED) {
            frameId = window.setTimeout(poll, 5);
          } else {
            if (sync) gl.deleteSync(sync);
            frameId = window.setTimeout(cb, 80);
          }
        };
        frameId = window.setTimeout(poll, 5);
      } else {
        frameId = window.setTimeout(cb, 80);
      }
    }

    const advanceCameraAndRender = () => {
      const dt = Math.min(clock.getDelta(), 0.05);
      const preset = cameraTargetPresetRef.current;
      if (preset.active) {
        camera.position.x = THREE.MathUtils.damp(camera.position.x, preset.pos.x, 5.5, dt);
        camera.position.y = THREE.MathUtils.damp(camera.position.y, preset.pos.y, 5.5, dt);
        camera.position.z = THREE.MathUtils.damp(camera.position.z, preset.pos.z, 5.5, dt);
        controls.target.x = THREE.MathUtils.damp(controls.target.x, preset.target.x, 5.5, dt);
        controls.target.y = THREE.MathUtils.damp(controls.target.y, preset.target.y, 5.5, dt);
        controls.target.z = THREE.MathUtils.damp(controls.target.z, preset.target.z, 5.5, dt);
        if (camera.position.distanceTo(preset.pos) < 0.05) {
          preset.active = false;
        }
      }
      controls.update();
      renderer.render(scene, camera);
    };

    const requestRender = () => {
      if (disposed) return;
      if (!isSoftwareGl) return; // GPU uses continuous rAF loop for smooth damping & autorotate
      if (renderBusy) {
        renderDirty = true;
        return;
      }
      renderBusy = true;
      frameId = requestAnimationFrame(() => {
        if (disposed) return;
        renderDirty = false;
        advanceCameraAndRender();
        afterDraw(() => {
          renderBusy = false;
          if (renderDirty || cameraTargetPresetRef.current.active) {
            requestRender();
          }
        });
      });
    };

    sceneHandlersRef.current = { syncVisuals, requestRender };
    controls.addEventListener('change', () => {
      if (isSoftwareGl) requestRender();
    });

    if (isSoftwareGl) {
      requestRender();
    } else {
      const tick = () => {
        if (disposed) return;
        advanceCameraAndRender();
        frameId = requestAnimationFrame(tick);
      };
      frameId = requestAnimationFrame(tick);
    }

    const resizeObserver = new ResizeObserver(() => {
      if (!container || disposed) return;
      const w = Math.max(container.clientWidth, 300);
      const h = Math.max(container.clientHeight, 380);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
      if (isSoftwareGl) requestRender();
    });
    resizeObserver.observe(container);

    return () => {
      disposed = true;
      cancelAnimationFrame(frameId);
      clearTimeout(frameId);
      resizeObserver.disconnect();
      controls.dispose();
      renderer.domElement.removeEventListener('webglcontextlost', handleContextLost);
      renderer.domElement.removeEventListener('webglcontextrestored', handleContextRestored);

      scene.traverse((obj) => {
        if (obj instanceof THREE.Mesh) {
          obj.geometry.dispose();
          if (Array.isArray(obj.material)) {
            obj.material.forEach((m) => m.dispose());
          } else {
            obj.material.dispose();
          }
        }
      });
      panelTex.dispose();
      solarTex.dispose();
      contactTex.dispose();
      envRT.dispose();
      renderer.dispose();
    };
  }, []);

  const handleTransfer = () => {
    onApplyToCalculator({
      shell: shellColor,
      stiltHeight,
      solar,
      battery,
      recuperation,
      autonomyDays,
      unitPriceMln,
    });
    setTransferred(true);
    setTimeout(() => setTransferred(false), 2600);
    const el = document.querySelector('#calculator');
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <section
      id="configurator"
      className="relative py-24 lg:py-32 border-t border-[#D1D5DB]/15 bg-[#0B0E14] scroll-mt-20"
    >
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10">
        {/* Section Header */}
        <div className="max-w-3xl mb-12 reveal-section">
          <div className="flex items-center gap-3 text-xs font-mono text-[#00F0FF] mb-3 tabular-nums">
            <span>03. Интерактивный 3D-конфигуратор</span>
            <span className="text-[#D1D5DB]/35" aria-hidden="true">·</span>
            <span className="text-[#D1D5DB]/75">WebGL · Вращение 360°</span>
          </div>
          <h2
            className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white leading-tight mb-4"
            style={{ textWrap: 'balance' }}
          >
            Сконфигурируйте модуль под рельеф вашего участка
          </h2>
          <p className="text-base sm:text-lg text-[#D1D5DB]/80 leading-relaxed">
            Управляйте камерой на 360°, меняйте высоту X-образных стальных ферм под уклон склона и
            добавляйте инженерные модули автономности с мгновенным пересчетом параметров.
          </p>
        </div>

        {/* Unobstructed 3D Viewport + Architectural Side HUD Panel */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* Left: Dedicated 3D WebGL Studio Viewport (zero backdrop-blur over WebGL) */}
          <div className="lg:col-span-8 relative rounded-xl overflow-hidden border border-[#D1D5DB]/20 bg-[#0B0E14] min-h-[460px] lg:min-h-[620px] flex flex-col">
            {/* Minimal Top-Left Spec Overlay (solid dark rgba, no backdrop-blur) */}
            <div className="absolute top-4 left-4 z-10 pointer-events-none px-3.5 py-2 rounded-lg bg-[#0B0E14]/90 border border-[#D1D5DB]/20">
              <div className="font-mono text-[11px] text-[#00F0FF] tabular-nums">
                SKY RIFT M-41 · {selectedFinish.name}
              </div>
              <div className="font-mono text-[11px] text-[#D1D5DB]/75 mt-0.5 tabular-nums">
                Ферма: {stiltHeight.toFixed(1)} м · Уклон ~{Math.round(14 + (stiltHeight - 1.5) * 9.5)}°
              </div>
            </div>

            {/* Dedicated Empty Ref Mount for WebGL Canvas */}
            {!webglFailed ? (
              <div
                ref={canvasMountRef}
                className="w-full h-full min-h-[460px] lg:min-h-[620px] cursor-grab active:cursor-grabbing"
                aria-label="Интерактивная 3D-модель капсулы SKY RIFT"
              />
            ) : (
              <div className="w-full h-full min-h-[460px] flex flex-col items-center justify-center p-8 text-center bg-[#0D1118]">
                <img
                  src="/assets/aistudio/hero_section_background_01865031.JPG"
                  alt="Предпросмотр модуля SKY RIFT"
                  referrerPolicy="no-referrer"
                  className="max-w-md w-full rounded-lg border border-[#D1D5DB]/20 mb-4 opacity-90"
                />
                <p className="text-sm text-[#D1D5DB]/80">
                  Аппаратное ускорение WebGL временно недоступно — параметры конфигурации
                  продолжают пересчитываться в панели справа.
                </p>
              </div>
            )}

            {/* Compact Bottom Camera Dock (no backdrop-blur over WebGL) */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 flex items-center gap-1.5 p-1.5 rounded-lg bg-[#0B0E14]/92 border border-[#D1D5DB]/20 max-w-[94%]">
              <button
                type="button"
                onClick={() => handleSelectCameraPreset('perspective')}
                className={`px-3 py-1.5 rounded text-xs font-medium transition-colors cursor-pointer whitespace-nowrap ${
                  cameraPreset === 'perspective'
                    ? 'bg-[#00F0FF] text-[#0B0E14] font-semibold'
                    : 'text-[#D1D5DB]/80 hover:text-white'
                }`}
              >
                Перспектива
              </button>
              <button
                type="button"
                onClick={() => handleSelectCameraPreset('facade')}
                className={`px-3 py-1.5 rounded text-xs font-medium transition-colors cursor-pointer whitespace-nowrap ${
                  cameraPreset === 'facade'
                    ? 'bg-[#00F0FF] text-[#0B0E14] font-semibold'
                    : 'text-[#D1D5DB]/80 hover:text-white'
                }`}
              >
                Панорама 270°
              </button>
              <button
                type="button"
                onClick={() => handleSelectCameraPreset('truss')}
                className={`px-3 py-1.5 rounded text-xs font-medium transition-colors cursor-pointer whitespace-nowrap ${
                  cameraPreset === 'truss'
                    ? 'bg-[#00F0FF] text-[#0B0E14] font-semibold'
                    : 'text-[#D1D5DB]/80 hover:text-white'
                }`}
              >
                X-опоры
              </button>
              <div className="w-[1px] h-5 bg-[#D1D5DB]/20 mx-0.5" aria-hidden="true" />
              <button
                type="button"
                onClick={() => setAutoRotate((prev) => !prev)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium transition-colors cursor-pointer whitespace-nowrap ${
                  autoRotate
                    ? 'bg-[#2F3942] text-[#00F0FF]'
                    : 'text-[#D1D5DB]/75 hover:text-white'
                }`}
                title="Включить или выключить автоповорот модели"
              >
                <RotateCw className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Автоповорот</span>
              </button>
            </div>
          </div>

          {/* Right: HUD Configuration Panel */}
          <div className="lg:col-span-4 flex flex-col">
            <SpecularCard className="flex-1 p-6 bg-[#131922]/95 flex flex-col justify-between gap-6">
              <div className="space-y-6">
                {/* 1. Shell Color Selector */}
                <div>
                  <div className="flex items-center justify-between text-xs font-mono text-[#D1D5DB]/75 mb-3">
                    <span>Цвет обшивки корпуса</span>
                    <span className="text-white">{selectedFinish.name}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {SHELL_FINISHES.map((fin) => {
                      const active = fin.id === shellColor;
                      return (
                        <button
                          key={fin.id}
                          type="button"
                          onClick={() => setShellColor(fin.id)}
                          className={`p-3 rounded-lg border text-left transition-all cursor-pointer ${
                            active
                              ? 'bg-[#2F3942]/85 border-[#00F0FF] text-white'
                              : 'bg-[#0B0E14]/70 border-[#D1D5DB]/15 text-[#D1D5DB]/75 hover:border-[#D1D5DB]/40'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span
                              className="w-5 h-5 rounded-sm border border-white/25 block"
                              style={{ backgroundColor: fin.hex }}
                            />
                            {active && <Check className="w-3.5 h-3.5 text-[#00F0FF]" />}
                          </div>
                          <div className="text-[11px] font-medium leading-tight">
                            {fin.name}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 2. Truss Stilt Height Slider (1.5 m — 6.0 m) */}
                <div className="pt-5 border-t border-[#D1D5DB]/15">
                  <div className="flex items-center justify-between mb-2">
                    <label
                      htmlFor="stilt-height-slider"
                      className="text-xs font-mono text-[#D1D5DB]/80"
                    >
                      Высота опорных ферм под уклон
                    </label>
                    <span className="font-mono text-base font-semibold text-[#00F0FF] tabular-nums">
                      {stiltHeight.toFixed(1)} м
                    </span>
                  </div>
                  <input
                    id="stilt-height-slider"
                    type="range"
                    min={1.5}
                    max={6.0}
                    step={0.1}
                    value={stiltHeight}
                    onChange={(e) => setStiltHeight(parseFloat(e.target.value))}
                    className="w-full skyrift-range my-2"
                  />
                  <div className="flex justify-between font-mono text-[11px] text-[#D1D5DB]/55 tabular-nums">
                    <span>1.5 м (пологий)</span>
                    <span>3.8 м (склон 45°)</span>
                    <span>6.0 м (обрыв 60°)</span>
                  </div>
                </div>

                {/* 3. Autonomous Energy & Life-Support Options */}
                <div className="pt-5 border-t border-[#D1D5DB]/15">
                  <div className="text-xs font-mono text-[#D1D5DB]/75 mb-3">
                    Модули автономности (отображаются в 3D)
                  </div>
                  <div className="space-y-2.5">
                    <label
                      className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                        solar
                          ? 'bg-[#2F3942]/65 border-[#00F0FF]/70'
                          : 'bg-[#0B0E14]/60 border-[#D1D5DB]/15 hover:border-[#D1D5DB]/35'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={solar}
                        onChange={(e) => setSolar(e.target.checked)}
                        className="mt-0.5 accent-[#00F0FF] w-4 h-4 cursor-pointer"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-sm font-medium text-white flex items-center gap-1.5">
                            <Sun className="w-3.5 h-3.5 text-[#00F0FF] shrink-0" />
                            <span>Кровельная солнечная станция</span>
                          </span>
                          <span className="font-mono text-xs text-[#00F0FF] tabular-nums shrink-0">
                            +9 дн
                          </span>
                        </div>
                        <div className="text-xs text-[#D1D5DB]/65 mt-0.5">
                          Монокристаллический массив 4.8 кВт на крыше
                        </div>
                      </div>
                    </label>

                    <label
                      className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                        battery
                          ? 'bg-[#2F3942]/65 border-[#00F0FF]/70'
                          : 'bg-[#0B0E14]/60 border-[#D1D5DB]/15 hover:border-[#D1D5DB]/35'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={battery}
                        onChange={(e) => setBattery(e.target.checked)}
                        className="mt-0.5 accent-[#00F0FF] w-4 h-4 cursor-pointer"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-sm font-medium text-white flex items-center gap-1.5">
                            <BatteryCharging className="w-3.5 h-3.5 text-[#00F0FF] shrink-0" />
                            <span>Накопители энергии LiFePO4</span>
                          </span>
                          <span className="font-mono text-xs text-[#00F0FF] tabular-nums shrink-0">
                            +10 дн
                          </span>
                        </div>
                        <div className="text-xs text-[#D1D5DB]/65 mt-0.5">
                          Термостатированный блок 30 кВт·ч под днищем
                        </div>
                      </div>
                    </label>

                    <label
                      className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                        recuperation
                          ? 'bg-[#2F3942]/65 border-[#00F0FF]/70'
                          : 'bg-[#0B0E14]/60 border-[#D1D5DB]/15 hover:border-[#D1D5DB]/35'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={recuperation}
                        onChange={(e) => setRecuperation(e.target.checked)}
                        className="mt-0.5 accent-[#00F0FF] w-4 h-4 cursor-pointer"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-sm font-medium text-white flex items-center gap-1.5">
                            <Wind className="w-3.5 h-3.5 text-[#00F0FF] shrink-0" />
                            <span>Рекуперация воздуха и воды</span>
                          </span>
                          <span className="font-mono text-xs text-[#00F0FF] tabular-nums shrink-0">
                            +8 дн
                          </span>
                        </div>
                        <div className="text-xs text-[#D1D5DB]/65 mt-0.5">
                          Замкнутый цикл доочистки и теплообмен 91%
                        </div>
                      </div>
                    </label>
                  </div>
                </div>
              </div>

              {/* 4. Live Autonomy & Assembly Cost Readout */}
              <div className="pt-5 border-t border-[#D1D5DB]/20 space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3.5 rounded-lg bg-[#0B0E14]/85 border border-[#D1D5DB]/15">
                    <div className="text-[11px] font-mono text-[#D1D5DB]/65">Автономность</div>
                    <div className="font-mono text-2xl font-semibold text-[#00F0FF] mt-1 tabular-nums">
                      {autonomyDays} дн.
                    </div>
                  </div>
                  <div className="p-3.5 rounded-lg bg-[#0B0E14]/85 border border-[#D1D5DB]/15">
                    <div className="text-[11px] font-mono text-[#D1D5DB]/65">Сборка модуля</div>
                    <div className="font-mono text-2xl font-semibold text-white mt-1 tabular-nums">
                      {unitPriceMln.toFixed(1)} млн ₽
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleTransfer}
                  className="w-full inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-lg text-sm font-semibold text-white bg-[#FF5E00] hover:bg-[#e55500] shadow-[0_0_24px_rgba(255,94,0,0.32)] transition-all cursor-pointer"
                >
                  <span>
                    {transferred
                      ? 'Конфигурация передана в расчет'
                      : 'Перенести в калькулятор проекта'}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <div className="flex items-center justify-between text-[11px] font-mono text-[#D1D5DB]/55">
                  <span className="inline-flex items-center gap-1">
                    <Eye className="w-3 h-3" />
                    Перетаскивайте для вращения
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Compass className="w-3 h-3" />
                    Колесо — зум
                  </span>
                </div>
              </div>
            </SpecularCard>
          </div>
        </div>
      </div>
    </section>
  );
};
