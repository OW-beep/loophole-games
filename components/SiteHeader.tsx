import Link from 'next/link';
import { ThemeToggle } from './ThemeToggle';

export function SiteHeader() {
  return (
    <header className="border-b-2 border-graphite dark:border-white/80">
      <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-baseline gap-2 group">
          <span className="font-display font-bold text-xl tracking-tight">
            LOOPHOLE
          </span>
          <span className="stat-line text-ink/50 dark:text-white/40 hidden sm:inline">
            puzzle index
          </span>
        </Link>
        <nav className="flex items-center gap-4">
          <Link href="/blog" className="stat-line hover:underline hidden sm:inline">
            Blog
          </Link>
          <Link href="/about" className="stat-line hover:underline hidden sm:inline">
            About
          </Link>
          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
}
