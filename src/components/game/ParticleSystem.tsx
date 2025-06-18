
import { useFrame } from '@react-three/fiber';
import { useState, useRef, useMemo } from 'react';
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
  
  // Matériau pour les particules
  const particleMaterial = useMemo(() => {
    return new THREE.PointsMaterial({
      size: 0.7,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      vertexColors: true,
      color: '#ffffff'
    });
  }, []);

  // Créer des particules en fonction de la vitesse
  const createParticle = (x: number, y: number, z: number, isDrift: boolean = false) => {
    const speed = gameState.speed;
    
    if (speed < 5 || Math.random() > 0.7) return;
    
    const spreadFactor = isDrift ? 0.5 : 0.2;
    const lifeFactor = isDrift ? 1.5 : 1.0;
    
    const particle: Particle = {
      position: new THREE.Vector3(
        x + (Math.random() - 0.5) * spreadFactor,
        y - 0.35,
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
        ? new THREE.Color(0xff5500) 
        : new THREE.Color(0x00ffff)
    };
    
    particles.current.push(particle);
  };

  // Mise à jour des particules à chaque frame
  useFrame(() => {
    if (gameState.speed < 1) return;
    
    const speed = gameState.speed;
    const emitRate = Math.min(Math.floor(speed / 10), 5);
    
    // Positions des roues
    const wheelOffsets = [
      [-0.9, 0, 1.5],
      [0.9, 0, 1.5],
      [-0.9, 0, -1.5],
      [0.9, 0, -1.5]
    ];
    
    // Émettre des particules
    for (let i = 0; i < emitRate; i++) {
      if (speed > 60) {
        wheelOffsets.forEach(offset => {
          if (Math.random() > 0.7) {
            createParticle(
              carPosition[0] + offset[0],
              carPosition[1] + offset[1],
              carPosition[2] + offset[2],
              true
            );
          }
        });
      } else if (speed > 20) {
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
    
    particles.current = particles.current.filter(p => {
      p.lifetime += 0.016;
      
      p.velocity.y += 0.001;
      p.velocity.multiplyScalar(0.97);
      
      p.position.add(p.velocity);
      
      positions.push(p.position.x, p.position.y, p.position.z);
      
      const alpha = 1 - (p.lifetime / p.maxLifetime);
      colors.push(p.color.r, p.color.g, p.color.b);
      
      const sizeScale = 1 - (p.lifetime / p.maxLifetime);
      sizes.push(p.size * sizeScale);
      
      return p.lifetime < p.maxLifetime;
    });

    // Mettre à jour la géométrie
    if (positions.length > 0) {
      geometry.current.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
      geometry.current.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
      geometry.current.setAttribute('size', new THREE.Float32BufferAttribute(sizes, 1));
    }
  });

  return positions.length > 0 ? (
    <points ref={particlesRef} geometry={geometry.current} material={particleMaterial} />
  ) : null;
};
