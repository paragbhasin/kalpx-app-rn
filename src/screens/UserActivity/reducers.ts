import {
    FETCH_USER_ACTIVITY_FAILURE,
    FETCH_USER_ACTIVITY_REQUEST,
    FETCH_USER_ACTIVITY_SUCCESS,
} from "./actions";

const initialUserActivityState = {
    upvotes: { loading: false, data: [], error: null },
    downvotes: { loading: false, data: [], error: null },
    my_posts: { loading: false, data: [], error: null },
    my_questions: { loading: false, data: [], error: null },
    my_comments: { loading: false, data: [], error: null },
    followed_communities: { loading: false, data: [], error: null },
    explore_posts: { loading: false, data: [], error: null },
    feed: { loading: false, data: [], error: null },
    saved_posts: { loading: false, data: [], error: null },
    hidden_posts: { loading: false, data: [], error: null },
    useful_marks: { loading: false, data: [], error: null },
    stats: { loading: false, data: null, error: null },
};

export const userActivityReducer = (state = initialUserActivityState, action: any) => {
    switch (action.type) {
        case FETCH_USER_ACTIVITY_REQUEST:
            return {
                ...state,
                [action.payload.activityType]: { ...state[action.payload.activityType], loading: true, error: null },
            };
        case FETCH_USER_ACTIVITY_SUCCESS:
            return {
                ...state,
                [action.payload.activityType]: { loading: false, data: action.payload.data, error: null },
            };
        case FETCH_USER_ACTIVITY_FAILURE:
            return {
                ...state,
                [action.payload.activityType]: { ...state[action.payload.activityType], loading: false, error: action.payload.error },
            };
        default:
            return state;
    }
};
