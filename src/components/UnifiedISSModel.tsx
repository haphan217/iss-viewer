import React, { useRef } from "react";
import { Group } from "three";
import TunnelModel from "./TunnelModel";
import CupolaModel from "./CupolaModel";

interface UnifiedISSModelProps {
  position?: [number, number, number];
  rotation?: [number, number, number];
}

const UnifiedISSModel: React.FC<UnifiedISSModelProps> = ({
  position = [0, 0, 0],
  rotation = [0, 0, 0],
}) => {
  const issRef = useRef<Group>(null);

  return (
    <group ref={issRef} position={position} rotation={rotation}>
      {/* Tunnel section - positioned so it connects to the sphere */}
      <TunnelModel position={[0, 0, -9]} rotation={[0, 0, 0]} />
      
      {/* Cupola/Sphere section - positioned at the end of the tunnel */}
      <CupolaModel position={[0, 0, 0]} rotation={[0, 0, 0]} />
    </group>
  );
};

export default UnifiedISSModel;