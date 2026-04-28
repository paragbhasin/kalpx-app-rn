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
    <div style={{ background: '#fff', border: '1px solid #f0e8d8', borderRadius: 14, overflow: 'hidden', marginBottom: 14 }}>
      <SkeletonBox h={160} mb={0} radius={0} />
      <div style={{ padding: '12px 16px 16px' }}>
        <SkeletonBox w="30%" h={11} mb={6} />
        <SkeletonBox w="80%" h={20} mb={6} />
        <SkeletonBox w="40%" h={14} mb={12} />
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <SkeletonBox w="25%" h={12} />
          <SkeletonBox w="20%" h={16} />
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
