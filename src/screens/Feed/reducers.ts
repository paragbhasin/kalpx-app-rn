import {
    FETCH_FEED_REQUEST,
    FETCH_FEED_SUCCESS,
    FETCH_FEED_FAILURE,
    FETCH_POPULAR_REQUEST,
    FETCH_POPULAR_SUCCESS,
    FETCH_POPULAR_FAILURE,
    FETCH_FEATURED_REQUEST,
    FETCH_FEATURED_SUCCESS,
    FETCH_FEATURED_FAILURE,
    UPVOTE_POST_SUCCESS,
    DOWNVOTE_POST_SUCCESS,
    SAVE_POST_SUCCESS,
    UNSAVE_POST_SUCCESS,
    HIDE_POST_SUCCESS,
    UNHIDE_POST_SUCCESS
} from "./actions";
import { FOLLOW_COMMUNITY_SUCCESS, UNFOLLOW_COMMUNITY_SUCCESS } from "../Social/actions";


const initialFeedState = {
    posts: [],
    loading: false,
    loadingMore: false,
    error: null,
    pagination: {
        currentPage: 1,
        totalPages: 1,
        totalCount: 0,
    },
    popularPosts: [],
    loadingPopular: false,
    loadingMorePopular: false,

    // user hook had 'loading' and 'loadingMore' shared or distinct? 
    // "loading" was shared unless specifically guarded. 
    // In Redux it's cleaner to separate if needed.
    popularPagination: {
        currentPage: 1,
        totalPages: 1,
        totalCount: 0,
    },
    featuredPosts: [],
    loadingFeatured: false,
};

// Helper for vote update
const updateVote = (posts, id, type) => {
    return posts.map(p => {
        if (p.id === id) {
            const currentVote = p.user_vote || 0;
            let newVote = 0;
            let countChange = 0;

            if (type === 'upvote') {
                if (currentVote === 1) {
                    newVote = 0;
                    countChange = -1;
                } else if (currentVote === -1) {
                    newVote = 1;
                    countChange = 2;
                } else {
                    newVote = 1;
                    countChange = 1;
                }
            } else {
                if (currentVote === -1) {
                    newVote = 0;
                    countChange = 1;
                } else if (currentVote === 1) {
                    newVote = -1;
                    countChange = -2;
                } else {
                    newVote = -1;
                    countChange = -1;
                }
            }

            return {
                ...p,
                user_vote: newVote,
                upvote_count: Math.max(0, (p.upvote_count || 0) + countChange)
            };
        }
        return p;
    });
};

export const feedReducer = (state = initialFeedState, action) => {
    switch (action.type) {
        case FETCH_FEED_REQUEST:
            return {
                ...state,
                loading: !action.payload.isAppend,
                loadingMore: action.payload.isAppend,
                error: null
            };
        case FETCH_FEED_SUCCESS:
            return {
                ...state,
                loading: false,
                loadingMore: false,
                posts: action.payload.page === 1 ? action.payload.results : [...state.posts, ...action.payload.results],
                pagination: {
                    currentPage: action.payload.page,
                    totalPages: action.payload.totalPages,
                    totalCount: action.payload.count
                }
            };
        case FETCH_FEED_FAILURE:
            return { ...state, loading: false, loadingMore: false, error: action.payload };

        case FETCH_POPULAR_REQUEST:
            return {
                ...state,
                loadingPopular: !action.payload.isAppend,
                loadingMorePopular: action.payload.isAppend
            };

        case FETCH_POPULAR_SUCCESS:
            return {
                ...state,
                loadingPopular: false,
                loadingMorePopular: false,
                popularPosts: action.payload.page === 1 ? action.payload.results : [...state.popularPosts, ...action.payload.results],

                popularPagination: {
                    currentPage: action.payload.page,
                    totalPages: action.payload.totalPages,
                    totalCount: action.payload.count
                }
            };
        case FETCH_POPULAR_FAILURE:
            return { ...state, loadingPopular: false }; // Error handling?

        case FETCH_FEATURED_REQUEST:
            return { ...state, loadingFeatured: true };
        case FETCH_FEATURED_SUCCESS:
            return { ...state, loadingFeatured: false, featuredPosts: action.payload };
        case FETCH_FEATURED_FAILURE:
            return { ...state, loadingFeatured: false };

        case UPVOTE_POST_SUCCESS:
            return {
                ...state,
                posts: updateVote(state.posts, action.payload.id, 'upvote'),
                popularPosts: updateVote(state.popularPosts, action.payload.id, 'upvote'),
            };
        case DOWNVOTE_POST_SUCCESS:
            return {
                ...state,
                posts: updateVote(state.posts, action.payload.id, 'downvote'),
                popularPosts: updateVote(state.popularPosts, action.payload.id, 'downvote'),
            };
        case SAVE_POST_SUCCESS:
            return {
                ...state,
                posts: state.posts.map(p => p.id === action.payload.id ? { ...p, is_saved: true } : p),
                popularPosts: state.popularPosts.map(p => p.id === action.payload.id ? { ...p, is_saved: true } : p),
            };
        case UNSAVE_POST_SUCCESS:
            return {
                ...state,
                posts: state.posts.map(p => p.id === action.payload.id ? { ...p, is_saved: false } : p),
                popularPosts: state.popularPosts.map(p => p.id === action.payload.id ? { ...p, is_saved: false } : p),
            };
        case HIDE_POST_SUCCESS:
            return {
                ...state,
                posts: state.posts.filter(p => p.id !== action.payload.id),
                popularPosts: state.popularPosts.filter(p => p.id !== action.payload.id),
            };
        case FOLLOW_COMMUNITY_SUCCESS:
            return {
                ...state,
                posts: state.posts.map(p =>
                    (p.community?.slug === action.payload.id || p.community_slug === action.payload.id || p.community?.id?.toString() === action.payload.id)
                        ? { ...p, is_joined: true }
                        : p
                ),
                popularPosts: state.popularPosts.map(p =>
                    (p.community?.slug === action.payload.id || p.community_slug === action.payload.id || p.community?.id?.toString() === action.payload.id)
                        ? { ...p, is_joined: true }
                        : p
                ),
            };
        case UNFOLLOW_COMMUNITY_SUCCESS:
            return {
                ...state,
                posts: state.posts.map(p =>
                    (p.community?.slug === action.payload.id || p.community_slug === action.payload.id || p.community?.id?.toString() === action.payload.id)
                        ? { ...p, is_joined: false }
                        : p
                ),
                popularPosts: state.popularPosts.map(p =>
                    (p.community?.slug === action.payload.id || p.community_slug === action.payload.id || p.community?.id?.toString() === action.payload.id)
                        ? { ...p, is_joined: false }
                        : p
                ),
            };

        default:
            return state;
    }
};
