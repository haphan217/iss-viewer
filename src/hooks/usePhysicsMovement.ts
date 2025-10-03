import { useRef, useEffect, useCallback } from "react";
import * as THREE from "three";

export interface MovementState {
  forward: boolean;
  backward: boolean;
  left: boolean;
  right: boolean;
  up: boolean;
  down: boolean;
}

export interface PhysicsMovementConfig {
  movementSpeed?: number;
  dragFactor?: number;
  maxSpeed?: number;
  boundaryX?: number;
  boundaryY?: number;
  boundaryZ?: number;
  cameraRadius?: number;
}

export interface PhysicsMovementReturn {
  updateMovement: (delta: number, camera: THREE.Camera) => void;
  velocity: THREE.Vector3;
  moveState: MovementState;
  resetVelocity: () => void;
}

export const usePhysicsMovement = (
  config: PhysicsMovementConfig = {}
): PhysicsMovementReturn => {
  const {
    movementSpeed = 0.015,
    dragFactor = 0.985,
    maxSpeed = 0.3,
    boundaryX = 3.5,
    boundaryY = 3,
    boundaryZ = 8.5,
    cameraRadius = 0.5,
  } = config;

  const velocityRef = useRef(new THREE.Vector3());
  const moveStateRef = useRef<MovementState>({
    forward: false,
    backward: false,
    left: false,
    right: false,
    up: false,
    down: false,
  });

  const resetVelocity = useCallback(() => {
    velocityRef.current.set(0, 0, 0);
  }, []);

  const updateMovement = useCallback((delta: number, camera: THREE.Camera) => {
    const velocity = velocityRef.current;
    const moveState = moveStateRef.current;

    // Calculate movement direction based on camera orientation
    const direction = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion);
    const rightVector = new THREE.Vector3(1, 0, 0).applyQuaternion(camera.quaternion);

    // Calculate acceleration
    const acceleration = new THREE.Vector3();
    const accelFactor = movementSpeed * delta * 50;

    if (moveState.forward) acceleration.add(direction.clone().multiplyScalar(accelFactor));
    if (moveState.backward) acceleration.add(direction.clone().multiplyScalar(-accelFactor));
    if (moveState.right) acceleration.add(rightVector.clone().multiplyScalar(accelFactor));
    if (moveState.left) acceleration.add(rightVector.clone().multiplyScalar(-accelFactor));
    if (moveState.up) acceleration.y += accelFactor;
    if (moveState.down) acceleration.y -= accelFactor;

    // Apply physics
    velocity.add(acceleration);
    velocity.multiplyScalar(dragFactor);

    // Limit maximum speed
    if (velocity.length() > maxSpeed) {
      velocity.setLength(maxSpeed);
    }

    // Apply velocity to camera
    camera.position.add(velocity);

    // Collision detection and boundary handling
    const pos = camera.position;

    if (pos.x > boundaryX - cameraRadius || pos.x < -boundaryX + cameraRadius) {
      velocity.x *= -0.5;
      pos.x = THREE.MathUtils.clamp(pos.x, -boundaryX + cameraRadius, boundaryX - cameraRadius);
    }

    if (pos.y > boundaryY - cameraRadius || pos.y < -boundaryY + cameraRadius) {
      velocity.y *= -0.5;
      pos.y = THREE.MathUtils.clamp(pos.y, -boundaryY + cameraRadius, boundaryY - cameraRadius);
    }

    if (pos.z > boundaryZ - cameraRadius || pos.z < -boundaryZ + cameraRadius) {
      velocity.z *= -0.5;
      pos.z = THREE.MathUtils.clamp(pos.z, -boundaryZ + cameraRadius, boundaryZ - cameraRadius);
    }
  }, [movementSpeed, dragFactor, maxSpeed, boundaryX, boundaryY, boundaryZ, cameraRadius]);

  // Keyboard event handlers
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      switch (event.code) {
        case "KeyW":
          moveStateRef.current.forward = true;
          break;
        case "KeyS":
          moveStateRef.current.backward = true;
          break;
        case "KeyA":
          moveStateRef.current.left = true;
          break;
        case "KeyD":
          moveStateRef.current.right = true;
          break;
        case "KeyQ":
          moveStateRef.current.up = true;
          break;
        case "KeyE":
          moveStateRef.current.down = true;
          break;
      }
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      switch (event.code) {
        case "KeyW":
          moveStateRef.current.forward = false;
          break;
        case "KeyS":
          moveStateRef.current.backward = false;
          break;
        case "KeyA":
          moveStateRef.current.left = false;
          break;
        case "KeyD":
          moveStateRef.current.right = false;
          break;
        case "KeyQ":
          moveStateRef.current.up = false;
          break;
        case "KeyE":
          moveStateRef.current.down = false;
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  return {
    updateMovement,
    velocity: velocityRef.current,
    moveState: moveStateRef.current,
    resetVelocity,
  };
};