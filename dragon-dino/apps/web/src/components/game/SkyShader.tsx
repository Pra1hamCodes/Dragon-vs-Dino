import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useGameStore } from '@/stores/gameStore';

const vertexShader = /* glsl */ `
  varying vec2 vUv;
  varying vec3 vWorldPosition;

  void main() {
    vUv = uv;
    vec4 worldPos = modelMatrix * vec4(position, 1.0);
    vWorldPosition = worldPos.xyz;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fragmentShader = /* glsl */ `
  uniform float uTime;
  uniform float uDaytime;
  uniform vec3 uBiomeTint;

  varying vec2 vUv;
  varying vec3 vWorldPosition;

  // Simple hash for stars
  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
  }

  // Value noise
  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    float a = hash(i);
    float b = hash(i + vec2(1.0, 0.0));
    float c = hash(i + vec2(0.0, 1.0));
    float d = hash(i + vec2(1.0, 1.0));
    return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
  }

  void main() {
    // Vertical gradient (vUv.y goes from 0 at bottom to 1 at top of sphere)
    float elevation = vUv.y;

    // Day colors
    vec3 dayZenith = vec3(0.15, 0.35, 0.85);
    vec3 dayHorizon = vec3(0.6, 0.8, 1.0);

    // Night colors
    vec3 nightZenith = vec3(0.02, 0.02, 0.08);
    vec3 nightHorizon = vec3(0.05, 0.05, 0.15);

    // Sunset tint
    vec3 sunsetColor = vec3(1.0, 0.4, 0.1);

    // Mix day/night
    vec3 zenith = mix(nightZenith, dayZenith, uDaytime);
    vec3 horizon = mix(nightHorizon, dayHorizon, uDaytime);

    // Sunset effect near transition
    float sunsetFactor = 1.0 - abs(uDaytime - 0.5) * 2.0;
    sunsetFactor = pow(max(sunsetFactor, 0.0), 2.0);
    horizon = mix(horizon, sunsetColor, sunsetFactor * 0.6);

    // Gradient from horizon to zenith
    float gradientT = smoothstep(0.3, 0.7, elevation);
    vec3 skyColor = mix(horizon, zenith, gradientT);

    // Apply biome tint
    skyColor = mix(skyColor, uBiomeTint, 0.15);

    // Stars at night
    float nightFactor = 1.0 - uDaytime;
    if (nightFactor > 0.3) {
      vec2 starUV = vWorldPosition.xz * 0.5 + vWorldPosition.xy * 0.3;
      float starField = hash(floor(starUV * 80.0));
      float starBrightness = step(0.98, starField) * nightFactor;
      // Twinkle
      starBrightness *= 0.5 + 0.5 * sin(uTime * 3.0 + starField * 100.0);
      skyColor += vec3(starBrightness);
    }

    // Subtle cloud wisps
    float cloudNoise = noise(vWorldPosition.xz * 0.02 + uTime * 0.01);
    cloudNoise = smoothstep(0.45, 0.65, cloudNoise);
    float cloudMask = smoothstep(0.4, 0.6, elevation) * smoothstep(0.8, 0.6, elevation);
    skyColor = mix(skyColor, vec3(1.0), cloudNoise * cloudMask * 0.15 * uDaytime);

    gl_FragColor = vec4(skyColor, 1.0);
  }
`;

const BIOME_TINTS: THREE.Color[] = [
  new THREE.Color(0.4, 0.7, 0.4), // green
  new THREE.Color(0.8, 0.7, 0.4), // desert
  new THREE.Color(0.7, 0.8, 0.95), // snow
  new THREE.Color(0.6, 0.2, 0.1), // volcanic
];

export default function SkyShader() {
  const materialRef = useRef<THREE.ShaderMaterial>(null!);
  const score = useGameStore((s) => s.score);
  const biome = useGameStore((s) => s.biome);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uDaytime: { value: 1.0 },
      uBiomeTint: { value: new THREE.Color(0.4, 0.7, 0.4) },
    }),
    [],
  );

  useFrame((_, delta) => {
    if (!materialRef.current) return;

    const uniforms = materialRef.current.uniforms;
    uniforms['uTime']!.value += delta;

    // Daytime cycles based on score: full cycle every 1000 points
    const cycle = (score % 1000) / 1000;
    const daytime = 0.5 + 0.5 * Math.cos(cycle * Math.PI * 2);
    uniforms['uDaytime']!.value += (daytime - (uniforms['uDaytime']!.value as number)) * delta * 2;

    // Biome tint
    const biomeIdx = Math.min(biome, BIOME_TINTS.length - 1);
    const targetTint = BIOME_TINTS[biomeIdx]!;
    (uniforms['uBiomeTint']!.value as THREE.Color).lerp(targetTint, delta * 1.5);
  });

  return (
    <mesh scale={[-1, 1, 1]}>
      <sphereGeometry args={[200, 32, 32]} />
      <shaderMaterial
        ref={materialRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        side={THREE.BackSide}
        depthWrite={false}
      />
    </mesh>
  );
}
