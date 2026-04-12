import { useRef, useMemo, useCallback, useImperativeHandle, forwardRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Sparkles } from '@react-three/drei';

interface ParticleBurst {
  position: THREE.Vector3;
  color: THREE.Color;
  count: number;
  speed: number;
  life: number;
  maxLife: number;
  velocities: Float32Array;
  offsets: Float32Array;
}

export interface ParticlesHandle {
  emitCoinBurst: (x: number, y: number, z: number) => void;
  emitLandingDust: (x: number, y: number, z: number) => void;
  emitHitBurst: (x: number, y: number, z: number) => void;
}

const MAX_BURST_PARTICLES = 30;

const Particles = forwardRef<ParticlesHandle>(function Particles(_, ref) {
  const burstMeshRef = useRef<THREE.InstancedMesh>(null!);
  const burstsRef = useRef<ParticleBurst[]>([]);
  const tempMatrix = useMemo(() => new THREE.Matrix4(), []);
  const tempColor = useMemo(() => new THREE.Color(), []);
  const tempVec = useMemo(() => new THREE.Vector3(), []);

  const maxInstances = 150; // 5 concurrent bursts * 30 particles

  const createBurst = useCallback(
    (x: number, y: number, z: number, color: THREE.Color, count: number, speed: number, maxLife: number) => {
      const velocities = new Float32Array(count * 3);
      const offsets = new Float32Array(count * 3);

      for (let i = 0; i < count; i++) {
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.random() * Math.PI;
        const spd = speed * (0.5 + Math.random() * 0.5);

        velocities[i * 3] = Math.sin(phi) * Math.cos(theta) * spd;
        velocities[i * 3 + 1] = Math.abs(Math.cos(phi)) * spd;
        velocities[i * 3 + 2] = Math.sin(phi) * Math.sin(theta) * spd;

        offsets[i * 3] = 0;
        offsets[i * 3 + 1] = 0;
        offsets[i * 3 + 2] = 0;
      }

      const burst: ParticleBurst = {
        position: new THREE.Vector3(x, y, z),
        color: color.clone(),
        count,
        speed,
        life: maxLife,
        maxLife,
        velocities,
        offsets,
      };

      burstsRef.current.push(burst);

      // Limit concurrent bursts
      if (burstsRef.current.length > 5) {
        burstsRef.current.shift();
      }
    },
    [],
  );

  useImperativeHandle(
    ref,
    () => ({
      emitCoinBurst: (x: number, y: number, z: number) => {
        createBurst(x, y, z, new THREE.Color('#FFD700'), MAX_BURST_PARTICLES, 4, 0.6);
      },
      emitLandingDust: (x: number, y: number, z: number) => {
        createBurst(x, y, z, new THREE.Color('#C8B88A'), 15, 2, 0.4);
      },
      emitHitBurst: (x: number, y: number, z: number) => {
        createBurst(x, y, z, new THREE.Color('#FF4444'), 20, 5, 0.5);
      },
    }),
    [createBurst],
  );

  useFrame((_, delta) => {
    if (!burstMeshRef.current) return;

    let instanceIdx = 0;

    for (let b = burstsRef.current.length - 1; b >= 0; b--) {
      const burst = burstsRef.current[b]!;
      burst.life -= delta;

      if (burst.life <= 0) {
        burstsRef.current.splice(b, 1);
        continue;
      }

      const lifeFraction = burst.life / burst.maxLife;

      for (let i = 0; i < burst.count; i++) {
        if (instanceIdx >= maxInstances) break;

        // Update offsets with velocity and gravity
        burst.offsets[i * 3]! += (burst.velocities[i * 3] ?? 0) * delta;
        burst.offsets[i * 3 + 1]! += (burst.velocities[i * 3 + 1] ?? 0) * delta;
        burst.offsets[i * 3 + 2]! += (burst.velocities[i * 3 + 2] ?? 0) * delta;

        // Gravity
        burst.velocities[i * 3 + 1] = (burst.velocities[i * 3 + 1] ?? 0) - 9.8 * delta;

        tempVec.set(
          burst.position.x + (burst.offsets[i * 3] ?? 0),
          burst.position.y + (burst.offsets[i * 3 + 1] ?? 0),
          burst.position.z + (burst.offsets[i * 3 + 2] ?? 0),
        );

        const scale = lifeFraction * 0.08;
        tempMatrix.makeScale(scale, scale, scale);
        tempMatrix.setPosition(tempVec);

        burstMeshRef.current.setMatrixAt(instanceIdx, tempMatrix);
        tempColor.copy(burst.color);
        tempColor.multiplyScalar(0.5 + lifeFraction * 0.5);
        burstMeshRef.current.setColorAt(instanceIdx, tempColor);

        instanceIdx++;
      }
    }

    // Hide remaining instances
    for (let i = instanceIdx; i < maxInstances; i++) {
      tempMatrix.makeScale(0, 0, 0);
      tempMatrix.setPosition(0, -100, 0);
      burstMeshRef.current.setMatrixAt(i, tempMatrix);
    }

    burstMeshRef.current.instanceMatrix.needsUpdate = true;
    if (burstMeshRef.current.instanceColor) {
      burstMeshRef.current.instanceColor.needsUpdate = true;
    }
  });

  return (
    <>
      {/* Ambient floating dust */}
      <Sparkles count={60} scale={[30, 10, 10]} size={1.5} speed={0.3} opacity={0.3} color="#C8B88A" />

      {/* Burst particles using instancedMesh */}
      <instancedMesh ref={burstMeshRef} args={[undefined, undefined, maxInstances]} frustumCulled={false}>
        <sphereGeometry args={[1, 6, 6]} />
        <meshBasicMaterial toneMapped={false} />
      </instancedMesh>
    </>
  );
});

export default Particles;
