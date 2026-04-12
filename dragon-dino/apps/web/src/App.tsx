import { Routes, Route } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import { AnimatePresence } from 'framer-motion';

const LandingPage = lazy(() => import('./pages/LandingPage'));
const GamePage = lazy(() => import('./pages/GamePage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const LeaderboardPage = lazy(() => import('./pages/LeaderboardPage'));
const SeasonPage = lazy(() => import('./pages/SeasonPage'));
const MultiplayerPage = lazy(() => import('./pages/MultiplayerPage'));
const AuthPage = lazy(() => import('./pages/AuthPage'));

function LoadingScreen() {
  return (
    <div className="flex h-screen w-screen items-center justify-center bg-dragon-dark">
      <div className="flex flex-col items-center gap-4">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-dragon-orange border-t-transparent" />
        <p className="text-sm text-muted-foreground">Loading...</p>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AnimatePresence mode="wait">
      <Suspense fallback={<LoadingScreen />}>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/play" element={<GamePage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/profile/:username" element={<ProfilePage />} />
          <Route path="/leaderboard" element={<LeaderboardPage />} />
          <Route path="/season" element={<SeasonPage />} />
          <Route path="/multiplayer" element={<MultiplayerPage />} />
          <Route path="/multiplayer/:roomId" element={<MultiplayerPage />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/challenge/:token" element={<GamePage />} />
        </Routes>
      </Suspense>
    </AnimatePresence>
  );
}
