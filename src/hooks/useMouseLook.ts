import { useRef, useEffect, useCallback } from "react";
import * as THREE from "three";

export interface MouseLookConfig {
  rotationSpeed?: number;
  maxPitch?: number;
  minPitch?: number;
}

export interface MouseLookReturn {
  isMouseDown: boolean;
  yaw: number;
  pitch: number;
  roll: number;
}

export const useMouseLook = (config: MouseLookConfig = {}): MouseLookReturn => {
  const {
    rotationSpeed = 0.002,
    maxPitch = Math.PI / 2,
    minPitch = -Math.PI / 2,
  } = config;

  const isMouseDownRef = useRef(false);
  const previousMousePositionRef = useRef({ x: 0, y: 0 });
  const rotationRef = useRef({
    yaw: 0,
    pitch: 0,
    roll: 0,
  });

  const handleMouseDown = useCallback((event: MouseEvent) => {
    isMouseDownRef.current = true;
    previousMousePositionRef.current.x = event.clientX;
    previousMousePositionRef.current.y = event.clientY;
    document.body.style.cursor = "grabbing";
  }, []);

  const handleMouseUp = useCallback(() => {
    isMouseDownRef.current = false;
    document.body.style.cursor = "default";
  }, []);

  const handleMouseMove = useCallback((event: MouseEvent) => {
    if (!isMouseDownRef.current) return;

    const deltaX = event.clientX - previousMousePositionRef.current.x;
    const deltaY = event.clientY - previousMousePositionRef.current.y;

    const rotation = rotationRef.current;

    // Update rotation
    rotation.yaw -= deltaX * rotationSpeed;
    rotation.pitch -= deltaY * rotationSpeed;

    // Clamp pitch
    rotation.pitch = THREE.MathUtils.clamp(rotation.pitch, minPitch, maxPitch);

    previousMousePositionRef.current.x = event.clientX;
    previousMousePositionRef.current.y = event.clientY;
  }, [rotationSpeed, maxPitch, minPitch]);

  useEffect(() => {
    document.addEventListener("mousedown", handleMouseDown);
    document.addEventListener("mouseup", handleMouseUp);
    document.addEventListener("mousemove", handleMouseMove);

    return () => {
      document.removeEventListener("mousedown", handleMouseDown);
      document.removeEventListener("mouseup", handleMouseUp);
      document.removeEventListener("mousemove", handleMouseMove);
    };
  }, [handleMouseDown, handleMouseUp, handleMouseMove]);

  return {
    isMouseDown: isMouseDownRef.current,
    yaw: rotationRef.current.yaw,
    pitch: rotationRef.current.pitch,
    roll: rotationRef.current.roll,
  };
};