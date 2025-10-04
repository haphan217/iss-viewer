import {
  useRef,
  useEffect,
  useCallback,
  useImperativeHandle,
  forwardRef,
} from "react";
import { useThree, useFrame } from "@react-three/fiber";
import * as THREE from "three";

export interface MissionData {
  id: string;
  title: string;
  location: string;
  lat: number;
  lon: number;
  year: number;
  description: string;
  issImage: string;
  highlights: string[];
  difficulty: string;
  briefing: string;
}

interface MissionState {
  isActive: boolean;
  target: MissionData | null;
  isCapturing: boolean;
}

interface Mission3DProps {
  earthRef: React.RefObject<THREE.Mesh | null>;
  missionState: MissionState;
  onMissionStateChange: (state: MissionState) => void;
  onTargetHit: (hit: boolean, mission?: MissionData) => void;
  selectedMission: MissionData | null;
}

export interface Mission3DRef {
  startMission: () => void;
  resetMissionState: () => void;
  capturePhoto: () => void;
}

const Mission3D = forwardRef<Mission3DRef, Mission3DProps>(
  ({ earthRef, missionState, onMissionStateChange, onTargetHit, selectedMission }, ref) => {
    const { camera, raycaster } = useThree();

    const targetRef = useRef<THREE.Mesh>(null);
    const orbitSpeedRef = useRef(0.02); // Base orbit speed
    const userSpeedModifierRef = useRef(0);
    const dampingRef = useRef(0.95);
    const keysPressedRef = useRef<Record<string, boolean>>({});

    // Keyboard controls
    useEffect(() => {
      const handleKeyDown = (event: KeyboardEvent) => {
        keysPressedRef.current[event.code] = true;
      };

      const handleKeyUp = (event: KeyboardEvent) => {
        keysPressedRef.current[event.code] = false;
      };

      window.addEventListener("keydown", handleKeyDown);
      window.addEventListener("keyup", handleKeyUp);

      return () => {
        window.removeEventListener("keydown", handleKeyDown);
        window.removeEventListener("keyup", handleKeyUp);
      };
    }, []);

    // Convert lat/lon to 3D position on sphere (matching EarthModel scale)
    const latLonToVector3 = useCallback((lat: number, lon: number, radius: number = 2) => {
      const phi = (90 - lat) * (Math.PI / 180);
      const theta = (lon + 180) * (Math.PI / 180);

      const x = -(radius * Math.sin(phi) * Math.cos(theta));
      const z = radius * Math.sin(phi) * Math.sin(theta);
      const y = radius * Math.cos(phi);

      return new THREE.Vector3(x, y, z);
    }, []);

    // Create mission target based on selected mission
    const createMissionTarget = useCallback(() => {
      if (!earthRef.current || !selectedMission) return null;

      // Remove existing target
      if (targetRef.current) {
        earthRef.current.remove(targetRef.current);
        targetRef.current.geometry.dispose();
        if (Array.isArray(targetRef.current.material)) {
          targetRef.current.material.forEach((material) => material.dispose());
        } else {
          targetRef.current.material.dispose();
        }
      }

      const targetGeometry = new THREE.SphereGeometry(0.08, 16, 16);
      const targetMaterial = new THREE.MeshBasicMaterial({
        color: 0xff0000,
        transparent: true,
        opacity: 0.8,
      });
      const target = new THREE.Mesh(targetGeometry, targetMaterial);

      // Position target at mission location
      const position = latLonToVector3(selectedMission.lat, selectedMission.lon, 2.05);
      target.position.copy(position);
      target.userData.isMissionTarget = true;
      target.userData.missionData = selectedMission;

      earthRef.current.add(target);
      targetRef.current = target;
      return target;
    }, [earthRef, selectedMission, latLonToVector3]);

    // Start mission
    const startMission = useCallback(() => {
      if (!selectedMission) {
        console.warn("No mission selected");
        return;
      }
      createMissionTarget();
      const newState = { isActive: true, target: selectedMission, isCapturing: false };
      onMissionStateChange(newState);
    }, [createMissionTarget, onMissionStateChange, selectedMission]);

    // Reset mission state
    const resetMissionState = useCallback(() => {
      const newState = {
        isActive: false,
        target: null,
        isCapturing: false,
      };
      onMissionStateChange(newState);

      if (targetRef.current && earthRef.current) {
        earthRef.current.remove(targetRef.current);
        targetRef.current.geometry.dispose();
        if (Array.isArray(targetRef.current.material)) {
          targetRef.current.material.forEach((material) => material.dispose());
        } else {
          targetRef.current.material.dispose();
        }
        targetRef.current = null;
      }
    }, [earthRef, onMissionStateChange]);

    // Capture photo
    const capturePhoto = useCallback(() => {
      if (
        !missionState.isActive ||
        !missionState.target ||
        missionState.isCapturing ||
        !targetRef.current
      )
        return;

      const newState = { ...missionState, isCapturing: true };
      onMissionStateChange(newState);

      // Set up raycaster to check if target is in center of screen
      const pointer = new THREE.Vector2(0, 0); // Center of screen
      raycaster.setFromCamera(pointer, camera);

      // Get all children of earth (including the target marker)
      const earthChildren = earthRef.current?.children || [];
      const intersects = raycaster.intersectObjects(earthChildren, true);

      // Check if target is hit and in center of view
      let targetHit = false;
      for (const intersect of intersects) {
        if (intersect.object === targetRef.current ||
            intersect.object.userData.isMissionTarget) {
          targetHit = true;
          break;
        }
      }

      setTimeout(() => {
        onTargetHit(targetHit, missionState.target || undefined);

        const finalState = { ...missionState, isCapturing: false };
        onMissionStateChange(finalState);
      }, 100);
    }, [
      camera,
      raycaster,
      earthRef,
      onTargetHit,
      onMissionStateChange,
      missionState,
    ]);

    // Animation loop for orbit simulation and target animation
    useFrame((_, delta) => {
      if (!earthRef.current) return;

      // Handle speed controls
      if (keysPressedRef.current["KeyW"]) {
        userSpeedModifierRef.current += 0.03;
      }
      if (keysPressedRef.current["KeyS"]) {
        userSpeedModifierRef.current -= 0.03;
      }

      userSpeedModifierRef.current *= dampingRef.current;
      const totalOrbitSpeed =
        orbitSpeedRef.current + userSpeedModifierRef.current;

      // Rotate Earth to simulate ISS orbit (90 minutes = 0.02 rad/s)
      earthRef.current.rotation.y += totalOrbitSpeed * delta;

      // Animate target marker (pulsing effect)
      if (targetRef.current && targetRef.current.material) {
        const material = targetRef.current.material as THREE.MeshBasicMaterial;
        material.opacity = 0.3 + 0.5 * Math.sin(Date.now() * 0.005);
      }
    });

    // Expose methods to parent component through ref
    useImperativeHandle(
      ref,
      () => ({
        startMission,
        resetMissionState,
        capturePhoto,
      }),
      [startMission, resetMissionState, capturePhoto]
    );

    return null;
  }
);


export default Mission3D;
