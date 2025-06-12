
import { EffectComposer, Bloom, ChromaticAberration, DepthOfField, Vignette, SMAA } from '@react-three/postprocessing';
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
        blendFunction={BlendFunction.ADD}
      />
      
      {/* Chromatic aberration for speed effect */}
      <ChromaticAberration 
        blendFunction={BlendFunction.NORMAL}
        offset={[0.002, 0.002]}
      />
      
      {/* Depth of field for cinematic look */}
      <DepthOfField
        focusDistance={0.02}
        focalLength={0.05}
        bokehScale={3}
        height={480}
      />
      
      {/* Vignette for dramatic effect */}
      <Vignette
        offset={0.3}
        darkness={0.5}
        blendFunction={BlendFunction.MULTIPLY}
      />
    </EffectComposer>
  );
};
