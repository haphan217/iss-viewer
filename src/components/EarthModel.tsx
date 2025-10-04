import { useMemo, useEffect, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Mesh } from "three";
import * as THREE from "three";

export interface MissionTarget {
  lat: number;
  lon: number;
  title: string;
}

interface EarthModelProps {
  enableMissionRotation?: boolean;
  earthRef: React.RefObject<Mesh | null>;
  missionTarget?: MissionTarget | null;
  rotationSpeed?: number;
}

const EarthModel: React.FC<EarthModelProps> = ({
  enableMissionRotation = false,
  earthRef,
  missionTarget = null,
  rotationSpeed = 0.2,
}) => {
  const textureLoader = new THREE.TextureLoader();
  const targetMarkerRef = useRef<THREE.Mesh | null>(null);

  // Create Earth geometry
  const earthGeometry = useMemo(() => {
    return new THREE.SphereGeometry(4, 64, 32);
  }, []);

  // Create Earth material with texture (matching ExploreMode)
  const earthMaterial = useMemo(() => {
    const earthTexture = textureLoader.load(
      "/earth_texture.jpg",
      () => console.log("Earth texture loaded successfully"),
      undefined,
      (error) => console.error("Error loading Earth texture:", error)
    );

    return new THREE.MeshStandardMaterial({
      map: earthTexture,
      roughness: 0.9,
      metalness: 0.1,
    });
  }, []);

  // Convert lat/lon to 3D position on sphere
  const latLonToVector3 = (lat: number, lon: number, radius: number = 2) => {
    const phi = (90 - lat) * (Math.PI / 180);
    const theta = (lon + 180) * (Math.PI / 180);

    const x = -(radius * Math.sin(phi) * Math.cos(theta));
    const z = radius * Math.sin(phi) * Math.sin(theta);
    const y = radius * Math.cos(phi);

    return new THREE.Vector3(x, y, z);
  };

  // Create or update target marker
  useEffect(() => {
    if (!earthRef.current) return;

    // Remove old marker
    if (targetMarkerRef.current) {
      earthRef.current.remove(targetMarkerRef.current);
      targetMarkerRef.current.geometry.dispose();
      if (Array.isArray(targetMarkerRef.current.material)) {
        targetMarkerRef.current.material.forEach((m) => m.dispose());
      } else {
        targetMarkerRef.current.material.dispose();
      }
      targetMarkerRef.current = null;
    }

    // Create new marker if mission target exists
    if (missionTarget) {
      const position = latLonToVector3(
        missionTarget.lat,
        missionTarget.lon,
        2.05
      );

      const markerGeometry = new THREE.SphereGeometry(0.08, 16, 16);
      const markerMaterial = new THREE.MeshBasicMaterial({
        color: 0xff0000,
        transparent: true,
        opacity: 0.8,
      });
      const marker = new THREE.Mesh(markerGeometry, markerMaterial);
      marker.position.copy(position);
      marker.userData.isMissionTarget = true;

      earthRef.current.add(marker);
      targetMarkerRef.current = marker;
    }
  }, [missionTarget, earthRef]);

  // Animation
  useFrame((_, delta) => {
    // Rotate Earth for mission simulation (90-minute orbit)
    if (earthRef.current && enableMissionRotation) {
      earthRef.current.rotation.y -= rotationSpeed * delta;
    }

    // Animate target marker (pulsing effect)
    if (targetMarkerRef.current && targetMarkerRef.current.material) {
      const material = targetMarkerRef.current
        .material as THREE.MeshBasicMaterial;
      material.opacity = 0.3 + 0.5 * Math.sin(Date.now() * 0.005);
    }
  });

  return (
    <group position={[0, 0, -15]} rotation={[0, 0, 0]} scale={[3, 3, 3]}>
      {/* Earth */}
      <mesh ref={earthRef} geometry={earthGeometry} material={earthMaterial} />

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
