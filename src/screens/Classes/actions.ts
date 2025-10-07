import api from "../../Networks/axios"; // Adjust the import based on your project structure
export const EXPLORE_REQUEST = "EXPLORE_REQUEST";
export const EXPLORE_SUCCESS = "EXPLORE_SUCCESS";
export const EXPLORE_FAILURE = "EXPLORE_FAILURE";
export const BOOKINGS_REQUEST = "BOOKINGS_REQUEST";
export const BOOKINGS_SUCCESS = "BOOKINGS_SUCCESS";
export const BOOKINGS_FAILURE = "BOOKINGS_FAILURE";

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

export const classesExploreList = (page, pageSize, callback) => async (dispatch) => {
    dispatch(exploreRequest());
    try {
        console.log(`Fetching Explore Classes: page=${page}, pageSize=${pageSize}`);
        const response = await api.get(
            `public/classes/?status=published&ordering=-updated_at&page=${page}&page_size=${pageSize}`
        );
        console.log("Explore Classes Response:", response.data);
        const hasMore = !!response.data.next; // Check if there's more data
        dispatch(exploreSuccess(response.data.results, hasMore));
        if (callback) callback({ success: true, data: response.data.results });
    } catch (error) {
        console.error("Explore Classes API Error:", error);
        dispatch(exploreFailure(error.message));
        if (callback) callback({ success: false, error: error.message });
    }
};

export const classesBookingsList = (page, pageSize, callback) => async (dispatch) => {
    dispatch(bookingsRequest());
    try {
        console.log(`Fetching Bookings: page=${page}, pageSize=${pageSize}`);
        const response = await api.get(
            `public/my/bookings/?when=all&ordering=-updated_at&page=${page}&page_size=${pageSize}`
        );
        console.log("Bookings Response:", response.data);
        const hasMore = !!response.data.next; // Check if there's more data
        dispatch(bookingsSuccess(response.data.results, hasMore));
        if (callback) callback({ success: true, data: response.data.results });
    } catch (error) {
        console.error("Bookings API Error:", error);
        dispatch(bookingsFailure(error.message));
        if (callback) callback({ success: false, error: error.message });
    }
};
