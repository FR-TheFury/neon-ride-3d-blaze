
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Volume2, VolumeX, Monitor, Gamepad2, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

const Settings = () => {
  const navigate = useNavigate();
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [graphics, setGraphics] = useState('high');
  const [controls, setControls] = useState('keyboard');

  const handleSoundToggle = () => {
    setSoundEnabled(!soundEnabled);
    toast.success(soundEnabled ? 'Son désactivé' : 'Son activé');
  };

  const handleGraphicsChange = (quality: string) => {
    setGraphics(quality);
    toast.success(`Qualité graphique: ${quality}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-900 via-blue-900 to-black flex items-center justify-center relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0">
        {Array.from({ length: 30 }, (_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-cyan-400 rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 2}s`,
            }}
          />
        ))}
      </div>

      <div className="z-10 bg-black/70 backdrop-blur-md border border-cyan-500/50 rounded-lg p-8 w-full max-w-md">
        <div className="flex items-center mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/')}
            className="text-cyan-400 hover:text-cyan-300 mr-4"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-3xl font-bold text-cyan-400">SETTINGS</h1>
        </div>

        <div className="space-y-6">
          {/* Sound Settings */}
          <div className="space-y-2">
            <h3 className="text-white font-semibold flex items-center">
              {soundEnabled ? <Volume2 className="h-4 w-4 mr-2" /> : <VolumeX className="h-4 w-4 mr-2" />}
              Audio
            </h3>
            <Button
              onClick={handleSoundToggle}
              variant={soundEnabled ? "default" : "outline"}
              className="w-full"
            >
              {soundEnabled ? 'Son activé' : 'Son désactivé'}
            </Button>
          </div>

          {/* Graphics Settings */}
          <div className="space-y-2">
            <h3 className="text-white font-semibold flex items-center">
              <Monitor className="h-4 w-4 mr-2" />
              Graphiques
            </h3>
            <div className="grid grid-cols-3 gap-2">
              {['low', 'medium', 'high'].map((quality) => (
                <Button
                  key={quality}
                  onClick={() => handleGraphicsChange(quality)}
                  variant={graphics === quality ? "default" : "outline"}
                  size="sm"
                  className="text-xs"
                >
                  {quality === 'low' ? 'Bas' : quality === 'medium' ? 'Moyen' : 'Élevé'}
                </Button>
              ))}
            </div>
          </div>

          {/* Controls Settings */}
          <div className="space-y-2">
            <h3 className="text-white font-semibold flex items-center">
              <Gamepad2 className="h-4 w-4 mr-2" />
              Contrôles
            </h3>
            <div className="text-sm text-cyan-300 space-y-1">
              <div><span className="font-bold">Z</span> - Avancer</div>
              <div><span className="font-bold">S</span> - Reculer</div>
              <div><span className="font-bold">Q/D</span> - Direction</div>
              <div><span className="font-bold">Shift</span> - Drift</div>
              <div><span className="font-bold">Espace</span> - Frein à main</div>
            </div>
          </div>
        </div>

        <div className="mt-8 space-y-3">
          <Button
            onClick={() => navigate('/game')}
            className="w-full bg-gradient-to-r from-cyan-500 to-purple-500"
          >
            JOUER
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

export default Settings;
