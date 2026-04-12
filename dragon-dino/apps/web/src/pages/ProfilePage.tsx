import { motion } from 'framer-motion';
import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { formatScore, formatDistance, getInitials } from '@/lib/utils';

type Tab = 'stats' | 'achievements' | 'skins';

const mockStats = {
  totalGames: 1247,
  highScore: 48720,
  totalDistance: 342800,
  totalFireBreaths: 8930,
  avgScore: 12450,
  longestStreak: 14,
  rank: 23,
  seasonTier: 38,
};

const mockAchievements = [
  { id: '1', name: 'First Flight', description: 'Complete your first run', earned: true, icon: '\u{1F423}' },
  { id: '2', name: 'Score Chaser', description: 'Score over 10,000 points', earned: true, icon: '\u{1F3AF}' },
  { id: '3', name: 'Marathon Dragon', description: 'Run 10km in a single game', earned: true, icon: '\u{1F3C3}' },
  { id: '4', name: 'Pyromancer', description: 'Destroy 100 obstacles with fire', earned: true, icon: '\u{1F525}' },
  { id: '5', name: 'Speed Demon', description: 'Reach max velocity', earned: false, icon: '\u{26A1}' },
  { id: '6', name: 'Social Butterfly', description: 'Win 50 multiplayer races', earned: false, icon: '\u{1F91D}' },
  { id: '7', name: 'Legend', description: 'Reach #1 on the all-time leaderboard', earned: false, icon: '\u{1F451}' },
  { id: '8', name: 'Collector', description: 'Unlock all dragon skins', earned: false, icon: '\u{2728}' },
];

const mockSkins = [
  { id: '1', name: 'Classic Dragon', rarity: 'common', owned: true, equipped: true, color: 'bg-dragon-orange' },
  { id: '2', name: 'Frost Wyrm', rarity: 'rare', owned: true, equipped: false, color: 'bg-blue-500' },
  { id: '3', name: 'Shadow Drake', rarity: 'epic', owned: true, equipped: false, color: 'bg-purple-600' },
  { id: '4', name: 'Golden Emperor', rarity: 'legendary', owned: false, equipped: false, color: 'bg-dragon-gold' },
  { id: '5', name: 'Inferno Lord', rarity: 'legendary', owned: false, equipped: false, color: 'bg-red-600' },
  { id: '6', name: 'Crystal Wyvern', rarity: 'epic', owned: false, equipped: false, color: 'bg-cyan-400' },
];

const rarityColors: Record<string, string> = {
  common: 'text-muted-foreground',
  rare: 'text-blue-400',
  epic: 'text-purple-400',
  legendary: 'text-dragon-gold',
};

export default function ProfilePage() {
  const { username } = useParams<{ username?: string }>();
  const displayName = username || 'PyroKing';
  const [activeTab, setActiveTab] = useState<Tab>('stats');
  const isOwnProfile = !username;

  const tabs: { key: Tab; label: string }[] = [
    { key: 'stats', label: 'Stats' },
    { key: 'achievements', label: 'Achievements' },
    { key: 'skins', label: 'Skins' },
  ];

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

      <main className="mx-auto max-w-5xl px-6 py-10">
        {/* Profile Card */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="flex flex-col items-center gap-6 sm:flex-row sm:items-start"
        >
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-dragon-orange text-2xl font-bold text-white">
            {getInitials(displayName)}
          </div>
          <div className="text-center sm:text-left">
            <h1 className="text-3xl font-bold text-foreground">{displayName}</h1>
            <p className="mt-1 text-muted-foreground">
              Rank #{mockStats.rank} &middot; Season Tier {mockStats.seasonTier}
            </p>
            <div className="mt-3 flex flex-wrap justify-center gap-2 sm:justify-start">
              <span className="rounded-full bg-dragon-orange/10 px-3 py-0.5 text-xs font-medium text-dragon-orange">
                Pyromancer
              </span>
              <span className="rounded-full bg-purple-500/10 px-3 py-0.5 text-xs font-medium text-purple-400">
                Season 3 Veteran
              </span>
            </div>
          </div>
        </motion.div>

        {/* Tabs */}
        <div className="mt-10 flex gap-1 rounded-lg border border-border bg-card p-1">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={cn(
                'flex-1 rounded-md px-4 py-2 text-sm font-medium transition-colors',
                activeTab === tab.key
                  ? 'bg-secondary text-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Stats Tab */}
        {activeTab === 'stats' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
          >
            {[
              { label: 'High Score', value: formatScore(mockStats.highScore) },
              { label: 'Total Games', value: mockStats.totalGames.toLocaleString() },
              { label: 'Total Distance', value: formatDistance(mockStats.totalDistance) },
              { label: 'Avg Score', value: formatScore(mockStats.avgScore) },
              { label: 'Fire Breaths', value: mockStats.totalFireBreaths.toLocaleString() },
              { label: 'Best Streak', value: `${mockStats.longestStreak} days` },
              { label: 'Global Rank', value: `#${mockStats.rank}` },
              { label: 'Season Tier', value: `${mockStats.seasonTier}/50` },
            ].map((stat) => (
              <div key={stat.label} className="rounded-xl border border-border bg-card p-5">
                <p className="text-sm text-muted-foreground">{stat.label}</p>
                <p className="mt-1 text-2xl font-bold text-foreground">{stat.value}</p>
              </div>
            ))}
          </motion.div>
        )}

        {/* Achievements Tab */}
        {activeTab === 'achievements' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-8 grid gap-3 sm:grid-cols-2"
          >
            {mockAchievements.map((ach) => (
              <div
                key={ach.id}
                className={cn(
                  'flex items-center gap-4 rounded-xl border bg-card p-4',
                  ach.earned ? 'border-border' : 'border-border/50 opacity-50'
                )}
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-secondary text-xl">
                  {ach.icon}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-foreground">{ach.name}</p>
                  <p className="text-xs text-muted-foreground">{ach.description}</p>
                </div>
                {ach.earned && (
                  <span className="text-xs font-medium text-green-500">Earned</span>
                )}
              </div>
            ))}
          </motion.div>
        )}

        {/* Skins Tab */}
        {activeTab === 'skins' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
          >
            {mockSkins.map((skin) => (
              <div
                key={skin.id}
                className={cn(
                  'relative overflow-hidden rounded-xl border bg-card p-5',
                  skin.equipped ? 'border-dragon-orange' : 'border-border',
                  !skin.owned && 'opacity-60'
                )}
              >
                {skin.equipped && (
                  <span className="absolute right-3 top-3 rounded-full bg-dragon-orange px-2 py-0.5 text-[10px] font-bold text-white">
                    EQUIPPED
                  </span>
                )}
                <div className={cn('mb-4 h-16 w-16 rounded-lg', skin.color)} />
                <p className="font-medium text-foreground">{skin.name}</p>
                <p className={cn('text-xs font-medium capitalize', rarityColors[skin.rarity])}>
                  {skin.rarity}
                </p>
                {isOwnProfile && skin.owned && !skin.equipped && (
                  <button className="mt-3 w-full rounded-lg border border-border bg-secondary py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-muted">
                    Equip
                  </button>
                )}
                {!skin.owned && (
                  <p className="mt-3 text-center text-xs text-muted-foreground">Locked</p>
                )}
              </div>
            ))}
          </motion.div>
        )}
      </main>
    </motion.div>
  );
}
