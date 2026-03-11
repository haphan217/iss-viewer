import "../styles/ExploreMode.css";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

import eventsData from "../data/events.json";
import { playClickSound } from "../utils/clickSound";
import EventInfo from "./InfoPanels/EventInfo";
import ISSInfo from "./InfoPanels/ISSInfo";

interface Event {
  year: number;
  lat: number;
  lon: number;
  title: string;
  description: string;
  issImage: string;
  highlights: string[];
}

interface EventsByYear {
  [year: number]: Event[];
}

const SCALE = 100;
const EARTH_RADIUS_KM = 6371;
const ISS_ALTITUDE_KM = 408;
const ISS_LENGTH_M = 109;
const ISS_LENGTH_KM = ISS_LENGTH_M / 1000;
const MAX_TRAIL_LENGTH = 50;

const initialSceneScale = {
  earthRadius: EARTH_RADIUS_KM / SCALE,
  issAltitude: (ISS_ALTITUDE_KM / SCALE) * 5,
  issRealSize: ISS_LENGTH_KM / SCALE,
  issVisibleSize: 2.5 * 5,
  issScaleFactor: 11470,
};

function latLonToVector3(
  lat: number,
  lon: number,
  radius: number = initialSceneScale.earthRadius
): THREE.Vector3 {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);
  const x = -(radius * Math.sin(phi) * Math.cos(theta));
  const z = radius * Math.sin(phi) * Math.sin(theta);
  const y = radius * Math.cos(phi);
  return new THREE.Vector3(x, y, z);
}

const TIMELINE_YEARS = Array.from({ length: 2026 - 2000 + 1 }, (_, i) => 2000 + i);

interface SceneRef {
  scene: THREE.Scene;
  clock: THREE.Clock;
  raycaster: THREE.Raycaster;
  mouse: THREE.Vector2;
  renderer: THREE.WebGLRenderer;
  camera: THREE.PerspectiveCamera;
  controls: OrbitControls;
  earth: THREE.Mesh;
  issModel: THREE.Object3D | null;
  orbitLine: THREE.Line;
  issTrail: THREE.Line;
  trailPositions: THREE.Vector3[];
  stars: THREE.Points;
  issGlow: THREE.Mesh | null;
  pinMarkers: THREE.Object3D[];
  pinModelTemplate: THREE.Object3D | null;
  sceneScale: typeof initialSceneScale;
  issOrbit: {
    radius: number;
    inclination: number;
    orbitalPeriod: number;
    angle: number;
  };
  cameraAnimation: number | null;
  isTransitioning: boolean;
  getISSPositionAtAngle: (angle: number) => THREE.Vector3;
  clearPins: () => void;
  createPins: (events: Event[]) => void;
  focusOnEvent: (event: Event) => void;
  transitionToISSView: () => void;
  transitionToEarthView: () => void;
}

const ExploreMode = () => {
  const { t } = useTranslation();
  const containerRef = useRef<HTMLDivElement>(null);

  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<"earth" | "iss">("earth");
  const [selectedEventIndex, setSelectedEventIndex] = useState<number | null>(null);
  const [infoPanelData, setInfoPanelData] = useState<{
    isVisible: boolean;
    title: string;
    description: string;
    image: string;
    highlights: string[];
    satellite?: string;
  }>({
    isVisible: false,
    title: "",
    description: "",
    image: "",
    highlights: [],
    satellite: "",
  });

  const eventsByYear = useMemo<EventsByYear>(() => {
    return (eventsData as Event[]).reduce((acc, event) => {
      if (!acc[event.year]) acc[event.year] = [];
      acc[event.year].push(event);
      return acc;
    }, {} as EventsByYear);
  }, []);

  const sceneRef = useRef<SceneRef | null>(null);
  const setInfoPanelDataRef = useRef(setInfoPanelData);
  setInfoPanelDataRef.current = setInfoPanelData;

  const handleCloseInfoPanel = useCallback(() => {
    setInfoPanelData((prev) => ({ ...prev, isVisible: false }));
  }, []);

  const showInfoPanel = useCallback((data: {
    title: string;
    description: string;
    issImage?: string;
    highlights?: string[];
    satellite?: string;
  }) => {
    setInfoPanelDataRef.current({
      isVisible: true,
      title: data.title,
      description: data.description,
      satellite: data.satellite,
      image:
        data.issImage ||
        "https://via.placeholder.com/640x360/1a2a40/00ffc8?text=No+Image+Available",
      highlights: data.highlights ?? [],
    });
  }, []);

  // Initialize Three.js scene and animation loop
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const scene = new THREE.Scene();
    const clock = new THREE.Clock();
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const issOrbit = {
      radius: initialSceneScale.earthRadius + initialSceneScale.issAltitude,
      inclination: 51.6 * (Math.PI / 180),
      orbitalPeriod: (92.68 * 60) / 10,
      angle: 0,
    };

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    container.appendChild(renderer.domElement);

    const camera = new THREE.PerspectiveCamera(
      45,
      window.innerWidth / window.innerHeight,
      0.1,
      10000
    );
    camera.position.set(0, 0, 250);
    scene.add(camera);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.minDistance = 100;
    controls.maxDistance = 500;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.5;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0x404060, 0.5);
    scene.add(ambientLight);
    const sunLight = new THREE.DirectionalLight(0xfff8e7, 3.0);
    sunLight.position.set(100, 50, 50);
    camera.add(sunLight);
    const fillLight = new THREE.DirectionalLight(0x5599ff, 1.0);
    fillLight.position.set(-100, -50, -50);
    camera.add(fillLight);

    // Earth
    const earthGeometry = new THREE.SphereGeometry(
      initialSceneScale.earthRadius,
      64,
      64
    );
    const textureLoader = new THREE.TextureLoader();
    const earthTexture = textureLoader.load(
      "/earth_texture.jpg",
      () => console.log("Earth texture loaded successfully"),
      undefined,
      (error) => console.error("Error loading Earth texture:", error)
    );
    const earthMaterial = new THREE.MeshStandardMaterial({
      map: earthTexture,
      roughness: 0.9,
      metalness: 0.1,
    });
    const earth = new THREE.Mesh(earthGeometry, earthMaterial);
    scene.add(earth);

    // Orbit path
    const getISSPositionAtAngle = (angle: number) => {
      const x = issOrbit.radius * Math.cos(angle);
      const y =
        issOrbit.radius * Math.sin(angle) * Math.sin(issOrbit.inclination);
      const z =
        issOrbit.radius * Math.sin(angle) * Math.cos(issOrbit.inclination);
      return new THREE.Vector3(x, y, z);
    };

    const orbitPoints: THREE.Vector3[] = [];
    for (let i = 0; i <= 128; i++) {
      orbitPoints.push(getISSPositionAtAngle((i / 128) * Math.PI * 2));
    }
    const orbitGeometry = new THREE.BufferGeometry().setFromPoints(orbitPoints);
    const orbitLine = new THREE.Line(
      orbitGeometry,
      new THREE.LineBasicMaterial({
        color: 0x00ffff,
        opacity: 0.5,
        transparent: true,
      })
    );
    scene.add(orbitLine);

    // ISS trail
    const trailPositions: THREE.Vector3[] = [];
    const trailGeometry = new THREE.BufferGeometry();
    const positions = new Float32Array(MAX_TRAIL_LENGTH * 3);
    trailGeometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    const issTrail = new THREE.Line(
      trailGeometry,
      new THREE.LineBasicMaterial({
        color: 0xffffff,
        opacity: 0.8,
        transparent: true,
      })
    );
    scene.add(issTrail);

    // Stars
    const starCount = 3000;
    const starPositions = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount * 3; i += 3) {
      const radius = 3000 + Math.random() * 2000;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      starPositions[i] = radius * Math.sin(phi) * Math.cos(theta);
      starPositions[i + 1] = radius * Math.sin(phi) * Math.sin(theta);
      starPositions[i + 2] = radius * Math.cos(phi);
    }
    const starsGeometry = new THREE.BufferGeometry();
    starsGeometry.setAttribute("position", new THREE.BufferAttribute(starPositions, 3));
    const stars = new THREE.Points(
      starsGeometry,
      new THREE.PointsMaterial({
        color: 0xffffff,
        size: 2,
        sizeAttenuation: false,
      })
    );
    scene.add(stars);

    let issModel: THREE.Object3D | null = null;
    let issGlow: THREE.Mesh | null = null;
    const pinMarkers: THREE.Object3D[] = [];
    let pinModelTemplate: THREE.Object3D | null = null;

    const updateISSPosition = () => {
      if (!issModel) return;
      const position = getISSPositionAtAngle(issOrbit.angle);
      issModel.position.copy(position);
      const nextAngle = issOrbit.angle + 0.01;
      const nextPosition = getISSPositionAtAngle(nextAngle);
      const up = position.clone().normalize();
      const matrix = new THREE.Matrix4().lookAt(position, nextPosition, up);
      issModel.quaternion.setFromRotationMatrix(matrix);
      issModel.rotateX(Math.PI / 2);
      issModel.rotateZ(Math.PI / 2);
    };

    const updateISSTrail = () => {
      if (!issModel) return;
      trailPositions.push(issModel.position.clone());
      if (trailPositions.length > MAX_TRAIL_LENGTH) trailPositions.shift();
      const posAttr = issTrail.geometry.attributes.position.array as Float32Array;
      for (let i = 0; i < MAX_TRAIL_LENGTH; i++) {
        const pos = i < trailPositions.length
          ? trailPositions[i]
          : trailPositions[trailPositions.length - 1] ?? new THREE.Vector3();
        posAttr[i * 3] = pos.x;
        posAttr[i * 3 + 1] = pos.y;
        posAttr[i * 3 + 2] = pos.z;
      }
      issTrail.geometry.attributes.position.needsUpdate = true;
    };

    const clearPins = () => {
      pinMarkers.forEach((pin) => earth.remove(pin));
      pinMarkers.length = 0;
    };

    const createPins = (events: Event[]) => {
      events.forEach((data) => {
        const position = latLonToVector3(data.lat, data.lon);
        let pinGroup: THREE.Object3D;
        if (pinModelTemplate) {
          pinGroup = pinModelTemplate.clone();
          const pinScale = 20;
          pinGroup.scale.set(pinScale, pinScale, pinScale);
        } else {
          pinGroup = new THREE.Group();
          const head = new THREE.Mesh(
            new THREE.SphereGeometry(2, 16, 16),
            new THREE.MeshBasicMaterial({ color: 0xff4444 })
          );
          pinGroup.add(head);
          const stick = new THREE.Mesh(
            new THREE.CylinderGeometry(0.3, 0.3, 5, 8),
            new THREE.MeshBasicMaterial({ color: 0xff4444 })
          );
          stick.position.y = -2.5;
          pinGroup.add(stick);
        }
        pinGroup.position.copy(position);
        const up = position.clone().normalize();
        pinGroup.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), up);
        pinGroup.userData = {
          title: data.title,
          description: data.description,
          issImage: data.issImage,
          highlights: data.highlights,
          isPinMarker: true,
        };
        earth.add(pinGroup);
        pinMarkers.push(pinGroup);
      });
    };

    let cameraAnimation: number | null = null;

    const focusOnEvent = (event: Event) => {
      const targetPosition = latLonToVector3(event.lat, event.lon);
      const distance = 120;
      const cameraTargetPosition = targetPosition
        .clone()
        .normalize()
        .multiplyScalar(initialSceneScale.earthRadius + distance);
      controls.autoRotate = false;
      const startPosition = camera.position.clone();
      const startTarget = controls.target.clone();
      const endTarget = targetPosition.clone();
      let startTime: number | null = null;
      const duration = 2000;
      if (cameraAnimation) cancelAnimationFrame(cameraAnimation);
      const animateCamera = (timestamp: number) => {
        if (!startTime) startTime = timestamp;
        const elapsed = timestamp - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const eased =
          progress < 0.5
            ? 2 * progress * progress
            : -1 + (4 - 2 * progress) * progress;
        camera.position.lerpVectors(startPosition, cameraTargetPosition, eased);
        controls.target.lerpVectors(startTarget, endTarget, eased);
        controls.update();
        if (progress < 1) {
          cameraAnimation = requestAnimationFrame(animateCamera);
        } else {
          cameraAnimation = null;
        }
      };
      cameraAnimation = requestAnimationFrame(animateCamera);
    };

    const transitionToISSView = () => {
      if (!issModel) {
        if (sceneRef.current) sceneRef.current.isTransitioning = false;
        return;
      }
      controls.autoRotate = false;
      const issPosition = issModel.position.clone();
      const offset = new THREE.Vector3(1.5, 0.8, 1.5);
      const cameraTargetPosition = issPosition.clone().add(offset);
      const startPosition = camera.position.clone();
      const startTarget = controls.target.clone();
      const endTarget = issPosition.clone();
      let startTime: number | null = null;
      const duration = 2000;
      if (cameraAnimation) cancelAnimationFrame(cameraAnimation);
      if (sceneRef.current) sceneRef.current.isTransitioning = true;
      const animateCamera = (timestamp: number) => {
        if (!startTime) startTime = timestamp;
        const elapsed = timestamp - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const eased =
          progress < 0.5
            ? 2 * progress * progress
            : -1 + (4 - 2 * progress) * progress;
        camera.position.lerpVectors(startPosition, cameraTargetPosition, eased);
        controls.target.lerpVectors(startTarget, endTarget, eased);
        controls.update();
        if (progress < 1) {
          cameraAnimation = requestAnimationFrame(animateCamera);
        } else {
          cameraAnimation = null;
          if (sceneRef.current) sceneRef.current.isTransitioning = false;
        }
      };
      cameraAnimation = requestAnimationFrame(animateCamera);
    };

    const transitionToEarthView = () => {
      controls.autoRotate = false;
      const cameraTargetPosition = new THREE.Vector3(0, 0, 250);
      const endTarget = new THREE.Vector3(0, 0, 0);
      const startPosition = camera.position.clone();
      const startTarget = controls.target.clone();
      let startTime: number | null = null;
      const duration = 2000;
      if (cameraAnimation) cancelAnimationFrame(cameraAnimation);
      if (sceneRef.current) sceneRef.current.isTransitioning = true;
      const animateCamera = (timestamp: number) => {
        if (!startTime) startTime = timestamp;
        const elapsed = timestamp - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const eased =
          progress < 0.5
            ? 2 * progress * progress
            : -1 + (4 - 2 * progress) * progress;
        camera.position.lerpVectors(startPosition, cameraTargetPosition, eased);
        controls.target.lerpVectors(startTarget, endTarget, eased);
        controls.update();
        if (progress < 1) {
          cameraAnimation = requestAnimationFrame(animateCamera);
        } else {
          cameraAnimation = null;
          if (sceneRef.current) sceneRef.current.isTransitioning = false;
          controls.autoRotate = true;
        }
      };
      cameraAnimation = requestAnimationFrame(animateCamera);
    };

    sceneRef.current = {
      scene,
      clock,
      raycaster,
      mouse,
      renderer,
      camera,
      controls,
      earth,
      issModel: null,
      orbitLine,
      issTrail,
      trailPositions,
      stars,
      issGlow: null,
      pinMarkers,
      pinModelTemplate: null,
      sceneScale: initialSceneScale,
      issOrbit,
      cameraAnimation: null,
      isTransitioning: false,
      getISSPositionAtAngle,
      clearPins,
      createPins,
      focusOnEvent,
      transitionToISSView,
      transitionToEarthView,
    };

    // Load ISS model
    const gltfLoader = new GLTFLoader();
    gltfLoader.load(
      "/ISS_stationary.glb",
      (gltf) => {
        issModel = gltf.scene;
        const issScale = initialSceneScale.issVisibleSize / 40;
        issModel.scale.set(issScale, issScale, issScale);
        updateISSPosition();
        issModel.traverse((child) => {
          if ((child as THREE.Mesh).isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
          }
        });
        const glowGeometry = new THREE.SphereGeometry(1.2, 16, 16);
        issGlow = new THREE.Mesh(
          glowGeometry,
          new THREE.MeshBasicMaterial({
            color: 0x00ffff,
            transparent: true,
            opacity: 0.3,
          })
        );
        issModel.add(issGlow);
        scene.add(issModel);
        if (sceneRef.current) {
          sceneRef.current.issModel = issModel;
          sceneRef.current.issGlow = issGlow;
        }
      },
      undefined,
      (error) => console.error("Error loading ISS model:", error)
    );

    gltfLoader.load(
      "/map_pin.glb",
      (gltf) => {
        pinModelTemplate = gltf.scene;
        if (sceneRef.current) sceneRef.current.pinModelTemplate = gltf.scene;
      },
      undefined,
      (error) => console.error("Error loading pin model:", error)
    );

    const onWindowResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    const onMouseClick = (event: MouseEvent) => {
      mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(pinMarkers, true);
      if (intersects.length > 0) {
        let pinObject: THREE.Object3D | null = intersects[0].object;
        const ud = (o: THREE.Object3D) => (o as THREE.Object3D & { userData: { isPinMarker?: boolean; title?: string; description?: string; issImage?: string; highlights?: string[] } }).userData;
        while (pinObject && !ud(pinObject).isPinMarker) {
          pinObject = pinObject.parent;
        }
        if (pinObject && ud(pinObject).isPinMarker) {
          const data = ud(pinObject);
          showInfoPanel({
            title: data.title ?? "",
            description: data.description ?? "",
            issImage: data.issImage,
            highlights: data.highlights,
            satellite: data.satellite,
          });
          event.stopPropagation();
        }
      }
    };

    window.addEventListener("resize", onWindowResize);
    renderer.domElement.addEventListener("click", onMouseClick);

    let animationId: number;
    const animate = () => {
      animationId = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      controls.update();
      const angularVelocity = (Math.PI * 2) / issOrbit.orbitalPeriod;
      issOrbit.angle += angularVelocity * delta;
      if (issOrbit.angle > Math.PI * 2) issOrbit.angle -= Math.PI * 2;
      updateISSPosition();
      if (issModel && Math.random() < 0.3) updateISSTrail();
      if (issGlow) {
        const glowScale = 1.0 + Math.sin(Date.now() * 0.005) * 0.3;
        issGlow.scale.setScalar(glowScale);
      }
      pinMarkers.forEach((pin) => {
        if (pin.children[0]) {
          const scale = 1.0 + Math.sin(Date.now() * 0.003) * 0.2;
          pin.children[0].scale.setScalar(scale);
        }
      });
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(animationId);
      if (cameraAnimation) cancelAnimationFrame(cameraAnimation);
      window.removeEventListener("resize", onWindowResize);
      renderer.domElement.removeEventListener("click", onMouseClick);
      renderer.dispose();
      controls.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      sceneRef.current = null;
    };
  }, [showInfoPanel]);

  // Sync selected year to scene: clear pins and create new ones
  useEffect(() => {
    const ref = sceneRef.current;
    if (selectedYear === null || !ref) return;
    ref.clearPins();
    const yearEvents = eventsByYear[selectedYear] ?? [];
    ref.createPins(yearEvents);
  }, [selectedYear, eventsByYear]);

  // Sync view mode: run camera transition when user switches mode (skip initial mount)
  const prevViewModeRef = useRef<"earth" | "iss" | null>(null);
  useEffect(() => {
    const ref = sceneRef.current;
    if (!ref || ref.isTransitioning) return;
    if (prevViewModeRef.current === null) {
      prevViewModeRef.current = viewMode;
      return;
    }
    if (prevViewModeRef.current === viewMode) return;
    prevViewModeRef.current = viewMode;
    if (viewMode === "iss") ref.transitionToISSView();
    else ref.transitionToEarthView();
  }, [viewMode]);

  // Focus camera on selected event when user clicks an event item
  const prevSelectedEventRef = useRef<{ year: number; index: number } | null>(null);
  useEffect(() => {
    const ref = sceneRef.current;
    if (selectedYear === null || selectedEventIndex === null || !ref) return;
    const events = eventsByYear[selectedYear] ?? [];
    const event = events[selectedEventIndex];
    if (!event) return;
    const prev = prevSelectedEventRef.current;
    const sameSelection = prev?.year === selectedYear && prev?.index === selectedEventIndex;
    prevSelectedEventRef.current = { year: selectedYear, index: selectedEventIndex };
    if (!sameSelection) ref.focusOnEvent(event);
  }, [selectedYear, selectedEventIndex, eventsByYear]);

  const handleYearSelect = useCallback((year: number) => {
    playClickSound();
    setSelectedYear(year);
    setSelectedEventIndex(null);
  }, []);

  const handleEventSelect = useCallback((index: number) => {
    playClickSound();
    setSelectedEventIndex(index);
  }, []);

  const handleViewModeChange = useCallback((mode: "earth" | "iss") => {
    if (mode === viewMode || sceneRef.current?.isTransitioning) return;
    playClickSound();
    setViewMode(mode);
  }, [viewMode]);

  const eventsForYear = selectedYear !== null ? (eventsByYear[selectedYear] ?? []) : [];
  const showEventMenu = selectedYear !== null;

  return (
    <>
      <div ref={containerRef} className="canvas-container" />

      <EventInfo
        isVisible={infoPanelData.isVisible}
        title={infoPanelData.title}
        description={infoPanelData.description}
        image={infoPanelData.image}
        highlights={infoPanelData.highlights}
        onClose={handleCloseInfoPanel}
        buttonText={t("Close")}
      />

      <ISSInfo visible={viewMode === "iss"} />

      <div className="ui-overlay">
        <div className="top-right-controls">
          <div className="instructions-container">
            <div className="instructions-panel">
              {t(
                "Hold left mouse + drag to rotate • Scroll to zoom in/out • Click on pins to view events"
              )}
            </div>
            <div className="instructions-toggle">❓</div>
          </div>
          <div className="view-mode-toggle">
            <button
              type="button"
              className={`view-mode-btn ${viewMode === "earth" ? "active" : ""}`}
              data-mode="earth"
              onClick={() => handleViewModeChange("earth")}
            >
              <span>🌍</span>
              <span>{t("Earth")}</span>
            </button>
            <button
              type="button"
              className={`view-mode-btn ${viewMode === "iss" ? "active" : ""}`}
              data-mode="iss"
              onClick={() => handleViewModeChange("iss")}
            >
              <span>🛰️</span>
              <span>{t("ISS")}</span>
            </button>
          </div>
        </div>

        <div
          id="event-menu"
          className={showEventMenu && eventsForYear.length > 0 ? "visible" : ""}
          style={{
            display: viewMode === "iss" ? "none" : undefined,
          }}
        >
          <h3 id="event-menu-title">
            {selectedYear !== null
              ? eventsForYear.length === 0
                ? `${selectedYear} - No Events`
                : `${selectedYear} ${t("Events")} (${eventsForYear.length})`
              : t("Events")}
          </h3>
          <div id="event-list">
            {eventsForYear.map((event, index) => (
              <div
                key={`${event.title}-${index}`}
                role="button"
                tabIndex={0}
                className={`event-item ${selectedEventIndex === index ? "selected" : ""}`}
                onClick={() => handleEventSelect(index)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") handleEventSelect(index);
                }}
              >
                <h4>{t(event.title)}</h4>
                <p>{t(event.description)}</p>
                <div className="event-location">
                  📍 {event.lat.toFixed(2)}°, {event.lon.toFixed(2)}°
                </div>
              </div>
            ))}
          </div>
        </div>

        <div
          id="timeline-container"
          style={{ display: viewMode === "iss" ? "none" : "block" }}
        >
          <h3>🌍 {t("25 years of ISS (2000-2025)")}</h3>
          <div id="timeline">
            {TIMELINE_YEARS.map((year) => {
              const yearEvents = eventsByYear[year];
              const hasEvents = yearEvents && yearEvents.length > 0;
              return (
                <button
                  key={year}
                  type="button"
                  className={`year-button ${selectedYear === year ? "active" : ""} ${hasEvents ? "has-events" : ""}`}
                  data-year={year}
                  title={hasEvents ? `${yearEvents!.length} event${yearEvents!.length > 1 ? "s" : ""}` : undefined}
                  onClick={() => handleYearSelect(year)}
                >
                  {year}
                  {hasEvents && <span className="event-dot" />}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
};

export default ExploreMode;
