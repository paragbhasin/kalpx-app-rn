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
import type { UserProfile } from '../types/auth';

export interface CommunityListItem {
  id: number | string;
  slug?: string;
  name?: string;
  description?: string;
  weekly_visitors?: string | number;
  is_followed?: boolean;
  [key: string]: any;
}

export interface CommunityListResponse {
  count: number;
  next: string | null;
  previous?: string | null;
  results: CommunityListItem[];
}

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

function normaliseCommunityListResponse(data: any): CommunityListResponse {
  if (!data) return { count: 0, next: null, results: [] };
  if (Array.isArray(data)) {
    return { count: data.length, next: null, previous: null, results: data };
  }
  return {
    count: data.count ?? data.results?.length ?? 0,
    next: data.next ?? null,
    previous: data.previous ?? null,
    results: data.results ?? data.communities ?? [],
  };
}

const explorePostsRequests = new Map<string, Promise<CommunityFeedResponse>>();

// ── Feed ──────────────────────────────────────────────────────────────────────

export async function getCommunityFeed(params?: {
  sort?: 'hot' | 'new' | 'top';
  page?: number;
  page_size?: number;
  community?: string;
  lang?: string;
}): Promise<CommunityFeedResponse> {
  try {
    const res = await api.get('posts/personalized_feed/', {
      params: { sort: 'hot', page_size: 10, ...params, t: Date.now() },
    });
    return normaliseFeedResponse(res.data);
  } catch (err: any) {
    console.warn('[communityApi] getCommunityFeed failed:', err?.message);
    return { count: 0, next: null, results: [] };
  }
}

export async function getPopularPosts(params?: {
  sort?: 'hot' | 'new' | 'top';
  page?: number;
  page_size?: number;
  community?: string;
  lang?: string;
}): Promise<CommunityFeedResponse> {
  try {
    const res = await api.get('posts/', {
      params: { sort: 'top', page: 1, page_size: 10, ...params, t: Date.now() },
    });
    return normaliseFeedResponse(res.data);
  } catch (err: any) {
    console.warn('[communityApi] getPopularPosts failed:', err?.message);
    return { count: 0, next: null, results: [] };
  }
}

export async function getCommunities(params?: {
  page?: number;
  page_size?: number;
  q?: string;
  lang?: string;
}): Promise<CommunityListResponse> {
  try {
    const res = await api.get('communities/', {
      params: { page: 1, page_size: 12, ...params, t: Date.now() },
    });
    return normaliseCommunityListResponse(res.data);
  } catch (err: any) {
    console.warn('[communityApi] getCommunities failed:', err?.message);
    return { count: 0, next: null, results: [] };
  }
}

export async function getTopCommunities(params?: {
  page?: number;
  page_size?: number;
  lang?: string;
}): Promise<CommunityListResponse> {
  try {
    const res = await api.get('communities/top/', {
      params: { page: 1, page_size: 12, ...params, t: Date.now() },
    });
    const data = normaliseCommunityListResponse(res.data);
    return {
      ...data,
      results: data.results.map((community, index) => ({
        ...community,
        rank: (Number(params?.page ?? 1) - 1) * Number(params?.page_size ?? 12) + index + 1,
      })),
    };
  } catch (err: any) {
    console.warn('[communityApi] getTopCommunities failed:', err?.message);
    return { count: 0, next: null, results: [] };
  }
}

export async function followCommunity(idOrSlug: number | string): Promise<boolean> {
  try {
    await api.post(`communities/${encodeURIComponent(String(idOrSlug))}/follow/`, {});
    return true;
  } catch (err: any) {
    console.warn('[communityApi] followCommunity failed:', err?.message);
    return false;
  }
}

export async function unfollowCommunity(idOrSlug: number | string): Promise<boolean> {
  try {
    await api.post(`communities/${encodeURIComponent(String(idOrSlug))}/unfollow/`, {});
    return true;
  } catch (err: any) {
    console.warn('[communityApi] unfollowCommunity failed:', err?.message);
    return false;
  }
}

export async function getFollowedCommunities(): Promise<CommunityListItem[]> {
  try {
    const res = await api.get('my/activity/followed_communities/');
    const data = res.data?.results ?? res.data ?? [];
    if (!Array.isArray(data)) return [];

    return data
      .map((item: any) => {
        const community = item.community || item;
        const slug =
          community.slug ||
          community.community_slug ||
          (typeof item === 'string' ? item : null);
        const id =
          community.id ||
          community.community_id ||
          community.community;

        if (!slug && !id) return null;
        return {
          ...community,
          slug,
          id: String(id ?? slug),
          is_followed: true,
        } as CommunityListItem;
      })
      .filter(Boolean) as CommunityListItem[];
  } catch (err: any) {
    console.warn('[communityApi] getFollowedCommunities failed:', err?.message);
    return [];
  }
}

export async function getExplorePosts(params?: {
  page?: number;
  page_size?: number;
  lang?: string;
  paginate?: boolean;
}): Promise<CommunityFeedResponse> {
  const requestParams = {
    paginate: true,
    page: 1,
    page_size: 10,
    ...params,
  };
  const requestKey = JSON.stringify(requestParams);
  const inFlightRequest = explorePostsRequests.get(requestKey);
  if (inFlightRequest) return inFlightRequest;

  const request = (async () => {
  try {
    const res = await api.get('public/explore-posts/', {
      params: requestParams,
    });
    return normaliseFeedResponse(res.data);
  } catch (err: any) {
    console.warn('[communityApi] getExplorePosts failed:', err?.message);
    return { count: 0, next: null, results: [] };
  } finally {
    explorePostsRequests.delete(requestKey);
  }
  })();

  explorePostsRequests.set(requestKey, request);
  return request;
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

export async function saveCommunityPost(postId: number | string): Promise<boolean> {
  try {
    await api.post(`posts/${encodeURIComponent(String(postId))}/save/`, {});
    return true;
  } catch (err: any) {
    console.warn('[communityApi] saveCommunityPost failed:', err?.message);
    return false;
  }
}

export async function unsaveCommunityPost(postId: number | string): Promise<boolean> {
  try {
    await api.post(`posts/${encodeURIComponent(String(postId))}/unsave/`, {});
    return true;
  } catch (err: any) {
    console.warn('[communityApi] unsaveCommunityPost failed:', err?.message);
    return false;
  }
}

export async function hideCommunityPost(postId: number | string): Promise<boolean> {
  try {
    await api.post(`posts/${encodeURIComponent(String(postId))}/hide/`, {});
    return true;
  } catch (err: any) {
    console.warn('[communityApi] hideCommunityPost failed:', err?.message);
    return false;
  }
}

export async function reportCommunityContent(
  contentType: 'post' | 'comment',
  contentId: number | string,
  reason: string,
  details = '',
): Promise<boolean> {
  try {
    await api.post('reports/', {
      content_type: contentType,
      content_id: contentId,
      reason,
      details,
    });
    return true;
  } catch (err: any) {
    console.warn('[communityApi] reportCommunityContent failed:', err?.message);
    return false;
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

export async function updateCommunityComment(
  commentId: number | string,
  content: string,
): Promise<CommunityComment | null> {
  try {
    const res = await api.patch(`comments/${encodeURIComponent(String(commentId))}/`, {
      content,
    });
    return res.data as CommunityComment;
  } catch (err: any) {
    console.warn('[communityApi] updateCommunityComment failed:', err?.message);
    throw err;
  }
}

export async function deleteCommunityComment(
  commentId: number | string,
): Promise<boolean> {
  try {
    await api.delete(`comments/${encodeURIComponent(String(commentId))}/`);
    return true;
  } catch (err: any) {
    console.warn('[communityApi] deleteCommunityComment failed:', err?.message);
    throw err;
  }
}

export async function getCommunityCurrentUser(): Promise<UserProfile | null> {
  try {
    const res = await api.get('me/');
    return res.data as UserProfile;
  } catch (err: any) {
    console.warn('[communityApi] getCommunityCurrentUser failed:', err?.message);
    return null;
  }
}
