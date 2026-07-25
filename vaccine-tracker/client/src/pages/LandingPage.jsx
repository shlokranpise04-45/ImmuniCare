import { Link } from 'react-router-dom';

export default function LandingPage() {
  return (
    <div className="landing-page-shell">
      <header>
        <div className="wrap nav">
          <div className="brand">
            <span className="brand-mark">IC</span>
            ImmuniCare
          </div>
          <Link className="nav-cta" to="/login">Log in</Link>
        </div>
      </header>

      <section className="hero">
        <div className="eyebrow">Immunization record, kept current</div>
        <div className="ring">
          <svg viewBox="0 0 24 24" fill="none" stroke="var(--ink)" strokeWidth="1.6">
            <path d="M12 2 4 5v6c0 5 3.4 8.7 8 9 4.6-.3 8-4 8-9V5l-8-3Z" strokeLinejoin="round" />
            <path d="M9 12l2 2 4-4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <h1>
          Every dose, <em>tracked</em>.<br />Nothing missed.
        </h1>
        <p>One running immunization record for your family — what's done, what's due, and what's overdue.</p>
        <Link className="btn-primary" to="/register">Create your record — free</Link>
      </section>

      <section className="why">
        <div className="why-inner">
          <div className="eyebrow">Why it matters</div>
          <h2>Vaccination schedules span years, span people, and rarely stay in one place.</h2>
          <p>
            A missed follow-up dose or an overdue booster is usually a records problem, not a decision anyone made on purpose.
            ImmuniCare keeps one account for the whole family, flags what's actually due, and reminds you before it's overdue — so nothing depends on remembering.
          </p>
        </div>
      </section>

      <footer className="wrap">
        <span>ImmuniCare</span>
        <span>Built for families who'd rather not guess.</span>
      </footer>
    </div>
  );
}
