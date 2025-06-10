
import { usePlane } from '@react-three/cannon';

export const Track = () => {
  const [ref] = usePlane(() => ({
    rotation: [-Math.PI / 2, 0, 0],
    position: [0, 0, 0],
  }));

  return (
    <group>
      {/* Ground */}
      <mesh ref={ref} receiveShadow>
        <planeGeometry args={[100, 100]} />
        <meshStandardMaterial 
          color="#000011" 
          emissive="#000033" 
          emissiveIntensity={0.1}
          roughness={0.8}
        />
      </mesh>

      {/* Track borders with neon glow */}
      {Array.from({ length: 20 }, (_, i) => (
        <group key={i}>
          <mesh position={[15, 0.5, (i - 10) * 5]}>
            <boxGeometry args={[0.2, 1, 0.2]} />
            <meshStandardMaterial 
              color="#ff00ff" 
              emissive="#ff00ff" 
              emissiveIntensity={0.8} 
            />
          </mesh>
          <mesh position={[-15, 0.5, (i - 10) * 5]}>
            <boxGeometry args={[0.2, 1, 0.2]} />
            <meshStandardMaterial 
              color="#ff00ff" 
              emissive="#ff00ff" 
              emissiveIntensity={0.8} 
            />
          </mesh>
        </group>
      ))}

      {/* Neon track lines */}
      <mesh position={[0, 0.01, 0]}>
        <planeGeometry args={[2, 100]} />
        <meshStandardMaterial 
          color="#00ffff" 
          emissive="#00ffff" 
          emissiveIntensity={0.3}
          transparent
          opacity={0.7}
        />
      </mesh>
    </group>
  );
};
