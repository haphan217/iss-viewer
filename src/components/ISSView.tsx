import { useMemo, useRef, useState, useCallback } from "react";
import { Canvas } from "@react-three/fiber";
import { TextureLoader } from "three";
import { Mesh } from "three";
import EarthModel from "./EarthModel";
import ISSTunnelModel from "./ISSTunnelModel";
import ZeroGravityPhysics from "./ZeroGravityPhysics";
import Mission from "./Mission";
import Mission3D, { type Mission3DRef } from "./Mission3D";
import cupolaImage from "../assets/cupola2.png";

interface MissionState {
  isActive: boolean;
  target: unknown;
  isCapturing: boolean;
}

const CupolaPlane: React.FC<{ position: [number, number, number] }> = ({
  position,
}) => {
  const texture = useMemo(() => new TextureLoader().load(cupolaImage), []);

  return (
    <mesh position={position}>
      <planeGeometry args={[18, 18]} />
      <meshBasicMaterial map={texture} transparent={true} />
    </mesh>
  );
};

// Scene component
const Scene: React.FC<{
  mission3DRef: React.RefObject<Mission3DRef | null>;
  missionState: MissionState;
  onMissionStateChange: (state: MissionState) => void;
  onTargetHit: (hit: boolean) => void;
}> = ({ mission3DRef, missionState, onMissionStateChange, onTargetHit }) => {
  const earthRef = useRef<Mesh>(null);

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
      <CupolaPlane position={[0, 3, -5]} />

      {/* Earth - floating in space, visible through Cupola windows */}
      <EarthModel earthRef={earthRef} enableMissionRotation={true} />

      {/* Zero Gravity Physics System */}
      <ZeroGravityPhysics boundaries={{ x: 4, y: 3.5, z: 9 }} />

      {/* Mission 3D Logic */}
      <Mission3D
        ref={mission3DRef}
        earthRef={earthRef}
        missionState={missionState}
        onMissionStateChange={onMissionStateChange}
        onTargetHit={onTargetHit}
      />
    </>
  );
};

const ISSView: React.FC = () => {
  const mission3DRef = useRef<Mission3DRef>(null);

  // Mission state management
  const [missionState, setMissionState] = useState<MissionState>({
    isActive: false,
    target: null,
    isCapturing: false,
  });

  // Mission state handlers
  const handleMissionStateChange = useCallback((state: MissionState) => {
    setMissionState(state);
  }, []);

  const handleTargetHit = useCallback((hit: boolean) => {
    if (hit) {
      // Mission passed - this will be handled by Mission component state
      console.log("Target hit successfully!");
    } else {
      // Mission failed - this will be handled by Mission component state
      console.log("Target missed!");
    }
  }, []);

  // Mission control handlers
  const handleStartMission = useCallback(() => {
    mission3DRef.current?.startMission();
  }, []);

  const handleCapturePhoto = useCallback(() => {
    mission3DRef.current?.capturePhoto();
  }, []);

  const handleResetMission = useCallback(() => {
    mission3DRef.current?.resetMissionState();
  }, []);

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
        <Scene
          mission3DRef={mission3DRef}
          missionState={missionState}
          onMissionStateChange={handleMissionStateChange}
          onTargetHit={handleTargetHit}
        />
      </Canvas>

      {/* Mission Component */}
      <Mission
        missionState={missionState}
        onStartMission={handleStartMission}
        onCapturePhoto={handleCapturePhoto}
        onResetMission={handleResetMission}
      />
    </div>
  );
};

export default ISSView;
