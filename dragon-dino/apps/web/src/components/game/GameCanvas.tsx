import { Suspense, useEffect, useCallback, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Stats } from '@react-three/drei';
import * as THREE from 'three';
import SkyShader from './SkyShader';
import { Terrain } from './Terrain';
import { Dino } from './Dino';
import { ObstacleManager } from './ObstacleManager';
import Particles from './Particles';
import { PostProcessing } from './PostProcessing';
import { GameHUD } from './GameHUD';
import { useGameStore } from '@/stores/gameStore';
import { useSettingsStore } from '@/stores/settingsStore';

function LoadingScreen() {
  return (
    <mesh>
      <planeGeometry args={[4, 1]} />
      <meshBasicMaterial color="#FF4D1C" />
    </mesh>
  );
}

/** Smooth camera that follows action + screen-shake */
function CameraRig() {
  const shake = useGameStore((s) => s.shake);
  const status = useGameStore((s) => s.status);
  const basePos = useRef(new THREE.Vector3(-2, 4, 12));
  const currentPos = useRef(new THREE.Vector3(-2, 4, 12));

  useFrame(({ camera }, delta) => {
    // Target slightly ahead and up when playing
    const target = status === 'playing'
      ? basePos.current.set(-1.5, 3.8, 11.5)
      : basePos.current.set(-2, 4, 12);

    currentPos.current.lerp(target, delta * 2);

    // Screen-shake offset
    const shakeX = shake * (Math.random() - 0.5) * 0.5;
    const shakeY = shake * (Math.random() - 0.5) * 0.3;

    camera.position.set(
      currentPos.current.x + shakeX,
      currentPos.current.y + shakeY,
      currentPos.current.z,
    );
    camera.lookAt(2, 1.2, 0);
  });

  return null;
}

export function GameCanvas() {
  const status = useGameStore((s) => s.status);
  const setStatus = useGameStore((s) => s.setStatus);
  const reset = useGameStore((s) => s.reset);
  const showFps = useSettingsStore((s) => s.showFps);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape' && status === 'playing') {
        setStatus('paused');
      } else if (e.key === 'Escape' && status === 'paused') {
        setStatus('playing');
      } else if (e.key === 'Enter' && status === 'idle') {
        reset();
        setStatus('countdown');
        setTimeout(() => setStatus('playing'), 3000);
      } else if (e.key === 'Enter' && status === 'gameover') {
        reset();
        setStatus('countdown');
        setTimeout(() => setStatus('playing'), 3000);
      }
    },
    [status, setStatus, reset]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return (
    <div className="relative h-screen w-screen">
      <Canvas
        gl={{ antialias: true, powerPreference: 'high-performance', alpha: false }}
        dpr={[1, 1.5]}
        shadows
        camera={{ position: [-2, 4, 12], fov: 55, near: 0.1, far: 300 }}
        className="game-canvas"
      >
        <Suspense fallback={<LoadingScreen />}>
          {/* Lighting */}
          <ambientLight intensity={0.3} color="#c8d8ff" />
          <directionalLight
            position={[12, 22, 10]}
            intensity={1.6}
            castShadow
            shadow-mapSize={[2048, 2048]}
            shadow-camera-far={60}
            shadow-camera-left={-25}
            shadow-camera-right={25}
            shadow-camera-top={25}
            shadow-camera-bottom={-25}
            shadow-bias={-0.0005}
            color="#fff5e0"
          />
          <directionalLight position={[-8, 6, -6]} intensity={0.25} color="#ffd0a0" />
          <hemisphereLight args={['#87CEEB', '#3d2817', 0.35]} />

          <CameraRig />
          <SkyShader />
          <Terrain />
          <Dino />
          <ObstacleManager />
          <Particles />
          <PostProcessing />
          <fog attach="fog" args={['#1a0a2e', 30, 95]} />
        </Suspense>
        {showFps && <Stats />}
      </Canvas>
      <GameHUD />
    </div>
  );
}
