'use client';

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export type AnimalSpecies = 'fox' | 'bunny' | 'raccoon' | 'mouse';

export interface AnimalPalette {
  body: string;
  belly: string;
  accent: string;
  earInner: string;
}

export const ANIMAL_PALETTES: Record<AnimalSpecies, AnimalPalette> = {
  fox: { body: '#E8823D', belly: '#FFF3E0', accent: '#2B2320', earInner: '#3A2A22' },
  bunny: { body: '#F3D9E4', belly: '#FFFFFF', accent: '#C98CA6', earInner: '#F2A6BE' },
  raccoon: { body: '#6E6A66', belly: '#EDEAE4', accent: '#2A2724', earInner: '#4A4642' },
  mouse: { body: '#D9D2C7', belly: '#FBF9F4', accent: '#8A8074', earInner: '#E9AFC0' },
};

/**
 * A soft, rounded "toy figurine" critter built entirely from primitives —
 * no external model files. Smooth-shaded spheres and capsules stacked and
 * scaled to read clearly as a specific animal at a glance, with a gentle
 * idle bob and a four-limb walk cycle driven by `speed` (0 = idle).
 */
export function AnimalCharacter({
  species,
  speed = 0,
  color,
}: {
  species: AnimalSpecies;
  speed?: number;
  color?: Partial<AnimalPalette>;
}) {
  const palette = { ...ANIMAL_PALETTES[species], ...color };
  const group = useRef<THREE.Group>(null);
  const tailRef = useRef<THREE.Group>(null);
  const armL = useRef<THREE.Group>(null);
  const armR = useRef<THREE.Group>(null);
  const legL = useRef<THREE.Group>(null);
  const legR = useRef<THREE.Group>(null);
  const t = useRef(0);

  useFrame((_, delta) => {
    t.current += delta * (speed > 0.05 ? 8 : 2);
    const walking = speed > 0.05;
    const swing = walking ? Math.sin(t.current) * 0.55 : Math.sin(t.current) * 0.06;
    if (legL.current) legL.current.rotation.x = swing;
    if (legR.current) legR.current.rotation.x = -swing;
    if (armL.current) armL.current.rotation.x = -swing * 0.7;
    if (armR.current) armR.current.rotation.x = swing * 0.7;
    if (group.current) group.current.position.y = walking ? Math.abs(Math.sin(t.current * 2)) * 0.06 : Math.sin(t.current) * 0.03;
    if (tailRef.current) tailRef.current.rotation.z = Math.sin(t.current * (walking ? 1.6 : 0.8)) * 0.25;
  });

  const earShape: [number, number, number] =
    species === 'fox'
      ? [0.16, 0.34, 0.16]
      : species === 'bunny'
        ? [0.11, 0.52, 0.11]
        : species === 'raccoon'
          ? [0.18, 0.22, 0.18]
          : [0.2, 0.2, 0.05];

  return (
    <group ref={group}>
      {/* body */}
      <mesh position={[0, 0.42, 0]} castShadow>
        <capsuleGeometry args={[0.26,  0.22, 24, 48]} />
        <meshStandardMaterial color={palette.body} roughness={0.5} envMapIntensity={1} />
      </mesh>
      {/* belly patch */}
      <mesh position={[0, 0.36, 0.2]} scale={[0.7, 0.8, 0.5]}>
        <sphereGeometry args={[0.24, 48, 48]} />
        <meshStandardMaterial color={palette.belly} roughness={0.55} envMapIntensity={1} />
      </mesh>

      {/* head */}
      <group position={[0, 0.82, 0.02]}>
        <mesh castShadow>
          <sphereGeometry args={[0.27, 48, 48]} />
          <meshStandardMaterial color={palette.body} roughness={0.48} envMapIntensity={1.1} />
        </mesh>
        {/* snout */}
        <mesh position={[0, -0.05, 0.22]} scale={species === 'mouse' ? [0.6, 0.55, 0.7] : [0.75, 0.65, 0.85]}>
          <sphereGeometry args={[0.15, 48, 48]} />
          <meshStandardMaterial color={species === 'fox' || species === 'raccoon' ? palette.belly : palette.body} roughness={0.55} envMapIntensity={1} />
        </mesh>
        <mesh position={[0, -0.06, 0.34]}>
          <sphereGeometry args={[0.045, 48, 48]} />
          <meshStandardMaterial color={palette.accent} roughness={0.3} envMapIntensity={1.2} />
        </mesh>

        {/* eyes */}
        {[-1, 1].map((side) => (
          <group key={side} position={[0.12 * side, 0.03, 0.21]}>
            <mesh>
              <sphereGeometry args={[0.045, 48, 48]} />
              <meshStandardMaterial color="#231C18" roughness={0.15} envMapIntensity={1.4} />
            </mesh>
            <mesh position={[0.012 * side, 0.012, 0.03]}>
              <sphereGeometry args={[0.014, 48, 48]} />
              <meshStandardMaterial color="#FFFFFF" emissive="#FFFFFF" emissiveIntensity={0.6} />
            </mesh>
          </group>
        ))}

        {/* raccoon mask */}
        {species === 'raccoon' && (
          <>
            {[-1, 1].map((side) => (
              <mesh key={side} position={[0.12 * side, 0.02, 0.19]} rotation={[0, 0, 0]}>
                <sphereGeometry args={[0.08, 48, 48]} />
                <meshStandardMaterial color={palette.accent} roughness={0.4} envMapIntensity={1} />
              </mesh>
            ))}
          </>
        )}

        {/* ears */}
        {[-1, 1].map((side) => (
          <group key={side} position={[0.16 * side, 0.22, -0.02]} rotation={[0, 0, side * (species === 'bunny' ? 0.12 : 0.3)]}>
            <mesh castShadow>
              <capsuleGeometry args={[earShape[0],  earShape[1] - earShape[0] * 2, 24, 48]} />
              <meshStandardMaterial color={palette.body} roughness={0.5} envMapIntensity={1} />
            </mesh>
            <mesh position={[0, 0, 0.04]} scale={[0.6, 0.85, 0.4]}>
              <capsuleGeometry args={[earShape[0] * 0.7,  (earShape[1] - earShape[0] * 2) * 0.8, 24, 48]} />
              <meshStandardMaterial color={palette.earInner} roughness={0.55} envMapIntensity={1} />
            </mesh>
          </group>
        ))}

        {/* raccoon rings on ears substitute: stripe on head for fox/raccoon flair */}
        {species === 'fox' && (
          <mesh position={[0, 0.24, -0.08]} scale={[1, 0.4, 0.6]}>
            <sphereGeometry args={[0.2, 48, 48]} />
            <meshStandardMaterial color={palette.belly} roughness={0.55} envMapIntensity={1} />
          </mesh>
        )}
      </group>

      {/* arms */}
      {[-1, 1].map((side) => (
        <group key={side} ref={side === -1 ? armL : armR} position={[0.24 * side, 0.5, 0.02]}>
          <mesh position={[0, -0.12, 0]} castShadow>
            <capsuleGeometry args={[0.07,  0.16, 24, 48]} />
            <meshStandardMaterial color={palette.body} roughness={0.5} envMapIntensity={1} />
          </mesh>
        </group>
      ))}

      {/* legs */}
      {[-1, 1].map((side) => (
        <group key={side} ref={side === -1 ? legL : legR} position={[0.11 * side, 0.24, 0]}>
          <mesh position={[0, -0.14, 0]} castShadow>
            <capsuleGeometry args={[0.085,  0.16, 24, 48]} />
            <meshStandardMaterial color={palette.body} roughness={0.5} envMapIntensity={1} />
          </mesh>
          <mesh position={[0, -0.24, 0.03]} scale={[1, 0.6, 1.3]}>
            <sphereGeometry args={[0.08, 48, 48]} />
            <meshStandardMaterial color={palette.accent} roughness={0.48} envMapIntensity={1.1} />
          </mesh>
        </group>
      ))}

      {/* tail */}
      <group ref={tailRef} position={[0, 0.42, -0.24]}>
        <mesh
          position={[0, 0.05, species === 'bunny' ? -0.02 : -0.14]}
          scale={species === 'bunny' ? [1, 1, 1] : species === 'mouse' ? [0.35, 0.35, 1.6] : [0.6, 0.6, 1]}
          castShadow
        >
          <sphereGeometry args={[species === 'bunny' ? 0.11 : 0.14, 48, 48]} />
          <meshStandardMaterial color={species === 'raccoon' ? palette.accent : palette.body} roughness={0.5} envMapIntensity={1} />
        </mesh>
      </group>
    </group>
  );
}
