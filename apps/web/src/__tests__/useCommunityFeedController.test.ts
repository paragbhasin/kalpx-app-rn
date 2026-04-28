/**
 * Phase 13 — useCommunityFeedController unit tests.
 * All API calls injected via CommunityApiAdapter — no network.
 */

import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useCommunityFeedController } from '@kalpx/feature-flows';
import type { CommunityApiAdapter } from '@kalpx/feature-flows';

const mockPost = {
  id: 1,
  title: 'Test post',
  content: 'Body text',
  creator: { id: 10, username: 'priya' },
  created_at: '2026-05-01T10:00:00Z',
  upvote_count: 3,
  comment_count: 1,
};

const mockComment = {
  id: 101,
  content: 'Great post!',
  creator: { id: 20, username: 'ravi' },
};

function makeApi(overrides?: Partial<CommunityApiAdapter>): CommunityApiAdapter {
  return {
    getFeed: vi.fn().mockResolvedValue({ count: 1, next: null, results: [mockPost] }),
    getPost: vi.fn().mockResolvedValue(mockPost),
    getComments: vi.fn().mockResolvedValue({ count: 1, next: null, results: [mockComment] }),
    createComment: vi.fn().mockResolvedValue(mockComment),
    upvotePost: vi.fn().mockResolvedValue({ detail: 'Upvoted' }),
    createPost: vi.fn().mockResolvedValue({ ...mockPost, id: 99 }),
    ...overrides,
  };
}

describe('loadFeed', () => {
  it('populates posts on success', async () => {
    const api = makeApi();
    const { result } = renderHook(() => useCommunityFeedController({ api }));
    await act(async () => { await result.current.loadFeed(); });
    expect(result.current.posts).toHaveLength(1);
    expect(result.current.posts[0].content).toBe('Body text');
    expect(result.current.feedLoading).toBe(false);
  });

  it('sets feedError on failure', async () => {
    const api = makeApi({ getFeed: vi.fn().mockRejectedValue(new Error('net')) });
    const { result } = renderHook(() => useCommunityFeedController({ api }));
    await act(async () => { await result.current.loadFeed(); });
    expect(result.current.feedError).not.toBeNull();
  });

  it('resets feed list when reset=true', async () => {
    const api = makeApi();
    const { result } = renderHook(() => useCommunityFeedController({ api }));
    await act(async () => { await result.current.loadFeed(true); });
    await act(async () => { await result.current.loadFeed(true); });
    // Should still be 1 post (reset each time, not accumulate)
    expect(result.current.posts).toHaveLength(1);
  });

  it('sets hasMore when next is present', async () => {
    const api = makeApi({
      getFeed: vi.fn().mockResolvedValue({ count: 20, next: '/posts/?page=2', results: [mockPost] }),
    });
    const { result } = renderHook(() => useCommunityFeedController({ api }));
    await act(async () => { await result.current.loadFeed(); });
    expect(result.current.hasMore).toBe(true);
  });
});

describe('loadPost', () => {
  it('sets post on success', async () => {
    const api = makeApi();
    const { result } = renderHook(() => useCommunityFeedController({ api }));
    await act(async () => { await result.current.loadPost(1); });
    expect(result.current.post?.id).toBe(1);
  });

  it('sets postError when post not found', async () => {
    const api = makeApi({ getPost: vi.fn().mockResolvedValue(null) });
    const { result } = renderHook(() => useCommunityFeedController({ api }));
    await act(async () => { await result.current.loadPost(999); });
    expect(result.current.postError).toBe('Post not found.');
  });
});

describe('loadComments', () => {
  it('populates comments', async () => {
    const api = makeApi();
    const { result } = renderHook(() => useCommunityFeedController({ api }));
    await act(async () => { await result.current.loadComments(1); });
    expect(result.current.comments).toHaveLength(1);
    expect(result.current.comments[0].content).toBe('Great post!');
  });
});

describe('upvotePost (auth-gated)', () => {
  it('calls API when authenticated', async () => {
    const api = makeApi();
    const isAuthenticated = vi.fn().mockResolvedValue(true);
    const { result } = renderHook(() =>
      useCommunityFeedController({ api, isAuthenticated }),
    );
    await act(async () => {
      await result.current.loadFeed();
      await result.current.upvotePost(1);
    });
    expect((api.upvotePost as any)).toHaveBeenCalledWith(1);
  });

  it('calls onRequireAuth when not authenticated', async () => {
    const api = makeApi();
    const isAuthenticated = vi.fn().mockResolvedValue(false);
    const onRequireAuth = vi.fn();
    const { result } = renderHook(() =>
      useCommunityFeedController({ api, isAuthenticated, onRequireAuth }),
    );
    await act(async () => { await result.current.upvotePost(1, '/en/community/1'); });
    expect(onRequireAuth).toHaveBeenCalledWith('/en/community/1');
    expect((api.upvotePost as any)).not.toHaveBeenCalled();
  });

  it('optimistically increments upvote_count in feed', async () => {
    const api = makeApi();
    const { result } = renderHook(() => useCommunityFeedController({ api }));
    await act(async () => {
      await result.current.loadFeed();
      await result.current.upvotePost(1);
    });
    const updatedPost = result.current.posts.find((p) => p.id === 1);
    expect(updatedPost?.upvote_count).toBe(4); // was 3
  });
});

describe('submitComment (auth-gated)', () => {
  it('adds comment to list on success', async () => {
    const api = makeApi();
    const isAuthenticated = vi.fn().mockResolvedValue(true);
    const { result } = renderHook(() => useCommunityFeedController({ api, isAuthenticated }));
    await act(async () => {
      await result.current.submitComment(1, 'Great post!');
    });
    expect(result.current.comments).toHaveLength(1);
  });

  it('calls onRequireAuth when not authenticated', async () => {
    const api = makeApi();
    const isAuthenticated = vi.fn().mockResolvedValue(false);
    const onRequireAuth = vi.fn();
    const { result } = renderHook(() =>
      useCommunityFeedController({ api, isAuthenticated, onRequireAuth }),
    );
    await act(async () => {
      await result.current.submitComment(1, 'Hello', '/en/community/1');
    });
    expect(onRequireAuth).toHaveBeenCalledWith('/en/community/1');
    expect((api.createComment as any)).not.toHaveBeenCalled();
  });

  it('sends content field (not body) to API', async () => {
    const api = makeApi();
    const isAuthenticated = vi.fn().mockResolvedValue(true);
    const { result } = renderHook(() => useCommunityFeedController({ api, isAuthenticated }));
    await act(async () => {
      await result.current.submitComment(1, 'My comment');
    });
    expect((api.createComment as any).mock.calls[0][0]).toMatchObject({
      post: 1,
      content: 'My comment',
    });
  });
});

describe('submitPost (auth-gated)', () => {
  it('prepends new post to feed', async () => {
    const api = makeApi();
    const isAuthenticated = vi.fn().mockResolvedValue(true);
    const { result } = renderHook(() => useCommunityFeedController({ api, isAuthenticated }));
    await act(async () => {
      await result.current.loadFeed();
      await result.current.submitPost({ content: 'New post' });
    });
    expect(result.current.posts[0].id).toBe(99); // newly created post prepended
  });

  it('calls onRequireAuth when not authenticated', async () => {
    const api = makeApi();
    const isAuthenticated = vi.fn().mockResolvedValue(false);
    const onRequireAuth = vi.fn();
    const { result } = renderHook(() =>
      useCommunityFeedController({ api, isAuthenticated, onRequireAuth }),
    );
    await act(async () => {
      await result.current.submitPost({ content: 'test' });
    });
    expect(onRequireAuth).toHaveBeenCalled();
  });
});

describe('reset', () => {
  it('clears all state', async () => {
    const api = makeApi();
    const { result } = renderHook(() => useCommunityFeedController({ api }));
    await act(async () => {
      await result.current.loadFeed();
      result.current.reset();
    });
    expect(result.current.posts).toHaveLength(0);
    expect(result.current.comments).toHaveLength(0);
  });
});
