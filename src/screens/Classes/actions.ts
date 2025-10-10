import api from "../../Networks/axios"; // Adjust the import based on your project structure
export const EXPLORE_REQUEST = "EXPLORE_REQUEST";
export const EXPLORE_SUCCESS = "EXPLORE_SUCCESS";
export const EXPLORE_FAILURE = "EXPLORE_FAILURE";
export const BOOKINGS_REQUEST = "BOOKINGS_REQUEST";
export const BOOKINGS_SUCCESS = "BOOKINGS_SUCCESS";
export const BOOKINGS_FAILURE = "BOOKINGS_FAILURE";
export const TUTOR_LIST_REQUEST = "TUTOR_LIST_REQUEST";
export const TUTOR_LIST_SUCCESS = "TUTOR_LIST_SUCCESS";
export const TUTOR_LIST_FAILURE = "TUTOR_LIST_FAILURE";
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





export const exploreRequest = () => ({ type: EXPLORE_REQUEST });
export const exploreSuccess = (data, hasMore) => ({
  type: EXPLORE_SUCCESS,
  payload: { data, hasMore },
});
export const exploreFailure = (error) => ({
  type: EXPLORE_FAILURE,
  payload: error,
});

export const bookingsRequest = () => ({ type: BOOKINGS_REQUEST });
export const bookingsSuccess = (data, hasMore) => ({
  type: BOOKINGS_SUCCESS,
  payload: { data, hasMore },
});
export const bookingsFailure = (error) => ({
  type: BOOKINGS_FAILURE,
  payload: error,
});

export const tutorListRequest = () => ({ type: TUTOR_LIST_REQUEST });
export const tutorListSuccess = (data, hasMore) => ({
  type: TUTOR_LIST_SUCCESS,
  payload: { data, hasMore },
});
export const tutorListFailure = (error) => ({
  type: TUTOR_LIST_FAILURE,
  payload: error,
});

export const slotsRequest = () => ({ type: SLOTS_REQUEST });
export const slotsSuccess = (data) => ({
  type: SLOTS_SUCCESS,
  payload: { data },
});
export const slotsFailure = (error) => ({
  type: SLOTS_FAILURE,
  payload: error,
});

export const bookSlotRequest = () => ({ type: BOOK_SLOT_REQUEST });
export const bookSlotSuccess = (res) => ({
  type: BOOK_SLOT_SUCCESS,
  payload: res.user,
});
export const bookSlotFailure = (error) => ({
  type: BOOK_SLOT_FAILURE,
  payload: error,
});

export const rescheduleRequest = () => ({ type: RESCHEDULE_REQUEST });
export const rescheduleSuccess = (data) => ({
  type: RESCHEDULE_SUCCESS,
  payload: data,
});
export const rescheduleFailure = (error) => ({
  type: RESCHEDULE_FAILURE,
  payload: error,
});

export const cancelBookingRequest = () => ({ type: CANCEL_BOOKING_REQUEST });
export const cancelBookingSuccess = (data) => ({
  type: CANCEL_BOOKING_SUCCESS,
  payload: data,
});
export const cancelBookingFailure = (error) => ({
  type: CANCEL_BOOKING_FAILURE,
  payload: error,
});

export const filteredExploreRequest = () => ({ type: FILTERED_EXPLORE_REQUEST });
export const filteredExploreSuccess = (data, hasMore) => ({
  type: FILTERED_EXPLORE_SUCCESS,
  payload: { data, hasMore },
});
export const filteredExploreFailure = (error) => ({
  type: FILTERED_EXPLORE_FAILURE,
  payload: error,
});

export const myBookingsRequest = () => ({ type: MY_BOOKINGS_REQUEST });
export const myBookingsSuccess = (data, hasMore) => ({
  type: MY_BOOKINGS_SUCCESS,
  payload: { data, hasMore },
});
export const myBookingsFailure = (error) => ({
  type: MY_BOOKINGS_FAILURE,
  payload: error,
});

export const searchClassesRequest = () => ({ type: SEARCH_CLASSES_REQUEST });
export const searchClassesSuccess = (data, hasMore) => ({
  type: SEARCH_CLASSES_SUCCESS,
  payload: { data, hasMore },
});
export const searchClassesFailure = (error) => ({
  type: SEARCH_CLASSES_FAILURE,
  payload: error,
});

export const searchBookingsRequest = () => ({ type: SEARCH_BOOKINGS_REQUEST });
export const searchBookingsSuccess = (data, hasMore) => ({
  type: SEARCH_BOOKINGS_SUCCESS,
  payload: { data, hasMore },
});
export const searchBookingsFailure = (error) => ({
  type: SEARCH_BOOKINGS_FAILURE,
  payload: error,
});



export const classesExploreList =
  (page, pageSize, callback) => async (dispatch) => {
    dispatch(exploreRequest());
    try {
      // console.log(`Fetching Explore Classes: page=${page}, pageSize=${pageSize}`);
      const response = await api.get(
        `public/classes/?status=published&ordering=-updated_at&page=${page}&page_size=${pageSize}`
      );
      // console.log("Explore Classes Response:", response.data);
      const hasMore = !!response.data.next; // Check if there's more data
      dispatch(exploreSuccess(response.data.results, hasMore));
      if (callback) callback({ success: true, data: response.data.results });
    } catch (error) {
      console.error("Explore Classes API Error:", error);
      dispatch(exploreFailure(error.message));
      if (callback) callback({ success: false, error: error.message });
    }
  };

export const classesBookingsList =
  (page, pageSize, callback) => async (dispatch) => {
    dispatch(bookingsRequest());
    try {
      // console.log(`Fetching Bookings: page=${page}, pageSize=${pageSize}`);
      const response = await api.get(
        `public/my/bookings/?when=all&ordering=-updated_at&page=${page}&page_size=${pageSize}`
      );
      // console.log("Bookings Response:", response.data);
      const hasMore = !!response.data.next; // Check if there's more data
      dispatch(bookingsSuccess(response.data.results, hasMore));
      if (callback) callback({ success: true, data: response.data.results });
    } catch (error) {
      console.error("Bookings API Error:", error);
      dispatch(bookingsFailure(error.message));
      if (callback) callback({ success: false, error: error.message });
    }
  };

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

export const slotsList =
  (offeringId, date, user_timezone, tutor_timezone, callback) =>
  async (dispatch) => {
    dispatch(slotsRequest());
    try {
      const encodedUserTZ = encodeURIComponent(user_timezone);
      const encodedTutorTZ = encodeURIComponent(tutor_timezone);
      const url = `public/slots/?offering_id=${offeringId}&date=${date}&user_timezone=${encodedUserTZ}&tutor_timezone=${encodedTutorTZ}`;
      console.log("url >>>>>", url);

      const response = await api.get(url);
      console.log("response of slots >>>>>>>>", response.data);

      // ✅ Pass only the slots array to reducer
      dispatch(slotsSuccess(response.data.slots || []));

      if (callback) callback({ success: true, data: response.data });
    } catch (error) {
      console.error("Slot Data API Error:", error);
      dispatch(slotsFailure(error.message));
      if (callback) callback({ success: false, error: error.message });
    }
  };

export const bookSlot = (credentials, callback) => async (dispatch) => {
  dispatch(bookSlotRequest());
  try {
    const response: any = await bookApi(credentials);
    dispatch(bookSlotSuccess(response.data));
    if (callback) callback({ success: true, data: response.data });
  } catch (error) {
    dispatch(bookSlotFailure(error.message));
    if (callback) callback({ success: false, error: error.message });
  }
};


export const rescheduleBooking = (Id, credentials, callback) => async (dispatch) => {
  dispatch(rescheduleRequest());
  try {
    const response = await api.patch(`bookings/tutor/${Id}/reschedule/`, credentials);
    dispatch(rescheduleSuccess(response.data));
    if (callback) callback({ success: true, data: response.data });
  } catch (error) {
    const message = error.response?.data?.detail || error.message;
    dispatch(rescheduleFailure(message));
    if (callback) callback({ success: false, error: message });
  }
};


export const cancelBooking =
  (tutorId,payload, callback) => async (dispatch) => {
    dispatch(cancelBookingRequest());
    try {
      const response = await api.patch(`bookings/tutor/${tutorId}/cancel/`, payload);
      dispatch(cancelBookingSuccess(response.data));
      if (callback) callback({ success: true, data: response.data });
    } catch (error) {
      const message = error.response?.data?.detail || error.message;
      dispatch(cancelBookingFailure(message));
      if (callback) callback({ success: false, error: message });
    }
  };

  export const filteredClassesExploreList =
  (filters, page, pageSize, callback) => async (dispatch) => {
    dispatch(filteredExploreRequest());
    try {
      const params = new URLSearchParams();

      // ✅ Mandatory fields
      params.append("status", "published");
      params.append("ordering", filters?.sort || "-updated_at");
      params.append("page", page);
      params.append("page_size", pageSize);

      // ✅ Optional filters (only if provided)
      if (filters?.skillLevel) params.append("skill_level", filters.skillLevel);
      if (filters?.classType) params.append("type", filters.classType);
      if (filters?.language) params.append("language", filters.language);
      if (filters?.schedule) params.append("schedule_type", filters.schedule);
      if (filters?.minPrice) params.append("price_min", filters.minPrice);
      if (filters?.maxPrice) params.append("price_max", filters.maxPrice);

      const url = `public/classes/?${params.toString()}`;
      console.log("🎯 Filtered Explore URL =>", url);

      const response = await api.get(url);
      const hasMore = !!response.data.next;

      dispatch(filteredExploreSuccess(response.data.results, hasMore));

      if (callback)
        callback({ success: true, data: response.data.results, url: url });
    } catch (error) {
      const message = error.response?.data?.detail || error.message;
      console.error("Filtered Explore API Error:", message);
      dispatch(filteredExploreFailure(message));
      if (callback) callback({ success: false, error: message });
    }
  };

export const fetchFilteredBookings =
  (filters, page, pageSize, callback) => async (dispatch) => {
    dispatch(myBookingsRequest());
    try {
      const params = new URLSearchParams();

      // ✅ Add optional filters if available
      if (filters?.status) params.append("status", filters.status);
      if (filters?.when) params.append("when", filters.when);

      // ✅ Default ordering
      params.append("ordering", filters?.sort || "-updated_at");
      params.append("page", page);
      params.append("page_size", pageSize);

      const url = `public/my/bookings/?${params.toString()}`;
      console.log("📦 My Bookings API URL:", url);

      const response = await api.get(url);
      const hasMore = !!response.data.next;

      dispatch(myBookingsSuccess(response.data.results, hasMore));

      if (callback)
        callback({ success: true, data: response.data.results, url: url });
    } catch (error) {
      const message = error.response?.data?.detail || error.message;
      dispatch(myBookingsFailure(message));
      if (callback) callback({ success: false, error: message });
    }
  };

export const searchClasses =
  (query, page = 1, pageSize = 10, callback) =>
  async (dispatch) => {
    dispatch(searchClassesRequest());
    try {
      const url = `public/classes/?q=${encodeURIComponent(
        query
      )}&status=published&ordering=-updated_at&page=${page}&page_size=${pageSize}`;

      console.log("🔍 Search Classes URL:", url);

      const response = await api.get(url);
      const hasMore = !!response.data.next;

      dispatch(searchClassesSuccess(response.data.results, hasMore));

      if (callback)
        callback({ success: true, data: response.data.results, url });
    } catch (error) {
      const message = error.response?.data?.detail || error.message;
      console.error("Search Classes API Error:", message);
      dispatch(searchClassesFailure(message));
      if (callback) callback({ success: false, error: message });
    }
  };


const bookApi = (credentials) => {
  console.log("loginApi called with:", credentials);
  return api.post("public/bookings/create/", credentials);
};


export const searchBookings =
  (query, page = 1, pageSize = 10, callback) =>
  async (dispatch) => {
    dispatch(searchBookingsRequest());
    try {
      const url = `public/my/bookings/?q=${encodeURIComponent(
        query
      )}&when=all&ordering=-updated_at&page=${page}&page_size=${pageSize}`;

      console.log("🔍 Search Bookings URL:", url);

      const response = await api.get(url);
      const hasMore = !!response.data.next;

      dispatch(searchBookingsSuccess(response.data.results, hasMore));

      if (callback)
        callback({ success: true, data: response.data.results, url });
    } catch (error) {
      const message = error.response?.data?.detail || error.message;
      console.error("Search Bookings API Error:", message);
      dispatch(searchBookingsFailure(message));
      if (callback) callback({ success: false, error: message });
    }
  };




