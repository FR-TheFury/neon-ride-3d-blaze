
import { useState, useEffect } from 'react';
import { useGame } from '../../contexts/GameContext';
import { toast } from 'sonner';
import { Gauge, Flame, Clock, Flag, Trophy, ArrowRight } from 'lucide-react';

export const HUD = () => {
  const { gameState } = useGame();
  const [showControls, setShowControls] = useState(true);
  const [countdown, setCountdown] = useState<number | null>(null);

  useEffect(() => {
    // Afficher les commandes pendant 10 secondes
    const timer = setTimeout(() => {
      setShowControls(false);
    }, 10000);

    // Démarrer un compte à rebours
    let count = 3;
    setCountdown(count);
    
    const countdownTimer = setInterval(() => {
      count--;
      setCountdown(count);
      
      if (count <= 0) {
        clearInterval(countdownTimer);
        setCountdown(null);
        toast.success("GO!");
      } else {
        toast(count.toString());
      }
    }, 1000);
    
    return () => {
      clearTimeout(timer);
      clearInterval(countdownTimer);
    };
  }, []);

  // Toggle des contrôles
  const toggleControls = () => {
    setShowControls(!showControls);
    toast.info(showControls ? "Contrôles masqués" : "Contrôles affichés");
  };

  return (
    <div className="absolute inset-0 pointer-events-none z-10">
      {/* Compte à rebours de départ */}
      {countdown !== null && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-9xl font-bold text-white animate-pulse">
            {countdown === 0 ? "GO!" : countdown}
          </div>
        </div>
      )}
      
      {/* Speed indicator with gauge */}
      <div className="absolute top-4 left-4 bg-black/70 backdrop-blur-md border-l-4 border-cyan-400 rounded-lg p-4 text-cyan-400 font-mono shadow-lg shadow-cyan-500/20">
        <div className="flex items-center gap-2">
          <Gauge className="h-5 w-5" />
          <div className="text-xs opacity-70">VITESSE</div>
        </div>
        <div className="flex items-center">
          <div className="text-3xl font-bold">{gameState.speed}</div>
          <div className="text-xs mt-2 ml-1">KM/H</div>
        </div>
        
        {/* Speed bar */}
        <div className="mt-1 h-1 w-full bg-cyan-900/30 rounded-full overflow-hidden">
          <div 
            className="h-full bg-cyan-400"
            style={{ width: `${Math.min(gameState.speed, 200) / 2}%` }}
          />
        </div>
      </div>

      {/* Time and lap info */}
      <div className="absolute top-4 right-4 bg-black/70 backdrop-blur-md border-r-4 border-magenta-500 rounded-lg p-4 text-magenta-300 font-mono shadow-lg shadow-magenta-500/20">
        <div className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          <div className="text-xs opacity-70">TOUR {gameState.lap}</div>
        </div>
        <div className="text-2xl font-bold">
          {Math.floor(gameState.time / 60)}:{(gameState.time % 60).toString().padStart(2, '0')}
        </div>
        <div className="flex items-center gap-2 mt-1 text-xs opacity-80">
          <Trophy className="h-4 w-4" />
          <span>POSITION {gameState.position}/8</span>
        </div>
      </div>

      {/* Controls hint - with toggle button */}
      <div className={`absolute bottom-4 left-4 bg-black/70 backdrop-blur-md border-b-4 border-green-500 rounded-lg p-4 text-green-300 font-mono text-sm transition-all duration-300 ${showControls ? 'opacity-100' : 'opacity-0 translate-y-10'}`}>
        <div className="flex justify-between items-center mb-2">
          <span className="font-bold text-white flex items-center">
            <Flag className="h-4 w-4 mr-2" />
            CONTRÔLES
          </span>
          <button 
            onClick={toggleControls} 
            className="text-xs text-white/60 hover:text-white pointer-events-auto"
          >
            {showControls ? 'Masquer' : 'Afficher'}
          </button>
        </div>
        <div className="grid grid-cols-2 gap-x-4 gap-y-1">
          <div>
            <span className="inline-block w-6 h-6 bg-white/20 text-center rounded mr-2">Z</span> 
            <span>Accélérer</span>
          </div>
          <div>
            <span className="inline-block w-6 h-6 bg-white/20 text-center rounded mr-2">S</span> 
            <span>Freiner</span>
          </div>
          <div>
            <span className="inline-block w-6 h-6 bg-white/20 text-center rounded mr-2">Q</span> 
            <span>Gauche</span>
          </div>
          <div>
            <span className="inline-block w-6 h-6 bg-white/20 text-center rounded mr-2">D</span> 
            <span>Droite</span>
          </div>
          <div>
            <span className="inline-block w-14 h-6 bg-white/20 text-center rounded mr-2 text-xs flex items-center justify-center">SHIFT</span> 
            <span>Drift</span>
          </div>
          <div>
            <span className="inline-block w-14 h-6 bg-white/20 text-center rounded mr-2 text-xs flex items-center justify-center">ESPACE</span>
            <span>Frein à main</span>
          </div>
        </div>
      </div>

      {/* Mini-map / radar */}
      <div className="absolute bottom-4 right-4 bg-black/70 backdrop-blur-md rounded-full h-32 w-32 border border-cyan-400/50 overflow-hidden shadow-lg shadow-cyan-500/20">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="h-28 w-28 rounded-full border border-cyan-400/20"></div>
          <div className="h-20 w-20 rounded-full border border-cyan-400/20"></div>
          <div className="h-12 w-12 rounded-full border border-cyan-400/20"></div>
          <div className="absolute top-1/2 left-1/2 w-3 h-3 bg-cyan-400 rounded-full -translate-x-1/2 -translate-y-1/2 shadow-md shadow-cyan-400"></div>
          
          {/* Direction indicator */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 transform -rotate-45">
            <div className="h-10 w-1 bg-gradient-to-t from-cyan-400 to-transparent"></div>
          </div>
        </div>
      </div>

      {/* Boost/nitro meter */}
      <div className="absolute bottom-40 right-4 h-32 w-10 bg-black/70 backdrop-blur-md border border-yellow-500/50 rounded-lg overflow-hidden shadow-lg shadow-yellow-500/20">
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-yellow-500 to-red-500 h-1/4"></div>
        <div className="absolute inset-0 flex flex-col items-center justify-between p-2">
          <Flame className="h-5 w-5 text-yellow-500" />
          <div className="text-xs text-yellow-500 font-mono rotate-90">BOOST</div>
        </div>
      </div>

      {/* Crosshair/center indicator */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
        <div className="w-2 h-2 rounded-full bg-white/30"></div>
      </div>
      
      {/* Lap indicator animation (appears when completing a lap) */}
      <div className="absolute top-1/3 left-1/2 transform -translate-x-1/2 flex items-center space-x-2 bg-black/40 backdrop-blur-sm px-6 py-3 rounded-full border border-white/20">
        <Flag className="h-6 w-6 text-white" />
        <span className="text-2xl font-bold text-white">Tour {gameState.lap}</span>
      </div>
      
      {/* Notification zone for messages */}
      <div className="absolute top-1/4 left-1/2 transform -translate-x-1/2 flex flex-col items-center">
        {gameState.speed > 80 && (
          <div className="bg-gradient-to-r from-cyan-400 to-purple-500 text-black font-bold px-4 py-2 rounded-md animate-pulse flex items-center">
            <ArrowRight className="h-5 w-5 mr-2" />
            VITESSE MAXIMALE
          </div>
        )}
      </div>
    </div>
  );
};
