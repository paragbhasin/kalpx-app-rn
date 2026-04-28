import React from 'react';
import { useNavigate } from 'react-router-dom';
import type { ClassListing } from '@kalpx/types';

interface ClassCardProps {
  cls: ClassListing;
}

export function ClassCard({ cls }: ClassCardProps) {
  const navigate = useNavigate();
  const price = cls.pricing?.per_person?.amount?.app ?? cls.pricing?.per_person?.amount?.web;
  const currency = cls.pricing?.currency ?? 'INR';

  return (
    <div
      onClick={() => navigate(`/en/classes/${cls.slug}`)}
      style={{
        background: 'var(--kalpx-card-bg)',
        border: '1px solid var(--kalpx-border-gold)',
        borderRadius: 14,
        overflow: 'hidden',
        cursor: 'pointer',
        marginBottom: 14,
        boxShadow: 'var(--kalpx-shadow-card-lift)',
        touchAction: 'manipulation',
        transition: 'box-shadow 0.15s',
      }}
    >
      {cls.cover_media?.url && (
        <img
          src={cls.cover_media.url}
          alt={cls.title}
          style={{ width: '100%', height: 160, objectFit: 'cover', display: 'block' }}
        />
      )}
      <div style={{ padding: '12px 16px 16px' }}>
        {cls.category && (
          <p style={{ fontSize: 11, color: 'var(--kalpx-cta)', fontWeight: 600, marginBottom: 4, textTransform: 'uppercase', letterSpacing: 0.5 }}>
            {cls.category}
          </p>
        )}
        <p style={{ fontSize: 17, fontWeight: 700, color: 'var(--kalpx-text)', marginBottom: 4, lineHeight: 1.3 }}>
          {cls.title}
        </p>
        {cls.tutor?.name && (
          <p style={{ fontSize: 13, color: 'var(--kalpx-text-soft)', marginBottom: 8 }}>
            with {cls.tutor.name}
          </p>
        )}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 4 }}>
          <div style={{ display: 'flex', gap: 8 }}>
            {cls.duration_minutes && (
              <span style={{ fontSize: 12, color: '#999', background: '#f8f4ef', borderRadius: 6, padding: '2px 8px' }}>
                {cls.duration_minutes} min
              </span>
            )}
            {cls.skill_level && (
              <span style={{ fontSize: 12, color: '#999', background: '#f8f4ef', borderRadius: 6, padding: '2px 8px' }}>
                {cls.skill_level}
              </span>
            )}
          </div>
          {price != null && (
            <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--kalpx-text)' }}>
              {currency} {price}
            </p>
          )}
        </div>
        {cls.pricing?.trial?.enabled && cls.pricing.trial.amount != null && (
          <p style={{ fontSize: 12, color: 'var(--kalpx-cta)', marginTop: 6 }}>
            Trial available: {currency} {cls.pricing.trial.amount}
          </p>
        )}
      </div>
    </div>
  );
}
