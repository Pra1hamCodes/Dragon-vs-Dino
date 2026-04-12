import { motion } from 'framer-motion';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { formatScore, formatDistance } from '@/lib/utils';

type Period = 'daily' | 'weekly' | 'alltime' | 'friends';

interface LeaderboardEntry {
  rank: number;
  username: string;
  score: number;
  distance: number;
  gamesPlayed: number;
}

const mockData: Record<Period, LeaderboardEntry[]> = {
  daily: [
    { rank: 1, username: 'PyroKing', score: 32450, distance: 8400, gamesPlayed: 12 },
    { rank: 2, username: 'BlazeMaster', score: 29800, distance: 7900, gamesPlayed: 9 },
    { rank: 3, username: 'ScaleSprinter', score: 27100, distance: 7200, gamesPlayed: 15 },
    { rank: 4, username: 'NovaDragon', score: 24600, distance: 6800, gamesPlayed: 7 },
    { rank: 5, username: 'FlameRider', score: 22300, distance: 6100, gamesPlayed: 11 },
    { rank: 6, username: 'WyvernDash', score: 21000, distance: 5800, gamesPlayed: 8 },
    { rank: 7, username: 'DinoDash99', score: 19500, distance: 5400, gamesPlayed: 14 },
    { rank: 8, username: 'AshStorm', score: 18200, distance: 5100, gamesPlayed: 6 },
    { rank: 9, username: 'EmberHeart', score: 16800, distance: 4700, gamesPlayed: 10 },
    { rank: 10, username: 'DragonFury', score: 15400, distance: 4300, gamesPlayed: 13 },
  ],
  weekly: [
    { rank: 1, username: 'PyroKing', score: 48720, distance: 12400, gamesPlayed: 67 },
    { rank: 2, username: 'ScaleSprinter', score: 45100, distance: 11800, gamesPlayed: 54 },
    { rank: 3, username: 'FlameRider', score: 42350, distance: 11100, gamesPlayed: 72 },
    { rank: 4, username: 'DinoDash99', score: 39800, distance: 10600, gamesPlayed: 48 },
    { rank: 5, username: 'NovaDragon', score: 37200, distance: 9900, gamesPlayed: 61 },
    { rank: 6, username: 'BlazeMaster', score: 35600, distance: 9500, gamesPlayed: 43 },
    { rank: 7, username: 'WyvernDash', score: 33100, distance: 8800, gamesPlayed: 55 },
    { rank: 8, username: 'AshStorm', score: 30900, distance: 8200, gamesPlayed: 39 },
    { rank: 9, username: 'EmberHeart', score: 28400, distance: 7600, gamesPlayed: 50 },
    { rank: 10, username: 'DragonFury', score: 26000, distance: 7100, gamesPlayed: 46 },
  ],
  alltime: [
    { rank: 1, username: 'PyroKing', score: 284300, distance: 98000, gamesPlayed: 1247 },
    { rank: 2, username: 'FlameRider', score: 271000, distance: 94200, gamesPlayed: 1089 },
    { rank: 3, username: 'ScaleSprinter', score: 259800, distance: 89000, gamesPlayed: 998 },
    { rank: 4, username: 'DinoDash99', score: 245600, distance: 84500, gamesPlayed: 1150 },
    { rank: 5, username: 'NovaDragon', score: 231200, distance: 78300, gamesPlayed: 876 },
    { rank: 6, username: 'BlazeMaster', score: 218900, distance: 72100, gamesPlayed: 920 },
    { rank: 7, username: 'WyvernDash', score: 205000, distance: 67800, gamesPlayed: 810 },
    { rank: 8, username: 'AshStorm', score: 192400, distance: 63400, gamesPlayed: 745 },
    { rank: 9, username: 'EmberHeart', score: 180100, distance: 59200, gamesPlayed: 690 },
    { rank: 10, username: 'DragonFury', score: 168000, distance: 55000, gamesPlayed: 632 },
  ],
  friends: [
    { rank: 1, username: 'ScaleSprinter', score: 45100, distance: 11800, gamesPlayed: 54 },
    { rank: 2, username: 'NovaDragon', score: 37200, distance: 9900, gamesPlayed: 61 },
    { rank: 3, username: 'AshStorm', score: 30900, distance: 8200, gamesPlayed: 39 },
  ],
};

const periods: { key: Period; label: string }[] = [
  { key: 'daily', label: 'Today' },
  { key: 'weekly', label: 'This Week' },
  { key: 'alltime', label: 'All Time' },
  { key: 'friends', label: 'Friends' },
];

const rankMedal = (rank: number): string | null => {
  if (rank === 1) return '\u{1F947}';
  if (rank === 2) return '\u{1F948}';
  if (rank === 3) return '\u{1F949}';
  return null;
};

export default function LeaderboardPage() {
  const [activePeriod, setActivePeriod] = useState<Period>('weekly');
  const entries = mockData[activePeriod];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="min-h-screen bg-background"
    >
      {/* Header */}
      <header className="border-b border-border">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-6">
          <Link to="/" className="font-display text-lg font-bold text-foreground">
            Dragon<span className="text-dragon-orange">Dino</span>
          </Link>
          <Link
            to="/play"
            className="rounded-lg bg-dragon-orange px-4 py-1.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
          >
            Play
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-6 py-10">
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
          <h1 className="font-display text-4xl font-bold text-foreground">Leaderboard</h1>
          <p className="mt-2 text-muted-foreground">See who's running the furthest and scoring the highest.</p>
        </motion.div>

        {/* Period Tabs */}
        <div className="mt-8 flex gap-1 rounded-lg border border-border bg-card p-1">
          {periods.map((period) => (
            <button
              key={period.key}
              onClick={() => setActivePeriod(period.key)}
              className={cn(
                'flex-1 rounded-md px-4 py-2 text-sm font-medium transition-colors',
                activePeriod === period.key
                  ? 'bg-secondary text-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {period.label}
            </button>
          ))}
        </div>

        {/* Your Rank Banner */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="mt-6 flex items-center justify-between rounded-xl border border-dragon-orange/30 bg-dragon-orange/5 p-4"
        >
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-dragon-orange text-sm font-bold text-white">
              PK
            </span>
            <div>
              <p className="font-medium text-foreground">Your Rank</p>
              <p className="text-xs text-muted-foreground">PyroKing</p>
            </div>
          </div>
          <div className="text-right">
            <p className="font-mono text-lg font-bold text-dragon-orange">
              #{activePeriod === 'alltime' ? '1' : activePeriod === 'friends' ? '-' : '1'}
            </p>
            <p className="text-xs text-muted-foreground">
              {formatScore(activePeriod === 'daily' ? 32450 : activePeriod === 'weekly' ? 48720 : 284300)}
            </p>
          </div>
        </motion.div>

        {/* Table */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mt-6 overflow-hidden rounded-xl border border-border bg-card"
        >
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-border text-xs uppercase tracking-wider text-muted-foreground">
                <th className="px-6 py-3 font-medium">Rank</th>
                <th className="px-6 py-3 font-medium">Player</th>
                <th className="px-6 py-3 text-right font-medium">Score</th>
                <th className="hidden px-6 py-3 text-right font-medium sm:table-cell">Distance</th>
                <th className="hidden px-6 py-3 text-right font-medium md:table-cell">Games</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((entry, i) => (
                <motion.tr
                  key={entry.username}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.05 * i }}
                  className="border-b border-border/50 transition-colors last:border-0 hover:bg-secondary/50"
                >
                  <td className="px-6 py-4">
                    {rankMedal(entry.rank) ? (
                      <span className="text-lg">{rankMedal(entry.rank)}</span>
                    ) : (
                      <span className="font-mono text-sm text-muted-foreground">{entry.rank}</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <Link
                      to={`/profile/${entry.username}`}
                      className="font-medium text-foreground hover:text-dragon-orange"
                    >
                      {entry.username}
                    </Link>
                  </td>
                  <td className="px-6 py-4 text-right font-mono text-sm text-foreground">
                    {formatScore(entry.score)}
                  </td>
                  <td className="hidden px-6 py-4 text-right text-sm text-muted-foreground sm:table-cell">
                    {formatDistance(entry.distance)}
                  </td>
                  <td className="hidden px-6 py-4 text-right text-sm text-muted-foreground md:table-cell">
                    {entry.gamesPlayed}
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </motion.div>

        {activePeriod === 'friends' && entries.length < 5 && (
          <div className="mt-6 rounded-xl border border-dashed border-border p-8 text-center">
            <p className="text-muted-foreground">Add more friends to compete with!</p>
            <button className="mt-3 rounded-lg bg-secondary px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted">
              Invite Friends
            </button>
          </div>
        )}
      </main>
    </motion.div>
  );
}
