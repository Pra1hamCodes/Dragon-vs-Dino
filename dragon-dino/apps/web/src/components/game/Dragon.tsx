import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface DragonProps {
  position: [number, number, number];
  type: 'flying' | 'low' | 'cluster' | 'boss';
}

export function Dragon({ position, type }: DragonProps) {
  const groupRef = useRef<THREE.Group>(null);
  const leftWingRef = useRef<THREE.Group>(null);
  const rightWingRef = useRef<THREE.Group>(null);
  const jawRef = useRef<THREE.Mesh>(null);
  const timeOffsetRef = useRef(Math.random() * 100);

  const scale = type === 'boss' ? 2.0 : type === 'cluster' ? 0.75 : 1;

  useFrame((state) => {
    if (!groupRef.current) return;
    const t = state.clock.elapsedTime + timeOffsetRef.current;

    // Smooth vertical bob for flying types
    let bobY = 0;
    if (type === 'flying') bobY = Math.sin(t * 2.5) * 0.35;
    else if (type === 'boss') bobY = Math.sin(t * 1.5) * 0.5;

    groupRef.current.position.y = position[1] + bobY;

    // Slight z-axis sway
    groupRef.current.position.z = position[2] + Math.sin(t * 1.8) * 0.15;

    // Wing flap — faster for smaller dragons
    const flapSpeed = type === 'boss' ? 5 : type === 'cluster' ? 9 : 7;
    const flapAngle = Math.sin(t * flapSpeed) * 0.65;
    if (leftWingRef.current) leftWingRef.current.rotation.z = flapAngle + 0.35;
    if (rightWingRef.current) rightWingRef.current.rotation.z = -flapAngle - 0.35;

    // Jaw chomp for boss
    if (jawRef.current && type === 'boss') {
      jawRef.current.rotation.x = Math.max(0, Math.sin(t * 3)) * 0.2;
    }

    // Body tilt into movement
    groupRef.current.rotation.z = Math.sin(t * 2) * 0.06;
    groupRef.current.rotation.y = -0.1; // face slightly toward player
  });

  const bodyColor = type === 'boss' ? '#dc2626' : '#b91c1c';
  const wingColor = type === 'boss' ? '#991b1b' : '#7f1d1d';
  const bellyColor = type === 'boss' ? '#fbbf24' : '#f59e0b';
  const eyeColor = type === 'boss' ? '#ff3300' : '#fbbf24';
  const emissive = type === 'boss' ? 0.35 : 0.08;

  return (
    <group ref={groupRef} position={position} scale={scale}>
      {/* Body */}
      <mesh castShadow>
        <sphereGeometry args={[0.48, 12, 10]} />
        <meshStandardMaterial color={bodyColor} emissive={bodyColor} emissiveIntensity={emissive} roughness={0.45} metalness={0.1} />
      </mesh>

      {/* Belly */}
      <mesh position={[0, -0.12, 0]}>
        <sphereGeometry args={[0.33, 10, 8]} />
        <meshStandardMaterial color={bellyColor} roughness={0.6} />
      </mesh>

      {/* Neck */}
      <mesh position={[0.42, 0.18, 0]} rotation={[0, 0, -0.35]} castShadow>
        <capsuleGeometry args={[0.13, 0.28, 4, 8]} />
        <meshStandardMaterial color={bodyColor} roughness={0.45} />
      </mesh>

      {/* Head */}
      <mesh position={[0.68, 0.32, 0]} castShadow>
        <sphereGeometry args={[0.23, 12, 10]} />
        <meshStandardMaterial color={bodyColor} roughness={0.45} metalness={0.1} />
      </mesh>

      {/* Snout */}
      <mesh position={[0.9, 0.28, 0]} castShadow>
        <boxGeometry args={[0.26, 0.11, 0.16]} />
        <meshStandardMaterial color={bodyColor} roughness={0.45} />
      </mesh>

      {/* Lower jaw */}
      <mesh ref={jawRef} position={[0.85, 0.2, 0]}>
        <boxGeometry args={[0.22, 0.05, 0.14]} />
        <meshStandardMaterial color={bodyColor} roughness={0.5} />
      </mesh>

      {/* Teeth */}
      {[0.04, -0.04].map((z, i) => (
        <mesh key={`t${i}`} position={[1.0, 0.24, z]}>
          <coneGeometry args={[0.013, 0.045, 4]} />
          <meshStandardMaterial color="#f0f0f0" />
        </mesh>
      ))}

      {/* Horns */}
      <mesh position={[0.58, 0.52, 0.09]} rotation={[0.3, 0, 0.5]} castShadow>
        <coneGeometry args={[0.035, 0.18, 5]} />
        <meshStandardMaterial color="#3d1a1a" roughness={0.35} />
      </mesh>
      <mesh position={[0.58, 0.52, -0.09]} rotation={[-0.3, 0, 0.5]} castShadow>
        <coneGeometry args={[0.035, 0.18, 5]} />
        <meshStandardMaterial color="#3d1a1a" roughness={0.35} />
      </mesh>

      {/* Eyes */}
      <mesh position={[0.8, 0.4, 0.12]}>
        <sphereGeometry args={[0.055, 8, 8]} />
        <meshBasicMaterial color={eyeColor} />
      </mesh>
      <mesh position={[0.83, 0.4, 0.13]}>
        <sphereGeometry args={[0.025, 6, 6]} />
        <meshBasicMaterial color="#1a0000" />
      </mesh>
      <mesh position={[0.8, 0.4, -0.12]}>
        <sphereGeometry args={[0.055, 8, 8]} />
        <meshBasicMaterial color={eyeColor} />
      </mesh>
      <mesh position={[0.83, 0.4, -0.13]}>
        <sphereGeometry args={[0.025, 6, 6]} />
        <meshBasicMaterial color="#1a0000" />
      </mesh>

      {/* Left wing */}
      <group ref={leftWingRef} position={[-0.08, 0.22, 0.42]}>
        <mesh castShadow>
          <boxGeometry args={[0.75, 0.025, 0.48]} />
          <meshStandardMaterial color={wingColor} roughness={0.65} transparent opacity={0.85} side={THREE.DoubleSide} />
        </mesh>
        <mesh position={[0, 0.015, -0.18]}>
          <boxGeometry args={[0.8, 0.035, 0.035]} />
          <meshStandardMaterial color="#3d1212" roughness={0.4} />
        </mesh>
        <mesh position={[0.32, 0, 0.14]} rotation={[0, 0.4, 0]}>
          <boxGeometry args={[0.28, 0.018, 0.32]} />
          <meshStandardMaterial color={wingColor} roughness={0.65} transparent opacity={0.7} side={THREE.DoubleSide} />
        </mesh>
      </group>

      {/* Right wing */}
      <group ref={rightWingRef} position={[-0.08, 0.22, -0.42]}>
        <mesh castShadow>
          <boxGeometry args={[0.75, 0.025, 0.48]} />
          <meshStandardMaterial color={wingColor} roughness={0.65} transparent opacity={0.85} side={THREE.DoubleSide} />
        </mesh>
        <mesh position={[0, 0.015, 0.18]}>
          <boxGeometry args={[0.8, 0.035, 0.035]} />
          <meshStandardMaterial color="#3d1212" roughness={0.4} />
        </mesh>
        <mesh position={[0.32, 0, -0.14]} rotation={[0, -0.4, 0]}>
          <boxGeometry args={[0.28, 0.018, 0.32]} />
          <meshStandardMaterial color={wingColor} roughness={0.65} transparent opacity={0.7} side={THREE.DoubleSide} />
        </mesh>
      </group>

      {/* Tail segments */}
      <mesh position={[-0.58, 0.02, 0]} castShadow>
        <sphereGeometry args={[0.18, 8, 6]} />
        <meshStandardMaterial color={bodyColor} roughness={0.5} />
      </mesh>
      <mesh position={[-0.85, 0.06, 0]}>
        <sphereGeometry args={[0.12, 8, 6]} />
        <meshStandardMaterial color={bodyColor} roughness={0.5} />
      </mesh>
      <mesh position={[-1.05, 0.1, 0]}>
        <coneGeometry args={[0.08, 0.2, 5]} />
        <meshStandardMaterial color={bodyColor} roughness={0.5} />
      </mesh>
      {/* Tail spike */}
      <mesh position={[-1.14, 0.16, 0]} rotation={[0, 0, 0.7]}>
        <coneGeometry args={[0.03, 0.12, 4]} />
        <meshStandardMaterial color="#3d1a1a" roughness={0.3} />
      </mesh>

      {/* Back spikes */}
      {[-0.28, -0.08, 0.1].map((x, i) => (
        <mesh key={`s${i}`} position={[x, 0.48 - i * 0.025, 0]} rotation={[0, 0, 0.18]} castShadow>
          <coneGeometry args={[0.028, 0.11, 4]} />
          <meshStandardMaterial color="#3d1a1a" roughness={0.3} />
        </mesh>
      ))}

      {/* Boss fire glow */}
      {type === 'boss' && (
        <pointLight position={[1.05, 0.28, 0]} color="#ff4400" intensity={3} distance={4} decay={2} />
      )}
    </group>
  );
}
