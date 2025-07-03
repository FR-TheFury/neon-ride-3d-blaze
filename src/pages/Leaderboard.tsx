
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Trophy, Medal, Award, ArrowLeft, Clock } from 'lucide-react';

const Leaderboard = () => {
  const navigate = useNavigate();

  // Données simulées du leaderboard
  const leaderboardData = [
    { rank: 1, name: "SpeedDemon", time: "1:23.45", score: 9850 },
    { rank: 2, name: "NeonRacer", time: "1:25.12", score: 9720 },
    { rank: 3, name: "CyberDriver", time: "1:27.89", score: 9500 },
    { rank: 4, name: "QuantumSpeed", time: "1:29.34", score: 9200 },
    { rank: 5, name: "ElectroRush", time: "1:31.67", score: 8900 },
    { rank: 6, name: "PhotonBlast", time: "1:33.21", score: 8650 },
    { rank: 7, name: "VoidRacer", time: "1:35.78", score: 8400 },
    { rank: 8, name: "PlasmaSpeed", time: "1:38.45", score: 8100 },
  ];

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="h-6 w-6 text-yellow-400" />;
      case 2:
        return <Medal className="h-6 w-6 text-gray-400" />;
      case 3:
        return <Award className="h-6 w-6 text-amber-600" />;
      default:
        return <div className="w-6 h-6 flex items-center justify-center text-cyan-400 font-bold">#{rank}</div>;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-900 via-blue-900 to-black flex items-center justify-center relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0">
        {Array.from({ length: 40 }, (_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-cyan-400 rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
            }}
          />
        ))}
      </div>

      <div className="z-10 bg-black/70 backdrop-blur-md border border-cyan-500/50 rounded-lg p-8 w-full max-w-2xl">
        <div className="flex items-center mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/')}
            className="text-cyan-400 hover:text-cyan-300 mr-4"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-3xl font-bold text-cyan-400 flex items-center">
            <Trophy className="h-8 w-8 mr-3" />
            LEADERBOARD
          </h1>
        </div>

        <div className="space-y-2 max-h-96 overflow-y-auto">
          {leaderboardData.map((player) => (
            <div
              key={player.rank}
              className={`flex items-center justify-between p-3 rounded-lg border ${
                player.rank <= 3
                  ? 'bg-gradient-to-r from-cyan-900/50 to-purple-900/50 border-cyan-400/50'
                  : 'bg-black/30 border-gray-600/30'
              }`}
            >
              <div className="flex items-center space-x-4">
                {getRankIcon(player.rank)}
                <div>
                  <div className="text-white font-bold">{player.name}</div>
                  <div className="text-xs text-gray-400 flex items-center">
                    <Clock className="h-3 w-3 mr-1" />
                    {player.time}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-cyan-400 font-bold">{player.score.toLocaleString()}</div>
                <div className="text-xs text-gray-400">points</div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 space-y-3">
          <Button
            onClick={() => navigate('/game')}
            className="w-full bg-gradient-to-r from-cyan-500 to-purple-500"
          >
            BATTRE CE RECORD
          </Button>
          <Button
            onClick={() => navigate('/')}
            variant="outline"
            className="w-full border-cyan-500 text-cyan-400"
          >
            RETOUR AU MENU
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;
