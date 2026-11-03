import { Link } from 'react-router-dom';

/** Circle monogram + two-line wide wordmark, after the template's logo lock-up. */
export default function Logo({ to = '/', className = '', compact = false }) {
  return (
    <Link to={to} className={`flex items-center gap-2 ${className}`} aria-label="College Admissions home">
      <span className="logo-mark h-8 w-8 shrink-0">CA</span>
      {!compact && (
        <span className="font-wide text-[10px] font-semibold uppercase leading-[1.05] tracking-[0.08em]">
          College
          <br />
          Admissions
        </span>
      )}
    </Link>
  );
}
