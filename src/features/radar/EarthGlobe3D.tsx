'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { UserLocation } from '@/types/models';
import { createEarthTexture, latLngToVector3 } from './worldTexture';
import { Plus, Minus, RotateCcw, MapPin, Eye, Compass, Loader2 } from 'lucide-react';

interface EarthGlobe3DProps {
  friends: UserLocation[];
  myLocation: UserLocation | null;
  selectedFriend: UserLocation | null;
  onSelectFriend: (friend: UserLocation) => void;
  className?: string;
}

export const EarthGlobe3D: React.FC<EarthGlobe3DProps> = ({
  friends,
  myLocation,
  selectedFriend,
  onSelectFriend,
  className = '',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const globeGroupRef = useRef<THREE.Group | null>(null);
  const markersGroupRef = useRef<THREE.Group | null>(null);
  const reqIdRef = useRef<number | null>(null);

  const [isLoading, setIsLoading] = useState(true);

  // Rotation & Drag state
  const isDraggingRef = useRef(false);
  const previousMousePositionRef = useRef({ x: 0, y: 0 });
  const targetRotationRef = useRef({ x: 0.3, y: -1.2 });
  const currentRotationRef = useRef({ x: 0.3, y: -1.2 });
  const autoRotateRef = useRef(true);
  const lastInteractionTimeRef = useRef(Date.now());
  const cameraDistanceRef = useRef(250);
  const targetCameraDistanceRef = useRef(250);

  // Pinch-to-zoom tracking
  const initialPinchDistanceRef = useRef<number | null>(null);

  const GLOBE_RADIUS = 90;

  // Fly to specific coordinates smoothly
  const flyToCoords = useCallback((lat: number, lng: number) => {
    autoRotateRef.current = false;
    lastInteractionTimeRef.current = Date.now();

    // Calculate rotation angles so that (lat, lng) faces the camera (+Z)
    const phi = (lat * Math.PI) / 180;
    const theta = (-lng * Math.PI) / 180;

    targetRotationRef.current = {
      x: phi,
      y: theta - Math.PI / 2,
    };
    targetCameraDistanceRef.current = 190; // Zoom in close to target
  }, []);

  // Watch for external selectedFriend change
  useEffect(() => {
    if (selectedFriend) {
      flyToCoords(selectedFriend.lat, selectedFriend.lng);
    }
  }, [selectedFriend, flyToCoords]);

  // Main Three.js Scene Setup
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let width = container.clientWidth || 600;
    let height = container.clientHeight || 500;

    // 1. Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1500);
    camera.position.z = cameraDistanceRef.current;
    cameraRef.current = camera;

    // 3. Renderer with antialiasing and high pixel ratio
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // 4. Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.4);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0x93c5fd, 1.6);
    directionalLight.position.set(200, 150, 200);
    scene.add(directionalLight);

    const backLight = new THREE.DirectionalLight(0x38bdf8, 0.6);
    backLight.position.set(-200, -100, -200);
    scene.add(backLight);

    // 5. Globe Group
    const globeGroup = new THREE.Group();
    scene.add(globeGroup);
    globeGroupRef.current = globeGroup;

    // Earth Sphere Mesh
    const earthGeometry = new THREE.SphereGeometry(GLOBE_RADIUS, 64, 64);
    const earthTexture = createEarthTexture();
    const earthMaterial = new THREE.MeshPhongMaterial({
      map: earthTexture,
      bumpScale: 0.05,
      specular: new THREE.Color(0x1e3a8a),
      shininess: 8,
    });
    const earthMesh = new THREE.Mesh(earthGeometry, earthMaterial);
    globeGroup.add(earthMesh);

    // Subtle Outer Atmosphere Glow
    const atmosphereGeometry = new THREE.SphereGeometry(GLOBE_RADIUS * 1.025, 48, 48);
    const atmosphereMaterial = new THREE.MeshBasicMaterial({
      color: 0x3b82f6,
      transparent: true,
      opacity: 0.12,
      side: THREE.BackSide,
      blending: THREE.AdditiveBlending,
    });
    const atmosphereMesh = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial);
    globeGroup.add(atmosphereMesh);

    // Subtle Core Inner Horizon
    const horizonGeometry = new THREE.SphereGeometry(GLOBE_RADIUS * 1.008, 48, 48);
    const horizonMaterial = new THREE.MeshBasicMaterial({
      color: 0x60a5fa,
      transparent: true,
      opacity: 0.06,
      side: THREE.FrontSide,
      blending: THREE.AdditiveBlending,
    });
    const horizonMesh = new THREE.Mesh(horizonGeometry, horizonMaterial);
    globeGroup.add(horizonMesh);

    // Markers Group attached to globe so they rotate in sync
    const markersGroup = new THREE.Group();
    globeGroup.add(markersGroup);
    markersGroupRef.current = markersGroup;

    setIsLoading(false);

    // Animation Loop
    let lastTime = performance.now();
    const animate = (currentTime: number) => {
      reqIdRef.current = requestAnimationFrame(animate);
      const delta = (currentTime - lastTime) / 1000;
      lastTime = currentTime;

      // Auto-rotation when not interacted for 3 seconds
      if (autoRotateRef.current && Date.now() - lastInteractionTimeRef.current > 3000) {
        targetRotationRef.current.y += 0.12 * delta;
      }

      // Smooth damping / interpolation for rotation
      currentRotationRef.current.x += (targetRotationRef.current.x - currentRotationRef.current.x) * 0.1;
      currentRotationRef.current.y += (targetRotationRef.current.y - currentRotationRef.current.y) * 0.1;

      // Clamp X rotation to prevent flipping upside-down
      currentRotationRef.current.x = Math.max(-Math.PI / 2.2, Math.min(Math.PI / 2.2, currentRotationRef.current.x));

      globeGroup.rotation.x = currentRotationRef.current.x;
      globeGroup.rotation.y = currentRotationRef.current.y;

      // Smooth camera distance interpolation (Zoom)
      cameraDistanceRef.current += (targetCameraDistanceRef.current - cameraDistanceRef.current) * 0.12;
      camera.position.z = cameraDistanceRef.current;

      renderer.render(scene, camera);
    };

    reqIdRef.current = requestAnimationFrame(animate);

    // Resize Handler
    const handleResize = () => {
      if (!container || !renderer || !camera) return;
      const newWidth = container.clientWidth;
      const newHeight = container.clientHeight;
      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, newHeight);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      if (reqIdRef.current) cancelAnimationFrame(reqIdRef.current);
      window.removeEventListener('resize', handleResize);
      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      earthGeometry.dispose();
      earthMaterial.dispose();
      earthTexture.dispose();
      atmosphereGeometry.dispose();
      atmosphereMaterial.dispose();
      renderer.dispose();
    };
  }, []);

  // Update Markers when friends or myLocation changes
  useEffect(() => {
    const markersGroup = markersGroupRef.current;
    if (!markersGroup) return;

    // Clear existing marker meshes
    while (markersGroup.children.length > 0) {
      const child = markersGroup.children[0] as THREE.Mesh;
      markersGroup.remove(child);
      if (child.geometry) child.geometry.dispose();
      if (child.material) {
        if (Array.isArray(child.material)) child.material.forEach((m) => m.dispose());
        else child.material.dispose();
      }
    }

    const allLocations = [...friends];
    if (myLocation && !allLocations.some((l) => l.userId === myLocation.userId)) {
      allLocations.push(myLocation);
    }

    allLocations.forEach((loc) => {
      const isMe = loc.userId === myLocation?.userId;
      const isSelected = selectedFriend?.userId === loc.userId;
      const pos = latLngToVector3(loc.lat, loc.lng, GLOBE_RADIUS);

      // 1. Marker Pinpoint / Beacon
      const pinHeight = isSelected ? 12 : 7;
      const pinGeom = new THREE.CylinderGeometry(0.8, 0.4, pinHeight, 8);
      pinGeom.translate(0, pinHeight / 2, 0);

      const pinMat = new THREE.MeshBasicMaterial({
        color: isMe ? 0x10b981 : isSelected ? 0x3b82f6 : 0x60a5fa,
      });

      const pinMesh = new THREE.Mesh(pinGeom, pinMat);
      pinMesh.position.copy(pos);
      // Orient cylinder pointing outward normal from sphere center
      pinMesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), pos.clone().normalize());

      // 2. Glowing Head / Sphere on top of pin
      const headGeom = new THREE.SphereGeometry(isSelected ? 3.5 : 2.5, 16, 16);
      const headMat = new THREE.MeshBasicMaterial({
        color: isMe ? 0x34d399 : isSelected ? 0x93c5fd : 0x3b82f6,
      });
      const headMesh = new THREE.Mesh(headGeom, headMat);
      headMesh.position.set(0, pinHeight, 0);
      pinMesh.add(headMesh);

      // 3. Ground Radar Pulse Ring at base
      const ringGeom = new THREE.RingGeometry(1.5, 3.5, 24);
      const ringMat = new THREE.MeshBasicMaterial({
        color: isMe ? 0x10b981 : 0x3b82f6,
        transparent: true,
        opacity: 0.5,
        side: THREE.DoubleSide,
      });
      const ringMesh = new THREE.Mesh(ringGeom, ringMat);
      ringMesh.rotation.x = Math.PI / 2;
      pinMesh.add(ringMesh);

      // Store location metadata on mesh for raycaster click handling
      pinMesh.userData = { location: loc };
      markersGroup.add(pinMesh);
    });
  }, [friends, myLocation, selectedFriend]);

  // Click / Tap Raycaster to select friends on the globe
  const handlePointerDown = (e: React.PointerEvent) => {
    isDraggingRef.current = true;
    autoRotateRef.current = false;
    lastInteractionTimeRef.current = Date.now();
    previousMousePositionRef.current = { x: e.clientX, y: e.clientY };

    // Check Raycaster intersection with markers
    const container = containerRef.current;
    const camera = cameraRef.current;
    const markersGroup = markersGroupRef.current;
    if (!container || !camera || !markersGroup) return;

    const rect = container.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(new THREE.Vector2(x, y), camera);

    const intersects = raycaster.intersectObjects(markersGroup.children, true);
    if (intersects.length > 0) {
      let hitObj: THREE.Object3D | null = intersects[0].object;
      while (hitObj && !hitObj.userData.location && hitObj.parent) {
        hitObj = hitObj.parent;
      }
      if (hitObj && hitObj.userData.location) {
        onSelectFriend(hitObj.userData.location);
      }
    }
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDraggingRef.current) return;
    const deltaX = e.clientX - previousMousePositionRef.current.x;
    const deltaY = e.clientY - previousMousePositionRef.current.y;

    previousMousePositionRef.current = { x: e.clientX, y: e.clientY };

    // Rotate globe based on mouse drag velocity
    targetRotationRef.current.y += deltaX * 0.006;
    targetRotationRef.current.x += deltaY * 0.006;
    lastInteractionTimeRef.current = Date.now();
  };

  const handlePointerUp = () => {
    isDraggingRef.current = false;
    lastInteractionTimeRef.current = Date.now();
  };

  // Wheel Zoom handler
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const zoomFactor = e.deltaY * 0.15;
    targetCameraDistanceRef.current = Math.max(150, Math.min(420, targetCameraDistanceRef.current + zoomFactor));
    lastInteractionTimeRef.current = Date.now();
  };

  // Touch pinch-to-zoom handlers
  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (initialPinchDistanceRef.current !== null) {
        const pinchDelta = initialPinchDistanceRef.current - distance;
        targetCameraDistanceRef.current = Math.max(150, Math.min(420, targetCameraDistanceRef.current + pinchDelta * 0.5));
      }
      initialPinchDistanceRef.current = distance;
    }
  };

  const handleTouchEnd = () => {
    initialPinchDistanceRef.current = null;
  };

  // UI Control actions
  const handleZoomIn = () => {
    targetCameraDistanceRef.current = Math.max(150, targetCameraDistanceRef.current - 40);
  };

  const handleZoomOut = () => {
    targetCameraDistanceRef.current = Math.min(420, targetCameraDistanceRef.current + 40);
  };

  const handleResetCamera = () => {
    if (myLocation) {
      flyToCoords(myLocation.lat, myLocation.lng);
    } else {
      // Default to Tashkent / Central Asia (41.3, 69.2)
      flyToCoords(41.3, 69.2);
    }
  };

  return (
    <div className={`relative w-full h-[520px] rounded-3xl overflow-hidden bg-[#07090E] border border-border/80 shadow-2xl select-none ${className}`}>
      {/* 3D Canvas Container */}
      <div
        ref={containerRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        onWheel={handleWheel}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className="w-full h-full cursor-grab active:cursor-grabbing touch-none"
      />

      {/* Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-[#07090E]/90 flex flex-col items-center justify-center gap-3 z-30">
          <Loader2 className="w-7 h-7 text-primary animate-spin" />
          <span className="text-xs font-semibold text-muted-foreground tracking-wider uppercase">
            Рендеринг 3D Глобуса...
          </span>
        </div>
      )}

      {/* Floating Tactical Globe Controls (Top Right) */}
      <div className="absolute top-4 right-4 z-20 flex flex-col gap-2">
        <button
          onClick={handleZoomIn}
          aria-label="Zoom in"
          className="p-2.5 bg-card/85 backdrop-blur-md border border-border/80 text-foreground hover:text-primary rounded-xl shadow-lg transition active:scale-95"
        >
          <Plus className="w-4 h-4" />
        </button>
        <button
          onClick={handleZoomOut}
          aria-label="Zoom out"
          className="p-2.5 bg-card/85 backdrop-blur-md border border-border/80 text-foreground hover:text-primary rounded-xl shadow-lg transition active:scale-95"
        >
          <Minus className="w-4 h-4" />
        </button>
        <button
          onClick={handleResetCamera}
          aria-label="Reset camera"
          title="Сброс на мою позицию"
          className="p-2.5 bg-card/85 backdrop-blur-md border border-border/80 text-foreground hover:text-primary rounded-xl shadow-lg transition active:scale-95"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* Bottom Globe Legend & Status */}
      <div className="absolute bottom-4 left-4 z-20 flex items-center gap-2 pointer-events-none">
        <div className="editorial-glass px-3 py-1.5 rounded-xl flex items-center gap-2 text-[11px] shadow-md">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-medium text-foreground">
            {friends.length} {friends.length === 1 ? 'друг делится' : 'друзей делятся'} локацией
          </span>
        </div>
      </div>
    </div>
  );
};
