import { create } from 'zustand';
import type { GameState, ActivePowerup, PowerupType } from '@dragon-dino/shared';

interface GameStore extends GameState {
  sessionToken: string | null;
  bestScore: number;

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
  reset: () => void;
}

const initialState: GameState & { sessionToken: string | null; bestScore: number } = {
  status: 'idle',
  score: 0,
  distance: 0,
  lives: 3,
  coins: 0,
  speed: 1,
  combo: 0,
  activePowerups: [],
  biome: 0,
  sessionToken: null,
  bestScore: 0,
};

export const useGameStore = create<GameStore>((set, get) => ({
  ...initialState,

  setStatus: (status) => set({ status }),

  incrementScore: (amount) => {
    const multiplier = get().activePowerups.some((p) => p.type === 'x2') ? 2 : 1;
    const newScore = get().score + amount * multiplier;
    const newBiome = Math.floor(newScore / 500);
    set({
      score: newScore,
      biome: newBiome,
      bestScore: Math.max(newScore, get().bestScore),
    });
  },

  addCoins: (amount) => set((s) => ({ coins: s.coins + amount })),

  loseLife: () => {
    const hasShield = get().activePowerups.some((p) => p.type === 'shield');
    if (hasShield) {
      set((s) => ({
        activePowerups: s.activePowerups.filter((p) => p.type !== 'shield'),
      }));
      return;
    }
    const newLives = get().lives - 1;
    if (newLives <= 0) {
      set({ lives: 0, status: 'gameover' });
    } else {
      set({ lives: newLives });
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

  reset: () => set({ ...initialState, bestScore: get().bestScore }),
}));
