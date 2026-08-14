'use client';

import { useEffect, useRef, useState } from 'react';
import {
  createInitialState,
  stepTo,
  canStepTo,
  cellKey,
  gridNeighbors,
  GRID_ROWS,
  GRID_COLS,
  type BurrowState,
  type Cell,
} from '@/lib/games/burrow';
import { recordResult, getStreak } from '@/lib/storage';
import { GameHeader } from '@/components/GameHeader';
import { ResultModal } from '@/components/ResultModal';
import { CoinLeaderboard } from '@/components/CoinLeaderboard';
import { CoinModeSection } from '@/components/CoinModeSection';
import { GAMES } from '@/lib/games/registry';
import { loadCoinBalance, saveCoinBalance, rollCoinSeed, computeCoinDelta, GLOBAL_LEADERBOARD_SLUG } from '@/lib/coin-mode';
import { scaleLimit, type Difficulty } from '@/lib/difficulty';
import { getNickname, saveNickname, submitScore } from '@/lib/leaderboard-client';

const GAME_SLUG = 'burrow';
const CHARACTER = '\u{1F994}'; // 🦔 a small burrowing critter

/** Whether a passage exists between two specific cells in the maze — used
 * purely for rendering walls, independent of the player's current position. */
function stepPossible(state: BurrowState, a: Cell, b: Cell): boolean {
  return state.edges.has(edgeKeyFor(a, b));
}

function edgeKeyFor(a: Cell, b: Cell): string {
  const ka = `${a.row},${a.col}`;
  const kb = `${b.row},${b.col}`;
  return ka < kb ? `${ka}|${kb}` : `${kb}|${ka}`;
}

function MazeView({ state, onStep, disabled }: { state: BurrowState; onStep: (c: Cell) => void; disabled: boolean }) {
  return (
    <div>
      <p className="stat-line text-center text-ink/50 dark:text-white/40 mb-4">
        {state.hasKey ? 'Key collected — head for the door' : 'Find the key, then the door'}
      </p>

      <div
        className="grid mx-auto mb-3 border-2 border-graphite dark:border-white/80"
        style={{ gridTemplateColumns: `repeat(${GRID_COLS}, 1fr)`, maxWidth: 320 }}
      >
        {Array.from({ length: GRID_ROWS }).flatMap((_, row) =>
          Array.from({ length: GRID_COLS }).map((_, col) => {
            const cell: Cell = { row, col };
            const hasRightNeighbor = col < GRID_COLS - 1;
            const hasBottomNeighbor = row < GRID_ROWS - 1;
            const rightWall = !hasRightNeighbor || !stepPossible(state, cell, { row, col: col + 1 });
            const bottomWall = !hasBottomNeighbor || !stepPossible(state, cell, { row: row + 1, col });

            const isPlayer = state.position.row === row && state.position.col === col;
            const isKey = !state.hasKey && state.key.row === row && state.key.col === col;
            const isExit = state.exit.row === row && state.exit.col === col;
            const isTrap = state.traps.has(cellKey(cell));
            const isAdjacent = gridNeighbors(state.position).some((n) => n.row === row && n.col === col);
            const canMoveHere = isAdjacent && canStepTo(state, cell);

            return (
              <button
                key={`${row}-${col}`}
                onClick={() => canMoveHere && onStep(cell)}
                disabled={disabled || !canMoveHere}
                className="aspect-square flex items-center justify-center text-lg relative"
                style={{
                  borderRight: rightWall ? '2px solid #1B1D22' : 'none',
                  borderBottom: bottomWall ? '2px solid #1B1D22' : 'none',
                  background: canMoveHere ? '#F7ECD8' : 'transparent',
                }}
              >
                {isPlayer ? CHARACTER : isExit ? '\u{1F6AA}' : isKey ? '\u{1F5DD}\u{FE0F}' : isTrap ? '\u26A0\uFE0F' : ''}
              </button>
            );
          })
        )}
      </div>

      <p className="stat-line text-center text-ink/40 dark:text-white/30">
        Tap an adjacent open cell to move. Avoid the marked hazards — the correct route never crosses one.
      </p>
    </div>
  );
}

export function BurrowBoard({ seed, dateString, puzzleNumber }: { seed: number; dateString: string; puzzleNumber: number }) {
  const game = GAMES.find((g) => g.slug === GAME_SLUG)!;

  // --- Daily puzzle (unchanged behavior) ---
  const [state, setState] = useState<BurrowState>(() => createInitialState(seed));
  const [showResult, setShowResult] = useState(false);
  const finishedRef = useRef(false);
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    if ((state.won || state.lost) && !finishedRef.current) {
      finishedRef.current = true;
      recordResult(GAME_SLUG, {
        date: dateString,
        won: state.won,
        moves: state.movesUsed,
        score: state.moveLimit,
        elapsedMs: 0,
      });
      setStreak(getStreak(GAME_SLUG).current);
      setShowResult(true);
    }
  }, [state.won, state.lost, state.movesUsed, state.moveLimit, dateString]);

  const dailyFinished = state.won || state.lost;

  // --- Coin Mode ---
  const [coins, setCoins] = useState<number>(() => loadCoinBalance());
  const [coinState, setCoinState] = useState<BurrowState | null>(null);
  const [nickname, setNicknameState] = useState<string>(() => getNickname());
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const coinRoundSettledRef = useRef(false);
  const [lastCoinDelta, setLastCoinDelta] = useState(0);

  const [difficulty, setDifficulty] = useState<Difficulty>('normal');

  function startCoinRound() {
    coinRoundSettledRef.current = false;
    const fresh = createInitialState(rollCoinSeed());
    setCoinState({ ...fresh, moveLimit: scaleLimit(fresh.moveLimit, difficulty) });
  }

  useEffect(() => {
    if (!coinState || coinRoundSettledRef.current) return;
    if (!coinState.won && !coinState.lost) return;
    coinRoundSettledRef.current = true;

    const delta = computeCoinDelta({
      won: coinState.won,
      movesUsed: coinState.movesUsed,
      movesLimit: coinState.moveLimit, difficulty,
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
      <GameHeader game={game} puzzleNumber={puzzleNumber} movesUsed={state.movesUsed} movesLimit={state.moveLimit} />

      <MazeView state={state} onStep={(c) => setState((s) => stepTo(s, c))} disabled={dailyFinished} />

      <ResultModal
        open={showResult}
        onClose={() => setShowResult(false)}
        gameSlug={GAME_SLUG}
        gameName={game.name}
        puzzleNumber={puzzleNumber}
        won={state.won}
        moves={state.movesUsed}
        movesLimit={state.moveLimit}
        score={state.moveLimit}
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
          <MazeView
            state={coinState}
            onStep={(c) => setCoinState((s) => (s ? stepTo(s, c) : s))}
            disabled={coinState.won || coinState.lost}
          />
        )}
      </CoinModeSection>

      {showLeaderboard && <CoinLeaderboard onClose={() => setShowLeaderboard(false)} />}
    </div>
  );
}
