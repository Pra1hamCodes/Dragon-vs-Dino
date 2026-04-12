import { motion } from 'framer-motion';

const TESTIMONIALS = [
  { name: 'Alex K.', score: '8,450', quote: 'Best browser game I have played in years. The 3D graphics are insane for a web game.' },
  { name: 'Maria S.', score: '12,100', quote: 'Multiplayer races with my friends are so addictive. We play every lunch break.' },
  { name: 'James T.', score: '5,200', quote: 'The boss fights every 500 points keep you on edge. Incredible game design.' },
  { name: 'Priya R.', score: '9,800', quote: 'Season pass is totally worth it. The exclusive skins are gorgeous.' },
  { name: 'Marcus L.', score: '15,300', quote: 'I have been climbing the leaderboard for weeks. This game has real depth.' },
  { name: 'Sophie W.', score: '7,600', quote: 'Runs perfectly on my phone. The touch controls are responsive and intuitive.' },
  { name: 'Ethan B.', score: '11,200', quote: 'Ghost replay is genius. Racing against my own best run pushes me to improve.' },
  { name: 'Luna C.', score: '6,900', quote: 'The biome transitions as your score climbs are so smooth. Love the volcanic theme.' },
];

const row1 = TESTIMONIALS.slice(0, 4);
const row2 = TESTIMONIALS.slice(4);

function TestimonialCard({ name, score, quote }: { name: string; score: string; quote: string }) {
  return (
    <div className="mx-3 w-80 flex-shrink-0 rounded-xl border border-white/5 bg-white/5 p-6 backdrop-blur-sm">
      <p className="text-sm leading-relaxed text-muted-foreground">"{quote}"</p>
      <div className="mt-4 flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-dragon-orange to-dragon-red text-xs font-bold">
          {name.split(' ').map((n) => n[0]).join('')}
        </div>
        <div>
          <div className="text-sm font-medium">{name}</div>
          <div className="text-xs text-dragon-gold">Best: {score}</div>
        </div>
      </div>
    </div>
  );
}

function MarqueeRow({ items, reverse = false }: { items: typeof TESTIMONIALS; reverse?: boolean }) {
  const doubled = [...items, ...items];
  return (
    <div className="flex overflow-hidden">
      <motion.div
        className="flex"
        animate={{ x: reverse ? ['0%', '-50%'] : ['-50%', '0%'] }}
        transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
      >
        {doubled.map((t, i) => (
          <TestimonialCard key={`${t.name}-${i}`} {...t} />
        ))}
      </motion.div>
    </div>
  );
}

export function Testimonials() {
  return (
    <section className="relative overflow-hidden py-24">
      <div className="mx-auto max-w-7xl">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-12 text-center text-4xl font-bold"
        >
          What Players <span className="text-dragon-orange">Say</span>
        </motion.h2>

        <div className="space-y-6">
          <MarqueeRow items={row1} />
          <MarqueeRow items={row2} reverse />
        </div>
      </div>
    </section>
  );
}
