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
  getQuestionSource,
  loadCoinBalance,
  saveCoinBalance,
  recordDiscovery,
  type MatchState,
  type RoundOutcome,
  type Country,
  type QuestionDef,
} from '@/lib/games/world-data-duel';

type Screen = 'title' | 'match' | 'result';

// Self-contained dark palette from the original prototype. Deliberately not
// wired into the site's shared paper/graphite theme tokens — this game
// keeps its own look regardless of the site's light/dark toggle.
const C = {
  bg: '#0b0e14',
  bgRaised: '#12161f',
  bgCard: '#171c26',
  line: '#262c38',
  text: '#e9e7e1',
  textDim: '#8b93a3',
  amber: '#f2b84b',
  teal: '#4fd1c5',
  rose: '#e2725b',
  win: '#6fcf97',
};

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
    // No fixed seed — the country deal and question order are freshly
    // randomized (via Math.random) every single match.
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
    <div
      className="rounded-2xl p-5 sm:p-7"
      style={{ background: C.bg, color: C.text, border: `1px solid ${C.line}` }}
    >
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <Link href="/" className="text-[11px] font-mono tracking-wider hover:underline" style={{ color: C.textDim }}>
            ← Index
          </Link>
          <h1 className="font-display font-bold text-3xl mt-1" style={{ color: C.amber }}>
            World Data Duel
          </h1>
          <p className="text-xs italic mt-0.5" style={{ color: C.textDim }}>
            Know the World. Play the World.
          </p>
        </div>
        <div className="text-right shrink-0">
          <p className="text-[11px] font-mono tracking-wider" style={{ color: C.textDim }}>
            COINS
          </p>
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

function Panel({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-xl p-5 sm:p-6" style={{ background: C.bgRaised, border: `1px solid ${C.line}` }}>
      {children}
    </div>
  );
}

function PrimaryButton({
  children,
  onClick,
  disabled,
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="w-full font-semibold rounded-lg py-3 text-sm active:scale-[0.98] transition disabled:opacity-30"
      style={{ background: C.amber, color: '#1a1305' }}
    >
      {children}
    </button>
  );
}

function TitleScreen({ onStart }: { onStart: () => void }) {
  return (
    <Panel>
      <p className="text-sm leading-relaxed mb-5" style={{ color: C.textDim }}>
        Pay the entry fee, get dealt {RULES.handSize} country cards, and answer {RULES.roundsPerMatch} real-world
        questions against the CPU — a different random deal and question set every match. Higher stat wins the
        round, but each card only fights once.
      </p>

      <div className="grid grid-cols-4 gap-3 mb-6 text-center font-mono text-[11px]" style={{ color: C.textDim }}>
        <div>
          <p>ENTRY</p>
          <p className="text-base" style={{ color: C.text }}>
            {RULES.entryFee}
          </p>
        </div>
        <div>
          <p>WIN</p>
          <p className="text-base" style={{ color: C.text }}>
            +{RULES.winReward}
          </p>
        </div>
        <div>
          <p>TIE</p>
          <p className="text-base" style={{ color: C.text }}>
            {RULES.tieReward}
          </p>
        </div>
        <div>
          <p>LOSS</p>
          <p className="text-base" style={{ color: C.text }}>
            {RULES.loseReward}
          </p>
        </div>
      </div>

      <PrimaryButton onClick={onStart}>
        Start match — {RULES.leagueName} ({RULES.entryFee} Coins)
      </PrimaryButton>
    </Panel>
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
  const { year, source } = getQuestionSource(question);

  return (
    <Panel>
      <div
        className="flex justify-between items-baseline font-mono text-[11px] mb-2"
        style={{ color: C.textDim }}
      >
        <span>
          ROUND {match.round + 1} / {RULES.roundsPerMatch}
        </span>
        <span>vs. {match.cpuPersonality} CPU</span>
      </div>

      <div className="flex gap-1 mb-5">
        {Array.from({ length: RULES.roundsPerMatch }).map((_, i) => {
          const outcome = match.log[i];
          const color = !outcome ? C.line : outcome.result === 'win' ? C.win : outcome.result === 'lose' ? C.rose : C.textDim;
          return <div key={i} className="h-1.5 flex-1 rounded" style={{ background: color }} />;
        })}
      </div>

      <div
        className="rounded-xl p-5 text-center mb-5"
        style={{ background: C.bgCard, border: `1px solid ${C.line}` }}
      >
        <p className="font-mono text-[11px] tracking-widest uppercase mb-1" style={{ color: C.amber }}>
          Question {match.round + 1}
        </p>
        <h2 className="font-display font-bold text-2xl">{question.title}</h2>
        <p className="text-xs mt-1" style={{ color: C.textDim }}>
          {question.rule === 'higher' ? 'Higher value wins' : 'Lower value wins'} · {question.category}
        </p>
        <p className="text-[11px] font-mono mt-2" style={{ color: C.teal }}>
          {year} · {source}
        </p>
      </div>

      {!revealed ? (
        <>
          <p className="font-mono text-[11px] tracking-wide mb-2" style={{ color: C.textDim }}>
            YOUR HAND ({match.playerHand.length - usedPlayer.size} left) — pick one card · hover for tags
          </p>
          <div className="grid grid-cols-5 gap-1.5 mb-5">
            {match.playerHand.map((c, idx) => {
              const used = usedPlayer.has(idx);
              const selected = selectedIdx === idx;
              return (
                <button
                  key={c.code}
                  disabled={used}
                  onClick={() => onSelect(idx)}
                  title={c.tags.join(' · ')}
                  className="rounded-md p-1.5 text-center transition"
                  style={{
                    background: C.bgCard,
                    border: `1px solid ${selected ? C.amber : C.line}`,
                    opacity: used ? 0.25 : 1,
                    cursor: used ? 'default' : 'pointer',
                  }}
                >
                  <div className="text-3xl leading-none mb-1">{c.flag}</div>
                  <div className="text-[9px] font-semibold truncate">{c.name}</div>
                </button>
              );
            })}
          </div>
          <PrimaryButton onClick={onPlay} disabled={selectedIdx === null}>
            Play this card
          </PrimaryButton>
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
    </Panel>
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
  const { year, source } = getQuestionSource(question);
  const fact = outcome.question.facts[Math.floor(Math.random() * outcome.question.facts.length)];
  const resultColor = outcome.result === 'win' ? C.win : outcome.result === 'lose' ? C.rose : C.textDim;

  return (
    <div>
      <div className="grid grid-cols-[1fr_auto_1fr] gap-3 items-center mb-4">
        <ResultCard label="YOU" country={outcome.playerCountry} value={formatStat(outcome.playerValue, question)} winner={outcome.result === 'win'} />
        <span className="font-display font-bold" style={{ color: C.textDim }}>
          VS
        </span>
        <ResultCard label="CPU" country={outcome.cpuCountry} value={formatStat(outcome.cpuValue, question)} winner={outcome.result === 'lose'} />
      </div>

      <p className="text-center font-mono text-sm mb-4" style={{ color: resultColor }}>
        {outcome.result === 'win' && `WIN — +${RULES.winReward} Coins`}
        {outcome.result === 'tie' && `TIE — ${RULES.tieReward} Coins`}
        {outcome.result === 'lose' && `LOSE — ${RULES.loseReward} Coins`}
      </p>

      {newDiscovery && (
        <p className="text-center font-mono text-sm mb-4" style={{ color: C.amber }}>
          New discovery unlocked — {newDiscovery}
        </p>
      )}

      <div
        className="rounded-lg p-4 text-[13.5px] leading-relaxed mb-5"
        style={{ background: C.bgCard, border: `1px solid ${C.line}`, borderLeft: `3px solid ${C.teal}` }}
      >
        <p className="font-mono text-[11px] tracking-wide mb-1.5" style={{ color: C.teal }}>
          DID YOU KNOW? ({year} · {source})
        </p>
        {fact}
      </div>

      <PrimaryButton onClick={onNext}>{isLastRound ? 'See result' : 'Next round'}</PrimaryButton>
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
      className="rounded-xl p-4 text-center"
      style={{ background: C.bgCard, border: `1px solid ${winner ? C.win : C.line}` }}
    >
      <p className="font-mono text-[10px] tracking-wide uppercase mb-2" style={{ color: C.textDim }}>
        {label}
      </p>
      <div className="text-4xl">{country.flag}</div>
      <p className="text-sm font-semibold mt-1.5">{country.name}</p>
      <p className="font-mono text-xl font-semibold mt-1.5" style={{ color: C.amber }}>
        {value}
      </p>
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
    <Panel>
      <p className="font-mono text-[11px] tracking-wide mb-3" style={{ color: C.textDim }}>
        MATCH RESULT
      </p>

      <div className="mb-4">
        {match.log.map((r, i) => (
          <div
            key={i}
            className="flex justify-between items-center py-2 text-[13px]"
            style={{ borderBottom: i < match.log.length - 1 ? `1px solid ${C.line}` : 'none' }}
          >
            <span style={{ color: C.textDim }}>
              R{i + 1} · {r.question.title}
            </span>
            <span
              className="font-mono text-[11px] font-semibold px-2 py-0.5 rounded"
              style={{ color: r.result === 'win' ? C.win : r.result === 'lose' ? C.rose : C.textDim }}
            >
              {r.result.toUpperCase()}
            </span>
          </div>
        ))}
      </div>

      {bonus > 0 && (
        <p className="text-center font-mono text-sm mb-2" style={{ color: C.amber }}>
          Perfect Clear bonus — +{bonus} Coins
        </p>
      )}

      <div className="text-center py-4">
        <p className="font-display font-bold text-4xl" style={{ color: delta >= 0 ? C.win : C.rose }}>
          {delta >= 0 ? '+' : ''}
          {delta}
        </p>
        <p className="font-mono text-xs" style={{ color: C.textDim }}>
          Coins this match
        </p>
      </div>

      <div className="flex gap-2.5">
        <button
          onClick={onTitle}
          className="flex-1 rounded-lg py-3 text-sm font-semibold transition"
          style={{ border: `1px solid ${C.line}`, color: C.text }}
        >
          Back to title
        </button>
        <button
          onClick={onPlayAgain}
          className="flex-1 rounded-lg py-3 text-sm font-semibold transition"
          style={{ border: `1px solid ${C.amber}`, color: C.amber }}
        >
          Play again
        </button>
      </div>
    </Panel>
  );
}
