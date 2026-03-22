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
  earthRef: React.RefObject<Mesh | null>;
  missionTarget?: MissionTarget | null;
}

const EarthModel: React.FC<EarthModelProps> = ({
  earthRef,
  missionTarget = null,
}) => {
  const textureLoader = useMemo(() => new THREE.TextureLoader(), []);
  const targetMarkerRef = useRef<THREE.Mesh | null>(null);

  const earthGeometry = useMemo(
    () => new THREE.SphereGeometry(4, 64, 32),
    []
  );

  const { earthMaterial, earthMap } = useMemo(() => {
    const earthMap = textureLoader.load(
      "/earth_texture.jpg",
      () => console.log("Earth texture loaded successfully"),
      undefined,
      (error) => console.error("Error loading Earth texture:", error)
    );
    const earthMaterial = new THREE.MeshStandardMaterial({
      map: earthMap,
      roughness: 0.9,
      metalness: 0.1,
    });
    return { earthMaterial, earthMap };
  }, [textureLoader]);

  const starsGeometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    const positions = new Float32Array(200 * 3);
    for (let i = 0; i < 200; i++) {
      const radius = 50;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = radius * Math.cos(phi);
    }
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    return geo;
  }, []);

  const starsMaterial = useMemo(
    () =>
      new THREE.PointsMaterial({
        color: 0xffffff,
        size: 0.14,
        sizeAttenuation: true,
        transparent: true,
        opacity: 0.95,
        depthWrite: false,
      }),
    []
  );

  useEffect(() => {
    return () => {
      earthGeometry.dispose();
      earthMap.dispose();
      earthMaterial.dispose();
      starsGeometry.dispose();
      starsMaterial.dispose();
    };
  }, [
    earthGeometry,
    earthMap,
    earthMaterial,
    starsGeometry,
    starsMaterial,
  ]);

  const latLonToVector3 = (lat: number, lon: number, radius: number) => {
    const phi = (90 - lat) * (Math.PI / 180);
    const theta = (lon + 180) * (Math.PI / 180);

    const x = -(radius * Math.sin(phi) * Math.cos(theta));
    const z = radius * Math.sin(phi) * Math.sin(theta);
    const y = radius * Math.cos(phi);

    return new THREE.Vector3(x, y, z);
  };

  useEffect(() => {
    const earth = earthRef.current;
    if (!earth) return;

    if (targetMarkerRef.current) {
      earth.remove(targetMarkerRef.current);
      targetMarkerRef.current.geometry.dispose();
      if (Array.isArray(targetMarkerRef.current.material)) {
        targetMarkerRef.current.material.forEach((m) => m.dispose());
      } else {
        targetMarkerRef.current.material.dispose();
      }
      targetMarkerRef.current = null;
    }

    if (missionTarget) {
      const position = latLonToVector3(
        missionTarget.lat,
        missionTarget.lon,
        4.05
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

      earth.add(marker);
      targetMarkerRef.current = marker;
    }

    return () => {
      const marker = targetMarkerRef.current;
      if (marker) {
        earth.remove(marker);
        marker.geometry.dispose();
        if (Array.isArray(marker.material)) {
          marker.material.forEach((m) => m.dispose());
        } else {
          marker.material.dispose();
        }
        targetMarkerRef.current = null;
      }
    };
  }, [missionTarget, earthRef]);

  return (
    <group position={[0, 0, -20]} rotation={[0, 0, 0]} scale={[3, 3, 3]}>
      <mesh ref={earthRef} geometry={earthGeometry} material={earthMaterial} />
      <points geometry={starsGeometry} material={starsMaterial} frustumCulled={false} />
    </group>
  );
};

export default EarthModel;
