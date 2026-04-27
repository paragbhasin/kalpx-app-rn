/**
 * communityApi — Community / Social Feed endpoints.
 * Endpoints confirmed from RN apps/mobile/src/screens/{Feed,Social,PostDetail}/actions.ts.
 *
 * All responses are snake_case.
 * Post text field: "content" (not "body").
 * Author field: "creator" (not "author").
 * Pagination: { count, next, previous, results: [] }
 */

import { api } from '../lib/api';
import type {
  CommunityPost,
  CommunityFeedResponse,
  CommunityComment,
  CommunityCommentsResponse,
  CreateCommunityPostRequest,
  CreateCommentRequest,
  UpvoteResponse,
} from '@kalpx/types';

/** Normalise any feed response shape into a canonical CommunityFeedResponse. */
function normaliseFeedResponse(data: any): CommunityFeedResponse {
  if (!data) return { count: 0, next: null, results: [] };
  // Array (some explore endpoints return raw array)
  if (Array.isArray(data)) return { count: data.length, next: null, results: data };
  // Paginated
  return {
    count: data.count ?? data.results?.length ?? 0,
    next: data.next ?? null,
    previous: data.previous ?? null,
    results: data.results ?? data.posts ?? [],
  };
}

/** Normalise any comments response shape. */
function normaliseCommentsResponse(data: any): CommunityCommentsResponse {
  if (!data) return { count: 0, next: null, results: [] };
  if (Array.isArray(data)) return { count: data.length, next: null, results: data };
  return {
    count: data.count ?? 0,
    next: data.next ?? null,
    results: data.results ?? data.comments ?? [],
  };
}

// ── Feed ──────────────────────────────────────────────────────────────────────

export async function getCommunityFeed(params?: {
  sort?: 'hot' | 'new' | 'top';
  page?: number;
  page_size?: number;
  community?: string;
  lang?: string;
}): Promise<CommunityFeedResponse> {
  try {
    const res = await api.get('posts/', {
      params: { sort: 'hot', page_size: 10, ...params, t: Date.now() },
    });
    return normaliseFeedResponse(res.data);
  } catch (err: any) {
    console.warn('[communityApi] getCommunityFeed failed:', err?.message);
    return { count: 0, next: null, results: [] };
  }
}

export async function getExplorePosts(): Promise<CommunityFeedResponse> {
  try {
    const res = await api.get('public/explore-posts/');
    return normaliseFeedResponse(res.data);
  } catch (err: any) {
    console.warn('[communityApi] getExplorePosts failed:', err?.message);
    return { count: 0, next: null, results: [] };
  }
}

// ── Post detail ───────────────────────────────────────────────────────────────

export async function getCommunityPost(postId: number | string): Promise<CommunityPost | null> {
  try {
    const res = await api.get(`posts/${encodeURIComponent(String(postId))}/`);
    return res.data as CommunityPost;
  } catch (err: any) {
    if (err?.response?.status === 404) return null;
    console.warn('[communityApi] getCommunityPost failed:', err?.message);
    return null;
  }
}

// ── Create post ───────────────────────────────────────────────────────────────

export async function createCommunityPost(
  payload: CreateCommunityPostRequest,
): Promise<CommunityPost | null> {
  try {
    const res = await api.post('posts/', payload);
    return res.data as CommunityPost;
  } catch (err: any) {
    console.warn('[communityApi] createCommunityPost failed:', err?.message);
    throw err;
  }
}

// ── Upvote ────────────────────────────────────────────────────────────────────

export async function upvotePost(postId: number | string): Promise<UpvoteResponse | null> {
  try {
    const res = await api.post(`posts/${encodeURIComponent(String(postId))}/upvote/`, {});
    return res.data as UpvoteResponse;
  } catch (err: any) {
    console.warn('[communityApi] upvotePost failed:', err?.message);
    return null;
  }
}

// ── Comments ──────────────────────────────────────────────────────────────────

export async function getCommunityComments(
  postId: number | string,
  params?: { page?: number; lang?: string },
): Promise<CommunityCommentsResponse> {
  try {
    const res = await api.get('comments/', {
      params: { post: postId, page_size: 20, ...params, t: Date.now() },
    });
    return normaliseCommentsResponse(res.data);
  } catch (err: any) {
    console.warn('[communityApi] getCommunityComments failed:', err?.message);
    return { count: 0, next: null, results: [] };
  }
}

export async function createCommunityComment(
  payload: CreateCommentRequest,
): Promise<CommunityComment | null> {
  try {
    const res = await api.post('comments/', payload);
    return res.data as CommunityComment;
  } catch (err: any) {
    console.warn('[communityApi] createCommunityComment failed:', err?.message);
    throw err;
  }
}
