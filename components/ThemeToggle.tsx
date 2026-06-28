'use client';

import { useEffect, useState } from 'react';

export function ThemeToggle() {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const stored = window.localStorage.getItem('loophole:theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const initial = stored ? stored === 'dark' : prefersDark;
    setDark(initial);
    document.documentElement.classList.toggle('dark', initial);
  }, []);

  function toggle() {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle('dark', next);
    window.localStorage.setItem('loophole:theme', next ? 'dark' : 'light');
  }

  return (
    <button
      onClick={toggle}
      aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
      className="stat-line border border-graphite dark:border-white/70 px-2 py-1 hover:bg-graphite hover:text-paper dark:hover:bg-white dark:hover:text-graphite transition-colors"
    >
      {dark ? 'LIGHT' : 'DARK'}
    </button>
  );
}
