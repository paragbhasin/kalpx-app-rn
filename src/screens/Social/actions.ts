// src/screens/Social/actions.ts
import api from "../../Networks/axios";

export const EXPLORE_REQUEST = "EXPLORE_REQUEST";
export const EXPLORE_SUCCESS = "EXPLORE_SUCCESS";
export const EXPLORE_FAILURE = "EXPLORE_FAILURE";

export const FETCH_COMMUNITY_DETAIL_REQUEST = "FETCH_COMMUNITY_DETAIL_REQUEST";
export const FETCH_COMMUNITY_DETAIL_SUCCESS = "FETCH_COMMUNITY_DETAIL_SUCCESS";
export const FETCH_COMMUNITY_DETAIL_FAILURE = "FETCH_COMMUNITY_DETAIL_FAILURE";

export const FETCH_COMMUNITY_POSTS_REQUEST = "FETCH_COMMUNITY_POSTS_REQUEST";
export const FETCH_COMMUNITY_POSTS_SUCCESS = "FETCH_COMMUNITY_POSTS_SUCCESS";
export const FETCH_COMMUNITY_POSTS_FAILURE = "FETCH_COMMUNITY_POSTS_FAILURE";

export const CREATE_POST_REQUEST = "CREATE_POST_REQUEST";
export const CREATE_POST_SUCCESS = "CREATE_POST_SUCCESS";
export const CREATE_POST_FAILURE = "CREATE_POST_FAILURE";


export const fetchExplorePosts = () => async (dispatch) => {
  dispatch({ type: EXPLORE_REQUEST });

  try {
    const res = await api.get("/public/explore-posts/");
    console.log("🔥 THUNK RECEIVED:", res.data?.length);

    dispatch({
      type: EXPLORE_SUCCESS,
      payload: Array.isArray(res.data) ? res.data : [],
    });
  } catch (err) {
    dispatch({
      type: EXPLORE_FAILURE,
      payload: err?.message || "Something went wrong",
    });
  }
};

// Communities Actions
export const FETCH_COMMUNITIES_REQUEST = "FETCH_COMMUNITIES_REQUEST";
export const FETCH_COMMUNITIES_SUCCESS = "FETCH_COMMUNITIES_SUCCESS";
export const FETCH_COMMUNITIES_FAILURE = "FETCH_COMMUNITIES_FAILURE";

export const FETCH_TOP_COMMUNITIES_REQUEST = "FETCH_TOP_COMMUNITIES_REQUEST";
export const FETCH_TOP_COMMUNITIES_SUCCESS = "FETCH_TOP_COMMUNITIES_SUCCESS";
export const FETCH_TOP_COMMUNITIES_FAILURE = "FETCH_TOP_COMMUNITIES_FAILURE";

export const FOLLOW_COMMUNITY_REQUEST = "FOLLOW_COMMUNITY_REQUEST";
export const FOLLOW_COMMUNITY_SUCCESS = "FOLLOW_COMMUNITY_SUCCESS";
export const FOLLOW_COMMUNITY_FAILURE = "FOLLOW_COMMUNITY_FAILURE";

export const UNFOLLOW_COMMUNITY_REQUEST = "UNFOLLOW_COMMUNITY_REQUEST";
export const UNFOLLOW_COMMUNITY_SUCCESS = "UNFOLLOW_COMMUNITY_SUCCESS";
export const UNFOLLOW_COMMUNITY_FAILURE = "UNFOLLOW_COMMUNITY_FAILURE";

const PAGE_SIZE = 12;

export const fetchCommunities = (page = 1, searchQuery = "") => async (dispatch) => {
  dispatch({ type: FETCH_COMMUNITIES_REQUEST, payload: { page } });

  try {
    const params = new URLSearchParams({
      page: page.toString(),
      page_size: PAGE_SIZE.toString(),
      t: Date.now().toString(),
    });
    if (searchQuery) {
      params.append("q", searchQuery);
    }
    const res = await api.get(`/communities/?${params.toString()}`);

    // Process data to include rank, etc if needed, similar to Vue
    const results = (res.data.results || []).map((c, i) => ({
      ...c,
      rank: (page - 1) * PAGE_SIZE + i + 1,
      // is_followed handling is a bit complex in redux if we don't have user id in store easily accessable here
      // usually the backend returns 'is_followed' boolean if auth token is present
    }));

    dispatch({
      type: FETCH_COMMUNITIES_SUCCESS,
      payload: {
        results: results,
        count: res.data.count,
        page,
        totalPages: res.data.count ? Math.ceil(res.data.count / PAGE_SIZE) : 1
      },
    });
  } catch (err) {
    dispatch({
      type: FETCH_COMMUNITIES_FAILURE,
      payload: err?.message || "Something went wrong",
    });
  }
};

export const fetchTopCommunities = (page = 1) => async (dispatch) => {
  dispatch({ type: FETCH_TOP_COMMUNITIES_REQUEST, payload: { page } });
  try {
    const params = new URLSearchParams({
      page: page.toString(),
      page_size: PAGE_SIZE.toString(),
      t: Date.now().toString(),
    });
    const res = await api.get(`/communities/top/?${params.toString()}`);
    const results = (res.data.results || res.data || []).map((c, i) => ({
      ...c,
      rank: (page - 1) * PAGE_SIZE + i + 1
    }));

    dispatch({
      type: FETCH_TOP_COMMUNITIES_SUCCESS,
      payload: {
        results: results,
        count: res.data.count,
        page,
        totalPages: res.data.count ? Math.ceil(res.data.count / PAGE_SIZE) : 1
      }
    });
  } catch (err) {
    dispatch({
      type: FETCH_TOP_COMMUNITIES_FAILURE,
      payload: err?.message || "Failed to fetch top communities",
    });
  }
};

export const followCommunity = (idOrSlug) => async (dispatch) => {
  // We can dispatch optimistic update here if we want, but simpler to just request->success/fail
  // dispatch({ type: FOLLOW_COMMUNITY_REQUEST, payload: { id: idOrSlug } }); // Optional: for loading state on specific item

  try {
    const res = await api.post(`/communities/${idOrSlug}/follow/`);
    dispatch({
      type: FOLLOW_COMMUNITY_SUCCESS,
      payload: { id: idOrSlug, data: res.data }
    });
  } catch (err) {
    dispatch({
      type: FOLLOW_COMMUNITY_FAILURE,
      payload: { id: idOrSlug, error: err?.message }
    });
  }
}

export const unfollowCommunity = (idOrSlug) => async (dispatch) => {
  try {
    const res = await api.post(`/communities/${idOrSlug}/unfollow/`);
    dispatch({
      type: UNFOLLOW_COMMUNITY_SUCCESS,
      payload: { id: idOrSlug, data: res.data }
    });
  } catch (err) {
    dispatch({
      type: UNFOLLOW_COMMUNITY_FAILURE,
      payload: { id: idOrSlug, error: err?.message }
    });
  }
}

export const fetchCommunityDetail = (slug: string) => async (dispatch: any) => {
  dispatch({ type: FETCH_COMMUNITY_DETAIL_REQUEST });
  try {
    const res = await api.get(`/communities/${slug}/`);
    dispatch({
      type: FETCH_COMMUNITY_DETAIL_SUCCESS,
      payload: res.data,
    });
  } catch (err: any) {
    dispatch({
      type: FETCH_COMMUNITY_DETAIL_FAILURE,
      payload: err?.message || "Failed to fetch community details",
    });
  }
};

export const fetchCommunityPosts = (slug: string, page = 1) => async (dispatch: any) => {
  dispatch({ type: FETCH_COMMUNITY_POSTS_REQUEST, payload: { page } });
  try {
    const params = new URLSearchParams({
      page: page.toString(),
      page_size: "10",
      community: slug,
      sort: "new",
      t: Date.now().toString(),
      lang: "en",
    });
    const res = await api.get(`/posts/?${params.toString()}`);
    dispatch({
      type: FETCH_COMMUNITY_POSTS_SUCCESS,
      payload: {
        results: res.data.results || [],
        count: res.data.count,
        page,
        totalPages: res.data.count ? Math.ceil(res.data.count / 10) : 1,
      },
    });
  } catch (err: any) {
    dispatch({
      type: FETCH_COMMUNITY_POSTS_FAILURE,
      payload: err?.message || "Failed to fetch community posts",
    });
  }
};

export const uploadMedia = (file: { uri: string; name: string; type: string; size: number }) => async (dispatch: any) => {
  try {
    // Stage 1: Get Presigned URL
    const presignRes = await api.post("/media/presign/", {
      type: "post_gallery",
      filename: file.name || `image_${Date.now()}.jpg`,
      contentType: file.type || "image/jpeg",
      size: file.size || 0,
    });

    const { url, fields, publicUrl, key } = presignRes.data;

    // Stage 2: Upload to S3
    const formData = new FormData();
    Object.entries(fields).forEach(([k, v]) => {
      formData.append(k, v as string);
    });
    // @ts-ignore
    formData.append("file", {
      uri: file.uri,
      name: file.name || `image_${Date.now()}.jpg`,
      type: file.type || "image/jpeg",
    });

    const response = await fetch(url, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error("S3 Upload failed");
    }

    return { publicUrl, key };
  } catch (err: any) {
    console.error("Upload error:", err);
    throw err;
  }
};

export const createPost = (postData: any) => async (dispatch: any) => {
  dispatch({ type: CREATE_POST_REQUEST });
  try {
    const res = await api.post("/posts/", postData);
    dispatch({
      type: CREATE_POST_SUCCESS,
      payload: res.data,
    });
    return res.data;
  } catch (err: any) {
    const errorMsg = err?.response?.data?.message || err?.message || "Failed to create post";
    dispatch({
      type: CREATE_POST_FAILURE,
      payload: errorMsg,
    });
    throw new Error(errorMsg);
  }
};

