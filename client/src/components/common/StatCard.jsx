export default function StatCard({ label, value, hint, tone = 'default', compact = false }) {
  const tones = {
    default: 'text-slate-900',
    brand: 'text-brand-600',
    success: 'text-emerald-600',
    warn: 'text-amber-600',
    danger: 'text-rose-600',
  };
  return (
    <div className="card p-5">
      <p className="eyebrow text-slate-500">{label}</p>
      <p className={`mt-3 font-medium tracking-display ${compact ? 'break-all text-xl' : 'break-words text-3xl'} ${tones[tone]}`}>{value}</p>
      {hint && <p className="mt-1 text-xs text-slate-500">{hint}</p>}
    </div>
  );
}
