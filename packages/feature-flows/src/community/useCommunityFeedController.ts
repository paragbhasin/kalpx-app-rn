/**
 * useCommunityFeedController — headless controller for Community / Social Feed.
 * NO react-native, react-router, DOM APIs, AsyncStorage, localStorage, expo-*.
 * All platform behaviour is injected via CommunityApiAdapter and callbacks.
 */

import { useState, useCallback } from 'react';
import type {
  CommunityPost,
  CommunityComment,
  CommunityFeedResponse,
  CommunityCommentsResponse,
  CreateCommunityPostRequest,
  CreateCommentRequest,
} from '@kalpx/types';

export interface CommunityApiAdapter {
  getFeed(params?: Record<string, any>): Promise<CommunityFeedResponse>;
  getPost(postId: number | string): Promise<CommunityPost | null>;
  getComments(postId: number | string, params?: Record<string, any>): Promise<CommunityCommentsResponse>;
  createComment(payload: CreateCommentRequest): Promise<CommunityComment | null>;
  upvotePost?(postId: number | string): Promise<{ detail?: string } | null>;
  downvotePost?(postId: number | string): Promise<{ detail?: string } | null>;
  createPost?(payload: CreateCommunityPostRequest): Promise<CommunityPost | null>;
}

export interface UseCommunityFeedControllerOptions {
  api: CommunityApiAdapter;
  isAuthenticated?: () => Promise<boolean>;
  onRequireAuth?: (returnPath?: string) => void;
}

export interface UseCommunityFeedControllerResult {
  // Feed
  posts: CommunityPost[];
  feedLoading: boolean;
  feedError: string | null;
  hasMore: boolean;
  loadFeed: (reset?: boolean) => Promise<void>;
  loadMore: () => Promise<void>;

  // Post detail
  post: CommunityPost | null;
  postLoading: boolean;
  postError: string | null;
  loadPost: (postId: number | string) => Promise<void>;

  // Comments
  comments: CommunityComment[];
  commentsLoading: boolean;
  loadComments: (postId: number | string) => Promise<void>;

  // Upvote (auth-gated)
  upvotingId: number | string | null;
  upvotePost: (postId: number | string, returnPath?: string) => Promise<void>;
  downvotePost: (postId: number | string, returnPath?: string) => Promise<void>;

  // Create comment (auth-gated)
  commentSubmitting: boolean;
  commentError: string | null;
  submitComment: (postId: number | string, content: string, returnPath?: string) => Promise<CommunityComment | null>;

  // Create post (auth-gated)
  postSubmitting: boolean;
  postSubmitError: string | null;
  submitPost: (payload: CreateCommunityPostRequest, returnPath?: string) => Promise<CommunityPost | null>;

  reset: () => void;
}

export function useCommunityFeedController({
  api,
  isAuthenticated,
  onRequireAuth,
}: UseCommunityFeedControllerOptions): UseCommunityFeedControllerResult {
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [feedLoading, setFeedLoading] = useState(false);
  const [feedError, setFeedError] = useState<string | null>(null);
  const [nextPage, setNextPage] = useState<number>(1);
  const [hasMore, setHasMore] = useState(false);

  const [post, setPost] = useState<CommunityPost | null>(null);
  const [postLoading, setPostLoading] = useState(false);
  const [postError, setPostError] = useState<string | null>(null);

  const [comments, setComments] = useState<CommunityComment[]>([]);
  const [commentsLoading, setCommentsLoading] = useState(false);

  const [upvotingId, setUpvotingId] = useState<number | string | null>(null);

  const [commentSubmitting, setCommentSubmitting] = useState(false);
  const [commentError, setCommentError] = useState<string | null>(null);

  const [postSubmitting, setPostSubmitting] = useState(false);
  const [postSubmitError, setPostSubmitError] = useState<string | null>(null);

  const applyVoteChange = useCallback(
    (target: CommunityPost | null, voteType: 'upvote' | 'downvote') => {
      if (!target) return target;

      const currentVote = target.user_vote ?? 0;
      let nextVote: -1 | 0 | 1 = 0;
      let countChange = 0;

      if (voteType === 'upvote') {
        if (currentVote === 1) {
          nextVote = 0;
          countChange = -1;
        } else if (currentVote === -1) {
          nextVote = 1;
          countChange = 2;
        } else {
          nextVote = 1;
          countChange = 1;
        }
      } else if (currentVote === -1) {
        nextVote = 0;
        countChange = 1;
      } else if (currentVote === 1) {
        nextVote = -1;
        countChange = -2;
      } else {
        nextVote = -1;
        countChange = -1;
      }

      return {
        ...target,
        user_vote: nextVote,
        upvote_count: Math.max(0, (target.upvote_count ?? 0) + countChange),
      };
    },
    [],
  );

  const loadFeed = useCallback(async (reset = true) => {
    const page = reset ? 1 : nextPage;
    if (reset) {
      setFeedLoading(true);
      setFeedError(null);
    }
    try {
      const data = await api.getFeed({ page, page_size: 10 });
      const incoming = data.results ?? [];
      setPosts((prev: CommunityPost[]) => reset ? incoming : [...prev, ...incoming]);
      setHasMore(!!data.next);
      setNextPage(reset ? 2 : page + 1);
    } catch {
      setFeedError('Could not load feed. Please try again.');
    } finally {
      if (reset) setFeedLoading(false);
    }
  }, [api, nextPage]);

  const loadMore = useCallback(async () => {
    if (!hasMore || feedLoading) return;
    await loadFeed(false);
  }, [hasMore, feedLoading, loadFeed]);

  const loadPost = useCallback(async (postId: number | string) => {
    setPostLoading(true);
    setPostError(null);
    try {
      const data = await api.getPost(postId);
      if (!data) {
        setPostError('Post not found.');
      } else {
        setPost(data);
      }
    } catch {
      setPostError('Could not load post.');
    } finally {
      setPostLoading(false);
    }
  }, [api]);

  const loadComments = useCallback(async (postId: number | string) => {
    setCommentsLoading(true);
    try {
      const data = await api.getComments(postId);
      setComments(data.results ?? []);
    } catch {
      setComments([]);
    } finally {
      setCommentsLoading(false);
    }
  }, [api]);

  const upvotePost = useCallback(async (postId: number | string, returnPath?: string) => {
    if (isAuthenticated) {
      const ok = await isAuthenticated();
      if (!ok) {
        onRequireAuth?.(returnPath);
        return;
      }
    }
    if (!api.upvotePost) return;
    setUpvotingId(postId);
    try {
      await api.upvotePost(postId);
      setPosts((prev: CommunityPost[]) =>
        prev.map((p: CommunityPost) => (p.id === postId ? applyVoteChange(p, 'upvote') ?? p : p)),
      );
      if (post?.id === postId) {
        setPost((p: CommunityPost | null) => applyVoteChange(p, 'upvote'));
      }
    } finally {
      setUpvotingId(null);
    }
  }, [api, applyVoteChange, isAuthenticated, onRequireAuth, post]);

  const downvotePost = useCallback(async (postId: number | string, returnPath?: string) => {
    if (isAuthenticated) {
      const ok = await isAuthenticated();
      if (!ok) {
        onRequireAuth?.(returnPath);
        return;
      }
    }
    if (!api.downvotePost) return;
    setUpvotingId(postId);
    try {
      await api.downvotePost(postId);
      setPosts((prev: CommunityPost[]) =>
        prev.map((p: CommunityPost) => (p.id === postId ? applyVoteChange(p, 'downvote') ?? p : p)),
      );
      if (post?.id === postId) {
        setPost((p: CommunityPost | null) => applyVoteChange(p, 'downvote'));
      }
    } finally {
      setUpvotingId(null);
    }
  }, [api, applyVoteChange, isAuthenticated, onRequireAuth, post]);

  const submitComment = useCallback(async (
    postId: number | string,
    content: string,
    returnPath?: string,
  ): Promise<CommunityComment | null> => {
    if (isAuthenticated) {
      const ok = await isAuthenticated();
      if (!ok) {
        onRequireAuth?.(returnPath);
        return null;
      }
    }
    setCommentSubmitting(true);
    setCommentError(null);
    try {
      const result = await api.createComment({ post: postId, content });
      if (result) {
        setComments((prev: CommunityComment[]) => [...prev, result]);
        // Update comment count optimistically
        setPosts((prev: CommunityPost[]) =>
          prev.map((p: CommunityPost) =>
            p.id === postId
              ? { ...p, comment_count: (p.comment_count ?? 0) + 1 }
              : p,
          ),
        );
        if (post?.id === postId) {
          setPost((p: CommunityPost | null) =>
            p ? { ...p, comment_count: (p.comment_count ?? 0) + 1 } : p,
          );
        }
      }
      return result;
    } catch (err: any) {
      const msg = err?.response?.data?.detail ?? err?.message ?? 'Failed to post comment.';
      setCommentError(msg);
      return null;
    } finally {
      setCommentSubmitting(false);
    }
  }, [api, isAuthenticated, onRequireAuth, post]);

  const submitPost = useCallback(async (
    payload: CreateCommunityPostRequest,
    returnPath?: string,
  ): Promise<CommunityPost | null> => {
    if (isAuthenticated) {
      const ok = await isAuthenticated();
      if (!ok) {
        onRequireAuth?.(returnPath);
        return null;
      }
    }
    if (!api.createPost) return null;
    setPostSubmitting(true);
    setPostSubmitError(null);
    try {
      const result = await api.createPost(payload);
      if (result) {
        setPosts((prev: CommunityPost[]) => [result, ...prev]);
      }
      return result;
    } catch (err: any) {
      const msg = err?.response?.data?.detail ?? err?.message ?? 'Failed to create post.';
      setPostSubmitError(msg);
      return null;
    } finally {
      setPostSubmitting(false);
    }
  }, [api, isAuthenticated, onRequireAuth]);

  const reset = useCallback(() => {
    setPosts([]);
    setPost(null);
    setComments([]);
    setFeedError(null);
    setPostError(null);
    setCommentError(null);
    setPostSubmitError(null);
    setNextPage(1);
    setHasMore(false);
  }, []);

  return {
    posts,
    feedLoading,
    feedError,
    hasMore,
    loadFeed,
    loadMore,
    post,
    postLoading,
    postError,
    loadPost,
    comments,
    commentsLoading,
    loadComments,
    upvotingId,
    upvotePost,
    downvotePost,
    commentSubmitting,
    commentError,
    submitComment,
    postSubmitting,
    postSubmitError,
    submitPost,
    reset,
  };
}
