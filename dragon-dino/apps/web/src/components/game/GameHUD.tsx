import { useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '@/stores/gameStore';
import { Button } from '@/components/ui/button';
import { formatScore } from '@/lib/utils';
import { Heart, Coins, Zap, Shield, Clock, ChevronUp } from 'lucide-react';

function AnimatedCounter({ value }: { value: number }) {
  return (
    <motion.span
      key={value}
      initial={{ y: -10, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="tabular-nums"
    >
      {formatScore(value)}
    </motion.span>
  );
}

function PowerupBar({ type, remainingMs }: { type: string; remainingMs: number }) {
  const icons: Record<string, typeof Shield> = {
    shield: Shield,
    x2: ChevronUp,
    slowMo: Clock,
    magnet: Zap,
    doubleJump: ChevronUp,
  };
  const Icon = icons[type] ?? Zap;
  const maxDuration: Record<string, number> = {
    shield: 999999, magnet: 8000, doubleJump: 10000, slowMo: 4000, x2: 10000,
  };
  const pct = Math.min((remainingMs / (maxDuration[type] ?? 10000)) * 100, 100);

  return (
    <div className="flex items-center gap-2">
      <Icon className="h-4 w-4 text-dragon-gold" />
      <div className="h-1.5 w-20 overflow-hidden rounded-full bg-white/10">
        <motion.div
          className="h-full rounded-full bg-dragon-gold"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

export function GameHUD() {
  const { status, score, lives, coins, combo, activePowerups, speed } = useGameStore();
  const setStatus = useGameStore((s) => s.setStatus);
  const reset = useGameStore((s) => s.reset);
  const bestScore = useGameStore((s) => s.bestScore);

  const handlePlay = useCallback(() => {
    reset();
    setStatus('countdown');
    setTimeout(() => setStatus('playing'), 3000);
  }, [reset, setStatus]);

  const handleResume = useCallback(() => {
    setStatus('playing');
  }, [setStatus]);

  return (
    <div className="pointer-events-none absolute inset-0 z-10">
      {/* Top bar */}
      {(status === 'playing' || status === 'paused') && (
        <div className="flex items-start justify-between p-4">
          {/* Score */}
          <div className="rounded-lg bg-black/50 px-4 py-2 backdrop-blur">
            <div className="text-xs uppercase tracking-wider text-muted-foreground">Score</div>
            <div className="text-3xl font-bold text-dragon-gold">
              <AnimatedCounter value={score} />
            </div>
          </div>

          {/* Right side */}
          <div className="flex flex-col items-end gap-2">
            {/* Lives */}
            <div className="flex gap-1 rounded-lg bg-black/50 px-3 py-2 backdrop-blur">
              {Array.from({ length: 3 }, (_, i) => (
                <motion.div
                  key={i}
                  animate={i < lives ? { scale: 1, opacity: 1 } : { scale: 0.5, opacity: 0.3 }}
                >
                  <Heart
                    className={`h-5 w-5 ${i < lives ? 'fill-red-500 text-red-500' : 'text-gray-600'}`}
                  />
                </motion.div>
              ))}
            </div>

            {/* Coins */}
            <div className="flex items-center gap-2 rounded-lg bg-black/50 px-3 py-2 backdrop-blur">
              <Coins className="h-4 w-4 text-dragon-gold" />
              <span className="font-mono text-sm">{coins}</span>
            </div>

            {/* Powerups */}
            {activePowerups.length > 0 && (
              <div className="flex flex-col gap-1 rounded-lg bg-black/50 px-3 py-2 backdrop-blur">
                {activePowerups.map((p) => (
                  <PowerupBar key={p.type} type={p.type} remainingMs={p.remainingMs} />
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Speed indicator */}
      {status === 'playing' && (
        <div className="absolute bottom-4 left-4">
          <div className="rounded-lg bg-black/50 px-3 py-2 backdrop-blur">
            <div className="text-xs text-muted-foreground">Speed</div>
            <div className="h-1.5 w-24 overflow-hidden rounded-full bg-white/10">
              <motion.div
                className="h-full rounded-full bg-dragon-orange"
                animate={{ width: `${Math.min((speed / 15) * 100, 100)}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Combo */}
      <AnimatePresence>
        {combo >= 3 && status === 'playing' && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="absolute bottom-4 left-1/2 -translate-x-1/2"
          >
            <div className="animate-glow rounded-full bg-dragon-orange px-4 py-2 text-lg font-bold">
              {combo}x COMBO
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Countdown */}
      <AnimatePresence>
        {status === 'countdown' && (
          <CountdownOverlay onComplete={() => setStatus('playing')} />
        )}
      </AnimatePresence>

      {/* Pause Menu */}
      <AnimatePresence>
        {status === 'paused' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="pointer-events-auto absolute inset-0 flex items-center justify-center bg-black/70 backdrop-blur-sm"
          >
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 50, opacity: 0 }}
              className="flex flex-col items-center gap-4 rounded-2xl bg-card p-8"
            >
              <h2 className="text-3xl font-bold">Paused</h2>
              <div className="flex flex-col gap-2">
                <Button variant="glow" size="lg" onClick={handleResume}>Resume</Button>
                <Button variant="outline" size="lg" onClick={handlePlay}>Restart</Button>
                <Button variant="ghost" size="lg" onClick={() => { reset(); setStatus('idle'); }}>Quit</Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Game Over */}
      <AnimatePresence>
        {status === 'gameover' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="pointer-events-auto absolute inset-0 flex items-center justify-center bg-black/80 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="flex flex-col items-center gap-6 rounded-2xl bg-card p-10"
            >
              <h2 className="text-4xl font-bold text-dragon-red">Game Over</h2>
              <div className="text-center">
                <div className="text-6xl font-bold text-dragon-gold">{formatScore(score)}</div>
                <div className="mt-1 text-sm text-muted-foreground">
                  Best: {formatScore(bestScore)}
                </div>
              </div>
              <div className="flex gap-2 text-sm text-muted-foreground">
                <span>{coins} coins</span>
                <span>-</span>
                <span>{Math.floor(score * 0.5)} XP</span>
              </div>
              <div className="flex gap-3">
                <Button variant="glow" size="xl" onClick={handlePlay}>Play Again</Button>
                <Button variant="outline" size="lg" onClick={() => { reset(); setStatus('idle'); }}>
                  Menu
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Idle / Start */}
      <AnimatePresence>
        {status === 'idle' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="pointer-events-auto absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm"
          >
            <motion.div
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="flex flex-col items-center gap-6"
            >
              <h1 className="text-5xl font-bold">
                <span className="text-dragon-orange">Dragon</span>
                <span className="text-dragon-gold">-Dino</span>
              </h1>
              <p className="text-muted-foreground">Press Enter or tap to start</p>
              <Button variant="glow" size="xl" onClick={handlePlay}>Play</Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function CountdownOverlay({ onComplete }: { onComplete: () => void }) {
  return (
    <motion.div className="absolute inset-0 flex items-center justify-center">
      <motion.div
        initial={{ scale: 3, opacity: 0 }}
        animate={{
          scale: [3, 1, 1, 0],
          opacity: [0, 1, 1, 0],
        }}
        transition={{ duration: 3, times: [0, 0.1, 0.9, 1] }}
        onAnimationComplete={onComplete}
        className="text-8xl font-bold text-dragon-gold"
      >
        GO!
      </motion.div>
    </motion.div>
  );
}
