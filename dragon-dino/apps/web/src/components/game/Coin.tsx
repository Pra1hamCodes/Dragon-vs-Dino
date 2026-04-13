import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface CoinProps {
  position: [number, number, number];
  onCollect: () => void;
}

export default function Coin({ position }: CoinProps) {
  const meshRef = useRef<THREE.Mesh>(null!);
  const timeOffset = useRef(Math.random() * Math.PI * 2);

  useFrame((state) => {
    if (!meshRef.current) return;
    const t = state.clock.elapsedTime + timeOffset.current;
    meshRef.current.rotation.y += 0.05;
    meshRef.current.position.y = position[1] + Math.sin(t * 2.5) * 0.2;
    meshRef.current.position.x = position[0];
    meshRef.current.position.z = position[2];
  });

  return (
    <mesh ref={meshRef} position={position} castShadow>
      <cylinderGeometry args={[0.3, 0.3, 0.07, 20]} />
      <meshStandardMaterial
        color="#FFD700"
        emissive="#FF8C00"
        emissiveIntensity={0.6}
        metalness={0.85}
        roughness={0.15}
      />
    </mesh>
  );
}
