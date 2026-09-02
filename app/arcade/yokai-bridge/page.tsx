import type { Metadata } from 'next';
import Link from 'next/link';
import { YokaiBridgeGame } from '@/components/arcade/YokaiBridgeGame';

export const metadata: Metadata = {
  title: 'Yokai Bridge — cross the lantern-lit bridge | Loophole Arcade',
  description:
    'A free 3D game: guide a friendly tanuki-yokai across an old wooden bridge lit by paper lanterns. Some planks are missing — shift lanes and hop your way to the torii gate on the far side.',
};

export default function YokaiBridgePage() {
  return (
    <main className="relative">
      <div className="arcade-burst" />
      <div className="relative z-10 max-w-2xl mx-auto px-4 pt-8 pb-16">
        <Link href="/" className="text-xs tracking-widest text-white/40 hover:text-white/70">
          ← LOOPHOLE
        </Link>
        <div className="text-center mt-4 mb-6">
          <h1 className="arcade-title text-5xl sm:text-6xl uppercase">Yokai Bridge</h1>
          <p className="text-white/70 mt-4 text-sm max-w-sm mx-auto">
            A little tanuki-yokai, an old wooden bridge, and a lot of missing planks.
          </p>
        </div>
        <YokaiBridgeGame />
      </div>
    </main>
  );
}
