import { Link } from 'react-router-dom';
import { Github, Twitter } from 'lucide-react';

const LINKS = {
  Game: [
    { label: 'Play', href: '/play' },
    { label: 'Leaderboard', href: '/leaderboard' },
    { label: 'Season Pass', href: '/season' },
    { label: 'Multiplayer', href: '/multiplayer' },
  ],
  Company: [
    { label: 'About', href: '#' },
    { label: 'Blog', href: '#' },
    { label: 'Careers', href: '#' },
  ],
  Legal: [
    { label: 'Privacy', href: '#' },
    { label: 'Terms', href: '#' },
  ],
};

const TECH_BADGES = ['React', 'Three.js', 'TypeScript', 'Tailwind', 'Node.js', 'PostgreSQL'];

export function Footer() {
  return (
    <footer className="relative border-t border-white/5 bg-dragon-darker">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-dragon-orange/50 to-transparent" />

      <div className="mx-auto max-w-7xl px-6 py-16">
        <div className="grid gap-12 md:grid-cols-4">
          {/* Brand */}
          <div>
            <div className="text-xl font-bold">
              <span className="text-dragon-orange">Dragon</span>
              <span className="text-dragon-gold">-Dino</span>
            </div>
            <p className="mt-3 text-sm text-muted-foreground">
              Infinite 3D runner. Dodge dragons, chase glory.
            </p>
            <div className="mt-4 flex gap-3">
              <a href="#" className="text-muted-foreground transition-colors hover:text-white">
                <Github className="h-5 w-5" />
              </a>
              <a href="#" className="text-muted-foreground transition-colors hover:text-white">
                <Twitter className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(LINKS).map(([title, links]) => (
            <div key={title}>
              <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                {title}
              </h4>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.href}
                      className="text-sm text-muted-foreground transition-colors hover:text-white"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Built with */}
        <div className="mt-12 border-t border-white/5 pt-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap gap-2">
              {TECH_BADGES.map((tech) => (
                <span
                  key={tech}
                  className="rounded-full border border-white/10 px-3 py-1 text-xs text-muted-foreground"
                >
                  {tech}
                </span>
              ))}
            </div>
            <p className="text-xs text-muted-foreground">
              {new Date().getFullYear()} Dragon-Dino. MIT License.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
