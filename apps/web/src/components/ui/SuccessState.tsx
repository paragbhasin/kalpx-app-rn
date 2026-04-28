import React from 'react';
import { Link } from 'react-router-dom';
import { SectionCard } from './SectionCard';

interface SuccessStateAction {
  label: string;
  to?: string;
  onClick?: () => void;
}

interface SuccessStateProps {
  icon?: string;
  heading: string;
  message?: string;
  action?: SuccessStateAction;
}

export function SuccessState({ icon = '✓', heading, message, action }: SuccessStateProps) {
  return (
    <SectionCard style={{ textAlign: 'center', padding: 32 }}>
      <div
        style={{
          width: 48,
          height: 48,
          borderRadius: '50%',
          background: 'var(--kalpx-chip-bg)',
          border: '1px solid var(--kalpx-border-gold)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 20,
          margin: '0 auto 16px',
          color: 'var(--kalpx-gold)',
          fontFamily: 'var(--kalpx-font-sans)',
          fontWeight: 600,
        }}
      >
        {icon}
      </div>
      <p
        style={{
          fontSize: 18,
          fontWeight: 700,
          color: 'var(--kalpx-text)',
          fontFamily: 'var(--kalpx-font-serif)',
          marginBottom: 8,
        }}
      >
        {heading}
      </p>
      {message && (
        <p style={{ fontSize: 14, color: 'var(--kalpx-text-soft)', marginBottom: 20, fontFamily: 'var(--kalpx-font-sans)' }}>
          {message}
        </p>
      )}
      {action && (
        action.to ? (
          <Link
            to={action.to}
            style={{ fontSize: 14, color: 'var(--kalpx-cta)', fontWeight: 600, fontFamily: 'var(--kalpx-font-sans)' }}
          >
            {action.label}
          </Link>
        ) : (
          <button
            onClick={action.onClick}
            style={{
              fontSize: 14,
              color: 'var(--kalpx-cta)',
              fontWeight: 600,
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontFamily: 'var(--kalpx-font-sans)',
            }}
          >
            {action.label}
          </button>
        )
      )}
    </SectionCard>
  );
}
