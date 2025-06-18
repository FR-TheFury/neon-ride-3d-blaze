
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
import { EffectComposer, Bloom, ChromaticAberration, Noise } from '@react-three/postprocessing';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

// Extend Three.js elements for react-three-fiber
extend(THREE);

const Game = () => {
  const navigate = useNavigate();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const carPosition = useRef<[number, number, number]>([0, 1, 0]);
  const carRotation = useRef<[number, number, number]>([0, 0, 0]);
  const [paused, setPaused] = useState(false);
  const [loading, setLoading] = useState(true);
  const [highQuality, setHighQuality] = useState(false);

  useEffect(() => {
    const loadingTimeout = setTimeout(() => {
      setLoading(false);
      toast.success("Jeu chargé! Prêt à rouler!");
      
      // Forcez le focus sur le canvas pour que les contrôles fonctionnent
      const forceFocus = () => {
        if (canvasRef.current) {
          canvasRef.current.focus();
          console.log("Focus forcé sur le canvas");
        }
      };
      setTimeout(forceFocus, 100);
    }, 1500);
    
    return () => clearTimeout(loadingTimeout);
  }, []);

  useEffect(() => {
    console.log('Game: Configuration des contrôles');
    
    // Focus sur le canvas pour les contrôles clavier
    const forceFocus = () => {
      if (canvasRef.current) {
        canvasRef.current.focus();
      }
    };

    setTimeout(forceFocus, 100);
    
    const handleClick = () => {
      forceFocus();
      // Si le jeu est en pause, reprenez-le
      if (paused) {
        setPaused(false);
        toast.info("Jeu repris");
      }
    };
    
    document.addEventListener('click', handleClick);
    
    // Gérer la touche Échap pour mettre en pause
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setPaused(!paused);
        toast.info(paused ? "Jeu repris" : "Jeu en pause");
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    
    return () => {
      document.removeEventListener('click', handleClick);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [paused]);

  const toggleQuality = () => {
    setHighQuality(!highQuality);
    toast.info(highQuality ? "Qualité standard activée" : "Haute qualité activée");
  };

  return (
    <GameProvider>
      <div className="w-full h-screen bg-black relative overflow-hidden">
        {/* Loading screen */}
        {loading && (
          <div className="absolute inset-0 z-50 bg-black flex flex-col items-center justify-center">
            <div className="text-5xl font-bold text-cyan-400 mb-8 animate-pulse">NEON RIDE</div>
            <div className="w-64 h-2 bg-gray-800 rounded-full">
              <div className="h-full bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full animate-[slide-right_1.5s_ease-in-out]"></div>
            </div>
            <div className="mt-4 text-cyan-300 text-sm">Chargement des modules physiques...</div>
          </div>
        )}
        
        {/* Pause menu */}
        {paused && (
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
                onClick={toggleQuality}
              >
                {highQuality ? "Qualité standard" : "Haute qualité"}
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
          <color attach="background" args={["#050510"]} />
          <fog attach="fog" args={["#070720", 30, 90]} />
          
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
                carPosition={carPosition.current} 
                carRotation={carRotation.current}
              />
              <ParticleSystem carPosition={carPosition.current} />
            </Physics>
            
            {/* Post-processing effects for visual enhancement */}
            {(!paused && !loading) && (
              <EffectComposer>
                <Bloom 
                  intensity={1.0} 
                  luminanceThreshold={0.2} 
                  luminanceSmoothing={0.9} 
                />
                {highQuality && (
                  <>
                    <ChromaticAberration offset={[0.002, 0.002]} />
                    <Noise opacity={0.05} />
                  </>
                )}
              </EffectComposer>
            )}
          </Suspense>
        </Canvas>
        
        {/* HUD components */}
        {!loading && !paused && <HUD />}
        
        {/* Vignette effect overlay */}
        <div className="absolute inset-0 pointer-events-none bg-radial-gradient from-transparent to-black opacity-50"></div>
        
        {/* Scan lines effect */}
        <div className="absolute inset-0 pointer-events-none bg-scanlines opacity-10"></div>
      </div>
    </GameProvider>
  );
};

export default Game;
