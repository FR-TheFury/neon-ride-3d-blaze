
import { useRef, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Vector3 } from 'three';

interface CameraControllerProps {
  carPosition: [number, number, number];
  carRotation: [number, number, number];
}

export const CameraController = ({ carPosition, carRotation }: CameraControllerProps) => {
  const { camera } = useThree();
  const targetPosition = useRef(new Vector3());
  const currentPosition = useRef(new Vector3());
  const targetLookAt = useRef(new Vector3());
  const currentLookAt = useRef(new Vector3());

  // Initialiser les positions
  useEffect(() => {
    currentPosition.current.set(carPosition[0], carPosition[1] + 8, carPosition[2] + 15);
    currentLookAt.current.set(carPosition[0], carPosition[1], carPosition[2]);
  }, []);

  useFrame(() => {
    // Calculer la position de la caméra derrière la voiture
    const carRotationY = carRotation[1];
    const offsetDistance = 15;
    const offsetHeight = 8;
    
    // Position derrière la voiture basée sur sa rotation
    const behindX = carPosition[0] + Math.sin(carRotationY + Math.PI) * offsetDistance;
    const behindZ = carPosition[2] + Math.cos(carRotationY + Math.PI) * offsetDistance;
    
    // Position cible de la caméra
    targetPosition.current.set(
      behindX,
      carPosition[1] + offsetHeight,
      behindZ
    );

    // Point de visée (un peu devant la voiture)
    const lookAheadX = carPosition[0] + Math.sin(carRotationY) * 5;
    const lookAheadZ = carPosition[2] + Math.cos(carRotationY) * 5;
    targetLookAt.current.set(lookAheadX, carPosition[1] + 1, lookAheadZ);

    // Interpolation fluide
    currentPosition.current.lerp(targetPosition.current, 0.05);
    currentLookAt.current.lerp(targetLookAt.current, 0.08);

    // Appliquer à la caméra
    camera.position.copy(currentPosition.current);
    camera.lookAt(currentLookAt.current);
  });

  return null;
};
