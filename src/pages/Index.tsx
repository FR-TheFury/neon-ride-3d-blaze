
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const Index = () => {
  const navigate = useNavigate();
  const [isStarting, setIsStarting] = useState(false);

  const startGame = () => {
    setIsStarting(true);
    setTimeout(() => {
      navigate('/game');
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-900 via-blue-900 to-black flex items-center justify-center relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0">
        {Array.from({ length: 50 }, (_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-cyan-400 rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 2}s`,
              animationDuration: `${2 + Math.random() * 2}s`,
            }}
          />
        ))}
      </div>

      <div className="text-center z-10 px-8">
        <h1 className="text-6xl md:text-8xl font-bold mb-8 bg-gradient-to-r from-cyan-400 via-magenta-400 to-yellow-400 bg-clip-text text-transparent animate-pulse">
          NEON RIDE
        </h1>
        
        <div className="text-xl md:text-2xl text-cyan-300 mb-12 font-mono">
          <div className="mb-2">&gt;&gt;&gt; FUTURISTIC RACING EXPERIENCE &lt;&lt;&lt;</div>
          <div className="text-sm opacity-70">Enter the neon grid</div>
        </div>

        <div className="space-y-4">
          <Button
            onClick={startGame}
            disabled={isStarting}
            className="bg-gradient-to-r from-cyan-500 to-magenta-500 hover:from-cyan-400 hover:to-magenta-400 text-black font-bold text-xl px-12 py-4 rounded-none border-2 border-cyan-400 shadow-lg shadow-cyan-400/20 transition-all duration-300 hover:shadow-cyan-400/40"
          >
            {isStarting ? 'INITIALIZING...' : 'START RACE'}
          </Button>
          
          <div className="grid grid-cols-2 gap-4 mt-8">
            <Button
              onClick={() => navigate('/settings')}
              variant="outline"
              className="border-magenta-400 text-magenta-400 hover:bg-magenta-400/10 rounded-none"
            >
              SETTINGS
            </Button>
            <Button
              onClick={() => navigate('/leaderboard')}
              variant="outline"
              className="border-yellow-400 text-yellow-400 hover:bg-yellow-400/10 rounded-none"
            >
              LEADERBOARD
            </Button>
          </div>
        </div>

        {/* Glitch effect */}
        {isStarting && (
          <div className="absolute inset-0 bg-cyan-400/10 animate-pulse"></div>
        )}
      </div>

      {/* Scan lines effect */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-400/5 to-transparent animate-pulse pointer-events-none"></div>
    </div>
  );
};

export default Index;
