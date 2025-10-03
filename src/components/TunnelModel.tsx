import React, { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { Group } from "three";
import * as THREE from "three";

interface TunnelModelProps {
  position?: [number, number, number];
  rotation?: [number, number, number];
}

const TunnelModel: React.FC<TunnelModelProps> = ({
  position = [0, 0, 0],
  rotation = [0, 0, 0],
}) => {
  const tunnelRef = useRef<Group>(null);

  // Tunnel dimensions (matching PhysicsTunnel.html)
  const moduleWidth = 8;
  const moduleHeight = 7;
  const moduleDepth = 18; // Long tunnel

  // Create materials
  const createMaterial = (
    color: number,
    roughness: number,
    metalness: number,
    side: THREE.Side = THREE.BackSide,
    castShadow: boolean = true,
    receiveShadow: boolean = true
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

  // Create tunnel geometry
  const tunnelGeometry = useMemo(() => {
    const group = new THREE.Group();

    // Wall material
    const wallMaterial = createMaterial(
      0xcccccc,
      0.8,
      0.1,
      THREE.BackSide,
      false,
      true
    );

    // Equipment panel material
    const blueLockerMaterial = createMaterial(
      0x0077ff,
      0.4,
      0.5,
      THREE.FrontSide,
      true,
      true
    );

    const metalDetailMaterial = createMaterial(
      0x555555,
      0.2,
      0.9,
      THREE.FrontSide,
      true,
      true
    );

    // Floor
    const floor = new THREE.Mesh(
      new THREE.PlaneGeometry(moduleWidth, moduleDepth),
      wallMaterial
    );
    floor.rotation.x = Math.PI / 2;
    floor.position.y = -moduleHeight / 2;
    group.add(floor);

    // Ceiling
    const ceiling = new THREE.Mesh(
      new THREE.PlaneGeometry(moduleWidth, moduleDepth),
      wallMaterial
    );
    ceiling.rotation.x = Math.PI / 2;
    ceiling.position.y = moduleHeight / 2;
    group.add(ceiling);

    // Walls
    const backWallMaterial = createMaterial(
      0x888888,
      0.9,
      0.1,
      THREE.BackSide,
      false,
      true
    );
    const wallGeometry = new THREE.PlaneGeometry(moduleWidth, moduleHeight);

    // Left wall
    const wallLeft = new THREE.Mesh(wallGeometry, backWallMaterial);
    wallLeft.rotation.y = Math.PI / 2;
    wallLeft.position.x = -moduleWidth / 2;
    group.add(wallLeft);

    // Right wall
    const wallRight = new THREE.Mesh(wallGeometry, backWallMaterial);
    wallRight.rotation.y = -Math.PI / 2;
    wallRight.position.x = moduleWidth / 2;
    group.add(wallRight);

    // Front wall (entrance to sphere)
    const wallFront = new THREE.Mesh(wallGeometry, backWallMaterial);
    wallFront.position.z = moduleDepth / 2;
    group.add(wallFront);

    // Structural ribs
    const ribGeometry = new THREE.BoxGeometry(0.05, moduleHeight, 0.05);
    const ribMaterial = createMaterial(
      0x666666,
      0.1,
      0.9,
      THREE.FrontSide,
      true,
      false
    );

    for (let z = -moduleDepth / 2 + 1; z < moduleDepth / 2; z += 2) {
      // Left ribs
      const ribL = new THREE.Mesh(ribGeometry, ribMaterial);
      ribL.position.set(-moduleWidth / 2 + 0.1, 0, z);
      group.add(ribL);

      // Right ribs
      const ribR = new THREE.Mesh(ribGeometry, ribMaterial);
      ribR.position.set(moduleWidth / 2 - 0.1, 0, z);
      group.add(ribR);
    }

    // Equipment lockers
    const lockerBaseZ = -moduleDepth / 2 + 3;
    for (let i = 0; i < 4; i++) {
      const locker = new THREE.Mesh(
        new THREE.BoxGeometry(0.8, 1.2, 0.5),
        blueLockerMaterial
      );
      locker.position.set(
        -moduleWidth / 2 + 0.4,
        2.5 - i * 1.5,
        lockerBaseZ + (i % 2) * 2
      );
      locker.castShadow = true;
      group.add(locker);
    }

    return group;
  }, []);

  // Animation for subtle movement
  useFrame((state) => {
    if (tunnelRef.current) {
      // Subtle breathing animation
      const time = state.clock.getElapsedTime();
      tunnelRef.current.scale.setScalar(1 + Math.sin(time * 0.3) * 0.005);
    }
  });

  return (
    <group ref={tunnelRef} position={position} rotation={rotation}>
      <primitive object={tunnelGeometry} />
    </group>
  );
};

export default TunnelModel;