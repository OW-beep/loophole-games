import type { Metadata } from 'next';
import Link from 'next/link';
import { OniMascot } from '@/components/arcade/OniMascot';
import { OniSmashGame } from './OniSmashGame';

export const metadata: Metadata = {
  title: 'Oni Smash — punch the rocks before they land | Loophole Arcade',
  description:
    'A free reflex arcade game: smash falling rocks before they hit the ground, chain combos, and beat your high score. Meet ONI, Loophole\u2019s arcade mascot.',
};

export default function OniSmashPage() {
  return (
    <main className="relative">
      <div className="arcade-burst" />

      <div className="relative z-10 max-w-md mx-auto px-4 pt-8 pb-16">
        <Link href="/" className="text-xs tracking-widest text-white/40 hover:text-white/70">
          ← LOOPHOLE
        </Link>

        <div className="text-center mt-4 mb-2">
          <div className="w-40 mx-auto mb-2">
            <OniMascot pose="idle" />
          </div>
          <h1 className="arcade-title text-5xl sm:text-6xl uppercase">
            Oni
            <br />
            Smash
          </h1>
          <p className="text-white/70 mt-4 text-sm max-w-xs mx-auto">
            Punch the rocks before they land. Chain combos. Don't let your temper cool.
          </p>
        </div>

        <div className="mt-6">
          <OniSmashGame />
        </div>

        <p className="text-center mt-8">
          <Link href="/characters/oni" className="text-xs tracking-widest underline" style={{ color: 'var(--arcade-cyan)' }}>
            WHO IS ONI? →
          </Link>
        </p>
      </div>
    </main>
  );
}
