import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';
import { GAMES } from '@/lib/games/registry';

export const runtime = 'edge';

const COLOR_HEX: Record<string, string> = {
  echo: '#7C5CFF',
  mirror: '#0FA89B',
  debt: '#E14B4B',
  gravity: '#8FAE1B',
};

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const slug = searchParams.get('game');
  const game = GAMES.find((g) => g.slug === slug);

  const name = game?.name ?? 'Loophole';
  const tagline = game?.tagline ?? 'Four original daily puzzle games.';
  const accent = game ? COLOR_HEX[game.color] : '#7C5CFF';

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
