import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Header from "../../../Header/Header";
import SideBar from "../../../SideBar/SideBar";
import Footer from "../../../Footer/Footer";
import { bottomCenter } from "../../Base UI Elements/Toast";
import { QRCode } from "antd";
import {
  HandleWithFooter,
  WarningAlertWalltTran,
} from "../../Base UI Elements/SweetAlert";
import {
  LoadwalletThroughQrScan,
  checkqrcodetransaction,
} from "../../../HttpRequest/afterlogin";
import { event } from "react-ga";

const LoadwaletThroughQr = () => {
  const [qrcodeImageStatus, setqrcodeImageStatus] = useState("active");
  const [loadwaletThroughQr, setloadwaletThroughQr] = useState({
    qrcode: false,
    qrcodeimage: "",
    amount: "",
    link: "",
    qrUrlpath: "",
    showqrcode: true,
    qrcodeStatus: "",
    qrUrlID: "",
    isvalid: false,
  });

  const [isvaildbutton, setisvaildbutton] = useState(true)
  useEffect(() => {
    const amountdata = parseInt(loadwaletThroughQr.amount, 10);
    console.log(amountdata);

    if (!isNaN(amountdata) && parseInt(amountdata) >= 1 && parseInt(amountdata) <= 100000) {
      setisvaildbutton(false); // Enable the button if the value is valid
    } else {
      setisvaildbutton(true); // Disable the button if the value is invalid
    }
  }, [loadwaletThroughQr.amount]);
  const handlechange = (event) => {
    const { name, value } = event.target;

    setloadwaletThroughQr({
      ...loadwaletThroughQr,
      [name]: value,
    });
  };

  const handelnumberonly = (event) => {
    const inputChar = event.key;
    const inputValue = event.target.value;
    const regex = /^[0-9]*$/;

    // Allow numeric input and restrict to 6 digits
    if ((!regex.test(inputChar) && inputChar !== "Backspace") || inputValue.length >= 6 && inputChar !== "Backspace") {
      event.preventDefault();
    }
  };

  const loadYourWalletFunction = async () => {
    if (loadwaletThroughQr.amount == "") {
      bottomCenter("Enter The Amount");
    } else {
      const response = LoadwalletThroughQrScan(loadwaletThroughQr.amount);
      response.then((data) => {
        if (data.request.status == 200) {
          setloadwaletThroughQr({
            ...loadwaletThroughQr,
            qrUrlpath: data.data.qrGenerationString,
            qrcodeStatus: data.data.status,
            qrUrlID: data.data.qrTableId,
            isvalid: true,
            qrcode: true,
          });

          updateTheValueTimeOut();
        }
      });
    }
  };

  const updateTheValueTimeOut = () => {
    setTimeout(() => {
      setqrcodeImageStatus("loading");
    }, 15000);
  };

  useEffect(() => {
    if (qrcodeImageStatus == "loading") {
      const intervalId = setInterval(() => {
        const qRStatusresponse = checkqrcodetransaction(
          loadwaletThroughQr.qrUrlID
        );
        qRStatusresponse.then((data) => {
          if (data.request.status == 200) {
            if (data.data.status == "SUCCESS") {
              HandleWithFooter(
                "Your Transaction was Sucessfull and loaded the same amount Your Wallet"
              );
              clearInterval(intervalId);
              return false;
            }
          } else if (data.response.data.errorCode != "200") {
            setqrcodeImageStatus("expired");
            WarningAlertWalltTran(
              data.response.data.errorMessage + "  Please Try Again"
            );
            clearInterval(intervalId);
          }
        });
      }, 1000);

      return () => {
        clearInterval(intervalId);
      };
    }
  }, [qrcodeImageStatus]);

  return (
    <>
      <div className="main-wrapper">
        {/* Header */}
        <Header />
        {/* Sidebar */}
        <SideBar />

        {/* Page Wrapper */}
        <div className="page-wrapper">
          <div className="content container-fluid">
            <div className="page-header">
              <div className="row">
                <div className="col-sm-12">
                  <div className="page-sub-header">
                    <h3 className="page-title">
                      Top Up Your Wallet with a QR Scanner
                    </h3>
                    <ul className="breadcrumb">
                      <li className="breadcrumb-item">
                        <Link to="/dashboard">Dashboard</Link>
                      </li>
                      <li className="breadcrumb-item active">QR Scanner</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
            <div className="card">
              <div className="card-body">
                <div className="row">
                  <div className="col-lg-6">
                    <div className="student-personals-grp">
                      <div className="card mb-0">
                        <div className="card-body">
                          <div className="heading-detail">
                            <h4>
                              <i className="fa-solid fa-qrcode"></i> Load Your
                              wallet with a QR Scanner
                            </h4>
                          </div>

                          {loadwaletThroughQr.qrcode &&
                            loadwaletThroughQr.isvalid ? (
                            <>
                              <div className="row col-12 d-flex justify-content-center">
                                <QRCode
                                  value={loadwaletThroughQr.qrUrlpath}
                                  status={qrcodeImageStatus}
                                />
                              </div>
                            </>
                          ) : (
                            <>
                              <input
                                className="form-control"
                                placeholder="Enter the Amount"
                                name="amount"
                                type="number"
                                onKeyPress={handelnumberonly}
                                min="1"
                                max="100000"
                                onChange={handlechange}
                              />
                              <div className="d-grid gap-2 d-md-block mt-2 button-qr text-center">
                                <button
                                  className="btn btn-primary btn-primary-1"
                                  type="button"
                                  disabled={isvaildbutton}
                                  onClick={loadYourWalletFunction}
                                >
                                  Get QR
                                </button>
                              </div>
                            </>
                          )}
                          <ul style={{ listStyle: "block" }}>
                            <code>Note:</code>
                            <li>Transaction limit is INR 1,00,000 Only.</li>

                            <li>
                              If you want to load more than a lakh, you have to
                              scan multiple times.
                            </li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="col-lg-6">
                    <div className="student-personals-grp">
                      <div className="card">
                        <h4 className="header-title">
                          How to load the wallet through UPI
                        </h4>
                        <p className="sub-header"></p>

                        <div className="ratio ratio-16x9">
                          <iframe src="https://www.youtube.com/embed/RUg_WsZ-90g?rel=0" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* Footer */}
          <Footer />
        </div>
      </div>
      {/* /Main Wrapper */}
    </>
  );
};

export default LoadwaletThroughQr;
