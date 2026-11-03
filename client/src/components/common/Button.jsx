// Pill buttons with wide uppercase labels, as in the template:
// orange with ink text for the main action, ink with orange text for "dark".
const VARIANTS = {
  primary: 'bg-brand-500 text-ink hover:bg-brand-400 focus:ring-brand-500 disabled:bg-brand-200 disabled:text-ink/50',
  dark: 'bg-ink text-brand-500 ring-1 ring-brand-500 hover:bg-slate-800 focus:ring-brand-500 disabled:opacity-50',
  secondary:
    'bg-white text-ink ring-1 ring-ink/80 hover:bg-slate-100 focus:ring-brand-500 disabled:text-slate-400 disabled:ring-slate-300',
  danger: 'bg-rose-600 text-white hover:bg-rose-700 focus:ring-rose-500 disabled:bg-rose-300',
  success: 'bg-emerald-600 text-white hover:bg-emerald-700 focus:ring-emerald-500 disabled:bg-emerald-300',
  ghost: 'text-slate-600 hover:bg-slate-100 focus:ring-slate-400',
};

const SIZES = {
  sm: 'px-3 py-1.5 text-[10px]',
  md: 'px-5 py-2.5 text-[11px]',
  lg: 'px-7 py-3.5 text-xs',
};

export default function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  className = '',
  children,
  ...props
}) {
  return (
    <button
      type="button"
      {...props}
      disabled={props.disabled || loading}
      className={`inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full font-wide font-medium uppercase
        tracking-[0.12em] transition focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-cream
        disabled:cursor-not-allowed ${VARIANTS[variant]} ${SIZES[size]} ${className}`}
    >
      {loading && (
        <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
      )}
      {children}
    </button>
  );
}
