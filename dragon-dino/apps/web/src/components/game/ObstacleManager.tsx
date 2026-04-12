import { useRef, useCallback } from 'react';
import { useFrame } from '@react-three/fiber';
import { Dragon } from './Dragon';
import Coin from './Coin';
import PowerUp from './PowerUp';
import { useGameStore } from '@/stores/gameStore';
import type { PowerupType, ObstacleType } from '@dragon-dino/shared';

type DragonType = 'flying' | 'low' | 'cluster' | 'boss';

interface Obstacle {
  id: number;
  x: number;
  type: DragonType;
  active: boolean;
}

interface CoinInstance {
  id: number;
  position: [number, number, number];
  collected: boolean;
}

interface PowerUpInstance {
  id: number;
  position: [number, number, number];
  type: PowerupType;
  collected: boolean;
}

const POWERUP_TYPES: PowerupType[] = ['shield', 'magnet', 'doubleJump', 'slowMo', 'x2'];

export function ObstacleManager() {
  const status = useGameStore((s) => s.status);
  const score = useGameStore((s) => s.score);
  const speed = useGameStore((s) => s.speed);
  const incrementScore = useGameStore((s) => s.incrementScore);
  const addCoins = useGameStore((s) => s.addCoins);
  const addPowerup = useGameStore((s) => s.addPowerup);
  const loseLife = useGameStore((s) => s.loseLife);

  const obstaclesRef = useRef<Obstacle[]>([]);
  const coinsRef = useRef<CoinInstance[]>([]);
  const powerupsRef = useRef<PowerUpInstance[]>([]);
  const lastSpawnRef = useRef(0);
  const lastCoinSpawnRef = useRef(0);
  const lastPowerupSpawnRef = useRef(0);
  const nextIdRef = useRef(0);
  const frameRef = useRef(0);

  const getSpawnInterval = useCallback(() => {
    return Math.max(0.8, 2.5 - Math.floor(score / 10) * 0.05);
  }, [score]);

  useFrame((state, delta) => {
    if (status !== 'playing') return;
    frameRef.current++;

    const time = state.clock.elapsedTime;

    // Spawn obstacles
    if (time - lastSpawnRef.current > getSpawnInterval()) {
      lastSpawnRef.current = time;

      let type: DragonType = 'flying';
      const rand = Math.random();
      if (score > 0 && score % 500 < 10 && rand < 0.3) {
        type = 'boss';
      } else if (rand < 0.4) {
        type = 'flying';
      } else if (rand < 0.65) {
        type = 'low';
      } else if (rand < 0.85) {
        type = 'cluster';
      } else {
        type = 'flying';
      }

      obstaclesRef.current.push({
        id: nextIdRef.current++,
        x: 25,
        type,
        active: true,
      });
    }

    // Spawn coins
    if (time - lastCoinSpawnRef.current > 1 + Math.random() * 2) {
      lastCoinSpawnRef.current = time;
      coinsRef.current.push({
        id: nextIdRef.current++,
        position: [25, 1.5 + Math.random() * 2, (Math.random() - 0.5) * 4],
        collected: false,
      });
    }

    // Spawn powerups
    if (time - lastPowerupSpawnRef.current > 15 + Math.random() * 15) {
      lastPowerupSpawnRef.current = time;
      const typeIdx = Math.floor(Math.random() * POWERUP_TYPES.length);
      powerupsRef.current.push({
        id: nextIdRef.current++,
        position: [25, 2, (Math.random() - 0.5) * 3],
        type: POWERUP_TYPES[typeIdx]!,
        collected: false,
      });
    }

    // Move obstacles
    obstaclesRef.current.forEach((o) => {
      if (o.active) o.x -= speed * delta;
    });

    // Clean up off-screen
    obstaclesRef.current = obstaclesRef.current.filter((o) => o.x > -15);
    coinsRef.current = coinsRef.current.filter((c) => !c.collected && c.position[0] > -15);
    powerupsRef.current = powerupsRef.current.filter((p) => !p.collected && p.position[0] > -15);

    // Move coins and powerups
    coinsRef.current.forEach((c) => {
      c.position = [c.position[0] - speed * delta, c.position[1], c.position[2]];
    });
    powerupsRef.current.forEach((p) => {
      p.position = [p.position[0] - speed * delta, p.position[1], p.position[2]];
    });
  });

  return (
    <group>
      {obstaclesRef.current
        .filter((o) => o.active)
        .map((o) => (
          <Dragon
            key={o.id}
            position={[o.x, 1.2, 0]}
            speed={speed}
            type={o.type}
            onPassed={() => {
              incrementScore(1);
            }}
          />
        ))}

      {coinsRef.current
        .filter((c) => !c.collected)
        .map((c) => (
          <Coin
            key={c.id}
            position={c.position}
            onCollect={() => {
              c.collected = true;
              addCoins(1);
            }}
          />
        ))}

      {powerupsRef.current
        .filter((p) => !p.collected)
        .map((p) => (
          <PowerUp
            key={p.id}
            position={p.position}
            type={p.type}
            onCollect={() => {
              p.collected = true;
              const durations: Record<PowerupType, number> = {
                shield: 999999,
                magnet: 8000,
                doubleJump: 10000,
                slowMo: 4000,
                x2: 10000,
              };
              addPowerup(p.type, durations[p.type]);
            }}
          />
        ))}
    </group>
  );
}
