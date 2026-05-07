import React from 'react';

function SkeletonBox({ w = '100%', h = 16, mb = 8, radius = 6 }: { w?: string | number; h?: number; mb?: number; radius?: number }) {
  return (
    <div
      style={{
        width: w,
        height: h,
        borderRadius: radius,
        background: '#f0e8d8',
        marginBottom: mb,
        animation: 'pulse 1.5s ease-in-out infinite',
      }}
    />
  );
}

export function ClassCardSkeleton() {
  return (
    <div
      style={{
        background: 'var(--kalpx-card-bg)',
        border: '1px solid var(--kalpx-border-gold)',
        borderRadius: 22,
        marginBottom: 22,
        boxShadow: '0 10px 22px rgba(67, 33, 4, 0.08)',
        padding: '22px 24px',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 20 }}>
        <div style={{ flex: 1 }}>
          <SkeletonBox w="68%" h={24} mb={12} radius={8} />
          <SkeletonBox w="22%" h={28} mb={12} radius={10} />
          <SkeletonBox w="44%" h={16} mb={0} radius={8} />
        </div>
        <div style={{ width: 110, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <SkeletonBox w="80%" h={22} mb={0} radius={8} />
        </div>
      </div>
    </div>
  );
}

export function ClassDetailSkeleton() {
  return (
    <div>
      <SkeletonBox h={220} mb={0} radius={0} />
      <div style={{ padding: '20px 16px' }}>
        <SkeletonBox w="40%" h={12} mb={8} />
        <SkeletonBox w="90%" h={28} mb={8} />
        <SkeletonBox w="50%" h={16} mb={20} />
        <SkeletonBox w="100%" h={14} mb={6} />
        <SkeletonBox w="95%" h={14} mb={6} />
        <SkeletonBox w="80%" h={14} mb={24} />
        <SkeletonBox w="40%" h={48} radius={12} />
      </div>
    </div>
  );
}
