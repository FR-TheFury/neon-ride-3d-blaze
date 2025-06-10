
import React, { createContext, useContext, useState, ReactNode } from 'react';

interface GameState {
  speed: number;
  time: number;
  lap: number;
  position: number;
  isPlaying: boolean;
  score: number;
}

interface GameContextType {
  gameState: GameState;
  updateSpeed: (speed: number) => void;
  updateTime: (time: number) => void;
  updateLap: (lap: number) => void;
  updatePosition: (position: number) => void;
  startGame: () => void;
  pauseGame: () => void;
  resetGame: () => void;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
};

export const GameProvider = ({ children }: { children: ReactNode }) => {
  const [gameState, setGameState] = useState<GameState>({
    speed: 0,
    time: 0,
    lap: 1,
    position: 1,
    isPlaying: false,
    score: 0,
  });

  const updateSpeed = (speed: number) => {
    setGameState(prev => ({ ...prev, speed }));
  };

  const updateTime = (time: number) => {
    setGameState(prev => ({ ...prev, time }));
  };

  const updateLap = (lap: number) => {
    setGameState(prev => ({ ...prev, lap }));
  };

  const updatePosition = (position: number) => {
    setGameState(prev => ({ ...prev, position }));
  };

  const startGame = () => {
    setGameState(prev => ({ ...prev, isPlaying: true }));
  };

  const pauseGame = () => {
    setGameState(prev => ({ ...prev, isPlaying: false }));
  };

  const resetGame = () => {
    setGameState({
      speed: 0,
      time: 0,
      lap: 1,
      position: 1,
      isPlaying: false,
      score: 0,
    });
  };

  return (
    <GameContext.Provider
      value={{
        gameState,
        updateSpeed,
        updateTime,
        updateLap,
        updatePosition,
        startGame,
        pauseGame,
        resetGame,
      }}
    >
      {children}
    </GameContext.Provider>
  );
};
