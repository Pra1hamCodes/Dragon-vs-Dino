import { create } from 'zustand';
import type { GameState, PowerupType } from '@dragon-dino/shared';

interface GameStore extends GameState {
  sessionToken: string | null;
  bestScore: number;
  invincibleUntil: number;
  /** Difficulty tier: 0=easy, 1=medium, 2=hard, 3=insane */
  difficulty: number;
  /** Elapsed play-time in seconds (for difficulty ramp) */
  playTime: number;
  /** Camera shake intensity (0..1) */
  shake: number;

  setStatus: (status: GameState['status']) => void;
  incrementScore: (amount: number) => void;
  addCoins: (amount: number) => void;
  loseLife: () => void;
  addPowerup: (type: PowerupType, durationMs: number) => void;
  removePowerup: (type: PowerupType) => void;
  updatePowerupTimers: (deltaMs: number) => void;
  incrementCombo: () => void;
  resetCombo: () => void;
  setSpeed: (speed: number) => void;
  setBiome: (biome: number) => void;
  setSessionToken: (token: string) => void;
  setDistance: (distance: number) => void;
  tick: (delta: number) => void;
  setShake: (v: number) => void;
  reset: () => void;
}

const initialState: GameState & {
  sessionToken: string | null;
  bestScore: number;
  invincibleUntil: number;
  difficulty: number;
  playTime: number;
  shake: number;
} = {
  status: 'idle',
  score: 0,
  distance: 0,
  lives: 3,
  coins: 0,
  speed: 8,
  combo: 0,
  activePowerups: [],
  biome: 0,
  sessionToken: null,
  bestScore: 0,
  invincibleUntil: 0,
  difficulty: 0,
  playTime: 0,
  shake: 0,
};

export const useGameStore = create<GameStore>((set, get) => ({
  ...initialState,

  setStatus: (status) => set({ status }),

  incrementScore: (amount) => {
    const s = get();
    const multiplier = s.activePowerups.some((p) => p.type === 'x2') ? 2 : 1;
    const newScore = s.score + amount * multiplier;
    const newBiome = Math.floor(newScore / 500);
    set({
      score: newScore,
      biome: newBiome,
      bestScore: Math.max(newScore, s.bestScore),
    });
  },

  addCoins: (amount) => set((s) => ({ coins: s.coins + amount })),

  loseLife: () => {
    const s = get();
    if (Date.now() < s.invincibleUntil) return;

    const hasShield = s.activePowerups.some((p) => p.type === 'shield');
    if (hasShield) {
      set({
        activePowerups: s.activePowerups.filter((p) => p.type !== 'shield'),
        invincibleUntil: Date.now() + 2000,
        shake: 0.4,
      });
      return;
    }
    const newLives = s.lives - 1;
    if (newLives <= 0) {
      set({ lives: 0, status: 'gameover', shake: 1.0 });
    } else {
      set({ lives: newLives, invincibleUntil: Date.now() + 2000, shake: 0.7, combo: 0 });
    }
  },

  addPowerup: (type, durationMs) =>
    set((s) => ({
      activePowerups: [
        ...s.activePowerups.filter((p) => p.type !== type),
        { type, remainingMs: durationMs },
      ],
    })),

  removePowerup: (type) =>
    set((s) => ({
      activePowerups: s.activePowerups.filter((p) => p.type !== type),
    })),

  updatePowerupTimers: (deltaMs) =>
    set((s) => ({
      activePowerups: s.activePowerups
        .map((p) => ({ ...p, remainingMs: p.remainingMs - deltaMs }))
        .filter((p) => p.remainingMs > 0),
    })),

  incrementCombo: () => set((s) => ({ combo: s.combo + 1 })),
  resetCombo: () => set({ combo: 0 }),
  setSpeed: (speed) => set({ speed }),
  setBiome: (biome) => set({ biome }),
  setSessionToken: (token) => set({ sessionToken: token }),
  setDistance: (distance) => set({ distance }),
  setShake: (v) => set({ shake: v }),

  /** Called every frame — ramps difficulty, speed, distance, powerup timers */
  tick: (delta) => {
    const s = get();
    if (s.status !== 'playing') return;

    const newPlayTime = s.playTime + delta;
    // Difficulty tiers: 0-30s easy, 30-90s medium, 90-180s hard, 180s+ insane
    const newDifficulty =
      newPlayTime < 30 ? 0 : newPlayTime < 90 ? 1 : newPlayTime < 180 ? 2 : 3;

    // Speed curve: starts 8, ramps to 20 over ~3 minutes
    const baseSpeed = 8 + Math.min(newPlayTime * 0.065, 12);
    const slowMo = s.activePowerups.some((p) => p.type === 'slowMo') ? 0.55 : 1;
    const newSpeed = baseSpeed * slowMo;

    const newDistance = s.distance + newSpeed * delta;

    // Decay shake
    const newShake = Math.max(0, s.shake - delta * 2.5);

    // Tick powerup timers
    const newPowerups = s.activePowerups
      .map((p) => ({ ...p, remainingMs: p.remainingMs - delta * 1000 }))
      .filter((p) => p.remainingMs > 0);

    set({
      playTime: newPlayTime,
      difficulty: newDifficulty,
      speed: newSpeed,
      distance: newDistance,
      shake: newShake,
      activePowerups: newPowerups,
    });
  },

  reset: () => set({ ...initialState, bestScore: get().bestScore }),
}));
