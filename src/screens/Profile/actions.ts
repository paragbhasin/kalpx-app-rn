import api from "../../Networks/axios";

// 🔹 Action Types
export const PROFILE_OPTIONS_REQUEST = "PROFILE_OPTIONS_REQUEST";
export const PROFILE_OPTIONS_SUCCESS = "PROFILE_OPTIONS_SUCCESS";
export const PROFILE_OPTIONS_FAILURE = "PROFILE_OPTIONS_FAILURE";

export const PROFILE_DETAILS_REQUEST = "PROFILE_DETAILS_REQUEST";
export const PROFILE_DETAILS_SUCCESS = "PROFILE_DETAILS_SUCCESS";
export const PROFILE_DETAILS_FAILURE = "PROFILE_DETAILS_FAILURE";

export const UPDATE_PROFILE_REQUEST = "UPDATE_PROFILE_REQUEST";
export const UPDATE_PROFILE_SUCCESS = "UPDATE_PROFILE_SUCCESS";
export const UPDATE_PROFILE_FAILURE = "UPDATE_PROFILE_FAILURE";

export const DELETE_ACCOUNT_REQUEST = "DELETE_ACCOUNT_REQUEST";
export const DELETE_ACCOUNT_SUCCESS = "DELETE_ACCOUNT_SUCCESS";
export const DELETE_ACCOUNT_FAILURE = "DELETE_ACCOUNT_FAILURE";

// 🔹 Action Creators
export const profileOptionsRequest = () => ({ type: PROFILE_OPTIONS_REQUEST });
export const profileOptionsSuccess = (data) => ({
  type: PROFILE_OPTIONS_SUCCESS,
  payload: data,
});
export const profileOptionsFailure = (error) => ({
  type: PROFILE_OPTIONS_FAILURE,
  payload: error,
});

export const profileDetailsRequest = () => ({ type: PROFILE_DETAILS_REQUEST });
export const profileDetailsSuccess = (data) => ({
  type: PROFILE_DETAILS_SUCCESS,
  payload: data,
});
export const profileDetailsFailure = (error) => ({
  type: PROFILE_DETAILS_FAILURE,
  payload: error,
});

export const updateProfileRequest = () => ({ type: UPDATE_PROFILE_REQUEST });
export const updateProfileSuccess = (data) => ({
  type: UPDATE_PROFILE_SUCCESS,
  payload: data,
});
export const updateProfileFailure = (error) => ({
  type: UPDATE_PROFILE_FAILURE,
  payload: error,
});

export const deleteAccountRequest = () => ({ type: DELETE_ACCOUNT_REQUEST });
export const deleteAccountSuccess = (data) => ({
  type: DELETE_ACCOUNT_SUCCESS,
  payload: data,
});
export const deleteAccountFailure = (error) => ({
  type: DELETE_ACCOUNT_FAILURE,
  payload: error,
});

// 🔹 API Calls
const fetchProfileOptionsApi = () => api.get("users/profile/profile_options/");
const fetchProfileDetailsApi = () => api.get("users/profile/profile_details/");
const updateProfileApi = (data) => api.patch("users/profile/update_profile/", data); 
const deleteAccountApi = (data) => api.post("/users/delete_account/", data);

// 🔹 Thunks (same structure as ClassesScreen)
export const fetchProfileOptions = (callback) => async (dispatch) => {
  dispatch(profileOptionsRequest());
  try {
    const response = await fetchProfileOptionsApi();
    const payload = response?.data?.data || response?.data || {};
    dispatch(profileOptionsSuccess(payload));
    callback?.({ success: true, data: payload });
  } catch (error) {
    const errorMsg =
      error?.response?.data?.message || error?.message || "Failed to load profile options.";
    dispatch(profileOptionsFailure(errorMsg));
    callback?.({ success: false, error: errorMsg });
  }
};

export const fetchProfileDetails = (callback) => async (dispatch) => {
  dispatch(profileDetailsRequest());
  try {
    const response = await fetchProfileDetailsApi();
    const payload = response?.data?.data || response?.data || {};
    dispatch(profileDetailsSuccess(payload));
    callback?.({ success: true, data: payload });
  } catch (error) {
    const errorMsg =
      error?.response?.data?.message || error?.message || "Failed to load profile details.";
    dispatch(profileDetailsFailure(errorMsg));
    callback?.({ success: false, error: errorMsg });
  }
};

export const updateProfile = (profileData, callback) => async (dispatch) => {
  dispatch(updateProfileRequest());
  try {
    const response = await updateProfileApi(profileData);
    const payload = response?.data?.data || response?.data || {};
    dispatch(updateProfileSuccess(payload));

    // Refresh details automatically after update
    // dispatch(fetchProfileDetails());

    callback?.({ success: true, data: payload });
  } catch (error) {
    const errorMsg =
      error?.response?.data?.message || error?.message || "Failed to update profile.";
    dispatch(updateProfileFailure(errorMsg));
    callback?.({ success: false, error: errorMsg });
  }
};

export const deleteUserAccount = (deleteData, callback) => async (dispatch) => {
  dispatch(deleteAccountRequest());
  try {
    console.log("deleteData delete>>>>>>>>>>",JSON.stringify(deleteData));
    const response = await deleteAccountApi(deleteData);
    console.log("response delete>>>>>>>>>>",JSON.stringify(response));
       console.log("✅ Response full object >>>>>>>>>>>");
    console.log("Status:", response.status);
    console.log("Headers:", JSON.stringify(response.headers, null, 2));
    console.log("Data:", JSON.stringify(response.data, null, 2));
    const payload = response?.data || {};
    dispatch(deleteAccountSuccess(payload));
    callback?.({ success: true, data: payload });
  } catch (error) {
    const errorMsg =
      error?.response?.data?.error ||
      error?.response?.data?.message ||
      error?.message ||
      "Failed to delete account.";
    dispatch(deleteAccountFailure(errorMsg));
    callback?.({ success: false, error: errorMsg });
  }
};
