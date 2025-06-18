
import { EffectComposer, Bloom, SMAA } from '@react-three/postprocessing';

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
    </EffectComposer>
  );
};
