import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useBox } from '@react-three/cannon';
import * as THREE from 'three';

interface DragonProps {
  position: [number, number, number];
  speed: number;
  type: 'flying' | 'low' | 'cluster' | 'boss';
  onPassed: () => void;
}

export function Dragon({ position, speed, type, onPassed }: DragonProps) {
  const passedRef = useRef(false);
  const wingRef = useRef<THREE.Mesh>(null);
  const wingRef2 = useRef<THREE.Mesh>(null);

  const scale = type === 'boss' ? 2 : 1;
  const bodyHeight = type === 'low' ? 3 : type === 'flying' ? 1.2 : 1.2;

  const [ref, api] = useBox<THREE.Group>(() => ({
    mass: 0,
    position: [position[0], bodyHeight, position[2]],
    args: [1.2 * scale, 0.8 * scale, 0.6 * scale],
    type: 'Kinematic',
  }));

  const posRef = useRef<[number, number, number]>([position[0], bodyHeight, position[2]]);

  useFrame((_, delta) => {
    const newX = posRef.current[0] - speed * delta;
    posRef.current = [newX, bodyHeight, posRef.current[2]];
    api.position.set(newX, bodyHeight, posRef.current[2]);

    // Wing flap
    const time = Date.now() * 0.008;
    if (wingRef.current) wingRef.current.rotation.z = Math.sin(time) * 0.6 + 0.3;
    if (wingRef2.current) wingRef2.current.rotation.z = -Math.sin(time) * 0.6 - 0.3;

    // Check if passed player
    if (newX < -5 && !passedRef.current) {
      passedRef.current = true;
      onPassed();
    }
  });

  const bodyColor = type === 'boss' ? '#ff2200' : '#dc2626';
  const emissiveIntensity = type === 'boss' ? 0.3 : 0;

  return (
    <group ref={ref} scale={scale}>
      {/* Body */}
      <mesh castShadow>
        <boxGeometry args={[1.2, 0.5, 0.4]} />
        <meshStandardMaterial color={bodyColor} emissive={bodyColor} emissiveIntensity={emissiveIntensity} />
      </mesh>
      {/* Head */}
      <mesh position={[0.6, 0.15, 0]} castShadow>
        <boxGeometry args={[0.4, 0.3, 0.3]} />
        <meshStandardMaterial color={bodyColor} />
      </mesh>
      {/* Eye */}
      <mesh position={[0.75, 0.25, 0.1]}>
        <sphereGeometry args={[0.05]} />
        <meshBasicMaterial color="#ffff00" />
      </mesh>
      {/* Left wing */}
      <mesh ref={wingRef} position={[0, 0.2, 0.4]} castShadow>
        <boxGeometry args={[0.8, 0.05, 0.6]} />
        <meshStandardMaterial color="#991b1b" />
      </mesh>
      {/* Right wing */}
      <mesh ref={wingRef2} position={[0, 0.2, -0.4]} castShadow>
        <boxGeometry args={[0.8, 0.05, 0.6]} />
        <meshStandardMaterial color="#991b1b" />
      </mesh>
      {/* Tail */}
      <mesh position={[-0.8, 0, 0]} rotation={[0, 0, 0.2]}>
        <boxGeometry args={[0.6, 0.1, 0.1]} />
        <meshStandardMaterial color={bodyColor} />
      </mesh>
    </group>
  );
}
