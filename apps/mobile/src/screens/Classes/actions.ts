import api from "../../Networks/axios";

// =============== ACTION TYPES ===============
export const EXPLORE_REQUEST = "EXPLORE_REQUEST";
export const EXPLORE_SUCCESS = "EXPLORE_SUCCESS";
export const EXPLORE_FAILURE = "EXPLORE_FAILURE";

export const BOOKINGS_REQUEST = "BOOKINGS_REQUEST";
export const BOOKINGS_SUCCESS = "BOOKINGS_SUCCESS";
export const BOOKINGS_FAILURE = "BOOKINGS_FAILURE";

export const FILTERED_EXPLORE_REQUEST = "FILTERED_EXPLORE_REQUEST";
export const FILTERED_EXPLORE_SUCCESS = "FILTERED_EXPLORE_SUCCESS";
export const FILTERED_EXPLORE_FAILURE = "FILTERED_EXPLORE_FAILURE";

export const MY_BOOKINGS_REQUEST = "MY_BOOKINGS_REQUEST";
export const MY_BOOKINGS_SUCCESS = "MY_BOOKINGS_SUCCESS";
export const MY_BOOKINGS_FAILURE = "MY_BOOKINGS_FAILURE";

export const SEARCH_CLASSES_REQUEST = "SEARCH_CLASSES_REQUEST";
export const SEARCH_CLASSES_SUCCESS = "SEARCH_CLASSES_SUCCESS";
export const SEARCH_CLASSES_FAILURE = "SEARCH_CLASSES_FAILURE";

export const SEARCH_BOOKINGS_REQUEST = "SEARCH_BOOKINGS_REQUEST";
export const SEARCH_BOOKINGS_SUCCESS = "SEARCH_BOOKINGS_SUCCESS";
export const SEARCH_BOOKINGS_FAILURE = "SEARCH_BOOKINGS_FAILURE";

export const SLOTS_REQUEST = "SLOTS_REQUEST";
export const SLOTS_SUCCESS = "SLOTS_SUCCESS";
export const SLOTS_FAILURE = "SLOTS_FAILURE";

export const BOOK_SLOT_REQUEST = "BOOK_SLOT_REQUEST";
export const BOOK_SLOT_SUCCESS = "BOOK_SLOT_SUCCESS";
export const BOOK_SLOT_FAILURE = "BOOK_SLOT_FAILURE";

export const RESCHEDULE_REQUEST = "RESCHEDULE_REQUEST";
export const RESCHEDULE_SUCCESS = "RESCHEDULE_SUCCESS";
export const RESCHEDULE_FAILURE = "RESCHEDULE_FAILURE";

export const CANCEL_BOOKING_REQUEST = "CANCEL_BOOKING_REQUEST";
export const CANCEL_BOOKING_SUCCESS = "CANCEL_BOOKING_SUCCESS";
export const CANCEL_BOOKING_FAILURE = "CANCEL_BOOKING_FAILURE";

export const RELEASE_HOLD_REQUEST = "RELEASE_HOLD_REQUEST";
export const RELEASE_HOLD_SUCCESS = "RELEASE_HOLD_SUCCESS";
export const RELEASE_HOLD_FAILURE = "RELEASE_HOLD_FAILURE";

export const TUTOR_LIST_REQUEST = "TUTOR_LIST_REQUEST";
export const TUTOR_LIST_SUCCESS = "TUTOR_LIST_SUCCESS";
export const TUTOR_LIST_FAILURE = "TUTOR_LIST_FAILURE";

// =============== HELPERS ===============
const computeHasMore = (
  count: number,
  page: number,
  pageSize: number,
  currentLen: number
) => {
  const fetched = (page - 1) * pageSize + currentLen;
  return fetched < count;
};

export const classesExploreList =
  (page = 1, pageSize = 10, subject = "", timezone = "", callback) =>
  async (dispatch) => {
    dispatch({ type: EXPLORE_REQUEST });

    try {
      let url = `public/classes/?status=published&ordering=-updated_at&page=${page}&page_size=${pageSize}`;

      // subject support
      if (subject) {
        url += `&subject=${encodeURIComponent(subject)}`;
      }

      // timezone support
      if (timezone) {
        url += `&user_timezone=${encodeURIComponent(timezone)}`;
      }

      const res = await api.get(url);

      const results = res.data?.results || [];
      const count = Number(res.data?.count || 0);
      const hasMore = count > page * pageSize;

      dispatch({
        type: EXPLORE_SUCCESS,
        payload: { data: results, hasMore, page },
      });

      callback?.({ success: true, data: results });
    } catch (error) {
      dispatch({
        type: EXPLORE_FAILURE,
        payload: error?.response?.data?.detail || "Error",
      });

      callback?.({ success: false });
    }
  };




// =============== EXPLORE (BASE) ===============
// export const classesExploreList =
//   (page = 1, pageSize = 10, callback?: (res: any) => void) =>
//   async (dispatch) => {
//     dispatch({ type: EXPLORE_REQUEST });
//     try {
//       const url = `public/classes/?status=published&ordering=-updated_at&page=${page}&page_size=${pageSize}`;
//       const res = await api.get(url);
//       const results = res.data?.results || [];
//       const count = Number(res.data?.count || 0);
//       const hasMore = computeHasMore(count, page, pageSize, results.length);

//       dispatch({
//         type: EXPLORE_SUCCESS,
//         payload: { data: results, hasMore, page },
//       });
//       callback?.({ success: true, data: results, page });
//     } catch (error: any) {
//       const message = error?.response?.data?.detail || error?.message || "Error";
//       dispatch({ type: EXPLORE_FAILURE, payload: message });
//       callback?.({ success: false, error: message });
//     }
//   };

export const classesBookingsList =
  (
    page = 1,
    pageSize = 10,
    status: string = "",
    timezone: string = "",
    callback?: (res: any) => void
  ) =>
  async (dispatch) => {
    dispatch({ type: BOOKINGS_REQUEST });
    try {
      let url = `public/my/bookings/?when=all&ordering=-updated_at&page=${page}&page_size=${pageSize}`;

      if (status) url += `&status=${status}`;
      if (timezone) url += `&user_timezone=${encodeURIComponent(timezone)}`;

      const res = await api.get(url);
      const results = res.data?.results || [];
      const count = Number(res.data?.count || 0);
      const hasMore = count > page * pageSize;

      dispatch({
        type: BOOKINGS_SUCCESS,
        payload: { data: results, hasMore, page },
      });

      callback?.({ success: true, data: results });
    } catch (error: any) {
      const message =
        error?.response?.data?.detail || error?.message || "Error";
      dispatch({ type: BOOKINGS_FAILURE, payload: message });
      callback?.({ success: false, error: message });
    }
  };


// =============== MY BOOKINGS (BASE) ===============
// export const classesBookingsList =
//   (page = 1, pageSize = 10, callback?: (res: any) => void) =>
//   async (dispatch) => {
//     dispatch({ type: BOOKINGS_REQUEST });
//     try {
//       const url = `public/my/bookings/?when=all&ordering=-updated_at&page=${page}&page_size=${pageSize}`;
//       const res = await api.get(url);
//       const results = res.data?.results || [];
//       const count = Number(res.data?.count || 0);
//       const hasMore = computeHasMore(count, page, pageSize, results.length);

//       dispatch({
//         type: BOOKINGS_SUCCESS,
//         payload: { data: results, hasMore, page },
//       });
//       callback?.({ success: true, data: results, page });
//     } catch (error: any) {
//       const message = error?.response?.data?.detail || error?.message || "Error";
//       dispatch({ type: BOOKINGS_FAILURE, payload: message });
//       callback?.({ success: false, error: message });
//     }
//   };

// =============== EXPLORE (FILTER) ===============
export const filteredClassesExploreList =
  (filters: any = {}, page = 1, pageSize = 10, subject = "", callback) =>
  async (dispatch) => {
    dispatch({ type: FILTERED_EXPLORE_REQUEST });

    try {
      const params = new URLSearchParams({
        status: "published",
        ordering: "-updated_at",
        page: String(page),
        page_size: String(pageSize),
      });

      // apply filters
      if (filters?.skillLevel) params.append("skill_level", filters.skillLevel);
      if (filters?.classType) params.append("type", filters.classType);
      if (filters?.language) params.append("language", filters.language);
      if (filters?.schedule) params.append("schedule_type", filters.schedule);
      if (filters?.minPrice) params.append("price_min", String(filters.minPrice));
      if (filters?.maxPrice) params.append("price_max", String(filters.maxPrice));

      // ⭐ add subject
      if (subject) {
        params.append("subject", subject);
      }

      const url = `public/classes/?${params.toString()}`;

      const res = await api.get(url);
      const results = res.data?.results || [];
      const count = Number(res.data?.count || 0);
      const hasMore = count > page * pageSize;

      dispatch({
        type: FILTERED_EXPLORE_SUCCESS,
        payload: { data: results, hasMore, page },
      });

      callback?.({ success: true, data: results, url, page });
    } catch (error) {
      const message =
        error?.response?.data?.detail || error?.message || "Error";

      dispatch({ type: FILTERED_EXPLORE_FAILURE, payload: message });

      callback?.({ success: false, error: message });
    }
  };


// =============== MY BOOKINGS (FILTER) ===============
export const fetchFilteredBookings =
  (filters: any = {}, page = 1, pageSize = 10, callback?: (res: any) => void) =>
  async (dispatch) => {
    dispatch({ type: MY_BOOKINGS_REQUEST });
    try {
      const params = new URLSearchParams({
        ordering: "-updated_at",
        page: String(page),
        page_size: String(pageSize),
      });

      if (filters?.status) params.append("status", filters.status);
      if (filters?.when) params.append("when", filters.when);
      else params.append("when", "all");

      const url = `public/my/bookings/?${params.toString()}`;
      const res = await api.get(url);
      const results = res.data?.results || [];
      const count = Number(res.data?.count || 0);
      const hasMore = computeHasMore(count, page, pageSize, results.length);

      dispatch({
        type: MY_BOOKINGS_SUCCESS,
        payload: { data: results, hasMore, page },
      });
      callback?.({ success: true, data: results, url, page });
    } catch (error: any) {
      const message = error?.response?.data?.detail || error?.message || "Error";
      dispatch({ type: MY_BOOKINGS_FAILURE, payload: message });
      callback?.({ success: false, error: message });
    }
  };

// =============== SEARCH CLASSES ===============
export const searchClasses =
  (query = "", page = 1, pageSize = 10, subject = "", callback) =>
  async (dispatch) => {
    dispatch({ type: SEARCH_CLASSES_REQUEST });

    try {
      const q = query.trim();

      let url = `public/classes/?q=${encodeURIComponent(
        q
      )}&status=published&ordering=-updated_at&page=${page}&page_size=${pageSize}`;

      // Add subject in search
      if (subject) {
        url += `&subject=${encodeURIComponent(subject)}`;
      }

      const res = await api.get(url);

      const results = res.data?.results || [];
      const count = Number(res.data?.count || 0);
      const hasMore = count > page * pageSize;

      dispatch({
        type: SEARCH_CLASSES_SUCCESS,
        payload: { data: results, hasMore, page },
      });

      callback?.({ success: true, data: results, url, page });
    } catch (error) {
      const message =
        error?.response?.data?.detail || error?.message || "Error";

      dispatch({ type: SEARCH_CLASSES_FAILURE, payload: message });

      callback?.({ success: false, error: message });
    }
  };


// =============== SEARCH BOOKINGS ===============
export const searchBookings =
  (query = "", page = 1, pageSize = 10, callback?: (res: any) => void) =>
  async (dispatch) => {
    dispatch({ type: SEARCH_BOOKINGS_REQUEST });
    try {
      const q = query.trim();
      const url = `public/my/bookings/?q=${encodeURIComponent(
        q
      )}&when=all&ordering=-updated_at&page=${page}&page_size=${pageSize}`;

      const res = await api.get(url);
      const results = res.data?.results || [];
      const count = Number(res.data?.count || 0);
      const hasMore = computeHasMore(count, page, pageSize, results.length);

      dispatch({
        type: SEARCH_BOOKINGS_SUCCESS,
        payload: { data: results, hasMore, page },
      });
      callback?.({ success: true, data: results, url, page });
    } catch (error: any) {
      const message = error?.response?.data?.detail || error?.message || "Error";
      dispatch({ type: SEARCH_BOOKINGS_FAILURE, payload: message });
      callback?.({ success: false, error: message });
    }
  };

// =============== SLOTS LIST ===============
export const SLOTS_LIST_ENDPOINT = "public/slots/";
export const slotsRequest = () => ({ type: SLOTS_REQUEST });
export const slotsSuccess = (data: any[]) => ({ type: SLOTS_SUCCESS, payload: { data } });
export const slotsFailure = (error: string) => ({ type: SLOTS_FAILURE, payload: error });

export const slotsList =
  (
    offeringId: number | string,
    date: string,
    user_timezone: string,
    tutor_timezone: string,
    callback?: (res: any) => void
  ) =>
  async (dispatch) => {
    dispatch(slotsRequest());
    try {
      const encodedUserTZ = encodeURIComponent(user_timezone);
      const encodedTutorTZ = encodeURIComponent(tutor_timezone);
      const url = `${SLOTS_LIST_ENDPOINT}?offering_id=${offeringId}&date=${date}&user_timezone=${encodedUserTZ}&tutor_timezone=${encodedTutorTZ}`;
      const response = await api.get(url);
      dispatch(slotsSuccess(response.data?.slots || []));
      callback?.({ success: true, data: response.data });
    } catch (error: any) {
      const message = error?.response?.data?.detail || error?.message || "Error";
      dispatch(slotsFailure(message));
      callback?.({ success: false, error: message });
    }
  };

// =============== BOOK SLOT ===============
export const BOOK_SLOT_ENDPOINT = "public/bookings/create/";
export const bookSlotRequest = () => ({ type: BOOK_SLOT_REQUEST });
export const bookSlotSuccess = (res: any) => ({ type: BOOK_SLOT_SUCCESS, payload: res?.user });
export const bookSlotFailure = (error: string) => ({ type: BOOK_SLOT_FAILURE, payload: error });

const bookApi = (credentials: any) => api.post(BOOK_SLOT_ENDPOINT, credentials);

export const bookSlot =
  (credentials: any, callback?: (res: any) => void) =>
  async (dispatch) => {
    dispatch(bookSlotRequest());
    try {
      const response: any = await bookApi(credentials);
      dispatch(bookSlotSuccess(response.data));
      callback?.({ success: true, data: response.data });
    } catch (error: any) {
      const message = error?.response?.data?.detail || error?.message || "Error";
      dispatch(bookSlotFailure(message));
      callback?.({ success: false, error: message });
    }
  };

// =============== RESCHEDULE BOOKING ===============
export const rescheduleRequest = () => ({ type: RESCHEDULE_REQUEST });
export const rescheduleSuccess = (data: any) => ({ type: RESCHEDULE_SUCCESS, payload: data });
export const rescheduleFailure = (error: string) => ({ type: RESCHEDULE_FAILURE, payload: error });

export const rescheduleBooking =
  (bookingId: number | string, credentials: any, callback?: (res: any) => void) =>
  async (dispatch) => {
    dispatch(rescheduleRequest());
    try {
      const response = await api.patch(`bookings/tutor/${bookingId}/reschedule/`, credentials);
      dispatch(rescheduleSuccess(response.data));
      callback?.({ success: true, data: response.data });
    } catch (error: any) {
      const message = error?.response?.data?.detail || error?.message || "Error";
      dispatch(rescheduleFailure(message));
      callback?.({ success: false, error: message });
    }
  };

// =============== CANCEL BOOKING ===============
export const cancelBookingRequest = () => ({ type: CANCEL_BOOKING_REQUEST });
export const cancelBookingSuccess = (data: any) => ({ type: CANCEL_BOOKING_SUCCESS, payload: data });
export const cancelBookingFailure = (error: string) => ({ type: CANCEL_BOOKING_FAILURE, payload: error });

export const cancelBooking =
  (offeringId: number | string, payload: any, callback?: (res: any) => void) =>
  async (dispatch) => {
    dispatch(cancelBookingRequest());
    try {
      const response = await api.patch(`bookings/tutor/${offeringId}/cancel/`, payload);
      dispatch(cancelBookingSuccess(response.data));
      callback?.({ success: true, data: response.data });
    } catch (error: any) {
      const message = error?.response?.data?.detail || error?.message || "Error";
      dispatch(cancelBookingFailure(message));
      callback?.({ success: false, error: message });
    }
  };

// =============== RELEASE HOLD ===============
export const releaseHoldRequest = () => ({ type: RELEASE_HOLD_REQUEST });
export const releaseHoldSuccess = (data: any) => ({ type: RELEASE_HOLD_SUCCESS, payload: data });
export const releaseHoldFailure = (error: string) => ({ type: RELEASE_HOLD_FAILURE, payload: error });

export const releaseHoldAction =
  (tutorId: number | string, callback?: (res: any) => void) =>
  async (dispatch) => {
    dispatch(releaseHoldRequest());
    try {
      const payload = { id: tutorId };
      const response = await api.post(`bookings/tutor/${tutorId}/release_hold/`, payload);
      dispatch(releaseHoldSuccess(response.data));
      callback?.({ success: true, data: response.data });
    } catch (error: any) {
      const message = error?.response?.data?.detail || error?.message || "Error";
      dispatch(releaseHoldFailure(message));
      callback?.({ success: false, error: message });
    }
  };


  export const tutorListRequest = () => ({ type: TUTOR_LIST_REQUEST });
export const tutorListSuccess = (data, hasMore) => ({
  type: TUTOR_LIST_SUCCESS,
  payload: { data, hasMore },
});
export const tutorListFailure = (error) => ({
  type: TUTOR_LIST_FAILURE,
  payload: error,
});



  export const tutorDataList = (tutorId, page, callback) => async (dispatch) => {
  dispatch(tutorListRequest());
  try {
    // console.log(`Fetching Tutor Data: tutorId=${tutorId}, page=${page}`);
    const response = await api.get(`public/tutors/${tutorId}/?page=${page}`);
    // console.log("Tutor Data Response:", response.data);
    const hasMore = !!response.data.next; // Check if there's more data
    dispatch(tutorListSuccess(response.data, hasMore));
    if (callback) callback({ success: true, data: response.data });
  } catch (error) {
    console.error("Tutor Data API Error:", error);
    dispatch(tutorListFailure(error.message));
    if (callback) callback({ success: false, error: error.message });
  }
};

export const classesHomeList =
  (page = 1, timezone = "", callback) =>
  async () => {
    try {
      // Hardcoded subjects
      const SUBJECTS = [
        "Everyday Vedanta",
        "Mantra Chanting",
        "Sanatan Teaching/",
      ];

      let url = `/public/classes/?status=published&ordering=updated_at&page=${page}&page_size=15`;

      SUBJECTS.forEach((s) => {
        url += `&subject=${encodeURIComponent(s)}`;
      });

      if (timezone) {
        url += `&user_timezone=${encodeURIComponent(timezone)}`;
      }

      console.log("🏠 HOME API URL:", url);

      const res = await api.get(url);

      const results = res.data?.results || [];

      callback?.({
        success: true,
        data: results,
      });
    } catch (error) {
      callback?.({
        success: false,
        error: error?.response?.data || error?.message,
      });
    }
  };

