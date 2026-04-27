import React from 'react';
import { useParams } from 'react-router-dom';
import { PageShell } from '../../components/PageShell';

export function CheckpointPage() {
  const { day } = useParams<{ day: string }>();
  return (
    <PageShell centered>
      <div style={{ padding: 32, textAlign: 'center' }}>
        <p style={{ color: '#888' }}>Checkpoint day {day} — Phase 9</p>
      </div>
    </PageShell>
  );
}
