import React, { useState, useEffect, useMemo } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { TextureLoader } from "three";
import EarthModel from "./EarthModel";
import ISSTunnelModel from "./ISSTunnelModel";
import ZeroGravityPhysics from "./ZeroGravityPhysics";
import { type DisasterEvent } from "../data/mockDisasterData";
import cupolaImage from "../assets/cupola.png";

interface ISSViewProps {
  selectedMission: DisasterEvent | null;
  onMissionTargetClick: (mission: DisasterEvent) => void;
}

// CupolaPlane component to display the cupola image
const CupolaPlane: React.FC<{ position: [number, number, number] }> = ({
  position,
}) => {
  const texture = useMemo(() => new TextureLoader().load(cupolaImage), []);

  return (
    <mesh position={position}>
      <planeGeometry args={[24, 18]} />
      <meshBasicMaterial map={texture} transparent={true} />
    </mesh>
  );
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
        const earthPosition = [0, 0, -25];
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

// Scene component
const Scene: React.FC<ISSViewProps> = ({
  selectedMission,
  onMissionTargetClick,
}) => {
  const [missionTargetActive, setMissionTargetActive] = useState(false);

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

  return (
    <>
      {/* Enhanced Lighting for both tunnel and space */}
      <ambientLight intensity={0.1} />
      <directionalLight position={[0, 0, 10]} intensity={0.6} color="#FFFFFF" />
      <pointLight position={[0, 0, -5]} intensity={0.3} color="#87CEEB" />
      <pointLight position={[0, 0, 0]} intensity={0.1} color="#4A90E2" />

      {/* ISS Tunnel Model */}
      <ISSTunnelModel position={[0, 0, 0]} />

      {/* Cupola Plane - displays the cupola image */}
      <CupolaPlane position={[0, 0, -9]} />

      {/* Earth - floating in space, visible through Cupola windows */}
      <EarthModel
        position={[0, 0, -25]}
        scale={[4, 4, 4]}
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
          position={[0, 0, -25]}
          onClick={handleMissionTargetClick}
          onPointerOver={() => {
            document.body.style.cursor = "pointer";
          }}
          onPointerOut={() => {
            document.body.style.cursor = "auto";
          }}
        >
          <sphereGeometry args={[8, 32, 16]} />
          <meshBasicMaterial transparent={true} opacity={0} />
        </mesh>
      )}

      {/* Zero Gravity Physics System */}
      <ZeroGravityPhysics boundaries={{ x: 4, y: 3.5, z: 9 }} />

      {/* Camera controller for mission transitions */}
      <CameraController selectedMission={selectedMission} />
    </>
  );
};

const ISSView: React.FC<ISSViewProps> = (props) => {
  return (
    <div
      style={{
        width: "100%",
        height: "100vh",
        background: "#000011",
        position: "relative",
      }}
    >
      <Canvas
        camera={{
          position: [0, 0, 5], // Start in tunnel
          fov: 75, // Good FOV for both views
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
