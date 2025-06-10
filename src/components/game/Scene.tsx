
import { Stars } from '@react-three/drei';

export const Scene = () => {
  return (
    <>
      <Stars 
        radius={300} 
        depth={60} 
        count={1000} 
        factor={7} 
        saturation={0} 
        fade 
        speed={0.5}
      />
      
      {/* Futuristic buildings/structures */}
      {Array.from({ length: 8 }, (_, i) => (
        <mesh 
          key={i} 
          position={[
            (Math.random() - 0.5) * 200, 
            Math.random() * 20 + 10, 
            (Math.random() - 0.5) * 200
          ]}
        >
          <boxGeometry args={[
            Math.random() * 5 + 2, 
            Math.random() * 30 + 10, 
            Math.random() * 5 + 2
          ]} />
          <meshStandardMaterial 
            color="#001122" 
            emissive={`hsl(${Math.random() * 360}, 70%, 30%)`} 
            emissiveIntensity={0.2}
          />
        </mesh>
      ))}
    </>
  );
};
