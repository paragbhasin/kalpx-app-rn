import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageShell } from '../../components/PageShell';
import { useAuth } from '../../hooks/useAuth';
import { getJourneyStatus } from '../../engine/mitraApi';

export function MitraHomePage() {
  const navigate = useNavigate();
  const { authenticated, loading } = useAuth();

  useEffect(() => {
    if (loading) return;
    if (!authenticated) {
      navigate('/login', { replace: true });
      return;
    }
    getJourneyStatus().then((status) => {
      if (!status || !status.journey_id) {
        navigate('/en/mitra/start', { replace: true });
      } else {
        navigate('/en/mitra/dashboard', { replace: true });
      }
    });
  }, [authenticated, loading, navigate]);

  return (
    <PageShell centered>
      <p style={{ color: '#666' }}>Loading…</p>
    </PageShell>
  );
}
