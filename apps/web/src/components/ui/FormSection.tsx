import React from 'react';
import { SectionCard } from './SectionCard';

interface FormSectionProps {
  label?: string;
  children: React.ReactNode;
  mb?: number;
}

export function FormSection({ label, children, mb = 16 }: FormSectionProps) {
  return (
    <SectionCard mb={mb}>
      {label && (
        <p
          style={{
            fontSize: 13,
            fontWeight: 700,
            color: 'var(--kalpx-text)',
            marginBottom: 12,
            fontFamily: 'var(--kalpx-font-sans)',
            textTransform: 'uppercase',
            letterSpacing: 0.5,
          }}
        >
          {label}
        </p>
      )}
      {children}
    </SectionCard>
  );
}
