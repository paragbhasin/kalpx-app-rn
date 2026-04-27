/**
 * Phase 13 guardrail — communityApi response-shape normalization.
 * Verifies that feed/comments normalizers handle both paginated { results }
 * and raw array shapes, and that endpoints call the right URLs.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../lib/api', () => ({
  api: { get: vi.fn(), post: vi.fn() },
}));

import { getCommunityFeed, getCommunityPost, getCommunityComments, createCommunityComment, upvotePost } from '../engine/communityApi';
import { api } from '../lib/api';

const mockPost = {
  id: 1,
  title: 'Test post',
  content: 'Body text',
  creator: { id: 10, username: 'priya', profile_name: 'Priya' },
  created_at: '2026-05-01T10:00:00Z',
  upvote_count: 5,
  comment_count: 2,
};

const mockComment = {
  id: 101,
  content: 'Nice post',
  creator: { id: 20, username: 'ravi' },
  created_at: '2026-05-01T11:00:00Z',
};

beforeEach(() => { vi.clearAllMocks(); });

describe('getCommunityFeed', () => {
  it('returns normalised feed from paginated { results } response', async () => {
    (api.get as any).mockResolvedValueOnce({
      data: { count: 1, next: null, previous: null, results: [mockPost] },
    });
    const result = await getCommunityFeed();
    expect(result.results).toHaveLength(1);
    expect(result.results![0].content).toBe('Body text');
    expect(result.count).toBe(1);
  });

  it('handles raw array response defensively', async () => {
    (api.get as any).mockResolvedValueOnce({ data: [mockPost, mockPost] });
    const result = await getCommunityFeed();
    expect(result.results).toHaveLength(2);
    expect(result.count).toBe(2);
  });

  it('returns empty feed on network error (non-throwing)', async () => {
    (api.get as any).mockRejectedValueOnce(new Error('net'));
    const result = await getCommunityFeed();
    expect(result.results).toEqual([]);
    expect(result.count).toBe(0);
  });

  it('calls posts/ endpoint with sort=hot', async () => {
    (api.get as any).mockResolvedValueOnce({ data: { count: 0, next: null, results: [] } });
    await getCommunityFeed({ sort: 'hot' });
    expect((api.get as any).mock.calls[0][0]).toBe('posts/');
    expect((api.get as any).mock.calls[0][1].params.sort).toBe('hot');
  });
});

describe('getCommunityPost', () => {
  it('returns post on success', async () => {
    (api.get as any).mockResolvedValueOnce({ data: mockPost });
    const result = await getCommunityPost(1);
    expect(result?.id).toBe(1);
    expect((api.get as any).mock.calls[0][0]).toBe('posts/1/');
  });

  it('returns null on 404', async () => {
    (api.get as any).mockRejectedValueOnce({ response: { status: 404 } });
    const result = await getCommunityPost(999);
    expect(result).toBeNull();
  });
});

describe('getCommunityComments', () => {
  it('returns comments from paginated response', async () => {
    (api.get as any).mockResolvedValueOnce({
      data: { count: 1, next: null, results: [mockComment] },
    });
    const result = await getCommunityComments(1);
    expect(result.results).toHaveLength(1);
    expect(result.results![0].content).toBe('Nice post');
  });

  it('calls comments/ with post param', async () => {
    (api.get as any).mockResolvedValueOnce({ data: { count: 0, results: [] } });
    await getCommunityComments(42);
    expect((api.get as any).mock.calls[0][1].params.post).toBe(42);
  });

  it('returns empty on error (non-throwing)', async () => {
    (api.get as any).mockRejectedValueOnce(new Error('net'));
    const result = await getCommunityComments(1);
    expect(result.results).toEqual([]);
  });
});

describe('createCommunityComment', () => {
  it('sends wire payload to comments/ and returns comment', async () => {
    (api.post as any).mockResolvedValueOnce({ data: mockComment });
    const result = await createCommunityComment({ post: 1, content: 'Nice post' });
    expect((api.post as any).mock.calls[0][0]).toBe('comments/');
    expect((api.post as any).mock.calls[0][1]).toMatchObject({ post: 1, content: 'Nice post' });
    expect(result?.content).toBe('Nice post');
  });
});

describe('upvotePost', () => {
  it('calls posts/:id/upvote/', async () => {
    (api.post as any).mockResolvedValueOnce({ data: { detail: 'Upvoted' } });
    const result = await upvotePost(1);
    expect((api.post as any).mock.calls[0][0]).toBe('posts/1/upvote/');
    expect(result?.detail).toBe('Upvoted');
  });

  it('returns null on error (non-throwing)', async () => {
    (api.post as any).mockRejectedValueOnce(new Error('net'));
    const result = await upvotePost(1);
    expect(result).toBeNull();
  });
});
