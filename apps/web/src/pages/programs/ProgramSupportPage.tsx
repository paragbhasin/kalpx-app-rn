import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { AppShell } from '../../components/ui/AppShell';

// All 9 founder-approved FAQ scenarios (Decision 2: support trap prevention)
function buildFaqs(code: string | null): { question: string; answer: React.ReactNode }[] {
  const displayCode = code || 'your code';
  const codeEl = code ? (
    <strong style={{ fontFamily: 'monospace', background: 'var(--kalpx-chip-bg)', padding: '2px 6px', borderRadius: 4 }}>
      {code}
    </strong>
  ) : (
    <em>your invite code</em>
  );

  return [
    {
      question: 'I cannot open the link',
      answer: (
        <>
          Try opening the link in your phone&apos;s browser (Chrome or Safari). If the link still
          doesn&apos;t open, enter your invite code directly in the KalpX app.
          {code && (
            <>
              {' '}Your invite code is: {codeEl}
            </>
          )}
        </>
      ),
    },
    {
      question: 'I downloaded the app but cannot find the program',
      answer: (
        <>
          Open KalpX and look for <strong>&quot;Have an invite code?&quot;</strong> on the home screen.
          Enter your code: {codeEl}
        </>
      ),
    },
    {
      question: 'My OTP is not working',
      answer: (
        <>
          Wait 30 seconds and request a new OTP. If the problem continues,{' '}
          <a href="#contact-support" style={{ color: 'var(--kalpx-gold)' }}>contact support</a> using the button below.
        </>
      ),
    },
    {
      question: 'I scanned the QR but nothing happened',
      answer: (
        <>
          Your invite code is: {codeEl}. Open the KalpX app and enter this code under{' '}
          <strong>&quot;Have an invite code?&quot;</strong>
        </>
      ),
    },
    {
      question: 'I already have the KalpX app',
      answer: (
        <>
          Tap the <strong>&quot;Open KalpX&quot;</strong> button on the program page, or enter code{' '}
          {codeEl} in the app under <strong>&quot;Have an invite code?&quot;</strong>
        </>
      ),
    },
    {
      question: 'I joined but Day 1 is not showing',
      answer: (
        <>
          Close and reopen the app. If Day 1 still doesn&apos;t appear,{' '}
          <a href="#contact-support" style={{ color: 'var(--kalpx-gold)' }}>contact support</a>.
        </>
      ),
    },
    {
      question: 'I missed Day 1',
      answer: (
        <>
          No problem — the program waits for you. Open the app and continue when you&apos;re ready.
        </>
      ),
    },
    {
      question: 'Can I restart the program?',
      answer: (
        <>
          Contact support and we&apos;ll help.{' '}
          <a href="#contact-support" style={{ color: 'var(--kalpx-gold)' }}>Contact support</a>
        </>
      ),
    },
    {
      question: 'How do I enter my invite code?',
      answer: (
        <ol style={{ margin: '8px 0 0', paddingLeft: 20, lineHeight: 1.8 }}>
          <li>Open KalpX.</li>
          <li>On the home screen, tap <strong>&quot;Have an invite code?&quot;</strong></li>
          <li>Enter {codeEl}</li>
          <li>Tap Join.</li>
        </ol>
      ),
    },
  ];
}

function FaqItem({ question, answer, index }: { question: string; answer: React.ReactNode; index: number }) {
  const [open, setOpen] = useState(false);
  const qId = `faq-q-${index}`;
  const aId = `faq-a-${index}`;

  return (
    <div
      style={{
        borderBottom: '1px solid var(--kalpx-border)',
        padding: '0',
      }}
    >
      <button
        id={qId}
        aria-expanded={open}
        aria-controls={aId}
        onClick={() => setOpen(o => !o)}
        style={{
          width: '100%',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: 'none',
          border: 'none',
          padding: '16px 0',
          cursor: 'pointer',
          textAlign: 'left',
          color: 'var(--kalpx-text)',
          fontSize: 15,
          fontWeight: open ? 600 : 400,
        }}
      >
        <span>{question}</span>
        <span aria-hidden style={{ fontSize: 18, color: 'var(--kalpx-gold)', marginLeft: 12, flexShrink: 0 }}>
          {open ? '−' : '+'}
        </span>
      </button>
      {open && (
        <div
          id={aId}
          role="region"
          aria-labelledby={qId}
          style={{
            paddingBottom: 16,
            color: 'var(--kalpx-text-soft)',
            fontSize: 14,
            lineHeight: 1.7,
          }}
        >
          {answer}
        </div>
      )}
    </div>
  );
}

export function ProgramSupportPage() {
  const [params] = useSearchParams();
  const code = params.get('code') || null;
  const supportUrl = params.get('support_url') || null;
  const supportLabel = params.get('support_label') || null;

  const faqs = buildFaqs(code);

  const safeContactUrl = (() => {
    const raw = supportUrl;
    if (!raw) return 'https://kalpx.com/support';
    // Allowlist https:// and mailto: only (security: prevent javascript: injection)
    if (raw.startsWith('https://') || raw.startsWith('mailto:')) return raw;
    return 'https://kalpx.com/support';
  })();

  return (
    <AppShell>
      <main style={{ maxWidth: 640, margin: '0 auto', padding: '32px 20px 64px' }}>
        {/* Header */}
        <div style={{ marginBottom: 32 }}>
          <p style={{ fontSize: 12, color: 'var(--kalpx-text-muted)', marginBottom: 8 }}>
            Powered by KalpX
          </p>
          <h1 style={{ fontSize: 22, fontWeight: 600, color: 'var(--kalpx-text)', marginBottom: 8 }}>
            Need help joining?
          </h1>
          {code && (
            <p style={{ fontSize: 14, color: 'var(--kalpx-text-soft)' }}>
              Your invite code: <strong style={{ fontFamily: 'monospace', fontSize: 16 }}>{code}</strong>
            </p>
          )}
        </div>

        {/* FAQ Accordion */}
        <section aria-label="Frequently asked questions">
          {faqs.map((faq, i) => (
            <FaqItem key={i} question={faq.question} answer={faq.answer} index={i} />
          ))}
        </section>

        {/* Contact support */}
        <div
          id="contact-support"
          style={{
            marginTop: 40,
            padding: 24,
            background: 'var(--kalpx-card-bg)',
            border: '1px solid var(--kalpx-border)',
            borderRadius: 'var(--kalpx-r-lg)',
            textAlign: 'center',
          }}
        >
          <p style={{ marginBottom: 16, color: 'var(--kalpx-text-soft)', fontSize: 14 }}>
            Still need help? Our support team will assist you.
          </p>
          <a
            href={safeContactUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Contact KalpX support"
            style={{
              display: 'inline-block',
              padding: '12px 28px',
              background: 'var(--kalpx-cta)',
              color: 'var(--kalpx-cta-text)',
              borderRadius: 'var(--kalpx-r-md)',
              fontWeight: 600,
              fontSize: 15,
              textDecoration: 'none',
            }}
          >
            {supportLabel || 'Contact KalpX support'}
          </a>
        </div>
      </main>
    </AppShell>
  );
}
