import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface SettingsStore {
  musicVolume: number;
  sfxVolume: number;
  isMuted: boolean;
  graphicsQuality: 'low' | 'medium' | 'high';
  controlScheme: 'keyboard' | 'touch' | 'accelerometer';
  showFps: boolean;

  setMusicVolume: (volume: number) => void;
  setSfxVolume: (volume: number) => void;
  toggleMute: () => void;
  setGraphicsQuality: (quality: 'low' | 'medium' | 'high') => void;
  setControlScheme: (scheme: 'keyboard' | 'touch' | 'accelerometer') => void;
  toggleFps: () => void;
}

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      musicVolume: 0.5,
      sfxVolume: 0.7,
      isMuted: true,
      graphicsQuality: 'high',
      controlScheme: 'keyboard',
      showFps: false,

      setMusicVolume: (volume) => set({ musicVolume: volume }),
      setSfxVolume: (volume) => set({ sfxVolume: volume }),
      toggleMute: () => set((s) => ({ isMuted: !s.isMuted })),
      setGraphicsQuality: (quality) => set({ graphicsQuality: quality }),
      setControlScheme: (scheme) => set({ controlScheme: scheme }),
      toggleFps: () => set((s) => ({ showFps: !s.showFps })),
    }),
    { name: 'dragon-dino-settings' }
  )
);
