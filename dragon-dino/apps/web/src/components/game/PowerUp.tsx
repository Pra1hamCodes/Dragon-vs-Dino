import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { PowerupType } from '@dragon-dino/shared';

interface PowerUpProps {
  position: [number, number, number];
  type: PowerupType;
  onCollect: () => void;
}

const POWERUP_CONFIG: Record<
  PowerupType,
  { color: string; emissive: string; geometry: 'sphere' | 'torus' | 'cone' | 'octahedron' | 'box' }
> = {
  shield: { color: '#4FC3F7', emissive: '#0288D1', geometry: 'sphere' },
  magnet: { color: '#E040FB', emissive: '#7B1FA2', geometry: 'torus' },
  doubleJump: { color: '#69F0AE', emissive: '#00C853', geometry: 'cone' },
  slowMo: { color: '#FFF176', emissive: '#F9A825', geometry: 'octahedron' },
  x2: { color: '#FF5252', emissive: '#D32F2F', geometry: 'box' },
};

function PowerUpGeometry({ geometry }: { geometry: string }) {
  switch (geometry) {
    case 'sphere': return <sphereGeometry args={[0.38, 16, 16]} />;
    case 'torus': return <torusGeometry args={[0.32, 0.1, 12, 24]} />;
    case 'cone': return <coneGeometry args={[0.32, 0.65, 8]} />;
    case 'octahedron': return <octahedronGeometry args={[0.38]} />;
    case 'box': return <boxGeometry args={[0.45, 0.45, 0.45]} />;
    default: return <sphereGeometry args={[0.38, 16, 16]} />;
  }
}

export default function PowerUp({ position, type }: PowerUpProps) {
  const meshRef = useRef<THREE.Mesh>(null!);
  const wireRef = useRef<THREE.Mesh>(null!);
  const timeOffset = useRef(Math.random() * Math.PI * 2);
  const config = POWERUP_CONFIG[type];

  useFrame((state) => {
    if (!meshRef.current) return;
    const t = state.clock.elapsedTime + timeOffset.current;

    meshRef.current.rotation.y += 0.035;
    meshRef.current.rotation.x = Math.sin(t * 1.5) * 0.18;
    meshRef.current.position.set(position[0], position[1] + Math.sin(t * 2) * 0.3, position[2]);

    if (wireRef.current) {
      wireRef.current.rotation.copy(meshRef.current.rotation);
      wireRef.current.position.copy(meshRef.current.position);
      wireRef.current.rotation.y += 0.5;
    }
  });

  return (
    <group>
      <mesh ref={meshRef} position={position} castShadow>
        <PowerUpGeometry geometry={config.geometry} />
        <meshStandardMaterial
          color={config.color}
          emissive={config.emissive}
          emissiveIntensity={0.9}
          metalness={0.45}
          roughness={0.25}
        />
      </mesh>
      <mesh ref={wireRef} position={position} scale={1.18}>
        <PowerUpGeometry geometry={config.geometry} />
        <meshBasicMaterial color={config.color} wireframe transparent opacity={0.25} />
      </mesh>
      {/* Glow light */}
      <pointLight position={position} color={config.color} intensity={1.5} distance={3} decay={2} />
    </group>
  );
}
