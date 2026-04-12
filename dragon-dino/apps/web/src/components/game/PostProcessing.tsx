import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing';
import { useGameStore } from '@/stores/gameStore';

export function PostProcessing() {
  const biome = useGameStore((s) => s.biome);
  const vignetteIntensity = 0.3 + biome * 0.05;

  return (
    <EffectComposer>
      <Bloom
        luminanceThreshold={0.8}
        luminanceSmoothing={0.3}
        intensity={0.4}
      />
      <Vignette
        offset={0.3}
        darkness={Math.min(vignetteIntensity, 0.7)}
      />
    </EffectComposer>
  );
}
