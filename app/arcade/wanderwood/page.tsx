import type { Metadata } from 'next';
import Link from 'next/link';
import { WanderwoodGame } from '@/components/arcade/WanderwoodGame';

export const metadata: Metadata = {
  title: 'Wanderwood — a 3D glade exploration game | Loophole Arcade',
  description:
    'A free 3D exploration game: pick a fox, bunny, raccoon, mouse, or wanderer, roam the glade, and collect every glowing gem as fast as you can.',
};

export default function WanderwoodPage() {
  return (
    <main className="relative">
      <div className="arcade-burst" />
      <div className="relative z-10 max-w-2xl mx-auto px-4 pt-8 pb-16">
        <Link href="/" className="text-xs tracking-widest text-white/40 hover:text-white/70">
          ← LOOPHOLE
        </Link>
        <div className="text-center mt-4 mb-6">
          <h1 className="arcade-title text-5xl sm:text-6xl uppercase">Wanderwood</h1>
          <p className="text-white/70 mt-4 text-sm max-w-sm mx-auto">
            Pick your explorer and roam the glade. Collect every gem as fast as you can.
          </p>
        </div>
        <WanderwoodGame />
      </div>
    </main>
  );
}
