'use client';

import { useEffect, useRef, useState } from 'react';
import {
  createInitialState,
  moveNode,
  previewCrossings,
  currentMoveLimit,
  CANVAS,
  NODE_RADIUS,
  type SkeinState,
  type SkeinDifficulty,
} from '@/lib/games/skein';
import { recordResult, getStreak } from '@/lib/storage';
import { GameHeader } from '@/components/GameHeader';
import { ResultModal } from '@/components/ResultModal';
import { CoinLeaderboard } from '@/components/CoinLeaderboard';
import { CoinModeSection } from '@/components/CoinModeSection';
import { GAMES } from '@/lib/games/registry';
import { loadCoinBalance, saveCoinBalance, rollCoinSeed, computeCoinDelta, GLOBAL_LEADERBOARD_SLUG } from '@/lib/coin-mode';
import { type Difficulty } from '@/lib/difficulty';
import { getNickname, saveNickname, submitScore } from '@/lib/leaderboard-client';

const GAME_SLUG = 'skein';

function GraphView({
  state,
  onCommitMove,
  disabled,
}: {
  state: SkeinState;
  onCommitMove: (nodeId: number, x: number, y: number) => void;
  disabled: boolean;
}) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [draggingId, setDraggingId] = useState<number | null>(null);
  const [dragPos, setDragPos] = useState<{ x: number; y: number } | null>(null);
  const limit = currentMoveLimit(state);

  function toCanvasPoint(clientX: number, clientY: number) {
    const svg = svgRef.current;
    if (!svg) return { x: 0, y: 0 };
    const rect = svg.getBoundingClientRect();
    const scaleX = CANVAS / rect.width;
    const scaleY = CANVAS / rect.height;
    return { x: (clientX - rect.left) * scaleX, y: (clientY - rect.top) * scaleY };
  }

  function handlePointerDown(e: React.PointerEvent, nodeId: number) {
    if (disabled || state.won || state.lost) return;
    (e.target as Element).setPointerCapture(e.pointerId);
    setDraggingId(nodeId);
    setDragPos(toCanvasPoint(e.clientX, e.clientY));
  }
  function handlePointerMove(e: React.PointerEvent) {
    if (draggingId === null) return;
    setDragPos(toCanvasPoint(e.clientX, e.clientY));
  }
  function handlePointerUp() {
    if (draggingId !== null && dragPos) {
      onCommitMove(draggingId, dragPos.x, dragPos.y);
    }
    setDraggingId(null);
    setDragPos(null);
  }

  const preview =
    draggingId !== null && dragPos
      ? previewCrossings(state, draggingId, dragPos.x, dragPos.y)
      : { idx: state.crossingEdgeIdx, count: state.crossingCount };

  function renderPos(nodeId: number) {
    if (draggingId === nodeId && dragPos) return dragPos;
    const n = state.nodes.find((x) => x.id === nodeId)!;
    return { x: n.x, y: n.y };
  }

  return (
    <div>
      <div className="stat-line flex flex-wrap justify-between gap-x-4 gap-y-1 text-ink/50 dark:text-white/40 mb-3">
        <span>
          Moves left: <span className="font-mono text-ink dark:text-white">{Math.max(limit - state.movesUsed, 0)}</span>
        </span>
        <span>
          Crossings:{' '}
          <span className={`font-mono ${preview.count === 0 ? 'text-skein' : 'text-ink dark:text-white'}`}>
            {preview.count}
          </span>
        </span>
      </div>

      <div className="rounded-lg border-2 border-graphite dark:border-white/70 mb-4 mx-auto bg-panel dark:bg-panel-dark overflow-hidden" style={{ maxWidth: 480 }}>
        <svg
          ref={svgRef}
          viewBox={`0 0 ${CANVAS} ${CANVAS}`}
          className="w-full h-auto touch-none select-none"
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
        >
          {state.edges.map(([a, b], i) => {
            const pa = renderPos(a);
            const pb = renderPos(b);
            const crossing = preview.idx.has(i);
            return (
              <line
                key={i}
                x1={pa.x}
                y1={pa.y}
                x2={pb.x}
                y2={pb.y}
                stroke={crossing ? '#E14B4B' : 'currentColor'}
                strokeWidth={crossing ? 3 : 2}
                className={crossing ? '' : 'text-ink/25 dark:text-white/25'}
              />
            );
          })}
          {state.nodes.map((n) => {
            const p = renderPos(n.id);
            return (
              <circle
                key={n.id}
                cx={p.x}
                cy={p.y}
                r={NODE_RADIUS}
                fill={draggingId === n.id ? '#7A9E99' : '#3F7A72'}
                stroke="white"
                strokeWidth={2}
                style={{ cursor: disabled ? 'default' : 'grab' }}
                onPointerDown={(e) => handlePointerDown(e, n.id)}
              />
            );
          })}
        </svg>
      </div>
      <p className="stat-line text-center text-ink/40 dark:text-white/30">
        Drag any knot to a new spot. Red lines are currently crossing something.
      </p>
    </div>
  );
}

export function SkeinBoard({ seed, dateString, puzzleNumber }: { seed: number; dateString: string; puzzleNumber: number }) {
  const game = GAMES.find((g) => g.slug === GAME_SLUG)!;

  const [state, setState] = useState<SkeinState>(() => createInitialState(seed, 'normal'));
  const [showResult, setShowResult] = useState(false);
  const finishedRef = useRef(false);
  const [streak, setStreak] = useState(0);

  const dailyFinished = state.won || state.lost;
  const dailyLimit = currentMoveLimit(state);

  function commitMove(nodeId: number, x: number, y: number) {
    if (dailyFinished) return;
    setState((prev) => moveNode(prev, nodeId, x, y));
  }

  useEffect(() => {
    if ((state.won || state.lost) && !finishedRef.current) {
      finishedRef.current = true;
      recordResult(GAME_SLUG, {
        date: dateString,
        won: state.won,
        moves: state.movesUsed,
        score: Math.max(0, state.moveLimit - state.movesUsed),
        elapsedMs: 0,
      });
      setStreak(getStreak(GAME_SLUG).current);
      setShowResult(true);
    }
  }, [state.won, state.lost, state.movesUsed, state.moveLimit, dateString]);

  // --- Coin Mode ---
  const [coins, setCoins] = useState<number>(() => loadCoinBalance());
  const [coinState, setCoinState] = useState<SkeinState | null>(null);
  const [nickname, setNicknameState] = useState<string>(() => getNickname());
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const coinRoundSettledRef = useRef(false);
  const [lastCoinDelta, setLastCoinDelta] = useState(0);
  const [difficulty, setDifficulty] = useState<Difficulty>('normal');

  function startCoinRound() {
    coinRoundSettledRef.current = false;
    setCoinState(createInitialState(rollCoinSeed(), difficulty as SkeinDifficulty));
  }

  function coinCommitMove(nodeId: number, x: number, y: number) {
    if (!coinState || coinState.won || coinState.lost) return;
    setCoinState((prev) => (prev ? moveNode(prev, nodeId, x, y) : prev));
  }

  useEffect(() => {
    if (!coinState || coinRoundSettledRef.current) return;
    if (!coinState.won && !coinState.lost) return;
    coinRoundSettledRef.current = true;

    const delta = computeCoinDelta({
      won: coinState.won,
      movesUsed: coinState.movesUsed,
      movesLimit: currentMoveLimit(coinState),
      difficulty,
    });
    setLastCoinDelta(delta);
    setCoins((prev) => {
      const next = Math.max(0, prev + delta);
      saveCoinBalance(next);
      if (nickname) submitScore(GLOBAL_LEADERBOARD_SLUG, nickname, next);
      return next;
    });
  }, [coinState, nickname, difficulty]);

  function handleSaveNickname(name: string) {
    saveNickname(name);
    setNicknameState(name);
  }

  return (
    <div>
      <GameHeader game={game} puzzleNumber={puzzleNumber} movesUsed={state.movesUsed} movesLimit={dailyLimit} />

      <p className="stat-line text-center text-ink/50 dark:text-white/40 mb-3">
        Drag the knots around until no two threads cross.
      </p>

      <GraphView state={state} onCommitMove={commitMove} disabled={dailyFinished} />

      <ResultModal
        open={showResult}
        onClose={() => setShowResult(false)}
        gameSlug={GAME_SLUG}
        gameName="Skein"
        puzzleNumber={puzzleNumber}
        won={state.won}
        moves={state.movesUsed}
        movesLimit={dailyLimit}
        score={Math.max(0, state.moveLimit - state.movesUsed)}
        streak={streak}
      />

      <CoinModeSection
        coins={coins}
        nickname={nickname}
        onSaveNickname={handleSaveNickname}
        roundActive={!!coinState}
        roundFinished={!!coinState && (coinState.won || coinState.lost)}
        roundWon={!!coinState?.won}
        lastDelta={lastCoinDelta}
        onStart={startCoinRound}
        onShowLeaderboard={() => setShowLeaderboard(true)}
        onDifficultyChange={setDifficulty}
      >
        {coinState && <GraphView state={coinState} onCommitMove={coinCommitMove} disabled={coinState.won || coinState.lost} />}
      </CoinModeSection>

      {showLeaderboard && <CoinLeaderboard onClose={() => setShowLeaderboard(false)} />}
    </div>
  );
}
