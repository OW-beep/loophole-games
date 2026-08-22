import { createRng, seededShuffle } from '../daily-seed';

/**
 * SKEIN — untangle the graph.
 *
 * Every day's graph is generated already solved: points are placed on the
 * canvas and edges are added one at a time, rejecting any candidate edge
 * that would cross an edge already accepted. That rejection-sampling step
 * is the whole solvability guarantee — the accepted edge set never
 * crosses itself by construction, no matter how the points get shuffled
 * around afterward.
 *
 * To scramble it into a puzzle, the *positions* are shuffled among the
 * nodes (node identity keeps its edges, but sits at a different point on
 * the canvas). Dragging every node back to its own original point is
 * therefore always a valid, zero-crossing solution — the move budget is
 * sized directly from how many nodes are actually out of place.
 */

export const CANVAS = 600;
const NODE_RADIUS = 20;
const MARGIN = 64;
const MIN_NODE_DISTANCE = 78;

export type SkeinDifficulty = 'easy' | 'normal' | 'hard';

export interface SkeinNode {
  id: number;
  x: number;
  y: number;
  solvedX: number;
  solvedY: number;
}

export interface SkeinState {
  nodes: SkeinNode[];
  edges: [number, number][];
  crossingEdgeIdx: Set<number>;
  crossingCount: number;
  movesUsed: number;
  moveLimit: number;
  won: boolean;
  lost: boolean;
}

interface Difficulty {
  nodeCount: number;
  targetEdges: number;
}

export function difficultyParams(difficulty: SkeinDifficulty): Difficulty {
  switch (difficulty) {
    case 'easy':
      return { nodeCount: 6, targetEdges: 6 };
    case 'hard':
      return { nodeCount: 11, targetEdges: 14 };
    case 'normal':
    default:
      return { nodeCount: 8, targetEdges: 10 };
  }
}

export function currentMoveLimit(state: SkeinState): number {
  return state.moveLimit;
}

function orientation(ax: number, ay: number, bx: number, by: number, cx: number, cy: number): number {
  const val = (by - ay) * (cx - bx) - (bx - ax) * (cy - by);
  if (Math.abs(val) < 1e-9) return 0;
  return val > 0 ? 1 : 2;
}

function onSegment(ax: number, ay: number, bx: number, by: number, cx: number, cy: number): boolean {
  return (
    Math.min(ax, bx) - 1e-6 <= cx &&
    cx <= Math.max(ax, bx) + 1e-6 &&
    Math.min(ay, by) - 1e-6 <= cy &&
    cy <= Math.max(ay, by) + 1e-6
  );
}

/** Proper segment intersection (two segments that share an endpoint are
 * NOT considered crossing — that's normal graph adjacency, not a tangle). */
function segmentsCross(
  ax: number, ay: number, bx: number, by: number,
  cx: number, cy: number, dx: number, dy: number
): boolean {
  const o1 = orientation(ax, ay, bx, by, cx, cy);
  const o2 = orientation(ax, ay, bx, by, dx, dy);
  const o3 = orientation(cx, cy, dx, dy, ax, ay);
  const o4 = orientation(cx, cy, dx, dy, bx, by);

  if (o1 !== o2 && o3 !== o4) return true;

  if (o1 === 0 && onSegment(ax, ay, bx, by, cx, cy)) return true;
  if (o2 === 0 && onSegment(ax, ay, bx, by, dx, dy)) return true;
  if (o3 === 0 && onSegment(cx, cy, dx, dy, ax, ay)) return true;
  if (o4 === 0 && onSegment(cx, cy, dx, dy, bx, by)) return true;

  return false;
}

function dist(ax: number, ay: number, bx: number, by: number): number {
  return Math.hypot(ax - bx, ay - by);
}

function generatePoints(rng: () => number, count: number): { x: number; y: number }[] {
  const points: { x: number; y: number }[] = [];
  let attempts = 0;
  while (points.length < count && attempts < 4000) {
    attempts++;
    const x = MARGIN + rng() * (CANVAS - 2 * MARGIN);
    const y = MARGIN + rng() * (CANVAS - 2 * MARGIN);
    if (points.every((p) => dist(p.x, p.y, x, y) >= MIN_NODE_DISTANCE)) {
      points.push({ x, y });
    }
  }
  // Fallback: if rejection sampling couldn't fit enough points (very
  // unlucky seed), just relax the spacing for whatever's left.
  while (points.length < count) {
    points.push({
      x: MARGIN + rng() * (CANVAS - 2 * MARGIN),
      y: MARGIN + rng() * (CANVAS - 2 * MARGIN),
    });
  }
  return points;
}

function buildEdges(points: { x: number; y: number }[], targetEdges: number): [number, number][] {
  const n = points.length;
  const candidates: [number, number, number][] = []; // [i, j, distance]
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      candidates.push([i, j, dist(points[i].x, points[i].y, points[j].x, points[j].y)]);
    }
  }
  candidates.sort((a, b) => a[2] - b[2]);

  const edges: [number, number][] = [];
  for (const [i, j] of candidates) {
    if (edges.length >= targetEdges) break;
    let crosses = false;
    for (const [a, b] of edges) {
      if (a === i || a === j || b === i || b === j) continue; // shared endpoint, fine
      if (
        segmentsCross(
          points[i].x, points[i].y, points[j].x, points[j].y,
          points[a].x, points[a].y, points[b].x, points[b].y
        )
      ) {
        crosses = true;
        break;
      }
    }
    if (!crosses) edges.push([i, j]);
  }
  return edges;
}

function computeCrossings(nodes: SkeinNode[], edges: [number, number][]): { idx: Set<number>; count: number } {
  const idx = new Set<number>();
  let count = 0;
  for (let e1 = 0; e1 < edges.length; e1++) {
    const [a1, b1] = edges[e1];
    for (let e2 = e1 + 1; e2 < edges.length; e2++) {
      const [a2, b2] = edges[e2];
      if (a1 === a2 || a1 === b2 || b1 === a2 || b1 === b2) continue;
      const n1a = nodes[a1], n1b = nodes[b1], n2a = nodes[a2], n2b = nodes[b2];
      if (segmentsCross(n1a.x, n1a.y, n1b.x, n1b.y, n2a.x, n2a.y, n2b.x, n2b.y)) {
        count++;
        idx.add(e1);
        idx.add(e2);
      }
    }
  }
  return { idx, count };
}

export function createInitialState(seed: number, difficulty: SkeinDifficulty = 'normal'): SkeinState {
  const rng = createRng(seed);
  const { nodeCount, targetEdges } = difficultyParams(difficulty);

  let nodes: SkeinNode[] = [];
  let edges: [number, number][] = [];
  let crossingCount = 0;
  let crossingEdgeIdx = new Set<number>();
  let displaced = 0;

  // Regenerate/reshuffle until we get a puzzle that's actually tangled
  // (a shuffle can land on the identity permutation, or a low-crossing
  // one, by chance) and where enough nodes are actually out of place to
  // make a real puzzle.
  for (let attempt = 0; attempt < 40; attempt++) {
    const points = generatePoints(rng, nodeCount);
    edges = buildEdges(points, targetEdges);
    const perm = seededShuffle(
      Array.from({ length: nodeCount }, (_, i) => i),
      rng
    );
    nodes = points.map((p, i) => ({
      id: i,
      x: points[perm[i]].x,
      y: points[perm[i]].y,
      solvedX: p.x,
      solvedY: p.y,
    }));
    displaced = nodes.filter((nd) => nd.x !== nd.solvedX || nd.y !== nd.solvedY).length;
    const result = computeCrossings(nodes, edges);
    crossingCount = result.count;
    crossingEdgeIdx = result.idx;
    if (crossingCount >= 2 && displaced >= Math.max(3, Math.floor(nodeCount * 0.5))) break;
  }

  const moveLimit = displaced + 3;

  return {
    nodes,
    edges,
    crossingEdgeIdx,
    crossingCount,
    movesUsed: 0,
    moveLimit,
    won: crossingCount === 0,
    lost: false,
  };
}

export function moveNode(state: SkeinState, nodeId: number, x: number, y: number): SkeinState {
  if (state.won || state.lost) return state;
  const clampedX = Math.min(CANVAS - MARGIN * 0.3, Math.max(MARGIN * 0.3, x));
  const clampedY = Math.min(CANVAS - MARGIN * 0.3, Math.max(MARGIN * 0.3, y));

  const nodes = state.nodes.map((n) => (n.id === nodeId ? { ...n, x: clampedX, y: clampedY } : n));
  const movesUsed = state.movesUsed + 1;
  const { idx, count } = computeCrossings(nodes, state.edges);
  const won = count === 0;
  const lost = !won && movesUsed >= state.moveLimit;

  return {
    ...state,
    nodes,
    crossingEdgeIdx: idx,
    crossingCount: count,
    movesUsed,
    won,
    lost,
  };
}

/** Live (uncommitted) crossing preview while a node is mid-drag, so the
 * player gets real-time feedback before releasing \u2014 without spending a
 * move or touching the committed state. */
export function previewCrossings(
  state: SkeinState,
  draggingId: number | null,
  liveX: number,
  liveY: number
): { idx: Set<number>; count: number } {
  if (draggingId === null) return { idx: state.crossingEdgeIdx, count: state.crossingCount };
  const nodes = state.nodes.map((n) => (n.id === draggingId ? { ...n, x: liveX, y: liveY } : n));
  return computeCrossings(nodes, state.edges);
}

export { NODE_RADIUS };
