import { Link } from 'react-router-dom';
import Button from '../common/Button.jsx';

const ROWS = [
  ['Apply from anywhere — the form keeps a draft at every step.', 'Online form'],
  ['Upload certificates once and see each one verified individually.', 'Live verification'],
  ['Pay the application fee securely and get an instant receipt.', 'Secure payment'],
  ['See your rank and seat the moment the merit list is published.', 'Merit results'],
];

/** Dark band with line-separated rows, after the template's testimonial section. */
export default function WhyOnline() {
  return (
    <section className="bg-ink px-4 py-20 text-cream sm:px-8">
      <div className="mx-auto max-w-7xl">
        <h2 className="display max-w-3xl text-4xl text-brand-500 sm:text-6xl">Admission Without The Queue</h2>
        <ul className="mt-14 divide-y divide-cream/15 border-y border-cream/15">
          {ROWS.map(([text, label]) => (
            <li key={label} className="flex flex-col gap-2 py-6 sm:flex-row sm:items-center sm:justify-between">
              <p className="max-w-xl text-base text-cream/85">{text}</p>
              <p className="eyebrow text-sm text-brand-500">{label}</p>
            </li>
          ))}
        </ul>
        <div className="mt-14 flex justify-center">
          <Link to="/register">
            <Button size="lg">Start your application</Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
