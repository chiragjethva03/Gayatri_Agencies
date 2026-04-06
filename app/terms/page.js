import Link from 'next/link';

const IconTruck = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="1" y="3" width="15" height="13" rx="1"/>
    <path d="M16 8h4l3 5v3h-7V8z"/>
    <circle cx="5.5" cy="18.5" r="2.5"/>
    <circle cx="18.5" cy="18.5" r="2.5"/>
  </svg>
);

const IconAlertTriangle = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
    <line x1="12" y1="9" x2="12" y2="13"/>
    <line x1="12" y1="17" x2="12.01" y2="17"/>
  </svg>
);

const IconFileText = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
    <polyline points="14 2 14 8 20 8"/>
    <line x1="16" y1="13" x2="8" y2="13"/>
    <line x1="16" y1="17" x2="8" y2="17"/>
  </svg>
);

const IconCreditCard = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
    <line x1="1" y1="10" x2="23" y2="10"/>
  </svg>
);

const IconPackage = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="16.5" y1="9.4" x2="7.5" y2="4.21"/>
    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
    <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
    <line x1="12" y1="22.08" x2="12" y2="12"/>
  </svg>
);

const IconPercent = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="19" y1="5" x2="5" y2="19"/>
    <circle cx="6.5" cy="6.5" r="2.5"/>
    <circle cx="17.5" cy="17.5" r="2.5"/>
  </svg>
);

const IconClipboard = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>
    <rect x="8" y="2" width="8" height="4" rx="1" ry="1"/>
  </svg>
);

const terms = [
  {
    Icon: IconTruck,
    title: 'Service Scope',
    content: 'We provide storage and handling of goods. Transport may be arranged by us or by third-party transporters depending on client requirements and availability.',
  },
  {
    Icon: IconAlertTriangle,
    title: 'Goods Responsibility',
    content: "All goods remain at the owner's or transporter's risk. We are not liable for loss or damage unless it is due to proven negligence on our part.",
  },
  {
    Icon: IconFileText,
    title: 'Documentation',
    content: 'Clients must provide correct details including goods type, quantity, and condition at the time of entry and exit. Please also check the LR print for additional conditions.',
  },
  {
    Icon: IconCreditCard,
    title: 'Charges & Payment',
    content: 'Storage and handling charges apply as mutually agreed. Goods may be held in the warehouse if payment is pending or outstanding.',
  },
  {
    Icon: IconPackage,
    title: 'Transportation',
    content: 'Truck booking is subject to vehicle availability. For third-party transport arrangements, responsibility for the goods lies with the respective transporter.',
  },
  {
    Icon: IconPercent,
    title: 'GST Clause',
    content: 'GST will be applicable as per prevailing law. If the bill exceeds the prescribed limit, a GST invoice is mandatory. Clients must provide valid GST details at the time of billing.',
  },
];

export default function TermsPage() {
  return (
    <div className="ga-page-wrapper">

      {/* ── Hero ── */}
      <section className="ga-hero">
        <div className="ga-hero-inner">
          <div className="ga-hero-badge">Legal</div>
          <h1 className="ga-hero-title">Terms &amp; Conditions</h1>
          <p className="ga-hero-sub">
            Please read these terms carefully before using our services.
          </p>
          <div className="ga-hero-divider" />
          <p className="ga-hero-meta">
            Gayatri Agency · Ahmedabad, Gujarat · Last updated: April 2025
          </p>
        </div>
      </section>

      {/* ── Terms Grid ── */}
      <section className="ga-section">
        <div className="ga-container">

          {/* Section heading */}
          <div className="ga-section-heading">
            <p className="ga-section-eyebrow">Our Commitment</p>
            <h2 className="ga-section-title">Service Terms</h2>
            <div className="ga-section-bar" />
            <p className="ga-section-desc">
              These terms govern the use of our warehousing, C&amp;F, and transport
              services. By engaging with Gayatri Agency, you agree to the following.
            </p>
          </div>

          {/* Cards — icon only, NO number badge */}
          <div className="ga-terms-grid">
            {terms.map((item, index) => (
              <div className="ga-terms-card" key={index}>
                <div className="ga-terms-card-top">
                  <div className="ga-terms-card-icon">
                    <item.Icon />
                  </div>
                </div>
                <h3 className="ga-terms-card-title">{item.title}</h3>
                <p className="ga-terms-card-text">{item.content}</p>
              </div>
            ))}
          </div>

          {/* Note */}
          <div className="ga-note">
            <span className="ga-note-svg"><IconClipboard /></span>
            <p>
              By engaging with our services, you agree to be bound by these terms
              and conditions. For any queries, please contact us at{' '}
              <a href="mailto:gaytriagency170@gmail.com" className="ga-note-link">
                gaytriagency170@gmail.com
              </a>
            </p>
          </div>

          {/* Link to Privacy Policy */}
          <div className="ga-page-links">
            <Link href="/privacy-policy" className="ga-page-link-btn">
              View Privacy Policy →
            </Link>
          </div>

        </div>
      </section>

    </div>
  );
}