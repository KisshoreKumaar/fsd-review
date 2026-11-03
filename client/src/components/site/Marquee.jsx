const ITEMS = [
  'Admission cycle 2026–27',
  'Applications open',
  'Apply · Upload · Pay · Track',
  'Merit lists published online',
];

/** Scrolling orange band, as on the template; still under prefers-reduced-motion. */
export default function Marquee() {
  const row = ITEMS.map((t) => (
    <span key={t} className="flex items-center gap-10 px-5">
      {t}
      <span aria-hidden>—</span>
    </span>
  ));
  return (
    <div className="overflow-hidden bg-brand-500 py-3 text-ink">
      <div className="eyebrow flex w-max animate-marquee whitespace-nowrap text-sm">
        {row}
        <span aria-hidden className="flex">{row}</span>
      </div>
    </div>
  );
}
