import { motion } from 'framer-motion';
import { useEffect, useState, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { formatScore, formatDistance } from '@/lib/utils';

type GameState = 'loading' | 'ready' | 'playing' | 'paused' | 'gameover';

export default function GamePage() {
  const { token } = useParams<{ token?: string }>();
  const navigate = useNavigate();
  const [gameState, setGameState] = useState<GameState>('loading');
  const [score, setScore] = useState(0);
  const [distance, setDistance] = useState(0);
  const [highScore, setHighScore] = useState(24850);

  useEffect(() => {
    const timer = setTimeout(() => setGameState('ready'), 1500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (gameState === 'playing') {
      interval = setInterval(() => {
        setScore((s) => s + Math.floor(Math.random() * 15 + 5));
        setDistance((d) => d + Math.random() * 3 + 1);
      }, 100);
    }
    return () => clearInterval(interval);
  }, [gameState]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'ArrowUp') {
        e.preventDefault();
        if (gameState === 'ready') setGameState('playing');
        if (gameState === 'gameover') {
          setScore(0);
          setDistance(0);
          setGameState('playing');
        }
      }
      if (e.code === 'Escape') {
        if (gameState === 'playing') setGameState('paused');
        else if (gameState === 'paused') setGameState('playing');
      }
    },
    [gameState]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="relative h-screen w-screen select-none overflow-hidden bg-dragon-darker"
    >
      {/* HUD */}
      <div className="pointer-events-none absolute inset-x-0 top-0 z-20 flex items-start justify-between p-4">
        <div className="pointer-events-auto">
          <button
            onClick={() => navigate('/')}
            className="rounded-lg bg-card/80 px-3 py-1.5 text-xs font-medium text-muted-foreground backdrop-blur-sm transition-colors hover:text-foreground"
          >
            &larr; Exit
          </button>
        </div>
        <div className="flex flex-col items-end gap-1">
          <div className="rounded-lg bg-card/80 px-4 py-2 backdrop-blur-sm">
            <p className="text-right font-mono text-2xl font-bold text-foreground">
              {formatScore(score)}
            </p>
            <p className="text-right text-xs text-muted-foreground">
              HI {formatScore(highScore)}
            </p>
          </div>
          <div className="rounded-lg bg-card/80 px-3 py-1 backdrop-blur-sm">
            <p className="font-mono text-sm text-muted-foreground">{formatDistance(distance)}</p>
          </div>
        </div>
      </div>

      {/* Game Canvas Area */}
      <div className="flex h-full w-full items-center justify-center">
        <div className="relative h-full w-full bg-gradient-to-b from-dragon-darker via-dragon-dark to-dragon-darker">
          {/* Ground line */}
          <div className="absolute bottom-1/3 left-0 right-0 h-px bg-border" />

          {/* Placeholder dragon */}
          {gameState === 'playing' && (
            <motion.div
              animate={{ y: [0, -20, 0] }}
              transition={{ duration: 0.6, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute bottom-1/3 left-1/4 -translate-y-4"
            >
              <div className="h-10 w-14 rounded-lg bg-dragon-orange shadow-lg shadow-dragon-orange/30" />
            </motion.div>
          )}
        </div>
      </div>

      {/* State Overlays */}
      {gameState === 'loading' && (
        <div className="absolute inset-0 z-30 flex items-center justify-center bg-dragon-darker">
          <div className="flex flex-col items-center gap-4">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-dragon-orange border-t-transparent" />
            <p className="text-sm text-muted-foreground">Loading game assets...</p>
          </div>
        </div>
      )}

      {gameState === 'ready' && (
        <div className="absolute inset-0 z-30 flex items-center justify-center bg-dragon-darker/80 backdrop-blur-sm">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="flex flex-col items-center gap-6"
          >
            <h1 className="font-display text-5xl font-bold text-foreground">
              Dragon<span className="text-dragon-orange">Dino</span>
            </h1>
            {token && (
              <p className="rounded-full border border-dragon-orange/30 bg-dragon-orange/10 px-4 py-1 text-sm text-dragon-orange">
                Challenge Mode
              </p>
            )}
            <p className="animate-pulse text-muted-foreground">Press SPACE to start</p>
            <div className="mt-4 flex gap-8 text-center text-xs text-muted-foreground">
              <div>
                <kbd className="rounded border border-border bg-secondary px-2 py-0.5 font-mono">SPACE</kbd>
                <p className="mt-1">Jump</p>
              </div>
              <div>
                <kbd className="rounded border border-border bg-secondary px-2 py-0.5 font-mono">&darr;</kbd>
                <p className="mt-1">Duck</p>
              </div>
              <div>
                <kbd className="rounded border border-border bg-secondary px-2 py-0.5 font-mono">F</kbd>
                <p className="mt-1">Fire</p>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {gameState === 'paused' && (
        <div className="absolute inset-0 z-30 flex items-center justify-center bg-dragon-darker/80 backdrop-blur-sm">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="flex flex-col items-center gap-4"
          >
            <h2 className="font-display text-3xl font-bold text-foreground">Paused</h2>
            <p className="text-sm text-muted-foreground">Press ESC to resume</p>
            <button
              onClick={() => navigate('/')}
              className="mt-4 rounded-lg border border-border bg-card px-6 py-2 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
            >
              Quit to Menu
            </button>
          </motion.div>
        </div>
      )}

      {gameState === 'gameover' && (
        <div className="absolute inset-0 z-30 flex items-center justify-center bg-dragon-darker/80 backdrop-blur-sm">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="flex flex-col items-center gap-4 rounded-2xl border border-border bg-card p-10"
          >
            <h2 className="font-display text-3xl font-bold text-foreground">Game Over</h2>
            <div className="mt-2 text-center">
              <p className="font-mono text-4xl font-bold text-dragon-orange">{formatScore(score)}</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Distance: {formatDistance(distance)}
              </p>
            </div>
            {score > highScore && (
              <p className="animate-glow text-sm font-semibold text-dragon-gold">New High Score!</p>
            )}
            <div className="mt-4 flex gap-3">
              <button
                onClick={() => {
                  setScore(0);
                  setDistance(0);
                  setGameState('playing');
                }}
                className="rounded-lg bg-dragon-orange px-6 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90"
              >
                Play Again
              </button>
              <button
                onClick={() => navigate('/leaderboard')}
                className="rounded-lg border border-border bg-secondary px-6 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
              >
                Leaderboard
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
}
