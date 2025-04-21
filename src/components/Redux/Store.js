import { configureStore } from "@reduxjs/toolkit";
import counterReducer from "./Slice";
import dashboardReducer from "./SliceDashboard";

const store = configureStore({
  reducer: {
    counter: counterReducer,
    dashboard: dashboardReducer,
  },
});

export default store;
