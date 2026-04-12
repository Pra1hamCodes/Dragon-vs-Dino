import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useSphere } from '@react-three/cannon';
import * as THREE from 'three';

interface CoinProps {
  position: [number, number, number];
  onCollect: () => void;
}

export default function Coin({ position, onCollect }: CoinProps) {
  const meshRef = useRef<THREE.Mesh>(null!);
  const collected = useRef(false);
  const initialY = position[1];
  const timeOffset = useRef(Math.random() * Math.PI * 2);

  const [colliderRef] = useSphere(() => ({
    type: 'Static',
    position,
    args: [0.5],
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
    meshRef.current.rotation.y += 0.04;

    // Bob up and down
    meshRef.current.position.y = initialY + Math.sin(t * 2.5) * 0.25;
  });

  if (collected.current) return null;

  return (
    <group ref={colliderRef as React.Ref<THREE.Group>}>
      <mesh ref={meshRef} position={[position[0], position[1], position[2]]} castShadow>
        <cylinderGeometry args={[0.35, 0.35, 0.08, 24]} />
        <meshStandardMaterial
          color="#FFD700"
          emissive="#FF8C00"
          emissiveIntensity={0.5}
          metalness={0.8}
          roughness={0.2}
        />
      </mesh>
    </group>
  );
}
