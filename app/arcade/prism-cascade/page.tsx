import type { Metadata } from 'next';
import Link from 'next/link';
import { PrismCascadeGame } from '@/components/arcade/PrismCascadeGame';

export const metadata: Metadata = {
  title: 'Prism Cascade — connect gems, chain the cascade | Loophole Arcade',
  description:
    'A free falling-gem puzzle game: drop colored gem pairs, connect 4 or more of the same color to clear them, and chain multiple pops in one drop for bonus score. Fill the meter to trigger Overdrive.',
};

export default function PrismCascadePage() {
  return (
    <main className="relative">
      <div className="arcade-burst" />
      <div className="relative z-10 max-w-sm mx-auto px-4 pt-8 pb-16">
        <Link href="/" className="text-xs tracking-widest text-white/40 hover:text-white/70">
          ← LOOPHOLE
        </Link>
        <div className="text-center mt-4 mb-6">
          <h1 className="arcade-title text-5xl sm:text-6xl uppercase">Prism<br />Cascade</h1>
          <p className="text-white/70 mt-4 text-sm max-w-xs mx-auto">
            Connect 4+ gems to pop them. Chain the cascade. Fill the meter, trigger Overdrive.
          </p>
        </div>
        <PrismCascadeGame />
      </div>
    </main>
  );
}
