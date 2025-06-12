
import { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { useBox } from '@react-three/cannon';
import { Vector3, Mesh, Group } from 'three';
import { useGame } from '../../contexts/GameContext';
import { useCarMaterial } from './AdvancedMaterials';

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

  const carMaterial = useCarMaterial('#FF6B35');
  const velocity = useRef([0, 0, 0]);
  const position = useRef([0, 2, 0]);
  const keys = useRef({ w: false, s: false, a: false, d: false });

  useEffect(() => {
    const unsubscribeVelocity = api.velocity.subscribe((v) => velocity.current = v);
    const unsubscribePosition = api.position.subscribe((p) => position.current = p);
    
    const handleKeyDown = (event: KeyboardEvent) => {
      switch (event.code) {
        case 'KeyW':
        case 'ArrowUp':
          keys.current.w = true;
          break;
        case 'KeyS':
        case 'ArrowDown':
          keys.current.s = true;
          break;
        case 'KeyA':
        case 'ArrowLeft':
          keys.current.a = true;
          break;
        case 'KeyD':
        case 'ArrowRight':
          keys.current.d = true;
          break;
      }
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      switch (event.code) {
        case 'KeyW':
        case 'ArrowUp':
          keys.current.w = false;
          break;
        case 'KeyS':
        case 'ArrowDown':
          keys.current.s = false;
          break;
        case 'KeyA':
        case 'ArrowLeft':
          keys.current.a = false;
          break;
        case 'KeyD':
        case 'ArrowRight':
          keys.current.d = false;
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
    const torque = 8000;
    const maxSpeed = 50;

    if (keys.current.w && speed < maxSpeed) {
      api.applyLocalForce([0, 0, -force], [0, 0, 0]);
    }
    if (keys.current.s) {
      api.applyLocalForce([0, 0, force * 0.6], [0, 0, 0]);
    }
    if (keys.current.a) {
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
    }
  });

  return (
    <group ref={carGroupRef}>
      <mesh ref={ref as React.Ref<Mesh>} castShadow receiveShadow>
        {/* Main car body */}
        <boxGeometry args={[2.2, 0.8, 4.5]} />
        <primitive object={carMaterial} />
        
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
          <primitive object={carMaterial} />
        </mesh>
      </mesh>
    </group>
  );
};
