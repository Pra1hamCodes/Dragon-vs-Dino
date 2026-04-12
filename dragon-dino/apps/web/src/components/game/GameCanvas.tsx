import { Suspense, useEffect, useCallback } from 'react';
import { Canvas } from '@react-three/fiber';
import { Physics } from '@react-three/cannon';
import { Stats } from '@react-three/drei';
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
        gl={{ antialias: true, powerPreference: 'high-performance' }}
        dpr={[1, 2]}
        shadows
        camera={{ position: [0, 3, 10], fov: 60 }}
        className="game-canvas"
      >
        <Suspense fallback={<LoadingScreen />}>
          <ambientLight intensity={0.4} />
          <directionalLight
            position={[10, 15, 10]}
            intensity={1.2}
            castShadow
            shadow-mapSize={[2048, 2048]}
            shadow-camera-far={50}
            shadow-camera-left={-20}
            shadow-camera-right={20}
            shadow-camera-top={20}
            shadow-camera-bottom={-20}
          />
          <Physics gravity={[0, -20, 0]}>
            <SkyShader />
            <Terrain />
            <Dino />
            <ObstacleManager />
          </Physics>
          <Particles />
          <PostProcessing />
          <fog attach="fog" args={['#1a0a2e', 20, 80]} />
        </Suspense>
        {showFps && <Stats />}
      </Canvas>
      <GameHUD />
    </div>
  );
}
