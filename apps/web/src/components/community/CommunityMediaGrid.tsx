import React from 'react';

interface CommunityMediaGridProps {
  mediaUrl?: string | null;
  images?: string[];
  title?: string;
}

export function CommunityMediaGrid({ mediaUrl, images, title }: CommunityMediaGridProps) {
  const urls: string[] = [];
  if (images && images.length > 0) {
    urls.push(...images);
  } else if (mediaUrl) {
    urls.push(mediaUrl);
  }

  if (urls.length === 0) return null;

  if (urls.length === 1) {
    return (
      <img
        src={urls[0]}
        alt={title ?? 'Post image'}
        style={{
          width: '100%', borderRadius: 10, objectFit: 'cover',
          maxHeight: 320, display: 'block', marginTop: 10,
        }}
        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
      />
    );
  }

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: urls.length === 2 ? '1fr 1fr' : 'repeat(3, 1fr)',
        gap: 4, borderRadius: 10, overflow: 'hidden', marginTop: 10,
      }}
    >
      {urls.slice(0, 3).map((url, i) => (
        <img
          key={i}
          src={url}
          alt={title ?? `Post image ${i + 1}`}
          style={{ width: '100%', aspectRatio: '1', objectFit: 'cover', display: 'block' }}
          onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
        />
      ))}
    </div>
  );
}
