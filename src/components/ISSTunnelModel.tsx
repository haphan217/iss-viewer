import React, { useRef, useMemo } from "react";
import { Group } from "three";
import * as THREE from "three";

interface ISSTunnelModelProps {
  position?: [number, number, number];
  rotation?: [number, number, number];
}

const ISSTunnelModel: React.FC<ISSTunnelModelProps> = ({
  position = [0, 0, 0],
  rotation = [0, 0, 0],
}) => {
  const tunnelRef = useRef<Group>(null);

  // Tunnel dimensions (matching PhysicsTunnel.html)
  const moduleWidth = 18;
  const moduleHeight = 7;
  const moduleDepth = 5; // Long tunnel

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

  // Main tunnel structure
  const tunnelGeometry = useMemo(() => {
    const group = new THREE.Group();

    // Floor
    const floor = new THREE.Mesh(
      new THREE.PlaneGeometry(moduleWidth, moduleDepth),
      createMaterial(0xcccccc, 0.8, 0.1, THREE.BackSide, false, true)
    );
    floor.rotation.x = Math.PI / 2;
    floor.position.y = -moduleHeight / 2;
    group.add(floor);

    // Ceiling
    const ceiling = new THREE.Mesh(
      new THREE.PlaneGeometry(moduleWidth, moduleDepth),
      createMaterial(0xcccccc, 0.8, 0.1, THREE.BackSide, false, true)
    );
    ceiling.rotation.x = Math.PI / 2;
    ceiling.position.y = moduleHeight / 2;
    group.add(ceiling);

    // Left wall
    const wallLeft = new THREE.Mesh(
      new THREE.PlaneGeometry(moduleWidth, moduleHeight),
      createMaterial(0x888888, 0.9, 0.1, THREE.BackSide, false, true)
    );
    wallLeft.rotation.y = Math.PI / 2;
    wallLeft.position.x = -moduleWidth / 2;
    group.add(wallLeft);

    // Right wall
    const wallRight = new THREE.Mesh(
      new THREE.PlaneGeometry(moduleWidth, moduleHeight),
      createMaterial(0x888888, 0.9, 0.1, THREE.BackSide, false, true)
    );
    wallRight.rotation.y = -Math.PI / 2;
    wallRight.position.x = moduleWidth / 2;
    group.add(wallRight);

    // Front wall (tunnel entrance)
    const wallFront = new THREE.Mesh(
      new THREE.PlaneGeometry(moduleWidth, moduleHeight),
      createMaterial(0x888888, 0.9, 0.1, THREE.BackSide, false, true)
    );
    wallFront.position.z = moduleDepth / 2;
    group.add(wallFront);

    // Back wall (tunnel exit - connects to sphere)
    const wallBack = new THREE.Mesh(
      new THREE.PlaneGeometry(moduleWidth, moduleHeight),
      createMaterial(0x888888, 0.9, 0.1, THREE.BackSide, false, true)
    );
    wallBack.position.z = -moduleDepth / 2;
    group.add(wallBack);

    return group;
  }, []);

  // Structural details (ribs, panels, etc.)
  const structuralDetails = useMemo(() => {
    const group = new THREE.Group();

    // Ribs (structural supports)
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

    return group;
  }, []);

  // Lighting for the tunnel
  const tunnelLights = useMemo(() => {
    const group = new THREE.Group();

    // Main LED strips
    const lightColor = 0xffffff;
    const lightIntensity = 2;

    // Front lights
    const spotLight1 = new THREE.SpotLight(lightColor, lightIntensity);
    spotLight1.position.set(-2, moduleHeight / 2 - 0.1, -4);
    spotLight1.angle = Math.PI / 3;
    spotLight1.penumbra = 0.1;
    spotLight1.decay = 1.0;
    spotLight1.distance = 15;
    spotLight1.target.position.set(0, 0, -4);
    spotLight1.castShadow = true;
    spotLight1.shadow.mapSize.width = 1024;
    spotLight1.shadow.mapSize.height = 1024;
    group.add(spotLight1);
    group.add(spotLight1.target);

    // Back lights
    const spotLight2 = new THREE.SpotLight(lightColor, lightIntensity);
    spotLight2.position.set(2, moduleHeight / 2 - 0.1, 4);
    spotLight2.angle = Math.PI / 3;
    spotLight2.penumbra = 0.1;
    spotLight2.decay = 1.0;
    spotLight2.distance = 15;
    spotLight2.target.position.set(0, 0, 4);
    spotLight2.castShadow = true;
    spotLight2.shadow.mapSize.width = 1024;
    spotLight2.shadow.mapSize.height = 1024;
    group.add(spotLight2);
    group.add(spotLight2.target);

    // Fill light
    const fillLight = new THREE.PointLight(0xffffff, 0.3, 30);
    fillLight.position.set(0, 1, 0);
    group.add(fillLight);

    return group;
  }, []);

  return (
    <group ref={tunnelRef} position={position} rotation={rotation}>
      {/* Main tunnel structure */}
      <primitive object={tunnelGeometry} />

      {/* Structural details */}
      <primitive object={structuralDetails} />

      {/* Tunnel lighting */}
      <primitive object={tunnelLights} />
    </group>
  );
};

export default ISSTunnelModel;
