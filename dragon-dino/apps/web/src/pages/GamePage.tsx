import { useNavigate } from 'react-router-dom';
import { GameCanvas } from '@/components/game/GameCanvas';

export default function GamePage() {
  const navigate = useNavigate();

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-black">
      <GameCanvas />

      {/* Exit button */}
      <div className="pointer-events-auto absolute left-4 top-4 z-30">
        <button
          onClick={() => navigate('/')}
          className="rounded-lg bg-black/50 px-3 py-1.5 text-xs font-medium text-muted-foreground backdrop-blur-sm transition-colors hover:text-foreground"
        >
          &larr; Exit
        </button>
      </div>
    </div>
  );
}
