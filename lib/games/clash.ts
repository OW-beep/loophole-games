// lib/games/clash.ts
//
// Clash: the site's first turn-based RPG battle. The enemy's entire attack
// sequence is revealed up front — nothing is hidden or random at decision
// time — so this plays as a planning puzzle (closer to Into the Breach's
// telegraphed-intent style than a normal RPG's hidden rolls), not a
// reflex or luck game.
//
// Solvability is guaranteed by construction, same principle as Croak,
// Bounce, and Wiggle: generation runs a simple greedy strategy against
// the candidate battle and only accepts it if that strategy wins. A
// thoughtful player can typically beat the greedy baseline (better
// Special timing, better Defend timing), so accepting exactly the greedy
// win-condition leaves genuine room for skill above the guaranteed floor.

import { createRng } from '../daily-seed';

export const TURN_BUDGET = 12;
export const HERO_MAX_HP = 20;
export const ATTACK_DMG = 3;
export const SPECIAL_DMG = 6;
export const SPECIAL_COOLDOWN = 2;
const ENEMY_HP_MIN = 22;
const ENEMY_HP_MAX = 30;
const INCOMING_MIN = 2;
const INCOMING_MAX = 7;
const MAX_GENERATION_ATTEMPTS = 200;

export type Action = 'attack' | 'defend' | 'special';

export interface ClashState {
  seed: number;
  enemyMaxHp: number;
  enemyHp: number;
  heroHp: number;
  incoming: number[]; // the full, known-in-advance enemy attack sequence
  turnIndex: number; // how many turns have been resolved
  specialCooldown: number; // 0 = available this turn
  log: { turn: number; action: Action; dealt: number; taken: number }[];
  won: boolean;
  lost: boolean;
}

function damageTaken(action: Action, incoming: number): number {
  return action === 'defend' ? Math.floor(incoming / 2) : incoming;
}

function damageDealt(action: Action): number {
  if (action === 'attack') return ATTACK_DMG;
  if (action === 'special') return SPECIAL_DMG;
  return 0;
}

/** A simple, deliberately non-optimal baseline: defend when the hit would
 * be costly, otherwise use Special whenever it's off cooldown, otherwise
 * attack. Used only to prove a winning line exists — see module comment. */
function greedyWins(enemyMaxHp: number, incoming: number[]): boolean {
  let enemyHp = enemyMaxHp;
  let heroHp = HERO_MAX_HP;
  let cooldown = 0;
  for (let t = 0; t < incoming.length && enemyHp > 0 && heroHp > 0; t++) {
    const hit = incoming[t];
    const action: Action = hit >= 5 && heroHp - hit <= 6 ? 'defend' : cooldown === 0 ? 'special' : 'attack';
    heroHp -= damageTaken(action, hit);
    if (action !== 'defend') enemyHp -= damageDealt(action);
    cooldown = action === 'special' ? SPECIAL_COOLDOWN : Math.max(0, cooldown - 1);
  }
  return enemyHp <= 0 && heroHp > 0;
}

export function createInitialState(seed: number, turnBudget: number = TURN_BUDGET): ClashState {
  const rng = createRng(seed);

  let enemyMaxHp = ENEMY_HP_MIN;
  let incoming: number[] = [];
  for (let attempt = 0; attempt < MAX_GENERATION_ATTEMPTS; attempt++) {
    enemyMaxHp = ENEMY_HP_MIN + Math.floor(rng() * (ENEMY_HP_MAX - ENEMY_HP_MIN + 1));
    incoming = Array.from(
      { length: turnBudget },
      () => INCOMING_MIN + Math.floor(rng() * (INCOMING_MAX - INCOMING_MIN + 1))
    );
    if (greedyWins(enemyMaxHp, incoming)) break;
  }

  return {
    seed,
    enemyMaxHp,
    enemyHp: enemyMaxHp,
    heroHp: HERO_MAX_HP,
    incoming,
    turnIndex: 0,
    specialCooldown: 0,
    log: [],
    won: false,
    lost: false,
  };
}

export function applyAction(state: ClashState, action: Action): ClashState {
  if (state.won || state.lost) return state;
  if (action === 'special' && state.specialCooldown > 0) return state; // on cooldown — no-op, free
  if (state.turnIndex >= state.incoming.length) return state;

  const hit = state.incoming[state.turnIndex];
  const taken = damageTaken(action, hit);
  const dealt = damageDealt(action);

  const heroHp = Math.max(0, state.heroHp - taken);
  const enemyHp = Math.max(0, state.enemyHp - dealt);
  const turnIndex = state.turnIndex + 1;
  const specialCooldown = action === 'special' ? SPECIAL_COOLDOWN : Math.max(0, state.specialCooldown - 1);
  const log = [...state.log, { turn: turnIndex, action, dealt, taken }];

  const won = enemyHp <= 0 && heroHp > 0;
  const lost = !won && (heroHp <= 0 || turnIndex >= state.incoming.length);

  return { ...state, heroHp, enemyHp, turnIndex, specialCooldown, log, won, lost };
}
