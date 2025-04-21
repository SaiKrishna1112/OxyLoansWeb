import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { getUserDetails } from "../HttpRequest/afterlogin";

export const fetchData = createAsyncThunk("fetchData", async () => {
  const response = getUserDetails().then((data) => data.data);
  console.log(response)
  return response;
});

const initialState = {
  userProfile: [],
};

const counterSlice = createSlice({
  name: "counter",
  initialState,
  reducers: {
    getProfile: (state, action) => {},
  },
  extraReducers: (bulider) => {
    bulider.addCase(fetchData.fulfilled, (state, action) => {
      state.userProfile = action.payload;
    });
  },
});

export const { getProfile } = counterSlice.actions;
export default counterSlice.reducer;
