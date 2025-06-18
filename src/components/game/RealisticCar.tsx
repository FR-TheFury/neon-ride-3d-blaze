
import { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { useBox } from '@react-three/cannon';
import { Vector3, Mesh, Group, Euler } from 'three';
import { useGame } from '../../contexts/GameContext';

export const RealisticCar = () => {
  const { updateSpeed } = useGame();
  const carGroupRef = useRef<Group>(null);
  
  const [ref, api] = useBox(() => ({
    mass: 1200,
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
  const keys = useRef({ 
    forward: false,     // Z
    backward: false,    // S
    left: false,        // Q
    right: false,       // D
    drift: false,       // Shift
    handbrake: false    // Espace
  });

  useEffect(() => {
    console.log('RealisticCar: Initialisation des contrôles');
    
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
      console.log('Touche appuyée:', event.code);
      
      switch (event.code) {
        case 'KeyZ':
          keys.current.forward = true;
          console.log('AVANCER - ON');
          break;
        case 'KeyS':
          keys.current.backward = true;
          console.log('RECULER - ON');
          break;
        case 'KeyQ':
          keys.current.left = true;
          console.log('GAUCHE - ON');
          break;
        case 'KeyD':
          keys.current.right = true;
          console.log('DROITE - ON');
          break;
        case 'ShiftLeft':
        case 'ShiftRight':
          keys.current.drift = true;
          console.log('DRIFT - ON');
          break;
        case 'Space':
          event.preventDefault();
          keys.current.handbrake = true;
          console.log('FREIN À MAIN - ON');
          break;
      }
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      console.log('Touche relâchée:', event.code);
      
      switch (event.code) {
        case 'KeyZ':
          keys.current.forward = false;
          console.log('AVANCER - OFF');
          break;
        case 'KeyS':
          keys.current.backward = false;
          console.log('RECULER - OFF');
          break;
        case 'KeyQ':
          keys.current.left = false;
          console.log('GAUCHE - OFF');
          break;
        case 'KeyD':
          keys.current.right = false;
          console.log('DROITE - OFF');
          break;
        case 'ShiftLeft':
        case 'ShiftRight':
          keys.current.drift = false;
          console.log('DRIFT - OFF');
          break;
        case 'Space':
          event.preventDefault();
          keys.current.handbrake = false;
          console.log('FREIN À MAIN - OFF');
          break;
      }
    };

    // Ajouter les événements sur window pour capturer toutes les touches
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    
    console.log('Événements clavier ajoutés');
    
    return () => {
      console.log('Nettoyage des événements');
      unsubscribeVelocity();
      unsubscribePosition();
      unsubscribeRotation();
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [api]);

  useFrame(() => {
    const speed = Math.sqrt(velocity.current[0] ** 2 + velocity.current[2] ** 2);
    updateSpeed(Math.round(speed * 3.6));

    // Forces plus importantes pour un mouvement visible
    const motorForce = 8000;
    const brakeForce = 12000;
    const handbrakeForce = 20000;
    const maxSpeed = 80;

    // Obtenir l'orientation actuelle de la voiture
    const carRotationY = rotation.current[1];
    const forwardDirection = new Vector3(Math.sin(carRotationY), 0, Math.cos(carRotationY));
    const rightDirection = new Vector3(Math.cos(carRotationY), 0, -Math.sin(carRotationY));

    // Debug des touches pressées
    const anyKeyPressed = Object.values(keys.current).some(key => key);
    if (anyKeyPressed) {
      console.log('Touches actives:', {
        forward: keys.current.forward,
        backward: keys.current.backward,
        left: keys.current.left,
        right: keys.current.right,
        drift: keys.current.drift,
        handbrake: keys.current.handbrake
      }, 'Vitesse:', Math.round(speed * 3.6), 'km/h');
    }

    // Accélération (Z)
    if (keys.current.forward && speed < maxSpeed) {
      const force = forwardDirection.multiplyScalar(-motorForce);
      api.applyForce([force.x, 0, force.z], [0, 0, 0]);
      console.log('Application force avant:', force.x, force.z);
    }

    // Marche arrière (S)
    if (keys.current.backward) {
      if (speed > 1) {
        // Freinage si on avance
        const brakeForceVec = forwardDirection.multiplyScalar(brakeForce);
        api.applyForce([brakeForceVec.x, 0, brakeForceVec.z], [0, 0, 0]);
        console.log('Freinage');
      } else {
        // Marche arrière si on est arrêté
        const reverseForce = forwardDirection.multiplyScalar(motorForce * 0.6);
        api.applyForce([reverseForce.x, 0, reverseForce.z], [0, 0, 0]);
        console.log('Marche arrière');
      }
    }

    // Direction (Q et D) - seulement si la voiture bouge
    if (speed > 0.5) {
      const steeringTorque = speed * 1200;
      
      if (keys.current.left) {
        api.applyTorque([0, steeringTorque, 0]);
        console.log('Virage à gauche, couple:', steeringTorque);
        
        // Effet de drift
        if (keys.current.drift && speed > 10) {
          const driftForce = rightDirection.multiplyScalar(3000);
          api.applyForce([driftForce.x, 0, driftForce.z], [0, 0, 0]);
          console.log('Drift gauche');
        }
      }
      
      if (keys.current.right) {
        api.applyTorque([0, -steeringTorque, 0]);
        console.log('Virage à droite, couple:', -steeringTorque);
        
        // Effet de drift
        if (keys.current.drift && speed > 10) {
          const driftForce = rightDirection.multiplyScalar(-3000);
          api.applyForce([driftForce.x, 0, driftForce.z], [0, 0, 0]);
          console.log('Drift droite');
        }
      }
    }

    // Frein à main (Espace)
    if (keys.current.handbrake) {
      const handbrakeForceVec = new Vector3(
        -velocity.current[0] * handbrakeForce,
        0,
        -velocity.current[2] * handbrakeForce
      );
      api.applyForce([handbrakeForceVec.x, 0, handbrakeForceVec.z], [0, 0, 0]);
      console.log('Frein à main activé');
    }

    // Résistance naturelle
    if (speed > 0.1) {
      const resistance = speed * speed * 2;
      const resistanceForce = new Vector3(
        -velocity.current[0] * resistance,
        0,
        -velocity.current[2] * resistance
      );
      api.applyForce([resistanceForce.x, 0, resistanceForce.z], [0, 0, 0]);
    }

    // Stabilisation anti-basculement
    if (Math.abs(rotation.current[0]) > 0.3 || Math.abs(rotation.current[2]) > 0.3) {
      api.applyTorque([
        -rotation.current[0] * 5000,
        0,
        -rotation.current[2] * 5000
      ]);
    }

    // Effets visuels
    if (carGroupRef.current) {
      const speedFactor = Math.min(speed / 20, 1);
      carGroupRef.current.rotation.z = velocity.current[0] * -0.02 * speedFactor;
      carGroupRef.current.rotation.x = velocity.current[2] * 0.01 * speedFactor;
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
