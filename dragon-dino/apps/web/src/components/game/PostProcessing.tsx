import { EffectComposer, Bloom, Vignette, ChromaticAberration } from '@react-three/postprocessing';
import { BlendFunction } from 'postprocessing';
import { Vector2 } from 'three';
import { useMemo } from 'react';
import { useGameStore } from '@/stores/gameStore';

export function PostProcessing() {
  const biome = useGameStore((s) => s.biome);
  const shake = useGameStore((s) => s.shake);

  const vignetteIntensity = 0.3 + biome * 0.05;
  const caOffset = useMemo(() => new Vector2(0, 0), []);
  caOffset.set(shake * 0.003, shake * 0.003);

  return (
    <EffectComposer multisampling={4}>
      <Bloom
        luminanceThreshold={0.7}
        luminanceSmoothing={0.4}
        intensity={0.55}
        mipmapBlur
      />
      <Vignette
        offset={0.25}
        darkness={Math.min(vignetteIntensity + shake * 0.3, 0.85)}
        blendFunction={BlendFunction.NORMAL}
      />
      <ChromaticAberration
        offset={caOffset}
        blendFunction={BlendFunction.NORMAL}
        radialModulation={false}
        modulationOffset={0}
      />
    </EffectComposer>
  );
}
