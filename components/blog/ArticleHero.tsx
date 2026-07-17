import type { ReactNode } from 'react';

export function ArticleHero({ children }: { children: ReactNode }) {
  return (
    <div className="border-2 border-graphite dark:border-white/80 overflow-hidden mb-10 bg-white dark:bg-panel-dark not-prose">
      <svg viewBox="0 0 640 260" className="w-full h-auto block" role="img" aria-hidden>
        {children}
      </svg>
    </div>
  );
}
