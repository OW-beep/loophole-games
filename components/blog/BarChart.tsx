interface BarDatum {
  label: string;
  value: number;
}

/**
 * A small, dependency-free horizontal bar chart. Every blog chart in this
 * site is hand-drawn SVG like this, in the same spirit as the games' "no
 * physics library" self-made approach — no charting library needed for a
 * handful of static figures.
 */
export function BarChart({
  title,
  data,
  color,
  prefix = '',
  suffix = '',
  source,
}: {
  title: string;
  data: BarDatum[];
  color: string;
  prefix?: string;
  suffix?: string;
  source?: string;
}) {
  const max = Math.max(...data.map((d) => d.value), 1);
  const rowH = 34;
  const width = 480;
  const labelW = 118;
  const barMaxW = width - labelW - 70;
  const height = data.length * rowH + 12;

  return (
    <figure className="my-8 not-prose">
      <div className="specimen-card p-5 pl-7">
        <span className="tag-stripe" style={{ backgroundColor: color }} aria-hidden />
        <figcaption className="stat-line text-ink/50 dark:text-white/40 mb-4">{title}</figcaption>
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto" role="img" aria-label={title}>
          {data.map((d, i) => {
            const w = (d.value / max) * barMaxW;
            const y = i * rowH;
            return (
              <g key={d.label}>
                <text
                  x={0}
                  y={y + 20}
                  fill="currentColor"
                  className="text-ink dark:text-white/80"
                  style={{ fontSize: '11px', fontFamily: 'var(--font-mono)' }}
                >
                  {d.label}
                </text>
                <rect x={labelW} y={y + 8} width={Math.max(w, 2)} height={16} rx={3} fill={color} />
                <text
                  x={labelW + w + 8}
                  y={y + 20}
                  fill="currentColor"
                  className="text-ink/70 dark:text-white/60"
                  style={{ fontSize: '11px', fontFamily: 'var(--font-mono)' }}
                >
                  {prefix}
                  {d.value.toLocaleString()}
                  {suffix}
                </text>
              </g>
            );
          })}
        </svg>
        {source && <p className="stat-line text-ink/40 dark:text-white/30 mt-3">Source: {source}</p>}
      </div>
    </figure>
  );
}
