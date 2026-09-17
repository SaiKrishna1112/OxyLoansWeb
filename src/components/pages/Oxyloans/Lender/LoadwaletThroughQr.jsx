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
import Swal from "sweetalert2";
import { useSelector } from "react-redux";
import {
  LoadwalletThroughQrScan,
  checkqrcodetransaction,
} from "../../../HttpRequest/afterlogin";

const LoadwaletThroughQr = () => {
  const reduxStoreData = useSelector((data) => data.counter.userProfile);
  const totalWalletBalance = Number(reduxStoreData?.lenderWalletAmount) || 0;
  const heldWalletBalance =
    (Number(reduxStoreData?.holdAmountInDealParticipation) || 0) +
    (Number(reduxStoreData?.equityAmount) || 0);
  const availableWalletBalance = Math.max(
    totalWalletBalance - heldWalletBalance,
    0
  );
  const formatCurrency = (amount) =>
    `₹${amount.toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;

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
              const message =  "Your Transaction was Sucessfull and loaded the same amount Your Wallet"
              Swal.fire({
                    icon: "success",
                    title: "Congratulations",
                    text: message,
                    confirmButtonText: "OK",
                    confirmButtonColor: "var(--oxy-primary)",
                    buttonsStyling: false,
                    customClass: {
                      confirmButton: "btn btn-primary",
                    },
                  }).then((result) => {
                    if (result.isConfirmed) {
                      window.location.reload();
                    }
                  });
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

            <div className="row mb-4">
              <div className="col-12">
                <div
                  className="card mb-0 overflow-hidden"
                  style={{
                    border: 0,
                    borderRadius: "18px",
                    background:
                      "linear-gradient(115deg, #112d4e 0%, #1d5682 58%, #2c86a6 100%)",
                    boxShadow: "0 12px 30px rgba(17, 45, 78, 0.16)",
                  }}
                >
                  <div className="card-body position-relative p-4 p-md-5 text-white">
                    <div
                      aria-hidden="true"
                      style={{
                        position: "absolute",
                        width: "190px",
                        height: "190px",
                        right: "-55px",
                        top: "-75px",
                        borderRadius: "50%",
                        background: "rgba(255,255,255,0.08)",
                      }}
                    />
                    <div
                      aria-hidden="true"
                      style={{
                        position: "absolute",
                        width: "120px",
                        height: "120px",
                        right: "90px",
                        bottom: "-75px",
                        borderRadius: "50%",
                        border: "1px solid rgba(255,255,255,0.14)",
                      }}
                    />

                    <div className="row align-items-center position-relative">
                      <div className="col-md-8">
                        <div className="d-flex align-items-center gap-3 mb-3">
                          <div
                            className="d-flex align-items-center justify-content-center"
                            style={{
                              width: "52px",
                              height: "52px",
                              borderRadius: "15px",
                              background: "rgba(255,255,255,0.15)",
                              fontSize: "24px",
                            }}
                          >
                            <i className="fa-solid fa-wallet" />
                          </div>
                          <div>
                            <span
                              className="d-block text-uppercase"
                              style={{
                                fontSize: "11px",
                                letterSpacing: "1.5px",
                                opacity: 0.72,
                              }}
                            >
                              Wallet overview
                            </span>
                            <h4 className="mb-0 text-white">Your funds, simplified</h4>
                          </div>
                        </div>
                        <p className="mb-2" style={{ opacity: 0.78 }}>
                          Available wallet balance
                        </p>
                        <div
                          className="fw-bold"
                          style={{ fontSize: "clamp(2rem, 4vw, 3rem)", lineHeight: 1.1 }}
                        >
                          {formatCurrency(availableWalletBalance)}
                        </div>
                        <small style={{ opacity: 0.72 }}>
                          Add money to your wallet quickly whenever you need it.
                        </small>
                      </div>
                    </div>
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
