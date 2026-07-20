// lib/games/world-data-duel.ts
//
// Pure game logic for World Data Duel. No React here — see
// app/games/world-data-duel/WorldDataDuelBoard.tsx for the UI.
//
// Data lives separately under /data/world-data-duel/ (countries.json,
// questions.json, datasets/*.json) so the roster and question set can grow
// without touching this file, per the GDD's data/engine separation.

import countriesRaw from '@/data/world-data-duel/countries.json';
import questionsRaw from '@/data/world-data-duel/questions.json';
import populationDs from '@/data/world-data-duel/datasets/population.json';
import gdpDs from '@/data/world-data-duel/datasets/gdp.json';
import coffeeDs from '@/data/world-data-duel/datasets/coffee.json';
import forestDs from '@/data/world-data-duel/datasets/forest.json';
import lifeExpectancyDs from '@/data/world-data-duel/datasets/life-expectancy.json';
import olympicMedalsDs from '@/data/world-data-duel/datasets/olympic-medals.json';
import coconutDs from '@/data/world-data-duel/datasets/coconut.json';
import teaDs from '@/data/world-data-duel/datasets/tea.json';
import oilDs from '@/data/world-data-duel/datasets/oil.json';
import volcanoesDs from '@/data/world-data-duel/datasets/volcanoes.json';
import riceDs from '@/data/world-data-duel/datasets/rice.json';
import cocoaDs from '@/data/world-data-duel/datasets/cocoa.json';
import fishDs from '@/data/world-data-duel/datasets/fish.json';
import sheepDs from '@/data/world-data-duel/datasets/sheep.json';
import goldDs from '@/data/world-data-duel/datasets/gold.json';
import naturalGasDs from '@/data/world-data-duel/datasets/natural-gas.json';
import renewableEnergyDs from '@/data/world-data-duel/datasets/renewable-energy.json';
import co2PerCapitaDs from '@/data/world-data-duel/datasets/co2-per-capita.json';
import internetUsersDs from '@/data/world-data-duel/datasets/internet-users.json';
import touristArrivalsDs from '@/data/world-data-duel/datasets/tourist-arrivals.json';

export interface Country {
  code: string;
  name: string;
  flag: string;
  tags: string[];
}

export type QuestionRule = 'higher' | 'lower';

export interface Dataset {
  datasetId: string;
  title: string;
  year: string;
  source: string;
  unit: string;
  higherIsBetter: boolean;
  values: Record<string, number>;
}

export interface QuestionDef {
  id: string;
  title: string;
  category: string;
  dataset: string;
  rule: QuestionRule;
  facts: string[];
}

const DATASETS: Record<string, Dataset> = {
  population_2022: populationDs as Dataset,
  gdp_2024: gdpDs as Dataset,
  coffee_2023: coffeeDs as Dataset,
  forest_2020: forestDs as Dataset,
  life_expectancy_2026: lifeExpectancyDs as Dataset,
  olympic_medals_2024: olympicMedalsDs as Dataset,
  coconut_2022: coconutDs as Dataset,
  tea_2022: teaDs as Dataset,
  oil_2024: oilDs as Dataset,
  volcanoes_2026: volcanoesDs as Dataset,
  rice_2022: riceDs as Dataset,
  cocoa_2024: cocoaDs as Dataset,
  fish_2022: fishDs as Dataset,
  sheep_2022: sheepDs as Dataset,
  gold_2023: goldDs as Dataset,
  natural_gas_2023: naturalGasDs as Dataset,
  renewable_energy_pct: renewableEnergyDs as Dataset,
  co2_per_capita_2022: co2PerCapitaDs as Dataset,
  internet_users_pct: internetUsersDs as Dataset,
  tourist_arrivals_2024: touristArrivalsDs as Dataset,
};

export const COUNTRIES: Country[] = countriesRaw as Country[];
export const QUESTIONS: QuestionDef[] = questionsRaw as QuestionDef[];

export function getDataset(id: string): Dataset {
  const ds = DATASETS[id];
  if (!ds) throw new Error(`Unknown dataset: ${id}`);
  return ds;
}

export function getQuestionSource(question: QuestionDef): { year: string; source: string } {
  const ds = getDataset(question.dataset);
  return { year: ds.year, source: ds.source };
}

export function statFor(countryCode: string, question: QuestionDef): number {
  const ds = getDataset(question.dataset);
  return ds.values[countryCode] ?? 0;
}

export function formatStat(value: number, question: QuestionDef): string {
  const ds = getDataset(question.dataset);
  if (ds.unit === '$B') {
    return value >= 1000 ? `$${(value / 1000).toFixed(2)}T` : `$${value.toFixed(0)}B`;
  }
  if (ds.unit === '%') return `${value}%`;
  if (ds.unit === 'yrs') return `${value} yrs`;
  if (ds.unit === 'kb/d') return `${value.toLocaleString()} kb/d`;
  if (ds.unit === 'count') return `${value}`;
  if (ds.unit === 't') return `${fmtCompactValue(value)} t`;
  if (ds.unit === 'head') return `${fmtCompactValue(value)}`;
  if (ds.unit === 'bcm') return `${value} bcm`;
  if (ds.unit === 'tCO2') return `${value} t CO\u2082`;
  if (ds.unit === 'Mvisitors') return `${value}M visitors`;
  // default: compact large numbers (population, medal counts)
  return fmtCompactValue(value);
}

function fmtCompactValue(value: number): string {
  if (value >= 1_000_000_000) return `${(value / 1_000_000_000).toFixed(1)}B`;
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(0)}K`;
  return String(value);
}

// ---------------------------------------------------------------------
// RULES — Coin/League economy (independent of the site's daily-streak model)
// ---------------------------------------------------------------------
export const RULES = {
  roundsPerMatch: 5,
  handSize: 10,
  entryFee: 10,
  winReward: 5,
  tieReward: 0,
  loseReward: -1,
  perfectClearBonus: 5, // extra Coins for winning all rounds in a match
  leagueName: 'Standard League',
  startingCoins: 50,
} as const;

export type RoundResult = 'win' | 'lose' | 'tie';

export interface RoundOutcome {
  question: QuestionDef;
  playerCountry: Country;
  cpuCountry: Country;
  playerValue: number;
  cpuValue: number;
  result: RoundResult;
  coinDelta: number;
}

// ---------------------------------------------------------------------
// CPU personalities
// Each match the CPU is assigned one personality, which biases which
// category of question it plays its strongest card on. Outside its
// favored categories it behaves like a baseline "Balanced" opponent.
// ---------------------------------------------------------------------
export type CpuPersonality = 'Explorer' | 'Economist' | 'Farmer' | 'Balanced';

const PERSONALITY_FOCUS: Record<CpuPersonality, { categories: string[]; focusChance: number; baseChance: number }> = {
  Explorer: { categories: [], focusChance: 0.7, baseChance: 0.5 }, // handled specially below (picks the "rarest" card)
  Economist: { categories: ['Economy'], focusChance: 0.85, baseChance: 0.5 },
  Farmer: { categories: ['Agriculture'], focusChance: 0.85, baseChance: 0.5 },
  Balanced: { categories: [], focusChance: 0.65, baseChance: 0.65 },
};

export function randomPersonality(rng: () => number = Math.random): CpuPersonality {
  const options: CpuPersonality[] = ['Explorer', 'Economist', 'Farmer', 'Balanced'];
  return options[Math.floor(rng() * options.length)];
}

function shuffle<T>(arr: T[], rng: () => number = Math.random): T[] {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export interface MatchState {
  playerHand: Country[];
  cpuHand: Country[];
  cpuPersonality: CpuPersonality;
  questionOrder: QuestionDef[];
  round: number;
  log: RoundOutcome[];
  coinBalance: number;
  matchCoinDelta: number;
}

export function startMatch(currentCoinBalance: number, rng: () => number = Math.random): MatchState {
  const pool = shuffle(COUNTRIES, rng);
  const playerHand = pool.slice(0, RULES.handSize);
  const cpuHand = shuffle(
    COUNTRIES.filter((c) => !playerHand.some((p) => p.code === c.code)),
    rng
  ).slice(0, RULES.handSize);

  let questionOrder = shuffle(QUESTIONS, rng).slice(0, RULES.roundsPerMatch);
  while (questionOrder.length < RULES.roundsPerMatch) {
    questionOrder.push(QUESTIONS[Math.floor(rng() * QUESTIONS.length)]);
  }

  return {
    playerHand,
    cpuHand,
    cpuPersonality: randomPersonality(rng),
    questionOrder,
    round: 0,
    log: [],
    coinBalance: currentCoinBalance - RULES.entryFee,
    matchCoinDelta: -RULES.entryFee,
  };
}

/** "Rarity" score for the Explorer personality — counts how many other cards
 * in the hand share at least one tag; fewer shared tags = more unique. */
function uniquenessScore(card: Country, hand: Country[]): number {
  let shared = 0;
  for (const other of hand) {
    if (other.code === card.code) continue;
    if (other.tags.some((t) => card.tags.includes(t))) shared++;
  }
  return -shared; // higher (less negative) = more unique
}

export function pickCpuCardIndex(
  cpuHand: Country[],
  usedCpuIdx: Set<number>,
  question: QuestionDef,
  personality: CpuPersonality,
  rng: () => number = Math.random
): number {
  const available = cpuHand.map((_, i) => i).filter((i) => !usedCpuIdx.has(i));

  if (personality === 'Explorer') {
    const sorted = [...available].sort(
      (a, b) => uniquenessScore(cpuHand[b], cpuHand) - uniquenessScore(cpuHand[a], cpuHand)
    );
    const focus = PERSONALITY_FOCUS.Explorer.focusChance;
    if (rng() < focus) return sorted[0];
    return available[Math.floor(rng() * available.length)];
  }

  const cfg = PERSONALITY_FOCUS[personality];
  const higherWins = question.rule === 'higher';
  const sortedByStat = [...available].sort((a, b) => {
    const va = statFor(cpuHand[a].code, question);
    const vb = statFor(cpuHand[b].code, question);
    return higherWins ? vb - va : va - vb;
  });

  const chance = cfg.categories.includes(question.category) ? cfg.focusChance : cfg.baseChance;
  if (rng() < chance) return sortedByStat[0];
  return available[Math.floor(rng() * available.length)];
}

export function resolveRound(
  question: QuestionDef,
  playerCountry: Country,
  cpuCountry: Country
): RoundOutcome {
  const playerValue = statFor(playerCountry.code, question);
  const cpuValue = statFor(cpuCountry.code, question);
  const higherWins = question.rule === 'higher';

  let result: RoundResult;
  if (playerValue === cpuValue) result = 'tie';
  else if (higherWins ? playerValue > cpuValue : playerValue < cpuValue) result = 'win';
  else result = 'lose';

  const coinDelta =
    result === 'win' ? RULES.winReward : result === 'tie' ? RULES.tieReward : RULES.loseReward;

  return { question, playerCountry, cpuCountry, playerValue, cpuValue, result, coinDelta };
}

/** Extra bonus paid out at match end if every round was a win. */
export function perfectClearBonus(log: RoundOutcome[]): number {
  if (log.length === RULES.roundsPerMatch && log.every((r) => r.result === 'win')) {
    return RULES.perfectClearBonus;
  }
  return 0;
}

// ---------------------------------------------------------------------
// Discovery / collection log — persisted client-side (this game keeps its
// own independent localStorage key; it does not use the site's shared
// daily-result storage since matches aren't tied to a daily seed).
// ---------------------------------------------------------------------
const DISCOVERY_KEY = 'world-data-duel:discoveries:v1';

export function getDiscoveries(): Record<string, true> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = window.localStorage.getItem(DISCOVERY_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

/** Records a win with this country as a "discovery." Returns true if it's new. */
export function recordDiscovery(countryCode: string): boolean {
  const store = getDiscoveries();
  if (store[countryCode]) return false;
  store[countryCode] = true;
  try {
    window.localStorage.setItem(DISCOVERY_KEY, JSON.stringify(store));
  } catch {
    // localStorage unavailable — collection just won't persist
  }
  return true;
}

const COIN_BALANCE_KEY = 'world-data-duel:coins:v1';

export function loadCoinBalance(): number {
  if (typeof window === 'undefined') return RULES.startingCoins;
  try {
    const raw = window.localStorage.getItem(COIN_BALANCE_KEY);
    return raw !== null ? Number(raw) : RULES.startingCoins;
  } catch {
    return RULES.startingCoins;
  }
}

export function saveCoinBalance(balance: number) {
  try {
    window.localStorage.setItem(COIN_BALANCE_KEY, String(balance));
  } catch {
    // ignore
  }
}
