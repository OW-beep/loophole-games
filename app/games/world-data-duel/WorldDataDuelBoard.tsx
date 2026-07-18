'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  RULES,
  startMatch,
  pickCpuCardIndex,
  resolveRound,
  perfectClearBonus,
  formatStat,
  loadCoinBalance,
  saveCoinBalance,
  recordDiscovery,
  type MatchState,
  type RoundOutcome,
  type Country,
  type QuestionDef,
} from '@/lib/games/world-data-duel';

type Screen = 'title' | 'match' | 'result';

export function WorldDataDuelBoard() {
  const [coins, setCoins] = useState<number>(() => loadCoinBalance());
  const [screen, setScreen] = useState<Screen>('title');
  const [match, setMatch] = useState<MatchState | null>(null);
  const [usedPlayer, setUsedPlayer] = useState<Set<number>>(new Set());
  const [usedCpu, setUsedCpu] = useState<Set<number>>(new Set());
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [revealed, setRevealed] = useState<RoundOutcome | null>(null);
  const [newDiscovery, setNewDiscovery] = useState<string | null>(null);
  const [bonus, setBonus] = useState(0);

  function persistCoins(next: number) {
    setCoins(next);
    saveCoinBalance(next);
  }

  function handleStartMatch() {
    const effectiveCoins = coins < RULES.entryFee ? RULES.startingCoins : coins;
    const m = startMatch(effectiveCoins);
    persistCoins(m.coinBalance);
    setMatch(m);
    setUsedPlayer(new Set());
    setUsedCpu(new Set());
    setSelectedIdx(null);
    setRevealed(null);
    setBonus(0);
    setScreen('match');
  }

  function handlePlayCard() {
    if (!match || selectedIdx === null) return;
    const question = match.questionOrder[match.round];
    const cpuIdx = pickCpuCardIndex(match.cpuHand, usedCpu, question, match.cpuPersonality);
    const outcome = resolveRound(question, match.playerHand[selectedIdx], match.cpuHand[cpuIdx]);

    const newUsedPlayer = new Set(usedPlayer).add(selectedIdx);
    const newUsedCpu = new Set(usedCpu).add(cpuIdx);
    const nextCoins = coins + outcome.coinDelta;

    let discovery: string | null = null;
    if (outcome.result === 'win' && recordDiscovery(outcome.playerCountry.code)) {
      discovery = outcome.playerCountry.name;
    }

    setUsedPlayer(newUsedPlayer);
    setUsedCpu(newUsedCpu);
    persistCoins(nextCoins);
    setRevealed(outcome);
    setNewDiscovery(discovery);
    setMatch({
      ...match,
      log: [...match.log, outcome],
      coinBalance: nextCoins,
      matchCoinDelta: match.matchCoinDelta + outcome.coinDelta,
    });
  }

  function handleNextRound() {
    if (!match) return;
    if (match.round + 1 >= RULES.roundsPerMatch) {
      const b = perfectClearBonus(match.log);
      if (b > 0) {
        const nextCoins = coins + b;
        persistCoins(nextCoins);
        setBonus(b);
        setMatch({ ...match, coinBalance: nextCoins, matchCoinDelta: match.matchCoinDelta + b });
      }
      setScreen('result');
      return;
    }
    setMatch({ ...match, round: match.round + 1 });
    setSelectedIdx(null);
    setRevealed(null);
    setNewDiscovery(null);
  }

  return (
    <div>
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <Link href="/" className="stat-line text-ink/40 dark:text-white/30 hover:underline">
            ← Index
          </Link>
          <h1 className="font-display font-bold text-3xl mt-1 text-duel">World Data Duel</h1>
          <p className="stat-line text-ink/50 dark:text-white/40">Know the World. Play the World.</p>
        </div>
        <div className="text-right shrink-0">
          <p className="stat-line text-ink/40 dark:text-white/30">Coins</p>
          <p className="font-mono text-2xl font-medium tabular-nums leading-none">◎ {coins}</p>
        </div>
      </div>

      {screen === 'title' && <TitleScreen onStart={handleStartMatch} />}

      {screen === 'match' && match && (
        <MatchScreen
          match={match}
          usedPlayer={usedPlayer}
          selectedIdx={selectedIdx}
          revealed={revealed}
          newDiscovery={newDiscovery}
          onSelect={setSelectedIdx}
          onPlay={handlePlayCard}
          onNext={handleNextRound}
        />
      )}

      {screen === 'result' && match && (
        <ResultScreen
          match={match}
          bonus={bonus}
          onPlayAgain={handleStartMatch}
          onTitle={() => setScreen('title')}
        />
      )}
    </div>
  );
}

function TitleScreen({ onStart }: { onStart: () => void }) {
  return (
    <div className="specimen-card bg-panel dark:bg-panel-dark p-6 pl-8">
      <span className="punch-hole" aria-hidden />
      <p className="text-sm text-ink/70 dark:text-white/60 leading-relaxed mb-5">
        Pay the entry fee, get dealt {RULES.handSize} country cards, and answer {RULES.roundsPerMatch} real-world
        questions against the CPU. Higher stat wins the round — but each card only fights once.
      </p>

      <dl className="stat-line grid grid-cols-4 gap-3 mb-6 text-ink/60 dark:text-white/50">
        <div>
          <dt>Entry</dt>
          <dd className="font-mono text-base text-ink dark:text-white">{RULES.entryFee}</dd>
        </div>
        <div>
          <dt>Win</dt>
          <dd className="font-mono text-base text-ink dark:text-white">+{RULES.winReward}</dd>
        </div>
        <div>
          <dt>Tie</dt>
          <dd className="font-mono text-base text-ink dark:text-white">{RULES.tieReward}</dd>
        </div>
        <div>
          <dt>Loss</dt>
          <dd className="font-mono text-base text-ink dark:text-white">{RULES.loseReward}</dd>
        </div>
      </dl>

      <button
        onClick={onStart}
        className="stat-line w-full border-2 border-graphite dark:border-white/80 px-3 py-3 hover:bg-graphite hover:text-paper dark:hover:bg-white dark:hover:text-graphite transition-colors"
      >
        Start match — {RULES.leagueName} ({RULES.entryFee} Coins)
      </button>
    </div>
  );
}

function MatchScreen({
  match,
  usedPlayer,
  selectedIdx,
  revealed,
  newDiscovery,
  onSelect,
  onPlay,
  onNext,
}: {
  match: MatchState;
  usedPlayer: Set<number>;
  selectedIdx: number | null;
  revealed: RoundOutcome | null;
  newDiscovery: string | null;
  onSelect: (i: number) => void;
  onPlay: () => void;
  onNext: () => void;
}) {
  const question = match.questionOrder[match.round];

  return (
    <div className="specimen-card bg-panel dark:bg-panel-dark p-6 pl-8">
      <span className="punch-hole" aria-hidden />

      <div className="flex justify-between items-baseline stat-line text-ink/50 dark:text-white/40 mb-2">
        <span>
          Round {match.round + 1} / {RULES.roundsPerMatch}
        </span>
        <span>vs. {match.cpuPersonality} CPU</span>
      </div>

      <div className="flex gap-1 mb-5">
        {Array.from({ length: RULES.roundsPerMatch }).map((_, i) => {
          const outcome = match.log[i];
          const cls = !outcome
            ? 'bg-index dark:bg-index-dark'
            : outcome.result === 'win'
              ? 'bg-tether'
              : outcome.result === 'lose'
                ? 'bg-debt'
                : 'bg-index dark:bg-index-dark';
          return <div key={i} className={`h-1.5 flex-1 rounded-sm ${cls}`} />;
        })}
      </div>

      <div className="border-2 border-graphite dark:border-white/80 rounded-tag p-5 text-center mb-5 bg-duel-soft dark:bg-duel/10">
        <p className="stat-line text-duel mb-1">Question {match.round + 1}</p>
        <h2 className="font-display font-bold text-2xl">{question.title}</h2>
        <p className="text-xs text-ink/50 dark:text-white/40 mt-1">
          {question.rule === 'higher' ? 'Higher value wins' : 'Lower value wins'} · {question.category}
        </p>
      </div>

      {!revealed ? (
        <>
          <p className="stat-line text-ink/40 dark:text-white/30 mb-2">Your hand — pick one card</p>
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 mb-5">
            {match.playerHand.map((c, idx) => {
              const used = usedPlayer.has(idx);
              const selected = selectedIdx === idx;
              return (
                <button
                  key={c.code}
                  disabled={used}
                  onClick={() => onSelect(idx)}
                  className={[
                    'border-2 rounded-tag p-2 text-center transition-colors',
                    used
                      ? 'opacity-25 border-index dark:border-index-dark cursor-default'
                      : selected
                        ? 'border-duel bg-duel-soft dark:bg-duel/10'
                        : 'border-graphite dark:border-white/60 hover:bg-duel-soft dark:hover:bg-duel/10',
                  ].join(' ')}
                >
                  <div className="text-2xl leading-none mb-1">{c.flag}</div>
                  <div className="text-[11px] font-semibold">{c.name}</div>
                  <div className="text-[9px] text-ink/50 dark:text-white/40 mt-0.5 leading-tight">
                    {c.tags.join(' · ')}
                  </div>
                </button>
              );
            })}
          </div>
          <button
            disabled={selectedIdx === null}
            onClick={onPlay}
            className="stat-line w-full border-2 border-graphite dark:border-white/80 px-3 py-3 disabled:opacity-30 hover:bg-graphite hover:text-paper dark:hover:bg-white dark:hover:text-graphite transition-colors"
          >
            Play this card
          </button>
        </>
      ) : (
        <RevealPanel
          question={question}
          outcome={revealed}
          newDiscovery={newDiscovery}
          isLastRound={match.round + 1 >= RULES.roundsPerMatch}
          onNext={onNext}
        />
      )}
    </div>
  );
}

function RevealPanel({
  question,
  outcome,
  newDiscovery,
  isLastRound,
  onNext,
}: {
  question: QuestionDef;
  outcome: RoundOutcome;
  newDiscovery: string | null;
  isLastRound: boolean;
  onNext: () => void;
}) {
  const fact = outcome.question.facts[Math.floor(Math.random() * outcome.question.facts.length)];

  return (
    <div>
      <div className="grid grid-cols-[1fr_auto_1fr] gap-3 items-center mb-4">
        <ResultCard label="You" country={outcome.playerCountry} value={formatStat(outcome.playerValue, question)} winner={outcome.result === 'win'} />
        <span className="font-display font-bold text-ink/40 dark:text-white/30">VS</span>
        <ResultCard label="CPU" country={outcome.cpuCountry} value={formatStat(outcome.cpuValue, question)} winner={outcome.result === 'lose'} />
      </div>

      <p
        className={[
          'stat-line text-center mb-4',
          outcome.result === 'win' ? 'text-tether' : outcome.result === 'lose' ? 'text-debt' : 'text-ink/50 dark:text-white/40',
        ].join(' ')}
      >
        {outcome.result === 'win' && `Win — +${RULES.winReward} Coins`}
        {outcome.result === 'tie' && `Tie — ${RULES.tieReward} Coins`}
        {outcome.result === 'lose' && `Loss — ${RULES.loseReward} Coins`}
      </p>

      {newDiscovery && (
        <p className="stat-line text-center text-duel mb-4">New discovery unlocked — {newDiscovery}</p>
      )}

      <div className="border-l-2 border-duel bg-duel-soft dark:bg-duel/10 rounded-tag p-4 text-[13.5px] leading-relaxed mb-5">
        <p className="stat-line text-duel mb-1.5">
          Did you know? ({outcome.question.category}, data source & year on file)
        </p>
        {fact}
      </div>

      <button
        onClick={onNext}
        className="stat-line w-full border-2 border-graphite dark:border-white/80 px-3 py-3 hover:bg-graphite hover:text-paper dark:hover:bg-white dark:hover:text-graphite transition-colors"
      >
        {isLastRound ? 'See result' : 'Next round'}
      </button>
    </div>
  );
}

function ResultCard({
  label,
  country,
  value,
  winner,
}: {
  label: string;
  country: Country;
  value: string;
  winner: boolean;
}) {
  return (
    <div
      className={[
        'border-2 rounded-tag p-4 text-center',
        winner ? 'border-tether' : 'border-graphite dark:border-white/60',
      ].join(' ')}
    >
      <p className="stat-line text-ink/40 dark:text-white/30 mb-2">{label}</p>
      <div className="text-4xl">{country.flag}</div>
      <p className="text-sm font-semibold mt-1.5">{country.name}</p>
      <p className="font-mono text-xl text-duel font-semibold mt-1.5">{value}</p>
    </div>
  );
}

function ResultScreen({
  match,
  bonus,
  onPlayAgain,
  onTitle,
}: {
  match: MatchState;
  bonus: number;
  onPlayAgain: () => void;
  onTitle: () => void;
}) {
  const delta = match.matchCoinDelta;
  return (
    <div className="specimen-card bg-panel dark:bg-panel-dark p-6 pl-8">
      <span className="punch-hole" aria-hidden />
      <p className="stat-line text-ink/40 dark:text-white/30 mb-3">Match result</p>

      <div className="mb-4">
        {match.log.map((r, i) => (
          <div key={i} className="flex justify-between items-center py-2 border-b border-index dark:border-index-dark last:border-0 text-[13px]">
            <span className="text-ink/60 dark:text-white/50">
              R{i + 1} · {r.question.title}
            </span>
            <span
              className={[
                'stat-line px-2 py-0.5 rounded-tag',
                r.result === 'win' ? 'text-tether' : r.result === 'lose' ? 'text-debt' : 'text-ink/50 dark:text-white/40',
              ].join(' ')}
            >
              {r.result.toUpperCase()}
            </span>
          </div>
        ))}
      </div>

      {bonus > 0 && (
        <p className="stat-line text-center text-duel mb-2">Perfect Clear bonus — +{bonus} Coins</p>
      )}

      <div className="text-center py-4">
        <p className={`font-display font-bold text-4xl ${delta >= 0 ? 'text-tether' : 'text-debt'}`}>
          {delta >= 0 ? '+' : ''}
          {delta}
        </p>
        <p className="stat-line text-ink/40 dark:text-white/30">Coins this match</p>
      </div>

      <div className="flex gap-2.5">
        <button
          onClick={onTitle}
          className="stat-line flex-1 border-2 border-graphite dark:border-white/80 px-3 py-3 hover:bg-graphite hover:text-paper dark:hover:bg-white dark:hover:text-graphite transition-colors"
        >
          Back to title
        </button>
        <button
          onClick={onPlayAgain}
          className="stat-line flex-1 border-2 border-duel px-3 py-3 text-duel hover:bg-duel hover:text-paper transition-colors"
        >
          Play again
        </button>
      </div>
    </div>
  );
}
