
import { useRef, useEffect, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { useBox } from '@react-three/cannon';
import { Vector3, Mesh, Group } from 'three';
import { useGame } from '../../contexts/GameContext';
import { toast } from 'sonner';

interface RealisticCarProps {
  onPositionChange?: (position: [number, number, number]) => void;
  onRotationChange?: (rotation: [number, number, number]) => void;
}

export const RealisticCar = ({ onPositionChange, onRotationChange }: RealisticCarProps) => {
  const { updateSpeed } = useGame();
  const carGroupRef = useRef<Group>(null);
  const wheelRefs = useRef<Mesh[]>([]);
  const [debugMode, setDebugMode] = useState(false);
  
  const [ref, api] = useBox(() => ({
    mass: 1200,
    position: [0, 1, 0],
    args: [2.2, 0.8, 4.5],
    material: {
      friction: 0.7,
      restitution: 0.1,
    },
    allowSleep: false,
  }));

  const velocity = useRef<[number, number, number]>([0, 0, 0]);
  const position = useRef<[number, number, number]>([0, 1, 0]);
  const rotation = useRef<[number, number, number]>([0, 0, 0]);
  const keys = useRef({ 
    forward: false,     // Z
    backward: false,    // S
    left: false,        // Q
    right: false,       // D
    drift: false,       // Shift
    handbrake: false    // Espace
  });

  // Initialiser les contrôles
  useEffect(() => {
    console.log('RealisticCar: Initialisation des contrôles');
    toast.success("Contrôles initialisés: Z (avancer), S (reculer), Q/D (direction)");
    
    // Souscription aux mises à jour de l'API de physique
    const unsubscribeVelocity = api.velocity.subscribe((v) => {
      velocity.current = v;
    });
    
    const unsubscribePosition = api.position.subscribe((p) => {
      position.current = p;
      onPositionChange?.(p);
    });
    
    const unsubscribeRotation = api.rotation.subscribe((r) => {
      rotation.current = r;
      onRotationChange?.(r);
    });
    
    // Fonction de gestion des touches appuyées
    const handleKeyDown = (event: KeyboardEvent) => {      
      switch (event.code) {
        case 'KeyZ':
          if (!keys.current.forward) {
            keys.current.forward = true;
            console.log('AVANCER - ON');
          }
          break;
        case 'KeyS':
          if (!keys.current.backward) {
            keys.current.backward = true;
            console.log('RECULER - ON');
          }
          break;
        case 'KeyQ':
          if (!keys.current.left) {
            keys.current.left = true;
            console.log('GAUCHE - ON');
          }
          break;
        case 'KeyD':
          if (!keys.current.right) {
            keys.current.right = true;
            console.log('DROITE - ON');
          }
          break;
        case 'ShiftLeft':
        case 'ShiftRight':
          if (!keys.current.drift) {
            keys.current.drift = true;
            console.log('DRIFT - ON');
          }
          break;
        case 'Space':
          event.preventDefault();
          if (!keys.current.handbrake) {
            keys.current.handbrake = true;
            console.log('FREIN À MAIN - ON');
          }
          break;
        case 'KeyB':
          setDebugMode(!debugMode);
          console.log(`Mode debug ${!debugMode ? 'activé' : 'désactivé'}`);
          break;
      }
    };

    // Fonction de gestion des touches relâchées
    const handleKeyUp = (event: KeyboardEvent) => {
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
          keys.current.handbrake = false;
          console.log('FREIN À MAIN - OFF');
          break;
      }
    };

    // Ajouter les écouteurs d'événements
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    
    toast.info("Utilisez Z, Q, S, D pour conduire");
    
    return () => {
      // Nettoyage
      unsubscribeVelocity();
      unsubscribePosition();
      unsubscribeRotation();
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [api, debugMode, onPositionChange, onRotationChange]);

  // Frame update pour la physique et les mouvements
  useFrame(() => {
    // Calcul de la vitesse actuelle
    const speed = Math.sqrt(velocity.current[0] ** 2 + velocity.current[2] ** 2);
    updateSpeed(Math.round(speed * 3.6)); // Convertir en km/h

    // Paramètres de conduite optimisés
    const motorForce = 15000; // Force du moteur augmentée
    const brakeForce = 20000; // Force de freinage
    const handbrakeForce = 30000; // Force du frein à main
    const maxSpeed = 120; // Vitesse maximale
    const steeringStrength = 3000; // Force de direction

    // Direction actuelle de la voiture
    const carRotationY = rotation.current[1];
    const forwardDirection = new Vector3(Math.sin(carRotationY), 0, Math.cos(carRotationY));
    const rightDirection = new Vector3(Math.cos(carRotationY), 0, -Math.sin(carRotationY));

    // Acceleration (Z)
    if (keys.current.forward && speed < maxSpeed) {
      const force = forwardDirection.multiplyScalar(-motorForce);
      api.applyForce([force.x, 0, force.z], [0, 0, 0]);
      
      if (debugMode) {
        console.log('Force appliquée:', force, 'Vitesse:', Math.round(speed * 3.6));
      }
    }

    // Freinage / Marche arrière (S)
    if (keys.current.backward) {
      if (speed > 1) {
        // Freinage si on avance
        const brakeForceVec = forwardDirection.multiplyScalar(brakeForce);
        api.applyForce([brakeForceVec.x, 0, brakeForceVec.z], [0, 0, 0]);
      } else {
        // Marche arrière si on est presque arrêté
        const reverseForce = forwardDirection.multiplyScalar(motorForce * 0.7);
        api.applyForce([reverseForce.x, 0, reverseForce.z], [0, 0, 0]);
      }
    }

    // Direction (Q et D) - amélioration de la réactivité
    const speedBasedSteering = Math.min(speed + 5, 25) / 25; // Minimum de réactivité
    const steeringForce = steeringStrength * speedBasedSteering;
    
    if (keys.current.left && speed > 0.1) {
      api.applyTorque([0, steeringForce, 0]);
      
      // Effet de drift
      if (keys.current.drift && speed > 10) {
        const driftForce = rightDirection.multiplyScalar(5000);
        api.applyForce([driftForce.x, 0, driftForce.z], [0, 0, 0]);
      }
    }
    
    if (keys.current.right && speed > 0.1) {
      api.applyTorque([0, -steeringForce, 0]);
      
      // Effet de drift
      if (keys.current.drift && speed > 10) {
        const driftForce = rightDirection.multiplyScalar(-5000);
        api.applyForce([driftForce.x, 0, driftForce.z], [0, 0, 0]);
      }
    }

    // Frein à main (Espace)
    if (keys.current.handbrake && speed > 0.5) {
      const handbrakeForceVec = new Vector3(
        -velocity.current[0] * handbrakeForce,
        0,
        -velocity.current[2] * handbrakeForce
      );
      api.applyForce([handbrakeForceVec.x, 0, handbrakeForceVec.z], [0, 0, 0]);
      
      // Effet de dérapage
      if (speed > 5) {
        const spinForce = 1500 * (Math.random() * 0.4 + 0.8);
        api.applyTorque([0, (Math.random() > 0.5 ? 1 : -1) * spinForce, 0]);
      }
    }

    // Résistance et stabilisation améliorées
    if (speed > 0.1) {
      const dragCoefficient = 0.3 + (keys.current.handbrake ? 1.5 : 0);
      const resistance = Math.min(speed * 100, 2000);
      const resistanceForce = new Vector3(
        -velocity.current[0] * dragCoefficient * resistance,
        0,
        -velocity.current[2] * dragCoefficient * resistance
      );
      api.applyForce([resistanceForce.x, 0, resistanceForce.z], [0, 0, 0]);
    }

    // Stabilisation anti-basculement renforcée
    if (Math.abs(rotation.current[0]) > 0.15 || Math.abs(rotation.current[2]) > 0.15) {
      api.applyTorque([
        -rotation.current[0] * 12000,
        0,
        -rotation.current[2] * 12000
      ]);
    }

    // Animation des roues améliorée
    if (wheelRefs.current && wheelRefs.current.length > 0) {
      const wheelSpeed = speed * 0.3;
      
      // Angle de direction pour les roues avant
      let steerAngle = 0;
      if (keys.current.left) steerAngle = 0.4;
      if (keys.current.right) steerAngle = -0.4;
      
      // Roues avant (0 et 1) - direction
      if (wheelRefs.current[0]) wheelRefs.current[0].rotation.y = steerAngle;
      if (wheelRefs.current[1]) wheelRefs.current[1].rotation.y = steerAngle;
      
      // Toutes les roues - rotation
      wheelRefs.current.forEach(wheel => {
        if (wheel) {
          const rotationSpeed = keys.current.forward ? -wheelSpeed : keys.current.backward ? wheelSpeed : 0;
          wheel.rotation.x += rotationSpeed;
        }
      });
    }

    // Effets visuels pour la carrosserie
    if (carGroupRef.current) {
      const speedFactor = Math.min(speed / 20, 1);
      const turnFactor = (keys.current.left ? -1 : keys.current.right ? 1 : 0) * speedFactor * 0.08;
      
      // Inclinaison en virage
      carGroupRef.current.rotation.z = -turnFactor;
      
      // Inclinaison lors de l'accélération/freinage
      if (keys.current.forward) {
        carGroupRef.current.rotation.x = -speedFactor * 0.03;
      } else if (keys.current.backward) {
        carGroupRef.current.rotation.x = speedFactor * 0.08;
      } else {
        carGroupRef.current.rotation.x *= 0.9;
      }
    }
  });

  // Référence pour les roues
  const setWheelRef = (index: number) => (el: Mesh) => {
    if (el) {
      wheelRefs.current[index] = el;
    }
  };

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
          emissive="#FF6B35"
          emissiveIntensity={0.1}
        />
        
        {/* Vitres (toit) */}
        <mesh position={[0, 0.6, 0]} castShadow>
          <boxGeometry args={[2, 0.4, 3]} />
          <meshPhysicalMaterial 
            color="#111111"
            metalness={0.5}
            roughness={0.3}
            clearcoat={1.0} 
            opacity={0.8}
            transparent={true}
          />
        </mesh>
        
        {/* Roues avec référence pour l'animation */}
        {[
          [-1, -0.3, 1.5], // Roue avant gauche
          [1, -0.3, 1.5],  // Roue avant droite
          [-1, -0.3, -1.5], // Roue arrière gauche
          [1, -0.3, -1.5]   // Roue arrière droite
        ].map((wheel, i) => (
          <mesh 
            key={i} 
            ref={setWheelRef(i)}
            position={wheel as [number, number, number]} 
            rotation={[Math.PI / 2, 0, 0]} 
            castShadow
          >
            <cylinderGeometry args={[0.4, 0.4, 0.3, 16]} />
            <meshStandardMaterial color="#1a1a1a" roughness={0.6} />
          </mesh>
        ))}
        
        {/* Phares avant plus lumineux */}
        <mesh position={[0.8, 0.2, -2.3]}>
          <sphereGeometry args={[0.15]} />
          <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={2} />
        </mesh>
        <mesh position={[-0.8, 0.2, -2.3]}>
          <sphereGeometry args={[0.15]} />
          <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={2} />
        </mesh>
        
        {/* Feux arrière */}
        <mesh position={[0.8, 0.1, 2.3]}>
          <sphereGeometry args={[0.12]} />
          <meshStandardMaterial color="#ff0000" emissive="#ff0000" emissiveIntensity={1} />
        </mesh>
        <mesh position={[-0.8, 0.1, 2.3]}>
          <sphereGeometry args={[0.12]} />
          <meshStandardMaterial color="#ff0000" emissive="#ff0000" emissiveIntensity={1} />
        </mesh>
        
        {/* Bandes de néon sous la voiture */}
        <mesh position={[0, -0.5, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <planeGeometry args={[2, 4]} />
          <meshStandardMaterial 
            color="#00ffff" 
            emissive="#00ffff" 
            emissiveIntensity={0.7}
            transparent={true}
            opacity={0.7}
          />
        </mesh>
      </mesh>
    </group>
  );
};
