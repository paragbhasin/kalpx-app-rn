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

export interface CommunityGlobalSearchResult {
  communities: any[];
  posts: any[];
  users: any[];
}

export type CommunityActivityType =
  | 'upvotes'
  | 'downvotes'
  | 'my_posts'
  | 'my_questions'
  | 'my_comments'
  | 'followed_communities'
  | 'explore_posts'
  | 'feed'
  | 'saved_posts'
  | 'hidden_posts'
  | 'useful_marks'
  | 'stats';

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

function mergeCommunityMetadata(
  primary: CommunityListItem[],
  fallback: CommunityListItem[],
): CommunityListItem[] {
  if (!primary.length || !fallback.length) return primary;

  const fallbackByKey = new Map<string, CommunityListItem>();
  for (const community of fallback) {
    fallbackByKey.set(String(community.id), community);
    if (community.slug) {
      fallbackByKey.set(`slug:${String(community.slug).toLowerCase()}`, community);
    }
  }

  return primary.map((community) => {
    const fallbackMatch =
      fallbackByKey.get(String(community.id)) ||
      (community.slug
        ? fallbackByKey.get(`slug:${String(community.slug).toLowerCase()}`)
        : undefined);

    if (!fallbackMatch) return community;

    return {
      ...fallbackMatch,
      ...community,
      description: community.description || fallbackMatch.description,
      media_url: community.media_url || fallbackMatch.media_url,
      follower_count:
        community.follower_count ??
        fallbackMatch.follower_count ??
        fallbackMatch.followers?.length,
      post_count: community.post_count ?? fallbackMatch.post_count,
    };
  });
}

const explorePostsRequests = new Map<string, Promise<CommunityFeedResponse>>();
const TOP_COMMUNITIES_TTL_MS = 5 * 60 * 1000;
const topCommunitiesCache = new Map<
  string,
  { ts: number; value: CommunityListResponse }
>();
const topCommunitiesRequests = new Map<string, Promise<CommunityListResponse>>();

function getTopCommunitiesCacheKey(params?: {
  page?: number;
  page_size?: number;
  lang?: string;
}) {
  return JSON.stringify({
    page: Number(params?.page ?? 1),
    page_size: Number(params?.page_size ?? 12),
    lang: params?.lang || "en",
  });
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
  const cacheKey = getTopCommunitiesCacheKey(params);
  const cached = topCommunitiesCache.get(cacheKey);
  if (cached && Date.now() - cached.ts < TOP_COMMUNITIES_TTL_MS) {
    return cached.value;
  }

  const inFlight = topCommunitiesRequests.get(cacheKey);
  if (inFlight) return inFlight;

  const request = (async () => {
  try {
      const res = await api.get('communities/top/', {
        params: { page: 1, page_size: 12, ...params, t: Date.now() },
      });
      const data = normaliseCommunityListResponse(res.data);
      let results = data.results;

      if (results.some((community) => !community.description || !community.media_url)) {
        const allCommunities = await getCommunities({
          page: Number(params?.page ?? 1),
          page_size: Number(params?.page_size ?? 12),
          lang: params?.lang,
        });
        results = mergeCommunityMetadata(results, allCommunities.results);
      }

      const value = {
        ...data,
        results: results.map((community, index) => ({
          ...community,
          rank:
            (Number(params?.page ?? 1) - 1) *
              Number(params?.page_size ?? 12) +
            index +
            1,
        })),
      };
      topCommunitiesCache.set(cacheKey, { ts: Date.now(), value });
      return value;
  } catch (err: any) {
      console.warn('[communityApi] getTopCommunities failed:', err?.message);
      return { count: 0, next: null, results: [] };
    } finally {
      topCommunitiesRequests.delete(cacheKey);
    }
  })();

  topCommunitiesRequests.set(cacheKey, request);
  return request;
}

export async function getCommunityDetail(
  slug: string,
  params?: { lang?: string },
): Promise<CommunityListItem | null> {
  try {
    const res = await api.get(`communities/${encodeURIComponent(slug)}/`, {
      params: { ...params, t: Date.now() },
    });
    return (res.data ?? null) as CommunityListItem | null;
  } catch (err: any) {
    if (err?.response?.status === 404) return null;
    console.warn('[communityApi] getCommunityDetail failed:', err?.message);
    return null;
  }
}

export async function getCommunityPosts(params?: {
  page?: number;
  page_size?: number;
  community: string;
  sort?: 'hot' | 'new' | 'top';
  lang?: string;
}): Promise<CommunityFeedResponse> {
  try {
    const res = await api.get('posts/', {
      params: {
        page: 1,
        page_size: 10,
        sort: 'new',
        ...params,
        t: Date.now(),
      },
    });
    return normaliseFeedResponse(res.data);
  } catch (err: any) {
    console.warn('[communityApi] getCommunityPosts failed:', err?.message);
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

export async function updateCommunityPost(
  postId: number | string,
  payload: CreateCommunityPostRequest,
): Promise<CommunityPost | null> {
  try {
    const res = await api.patch(`posts/${encodeURIComponent(String(postId))}/`, payload);
    return res.data as CommunityPost;
  } catch (err: any) {
    console.warn('[communityApi] updateCommunityPost failed:', err?.message);
    throw err;
  }
}

export async function uploadCommunityMedia(file: {
  name: string;
  type: string;
  size: number;
  blob: File;
}): Promise<{ publicUrl: string; key: string }> {
  const presignRes = await api.post('media/presign/', {
    type: 'post_gallery',
    filename: file.name || `image_${Date.now()}.jpg`,
    contentType: file.type || 'image/jpeg',
    size: file.size || 0,
  });

  const { url, fields, publicUrl, key } = presignRes.data;
  const formData = new FormData();
  Object.entries(fields || {}).forEach(([k, v]) => {
    formData.append(k, String(v));
  });
  formData.append('file', file.blob, file.name);

  const response = await fetch(url, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    throw new Error('S3 Upload failed');
  }

  return { publicUrl, key };
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

export async function unhideCommunityPost(postId: number | string): Promise<boolean> {
  try {
    await api.post(`posts/${encodeURIComponent(String(postId))}/unhide/`, {});
    return true;
  } catch (err: any) {
    console.warn('[communityApi] unhideCommunityPost failed:', err?.message);
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
  params?: { page?: number; lang?: string; is_question?: boolean },
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

export async function getCommunityProfileDetails(): Promise<any | null> {
  try {
    const res = await api.get('users/profile/profile_details/');
    return res.data?.data ?? res.data ?? null;
  } catch (err: any) {
    console.warn('[communityApi] getCommunityProfileDetails failed:', err?.message);
    return null;
  }
}

export async function getCommunityActivity(
  type: CommunityActivityType,
): Promise<any[]> {
  try {
    const endpointMap: Record<CommunityActivityType, string> = {
      upvotes: 'my/activity/upvotes/',
      downvotes: 'my/activity/downvotes/',
      my_posts: 'my/activity/my_posts/',
      my_questions: 'my/activity/my_questions/',
      my_comments: 'my/activity/my_comments/',
      followed_communities: 'my/activity/followed_communities/',
      explore_posts: 'my/activity/explore_posts/',
      feed: 'my/activity/feed/',
      saved_posts: 'my/activity/saved_posts/',
      hidden_posts: 'my/activity/hidden_posts/',
      useful_marks: 'my/activity/useful_marks/',
      stats: 'my/activity/stats/',
    };

    const res = await api.get(endpointMap[type]);
    let data = res.data?.results ?? res.data ?? [];

    if (type === 'my_comments' && Array.isArray(data)) {
      data = data
        .filter(
          (item: any) =>
            item.is_question === false || item.comment?.is_question === false,
        )
        .map((item: any) => {
          const post = item.post || item.comment?.post;
          if (!post) return item;
          return {
            ...post,
            _activity_id: item.id,
            comment: item.comment || item,
            commented_at: item.created_at,
            is_comment_activity: true,
          };
        });
    } else if (type === 'followed_communities' && Array.isArray(data)) {
      data = data
        .map((item: any) => {
          const community = item.community || item;
          const slug =
            community.slug ||
            community.community_slug ||
            (typeof item === 'string' ? item : null);
          const id =
            community.id || community.community_id || community.community;

          if (slug || id) {
            return { ...community, slug, id: String(id ?? slug) };
          }
          return null;
        })
        .filter(Boolean);
    } else if (type === 'saved_posts' && Array.isArray(data)) {
      data = data.map((item: any) =>
        item.post
          ? {
              ...item.post,
              _activity_id: item.id,
              saved_at: item.created_at,
              is_saved: true,
            }
          : item,
      );
    } else if (type === 'hidden_posts' && Array.isArray(data)) {
      data = data.map((item: any) =>
        item.post
          ? {
              ...item.post,
              _activity_id: item.id,
              hidden_at: item.created_at,
              is_hidden: true,
            }
          : item,
      );
    } else if (type === 'useful_marks' && Array.isArray(data)) {
      data = data.map((item: any) =>
        item.comment?.post
          ? {
              ...item.comment.post,
              _activity_id: item.id,
              comment: item.comment,
              marked_useful_at: item.created_at,
              is_useful_mark: true,
            }
          : item,
      );
    }

    return Array.isArray(data) ? data : [data];
  } catch (err: any) {
    console.warn(`[communityApi] getCommunityActivity(${type}) failed:`, err?.message);
    return [];
  }
}

export async function getCommunityGlobalSearch(
  query: string,
  options?: { community?: string; signal?: AbortSignal },
): Promise<CommunityGlobalSearchResult> {
  if (!query.trim()) {
    return { communities: [], posts: [], users: [] };
  }

  try {
    const params: Record<string, string> = { q: query };
    if (options?.community) params.community = options.community;

    const res = await api.get('community-search/global_search/', {
      params,
      signal: options?.signal,
    });

    return {
      communities: res.data?.communities || [],
      posts: res.data?.posts || [],
      users: res.data?.users || [],
    };
  } catch (err: any) {
    if (err?.name === 'CanceledError' || err?.name === 'AbortError') {
      throw err;
    }
    console.warn('[communityApi] getCommunityGlobalSearch failed:', err?.message);
    return { communities: [], posts: [], users: [] };
  }
}
