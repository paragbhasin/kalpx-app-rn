import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { isAuthenticated as checkAuth } from '@kalpx/auth';
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
import { getPostText, getPostAuthor } from '@kalpx/types';
import { CommunityAuthorRow } from '../../components/community/CommunityAuthorRow';
import { CommunityMediaGrid } from '../../components/community/CommunityMediaGrid';
import { CommunityReactionBar } from '../../components/community/CommunityReactionBar';
import { CommunityCommentList } from '../../components/community/CommunityCommentList';
import { CommunityCommentComposer } from '../../components/community/CommunityCommentComposer';
import { CommunityErrorState } from '../../components/community/CommunityErrorState';

const communityApi = {
  getFeed: getCommunityFeed,
  getPost: getCommunityPost,
  getComments: getCommunityComments,
  createComment: createCommunityComment,
  upvotePost,
  createPost: createCommunityPost,
};

export function CommunityPostDetailPage() {
  const { postId } = useParams<{ postId: string }>();
  const navigate = useNavigate();
  const [authed, setAuthed] = useState(false);

  useEffect(() => {
    checkAuth(webStorage).then(setAuthed);
  }, []);

  const ctrl = useCommunityFeedController({
    api: communityApi,
    isAuthenticated: () => checkAuth(webStorage),
    onRequireAuth: (returnPath) => {
      const to = encodeURIComponent(returnPath ?? `/en/community/${postId}`);
      navigate(`/login?returnTo=${to}`);
    },
  });

  useEffect(() => {
    if (!postId) return;
    void ctrl.loadPost(postId);
    void ctrl.loadComments(postId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [postId]);

  const post = ctrl.post;
  const text = post ? getPostText(post) : '';
  const author = post ? getPostAuthor(post) : undefined;

  if (ctrl.postLoading) {
    return (
      <div style={{ minHeight: '100dvh', background: '#FFF8EF' }}>
        <div style={{ maxWidth: 480, margin: '0 auto', padding: '28px 16px' }}>
          <div style={{ width: 60, height: 14, borderRadius: 4, background: '#f0e8d8', marginBottom: 24, animation: 'pulse 1.5s ease-in-out infinite' }} />
          <div style={{ width: '85%', height: 22, borderRadius: 4, background: '#f0e8d8', marginBottom: 10, animation: 'pulse 1.5s ease-in-out infinite' }} />
          <div style={{ width: '70%', height: 14, borderRadius: 4, background: '#f0e8d8', animation: 'pulse 1.5s ease-in-out infinite' }} />
        </div>
      </div>
    );
  }

  if (ctrl.postError || !post) {
    return (
      <div style={{ minHeight: '100dvh', background: '#FFF8EF' }}>
        <div style={{ maxWidth: 480, margin: '0 auto', padding: '28px 16px' }}>
          <button onClick={() => navigate('/en/community')} style={backBtn}>← Community</button>
          <CommunityErrorState message={ctrl.postError ?? 'Post not found.'} />
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100dvh', background: '#FFF8EF' }}>
      <div style={{ maxWidth: 480, margin: '0 auto', padding: '20px 16px 60px' }}>
        <button onClick={() => navigate('/en/community')} style={backBtn}>← Community</button>

        {/* Post */}
        <div style={{ background: '#fff', border: '1px solid #f0e8d8', borderRadius: 14, padding: '16px', marginTop: 16, marginBottom: 20 }}>
          <CommunityAuthorRow author={author} timestamp={post.created_at} />

          {post.community_name && (
            <p style={{ fontSize: 11, color: 'var(--kalpx-cta)', fontWeight: 600, marginTop: 8 }}>
              {post.community_name}
            </p>
          )}

          {post.title && (
            <h2 style={{ fontSize: 20, fontWeight: 700, color: '#2d1a0e', marginTop: 8, lineHeight: 1.35 }}>
              {post.title}
            </h2>
          )}

          {text && (
            <p style={{ fontSize: 14, color: '#3a2010', lineHeight: 1.65, marginTop: 8 }}>
              {text}
            </p>
          )}

          <CommunityMediaGrid mediaUrl={post.media_url} images={post.images} title={post.title} />

          <CommunityReactionBar
            upvoteCount={post.upvote_count ?? post.likes_count}
            commentCount={post.comment_count ?? ctrl.comments.length}
            isUpvoting={ctrl.upvotingId === post.id}
            onUpvote={() => void ctrl.upvotePost(post.id, `/en/community/${post.id}`)}
          />
        </div>

        {/* Comments */}
        <div>
          <p style={{ fontSize: 14, fontWeight: 700, color: '#2d1a0e', marginBottom: 12 }}>
            Comments {ctrl.comments.length > 0 ? `(${ctrl.comments.length})` : ''}
          </p>

          <div style={{ marginBottom: 20 }}>
            <CommunityCommentComposer
              postId={post.id}
              isAuthenticated={authed}
              submitting={ctrl.commentSubmitting}
              error={ctrl.commentError}
              onSubmit={(content) => {
                void ctrl.submitComment(post.id, content, `/en/community/${post.id}`);
              }}
              onRequireAuth={() => {
                const to = encodeURIComponent(`/en/community/${post.id}`);
                navigate(`/login?returnTo=${to}`);
              }}
            />
          </div>

          <CommunityCommentList comments={ctrl.comments} loading={ctrl.commentsLoading} />
        </div>
      </div>
    </div>
  );
}

const backBtn: React.CSSProperties = {
  background: 'none', border: 'none', color: 'var(--kalpx-cta)',
  fontSize: 14, cursor: 'pointer', padding: 0,
};
