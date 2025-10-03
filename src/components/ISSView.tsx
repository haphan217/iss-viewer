import React, { useState, useEffect, useRef } from "react";
import { Canvas, useThree, useFrame } from "@react-three/fiber";
import UnifiedISSModel from "./UnifiedISSModel";
import EarthModel from "./EarthModel";
import { usePhysicsMovement } from "../hooks/usePhysicsMovement";
import { useMouseLook } from "../hooks/useMouseLook";
import { type DisasterEvent } from "../data/mockDisasterData";

// Movement mode enumeration
enum MovementMode {
  PHYSICS = 'physics', // Inside tunnel - zero gravity physics
  ORBITAL = 'orbital', // Outside - orbital movement around Earth
}

interface ISSViewProps {
  selectedMission: DisasterEvent | null;
  onMissionTargetClick: (mission: DisasterEvent) => void;
}

// Context for movement mode state
interface MovementContextType {
  mode: MovementMode;
  setMode: (mode: MovementMode) => void;
  isInTunnel: boolean;
}

const MovementContext = React.createContext<MovementContextType | null>(null);

// Physics-based camera controls component
const PhysicsCameraControls: React.FC = () => {
  const { camera } = useThree();
  const movementContext = React.useContext(MovementContext);

  const { updateMovement, resetVelocity } = usePhysicsMovement({
    boundaryX: 3.5,  // Tunnel width / 2 - margin
    boundaryY: 3,    // Tunnel height / 2 - margin
    boundaryZ: 8.5,  // Tunnel depth / 2 - margin
  });

  const { yaw, pitch, roll } = useMouseLook();

  // Tunnel boundaries for exit detection
  const TUNNEL_BOUNDS = {
    x: { min: -3.5, max: 3.5 },
    y: { min: -3, max: 3 },
    z: { min: -8.5, max: 8.5 }
  };

  useFrame((state, delta) => {
    if (!movementContext || movementContext.mode !== MovementMode.PHYSICS) {
      return;
    }

    // Apply physics movement
    updateMovement(delta, camera);

    // Check if camera has exited the tunnel
    const pos = camera.position;
    const hasExitedTunnel =
      pos.x < TUNNEL_BOUNDS.x.min || pos.x > TUNNEL_BOUNDS.x.max ||
      pos.y < TUNNEL_BOUNDS.y.min || pos.y > TUNNEL_BOUNDS.y.max ||
      pos.z < TUNNEL_BOUNDS.z.min || pos.z > TUNNEL_BOUNDS.z.max;

    if (hasExitedTunnel && movementContext.mode === MovementMode.PHYSICS) {
      // Switch to orbital mode when exiting tunnel
      movementContext.setMode(MovementMode.ORBITAL);
      resetVelocity();
    }

    // Apply mouse look rotation
    camera.rotation.set(pitch, yaw, roll, "YXZ");
  });

  return null;
};

// Orbital movement controls (arrow keys)
const OrbitalControls: React.FC = () => {
  const { camera } = useThree();
  const movementContext = React.useContext(MovementContext);

  const controlsRef = useRef({
    orbitAngle: 0,
    orbitHeight: 0,
    orbitRadius: 12,
    targetOrbitAngle: 0,
    targetOrbitHeight: 0,
    targetOrbitRadius: 12,
  });

  // Arrow key controls for orbital movement
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const controls = controlsRef.current;
      const orbitSpeed = 0.1;

      switch (event.key) {
        case "ArrowLeft":
          controls.targetOrbitAngle += orbitSpeed;
          break;
        case "ArrowRight":
          controls.targetOrbitAngle -= orbitSpeed;
          break;
        case "ArrowUp":
          controls.targetOrbitHeight += orbitSpeed;
          break;
        case "ArrowDown":
          controls.targetOrbitHeight -= orbitSpeed;
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Mouse wheel for orbital radius (zoom)
  useEffect(() => {
    const handleWheel = (event: WheelEvent) => {
      event.preventDefault();
      const controls = controlsRef.current;
      const zoomSpeed = 0.5;

      if (event.deltaY > 0) {
        controls.targetOrbitRadius = Math.min(controls.targetOrbitRadius + zoomSpeed, 20);
      } else {
        controls.targetOrbitRadius = Math.max(controls.targetOrbitRadius - zoomSpeed, 8);
      }
    };

    window.addEventListener("wheel", handleWheel, { passive: false });
    return () => window.removeEventListener("wheel", handleWheel);
  }, []);

  useFrame(() => {
    if (!movementContext || movementContext.mode !== MovementMode.ORBITAL) {
      return;
    }

    const controls = controlsRef.current;

    // Smooth interpolation for orbital movement
    controls.orbitAngle += (controls.targetOrbitAngle - controls.orbitAngle) * 0.05;
    controls.orbitHeight += (controls.targetOrbitHeight - controls.orbitHeight) * 0.05;
    controls.orbitRadius += (controls.targetOrbitRadius - controls.orbitRadius) * 0.05;

    // Calculate ISS orbital position around Earth
    const earthPosition = [0, 0, -12];
    const orbitX = Math.cos(controls.orbitAngle) * controls.orbitRadius + earthPosition[0];
    const orbitZ = Math.sin(controls.orbitAngle) * controls.orbitRadius + earthPosition[2];
    const orbitY = controls.orbitHeight + earthPosition[1];

    // Set camera position for orbital view
    camera.position.set(orbitX, orbitY, orbitZ);

    // Check if camera has entered the tunnel (for mode switching)
    const pos = camera.position;
    const TUNNEL_BOUNDS = {
      x: { min: -3.5, max: 3.5 },
      y: { min: -3, max: 3 },
      z: { min: -8.5, max: 8.5 }
    };

    const hasEnteredTunnel =
      pos.x >= TUNNEL_BOUNDS.x.min && pos.x <= TUNNEL_BOUNDS.x.max &&
      pos.y >= TUNNEL_BOUNDS.y.min && pos.y <= TUNNEL_BOUNDS.y.max &&
      pos.z >= TUNNEL_BOUNDS.z.min && pos.z <= TUNNEL_BOUNDS.z.max;

    if (hasEnteredTunnel) {
      // Switch to physics mode when entering tunnel
      movementContext.setMode(MovementMode.PHYSICS);
    }

    // Reset rotation for orbital view (looking at Earth)
    camera.rotation.set(0, controls.orbitAngle, 0);
  });

  return null;
};

// Camera controller component for mission transitions
const CameraController: React.FC<{ selectedMission: DisasterEvent | null }> = ({
  selectedMission,
}) => {
  const { camera } = useThree();
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    if (selectedMission && !isTransitioning) {
      setIsTransitioning(true);

      // Calculate target orbital position and head rotation based on mission coordinates
      const lat = selectedMission.coordinates.latitude;
      const lng = selectedMission.coordinates.longitude;

      // Convert lat/lng to orbital position
      const phi = (90 - lat) * (Math.PI / 180);
      const theta = (lng + 180) * (Math.PI / 180);

      // Calculate target orbital position to be above the mission location
      const targetOrbitAngle = theta;
      const targetOrbitHeight = Math.sin(phi) * 2;
      const targetOrbitRadius = 12;

      // Calculate head rotation to look down at the mission location
      const targetYaw = 0;
      const targetPitch = phi - Math.PI / 2;
      const targetRoll = 0;

      let progress = 0;
      const duration = 3000;
      const startTime = Date.now();

      const startOrbitAngle = camera.position.x
        ? Math.atan2(camera.position.z, camera.position.x)
        : 0;
      const startOrbitHeight = camera.position.y;
      const startOrbitRadius = Math.sqrt(
        camera.position.x * camera.position.x + camera.position.z * camera.position.z
      );
      const startYaw = camera.rotation.y;
      const startPitch = camera.rotation.x;
      const startRoll = camera.rotation.z;

      const animate = () => {
        const elapsed = Date.now() - startTime;
        progress = Math.min(elapsed / duration, 1);

        const easeInOutCubic = (t: number) =>
          t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
        const easedProgress = easeInOutCubic(progress);

        // Interpolate orbital position
        const currentOrbitAngle =
          startOrbitAngle + (targetOrbitAngle - startOrbitAngle) * easedProgress;
        const currentOrbitHeight =
          startOrbitHeight + (targetOrbitHeight - startOrbitHeight) * easedProgress;
        const currentOrbitRadius =
          startOrbitRadius + (targetOrbitRadius - startOrbitRadius) * easedProgress;

        // Calculate new camera position around Earth
        const earthPosition = [0, 0, -12];
        const orbitX = Math.cos(currentOrbitAngle) * currentOrbitRadius + earthPosition[0];
        const orbitZ = Math.sin(currentOrbitAngle) * currentOrbitRadius + earthPosition[2];
        const orbitY = currentOrbitHeight + earthPosition[1];

        camera.position.set(orbitX, orbitY, orbitZ);

        // Interpolate head rotation
        const currentYaw = startYaw + (targetYaw - startYaw) * easedProgress;
        const currentPitch = startPitch + (targetPitch - startPitch) * easedProgress;
        const currentRoll = startRoll + (targetRoll - startRoll) * easedProgress;

        camera.rotation.set(currentPitch, currentYaw, currentRoll, "YXZ");

        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          setIsTransitioning(false);
        }
      };

      animate();
    }
  }, [selectedMission, camera, isTransitioning]);

  return null;
};

// Scene component
const Scene: React.FC<ISSViewProps> = ({
  selectedMission,
  onMissionTargetClick,
}) => {
  const { camera } = useThree();
  const [missionTargetActive, setMissionTargetActive] = useState(false);
  const [movementMode, setMovementMode] = useState<MovementMode>(MovementMode.PHYSICS);

  // Determine if camera is inside tunnel based on initial position
  const [isInTunnel, setIsInTunnel] = useState(true);

  useEffect(() => {
    if (selectedMission) {
      const timer = setTimeout(() => {
        setMissionTargetActive(true);
      }, 3500);

      return () => clearTimeout(timer);
    } else {
      setMissionTargetActive(false);
    }
  }, [selectedMission]);

  // Check if camera position indicates being inside tunnel
  useEffect(() => {
    const checkTunnelStatus = () => {
      const pos = camera.position;
      const TUNNEL_BOUNDS = {
        x: { min: -3.5, max: 3.5 },
        y: { min: -3, max: 3 },
        z: { min: -8.5, max: 8.5 }
      };

      const inTunnel =
        pos.x >= TUNNEL_BOUNDS.x.min && pos.x <= TUNNEL_BOUNDS.x.max &&
        pos.y >= TUNNEL_BOUNDS.y.min && pos.y <= TUNNEL_BOUNDS.y.max &&
        pos.z >= TUNNEL_BOUNDS.z.min && pos.z <= TUNNEL_BOUNDS.z.max;

      setIsInTunnel(inTunnel);
    };

    checkTunnelStatus();
    const interval = setInterval(checkTunnelStatus, 100); // Check every 100ms
    return () => clearInterval(interval);
  }, [camera.position]);

  const handleMissionTargetClick = () => {
    if (selectedMission && missionTargetActive) {
      onMissionTargetClick(selectedMission);
    }
  };

  const movementContextValue: MovementContextType = {
    mode: movementMode,
    setMode: setMovementMode,
    isInTunnel,
  };

  return (
    <MovementContext.Provider value={movementContextValue}>
      {/* Lighting */}
      <ambientLight intensity={0.1} />
      <directionalLight position={[0, 0, 10]} intensity={0.8} color="#FFFFFF" />
      <pointLight position={[0, 0, -5]} intensity={0.3} color="#87CEEB" />
      <pointLight position={[0, 0, 0]} intensity={0.1} color="#4A90E2" />

      {/* Unified ISS Model (Tunnel + Sphere) */}
      <UnifiedISSModel position={[0, 0, 0]} tunnelLength={18} sphereRadius={2} />

      {/* Earth */}
      <EarthModel
        position={[0, 0, -12]}
        scale={[3, 3, 3]}
        onMissionTarget={
          selectedMission
            ? {
                latitude: selectedMission.coordinates.latitude,
                longitude: selectedMission.coordinates.longitude,
                isActive: missionTargetActive,
              }
            : undefined
        }
      />

      {/* Mission target clickable area */}
      {selectedMission && missionTargetActive && (
        <mesh
          position={[0, 0, -12]}
          onClick={handleMissionTargetClick}
          onPointerOver={() => {
            document.body.style.cursor = "pointer";
          }}
          onPointerOut={() => {
            document.body.style.cursor = "auto";
          }}
        >
          <sphereGeometry args={[6, 32, 16]} />
          <meshBasicMaterial transparent={true} opacity={0} />
        </mesh>
      )}

      {/* Camera controls */}
      <PhysicsCameraControls />
      <OrbitalControls />

      {/* Camera controller for mission transitions */}
      <CameraController selectedMission={selectedMission} />
    </MovementContext.Provider>
  );
};

const ISSView: React.FC<ISSViewProps> = (props) => {
  return (
    <div style={{ width: "100%", height: "100vh", background: "#000011" }}>
      <Canvas
        camera={{
          position: [0, 0, 0], // Start inside the tunnel at center
          fov: 75,
          near: 0.01,
          far: 1000,
        }}
        style={{
          background: "linear-gradient(180deg, #000011 0%, #001122 100%)",
        }}
      >
        <Scene {...props} />
      </Canvas>
    </div>
  );
};

export default ISSView;