import React, { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface EarthModelProps {
  position: [number, number, number];
  scale: [number, number, number];
  onMissionTarget?: {
    latitude: number;
    longitude: number;
    isActive: boolean;
  };
}

const EarthModel: React.FC<EarthModelProps> = ({
  position,
  scale,
  onMissionTarget,
}) => {
  const meshRef = useRef<THREE.Mesh>(null);

  // Create Earth texture (simplified)
  const earthTexture = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 256;
    const ctx = canvas.getContext("2d")!;

    // Create a simple Earth-like pattern
    const imageData = ctx.createImageData(512, 256);
    for (let i = 0; i < imageData.data.length; i += 4) {
      const x = (i / 4) % 512;
      const y = Math.floor((i / 4) / 512);

      // Create landmass patterns
      const noise = Math.sin(x * 0.01) * Math.cos(y * 0.02) * 0.5 + 0.5;
      const isLand = noise > 0.3 && noise < 0.8;

      if (isLand) {
        imageData.data[i] = 34;     // R
        imageData.data[i + 1] = 139; // G
        imageData.data[i + 2] = 34;  // B
      } else {
        imageData.data[i] = 25;     // R
        imageData.data[i + 1] = 25;  // G
        imageData.data[i + 2] = 112; // B
      }
      imageData.data[i + 3] = 255; // A
    }
    ctx.putImageData(imageData, 0, 0);

    return new THREE.CanvasTexture(canvas);
  }, []);

  // Rotate the Earth slowly
  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.1;
    }
  });

  // Calculate mission target position if provided
  const missionTargetPosition = useMemo(() => {
    if (!onMissionTarget) return null;

    const { latitude, longitude } = onMissionTarget;
    const radius = 3; // Earth radius

    // Convert lat/lng to 3D position on sphere
    const phi = (90 - latitude) * (Math.PI / 180);
    const theta = (longitude + 180) * (Math.PI / 180);

    const x = radius * Math.sin(phi) * Math.cos(theta);
    const y = radius * Math.cos(phi);
    const z = radius * Math.sin(phi) * Math.sin(theta);

    return [x, y, z] as [number, number, number];
  }, [onMissionTarget]);

  return (
    <group position={position}>
      {/* Earth sphere */}
      <mesh ref={meshRef} scale={scale}>
        <sphereGeometry args={[1, 64, 32]} />
        <meshStandardMaterial map={earthTexture} />
      </mesh>

      {/* Mission target indicator */}
      {onMissionTarget?.isActive && missionTargetPosition && (
        <mesh position={missionTargetPosition}>
          <sphereGeometry args={[0.1, 16, 16]} />
          <meshBasicMaterial color="red" />
        </mesh>
      )}

      {/* Atmospheric glow */}
      <mesh scale={[1.05, 1.05, 1.05]}>
        <sphereGeometry args={[1, 32, 32]} />
        <meshBasicMaterial
          color="#87CEEB"
          transparent={true}
          opacity={0.3}
        />
      </mesh>
    </group>
  );
};

export default EarthModel;