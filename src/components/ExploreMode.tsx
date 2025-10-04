import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import './ExploreMode.css';
import eventsData from '../data/events.json';
import { speak } from '../utils/textToSpeech';

// Global flag to ensure welcome message plays only once per session
let hasPlayedWelcomeGlobal = false;

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

const ExploreMode = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const infoPanelRef = useRef<HTMLDivElement>(null);
  const eventMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    class EarthViewExplore {
      scene: THREE.Scene;
      clock: THREE.Clock;
      raycaster: THREE.Raycaster;
      mouse: THREE.Vector2;
      pins: any[];
      pinMarkers: THREE.Object3D[];
      pinModelTemplate: THREE.Object3D | null;
      autoRotate: boolean;
      isAnimatingCamera: boolean;
      cameraAnimation: number | null;
      sceneScale: any;
      issOrbit: any;
      eventsByYear: EventsByYear;
      selectedYear: number | null;
      mockPinData: any[];
      viewMode: string;
      isTransitioning: boolean;
      renderer: THREE.WebGLRenderer;
      camera: THREE.PerspectiveCamera;
      controls: OrbitControls;
      ambientLight: THREE.AmbientLight;
      sunLight: THREE.DirectionalLight;
      earth: THREE.Mesh;
      issModel?: THREE.Object3D;
      orbitLine: THREE.Line;
      trailPositions: THREE.Vector3[];
      maxTrailLength: number;
      issTrail: THREE.Line;
      stars: THREE.Points;
      issGlow?: THREE.Mesh;
      voiceEnabled: boolean;
      hasPlayedWelcome: boolean;

      constructor() {
        this.scene = new THREE.Scene();
        this.clock = new THREE.Clock();
        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();
        this.pins = [];
        this.pinMarkers = [];
        this.pinModelTemplate = null;
        this.autoRotate = true;
        this.isAnimatingCamera = false;
        this.cameraAnimation = null;

        const SCALE = 100;
        const EARTH_RADIUS_KM = 6371;
        const ISS_ALTITUDE_KM = 408;
        const ISS_LENGTH_M = 109;
        const ISS_LENGTH_KM = ISS_LENGTH_M / 1000;

        this.sceneScale = {
          earthRadius: EARTH_RADIUS_KM / SCALE,
          issAltitude: (ISS_ALTITUDE_KM / SCALE) * 5,
          issRealSize: ISS_LENGTH_KM / SCALE,
          issVisibleSize: 2.5 * 5,
          issScaleFactor: 11470,
        };

        this.issOrbit = {
          altitude: ISS_ALTITUDE_KM,
          radius: this.sceneScale.earthRadius + this.sceneScale.issAltitude,
          speed: 27600,
          inclination: 51.6 * (Math.PI / 180),
          orbitalPeriod: 92.68 * 60,
          angle: 0,
        };

        // Group events by year from imported data
        this.eventsByYear = (eventsData as Event[]).reduce((acc, event) => {
          if (!acc[event.year]) {
            acc[event.year] = [];
          }
          acc[event.year].push(event);
          return acc;
        }, {} as EventsByYear);

        this.selectedYear = null;
        this.mockPinData = [];
        this.viewMode = 'earth';
        this.isTransitioning = false;
        this.trailPositions = [];
        this.maxTrailLength = 50;
        this.voiceEnabled = true;
        this.hasPlayedWelcome = false;

        this.renderer = null as any;
        this.camera = null as any;
        this.controls = null as any;
        this.ambientLight = null as any;
        this.sunLight = null as any;
        this.earth = null as any;
        this.orbitLine = null as any;
        this.issTrail = null as any;
        this.stars = null as any;

        this.init();
        this.setupEventListeners();
        this.animate();
        this.playWelcomeMessage();
      }

      playWelcomeMessage() {
        if (!hasPlayedWelcomeGlobal && this.voiceEnabled && 'speechSynthesis' in window) {
          // Mark as played immediately to prevent duplicate calls
          hasPlayedWelcomeGlobal = true;
          this.hasPlayedWelcome = true;

          // Wait longer to avoid interrupting the initial "Happy 25th anniversary" message
          // and to let the scene fully load
          setTimeout(() => {
            speak(
              "Welcome to ISS Viewer. You're viewing Earth from space. Select a year from the timeline to see historical events captured by the ISS.",
              { rate: 0.9, pitch: 1.0, volume: 0.8 }
            );
          }, 1000);
        }
      }

      init() {
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 1.2;
        containerRef.current?.appendChild(this.renderer.domElement);

        this.camera = new THREE.PerspectiveCamera(
          45,
          window.innerWidth / window.innerHeight,
          0.1,
          10000
        );
        this.camera.position.set(0, 0, 250);

        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;
        this.controls.minDistance = 100;
        this.controls.maxDistance = 500;
        this.controls.autoRotate = this.autoRotate;
        this.controls.autoRotateSpeed = 0.5;

        this.setupLighting();
        this.createEarth();
        this.loadISSModel();
        this.loadPinModel();
        this.createOrbitPath();
        this.createISSTrail();
        this.createStars();
        this.initializeTimeline();
      }

      setupLighting() {
        this.ambientLight = new THREE.AmbientLight(0x404060, 0.5);
        this.scene.add(this.ambientLight);

        this.sunLight = new THREE.DirectionalLight(0xfff8e7, 3.0);
        this.sunLight.position.set(100, 50, 50);
        this.scene.add(this.sunLight);

        const fillLight = new THREE.DirectionalLight(0x5599ff, 1.0);
        fillLight.position.set(-100, -50, -50);
        this.scene.add(fillLight);
      }

      createEarth() {
        const earthGeometry = new THREE.SphereGeometry(this.sceneScale.earthRadius, 64, 64);

        const textureLoader = new THREE.TextureLoader();
        const earthTexture = textureLoader.load(
          '/earth_texture.jpg',
          () => console.log('Earth texture loaded successfully'),
          undefined,
          (error) => console.error('Error loading Earth texture:', error)
        );

        const earthMaterial = new THREE.MeshStandardMaterial({
          map: earthTexture,
          roughness: 0.9,
          metalness: 0.1,
        });

        this.earth = new THREE.Mesh(earthGeometry, earthMaterial);
        this.scene.add(this.earth);
      }

      loadISSModel() {
        const loader = new GLTFLoader();

        loader.load(
          '/ISS_stationary.glb',
          (gltf) => {
            console.log('ISS model loaded successfully');
            this.issModel = gltf.scene;

            const issScale = this.sceneScale.issVisibleSize / 40;
            this.issModel.scale.set(issScale, issScale, issScale);

            this.updateISSPosition();

            this.issModel.traverse((child) => {
              if ((child as THREE.Mesh).isMesh) {
                child.castShadow = true;
                child.receiveShadow = true;
              }
            });

            const glowGeometry = new THREE.SphereGeometry(1.2, 16, 16);
            const glowMaterial = new THREE.MeshBasicMaterial({
              color: 0x00ffff,
              transparent: true,
              opacity: 0.3,
            });
            this.issGlow = new THREE.Mesh(glowGeometry, glowMaterial);
            this.issModel.add(this.issGlow);

            this.scene.add(this.issModel);
          },
          undefined,
          (error) => {
            console.error('Error loading ISS model:', error);
          }
        );
      }

      createOrbitPath() {
        const orbitPoints = [];
        const segments = 128;

        for (let i = 0; i <= segments; i++) {
          const angle = (i / segments) * Math.PI * 2;
          const position = this.getISSPositionAtAngle(angle);
          orbitPoints.push(position);
        }

        const orbitGeometry = new THREE.BufferGeometry().setFromPoints(orbitPoints);
        const orbitMaterial = new THREE.LineBasicMaterial({
          color: 0x00ffff,
          opacity: 0.5,
          transparent: true,
        });

        this.orbitLine = new THREE.Line(orbitGeometry, orbitMaterial);
        this.scene.add(this.orbitLine);
      }

      createISSTrail() {
        const trailGeometry = new THREE.BufferGeometry();
        const positions = new Float32Array(this.maxTrailLength * 3);
        trailGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

        const trailMaterial = new THREE.LineBasicMaterial({
          color: 0xffffff,
          opacity: 0.8,
          transparent: true,
        });

        this.issTrail = new THREE.Line(trailGeometry, trailMaterial);
        this.scene.add(this.issTrail);
      }

      updateISSTrail() {
        if (!this.issModel) return;

        this.trailPositions.push(this.issModel.position.clone());

        if (this.trailPositions.length > this.maxTrailLength) {
          this.trailPositions.shift();
        }

        const positions = this.issTrail.geometry.attributes.position.array as Float32Array;
        for (let i = 0; i < this.maxTrailLength; i++) {
          if (i < this.trailPositions.length) {
            const pos = this.trailPositions[i];
            positions[i * 3] = pos.x;
            positions[i * 3 + 1] = pos.y;
            positions[i * 3 + 2] = pos.z;
          } else {
            const lastPos = this.trailPositions[this.trailPositions.length - 1] || new THREE.Vector3();
            positions[i * 3] = lastPos.x;
            positions[i * 3 + 1] = lastPos.y;
            positions[i * 3 + 2] = lastPos.z;
          }
        }
        this.issTrail.geometry.attributes.position.needsUpdate = true;
      }

      getISSPositionAtAngle(angle: number) {
        const x = this.issOrbit.radius * Math.cos(angle);
        const y = this.issOrbit.radius * Math.sin(angle) * Math.sin(this.issOrbit.inclination);
        const z = this.issOrbit.radius * Math.sin(angle) * Math.cos(this.issOrbit.inclination);

        return new THREE.Vector3(x, y, z);
      }

      updateISSPosition() {
        if (!this.issModel) return;

        const position = this.getISSPositionAtAngle(this.issOrbit.angle);
        this.issModel.position.copy(position);

        const nextAngle = this.issOrbit.angle + 0.01;
        const nextPosition = this.getISSPositionAtAngle(nextAngle);

        const up = position.clone().normalize();

        const matrix = new THREE.Matrix4().lookAt(position, nextPosition, up);
        this.issModel.quaternion.setFromRotationMatrix(matrix);

        this.issModel.rotateX(Math.PI / 2);
        this.issModel.rotateZ(Math.PI / 2);

        this.updateISSInfo(position);
      }

      vector3ToLatLon(position: THREE.Vector3) {
        const normalized = position.clone().normalize();
        const lat = Math.asin(normalized.y) * (180 / Math.PI);
        const lon = Math.atan2(normalized.z, -normalized.x) * (180 / Math.PI);
        return { lat, lon };
      }

      getLocationName(lat: number, lon: number) {
        if (lat > 66) return 'Arctic';
        if (lat < -66) return 'Antarctic';

        if (lon >= -170 && lon <= -30) {
          if (lat >= 15 && lat <= 72) return 'North America';
          if (lat >= -56 && lat < 15) return 'South America';
        }
        if (lon >= -30 && lon <= 60) {
          if (lat >= 35 && lat <= 71) return 'Europe';
          if (lat >= -35 && lat < 35) return 'Africa';
        }
        if (lon >= 60 && lon <= 150) {
          if (lat >= 8 && lat <= 75) return 'Asia';
          if (lat >= -50 && lat < 8) return 'Oceania';
        }

        if (lat >= -60 && lat <= 60) {
          if (lon >= -170 && lon <= -70) return 'Pacific Ocean';
          if (lon >= -70 && lon <= 20) return 'Atlantic Ocean';
          if (lon >= 20 && lon <= 120) return 'Indian Ocean';
        }

        return 'Ocean';
      }

      updateISSInfo(position: THREE.Vector3) {
        const { lat, lon } = this.vector3ToLatLon(position);
        const locationName = this.getLocationName(lat, lon);

        const locationElement = document.getElementById('iss-location');
        if (locationElement) {
          locationElement.textContent = locationName;
        }

        const coordsElement = document.getElementById('iss-coords');
        if (coordsElement) {
          coordsElement.textContent = `${lat.toFixed(1)}°, ${lon.toFixed(1)}°`;
        }
      }

      createStars() {
        const starsGeometry = new THREE.BufferGeometry();
        const starCount = 3000;
        const positions = new Float32Array(starCount * 3);

        for (let i = 0; i < starCount * 3; i += 3) {
          const radius = 3000 + Math.random() * 2000;
          const theta = Math.random() * Math.PI * 2;
          const phi = Math.acos(2 * Math.random() - 1);

          positions[i] = radius * Math.sin(phi) * Math.cos(theta);
          positions[i + 1] = radius * Math.sin(phi) * Math.sin(theta);
          positions[i + 2] = radius * Math.cos(phi);
        }

        starsGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

        const starsMaterial = new THREE.PointsMaterial({
          color: 0xffffff,
          size: 2,
          sizeAttenuation: false,
        });

        this.stars = new THREE.Points(starsGeometry, starsMaterial);
        this.scene.add(this.stars);
      }

      latLonToVector3(lat: number, lon: number, radius = this.sceneScale.earthRadius) {
        const phi = (90 - lat) * (Math.PI / 180);
        const theta = (lon + 180) * (Math.PI / 180);

        const x = -(radius * Math.sin(phi) * Math.cos(theta));
        const z = radius * Math.sin(phi) * Math.sin(theta);
        const y = radius * Math.cos(phi);

        return new THREE.Vector3(x, y, z);
      }

      initializeTimeline() {
        const timeline = document.getElementById('timeline');
        if (!timeline) {
          console.log('Timeline element not found');
          return;
        }

        console.log('Initializing timeline with years 2000-2025');

        for (let year = 2000; year <= 2025; year++) {
          const button = document.createElement('button');
          button.className = 'year-button';
          button.textContent = year.toString();
          button.dataset.year = year.toString();

          button.addEventListener('click', () => {
            console.log('Year clicked:', year);
            this.selectYear(year);
          });

          timeline.appendChild(button);
        }
      }

      selectYear(year: number) {
        this.selectedYear = year;

        const buttons = document.querySelectorAll('.year-button');
        buttons.forEach(btn => {
          if (parseInt((btn as HTMLElement).dataset.year || '0') === year) {
            btn.classList.add('active');
          } else {
            btn.classList.remove('active');
          }
        });

        this.clearPins();

        const yearEvents = this.eventsByYear[year] || [];
        this.createPins(yearEvents);

        this.displayEventMenu(year, yearEvents);
      }

      displayEventMenu(year: number, events: Event[]) {
        const eventMenu = document.getElementById('event-menu');
        const eventList = document.getElementById('event-list');
        const eventMenuTitle = document.getElementById('event-menu-title');

        if (!eventMenu || !eventList || !eventMenuTitle) {
          console.log('Event menu elements not found:', { eventMenu, eventList, eventMenuTitle });
          return;
        }

        eventList.innerHTML = '';

        if (events.length === 0) {
          eventMenuTitle.textContent = `${year} - No Events`;
          eventMenu.classList.remove('visible');
          return;
        }

        eventMenuTitle.textContent = `${year} Events (${events.length})`;
        console.log('Displaying event menu for year', year, 'with', events.length, 'events');

        events.forEach((event, index) => {
          const eventItem = document.createElement('div');
          eventItem.className = 'event-item';
          eventItem.dataset.index = index.toString();

          const title = document.createElement('h4');
          title.textContent = event.title;

          const description = document.createElement('p');
          description.textContent = event.description;

          const location = document.createElement('div');
          location.className = 'event-location';
          location.textContent = `📍 ${event.lat.toFixed(2)}°, ${event.lon.toFixed(2)}°`;

          eventItem.appendChild(title);
          eventItem.appendChild(description);
          eventItem.appendChild(location);

          eventItem.addEventListener('click', () => {
            this.selectEvent(index, event);
          });

          eventList.appendChild(eventItem);
        });

        eventMenu.classList.add('visible');
        console.log('Event menu should now be visible. Classes:', eventMenu.className);
      }

      selectEvent(index: number, event: Event) {
        const eventItems = document.querySelectorAll('.event-item');
        eventItems.forEach((item, i) => {
          if (i === index) {
            item.classList.add('selected');
          } else {
            item.classList.remove('selected');
          }
        });

        this.focusOnEvent(event);
      }

      focusOnEvent(event: Event) {
        const targetPosition = this.latLonToVector3(event.lat, event.lon);

        const distance = 120;
        const cameraTargetPosition = targetPosition.clone().normalize().multiplyScalar(this.sceneScale.earthRadius + distance);

        this.controls.autoRotate = false;
        this.autoRotate = false;

        const startPosition = this.camera.position.clone();
        const startTarget = this.controls.target.clone();
        const endTarget = targetPosition.clone();

        let startTime: number | null = null;
        const duration = 2000;

        if (this.cameraAnimation) {
          cancelAnimationFrame(this.cameraAnimation);
        }

        this.isAnimatingCamera = true;

        const animateCamera = (timestamp: number) => {
          if (!startTime) startTime = timestamp;
          const elapsed = timestamp - startTime;
          const progress = Math.min(elapsed / duration, 1);

          const eased = progress < 0.5
            ? 2 * progress * progress
            : -1 + (4 - 2 * progress) * progress;

          this.camera.position.lerpVectors(startPosition, cameraTargetPosition, eased);
          this.controls.target.lerpVectors(startTarget, endTarget, eased);

          this.controls.update();

          if (progress < 1) {
            this.cameraAnimation = requestAnimationFrame(animateCamera);
          } else {
            this.isAnimatingCamera = false;
            this.cameraAnimation = null;
          }
        };

        this.cameraAnimation = requestAnimationFrame(animateCamera);
      }

      clearPins() {
        this.pinMarkers.forEach(pin => {
          this.earth.remove(pin);
        });
        this.pinMarkers = [];
      }

      loadPinModel() {
        const loader = new GLTFLoader();

        loader.load(
          '/map_pin.glb',
          (gltf) => {
            console.log('Pin model loaded successfully');
            this.pinModelTemplate = gltf.scene;
          },
          undefined,
          (error) => {
            console.error('Error loading pin model:', error);
          }
        );
      }

      createPins(events: Event[]) {
        events.forEach((data) => {
          const position = this.latLonToVector3(data.lat, data.lon);

          let pinGroup: THREE.Object3D;

          if (this.pinModelTemplate) {
            pinGroup = this.pinModelTemplate.clone();
            const pinScale = 20;
            pinGroup.scale.set(pinScale, pinScale, pinScale);
          } else {
            pinGroup = new THREE.Group();

            const headGeometry = new THREE.SphereGeometry(2, 16, 16);
            const headMaterial = new THREE.MeshBasicMaterial({
              color: 0xff4444,
            });
            const head = new THREE.Mesh(headGeometry, headMaterial);
            pinGroup.add(head);

            const stickGeometry = new THREE.CylinderGeometry(0.3, 0.3, 5, 8);
            const stickMaterial = new THREE.MeshBasicMaterial({ color: 0xff4444 });
            const stick = new THREE.Mesh(stickGeometry, stickMaterial);
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

          this.earth.add(pinGroup);
          this.pinMarkers.push(pinGroup);
        });
      }

      setupEventListeners() {
        window.addEventListener('resize', () => this.onWindowResize());

        this.renderer.domElement.addEventListener('click', (event) => this.onMouseClick(event));

        const closePanel = document.getElementById('close-panel');
        if (closePanel) {
          closePanel.addEventListener('click', () => {
            this.closeInfoPanel();
          });
        }

        // Close panel when clicking outside
        document.addEventListener('click', (event) => {
          const infoPanel = document.getElementById('info-panel');
          if (infoPanel && infoPanel.classList.contains('visible')) {
            const target = event.target as HTMLElement;
            // Check if click is outside the panel and not on a pin marker
            if (!infoPanel.contains(target) && !target.closest('.pin-marker')) {
              this.closeInfoPanel();
            }
          }
        });

        const viewModeButtons = document.querySelectorAll('.view-mode-btn');
        viewModeButtons.forEach(btn => {
          btn.addEventListener('click', () => {
            const mode = (btn as HTMLElement).dataset.mode;
            if (mode && mode !== this.viewMode && !this.isTransitioning) {
              this.switchViewMode(mode);
            }
          });
        });
      }

      onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
      }

      onMouseClick(event: MouseEvent) {
        this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

        this.raycaster.setFromCamera(this.mouse, this.camera);
        const intersects = this.raycaster.intersectObjects(this.pinMarkers, true);

        if (intersects.length > 0) {
          let pinObject: any = intersects[0].object;
          while (pinObject && !pinObject.userData.isPinMarker) {
            pinObject = pinObject.parent;
          }

          if (pinObject && pinObject.userData.isPinMarker) {
            this.showInfoPanel(pinObject.userData);
            // Mark that we clicked on a pin to prevent outside click from closing
            event.stopPropagation();
          }
        }
      }

      showInfoPanel(data: any) {
        const panel = document.getElementById('info-panel');
        const infoTitle = document.getElementById('info-title');
        const infoContent = document.getElementById('info-content');
        const infoImage = document.getElementById('info-image') as HTMLImageElement;

        if (!panel || !infoTitle || !infoContent || !infoImage) return;

        infoTitle.textContent = data.title;

        // Set the ISS image
        if (data.issImage) {
          infoImage.src = data.issImage;
          infoImage.alt = data.title;
        } else {
          infoImage.src = 'https://via.placeholder.com/640x360/1a2a40/00ffc8?text=No+Image+Available';
          infoImage.alt = 'No image available';
        }

        // Create content with description and highlights
        let contentHTML = `<p>${data.description}</p>`;
        if (data.highlights && data.highlights.length > 0) {
          contentHTML += '<ul class="highlights">';
          data.highlights.forEach((highlight: string) => {
            contentHTML += `<li>${highlight}</li>`;
          });
          contentHTML += '</ul>';
        }
        infoContent.innerHTML = contentHTML;

        panel.classList.add('visible');
      }

      closeInfoPanel() {
        const panel = document.getElementById('info-panel');
        if (panel) {
          panel.classList.remove('visible');
        }
      }

      switchViewMode(mode: string) {
        if (this.isTransitioning || mode === this.viewMode) return;

        this.viewMode = mode;
        this.isTransitioning = true;

        const viewModeButtons = document.querySelectorAll('.view-mode-btn');
        viewModeButtons.forEach(btn => {
          if ((btn as HTMLElement).dataset.mode === mode) {
            btn.classList.add('active');
          } else {
            btn.classList.remove('active');
          }
        });

        if (mode === 'iss') {
          this.transitionToISSView();
        } else {
          this.transitionToEarthView();
        }
      }

      transitionToISSView() {
        if (!this.issModel) {
          this.isTransitioning = false;
          return;
        }

        this.controls.autoRotate = false;
        this.autoRotate = false;

        const issPosition = this.issModel.position.clone();

        const offset = new THREE.Vector3(1.5, 0.8, 1.5);
        const cameraTargetPosition = issPosition.clone().add(offset);

        const startPosition = this.camera.position.clone();
        const startTarget = this.controls.target.clone();
        const endTarget = issPosition.clone();

        let startTime: number | null = null;
        const duration = 2000;

        if (this.cameraAnimation) {
          cancelAnimationFrame(this.cameraAnimation);
        }

        const animateCamera = (timestamp: number) => {
          if (!startTime) startTime = timestamp;
          const elapsed = timestamp - startTime;
          const progress = Math.min(elapsed / duration, 1);

          const eased = progress < 0.5
            ? 2 * progress * progress
            : -1 + (4 - 2 * progress) * progress;

          this.camera.position.lerpVectors(startPosition, cameraTargetPosition, eased);
          this.controls.target.lerpVectors(startTarget, endTarget, eased);

          this.controls.update();

          if (progress < 1) {
            this.cameraAnimation = requestAnimationFrame(animateCamera);
          } else {
            this.isTransitioning = false;
            this.cameraAnimation = null;
            this.updateUIForViewMode();
          }
        };

        this.cameraAnimation = requestAnimationFrame(animateCamera);
      }

      transitionToEarthView() {
        this.controls.autoRotate = false;
        this.autoRotate = false;

        const cameraTargetPosition = new THREE.Vector3(0, 0, 250);
        const endTarget = new THREE.Vector3(0, 0, 0);

        const startPosition = this.camera.position.clone();
        const startTarget = this.controls.target.clone();

        let startTime: number | null = null;
        const duration = 2000;

        if (this.cameraAnimation) {
          cancelAnimationFrame(this.cameraAnimation);
        }

        const animateCamera = (timestamp: number) => {
          if (!startTime) startTime = timestamp;
          const elapsed = timestamp - startTime;
          const progress = Math.min(elapsed / duration, 1);

          const eased = progress < 0.5
            ? 2 * progress * progress
            : -1 + (4 - 2 * progress) * progress;

          this.camera.position.lerpVectors(startPosition, cameraTargetPosition, eased);
          this.controls.target.lerpVectors(startTarget, endTarget, eased);

          this.controls.update();

          if (progress < 1) {
            this.cameraAnimation = requestAnimationFrame(animateCamera);
          } else {
            this.isTransitioning = false;
            this.cameraAnimation = null;
            this.controls.autoRotate = true;
            this.autoRotate = true;
            this.updateUIForViewMode();
          }
        };

        this.cameraAnimation = requestAnimationFrame(animateCamera);
      }

      updateUIForViewMode() {
        const issInfo = document.getElementById('iss-info');
        const timelineContainer = document.getElementById('timeline-container');
        const eventMenu = document.getElementById('event-menu');

        if (this.viewMode === 'iss') {
          if (issInfo) issInfo.style.display = 'block';
          if (timelineContainer) timelineContainer.style.display = 'none';
          if (eventMenu) eventMenu.style.display = 'none';
        } else {
          if (issInfo) issInfo.style.display = 'none';
          if (timelineContainer) timelineContainer.style.display = 'block';
        }
      }

      animate() {
        requestAnimationFrame(() => this.animate());

        const delta = this.clock.getDelta();

        this.controls.update();

        if (this.autoRotate) {
          this.earth.rotation.y += 0.001;
        }

        const angularVelocity = (Math.PI * 2) / this.issOrbit.orbitalPeriod;
        this.issOrbit.angle += angularVelocity * delta;

        if (this.issOrbit.angle > Math.PI * 2) {
          this.issOrbit.angle -= Math.PI * 2;
        }

        this.updateISSPosition();

        if (this.issModel && Math.random() < 0.3) {
          this.updateISSTrail();
        }

        if (this.issGlow) {
          const glowScale = 1.0 + Math.sin(Date.now() * 0.005) * 0.3;
          this.issGlow.scale.setScalar(glowScale);
        }

        this.pinMarkers.forEach((pin) => {
          if (pin.children[0]) {
            const scale = 1.0 + Math.sin(Date.now() * 0.003) * 0.2;
            pin.children[0].scale.setScalar(scale);
          }
        });

        this.renderer.render(this.scene, this.camera);
      }

      cleanup() {
        if (this.cameraAnimation) {
          cancelAnimationFrame(this.cameraAnimation);
        }
        this.renderer.dispose();
        this.controls.dispose();
      }
    }

    const app = new EarthViewExplore();

    return () => {
      app.cleanup();
      containerRef.current?.removeChild(app.renderer.domElement);
    };
  }, []);

  return (
    <>
      <div ref={containerRef} className="canvas-container"></div>

      <div className="ui-overlay">
        <div className="top-right-controls">
          <div className="instructions-container">
            <div className="instructions-panel">
              🖱️ Hold left mouse + drag to rotate • Scroll to zoom in/out • Hold right mouse + drag to move • Click on pins to view events
            </div>
            <div className="instructions-toggle">
              ❓
            </div>
          </div>
          <div className="view-mode-toggle">
            <button className="view-mode-btn active" data-mode="earth">
              <span>🌍</span>
              <span>Earth</span>
            </button>
            <button className="view-mode-btn" data-mode="iss">
              <span>🛰️</span>
              <span>ISS</span>
            </button>
          </div>
        </div>

        <div id="iss-info" style={{ display: 'none' }}>
          <h3>🛰️ ISS Orbit</h3>
          <div className="info-row">
            <span className="info-label">Speed:</span>
            <span className="info-value">27,600 km/h</span>
          </div>
          <div className="info-row">
            <span className="info-label">Altitude:</span>
            <span className="info-value">~408 km</span>
          </div>
          <div className="info-row">
            <span className="info-label">Orbital period:</span>
            <span className="info-value">~92.7 minutes</span>
          </div>
          <div className="info-row">
            <span className="info-label">Inclination:</span>
            <span className="info-value">51.6°</span>
          </div>
          <div className="info-row">
            <span className="info-label">Orbits/day:</span>
            <span className="info-value">~15.5 times</span>
          </div>
          <div className="info-row">
            <span className="info-label">Earth radius:</span>
            <span className="info-value">6,371 km</span>
          </div>
          <div className="scale-note">
            ⚠️ Note:
            <br /> ISS is magnified ~11,500x for easier observation.
            <br /> In reality, ISS is only 109m long, extremely small compared to Earth.
          </div>
        </div>

        <div id="info-panel" ref={infoPanelRef}>
          <h2 id="info-title">Event title</h2>
          <div className="viewfinder-wrapper">
            <img id="info-image" className="viewfinder-image" src="" alt="" />
            <div className="overlay-hud"></div>
          </div>
          <div id="info-content">Event information will be displayed here.</div>
          <button id="close-panel">Close</button>
        </div>

        <div id="event-menu" ref={eventMenuRef}>
          <h3 id="event-menu-title">Events</h3>
          <div id="event-list"></div>
        </div>

        <div id="timeline-container">
          <h3>🌍 25 years of ISS (2000-2025)</h3>
          <div id="timeline"></div>
        </div>
      </div>
    </>
  );
};

export default ExploreMode;
