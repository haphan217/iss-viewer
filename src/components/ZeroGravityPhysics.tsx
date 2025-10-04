import React, { useRef, useEffect } from "react";
import { useThree, useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface ZeroGravityPhysicsProps {
  boundaries?: {
    x: number;
    y: number;
    z: number;
  };
}

const ZeroGravityPhysics: React.FC<ZeroGravityPhysicsProps> = ({
  boundaries = { x: 4, y: 3.5, z: 9 }, // Default tunnel boundaries
}) => {
  const { camera } = useThree();

  // Physics state
  const physicsRef = useRef({
    velocity: new THREE.Vector3(),
    moveState: {
      forward: false,
      backward: false,
      left: false,
      right: false,
      up: false,
      down: false,
    },
    isMouseDown: false,
    previousMousePosition: { x: 0, y: 0 },
    yaw: 0,
    pitch: 0,
    roll: 0,
  });

  // Physics constants (matching PhysicsTunnel.html)
  const movementSpeed = 0.015;
  const dragFactor = 0.985;
  const rotationSpeed = 0.002;
  const maxSpeed = 0.3;

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const physics = physicsRef.current;

      switch (event.code) {
        case "KeyW":
          physics.moveState.forward = true;
          break;
        case "KeyS":
          physics.moveState.backward = true;
          break;
        case "KeyA":
          physics.moveState.left = true;
          break;
        case "KeyD":
          physics.moveState.right = true;
          break;
        case "KeyQ":
          physics.moveState.up = true;
          break;
        case "KeyE":
          physics.moveState.down = true;
          break;
      }
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      const physics = physicsRef.current;

      switch (event.code) {
        case "KeyW":
          physics.moveState.forward = false;
          break;
        case "KeyS":
          physics.moveState.backward = false;
          break;
        case "KeyA":
          physics.moveState.left = false;
          break;
        case "KeyD":
          physics.moveState.right = false;
          break;
        case "KeyQ":
          physics.moveState.up = false;
          break;
        case "KeyE":
          physics.moveState.down = false;
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

  // Mouse controls
  useEffect(() => {
    const handleMouseDown = (event: MouseEvent) => {
      const physics = physicsRef.current;
      physics.isMouseDown = true;
      physics.previousMousePosition.x = event.clientX;
      physics.previousMousePosition.y = event.clientY;
      document.body.style.cursor = "grabbing";
    };

    const handleMouseUp = () => {
      const physics = physicsRef.current;
      physics.isMouseDown = false;
      document.body.style.cursor = "default";
    };

    const handleMouseMove = (event: MouseEvent) => {
      const physics = physicsRef.current;

      if (!physics.isMouseDown) return;

      const deltaX = event.clientX - physics.previousMousePosition.x;
      const deltaY = event.clientY - physics.previousMousePosition.y;

      physics.yaw -= deltaX * rotationSpeed;
      physics.pitch -= deltaY * rotationSpeed;

      // Clamp pitch to prevent over-rotation
      physics.pitch = THREE.MathUtils.clamp(
        physics.pitch,
        -Math.PI / 2,
        Math.PI / 2
      );

      physics.previousMousePosition.x = event.clientX;
      physics.previousMousePosition.y = event.clientY;
    };

    const handleContextMenu = (event: Event) => {
      event.preventDefault();
    };

    window.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mouseup", handleMouseUp);
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("contextmenu", handleContextMenu);

    return () => {
      window.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("contextmenu", handleContextMenu);
    };
  }, []);

  // Physics update
  useFrame((_, delta) => {
    const physics = physicsRef.current;

    // Calculate movement direction based on camera rotation
    const direction = new THREE.Vector3(0, 0, -1).applyQuaternion(
      camera.quaternion
    );
    const rightVector = new THREE.Vector3(1, 0, 0).applyQuaternion(
      camera.quaternion
    );

    // Calculate acceleration
    const acceleration = new THREE.Vector3();
    const accelFactor = movementSpeed * delta * 50;

    if (physics.moveState.forward) {
      acceleration.add(direction.clone().multiplyScalar(accelFactor));
    }
    if (physics.moveState.backward) {
      acceleration.add(direction.clone().multiplyScalar(-accelFactor));
    }
    if (physics.moveState.right) {
      acceleration.add(rightVector.clone().multiplyScalar(accelFactor));
    }
    if (physics.moveState.left) {
      acceleration.add(rightVector.clone().multiplyScalar(-accelFactor));
    }
    if (physics.moveState.up) {
      acceleration.y += accelFactor;
    }
    if (physics.moveState.down) {
      acceleration.y -= accelFactor;
    }

    // Apply acceleration to velocity
    physics.velocity.add(acceleration);

    // Apply drag (zero-gravity simulation) - this creates the floating feeling
    physics.velocity.multiplyScalar(dragFactor);

    // Limit maximum speed
    if (physics.velocity.length() > maxSpeed) {
      physics.velocity.setLength(maxSpeed);
    }

    // Update camera position - this creates continuous movement even when keys are released
    camera.position.add(physics.velocity);

    // Boundary collision detection and bouncing
    if (camera.position.x > boundaries.x || camera.position.x < -boundaries.x) {
      physics.velocity.x *= -0.5; // Bounce with energy loss
      camera.position.x = THREE.MathUtils.clamp(
        camera.position.x,
        -boundaries.x,
        boundaries.x
      );
    }
    if (camera.position.y > boundaries.y || camera.position.y < -boundaries.y) {
      physics.velocity.y *= -0.5;
      camera.position.y = THREE.MathUtils.clamp(
        camera.position.y,
        -boundaries.y,
        boundaries.y
      );
    }
    if (
      camera.position.z > boundaries.z ||
      camera.position.z - 3 < -boundaries.z
    ) {
      physics.velocity.z *= -0.5;
      camera.position.z = THREE.MathUtils.clamp(
        camera.position.z,
        -boundaries.z,
        boundaries.z
      );
    }

    // Apply head rotation from mouse input
    camera.rotation.set(physics.pitch, physics.yaw, physics.roll, "YXZ");
  });

  return null;
};

export default ZeroGravityPhysics;
