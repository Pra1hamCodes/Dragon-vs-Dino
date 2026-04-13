import { useRef, useEffect, useCallback } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useGameStore } from '@/stores/gameStore';

const GRAVITY = -38;
const JUMP_VEL = 15;
const DOUBLE_JUMP_VEL = 12.5;
const GROUND_Y = 0.7;
const MAX_X = 3;
const MIN_X = -3;
const DODGE_LERP = 0.12;

export function Dino() {
  const status = useGameStore((s) => s.status);
  const activePowerups = useGameStore((s) => s.activePowerups);
  const invincibleUntil = useGameStore((s) => s.invincibleUntil);

  const groupRef = useRef<THREE.Group>(null);
  const bodyRef = useRef<THREE.Group>(null);

  // Physics state (manual, not cannon)
  const posRef = useRef(new THREE.Vector3(0, GROUND_Y, 0));
  const velYRef = useRef(0);
  const targetXRef = useRef(0);
  const isGroundedRef = useRef(true);
  const canDoubleJumpRef = useRef(false);

  // Animation state
  const squashRef = useRef(1); // 1 = normal, <1 = squash, >1 = stretch
  const tiltRef = useRef(0);

  const jump = useCallback(() => {
    if (status !== 'playing') return;
    const hasDoubleJump = activePowerups.some((p) => p.type === 'doubleJump');

    if (isGroundedRef.current) {
      velYRef.current = JUMP_VEL;
      isGroundedRef.current = false;
      squashRef.current = 1.25; // stretch on jump
      if (hasDoubleJump) canDoubleJumpRef.current = true;
    } else if (canDoubleJumpRef.current) {
      velYRef.current = DOUBLE_JUMP_VEL;
      canDoubleJumpRef.current = false;
      squashRef.current = 1.3;
    }
  }, [status, activePowerups]);

  const dodgeLeft = useCallback(() => {
    if (status !== 'playing') return;
    targetXRef.current = Math.max(targetXRef.current - 2, MIN_X);
  }, [status]);

  const dodgeRight = useCallback(() => {
    if (status !== 'playing') return;
    targetXRef.current = Math.min(targetXRef.current + 2, MAX_X);
  }, [status]);

  // Keyboard
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      switch (e.key) {
        case ' ':
        case 'ArrowUp':
        case 'w':
        case 'W':
          e.preventDefault();
          jump();
          break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
          dodgeLeft();
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          dodgeRight();
          break;
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [jump, dodgeLeft, dodgeRight]);

  // Touch
  useEffect(() => {
    let startY = 0;
    let startX = 0;
    const onStart = (e: TouchEvent) => {
      const t = e.touches[0];
      if (!t) return;
      startY = t.clientY;
      startX = t.clientX;
    };
    const onEnd = (e: TouchEvent) => {
      const t = e.changedTouches[0];
      if (!t) return;
      const dy = startY - t.clientY;
      const dx = t.clientX - startX;
      if (Math.abs(dy) > Math.abs(dx) && dy > 30) jump();
      else if (dx > 40) dodgeRight();
      else if (dx < -40) dodgeLeft();
      else if (Math.abs(dy) < 10 && Math.abs(dx) < 10) jump(); // tap = jump
    };
    window.addEventListener('touchstart', onStart, { passive: true });
    window.addEventListener('touchend', onEnd, { passive: true });
    return () => {
      window.removeEventListener('touchstart', onStart);
      window.removeEventListener('touchend', onEnd);
    };
  }, [jump, dodgeLeft, dodgeRight]);

  useFrame((_, delta) => {
    if (!groupRef.current || !bodyRef.current) return;
    const dt = Math.min(delta, 0.05); // cap for tab-away

    if (status === 'playing') {
      // Gravity + position
      velYRef.current += GRAVITY * dt;
      posRef.current.y += velYRef.current * dt;

      if (posRef.current.y <= GROUND_Y) {
        posRef.current.y = GROUND_Y;
        if (!isGroundedRef.current) {
          squashRef.current = 0.75; // squash on land
        }
        velYRef.current = 0;
        isGroundedRef.current = true;
      }

      // Smooth X dodge
      const prevX = posRef.current.x;
      posRef.current.x = THREE.MathUtils.lerp(posRef.current.x, targetXRef.current, DODGE_LERP);
      tiltRef.current = (posRef.current.x - prevX) * 3; // lean into dodge
    }

    // Apply position
    groupRef.current.position.copy(posRef.current);
    setDinoPosition(posRef.current);

    // Squash/stretch decay
    squashRef.current = THREE.MathUtils.lerp(squashRef.current, 1, 0.12);
    const sy = squashRef.current;
    const sx = 1 / Math.sqrt(sy); // preserve volume
    bodyRef.current.scale.set(sx, sy, sx);

    // Tilt
    bodyRef.current.rotation.z = THREE.MathUtils.lerp(bodyRef.current.rotation.z, -tiltRef.current * 0.15, 0.1);
    tiltRef.current *= 0.92;

    // Leg run animation
    if (status === 'playing' && isGroundedRef.current) {
      const t = Date.now() * 0.018;
      const ll = bodyRef.current.children[4]; // left leg group
      const rl = bodyRef.current.children[5]; // right leg group
      if (ll) ll.rotation.x = Math.sin(t) * 0.7;
      if (rl) rl.rotation.x = Math.sin(t + Math.PI) * 0.7;
    }

    // Tail wag
    const tail = bodyRef.current.children[6];
    if (tail) tail.rotation.y = Math.sin(Date.now() * 0.006) * 0.35;

    // Invincibility blink
    const isInv = Date.now() < invincibleUntil;
    bodyRef.current.visible = isInv ? Math.sin(Date.now() * 0.025) > 0 : true;
  });

  const hasShield = activePowerups.some((p) => p.type === 'shield');
  const bodyColor = status === 'gameover' ? '#555' : '#4ade80';
  const bellyColor = '#bbf7d0';
  const spikeColor = '#16a34a';

  return (
    <group ref={groupRef}>
      <group ref={bodyRef}>
        {/* Body */}
        <mesh castShadow>
          <sphereGeometry args={[0.45, 14, 12]} />
          <meshStandardMaterial color={bodyColor} roughness={0.55} />
        </mesh>

        {/* Belly */}
        <mesh position={[0.08, -0.08, 0]}>
          <sphereGeometry args={[0.32, 10, 8]} />
          <meshStandardMaterial color={bellyColor} roughness={0.65} />
        </mesh>

        {/* Head */}
        <mesh position={[0.35, 0.35, 0]} castShadow>
          <sphereGeometry args={[0.28, 12, 10]} />
          <meshStandardMaterial color={bodyColor} roughness={0.55} />
        </mesh>

        {/* Snout */}
        <mesh position={[0.56, 0.28, 0]} castShadow>
          <boxGeometry args={[0.22, 0.14, 0.18]} />
          <meshStandardMaterial color={bodyColor} roughness={0.55} />
        </mesh>

        {/* Left leg */}
        <group position={[-0.12, -0.45, 0.14]}>
          <mesh castShadow>
            <capsuleGeometry args={[0.07, 0.22, 4, 8]} />
            <meshStandardMaterial color={bodyColor} roughness={0.6} />
          </mesh>
          <mesh position={[0.04, -0.18, 0]}>
            <boxGeometry args={[0.13, 0.05, 0.1]} />
            <meshStandardMaterial color={spikeColor} />
          </mesh>
        </group>

        {/* Right leg */}
        <group position={[-0.12, -0.45, -0.14]}>
          <mesh castShadow>
            <capsuleGeometry args={[0.07, 0.22, 4, 8]} />
            <meshStandardMaterial color={bodyColor} roughness={0.6} />
          </mesh>
          <mesh position={[0.04, -0.18, 0]}>
            <boxGeometry args={[0.13, 0.05, 0.1]} />
            <meshStandardMaterial color={spikeColor} />
          </mesh>
        </group>

        {/* Tail */}
        <group position={[-0.5, 0.1, 0]} rotation={[0, 0, -0.25]}>
          <mesh castShadow>
            <coneGeometry args={[0.11, 0.65, 6]} />
            <meshStandardMaterial color={bodyColor} roughness={0.6} />
          </mesh>
        </group>

        {/* Eyes */}
        <mesh position={[0.52, 0.44, 0.13]}>
          <sphereGeometry args={[0.065, 8, 8]} />
          <meshBasicMaterial color="white" />
        </mesh>
        <mesh position={[0.56, 0.44, 0.145]}>
          <sphereGeometry args={[0.035, 8, 8]} />
          <meshBasicMaterial color="#111" />
        </mesh>
        <mesh position={[0.52, 0.44, -0.13]}>
          <sphereGeometry args={[0.065, 8, 8]} />
          <meshBasicMaterial color="white" />
        </mesh>
        <mesh position={[0.56, 0.44, -0.145]}>
          <sphereGeometry args={[0.035, 8, 8]} />
          <meshBasicMaterial color="#111" />
        </mesh>

        {/* Back spikes */}
        {[-0.1, 0.02, 0.14, 0.24].map((x, i) => (
          <mesh key={i} position={[x - 0.15, 0.45 - i * 0.04, 0]} rotation={[0, 0, 0.2]} castShadow>
            <coneGeometry args={[0.035, 0.14 - i * 0.015, 4]} />
            <meshStandardMaterial color={spikeColor} roughness={0.4} />
          </mesh>
        ))}

        {/* Nostrils */}
        <mesh position={[0.66, 0.31, 0.05]}>
          <sphereGeometry args={[0.018, 6, 6]} />
          <meshBasicMaterial color="#166534" />
        </mesh>
        <mesh position={[0.66, 0.31, -0.05]}>
          <sphereGeometry args={[0.018, 6, 6]} />
          <meshBasicMaterial color="#166534" />
        </mesh>

        {/* Smile line */}
        <mesh position={[0.6, 0.24, 0.08]} rotation={[0, 0.3, 0]}>
          <boxGeometry args={[0.08, 0.008, 0.004]} />
          <meshBasicMaterial color="#166534" />
        </mesh>
      </group>

      {/* Shield */}
      {hasShield && (
        <mesh>
          <sphereGeometry args={[1.1, 24, 24]} />
          <meshPhysicalMaterial
            color="#38bdf8"
            transparent
            opacity={0.12}
            roughness={0}
            metalness={0.3}
            side={THREE.DoubleSide}
          />
        </mesh>
      )}
    </group>
  );
}

/** Returns the dino's current bounding box for manual collision */
export function getDinoBounds(): { min: THREE.Vector3; max: THREE.Vector3 } | null {
  const store = useGameStore.getState();
  if (store.status !== 'playing') return null;
  // We track position via the store's distance + the ref, but we'll use a simpler approach:
  // The dino sits around x=0 (or dodged), y=GROUND_Y..jump height
  // We expose a global for ObstacleManager to read
  return _dinoBounds;
}

let _dinoBounds: { min: THREE.Vector3; max: THREE.Vector3 } = {
  min: new THREE.Vector3(-0.4, 0, -0.4),
  max: new THREE.Vector3(0.4, 1.4, 0.4),
};

/** Call from useFrame to update bounds */
export function updateDinoBounds(pos: THREE.Vector3) {
  _dinoBounds.min.set(pos.x - 0.4, pos.y - 0.6, pos.z - 0.4);
  _dinoBounds.max.set(pos.x + 0.4, pos.y + 0.6, pos.z + 0.4);
}

// Re-export a getter for the position ref so ObstacleManager can do collision
let _dinoPos = new THREE.Vector3(0, GROUND_Y, 0);
export function getDinoPosition() {
  return _dinoPos;
}
export function setDinoPosition(v: THREE.Vector3) {
  _dinoPos.copy(v);
  updateDinoBounds(v);
}
