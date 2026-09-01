'use client';

import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';

export type AnimalSpecies = 'fox' | 'bunny' | 'raccoon' | 'mouse' | 'tanuki';

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
  tanuki: { body: '#A9784F', belly: '#F0E4CE', accent: '#4A3323', earInner: '#5C4331' },
};

/** Species whose snout is the same color as the rest of the head, so it
 * could be fused + smoothed together into one seamless piece. Fox and
 * raccoon keep a lighter, differently-colored muzzle, so their snout stays
 * a separate primitive layered on top instead. */
const FUSED_SNOUT_SPECIES = new Set<AnimalSpecies>(['bunny', 'mouse', 'tanuki']);

function headModelPath(species: AnimalSpecies) {
  return `/models/${species}_head.glb`;
}

/** Pulls the single mesh's geometry out of a generated (trimesh-exported)
 * glTF file — these files only ever contain one mesh each, so we don't
 * rely on a specific node name. */
function useSculptedGeometry(path: string) {
  const { scene } = useGLTF(path);
  return useMemo(() => {
    let geometry: THREE.BufferGeometry | null = null;
    scene.traverse((child) => {
      if (!geometry && (child as THREE.Mesh).isMesh) {
        geometry = (child as THREE.Mesh).geometry;
      }
    });
    return geometry;
  }, [scene]);
}

const ALL_SPECIES: AnimalSpecies[] = ['fox', 'bunny', 'raccoon', 'mouse', 'tanuki'];
ALL_SPECIES.forEach((s) => useGLTF.preload(headModelPath(s)));
useGLTF.preload('/models/animal_torso.glb');

/**
 * A soft, rounded "toy figurine" critter. The head+neck (and, for
 * same-colored-muzzle species, the snout too) are a single smoothed mesh
 * generated offline by unioning and Taubin-smoothing the original
 * primitives — softening the seams that plain stacked spheres/capsules
 * always show. Ears, eyes, limbs, and tail stay as separate live
 * primitives so the walk-cycle animation keeps working normally.
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

  const headGeometry = useSculptedGeometry(headModelPath(species));
  const torsoGeometry = useSculptedGeometry('/models/animal_torso.glb');
  const fusedSnout = FUSED_SNOUT_SPECIES.has(species);

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
      ? [0.139, 0.296, 0.139]
      : species === 'bunny'
        ? [0.096, 0.452, 0.096]
        : species === 'raccoon' || species === 'tanuki'
          ? [0.157, 0.191, 0.157]
          : [0.174, 0.174, 0.044];

  return (
    <group ref={group}>
      {/* body — smoothed torso mesh in place of the raw capsule */}
      {torsoGeometry ? (
        <mesh position={[0, 0.5, 0]} geometry={torsoGeometry} castShadow>
          <meshStandardMaterial color={palette.body} roughness={0.5} envMapIntensity={0.42} />
        </mesh>
      ) : (
        <mesh position={[0, 0.5, 0]} castShadow>
          <capsuleGeometry args={[0.25, 0.24, 24, 48]} />
          <meshStandardMaterial color={palette.body} roughness={0.5} envMapIntensity={0.42} />
        </mesh>
      )}
      {/* belly patch */}
      <mesh position={[0, 0.44, 0.2]} scale={[0.68, 0.78, 0.5]}>
        <sphereGeometry args={[0.24, 48, 48]} />
        <meshStandardMaterial color={palette.belly} roughness={0.55} envMapIntensity={0.42} />
      </mesh>

      {/* head — smoothed mesh already includes the neck and (for
          same-colored-muzzle species) the snout, fused seamlessly */}
      <group position={[0, 0.9, 0.02]}>
        {headGeometry ? (
          <mesh geometry={headGeometry} castShadow>
            <meshStandardMaterial color={palette.body} roughness={0.48} envMapIntensity={0.46} />
          </mesh>
        ) : (
          <mesh castShadow>
            <sphereGeometry args={[0.235, 48, 48]} />
            <meshStandardMaterial color={palette.body} roughness={0.48} envMapIntensity={0.46} />
          </mesh>
        )}
        {/* snout stays a separate piece only for the two lighter-muzzle species */}
        {!fusedSnout && (
          <mesh position={[0, -0.044, 0.19]} scale={[0.75, 0.65, 0.85]}>
            <sphereGeometry args={[0.13, 48, 48]} />
            <meshStandardMaterial color={palette.belly} roughness={0.55} envMapIntensity={0.42} />
          </mesh>
        )}
        <mesh position={[0, -0.052, 0.296]}>
          <sphereGeometry args={[0.045, 48, 48]} />
          <meshStandardMaterial color={palette.accent} roughness={0.3} envMapIntensity={0.5} />
        </mesh>

        {/* eyes */}
        {[-1, 1].map((side) => (
          <group key={side} position={[0.104 * side, 0.026, 0.183]}>
            <mesh>
              <sphereGeometry args={[0.045, 48, 48]} />
              <meshStandardMaterial color="#231C18" roughness={0.15} envMapIntensity={0.59} />
            </mesh>
            <mesh position={[0.0104 * side, 0.0104, 0.026]}>
              <sphereGeometry args={[0.0122, 48, 48]} />
              <meshStandardMaterial color="#FFFFFF" emissive="#FFFFFF" emissiveIntensity={0.6} />
            </mesh>
          </group>
        ))}

        {/* raccoon / tanuki eye mask */}
        {(species === 'raccoon' || species === 'tanuki') && (
          <>
            {[-1, 1].map((side) => (
              <mesh key={side} position={[0.104 * side, 0.017, 0.165]} rotation={[0, 0, 0]}>
                <sphereGeometry args={[0.07, 48, 48]} />
                <meshStandardMaterial color={palette.accent} roughness={0.4} envMapIntensity={0.42} />
              </mesh>
            ))}
          </>
        )}

        {/* ears */}
        {[-1, 1].map((side) => (
          <group key={side} position={[0.139 * side, 0.191, -0.017]} rotation={[0, 0, side * (species === 'bunny' ? 0.12 : 0.3)]}>
            <mesh castShadow>
              <capsuleGeometry args={[earShape[0], earShape[1] - earShape[0] * 2, 24, 48]} />
              <meshStandardMaterial color={palette.body} roughness={0.5} envMapIntensity={0.42} />
            </mesh>
            <mesh position={[0, 0, 0.04]} scale={[0.6, 0.85, 0.4]}>
              <capsuleGeometry args={[earShape[0] * 0.7, (earShape[1] - earShape[0] * 2) * 0.8, 24, 48]} />
              <meshStandardMaterial color={palette.earInner} roughness={0.55} envMapIntensity={0.42} />
            </mesh>
          </group>
        ))}

        {/* raccoon rings on ears substitute: stripe on head for fox/raccoon flair */}
        {species === 'fox' && (
          <mesh position={[0, 0.209, -0.07]} scale={[1, 0.4, 0.6]}>
            <sphereGeometry args={[0.174, 48, 48]} />
            <meshStandardMaterial color={palette.belly} roughness={0.55} envMapIntensity={0.42} />
          </mesh>
        )}
      </group>

      {/* arms */}
      {[-1, 1].map((side) => (
        <group key={side} ref={side === -1 ? armL : armR} position={[0.24 * side, 0.5, 0.02]}>
          <mesh position={[0, -0.12, 0]} castShadow>
            <capsuleGeometry args={[0.07, 0.16, 24, 48]} />
            <meshStandardMaterial color={palette.body} roughness={0.5} envMapIntensity={0.42} />
          </mesh>
        </group>
      ))}

      {/* legs */}
      {[-1, 1].map((side) => (
        <group key={side} ref={side === -1 ? legL : legR} position={[0.11 * side, 0.24, 0]}>
          <mesh position={[0, -0.14, 0]} castShadow>
            <capsuleGeometry args={[0.085, 0.16, 24, 48]} />
            <meshStandardMaterial color={palette.body} roughness={0.5} envMapIntensity={0.42} />
          </mesh>
          <mesh position={[0, -0.24, 0.03]} scale={[1, 0.6, 1.3]}>
            <sphereGeometry args={[0.07, 48, 48]} />
            <meshStandardMaterial color={palette.accent} roughness={0.48} envMapIntensity={0.46} />
          </mesh>
        </group>
      ))}

      {/* tail */}
      <group ref={tailRef} position={[0, 0.42, -0.24]}>
        {species === 'tanuki' ? (
          <>
            <mesh position={[0, 0.08, -0.16]} scale={[0.85, 0.85, 1.1]} castShadow>
              <sphereGeometry args={[0.16, 48, 48]} />
              <meshStandardMaterial color={palette.body} roughness={0.55} envMapIntensity={0.42} />
            </mesh>
            <mesh position={[0, 0.1, -0.3]} scale={[0.65, 0.65, 0.9]} castShadow>
              <sphereGeometry args={[0.14, 48, 48]} />
              <meshStandardMaterial color={palette.accent} roughness={0.55} envMapIntensity={0.42} />
            </mesh>
          </>
        ) : (
          <mesh
            position={[0, 0.05, species === 'bunny' ? -0.02 : -0.14]}
            scale={species === 'bunny' ? [1, 1, 1] : species === 'mouse' ? [0.35, 0.35, 1.6] : [0.6, 0.6, 1]}
            castShadow
          >
            <sphereGeometry args={[species === 'bunny' ? 0.11 : 0.14, 48, 48]} />
            <meshStandardMaterial color={species === 'raccoon' ? palette.accent : palette.body} roughness={0.5} envMapIntensity={0.42} />
          </mesh>
        )}
      </group>

      {/* tanuki accessories: straw hat + a lantern carried in one hand */}
      {species === 'tanuki' && (
        <>
          <group position={[0, 1.12, 0.02]}>
            <mesh rotation={[0, 0, 0]} castShadow>
              <coneGeometry args={[0.26, 0.14, 32]} />
              <meshStandardMaterial color="#D8B978" roughness={0.85} envMapIntensity={0.3} />
            </mesh>
            <mesh position={[0, -0.07, 0]}>
              <cylinderGeometry args={[0.09, 0.11, 0.04, 24]} />
              <meshStandardMaterial color="#C4A468" roughness={0.85} envMapIntensity={0.3} />
            </mesh>
          </group>
          <group position={[-0.24 * 1, 0.5 - 0.24, 0.02]}>
            <mesh castShadow>
              <sphereGeometry args={[0.09, 32, 32]} />
              <meshStandardMaterial color="#F4C97A" emissive="#F4C97A" emissiveIntensity={0.9} roughness={0.4} toneMapped={false} />
            </mesh>
            <pointLight color="#F4C97A" intensity={0.5} distance={1.4} />
          </group>
        </>
      )}
    </group>
  );
}

