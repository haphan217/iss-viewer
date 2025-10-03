import React, { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { Mesh } from "three";
import * as THREE from "three";

interface EarthModelProps {
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: [number, number, number];
  onMissionTarget?: {
    latitude: number;
    longitude: number;
    isActive: boolean;
  };
}

const EarthModel: React.FC<EarthModelProps> = ({
  position = [0, 0, -15],
  rotation = [0, 0, 0],
  scale = [1, 1, 1],
  onMissionTarget,
}) => {
  const earthRef = useRef<Mesh>(null);
  const cloudsRef = useRef<Mesh>(null);
  const atmosphereRef = useRef<Mesh>(null);
  const textureLoader = new THREE.TextureLoader();

  // Create Earth geometry
  const earthGeometry = useMemo(() => {
    return new THREE.SphereGeometry(2, 64, 32);
  }, []);

  // Create clouds geometry (slightly larger than Earth)
  const cloudsGeometry = useMemo(() => {
    return new THREE.SphereGeometry(2.01, 64, 32);
  }, []);

  // Create atmosphere geometry
  const atmosphereGeometry = useMemo(() => {
    return new THREE.SphereGeometry(2.1, 32, 16);
  }, []);

  // Create Earth material with procedural textures
  const earthMaterial = useMemo(() => {
    return new THREE.MeshPhongMaterial({
      specular: "#FFFFFF",
      map: textureLoader.load(
        "https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/land_ocean_ice_cloud_2048.jpg?fbclid=IwY2xjawNK4MlleHRuA2FlbQIxMABicmlkETE1RmU0MkEzWXo1cURybzlzAR7oC1mgLZMZBYhPrQoDVPTv95o9J0ZZQzRTdGD7zg35tcadsgVTHa866tWfRA_aem_zeenV3e1J_wu7uGCwEMMzA"
      ),
    });
  }, []);

  // Create clouds material
  const cloudsMaterial = useMemo(() => {
    return new THREE.MeshLambertMaterial({
      color: "#FFFFFF",
      transparent: true,
      opacity: 0.3,
    });
  }, []);

  // Create atmosphere material
  const atmosphereMaterial = useMemo(() => {
    return new THREE.MeshLambertMaterial({
      color: "#87CEEB",
      transparent: true,
      opacity: 0.1,
      side: THREE.BackSide,
    });
  }, []);

  // Create mission target indicator
  const missionTargetGeometry = useMemo(() => {
    return new THREE.SphereGeometry(0.1, 16, 16);
  }, []);

  const missionTargetMaterial = useMemo(() => {
    return new THREE.MeshBasicMaterial({
      color: "#FF0000",
      transparent: true,
      opacity: onMissionTarget?.isActive ? 0.8 : 0,
    });
  }, [onMissionTarget?.isActive]);

  // Convert lat/lng to 3D position on sphere
  const getPositionFromLatLng = (
    lat: number,
    lng: number,
    radius: number = 2
  ) => {
    const phi = (90 - lat) * (Math.PI / 180);
    const theta = (lng + 180) * (Math.PI / 180);

    return {
      x: radius * Math.sin(phi) * Math.cos(theta),
      y: radius * Math.cos(phi),
      z: radius * Math.sin(phi) * Math.sin(theta),
    };
  };

  // Get mission target position
  const missionTargetPosition = useMemo(() => {
    if (!onMissionTarget) return [0, 0, 0];
    const pos = getPositionFromLatLng(
      onMissionTarget.latitude,
      onMissionTarget.longitude,
      2.1
    );
    return [pos.x, pos.y, pos.z] as [number, number, number];
  }, [onMissionTarget]);

  // Animation
  useFrame((state) => {
    const time = state.clock.getElapsedTime();

    // Rotate Earth
    if (earthRef.current) {
      // earthRef.current.rotation.y = time * 0.1;
    }

    // Rotate clouds (slightly faster)
    if (cloudsRef.current) {
      cloudsRef.current.rotation.y = time * 0.12;
    }

    // Rotate atmosphere (slowest)
    if (atmosphereRef.current) {
      atmosphereRef.current.rotation.y = time * 0.05;
    }
  });

  return (
    <group position={position} rotation={rotation} scale={scale}>
      {/* Earth */}
      <mesh ref={earthRef} geometry={earthGeometry} material={earthMaterial} />

      {/* Clouds */}
      <mesh
        ref={cloudsRef}
        geometry={cloudsGeometry}
        material={cloudsMaterial}
      />

      {/* Atmosphere */}
      <mesh
        ref={atmosphereRef}
        geometry={atmosphereGeometry}
        material={atmosphereMaterial}
      />

      {/* Mission target indicator */}
      {onMissionTarget && (
        <mesh
          position={missionTargetPosition}
          geometry={missionTargetGeometry}
          material={missionTargetMaterial}
        >
          {/* Pulsing effect */}
          <meshBasicMaterial
            color="#FF0000"
            transparent={true}
            opacity={onMissionTarget.isActive ? 0.8 : 0}
          />
        </mesh>
      )}

      {/* Add some stars in the background */}
      {Array.from({ length: 200 }).map((_, i) => {
        const radius = 50;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);
        const x = radius * Math.sin(phi) * Math.cos(theta);
        const y = radius * Math.sin(phi) * Math.sin(theta);
        const z = radius * Math.cos(phi);

        return (
          <mesh key={i} position={[x, y, z]}>
            <sphereGeometry args={[0.02, 4, 4]} />
            <meshBasicMaterial color="#FFFFFF" />
          </mesh>
        );
      })}
    </group>
  );
};

export default EarthModel;
