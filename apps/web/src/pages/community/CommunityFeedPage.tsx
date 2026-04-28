import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { isAuthenticated } from '@kalpx/auth';
import { webStorage } from '../../lib/webStorage';
import { useCommunityFeedController } from '@kalpx/feature-flows';
import {
  getCommunityFeed,
  getCommunityPost,
  getCommunityComments,
  createCommunityComment,
  upvotePost,
  createCommunityPost,
} from '../../engine/communityApi';
import { CommunityPostCard } from '../../components/community/CommunityPostCard';
import { CommunityFeedSkeleton } from '../../components/community/CommunityFeedSkeleton';
import { CommunityEmptyState } from '../../components/community/CommunityEmptyState';
import { CommunityErrorState } from '../../components/community/CommunityErrorState';

const communityApi = {
  getFeed: getCommunityFeed,
  getPost: getCommunityPost,
  getComments: getCommunityComments,
  createComment: createCommunityComment,
  upvotePost,
  createPost: createCommunityPost,
};

export function CommunityFeedPage() {
  const navigate = useNavigate();

  const ctrl = useCommunityFeedController({
    api: communityApi,
    isAuthenticated: () => isAuthenticated(webStorage),
    onRequireAuth: (returnPath) => {
      const to = encodeURIComponent(returnPath ?? '/en/community');
      navigate(`/login?returnTo=${to}`);
    },
  });

  useEffect(() => {
    void ctrl.loadFeed(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div style={{ minHeight: '100dvh', background: 'var(--kalpx-bg)' }}>
      <div style={{ maxWidth: 480, margin: '0 auto', paddingBottom: 40 }}>
        {/* Header */}
        <div style={{ padding: '28px 16px 12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <p style={{ fontSize: 13, color: 'var(--kalpx-cta)', fontWeight: 600, marginBottom: 2 }}>KalpX</p>
            <h1 style={{ fontSize: 26, fontWeight: 800, color: 'var(--kalpx-text)' }}>Community</h1>
          </div>
          <button
            onClick={() => navigate('/en/community/new')}
            style={{
              padding: '9px 18px', borderRadius: 10,
              background: 'var(--kalpx-cta)', color: '#fff',
              border: 'none', fontSize: 14, fontWeight: 600, cursor: 'pointer',
            }}
          >
            + Post
          </button>
        </div>

        <div style={{ padding: '0 16px' }}>
          {ctrl.feedLoading && <CommunityFeedSkeleton />}

          {!ctrl.feedLoading && ctrl.feedError && (
            <CommunityErrorState message={ctrl.feedError} onRetry={() => void ctrl.loadFeed(true)} />
          )}

          {!ctrl.feedLoading && !ctrl.feedError && ctrl.posts.length === 0 && (
            <CommunityEmptyState showCreateCta />
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {ctrl.posts.map((post) => (
              <CommunityPostCard
                key={post.id}
                post={post}
                onUpvote={(id) => void ctrl.upvotePost(id, `/en/community/${id}`)}
                isUpvoting={ctrl.upvotingId === post.id}
              />
            ))}
          </div>

          {ctrl.hasMore && !ctrl.feedLoading && (
            <div style={{ textAlign: 'center', padding: '12px 0' }}>
              <button
                onClick={() => void ctrl.loadMore()}
                style={{
                  padding: '10px 28px', borderRadius: 10,
                  background: 'var(--kalpx-chip-bg)', color: 'var(--kalpx-text)',
                  border: 'none', fontSize: 14, fontWeight: 600, cursor: 'pointer',
                }}
              >
                Load more
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
