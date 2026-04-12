import { useRef, useEffect, useCallback } from 'react';
import { useFrame } from '@react-three/fiber';
import { useBox } from '@react-three/cannon';
import * as THREE from 'three';
import { useGameStore } from '@/stores/gameStore';

const JUMP_FORCE = 12;
const DODGE_SPEED = 8;
const MAX_X = 3;
const MIN_X = -3;

export function Dino() {
  const status = useGameStore((s) => s.status);
  const activePowerups = useGameStore((s) => s.activePowerups);

  const targetXRef = useRef(0);
  const canJumpRef = useRef(true);
  const doubleJumpRef = useRef(false);
  const isGroundedRef = useRef(true);
  const bodyGroupRef = useRef<THREE.Group>(null);

  const [ref, api] = useBox<THREE.Group>(() => ({
    mass: 1,
    position: [0, 1, 0],
    args: [0.8, 1.2, 0.8],
    fixedRotation: true,
    onCollide: () => {
      isGroundedRef.current = true;
      canJumpRef.current = true;
      doubleJumpRef.current = false;
    },
  }));

  const positionRef = useRef<number[]>([0, 1, 0]);
  const velocityRef = useRef<number[]>([0, 0, 0]);

  useEffect(() => {
    const unsubPos = api.position.subscribe((p) => (positionRef.current = p));
    const unsubVel = api.velocity.subscribe((v) => (velocityRef.current = v));
    return () => {
      unsubPos();
      unsubVel();
    };
  }, [api]);

  const jump = useCallback(() => {
    if (status !== 'playing') return;

    const hasDoubleJump = activePowerups.some((p) => p.type === 'doubleJump');

    if (isGroundedRef.current && canJumpRef.current) {
      api.velocity.set(velocityRef.current[0] ?? 0, JUMP_FORCE, velocityRef.current[2] ?? 0);
      isGroundedRef.current = false;
      canJumpRef.current = false;
      if (hasDoubleJump) doubleJumpRef.current = true;
    } else if (doubleJumpRef.current) {
      api.velocity.set(velocityRef.current[0] ?? 0, JUMP_FORCE * 0.8, velocityRef.current[2] ?? 0);
      doubleJumpRef.current = false;
    }
  }, [status, api, activePowerups]);

  const dodgeLeft = useCallback(() => {
    if (status !== 'playing') return;
    targetXRef.current = Math.max(targetXRef.current - 2, MIN_X);
  }, [status]);

  const dodgeRight = useCallback(() => {
    if (status !== 'playing') return;
    targetXRef.current = Math.min(targetXRef.current + 2, MAX_X);
  }, [status]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      switch (e.key) {
        case ' ':
        case 'ArrowUp':
        case 'w':
          e.preventDefault();
          jump();
          break;
        case 'ArrowLeft':
        case 'a':
          dodgeLeft();
          break;
        case 'ArrowRight':
        case 'd':
          dodgeRight();
          break;
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [jump, dodgeLeft, dodgeRight]);

  // Check grounded
  useFrame(() => {
    if ((positionRef.current[1] ?? 0) < 1.1 && (velocityRef.current[1] ?? 0) < 0.1) {
      isGroundedRef.current = true;
      canJumpRef.current = true;
    }

    // Smooth X lerp
    const currentX = positionRef.current[0] ?? 0;
    const newX = THREE.MathUtils.lerp(currentX, targetXRef.current, 0.15);
    api.position.set(newX, positionRef.current[1] ?? 1, positionRef.current[2] ?? 0);

    // Leg animation
    if (bodyGroupRef.current && status === 'playing' && isGroundedRef.current) {
      const time = Date.now() * 0.01;
      const children = bodyGroupRef.current.children;
      const leftLeg = children[3];
      const rightLeg = children[4];
      if (leftLeg) leftLeg.rotation.x = Math.sin(time) * 0.5;
      if (rightLeg) rightLeg.rotation.x = Math.sin(time + Math.PI) * 0.5;
    }
  });

  const hasShield = activePowerups.some((p) => p.type === 'shield');
  const bodyColor = status === 'gameover' ? '#666' : '#22c55e';

  return (
    <group ref={ref}>
      <group ref={bodyGroupRef}>
        {/* Body */}
        <mesh position={[0, 0, 0]} castShadow>
          <boxGeometry args={[0.6, 0.8, 0.5]} />
          <meshStandardMaterial color={bodyColor} />
        </mesh>
        {/* Head */}
        <mesh position={[0.3, 0.5, 0]} castShadow>
          <boxGeometry args={[0.5, 0.4, 0.4]} />
          <meshStandardMaterial color={bodyColor} />
        </mesh>
        {/* Eye */}
        <mesh position={[0.5, 0.6, 0.15]}>
          <sphereGeometry args={[0.06]} />
          <meshBasicMaterial color="white" />
        </mesh>
        {/* Left leg */}
        <mesh position={[-0.15, -0.6, 0]} castShadow>
          <boxGeometry args={[0.15, 0.4, 0.15]} />
          <meshStandardMaterial color={bodyColor} />
        </mesh>
        {/* Right leg */}
        <mesh position={[0.15, -0.6, 0]} castShadow>
          <boxGeometry args={[0.15, 0.4, 0.15]} />
          <meshStandardMaterial color={bodyColor} />
        </mesh>
        {/* Tail */}
        <mesh position={[-0.5, 0.1, 0]} castShadow rotation={[0, 0, -0.3]}>
          <boxGeometry args={[0.5, 0.15, 0.15]} />
          <meshStandardMaterial color={bodyColor} />
        </mesh>
      </group>

      {/* Shield */}
      {hasShield && (
        <mesh>
          <sphereGeometry args={[1.2, 16, 16]} />
          <meshBasicMaterial color="#00bfff" transparent opacity={0.2} side={THREE.DoubleSide} />
        </mesh>
      )}
    </group>
  );
}
