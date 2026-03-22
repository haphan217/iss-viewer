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
  baseOrbitSpeed: number;
}

export interface Mission3DRef {
  startMission: () => void;
  resetMissionState: () => void;
  capturePhoto: () => void;
}

const Mission3D = forwardRef<Mission3DRef, Mission3DProps>(
  (
    {
      earthRef,
      missionState,
      onMissionStateChange,
      onTargetHit,
      selectedMission,
      baseOrbitSpeed,
    },
    ref
  ) => {
    const { camera } = useThree();

    const targetRef = useRef<THREE.Mesh>(null);
    const userSpeedModifierRef = useRef(0);
    const targetWorldPosRef = useRef(new THREE.Vector3());
    const cameraDirectionRef = useRef(new THREE.Vector3());
    const directionToTargetRef = useRef(new THREE.Vector3());
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

    // Convert lat/lon to 3D position on sphere (matching EarthModel scale and position)
    const latLonToVector3 = useCallback(
      (lat: number, lon: number, radius: number = 4) => {
        const phi = (90 - lat) * (Math.PI / 180);
        const theta = (lon + 180) * (Math.PI / 180);

        // Calculate position on sphere with radius 4 (matching EarthModel geometry)
        const x = -(radius * Math.sin(phi) * Math.cos(theta));
        const z = radius * Math.sin(phi) * Math.sin(theta);
        const y = radius * Math.cos(phi);

        return new THREE.Vector3(x, y, z);
      },
      []
    );

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
      const position = latLonToVector3(
        selectedMission.lat,
        selectedMission.lon,
        4.05
      );
      target.position.copy(position);
      target.userData.isMissionTarget = true;
      target.userData.missionData = selectedMission;

      earthRef.current.add(target);
      targetRef.current = target;
      return target;
    }, [earthRef, selectedMission, latLonToVector3]);

    const resetCamera = useCallback(() => {
      camera.position.set(0, 0, 5);
      camera.quaternion.set(0, 0, 0, 1);
    }, [camera]);

    // Start mission
    const startMission = useCallback(() => {
      if (!selectedMission) {
        console.warn("No mission selected");
        return;
      }
      createMissionTarget();
      const newState = {
        isActive: true,
        target: selectedMission,
        isCapturing: false,
      };
      resetCamera()
      onMissionStateChange(newState);
    }, [createMissionTarget, onMissionStateChange, selectedMission, resetCamera]);

    const resetMissionState = useCallback(() => {
        resetCamera()
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
    }, [earthRef, onMissionStateChange, resetCamera]);

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

      const targetWorldPos = targetWorldPosRef.current;
      targetRef.current.getWorldPosition(targetWorldPos);

      const cameraDirection = cameraDirectionRef.current;
      camera.getWorldDirection(cameraDirection);

      const directionToTarget = directionToTargetRef.current.subVectors(
        targetWorldPos,
        camera.position
      );
      if (directionToTarget.lengthSq() < 1e-10) {
        onTargetHit(false, missionState.target || undefined);
        onMissionStateChange({ ...missionState, isCapturing: false });
        return;
      }
      directionToTarget.normalize();

      const angle = cameraDirection.angleTo(directionToTarget);
      const angleDegrees = THREE.MathUtils.radToDeg(angle);

      const targetVisibleFromCamera = Math.abs(targetWorldPos.z) < 13;

      const toleranceDegrees = 30;
      const targetHit =
        angleDegrees <= toleranceDegrees && targetVisibleFromCamera;
      
      setTimeout(() => {
        onTargetHit(targetHit, missionState.target || undefined);

        const finalState = { ...missionState, isCapturing: false };
        onMissionStateChange(finalState);
      }, 100);
    }, [camera, onTargetHit, onMissionStateChange, missionState]);

    useFrame((_, delta) => {
      if (!earthRef.current) return;

      if (missionState.isActive) {
        if (keysPressedRef.current["KeyW"]) {
          userSpeedModifierRef.current += 0.03;
        }
        if (keysPressedRef.current["KeyS"]) {
          userSpeedModifierRef.current -= 0.03;
        }

        userSpeedModifierRef.current *= dampingRef.current;
        const totalOrbitSpeed = baseOrbitSpeed + userSpeedModifierRef.current;
        earthRef.current.rotation.y -= totalOrbitSpeed * delta;
      }

      if (targetRef.current && targetRef.current.material) {
        const material = targetRef.current.material as THREE.MeshBasicMaterial;
        material.opacity =
          0.3 + 0.5 * Math.sin(performance.now() * 0.005);
      }
    });

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
