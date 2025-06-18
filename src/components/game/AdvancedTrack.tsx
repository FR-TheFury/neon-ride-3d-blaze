
import { usePlane, useBox } from '@react-three/cannon';
import { Mesh } from 'three';

export const AdvancedTrack = () => {
  const [groundRef] = usePlane(() => ({
    rotation: [-Math.PI / 2, 0, 0],
    position: [0, 0, 0],
  }));

  return (
    <group>
      {/* Main track surface */}
      <mesh ref={groundRef as React.Ref<Mesh>} receiveShadow>
        <planeGeometry args={[200, 200]} />
        <meshStandardMaterial 
          color="#1a1a1a"
          roughness={0.8}
          metalness={0.1}
        />
      </mesh>

      {/* Track barriers with realistic materials */}
      {Array.from({ length: 40 }, (_, i) => {
        const angle = (i / 40) * Math.PI * 2;
        const radius = 35;
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;
        
        return (
          <Barrier key={i} position={[x, 1, z]} rotation={[0, angle + Math.PI / 2, 0]} />
        );
      })}

      {/* Grandstands */}
      {Array.from({ length: 8 }, (_, i) => {
        const angle = (i / 8) * Math.PI * 2;
        const radius = 60;
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;
        
        return (
          <Grandstand key={i} position={[x, 5, z]} rotation={[0, angle + Math.PI, 0]} />
        );
      })}

      {/* Racing line */}
      <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[28, 32, 64]} />
        <meshStandardMaterial 
          color="#ffffff" 
          transparent
          opacity={0.3}
          emissive="#ffffff"
          emissiveIntensity={0.1}
        />
      </mesh>

      {/* Start/Finish line */}
      <mesh position={[30, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[8, 2]} />
        <meshStandardMaterial 
          color="#ffffff"
          emissive="#ffffff"
          emissiveIntensity={0.5}
        />
      </mesh>
    </group>
  );
};

const Barrier = ({ position, rotation }: { position: [number, number, number], rotation: [number, number, number] }) => {
  const [ref] = useBox(() => ({
    position,
    rotation,
    args: [0.5, 2, 6],
    type: 'Static',
  }));

  return (
    <mesh ref={ref as React.Ref<Mesh>} castShadow receiveShadow>
      <boxGeometry args={[0.5, 2, 6]} />
      <meshStandardMaterial 
        color="#ff0000"
        emissive="#ff0000"
        emissiveIntensity={0.2}
        roughness={0.8}
        metalness={0.1}
      />
      
      {/* Reflective strips */}
      <mesh position={[0.26, 0, 0]}>
        <boxGeometry args={[0.02, 0.3, 5]} />
        <meshStandardMaterial 
          color="#ffffff"
          emissive="#ffffff"
          emissiveIntensity={0.8}
        />
      </mesh>
    </mesh>
  );
};

const Grandstand = ({ position, rotation }: { position: [number, number, number], rotation: [number, number, number] }) => {
  return (
    <group position={position} rotation={rotation}>
      {/* Main structure */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[20, 8, 6]} />
        <meshStandardMaterial color="#2a2a2a" roughness={0.7} metalness={0.3} />
      </mesh>
      
      {/* Seats */}
      {Array.from({ length: 5 }, (_, row) => (
        <mesh key={row} position={[0, 2 + row * 1.2, 2 - row * 0.8]} castShadow>
          <boxGeometry args={[18, 0.5, 1]} />
          <meshStandardMaterial color="#1e40af" roughness={0.6} />
        </mesh>
      ))}
    </group>
  );
};
