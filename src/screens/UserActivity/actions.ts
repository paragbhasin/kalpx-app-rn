import api from "../../Networks/axios";

// 🔹 User Activity Action Types
export const FETCH_USER_ACTIVITY_REQUEST = "FETCH_USER_ACTIVITY_REQUEST";
export const FETCH_USER_ACTIVITY_SUCCESS = "FETCH_USER_ACTIVITY_SUCCESS";
export const FETCH_USER_ACTIVITY_FAILURE = "FETCH_USER_ACTIVITY_FAILURE";

// 🔹 User Activity Thunks
export const fetchUserActivity = (type: string) => async (dispatch: any) => {
    dispatch({ type: FETCH_USER_ACTIVITY_REQUEST, payload: { activityType: type } });
    try {
        let endpoint = "";
        switch (type) {
            case "upvotes": endpoint = "/my/activity/upvotes/"; break;
            case "downvotes": endpoint = "/my/activity/downvotes/"; break;
            case "my_posts": endpoint = "/my/activity/my_posts/"; break;
            case "my_questions": endpoint = "/my/activity/my_questions/"; break;
            case "my_comments": endpoint = "/my/activity/my_comments/"; break;
            case "followed_communities": endpoint = "/my/activity/followed_communities/"; break;
            case "explore_posts": endpoint = "/my/activity/explore_posts/"; break;
            case "feed": endpoint = "/my/activity/feed/"; break;
            case "saved_posts": endpoint = "/my/activity/saved_posts/"; break;
            case "hidden_posts": endpoint = "/my/activity/hidden_posts/"; break;
            case "useful_marks": endpoint = "/my/activity/useful_marks/"; break;
            case "stats": endpoint = "/my/activity/stats/"; break;
            default: throw new Error("Invalid activity type");
        }

        const res = await api.get(endpoint);
        let data = res.data.results || res.data || [];

        // Data Transformation Logic
        if (type === "my_comments") {
            data = data
                .filter((item: any) => item.is_question === false || item.comment?.is_question === false)
                .map((item: any) => {
                    const post = item.post || item.comment?.post;
                    if (post) {
                        return {
                            ...post,
                            _activity_id: item.id,
                            comment: item.comment || item,
                            commented_at: item.created_at,
                            is_comment_activity: true,
                        };
                    }
                    return item;
                });
        } else if (type === "followed_communities") {
            data = Array.isArray(data) ? data.filter((c: any) => c && c.slug) : [];
        } else if (type === "saved_posts") {
            data = data.map((item: any) => {
                if (item.post) {
                    return {
                        ...item.post,
                        _activity_id: item.id,
                        saved_at: item.created_at,
                        is_saved: true,
                    };
                }
                return item;
            });
        } else if (type === "hidden_posts") {
            data = data.map((item: any) => {
                if (item.post) {
                    return {
                        ...item.post,
                        _activity_id: item.id,
                        hidden_at: item.created_at,
                        is_hidden: true,
                    };
                }
                return item;
            });
        } else if (type === "useful_marks") {
            data = data.map((item: any) => {
                if (item.comment?.post) {
                    return {
                        ...item.comment.post,
                        _activity_id: item.id,
                        comment: item.comment,
                        marked_useful_at: item.created_at,
                        is_useful_mark: true,
                    };
                }
                return item;
            });
        }

        dispatch({
            type: FETCH_USER_ACTIVITY_SUCCESS,
            payload: { activityType: type, data: data },
        });
    } catch (error: any) {
        console.error(`Failed to fetch ${type}:`, error);
        dispatch({
            type: FETCH_USER_ACTIVITY_FAILURE,
            payload: { activityType: type, error: error?.message || "Failed to load activity" },
        });
    }
};
