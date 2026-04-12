import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { usePlane } from '@react-three/cannon';
import * as THREE from 'three';
import { useGameStore } from '@/stores/gameStore';

const BIOME_COLORS = [
  { ground: '#2d5016', fog: '#1a0a2e' },  // Forest
  { ground: '#8B7355', fog: '#2e1a0a' },  // Desert
  { ground: '#e8e8e8', fog: '#1a2a3e' },  // Snow
  { ground: '#3d1c00', fog: '#2e0a0a' },  // Volcanic
];

export function Terrain() {
  const speed = useGameStore((s) => s.speed);
  const status = useGameStore((s) => s.status);
  const biome = useGameStore((s) => s.biome);

  const groundRef = useRef<THREE.Mesh>(null);
  const mountainsRef = useRef<THREE.Group>(null);
  const treesRef = useRef<THREE.Group>(null);
  const scrollRef = useRef(0);

  // Ground physics
  usePlane<THREE.Mesh>(() => ({
    rotation: [-Math.PI / 2, 0, 0],
    position: [0, 0, 0],
    type: 'Static',
  }));

  // Generate trees
  const treePositions = useMemo(() => {
    const positions: Array<[number, number, number]> = [];
    for (let i = 0; i < 30; i++) {
      positions.push([
        (Math.random() - 0.5) * 60 - 10,
        0,
        -5 - Math.random() * 15,
      ]);
    }
    return positions;
  }, []);

  // Generate mountains
  const mountainPositions = useMemo(() => {
    const positions: Array<{ pos: [number, number, number]; scale: [number, number, number] }> = [];
    for (let i = 0; i < 12; i++) {
      positions.push({
        pos: [(Math.random() - 0.5) * 80, 0, -20 - Math.random() * 20],
        scale: [3 + Math.random() * 4, 5 + Math.random() * 8, 3 + Math.random() * 4],
      });
    }
    return positions;
  }, []);

  const biomeIndex = Math.min(biome, BIOME_COLORS.length - 1);
  const currentBiome = BIOME_COLORS[biomeIndex] ?? BIOME_COLORS[0]!;

  useFrame((_, delta) => {
    if (status !== 'playing') return;

    scrollRef.current += speed * delta;

    // Scroll ground texture
    if (groundRef.current) {
      const mat = groundRef.current.material as THREE.MeshStandardMaterial;
      if (mat.map) {
        mat.map.offset.x = scrollRef.current * 0.05;
      }
    }

    // Parallax mountains
    if (mountainsRef.current) {
      mountainsRef.current.position.x = -(scrollRef.current * 0.3) % 80;
    }

    // Parallax trees
    if (treesRef.current) {
      treesRef.current.position.x = -(scrollRef.current * 0.6) % 60;
    }
  });

  return (
    <group>
      {/* Ground */}
      <mesh
        ref={groundRef}
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0, 0]}
        receiveShadow
      >
        <planeGeometry args={[100, 30]} />
        <meshStandardMaterial color={currentBiome.ground} roughness={0.9} />
      </mesh>

      {/* Mountains */}
      <group ref={mountainsRef}>
        {mountainPositions.map((m, i) => (
          <mesh key={i} position={m.pos} scale={m.scale}>
            <coneGeometry args={[1, 1, 4]} />
            <meshStandardMaterial color="#4a3b6b" flatShading />
          </mesh>
        ))}
      </group>

      {/* Trees */}
      <group ref={treesRef}>
        {treePositions.map((pos, i) => (
          <group key={i} position={pos}>
            {/* Trunk */}
            <mesh position={[0, 0.75, 0]} castShadow>
              <cylinderGeometry args={[0.1, 0.15, 1.5, 6]} />
              <meshStandardMaterial color="#5c3d1e" />
            </mesh>
            {/* Canopy */}
            <mesh position={[0, 1.8, 0]} castShadow>
              <coneGeometry args={[0.6, 1.5, 6]} />
              <meshStandardMaterial color="#1a5c1a" flatShading />
            </mesh>
          </group>
        ))}
      </group>
    </group>
  );
}
