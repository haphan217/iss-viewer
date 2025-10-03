import React, { useRef, useMemo } from "react";
import { Group } from "three";
import * as THREE from "three";

interface CupolaModelProps {
  position?: [number, number, number];
  rotation?: [number, number, number];
}
const radius = 4.5;

const CupolaModel: React.FC<CupolaModelProps> = ({
  position = [0, 0, 0],
  rotation = [0, 0, 0],
}) => {
  const cupolaRef = useRef<Group>(null);

  // Create the main cupola structure
  const cupolaGeometry = useMemo(() => {
    // Create a dome by using a sphere and cutting off the bottom half
    const sphereGeometry = new THREE.SphereGeometry(
      4.5,
      32,
      16,
      0,
      Math.PI * 2,
      0,
      Math.PI / 2
    );
    return sphereGeometry;
  }, []);

  // Create the frame structure for the dome
  const frameGeometry = useMemo(() => {
    const group = new THREE.Group();

    // Horizontal rings
    const ringGeometry = new THREE.TorusGeometry(radius, 0.05, 8, 16);
    const ringMesh = new THREE.Mesh(
      ringGeometry,
      new THREE.MeshStandardMaterial({
        color: "#2a2a2a",
        metalness: 0.8,
        roughness: 0.2,
      })
    );
    ringMesh.position.y = 0;
    group.add(ringMesh);

    return group;
  }, []);

  return (
    <group ref={cupolaRef} position={position} rotation={rotation}>
      {/* Frame structure */}
      <primitive object={frameGeometry} rotation={[Math.PI, 0, 0]} />

      {/* Main cupola glass dome */}
      <mesh
        geometry={cupolaGeometry}
        position={[0, 0, 0]}
        rotation={[1.5 * Math.PI, 0, 0]} // 270 degrees around Z axis
      >
        <meshPhysicalMaterial
          color="#ffffff"
          metalness={0.0}
          roughness={0.0}
          transmission={0.9}
          thickness={0.1}
          ior={1.5}
          clearcoat={1.0}
          clearcoatRoughness={0.0}
          side={THREE.DoubleSide}
          transparent={true}
          opacity={0.2}
        />
      </mesh>
    </group>
  );
};

export default CupolaModel;
