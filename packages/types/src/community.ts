/**
 * Community / Social Feed shared types.
 * Wire format: snake_case throughout.
 * Primary fields match actual backend response shape from GET /posts/, /comments/.
 * Defensive fallbacks (body, author) support any future shape variation.
 */

export interface CommunityCreator {
  id: number | string;
  username?: string;
  name?: string;
  display_name?: string;
  profile_name?: string;
  avatar_url?: string | null;
  profile_pic?: string | null;
  role?: string;
}

// Alias — spec used "author" but wire uses "creator"
export type CommunityAuthor = CommunityCreator;

export interface CommunityMedia {
  id?: number | string;
  url: string;
  type?: 'image' | 'video' | 'audio' | 'file';
  thumbnail_url?: string | null;
  alt_text?: string | null;
}

export interface CommunityPost {
  id: number | string;
  title?: string;
  // Wire field is "content"; body/text are defensive fallbacks
  content?: string;
  body?: string;
  text?: string;
  media_url?: string | null;
  images?: string[];
  media?: CommunityMedia[];
  // Wire field is "creator"; author is a defensive fallback
  creator?: CommunityCreator;
  author?: CommunityCreator;
  community_slug?: string;
  community_name?: string;
  created_at?: string;
  updated_at?: string;
  upvote_count?: number;
  comment_count?: number;
  share_count?: number;
  is_saved?: boolean;
  is_hidden?: boolean;
  tags?: string[];
  category?: string;
  visibility?: string;
  // Phase 12-era field names kept defensive
  likes_count?: number;
  is_liked?: boolean;
}

/** Normalise: get the post/comment text from whichever field the backend sends. */
export function getPostText(post: Pick<CommunityPost, 'content' | 'body' | 'text'>): string {
  return post.content ?? post.body ?? post.text ?? '';
}

/** Normalise: get the author from whichever field the backend sends. */
export function getPostAuthor(
  post: Pick<CommunityPost, 'creator' | 'author'>,
): CommunityCreator | undefined {
  return post.creator ?? post.author;
}

export interface CommunityFeedResponse {
  count?: number;
  next?: string | null;
  previous?: string | null;
  results?: CommunityPost[];
  // Defensive: some endpoints return posts array directly
  posts?: CommunityPost[];
}

export interface CommunityComment {
  id: number | string;
  // Wire field is "content"
  content?: string;
  body?: string;
  text?: string;
  post?: number | string;
  parent?: number | string | null;
  children?: CommunityComment[];
  // Wire field is "creator"
  creator?: CommunityCreator;
  author?: CommunityCreator;
  created_at?: string;
  updated_at?: string;
  is_question?: boolean;
  is_flagged?: boolean;
  useful_count?: number;
  is_useful_marked?: boolean;
  upvote_count?: number;
}

export interface CommunityCommentsResponse {
  count?: number;
  next?: string | null;
  previous?: string | null;
  results?: CommunityComment[];
  comments?: CommunityComment[];
}

// ── Request shapes (wire format) ──────────────────────────────────────────────

export interface CreateCommunityPostRequest {
  title?: string;
  content: string;           // wire field (not "body")
  community?: string;        // community slug
  media_url?: string;
  images?: string[];
  tags?: string[];
}

export interface CreateCommentRequest {
  post: number | string;     // post id — required by wire
  content: string;           // wire field (not "body")
  parent?: number | string;
  is_question?: boolean;
}

export interface UpvoteResponse {
  detail?: string;           // "Upvoted" | "Upvote removed"
}
