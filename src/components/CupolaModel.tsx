import React, { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { Mesh, Group } from "three";
import * as THREE from "three";

interface CupolaModelProps {
  position?: [number, number, number];
  rotation?: [number, number, number];
}

const CupolaModel: React.FC<CupolaModelProps> = ({
  position = [0, 0, 0],
  rotation = [0, 0, 0],
}) => {
  const cupolaRef = useRef<Group>(null);
  const windowRefs = useRef<Mesh[]>([]);

  // Create the main cupola structure
  const cupolaGeometry = useMemo(() => {
    // Create a cylindrical cupola base
    const geometry = new THREE.CylinderGeometry(3, 3.2, 2, 16, 1, true);
    return geometry;
  }, []);

  // Create window geometries
  const windowGeometries = useMemo(() => {
    const geometries = [];

    // Central hexagonal window
    const centralWindow = new THREE.ConeGeometry(0.8, 0.1, 6);
    // Flatten the cone to make it a hexagon
    centralWindow.scale(1, 0.1, 1);
    geometries.push(centralWindow);

    // Six surrounding trapezoidal windows
    for (let i = 0; i < 6; i++) {
      const windowGeometry = new THREE.PlaneGeometry(0.6, 0.8);
      geometries.push(windowGeometry);
    }

    return geometries;
  }, []);

  // Create window positions
  const windowPositions = useMemo(() => {
    const positions = [];
    const radius = 2.8; // Distance from center

    // Central window position
    positions.push([0, 0, 2.9]);

    // Six surrounding windows
    for (let i = 0; i < 6; i++) {
      const angle = (i * Math.PI * 2) / 6;
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius;
      const z = 2.9;
      positions.push([x, y, z]);
    }

    return positions;
  }, []);

  // Create window rotations
  const windowRotations = useMemo(() => {
    const rotations = [];

    // Central window (no rotation)
    rotations.push([0, 0, 0]);

    // Six surrounding windows (facing outward)
    for (let i = 0; i < 6; i++) {
      const angle = (i * Math.PI * 2) / 6;
      rotations.push([0, angle, 0]);
    }

    return rotations;
  }, []);

  // Animation for subtle movement
  useFrame((state) => {
    if (cupolaRef.current) {
      // Subtle breathing animation
      const time = state.clock.getElapsedTime();
      cupolaRef.current.scale.setScalar(1 + Math.sin(time * 0.5) * 0.01);
    }
  });

  return (
    <group ref={cupolaRef} position={position} rotation={rotation}>
      {/* Main cupola structure */}
      <mesh geometry={cupolaGeometry} position={[0, 0, 0]}>
        <meshStandardMaterial
          color="#2a2a2a"
          metalness={0.8}
          roughness={0.2}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Interior structure and equipment panels */}
      {/* <mesh position={[0, 0, 1.5]}>
        <cylinderGeometry args={[2.5, 2.7, 0.1, 16]} />
        <meshStandardMaterial color="#1a1a1a" metalness={0.9} roughness={0.1} />
      </mesh> */}

      {/* Equipment panels around the interior */}
      {/* {Array.from({ length: 8 }).map((_, i) => {
        const angle = (i * Math.PI * 2) / 8;
        const x = Math.cos(angle) * 2.2;
        const y = Math.sin(angle) * 2.2;
        return (
          <mesh key={i} position={[x, y, 1.8]} rotation={[0, angle, 0]}>
            <boxGeometry args={[0.3, 0.2, 0.05]} />
            <meshStandardMaterial
              color="#333333"
              metalness={0.7}
              roughness={0.3}
            />
          </mesh>
        );
      })}

      {/* Control panel like in the image */}
      <mesh position={[-1.5, -1.5, 1.2]} rotation={[0, Math.PI / 4, 0]}>
        <boxGeometry args={[0.4, 0.3, 0.1]} />
        <meshStandardMaterial color="#FFFFFF" metalness={0.1} roughness={0.8} />
      </mesh>

      {/* Handrails and cables */}
      {/* {Array.from({ length: 6 }).map((_, i) => {
        const angle = (i * Math.PI * 2) / 6;
        const x = Math.cos(angle) * 2.4;
        const y = Math.sin(angle) * 2.4;
        return (
          <group key={i}>
            <mesh position={[x, y, 0.5]} rotation={[0, angle, 0]}>
              <cylinderGeometry args={[0.02, 0.02, 1.5, 8]} />
              <meshStandardMaterial
                color="#0066cc"
                metalness={0.8}
                roughness={0.2}
              />
            </mesh>
            <mesh position={[x, y, 1.2]} rotation={[0, angle, 0]}>
              <cylinderGeometry args={[0.01, 0.01, 0.8, 8]} />
              <meshStandardMaterial
                color="#004499"
                metalness={0.9}
                roughness={0.1}
              />
            </mesh>
          </group>
        );
      })} */}

      {/* Windows */}
      {windowGeometries.map((geometry, index) => (
        <mesh
          key={index}
          ref={(el) => {
            if (el) windowRefs.current[index] = el;
          }}
          geometry={geometry}
          position={windowPositions[index] as [number, number, number]}
          rotation={windowRotations[index] as [number, number, number]}
        >
          <meshStandardMaterial
            color="#001122"
            transparent={true}
            opacity={0.1}
            side={THREE.DoubleSide}
          />
        </mesh>
      ))}

      {/* Window frames */}
      {windowPositions.map((pos, index) => (
        <mesh
          key={`frame-${index}`}
          position={[pos[0], pos[1], pos[2] - 0.01]}
          rotation={windowRotations[index] as [number, number, number]}
        >
          {index === 0 ? (
            // Hexagonal frame for central window
            <coneGeometry args={[0.9, 0.1, 6]} />
          ) : (
            // Ring frame for surrounding windows
            <ringGeometry args={[0.5, 0.7, 32]} />
          )}
          <meshStandardMaterial
            color="#444444"
            metalness={0.9}
            roughness={0.1}
            side={THREE.DoubleSide}
          />
        </mesh>
      ))}

      {/* Bolts and fasteners */}
      {/* {Array.from({ length: 24 }).map((_, i) => {
        const angle = (i * Math.PI * 2) / 24;
        const radius = i % 2 === 0 ? 2.6 : 2.9;
        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius;
        const z = 1.5 + (i % 3) * 0.3;
        return (
          <mesh key={i} position={[x, y, z]} rotation={[0, angle, 0]}>
            <cylinderGeometry args={[0.05, 0.05, 0.1, 8]} />
            <meshStandardMaterial
              color="#666666"
              metalness={0.8}
              roughness={0.2}
            />
          </mesh>
        );
      })} */}
    </group>
  );
};

export default CupolaModel;
