export function StatCallout({
  value,
  label,
  color = '#1B1D22',
}: {
  value: string;
  label: string;
  color?: string;
}) {
  return (
    <div className="specimen-card p-5 pl-7 my-8 not-prose">
      <span className="tag-stripe" style={{ backgroundColor: color }} aria-hidden />
      <p className="font-display font-bold text-3xl sm:text-4xl mb-1" style={{ color }}>
        {value}
      </p>
      <p className="stat-line text-ink/60 dark:text-white/50">{label}</p>
    </div>
  );
}

export function StatGrid({
  stats,
}: {
  stats: { value: string; label: string }[];
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 my-8 not-prose">
      {stats.map((s) => (
        <div key={s.label} className="border border-index dark:border-index-dark rounded-tag p-4">
          <p className="font-display font-bold text-2xl mb-1">{s.value}</p>
          <p className="stat-line text-ink/50 dark:text-white/40">{s.label}</p>
        </div>
      ))}
    </div>
  );
}
