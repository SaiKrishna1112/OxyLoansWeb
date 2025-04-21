import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { getuserMembershipValidity } from "../HttpRequest/afterlogin";

export const fetchDatadashboard = createAsyncThunk(
  "fetchDataDshboard",
  async () => {
    const responsedashboard = getuserMembershipValidity().then(
      (data) => data.data
    );
    return responsedashboard;
  }
);

const initialState = {
  fetchDashboard: [],
};

const counterDashboardSlice = createSlice({
  name: "counter",
  initialState,
  reducers: {
    getProfile: (state, action) => {},
  },
  extraReducers: (bulider) => {
    bulider.addCase(fetchDatadashboard.fulfilled, (state, action) => {
      state.fetchDashboard = action.payload;
    });
  },
});

export const { getProfile } = counterDashboardSlice.actions;
export default counterDashboardSlice.reducer;
