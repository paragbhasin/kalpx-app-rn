import React from 'react';

function Box({ w = '100%', h = 14, mb = 6, radius = 6 }: { w?: string | number; h?: number; mb?: number; radius?: number }) {
  return (
    <div
      style={{
        width: w, height: h, borderRadius: radius,
        background: '#f0e8d8', marginBottom: mb,
        animation: 'pulse 1.5s ease-in-out infinite',
      }}
    />
  );
}

function PostCardSkeleton() {
  return (
    <div style={{ background: '#fff', border: '1px solid #f0e8d8', borderRadius: 14, padding: '14px 16px', marginBottom: 12 }}>
      <div style={{ display: 'flex', gap: 10, marginBottom: 10 }}>
        <Box w={34} h={34} radius={17} mb={0} />
        <div style={{ flex: 1 }}>
          <Box w="40%" h={13} mb={4} />
          <Box w="25%" h={11} mb={0} />
        </div>
      </div>
      <Box w="75%" h={18} mb={6} />
      <Box w="100%" h={14} mb={4} />
      <Box w="90%" h={14} mb={12} />
      <div style={{ display: 'flex', gap: 16 }}>
        <Box w={40} h={12} mb={0} />
        <Box w={40} h={12} mb={0} />
      </div>
    </div>
  );
}

export function CommunityFeedSkeleton({ count = 4 }: { count?: number }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => <PostCardSkeleton key={i} />)}
    </>
  );
}
