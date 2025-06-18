
import { useRef, useEffect, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Vector3 } from 'three';
import { useGame } from '../../contexts/GameContext';

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
  const { gameState } = useGame();
  const [cameraMode, setCameraMode] = useState<'follow'|'cinematic'|'cockpit'>('follow');

  // Initialiser les positions
  useEffect(() => {
    currentPosition.current.set(carPosition[0], carPosition[1] + 8, carPosition[2] + 15);
    currentLookAt.current.set(carPosition[0], carPosition[1], carPosition[2]);
    
    // Changer la caméra avec la touche C
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.code === 'KeyC') {
        setCameraMode(prev => {
          switch (prev) {
            case 'follow': return 'cinematic';
            case 'cinematic': return 'cockpit';
            default: return 'follow';
          }
        });
        console.log('Changement de caméra');
      }
    };
    
    window.addEventListener('keydown', handleKeyPress);
    
    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, []);

  useFrame(() => {
    // Récupérer la rotation et la vitesse
    const carRotationY = carRotation[1];
    const speed = gameState.speed;
    
    // Calculer les paramètres de caméra en fonction du mode
    if (cameraMode === 'follow') {
      // Mode suivi classique
      const offsetDistance = 15 - Math.min(speed / 80 * 5, 5); // Se rapproche à haute vitesse
      const offsetHeight = 8 - Math.min(speed / 100 * 3, 3); // S'abaisse légèrement à haute vitesse
      
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
      const lookAheadFactor = Math.min(1 + speed / 40, 3); // Regarde plus loin à haute vitesse
      const lookAheadX = carPosition[0] + Math.sin(carRotationY) * 5 * lookAheadFactor;
      const lookAheadZ = carPosition[2] + Math.cos(carRotationY) * 5 * lookAheadFactor;
      targetLookAt.current.set(lookAheadX, carPosition[1] + 0.5, lookAheadZ);
    } 
    else if (cameraMode === 'cinematic') {
      // Mode cinématique (vue de côté dynamique)
      const angle = carRotationY + Math.PI/2; // Vue de côté
      const distance = 15;
      const height = 3 + Math.sin(Date.now() * 0.0005) * 2; // Oscillation verticale lente
      
      targetPosition.current.set(
        carPosition[0] + Math.sin(angle) * distance,
        carPosition[1] + height,
        carPosition[2] + Math.cos(angle) * distance
      );
      
      // Toujours regarder la voiture
      targetLookAt.current.set(carPosition[0], carPosition[1] + 0.5, carPosition[2]);
    }
    else if (cameraMode === 'cockpit') {
      // Vue cockpit (première personne)
      const forwardX = Math.sin(carRotationY);
      const forwardZ = Math.cos(carRotationY);
      
      // Position dans l'habitacle (un peu au-dessus du centre de la voiture)
      targetPosition.current.set(
        carPosition[0],
        carPosition[1] + 1.2,
        carPosition[2]
      );
      
      // Regarder loin devant
      const lookDistance = 10 + speed / 10;
      targetLookAt.current.set(
        carPosition[0] + forwardX * lookDistance,
        carPosition[1] + 0.8, // Légèrement au-dessus de l'horizon
        carPosition[2] + forwardZ * lookDistance
      );
    }

    // Ajout d'effets de caméra
    const speedFactor = Math.min(speed / 150, 1);
    
    // Tremblement à haute vitesse
    if (speed > 60) {
      const shakeIntensity = (speed - 60) / 100 * 0.05;
      targetPosition.current.x += (Math.random() - 0.5) * shakeIntensity;
      targetPosition.current.y += (Math.random() - 0.5) * shakeIntensity;
      targetPosition.current.z += (Math.random() - 0.5) * shakeIntensity;
    }

    // Interpolation fluide - plus rapide à haute vitesse
    const lerpFactor = 0.05 + speedFactor * 0.03;
    currentPosition.current.lerp(targetPosition.current, lerpFactor);
    currentLookAt.current.lerp(targetLookAt.current, lerpFactor * 1.5);

    // Appliquer à la caméra
    camera.position.copy(currentPosition.current);
    camera.lookAt(currentLookAt.current);
  });

  return null;
};
