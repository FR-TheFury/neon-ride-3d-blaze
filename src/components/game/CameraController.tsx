
import { useRef, useEffect, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Vector3 } from 'three';
import { useGame } from '../../contexts/GameContext';

interface CameraControllerProps {
  carPosition: [number, number, number];
  carRotation?: [number, number, number];
}

export const CameraController = ({ carPosition, carRotation = [0, 0, 0] }: CameraControllerProps) => {
  const { camera } = useThree();
  const targetPosition = useRef(new Vector3());
  const currentPosition = useRef(new Vector3());
  const targetLookAt = useRef(new Vector3());
  const currentLookAt = useRef(new Vector3());
  const { gameState } = useGame();

  useEffect(() => {
    currentPosition.current.set(carPosition[0], carPosition[1] + 8, carPosition[2] + 15);
    currentLookAt.current.set(carPosition[0], carPosition[1], carPosition[2]);
  }, [carPosition]);

  useFrame(() => {
    const carRotationY = carRotation[1];
    const speed = gameState.speed;
    
    // Mode suivi simplifié et efficace
    const offsetDistance = 15 - Math.min(speed / 80 * 5, 5);
    const offsetHeight = 8 - Math.min(speed / 100 * 3, 3);
    
    const behindX = carPosition[0] + Math.sin(carRotationY + Math.PI) * offsetDistance;
    const behindZ = carPosition[2] + Math.cos(carRotationY + Math.PI) * offsetDistance;
    
    targetPosition.current.set(
      behindX,
      carPosition[1] + offsetHeight,
      behindZ
    );

    const lookAheadFactor = Math.min(1 + speed / 40, 3);
    const lookAheadX = carPosition[0] + Math.sin(carRotationY) * 5 * lookAheadFactor;
    const lookAheadZ = carPosition[2] + Math.cos(carRotationY) * 5 * lookAheadFactor;
    targetLookAt.current.set(lookAheadX, carPosition[1] + 0.5, lookAheadZ);

    // Effet de tremblement à haute vitesse
    const speedFactor = Math.min(speed / 150, 1);
    if (speed > 60) {
      const shakeIntensity = (speed - 60) / 100 * 0.05;
      targetPosition.current.x += (Math.random() - 0.5) * shakeIntensity;
      targetPosition.current.y += (Math.random() - 0.5) * shakeIntensity;
      targetPosition.current.z += (Math.random() - 0.5) * shakeIntensity;
    }

    // Interpolation fluide
    const lerpFactor = 0.05 + speedFactor * 0.03;
    currentPosition.current.lerp(targetPosition.current, lerpFactor);
    currentLookAt.current.lerp(targetLookAt.current, lerpFactor * 1.5);

    // Appliquer à la caméra
    camera.position.copy(currentPosition.current);
    camera.lookAt(currentLookAt.current);
  });

  return null;
};
