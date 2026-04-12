import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUp, ArrowLeftRight, Gem, Trophy } from 'lucide-react';

const STEPS = [
  {
    icon: ArrowUp,
    title: 'Jump',
    description: 'Press Space or tap to leap over incoming dragons. Double-jump for extra height.',
    color: '#22c55e',
  },
  {
    icon: ArrowLeftRight,
    title: 'Dodge',
    description: 'Use arrow keys or swipe to sidestep dragon clusters and projectiles.',
    color: '#3b82f6',
  },
  {
    icon: Gem,
    title: 'Collect',
    description: 'Grab coins and power-ups mid-run. Shield, magnet, slow-mo, and more.',
    color: '#FFD700',
  },
  {
    icon: Trophy,
    title: 'Survive',
    description: 'The world gets faster and harder. How long can you last?',
    color: '#FF4D1C',
  },
];

export function HowToPlay() {
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % STEPS.length);
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  const step = STEPS[activeStep]!;

  return (
    <section id="how-to-play" className="relative py-24">
      <div className="mx-auto max-w-4xl px-6">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-16 text-center text-4xl font-bold"
        >
          How to <span className="text-dragon-orange">Play</span>
        </motion.h2>

        <div className="flex flex-col items-center gap-12">
          {/* Step dots */}
          <div className="flex gap-3">
            {STEPS.map((s, i) => (
              <button
                key={i}
                onClick={() => setActiveStep(i)}
                className="relative h-3 w-3 rounded-full"
              >
                <div className={`h-full w-full rounded-full transition-colors ${i === activeStep ? 'bg-dragon-orange' : 'bg-white/20'}`} />
                {i === activeStep && (
                  <motion.div
                    layoutId="step-indicator"
                    className="absolute -inset-1 rounded-full border-2 border-dragon-orange"
                  />
                )}
              </button>
            ))}
          </div>

          {/* Active step content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeStep}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="flex flex-col items-center gap-6 text-center"
            >
              <motion.div
                className="flex h-24 w-24 items-center justify-center rounded-2xl"
                style={{ backgroundColor: step.color + '20', color: step.color }}
              >
                <step.icon className="h-12 w-12" />
              </motion.div>
              <h3 className="text-3xl font-bold">{step.title}</h3>
              <p className="max-w-md text-lg text-muted-foreground">{step.description}</p>
            </motion.div>
          </AnimatePresence>

          {/* Step number */}
          <div className="text-sm text-muted-foreground">
            Step {activeStep + 1} of {STEPS.length}
          </div>
        </div>
      </div>
    </section>
  );
}
