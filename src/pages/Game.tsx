
import { Canvas } from '@react-three/fiber';
import { Physics } from '@react-three/cannon';
import { Suspense, useEffect, useRef } from 'react';
import { extend } from '@react-three/fiber';
import * as THREE from 'three';
import { Scene } from '../components/game/Scene';
import { AdvancedCar } from '../components/game/AdvancedCar';
import { AdvancedTrack } from '../components/game/AdvancedTrack';
import { AdvancedLighting } from '../components/game/AdvancedLighting';
import { ParticleSystem } from '../components/game/ParticleSystem';
import { HUD } from '../components/game/HUD';
import { GameProvider } from '../contexts/GameContext';

// Extend Three.js elements for react-three-fiber
extend(THREE);

const Game = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    // Focus the canvas for keyboard input
    const handleFocus = () => {
      if (canvasRef.current) {
        canvasRef.current.focus();
        console.log('Canvas focused for keyboard input');
      }
    };

    // Focus on mount and when clicking
    handleFocus();
    document.addEventListener('click', handleFocus);
    
    return () => {
      document.removeEventListener('click', handleFocus);
    };
  }, []);

  return (
    <GameProvider>
      <div className="w-full h-screen bg-black relative overflow-hidden">
        <Canvas
          ref={canvasRef}
          tabIndex={0}
          camera={{ 
            position: [0, 8, 15], 
            fov: 70,
            near: 0.1,
            far: 1000 
          }}
          shadows
          gl={{
            antialias: true,
            alpha: false,
            powerPreference: 'high-performance',
          }}
          className="bg-gradient-to-b from-blue-900 via-purple-900 to-black"
          style={{ outline: 'none' }}
        >
          <Suspense fallback={null}>
            <Physics 
              gravity={[0, -9.8, 0]}
              defaultContactMaterial={{
                friction: 1.2,
                restitution: 0.1,
              }}
              broadphase="SAP"
            >
              <AdvancedLighting />
              <Scene />
              <AdvancedTrack />
              <AdvancedCar />
              <ParticleSystem carPosition={[0, 2, 0]} />
            </Physics>
          </Suspense>
        </Canvas>
        
        <HUD />
      </div>
    </GameProvider>
  );
};

export default Game;
