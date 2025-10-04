import React, { useMemo } from "react";
import { Canvas } from "@react-three/fiber";
import { TextureLoader } from "three";
import EarthModel from "./EarthModel";
import ISSTunnelModel from "./ISSTunnelModel";
import ZeroGravityPhysics from "./ZeroGravityPhysics";
import cupolaImage from "../assets/cupola1.png";

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
const Scene: React.FC = () => {
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
      <EarthModel position={[0, 0, -25]} scale={[4, 4, 4]} />

      {/* Zero Gravity Physics System */}
      <ZeroGravityPhysics boundaries={{ x: 4, y: 3.5, z: 9 }} />
    </>
  );
};

const ISSView: React.FC = () => {
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
        <Scene />
      </Canvas>
    </div>
  );
};

export default ISSView;
