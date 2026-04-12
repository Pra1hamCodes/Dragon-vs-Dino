import { useEffect, useCallback, useRef } from 'react';
import { useGameStore } from '@/stores/gameStore';
import { useSettingsStore } from '@/stores/settingsStore';

interface TouchState {
  startX: number;
  startY: number;
  startTime: number;
}

export function useMobileControls(
  onJump: () => void,
  onDodgeLeft: () => void,
  onDodgeRight: () => void,
  onPause: () => void
) {
  const touchRef = useRef<TouchState | null>(null);
  const longPressTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const controlScheme = useSettingsStore((s) => s.controlScheme);
  const status = useGameStore((s) => s.status);

  const handleTouchStart = useCallback(
    (e: TouchEvent) => {
      if (status !== 'playing') return;
      const touch = e.touches[0];
      if (!touch) return;

      touchRef.current = {
        startX: touch.clientX,
        startY: touch.clientY,
        startTime: Date.now(),
      };

      longPressTimerRef.current = setTimeout(() => {
        onPause();
      }, 500);
    },
    [status, onPause]
  );

  const handleTouchEnd = useCallback(
    (e: TouchEvent) => {
      if (longPressTimerRef.current) {
        clearTimeout(longPressTimerRef.current);
        longPressTimerRef.current = null;
      }

      if (!touchRef.current || status !== 'playing') return;

      const touch = e.changedTouches[0];
      if (!touch) return;

      const deltaX = touch.clientX - touchRef.current.startX;
      const deltaY = touch.clientY - touchRef.current.startY;
      const elapsed = Date.now() - touchRef.current.startTime;

      if (elapsed < 500) {
        if (Math.abs(deltaX) > 50) {
          if (deltaX < 0) onDodgeLeft();
          else onDodgeRight();
        } else {
          const screenMidX = window.innerWidth / 2;
          if (touch.clientX < screenMidX) {
            onJump();
          } else {
            onDodgeRight();
          }
        }
      }

      touchRef.current = null;

      if (navigator.vibrate) {
        navigator.vibrate(10);
      }
    },
    [status, onJump, onDodgeLeft, onDodgeRight]
  );

  useEffect(() => {
    if (controlScheme !== 'touch' && controlScheme !== 'accelerometer') return;

    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [controlScheme, handleTouchStart, handleTouchEnd]);

  useEffect(() => {
    if (controlScheme !== 'accelerometer') return;

    const handler = (e: DeviceMotionEvent) => {
      if (status !== 'playing') return;
      const accel = e.accelerationIncludingGravity;
      if (!accel?.x) return;

      if (accel.x > 3) onDodgeRight();
      else if (accel.x < -3) onDodgeLeft();
    };

    window.addEventListener('devicemotion', handler);
    return () => window.removeEventListener('devicemotion', handler);
  }, [controlScheme, status, onDodgeLeft, onDodgeRight]);
}
