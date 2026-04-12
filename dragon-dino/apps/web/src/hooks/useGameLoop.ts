import { useCallback, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGameStore } from '@/stores/gameStore';

const BASE_SPEED = 5;
const SPEED_SCALE_FACTOR = 0.002;
const SCORE_PER_METER = 0.1;

export function useGameLoop() {
  const distanceRef = useRef(0);
  const lastScoreRef = useRef(0);

  const status = useGameStore((s) => s.status);
  const score = useGameStore((s) => s.score);
  const incrementScore = useGameStore((s) => s.incrementScore);
  const setSpeed = useGameStore((s) => s.setSpeed);
  const setDistance = useGameStore((s) => s.setDistance);
  const updatePowerupTimers = useGameStore((s) => s.updatePowerupTimers);

  useFrame((_, delta) => {
    if (status !== 'playing') return;

    const currentSpeed = BASE_SPEED * (1 + score * SPEED_SCALE_FACTOR);
    setSpeed(currentSpeed);

    const distanceDelta = currentSpeed * delta;
    distanceRef.current += distanceDelta;
    setDistance(distanceRef.current);

    const newScoreThreshold = Math.floor(distanceRef.current * SCORE_PER_METER);
    if (newScoreThreshold > lastScoreRef.current) {
      incrementScore(newScoreThreshold - lastScoreRef.current);
      lastScoreRef.current = newScoreThreshold;
    }

    updatePowerupTimers(delta * 1000);
  });

  const reset = useCallback(() => {
    distanceRef.current = 0;
    lastScoreRef.current = 0;
  }, []);

  return { reset };
}
