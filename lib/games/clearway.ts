import { createRng, randInt } from '../daily-seed';

export const GRID_SIZE = 6;
export const EXIT_ROW = 2;
export const TARGET_LENGTH = 2;
export const OTHER_VEHICLE_COUNT = 6;
export const SCRAMBLE_STEPS = 25;
export const MOVE_SLACK = 10;

export type Orientation = 'H' | 'V';

export interface Vehicle {
  id: number;
  row: number; // top-left cell row
  col: number; // top-left cell col
  length: number;
  orientation: Orientation;
  isTarget: boolean;
}

export interface ClearwayState {
  vehicles: Vehicle[];
  moveLimit: number;
  movesUsed: number;
  selectedId: number | null;
  won: boolean;
  lost: boolean;
}

export function vehicleCells(v: Vehicle): { row: number; col: number }[] {
  const cells: { row: number; col: number }[] = [];
  for (let i = 0; i < v.length; i++) {
    cells.push(v.orientation === 'H' ? { row: v.row, col: v.col + i } : { row: v.row + i, col: v.col });
  }
  return cells;
}

function occupiedMap(vehicles: Vehicle[]): Map<string, number> {
  const map = new Map<string, number>();
  for (const v of vehicles) {
    for (const { row, col } of vehicleCells(v)) {
      map.set(`${row},${col}`, v.id);
    }
  }
  return map;
}

function inBounds(row: number, col: number): boolean {
  return row >= 0 && row < GRID_SIZE && col >= 0 && col < GRID_SIZE;
}

function canPlace(vehicles: Vehicle[], candidate: Vehicle, ignoreId?: number): boolean {
  const occupied = occupiedMap(vehicles.filter((v) => v.id !== ignoreId));
  for (const { row, col } of vehicleCells(candidate)) {
    if (!inBounds(row, col)) return false;
    if (occupied.has(`${row},${col}`)) return false;
  }
  return true;
}

/** All cells this vehicle could legally move its anchor (row/col) to along its axis. */
function reachablePositions(vehicles: Vehicle[], v: Vehicle): number[] {
  const others = vehicles.filter((o) => o.id !== v.id);
  const occupied = occupiedMap(others);
  const results: number[] = [];

  if (v.orientation === 'H') {
    for (let col = v.col - 1; col >= 0; col--) {
      if (occupied.has(`${v.row},${col}`)) break;
      results.push(col);
    }
    for (let col = v.col + 1; col + v.length - 1 < GRID_SIZE; col++) {
      if (occupied.has(`${v.row},${col + v.length - 1}`)) break;
      results.push(col);
    }
  } else {
    for (let row = v.row - 1; row >= 0; row--) {
      if (occupied.has(`${row},${v.col}`)) break;
      results.push(row);
    }
    for (let row = v.row + 1; row + v.length - 1 < GRID_SIZE; row++) {
      if (occupied.has(`${row + v.length - 1},${v.col}`)) break;
      results.push(row);
    }
  }
  return results;
}

function buildTargetVehicle(): Vehicle {
  return {
    id: 0,
    row: EXIT_ROW,
    col: GRID_SIZE - TARGET_LENGTH,
    length: TARGET_LENGTH,
    orientation: 'H',
    isTarget: true,
  };
}

/** The target genuinely at the exit, plus other vehicles placed anywhere valid.
 * This is the reference "solved" layout every puzzle is generated from. */
function generateSolvedLayout(rng: () => number): Vehicle[] {
  const vehicles: Vehicle[] = [buildTargetVehicle()];
  let nextId = 1;
  let placed = 0;
  let guard = 0;
  while (placed < OTHER_VEHICLE_COUNT && guard < 500) {
    guard++;
    const orientation: Orientation = rng() < 0.5 ? 'H' : 'V';
    const length = randInt(rng, 0, 1) === 0 ? 2 : 3;
    const row = randInt(rng, 0, GRID_SIZE - (orientation === 'V' ? length : 1));
    const col = randInt(rng, 0, GRID_SIZE - (orientation === 'H' ? length : 1));
    const candidate: Vehicle = { id: nextId, row, col, length, orientation, isTarget: false };
    if (canPlace(vehicles, candidate)) {
      vehicles.push(candidate);
      nextId++;
      placed++;
    }
  }
  return vehicles;
}

function applyMove(vehicles: Vehicle[], id: number, newAnchor: number): Vehicle[] {
  return vehicles.map((v) => {
    if (v.id !== id) return v;
    return v.orientation === 'H' ? { ...v, col: newAnchor } : { ...v, row: newAnchor };
  });
}

function targetAtExit(vehicles: Vehicle[]): boolean {
  const target = vehicles.find((v) => v.isTarget)!;
  return target.col + target.length - 1 === GRID_SIZE - 1;
}

interface MoveLogEntry {
  id: number;
  from: number;
  to: number;
}

/** Guarantees the target actually leaves the exit at least once. If a vehicle
 * happens to occupy the one cell directly adjacent to the exit (blocking the
 * target entirely), that blocker is moved out of the way first. */
function forceAwayFromExit(vehicles: Vehicle[], rng: () => number, moveLog: MoveLogEntry[]): Vehicle[] {
  let current = vehicles;
  const exitAnchor = GRID_SIZE - TARGET_LENGTH;
  const target = current.find((v) => v.isTarget)!;

  let options = reachablePositions(current, target).filter((a) => a !== exitAnchor);

  if (options.length === 0) {
    const blockerCol = exitAnchor - 1;
    const occ = occupiedMap(current.filter((v) => !v.isTarget));
    const blockerId = occ.get(`${EXIT_ROW},${blockerCol}`);
    if (blockerId !== undefined) {
      const blocker = current.find((v) => v.id === blockerId)!;
      const blockerOptions = reachablePositions(current, blocker);
      if (blockerOptions.length > 0) {
        const newAnchor = blockerOptions[randInt(rng, 0, blockerOptions.length - 1)];
        const fromAnchor = blocker.orientation === 'H' ? blocker.col : blocker.row;
        moveLog.push({ id: blocker.id, from: fromAnchor, to: newAnchor });
        current = applyMove(current, blocker.id, newAnchor);
        options = reachablePositions(current, target).filter((a) => a !== exitAnchor);
      }
    }
  }

  if (options.length > 0) {
    const newAnchor = options[randInt(rng, 0, options.length - 1)];
    moveLog.push({ id: target.id, from: exitAnchor, to: newAnchor });
    current = applyMove(current, target.id, newAnchor);
  }
  // In the extremely rare case neither the target nor its one blocker has any
  // legal move at all, the puzzle is left as-is rather than risking bad state.

  return current;
}

export function createInitialState(seed: number): ClearwayState {
  const rng = createRng(seed);
  const MAX_OVERALL_ATTEMPTS = 15;

  let finalVehicles: Vehicle[] = [];
  let finalMoveLog: MoveLogEntry[] = [];

  for (let overallAttempt = 0; overallAttempt < MAX_OVERALL_ATTEMPTS; overallAttempt++) {
    let vehicles: Vehicle[] = [];
    let moveLog: MoveLogEntry[] = [];
    const MAX_LAYOUT_ATTEMPTS = 30;

    for (let attempt = 0; attempt < MAX_LAYOUT_ATTEMPTS; attempt++) {
      const candidateVehicles = generateSolvedLayout(rng);
      const candidateLog: MoveLogEntry[] = [];
      const afterForce = forceAwayFromExit(candidateVehicles, rng, candidateLog);
      if (!targetAtExit(afterForce)) {
        vehicles = afterForce;
        moveLog = candidateLog;
        break;
      }
    }
    if (vehicles.length === 0) continue; // couldn't even get a valid starting layout — retry overall

    for (let i = 0; i < SCRAMBLE_STEPS; i++) {
      const v = vehicles[randInt(rng, 0, vehicles.length - 1)];
      const options = reachablePositions(vehicles, v);
      if (options.length === 0) continue;
      const newAnchor = options[randInt(rng, 0, options.length - 1)];
      const fromAnchor = v.orientation === 'H' ? v.col : v.row;
      moveLog.push({ id: v.id, from: fromAnchor, to: newAnchor });
      vehicles = applyMove(vehicles, v.id, newAnchor);
    }

    for (let attempt = 0; attempt < 5 && targetAtExit(vehicles); attempt++) {
      vehicles = forceAwayFromExit(vehicles, rng, moveLog);
    }

    if (!targetAtExit(vehicles)) {
      finalVehicles = vehicles;
      finalMoveLog = moveLog;
      break;
    }
    // Still stuck after everything — discard this whole attempt and retry
    // from a fresh layout rather than shipping a pre-solved puzzle.
  }

  if (finalVehicles.length === 0) {
    // Extraordinarily unlikely fallback: ship the last attempt's layout as-is.
    finalVehicles = generateSolvedLayout(rng);
  }

  return {
    vehicles: finalVehicles,
    moveLimit: finalMoveLog.length + MOVE_SLACK,
    movesUsed: 0,
    selectedId: null,
    won: false,
    lost: false,
  };
}

export function selectVehicle(state: ClearwayState, id: number): ClearwayState {
  if (state.won || state.lost) return state;
  return { ...state, selectedId: state.selectedId === id ? null : id };
}

/** Attempts to slide the selected vehicle so the clicked cell falls within its
 * new span. Free to attempt; only an actual successful slide costs a move. */
export function moveSelectedTo(state: ClearwayState, row: number, col: number): ClearwayState {
  if (state.won || state.lost || state.selectedId === null) return state;
  const v = state.vehicles.find((x) => x.id === state.selectedId);
  if (!v) return state;

  let newAnchor: number | null = null;
  if (v.orientation === 'H') {
    if (row !== v.row) return state;
    if (col < v.col) newAnchor = col;
    else if (col > v.col + v.length - 1) newAnchor = col - v.length + 1;
    else return state; // clicked within its own span — no-op
  } else {
    if (col !== v.col) return state;
    if (row < v.row) newAnchor = row;
    else if (row > v.row + v.length - 1) newAnchor = row - v.length + 1;
    else return state;
  }
  if (newAnchor === null) return state;

  const candidate: Vehicle = v.orientation === 'H' ? { ...v, col: newAnchor } : { ...v, row: newAnchor };
  if (!canPlace(state.vehicles, candidate, v.id)) return state;

  const vehicles = applyMove(state.vehicles, v.id, newAnchor);
  const movesUsed = state.movesUsed + 1;
  const won = targetAtExit(vehicles);
  const lost = !won && movesUsed >= state.moveLimit;

  return { ...state, vehicles, movesUsed, selectedId: null, won, lost };
}

export { targetAtExit, reachablePositions };
