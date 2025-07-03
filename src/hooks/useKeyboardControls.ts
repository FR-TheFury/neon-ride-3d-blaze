
import { useEffect, useRef, useCallback } from 'react';

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

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    // Empêcher les actions par défaut pour certaines touches
    if (['KeyW', 'KeyZ', 'KeyS', 'KeyQ', 'KeyA', 'KeyD', 'Space'].includes(event.code)) {
      event.preventDefault();
    }

    console.log('Touche pressée:', event.code);

    switch (event.code) {
      case 'KeyZ':
      case 'KeyW':
        keys.current.forward = true;
        console.log('Avancer activé');
        break;
      case 'KeyS':
        keys.current.backward = true;
        console.log('Reculer activé');
        break;
      case 'KeyQ':
      case 'KeyA':
        keys.current.left = true;
        console.log('Gauche activé');
        break;
      case 'KeyD':
        keys.current.right = true;
        console.log('Droite activé');
        break;
      case 'ShiftLeft':
      case 'ShiftRight':
        keys.current.drift = true;
        console.log('Drift activé');
        break;
      case 'Space':
        keys.current.handbrake = true;
        console.log('Frein à main activé');
        break;
    }
  }, []);

  const handleKeyUp = useCallback((event: KeyboardEvent) => {
    console.log('Touche relâchée:', event.code);

    switch (event.code) {
      case 'KeyZ':
      case 'KeyW':
        keys.current.forward = false;
        console.log('Avancer désactivé');
        break;
      case 'KeyS':
        keys.current.backward = false;
        console.log('Reculer désactivé');
        break;
      case 'KeyQ':
      case 'KeyA':
        keys.current.left = false;
        console.log('Gauche désactivé');
        break;
      case 'KeyD':
        keys.current.right = false;
        console.log('Droite désactivé');
        break;
      case 'ShiftLeft':
      case 'ShiftRight':
        keys.current.drift = false;
        console.log('Drift désactivé');
        break;
      case 'Space':
        keys.current.handbrake = false;
        console.log('Frein à main désactivé');
        break;
    }
  }, []);

  useEffect(() => {
    console.log('useKeyboardControls: Initialisation des contrôles');
    
    // Assurer le focus du document
    if (document.activeElement !== document.body) {
      document.body.focus();
    }

    // Ajouter les gestionnaires d'événements
    document.addEventListener('keydown', handleKeyDown, { passive: false });
    document.addEventListener('keyup', handleKeyUp, { passive: false });

    // Gestionnaire de focus pour maintenir les contrôles actifs
    const handleFocus = () => {
      console.log('Document focus regained');
    };

    const handleBlur = () => {
      console.log('Document focus lost');
      // Réinitialiser les touches quand on perd le focus
      keys.current = {
        forward: false,
        backward: false,
        left: false,
        right: false,
        drift: false,
        handbrake: false,
      };
    };

    window.addEventListener('focus', handleFocus);
    window.addEventListener('blur', handleBlur);

    return () => {
      console.log('useKeyboardControls: Nettoyage des événements');
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('blur', handleBlur);
    };
  }, [handleKeyDown, handleKeyUp]);

  return keys;
};
