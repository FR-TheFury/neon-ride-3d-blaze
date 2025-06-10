
import { Canvas, extend } from '@react-three/fiber';
import { Physics } from '@react-three/cannon';
import { EffectComposer, Bloom, Noise } from '@react-three/postprocessing';
import { Suspense } from 'react';
import * as THREE from 'three';
import { Scene } from '../components/game/Scene';
import { Car } from '../components/game/Car';
import { Track } from '../components/game/Track';
import { Lighting } from '../components/game/Lighting';
import { HUD } from '../components/game/HUD';
import { GameProvider } from '../contexts/GameContext';

// Extend the fiber catalog with Three.js objects
extend(THREE);

const Game = () => {
  return (
    <GameProvider>
      <div className="w-full h-screen bg-black relative overflow-hidden">
        <Canvas
          camera={{ 
            position: [0, 5, 10], 
            fov: 60,
            near: 0.1,
            far: 1000 
          }}
          shadows
          className="bg-gradient-to-b from-purple-900 via-blue-900 to-black"
        >
          <Suspense fallback={null}>
            <Physics 
              gravity={[0, -30, 0]}
              defaultContactMaterial={{
                friction: 0.4,
                restitution: 0.3,
              }}
            >
              <Lighting />
              <Scene />
              <Track />
              <Car />
            </Physics>
            
            <EffectComposer>
              <Bloom 
                intensity={2} 
                luminanceThreshold={0.1} 
                luminanceSmoothing={0.9} 
              />
              <Noise opacity={0.02} />
            </EffectComposer>
          </Suspense>
        </Canvas>
        
        <HUD />
      </div>
    </GameProvider>
  );
};

export default Game;
