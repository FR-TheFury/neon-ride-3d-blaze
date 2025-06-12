
import { useMemo } from 'react';
import * as THREE from 'three';

export const useCarMaterial = (color: string) => {
  return useMemo(() => {
    const material = new THREE.MeshPhysicalMaterial({
      color: color,
      metalness: 0.9,
      roughness: 0.1,
      clearcoat: 1.0,
      clearcoatRoughness: 0.1,
      reflectivity: 1.0,
      envMapIntensity: 2.0,
    });
    return material;
  }, [color]);
};

export const useTrackMaterial = () => {
  return useMemo(() => {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d')!;
    canvas.width = 512;
    canvas.height = 512;
    
    // Create asphalt texture
    context.fillStyle = '#1a1a1a';
    context.fillRect(0, 0, 512, 512);
    
    // Add noise for realistic asphalt texture
    for (let i = 0; i < 1000; i++) {
      context.fillStyle = `rgb(${Math.random() * 50}, ${Math.random() * 50}, ${Math.random() * 50})`;
      context.fillRect(Math.random() * 512, Math.random() * 512, 2, 2);
    }
    
    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(10, 10);
    
    return new THREE.MeshStandardMaterial({
      map: texture,
      normalScale: new THREE.Vector2(0.5, 0.5),
      roughness: 0.8,
      metalness: 0.1,
    });
  }, []);
};
