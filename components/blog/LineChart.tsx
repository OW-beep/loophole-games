interface LineDatum {
  label: string;
  value: number;
}

export function LineChart({
  title,
  data,
  color,
  suffix = '',
  source,
}: {
  title: string;
  data: LineDatum[];
  color: string;
  suffix?: string;
  source?: string;
}) {
  const width = 480;
  const height = 220;
  const padding = { top: 28, right: 12, bottom: 28, left: 12 };
  const plotW = width - padding.left - padding.right;
  const plotH = height - padding.top - padding.bottom;
  const values = data.map((d) => d.value);
  const max = Math.max(...values);
  const min = Math.min(0, ...values);
  const range = max - min || 1;
  const stepX = data.length > 1 ? plotW / (data.length - 1) : 0;

  const points = data.map((d, i) => ({
    ...d,
    x: padding.left + i * stepX,
    y: padding.top + plotH - ((d.value - min) / range) * plotH,
  }));

  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  const areaPath = `${linePath} L ${points[points.length - 1].x} ${padding.top + plotH} L ${points[0].x} ${padding.top + plotH} Z`;

  return (
    <figure className="my-8 not-prose">
      <div className="specimen-card p-5 pl-7">
        <span className="tag-stripe" style={{ backgroundColor: color }} aria-hidden />
        <figcaption className="stat-line text-ink/50 dark:text-white/40 mb-4">{title}</figcaption>
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto" role="img" aria-label={title}>
          <path d={areaPath} fill={color} opacity={0.14} />
          <path d={linePath} fill="none" stroke={color} strokeWidth={2.5} strokeLinejoin="round" strokeLinecap="round" />
          {points.map((p) => (
            <circle key={`${p.label}-dot`} cx={p.x} cy={p.y} r={3.5} fill={color} />
          ))}
          {points.map((p) => (
            <text
              key={`${p.label}-val`}
              x={p.x}
              y={p.y - 10}
              textAnchor="middle"
              fill="currentColor"
              className="text-ink dark:text-white/80"
              style={{ fontSize: '10px', fontFamily: 'var(--font-mono)' }}
            >
              {p.value.toLocaleString()}
              {suffix}
            </text>
          ))}
          {points.map((p) => (
            <text
              key={`${p.label}-lbl`}
              x={p.x}
              y={height - 8}
              textAnchor="middle"
              fill="currentColor"
              className="text-ink/50 dark:text-white/40"
              style={{ fontSize: '10px', fontFamily: 'var(--font-mono)' }}
            >
              {p.label}
            </text>
          ))}
        </svg>
        {source && <p className="stat-line text-ink/40 dark:text-white/30 mt-3">Source: {source}</p>}
      </div>
    </figure>
  );
}
