
import { useRef, useEffect, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { useBox } from '@react-three/cannon';
import { Vector3, Mesh, Group, Euler } from 'three';
import { useGame } from '../../contexts/GameContext';
import { toast } from 'sonner';

export const RealisticCar = () => {
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

  // Fonction pour afficher des logs de débug
  const debugLog = (message: string, data?: any) => {
    if (debugMode) {
      if (data) {
        console.log(`DEBUG: ${message}`, data);
      } else {
        console.log(`DEBUG: ${message}`);
      }
    }
  };

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
    });
    
    const unsubscribeRotation = api.rotation.subscribe((r) => {
      rotation.current = r;
    });
    
    // Fonction de gestion des touches appuyées
    const handleKeyDown = (event: KeyboardEvent) => {
      event.preventDefault();
      
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
          keys.current.handbrake = true;
          console.log('FREIN À MAIN - ON');
          break;
        case 'KeyB': // Touche pour activer/désactiver le mode debug
          setDebugMode(!debugMode);
          console.log(`Mode debug ${!debugMode ? 'activé' : 'désactivé'}`);
          break;
      }

      // Debug: afficher toutes les touches actives
      console.log('Touches actives:', keys.current, 'Vitesse:', Math.round(Math.sqrt(velocity.current[0] ** 2 + velocity.current[2] ** 2) * 3.6), 'km/h');
    };

    // Fonction de gestion des touches relâchées
    const handleKeyUp = (event: KeyboardEvent) => {
      event.preventDefault();
      
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

      // Debug: afficher toutes les touches relâchées
      console.log('Touche relâchée:', event.code);
    };

    // Capture des événements sur window pour s'assurer qu'ils sont toujours détectés
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    
    // Toast d'information
    toast.info("Utilisez Z, Q, S, D pour conduire");
    
    return () => {
      // Nettoyage des abonnements et événements
      unsubscribeVelocity();
      unsubscribePosition();
      unsubscribeRotation();
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [api, debugMode]);

  // Frame update pour la physique et les mouvements
  useFrame(() => {
    // Calcul de la vitesse actuelle
    const speed = Math.sqrt(velocity.current[0] ** 2 + velocity.current[2] ** 2);
    updateSpeed(Math.round(speed * 3.6)); // Convertir en km/h

    // Paramètres de conduite - Plus de force pour des mouvements plus visibles
    const motorForce = 10000; // Force du moteur 
    const brakeForce = 15000; // Force de freinage
    const handbrakeForce = 25000; // Force du frein à main
    const maxSpeed = 100; // Vitesse maximale
    const steeringStrength = 2000; // Force de direction

    // Direction actuelle de la voiture
    const carRotationY = rotation.current[1];
    const forwardDirection = new Vector3(Math.sin(carRotationY), 0, Math.cos(carRotationY));
    const rightDirection = new Vector3(Math.cos(carRotationY), 0, -Math.sin(carRotationY));

    // Acceleration (Z)
    if (keys.current.forward && speed < maxSpeed) {
      const force = forwardDirection.multiplyScalar(-motorForce);
      api.applyForce([force.x, 0, force.z], [0, 0, 0]);
      debugLog('Accélération appliquée', force);
    }

    // Freinage / Marche arrière (S)
    if (keys.current.backward) {
      if (speed > 1) {
        // Freinage si on avance
        const brakeForceVec = forwardDirection.multiplyScalar(brakeForce);
        api.applyForce([brakeForceVec.x, 0, brakeForceVec.z], [0, 0, 0]);
        debugLog('Freinage appliqué');
      } else {
        // Marche arrière si on est presque arrêté
        const reverseForce = forwardDirection.multiplyScalar(motorForce * 0.6);
        api.applyForce([reverseForce.x, 0, reverseForce.z], [0, 0, 0]);
        debugLog('Marche arrière appliquée');
      }
    }

    // Direction (Q et D) - direction plus réactive
    const steeringForce = steeringStrength * Math.min(speed, 20) / 10;
    
    if (keys.current.left && speed > 0.1) {
      api.applyTorque([0, steeringForce, 0]);
      debugLog('Virage à gauche appliqué', steeringForce);
      
      // Effet de drift
      if (keys.current.drift && speed > 10) {
        const driftForce = rightDirection.multiplyScalar(4000);
        api.applyForce([driftForce.x, 0, driftForce.z], [0, 0, 0]);
        debugLog('Drift gauche appliqué');
      }
    }
    
    if (keys.current.right && speed > 0.1) {
      api.applyTorque([0, -steeringForce, 0]);
      debugLog('Virage à droite appliqué', -steeringForce);
      
      // Effet de drift
      if (keys.current.drift && speed > 10) {
        const driftForce = rightDirection.multiplyScalar(-4000);
        api.applyForce([driftForce.x, 0, driftForce.z], [0, 0, 0]);
        debugLog('Drift droite appliqué');
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
      debugLog('Frein à main appliqué');
      
      // Effet de dérapage plus prononcé
      if (speed > 5) {
        const spinForce = 1000 * (Math.random() * 0.4 + 0.8);
        api.applyTorque([0, (Math.random() > 0.5 ? 1 : -1) * spinForce, 0]);
      }
    }

    // Résistance de l'air et du sol
    if (speed > 0.1) {
      const dragCoefficient = 0.5 + (keys.current.handbrake ? 1 : 0);
      const resistanceForce = new Vector3(
        -velocity.current[0] * dragCoefficient * speed,
        0,
        -velocity.current[2] * dragCoefficient * speed
      );
      api.applyForce([resistanceForce.x, 0, resistanceForce.z], [0, 0, 0]);
    }

    // Stabilisation anti-basculement
    if (Math.abs(rotation.current[0]) > 0.2 || Math.abs(rotation.current[2]) > 0.2) {
      api.applyTorque([
        -rotation.current[0] * 8000,
        0,
        -rotation.current[2] * 8000
      ]);
      debugLog('Stabilisation appliquée');
    }

    // Animation des roues
    if (wheelRefs.current && wheelRefs.current.length > 0) {
      const wheelSpeed = speed * 0.5;
      
      // Roues avant
      const steerAngle = (keys.current.left ? 0.3 : keys.current.right ? -0.3 : 0);
      
      // Roues avant gauche et droite - direction
      if (wheelRefs.current[0]) wheelRefs.current[0].rotation.y = steerAngle;
      if (wheelRefs.current[1]) wheelRefs.current[1].rotation.y = steerAngle;
      
      // Toutes les roues - rotation
      wheelRefs.current.forEach(wheel => {
        if (wheel) {
          wheel.rotation.x += keys.current.forward ? -wheelSpeed : keys.current.backward ? wheelSpeed : 0;
        }
      });
    }

    // Effets visuels pour la carrosserie
    if (carGroupRef.current) {
      const speedFactor = Math.min(speed / 20, 1);
      const turnFactor = (keys.current.left ? -1 : keys.current.right ? 1 : 0) * speedFactor * 0.1;
      
      // Inclinaison en virage
      carGroupRef.current.rotation.z = -turnFactor;
      
      // Inclinaison lors de l'accélération/freinage
      if (keys.current.forward) {
        carGroupRef.current.rotation.x = -speedFactor * 0.05;
      } else if (keys.current.backward) {
        carGroupRef.current.rotation.x = speedFactor * 0.1;
      } else {
        carGroupRef.current.rotation.x *= 0.8;
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
          emissive="#FF6B3520"
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
