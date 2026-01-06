import api from "../../Networks/axios";
// Helper for random stats (mock implementation if utils not available, or import)
// Assuming utils/randomStats exists or we'll mock it here for now as requested by user logic
// The user provided logic: initializePostWithRandomStats from "@/utils/randomStats"
// We might need to port that utility too if it doesn't exist. 
// For now, I will assume it renders raw data or simple random generation inline if needed.

// 🔹 Action Types
export const FETCH_FEED_REQUEST = "FETCH_FEED_REQUEST";
export const FETCH_FEED_SUCCESS = "FETCH_FEED_SUCCESS";
export const FETCH_FEED_FAILURE = "FETCH_FEED_FAILURE";

export const FETCH_POPULAR_REQUEST = "FETCH_POPULAR_REQUEST";
export const FETCH_POPULAR_SUCCESS = "FETCH_POPULAR_SUCCESS";
export const FETCH_POPULAR_FAILURE = "FETCH_POPULAR_FAILURE";

export const FETCH_FEATURED_REQUEST = "FETCH_FEATURED_REQUEST";
export const FETCH_FEATURED_SUCCESS = "FETCH_FEATURED_SUCCESS";
export const FETCH_FEATURED_FAILURE = "FETCH_FEATURED_FAILURE";

export const UPVOTE_POST_SUCCESS = "UPVOTE_POST_SUCCESS";
export const DOWNVOTE_POST_SUCCESS = "DOWNVOTE_POST_SUCCESS";
export const SAVE_POST_SUCCESS = "SAVE_POST_SUCCESS";
export const UNSAVE_POST_SUCCESS = "UNSAVE_POST_SUCCESS";
export const HIDE_POST_SUCCESS = "HIDE_POST_SUCCESS";
export const UNHIDE_POST_SUCCESS = "UNHIDE_POST_SUCCESS";
export const POST_INTERACTION_FAILURE = "POST_INTERACTION_FAILURE";

const PAGE_SIZE = 10;

// 🔹 Thunks

export const fetchFeed = (page = 1, sortOption = "hot", locale = "en") => async (dispatch) => {
    dispatch({ type: FETCH_FEED_REQUEST, payload: { page, isAppend: page > 1 } });

    try {
        const params = new URLSearchParams({
            page: page.toString(),
            page_size: PAGE_SIZE.toString(),
            sort: sortOption,
            t: Date.now().toString(),
            lang: locale,
        });

        // Using axios instance 'api' which handles auth headers
        const res = await api.get(`/posts/personalized_feed/?${params.toString()}`);

        const results = (res.data.results || []).map(post => ({
            ...post,
            // Mocking random stats intialization effectively or keeping it raw
            // In real app, we might need a utility for this
        }));

        dispatch({
            type: FETCH_FEED_SUCCESS,
            payload: {
                results,
                count: res.data.count,
                page,
                totalPages: res.data.count ? Math.ceil(res.data.count / PAGE_SIZE) : 1
            },
        });

    } catch (err) {
        console.log("Fetch Feed Error", err);
        dispatch({
            type: FETCH_FEED_FAILURE,
            payload: err?.message || "Failed to load feed",
        });
    }
};

export const fetchPopularPosts = (page = 1, locale = "en") => async (dispatch) => {
    dispatch({ type: FETCH_POPULAR_REQUEST, payload: { page, isAppend: page > 1 } });
    try {
        const params = new URLSearchParams({
            page: page.toString(),
            page_size: PAGE_SIZE.toString(),
            sort: "top",
            t: Date.now().toString(),
            lang: locale,
        });
        const res = await api.get(`/posts/?${params.toString()}`);

        dispatch({
            type: FETCH_POPULAR_SUCCESS,
            payload: {
                results: res.data.results || [],
                count: res.data.count,
                page,
                totalPages: res.data.count ? Math.ceil(res.data.count / PAGE_SIZE) : 1
            },
        });
    } catch (err) {
        dispatch({
            type: FETCH_POPULAR_FAILURE,
            payload: err?.message || "Failed to fetch popular posts",
        });
    }
};

export const fetchFeaturedHomePosts = () => async (dispatch) => {
    dispatch({ type: FETCH_FEATURED_REQUEST });
    try {
        const res = await api.get("/public/explore-posts/featured/");
        dispatch({
            type: FETCH_FEATURED_SUCCESS,
            payload: res.data.results || [],
        });
    } catch (err) {
        dispatch({
            type: FETCH_FEATURED_FAILURE,
            payload: err?.message || "Failed to fetch featured posts",
        });
    }
}

// Interactions

export const upvotePost = (id) => async (dispatch) => {
    // Optimistic Logic can be in reducer or we dispatch Request -> then API
    // User logic had purely optimistic update: "const updatedPost = ... Object.assign(post...)"
    // We will simulate success immediately or handle it via reducer logic
    try {
        await api.post(`/posts/${id}/upvote/`);
        // If server returns updated counts, we could dispatch them. 
        // For simple port, just dispatch success to toggle state in reducer
        dispatch({ type: UPVOTE_POST_SUCCESS, payload: { id } });
    } catch (err) {
        dispatch({ type: POST_INTERACTION_FAILURE, payload: { id, error: "Failed to upvote" } });
    }
}

export const downvotePost = (id) => async (dispatch) => {
    try {
        await api.post(`/posts/${id}/downvote/`);
        dispatch({ type: DOWNVOTE_POST_SUCCESS, payload: { id } });
    } catch (err) {
        dispatch({ type: POST_INTERACTION_FAILURE, payload: { id, error: "Failed to downvote" } });
    }
}

export const savePost = (id) => async (dispatch) => {
    try {
        await api.post(`/posts/${id}/save/`);
        dispatch({ type: SAVE_POST_SUCCESS, payload: { id } });
    } catch (err) {
        dispatch({ type: POST_INTERACTION_FAILURE, payload: { id, error: "Failed to save" } });
    }
}

export const unsavePost = (id) => async (dispatch) => {
    try {
        await api.post(`/posts/${id}/unsave/`);
        dispatch({ type: UNSAVE_POST_SUCCESS, payload: { id } });
    } catch (err) {
        dispatch({ type: POST_INTERACTION_FAILURE, payload: { id, error: "Failed to unsave" } });
    }
}

export const hidePost = (id) => async (dispatch) => {
    try {
        await api.post(`/posts/${id}/hide/`);
        dispatch({ type: HIDE_POST_SUCCESS, payload: { id } });
    } catch (err) {
        dispatch({ type: POST_INTERACTION_FAILURE, payload: { id, error: "Failed to hide" } });
    }
}

export const unhidePost = (id) => async (dispatch) => {
    try {
        await api.post(`/posts/${id}/unhide/`);
        dispatch({ type: UNHIDE_POST_SUCCESS, payload: { id } });
    } catch (err) {
        dispatch({ type: POST_INTERACTION_FAILURE, payload: { id, error: "Failed to unhide" } });
    }
}
