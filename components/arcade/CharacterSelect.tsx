'use client';

import { useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { Environment } from '@react-three/drei';
import { AnimalCharacter, type AnimalSpecies } from './AnimalCharacter';
import { HumanCharacter, type HumanVariant } from './HumanCharacter';
import type { PlayableCharacter } from './PlayerController';

const ROSTER: { label: string; value: PlayableCharacter }[] = [
  { label: 'Fox', value: { kind: 'animal', species: 'fox' } },
  { label: 'Bunny', value: { kind: 'animal', species: 'bunny' } },
  { label: 'Raccoon', value: { kind: 'animal', species: 'raccoon' } },
  { label: 'Mouse', value: { kind: 'animal', species: 'mouse' } },
  { label: 'Wanderer', value: { kind: 'human', variant: 'explorer-a' } },
  { label: 'Wanderer', value: { kind: 'human', variant: 'explorer-b' } },
];

function PreviewCard({ entry, selected, onSelect }: { entry: (typeof ROSTER)[number]; selected: boolean; onSelect: () => void }) {
  return (
    <button
      onClick={onSelect}
      className={`rounded-xl overflow-hidden border-4 transition-all ${selected ? 'scale-105' : 'opacity-80 hover:opacity-100'}`}
      style={{ borderColor: selected ? 'var(--arcade-yellow)' : 'transparent', background: '#1a1024' }}
    >
      <div style={{ height: 140 }}>
        <Canvas camera={{ position: [0, 0.9, 2.1], fov: 40 }} dpr={[1, 2]}>
          <Environment preset="studio" />
          <ambientLight intensity={0.5} />
          <directionalLight position={[2, 3, 2]} intensity={1} />
          <directionalLight position={[-2, 1, -1]} intensity={0.4} color="#B9D8FF" />
          <group position={[0, -0.55, 0]} rotation={[0, Math.PI * 0.15, 0]}>
            {entry.value.kind === 'animal' ? (
              <AnimalCharacter species={entry.value.species} speed={0} />
            ) : (
              <HumanCharacter variant={entry.value.variant} speed={0} />
            )}
          </group>
        </Canvas>
      </div>
      <p className="text-white text-sm font-bold py-1.5">{entry.label}</p>
    </button>
  );
}

export function CharacterSelect({ onConfirm }: { onConfirm: (character: PlayableCharacter) => void }) {
  const [index, setIndex] = useState(0);
  return (
    <div className="flex flex-col items-center gap-5">
      <p className="text-white/70 text-sm">Choose who explores the glade today.</p>
      <div className="grid grid-cols-3 gap-3 w-full max-w-sm">
        {ROSTER.map((entry, i) => (
          <PreviewCard key={i} entry={entry} selected={i === index} onSelect={() => setIndex(i)} />
        ))}
      </div>
      <button
        onClick={() => onConfirm(ROSTER[index].value)}
        className="arcade-cta px-8 py-3 rounded-full font-black text-lg"
        style={{ background: 'var(--arcade-yellow)', color: '#141018' }}
      >
        START EXPLORING
      </button>
    </div>
  );
}
