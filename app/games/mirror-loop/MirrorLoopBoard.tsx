'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import {
  createInitialState,
  rotateMirror,
  traceBeams,
  getLanes,
  cellKey,
  GRID_SIZE,
  type MirrorLoopState,
} from '@/lib/games/mirror-loop';
import { recordResult, getStreak } from '@/lib/storage';
import { GameHeader } from '@/components/GameHeader';
import { ResultModal } from '@/components/ResultModal';
import { CoinLeaderboard } from '@/components/CoinLeaderboard';
import { CoinModeSection } from '@/components/CoinModeSection';
import { GAMES } from '@/lib/games/registry';
import { loadCoinBalance, saveCoinBalance, rollCoinSeed, computeCoinDelta, GLOBAL_LEADERBOARD_SLUG } from '@/lib/coin-mode';
import { scaleLimit, type Difficulty } from '@/lib/difficulty';
import { getNickname, saveNickname, submitScore } from '@/lib/leaderboard-client';

const GAME_SLUG = 'mirror-loop';
const CELL = 48;
const SIZE = CELL * GRID_SIZE;

function center(r: number, c: number) {
  return { x: c * CELL + CELL / 2, y: r * CELL + CELL / 2 };
}

const DIR_ANGLE: Record<string, number> = { up: -90, down: 90, left: 180, right: 0 };

function BoardView({
  state,
  onRotate,
  disabled,
}: {
  state: MirrorLoopState;
  onRotate: (r: number, c: number) => void;
  disabled: boolean;
}) {
  const lanes = useMemo(() => getLanes(), []);
  const beams = useMemo(() => traceBeams(state), [state]);
  const budget = state.wrongAtStart;

  return (
    <div>
      <p className="stat-line text-ink/50 dark:text-white/40 mb-2">
        Rotations left: <span className="font-mono text-ink dark:text-white">{budget - state.movesUsed}</span> · tap a
        mirror to rotate it · beam stops at first mirror
      </p>

      <div className="border-2 border-graphite dark:border-white/80 bg-panel dark:bg-panel-dark mb-4 overflow-hidden">
        <svg viewBox={`0 0 ${SIZE} ${SIZE}`} className="w-full h-auto block touch-none">
          {Array.from({ length: GRID_SIZE + 1 }, (_, i) => (
            <g key={i}>
              <line x1={i * CELL} y1={0} x2={i * CELL} y2={SIZE} stroke="currentColor" className="text-index dark:text-index-dark" strokeWidth={1} />
              <line x1={0} y1={i * CELL} x2={SIZE} y2={i * CELL} stroke="currentColor" className="text-index dark:text-index-dark" strokeWidth={1} />
            </g>
          ))}

          {beams.map((beam) =>
            beam.visibleSegments.map((seg, si) => {
              const f = center(seg.from.r, seg.from.c);
              const t = center(seg.to.r, seg.to.c);
              return (
                <line key={`${beam.laneId}-${si}`} x1={f.x} y1={f.y} x2={t.x} y2={t.y} stroke={beam.color} strokeWidth={4} strokeLinecap="round" opacity={0.7} />
              );
            })
          )}

          {lanes.map((lane) => {
            const { x, y } = center(lane.emitter.r, lane.emitter.c);
            const color = state.laneColors[lane.id];
            return (
              <g key={`em-${lane.id}`} transform={`translate(${x},${y}) rotate(${DIR_ANGLE[lane.dir]})`}>
                <circle r={14} fill={color} />
                <path d="M -4,-7 L 8,0 L -4,7 Z" fill="white" />
              </g>
            );
          })}

          {lanes.map((lane) => {
            const { x, y } = center(lane.target.r, lane.target.c);
            const color = state.laneColors[lane.id];
            const ok = beams.find((b) => b.laneId === lane.id)?.success;
            return <circle key={`tgt-${lane.id}`} cx={x} cy={y} r={13} fill={ok ? color : 'none'} stroke={color} strokeWidth={3} opacity={ok ? 0.9 : 0.5} />;
          })}

          {lanes.map((lane) =>
            lane.mirrors.map((m, mi) => {
              const { x, y } = center(m.pos.r, m.pos.c);
              const key = cellKey(m.pos.r, m.pos.c);
              const orientation = state.orientations[key];
              const d =
                orientation === '/'
                  ? `M ${x - 16},${y + 16} L ${x + 16},${y - 16}`
                  : `M ${x - 16},${y - 16} L ${x + 16},${y + 16}`;
              return (
                <g key={`m-${lane.id}-${mi}`}>
                  <rect
                    x={x - 24}
                    y={y - 24}
                    width={48}
                    height={48}
                    fill="transparent"
                    className={disabled ? '' : 'cursor-pointer'}
                    onClick={() => !disabled && onRotate(m.pos.r, m.pos.c)}
                  />
                  <path d={d} stroke="currentColor" className="text-graphite dark:text-white" strokeWidth={4} strokeLinecap="round" />
                </g>
              );
            })
          )}
        </svg>
      </div>

      <div className="flex gap-3">
        {lanes.map((lane) => {
          const ok = beams.find((b) => b.laneId === lane.id)?.success;
          return (
            <div key={lane.id} className="stat-line flex items-center gap-1.5 px-2 py-1 border border-index dark:border-index-dark">
              <span className="inline-block w-2 h-2 rounded-full" style={{ background: state.laneColors[lane.id] }} />
              <span className={ok ? 'text-mirror dark:text-mirror' : 'text-ink/50 dark:text-white/40'}>{ok ? 'Connected' : 'Open'}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function MirrorLoopBoard({ seed, dateString, puzzleNumber }: { seed: number; dateString: string; puzzleNumber: number }) {
  const game = GAMES.find((g) => g.slug === GAME_SLUG)!;

  // --- Daily puzzle (unchanged behavior) ---
  const [state, setState] = useState<MirrorLoopState>(() => createInitialState(seed));
  const [showResult, setShowResult] = useState(false);
  const finishedRef = useRef(false);
  const [streak, setStreak] = useState(0);
  const beams = useMemo(() => traceBeams(state), [state]);
  const budget = state.wrongAtStart;

  function handleClick(r: number, c: number) {
    if (state.won || state.lost) return;
    setState((prev) => rotateMirror(prev, r, c));
  }

  useEffect(() => {
    if ((state.won || state.lost) && !finishedRef.current) {
      finishedRef.current = true;
      recordResult(GAME_SLUG, {
        date: dateString,
        won: state.won,
        moves: state.movesUsed,
        score: beams.filter((b) => b.success).length,
        elapsedMs: 0,
      });
      setStreak(getStreak(GAME_SLUG).current);
      setShowResult(true);
    }
  }, [state.won, state.lost, state.movesUsed, beams, dateString]);

  const dailyFinished = state.won || state.lost;

  // --- Coin Mode ---
  const [coins, setCoins] = useState<number>(() => loadCoinBalance());
  const [coinState, setCoinState] = useState<MirrorLoopState | null>(null);
  const [nickname, setNicknameState] = useState<string>(() => getNickname());
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const coinRoundSettledRef = useRef(false);
  const [lastCoinDelta, setLastCoinDelta] = useState(0);

  const [difficulty, setDifficulty] = useState<Difficulty>('normal');

  function startCoinRound() {
    coinRoundSettledRef.current = false;
    const fresh = createInitialState(rollCoinSeed());
    setCoinState({ ...fresh, wrongAtStart: scaleLimit(fresh.wrongAtStart, difficulty) });
  }

  useEffect(() => {
    if (!coinState || coinRoundSettledRef.current) return;
    if (!coinState.won && !coinState.lost) return;
    coinRoundSettledRef.current = true;

    const delta = computeCoinDelta({ won: coinState.won, movesUsed: coinState.movesUsed, movesLimit: coinState.wrongAtStart, difficulty });
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
      <GameHeader game={game} puzzleNumber={puzzleNumber} movesUsed={state.movesUsed} movesLimit={budget} />

      <BoardView state={state} onRotate={handleClick} disabled={dailyFinished} />

      <ResultModal
        open={showResult}
        onClose={() => setShowResult(false)}
        gameSlug={GAME_SLUG}
        gameName="Mirror Loop"
        puzzleNumber={puzzleNumber}
        won={state.won}
        moves={state.movesUsed}
        movesLimit={budget}
        score={beams.filter((b) => b.success).length}
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
        {coinState && (
          <BoardView
            state={coinState}
            onRotate={(r, c) => setCoinState((s) => (s ? rotateMirror(s, r, c) : s))}
            disabled={coinState.won || coinState.lost}
          />
        )}
      </CoinModeSection>

      {showLeaderboard && <CoinLeaderboard onClose={() => setShowLeaderboard(false)} />}
    </div>
  );
}
