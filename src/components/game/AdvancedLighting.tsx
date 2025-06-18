
import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export const AdvancedLighting = () => {
  const sunRef = useRef<THREE.DirectionalLight>(null);
  
  useFrame((state) => {
    if (sunRef.current) {
      const time = state.clock.elapsedTime * 0.1;
      sunRef.current.position.x = Math.cos(time) * 50;
      sunRef.current.position.z = Math.sin(time) * 50;
      sunRef.current.intensity = Math.max(0.3, Math.sin(time * 0.5) + 0.5);
    }
  });

  return (
    <>
      {/* HDR Environment lighting */}
      <ambientLight intensity={0.3} color="#87CEEB" />
      
      {/* Dynamic sun */}
      <directionalLight
        ref={sunRef}
        position={[50, 50, 0]}
        intensity={1.5}
        color="#FFF8DC"
        castShadow
      />
      
      {/* Track lighting */}
      <spotLight
        position={[0, 20, 0]}
        angle={Math.PI / 3}
        penumbra={0.5}
        intensity={2}
        color="#ffffff"
        castShadow
      />
      
      {/* Stadium lights */}
      {Array.from({ length: 8 }, (_, i) => {
        const angle = (i / 8) * Math.PI * 2;
        return (
          <spotLight
            key={i}
            position={[Math.cos(angle) * 40, 25, Math.sin(angle) * 40]}
            angle={Math.PI / 4}
            penumbra={0.3}
            intensity={1.5}
            color="#FFE4B5"
          />
        );
      })}
    </>
  );
};
