'use client';

import { useEffect, useRef, useState } from 'react';
import {
  createInitialState,
  selectVehicle,
  moveSelectedTo,
  vehicleCells,
  GRID_SIZE,
  EXIT_ROW,
  type ClearwayState,
} from '@/lib/games/clearway';
import { recordResult, getStreak } from '@/lib/storage';
import { GameHeader } from '@/components/GameHeader';
import { ResultModal } from '@/components/ResultModal';
import { CoinLeaderboard } from '@/components/CoinLeaderboard';
import { CoinModeSection } from '@/components/CoinModeSection';
import { GAMES } from '@/lib/games/registry';
import { loadCoinBalance, saveCoinBalance, rollCoinSeed, computeCoinDelta, GLOBAL_LEADERBOARD_SLUG } from '@/lib/coin-mode';
import { getNickname, saveNickname, submitScore } from '@/lib/leaderboard-client';

const GAME_SLUG = 'clearway';

function GridView({ state, onCellTap, disabled }: { state: ClearwayState; onCellTap: (row: number, col: number) => void; disabled: boolean }) {
  const cellOwner = new Map<string, number>();
  for (const v of state.vehicles) {
    for (const { row, col } of vehicleCells(v)) cellOwner.set(`${row},${col}`, v.id);
  }

  return (
    <div>
      <p className="stat-line text-center text-ink/50 dark:text-white/40 mb-4">
        Get the marked vehicle to the right edge of its row
      </p>

      <div
        className="grid gap-1 mx-auto mb-4 relative"
        style={{ gridTemplateColumns: `repeat(${GRID_SIZE}, minmax(0, 1fr))`, maxWidth: 340 }}
      >
        {Array.from({ length: GRID_SIZE }).flatMap((_, row) =>
          Array.from({ length: GRID_SIZE }).map((_, col) => {
            const ownerId = cellOwner.get(`${row},${col}`);
            const vehicle = ownerId !== undefined ? state.vehicles.find((v) => v.id === ownerId) : undefined;
            const isSelected = vehicle && state.selectedId === vehicle.id;
            const isExitCell = row === EXIT_ROW && col === GRID_SIZE - 1;

            return (
              <button
                key={`${row}-${col}`}
                onClick={() => onCellTap(row, col)}
                disabled={disabled}
                className="aspect-square rounded-sm relative"
                style={{
                  background: vehicle
                    ? vehicle.isTarget
                      ? '#C6432E'
                      : isSelected
                        ? '#2D7DA855'
                        : '#8A97A6'
                    : '#EEF0F2',
                  border: isSelected ? '2px solid #2D7DA8' : '1px solid #d8dce0',
                  outline: isExitCell ? '2px dashed #4CAF7D' : 'none',
                  outlineOffset: '-2px',
                }}
              />
            );
          })
        )}
      </div>

      <p className="stat-line text-center text-ink/40 dark:text-white/30">
        Tap the red vehicle, then tap an empty cell in its row to slide it. Tap other vehicles to move
        them out of the way — they can only slide along their own orientation.
      </p>
    </div>
  );
}

export function ClearwayBoard({ seed, dateString, puzzleNumber }: { seed: number; dateString: string; puzzleNumber: number }) {
  const game = GAMES.find((g) => g.slug === GAME_SLUG)!;

  // --- Daily puzzle (unchanged behavior) ---
  const [state, setState] = useState<ClearwayState>(() => createInitialState(seed));
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

  function handleCellTap(row: number, col: number) {
    const cellOwner = new Map<string, number>();
    for (const v of state.vehicles) for (const c of vehicleCells(v)) cellOwner.set(`${c.row},${c.col}`, v.id);
    const owner = cellOwner.get(`${row},${col}`);
    if (state.selectedId !== null && owner === undefined) setState((s) => moveSelectedTo(s, row, col));
    else if (owner !== undefined) setState((s) => selectVehicle(s, owner));
  }

  // --- Coin Mode ---
  const [coins, setCoins] = useState<number>(() => loadCoinBalance());
  const [coinState, setCoinState] = useState<ClearwayState | null>(null);
  const [nickname, setNicknameState] = useState<string>(() => getNickname());
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const coinRoundSettledRef = useRef(false);
  const [lastCoinDelta, setLastCoinDelta] = useState(0);

  function startCoinRound() {
    coinRoundSettledRef.current = false;
    setCoinState(createInitialState(rollCoinSeed()));
  }

  function handleCoinCellTap(row: number, col: number) {
    setCoinState((prev) => {
      if (!prev) return prev;
      const cellOwner = new Map<string, number>();
      for (const v of prev.vehicles) for (const c of vehicleCells(v)) cellOwner.set(`${c.row},${c.col}`, v.id);
      const owner = cellOwner.get(`${row},${col}`);
      if (prev.selectedId !== null && owner === undefined) return moveSelectedTo(prev, row, col);
      if (owner !== undefined) return selectVehicle(prev, owner);
      return prev;
    });
  }

  useEffect(() => {
    if (!coinState || coinRoundSettledRef.current) return;
    if (!coinState.won && !coinState.lost) return;
    coinRoundSettledRef.current = true;

    const delta = computeCoinDelta({ won: coinState.won, movesUsed: coinState.movesUsed, movesLimit: coinState.moveLimit });
    setLastCoinDelta(delta);
    setCoins((prev) => {
      const next = Math.max(0, prev + delta);
      saveCoinBalance(next);
      if (nickname) submitScore(GLOBAL_LEADERBOARD_SLUG, nickname, next);
      return next;
    });
  }, [coinState, nickname]);

  function handleSaveNickname(name: string) {
    saveNickname(name);
    setNicknameState(name);
  }

  return (
    <div>
      <GameHeader game={game} puzzleNumber={puzzleNumber} movesUsed={state.movesUsed} movesLimit={state.moveLimit} />

      <GridView state={state} onCellTap={handleCellTap} disabled={dailyFinished} />

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
      >
        {coinState && <GridView state={coinState} onCellTap={handleCoinCellTap} disabled={coinState.won || coinState.lost} />}
      </CoinModeSection>

      {showLeaderboard && <CoinLeaderboard onClose={() => setShowLeaderboard(false)} />}
    </div>
  );
}
