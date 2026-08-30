'use client';

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export type HumanVariant = 'explorer-a' | 'explorer-b';

export interface HumanPalette {
  skin: string;
  hair: string;
  outfit: string;
  outfitAccent: string;
}

export const HUMAN_PALETTES: Record<HumanVariant, HumanPalette> = {
  'explorer-a': { skin: '#F4C9A0', hair: '#5B3A29', outfit: '#4C8C6B', outfitAccent: '#F2E4C9' },
  'explorer-b': { skin: '#8C5A3C', hair: '#231B16', outfit: '#3D6B9E', outfitAccent: '#F2E4C9' },
};

/**
 * A soft, rounded "toy figurine" human — big head-to-body ratio (like the
 * animal companions) so the two families of characters read as one
 * consistent, friendly art style rather than two mismatched styles glued
 * together. Same idle/walk animation rig as AnimalCharacter for consistency.
 */
export function HumanCharacter({
  variant,
  speed = 0,
  color,
}: {
  variant: HumanVariant;
  speed?: number;
  color?: Partial<HumanPalette>;
}) {
  const palette = { ...HUMAN_PALETTES[variant], ...color };
  const group = useRef<THREE.Group>(null);
  const armL = useRef<THREE.Group>(null);
  const armR = useRef<THREE.Group>(null);
  const legL = useRef<THREE.Group>(null);
  const legR = useRef<THREE.Group>(null);
  const t = useRef(0);

  useFrame((_, delta) => {
    t.current += delta * (speed > 0.05 ? 8 : 2);
    const walking = speed > 0.05;
    const swing = walking ? Math.sin(t.current) * 0.6 : Math.sin(t.current) * 0.05;
    if (legL.current) legL.current.rotation.x = swing;
    if (legR.current) legR.current.rotation.x = -swing;
    if (armL.current) armL.current.rotation.x = -swing * 0.8;
    if (armR.current) armR.current.rotation.x = swing * 0.8;
    if (group.current) group.current.position.y = walking ? Math.abs(Math.sin(t.current * 2)) * 0.06 : Math.sin(t.current) * 0.03;
  });

  return (
    <group ref={group}>
      {/* torso */}
      <mesh position={[0, 0.46, 0]} castShadow>
        <capsuleGeometry args={[0.22, 0.24, 12, 24]} />
        <meshStandardMaterial color={palette.outfit} roughness={0.5} envMapIntensity={1} />
      </mesh>
      {/* belt/accent */}
      <mesh position={[0, 0.32, 0]}>
        <torusGeometry args={[0.22, 0.03, 12, 32]} />
        <meshStandardMaterial color={palette.outfitAccent} roughness={0.4} envMapIntensity={1.1} metalness={0.05} />
      </mesh>

      {/* head */}
      <group position={[0, 0.92, 0]}>
        <mesh castShadow>
          <sphereGeometry args={[0.28, 32, 32]} />
          <meshStandardMaterial color={palette.skin} roughness={0.45} envMapIntensity={1.1} />
        </mesh>
        {/* hair cap */}
        <mesh position={[0, 0.1, -0.03]} scale={[1.06, 0.92, 1.05]}>
          <sphereGeometry args={[0.27, 32, 32, 0, Math.PI * 2, 0, Math.PI * 0.64]} />
          <meshStandardMaterial color={palette.hair} roughness={0.35} envMapIntensity={1} />
        </mesh>
        {/* bangs */}
        <mesh position={[0, 0.06, 0.2]} rotation={[0.25, 0, 0]} scale={[1, 0.55, 0.6]}>
          <sphereGeometry args={[0.24, 24, 24]} />
          <meshStandardMaterial color={palette.hair} roughness={0.35} envMapIntensity={1} />
        </mesh>
        {/* side hair strands */}
        {[-1, 1].map((side) => (
          <mesh key={side} position={[0.24 * side, -0.08, 0.02]} rotation={[0, 0, side * 0.15]} castShadow>
            <capsuleGeometry args={[0.05, 0.28, 16, 32]} />
            <meshStandardMaterial color={palette.hair} roughness={0.35} envMapIntensity={1} />
          </mesh>
        ))}

        {/* eyes */}
        {[-1, 1].map((side) => (
          <group key={side} position={[0.1 * side, 0.02, 0.24]}>
            <mesh scale={[1, 1.15, 0.6]}>
              <sphereGeometry args={[0.045, 32, 32]} />
              <meshStandardMaterial color="#231C18" roughness={0.15} envMapIntensity={1.4} />
            </mesh>
            <mesh position={[0.014 * side, 0.016, 0.032]}>
              <sphereGeometry args={[0.015, 16, 16]} />
              <meshStandardMaterial color="#FFFFFF" emissive="#FFFFFF" emissiveIntensity={0.8} />
            </mesh>
          </group>
        ))}
        {/* cheeks */}
        {[-1, 1].map((side) => (
          <mesh key={side} position={[0.16 * side, -0.06, 0.19]}>
            <sphereGeometry args={[0.035, 24, 24]} />
            <meshStandardMaterial color="#F2968C" opacity={0.5} transparent roughness={0.9} />
          </mesh>
        ))}
        {/* smile */}
        <mesh position={[0, -0.1, 0.25]} rotation={[0, 0, Math.PI]}>
          <torusGeometry args={[0.05, 0.012, 16, 32, Math.PI]} />
          <meshStandardMaterial color="#8A4B3C" roughness={0.5} envMapIntensity={0.8} />
        </mesh>
      </group>

      {/* arms */}
      {[-1, 1].map((side) => (
        <group key={side} ref={side === -1 ? armL : armR} position={[0.26 * side, 0.56, 0]}>
          <mesh position={[0, -0.14, 0]} castShadow>
            <capsuleGeometry args={[0.075, 0.2, 10, 20]} />
            <meshStandardMaterial color={palette.outfit} roughness={0.5} envMapIntensity={1} />
          </mesh>
          <mesh position={[0, -0.28, 0]}>
            <sphereGeometry args={[0.07, 20, 20]} />
            <meshStandardMaterial color={palette.skin} roughness={0.45} envMapIntensity={1.1} />
          </mesh>
        </group>
      ))}

      {/* legs */}
      {[-1, 1].map((side) => (
        <group key={side} ref={side === -1 ? legL : legR} position={[0.11 * side, 0.24, 0]}>
          <mesh position={[0, -0.16, 0]} castShadow>
            <capsuleGeometry args={[0.09, 0.2, 10, 20]} />
            <meshStandardMaterial color={palette.outfitAccent} roughness={0.45} envMapIntensity={1} />
          </mesh>
          <mesh position={[0, -0.32, 0.04]} scale={[1, 0.6, 1.4]}>
            <sphereGeometry args={[0.09, 18, 18]} />
            <meshStandardMaterial color={palette.hair === '#231B16' ? '#2A2A2A' : '#4A3327'} roughness={0.6} />
          </mesh>
        </group>
      ))}
    </group>
  );
}
