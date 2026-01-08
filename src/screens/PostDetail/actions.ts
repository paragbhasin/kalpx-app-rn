import api from "../../Networks/axios";

// 🔹 Action Types
export const FETCH_POST_DETAIL_REQUEST = "FETCH_POST_DETAIL_REQUEST";
export const FETCH_POST_DETAIL_SUCCESS = "FETCH_POST_DETAIL_SUCCESS";
export const FETCH_POST_DETAIL_FAILURE = "FETCH_POST_DETAIL_FAILURE";

export const FETCH_COMMENTS_REQUEST = "FETCH_COMMENTS_REQUEST";
export const FETCH_COMMENTS_SUCCESS = "FETCH_COMMENTS_SUCCESS";
export const FETCH_COMMENTS_FAILURE = "FETCH_COMMENTS_FAILURE";

export const CREATE_COMMENT_SUCCESS = "CREATE_COMMENT_SUCCESS";
export const CREATE_COMMENT_FAILURE = "CREATE_COMMENT_FAILURE"; // For toast/error handling in component usually, but good to have type
export const DELETE_COMMENT_SUCCESS = "DELETE_COMMENT_SUCCESS";
export const UPDATE_COMMENT_SUCCESS = "UPDATE_COMMENT_SUCCESS";

export const POST_DETAIL_INTERACTION_SUCCESS = "POST_DETAIL_INTERACTION_SUCCESS"; // Generic for upvote/downvote/save/hide on the main post
export const COMMENT_INTERACTION_SUCCESS = "COMMENT_INTERACTION_SUCCESS"; // For upvote/downvote/useful on comments

export const REPORT_SUCCESS = "REPORT_SUCCESS";

const PAGE_SIZE = 10;

// 🔹 Thunks

export const fetchPostDetail = (postId: string | number) => async (dispatch: any) => {
    dispatch({ type: FETCH_POST_DETAIL_REQUEST });
    try {
        const res = await api.get(`/posts/${postId}/`);
        // We might need to fetch community name if missing, similar to Vue 'fetchCommunityName'
        // But for Redux, let's assume component or selector handles derived data or we just store what we get.
        // If critical, we can chain requests.
        dispatch({
            type: FETCH_POST_DETAIL_SUCCESS,
            payload: res.data,
        });
    } catch (err: any) {
        dispatch({
            type: FETCH_POST_DETAIL_FAILURE,
            payload: err?.response?.data?.detail || err?.message || "Failed to load post",
        });
    }
};

export const fetchComments = (postId: string | number, page = 1, isQuestion = false) => async (dispatch: any) => {
    dispatch({ type: FETCH_COMMENTS_REQUEST, payload: { page } });
    try {
        const params = new URLSearchParams({
            post: postId.toString(),
            page: page.toString(),
            t: Date.now().toString(),
        });
        if (isQuestion) {
            params.append("is_question", "true");
        }

        const res = await api.get(`/comments/?${params.toString()}`);

        dispatch({
            type: FETCH_COMMENTS_SUCCESS,
            payload: {
                results: res.data.results || [],
                count: res.data.count,
                page,
                totalPages: res.data.count ? Math.ceil(res.data.count / PAGE_SIZE) : 1
            },
        });
    } catch (err: any) {
        dispatch({
            type: FETCH_COMMENTS_FAILURE,
            payload: err?.response?.data?.detail || err?.message || "Failed to load comments",
        });
    }
};

export const createComment = (postId: string | number, content: string, parentId?: number | null, isQuestion = false) => async (dispatch: any) => {
    try {
        const payload: any = { post: postId, content, parent: parentId };
        if (isQuestion) payload.is_question = true;

        await api.post(`/comments/`, payload);

        dispatch({ type: CREATE_COMMENT_SUCCESS });
        // Component should react to success (e.g. clear input) or we dispatch 'fetchComments' again
        dispatch(fetchComments(postId, 1, isQuestion));
        return { success: true };
    } catch (err: any) {
        return { success: false, error: err?.response?.data?.detail || "Failed to post" };
    }
};

export const updateComment = (commentId: number, content: string) => async (dispatch: any) => {
    try {
        const res = await api.patch(`/comments/${commentId}/`, { content });
        dispatch({ type: UPDATE_COMMENT_SUCCESS, payload: { id: commentId, content: res.data.content } });
        return { success: true };
    } catch (err: any) {
        return { success: false, error: err?.response?.data?.detail || "Failed to update" };
    }
}

export const deleteComment = (commentId: number) => async (dispatch: any) => {
    try {
        await api.delete(`/comments/${commentId}/`);
        dispatch({ type: DELETE_COMMENT_SUCCESS, payload: { id: commentId } });
        return { success: true };
    } catch (err: any) {
        return { success: false, error: err?.response?.data?.detail || "Failed to delete" };
    }
}

// Interactions on Post
export const votePostDetail = (postId: string | number, type: 'upvote' | 'downvote') => async (dispatch: any) => {
    // Optimistic dispatch could happen here
    dispatch({ type: POST_DETAIL_INTERACTION_SUCCESS, payload: { id: postId, type } });
    try {
        await api.post(`/posts/${postId}/${type}/`);
    } catch (err) {
        // Revert?
        console.error("Vote failed", err);
    }
}

export const savePostDetail = (postId: string | number) => async (dispatch: any) => {
    dispatch({ type: POST_DETAIL_INTERACTION_SUCCESS, payload: { id: postId, type: 'save' } });
    try { await api.post(`/posts/${postId}/save/`); } catch (err) { console.error(err); }
}

export const unsavePostDetail = (postId: string | number) => async (dispatch: any) => {
    dispatch({ type: POST_DETAIL_INTERACTION_SUCCESS, payload: { id: postId, type: 'unsave' } });
    try { await api.post(`/posts/${postId}/unsave/`); } catch (err) { console.error(err); }
}

export const hidePostDetail = (postId: string | number) => async (dispatch: any) => {
    dispatch({ type: POST_DETAIL_INTERACTION_SUCCESS, payload: { id: postId, type: 'hide' } });
    try { await api.post(`/posts/${postId}/hide/`); } catch (err) { console.error(err); }
}

// Interactions on Comments
export const voteComment = (commentId: number, type: 'upvote' | 'downvote') => async (dispatch: any) => {
    dispatch({ type: COMMENT_INTERACTION_SUCCESS, payload: { id: commentId, type } });
    try {
        await api.post(`/comments/${commentId}/${type}/`);
    } catch (err) {
        console.error("Comment vote failed", err);
    }
}

export const markCommentUseful = (commentId: number) => async (dispatch: any) => {
    dispatch({ type: COMMENT_INTERACTION_SUCCESS, payload: { id: commentId, type: 'useful' } });
    try {
        await api.post(`/comments/${commentId}/useful/`);
    } catch (err) {
        console.error("Mark useful failed", err);
    }
}

export const reportContent = (contentType: 'post' | 'comment', contentId: string | number, reason: string, details: string) => async (dispatch: any) => {
    try {
        await api.post(`/reports/`, { content_type: contentType, content_id: contentId, reason, details });
        return { success: true };
    } catch (err: any) {
        return { success: false, error: err?.response?.data?.detail || "Report failed" };
    }
}
