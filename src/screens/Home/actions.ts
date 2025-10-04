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
