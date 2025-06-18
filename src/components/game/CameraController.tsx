
import { useRef } from 'react';
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

  useFrame(() => {
    // Position de la caméra derrière et au-dessus de la voiture
    const offset = new Vector3(0, 6, 12);
    
    // Appliquer la rotation de la voiture à l'offset
    offset.applyEuler({ x: carRotation[0], y: carRotation[1], z: carRotation[2] } as any);
    
    // Position cible de la caméra
    targetPosition.current.set(
      carPosition[0] + offset.x,
      carPosition[1] + offset.y,
      carPosition[2] + offset.z
    );

    // Interpolation fluide vers la position cible
    currentPosition.current.lerp(targetPosition.current, 0.05);
    camera.position.copy(currentPosition.current);

    // Faire regarder la voiture
    camera.lookAt(carPosition[0], carPosition[1] + 1, carPosition[2]);
  });

  return null;
};
