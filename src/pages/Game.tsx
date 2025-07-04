
import { Canvas } from '@react-three/fiber';
import { Physics } from '@react-three/cannon';
import { Suspense, useEffect, useRef, useState } from 'react';
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
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

extend(THREE);

const Game = () => {
  const navigate = useNavigate();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const carPosition = useRef<[number, number, number]>([0, 2, 0]);
  const carRotation = useRef<[number, number, number]>([0, 0, 0]);
  const [paused, setPaused] = useState(false);
  const [loading, setLoading] = useState(true);
  const [gameReady, setGameReady] = useState(false);

  const handleCarPositionChange = (position: [number, number, number]) => {
    carPosition.current = position;
  };

  const handleCarRotationChange = (rotation: [number, number, number]) => {
    carRotation.current = rotation;
  };

  useEffect(() => {
    console.log('Game: Initialisation du jeu');
    const loadingTimeout = setTimeout(() => {
      setLoading(false);
      setGameReady(true);
      toast.success("Jeu prêt! Contrôles: Z/S/Q/D + Shift/Espace");
    }, 2000);
    
    return () => clearTimeout(loadingTimeout);
  }, []);

  useEffect(() => {
    // Gestion de la pause avec Échap (seulement si le jeu est prêt)
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && gameReady) {
        setPaused(!paused);
        toast.info(paused ? "Jeu repris" : "Jeu en pause");
      }
    };
    
    if (gameReady) {
      window.addEventListener('keydown', handleKeyDown);
    }
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [paused, gameReady]);

  // Focus sur la page pour assurer les contrôles
  useEffect(() => {
    if (gameReady && !loading) {
      document.body.focus();
      console.log('Game: Focus activé pour les contrôles');
    }
  }, [gameReady, loading]);

  return (
    <GameProvider>
      <div className="w-full h-screen bg-black relative overflow-hidden">
        {/* Loading screen */}
        {loading && (
          <div className="absolute inset-0 z-50 bg-black flex flex-col items-center justify-center">
            <div className="text-5xl font-bold text-cyan-400 mb-8 animate-pulse">NEON RIDE</div>
            <div className="w-64 h-2 bg-gray-800 rounded-full">
              <div className="h-full bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full animate-[slide-right_2s_ease-in-out]"></div>
            </div>
            <div className="mt-4 text-cyan-300 text-sm">Chargement des contrôles Z/S/Q/D...</div>
          </div>
        )}
        
        {/* Pause menu */}
        {paused && gameReady && (
          <div className="absolute inset-0 z-40 bg-black/80 backdrop-blur-md flex flex-col items-center justify-center">
            <div className="text-5xl font-bold text-cyan-400 mb-8">PAUSE</div>
            
            <div className="flex flex-col gap-4 w-64">
              <Button 
                className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-400 hover:to-purple-400 text-white"
                onClick={() => setPaused(false)}
              >
                Reprendre
              </Button>
              
              <Button 
                variant="outline" 
                className="border-cyan-500 text-cyan-400 hover:bg-cyan-950"
                onClick={() => navigate('/settings')}
              >
                Paramètres
              </Button>
              
              <Button 
                variant="outline" 
                className="border-red-500 text-red-400 hover:bg-red-950 mt-4"
                onClick={() => navigate('/')}
              >
                Quitter
              </Button>
            </div>
          </div>
        )}
        
        {/* Canvas principal */}
        {gameReady && (
          <Canvas
            ref={canvasRef}
            shadows
            gl={{
              antialias: true,
              alpha: false,
              powerPreference: 'high-performance',
            }}
            className="bg-gradient-to-b from-blue-900 via-purple-900 to-black"
          >
            <color attach="background" args={["#050510"]} />
            <fog attach="fog" args={["#070720", 30, 90]} />
            
            <Suspense fallback={null}>
              <Physics 
                gravity={[0, -9.8, 0]}
                defaultContactMaterial={{
                  friction: 0.7,
                  restitution: 0.1,
                }}
                broadphase="SAP"
              >
                <AdvancedLighting />
                <Scene />
                <AdvancedTrack />
                <RealisticCar 
                  onPositionChange={handleCarPositionChange}
                  onRotationChange={handleCarRotationChange}
                />
                <CameraController 
                  carPosition={carPosition.current} 
                  carRotation={carRotation.current}
                />
                <ParticleSystem carPosition={carPosition.current} />
              </Physics>
            </Suspense>
          </Canvas>
        )}
        
        {/* HUD */}
        {gameReady && !loading && !paused && <HUD />}
        
        {/* Effets visuels */}
        <div className="absolute inset-0 pointer-events-none bg-radial-gradient from-transparent to-black opacity-50"></div>
      </div>
    </GameProvider>
  );
};

export default Game;
