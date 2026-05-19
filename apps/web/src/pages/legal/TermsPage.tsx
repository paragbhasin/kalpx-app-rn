import { ChevronLeft } from "lucide-react";
import React from "react";
import { useNavigate } from "react-router-dom";
import { AppShell } from "../../components/ui";

// ── Legal notice ─────────────────────────────────────────────────────────────
// Counsel-reviewed and approved. Round 2 sign-off received 2026-05-18.
// Governing law section remains a placeholder — requires counsel before publication.
// Subscriptions section is a placeholder — must be updated before billing goes live.
// ─────────────────────────────────────────────────────────────────────────────

interface ToSSection {
  id: string;
  title: string;
  paragraphs: string[];
  list?: string[];
  note?: string;
}

const SECTIONS: ToSSection[] = [
  {
    id: 'what',
    title: '1. What KalpX Mitra Is',
    paragraphs: [
      'KalpX Mitra is a Sanatan-rooted companion for conscious living. It offers reflective guidance, mantra, sankalp, daily rhythm, inner path work, and support for everyday moments — grounded in the Sanatan tradition.',
      'Mitra is not a licensed therapist, counselor, psychologist, physician, lawyer, financial advisor, or crisis service. Nothing Mitra provides constitutes medical, legal, financial, psychological, or crisis support. All content is educational, reflective, and spiritually oriented.',
      'In an emergency: If you or someone else may be in immediate danger, contact local emergency services (such as 112 in India or 911 in the United States) or a qualified crisis helpline immediately. Mitra cannot contact emergency services on your behalf.',
    ],
  },
  {
    id: 'eligibility',
    title: '2. Eligibility',
    paragraphs: [
      'You must be at least 13 years old to use KalpX. KalpX is currently available in India only for users 18 and older. Users between 13 and 18 outside India represent that a parent or guardian has reviewed and agreed to these Terms. By using KalpX, you represent that you meet these requirements.',
    ],
  },
  {
    id: 'account',
    title: '3. Account Responsibility',
    paragraphs: [
      'You are responsible for the security of your account credentials. Notify us at support@kalpx.com immediately if you believe your account has been compromised. You are responsible for all activity that occurs under your account.',
    ],
  },
  {
    id: 'acceptable-use',
    title: '4. Acceptable Use',
    paragraphs: ['You agree not to:'],
    list: [
      'Use KalpX in violation of applicable law',
      'Impersonate any person or entity',
      'Submit false, misleading, or harmful content',
      'Attempt unauthorized access to any part of the service',
      'Use automated tools to scrape or replicate KalpX content at scale',
      'Use KalpX to harass, threaten, or harm others',
      'Attempt to reverse engineer KalpX\'s proprietary systems',
    ],
  },
  {
    id: 'user-content',
    title: '5. User Content',
    paragraphs: [
      'You may submit text, voice notes, and other content through Tell Mitra, check-ins, and community features ("User Content"). You retain ownership of your User Content. By submitting it, you grant KalpX a limited, non-exclusive, royalty-free license to store and process it for the sole purpose of delivering the service to you. KalpX does not use your personal User Content to train AI models or share it commercially.',
    ],
  },
  {
    id: 'community',
    title: '6. Community Content',
    paragraphs: [
      'Content you share in community areas is subject to the KalpX Community User Agreements and Community Rules. By posting, you grant KalpX a non-exclusive, royalty-free license to display and distribute that content within the platform. KalpX may remove content that violates community guidelines or these Terms.',
    ],
  },
  {
    id: 'ip',
    title: '7. Intellectual Property',
    paragraphs: [
      'KalpX\'s guidance copy, design, wisdom content, mantra text, app architecture, and all KalpX-authored material are proprietary and protected by applicable law. You may not reproduce or distribute KalpX content outside the service without written permission.',
    ],
  },
  {
    id: 'ai',
    title: '8. AI-Assisted Features',
    paragraphs: [
      'Some features use AI assistance — including via Amazon Web Services Bedrock — to understand your messages and generate personalized guidance. Before message text is sent to AWS Bedrock, we apply automated filters that remove common direct identifiers. AI responses support reflection and conscious living — they are not definitive advice of any kind. See our Privacy Policy for full details.',
    ],
  },
  {
    id: 'no-advice',
    title: '9. No Professional Advice',
    paragraphs: [
      'KalpX content is educational and spiritually reflective. It is not a substitute for medical, psychological, legal, financial, or other professional advice. Consult a qualified professional for such matters.',
    ],
  },
  {
    id: 'no-crisis',
    title: '10. No Emergency or Crisis Support',
    paragraphs: [
      'KalpX is not an emergency service or crisis intervention platform. If you are experiencing a crisis or emergency, contact emergency services or a crisis helpline immediately.',
    ],
  },
  {
    id: 'notifications',
    title: '11. Notifications',
    paragraphs: [
      'With your permission, KalpX may send push notifications and emails to support your practice. You can adjust or turn off notifications at any time in the app. KalpX sends notifications to invite timely return to practice — not to pressure, shame, or create compulsive engagement.',
    ],
  },
  {
    id: 'analytics',
    title: '12. Marketing and Analytics',
    paragraphs: [
      'KalpX may use analytics, attribution, and advertising technologies to measure campaigns, improve the service, understand product usage, support notification improvements, and develop subscription and product offerings, as described in our Privacy Policy. Users can manage certain tracking preferences where available.',
    ],
  },
  {
    id: 'subscriptions',
    title: '13. Subscriptions and Payments',
    paragraphs: [
      'KalpX may offer paid subscriptions, premium features, one-time purchases, classes, sessions, or other paid services in the future. Any applicable pricing, billing cycle, renewal terms, cancellation process, refund eligibility, trial terms, and other payment conditions will be clearly presented to you before you complete a purchase.',
      'No paid feature or subscription will be enabled unless the applicable payment, cancellation, renewal, refund, and consumer-disclosure terms have been fully updated in these Terms and/or shown at the point of purchase.',
      'If you purchase through the Apple App Store or Google Play, your purchase will also be governed by the applicable app store\'s payment, cancellation, refund, and subscription policies. KalpX does not control app store billing decisions, refund approvals, or subscription management rules for purchases made through those platforms.',
      'If KalpX later enables direct payments outside the app stores, those payments may be processed by third-party payment providers. Additional payment-provider terms may apply and will be disclosed before purchase.',
    ],
  },
  {
    id: 'availability',
    title: '14. Service Availability',
    paragraphs: [
      'We aim to provide reliable access but cannot guarantee uninterrupted availability. We may update, modify, or discontinue features with reasonable notice.',
    ],
  },
  {
    id: 'termination',
    title: '15. Termination',
    paragraphs: [
      'We may suspend or terminate your account if you materially violate these Terms. You may delete your account at any time (see Privacy Policy, Section 10). Termination does not affect KalpX\'s rights with respect to content already shared in community areas.',
    ],
  },
  {
    id: 'disclaimer',
    title: '16. Disclaimer of Warranties',
    paragraphs: [
      'THE SERVICE IS PROVIDED "AS IS" WITHOUT WARRANTY OF ANY KIND. KALPX DISCLAIMS ALL WARRANTIES, EXPRESS OR IMPLIED, INCLUDING FITNESS FOR A PARTICULAR PURPOSE AND NON-INFRINGEMENT.',
    ],
  },
  {
    id: 'liability',
    title: '17. Limitation of Liability',
    paragraphs: [
      'TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, KALPX SHALL NOT BE LIABLE FOR INDIRECT, INCIDENTAL, SPECIAL, OR CONSEQUENTIAL DAMAGES. OUR TOTAL LIABILITY SHALL NOT EXCEED AMOUNTS PAID TO US IN THE PRECEDING TWELVE MONTHS OR USD $100, WHICHEVER IS GREATER.',
    ],
  },
  {
    id: 'governing-law',
    title: '18. Governing Law',
    paragraphs: [
      'KalpX is organized as a Delaware corporation. Delaware, USA is the current starting point for governing-law analysis. However, the final governing law, jurisdiction, venue, dispute-resolution process, arbitration terms, class-action waiver, consumer-protection language, and any India-specific or other country-specific provisions must be reviewed and confirmed by qualified legal counsel before these Terms are published.',
      'Until this section is finalized, KalpX should not rely on this provision to limit user rights, require arbitration, restrict class actions, or determine the exclusive forum for disputes.',
      'For users outside the United States, including users in India, certain local consumer-protection, data-protection, payment, platform, or mandatory legal rights may apply regardless of the governing law stated in these Terms. Nothing in these Terms is intended to limit rights that cannot be waived under applicable law.',
    ],
    note: 'Placeholder — requires legal review before production.',
  },
  {
    id: 'changes',
    title: '19. Changes to These Terms',
    paragraphs: [
      'Material changes will be communicated in the app or by email. Continued use after the effective date of revised Terms constitutes acceptance.',
    ],
  },
  {
    id: 'contact',
    title: '20. Contact',
    paragraphs: ['Questions: support@kalpx.com'],
  },
];

const H2_STYLE: React.CSSProperties = {
  fontSize: '20px',
  fontWeight: 700,
  color: '#000',
  marginBottom: '16px',
  marginTop: 0,
};

const P_STYLE: React.CSSProperties = { marginBottom: '14px' };

const UL_STYLE: React.CSSProperties = {
  paddingLeft: '20px',
  listStyleType: 'disc',
  marginBottom: '14px',
};

const LI_STYLE: React.CSSProperties = { marginBottom: '10px' };

export function TermsPage() {
  const navigate = useNavigate();

  return (
    <AppShell bg="cream">
      <div
        style={{
          minHeight: '100dvh',
          background: '#fffaf5',
          paddingBottom: 'calc(40px + env(safe-area-inset-bottom))',
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '26px 20px 18px',
            background: '#fffaf5',
            borderBottom: '1px solid rgba(184, 134, 75, 0.14)',
            position: 'sticky',
            top: 0,
            zIndex: 10,
          }}
        >
          <button
            type="button"
            onClick={() => navigate(-1)}
            style={{
              width: 32,
              height: 32,
              border: 'none',
              background: 'none',
              color: '#000',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-start',
              padding: 0,
            }}
          >
            <ChevronLeft size={28} strokeWidth={2.2} />
          </button>
          <h1
            style={{
              margin: 0,
              fontSize: 22,
              fontWeight: 700,
              color: '#000',
              fontFamily: 'var(--kalpx-font-sans)',
            }}
          >
            Terms of Service
          </h1>
          <div style={{ width: 32 }} />
        </div>

        {/* Content */}
        <div
          className="fade-in"
          style={{
            maxWidth: 700,
            margin: '0 auto',
            padding: '40px 24px',
            lineHeight: '1.7',
            color: '#373737',
            fontFamily: 'var(--kalpx-font-sans)',
          }}
        >
          <p style={{ marginBottom: '8px', color: '#b8864b', fontWeight: 600 }}>
            Effective Date: May 18, 2026
          </p>
          <p style={{ marginBottom: '32px', fontSize: 13, color: '#888' }}>
            KalpX, Inc., a Delaware C Corporation
          </p>

          <p style={{ fontSize: '17px', marginBottom: '32px' }}>
            By creating an account or using the KalpX app or website, you agree to these Terms of
            Service (&ldquo;Terms&rdquo;). If you do not agree, do not use KalpX.
          </p>

          {SECTIONS.map((section) => (
            <section key={section.id} style={{ marginBottom: '32px' }}>
              <h2 style={H2_STYLE}>{section.title}</h2>
              {section.note && (
                <p style={{ ...P_STYLE, color: '#999', fontStyle: 'italic', fontSize: 13 }}>
                  [{section.note}]
                </p>
              )}
              {section.paragraphs.map((para, i) => (
                <p key={i} style={P_STYLE}>{para}</p>
              ))}
              {section.list && (
                <ul style={UL_STYLE}>
                  {section.list.map((item, i) => (
                    <li key={i} style={LI_STYLE}>{item}</li>
                  ))}
                </ul>
              )}
            </section>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
