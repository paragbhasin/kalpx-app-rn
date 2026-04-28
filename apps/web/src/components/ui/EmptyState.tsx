import React from 'react';
import { KalpXButton } from './KalpXButton';

interface EmptyStateAction {
  label: string;
  onClick: () => void;
}

interface EmptyStateProps {
  icon?: string;
  message: string;
  subtext?: string;
  action?: EmptyStateAction;
}

export function EmptyState({ icon = '🪔', message, subtext, action }: EmptyStateProps) {
  return (
    <div
      style={{
        padding: '48px 24px',
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 8,
      }}
    >
      <span style={{ fontSize: 36, lineHeight: 1 }}>{icon}</span>
      <p
        style={{
          fontSize: 15,
          color: 'var(--kalpx-text-soft)',
          lineHeight: 1.55,
          margin: 0,
          fontFamily: 'var(--kalpx-font-sans)',
        }}
      >
        {message}
      </p>
      {subtext && (
        <p
          style={{
            fontSize: 13,
            color: 'var(--kalpx-text-muted)',
            margin: 0,
            fontFamily: 'var(--kalpx-font-sans)',
          }}
        >
          {subtext}
        </p>
      )}
      {action && (
        <KalpXButton
          variant="primary"
          size="md"
          onClick={action.onClick}
          style={{ marginTop: 8 }}
        >
          {action.label}
        </KalpXButton>
      )}
    </div>
  );
}
