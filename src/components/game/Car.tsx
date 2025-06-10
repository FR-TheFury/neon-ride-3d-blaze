
import { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { useBox } from '@react-three/cannon';
import { Vector3, Mesh } from 'three';
import { useGame } from '../../contexts/GameContext';

export const Car = () => {
  const { updateSpeed } = useGame();
  const [ref, api] = useBox(() => ({
    mass: 1000,
    position: [0, 1, 0],
    args: [2, 0.5, 4],
  }));

  const velocity = useRef([0, 0, 0]);
  const position = useRef([0, 1, 0]);

  useEffect(() => {
    const unsubscribeVelocity = api.velocity.subscribe((v) => velocity.current = v);
    const unsubscribePosition = api.position.subscribe((p) => position.current = p);
    
    return () => {
      unsubscribeVelocity();
      unsubscribePosition();
    };
  }, [api]);

  useFrame(() => {
    const speed = Math.sqrt(
      velocity.current[0] ** 2 + velocity.current[2] ** 2
    );
    updateSpeed(Math.round(speed * 3.6)); // Convert to km/h

    // Simple car controls
    const handleKeyPress = (event: KeyboardEvent) => {
      const force = 15000;
      const torque = 5000;

      switch (event.code) {
        case 'KeyW':
        case 'ArrowUp':
          api.applyLocalForce([0, 0, -force], [0, 0, 0]);
          break;
        case 'KeyS':
        case 'ArrowDown':
          api.applyLocalForce([0, 0, force], [0, 0, 0]);
          break;
        case 'KeyA':
        case 'ArrowLeft':
          api.applyTorque([0, torque, 0]);
          break;
        case 'KeyD':
        case 'ArrowRight':
          api.applyTorque([0, -torque, 0]);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  });

  return (
    <mesh ref={ref as React.Ref<Mesh>} castShadow>
      <boxGeometry args={[2, 0.5, 4]} />
      <meshStandardMaterial 
        color="#00ffff" 
        emissive="#001122" 
        emissiveIntensity={0.2}
        roughness={0.1}
        metalness={0.8}
      />
      
      {/* Car lights */}
      <mesh position={[0.7, 0, -2]}>
        <sphereGeometry args={[0.1]} />
        <meshStandardMaterial 
          color="#ffffff" 
          emissive="#ffffff" 
          emissiveIntensity={1} 
        />
      </mesh>
      <mesh position={[-0.7, 0, -2]}>
        <sphereGeometry args={[0.1]} />
        <meshStandardMaterial 
          color="#ffffff" 
          emissive="#ffffff" 
          emissiveIntensity={1} 
        />
      </mesh>
      
      {/* Rear lights */}
      <mesh position={[0.7, 0, 2]}>
        <sphereGeometry args={[0.1]} />
        <meshStandardMaterial 
          color="#ff0000" 
          emissive="#ff0000" 
          emissiveIntensity={0.5} 
        />
      </mesh>
      <mesh position={[-0.7, 0, 2]}>
        <sphereGeometry args={[0.1]} />
        <meshStandardMaterial 
          color="#ff0000" 
          emissive="#ff0000" 
          emissiveIntensity={0.5} 
        />
      </mesh>
    </mesh>
  );
};
