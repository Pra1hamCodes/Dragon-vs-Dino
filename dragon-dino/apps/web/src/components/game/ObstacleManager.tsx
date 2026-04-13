import { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Dragon } from './Dragon';
import Coin from './Coin';
import PowerUp from './PowerUp';
import { getDinoPosition } from './Dino';
import { useGameStore } from '@/stores/gameStore';
import type { PowerupType } from '@dragon-dino/shared';

type DragonType = 'flying' | 'low' | 'cluster' | 'boss';

interface Obstacle {
  id: number;
  x: number;
  y: number;
  type: DragonType;
  active: boolean;
  hit: boolean;
  scale: number;
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

/** AABB overlap test */
function aabbOverlap(
  ax: number, ay: number, ahw: number, ahh: number,
  bx: number, by: number, bhw: number, bhh: number,
): boolean {
  return (
    Math.abs(ax - bx) < ahw + bhw &&
    Math.abs(ay - by) < ahh + bhh
  );
}

export function ObstacleManager() {
  const status = useGameStore((s) => s.status);
  const score = useGameStore((s) => s.score);
  const speed = useGameStore((s) => s.speed);
  const difficulty = useGameStore((s) => s.difficulty);
  const incrementScore = useGameStore((s) => s.incrementScore);
  const addCoins = useGameStore((s) => s.addCoins);
  const addPowerup = useGameStore((s) => s.addPowerup);
  const loseLife = useGameStore((s) => s.loseLife);
  const tick = useGameStore((s) => s.tick);

  const obstaclesRef = useRef<Obstacle[]>([]);
  const coinsRef = useRef<CoinInstance[]>([]);
  const powerupsRef = useRef<PowerUpInstance[]>([]);
  const lastSpawnRef = useRef(0);
  const lastCoinSpawnRef = useRef(0);
  const lastPowerupSpawnRef = useRef(0);
  const nextIdRef = useRef(0);
  const [, setTick] = useState(0);

  /** Spawn interval decreases with difficulty */
  function getSpawnInterval() {
    const base = [2.8, 2.2, 1.6, 1.1][difficulty] ?? 2.8;
    // slight randomness
    return base + Math.random() * 0.6 - 0.3;
  }

  /** Pick dragon type weighted by difficulty */
  function pickDragonType(): { type: DragonType; y: number; scale: number } {
    const rand = Math.random();

    // Boss every ~500 points
    if (score > 0 && score % 500 < 15 && rand < 0.25) {
      return { type: 'boss', y: 1.4, scale: 2 };
    }

    if (difficulty >= 3) {
      // Insane: more variety, tighter spacing
      if (rand < 0.3) return { type: 'flying', y: 2.2 + Math.random() * 1.2, scale: 1 };
      if (rand < 0.55) return { type: 'low', y: 0.6, scale: 1 };
      if (rand < 0.75) return { type: 'cluster', y: 1.2, scale: 0.75 };
      return { type: 'flying', y: 1.5, scale: 1.15 };
    }
    if (difficulty >= 2) {
      if (rand < 0.35) return { type: 'flying', y: 2.0 + Math.random() * 0.8, scale: 1 };
      if (rand < 0.6) return { type: 'low', y: 0.6, scale: 1 };
      if (rand < 0.8) return { type: 'cluster', y: 1.2, scale: 0.8 };
      return { type: 'flying', y: 1.6, scale: 1 };
    }
    if (difficulty >= 1) {
      if (rand < 0.4) return { type: 'flying', y: 2.0, scale: 1 };
      if (rand < 0.7) return { type: 'low', y: 0.6, scale: 1 };
      return { type: 'flying', y: 1.5, scale: 1 };
    }
    // Easy: mostly low and simple flying
    if (rand < 0.5) return { type: 'low', y: 0.6, scale: 0.9 };
    return { type: 'flying', y: 2.2, scale: 0.9 };
  }

  useFrame((state, delta) => {
    if (status !== 'playing') return;
    const dt = Math.min(delta, 0.05);

    // Tick the store (speed ramp, distance, powerup timers, shake decay)
    tick(dt);

    const time = state.clock.elapsedTime;
    let needsRender = false;

    // --- Spawn obstacles ---
    if (time - lastSpawnRef.current > getSpawnInterval()) {
      lastSpawnRef.current = time;
      const pick = pickDragonType();

      obstaclesRef.current.push({
        id: nextIdRef.current++,
        x: 30,
        y: pick.y,
        type: pick.type,
        active: true,
        hit: false,
        scale: pick.scale,
      });

      // At higher difficulty, sometimes spawn a second obstacle close behind
      if (difficulty >= 2 && Math.random() < 0.3) {
        const pick2 = pickDragonType();
        obstaclesRef.current.push({
          id: nextIdRef.current++,
          x: 30 + 3 + Math.random() * 2,
          y: pick2.y,
          type: pick2.type,
          active: true,
          hit: false,
          scale: pick2.scale,
        });
      }
      needsRender = true;
    }

    // --- Spawn coins (clusters along path) ---
    if (time - lastCoinSpawnRef.current > 3.5 + Math.random() * 2.5) {
      lastCoinSpawnRef.current = time;
      const count = 2 + Math.floor(Math.random() * 3);
      for (let i = 0; i < count; i++) {
        coinsRef.current.push({
          id: nextIdRef.current++,
          position: [30 + i * 1.8, 1.0 + Math.random() * 1.5, 0],
          collected: false,
        });
      }
      needsRender = true;
    }

    // --- Spawn powerups (rare) ---
    if (time - lastPowerupSpawnRef.current > 28 + Math.random() * 18) {
      lastPowerupSpawnRef.current = time;
      const idx = Math.floor(Math.random() * POWERUP_TYPES.length);
      powerupsRef.current.push({
        id: nextIdRef.current++,
        position: [30, 2.2, 0],
        type: POWERUP_TYPES[idx]!,
        collected: false,
      });
      needsRender = true;
    }

    // --- Move everything ---
    const moveSpeed = speed * dt;
    for (const o of obstaclesRef.current) {
      if (o.active) o.x -= moveSpeed;
    }
    for (const c of coinsRef.current) {
      c.position = [c.position[0] - moveSpeed, c.position[1], c.position[2]];
    }
    for (const p of powerupsRef.current) {
      p.position = [p.position[0] - moveSpeed, p.position[1], p.position[2]];
    }

    // --- Manual AABB collision detection ---
    const dinoPos = getDinoPosition();
    const dinoHW = 0.35; // half-width
    const dinoHH = 0.55; // half-height

    for (const o of obstaclesRef.current) {
      if (!o.active || o.hit) continue;
      const obstHW = (o.type === 'boss' ? 1.0 : 0.55) * o.scale;
      const obstHH = (o.type === 'boss' ? 0.7 : 0.4) * o.scale;

      if (aabbOverlap(dinoPos.x, dinoPos.y, dinoHW, dinoHH, o.x, o.y, obstHW, obstHH)) {
        o.hit = true;
        loseLife();
      }
    }

    // Coin collision (generous radius)
    for (const c of coinsRef.current) {
      if (c.collected) continue;
      const dx = dinoPos.x - c.position[0];
      const dy = dinoPos.y - c.position[1];
      if (dx * dx + dy * dy < 1.2) {
        c.collected = true;
        addCoins(1);
        needsRender = true;
      }
    }

    // Powerup collision
    for (const p of powerupsRef.current) {
      if (p.collected) continue;
      const dx = dinoPos.x - p.position[0];
      const dy = dinoPos.y - p.position[1];
      if (dx * dx + dy * dy < 1.5) {
        p.collected = true;
        const durations: Record<PowerupType, number> = {
          shield: 999999, magnet: 8000, doubleJump: 10000, slowMo: 5000, x2: 10000,
        };
        addPowerup(p.type, durations[p.type]);
        needsRender = true;
      }
    }

    // --- Cleanup off-screen + score for passed ---
    const prevLen = obstaclesRef.current.length;
    obstaclesRef.current = obstaclesRef.current.filter((o) => {
      if (o.x < -8) {
        if (o.active && !o.hit) incrementScore(1);
        return false;
      }
      return true;
    });
    coinsRef.current = coinsRef.current.filter((c) => !c.collected && c.position[0] > -10);
    powerupsRef.current = powerupsRef.current.filter((p) => !p.collected && p.position[0] > -10);

    if (obstaclesRef.current.length !== prevLen) needsRender = true;
    if (needsRender) setTick((t) => t + 1);
  });

  return (
    <group>
      {obstaclesRef.current
        .filter((o) => o.active)
        .map((o) => (
          <Dragon
            key={o.id}
            position={[o.x, o.y, 0]}
            type={o.type}
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
                shield: 999999, magnet: 8000, doubleJump: 10000, slowMo: 5000, x2: 10000,
              };
              addPowerup(p.type, durations[p.type]);
            }}
          />
        ))}
    </group>
  );
}
