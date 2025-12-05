import api from "../../Networks/axios";

export const TRAVEL_REQUEST = "TRAVEL_REQUEST";
export const TRAVEL_SUCCESS = "TRAVEL_SUCCESS";
export const TRAVEL_FAILURE = "TRAVEL_FAILURE";
export const POOJA_REQUEST = "POOJA_REQUEST";
export const POOJA_SUCCESS = "POOJA_SUCCESS";
export const POOJA_FAILURE = "POOJA_FAILURE";
export const RETREAT_REQUEST = "RETREAT_REQUEST";
export const RETREAT_SUCCESS = "RETREAT_SUCCESS";
export const RETREAT_FAILURE = "RETREAT_FAILURE";
export const PRACTICE_TODAY_REQUEST = "PRACTICE_TODAY_REQUEST";
export const PRACTICE_TODAY_SUCCESS = "PRACTICE_TODAY_SUCCESS";
export const PRACTICE_TODAY_FAILURE = "PRACTICE_TODAY_FAILURE";
export const START_MANTRA_REQUEST = "START_MANTRA_REQUEST";
export const START_MANTRA_SUCCESS = "START_MANTRA_SUCCESS";
export const START_MANTRA_FAILURE = "START_MANTRA_FAILURE";
export const COMPLETE_MANTRA_REQUEST = "COMPLETE_MANTRA_REQUEST";
export const COMPLETE_MANTRA_SUCCESS = "COMPLETE_MANTRA_SUCCESS";
export const COMPLETE_MANTRA_FAILURE = "COMPLETE_MANTRA_FAILURE";
export const SUBMIT_DHARMA_REQUEST = "SUBMIT_DHARMA_REQUEST";
export const SUBMIT_DHARMA_SUCCESS = "SUBMIT_DHARMA_SUCCESS";
export const SUBMIT_DHARMA_FAILURE = "SUBMIT_DHARMA_FAILURE";
export const TRACK_PRACTICE_REQUEST = "TRACK_PRACTICE_REQUEST";
export const TRACK_PRACTICE_SUCCESS = "TRACK_PRACTICE_SUCCESS";
export const TRACK_PRACTICE_FAILURE = "TRACK_PRACTICE_FAILURE";
export const TRACKER_REQUEST = "TRACKER_REQUEST";
export const TRACKER_SUCCESS = "TRACKER_SUCCESS";
export const TRACKER_FAILURE = "TRACKER_FAILURE";
export const STREAKS_REQUEST = "STREAKS_REQUEST";
export const STREAKS_SUCCESS = "STREAKS_SUCCESS";
export const STREAKS_FAILURE = "STREAKS_FAILURE";
export const VIDEO_CATEGORIES_REQUEST = "VIDEO_CATEGORIES_REQUEST";
export const VIDEO_CATEGORIES_SUCCESS = "VIDEO_CATEGORIES_SUCCESS";
export const VIDEO_CATEGORIES_FAILURE = "VIDEO_CATEGORIES_FAILURE";
export const VIDEOS_REQUEST = "VIDEOS_REQUEST";
export const VIDEOS_SUCCESS = "VIDEOS_SUCCESS";
export const VIDEOS_FAILURE = "VIDEOS_FAILURE";
export const VIDEOS_RESET = "VIDEOS_RESET";


const LANGUAGE_CODE_MAP: Record<string, string> = {
  Bengali: "bn",
  English: "en",
  Gujarati: "gu",
  Hindi: "hi",
  Kannada: "kn",
  Malayalam: "ml",
  Marathi: "mr",
  Odia: "or",
  Tamil: "ta",
  Telugu: "te",
};

export const travelRequest = () => ({ type: TRAVEL_REQUEST });
export const travelSuccess = (res) => ({
  type: TRAVEL_SUCCESS,
  payload: res.user,
});
export const travelFailure = (error) => ({
  type: TRAVEL_FAILURE,
  payload: error,
});

export const poojaRequest = () => ({ type: POOJA_REQUEST });
export const poojaSuccess = (res) => ({
  type: POOJA_SUCCESS,
  payload: res.user,
});
export const poojaFailure = (error) => ({
  type: POOJA_FAILURE,
  payload: error,
});

export const retreatRequest = () => ({ type: RETREAT_REQUEST });
export const retreatSuccess = (res) => ({
  type: RETREAT_SUCCESS,
  payload: res.user,
});
export const retreatFailure = (error) => ({
  type: RETREAT_FAILURE,
  payload: error,
});

export const practiceTodayRequest = () => ({ type: PRACTICE_TODAY_REQUEST });
export const practiceTodaySuccess = (data) => ({
  type: PRACTICE_TODAY_SUCCESS,
  payload: data,
});
export const practiceTodayFailure = (error) => ({
  type: PRACTICE_TODAY_FAILURE,
  payload: error,
});

export const startMantraRequest = () => ({ type: START_MANTRA_REQUEST });
export const startMantraSuccess = (res) => ({ type: START_MANTRA_SUCCESS, payload: res });
export const startMantraFailure = (error) => ({ type: START_MANTRA_FAILURE, payload: error });

export const completeMantraRequest = () => ({ type: COMPLETE_MANTRA_REQUEST });
export const completeMantraSuccess = (res) => ({ type: COMPLETE_MANTRA_SUCCESS, payload: res });
export const completeMantraFailure = (error) => ({ type: COMPLETE_MANTRA_FAILURE, payload: error });


export const submitDharmaRequest = () => ({ type: SUBMIT_DHARMA_REQUEST });
export const submitDharmaSuccess = (res) => ({ type: SUBMIT_DHARMA_SUCCESS, payload: res });
export const submitDharmaFailure = (error) => ({ type: SUBMIT_DHARMA_FAILURE, payload: error });

export const updatePracticeTodayRequest = () => ({ type: TRACK_PRACTICE_REQUEST });
export const updatePracticeTodaySuccess = (data) => ({
  type: TRACK_PRACTICE_SUCCESS,
  payload: data,
});
export const updatePracticeTodayFailure = (error) => ({
  type: TRACK_PRACTICE_FAILURE,
  payload: error,
});

export const trackerRequest = () => ({ type: TRACKER_REQUEST });
export const trackerSuccess = (data) => ({
  type: TRACKER_SUCCESS,
  payload: data,
});
export const trackerFailure = (error) => ({
  type: TRACKER_FAILURE,
  payload: error,
});
export const videoCategoriesRequest = () => ({
  type: VIDEO_CATEGORIES_REQUEST,
});

export const videoCategoriesSuccess = (data) => ({
  type: VIDEO_CATEGORIES_SUCCESS,
  payload: data,
});

export const videoCategoriesFailure = (error) => ({
  type: VIDEO_CATEGORIES_FAILURE,
  payload: error,
});


export const videosRequest = () => ({ type: VIDEOS_REQUEST });
export const videosSuccess = (data, page) => ({
  type: VIDEOS_SUCCESS,
  payload: { data, page },
});
export const videosFailure = (error) => ({
  type: VIDEOS_FAILURE,
  payload: error,
});
export const videosReset = () => ({ type: VIDEOS_RESET });

export const streaksRequest = () => ({ type: STREAKS_REQUEST });
export const streaksSuccess = (data) => ({ type: STREAKS_SUCCESS, payload: data });
export const streaksFailure = (error) => ({ type: STREAKS_FAILURE, payload: error });

export const travelIntresetUser = (credentials, callback) => async (dispatch) => {
  dispatch(travelRequest());
  try {
    const response: any = await interestApi(credentials);
    dispatch(travelSuccess(response));
    if (callback) callback({ success: true, data: response });
  } catch (error) {
    dispatch(travelFailure(error.message));
    if (callback) callback({ success: false, error: error.message });
  }
};

export const poojaIntresetUser = (credentials, callback) => async (dispatch) => {
  dispatch(poojaRequest());
  try {
    const response: any = await interestApi(credentials);
    dispatch(poojaSuccess(response));
    if (callback) callback({ success: true, data: response });
  } catch (error) {
    dispatch(poojaFailure(error.message));
    if (callback) callback({ success: false, error: error.message });
  }
};

export const retreatIntresetUser = (credentials, callback) => async (dispatch) => {
  dispatch(retreatRequest());
  try {
    const response: any = await interestApi(credentials);
    dispatch(retreatSuccess(response));
    if (callback) callback({ success: true, data: response });
  } catch (error) {
    dispatch(retreatFailure(error.message));
    if (callback) callback({ success: false, error: error.message });
  }
};

const interestApi = (credentials) => {
  // console.log("loginApi called with:", credentials);
  return api.post("interests/", credentials);
};

export const getPracticeToday = (callback) => async (dispatch) => {
  dispatch(practiceTodayRequest());
  try {
    // Get device timezone dynamically
    const tz =
      Intl.DateTimeFormat().resolvedOptions().timeZone || "Asia/Kolkata";

    const response = await api.get(
      `practice/today/?tz=${encodeURIComponent(tz)}&locale=en`
    );

    console.log("practice today res >>>>>>>>", response.data);
    dispatch(practiceTodaySuccess(response.data));

    if (callback) callback({ success: true, data: response.data });
  } catch (error: any) {
    const message =
      error?.response?.data?.message || error.message || "Something went wrong";

    dispatch(practiceTodayFailure(message));
    if (callback) callback({ success: false, error: message });
  }
};


// export const getPracticeToday = (callback) => async (dispatch) => {
//   dispatch(practiceTodayRequest());
//   try {
//     const response = await api.get(
//       "practice/today/?tz=Asia/Calcutta&locale=en"
//     );
//     console.log("practice today res >>>>>>>>",response.data);
//     dispatch(practiceTodaySuccess(response.data));
//     if (callback) callback({ success: true, data: response.data });
//   } catch (error) {
//     dispatch(practiceTodayFailure(error.message));
//     if (callback) callback({ success: false, error: error.message });
//   }
// };

export const startMantraPractice = (payload, callback) => async (dispatch) => {
  dispatch(startMantraRequest());
  try {
    const response = await api.post("practice/started/", payload);
    dispatch(startMantraSuccess(response.data));

    // After starting mantra, refresh today’s practice
    dispatch(getPracticeToday((res) => {
      console.log("✅ Refreshed practice today after start:", res);
      if (callback) callback(res);
    }));
  } catch (error: any) {
    dispatch(startMantraFailure(error.message));
    if (callback) callback({ success: false, error: error.message });
  }
};

export const completeMantra = (payload, callback) => async (dispatch) => {
  dispatch(completeMantraRequest());
  try {
    const response = await api.post("practice/complete/", payload);
    dispatch(completeMantraSuccess(response.data));

    // Optionally refresh today's practice
    dispatch(getPracticeToday((res) => {
      if (callback) callback({ success: true, data: response.data, refreshed: res });
    }));
  } catch (error: any) {
    dispatch(completeMantraFailure(error.message));
    if (callback) callback({ success: false, error: error.message });
  }
};

export const submitDailyDharmaSetup = (payload, callback) => async (dispatch) => {
  dispatch(submitDharmaRequest());
  try {
    const response = await api.post("daily-dharma/setup/", payload);
    dispatch(submitDharmaSuccess(response.data));
    console.log("✅ Dharma setup success:", response.data);
    if (callback) callback({ success: true, data: response.data });
  } catch (error) {
    console.error("❌ Dharma setup failed:", error.message);
    dispatch(submitDharmaFailure(error.message));
    if (callback) callback({ success: false, error: error.message });
  }
};

export const trackDailyPractice = (payload, callback) => async (dispatch: any) => {
  dispatch({ type: TRACK_PRACTICE_REQUEST });
  try {
    const response = await api.post("daily-dharma/tracker/", payload);
    dispatch({ type: TRACK_PRACTICE_SUCCESS, payload: response.data });
    console.log("✅ Practice tracked successfully:", response.data);

    // Refresh today’s data after marking complete
    dispatch(getPracticeToday((res) => {
      console.log("🔁 Refreshed after tracking:", res);
      if (callback) callback({ success: true, data: response.data, refreshed: res });
    }));
  } catch (error: any) {
    console.error("❌ Practice tracking failed:", error.message);
    dispatch({ type: TRACK_PRACTICE_FAILURE, payload: error.message });
    if (callback) callback({ success: false, error: error.message });
  }
};

export const getDailyDharmaTracker = (callback) => async (dispatch) => {
  dispatch(trackerRequest());
  try {
    const response = await api.get("daily-dharma/tracker/");

    dispatch(trackerSuccess(response.data));

    if (callback)
      callback({ success: true, data: response.data });
  } catch (error) {
    const message = error?.response?.data?.message || error.message || "Something went wrong";
    console.error("❌ Error fetching daily dharma tracker:", message);

    dispatch(trackerFailure(message));

    if (callback)
      callback({ success: false, error: message });
  }
};

export const getPracticeStreaks = (callback) => async (dispatch) => {
  dispatch(streaksRequest());
  try {
 const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;

    const response = await api.get(`practice/streaks/?tz=${encodeURIComponent(tz)}`);
    console.log("🔥 Practice Streaks API Response >>>>", response.data);

    dispatch(streaksSuccess(response.data));

    if (callback) callback({ success: true, data: response.data });
  } catch (error) {
    const message =
      error?.response?.data?.message || error.message || "Something went wrong";
    console.error("❌ Error fetching practice streaks:", message);

    dispatch(streaksFailure(message));

    if (callback) callback({ success: false, error: message });
  }
};

export const getVideoCategoriesWithLanguages = (callback) => async (dispatch) => {
  dispatch(videoCategoriesRequest());
  try {
    const response = await api.get("videos/categories_with_languages/?_cacheBuster=" + Date.now());
    dispatch(videoCategoriesSuccess(response.data));

    console.log("🎥 Video Categories with Languages >>>", response.data);
    if (callback) callback({ success: true, data: response.data });
  } catch (error) {
    const message = error?.response?.data?.message || error.message || "Something went wrong";
    console.error("❌ Error fetching video categories:", message);
    dispatch(videoCategoriesFailure(message));
    if (callback) callback({ success: false, error: message });
  }
};


export const getVideos =
  (filters, callback) =>
  async (dispatch, getState) => {
    const {
      page = 1,
      per_page = 22, // ✅ updated per_page
      category = "All",
      language = "All",
      search = "",
      kidsHub = false,
    } = filters || {};

    const cacheBuster = Date.now();
    const isDefaultFeed =
      category === "All" && language === "All" && !search?.trim();

    if (page === 1) dispatch({ type: VIDEOS_RESET });
    dispatch({ type: VIDEOS_REQUEST });

    try {
      let url = "";

      // 🟢 Case 1: Default All / All Feed
      if (isDefaultFeed) {
        url = `videos/list_videos/?paginate=true&per_page=${per_page}&page=${page}&_cacheBuster=${cacheBuster}`;
      } else {
        // 🟡 Case 2: Filtered or Search Feed
        url = `videos/list_videos/?paginate=true&per_page=${per_page}&page=${page}&_cacheBuster=${cacheBuster}`;
        url += `&child_anime_filter=${kidsHub ? "true" : "false"}`;

        // Fetch categories from store
        const { videoCategoriesReducer } = getState();
        const categories = videoCategoriesReducer?.data?.categories || [];

        // Match category_name → category_id
        const matchedCategory = categories.find(
          (c) => c.category_name === category
        );
        const categoryId = matchedCategory?.category_id;

        // Map language → short code
        const LANGUAGE_CODE_MAP = {
          Bengali: "bn",
          English: "en",
          Gujarati: "gu",
          Hindi: "hi",
          Kannada: "kn",
          Malayalam: "ml",
          Marathi: "mr",
          Odia: "or",
          Tamil: "ta",
          Telugu: "te",
        };

        const languageCode =
          LANGUAGE_CODE_MAP[language] || language.toLowerCase();

        if (categoryId) url += `&category=${encodeURIComponent(categoryId)}`;
        if (language && language !== "All")
          url += `&language=${encodeURIComponent(languageCode)}`;
        if (search?.trim())
          url += `&search=${encodeURIComponent(search.trim())}`;
      }

      console.log("🌐 Fetching videos from:", url);

      const response = await api.get(url);
      const videos = response?.data?.results?.kalpx_videos || [];

      dispatch({
        type: VIDEOS_SUCCESS,
        payload: { data: videos, page },
      });

      console.log(
        `🎞️ ${videos.length} videos fetched (page ${page}) → ${
          isDefaultFeed
            ? "Default Feed"
            : search
            ? "Search Results"
            : "Filtered Feed"
        }`
      );

      if (callback) callback({ success: true, data: videos });
    } catch (error) {
      const message =
        error?.response?.data?.message ||
        error.message ||
        "Something went wrong while fetching videos.";
      console.error("❌ Error fetching videos:", message);

      dispatch({ type: VIDEOS_FAILURE, payload: message });
      if (callback) callback({ success: false, error: message });
    }
  };

