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

  // Main tunnel structure
  const tunnelGeometry = useMemo(() => {
    const group = new THREE.Group();

    // Main cylinder body - metallic white/grey
    const cylinderGeometry = new THREE.CylinderGeometry(
      radius,
      radius,
      length,
      32,
      1,
      true // open-ended
    );

    const cylinderMaterial = new THREE.MeshStandardMaterial({
      color: 0xe8e8e8, // Light metallic grey
      metalness: 0.85,
      roughness: 0.25,
      side: THREE.DoubleSide,
    });

    const cylinder = new THREE.Mesh(cylinderGeometry, cylinderMaterial);
    cylinder.rotation.x = Math.PI / 2; // Rotate to extend along Z-axis
    group.add(cylinder);

    // Add structural ring ribs along the tunnel
    const numRibs = 5;
    const ribMaterial = new THREE.MeshStandardMaterial({
      color: 0xd0d0d0,
      metalness: 0.9,
      roughness: 0.15,
    });

    for (let i = 0; i < numRibs; i++) {
      const z = -length / 2 + (i / (numRibs - 1)) * length;

      // Outer rib ring
      const ribGeometry = new THREE.TorusGeometry(radius + 0.1, 0.15, 8, 32);
      const rib = new THREE.Mesh(ribGeometry, ribMaterial);
      rib.position.z = z;
      group.add(rib);
    }

    // Add handrails/support beams along the length
    const numBeams = 4;
    const beamMaterial = new THREE.MeshStandardMaterial({
      color: 0xc0c0c0,
      metalness: 0.95,
      roughness: 0.1,
    });

    for (let i = 0; i < numBeams; i++) {
      const angle = (i / numBeams) * Math.PI * 2;
      const x = Math.cos(angle) * (radius - 0.2);
      const y = Math.sin(angle) * (radius - 0.2);

      const beamGeometry = new THREE.CylinderGeometry(0.08, 0.08, length, 8);
      const beam = new THREE.Mesh(beamGeometry, beamMaterial);
      beam.position.set(x, y, 0);
      beam.rotation.x = Math.PI / 2;
      group.add(beam);
    }

    // Cupola window at the end (using the image)
    const cupola = new THREE.Mesh(
      new THREE.CircleGeometry(radius, 32),
      new THREE.MeshBasicMaterial({
        map: cupolaTexture,
        transparent: true,
        side: THREE.DoubleSide,
      })
    );
    cupola.position.z = -length / 2;
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
