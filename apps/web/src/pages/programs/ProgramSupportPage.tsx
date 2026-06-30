import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { AppShell } from '../../components/ui/AppShell';
import { useTranslation } from '../../lib/i18n';

// All 9 founder-approved FAQ scenarios (Decision 2: support trap prevention)
function buildFaqs(code: string | null, t: (key: string) => string): { question: string; answer: React.ReactNode }[] {
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
      question: t('programSupport.q1'),
      answer: (
        <>
          {t('programSupport.a1Main')}
          {code && (
            <>
              {' '}{t('programSupport.inviteCodeIs')} {codeEl}
            </>
          )}
        </>
      ),
    },
    {
      question: t('programSupport.q2'),
      answer: (
        <>
          {t('programSupport.a2Prefix')} <strong>{t('programSupport.haveInviteCodeLabel')}</strong>{' '}
          {t('programSupport.a2Suffix')} {codeEl}
        </>
      ),
    },
    {
      question: t('programSupport.q3'),
      answer: (
        <>
          {t('programSupport.a3')}{' '}
          <a href="mailto:support@kalpx.com" style={{ color: 'var(--kalpx-gold)' }}>{t('programSupport.contactSupport')}</a>.
        </>
      ),
    },
    {
      question: t('programSupport.q4'),
      answer: (
        <>
          {t('programSupport.inviteCodeIs')} {codeEl}. {t('programSupport.a4Suffix')}{' '}
          <strong>{t('programSupport.haveInviteCodeLabel')}</strong>
        </>
      ),
    },
    {
      question: t('programSupport.q5'),
      answer: (
        <>
          {t('programSupport.a5Prefix')} <strong>{t('programSupport.openKalpXLabel')}</strong>{' '}
          {t('programSupport.a5Mid')}{' '}
          {codeEl} {t('programSupport.a5Suffix')} <strong>{t('programSupport.haveInviteCodeLabel')}</strong>
        </>
      ),
    },
    {
      question: t('programSupport.q6'),
      answer: (
        <>
          {t('programSupport.a6')}{' '}
          <a href="mailto:support@kalpx.com" style={{ color: 'var(--kalpx-gold)' }}>{t('programSupport.contactSupport')}</a>.
        </>
      ),
    },
    {
      question: t('programSupport.q7'),
      answer: (
        <>
          {t('programSupport.a7')}
        </>
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
  const { t } = useTranslation();

  const faqs = buildFaqs(code, t);

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
            {t('programSupport.poweredBy')}
          </p>
          <h1 style={{ fontSize: 22, fontWeight: 600, color: 'var(--kalpx-text)', marginBottom: 8 }}>
            {t('programSupport.heading')}
          </h1>
          {code && (
            <p style={{ fontSize: 14, color: 'var(--kalpx-text-soft)' }}>
              {t('programSupport.yourInviteCode')} <strong style={{ fontFamily: 'monospace', fontSize: 16 }}>{code}</strong>
            </p>
          )}
        </div>

        {/* FAQ Accordion */}
        <section aria-label={t('programSupport.faqSectionLabel')}>
          {faqs.map((faq, i) => (
            <FaqItem key={i} question={faq.question} answer={faq.answer} index={i} />
          ))}
        </section>

      </main>
    </AppShell>
  );
}
