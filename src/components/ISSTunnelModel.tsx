import React, { useRef, useMemo } from "react";
import { Group, TextureLoader } from "three";
import * as THREE from "three";
import cupolaImage from "../assets/cupola2.png";

interface ISSTunnelModelProps {
  position?: [number, number, number];
  rotation?: [number, number, number];
}

const ISSTunnelModel: React.FC<ISSTunnelModelProps> = ({
  position = [0, 0, 0],
  rotation = [0, 0, 0],
}) => {
  const tunnelRef = useRef<Group>(null);

  // Tunnel dimensions
  const radius = 3.5;
  const length = 7;

  // Load cupola texture
  const cupolaTexture = useMemo(() => new TextureLoader().load(cupolaImage), []);

  // Main tunnel structure - transparent cylinder
  const tunnelGeometry = useMemo(() => {
    const group = new THREE.Group();

    // Transparent cylinder (without top and bottom lids)
    const cylinderGeometry = new THREE.CylinderGeometry(
      radius,
      radius,
      length,
      32,
      1,
      true // open-ended
    );

    const cylinderMaterial = new THREE.MeshStandardMaterial({
      color: 0x1a1a2e, // Dark blue-grey
      metalness: 0.8,
      roughness: 0.3,
      transparent: true,
      opacity: 0.7,
      side: THREE.DoubleSide,
      emissive: 0x0f3460, // Subtle blue glow
      emissiveIntensity: 0.2,
    });

    const cylinder = new THREE.Mesh(cylinderGeometry, cylinderMaterial);
    // No rotation needed - cylinder extends along Y-axis by default, we want it along Z-axis
    cylinder.rotation.x = Math.PI / 2; // Rotate to extend along Z-axis (towards earth)
    group.add(cylinder);

    // Flat cupola window at the end (circular plane)
    const cupola = new THREE.Mesh(
      new THREE.CircleGeometry(radius, 32),
      new THREE.MeshBasicMaterial({
        map: cupolaTexture,
        transparent: true,
        side: THREE.DoubleSide,
      })
    );
    cupola.position.z = -length / 2; // Position at the end of cylinder (towards earth)
    group.add(cupola);

    return group;
  }, [cupolaTexture]);


  // Lighting for the tunnel
  const tunnelLights = useMemo(() => {
    const group = new THREE.Group();

    // Ring lights around the cylinder
    const numRingLights = 4;
    for (let i = 0; i < numRingLights; i++) {
      const z = -length / 2 + (i / (numRingLights - 1)) * length;

      // Add point lights in a ring pattern
      const numLights = 6;
      for (let j = 0; j < numLights; j++) {
        const angle = (j / numLights) * Math.PI * 2;
        const x = Math.cos(angle) * (radius - 0.3);
        const y = Math.sin(angle) * (radius - 0.3);

        const pointLight = new THREE.PointLight(0x4a90e2, 0.5, 5);
        pointLight.position.set(x, y, z);
        group.add(pointLight);
      }
    }

    // Main directional light
    const mainLight = new THREE.PointLight(0xffffff, 1.0, 30);
    mainLight.position.set(0, 0, 0);
    group.add(mainLight);

    return group;
  }, []);

  return (
    <group ref={tunnelRef} position={position} rotation={rotation}>
      {/* Transparent cylinder with cupola window */}
      <primitive object={tunnelGeometry} />

      {/* Tunnel lighting */}
      <primitive object={tunnelLights} />
    </group>
  );
};

export default ISSTunnelModel;
