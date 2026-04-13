import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useGameStore } from '@/stores/gameStore';

const BIOME_COLORS = [
  { ground: '#2d5a1e', path: '#3a6b2a', fog: '#1a0a2e' },  // Forest
  { ground: '#c4a265', path: '#b8955a', fog: '#2e1a0a' },  // Desert
  { ground: '#d4d8dc', path: '#c0c4c8', fog: '#1a2a3e' },  // Snow
  { ground: '#3d1c00', path: '#4a2500', fog: '#2e0a0a' },  // Volcanic
];

function Tree({ position, biome }: { position: [number, number, number]; biome: number }) {
  const trunkColor = biome === 2 ? '#4a3828' : biome === 3 ? '#2a1a0a' : '#6b4226';
  const leafColor = biome === 1 ? '#8b7355' : biome === 2 ? '#2a6e2a' : biome === 3 ? '#1a1a1a' : '#1a7a1a';
  const scale = 0.7 + Math.random() * 0.6;

  if (biome === 1) {
    // Desert - cactus
    return (
      <group position={position} scale={scale}>
        <mesh position={[0, 1, 0]} castShadow>
          <cylinderGeometry args={[0.12, 0.15, 2, 8]} />
          <meshStandardMaterial color="#2d6b2d" roughness={0.7} />
        </mesh>
        <mesh position={[0.25, 1.2, 0]} rotation={[0, 0, -0.8]} castShadow>
          <cylinderGeometry args={[0.07, 0.09, 0.6, 6]} />
          <meshStandardMaterial color="#2d6b2d" roughness={0.7} />
        </mesh>
        <mesh position={[-0.2, 0.8, 0]} rotation={[0, 0, 0.9]} castShadow>
          <cylinderGeometry args={[0.06, 0.08, 0.5, 6]} />
          <meshStandardMaterial color="#2d6b2d" roughness={0.7} />
        </mesh>
      </group>
    );
  }

  if (biome === 2) {
    // Snow - pine
    return (
      <group position={position} scale={scale}>
        <mesh position={[0, 0.6, 0]} castShadow>
          <cylinderGeometry args={[0.06, 0.1, 1.2, 6]} />
          <meshStandardMaterial color={trunkColor} roughness={0.8} />
        </mesh>
        {[0, 0.5, 1.0].map((y, i) => (
          <mesh key={i} position={[0, 1.2 + y * 0.6, 0]} castShadow>
            <coneGeometry args={[0.5 - i * 0.12, 0.7, 8]} />
            <meshStandardMaterial color="#1a5c2e" flatShading roughness={0.8} />
          </mesh>
        ))}
        {/* Snow caps */}
        <mesh position={[0, 2.5, 0]}>
          <coneGeometry args={[0.2, 0.15, 6]} />
          <meshStandardMaterial color="white" roughness={0.9} />
        </mesh>
      </group>
    );
  }

  // Forest / volcanic - deciduous
  return (
    <group position={position} scale={scale}>
      <mesh position={[0, 0.75, 0]} castShadow>
        <cylinderGeometry args={[0.08, 0.12, 1.5, 6]} />
        <meshStandardMaterial color={trunkColor} roughness={0.8} />
      </mesh>
      <mesh position={[0, 2.0, 0]} castShadow>
        <sphereGeometry args={[0.6, 8, 6]} />
        <meshStandardMaterial color={leafColor} flatShading roughness={0.8} />
      </mesh>
      <mesh position={[0.3, 1.7, 0.2]} castShadow>
        <sphereGeometry args={[0.4, 6, 5]} />
        <meshStandardMaterial color={leafColor} flatShading roughness={0.8} />
      </mesh>
      <mesh position={[-0.25, 1.8, -0.15]} castShadow>
        <sphereGeometry args={[0.35, 6, 5]} />
        <meshStandardMaterial color={leafColor} flatShading roughness={0.8} />
      </mesh>
    </group>
  );
}

function Rock({ position, scale }: { position: [number, number, number]; scale: number }) {
  return (
    <mesh position={position} scale={scale} castShadow rotation={[0, Math.random() * Math.PI, 0]}>
      <dodecahedronGeometry args={[0.5, 0]} />
      <meshStandardMaterial color="#6b6b6b" flatShading roughness={0.9} />
    </mesh>
  );
}

export function Terrain() {
  const speed = useGameStore((s) => s.speed);
  const status = useGameStore((s) => s.status);
  const biome = useGameStore((s) => s.biome);

  const mountainsRef = useRef<THREE.Group>(null);
  const farMountainsRef = useRef<THREE.Group>(null);
  const treesRef = useRef<THREE.Group>(null);
  const scrollRef = useRef(0);

  // Generate trees
  const treePositions = useMemo(() => {
    const positions: Array<[number, number, number]> = [];
    for (let i = 0; i < 40; i++) {
      positions.push([
        (Math.random() - 0.5) * 70 - 5,
        0,
        -4 - Math.random() * 12,
      ]);
    }
    return positions;
  }, []);

  // Generate rocks along path
  const rockPositions = useMemo(() => {
    const positions: Array<{ pos: [number, number, number]; scale: number }> = [];
    for (let i = 0; i < 20; i++) {
      positions.push({
        pos: [
          (Math.random() - 0.5) * 60,
          0.15,
          -2 - Math.random() * 3,
        ],
        scale: 0.3 + Math.random() * 0.5,
      });
    }
    return positions;
  }, []);

  // Near mountains
  const mountainPositions = useMemo(() => {
    const positions: Array<{ pos: [number, number, number]; scale: [number, number, number]; color: string }> = [];
    for (let i = 0; i < 15; i++) {
      positions.push({
        pos: [(Math.random() - 0.5) * 80, 0, -18 - Math.random() * 12],
        scale: [3 + Math.random() * 3, 6 + Math.random() * 10, 3 + Math.random() * 3],
        color: `hsl(${260 + Math.random() * 30}, ${20 + Math.random() * 15}%, ${25 + Math.random() * 15}%)`,
      });
    }
    return positions;
  }, []);

  // Far mountains (background)
  const farMountainPositions = useMemo(() => {
    const positions: Array<{ pos: [number, number, number]; scale: [number, number, number]; color: string }> = [];
    for (let i = 0; i < 10; i++) {
      positions.push({
        pos: [(Math.random() - 0.5) * 120, 0, -35 - Math.random() * 15],
        scale: [6 + Math.random() * 6, 10 + Math.random() * 15, 5 + Math.random() * 5],
        color: `hsl(${250 + Math.random() * 20}, ${15 + Math.random() * 10}%, ${18 + Math.random() * 10}%)`,
      });
    }
    return positions;
  }, []);

  const biomeIndex = Math.min(biome, BIOME_COLORS.length - 1);
  const currentBiome = BIOME_COLORS[biomeIndex] ?? BIOME_COLORS[0]!;

  useFrame((_, delta) => {
    if (status !== 'playing') return;

    scrollRef.current += speed * delta;

    // Parallax: far mountains slow, near mountains medium, trees fast
    if (farMountainsRef.current) {
      farMountainsRef.current.position.x = -(scrollRef.current * 0.15) % 120;
    }
    if (mountainsRef.current) {
      mountainsRef.current.position.x = -(scrollRef.current * 0.3) % 80;
    }
    if (treesRef.current) {
      treesRef.current.position.x = -(scrollRef.current * 0.5) % 70;
    }
  });

  return (
    <group>
      {/* Ground */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[120, 40]} />
        <meshStandardMaterial color={currentBiome.ground} roughness={0.95} />
      </mesh>

      {/* Running path (lighter strip) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]} receiveShadow>
        <planeGeometry args={[120, 6]} />
        <meshStandardMaterial color={currentBiome.path} roughness={0.85} />
      </mesh>

      {/* Path edge lines */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 3]}>
        <planeGeometry args={[120, 0.05]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.15} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, -3]}>
        <planeGeometry args={[120, 0.05]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.15} />
      </mesh>

      {/* Far mountains (slowest parallax) */}
      <group ref={farMountainsRef}>
        {farMountainPositions.map((m, i) => (
          <mesh key={`far-${i}`} position={m.pos} scale={m.scale}>
            <coneGeometry args={[1, 1, 5]} />
            <meshStandardMaterial color={m.color} flatShading roughness={0.9} />
          </mesh>
        ))}
      </group>

      {/* Near mountains */}
      <group ref={mountainsRef}>
        {mountainPositions.map((m, i) => (
          <group key={`mt-${i}`}>
            <mesh position={m.pos} scale={m.scale}>
              <coneGeometry args={[1, 1, 5]} />
              <meshStandardMaterial color={m.color} flatShading roughness={0.85} />
            </mesh>
            {/* Snow caps on tall mountains */}
            {m.scale[1] > 10 && (
              <mesh position={[m.pos[0], m.scale[1] * 0.45, m.pos[2]]} scale={[m.scale[0] * 0.3, m.scale[1] * 0.15, m.scale[2] * 0.3]}>
                <coneGeometry args={[1, 1, 5]} />
                <meshStandardMaterial color="#e8e8f0" flatShading roughness={0.9} />
              </mesh>
            )}
          </group>
        ))}
      </group>

      {/* Trees */}
      <group ref={treesRef}>
        {treePositions.map((pos, i) => (
          <Tree key={`tree-${i}`} position={pos} biome={biomeIndex} />
        ))}
      </group>

      {/* Rocks along the path edges */}
      {rockPositions.map((r, i) => (
        <Rock key={`rock-${i}`} position={r.pos} scale={r.scale} />
      ))}

      {/* Ground fog near terrain */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.05, -10]}>
        <planeGeometry args={[100, 20]} />
        <meshBasicMaterial color={currentBiome.ground} transparent opacity={0.3} />
      </mesh>
    </group>
  );
}
