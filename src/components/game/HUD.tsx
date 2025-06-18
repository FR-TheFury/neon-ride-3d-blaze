
import { useGame } from '../../contexts/GameContext';

export const HUD = () => {
  const { gameState } = useGame();

  return (
    <div className="absolute inset-0 pointer-events-none z-10">
      {/* Speed indicator */}
      <div className="absolute top-4 left-4 bg-black/80 backdrop-blur-sm border border-cyan-400 rounded-lg p-4 text-cyan-400 font-mono">
        <div className="text-xs opacity-70">VITESSE</div>
        <div className="text-2xl font-bold">{gameState.speed}</div>
        <div className="text-xs opacity-70">KM/H</div>
      </div>

      {/* Time and lap info */}
      <div className="absolute top-4 right-4 bg-black/80 backdrop-blur-sm border border-magenta-400 rounded-lg p-4 text-magenta-400 font-mono">
        <div className="text-xs opacity-70">TOUR {gameState.lap}</div>
        <div className="text-xl font-bold">
          {Math.floor(gameState.time / 60)}:{(gameState.time % 60).toString().padStart(2, '0')}
        </div>
        <div className="text-xs opacity-70">POSITION {gameState.position}</div>
      </div>

      {/* Controls hint */}
      <div className="absolute bottom-4 left-4 bg-black/80 backdrop-blur-sm border border-green-400 rounded-lg p-4 text-green-400 font-mono text-sm">
        <div><span className="text-yellow-400">Z</span> - Accélérer</div>
        <div><span className="text-yellow-400">S</span> - Freiner/Reculer</div>
        <div><span className="text-yellow-400">Q D</span> - Tourner</div>
        <div><span className="text-orange-400">SHIFT</span> - Mode Drift</div>
        <div><span className="text-red-400">ESPACE</span> - Frein à main</div>
      </div>

      {/* Crosshair/center indicator */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
        <div className="w-2 h-2 border border-cyan-400 rounded-full bg-cyan-400/20"></div>
      </div>
    </div>
  );
};
