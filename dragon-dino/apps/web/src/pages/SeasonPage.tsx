import { motion } from 'framer-motion';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface Tier {
  level: number;
  freeReward: string | null;
  premiumReward: string | null | undefined;
  xpRequired: number;
}

const tiers: Tier[] = Array.from({ length: 50 }, (_, i) => ({
  level: i + 1,
  freeReward:
    i % 5 === 0
      ? ['50 Coins', '100 Coins', 'Flame Trail (Basic)', '200 Coins', 'Common Crate'][
          Math.floor(i / 10) % 5
        ] || '50 Coins'
      : null,
  premiumReward: [
    'Dragon Egg Fragment',
    'XP Boost (2x)',
    'Rare Crate',
    'Ember Particles',
    'Premium Coins x100',
    'Dragon Scale',
    'Epic Crate',
    'Custom Trail',
    'Legendary Fragment',
    'Season Badge',
  ][i % 10],
  xpRequired: 500 + i * 120,
}));

const currentTier = 38;
const currentXP = 320;
const seasonEndsIn = '18 days';
const hasPremium = false;

export default function SeasonPage() {
  const [showPremiumModal, setShowPremiumModal] = useState(false);

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
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-6">
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

      <main className="mx-auto max-w-6xl px-6 py-10">
        {/* Season Header */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between"
        >
          <div>
            <span className="rounded-full border border-dragon-orange/30 bg-dragon-orange/10 px-3 py-1 text-xs font-medium text-dragon-orange">
              Season 3
            </span>
            <h1 className="mt-3 font-display text-4xl font-bold text-foreground">
              Reign of Embers
            </h1>
            <p className="mt-2 text-muted-foreground">
              Ends in <span className="font-medium text-foreground">{seasonEndsIn}</span>
            </p>
          </div>
          {!hasPremium && (
            <button
              onClick={() => setShowPremiumModal(true)}
              className="rounded-lg bg-gradient-to-r from-dragon-orange to-dragon-red px-6 py-2.5 text-sm font-bold text-white shadow-lg shadow-dragon-orange/20 transition-shadow hover:shadow-xl hover:shadow-dragon-orange/30"
            >
              Upgrade to Premium &mdash; $4.99
            </button>
          )}
        </motion.div>

        {/* Current Progress */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.15 }}
          className="mt-8 rounded-xl border border-border bg-card p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Current Tier</p>
              <p className="text-3xl font-bold text-foreground">{currentTier}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Next Tier</p>
              <p className="text-lg font-medium text-foreground">
                {currentXP}/{tiers[currentTier - 1]?.xpRequired || 0} XP
              </p>
            </div>
          </div>
          <div className="mt-4 h-3 overflow-hidden rounded-full bg-secondary">
            <motion.div
              initial={{ width: 0 }}
              animate={{
                width: `${(currentXP / (tiers[currentTier - 1]?.xpRequired || 1)) * 100}%`,
              }}
              transition={{ duration: 1, ease: 'easeOut' }}
              className="h-full rounded-full bg-gradient-to-r from-dragon-orange to-dragon-red"
            />
          </div>
        </motion.div>

        {/* Tier Track */}
        <div className="mt-10">
          <h2 className="mb-6 text-lg font-semibold text-foreground">Tier Rewards</h2>
          <div className="space-y-2">
            {tiers.map((tier) => {
              const isUnlocked = tier.level <= currentTier;
              const isCurrent = tier.level === currentTier;

              return (
                <motion.div
                  key={tier.level}
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  className={cn(
                    'flex items-center gap-4 rounded-lg border p-3 transition-colors',
                    isCurrent
                      ? 'border-dragon-orange bg-dragon-orange/5'
                      : isUnlocked
                        ? 'border-border/50 bg-card/50'
                        : 'border-border bg-card'
                  )}
                >
                  {/* Level Badge */}
                  <div
                    className={cn(
                      'flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg font-mono text-sm font-bold',
                      isUnlocked
                        ? 'bg-dragon-orange text-white'
                        : 'bg-secondary text-muted-foreground'
                    )}
                  >
                    {tier.level}
                  </div>

                  {/* Free Reward */}
                  <div className="flex-1">
                    {tier.freeReward ? (
                      <div
                        className={cn(
                          'rounded-md border px-3 py-1.5 text-sm',
                          isUnlocked
                            ? 'border-green-500/30 bg-green-500/10 text-green-400'
                            : 'border-border bg-secondary text-muted-foreground'
                        )}
                      >
                        {tier.freeReward}
                        <span className="ml-2 text-[10px] uppercase opacity-60">Free</span>
                      </div>
                    ) : (
                      <div className="h-8" />
                    )}
                  </div>

                  {/* Premium Reward */}
                  <div className="flex-1">
                    {tier.premiumReward && (
                      <div
                        className={cn(
                          'rounded-md border px-3 py-1.5 text-sm',
                          isUnlocked && hasPremium
                            ? 'border-dragon-gold/30 bg-dragon-gold/10 text-dragon-gold'
                            : 'border-border bg-secondary text-muted-foreground',
                          !hasPremium && 'opacity-50'
                        )}
                      >
                        {tier.premiumReward}
                        <span className="ml-2 text-[10px] uppercase opacity-60">Premium</span>
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </main>

      {/* Premium Modal */}
      {showPremiumModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="mx-4 w-full max-w-md rounded-2xl border border-border bg-card p-8"
          >
            <h2 className="font-display text-2xl font-bold text-foreground">Upgrade to Premium</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Unlock all 50 tiers of exclusive rewards including legendary dragon skins,
              custom flame trails, and profile badges.
            </p>
            <ul className="mt-6 space-y-2 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <span className="text-dragon-orange">&#10003;</span> 50 premium tier rewards
              </li>
              <li className="flex items-center gap-2">
                <span className="text-dragon-orange">&#10003;</span> Exclusive Season 3 dragon skin
              </li>
              <li className="flex items-center gap-2">
                <span className="text-dragon-orange">&#10003;</span> 10% XP boost all season
              </li>
            </ul>
            <div className="mt-8 flex gap-3">
              <button className="flex-1 rounded-lg bg-dragon-orange py-2.5 text-sm font-bold text-white transition-opacity hover:opacity-90">
                Buy for $4.99
              </button>
              <button
                onClick={() => setShowPremiumModal(false)}
                className="rounded-lg border border-border bg-secondary px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted"
              >
                Maybe Later
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
}
