
import { useFrame } from '@react-three/fiber';
import { useState, useRef, useEffect, useMemo } from 'react';
import * as THREE from 'three';
import { useGame } from '../../contexts/GameContext';

interface ParticleSystemProps {
  carPosition: [number, number, number];
}

// Particule individuelle
interface Particle {
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  size: number;
  lifetime: number;
  maxLifetime: number;
  color: THREE.Color;
}

export const ParticleSystem = ({ carPosition }: ParticleSystemProps) => {
  const { gameState } = useGame();
  const particlesRef = useRef<THREE.Points>(null);
  const particles = useRef<Particle[]>([]);
  const geometry = useRef(new THREE.BufferGeometry());
  const [driftMode, setDriftMode] = useState(false);
  
  // Matériau pour les particules
  const particleMaterial = useMemo(() => {
    const texture = new THREE.TextureLoader().load('/neon_particle.png');
    return new THREE.PointsMaterial({
      size: 0.7,
      map: texture,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      vertexColors: true,
    });
  }, []);

  // Créer des particules en fonction de la vitesse et du drift
  const createParticle = (x: number, y: number, z: number, isDrift: boolean = false) => {
    const speed = gameState.speed;
    
    if ((speed < 5 && !isDrift) || Math.random() > 0.7) return;
    
    const spreadFactor = isDrift ? 0.5 : 0.2;
    const lifeFactor = isDrift ? 1.5 : 1.0;
    
    const particle: Particle = {
      position: new THREE.Vector3(
        x + (Math.random() - 0.5) * spreadFactor,
        y - 0.35, // Juste sous la voiture
        z + (Math.random() - 0.5) * spreadFactor
      ),
      velocity: new THREE.Vector3(
        (Math.random() - 0.5) * 0.1,
        Math.random() * 0.1,
        (Math.random() - 0.5) * 0.1
      ),
      size: isDrift ? 0.8 + Math.random() * 0.4 : 0.3 + Math.random() * 0.3,
      lifetime: 0,
      maxLifetime: (0.5 + Math.random() * 1.0) * lifeFactor,
      color: isDrift 
        ? new THREE.Color(Math.random() > 0.5 ? 0xff5500 : 0xff0000) 
        : new THREE.Color(Math.random() > 0.7 ? 0x00ffff : 0xcccccc)
    };
    
    particles.current.push(particle);
  };

  // Détection du mode drift (pour les effets spéciaux)
  useEffect(() => {
    const checkDrift = () => {
      const velocity = gameState.speed;
      if (velocity > 40) {
        setDriftMode(true);
        return () => {
          setDriftMode(false);
        };
      }
    };
    
    const driftChecker = setInterval(checkDrift, 100);
    return () => clearInterval(driftChecker);
  }, [gameState.speed]);

  // Mise à jour des particules à chaque frame
  useFrame(() => {
    // Si la voiture est à l'arrêt, pas de particules
    if (gameState.speed < 1) return;
    
    // Créer des particules en fonction de la vitesse et de la position
    const speed = gameState.speed;
    const emitRate = Math.min(Math.floor(speed / 10), 5);
    
    // Positions des roues (décalées par rapport à la position de la voiture)
    const wheelOffsets = [
      [-0.9, 0, 1.5],  // Avant gauche
      [0.9, 0, 1.5],   // Avant droite
      [-0.9, 0, -1.5], // Arrière gauche
      [0.9, 0, -1.5]   // Arrière droite
    ];
    
    // Émettre des particules
    for (let i = 0; i < emitRate; i++) {
      if (driftMode || speed > 60) {
        // Particules de dérapage
        wheelOffsets.forEach(offset => {
          if (Math.random() > 0.7) {
            createParticle(
              carPosition[0] + offset[0],
              carPosition[1] + offset[1],
              carPosition[2] + offset[2],
              true // isDrift = true
            );
          }
        });
      } else if (speed > 20) {
        // Particules normales
        wheelOffsets.forEach(offset => {
          if (Math.random() > 0.85) {
            createParticle(
              carPosition[0] + offset[0],
              carPosition[1] + offset[1],
              carPosition[2] + offset[2]
            );
          }
        });
      }
    }

    // Mettre à jour les particules existantes
    const positions = [];
    const colors = [];
    const sizes = [];
    
    // Mettre à jour chaque particule et conserver celles qui sont encore actives
    particles.current = particles.current.filter(p => {
      // Mettre à jour la durée de vie
      p.lifetime += 0.016; // environ 60 FPS
      
      // Appliquer la gravité et la résistance de l'air
      p.velocity.y += 0.001; // légère flottaison
      p.velocity.multiplyScalar(0.97); // friction de l'air
      
      // Mettre à jour la position
      p.position.add(p.velocity);
      
      // Ajouter à la géométrie
      positions.push(p.position.x, p.position.y, p.position.z);
      
      // Faire varier la couleur en fonction de la durée de vie
      const alpha = 1 - (p.lifetime / p.maxLifetime);
      colors.push(p.color.r, p.color.g, p.color.b);
      
      // Faire varier la taille en fonction de la durée de vie
      const sizeScale = 1 - (p.lifetime / p.maxLifetime);
      sizes.push(p.size * sizeScale);
      
      // Garder la particule si elle n'a pas atteint sa durée de vie maximale
      return p.lifetime < p.maxLifetime;
    });

    // Mettre à jour la géométrie
    geometry.current.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geometry.current.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    geometry.current.setAttribute('size', new THREE.Float32BufferAttribute(sizes, 1));
  });

  return (
    <points ref={particlesRef} geometry={geometry.current} material={particleMaterial} />
  );
};
