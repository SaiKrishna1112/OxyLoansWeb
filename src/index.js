import React, { Suspense } from "react";
import ReactDOM from "react-dom/client";
import axios from "axios";

// Global interceptor for checking expired session across all APIs
axios.interceptors.response.use(
  (response) => {
    if (response && response.data) {
      const resData = response.data;
      if (
        resData.errorCode === "100" ||
        resData.errorCode === 100 ||
        (resData.errorMessage &&
          resData.errorMessage.toLowerCase().includes("session has expired"))
      ) {
        localStorage.clear();
        sessionStorage.clear();
        window.location.href = "/";
      }
    }
    return response;
  },
  (error) => {
    if (error && error.response && error.response.data) {
      const errData = error.response.data;
      if (
        errData.errorCode === "100" ||
        errData.errorCode === 100 ||
        (errData.errorMessage &&
          errData.errorMessage.toLowerCase().includes("session has expired"))
      ) {
        localStorage.clear();
        sessionStorage.clear();
        window.location.href = "/";
      }
    }
    return Promise.reject(error);
  }
);

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

class AppErrorBoundary extends React.Component {
  constructor(props) { super(props); this.state = { error: null }; }
  static getDerivedStateFromError(e) { return { error: e }; }
  render() {
    if (this.state.error) {
      return (
        <div style={{padding:24,fontFamily:"monospace",background:"#fff",color:"#c00"}}>
          <h3>App Error (dev diagnostic)</h3>
          <pre style={{whiteSpace:"pre-wrap",wordBreak:"break-all"}}>{String(this.state.error)}</pre>
          <pre style={{whiteSpace:"pre-wrap",fontSize:11,color:"#333"}}>{this.state.error?.stack}</pre>
        </div>
      );
    }
    return this.props.children;
  }
}

ReactGA.initialize(TRACKING_ID);
const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
  <AppErrorBoundary>
  <Provider store={store}>
    <Suspense fallback={<Loader />}>
      <Approuter></Approuter>
    </Suspense>
  </Provider>
  </AppErrorBoundary>
);
