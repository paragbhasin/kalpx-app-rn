import { ChevronLeft } from "lucide-react";
import React from "react";
import { useNavigate } from "react-router-dom";
import { AppShell } from "../../components/ui";

// ── Legal notice ─────────────────────────────────────────────────────────────
// Founder-review draft. Qualified legal review required before production.
// Do not publish without legal sign-off.
// ─────────────────────────────────────────────────────────────────────────────

interface PolicySection {
  id: string;
  title: string;
  content: Array<
    | { type: 'p'; text: string }
    | { type: 'ul'; items: string[] }
    | { type: 'ol'; items: string[] }
    | { type: 'table'; headers: string[]; rows: string[][] }
    | { type: 'note'; text: string }
  >;
}

const SECTIONS: PolicySection[] = [
  {
    id: 'collect',
    title: '1. What We Collect',
    content: [
      { type: 'p', text: 'Account and profile data: When you create an account, we collect your name, email address, and password (stored as a secure hash). If you sign in with Google or Apple, we receive your name and email from that provider. We also store profile preferences such as age group and guidance preferences you set.' },
      { type: 'p', text: 'Timezone: We detect your device timezone and may ask you to confirm it. Your timezone is used only to time companion reminders and notifications at an appropriate hour for where you are. It is not used for advertising targeting or user profiling.' },
      { type: 'p', text: 'Push notification tokens: When you enable push notifications, your device provides a token — an identifier used by Apple or Google to deliver messages to your device. We store this token to send you companion reminders. You can withdraw push access at any time in device settings or in the Notifications section of the app.' },
      { type: 'p', text: 'Notification delivery receipts: We record whether a notification was shown, tapped, or dismissed. This helps Mitra understand your responsiveness patterns and avoid over-notifying you. Receipts do not include the content of your Mitra interactions.' },
      { type: 'p', text: 'Notification preferences: We store your per-category notification settings, quiet hours, frequency preferences, and whether you have consented to push and email communications.' },
      { type: 'p', text: 'Companion memory and personalization (CompanionState): Mitra maintains a curated record of your journey: your active inner path and sankalp, recent practice patterns, and signals about your progress and engagement. This is a structured summary — not a conversation transcript. It is used to reduce repeated questions and deepen the relevance of guidance over time. Memory supports continuity; it is not used to monitor, profile, or manipulate you. CompanionState content is not shared with advertising platforms.' },
      { type: 'p', text: 'Tell Mitra messages: When you share a thought with Mitra, your message is stored in encrypted form on our servers. The encrypted message is used to understand your context and route you to the most aligned support. A structured record of intent and context signals is also retained to support companion continuity. When AI-assisted features are enabled, limited text or structured signals may be processed by our AI service providers to provide the feature, subject to our privacy controls. Raw Tell Mitra messages are not sent to advertising platforms or used to train our own AI models. Encrypted messages are retained while your account is active and deleted with your account.' },
      { type: 'p', text: 'AI-assisted processing: Some features use AI assistance (via AWS Bedrock, hosted by Amazon) to classify message intent and generate personalized guidance. Before text is sent to an AI provider, we apply anonymization measures where possible. Typed AI outputs (intent classification, structured signals) may be retained; we do not use your personal Tell Mitra messages to train our own AI models. AI features are flag-controlled and may not be active for all users.' },
      { type: 'p', text: 'Voice notes (when feature is enabled): If you choose to submit a voice note, your audio is uploaded to secure cloud storage and transcribed to extract meaning. Raw audio is automatically deleted within 24 hours of upload. Your transcribed text is retained while your account is active to support companion continuity. Voice notes require explicit consent in the app; consent can be withdrawn at any time. Raw audio is not sent to advertising platforms.' },
      { type: 'p', text: 'Daily Rhythm, Inner Path, Rooms, Quick Chant, Quick Reset, and check-in activity: We record which features you use, when, and whether you completed them. This activity data supports personalized guidance and practice continuity.' },
      { type: 'p', text: 'Device and technical data: We collect device type, operating system version, and app version for technical support and stability. IP address is processed as part of standard server operations.' },
    ],
  },
  {
    id: 'analytics',
    title: '2. Analytics, Advertising, and Attribution',
    content: [
      { type: 'p', text: 'We use analytics, advertising, attribution, diagnostics, and experimentation technologies to understand how people discover KalpX, how the app is used, which features are helpful, and how to improve onboarding, notifications, product flows, subscriptions, and overall service quality.' },
      { type: 'p', text: 'These tools may include Meta Pixel, Meta Conversions API, Google Analytics / GA4, Firebase Analytics, Google Ads conversion tracking, Apple Search Ads attribution, Google Play Install Referrer, app store analytics, mobile attribution partners, product analytics tools, crash and error monitoring tools, A/B testing tools, email analytics, push notification analytics, payment and subscription analytics, marketing agencies, attribution partners, and similar services.' },
      { type: 'p', text: 'Depending on the tool and your settings, these technologies may collect or receive information such as page views, app events, device information, browser information, IP address, advertising identifiers where permitted, app instance IDs, campaign source, referral source, install attribution, subscription or purchase events, notification interaction events, and general usage events.' },
      { type: 'p', text: 'We may use this information to: measure marketing campaign performance; understand user behavior and product engagement; improve onboarding and user experience; test and improve product flows; make notifications more relevant and less repetitive; measure subscription interest and purchases; diagnose errors and prevent abuse; build or measure advertising audiences where permitted by law and platform rules.' },
      { type: 'p', text: 'What we do not send to advertising platforms: We do not send raw Tell Mitra messages, voice transcripts, private reflections, CompanionState memory content, or sensitive personal details such as crisis state, health distress, financial hardship, or relationship pain to advertising platforms such as Meta or Google Ads. Where possible, we use aggregated, hashed, limited, or event-level data rather than sensitive personal content. Emotional state signals collected internally are not sent as properties to advertising platforms.' },
      { type: 'p', text: 'Consent and preferences: Where required by applicable law, certain analytics and advertising technologies will only be activated after obtaining your consent. You may manage tracking preferences where available. See Section 6 (Your Rights and Choices) and Section 13 (Cookies and Local Storage).' },
    ],
  },
  {
    id: 'partners',
    title: '3. Information from Partners and Third-Party Sources',
    content: [
      { type: 'p', text: 'We may receive information from advertising partners, analytics providers, app stores, attribution partners, marketing agencies, or other service providers that help us understand how users discover KalpX and how our campaigns perform.' },
      { type: 'p', text: 'This may include campaign source, ad interaction data, referral data, app install attribution, audience segment information, aggregated demographic or interest insights, subscription or purchase events, and performance reports.' },
      { type: 'p', text: 'Where legally permitted, we may combine this information with KalpX account or usage data to improve marketing measurement, product experience, onboarding, notification relevance, and subscription offerings.' },
      { type: 'p', text: 'We do not knowingly acquire sensitive personal information such as health status, precise location, financial hardship, crisis state, or private Mitra content from outside data brokers for advertising targeting. We do not use private spiritual reflections or Tell Mitra content for ad targeting.' },
    ],
  },
  {
    id: 'use',
    title: '4. How We Use Your Information',
    content: [
      {
        type: 'ul', items: [
          'Authenticate and secure your account',
          'Deliver companion guidance, rooms, rhythm features, and personalized support',
          'Send notifications at appropriate times based on your timezone and preferences',
          'Personalize Mitra\'s responses based on your journey history and curated companion memory',
          'Process and route Tell Mitra interactions',
          'Transcribe voice notes and delete raw audio promptly',
          'Measure marketing and product performance (see Section 2)',
          'Diagnose technical issues and improve the app',
          'Comply with legal obligations',
        ],
      },
    ],
  },
  {
    id: 'not-use',
    title: '5. How We Do NOT Use Your Information',
    content: [
      {
        type: 'ul', items: [
          'We do not sell your personal data',
          'We may use advertising and attribution partners to measure campaigns and build or measure audiences where permitted by law and platform rules. We do not send raw Tell Mitra messages, voice transcripts, private reflections, CompanionState memory content, or sensitive Mitra state signals to advertising platforms.',
          'We do not use your personal Tell Mitra messages to train our own AI models',
          'Emotional state signals, voice transcripts, private reflections, CompanionState content, crisis signals, health distress, financial hardship, or relationship pain are not sent as properties to advertising platforms',
          'Mitra\'s companion memory is designed to reduce repetition and deepen support — not to create dependency, monitor behavior, or manipulate engagement',
        ],
      },
    ],
  },
  {
    id: 'notifications',
    title: '6. Notifications',
    content: [
      { type: 'p', text: 'We use notification preferences, timezone, delivery receipts, and interaction patterns to make reminders more relevant, timely, and respectful. For example, we may use whether notifications are shown, tapped, dismissed, ignored, or turned off to reduce repetition, adjust timing, avoid quiet hours, and improve reminder quality.' },
      { type: 'p', text: 'We do not include raw Tell Mitra messages or sensitive personal content in lock-screen notification copy. You can turn off notifications or change preferences at any time in the app or in device settings.' },
    ],
  },
  {
    id: 'retention',
    title: '7. Data Retention',
    content: [
      {
        type: 'table',
        headers: ['Data type', 'Retention'],
        rows: [
          ['Account and profile data', 'Retained while account is active; generally deleted after a verified account deletion request'],
          ['CompanionState, Inner Path, Daily Rhythm, Rooms, activity data', 'Retained while account is active; deleted with account'],
          ['Tell Mitra encrypted messages and intent signals', 'Retained while account is active; deleted with account'],
          ['Voice note audio', 'Deleted within 24 hours of upload'],
          ['Voice note transcripts', 'Retained while account is active; deleted with account'],
          ['Push notification tokens', 'Retained while push is enabled; deleted when push is disabled or account is deleted'],
          ['Notification delivery receipts', 'Approximately 12 months, then deleted or aggregated'],
          ['Analytics events', 'Approximately 24 months, then deleted or aggregated'],
          ['Server and security logs', 'Approximately 90 days, unless needed for security, fraud prevention, legal compliance, or debugging'],
          ['Backups', 'May persist for 30–90 days through normal backup rotation'],
        ],
      },
      { type: 'p', text: 'These are guidelines. We generally process verified deletion requests within 30 days, subject to backup rotation, security, legal, and operational requirements. Actual timelines may vary.' },
    ],
  },
  {
    id: 'third-parties',
    title: '8. Third-Party Services',
    content: [
      { type: 'p', text: 'We use trusted service providers to operate the platform. These providers process data only as needed to deliver our services:' },
      {
        type: 'table',
        headers: ['Category', 'Examples', 'Purpose'],
        rows: [
          ['Cloud infrastructure', 'Amazon Web Services (AWS)', 'Hosting, storage, AI classification, voice transcription, optional TTS'],
          ['Push delivery', 'Firebase / Google FCM, Apple APNs', 'Push notification delivery'],
          ['Social login', 'Google OAuth, Apple Sign In', 'Optional account creation'],
          ['Analytics and attribution', 'Tools listed in Section 2', 'Product analytics, marketing measurement'],
          ['Payment processing', 'To be named when billing goes live', 'Subscription and payment handling'],
        ],
      },
      { type: 'p', text: 'These providers are bound by their own terms and privacy commitments. We do not authorize them to use your data for independent commercial purposes.' },
    ],
  },
  {
    id: 'rights',
    title: '9. Your Rights and Choices',
    content: [
      { type: 'p', text: 'You may:' },
      {
        type: 'ul', items: [
          'Access the personal data we hold — contact privacy@kalpx.com',
          'Update your profile and preferences at any time in the app',
          'Withdraw push notification consent in the Notifications section or device settings',
          'Withdraw email notification consent in the Notifications section',
          'Withdraw voice consent in app settings',
          'Manage analytics and tracking preferences where available',
          'Request deletion of your account and data (see Section 10)',
          'Contact us with questions about how your data is handled',
        ],
      },
      { type: 'p', text: 'Depending on where you live, additional rights may apply. See Section 12 (Regional Privacy Rights).' },
    ],
  },
  {
    id: 'deletion',
    title: '10. Account and Data Deletion',
    content: [
      { type: 'p', text: 'To delete your account:' },
      {
        type: 'ul', items: [
          'In-app: Profile → Delete Account',
          'By email: privacy@kalpx.com with subject "Delete My KalpX Account"',
        ],
      },
      { type: 'p', text: 'Deletion removes your account credentials, profile, journey data, companion memory, encrypted Tell Mitra messages, notification tokens, and activity history. We generally process verified deletion requests within 30 days, subject to backup rotation, security, legal, and operational requirements. Some data may remain in anonymized or aggregated form.' },
    ],
  },
  {
    id: 'children',
    title: '11. Children and Minors',
    content: [
      { type: 'p', text: 'KalpX Mitra is not intended for children under 13. We do not knowingly collect personal data from anyone under 13. If we learn that we have collected such data without appropriate consent, we will delete it. Contact privacy@kalpx.com if you believe this has occurred.' },
      { type: 'p', text: 'Users between 13 and 18 should use KalpX only with parent or guardian involvement. In regions where a higher age threshold applies — including India, where data protection rules may apply to users under 18 — parental or guardian consent may be required.' },
      { type: 'p', text: 'We do not use targeted advertising, behavioral monitoring, or tracking for known child or minor users where prohibited by applicable law. We do not send data from known minor users to advertising platforms.' },
    ],
  },
  {
    id: 'regional',
    title: '12. Regional Privacy Rights',
    content: [
      { type: 'p', text: 'Depending on where you live, you may have rights to access, correct, delete, or receive a portable copy of your personal information, and to object to or restrict certain processing. To exercise these rights, contact privacy@kalpx.com.' },
      { type: 'p', text: 'California residents: California residents may have additional rights under California privacy law, including the right to know what personal information we collect, to request deletion, and to opt out of the sale of personal information. We do not sell personal information. Contact privacy@kalpx.com to exercise California privacy rights.' },
      { type: 'p', text: 'Users in India: We provide clear notice of what we collect, how it is used, and how to request deletion or correction. For privacy requests or grievance redressal, contact privacy@kalpx.com.' },
      { type: 'p', text: 'All international users: If you access KalpX from outside the United States, your information may be processed in the United States and other countries where our service providers operate. By using KalpX, you acknowledge that your data may be processed in locations with different data protection standards than your home country.' },
    ],
  },
  {
    id: 'cookies',
    title: '13. Cookies and Local Storage',
    content: [
      { type: 'p', text: 'Our website uses cookies and local browser storage for authentication sessions, language preferences, and feature state. We do not use cookies for third-party advertising tracking without appropriate consent.' },
      { type: 'p', text: 'Where analytics and marketing technologies that use cookies or device identifiers are activated, we will provide consent controls where required by applicable law. Essential site functionality uses cookies by default; analytics and marketing tools are subject to your consent preferences.' },
    ],
  },
  {
    id: 'security',
    title: '14. Security',
    content: [
      { type: 'p', text: 'We store sensitive data (including Tell Mitra messages) encrypted at rest. We use HTTPS/TLS for data in transit, hashed password storage, and access controls. No system is completely secure; we cannot guarantee protection against every unauthorized access.' },
    ],
  },
  {
    id: 'changes',
    title: '15. Changes to This Policy',
    content: [
      { type: 'p', text: 'We may update this policy. When we make material changes, we will update the effective date and notify you in the app or by email.' },
    ],
  },
  {
    id: 'contact',
    title: '16. Contact and Privacy Requests',
    content: [
      { type: 'p', text: 'privacy@kalpx.com\nKalpX, Inc., California, USA' },
      { type: 'p', text: 'For account deletion, data access, consent withdrawal, or any privacy concern, email privacy@kalpx.com with your request in the subject line.' },
    ],
  },
];

const H2_STYLE: React.CSSProperties = {
  fontSize: '20px',
  fontWeight: 700,
  color: '#000',
  marginBottom: '16px',
  marginTop: 0,
};

const P_STYLE: React.CSSProperties = {
  marginBottom: '14px',
  whiteSpace: 'pre-line',
};

const UL_STYLE: React.CSSProperties = {
  paddingLeft: '20px',
  listStyleType: 'disc',
  marginBottom: '14px',
};

const LI_STYLE: React.CSSProperties = {
  marginBottom: '10px',
};

const TABLE_STYLE: React.CSSProperties = {
  width: '100%',
  borderCollapse: 'collapse',
  marginBottom: '14px',
  fontSize: '14px',
};

const TH_STYLE: React.CSSProperties = {
  textAlign: 'left',
  padding: '8px 12px',
  background: 'rgba(184,134,75,0.1)',
  borderBottom: '1px solid rgba(184,134,75,0.2)',
  fontWeight: 600,
};

const TD_STYLE: React.CSSProperties = {
  padding: '8px 12px',
  borderBottom: '1px solid rgba(0,0,0,0.06)',
  verticalAlign: 'top',
};

function renderContent(section: PolicySection) {
  return section.content.map((block, idx) => {
    if (block.type === 'p') {
      return <p key={idx} style={P_STYLE}>{block.text}</p>;
    }
    if (block.type === 'ul') {
      return (
        <ul key={idx} style={UL_STYLE}>
          {block.items.map((item, i) => (
            <li key={i} style={LI_STYLE}>{item}</li>
          ))}
        </ul>
      );
    }
    if (block.type === 'ol') {
      return (
        <ol key={idx} style={{ ...UL_STYLE, listStyleType: 'decimal' }}>
          {block.items.map((item, i) => (
            <li key={i} style={LI_STYLE}>{item}</li>
          ))}
        </ol>
      );
    }
    if (block.type === 'table') {
      return (
        <table key={idx} style={TABLE_STYLE}>
          <thead>
            <tr>
              {block.headers.map((h) => (
                <th key={h} style={TH_STYLE}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {block.rows.map((row, ri) => (
              <tr key={ri}>
                {row.map((cell, ci) => (
                  <td key={ci} style={TD_STYLE}>{cell}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      );
    }
    return null;
  });
}

export function PrivacyPage() {
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
            Privacy Policy
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
            Effective Date: [date — update at publication]
          </p>
          <p style={{ marginBottom: '8px', fontSize: 13, color: '#888' }}>
            Privacy contact: privacy@kalpx.com
          </p>
          <p style={{ marginBottom: '32px', fontSize: 13, color: '#888' }}>
            KalpX, Inc. [confirm legal entity name], California, USA
          </p>

          <p style={{ fontSize: '17px', marginBottom: '32px' }}>
            KalpX (&ldquo;we,&rdquo; &ldquo;our,&rdquo; or &ldquo;us&rdquo;) operates the KalpX Mitra companion app and website.
            This Privacy Policy explains what personal information we collect, how we use it,
            and the rights you have over it.
          </p>

          {SECTIONS.map((section) => (
            <section key={section.id} style={{ marginBottom: '32px' }}>
              <h2 style={H2_STYLE}>{section.title}</h2>
              {renderContent(section)}
            </section>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
