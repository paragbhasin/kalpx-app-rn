import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function InnerPathStubPage() {
  const navigate = useNavigate();
  return (
    <div style={{ padding: '2rem', textAlign: 'center' }}>
      <h2>Inner Path — Coming Soon</h2>
      <button onClick={() => navigate('/en/mitra')}>Back</button>
    </div>
  );
}
