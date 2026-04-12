import { useRef, useState, type MouseEvent } from 'react';
import { motion, useInView } from 'framer-motion';
import {
  Globe,
  Users,
  Ghost,
  Swords,
  Trophy,
  Smartphone,
} from 'lucide-react';

interface Feature {
  icon: React.ElementType;
  title: string;
  description: string;
}

const features: Feature[] = [
  {
    icon: Globe,
    title: '3D World',
    description:
      'Explore lush prehistoric landscapes rendered in real-time 3D. Volcanoes, jungles, and ice caves — each biome has unique obstacles and secrets.',
  },
  {
    icon: Users,
    title: 'Multiplayer Races',
    description:
      'Challenge up to 8 friends in real-time races. Draft behind opponents, steal power-ups, and fight for every millisecond.',
  },
  {
    icon: Ghost,
    title: 'Ghost Replays',
    description:
      'Race against your personal best or compete with ghost data from top leaderboard players. Watch exactly how they set their records.',
  },
  {
    icon: Swords,
    title: 'Boss Fights',
    description:
      'Face off against massive predators at the end of every world. Learn their patterns, dodge their attacks, and claim legendary rewards.',
  },
  {
    icon: Trophy,
    title: 'Season Pass',
    description:
      'Unlock 50+ tiers of exclusive skins, trails, and emotes each season. Free track included — premium pass amplifies your rewards.',
  },
  {
    icon: Smartphone,
    title: 'Mobile Ready',
    description:
      'Seamless cross-platform play with touch-optimized controls. Your progress syncs everywhere — desktop, tablet, or phone.',
  },
];

function FeatureCard({
  feature,
  index,
}: {
  feature: Feature;
  index: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-60px' });
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  const Icon = feature.icon;

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
      transition={{
        type: 'spring',
        stiffness: 100,
        damping: 20,
        delay: index * 0.1,
      }}
      whileHover={{ y: -8, transition: { type: 'spring', stiffness: 300, damping: 20 } }}
      onMouseMove={handleMouseMove}
      className="group relative rounded-2xl p-px overflow-hidden"
    >
      {/* Mouse-following gradient border */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{
          background: `radial-gradient(320px circle at ${mousePos.x}px ${mousePos.y}px, rgba(255,77,28,0.4), transparent 70%)`,
        }}
      />

      {/* Static subtle border */}
      <div className="absolute inset-0 rounded-2xl border border-white/[0.08]" />

      {/* Card content */}
      <div className="relative rounded-2xl bg-dragon-darker/80 p-6 sm:p-8 h-full backdrop-blur-sm">
        <div className="mb-4 inline-flex items-center justify-center rounded-xl bg-dragon-orange/10 p-3 text-dragon-orange">
          <Icon className="h-6 w-6" />
        </div>
        <h3 className="mb-2 text-lg font-semibold text-white">
          {feature.title}
        </h3>
        <p className="text-sm leading-relaxed text-white/50">
          {feature.description}
        </p>
      </div>
    </motion.div>
  );
}

export default function Features() {
  return (
    <section id="features" className="relative py-24 sm:py-32 px-4">
      <div className="mx-auto max-w-6xl">
        {/* Section header */}
        <div className="text-center mb-16">
          <motion.span
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="inline-block text-sm font-medium uppercase tracking-widest text-dragon-orange mb-4"
          >
            Features
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ type: 'spring', stiffness: 100, damping: 20 }}
            className="font-display text-3xl sm:text-4xl md:text-5xl font-bold text-white"
          >
            Built for speed. Designed for fun.
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{
              type: 'spring',
              stiffness: 100,
              damping: 20,
              delay: 0.1,
            }}
            className="mt-4 max-w-2xl mx-auto text-white/50"
          >
            Every feature is crafted to keep you on the edge of extinction —
            and loving every second of it.
          </motion.p>
        </div>

        {/* Feature grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {features.map((feature, i) => (
            <FeatureCard key={feature.title} feature={feature} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
