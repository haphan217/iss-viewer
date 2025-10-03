import React, { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface UnifiedISSModelProps {
  position: [number, number, number];
  tunnelLength?: number;
  sphereRadius?: number;
}

const UnifiedISSModel: React.FC<UnifiedISSModelProps> = ({
  position,
  tunnelLength = 18,
  sphereRadius = 2,
}) => {
  const tunnelRef = useRef<THREE.Group>(null);
  const sphereRef = useRef<THREE.Group>(null);

  // Subtle floating animation
  useFrame((state) => {
    if (tunnelRef.current) {
      tunnelRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.02;
    }
    if (sphereRef.current) {
      sphereRef.current.position.y = Math.cos(state.clock.elapsedTime * 0.3) * 0.015;
    }
  });

  const createMaterial = (
    color: number,
    roughness: number,
    metalness: number,
    side = THREE.BackSide,
    castShadow = true,
    receiveShadow = true
  ) => {
    return new THREE.MeshStandardMaterial({
      color,
      metalness,
      roughness,
      side,
      castShadow,
      receiveShadow,
    });
  };

  // Tunnel dimensions
  const moduleWidth = 8;
  const moduleHeight = 7;
  const moduleDepth = tunnelLength;


  return (
    <group position={position}>
      {/* Tunnel Structure */}
      <group ref={tunnelRef}>
        {/* Tunnel Materials */}
        const wallMaterial = createMaterial(
          0xcccccc,
          0.8,
          0.1,
          THREE.BackSide,
          false,
          true
        );

        const backWallMaterial = createMaterial(
          0x888888,
          0.9,
          0.1,
          THREE.BackSide,
          false,
          true
        );

        {/* Tunnel Geometry */}
        {/* Floor */}
        <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, -moduleHeight / 2, 0]}>
          <planeGeometry args={[moduleWidth, moduleDepth]} />
          <primitive object={wallMaterial} />
        </mesh>

        {/* Ceiling */}
        <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, moduleHeight / 2, 0]}>
          <planeGeometry args={[moduleWidth, moduleDepth]} />
          <primitive object={wallMaterial} />
        </mesh>

        {/* Walls */}
        <mesh rotation={[0, Math.PI / 2, 0]} position={[-moduleWidth / 2, 0, 0]}>
          <planeGeometry args={[moduleWidth, moduleHeight]} />
          <primitive object={backWallMaterial} />
        </mesh>

        <mesh rotation={[0, -Math.PI / 2, 0]} position={[moduleWidth / 2, 0, 0]}>
          <planeGeometry args={[moduleWidth, moduleHeight]} />
          <primitive object={backWallMaterial} />
        </mesh>

        {/* End walls */}
        <mesh position={[0, 0, moduleDepth / 2]}>
          <planeGeometry args={[moduleWidth, moduleHeight]} />
          <primitive object={backWallMaterial} />
        </mesh>

        <mesh position={[0, 0, -moduleDepth / 2]}>
          <planeGeometry args={[moduleWidth, moduleHeight]} />
          <primitive object={backWallMaterial} />
        </mesh>

        {/* Structural Ribs */}
        <group>
          {Array.from({ length: Math.floor(moduleDepth / 2) }, (_, i) => {
            const z = -moduleDepth / 2 + 1 + i * 2;
            return (
              <group key={i}>
                {/* Left rib */}
                <mesh position={[-moduleWidth / 2 + 0.1, 0, z]}>
                  <boxGeometry args={[0.05, moduleHeight, 0.05]} />
                  <primitive
                    object={createMaterial(
                      0x666666,
                      0.1,
                      0.9,
                      THREE.FrontSide,
                      true,
                      false
                    )}
                  />
                </mesh>

                {/* Right rib */}
                <mesh position={[moduleWidth / 2 - 0.1, 0, z]}>
                  <boxGeometry args={[0.05, moduleHeight, 0.05]} />
                  <primitive
                    object={createMaterial(
                      0x666666,
                      0.1,
                      0.9,
                      THREE.FrontSide,
                      true,
                      false
                    )}
                  />
                </mesh>
              </group>
            );
          })}
        </group>

        {/* Equipment Lockers */}
        <group>
          {Array.from({ length: 4 }, (_, i) => {
            const lockerBaseZ = -moduleDepth / 2 + 3;
            return (
              <mesh
                key={i}
                position={[
                  -moduleWidth / 2 + 0.4,
                  2.5 - i * 1.5,
                  lockerBaseZ + (i % 2) * 2,
                ]}
              >
                <boxGeometry args={[0.8, 1.2, 0.5]} />
                <primitive
                  object={createMaterial(
                    0x0077ff,
                    0.4,
                    0.5,
                    THREE.FrontSide,
                    true,
                    true
                  )}
                />
              </mesh>
            );
          })}
        </group>
      </group>

      {/* Spherical Cupola */}
      <group ref={sphereRef} position={[0, 0, -moduleDepth / 2 - sphereRadius]}>
        {/* Main sphere structure */}
        <mesh>
          <sphereGeometry args={[sphereRadius, 32, 32]} />
          <primitive
            object={createMaterial(
              0xdddddd,
              0.7,
              0.2,
              THREE.BackSide,
              false,
              true
            )}
          />
        </mesh>

        {/* Cupola windows (darker transparent areas) */}
        {Array.from({ length: 7 }, (_, i) => {
          const angle = (i / 7) * Math.PI * 2;
          const windowRadius = sphereRadius - 0.1;
          return (
            <mesh key={i} position={[Math.cos(angle) * windowRadius, Math.sin(angle) * windowRadius, 0]}>
              <circleGeometry args={[0.8, 16]} />
              <primitive
                object={createMaterial(
                  0x001122,
                  0.1,
                  0.8,
                  THREE.FrontSide,
                  false,
                  true
                )}
              />
            </mesh>
          );
        })}
      </group>
    </group>
  );
};

export default UnifiedISSModel;