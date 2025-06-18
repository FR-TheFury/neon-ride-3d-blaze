
import { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { useBox } from '@react-three/cannon';
import { Vector3, Mesh, Group } from 'three';
import { useGame } from '../../contexts/GameContext';

export const AdvancedCar = () => {
  const { updateSpeed } = useGame();
  const carGroupRef = useRef<Group>(null);
  const [ref, api] = useBox(() => ({
    mass: 1500,
    position: [0, 2, 0],
    args: [2.2, 0.8, 4.5],
    material: {
      friction: 0.7,
      restitution: 0.3,
    },
  }));

  const velocity = useRef([0, 0, 0]);
  const position = useRef([0, 2, 0]);
  const keys = useRef({ z: false, s: false, q: false, d: false, shift: false });

  useEffect(() => {
    const unsubscribeVelocity = api.velocity.subscribe((v) => velocity.current = v);
    const unsubscribePosition = api.position.subscribe((p) => position.current = p);
    
    const handleKeyDown = (event: KeyboardEvent) => {
      switch (event.code) {
        case 'KeyZ':
          keys.current.z = true;
          break;
        case 'KeyS':
          keys.current.s = true;
          break;
        case 'KeyQ':
          keys.current.q = true;
          break;
        case 'KeyD':
          keys.current.d = true;
          break;
        case 'ShiftLeft':
        case 'ShiftRight':
          keys.current.shift = true;
          break;
      }
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      switch (event.code) {
        case 'KeyZ':
          keys.current.z = false;
          break;
        case 'KeyS':
          keys.current.s = false;
          break;
        case 'KeyQ':
          keys.current.q = false;
          break;
        case 'KeyD':
          keys.current.d = false;
          break;
        case 'ShiftLeft':
        case 'ShiftRight':
          keys.current.shift = false;
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    
    return () => {
      unsubscribeVelocity();
      unsubscribePosition();
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [api]);

  useFrame(() => {
    const speed = Math.sqrt(velocity.current[0] ** 2 + velocity.current[2] ** 2);
    updateSpeed(Math.round(speed * 3.6));

    const force = 25000;
    let torque = 8000;
    const maxSpeed = 50;

    // Mode drift avec Shift
    if (keys.current.shift) {
      // Réduire la friction pour permettre le drift
      api.material.friction = 0.2;
      torque = 12000; // Augmenter le couple pour des virages plus serrés
    } else {
      // Friction normale
      api.material.friction = 0.7;
      torque = 8000;
    }

    if (keys.current.z && speed < maxSpeed) {
      api.applyLocalForce([0, 0, -force], [0, 0, 0]);
    }
    if (keys.current.s) {
      api.applyLocalForce([0, 0, force * 0.6], [0, 0, 0]);
    }
    if (keys.current.q) {
      api.applyTorque([0, torque, 0]);
    }
    if (keys.current.d) {
      api.applyTorque([0, -torque, 0]);
    }

    // Car body tilt based on movement
    if (carGroupRef.current) {
      const speedFactor = Math.min(speed / 20, 1);
      carGroupRef.current.rotation.z = velocity.current[0] * -0.02 * speedFactor;
      carGroupRef.current.rotation.x = velocity.current[2] * 0.01 * speedFactor;
      
      // Effet visuel supplémentaire en mode drift
      if (keys.current.shift) {
        carGroupRef.current.rotation.z *= 1.5; // Inclinaison plus prononcée
      }
    }
  });

  return (
    <group ref={carGroupRef}>
      <mesh ref={ref as React.Ref<Mesh>} castShadow receiveShadow>
        {/* Main car body */}
        <boxGeometry args={[2.2, 0.8, 4.5]} />
        <meshPhysicalMaterial 
          color="#FF6B35"
          metalness={0.9}
          roughness={0.1}
          clearcoat={1.0}
          clearcoatRoughness={0.1}
          reflectivity={1.0}
        />
        
        {/* Wheels */}
        {[
          [-1, -0.3, 1.5] as [number, number, number], 
          [1, -0.3, 1.5] as [number, number, number], 
          [-1, -0.3, -1.5] as [number, number, number], 
          [1, -0.3, -1.5] as [number, number, number]
        ].map((pos, i) => (
          <mesh key={i} position={pos} castShadow>
            <cylinderGeometry args={[0.4, 0.4, 0.3, 16]} />
            <meshStandardMaterial color="#1a1a1a" roughness={0.8} metalness={0.1} />
          </mesh>
        ))}
        
        {/* Headlights */}
        <mesh position={[0.8, 0.2, -2.3]}>
          <sphereGeometry args={[0.15]} />
          <meshStandardMaterial 
            color="#ffffff" 
            emissive="#ffffff" 
            emissiveIntensity={2}
          />
          <pointLight intensity={3} distance={20} color="#ffffff" />
        </mesh>
        <mesh position={[-0.8, 0.2, -2.3]}>
          <sphereGeometry args={[0.15]} />
          <meshStandardMaterial 
            color="#ffffff" 
            emissive="#ffffff" 
            emissiveIntensity={2}
          />
          <pointLight intensity={3} distance={20} color="#ffffff" />
        </mesh>
        
        {/* Taillights */}
        <mesh position={[0.8, 0.1, 2.3]}>
          <sphereGeometry args={[0.12]} />
          <meshStandardMaterial 
            color="#ff0000" 
            emissive="#ff0000" 
            emissiveIntensity={1}
          />
        </mesh>
        <mesh position={[-0.8, 0.1, 2.3]}>
          <sphereGeometry args={[0.12]} />
          <meshStandardMaterial 
            color="#ff0000" 
            emissive="#ff0000" 
            emissiveIntensity={1}
          />
        </mesh>

        {/* Windshield */}
        <mesh position={[0, 0.6, 0.5]}>
          <boxGeometry args={[1.8, 0.8, 2]} />
          <meshPhysicalMaterial 
            color="#87CEEB"
            transparent
            opacity={0.3}
            transmission={0.9}
            roughness={0}
            metalness={0}
          />
        </mesh>

        {/* Spoiler */}
        <mesh position={[0, 0.8, 2]}>
          <boxGeometry args={[1.5, 0.1, 0.3]} />
          <meshPhysicalMaterial 
            color="#FF6B35"
            metalness={0.9}
            roughness={0.1}
            clearcoat={1.0}
            clearcoatRoughness={0.1}
          />
        </mesh>
      </mesh>
    </group>
  );
};
