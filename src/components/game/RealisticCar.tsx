
import { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { useBox } from '@react-three/cannon';
import { Vector3, Mesh, Group, Euler } from 'three';
import { useGame } from '../../contexts/GameContext';

export const RealisticCar = () => {
  const { updateSpeed } = useGame();
  const carGroupRef = useRef<Group>(null);
  
  const [ref, api] = useBox(() => ({
    mass: 800,
    position: [0, 1, 0],
    args: [2.2, 0.8, 4.5],
    material: {
      friction: 0.8,
      restitution: 0.1,
    },
  }));

  const velocity = useRef([0, 0, 0]);
  const position = useRef([0, 1, 0]);
  const rotation = useRef([0, 0, 0]);
  const keys = useRef({ 
    forward: false, 
    backward: false, 
    left: false, 
    right: false, 
    drift: false 
  });

  useEffect(() => {
    console.log('RealisticCar: Setting up car physics');
    
    const unsubscribeVelocity = api.velocity.subscribe((v) => {
      velocity.current = v;
    });
    
    const unsubscribePosition = api.position.subscribe((p) => {
      position.current = p;
    });
    
    const unsubscribeRotation = api.rotation.subscribe((r) => {
      rotation.current = r;
    });
    
    const handleKeyDown = (event: KeyboardEvent) => {
      switch (event.code) {
        case 'KeyZ': case 'KeyW': case 'ArrowUp':
          keys.current.forward = true;
          console.log('Accelerating forward');
          break;
        case 'KeyS': case 'ArrowDown':
          keys.current.backward = true;
          console.log('Braking/Reverse');
          break;
        case 'KeyQ': case 'KeyA': case 'ArrowLeft':
          keys.current.left = true;
          console.log('Turning left');
          break;
        case 'KeyD': case 'ArrowRight':
          keys.current.right = true;
          console.log('Turning right');
          break;
        case 'ShiftLeft': case 'ShiftRight':
          keys.current.drift = true;
          console.log('Drift mode ON');
          break;
      }
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      switch (event.code) {
        case 'KeyZ': case 'KeyW': case 'ArrowUp':
          keys.current.forward = false;
          break;
        case 'KeyS': case 'ArrowDown':
          keys.current.backward = false;
          break;
        case 'KeyQ': case 'KeyA': case 'ArrowLeft':
          keys.current.left = false;
          break;
        case 'KeyD': case 'ArrowRight':
          keys.current.right = false;
          break;
        case 'ShiftLeft': case 'ShiftRight':
          keys.current.drift = false;
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);
    
    return () => {
      unsubscribeVelocity();
      unsubscribePosition();
      unsubscribeRotation();
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keyup', handleKeyUp);
    };
  }, [api]);

  useFrame(() => {
    const speed = Math.sqrt(velocity.current[0] ** 2 + velocity.current[2] ** 2);
    updateSpeed(Math.round(speed * 3.6));

    // Paramètres de conduite réalistes
    const motorForce = 3000;
    const brakeForce = 4000;
    const maxSteeringAngle = 0.6;
    const steeringSpeed = 0.08;
    const maxSpeed = 60;

    // Calcul de la direction actuelle de la voiture
    const carRotationY = rotation.current[1];
    const forwardX = Math.sin(carRotationY);
    const forwardZ = Math.cos(carRotationY);
    const rightX = Math.cos(carRotationY);
    const rightZ = -Math.sin(carRotationY);

    console.log('Car rotation Y:', carRotationY, 'Speed:', speed);

    // Accélération avant/arrière
    if (keys.current.forward && speed < maxSpeed) {
      const forceX = forwardX * motorForce;
      const forceZ = forwardZ * motorForce;
      api.applyForce([forceX, 0, forceZ], position.current as [number, number, number]);
      console.log('Applying forward force:', forceX, forceZ);
    }

    if (keys.current.backward) {
      if (speed > 1) {
        // Freinage
        const brakeX = -forwardX * brakeForce;
        const brakeZ = -forwardZ * brakeForce;
        api.applyForce([brakeX, 0, brakeZ], position.current as [number, number, number]);
        console.log('Braking');
      } else {
        // Marche arrière
        const reverseX = -forwardX * motorForce * 0.5;
        const reverseZ = -forwardZ * motorForce * 0.5;
        api.applyForce([reverseX, 0, reverseZ], position.current as [number, number, number]);
        console.log('Reversing');
      }
    }

    // Direction (seulement si la voiture bouge)
    if (speed > 0.5) {
      const steeringForce = speed * 800; // Force proportionnelle à la vitesse
      
      if (keys.current.left) {
        api.applyTorque([0, steeringForce, 0]);
        console.log('Steering left with force:', steeringForce);
        
        // Mode drift
        if (keys.current.drift && speed > 8) {
          const driftForceX = rightX * 2000;
          const driftForceZ = rightZ * 2000;
          api.applyForce([driftForceX, 0, driftForceZ], position.current as [number, number, number]);
          console.log('Drifting left');
        }
      }
      
      if (keys.current.right) {
        api.applyTorque([0, -steeringForce, 0]);
        console.log('Steering right with force:', -steeringForce);
        
        // Mode drift
        if (keys.current.drift && speed > 8) {
          const driftForceX = -rightX * 2000;
          const driftForceZ = -rightZ * 2000;
          api.applyForce([driftForceX, 0, driftForceZ], position.current as [number, number, number]);
          console.log('Drifting right');
        }
      }
    }

    // Forces de résistance réalistes
    if (speed > 0.1) {
      const airResistance = speed * speed * 0.8;
      const rollingResistance = speed * 30;
      const totalResistance = airResistance + rollingResistance;
      
      const resistanceX = -velocity.current[0] * totalResistance * 0.01;
      const resistanceZ = -velocity.current[2] * totalResistance * 0.01;
      
      api.applyForce([resistanceX, 0, resistanceZ], position.current as [number, number, number]);
    }

    // Stabilisation anti-basculement
    const tiltThreshold = 0.2;
    if (Math.abs(rotation.current[0]) > tiltThreshold || Math.abs(rotation.current[2]) > tiltThreshold) {
      const stabilizeX = -rotation.current[0] * 3000;
      const stabilizeZ = -rotation.current[2] * 3000;
      api.applyTorque([stabilizeX, 0, stabilizeZ]);
    }

    // Effets visuels sur le groupe de la voiture
    if (carGroupRef.current) {
      const speedFactor = Math.min(speed / 20, 1);
      carGroupRef.current.rotation.z = velocity.current[0] * -0.01 * speedFactor;
      carGroupRef.current.rotation.x = -velocity.current[2] * 0.005 * speedFactor;
    }
  });

  return (
    <group ref={carGroupRef}>
      <mesh ref={ref as React.Ref<Mesh>} castShadow receiveShadow>
        {/* Corps principal */}
        <boxGeometry args={[2.2, 0.8, 4.5]} />
        <meshPhysicalMaterial 
          color="#FF6B35"
          metalness={0.9}
          roughness={0.1}
          clearcoat={1.0}
        />
        
        {/* Roues */}
        {[
          [-1, -0.3, 1.5], // Roue avant gauche
          [1, -0.3, 1.5],  // Roue avant droite
          [-1, -0.3, -1.5], // Roue arrière gauche
          [1, -0.3, -1.5]   // Roue arrière droite
        ].map((wheel, i) => (
          <mesh 
            key={i} 
            position={wheel as [number, number, number]} 
            rotation={[Math.PI / 2, 0, 0]} 
            castShadow
          >
            <cylinderGeometry args={[0.4, 0.4, 0.3, 16]} />
            <meshStandardMaterial color="#1a1a1a" />
          </mesh>
        ))}
        
        {/* Phares avant */}
        <mesh position={[0.8, 0.2, -2.3]}>
          <sphereGeometry args={[0.15]} />
          <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={1} />
        </mesh>
        <mesh position={[-0.8, 0.2, -2.3]}>
          <sphereGeometry args={[0.15]} />
          <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={1} />
        </mesh>
        
        {/* Feux arrière */}
        <mesh position={[0.8, 0.1, 2.3]}>
          <sphereGeometry args={[0.12]} />
          <meshStandardMaterial color="#ff0000" emissive="#ff0000" emissiveIntensity={0.5} />
        </mesh>
        <mesh position={[-0.8, 0.1, 2.3]}>
          <sphereGeometry args={[0.12]} />
          <meshStandardMaterial color="#ff0000" emissive="#ff0000" emissiveIntensity={0.5} />
        </mesh>
      </mesh>
    </group>
  );
};
