import { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { useBox } from '@react-three/cannon';
import { Vector3, Mesh, Group } from 'three';
import { useGame } from '../../contexts/GameContext';

export const AdvancedCar = () => {
  const { updateSpeed } = useGame();
  const carGroupRef = useRef<Group>(null);
  const [ref, api] = useBox(() => ({
    mass: 1200,
    position: [0, 1.5, 0],
    args: [2.2, 0.8, 4.5],
    material: {
      friction: 1.5,
      restitution: 0.2,
    },
  }));

  const velocity = useRef([0, 0, 0]);
  const position = useRef([0, 1.5, 0]);
  const keys = useRef({ z: false, s: false, q: false, d: false, shift: false });

  useEffect(() => {
    console.log('AdvancedCar: Setting up keyboard listeners');
    
    const unsubscribeVelocity = api.velocity.subscribe((v) => {
      velocity.current = v;
      console.log('Car velocity:', v);
    });
    
    const unsubscribePosition = api.position.subscribe((p) => {
      position.current = p;
      console.log('Car position:', p);
    });
    
    const handleKeyDown = (event: KeyboardEvent) => {
      console.log('Key pressed:', event.code);
      switch (event.code) {
        case 'KeyZ':
          keys.current.z = true;
          console.log('Accelerate ON');
          break;
        case 'KeyS':
          keys.current.s = true;
          console.log('Brake ON');
          break;
        case 'KeyQ':
          keys.current.q = true;
          console.log('Turn Left ON');
          break;
        case 'KeyD':
          keys.current.d = true;
          console.log('Turn Right ON');
          break;
        case 'ShiftLeft':
        case 'ShiftRight':
          keys.current.shift = true;
          console.log('Drift Mode ON');
          break;
      }
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      console.log('Key released:', event.code);
      switch (event.code) {
        case 'KeyZ':
          keys.current.z = false;
          console.log('Accelerate OFF');
          break;
        case 'KeyS':
          keys.current.s = false;
          console.log('Brake OFF');
          break;
        case 'KeyQ':
          keys.current.q = false;
          console.log('Turn Left OFF');
          break;
        case 'KeyD':
          keys.current.d = false;
          console.log('Turn Right OFF');
          break;
        case 'ShiftLeft':
        case 'ShiftRight':
          keys.current.shift = false;
          console.log('Drift Mode OFF');
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    
    console.log('AdvancedCar: Keyboard listeners added');
    
    return () => {
      console.log('AdvancedCar: Cleaning up keyboard listeners');
      unsubscribeVelocity();
      unsubscribePosition();
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [api]);

  useFrame(() => {
    const speed = Math.sqrt(velocity.current[0] ** 2 + velocity.current[2] ** 2);
    updateSpeed(Math.round(speed * 3.6));

    const force = 15000;
    let torque = 5000;
    const maxSpeed = 40;

    // Vérifier si des touches sont pressées
    const anyKeyPressed = keys.current.z || keys.current.s || keys.current.q || keys.current.d;
    if (anyKeyPressed) {
      console.log('Applying forces. Keys pressed:', {
        z: keys.current.z,
        s: keys.current.s,
        q: keys.current.q,
        d: keys.current.d,
        shift: keys.current.shift
      });
    }

    // Mode drift avec Shift
    if (keys.current.shift) {
      torque = 8000;
      if (keys.current.q || keys.current.d) {
        const lateralForce = 5000;
        const direction = keys.current.q ? 1 : -1;
        api.applyLocalForce([lateralForce * direction, 0, 0], [0, 0, 0]);
        console.log('Applying lateral drift force:', lateralForce * direction);
      }
    }

    if (keys.current.z && speed < maxSpeed) {
      api.applyLocalForce([0, 0, -force], [0, 0, 0]);
      console.log('Applying forward force:', force);
    }
    if (keys.current.s) {
      api.applyLocalForce([0, 0, force * 0.8], [0, 0, 0]);
      console.log('Applying brake force:', force * 0.8);
    }
    if (keys.current.q) {
      api.applyTorque([0, torque, 0]);
      console.log('Applying left turn torque:', torque);
    }
    if (keys.current.d) {
      api.applyTorque([0, -torque, 0]);
      console.log('Applying right turn torque:', -torque);
    }

    // Car body tilt based on movement
    if (carGroupRef.current) {
      const speedFactor = Math.min(speed / 15, 1);
      carGroupRef.current.rotation.z = velocity.current[0] * -0.02 * speedFactor;
      carGroupRef.current.rotation.x = velocity.current[2] * 0.01 * speedFactor;
      
      if (keys.current.shift) {
        carGroupRef.current.rotation.z *= 1.5;
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
        
        {/* Wheels - corrected orientation */}
        {[
          [-1, -0.3, 1.5] as [number, number, number], 
          [1, -0.3, 1.5] as [number, number, number], 
          [-1, -0.3, -1.5] as [number, number, number], 
          [1, -0.3, -1.5] as [number, number, number]
        ].map((pos, i) => (
          <mesh key={i} position={pos} rotation={[0, 0, Math.PI / 2]} castShadow>
            <cylinderGeometry args={[0.4, 0.4, 0.3, 16]} />
            <meshStandardMaterial color="#1a1a1a" roughness={0.8} metalness={0.1} />
          </mesh>
        ))}
        
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
