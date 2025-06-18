
import { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { useBox } from '@react-three/cannon';
import { Vector3, Mesh, Group } from 'three';
import { useGame } from '../../contexts/GameContext';

export const AdvancedCar = () => {
  const { updateSpeed } = useGame();
  const carGroupRef = useRef<Group>(null);
  const [ref, api] = useBox(() => ({
    mass: 800, // Réduction de la masse pour plus de réactivité
    position: [0, 1, 0],
    args: [2.2, 0.8, 4.5],
    material: {
      friction: 0.8, // Réduction de la friction
      restitution: 0.1,
    },
  }));

  const velocity = useRef([0, 0, 0]);
  const position = useRef([0, 1, 0]);
  const keys = useRef({ 
    forward: false, 
    backward: false, 
    left: false, 
    right: false, 
    drift: false 
  });

  useEffect(() => {
    console.log('AdvancedCar: Initializing car controls');
    
    const unsubscribeVelocity = api.velocity.subscribe((v) => {
      velocity.current = v;
      const speed = Math.sqrt(v[0] ** 2 + v[2] ** 2);
      if (speed > 0.1) {
        console.log('Car moving - velocity:', v, 'speed:', speed);
      }
    });
    
    const unsubscribePosition = api.position.subscribe((p) => {
      position.current = p;
    });
    
    const handleKeyDown = (event: KeyboardEvent) => {
      event.preventDefault();
      console.log('Key DOWN:', event.code);
      
      switch (event.code) {
        case 'KeyZ':
        case 'KeyW':
        case 'ArrowUp':
          keys.current.forward = true;
          console.log('FORWARD ON');
          break;
        case 'KeyS':
        case 'ArrowDown':
          keys.current.backward = true;
          console.log('BACKWARD ON');
          break;
        case 'KeyQ':
        case 'KeyA':
        case 'ArrowLeft':
          keys.current.left = true;
          console.log('LEFT ON');
          break;
        case 'KeyD':
        case 'ArrowRight':
          keys.current.right = true;
          console.log('RIGHT ON');
          break;
        case 'ShiftLeft':
        case 'ShiftRight':
          keys.current.drift = true;
          console.log('DRIFT ON');
          break;
      }
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      event.preventDefault();
      console.log('Key UP:', event.code);
      
      switch (event.code) {
        case 'KeyZ':
        case 'KeyW':
        case 'ArrowUp':
          keys.current.forward = false;
          console.log('FORWARD OFF');
          break;
        case 'KeyS':
        case 'ArrowDown':
          keys.current.backward = false;
          console.log('BACKWARD OFF');
          break;
        case 'KeyQ':
        case 'KeyA':
        case 'ArrowLeft':
          keys.current.left = false;
          console.log('LEFT OFF');
          break;
        case 'KeyD':
        case 'ArrowRight':
          keys.current.right = false;
          console.log('RIGHT OFF');
          break;
        case 'ShiftLeft':
        case 'ShiftRight':
          keys.current.drift = false;
          console.log('DRIFT OFF');
          break;
      }
    };

    // Ajouter les listeners sur document ET window
    document.addEventListener('keydown', handleKeyDown, true);
    document.addEventListener('keyup', handleKeyUp, true);
    window.addEventListener('keydown', handleKeyDown, true);
    window.addEventListener('keyup', handleKeyUp, true);
    
    console.log('AdvancedCar: Keyboard listeners added');
    
    return () => {
      console.log('AdvancedCar: Cleaning up listeners');
      unsubscribeVelocity();
      unsubscribePosition();
      document.removeEventListener('keydown', handleKeyDown, true);
      document.removeEventListener('keyup', handleKeyUp, true);
      window.removeEventListener('keydown', handleKeyDown, true);
      window.removeEventListener('keyup', handleKeyUp, true);
    };
  }, [api]);

  useFrame(() => {
    const speed = Math.sqrt(velocity.current[0] ** 2 + velocity.current[2] ** 2);
    updateSpeed(Math.round(speed * 3.6));

    // Forces beaucoup plus importantes
    const forwardForce = 25000;
    const backwardForce = 15000;
    const turnTorque = 8000;
    const maxSpeed = 50;

    // Vérifier si des touches sont pressées
    const anyKeyPressed = keys.current.forward || keys.current.backward || keys.current.left || keys.current.right;
    
    if (anyKeyPressed) {
      console.log('Applying forces! Keys:', {
        forward: keys.current.forward,
        backward: keys.current.backward,
        left: keys.current.left,
        right: keys.current.right,
        drift: keys.current.drift
      });
    }

    // Appliquer les forces
    if (keys.current.forward && speed < maxSpeed) {
      api.applyLocalForce([0, 0, -forwardForce], [0, 0, 0]);
      console.log('Applying FORWARD force:', forwardForce);
    }
    
    if (keys.current.backward) {
      api.applyLocalForce([0, 0, backwardForce], [0, 0, 0]);
      console.log('Applying BACKWARD force:', backwardForce);
    }
    
    if (keys.current.left) {
      api.applyTorque([0, turnTorque, 0]);
      console.log('Applying LEFT torque:', turnTorque);
      
      // Mode drift
      if (keys.current.drift && speed > 5) {
        api.applyLocalForce([8000, 0, 0], [0, 0, 0]);
        console.log('Applying DRIFT force LEFT');
      }
    }
    
    if (keys.current.right) {
      api.applyTorque([0, -turnTorque, 0]);
      console.log('Applying RIGHT torque:', -turnTorque);
      
      // Mode drift
      if (keys.current.drift && speed > 5) {
        api.applyLocalForce([-8000, 0, 0], [0, 0, 0]);
        console.log('Applying DRIFT force RIGHT');
      }
    }

    // Incliner la voiture en fonction du mouvement
    if (carGroupRef.current) {
      const speedFactor = Math.min(speed / 15, 1);
      carGroupRef.current.rotation.z = velocity.current[0] * -0.02 * speedFactor;
      carGroupRef.current.rotation.x = velocity.current[2] * 0.01 * speedFactor;
      
      if (keys.current.drift) {
        carGroupRef.current.rotation.z *= 2;
      }
    }
  });

  return (
    <group ref={carGroupRef}>
      <mesh ref={ref as React.Ref<Mesh>} castShadow receiveShadow>
        {/* Corps principal de la voiture */}
        <boxGeometry args={[2.2, 0.8, 4.5]} />
        <meshPhysicalMaterial 
          color="#FF6B35"
          metalness={0.9}
          roughness={0.1}
          clearcoat={1.0}
          clearcoatRoughness={0.1}
          reflectivity={1.0}
        />
        
        {/* Roues - orientation corrigée */}
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
        
        {/* Phares avant */}
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
        
        {/* Feux arrière */}
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

        {/* Pare-brise */}
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
