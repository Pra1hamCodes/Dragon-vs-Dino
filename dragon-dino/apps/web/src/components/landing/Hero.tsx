import { useRef } from 'react';
import {
  motion,
  useScroll,
  useTransform,
  useMotionValueEvent,
} from 'framer-motion';
import { ChevronDown, Play, Sparkles } from 'lucide-react';

const headline = 'The Dino That Survived Everything';

const letterVariants = {
  hidden: { opacity: 0, y: 20, rotateX: -90 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    rotateX: 0,
    transition: {
      type: 'spring',
      stiffness: 150,
      damping: 20,
      delay: i * 0.03,
    },
  }),
};

const badgeVariants = {
  animate: {
    y: [0, -4, 0],
    transition: {
      duration: 2.5,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
};

export default function Hero() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end start'],
  });

  const headlineY = useTransform(scrollYProgress, [0, 1], [0, -120]);
  const subheadingY = useTransform(scrollYProgress, [0, 1], [0, -80]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  return (
    <section
      ref={containerRef}
      className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden"
    >
      {/* Animated gradient background */}
      <div
        className="absolute inset-0 -z-10"
        style={{
          background:
            'linear-gradient(135deg, #050505 0%, #0a0a0a 30%, #1a0a00 50%, #0a0a0a 70%, #050505 100%)',
          backgroundSize: '400% 400%',
          animation: 'heroGradient 8s ease infinite',
        }}
      />

      {/* Orange shimmer overlay */}
      <div className="absolute inset-0 -z-10 opacity-30">
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse at 50% 50%, rgba(255,77,28,0.15) 0%, transparent 70%)',
            animation: 'heroShimmer 4s ease-in-out infinite alternate',
          }}
        />
      </div>

      {/* Grid pattern overlay */}
      <div
        className="absolute inset-0 -z-10 opacity-[0.03]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
          backgroundSize: '64px 64px',
        }}
      />

      <motion.div
        style={{ opacity }}
        className="relative z-10 flex flex-col items-center text-center px-4 max-w-5xl mx-auto"
      >
        {/* Announcement badge */}
        <motion.div
          variants={badgeVariants}
          animate="animate"
          className="mb-8"
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-dragon-orange/30 bg-dragon-orange/10 px-4 py-1.5 text-sm font-medium text-dragon-orange backdrop-blur-sm">
            <Sparkles className="h-3.5 w-3.5" />
            Season 3 is live — New boss fights await
          </span>
        </motion.div>

        {/* Headline with staggered letter reveal */}
        <motion.h1
          style={{ y: headlineY }}
          className="font-display text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight text-white leading-[1.1]"
        >
          {headline.split('').map((char, i) => (
            <motion.span
              key={i}
              custom={i}
              variants={letterVariants}
              initial="hidden"
              animate="visible"
              className="inline-block"
              style={{ whiteSpace: char === ' ' ? 'pre' : undefined }}
            >
              {char === ' ' ? '\u00A0' : char}
            </motion.span>
          ))}
        </motion.h1>

        {/* Subheading */}
        <motion.p
          style={{ y: subheadingY }}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            type: 'spring',
            stiffness: 100,
            damping: 20,
            delay: 0.6 + headline.length * 0.03,
          }}
          className="mt-6 max-w-2xl text-lg sm:text-xl text-white/60 leading-relaxed"
        >
          Race through ancient ruins, dodge meteor showers, and outlast every
          extinction event the universe throws at you. Your survival streak
          starts now.
        </motion.p>

        {/* CTA buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            type: 'spring',
            stiffness: 100,
            damping: 20,
            delay: 0.9 + headline.length * 0.03,
          }}
          className="mt-10 flex flex-col sm:flex-row items-center gap-4"
        >
          {/* Play Now - primary CTA */}
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            className="group relative inline-flex items-center gap-2 rounded-xl bg-dragon-orange px-8 py-4 text-lg font-semibold text-white shadow-lg shadow-dragon-orange/25 transition-shadow hover:shadow-dragon-orange/40"
          >
            {/* Glowing border animation */}
            <span className="absolute -inset-[1px] rounded-xl bg-gradient-to-r from-dragon-orange via-dragon-gold to-dragon-orange bg-[length:200%_100%] animate-shimmer opacity-0 group-hover:opacity-100 transition-opacity -z-10 blur-sm" />
            <Play className="h-5 w-5 fill-current" />
            Play Now
          </motion.button>

          {/* Watch Trailer - secondary CTA */}
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/5 px-8 py-4 text-lg font-semibold text-white backdrop-blur-sm transition-colors hover:border-white/40 hover:bg-white/10"
          >
            <Play className="h-5 w-5" />
            Watch Trailer
          </motion.button>
        </motion.div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
      >
        <span className="text-xs uppercase tracking-widest text-white/40">
          Scroll
        </span>
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          <ChevronDown className="h-5 w-5 text-white/40" />
        </motion.div>
      </motion.div>

      {/* Inline keyframes */}
      <style>{`
        @keyframes heroGradient {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        @keyframes heroShimmer {
          0% { transform: scale(1); opacity: 0.2; }
          100% { transform: scale(1.2); opacity: 0.4; }
        }
      `}</style>
    </section>
  );
}
