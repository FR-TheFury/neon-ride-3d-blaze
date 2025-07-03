
import { useEffect, useRef } from 'react';

export interface KeyboardState {
  forward: boolean;
  backward: boolean;
  left: boolean;
  right: boolean;
  drift: boolean;
  handbrake: boolean;
}

export const useKeyboardControls = () => {
  const keys = useRef<KeyboardState>({
    forward: false,
    backward: false,
    left: false,
    right: false,
    drift: false,
    handbrake: false,
  });

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      switch (event.code) {
        case 'KeyZ':
        case 'KeyW':
          keys.current.forward = true;
          break;
        case 'KeyS':
          keys.current.backward = true;
          break;
        case 'KeyQ':
        case 'KeyA':
          keys.current.left = true;
          break;
        case 'KeyD':
          keys.current.right = true;
          break;
        case 'ShiftLeft':
        case 'ShiftRight':
          keys.current.drift = true;
          break;
        case 'Space':
          event.preventDefault();
          keys.current.handbrake = true;
          break;
      }
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      switch (event.code) {
        case 'KeyZ':
        case 'KeyW':
          keys.current.forward = false;
          break;
        case 'KeyS':
          keys.current.backward = false;
          break;
        case 'KeyQ':
        case 'KeyA':
          keys.current.left = false;
          break;
        case 'KeyD':
          keys.current.right = false;
          break;
        case 'ShiftLeft':
        case 'ShiftRight':
          keys.current.drift = false;
          break;
        case 'Space':
          keys.current.handbrake = false;
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  return keys;
};
