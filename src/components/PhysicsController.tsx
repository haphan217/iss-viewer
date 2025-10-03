import React, { useRef, useEffect } from "react";
import { useThree, useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface PhysicsControllerProps {
  onPositionUpdate?: (position: [number, number, number]) => void;
}

const PhysicsController: React.FC<PhysicsControllerProps> = ({
  onPositionUpdate,
}) => {
  const { camera } = useThree();
  const controlsRef = useRef({
    // Physics state
    velocity: new THREE.Vector3(),
    moveState: {
      forward: false,
      backward: false,
      left: false,
      right: false,
      up: false,
      down: false,
    },
    
    // Mouse controls
    isMouseDown: false,
    previousMousePosition: { x: 0, y: 0 },
    
    // Physics constants (from PhysicsTunnel.html)
    movementSpeed: 0.015,
    dragFactor: 0.985,
    maxSpeed: 0.3,
    
    // Boundary constraints
    boundaryX: 4, // Half of module width (8/2)
    boundaryY: 3.5, // Half of module height (7/2)
    boundaryZ: 9, // Half of tunnel depth (18/2)
    
    // Mode flag
    isFirstPerson: true,
  });

  // Keyboard controls for first-person movement (WASD+QE)
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const controls = controlsRef.current;
      
      switch (event.code) {
        case "KeyW":
          controls.moveState.forward = true;
          break;
        case "KeyS":
          controls.moveState.backward = true;
          break;
        case "KeyA":
          controls.moveState.left = true;
          break;
        case "KeyD":
          controls.moveState.right = true;
          break;
        case "KeyQ":
          controls.moveState.up = true;
          break;
        case "KeyE":
          controls.moveState.down = true;
          break;
      }
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      const controls = controlsRef.current;
      
      switch (event.code) {
        case "KeyW":
          controls.moveState.forward = false;
          break;
        case "KeyS":
          controls.moveState.backward = false;
          break;
        case "KeyA":
          controls.moveState.left = false;
          break;
        case "KeyD":
          controls.moveState.right = false;
          break;
        case "KeyQ":
          controls.moveState.up = false;
          break;
        case "KeyE":
          controls.moveState.down = false;
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

  // Mouse controls for head rotation
  useEffect(() => {
    const handleMouseDown = (event: MouseEvent) => {
      const controls = controlsRef.current;
      controls.isMouseDown = true;
      controls.previousMousePosition.x = event.clientX;
      controls.previousMousePosition.y = event.clientY;
      document.body.style.cursor = "grabbing";
    };

    const handleMouseUp = (event: MouseEvent) => {
      const controls = controlsRef.current;
      controls.isMouseDown = false;
      document.body.style.cursor = "default";
    };

    const handleMouseMove = (event: MouseEvent) => {
      const controls = controlsRef.current;
      if (!controls.isMouseDown) return;

      const deltaX = event.clientX - controls.previousMousePosition.x;
      const deltaY = event.clientY - controls.previousMousePosition.y;
      const rotationSpeed = 0.002;

      camera.rotation.y -= deltaX * rotationSpeed;
      camera.rotation.x -= deltaY * rotationSpeed;

      // Clamp pitch to prevent over-rotation
      camera.rotation.x = THREE.MathUtils.clamp(
        camera.rotation.x,
        -Math.PI / 2,
        Math.PI / 2
      );

      controls.previousMousePosition.x = event.clientX;
      controls.previousMousePosition.y = event.clientY;
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
  }, [camera]);

  // Physics update loop
  useFrame((state, delta) => {
    const controls = controlsRef.current;
    
    // Calculate movement direction based on camera orientation
    const direction = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion);
    const rightVector = new THREE.Vector3(1, 0, 0).applyQuaternion(camera.quaternion);
    
    // Calculate acceleration
    let acceleration = new THREE.Vector3();
    const accelFactor = controls.movementSpeed * delta * 50;
    
    if (controls.moveState.forward) {
      acceleration.add(direction.clone().multiplyScalar(accelFactor));
    }
    if (controls.moveState.backward) {
      acceleration.add(direction.clone().multiplyScalar(-accelFactor));
    }
    if (controls.moveState.right) {
      acceleration.add(rightVector.clone().multiplyScalar(accelFactor));
    }
    if (controls.moveState.left) {
      acceleration.add(rightVector.clone().multiplyScalar(-accelFactor));
    }
    if (controls.moveState.up) {
      acceleration.y += accelFactor;
    }
    if (controls.moveState.down) {
      acceleration.y -= accelFactor;
    }
    
    // Apply acceleration to velocity
    controls.velocity.add(acceleration);
    
    // Apply drag (zero-gravity simulation)
    controls.velocity.multiplyScalar(controls.dragFactor);
    
    // Limit maximum speed
    if (controls.velocity.length() > controls.maxSpeed) {
      controls.velocity.setLength(controls.maxSpeed);
    }
    
    // Update camera position
    camera.position.add(controls.velocity);
    
    // Boundary collision detection and bouncing
    const pos = camera.position;
    
    // X-axis boundaries
    if (pos.x > controls.boundaryX || pos.x < -controls.boundaryX) {
      controls.velocity.x *= -0.5; // Bounce with energy loss
      camera.position.x = THREE.MathUtils.clamp(
        camera.position.x,
        -controls.boundaryX,
        controls.boundaryX
      );
    }
    
    // Y-axis boundaries
    if (pos.y > controls.boundaryY || pos.y < -controls.boundaryY) {
      controls.velocity.y *= -0.5; // Bounce with energy loss
      camera.position.y = THREE.MathUtils.clamp(
        camera.position.y,
        -controls.boundaryY,
        controls.boundaryY
      );
    }
    
    // Z-axis boundaries (tunnel length)
    if (pos.z > controls.boundaryZ || pos.z < -controls.boundaryZ) {
      controls.velocity.z *= -0.5; // Bounce with energy loss
      camera.position.z = THREE.MathUtils.clamp(
        camera.position.z,
        -controls.boundaryZ,
        controls.boundaryZ
      );
    }
    
    // Update position callback
    if (onPositionUpdate) {
      onPositionUpdate([camera.position.x, camera.position.y, camera.position.z]);
    }
  });

  return null;
};

export default PhysicsController;