'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { OniMascot, type OniPose } from '@/components/arcade/OniMascot';

interface Rock {
  id: number;
  xPercent: number;
  color: string;
  size: number;
  fallMs: number;
}

interface Particle {
  id: number;
  x: number;
  y: number;
  color: string;
  angle: number;
}

const ROCK_COLORS = ['#FF2E63', '#FFD400', '#00E5FF', '#7B2FF7', '#4CE0A0'];
const STARTING_LIVES = 3;
const FALL_DISTANCE = 640; // px the rock travels — must match --fall-distance in CSS

let idCounter = 0;
const nextId = () => idCounter++;

const HIGH_SCORE_KEY = 'loophole:arcade:oni-smash:high-score';

function loadHighScore(): number {
  if (typeof window === 'undefined') return 0;
  try {
    return Number(window.localStorage.getItem(HIGH_SCORE_KEY)) || 0;
  } catch {
    return 0;
  }
}
function saveHighScore(score: number) {
  try {
    window.localStorage.setItem(HIGH_SCORE_KEY, String(score));
  } catch {
    // ignore
  }
}

type Status = 'idle' | 'playing' | 'gameover';

export function OniSmashGame() {
  const [status, setStatus] = useState<Status>('idle');
  const [rocks, setRocks] = useState<Rock[]>([]);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [lives, setLives] = useState(STARTING_LIVES);
  const [pose, setPose] = useState<OniPose>('idle');
  const [shake, setShake] = useState(false);
  const [comboPop, setComboPop] = useState(false);
  const [highScore, setHighScore] = useState(0);

  const startTimeRef = useRef(0);
  const spawnTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const arenaRef = useRef<HTMLDivElement>(null);
  const livesRef = useRef(STARTING_LIVES);
  const comboRef = useRef(0);

  useEffect(() => {
    setHighScore(loadHighScore());
  }, []);

  const triggerShake = useCallback(() => {
    setShake(true);
    setTimeout(() => setShake(false), 160);
  }, []);

  const popParticles = useCallback((x: number, y: number, color: string) => {
    const burst: Particle[] = Array.from({ length: 7 }, () => ({
      id: nextId(),
      x,
      y,
      color,
      angle: Math.random() * 360,
    }));
    setParticles((prev) => [...prev, ...burst]);
    setTimeout(() => {
      setParticles((prev) => prev.filter((p) => !burst.some((b) => b.id === p.id)));
    }, 520);
  }, []);

  const endGame = useCallback(() => {
    setStatus('gameover');
    if (spawnTimeoutRef.current) clearTimeout(spawnTimeoutRef.current);
    setRocks([]);
    setScore((s) => {
      if (s > loadHighScore()) saveHighScore(s);
      setHighScore(loadHighScore());
      return s;
    });
  }, []);

  const scheduleSpawn = useCallback(() => {
    const elapsed = Date.now() - startTimeRef.current;
    // Difficulty ramp: spawn faster and fall faster the longer you survive.
    const spawnInterval = Math.max(950 - elapsed / 60, 380);
    const fallMs = Math.max(2500 - elapsed / 40, 1250);

    spawnTimeoutRef.current = setTimeout(() => {
      setRocks((prev) => [
        ...prev,
        {
          id: nextId(),
          xPercent: 8 + Math.random() * 84,
          color: ROCK_COLORS[Math.floor(Math.random() * ROCK_COLORS.length)],
          size: 56 + Math.random() * 22,
          fallMs,
        },
      ]);
      if (livesRef.current > 0) scheduleSpawn();
    }, spawnInterval);
  }, []);

  function startGame() {
    idCounter = 0;
    setScore(0);
    setCombo(0);
    comboRef.current = 0;
    setLives(STARTING_LIVES);
    livesRef.current = STARTING_LIVES;
    setRocks([]);
    setPose('idle');
    setStatus('playing');
    startTimeRef.current = Date.now();
    scheduleSpawn();
  }

  useEffect(() => {
    return () => {
      if (spawnTimeoutRef.current) clearTimeout(spawnTimeoutRef.current);
    };
  }, []);

  function handleSmash(rock: Rock, e: React.MouseEvent | React.TouchEvent) {
    setRocks((prev) => prev.filter((r) => r.id !== rock.id));
    const nextCombo = comboRef.current + 1;
    comboRef.current = nextCombo;
    setCombo(nextCombo);
    setScore((s) => s + 10 + Math.floor(nextCombo / 3) * 5);
    setPose('punch');
    setTimeout(() => setPose('idle'), 320);
    triggerShake();
    setComboPop(true);
    setTimeout(() => setComboPop(false), 250);

    const rect = arenaRef.current?.getBoundingClientRect();
    if (rect) {
      const clientX = 'touches' in e ? e.touches[0]?.clientX ?? rect.left : (e as React.MouseEvent).clientX;
      const clientY = 'touches' in e ? e.touches[0]?.clientY ?? rect.top : (e as React.MouseEvent).clientY;
      popParticles(clientX - rect.left, clientY - rect.top, rock.color);
    }
  }

  function handleMiss(rockId: number) {
    setRocks((prev) => prev.filter((r) => r.id !== rockId));
    comboRef.current = 0;
    setCombo(0);
    livesRef.current -= 1;
    setLives(livesRef.current);
    setPose('hurt');
    setTimeout(() => setPose('idle'), 400);
    if (livesRef.current <= 0) {
      endGame();
    }
  }

  return (
    <div className="w-full max-w-md mx-auto">
      {/* HUD */}
      <div className="flex items-center justify-between mb-3 gap-2">
        <div className="arcade-stat-panel px-3 py-1.5 rounded text-xs">
          SCORE <span className="text-lg ml-1" style={{ color: 'var(--arcade-yellow)' }}>{score}</span>
        </div>
        <div className={`arcade-stat-panel px-3 py-1.5 rounded text-xs ${comboPop ? 'arcade-combo-pop' : ''}`}>
          COMBO <span className="text-lg ml-1" style={{ color: 'var(--arcade-pink)' }}>x{combo}</span>
        </div>
        <div className="arcade-stat-panel px-3 py-1.5 rounded text-xs">
          {'♥'.repeat(lives)}
          {'♡'.repeat(Math.max(STARTING_LIVES - lives, 0))}
        </div>
      </div>

      {/* Arena */}
      <div
        ref={arenaRef}
        className={`relative w-full overflow-hidden rounded-2xl border-4 border-black ${shake ? 'arcade-shake' : ''}`}
        style={{ height: 480, background: 'linear-gradient(180deg, #1a1024 0%, #0B0710 100%)' }}
      >
        {/* ground line */}
        <div className="absolute left-0 right-0 bottom-14 h-0.5 bg-white/20" />

        {rocks.map((rock) => (
          <div
            key={rock.id}
            className="arcade-rock"
            style={{
              left: `${rock.xPercent}%`,
              width: rock.size,
              height: rock.size,
              fontSize: rock.size * 0.28,
              background: rock.color,
              animationDuration: `${rock.fallMs}ms`,
              // @ts-expect-error custom property for the keyframe
              '--fall-distance': `${FALL_DISTANCE}px`,
            }}
            onMouseDown={(e) => handleSmash(rock, e)}
            onTouchStart={(e) => handleSmash(rock, e)}
            onAnimationEnd={() => handleMiss(rock.id)}
          >
            👊
          </div>
        ))}

        {particles.map((p) => (
          <span
            key={p.id}
            className="arcade-particle"
            style={{
              left: p.x,
              top: p.y,
              background: p.color,
              // @ts-expect-error custom properties for the keyframe
              '--px': `${Math.cos((p.angle * Math.PI) / 180) * 50}px`,
              '--py': `${Math.sin((p.angle * Math.PI) / 180) * 50}px`,
            }}
          />
        ))}

        {/* mascot reacting in the corner */}
        <div className="absolute bottom-2 right-2 w-20">
          <OniMascot pose={pose} />
        </div>

        {status !== 'playing' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-black/70 text-center px-6">
            {status === 'idle' && (
              <>
                <p className="text-white/80 text-sm max-w-xs">
                  Tap the rocks before they hit the ground. Miss three and it's over. Chain hits for combo bonus.
                </p>
                <button
                  onClick={startGame}
                  className="arcade-cta px-8 py-3 rounded-full font-black text-lg"
                  style={{ background: 'var(--arcade-yellow)', color: '#141018' }}
                >
                  TAP TO START
                </button>
              </>
            )}
            {status === 'gameover' && (
              <>
                <OniMascot pose="hurt" className="w-24" />
                <p className="text-2xl font-black" style={{ color: 'var(--arcade-pink)' }}>
                  GAME OVER
                </p>
                <p className="text-white/90">
                  Score: <span className="font-black text-xl">{score}</span>
                </p>
                <p className="text-white/50 text-xs">High score: {highScore}</p>
                <div className="flex gap-3">
                  <button
                    onClick={startGame}
                    className="arcade-cta px-6 py-2.5 rounded-full font-black"
                    style={{ background: 'var(--arcade-yellow)', color: '#141018' }}
                  >
                    PLAY AGAIN
                  </button>
                  <button
                    onClick={() => {
                      const text = `I scored ${score} in ONI SMASH 👊🔥 Beat me: ${typeof window !== 'undefined' ? window.location.href : ''}`;
                      if (navigator.share) {
                        navigator.share({ text }).catch(() => {});
                      } else if (navigator.clipboard) {
                        navigator.clipboard.writeText(text);
                      }
                    }}
                    className="px-6 py-2.5 rounded-full font-black border-2"
                    style={{ borderColor: 'var(--arcade-cyan)', color: 'var(--arcade-cyan)' }}
                  >
                    SHARE
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
