import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Navigation } from '@/components/landing/Navigation';
import { Testimonials } from '@/components/landing/Testimonials';

const fadeInUp = {
  initial: { opacity: 0, y: 40 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-100px' },
  transition: { duration: 0.6, ease: 'easeOut' },
};

function Hero() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end start'],
  });
  const y = useTransform(scrollYProgress, [0, 1], [0, 200]);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  return (
    <section ref={ref} className="relative flex min-h-screen items-center justify-center overflow-hidden">
      <motion.div style={{ y, opacity }} className="relative z-10 mx-auto max-w-5xl px-6 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        >
          <span className="mb-4 inline-block rounded-full border border-dragon-orange/30 bg-dragon-orange/10 px-4 py-1.5 text-sm font-medium text-dragon-orange">
            Season 3 is Live
          </span>
          <h1 className="mt-6 font-display text-6xl font-bold leading-tight tracking-tight text-foreground md:text-8xl">
            Dragon<span className="text-dragon-orange">Dino</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground md:text-xl">
            The Chrome dino runner reimagined with fire-breathing dragons, multiplayer races,
            and competitive seasons. How far can you fly?
          </p>
          <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link
              to="/play"
              className="inline-flex h-12 items-center rounded-lg bg-dragon-orange px-8 text-base font-semibold text-white shadow-lg shadow-dragon-orange/25 transition-all hover:bg-dragon-orange/90 hover:shadow-xl hover:shadow-dragon-orange/30"
            >
              Play Now
            </Link>
            <Link
              to="/leaderboard"
              className="inline-flex h-12 items-center rounded-lg border border-border bg-card px-8 text-base font-semibold text-foreground transition-colors hover:bg-secondary"
            >
              View Leaderboard
            </Link>
          </div>
        </motion.div>
      </motion.div>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-dragon-orange/5 via-transparent to-transparent" />
    </section>
  );
}

const features = [
  {
    title: 'Fire-Breathing Action',
    description: 'Master flame attacks to destroy obstacles and rack up bonus points. Chain combos for explosive multipliers.',
    icon: '\u{1F525}',
  },
  {
    title: 'Multiplayer Races',
    description: 'Race against up to 4 friends in real-time. Sabotage opponents with power-ups or focus on your own high score.',
    icon: '\u{26A1}',
  },
  {
    title: 'Season Pass',
    description: 'Unlock exclusive dragon skins, trails, and emotes. 50 tiers of rewards every season.',
    icon: '\u{1F3C6}',
  },
  {
    title: 'Global Leaderboards',
    description: 'Compete for the top spot on daily, weekly, and all-time leaderboards. Anti-cheat verified.',
    icon: '\u{1F30D}',
  },
];

function Features() {
  return (
    <section className="py-32">
      <div className="mx-auto max-w-6xl px-6">
        <motion.div {...fadeInUp} className="text-center">
          <h2 className="font-display text-4xl font-bold text-foreground md:text-5xl">
            Not Your Average Runner
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
            Every feature designed for speed, competition, and pure fun.
          </p>
        </motion.div>
        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="group rounded-xl border border-border bg-card p-6 transition-colors hover:border-dragon-orange/40"
            >
              <div className="mb-4 text-3xl">{feature.icon}</div>
              <h3 className="text-lg font-semibold text-foreground">{feature.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

const steps = [
  { step: '01', title: 'Jump In', description: 'No account needed. Hit Play and start running instantly.' },
  { step: '02', title: 'Learn the Controls', description: 'Space to jump, down to duck, F to breathe fire. Simple.' },
  { step: '03', title: 'Climb the Ranks', description: 'Sign in to save scores, unlock skins, and compete on leaderboards.' },
];

function HowToPlay() {
  return (
    <section className="border-y border-border bg-card/50 py-32">
      <div className="mx-auto max-w-4xl px-6">
        <motion.h2
          {...fadeInUp}
          className="text-center font-display text-4xl font-bold text-foreground md:text-5xl"
        >
          How to Play
        </motion.h2>
        <div className="mt-16 space-y-12">
          {steps.map((item, i) => (
            <motion.div
              key={item.step}
              initial={{ opacity: 0, x: i % 2 === 0 ? -30 : 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="flex items-start gap-6"
            >
              <span className="flex-shrink-0 font-mono text-4xl font-bold text-dragon-orange/30">
                {item.step}
              </span>
              <div>
                <h3 className="text-xl font-semibold text-foreground">{item.title}</h3>
                <p className="mt-1 text-muted-foreground">{item.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

const mockLeaders = [
  { rank: 1, name: 'PyroKing', score: 48720, distance: '12.4km' },
  { rank: 2, name: 'ScaleSprinter', score: 45100, distance: '11.8km' },
  { rank: 3, name: 'FlameRider', score: 42350, distance: '11.1km' },
  { rank: 4, name: 'DinoDash99', score: 39800, distance: '10.6km' },
  { rank: 5, name: 'NovaDragon', score: 37200, distance: '9.9km' },
];

function LeaderboardPreview() {
  return (
    <section className="py-32">
      <div className="mx-auto max-w-3xl px-6">
        <motion.div {...fadeInUp} className="text-center">
          <h2 className="font-display text-4xl font-bold text-foreground md:text-5xl">
            Top Runners This Week
          </h2>
          <p className="mt-4 text-muted-foreground">Think you can beat them?</p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-12 overflow-hidden rounded-xl border border-border bg-card"
        >
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-border text-sm text-muted-foreground">
                <th className="px-6 py-3 font-medium">#</th>
                <th className="px-6 py-3 font-medium">Player</th>
                <th className="px-6 py-3 text-right font-medium">Score</th>
                <th className="hidden px-6 py-3 text-right font-medium sm:table-cell">Distance</th>
              </tr>
            </thead>
            <tbody>
              {mockLeaders.map((player) => (
                <tr key={player.rank} className="border-b border-border/50 last:border-0">
                  <td className={cn('px-6 py-4 font-mono font-bold', player.rank <= 3 && 'text-dragon-gold')}>
                    {player.rank}
                  </td>
                  <td className="px-6 py-4 font-medium text-foreground">{player.name}</td>
                  <td className="px-6 py-4 text-right font-mono text-foreground">
                    {player.score.toLocaleString()}
                  </td>
                  <td className="hidden px-6 py-4 text-right text-muted-foreground sm:table-cell">
                    {player.distance}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </motion.div>
        <div className="mt-6 text-center">
          <Link to="/leaderboard" className="text-sm font-medium text-dragon-orange hover:underline">
            View Full Leaderboard &rarr;
          </Link>
        </div>
      </div>
    </section>
  );
}

function Pricing() {
  return (
    <section className="border-t border-border bg-card/50 py-32">
      <div className="mx-auto max-w-5xl px-6">
        <motion.div {...fadeInUp} className="text-center">
          <h2 className="font-display text-4xl font-bold text-foreground md:text-5xl">
            Free to Play, Fun to Flex
          </h2>
          <p className="mt-4 text-muted-foreground">
            The game is 100% free. The Season Pass unlocks cosmetics only.
          </p>
        </motion.div>
        <div className="mt-16 grid gap-8 md:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="rounded-xl border border-border bg-card p-8"
          >
            <h3 className="text-lg font-semibold text-foreground">Free</h3>
            <p className="mt-1 text-3xl font-bold text-foreground">$0</p>
            <ul className="mt-6 space-y-3 text-sm text-muted-foreground">
              <li className="flex items-center gap-2"><span className="text-green-500">&#10003;</span> Full game access</li>
              <li className="flex items-center gap-2"><span className="text-green-500">&#10003;</span> Multiplayer races</li>
              <li className="flex items-center gap-2"><span className="text-green-500">&#10003;</span> Leaderboard rankings</li>
              <li className="flex items-center gap-2"><span className="text-green-500">&#10003;</span> Default dragon skin</li>
              <li className="flex items-center gap-2"><span className="text-green-500">&#10003;</span> Free season track (25 tiers)</li>
            </ul>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="relative rounded-xl border-2 border-dragon-orange bg-card p-8"
          >
            <span className="absolute -top-3 right-6 rounded-full bg-dragon-orange px-3 py-0.5 text-xs font-bold text-white">
              POPULAR
            </span>
            <h3 className="text-lg font-semibold text-foreground">Season Pass</h3>
            <p className="mt-1 text-3xl font-bold text-foreground">
              $4.99 <span className="text-base font-normal text-muted-foreground">/ season</span>
            </p>
            <ul className="mt-6 space-y-3 text-sm text-muted-foreground">
              <li className="flex items-center gap-2"><span className="text-dragon-orange">&#10003;</span> Everything in Free</li>
              <li className="flex items-center gap-2"><span className="text-dragon-orange">&#10003;</span> Premium track (50 tiers)</li>
              <li className="flex items-center gap-2"><span className="text-dragon-orange">&#10003;</span> Exclusive dragon skins</li>
              <li className="flex items-center gap-2"><span className="text-dragon-orange">&#10003;</span> Custom flame trails</li>
              <li className="flex items-center gap-2"><span className="text-dragon-orange">&#10003;</span> Profile badge &amp; flair</li>
            </ul>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-border py-12">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-6 px-6 sm:flex-row">
        <div className="flex items-center gap-2">
          <span className="font-display text-lg font-bold text-foreground">
            Dragon<span className="text-dragon-orange">Dino</span>
          </span>
        </div>
        <nav className="flex gap-6 text-sm text-muted-foreground">
          <Link to="/play" className="hover:text-foreground">Play</Link>
          <Link to="/leaderboard" className="hover:text-foreground">Leaderboard</Link>
          <Link to="/season" className="hover:text-foreground">Season</Link>
          <a href="#" className="hover:text-foreground">Discord</a>
          <a href="#" className="hover:text-foreground">Twitter</a>
        </nav>
        <p className="text-xs text-muted-foreground">&copy; 2026 DragonDino. All rights reserved.</p>
      </div>
    </footer>
  );
}

export default function LandingPage() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="min-h-screen bg-background"
    >
      <Navigation />
      <Hero />
      <Features />
      <HowToPlay />
      <LeaderboardPreview />
      <Pricing />
      <Testimonials />
      <Footer />
    </motion.div>
  );
}
