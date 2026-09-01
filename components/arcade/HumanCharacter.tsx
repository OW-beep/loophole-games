'use client';

import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
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

/** Pulls the single mesh's geometry out of a generated (trimesh-exported)
 * glTF file — these files only ever contain one mesh each. */
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

useGLTF.preload('/models/human_head.glb');
useGLTF.preload('/models/human_torso.glb');

/**
 * A rounded, friendly "toy figurine" human — proportioned closer to a real
 * (if stylized) adult body than a super-deformed chibi: a smaller head, a
 * visible neck, and longer torso/limbs than the original design. Same
 * idle/walk animation rig as AnimalCharacter for consistency.
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
  const headGeometry = useSculptedGeometry('/models/human_head.glb');
  const torsoGeometry = useSculptedGeometry('/models/human_torso.glb');

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

  const shoeColor = palette.hair === '#231B16' ? '#2A2A2A' : '#4A3327';

  return (
    <group ref={group}>
      {/* hips */}
      <mesh position={[0, 0.52, 0]} castShadow>
        <capsuleGeometry args={[0.155, 0.06, 12, 24]} />
        <meshStandardMaterial color={palette.outfitAccent} roughness={0.55} envMapIntensity={0.4} />
      </mesh>

      {/* torso — smoothed mesh in place of the raw capsule */}
      {torsoGeometry ? (
        <mesh position={[0, 0.76, 0]} geometry={torsoGeometry} castShadow>
          <meshStandardMaterial color={palette.outfit} roughness={0.5} envMapIntensity={0.42} />
        </mesh>
      ) : (
        <mesh position={[0, 0.76, 0]} castShadow>
          <capsuleGeometry args={[0.15, 0.34, 12, 24]} />
          <meshStandardMaterial color={palette.outfit} roughness={0.5} envMapIntensity={0.42} />
        </mesh>
      )}
      {/* belt */}
      <mesh position={[0, 0.58, 0]}>
        <torusGeometry args={[0.155, 0.025, 12, 32]} />
        <meshStandardMaterial color={palette.outfitAccent} roughness={0.4} envMapIntensity={0.46} metalness={0.05} />
      </mesh>

      {/* neck */}
      <mesh position={[0, 1.03, 0]}>
        <cylinderGeometry args={[0.06, 0.07, 0.1, 16]} />
        <meshStandardMaterial color={palette.skin} roughness={0.45} envMapIntensity={0.46} />
      </mesh>

      {/* head — smoothed mesh already includes the jaw taper, fused seamlessly */}
      <group position={[0, 1.19, 0]}>
        {headGeometry ? (
          <mesh geometry={headGeometry} castShadow>
            <meshStandardMaterial color={palette.skin} roughness={0.45} envMapIntensity={0.46} />
          </mesh>
        ) : (
          <>
            <mesh castShadow>
              <sphereGeometry args={[0.2, 32, 32]} />
              <meshStandardMaterial color={palette.skin} roughness={0.45} envMapIntensity={0.46} />
            </mesh>
            <mesh position={[0, -0.1, 0.02]} scale={[0.85, 0.6, 0.85]}>
              <sphereGeometry args={[0.17, 28, 28]} />
              <meshStandardMaterial color={palette.skin} roughness={0.45} envMapIntensity={0.46} />
            </mesh>
          </>
        )}

        {/* hair cap */}
        <mesh position={[0, 0.07, -0.02]} scale={[1.05, 0.9, 1.03]}>
          <sphereGeometry args={[0.195, 32, 32, 0, Math.PI * 2, 0, Math.PI * 0.62]} />
          <meshStandardMaterial color={palette.hair} roughness={0.35} envMapIntensity={0.42} />
        </mesh>
        {/* bangs */}
        <mesh position={[0, 0.04, 0.15]} rotation={[0.25, 0, 0]} scale={[1, 0.5, 0.55]}>
          <sphereGeometry args={[0.17, 24, 24]} />
          <meshStandardMaterial color={palette.hair} roughness={0.35} envMapIntensity={0.42} />
        </mesh>
        {/* side hair strands */}
        {[-1, 1].map((side) => (
          <mesh key={side} position={[0.17 * side, -0.06, 0.01]} rotation={[0, 0, side * 0.15]} castShadow>
            <capsuleGeometry args={[0.035, 0.2, 16, 32]} />
            <meshStandardMaterial color={palette.hair} roughness={0.35} envMapIntensity={0.42} />
          </mesh>
        ))}

        {/* eyes */}
        {[-1, 1].map((side) => (
          <group key={side} position={[0.075 * side, 0.01, 0.17]}>
            <mesh scale={[1, 1.15, 0.6]}>
              <sphereGeometry args={[0.032, 32, 32]} />
              <meshStandardMaterial color="#231C18" roughness={0.15} envMapIntensity={0.59} />
            </mesh>
            <mesh position={[0.01 * side, 0.012, 0.023]}>
              <sphereGeometry args={[0.011, 16, 16]} />
              <meshStandardMaterial color="#FFFFFF" emissive="#FFFFFF" emissiveIntensity={0.8} />
            </mesh>
          </group>
        ))}
        {/* brows */}
        {[-1, 1].map((side) => (
          <mesh key={side} position={[0.075 * side, 0.06, 0.175]} rotation={[0, 0, side * -0.15]}>
            <capsuleGeometry args={[0.008, 0.05, 6, 12]} />
            <meshStandardMaterial color={palette.hair} roughness={0.5} />
          </mesh>
        ))}
        {/* nose */}
        <mesh position={[0, -0.02, 0.195]} scale={[0.55, 0.6, 0.5]}>
          <sphereGeometry args={[0.035, 16, 16]} />
          <meshStandardMaterial color={palette.skin} roughness={0.5} envMapIntensity={0.4} />
        </mesh>
        {/* cheeks */}
        {[-1, 1].map((side) => (
          <mesh key={side} position={[0.12 * side, -0.06, 0.13]}>
            <sphereGeometry args={[0.028, 24, 24]} />
            <meshStandardMaterial color="#F2968C" opacity={0.45} transparent roughness={0.9} />
          </mesh>
        ))}
        {/* smile */}
        <mesh position={[0, -0.09, 0.175]} rotation={[0, 0, Math.PI]}>
          <torusGeometry args={[0.035, 0.009, 16, 32, Math.PI]} />
          <meshStandardMaterial color="#8A4B3C" roughness={0.5} envMapIntensity={0.34} />
        </mesh>
      </group>

      {/* arms */}
      {[-1, 1].map((side) => (
        <group key={side} ref={side === -1 ? armL : armR} position={[0.2 * side, 0.92, 0]}>
          <mesh position={[0, -0.19, 0]} castShadow>
            <capsuleGeometry args={[0.055, 0.3, 10, 20]} />
            <meshStandardMaterial color={palette.outfit} roughness={0.5} envMapIntensity={0.42} />
          </mesh>
          <mesh position={[0, -0.4, 0]}>
            <sphereGeometry args={[0.055, 20, 20]} />
            <meshStandardMaterial color={palette.skin} roughness={0.45} envMapIntensity={0.46} />
          </mesh>
        </group>
      ))}

      {/* legs */}
      {[-1, 1].map((side) => (
        <group key={side} ref={side === -1 ? legL : legR} position={[0.08 * side, 0.5, 0]}>
          <mesh position={[0, -0.22, 0]} castShadow>
            <capsuleGeometry args={[0.075, 0.32, 10, 20]} />
            <meshStandardMaterial color={palette.outfitAccent} roughness={0.45} envMapIntensity={0.42} />
          </mesh>
          <mesh position={[0, -0.44, 0.045]} scale={[1, 0.55, 1.5]}>
            <sphereGeometry args={[0.08, 18, 18]} />
            <meshStandardMaterial color={shoeColor} roughness={0.6} />
          </mesh>
        </group>
      ))}
    </group>
  );
}
