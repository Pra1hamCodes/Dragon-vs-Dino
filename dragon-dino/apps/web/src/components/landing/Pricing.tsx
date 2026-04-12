import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, X } from 'lucide-react';

const FEATURES = [
  { name: 'Unlimited runs', free: true, premium: true },
  { name: 'Daily challenges', free: true, premium: true },
  { name: 'Global leaderboard', free: true, premium: true },
  { name: 'Basic skins (5)', free: true, premium: true },
  { name: 'All skins (25+)', free: false, premium: true },
  { name: 'Exclusive boss skins', free: false, premium: true },
  { name: '2x XP gain', free: false, premium: true },
  { name: 'Animated nameplate', free: false, premium: true },
  { name: 'Priority matchmaking', free: false, premium: true },
  { name: 'Season rewards track', free: false, premium: true },
];

export function Pricing() {
  const [billing, setBilling] = useState<'seasonal' | 'monthly'>('seasonal');

  return (
    <section id="pricing" className="relative py-24">
      <div className="mx-auto max-w-5xl px-6">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-4 text-center text-4xl font-bold"
        >
          Season <span className="text-dragon-orange">Pass</span>
        </motion.h2>
        <p className="mb-8 text-center text-muted-foreground">
          Play free forever, or unlock premium for the full experience.
        </p>

        {/* Billing toggle */}
        <div className="mb-12 flex justify-center">
          <div className="relative flex rounded-full bg-secondary p-1">
            <button
              onClick={() => setBilling('seasonal')}
              className={`relative z-10 rounded-full px-6 py-2 text-sm font-medium transition-colors ${billing === 'seasonal' ? 'text-white' : 'text-muted-foreground'}`}
            >
              Seasonal
            </button>
            <button
              onClick={() => setBilling('monthly')}
              className={`relative z-10 rounded-full px-6 py-2 text-sm font-medium transition-colors ${billing === 'monthly' ? 'text-white' : 'text-muted-foreground'}`}
            >
              Monthly
            </button>
            <motion.div
              layoutId="billing-pill"
              className="absolute inset-y-1 rounded-full bg-dragon-orange"
              style={{ width: '50%', left: billing === 'seasonal' ? '0%' : '50%' }}
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            />
          </div>
        </div>

        {/* Cards */}
        <div className="grid gap-8 md:grid-cols-2">
          {/* Free */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="rounded-2xl border border-white/10 bg-card p-8"
          >
            <h3 className="text-2xl font-bold">Free</h3>
            <div className="mt-4">
              <span className="text-4xl font-bold">$0</span>
              <span className="text-muted-foreground"> / forever</span>
            </div>
            <Badge variant="secondary" className="mt-3">Current Plan</Badge>
            <ul className="mt-8 space-y-3">
              {FEATURES.map((f) => (
                <li key={f.name} className="flex items-center gap-3">
                  {f.free ? (
                    <Check className="h-4 w-4 text-green-500" />
                  ) : (
                    <X className="h-4 w-4 text-muted-foreground/40" />
                  )}
                  <span className={f.free ? '' : 'text-muted-foreground/40'}>{f.name}</span>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Premium */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="relative overflow-hidden rounded-2xl border border-dragon-orange/30 bg-card p-8"
          >
            {/* Shimmer border */}
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-transparent via-dragon-orange/10 to-transparent animate-shimmer" />

            <div className="relative">
              <div className="flex items-center gap-3">
                <h3 className="text-2xl font-bold">Premium</h3>
                <Badge variant="orange">Popular</Badge>
              </div>
              <div className="mt-4">
                <span className="text-4xl font-bold">
                  {billing === 'seasonal' ? '$2.49' : '$0.99'}
                </span>
                <span className="text-muted-foreground">
                  {billing === 'seasonal' ? ' / season' : ' / month'}
                </span>
              </div>
              <Button variant="glow" className="mt-4 w-full" size="lg">Upgrade</Button>
              <ul className="mt-8 space-y-3">
                {FEATURES.map((f) => (
                  <li key={f.name} className="flex items-center gap-3">
                    <Check className="h-4 w-4 text-dragon-gold" />
                    <span>{f.name}</span>
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
