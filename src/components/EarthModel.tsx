import React, { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { Mesh } from "three";
import * as THREE from "three";

interface EarthModelProps {
  position?: [number, number, number];
  scale?: [number, number, number];
  onMissionTarget?: {
    latitude: number;
    longitude: number;
    isActive: boolean;
  };
}

const EarthModel: React.FC<EarthModelProps> = ({
  position = [0, 0, 0],
  scale = [1, 1, 1],
  onMissionTarget,
}) => {
  const earthRef = useRef<Mesh>(null);

  // Create Earth geometry and materials
  const earthGeometry = useMemo(() => {
    return new THREE.SphereGeometry(4, 64, 32);
  }, []);

  const earthMaterial = useMemo(() => {
    return new THREE.MeshPhongMaterial({
      color: 0x4A90E2,
      shininess: 100,
      transparent: true,
      opacity: 0.9,
    });
  }, []);

  // Create mission target marker
  const missionTargetGeometry = useMemo(() => {
    return new THREE.SphereGeometry(0.1, 16, 8);
  }, []);

  const missionTargetMaterial = useMemo(() => {
    return new THREE.MeshBasicMaterial({
      color: 0xFF0000,
      transparent: true,
      opacity: onMissionTarget?.isActive ? 0.8 : 0,
    });
  }, [onMissionTarget?.isActive]);

  // Calculate mission target position on Earth surface
  const missionTargetPosition = useMemo(() => {
    if (!onMissionTarget) return [0, 0, 0];
    
    const lat = onMissionTarget.latitude;
    const lng = onMissionTarget.longitude;
    
    // Convert lat/lng to 3D position on sphere
    const phi = (90 - lat) * (Math.PI / 180);
    const theta = (lng + 180) * (Math.PI / 180);
    
    const radius = 4.1; // Slightly above Earth surface
    const x = radius * Math.sin(phi) * Math.cos(theta);
    const y = radius * Math.cos(phi);
    const z = radius * Math.sin(phi) * Math.sin(theta);
    
    return [x, y, z];
  }, [onMissionTarget]);

  // Animation
  useFrame((state) => {
    if (earthRef.current) {
      // Slow rotation of Earth
      earthRef.current.rotation.y += 0.001;
    }
  });

  return (
    <group position={position} scale={scale}>
      {/* Earth */}
      <mesh ref={earthRef} geometry={earthGeometry} material={earthMaterial} />
      
      {/* Mission target marker */}
      {onMissionTarget && (
        <mesh
          position={missionTargetPosition as [number, number, number]}
          geometry={missionTargetGeometry}
          material={missionTargetMaterial}
        />
      )}
    </group>
  );
};

export default EarthModel;