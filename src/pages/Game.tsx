
import { Canvas } from '@react-three/fiber';
import { Physics } from '@react-three/cannon';
import { Suspense, useEffect, useRef } from 'react';
import { extend } from '@react-three/fiber';
import * as THREE from 'three';
import { Scene } from '../components/game/Scene';
import { RealisticCar } from '../components/game/RealisticCar';
import { CameraController } from '../components/game/CameraController';
import { AdvancedTrack } from '../components/game/AdvancedTrack';
import { AdvancedLighting } from '../components/game/AdvancedLighting';
import { ParticleSystem } from '../components/game/ParticleSystem';
import { HUD } from '../components/game/HUD';
import { GameProvider } from '../contexts/GameContext';

// Extend Three.js elements for react-three-fiber
extend(THREE);

const Game = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const carPosition = useRef([0, 1, 0]);
  const carRotation = useRef([0, 0, 0]);

  useEffect(() => {
    console.log('Game: Configuration des contrôles');
    
    // Focus sur le canvas pour les contrôles clavier
    const forceFocus = () => {
      if (canvasRef.current) {
        canvasRef.current.focus();
      }
    };

    setTimeout(forceFocus, 100);
    
    const handleClick = () => forceFocus();
    document.addEventListener('click', handleClick);
    
    return () => {
      document.removeEventListener('click', handleClick);
    };
  }, []);

  return (
    <GameProvider>
      <div className="w-full h-screen bg-black relative overflow-hidden">
        <div className="absolute top-2 left-2 z-20 text-white text-sm bg-black/50 p-2 rounded">
          <div><strong>Contrôles:</strong></div>
          <div>Z - Accélérer | S - Freiner/Reculer | Q - Gauche | D - Droite</div>
          <div>SHIFT - Drift | ESPACE - Frein à main</div>
        </div>
        
        <Canvas
          ref={canvasRef}
          tabIndex={0}
          shadows
          gl={{
            antialias: true,
            alpha: false,
            powerPreference: 'high-performance',
          }}
          className="bg-gradient-to-b from-blue-900 via-purple-900 to-black cursor-pointer"
          style={{ outline: 'none' }}
          onCreated={({ gl }) => {
            gl.domElement.setAttribute('tabindex', '0');
            setTimeout(() => gl.domElement.focus(), 200);
          }}
        >
          <Suspense fallback={null}>
            <Physics 
              gravity={[0, -9.8, 0]}
              defaultContactMaterial={{
                friction: 0.9,
                restitution: 0.1,
              }}
              broadphase="SAP"
            >
              <AdvancedLighting />
              <Scene />
              <AdvancedTrack />
              <RealisticCar />
              <CameraController 
                carPosition={carPosition.current as [number, number, number]} 
                carRotation={carRotation.current as [number, number, number]} 
              />
              <ParticleSystem carPosition={carPosition.current as [number, number, number]} />
            </Physics>
          </Suspense>
        </Canvas>
        
        <HUD />
      </div>
    </GameProvider>
  );
};

export default Game;
