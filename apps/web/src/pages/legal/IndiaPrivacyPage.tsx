import { ChevronLeft } from "lucide-react";
import React from "react";
import { useNavigate } from "react-router-dom";
import { AppShell } from "../../components/ui";

// ── Legal notice ─────────────────────────────────────────────────────────────
// Counsel-reviewed and approved. Round 2 sign-off received 2026-05-18.
// Three items still awaiting India counsel: cross-border transfer confirmation,
// SDF designation threshold, and DPDP Rules 2025 consent mechanism format.
// ─────────────────────────────────────────────────────────────────────────────

const GOLD = '#b8864b';

const H2: React.CSSProperties = {
  fontSize: '20px',
  fontWeight: 700,
  color: '#000',
  marginBottom: '16px',
  marginTop: 0,
};

const H3: React.CSSProperties = {
  fontSize: '16px',
  fontWeight: 700,
  color: '#000',
  marginBottom: '10px',
  marginTop: '20px',
};

const P: React.CSSProperties = { marginBottom: '14px' };

const UL: React.CSSProperties = {
  paddingLeft: '20px',
  listStyleType: 'disc',
  marginBottom: '14px',
};

const LI: React.CSSProperties = { marginBottom: '8px' };

const TABLE: React.CSSProperties = {
  width: '100%',
  borderCollapse: 'collapse',
  marginBottom: '16px',
  fontSize: '13px',
};

const TH: React.CSSProperties = {
  textAlign: 'left',
  padding: '8px 10px',
  background: 'rgba(184,134,75,0.1)',
  borderBottom: '1px solid rgba(184,134,75,0.2)',
  fontWeight: 600,
  verticalAlign: 'top',
};

const TD: React.CSSProperties = {
  padding: '8px 10px',
  borderBottom: '1px solid rgba(0,0,0,0.06)',
  verticalAlign: 'top',
};

const CALLOUT: React.CSSProperties = {
  background: 'rgba(184,134,75,0.08)',
  border: '1px solid rgba(184,134,75,0.25)',
  borderRadius: '8px',
  padding: '14px 16px',
  marginBottom: '16px',
  fontSize: '14px',
};

export function IndiaPrivacyPage() {
  const navigate = useNavigate();

  return (
    <AppShell bg="cream">
      <div style={{ minHeight: '100dvh', background: '#fffaf5', paddingBottom: 'calc(40px + env(safe-area-inset-bottom))' }}>

        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '26px 20px 18px', background: '#fffaf5',
          borderBottom: '1px solid rgba(184, 134, 75, 0.14)',
          position: 'sticky', top: 0, zIndex: 10,
        }}>
          <button type="button" onClick={() => navigate(-1)} style={{
            width: 32, height: 32, border: 'none', background: 'none', color: '#000',
            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'flex-start', padding: 0,
          }}>
            <ChevronLeft size={28} strokeWidth={2.2} />
          </button>
          <h1 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: '#000', fontFamily: 'var(--kalpx-font-sans)', textAlign: 'center' }}>
            India Privacy Notice
          </h1>
          <div style={{ width: 32 }} />
        </div>

        {/* Content */}
        <div className="fade-in" style={{
          maxWidth: 700, margin: '0 auto', padding: '40px 24px',
          lineHeight: '1.7', color: '#373737', fontFamily: 'var(--kalpx-font-sans)',
        }}>
          <p style={{ marginBottom: '8px', color: GOLD, fontWeight: 600 }}>
            Effective Date: May 18, 2026
          </p>
          <p style={{ marginBottom: '8px', fontSize: 13, color: '#888' }}>
            Privacy contact: privacy@kalpx.com
          </p>
          <p style={{ marginBottom: '32px', fontSize: 13, color: '#888' }}>
            KalpX, Inc., a Delaware C Corporation
          </p>

          <p style={{ fontSize: '17px', marginBottom: '32px' }}>
            This notice supplements the main{' '}
            <a href="/en/privacy" style={{ color: GOLD }}>KalpX Privacy Policy</a>.
            It is prepared under India's Digital Personal Data Protection Act, 2023 (DPDP Act) and the
            Digital Personal Data Protection Rules, 2025. Where this notice conflicts with the main Privacy
            Policy as applied to users in India, this notice governs.
          </p>

          {/* Section 1 */}
          <section style={{ marginBottom: '32px' }}>
            <h2 style={H2}>1. Who We Are (Data Fiduciary)</h2>
            <p style={P}><strong>Data Fiduciary:</strong> KalpX, Inc., a Delaware C Corporation operating as KalpX, with principal business operations accessible at kalpx.com and the KalpX app.</p>
            <div style={CALLOUT}>
              <p style={{ margin: 0, fontWeight: 600, marginBottom: '8px' }}>Grievance Officer (India)</p>
              <p style={{ margin: 0 }}>
                <strong>Name:</strong> Taruna Chopra (Interim Privacy and Grievance Contact)<br />
                <strong>Contact:</strong> privacy@kalpx.com<br />
                <strong>Response:</strong> Acknowledge within 48 hours; substantive response within 30 days<br />
                <strong>Escalation:</strong> Data Protection Board of India — see Section 5.4
              </p>
            </div>
          </section>

          {/* Section 2 */}
          <section style={{ marginBottom: '32px' }}>
            <h2 style={H2}>2. Personal Data We Process</h2>
            <p style={P}>Under the DPDP Act, we provide the following notice of personal data processed, purpose, legal basis, and retention:</p>
            <div style={{ overflowX: 'auto' }}>
              <table style={TABLE}>
                <thead>
                  <tr>
                    <th style={TH}>Personal data</th>
                    <th style={TH}>Purpose</th>
                    <th style={TH}>Basis</th>
                    <th style={TH}>Retained how long</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ['Name, email address, password hash', 'Account creation, authentication, account management', 'Consent at signup', 'Until account is deleted'],
                    ['Age group (optional)', 'Guidance customization', 'Consent (optional field)', 'Until account is deleted'],
                    ['Timezone', 'Scheduling companion reminders at appropriate hours', 'Legitimate use to deliver the service', 'Until account is deleted'],
                    ['FCM / APNs device push token', 'Delivering push notifications to your device', 'Consent (notification permission)', 'Until push is disabled or account deleted'],
                    ['Notification preferences', 'Customizing notification timing and frequency', 'Consent', 'Until account is deleted'],
                    ['Notification delivery receipts (shown / tapped / dismissed)', 'Improving reminder relevance; reducing over-notification', 'Legitimate use to deliver the service', 'Approximately 12 months, then deleted or aggregated'],
                    ['CompanionState personalization signals', 'Reducing repeated questions; deepening guidance relevance; companion continuity', 'Consent and legitimate use to deliver the service', 'Until account is deleted'],
                    ['Tell Mitra message text (encrypted at rest)', 'Understanding your context; routing to aligned support; companion continuity', 'Consent', 'Until account is deleted'],
                    ['Tell Mitra intent and routing signals (structured metadata)', 'Companion continuity; routing accuracy', 'Legitimate use to deliver the service', 'Until account is deleted'],
                    ['AI-processed intent signals (structured outputs from Bedrock)', 'Feature delivery', 'Legitimate use to deliver the service', 'Until account is deleted'],
                    ['Voice note audio (temporary)', 'Transcription to extract meaning', 'Consent (voice consent gate)', 'Deleted within 24 hours of upload'],
                    ['Voice note transcript', 'Companion continuity', 'Consent', 'Until account is deleted'],
                    ['Daily Rhythm, Inner Path, Rooms, Quick Chant activity', 'Practice continuity; personalized guidance', 'Legitimate use to deliver the service', 'Until account is deleted'],
                    ['Server logs, IP address', 'Security, fraud prevention, technical stability', 'Legitimate use to operate the service', 'Approximately 90 days'],
                  ].map(([data, purpose, basis, retention], i) => (
                    <tr key={i}>
                      <td style={TD}>{data}</td>
                      <td style={TD}>{purpose}</td>
                      <td style={TD}>{basis}</td>
                      <td style={TD}>{retention}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Section 3 */}
          <section style={{ marginBottom: '32px' }}>
            <h2 style={H2}>3. How We Use Your Personal Data</h2>
            <p style={P}>We use your personal data:</p>
            <ul style={UL}>
              {[
                'To create and maintain your account',
                'To deliver the KalpX Mitra companion service — rooms, rhythm, inner path, quick chant, quick reset, and Tell Mitra',
                'To send you companion reminders via push notification at times appropriate to your timezone and preferences',
                'To provide AI-assisted guidance features when feature flags are enabled (via AWS Bedrock, hosted by Amazon Web Services)',
                'To transcribe voice notes so Mitra can understand what you shared (audio deleted within 24 hours; transcript retained while your account is active)',
                'To improve the relevance and timing of notifications using your interaction patterns (not for advertising targeting)',
                'To diagnose technical issues and maintain service stability',
                'To respond to your privacy requests, corrections, and deletions',
              ].map((item, i) => <li key={i} style={LI}>{item}</li>)}
            </ul>
            <p style={{ ...P, fontWeight: 600 }}>What we do not do:</p>
            <p style={P}>We do not use your personal data to sell to third parties. We do not use Tell Mitra message text, voice transcripts, CompanionState content, crisis signals, emotional state labels, health information, or relationship content for advertising targeting, profiling, or behavioral advertising.</p>
            <p style={P}>We do not use your personal data to train our own AI models. We do not use personal data for any purpose not described in this notice without obtaining your separate consent.</p>
          </section>

          {/* Section 4 */}
          <section style={{ marginBottom: '32px' }}>
            <h2 style={H2}>4. Third-Party Service Providers</h2>
            <p style={P}>We share personal data only with service providers (Data Processors under DPDP) who process it solely to deliver our services. These providers are contractually bound to process data only for the stated purpose and to protect it appropriately.</p>
            <div style={{ overflowX: 'auto' }}>
              <table style={TABLE}>
                <thead>
                  <tr>
                    <th style={TH}>Service provider</th>
                    <th style={TH}>Purpose</th>
                    <th style={TH}>Data shared</th>
                    <th style={TH}>Location</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ['Amazon Web Services — EC2, S3, RDS', 'Hosting, storage, database', 'All user data at rest and in transit', 'United States (primary)'],
                    ['Amazon Web Services — Bedrock', 'AI text classification for Tell Mitra features', 'Text with direct identifiers filtered; or structured signals only — no account identifiers', 'United States (us-east-2 Ohio; Mumbai region not currently available)'],
                    ['Amazon Web Services — Transcribe', 'Voice note transcription', 'Audio data (deleted from AWS within 24 hours of transcription)', 'United States or AWS Mumbai region'],
                    ['Google Firebase (FCM)', 'Push notification delivery', 'FCM device token', 'United States'],
                    ['Apple APNs', 'iOS push notification delivery', 'APNs device token', 'Apple infrastructure'],
                    ['Google OAuth', 'Optional sign-in', 'Name, email', 'Initiated by user; Google\'s infrastructure'],
                    ['Apple Sign In', 'Optional sign-in', 'Name, email', 'Initiated by user; Apple\'s infrastructure'],
                  ].map(([provider, purpose, data, location], i) => (
                    <tr key={i}>
                      <td style={TD}>{provider}</td>
                      <td style={TD}>{purpose}</td>
                      <td style={TD}>{data}</td>
                      <td style={TD}>{location}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p style={P}>We do not share personal data with advertising platforms, data brokers, or marketing agencies for the purpose of targeting or profiling you.</p>
          </section>

          {/* Section 5 */}
          <section style={{ marginBottom: '32px' }}>
            <h2 style={H2}>5. Your Rights as a Data Principal</h2>
            <p style={P}>Under the Digital Personal Data Protection Act, 2023, you have the following rights:</p>

            <h3 style={H3}>5.1 Right to Access Information About Processing</h3>
            <p style={P}>You may request a summary of the personal data we hold about you, the purposes for which it is being processed, and any other Data Fiduciaries or Data Processors with whom your data has been shared.</p>
            <p style={P}><strong>How to exercise:</strong> Email privacy@kalpx.com with subject "Data Access Request — India." We will respond within 30 days.</p>

            <h3 style={H3}>5.2 Right to Correction and Completion</h3>
            <p style={P}>If the personal data we hold is inaccurate, incomplete, or outdated, you may request that it be corrected, completed, or updated.</p>
            <p style={P}><strong>How to exercise:</strong> Update your profile preferences in the app for profile data, or email privacy@kalpx.com with subject "Data Correction Request — India."</p>

            <h3 style={H3}>5.3 Right to Erasure</h3>
            <p style={P}>You may request that we erase personal data that is no longer necessary for the purposes for which it was collected, or where you have withdrawn consent and there is no other lawful basis for processing.</p>
            <p style={P}>Account deletion erases: your account credentials, profile, journey data, companion memory (CompanionState), encrypted Tell Mitra messages, notification tokens, voice transcripts, and activity history. Some records may be retained where required for legal, operational, or security purposes, but will not be associated with your account identifier.</p>
            <ul style={UL}>
              <li style={LI}><strong>In-app:</strong> Profile → Delete Account</li>
              <li style={LI}><strong>By email:</strong> privacy@kalpx.com with subject "Delete My Account — India"</li>
            </ul>
            <p style={P}>We process verified deletion requests within 30 days.</p>

            <h3 style={H3}>5.4 Right to Grievance Redressal</h3>
            <div style={CALLOUT}>
              <p style={{ margin: 0 }}>
                <strong>Grievance Officer:</strong> Taruna Chopra (Interim Privacy and Grievance Contact)<br />
                <strong>Contact:</strong> privacy@kalpx.com<br />
                <strong>Response:</strong> Acknowledge within 48 hours; substantive response within 30 days
              </p>
            </div>
            <p style={P}>If you are not satisfied with our response, you may escalate your complaint to the <strong>Data Protection Board of India</strong> through its official online portal. Current contact information for the Board can be found through the Ministry of Electronics and Information Technology website.</p>

            <h3 style={H3}>5.5 Right of Nomination</h3>
            <p style={P}>You may nominate another individual to exercise your Data Principal rights in the event of your death or incapacity. To exercise this right: email privacy@kalpx.com with subject "Nomination Request — India" with details of the nominee and the scope of nomination.</p>

            <h3 style={H3}>5.6 Right to Withdraw Consent</h3>
            <p style={P}>Where we process your personal data on the basis of your consent, you may withdraw that consent at any time. Withdrawal does not affect the lawfulness of processing prior to withdrawal.</p>
            <p style={P}><strong>Consent withdrawal options in-app:</strong></p>
            <ul style={UL}>
              <li style={LI}>Push notifications: Notifications section in app settings</li>
              <li style={LI}>Email communications: Notifications section in app settings</li>
              <li style={LI}>Voice consent: App settings (voice feature section)</li>
            </ul>
            <p style={P}>To withdraw all consent: email privacy@kalpx.com with subject "Consent Withdrawal — India." We will process consent withdrawal within 30 days. Note that withdrawal of consent to process data necessary for the core service may result in limited functionality or account closure.</p>
          </section>

          {/* Section 6 */}
          <section style={{ marginBottom: '32px' }}>
            <h2 style={H2}>6. Data Retention</h2>
            <p style={P}>We retain personal data only for as long as necessary for the stated purpose, consistent with DPDP's storage limitation principle.</p>
            <div style={{ overflowX: 'auto' }}>
              <table style={TABLE}>
                <thead>
                  <tr>
                    <th style={TH}>Data type</th>
                    <th style={TH}>Retention</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ['Account and profile data', 'Until account is deleted'],
                    ['CompanionState, Inner Path, Daily Rhythm, activity data', 'Until account is deleted'],
                    ['Tell Mitra encrypted messages and intent signals', 'Until account is deleted'],
                    ['Voice note audio', 'Deleted within 24 hours of upload'],
                    ['Voice note transcripts', 'Until account is deleted'],
                    ['Push notification tokens', 'Until push is disabled or account is deleted'],
                    ['Notification delivery receipts', 'Approximately 12 months, then deleted or aggregated'],
                    ['Server logs and IP address', 'Approximately 90 days'],
                    ['Security and audit logs (post-account deletion, identifiers redacted)', 'Up to 24 months, then deleted or aggregated'],
                    ['Backups', 'Backup copies may persist for 30–90 days through normal backup rotation'],
                  ].map(([type, retention], i) => (
                    <tr key={i}>
                      <td style={TD}>{type}</td>
                      <td style={TD}>{retention}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Section 7 */}
          <section style={{ marginBottom: '32px' }}>
            <h2 style={H2}>7. Cross-Border Data Transfers</h2>
            <p style={P}>KalpX is operated from the United States. Our cloud infrastructure is hosted by Amazon Web Services, primarily in US regions. When you use KalpX from India, your personal data is transferred to and processed in the United States.</p>
            <p style={P}>The DPDP Act, 2023 permits cross-border transfer of personal data to countries not specifically restricted by the Central Government of India. As of the date of this notice, no restricted countries list has been notified.</p>
            <p style={P}>We are evaluating whether AI classification features can be routed to the AWS Mumbai region for Indian users, which would keep that processing within India. We will update this notice if region-specific routing is implemented. For all transfers, your data is protected by our agreements with AWS and other service providers, which include data protection obligations consistent with applicable law.</p>
          </section>

          {/* Section 8 */}
          <section style={{ marginBottom: '32px' }}>
            <h2 style={H2}>8. Children and Minors in India</h2>
            <p style={P}>Under the DPDP Act, 2023, we are required to obtain verifiable consent of a parent or guardian before processing the personal data of a child (under 18 years of age) in India.</p>
            <p style={{ ...P, fontWeight: 600 }}>KalpX is currently available in India only for users 18 and older.</p>
            <p style={P}>We are working on a verified parental consent process for younger users. If you are under 18 and located in India, please do not create an account at this time.</p>
            <p style={P}>We do not use behavioral advertising, targeted ads, or ad platform data sharing for any user, including minors. No age-group data is sent to any external analytics or advertising platform.</p>
          </section>

          {/* Section 9 */}
          <section style={{ marginBottom: '32px' }}>
            <h2 style={H2}>9. Privacy Governance Program</h2>
            <p style={P}>KalpX is currently an early-stage service. We are implementing a privacy governance program appropriate for launch, and will expand it as our user base and regulatory exposure grow.</p>
            <p style={P}><strong>Current program:</strong></p>
            <ul style={UL}>
              <li style={LI}>Named interim Grievance Officer (Taruna Chopra, privacy@kalpx.com)</li>
              <li style={LI}>Privacy remediation log maintained internally</li>
              <li style={LI}>Data processor register maintained</li>
              <li style={LI}>Data flow documentation maintained</li>
              <li style={LI}>Deletion and data access request response runbook</li>
              <li style={LI}>Risk assessment covering Tell Mitra, voice, notifications, and Bedrock AI processing</li>
            </ul>
          </section>

          {/* Section 10 */}
          <section style={{ marginBottom: '32px' }}>
            <h2 style={H2}>10. Contact and Escalation</h2>
            <div style={CALLOUT}>
              <p style={{ margin: 0 }}>
                <strong>For all India privacy requests:</strong><br />
                privacy@kalpx.com<br />
                Subject line: [type of request] — India<br />
                Expected response: Within 30 days
              </p>
            </div>
            <div style={CALLOUT}>
              <p style={{ margin: 0 }}>
                <strong>Grievance Officer:</strong><br />
                Taruna Chopra (Interim Privacy and Grievance Contact)<br />
                privacy@kalpx.com<br />
                Response: 48-hour acknowledgement; 30-day substantive response
              </p>
            </div>
            <p style={P}><strong>Escalation — Data Protection Board of India:</strong> If you are not satisfied with our response to a grievance, you may escalate your complaint to the Data Protection Board of India through its official online portal. Current contact information for the Board can be found through the Ministry of Electronics and Information Technology website.</p>
            <p style={{ ...P, fontSize: 13, color: '#888' }}>
              This notice supplements the main{' '}
              <a href="/en/privacy" style={{ color: GOLD }}>KalpX Privacy Policy</a>.
              Both documents apply to users in India; this notice governs where they conflict.
            </p>
          </section>
        </div>
      </div>
    </AppShell>
  );
}
