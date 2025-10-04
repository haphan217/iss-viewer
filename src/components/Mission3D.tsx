import {
  useRef,
  useEffect,
  useCallback,
  useImperativeHandle,
  forwardRef,
} from "react";
import { useThree, useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface MissionState {
  isActive: boolean;
  target: unknown;
  isCapturing: boolean;
}

interface Mission3DProps {
  earthRef: React.RefObject<THREE.Mesh | null>;
  missionState: MissionState;
  onMissionStateChange: (state: MissionState) => void;
  onTargetHit: (hit: boolean) => void;
}

export interface Mission3DRef {
  startMission: () => void;
  resetMissionState: () => void;
  capturePhoto: () => void;
}

// Mission constants
const EARTH_RADIUS = 6.371;

const Mission3D = forwardRef<Mission3DRef, Mission3DProps>(
  ({ earthRef, missionState, onMissionStateChange, onTargetHit }, ref) => {
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

    // Create mission target
    const createMissionTarget = useCallback(() => {
      if (!earthRef.current) return null;

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

      // Add blinking animation to target
      const animateTarget = () => {
        if (target.material instanceof THREE.MeshBasicMaterial) {
          target.material.opacity = 0.3 + 0.5 * Math.sin(Date.now() * 0.005);
        }
        requestAnimationFrame(animateTarget);
      };
      animateTarget();

      // Create a random point on Earth's surface
      const vec = new THREE.Vector3();
      vec.set(
        Math.random() * 2 - 1,
        Math.random() * 2 - 1,
        Math.random() * 2 - 1
      );
      vec.normalize();
      vec.multiplyScalar(EARTH_RADIUS);
      target.position.copy(vec);

      earthRef.current.add(target);
      targetRef.current = target;
      return target;
    }, [earthRef]);

    // Start mission
    const startMission = useCallback(() => {
      const target = createMissionTarget();
      const newState = { isActive: true, target, isCapturing: false };
      onMissionStateChange(newState);
    }, [createMissionTarget, onMissionStateChange]);

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
        missionState.isCapturing
      )
        return;

      const newState = { ...missionState, isCapturing: true };
      onMissionStateChange(newState);

      // Set up raycaster to check if target is in center of screen
      const pointer = new THREE.Vector2(0, 0); // Center of screen
      raycaster.setFromCamera(pointer, camera);
      const intersects = raycaster.intersectObjects([
        missionState.target as THREE.Mesh,
        earthRef.current!,
      ]);

      // Check if target is hit and in center of view
      const targetHit =
        intersects.length > 0 && intersects[0].object === missionState.target;

      setTimeout(() => {
        onTargetHit(targetHit);

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

    // Animation loop for orbit simulation
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
