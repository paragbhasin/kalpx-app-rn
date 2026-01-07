import {
    FETCH_USER_ACTIVITY_FAILURE,
    FETCH_USER_ACTIVITY_REQUEST,
    FETCH_USER_ACTIVITY_SUCCESS,
} from "./actions";
import { FOLLOW_COMMUNITY_SUCCESS, UNFOLLOW_COMMUNITY_SUCCESS } from "../Social/actions";


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
        case FOLLOW_COMMUNITY_SUCCESS:
            // payload in Social/actions.ts is { id: idOrSlug, data: res.data }
            const communityObj = action.payload.data?.community || action.payload.data;
            if (communityObj && !state.followed_communities.data.find((c: any) => c.slug === action.payload.id || c.id?.toString() === action.payload.id)) {
                return {
                    ...state,
                    followed_communities: {
                        ...state.followed_communities,
                        data: [...state.followed_communities.data, communityObj]
                    }
                };
            }
            return state;

        case UNFOLLOW_COMMUNITY_SUCCESS:
            // Remove from followed_communities
            return {
                ...state,
                followed_communities: {
                    ...state.followed_communities,
                    data: state.followed_communities.data.filter((c: any) => c.slug !== action.payload.id && c.id?.toString() !== action.payload.id)
                }
            };

        default:
            return state;
    }
};
