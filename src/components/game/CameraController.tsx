
import { useRef, useEffect, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Vector3 } from 'three';
import { useGame } from '../../contexts/GameContext';

interface CameraControllerProps {
  carPosition: [number, number, number];
  carRotation?: [number, number, number];
}

const CameraController = ({ carPosition, carRotation = [0, 0, 0] }: CameraControllerProps) => {
  const { camera } = useThree();
  const targetPosition = useRef(new Vector3());
  const currentPosition = useRef(new Vector3());
  const targetLookAt = useRef(new Vector3());
  const currentLookAt = useRef(new Vector3());
  const { gameState } = useGame();
  const [cameraMode, setCameraMode] = useState<'follow'|'cinematic'|'cockpit'|'free'>('follow');
  const [freeMode, setFreeMode] = useState({
    offset: new Vector3(0, 8, 15),
    lookAt: new Vector3(0, 0, 0)
  });

  // Initialiser les positions
  useEffect(() => {
    currentPosition.current.set(carPosition[0], carPosition[1] + 8, carPosition[2] + 15);
    currentLookAt.current.set(carPosition[0], carPosition[1], carPosition[2]);
    
    // Gestion des touches pour la caméra
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.code === 'KeyC') {
        setCameraMode(prev => {
          switch (prev) {
            case 'follow': return 'cinematic';
            case 'cinematic': return 'cockpit';
            case 'cockpit': return 'free';
            default: return 'follow';
          }
        });
        console.log('Changement de caméra:', cameraMode);
      }
      
      // Contrôles de caméra libre avec les flèches
      if (cameraMode === 'free') {
        const moveSpeed = 0.5;
        
        switch (event.code) {
          case 'ArrowUp':
            setFreeMode(prev => ({
              ...prev,
              offset: new Vector3(prev.offset.x, prev.offset.y, prev.offset.z - moveSpeed)
            }));
            break;
          case 'ArrowDown':
            setFreeMode(prev => ({
              ...prev,
              offset: new Vector3(prev.offset.x, prev.offset.y, prev.offset.z + moveSpeed)
            }));
            break;
          case 'ArrowLeft':
            setFreeMode(prev => ({
              ...prev,
              offset: new Vector3(prev.offset.x - moveSpeed, prev.offset.y, prev.offset.z)
            }));
            break;
          case 'ArrowRight':
            setFreeMode(prev => ({
              ...prev,
              offset: new Vector3(prev.offset.x + moveSpeed, prev.offset.y, prev.offset.z)
            }));
            break;
          case 'PageUp':
            setFreeMode(prev => ({
              ...prev,
              offset: new Vector3(prev.offset.x, prev.offset.y + moveSpeed, prev.offset.z)
            }));
            break;
          case 'PageDown':
            setFreeMode(prev => ({
              ...prev,
              offset: new Vector3(prev.offset.x, prev.offset.y - moveSpeed, prev.offset.z)
            }));
            break;
        }
      }
    };
    
    window.addEventListener('keydown', handleKeyPress);
    
    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [cameraMode, carPosition]);

  useFrame(() => {
    // Récupérer la rotation et la vitesse
    const carRotationY = carRotation[1];
    const speed = gameState.speed;
    
    // Calculer les paramètres de caméra en fonction du mode
    if (cameraMode === 'follow') {
      // Mode suivi classique
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
    } 
    else if (cameraMode === 'cinematic') {
      // Mode cinématique
      const angle = carRotationY + Math.PI/2;
      const distance = 15;
      const height = 3 + Math.sin(Date.now() * 0.0005) * 2;
      
      targetPosition.current.set(
        carPosition[0] + Math.sin(angle) * distance,
        carPosition[1] + height,
        carPosition[2] + Math.cos(angle) * distance
      );
      
      targetLookAt.current.set(carPosition[0], carPosition[1] + 0.5, carPosition[2]);
    }
    else if (cameraMode === 'cockpit') {
      // Vue cockpit
      const forwardX = Math.sin(carRotationY);
      const forwardZ = Math.cos(carRotationY);
      
      targetPosition.current.set(
        carPosition[0],
        carPosition[1] + 1.2,
        carPosition[2]
      );
      
      const lookDistance = 10 + speed / 10;
      targetLookAt.current.set(
        carPosition[0] + forwardX * lookDistance,
        carPosition[1] + 0.8,
        carPosition[2] + forwardZ * lookDistance
      );
    }
    else if (cameraMode === 'free') {
      // Mode caméra libre
      targetPosition.current.set(
        carPosition[0] + freeMode.offset.x,
        carPosition[1] + freeMode.offset.y,
        carPosition[2] + freeMode.offset.z
      );
      
      targetLookAt.current.set(
        carPosition[0] + freeMode.lookAt.x,
        carPosition[1] + freeMode.lookAt.y,
        carPosition[2] + freeMode.lookAt.z
      );
    }

    // Effets de caméra
    const speedFactor = Math.min(speed / 150, 1);
    
    if (speed > 60 && cameraMode !== 'free') {
      const shakeIntensity = (speed - 60) / 100 * 0.05;
      targetPosition.current.x += (Math.random() - 0.5) * shakeIntensity;
      targetPosition.current.y += (Math.random() - 0.5) * shakeIntensity;
      targetPosition.current.z += (Math.random() - 0.5) * shakeIntensity;
    }

    // Interpolation fluide
    const lerpFactor = cameraMode === 'free' ? 0.1 : 0.05 + speedFactor * 0.03;
    currentPosition.current.lerp(targetPosition.current, lerpFactor);
    currentLookAt.current.lerp(targetLookAt.current, lerpFactor * 1.5);

    // Appliquer à la caméra
    camera.position.copy(currentPosition.current);
    camera.lookAt(currentLookAt.current);
  });

  return null;
};

export { CameraController };
