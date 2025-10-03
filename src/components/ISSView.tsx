import React, { useState, useEffect, useRef } from "react";
import { Canvas, useThree, useFrame } from "@react-three/fiber";
import UnifiedISSModel from "./UnifiedISSModel";
import PhysicsController from "./PhysicsController";
import EarthModel from "./EarthModel";
import { type DisasterEvent } from "../data/mockDisasterData";

interface ISSViewProps {
  selectedMission: DisasterEvent | null;
  onMissionTargetClick: (mission: DisasterEvent) => void;
}

// Camera controls component for orbital movement (Arrow keys)
const OrbitalCameraControls: React.FC = () => {
  const { camera } = useThree();
  const controlsRef = useRef({
    // ISS orbital movement
    orbitAngle: 0,
    orbitHeight: 0,
    orbitRadius: 12, // Base radius around Earth
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

  // Mouse wheel controls for orbital radius (zoom)
  useEffect(() => {
    const handleWheel = (event: WheelEvent) => {
      event.preventDefault();
      const controls = controlsRef.current;
      const zoomSpeed = 0.5;

      if (event.deltaY > 0) {
        // Zoom out (increase orbital radius)
        controls.targetOrbitRadius = Math.min(
          controls.targetOrbitRadius + zoomSpeed,
          20
        );
      } else {
        // Zoom in (decrease orbital radius)
        controls.targetOrbitRadius = Math.max(
          controls.targetOrbitRadius - zoomSpeed,
          8 // Minimum safe distance from Earth
        );
      }
    };

    window.addEventListener("wheel", handleWheel, { passive: false });
    return () => window.removeEventListener("wheel", handleWheel);
  }, []);

  // Smooth orbital movement
  useFrame(() => {
    const controls = controlsRef.current;

    // Smooth interpolation for orbital movement
    controls.orbitAngle +=
      (controls.targetOrbitAngle - controls.orbitAngle) * 0.05;
    controls.orbitHeight +=
      (controls.targetOrbitHeight - controls.orbitHeight) * 0.05;
    controls.orbitRadius +=
      (controls.targetOrbitRadius - controls.orbitRadius) * 0.05;

    // Calculate ISS orbital position around Earth
    // Earth is at [0, 0, -12], so we need to account for this offset
    const earthPosition = [0, 0, -12];
    const orbitX =
      Math.cos(controls.orbitAngle) * controls.orbitRadius + earthPosition[0];
    const orbitZ =
      Math.sin(controls.orbitAngle) * controls.orbitRadius + earthPosition[2];
    const orbitY = controls.orbitHeight + earthPosition[1];

    // Set camera position (this will be overridden by PhysicsController for first-person movement)
    // Only apply orbital movement when not in first-person mode
    camera.position.set(orbitX, orbitY, orbitZ);
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
      const targetOrbitHeight = Math.sin(phi) * 2; // Adjust height based on latitude
      const targetOrbitRadius = 12; // Use same base radius as controls

      // Calculate head rotation to look down at the mission location
      const targetYaw = 0; // Look straight ahead
      const targetPitch = phi - Math.PI / 2; // Pitch to look down at Earth
      const targetRoll = 0; // Keep roll neutral

      let progress = 0;
      const duration = 3000;
      const startTime = Date.now();

      const startOrbitAngle = camera.position.x
        ? Math.atan2(camera.position.z, camera.position.x)
        : 0;
      const startOrbitHeight = camera.position.y;
      const startOrbitRadius = Math.sqrt(
        camera.position.x * camera.position.x +
          camera.position.z * camera.position.z
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
          startOrbitAngle +
          (targetOrbitAngle - startOrbitAngle) * easedProgress;
        const currentOrbitHeight =
          startOrbitHeight +
          (targetOrbitHeight - startOrbitHeight) * easedProgress;
        const currentOrbitRadius =
          startOrbitRadius +
          (targetOrbitRadius - startOrbitRadius) * easedProgress;

        // Calculate new camera position around Earth
        const earthPosition = [0, 0, -12];
        const orbitX =
          Math.cos(currentOrbitAngle) * currentOrbitRadius + earthPosition[0];
        const orbitZ =
          Math.sin(currentOrbitAngle) * currentOrbitRadius + earthPosition[2];
        const orbitY = currentOrbitHeight + earthPosition[1];

        camera.position.set(orbitX, orbitY, orbitZ);

        // Interpolate head rotation
        const currentYaw = startYaw + (targetYaw - startYaw) * easedProgress;
        const currentPitch =
          startPitch + (targetPitch - startPitch) * easedProgress;
        const currentRoll =
          startRoll + (targetRoll - startRoll) * easedProgress;

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

// ISS position tracker component
const ISSTracker: React.FC<{
  onPositionUpdate: (position: [number, number, number]) => void;
}> = ({ onPositionUpdate }) => {
  const { camera } = useThree();

  useFrame(() => {
    // Update ISS position to match camera position
    onPositionUpdate([camera.position.x, camera.position.y, camera.position.z]);
  });

  return null;
};

// Scene component
const Scene: React.FC<ISSViewProps> = ({
  selectedMission,
  onMissionTargetClick,
}) => {
  const [missionTargetActive, setMissionTargetActive] = useState(false);
  const [issPosition, setIssPosition] = useState([0, 0, 0]);
  const [isFirstPersonMode, setIsFirstPersonMode] = useState(false);

  useEffect(() => {
    if (selectedMission) {
      // Activate mission target after transition
      const timer = setTimeout(() => {
        setMissionTargetActive(true);
      }, 3500); // After transition completes

      return () => clearTimeout(timer);
    } else {
      setMissionTargetActive(false);
    }
  }, [selectedMission]);

  const handleMissionTargetClick = () => {
    if (selectedMission && missionTargetActive) {
      onMissionTargetClick(selectedMission);
    }
  };

  // Toggle between first-person and orbital view
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Tab") {
        event.preventDefault();
        setIsFirstPersonMode(!isFirstPersonMode);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isFirstPersonMode]);

  return (
    <>
      {/* Lighting - Optimized for both tunnel and cupola experience */}
      <ambientLight intensity={0.2} />
      <directionalLight position={[0, 0, 10]} intensity={0.8} color="#FFFFFF" />
      <pointLight position={[0, 0, -5]} intensity={0.3} color="#87CEEB" />
      <pointLight position={[0, 0, 0]} intensity={0.1} color="#4A90E2" />

      {/* Additional lighting for tunnel interior */}
      <pointLight position={[0, 0, -9]} intensity={0.5} color="#FFFFFF" />
      <spotLight 
        position={[-2, 3, -4]} 
        intensity={2} 
        angle={Math.PI / 3}
        penumbra={0.1}
        target-position={[0, 0, -4]}
        castShadow
      />
      <spotLight 
        position={[2, 3, 4]} 
        intensity={2} 
        angle={Math.PI / 3}
        penumbra={0.1}
        target-position={[0, 0, 4]}
        castShadow
      />

      {/* Unified ISS Model (Tunnel + Cupola) */}
      <UnifiedISSModel position={issPosition as [number, number, number]} />

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

      {/* ISS position tracker */}
      <ISSTracker onPositionUpdate={setIssPosition} />

      {/* Physics controller for first-person movement (WASD+QE + Mouse) */}
      {isFirstPersonMode && (
        <PhysicsController onPositionUpdate={setIssPosition} />
      )}

      {/* Orbital camera controls (Arrow keys) */}
      {!isFirstPersonMode && <OrbitalCameraControls />}

      {/* Camera controller for mission transitions */}
      <CameraController selectedMission={selectedMission} />

      {/* UI Overlay */}
      <div
        style={{
          position: "fixed",
          top: 20,
          left: 20,
          color: "white",
          fontFamily: "monospace",
          fontSize: "14px",
          zIndex: 100,
          pointerEvents: "none",
        }}
      >
        <div>Mode: {isFirstPersonMode ? "First-Person (WASD+QE + Mouse)" : "Orbital (Arrow Keys)"}</div>
        <div>Press TAB to switch modes</div>
        {isFirstPersonMode && (
          <>
            <div>WASD: Move forward/back/left/right</div>
            <div>QE: Move up/down</div>
            <div>Mouse: Look around</div>
          </>
        )}
        {!isFirstPersonMode && (
          <>
            <div>Arrow Keys: Orbit around Earth</div>
            <div>Mouse Wheel: Zoom in/out</div>
          </>
        )}
      </div>
    </>
  );
};

const ISSView: React.FC<ISSViewProps> = (props) => {
  return (
    <div style={{ width: "100%", height: "100vh", background: "#000011" }}>
      <Canvas
        camera={{
          position: [12, 0, -12], // Start in orbital position around Earth
          fov: 75, // Good FOV for both views
          near: 0.01,
          far: 1000,
        }}
        style={{
          background: "linear-gradient(180deg, #000011 0%, #001122 100%)",
        }}
        shadows
      >
        <Scene {...props} />
      </Canvas>
    </div>
  );
};

export default ISSView;