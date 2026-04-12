import { useState } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Menu, X } from 'lucide-react';

const NAV_LINKS = [
  { label: 'Features', href: '#features' },
  { label: 'How to Play', href: '#how-to-play' },
  { label: 'Leaderboard', href: '#leaderboard' },
  { label: 'Pricing', href: '#pricing' },
];

export function Navigation() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { scrollY } = useScroll();
  const bgOpacity = useTransform(scrollY, [0, 100], [0, 0.9]);
  const padding = useTransform(scrollY, [0, 100], [24, 12]);

  const scrollToSection = (href: string) => {
    const id = href.replace('#', '');
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    setMobileOpen(false);
  };

  return (
    <>
      <motion.nav
        style={{ paddingTop: padding, paddingBottom: padding }}
        className="fixed left-0 right-0 top-0 z-50 px-6"
      >
        <motion.div
          style={{ opacity: bgOpacity }}
          className="absolute inset-0 border-b border-white/5 bg-dragon-dark/80 backdrop-blur-xl"
        />
        <div className="relative mx-auto flex max-w-7xl items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-xl font-bold">
            <span className="text-dragon-orange">Dragon</span>
            <span className="text-dragon-gold">-Dino</span>
          </Link>

          {/* Desktop links */}
          <div className="hidden items-center gap-8 md:flex">
            {NAV_LINKS.map((link) => (
              <button
                key={link.href}
                onClick={() => scrollToSection(link.href)}
                className="group relative text-sm text-muted-foreground transition-colors hover:text-white"
              >
                {link.label}
                <span className="absolute -bottom-1 left-0 h-0.5 w-0 bg-dragon-orange transition-all group-hover:w-full" />
              </button>
            ))}
          </div>

          <div className="hidden md:block">
            <Link to="/play">
              <Button variant="glow">Play Now</Button>
            </Link>
          </div>

          {/* Mobile hamburger */}
          <button
            className="relative z-50 md:hidden"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </motion.nav>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 flex flex-col items-center justify-center bg-dragon-dark/95 backdrop-blur-xl"
          >
            {NAV_LINKS.map((link, i) => (
              <motion.button
                key={link.href}
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: i * 0.1 }}
                onClick={() => scrollToSection(link.href)}
                className="py-4 text-2xl font-medium text-white"
              >
                {link.label}
              </motion.button>
            ))}
            <motion.div
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="mt-6"
            >
              <Link to="/play" onClick={() => setMobileOpen(false)}>
                <Button variant="glow" size="xl">Play Now</Button>
              </Link>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
