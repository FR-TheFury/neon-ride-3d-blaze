
import { EffectComposer, Bloom, ChromaticAberration, Vignette, SMAA } from '@react-three/postprocessing';
import { BlendFunction } from 'postprocessing';

export const AdvancedEffects = () => {
  return (
    <EffectComposer>
      {/* Anti-aliasing */}
      <SMAA />
      
      {/* Enhanced bloom for neon effects */}
      <Bloom 
        intensity={1.5}
        luminanceThreshold={0.2}
        luminanceSmoothing={0.9}
      />
      
      {/* Chromatic aberration for speed effect */}
      <ChromaticAberration 
        offset={[0.002, 0.002]}
      />
      
      {/* Vignette for dramatic effect */}
      <Vignette
        offset={0.3}
        darkness={0.5}
      />
    </EffectComposer>
  );
};
