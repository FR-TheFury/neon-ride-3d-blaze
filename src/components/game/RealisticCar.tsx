
import { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { useBox } from '@react-three/cannon';
import { Vector3, Mesh, Group } from 'three';
import { useGame } from '../../contexts/GameContext';
import { useKeyboardControls } from '../../hooks/useKeyboardControls';
import { toast } from 'sonner';

interface RealisticCarProps {
  onPositionChange?: (position: [number, number, number]) => void;
  onRotationChange?: (rotation: [number, number, number]) => void;
}

export const RealisticCar = ({ onPositionChange, onRotationChange }: RealisticCarProps) => {
  const { updateSpeed } = useGame();
  const carGroupRef = useRef<Group>(null);
  const wheelRefs = useRef<Mesh[]>([]);
  const keys = useKeyboardControls();
  
  const [ref, api] = useBox(() => ({
    mass: 1200,
    position: [0, 2, 0],
    args: [2.2, 0.8, 4.5],
    material: {
      friction: 0.3,
      restitution: 0.1,
    },
    allowSleep: false,
  }));

  const velocity = useRef<[number, number, number]>([0, 0, 0]);
  const position = useRef<[number, number, number]>([0, 2, 0]);
  const rotation = useRef<[number, number, number]>([0, 0, 0]);

  useEffect(() => {
    console.log('RealisticCar: Initialisation');
    toast.success("Voiture prête! Utilisez Z/S/Q/D pour conduire");
    
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
    
    return () => {
      unsubscribeVelocity();
      unsubscribePosition();
      unsubscribeRotation();
    };
  }, [api, onPositionChange, onRotationChange]);

  useFrame(() => {
    const speed = Math.sqrt(velocity.current[0] ** 2 + velocity.current[2] ** 2);
    updateSpeed(Math.round(speed * 3.6));

    // Paramètres de conduite
    const motorForce = 15000;
    const brakeForce = 20000;
    const handbrakeForce = 30000;
    const maxSpeed = 120;
    const steeringStrength = 3500;

    // Direction de la voiture
    const carRotationY = rotation.current[1];
    const forwardDirection = new Vector3(-Math.sin(carRotationY), 0, -Math.cos(carRotationY));
    const rightDirection = new Vector3(-Math.cos(carRotationY), 0, Math.sin(carRotationY));

    // Debug des contrôles actifs
    const activeControls = [];
    if (keys.current.forward) activeControls.push('Forward');
    if (keys.current.backward) activeControls.push('Backward');
    if (keys.current.left) activeControls.push('Left');
    if (keys.current.right) activeControls.push('Right');
    if (keys.current.drift) activeControls.push('Drift');
    if (keys.current.handbrake) activeControls.push('Handbrake');
    
    if (activeControls.length > 0) {
      console.log('Contrôles actifs:', activeControls.join(', '));
    }

    // Accélération (Z/W)
    if (keys.current.forward && speed < maxSpeed) {
      const force = forwardDirection.multiplyScalar(motorForce);
      api.applyForce([force.x, 0, force.z], [0, 0, 0]);
      console.log('Applying forward force:', force.x, force.z);
    }

    // Freinage / Marche arrière (S)
    if (keys.current.backward) {
      if (speed > 1) {
        const brakeForceVec = forwardDirection.multiplyScalar(-brakeForce);
        api.applyForce([brakeForceVec.x, 0, brakeForceVec.z], [0, 0, 0]);
        console.log('Applying brake force');
      } else {
        const reverseForce = forwardDirection.multiplyScalar(-motorForce * 0.5);
        api.applyForce([reverseForce.x, 0, reverseForce.z], [0, 0, 0]);
        console.log('Applying reverse force');
      }
    }

    // Direction (Q/A et D)
    const speedBasedSteering = Math.min(speed + 2, 15) / 15;
    const steeringForce = steeringStrength * speedBasedSteering;
    
    if (keys.current.left && speed > 0.1) {
      api.applyTorque([0, steeringForce, 0]);
      console.log('Turning left');
      
      if (keys.current.drift && speed > 5) {
        const driftForce = rightDirection.multiplyScalar(4000);
        api.applyForce([driftForce.x, 0, driftForce.z], [0, 0, 0]);
        console.log('Drifting left');
      }
    }
    
    if (keys.current.right && speed > 0.1) {
      api.applyTorque([0, -steeringForce, 0]);
      console.log('Turning right');
      
      if (keys.current.drift && speed > 5) {
        const driftForce = rightDirection.multiplyScalar(-4000);
        api.applyForce([driftForce.x, 0, driftForce.z], [0, 0, 0]);
        console.log('Drifting right');
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
      console.log('Handbrake active');
      
      if (speed > 5) {
        const spinForce = 1500 * (Math.random() * 0.8 + 0.6);
        api.applyTorque([0, (Math.random() > 0.5 ? 1 : -1) * spinForce, 0]);
      }
    }

    // Résistance naturelle améliorée
    if (speed > 0.1) {
      const dragCoefficient = 0.15 + (keys.current.handbrake ? 1.5 : 0);
      const resistance = Math.min(speed * 60, 1200);
      const resistanceForce = new Vector3(
        -velocity.current[0] * dragCoefficient * resistance,
        0,
        -velocity.current[2] * dragCoefficient * resistance
      );
      api.applyForce([resistanceForce.x, 0, resistanceForce.z], [0, 0, 0]);
    }

    // Stabilisation anti-basculement
    if (Math.abs(rotation.current[0]) > 0.1 || Math.abs(rotation.current[2]) > 0.1) {
      api.applyTorque([
        -rotation.current[0] * 12000,
        0,
        -rotation.current[2] * 12000
      ]);
    }

    // Animation des roues
    if (wheelRefs.current && wheelRefs.current.length > 0) {
      const wheelSpeed = speed * 0.2;
      
      let steerAngle = 0;
      if (keys.current.left) steerAngle = 0.3;
      if (keys.current.right) steerAngle = -0.3;
      
      // Roues avant - direction
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

    // Effets visuels de carrosserie
    if (carGroupRef.current) {
      const speedFactor = Math.min(speed / 20, 1);
      const turnFactor = (keys.current.left ? -1 : keys.current.right ? 1 : 0) * speedFactor * 0.05;
      
      carGroupRef.current.rotation.z = -turnFactor;
      
      if (keys.current.forward) {
        carGroupRef.current.rotation.x = -speedFactor * 0.02;
      } else if (keys.current.backward) {
        carGroupRef.current.rotation.x = speedFactor * 0.05;
      } else {
        carGroupRef.current.rotation.x *= 0.9;
      }
    }
  });

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
          emissiveIntensity={0.15}
        />
        
        {/* Vitres */}
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
        
        {/* Roues */}
        {[
          [-1, -0.3, 1.5], // Avant gauche
          [1, -0.3, 1.5],  // Avant droite
          [-1, -0.3, -1.5], // Arrière gauche
          [1, -0.3, -1.5]   // Arrière droite
        ].map((wheel, i) => (
          <mesh 
            key={i} 
            ref={setWheelRef(i)}
            position={wheel as [number, number, number]} 
            rotation={[Math.PI / 2, 0, 0]} 
            castShadow
          >
            <cylinderGeometry args={[0.4, 0.4, 0.3, 16]} />
            <meshStandardMaterial color="#1a1a1a" roughness={0.8} />
          </mesh>
        ))}
        
        {/* Phares avant */}
        <mesh position={[0.8, 0.2, -2.3]}>
          <sphereGeometry args={[0.15]} />
          <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={3} />
        </mesh>
        <mesh position={[-0.8, 0.2, -2.3]}>
          <sphereGeometry args={[0.15]} />
          <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={3} />
        </mesh>
        
        {/* Feux arrière */}
        <mesh position={[0.8, 0.1, 2.3]}>
          <sphereGeometry args={[0.12]} />
          <meshStandardMaterial color="#ff0000" emissive="#ff0000" emissiveIntensity={1.5} />
        </mesh>
        <mesh position={[-0.8, 0.1, 2.3]}>
          <sphereGeometry args={[0.12]} />
          <meshStandardMaterial color="#ff0000" emissive="#ff0000" emissiveIntensity={1.5} />
        </mesh>
        
        {/* Néons sous la voiture */}
        <mesh position={[0, -0.5, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <planeGeometry args={[2, 4]} />
          <meshStandardMaterial 
            color="#00ffff" 
            emissive="#00ffff" 
            emissiveIntensity={1.0}
            transparent={true}
            opacity={0.8}
          />
        </mesh>
      </mesh>
    </group>
  );
};
