
import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useBox } from '@react-three/cannon';
import { Vector3, Mesh, Group, Euler } from 'three';
import { useGame } from '../../contexts/GameContext';

export const RealisticCar = () => {
  const { updateSpeed } = useGame();
  const carGroupRef = useRef<Group>(null);
  
  const [ref, api] = useBox(() => ({
    mass: 500, // Masse réduite
    position: [0, 1, 0],
    args: [2.2, 0.8, 4.5],
    material: {
      friction: 0.7,
      restitution: 0.1,
    },
  }));

  const velocity = useRef([0, 0, 0]);
  const position = useRef([0, 1, 0]);
  const rotation = useRef([0, 0, 0]);
  const steeringAngle = useRef(0);
  const keys = useRef({ 
    forward: false, 
    backward: false, 
    left: false, 
    right: false, 
    drift: false 
  });

  // Souscrire aux changements de position, rotation et vélocité
  useRef(() => {
    const unsubscribeVelocity = api.velocity.subscribe((v) => velocity.current = v);
    const unsubscribePosition = api.position.subscribe((p) => position.current = p);
    const unsubscribeRotation = api.rotation.subscribe((r) => rotation.current = r);
    
    return () => {
      unsubscribeVelocity();
      unsubscribePosition();
      unsubscribeRotation();
    };
  });

  // Gérer les événements clavier
  useRef(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      switch (event.code) {
        case 'KeyZ': case 'KeyW': keys.current.forward = true; break;
        case 'KeyS': keys.current.backward = true; break;
        case 'KeyQ': case 'KeyA': keys.current.left = true; break;
        case 'KeyD': keys.current.right = true; break;
        case 'ShiftLeft': case 'ShiftRight': keys.current.drift = true; break;
      }
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      switch (event.code) {
        case 'KeyZ': case 'KeyW': keys.current.forward = false; break;
        case 'KeyS': keys.current.backward = false; break;
        case 'KeyQ': case 'KeyA': keys.current.left = false; break;
        case 'KeyD': keys.current.right = false; break;
        case 'ShiftLeft': case 'ShiftRight': keys.current.drift = false; break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keyup', handleKeyUp);
    };
  });

  useFrame(() => {
    const speed = Math.sqrt(velocity.current[0] ** 2 + velocity.current[2] ** 2);
    updateSpeed(Math.round(speed * 3.6));

    // Paramètres réalistes
    const motorForce = 2000; // Force réduite
    const brakeForce = 3000;
    const maxSteeringAngle = 0.5; // Angle maximum de direction
    const steeringSpeed = 0.05;

    // Gestion de la direction (steering)
    if (keys.current.left) {
      steeringAngle.current = Math.min(steeringAngle.current + steeringSpeed, maxSteeringAngle);
    } else if (keys.current.right) {
      steeringAngle.current = Math.max(steeringAngle.current - steeringSpeed, -maxSteeringAngle);
    } else {
      // Retour automatique au centre
      steeringAngle.current *= 0.9;
    }

    // Calcul de la direction basée sur la rotation actuelle de la voiture
    const carRotationY = rotation.current[1];
    const forwardX = Math.sin(carRotationY);
    const forwardZ = Math.cos(carRotationY);

    // Application des forces d'accélération
    if (keys.current.forward) {
      api.applyLocalForce([0, 0, -motorForce], [0, 0, 0]);
    }
    if (keys.current.backward) {
      api.applyLocalForce([0, 0, brakeForce * 0.6], [0, 0, 0]);
    }

    // Système de direction réaliste - seulement si on bouge
    if (speed > 0.5 && Math.abs(steeringAngle.current) > 0.01) {
      const steeringForce = steeringAngle.current * speed * 800;
      api.applyTorque([0, -steeringForce, 0]);
    }

    // Forces de résistance
    const airResistance = speed * speed * 0.02;
    const rollingResistance = speed * 50;
    const totalResistance = airResistance + rollingResistance;

    if (speed > 0.1) {
      const resistanceX = -forwardX * totalResistance;
      const resistanceZ = -forwardZ * totalResistance;
      api.applyForce([resistanceX, 0, resistanceZ], position.current as [number, number, number]);
    }

    // Mode drift
    if (keys.current.drift && speed > 3) {
      const driftForce = steeringAngle.current * 1500;
      api.applyLocalForce([driftForce, 0, 0], [0, 0, 0]);
    }

    // Stabilisation pour éviter les basculements
    if (Math.abs(rotation.current[0]) > 0.1 || Math.abs(rotation.current[2]) > 0.1) {
      api.applyTorque([-rotation.current[0] * 2000, 0, -rotation.current[2] * 2000]);
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
        
        {/* Roues avec orientation correcte */}
        {[
          [-1, -0.3, 1.5, steeringAngle.current], // Roue avant gauche (avec direction)
          [1, -0.3, 1.5, steeringAngle.current],  // Roue avant droite (avec direction)
          [-1, -0.3, -1.5, 0],                    // Roue arrière gauche (fixe)
          [1, -0.3, -1.5, 0]                      // Roue arrière droite (fixe)
        ].map((wheel, i) => (
          <mesh 
            key={i} 
            position={[wheel[0], wheel[1], wheel[2]] as [number, number, number]} 
            rotation={[Math.PI / 2, wheel[3], 0]} 
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
