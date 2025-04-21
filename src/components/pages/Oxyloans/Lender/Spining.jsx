import React from "react";
import { Spin } from "antd";
export default function Spining() {
  const [spinning, setSpinning] = React.useState(true);

  return (
    <React.Fragment>
      <div className="flexcontaner d-flex justify-content-center align-items-center vh-100">
        <Spin spinning={spinning} fullscreen />
      </div>
    </React.Fragment>
  );
}
