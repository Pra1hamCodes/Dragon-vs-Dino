import { useCallback, useEffect, useRef } from 'react';
import { Howl } from 'howler';
import { useSettingsStore } from '@/stores/settingsStore';
import { useGameStore } from '@/stores/gameStore';

const SFX_SPRITES: Record<string, [number, number]> = {
  jump: [0, 200],
  land: [300, 150],
  coin: [500, 250],
  powerup: [800, 300],
  hit: [1200, 200],
  gameover: [1500, 1000],
  levelup: [2600, 500],
  combo: [3200, 300],
};

export function useAudio() {
  const sfxRef = useRef<Howl | null>(null);
  const musicRefs = useRef<Howl[]>([]);
  const { sfxVolume, musicVolume, isMuted } = useSettingsStore();

  useEffect(() => {
    // Create SFX sprite using AudioContext-generated tones
    const ctx = new AudioContext();
    const sampleRate = ctx.sampleRate;
    const totalDuration = 4; // seconds
    const buffer = ctx.createBuffer(1, sampleRate * totalDuration, sampleRate);
    const data = buffer.getChannelData(0);

    // Generate simple tones for each sprite
    const generateTone = (startSample: number, durationSamples: number, freq: number, type: 'sine' | 'sawtooth' = 'sine') => {
      for (let i = 0; i < durationSamples; i++) {
        const t = i / sampleRate;
        const envelope = Math.max(0, 1 - t / (durationSamples / sampleRate));
        if (type === 'sine') {
          data[startSample + i] = Math.sin(2 * Math.PI * freq * t) * envelope * 0.3;
        } else {
          data[startSample + i] = ((freq * t % 1) * 2 - 1) * envelope * 0.2;
        }
      }
    };

    // Jump: rising sine
    generateTone(0, sampleRate * 0.2, 300);
    // Land: short noise burst
    for (let i = 0; i < sampleRate * 0.15; i++) {
      const idx = Math.floor(sampleRate * 0.3) + i;
      if (idx < data.length) data[idx] = (Math.random() * 2 - 1) * 0.15 * (1 - i / (sampleRate * 0.15));
    }
    // Coin: high rising
    generateTone(Math.floor(sampleRate * 0.5), Math.floor(sampleRate * 0.25), 880);
    // Powerup: arpeggio
    generateTone(Math.floor(sampleRate * 0.8), Math.floor(sampleRate * 0.3), 523);
    // Hit: sawtooth
    generateTone(Math.floor(sampleRate * 1.2), Math.floor(sampleRate * 0.2), 200, 'sawtooth');
    // Gameover: descending
    for (let i = 0; i < sampleRate * 1.0; i++) {
      const t = i / sampleRate;
      const freq = 400 - t * 200;
      const idx = Math.floor(sampleRate * 1.5) + i;
      if (idx < data.length) data[idx] = Math.sin(2 * Math.PI * freq * t) * (1 - t) * 0.3;
    }
    // Levelup: ascending arpeggio
    const notes = [261, 329, 392, 523];
    notes.forEach((freq, n) => {
      generateTone(
        Math.floor(sampleRate * (2.6 + n * 0.12)),
        Math.floor(sampleRate * 0.12),
        freq
      );
    });
    // Combo: quick blip
    generateTone(Math.floor(sampleRate * 3.2), Math.floor(sampleRate * 0.1), 660);

    ctx.close();

    // We'll use Howler with a base64 encoded silent audio as fallback
    // In production, these would be real audio files
    sfxRef.current = new Howl({
      src: ['/audio/sfx.mp3', '/audio/sfx.ogg'],
      sprite: SFX_SPRITES,
      volume: sfxVolume,
      mute: isMuted,
    });

    return () => {
      sfxRef.current?.unload();
      musicRefs.current.forEach((h) => h.unload());
    };
  }, []);

  useEffect(() => {
    sfxRef.current?.volume(sfxVolume);
    sfxRef.current?.mute(isMuted);
    musicRefs.current.forEach((h) => {
      h.volume(musicVolume);
      h.mute(isMuted);
    });
  }, [sfxVolume, musicVolume, isMuted]);

  const playSfx = useCallback((name: keyof typeof SFX_SPRITES) => {
    sfxRef.current?.play(name);
  }, []);

  const playMusic = useCallback(() => {
    musicRefs.current.forEach((h) => h.play());
  }, []);

  const stopMusic = useCallback(() => {
    musicRefs.current.forEach((h) => h.stop());
  }, []);

  return { playSfx, playMusic, stopMusic };
}
