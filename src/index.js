import React, { Suspense } from "react";
import ReactDOM from "react-dom/client";

import "bootstrap/dist/css/bootstrap.min.css";
import "./assets/plugins/bootstrap/css/bootstrap.min.css";
//CSS & Bootstrap
import "./assets/css/style.css";
import "./assets/plugins/bootstrap/js/bootstrap.bundle.min.js";
import "./assets/plugins/select2/css/select2.min.css";
//Font Awesome
import "./assets/plugins/fontawesome/css/fontawesome.min.css";
import "./assets/plugins/fontawesome/css/all.min.css";

import Approuter from "./approuter";
import { Provider } from "react-redux";
import store from "./components/Redux/Store";

import Loader from "./loader.jsx";
import ReactGA from "react-ga";
const TRACKING_ID = "374962014"; // OUR_TRACKING_ID

ReactGA.initialize(TRACKING_ID);
const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
  <Provider store={store}>
    <Suspense fallback={<Loader />}>
      <Approuter></Approuter>
    </Suspense>
  </Provider>
);
