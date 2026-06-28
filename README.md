# Loophole

Four original daily puzzle games, built with Next.js (App Router) + TypeScript +
Tailwind, ready to deploy on Vercel and monetize with Google AdSense.

- **Echo Merge** — slide-and-merge tiles where your last move replays itself one turn later.
- **Mirror Loop** — rotate mirrors to route three beams to their targets, sharing one rotation budget.
- **Color Debt** — match-3 where every match spawns "debt" tiles that lock the board if ignored.
- **Gravity Word** — flip gravity to spell real words as letters slide across the grid.

All four are "daily" puzzles: the board is seeded deterministically from the UTC
date, so every player worldwide gets the same puzzle on the same day (the
Wordle model). Results and streaks are stored in `localStorage` only — there
are no accounts and no backend.

## 1. Local setup

```bash
npm install
npm run dev
```

Open http://localhost:3000.

> This project was generated without running `npx create-next-app`, since the
> build environment it was written in had no network access. Run `npm install`
> once on your machine and everything will resolve normally — the
> `package.json` pins Next.js 16.x (current stable, React 19), Tailwind 3, and
> TypeScript 5.

**A note on the Next.js version:** this project originally shipped on Next 14.
Next 14 lost long-term support in November 2025, and a January 2026 security
advisory (GHSA-h25m-26qc-wcjf, a denial-of-service issue in React Server
Components' Server Function deserialization) only received patches for the
15.x and 16.x lines — there is no 14.x fix. This codebase doesn't use Server
Actions at all, so it was never actually exploitable through that specific
issue, but `npm audit` flags the package version regardless, and several other
advisories in the same family are also 16.x-only. The project was moved to
Next 16 for that reason. None of this app's code used the Next 15/16 breaking
changes (no dynamic route params, no middleware), so the upgrade was
drop-in — no application code changed, only `package.json`.

If you're auditing dependencies later and see something similar, the general
shape of the decision is: check whether the vulnerable code path
(Server Actions, middleware, `next/image` remote patterns, etc.) is actually
in use before assuming a scary CVE title applies to your app, but don't let
"we don't use that feature" become an excuse to stay on an unsupported major
version indefinitely.

## 2. Project structure

```
app/
  page.tsx                 → home "Index" page (game grid)
  games/<slug>/page.tsx     → one route per game, sets metadata + daily seed
  games/<slug>/*Board.tsx   → the actual interactive game (client component)
  api/og/route.tsx          → dynamic OG share-card image
  privacy/, terms/, about/  → required-for-AdSense static pages
  sitemap.ts, robots.ts     → SEO
lib/
  daily-seed.ts             → deterministic per-day RNG seeding
  storage.ts                → localStorage results/streak tracking
  share.ts                  → Web Share API + clipboard fallback
  games/<slug>.ts            → pure game-logic engine for each game (no React)
  games/registry.ts          → shared metadata used by the home page + headers
components/                  → shared UI (header, footer, ad slot, modals, cards)
```

Each game's logic lives in a plain TypeScript file with no React or DOM
dependency, so it's independently testable and easy to tune (move limits,
target scores, grid size, etc. are all named constants at the top of each
file).

## 3. Connecting AdSense

1. Apply for AdSense with your live domain once it's deployed (AdSense wants
   to crawl a real, reachable site with real content and a privacy policy —
   that's why `app/privacy/page.tsx` and `app/terms/page.tsx` already exist;
   fill in the bracketed `[Edit before publishing]` placeholders first).
2. Replace the publisher ID in `public/ads.txt` with your real `pub-XXXXXXXXXXXXXXXX` ID.
3. In Vercel's project settings, set environment variables:
   - `NEXT_PUBLIC_ADSENSE_CLIENT_ID=ca-pub-XXXXXXXXXXXXXXXX`
   - `NEXT_PUBLIC_ADSENSE_ENABLED=true` (leave `false` until your account is approved)
   - `NEXT_PUBLIC_SITE_URL=https://your-real-domain.com`
4. The `<AdSlot />` component (`components/AdSlot.tsx`) renders a clearly
   labeled placeholder until ads are enabled, so the layout never shifts when
   you flip the switch. Add more `<AdSlot slotId="..." />` instances wherever
   you want additional units — each needs its own AdSense ad unit ID.

A few placement notes worth keeping in mind, based on what's currently working
in the casual web-game space: avoid auto-refreshing ad units on a 5-minute
puzzle session, never put an ad where it could be mistaken for a game button,
and don't gate the "Solve" or "Share" actions behind an interstitial — AdSense
policy and player retention both punish that.

## 4. Deploying to Vercel

```bash
vercel
```

or connect the repo through the Vercel dashboard. No special build
configuration is needed — it's a standard Next.js app. Set the environment
variables from step 3 in the Vercel project settings before your first
production deploy.

## 5. Extending the catalog

To add a fifth game:

1. Add its metadata to `lib/games/registry.ts` (this drives the home page card,
   the header, and the "How to play" modal automatically).
2. Write its pure logic in `lib/games/<slug>.ts`.
3. Build `app/games/<slug>/<Name>Board.tsx` (client component) and
   `app/games/<slug>/page.tsx` (server component that just calls
   `getDailyContext` and renders the board) — copy an existing game as a
   template, they all follow the same shape.
4. Reuse `GameHeader` and `ResultModal` from `components/` so streaks, sharing,
   and the rules modal keep working without extra code.

## 6. Internationalization

Copy is in English throughout, since the brief was an overseas-facing
audience. If you want to localize, the cleanest path is Next.js's built-in
`i18n` routing or a library like `next-intl` — none of the game *logic* is
language-dependent except Gravity Word's dictionary (`lib/games/word-list.ts`),
which would need a translated word list per locale.

## 7. Known limitations to revisit

- `lib/games/word-list.ts` ships a few hundred common English words. It's
  enough to play, but a larger dictionary (a proper word-list package) will
  make Gravity Word feel less repetitive over time.
- There's no backend, so streaks are per-browser. If you want cross-device
  streaks or a real leaderboard later, that's the natural next milestone —
  the `lib/storage.ts` interface is intentionally small so it's easy to swap
  for an API-backed version without touching any game logic.
