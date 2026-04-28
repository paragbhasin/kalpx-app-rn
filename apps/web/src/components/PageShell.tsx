import React from 'react';
import { AppShell } from './ui/AppShell';

interface PageShellProps {
  children: React.ReactNode;
  centered?: boolean;
}

export function PageShell({ children, centered = false }: PageShellProps) {
  return (
    <AppShell
      style={{
        alignItems: centered ? 'center' : undefined,
        justifyContent: centered ? 'center' : undefined,
      }}
    >
      {children}
    </AppShell>
  );
}
