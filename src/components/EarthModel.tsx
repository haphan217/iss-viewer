import { useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { Mesh } from "three";
import * as THREE from "three";

interface EarthModelProps {
  enableMissionRotation?: boolean;
  earthRef: React.RefObject<Mesh | null>;
}

const EarthModel: React.FC<EarthModelProps> = ({
  enableMissionRotation = false,
  earthRef,
}) => {
  const textureLoader = new THREE.TextureLoader();

  // Create Earth geometry
  const earthGeometry = useMemo(() => {
    return new THREE.SphereGeometry(2, 64, 32);
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

  // Animation
  useFrame((_, delta) => {
    // Rotate Earth for mission simulation (90-minute orbit)
    if (earthRef.current && enableMissionRotation) {
      earthRef.current.rotation.y -= 0.2 * delta; // Simulate ISS orbit speed
    }
  });

  return (
    <group position={[0, 0, -25]} rotation={[0, 0, 0]} scale={[4, 4, 4]}>
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
