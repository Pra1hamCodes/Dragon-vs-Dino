import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Trophy } from 'lucide-react';

const MOCK_LEADERBOARD = [
  { rank: 1, username: 'DragonSlayer99', score: 12450, avatar: 'DS' },
  { rank: 2, username: 'DinoMaster', score: 11890, avatar: 'DM' },
  { rank: 3, username: 'SpeedRunner_X', score: 10770, avatar: 'SR' },
  { rank: 4, username: 'JumpKing42', score: 9560, avatar: 'JK' },
  { rank: 5, username: 'NightRider', score: 8920, avatar: 'NR' },
  { rank: 6, username: 'CoinHunter', score: 8340, avatar: 'CH' },
  { rank: 7, username: 'PhoenixRise', score: 7890, avatar: 'PR' },
  { rank: 8, username: 'StormChaser', score: 7210, avatar: 'SC' },
];

const rankColors: Record<number, string> = {
  1: 'from-yellow-500 to-amber-600',
  2: 'from-gray-300 to-gray-400',
  3: 'from-orange-600 to-amber-700',
};

export function LeaderboardPreview() {
  return (
    <section id="leaderboard" className="relative py-24">
      <div className="mx-auto max-w-3xl px-6">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-4 text-center text-4xl font-bold"
        >
          Live <span className="text-dragon-gold">Leaderboard</span>
        </motion.h2>
        <p className="mb-12 text-center text-muted-foreground">
          Today's top runners. Can you beat them?
        </p>

        <div className="overflow-hidden rounded-2xl border border-white/5 bg-card">
          {MOCK_LEADERBOARD.map((entry, i) => (
            <motion.div
              key={entry.rank}
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className={`flex items-center gap-4 px-6 py-4 ${i !== MOCK_LEADERBOARD.length - 1 ? 'border-b border-white/5' : ''} ${entry.rank === 1 ? 'bg-dragon-gold/5' : ''}`}
            >
              {/* Rank */}
              <div className="w-8 text-center">
                {entry.rank <= 3 ? (
                  <div className={`inline-flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br ${rankColors[entry.rank]} text-sm font-bold text-black`}>
                    {entry.rank}
                  </div>
                ) : (
                  <span className="text-sm text-muted-foreground">{entry.rank}</span>
                )}
              </div>

              {/* Avatar */}
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-dragon-orange to-dragon-red text-xs font-bold">
                {entry.avatar}
              </div>

              {/* Name */}
              <div className="flex-1">
                <div className="font-medium">{entry.username}</div>
              </div>

              {/* Score */}
              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                className="font-mono text-lg font-bold text-dragon-gold"
              >
                {entry.score.toLocaleString()}
              </motion.div>

              {entry.rank === 1 && (
                <Trophy className="h-5 w-5 text-dragon-gold" />
              )}
            </motion.div>
          ))}
        </div>

        <div className="mt-8 text-center">
          <Link to="/leaderboard">
            <Button variant="outline" size="lg">View Full Leaderboard</Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
