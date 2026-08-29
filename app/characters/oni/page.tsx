import type { Metadata } from 'next';
import Link from 'next/link';
import { OniMascot } from '@/components/arcade/OniMascot';

export const metadata: Metadata = {
  title: 'ONI — Loophole Arcade Character Bio',
  description: 'Meet ONI, the short-tempered mascot of Loophole Arcade. Origin, stats, and why he punches rocks for a living.',
};

const STATS = [
  { label: 'Power', value: 92 },
  { label: 'Speed', value: 68 },
  { label: 'Patience', value: 4 },
  { label: 'Combo Sense', value: 87 },
];

export default function OniCharacterPage() {
  return (
    <main className="arcade-root min-h-screen">
      <div className="arcade-burst" />
      <div className="relative z-10 max-w-md mx-auto px-4 pt-8 pb-16">
        <Link href="/arcade/oni-smash" className="text-xs tracking-widest text-white/40 hover:text-white/70">
          ← BACK TO ONI SMASH
        </Link>

        <div className="text-center mt-4">
          <div className="w-48 mx-auto">
            <OniMascot pose="victory" />
          </div>
          <h1 className="arcade-title text-5xl uppercase mt-2">Oni</h1>
          <p className="text-xs tracking-widest mt-1" style={{ color: 'var(--arcade-cyan)' }}>
            ARCADE MASCOT · TEMPER: SHORT
          </p>
        </div>

        <section className="arcade-stat-panel rounded-2xl p-5 mt-6">
          <h2 className="font-black text-lg mb-2" style={{ color: 'var(--arcade-yellow)' }}>
            ORIGIN
          </h2>
          <p className="text-white/80 text-sm leading-relaxed">
            Nobody remembers where Oni came from. One day the arcade cabinet in the corner just
            turned on by itself, and he was standing inside it, arms crossed, waiting for a
            challenger. He doesn't talk much. He communicates almost entirely through punching
            things — rocks, mostly, though he's not against branching out if you give him a
            reason.
          </p>
          <p className="text-white/80 text-sm leading-relaxed mt-3">
            His one horn is a sore subject. He used to have two. He will not elaborate.
          </p>
        </section>

        <section className="arcade-stat-panel rounded-2xl p-5 mt-4">
          <h2 className="font-black text-lg mb-3" style={{ color: 'var(--arcade-yellow)' }}>
            STATS
          </h2>
          <div className="space-y-3">
            {STATS.map((stat) => (
              <div key={stat.label}>
                <div className="flex justify-between text-xs mb-1">
                  <span>{stat.label}</span>
                  <span>{stat.value}/100</span>
                </div>
                <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${stat.value}%`, background: 'var(--arcade-pink)' }}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="arcade-stat-panel rounded-2xl p-5 mt-4">
          <h2 className="font-black text-lg mb-2" style={{ color: 'var(--arcade-yellow)' }}>
            FIELD NOTES
          </h2>
          <ul className="text-white/80 text-sm space-y-2 list-disc list-inside">
            <li>Gets visibly faster the longer a fight goes on. Nobody has clocked his top speed.</li>
            <li>Loses composure (and combo) the moment something gets past him.</li>
            <li>Undefeated against rocks. 0–1 against a door frame in an incident he doesn't discuss.</li>
          </ul>
        </section>

        <p className="text-center mt-8">
          <Link
            href="/arcade/oni-smash"
            className="arcade-cta inline-block px-8 py-3 rounded-full font-black"
            style={{ background: 'var(--arcade-yellow)', color: '#141018' }}
          >
            CHALLENGE HIM
          </Link>
        </p>
      </div>
    </main>
  );
}
