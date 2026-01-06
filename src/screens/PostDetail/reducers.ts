import {
    FETCH_POST_DETAIL_REQUEST,
    FETCH_POST_DETAIL_SUCCESS,
    FETCH_POST_DETAIL_FAILURE,
    FETCH_COMMENTS_REQUEST,
    FETCH_COMMENTS_SUCCESS,
    FETCH_COMMENTS_FAILURE,
    DELETE_COMMENT_SUCCESS,
    UPDATE_COMMENT_SUCCESS,
    POST_DETAIL_INTERACTION_SUCCESS,
    COMMENT_INTERACTION_SUCCESS,
} from "./actions";

const initialPostDetailState = {
    post: null,
    loadingPost: false,
    errorPost: null,
    comments: [], // Filtered top-level comments
    loadingComments: false,
    errorComments: null,
    paginationComments: {
        currentPage: 1,
        totalPages: 1,
        totalCount: 0,
    },
};

// Helper to recursively update comments
const updateCommentResursively = (list: any[], id: number, updateFn: (c: any) => any): any[] => {
    return list.map(c => {
        if (c.id === id) {
            return updateFn(c);
        }
        if (c.children && c.children.length > 0) {
            return { ...c, children: updateCommentResursively(c.children, id, updateFn) };
        }
        return c;
    });
};

// Helper to recursively delete
const deleteCommentRecursively = (list: any[], id: number): any[] => {
    return list.filter(c => c.id !== id).map(c => ({
        ...c,
        children: c.children ? deleteCommentRecursively(c.children, id) : []
    }));
};

// Initialize comment helper (props for UI state if needed, though mostly Redux handles data)
const initializeComment = (c: any) => ({
    ...c,
    showReplyForm: false, // UI state managed locally in component optimally, but if demanded in Redux...
    children: (c.children || []).map(initializeComment)
});

export const postDetailReducer = (state = initialPostDetailState, action: any) => {
    switch (action.type) {
        case FETCH_POST_DETAIL_REQUEST:
            return { ...state, loadingPost: true, errorPost: null };
        case FETCH_POST_DETAIL_SUCCESS:
            return { ...state, loadingPost: false, post: action.payload };
        case FETCH_POST_DETAIL_FAILURE:
            return { ...state, loadingPost: false, errorPost: action.payload };

        case FETCH_COMMENTS_REQUEST:
            return { ...state, loadingComments: true, errorComments: null };
        case FETCH_COMMENTS_SUCCESS:
            // Normalize or just store tree? Vue stored tree.
            const allComments = (action.payload.results || []).map(initializeComment);
            // Filter out child comments from top level if API returns flat list vs tree? 
            // Vue code: "comments.value = allComments.filter((c) => !c.parent);"
            // Assuming API returns all comments flat or mix, we filter top level.
            // But if API returns tree structure, we just take it. 
            // Let's assume API structure matches Vue expectation.
            return {
                ...state,
                loadingComments: false,
                comments: allComments.filter((c: any) => !c.parent),
                paginationComments: {
                    currentPage: action.payload.page,
                    totalPages: action.payload.totalPages,
                    totalCount: action.payload.totalCount
                }
            };
        case FETCH_COMMENTS_FAILURE:
            return { ...state, loadingComments: false, errorComments: action.payload };

        case DELETE_COMMENT_SUCCESS:
            return {
                ...state,
                comments: deleteCommentRecursively(state.comments, action.payload.id),
                paginationComments: {
                    ...state.paginationComments,
                    totalCount: Math.max(0, state.paginationComments.totalCount - 1)
                }
            };

        case UPDATE_COMMENT_SUCCESS:
            return {
                ...state,
                comments: updateCommentResursively(state.comments, action.payload.id, (c) => ({ ...c, content: action.payload.content }))
            };

        case POST_DETAIL_INTERACTION_SUCCESS:
            if (!state.post) return state;
            const post: any = state.post; // cast for TS
            let newPost = { ...post };
            if (action.payload.type === 'upvote') {
                newPost.score = (newPost.score || 0) + 1;
                // maybe toggle 'is_upvoted'?
            } else if (action.payload.type === 'downvote') {
                newPost.score = (newPost.score || 0) - 1;
            } else if (action.payload.type === 'save') {
                newPost.is_saved = true;
            } else if (action.payload.type === 'unsave') {
                newPost.is_saved = false;
            }
            return { ...state, post: newPost };

        case COMMENT_INTERACTION_SUCCESS:
            return {
                ...state,
                comments: updateCommentResursively(state.comments, action.payload.id, (c) => {
                    const type = action.payload.type;
                    let score = c.score || 0;
                    if (type === 'upvote') score++;
                    if (type === 'downvote') score--;
                    // useful mark logic
                    let isUseful = c.is_useful_marked;
                    if (type === 'useful') isUseful = !isUseful; // toggle

                    return { ...c, score, is_useful_marked: isUseful };
                })
            };

        default:
            return state;
    }
}
