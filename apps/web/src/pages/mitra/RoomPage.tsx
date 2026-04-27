import React from 'react';
import { useParams } from 'react-router-dom';
import { PageShell } from '../../components/PageShell';

export function RoomPage() {
  const { roomId } = useParams<{ roomId: string }>();
  return (
    <PageShell centered>
      <div style={{ padding: 32, textAlign: 'center' }}>
        <p style={{ color: '#888' }}>Room: {roomId} — Phase 8</p>
      </div>
    </PageShell>
  );
}
