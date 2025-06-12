
import { Canvas } from '@react-three/fiber';
import { Physics } from '@react-three/cannon';
import { Suspense } from 'react';
import { Scene } from '../components/game/Scene';
import { AdvancedCar } from '../components/game/AdvancedCar';
import { AdvancedTrack } from '../components/game/AdvancedTrack';
import { AdvancedLighting } from '../components/game/AdvancedLighting';
import { AdvancedEffects } from '../components/game/AdvancedEffects';
import { ParticleSystem } from '../components/game/ParticleSystem';
import { HUD } from '../components/game/HUD';
import { GameProvider } from '../contexts/GameContext';

const Game = () => {
  return (
    <GameProvider>
      <div className="w-full h-screen bg-black relative overflow-hidden">
        <Canvas
          camera={{ 
            position: [0, 8, 15], 
            fov: 70,
            near: 0.1,
            far: 1000 
          }}
          shadows={{
            enabled: true,
            type: 'PCFSoftShadows',
          }}
          gl={{
            antialias: true,
            alpha: false,
            powerPreference: 'high-performance',
            physicallyCorrectLights: true,
            toneMapping: 2, // ACESFilmicToneMapping
            toneMappingExposure: 1.2,
          }}
          className="bg-gradient-to-b from-blue-900 via-purple-900 to-black"
        >
          <Suspense fallback={null}>
            <Physics 
              gravity={[0, -30, 0]}
              defaultContactMaterial={{
                friction: 0.8,
                restitution: 0.2,
              }}
              broadphase="SAP"
            >
              <AdvancedLighting />
              <Scene />
              <AdvancedTrack />
              <AdvancedCar />
              <ParticleSystem carPosition={[0, 2, 0]} />
            </Physics>
            
            <AdvancedEffects />
          </Suspense>
        </Canvas>
        
        <HUD />
      </div>
    </GameProvider>
  );
};

export default Game;
