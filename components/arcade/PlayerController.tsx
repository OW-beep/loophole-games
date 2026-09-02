'use client';

import { useEffect, useRef, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { AnimalCharacter, type AnimalSpecies } from './AnimalCharacter';
import { HumanCharacter, type HumanVariant } from './HumanCharacter';
import { WORLD_RADIUS } from './ExploreWorld';

export type PlayableCharacter =
  | { kind: 'animal'; species: AnimalSpecies }
  | { kind: 'human'; variant: HumanVariant };

const MOVE_SPEED = 3.6;

/** Shared input state fed by keyboard listeners and the on-screen joystick. */
export function useMoveInput() {
  const input = useRef({ x: 0, y: 0 });
  const keys = useRef<Record<string, boolean>>({});

  useEffect(() => {
    function down(e: KeyboardEvent) {
      keys.current[e.key.toLowerCase()] = true;
    }
    function up(e: KeyboardEvent) {
      keys.current[e.key.toLowerCase()] = false;
    }
    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up);
    return () => {
      window.removeEventListener('keydown', down);
      window.removeEventListener('keyup', up);
    };
  }, []);

  function readKeyboard() {
    const k = keys.current;
    let x = 0;
    let y = 0;
    if (k['arrowup'] || k['w']) y -= 1;
    if (k['arrowdown'] || k['s']) y += 1;
    if (k['arrowleft'] || k['a']) x -= 1;
    if (k['arrowright'] || k['d']) x += 1;
    return { x, y };
  }

  function setJoystick(x: number, y: number) {
    input.current = { x, y };
  }

  return { readKeyboard, setJoystick, joystickRef: input };
}

export function PlayerRig({
  character,
  onMove,
  joystickRef,
}: {
  character: PlayableCharacter;
  onMove: (pos: THREE.Vector3) => void;
  joystickRef: React.MutableRefObject<{ x: number; y: number }>;
}) {
  const group = useRef<THREE.Group>(null);
  const speedRef = useRef(0);
  const { camera } = useThree();
  const cameraTarget = useRef(new THREE.Vector3());
  const { readKeyboard } = useMoveInput();

  useFrame((_, delta) => {
    if (!group.current) return;
    const kb = readKeyboard();
    const js = joystickRef.current;
    let x = kb.x !== 0 ? kb.x : js.x;
    let y = kb.y !== 0 ? kb.y : js.y;
    const mag = Math.hypot(x, y);
    if (mag > 1) {
      x /= mag;
      y /= mag;
    }
    speedRef.current = mag;

    if (mag > 0.05) {
      const targetAngle = Math.atan2(x, y);
      const current = group.current.rotation.y;
      let diff = targetAngle - current;
      diff = Math.atan2(Math.sin(diff), Math.cos(diff));
      group.current.rotation.y = current + diff * Math.min(1, delta * 10);

      const nextPos = group.current.position.clone();
      nextPos.x += x * MOVE_SPEED * delta;
      nextPos.z += y * MOVE_SPEED * delta;
      const dist = Math.hypot(nextPos.x, nextPos.z);
      if (dist < WORLD_RADIUS - 0.5) {
        group.current.position.copy(nextPos);
        onMove(nextPos);
      }
    }

    // Fixed-angle follow camera: it only translates to track the
    // character's position and never rotates around them. This keeps
    // "up" always meaning "away from camera" regardless of which way the
    // character is currently facing — far more predictable on keyboard
    // than a camera that swings around behind your facing direction.
    const behind = new THREE.Vector3(
      group.current.position.x,
      group.current.position.y + 3.6,
      group.current.position.z + 4.6
    );
    camera.position.lerp(behind, Math.min(1, delta * 4));
    cameraTarget.current.lerp(new THREE.Vector3(group.current.position.x, 0.6, group.current.position.z), Math.min(1, delta * 6));
    camera.lookAt(cameraTarget.current);
  });

  return (
    <group ref={group}>
      {character.kind === 'animal' ? (
        <AnimalCharacterWithSpeed species={character.species} speedRef={speedRef} />
      ) : (
        <HumanCharacterWithSpeed variant={character.variant} speedRef={speedRef} />
      )}
    </group>
  );
}

// Small wrappers so the character components (which take a plain `speed`
// number prop) still re-render smoothly each frame without lifting the
// speed value into React state (which would re-render at 60fps).
function AnimalCharacterWithSpeed({ species, speedRef }: { species: AnimalSpecies; speedRef: React.MutableRefObject<number> }) {
  const [, force] = useState(0);
  useFrame(() => force((v) => (v + 1) % 1000000));
  return <AnimalCharacter species={species} speed={speedRef.current} />;
}
function HumanCharacterWithSpeed({ variant, speedRef }: { variant: HumanVariant; speedRef: React.MutableRefObject<number> }) {
  const [, force] = useState(0);
  useFrame(() => force((v) => (v + 1) % 1000000));
  return <HumanCharacter variant={variant} speed={speedRef.current} />;
}

/** On-screen virtual joystick for touch devices. Renders as a fixed overlay, not inside the Canvas. */
export function VirtualJoystick({ onChange }: { onChange: (x: number, y: number) => void }) {
  const baseRef = useRef<HTMLDivElement>(null);
  const [stick, setStick] = useState({ x: 0, y: 0 });
  const activeTouch = useRef<number | null>(null);

  function handleStart(e: React.TouchEvent) {
    const t = e.changedTouches[0];
    activeTouch.current = t.identifier;
  }
  function handleMove(e: React.TouchEvent) {
    if (activeTouch.current === null || !baseRef.current) return;
    const t = Array.from(e.changedTouches).find((tt) => tt.identifier === activeTouch.current);
    if (!t) return;
    const rect = baseRef.current.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    let dx = (t.clientX - cx) / (rect.width / 2);
    let dy = (t.clientY - cy) / (rect.height / 2);
    const mag = Math.hypot(dx, dy);
    if (mag > 1) {
      dx /= mag;
      dy /= mag;
    }
    setStick({ x: dx, y: dy });
    onChange(dx, dy);
  }
  function handleEnd() {
    activeTouch.current = null;
    setStick({ x: 0, y: 0 });
    onChange(0, 0);
  }

  return (
    <div
      ref={baseRef}
      onTouchStart={handleStart}
      onTouchMove={handleMove}
      onTouchEnd={handleEnd}
      onTouchCancel={handleEnd}
      className="absolute bottom-6 left-6 w-28 h-28 rounded-full bg-white/10 border-2 border-white/30 touch-none select-none sm:hidden"
      style={{ backdropFilter: 'blur(2px)' }}
    >
      <div
        className="absolute w-12 h-12 rounded-full bg-white/70"
        style={{
          left: `calc(50% + ${stick.x * 32}px - 24px)`,
          top: `calc(50% + ${stick.y * 32}px - 24px)`,
          transition: activeTouch.current === null ? 'left 0.15s, top 0.15s' : 'none',
        }}
      />
    </div>
  );
}
