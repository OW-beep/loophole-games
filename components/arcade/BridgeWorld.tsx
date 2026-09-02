'use client';

import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export const LANE_COUNT = 3;
export const LANE_X = [-0.62, 0, 0.62];
export const ROW_SPACING = 0.85;
export const TOTAL_ROWS = 36;

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

export interface BridgeRow {
  index: number;
  z: number;
  lanes: boolean[];
}

/** Generates the bridge's plank layout. The first few rows and the final
 * (goal) row are always fully safe; every other row has a chance of one or
 * two missing planks, but at least one lane is always left standing so the
 * crossing is never actually impossible. */
export function generateBridge(seed: number, totalRows: number = TOTAL_ROWS): BridgeRow[] {
  const rng = mulberry32(seed);
  const rows: BridgeRow[] = [];
  for (let i = 0; i < totalRows; i++) {
    const lanes = [true, true, true];
    const isSafeZone = i < 3 || i >= totalRows - 1;
    if (!isSafeZone) {
      const gapChance = Math.min(0.18 + i * 0.012, 0.55);
      if (rng() < gapChance) {
        const gapLane = Math.floor(rng() * LANE_COUNT);
        lanes[gapLane] = false;
        if (i > 14 && rng() < 0.3) {
          const remaining = [0, 1, 2].filter((l) => l !== gapLane);
          const secondGap = remaining[Math.floor(rng() * remaining.length)];
          lanes[secondGap] = false;
        }
      }
    }
    rows.push({ index: i, z: -(i * ROW_SPACING), lanes });
  }
  return rows;
}

function Plank({ x, z }: { x: number; z: number }) {
  return (
    <mesh position={[x, 0, z]} castShadow receiveShadow>
      <boxGeometry args={[0.54, 0.09, 0.72]} />
      <meshStandardMaterial color="#7A5A3A" roughness={0.85} envMapIntensity={0.25} />
    </mesh>
  );
}

function LanternPost({ z, side }: { z: number; side: -1 | 1 }) {
  const glowRef = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    if (glowRef.current) {
      const mat = glowRef.current.material as THREE.MeshStandardMaterial;
      mat.emissiveIntensity = 1.1 + Math.sin(state.clock.elapsedTime * 2 + z) * 0.2;
    }
  });
  const x = side * 1.15;
  return (
    <group position={[x, 0, z]}>
      <mesh position={[0, 0.55, 0]} castShadow>
        <cylinderGeometry args={[0.035, 0.045, 1.1, 12]} />
        <meshStandardMaterial color="#3C2A1E" roughness={0.8} />
      </mesh>
      <mesh ref={glowRef} position={[0, 1.05, 0]} castShadow>
        <sphereGeometry args={[0.16, 20, 20]} />
        <meshStandardMaterial color="#F4A94A" emissive="#F4A94A" emissiveIntensity={1.2} roughness={0.5} toneMapped={false} />
      </mesh>
      <pointLight position={[0, 1.05, 0]} color="#F4A94A" intensity={0.7} distance={2.4} />
    </group>
  );
}

function ToriiGate({ z }: { z: number }) {
  return (
    <group position={[0, 0, z]}>
      {[-1, 1].map((side) => (
        <mesh key={side} position={[side * 0.95, 0.9, 0]} castShadow>
          <cylinderGeometry args={[0.09, 0.1, 1.8, 16]} />
          <meshStandardMaterial color="#B23B2E" roughness={0.6} envMapIntensity={0.3} />
        </mesh>
      ))}
      <mesh position={[0, 1.85, 0]} castShadow>
        <boxGeometry args={[2.5, 0.14, 0.22]} />
        <meshStandardMaterial color="#B23B2E" roughness={0.6} envMapIntensity={0.3} />
      </mesh>
      <mesh position={[0, 1.62, 0]} castShadow>
        <boxGeometry args={[2.1, 0.1, 0.16]} />
        <meshStandardMaterial color="#2A2420" roughness={0.6} />
      </mesh>
    </group>
  );
}

/** Large soft glowing sphere standing in for the moon, plus a dark
 * star-flecked backdrop colour set on the fog/background instead of a
 * literal skybox — keeps this cheap to render. */
export function NightSky() {
  return (
    <>
      <mesh position={[-6, 9, -14]}>
        <sphereGeometry args={[1.4, 32, 32]} />
        <meshStandardMaterial color="#F5F3E7" emissive="#F5F3E7" emissiveIntensity={0.7} roughness={0.6} toneMapped={false} />
      </mesh>
      <hemisphereLight color="#8FA3D9" groundColor="#2A2440" intensity={0.5} />
    </>
  );
}

export function MistyWater() {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    if (ref.current) {
      ref.current.position.y = -2.4 + Math.sin(state.clock.elapsedTime * 0.4) * 0.05;
    }
  });
  return (
    <mesh ref={ref} rotation={[-Math.PI / 2, 0, 0]} position={[0, -2.4, -TOTAL_ROWS * ROW_SPACING * 0.5]}>
      <planeGeometry args={[40, TOTAL_ROWS * ROW_SPACING + 20, 1, 1]} />
      <meshStandardMaterial color="#3A4A5E" roughness={0.3} envMapIntensity={0.4} transparent opacity={0.9} />
    </mesh>
  );
}

export function BridgeWorld({ rows }: { rows: BridgeRow[] }) {
  const lanternRows = useMemo(() => rows.filter((r) => r.index % 4 === 0), [rows]);
  return (
    <>
      <NightSky />
      <MistyWater />
      {rows.map((row) =>
        row.lanes.map(
          (present, lane) => present && <Plank key={`${row.index}-${lane}`} x={LANE_X[lane]} z={row.z} />
        )
      )}
      {lanternRows.map((row) => (
        <group key={row.index}>
          <LanternPost z={row.z} side={-1} />
          <LanternPost z={row.z} side={1} />
        </group>
      ))}
      <ToriiGate z={rows[rows.length - 1].z + ROW_SPACING * 0.6} />
    </>
  );
}
