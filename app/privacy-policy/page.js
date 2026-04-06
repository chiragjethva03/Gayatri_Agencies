import Link from 'next/link';

const IconDatabase = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <ellipse cx="12" cy="5" rx="9" ry="3"/>
    <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/>
    <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/>
  </svg>
);

const IconSettings = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3"/>
    <path d="M19.07 4.93a10 10 0 0 1 1.41 1.41L18.36 8.46a7 7 0 0 0-1-1l2.71-2.53zM4.93 4.93a10 10 0 0 0-1.41 1.41L5.64 8.46a7 7 0 0 1 1-1L4.93 4.93zM12 2v2m0 16v2M2 12h2m16 0h2m-4.93 7.07-1.41-1.41m-9.9 0-1.41 1.41m0-14.14 1.41 1.41m12.72 0 1.41-1.41"/>
  </svg>
);

const IconShare = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="18" cy="5" r="3"/>
    <circle cx="6" cy="12" r="3"/>
    <circle cx="18" cy="19" r="3"/>
    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
    <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
  </svg>
);

const IconShield = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
  </svg>
);

const IconLock = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
  </svg>
);

const IconMail = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
    <polyline points="22,6 12,13 2,6"/>
  </svg>
);

const policies = [
  {
    Icon: IconDatabase,
    title: 'Data Collection',
    content: 'We collect basic details such as your name, contact information, and shipment-related data required to provide our logistics and warehousing services.',
  },
  {
    Icon: IconSettings,
    title: 'Usage',
    content: 'Collected data is used exclusively for warehouse operations, billing, and transport coordination to ensure smooth and efficient service delivery.',
  },
  {
    Icon: IconShare,
    title: 'Sharing',
    content: 'Information may be shared with our transport partners only when necessary for service purposes. We do not share your data with unrelated third parties.',
  },
  {
    Icon: IconShield,
    title: 'Security',
    content: 'We take reasonable and appropriate steps to protect your data from misuse, unauthorized access, or disclosure using industry-standard practices.',
  },
  {
    Icon: IconLock,
    title: 'Confidentiality',
    content: 'Client data is kept strictly confidential. We do not use your information for marketing purposes and we do not sell your data to any third party.',
  },
];

export default function PrivacyPage() {
  return (
    <div className="ga-page-wrapper">

      {/* ── Hero ── */}
      <section className="ga-hero">
        <div className="ga-hero-inner">
          <div className="ga-hero-badge">Legal</div>
          <h1 className="ga-hero-title">Privacy Policy</h1>
          <p className="ga-hero-sub">
            Your privacy matters to us. Here is how we handle your information.
          </p>
          <div className="ga-hero-divider" />
          <p className="ga-hero-meta">
            Gayatri Agency · Ahmedabad, Gujarat · Last updated: April 2025
          </p>
        </div>
      </section>

      {/* ── Policy Timeline ── */}
      <section className="ga-section">
        <div className="ga-container-sm">

          {/* Section heading */}
          <div className="ga-section-heading">
            <p className="ga-section-eyebrow">Transparency First</p>
            <h2 className="ga-section-title">How We Handle Your Data</h2>
            <div className="ga-section-bar" />
            <p className="ga-section-desc">
              We are committed to protecting your privacy and being transparent
              about how your information is collected and used.
            </p>
          </div>

          {/* Timeline — icon LEFT, title inside card (no number) */}
          <div className="ga-privacy-list">
            {policies.map((item, index) => (
              <div className="ga-privacy-item" key={index}>

                {/* Left: icon + connector */}
                <div className="ga-privacy-item-left">
                  <div className="ga-privacy-item-icon">
                    <item.Icon />
                  </div>
                  {index < policies.length - 1 && (
                    <div className="ga-privacy-connector" />
                  )}
                </div>

                {/* Right: card */}
                <div className="ga-privacy-item-content">
                  <div className="ga-privacy-item-header">
                    <h3 className="ga-privacy-item-title">{item.title}</h3>
                  </div>
                  <p className="ga-privacy-item-text">{item.content}</p>
                </div>

              </div>
            ))}
          </div>

          {/* Note */}
          <div className="ga-note">
            <span className="ga-note-svg"><IconMail /></span>
            <p>
              If you have any questions about our privacy practices, feel free to
              reach out at{' '}
              <a href="mailto:gaytriagency170@gmail.com" className="ga-note-link">
                gaytriagency170@gmail.com
              </a>{' '}
              or call us at{' '}
              <a href="tel:+917405098099" className="ga-note-link">
                +91 74050-98099
              </a>
            </p>
          </div>

          {/* Link to Terms */}
          <div className="ga-page-links">
            <Link href="/terms" className="ga-page-link-btn">
              ← View Terms &amp; Conditions
            </Link>
          </div>

        </div>
      </section>

    </div>
  );
}