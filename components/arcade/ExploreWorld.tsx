'use client';

import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Environment, ContactShadows } from '@react-three/drei';
import * as THREE from 'three';

export const WORLD_RADIUS = 14;

function mulberry32(seed: number) {
  let a = seed;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function Tree({ position, scale = 1 }: { position: [number, number, number]; scale?: number }) {
  return (
    <group position={position} scale={scale}>
      <mesh position={[0, 0.5, 0]} castShadow>
        <cylinderGeometry args={[0.12, 0.16, 1, 24]} />
        <meshStandardMaterial color="#8A6141" roughness={0.8} envMapIntensity={0.8} />
      </mesh>
      <mesh position={[0, 1.25, 0]} castShadow>
        <sphereGeometry args={[0.62, 32, 32]} />
        <meshStandardMaterial color="#4C8C5A" roughness={0.7} envMapIntensity={0.9} />
      </mesh>
      <mesh position={[0.3, 1.45, 0.1]} scale={0.7}>
        <sphereGeometry args={[0.5, 32, 32]} />
        <meshStandardMaterial color="#5DA268" roughness={0.7} envMapIntensity={0.9} />
      </mesh>
    </group>
  );
}

function Rock({ position, scale = 1 }: { position: [number, number, number]; scale?: number }) {
  // A rock is a small cluster of jagged, flat-shaded, matte-gray chunks —
  // irregular and grounded, the visual opposite of a gem's single clean
  // glassy shape. flatShading keeps every facet reading as a hard, dull
  // stone surface rather than a smooth polished one.
  return (
    <group position={[position[0], position[1], position[2]]} scale={scale}>
      <mesh position={[0, 0.16, 0]} rotation={[0.3, 0.6, 0.1]} castShadow receiveShadow>
        <dodecahedronGeometry args={[0.28, 0]} />
        <meshStandardMaterial color="#8A8378" roughness={0.95} metalness={0} flatShading envMapIntensity={0.25} />
      </mesh>
      <mesh position={[0.16, 0.08, 0.1]} rotation={[0.8, 0.2, 0.5]} scale={0.55} castShadow receiveShadow>
        <dodecahedronGeometry args={[0.28, 0]} />
        <meshStandardMaterial color="#6E685E" roughness={0.95} metalness={0} flatShading envMapIntensity={0.25} />
      </mesh>
      <mesh position={[-0.14, 0.05, -0.08]} rotation={[0.2, 1.1, 0.3]} scale={0.4} castShadow receiveShadow>
        <dodecahedronGeometry args={[0.28, 0]} />
        <meshStandardMaterial color="#9C9488" roughness={0.95} metalness={0} flatShading envMapIntensity={0.25} />
      </mesh>
    </group>
  );
}

export function Ground() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
      <circleGeometry args={[WORLD_RADIUS, 96]} />
      <meshStandardMaterial color="#8FCB80" roughness={0.9} envMapIntensity={0.6} />
    </mesh>
  );
}

/** Adds soft environment reflections (so the glossier character/prop
 * materials actually have something to reflect) plus a soft contact
 * shadow blob under the play area for extra grounding and polish. */
export function WorldAtmosphere() {
  return (
    <>
      <Environment preset="park" environmentIntensity={0.4} />
      <ContactShadows position={[0, 0.01, 0]} opacity={0.35} scale={WORLD_RADIUS * 2.2} blur={2.4} far={4} />
    </>
  );
}

export function WorldDecor({ seed }: { seed: number }) {
  const items = useMemo(() => {
    const rng = mulberry32(seed);
    const trees: { position: [number, number, number]; scale: number }[] = [];
    const rocks: { position: [number, number, number]; scale: number }[] = [];
    for (let i = 0; i < 26; i++) {
      const angle = rng() * Math.PI * 2;
      const dist = 2.5 + rng() * (WORLD_RADIUS - 3.5);
      trees.push({ position: [Math.cos(angle) * dist, 0, Math.sin(angle) * dist], scale: 0.7 + rng() * 0.7 });
    }
    for (let i = 0; i < 16; i++) {
      const angle = rng() * Math.PI * 2;
      const dist = 1.5 + rng() * (WORLD_RADIUS - 2);
      rocks.push({ position: [Math.cos(angle) * dist, 0, Math.sin(angle) * dist], scale: 0.5 + rng() * 0.8 });
    }
    return { trees, rocks };
  }, [seed]);

  return (
    <>
      {items.trees.map((t, i) => (
        <Tree key={`t${i}`} position={t.position} scale={t.scale} />
      ))}
      {items.rocks.map((r, i) => (
        <Rock key={`r${i}`} position={r.position} scale={r.scale} />
      ))}
    </>
  );
}

export interface Collectible {
  id: number;
  position: [number, number, number];
  color: string;
  scale: number;
}

export function generateCollectibles(seed: number, count: number): Collectible[] {
  const rng = mulberry32(seed + 9999);
  const colors = ['#FFD400', '#00E5FF', '#FF6FA8', '#7CE07C', '#C58CFF', '#FF9640'];
  const items: Collectible[] = [];
  for (let i = 0; i < count; i++) {
    const angle = rng() * Math.PI * 2;
    const dist = 1.5 + rng() * (WORLD_RADIUS - 2.5);
    items.push({
      id: i,
      position: [Math.cos(angle) * dist, 0.35, Math.sin(angle) * dist],
      color: colors[i % colors.length],
      scale: 0.8 + rng() * 0.5,
    });
  }
  return items;
}

export function Gem({ item, onCollect }: { item: Collectible; onCollect: (id: number) => void }) {
  const ref = useRef<THREE.Group>(null);
  useFrame((stateThree) => {
    if (!ref.current) return;
    ref.current.rotation.y = stateThree.clock.elapsedTime * 1.6;
    ref.current.position.y = item.position[1] + Math.sin(stateThree.clock.elapsedTime * 2.4 + item.id) * 0.08;
  });
  return (
    <group ref={ref} position={item.position} scale={item.scale} onClick={() => onCollect(item.id)}>
      {/* faceted glassy crystal — transmission + a high index of refraction
          is what actually sells "gem" versus a rock's flat matte stone */}
      <mesh castShadow>
        <icosahedronGeometry args={[0.19, 0]} />
        <meshPhysicalMaterial
          color={item.color}
          transmission={0.88}
          thickness={0.6}
          roughness={0.04}
          ior={2.3}
          clearcoat={1}
          clearcoatRoughness={0.08}
          emissive={item.color}
          emissiveIntensity={0.12}
          attenuationColor={item.color}
          attenuationDistance={0.4}
        />
      </mesh>
      {/* tiny bright core so the gem still reads clearly even in shade */}
      <mesh scale={0.35}>
        <icosahedronGeometry args={[0.19, 0]} />
        <meshStandardMaterial color={item.color} emissive={item.color} emissiveIntensity={1.4} toneMapped={false} />
      </mesh>
      <pointLight color={item.color} intensity={0.5} distance={1.6} />
    </group>
  );
}

export function SparkleBurst({ position, color }: { position: [number, number, number]; color: string }) {
  const ref = useRef<THREE.Group>(null);
  const start = useRef<number | null>(null);
  const particles = useMemo(
    () =>
      Array.from({ length: 8 }, (_, i) => {
        const a = (i / 8) * Math.PI * 2;
        return { dx: Math.cos(a) * 0.6, dz: Math.sin(a) * 0.6 };
      }),
    []
  );
  useFrame((stateThree) => {
    if (start.current === null) start.current = stateThree.clock.elapsedTime;
    const elapsed = stateThree.clock.elapsedTime - start.current;
    if (ref.current) {
      ref.current.children.forEach((child, i) => {
        const p = particles[i];
        child.position.set(p.dx * elapsed * 2, 0.3 + elapsed * 1.2, p.dz * elapsed * 2);
        const mat = (child as THREE.Mesh).material as THREE.MeshStandardMaterial;
        if (mat) mat.opacity = Math.max(0, 1 - elapsed * 1.5);
      });
    }
  });
  return (
    <group ref={ref} position={position}>
      {particles.map((_, i) => (
        <mesh key={i}>
          <sphereGeometry args={[0.05, 8, 8]} />
          <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.8} transparent opacity={1} />
        </mesh>
      ))}
    </group>
  );
}
