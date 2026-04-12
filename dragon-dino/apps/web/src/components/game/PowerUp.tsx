import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useSphere } from '@react-three/cannon';
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
    case 'sphere':
      return <sphereGeometry args={[0.4, 16, 16]} />;
    case 'torus':
      return <torusGeometry args={[0.35, 0.12, 12, 24]} />;
    case 'cone':
      return <coneGeometry args={[0.35, 0.7, 8]} />;
    case 'octahedron':
      return <octahedronGeometry args={[0.4]} />;
    case 'box':
      return <boxGeometry args={[0.5, 0.5, 0.5]} />;
    default:
      return <sphereGeometry args={[0.4, 16, 16]} />;
  }
}

export default function PowerUp({ position, type, onCollect }: PowerUpProps) {
  const meshRef = useRef<THREE.Mesh>(null!);
  const wireRef = useRef<THREE.Mesh>(null!);
  const collected = useRef(false);
  const initialY = position[1];
  const timeOffset = useRef(Math.random() * Math.PI * 2);
  const config = POWERUP_CONFIG[type];

  const [colliderRef] = useSphere(() => ({
    type: 'Static',
    position,
    args: [0.6],
    isTrigger: true,
    onCollide: () => {
      if (!collected.current) {
        collected.current = true;
        onCollect();
      }
    },
  }));

  useFrame((state) => {
    if (!meshRef.current || collected.current) return;

    const t = state.clock.elapsedTime + timeOffset.current;

    // Spin
    meshRef.current.rotation.y += 0.03;
    meshRef.current.rotation.x = Math.sin(t * 1.5) * 0.2;

    // Bob
    meshRef.current.position.y = initialY + Math.sin(t * 2) * 0.35;

    // Wireframe follows
    if (wireRef.current) {
      wireRef.current.rotation.copy(meshRef.current.rotation);
      wireRef.current.position.copy(meshRef.current.position);
      wireRef.current.rotation.y += 0.5;
    }
  });

  if (collected.current) return null;

  return (
    <group ref={colliderRef as React.Ref<THREE.Group>}>
      {/* Solid mesh */}
      <mesh ref={meshRef} position={[position[0], position[1], position[2]]} castShadow>
        <PowerUpGeometry geometry={config.geometry} />
        <meshStandardMaterial
          color={config.color}
          emissive={config.emissive}
          emissiveIntensity={0.8}
          metalness={0.5}
          roughness={0.3}
        />
      </mesh>

      {/* Wireframe outline */}
      <mesh ref={wireRef} position={[position[0], position[1], position[2]]} scale={1.15}>
        <PowerUpGeometry geometry={config.geometry} />
        <meshBasicMaterial color={config.color} wireframe transparent opacity={0.3} />
      </mesh>
    </group>
  );
}
