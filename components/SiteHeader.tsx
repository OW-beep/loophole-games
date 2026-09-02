import Link from 'next/link';
import { ThemeToggle } from './ThemeToggle';
import { CoinBadge } from './CoinBadge';

export function SiteHeader() {
  return (
    <header className="border-b-2 border-graphite dark:border-white/80">
      <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-baseline gap-2 group">
          <span className="font-display font-bold text-xl tracking-tight relative">
            LOOPHOLE
            <span className="absolute -bottom-0.5 left-0 right-0 h-1 bg-gradient-to-r from-bolt-pink via-bolt-yellow to-bolt-cyan opacity-70" aria-hidden />
          </span>
          <span className="stat-line text-ink/50 dark:text-white/40 hidden sm:inline">
            puzzle index
          </span>
        </Link>
        <nav className="flex items-center gap-4">
          <Link
            href="/arcade/oni-smash"
            className="stat-line hidden sm:inline px-2 py-1 rounded bg-gradient-to-r from-bolt-pink to-bolt-purple text-white font-bold hover:opacity-90 animate-pulse"
          >
            🔥 Arcade
          </Link>
          <Link href="/blog" className="stat-line hover:underline hidden sm:inline">
            Blog
          </Link>
          <Link href="/about" className="stat-line hover:underline hidden sm:inline">
            About
          </Link>
          <CoinBadge />
          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
}
