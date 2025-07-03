
import { useRef, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Vector3 } from 'three';

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

  useEffect(() => {
    console.log('CameraController: Initialisation');
    currentPosition.current.set(carPosition[0], carPosition[1] + 8, carPosition[2] + 15);
    currentLookAt.current.set(carPosition[0], carPosition[1], carPosition[2]);
  }, [carPosition]);

  useFrame(() => {
    const carRotationY = carRotation[1];
    
    // Position de la caméra derrière la voiture
    const offsetDistance = 12;
    const offsetHeight = 6;
    
    const behindX = carPosition[0] + Math.sin(carRotationY + Math.PI) * offsetDistance;
    const behindZ = carPosition[2] + Math.cos(carRotationY + Math.PI) * offsetDistance;
    
    targetPosition.current.set(
      behindX,
      carPosition[1] + offsetHeight,
      behindZ
    );

    // Point de regard légèrement devant la voiture
    const lookAheadX = carPosition[0] + Math.sin(carRotationY) * 3;
    const lookAheadZ = carPosition[2] + Math.cos(carRotationY) * 3;
    targetLookAt.current.set(lookAheadX, carPosition[1] + 1, lookAheadZ);

    // Interpolation fluide
    const lerpFactor = 0.08;
    currentPosition.current.lerp(targetPosition.current, lerpFactor);
    currentLookAt.current.lerp(targetLookAt.current, lerpFactor * 1.2);

    // Appliquer à la caméra
    camera.position.copy(currentPosition.current);
    camera.lookAt(currentLookAt.current);

    console.log('Camera position:', camera.position.x, camera.position.y, camera.position.z);
  });

  return null;
};
