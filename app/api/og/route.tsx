import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';
import { GAMES } from '@/lib/games/registry';

export const runtime = 'edge';

const COLOR_HEX: Record<string, string> = {
  echo: '#7C5CFF', mirror: '#0FA89B', debt: '#E14B4B', gravity: '#8FAE1B',
  fold: '#C9763B', carry: '#3A56B0', brace: '#5C7A8A', splice: '#C23B8E',
  heat: '#E05C1A', oneline: '#1A7FE0', overflow: '#17A0A0', polarity: '#7A3DB8',
  shadow: '#4A4A6A', tether: '#1A8C5B', drift: '#1E7BC4', phase: '#C4611E',
  boo: '#7A3DB8',
  blobble: '#2FA7B8', sprout: '#5FA344', chef: '#E2793D', noodle: '#D9A62E',
  acorn: '#B5651D',
};

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const slug = searchParams.get('game');
  const game = GAMES.find((g) => g.slug === slug);

  const name = game?.name ?? 'Loophole';
  const tagline = game?.tagline ?? 'Four original daily puzzle games.';
  const accent = game ? COLOR_HEX[game.color] : '#7C5CFF';

  // Result params — present only when this OG image is generated for a
  // shared result link, e.g. /games/echo-merge?won=1&moves=11&limit=16&puzzle=214
  const movesParam = searchParams.get('moves');
  const won = searchParams.get('won') === '1';
  const movesLimit = searchParams.get('limit');
  const puzzleNumber = searchParams.get('puzzle');
  const score = searchParams.get('score');
  const isResult = movesParam !== null && movesLimit !== null;

  if (isResult && game) {
    const filled = Math.min(Number(movesParam), Number(movesLimit));
    const empty = Math.max(Number(movesLimit) - filled, 0);
    const blocks = [
      ...Array.from({ length: Math.max(filled, 1) }, () => (won ? accent : '#C7CCD1')),
      ...Array.from({ length: empty }, () => '#E8E9E6'),
    ];

    return new ImageResponse(
      (
        <div
          style={{
            width: '1200px',
            height: '630px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            padding: '64px',
            backgroundColor: '#F6F7F4',
            fontFamily: 'sans-serif',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '20px', height: '20px', backgroundColor: accent }} />
            <div style={{ fontSize: '28px', fontWeight: 700, letterSpacing: '-0.02em', color: '#1B1D22' }}>
              LOOPHOLE
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ fontSize: '24px', color: '#33363D', marginBottom: '8px' }}>
              {name} #{puzzleNumber ?? '—'}
            </div>
            <div style={{ fontSize: '60px', fontWeight: 700, color: '#1B1D22', lineHeight: 1.05 }}>
              {won ? 'Solved.' : 'So close.'}
            </div>
            <div style={{ display: 'flex', gap: '10px', marginTop: '28px' }}>
              {blocks.map((c, i) => (
                <div key={i} style={{ width: '36px', height: '36px', backgroundColor: c }} />
              ))}
            </div>
            <div style={{ display: 'flex', gap: '32px', marginTop: '28px', fontSize: '28px', color: '#1B1D22' }}>
              <div>
                {movesParam}/{movesLimit} moves
              </div>
              {score !== null && <div>Score {score}</div>}
            </div>
          </div>

          <div
            style={{
              fontSize: '20px',
              color: '#1B1D22',
              border: `3px solid ${accent}`,
              padding: '8px 16px',
              alignSelf: 'flex-start',
            }}
          >
            Play today&rsquo;s puzzle at loophole
          </div>
        </div>
      ),
      { width: 1200, height: 630 }
    );
  }

  return new ImageResponse(
    (
      <div
        style={{
          width: '1200px',
          height: '630px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '64px',
          backgroundColor: '#F6F7F4',
          fontFamily: 'sans-serif',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '20px', height: '20px', backgroundColor: accent }} />
          <div style={{ fontSize: '28px', fontWeight: 700, letterSpacing: '-0.02em', color: '#1B1D22' }}>
            LOOPHOLE
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ fontSize: '72px', fontWeight: 700, color: '#1B1D22', lineHeight: 1.05 }}>{name}</div>
          <div style={{ fontSize: '32px', color: '#33363D', marginTop: '16px', maxWidth: '900px' }}>{tagline}</div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div
            style={{
              fontSize: '20px',
              color: '#1B1D22',
              border: `3px solid ${accent}`,
              padding: '8px 16px',
            }}
          >
            A new puzzle, every day
          </div>
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
