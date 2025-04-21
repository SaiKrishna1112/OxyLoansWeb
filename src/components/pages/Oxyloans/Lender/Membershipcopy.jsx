import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Header from "../../../Header/Header";
import SideBar from "../../../SideBar/SideBar";
import "./member.css";
import "./Dashboardtable.css";
import Swal from "sweetalert2";

import {
  fetchcashfree,
  handlePaymembershipapi,
  getpaymentorder,
} from "../../../HttpRequest/afterlogin";
import {
  registersuccess,
  WarningAlertwithdrow,
  membershipsweetalert,
} from "../../Base UI Elements/SweetAlert";

const Membership = React.memo((pros) => {
  const [mywalletTowalletHistory, setmywalletTowalletHistory] = useState({
    apiData: "",
    hasdata: false,
    loading: true,
    membershiptype: "",
    loading1: false,
    loading2: false,
    loading3: false,
    loading4: false,
    loading5: false,
    loading: false,
  });
  const [payment, setpaymentsession] = useState("");
  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);
  const myorder = urlParams.get("myorder");

  const cashfree = Cashfree({
    mode: "production",
  });

  const handlePaymembershipfree = async (membership, no) => {
    try {
      setmywalletTowalletHistory({
        ...mywalletTowalletHistory,
        [`loading${no}`]: true,
      });
      const response = await membershipsweetalertconformation(membership, no);
      console.log(response);
    } catch (error) {
      console.error(`Error: ${error.errorMessage}`);
      setmywalletTowalletHistory({
        ...mywalletTowalletHistory,
        [`loading${no}`]: false,
      });
    }
  };
  const membershipsweetalertconformation = (membership, no) => {
    Swal.fire({
      title: "Are you willing to proceed with the payment at this moment ?",
      showDenyButton: true,
      showCancelButton: true,
      confirmButtonText: "Pay Through wallet",
      cancelButtonText: "cancel",
      denyButtonText: "Payment Gateway",
    }).then((result) => {
      if (result.isConfirmed) {
        const response = handlePaymembershipapi(membership, no);
        response.then((data) => {
          if (data.status == 200) {
            Swal.fire("Success!", `Payment received successfully!`, "success");
            setTimeout(() => {
              window.location.href = `/dashboard`;
            }, 5000);
          } else {
            membershipsweetalert(data.response.data.errorMessage);
          }
        });
      } else if (result.isDenied) {
        paymentordercreation(membership, no);
      } else if (result.dismiss) {
        console.log("dismiss");
      }
    });
  };

  useEffect(() => {
    if (myorder != null) {
      const getresponse = getpaymentorder(myorder);
      getresponse.then((data) => {
        if (data.data.order_status == "PAID") {
          registersuccess(
            `You have successfully paid  INR ${data.data.order_amount} Amount`
          );
        } else {
          WarningAlertwithdrow("something went wrong, payment failed");
        }
      });
    }
    return () => {};
  }, [myorder]);

  useEffect(() => {
    if (payment != null || payment != "") {
      let checkoutOptions = {
        paymentSessionId: payment,
        redirectTarget: "_self", //optional (_self or _blank)
      };
      cashfree.checkout(checkoutOptions);
    }
    return () => {};
  }, [payment]);

  const paymentordercreation = async (
    membership,
    no,
    url = `${window.location.href}?myorder={order_id}`
  ) => {
    const resposnse = await fetchcashfree(membership, no, url);
    setpaymentsession(resposnse.data.payment_session_id);
    console.log(resposnse);
  };

  const buttonNumber = 1;
  const isButtonLoading = mywalletTowalletHistory[`loading${buttonNumber}`];

  return (
    <>
      <div className="main-wrapper">
        <Header />
        <SideBar />
        {/*Page wrapper */}
        <div className="page-wrapper">
          <div className="content container-fluid">
            {/*Page Header */}
            <div className="page-header">
              <div className="row">
                <div className="col">
                  <h3 className="page-title">Membership Payment</h3>
                  <ul className="breadcrumb">
                    <li className="breadcrumb-item">
                      <Link to="/dashboard">Dashboard</Link>
                    </li>
                    <li className="breadcrumb-item active">
                      Membership Payment
                    </li>
                  </ul>
                </div>
              </div>
            </div>
            {/* /Page Header */}

            <div className="row">
              <div className="col-sm-12">
                <div className="card card-table">
                  <div className="card-body">
                    <div className="row">
                      <div className="col-lg-4  col-md-12 col-sm-12">
                        <div className="card text-center membership-border">
                          <div className="card-header">
                            <h3>1 Month Plan</h3>
                          </div>
                          <div className="card-body">
                            <p className="lead">
                              <strong> 1000 + 18 % GST </strong>
                            </p>
                            <ul className="list-group">
                              <li className="list-group-item">
                                <i className="icon-ok text-danger"></i>
                                <b className="paymembership_tenture">1</b> Month
                                Membership
                              </li>
                              <li className="list-group-item">
                                <i className="icon-ok text-danger"></i>
                                Unlimited Deals Participation
                              </li>
                            </ul>
                          </div>
                          <div className="card-footer">
                            {isButtonLoading === 1 ? (
                              <button
                                type="button"
                                className="btn bg-success bg-gradient btn-block text-center text-white"
                              >
                                <div
                                  className="spinner-border text-light"
                                  role="status"
                                >
                                  <span className="visually-hidden">
                                    Loading...
                                  </span>
                                </div>
                              </button>
                            ) : (
                              <button
                                type="button"
                                className="btn bg-success bg-gradient btn-block text-center text-white"
                                onClick={() =>
                                  handlePaymembershipfree("MONTHLY", 1)
                                }
                              >
                                Subscribe
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="col-lg-4  col-md-12 col-sm-12 border-5 border-info">
                        <div className="card text-center membership-border">
                          <div className="card-header">
                            <h3>3 Months plan</h3>
                          </div>
                          <div className="card-body">
                            <p className="lead">
                              <strong>2900+18 % GST</strong>
                            </p>
                            <ul className="list-group">
                              <li className="list-group-item">
                                <i className="icon-ok text-danger"></i>
                                <b className="paymembership_tenture">3</b> Months
                                Membership
                              </li>
                              <li className="list-group-item">
                                <i className="icon-ok text-danger"></i>
                                Unlimited Deals Participation
                              </li>
                            </ul>
                          </div>
                          <div className="card-footer">
                            {isButtonLoading === 2 ? (
                              <>
                                {" "}
                                <button
                                  type="button"
                                  className="btn bg-secondary bg-secondary btn-block text-center text-white"
                                >
                                  <div
                                    className="spinner-border text-light"
                                    role="status"
                                  >
                                    <span className="visually-hidden">
                                      Loading...
                                    </span>
                                  </div>
                                </button>
                              </>
                            ) : (
                              <>
                                {" "}
                                <button
                                  type="button"
                                  className="btn bg-secondary bg-secondary btn-block text-center text-white"
                                  onClick={() => {
                                    handlePaymembershipfree("QUARTERLY", 2);
                                  }}
                                >
                                  Subscribe
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="col-lg-4  col-md-12 col-sm-12 border-5 border-info">
                        <div className="card text-center membership-border">
                          <div className="card-header">
                            <h3>6 Months Plan</h3>
                          </div>
                          <div className="card-body">
                            <p className="lead">
                              <strong>5600 + 18 % GST</strong>
                            </p>
                            <ul className="list-group">
                              <li className="list-group-item">
                                <i className="icon-ok text-danger"></i>
                                <b className="paymembership_tenture">6</b> Months
                                Membership
                              </li>
                              <li className="list-group-item">
                                <i className="icon-ok text-danger"></i>
                                Unlimited Deals Participation
                              </li>
                            </ul>
                          </div>
                          <div className="card-footer">
                            {isButtonLoading === 3 ? (
                              <>
                                {" "}
                                <button
                                  type="button"
                                  className="btn bg-info  bg-info btn-block text-center text-white"
                                >
                                  <div
                                    className="spinner-border text-light"
                                    role="status"
                                  >
                                    <span className="visually-hidden">
                                      Loading...
                                    </span>
                                  </div>
                                </button>
                              </>
                            ) : (
                              <>
                                {" "}
                                <button
                                  type="button"
                                  className="btn bg-info bg-info btn-block text-center text-white"
                                  onClick={() => {
                                    handlePaymembershipfree("HALFYEARLY", 3);
                                  }}
                                >
                                  Subscribe
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="col-lg-4  col-md-12 col-sm-12 border-5 border-info">
                        <div className="card text-center membership-border">
                          <div className="card-header">
                            <h3>1 Year Plan</h3>
                          </div>
                          <div className="card-body">
                            <p className="lead">
                              <strong>9800 + 18 % GST</strong>
                            </p>
                            <ul className="list-group">
                              <li className="list-group-item">
                                <i className="icon-ok text-danger"></i>
                                <b className="paymembership_tenture">1</b> Year
                                Membership
                              </li>
                              <li className="list-group-item">
                                <i className="icon-ok text-danger"></i>{" "}
                                Unlimited Deals Participation
                              </li>
                            </ul>
                          </div>
                          <div className="card-footer">
                            {isButtonLoading === 4 ? (
                              <>
                                {" "}
                                <button
                                  type="button"
                                  className="btn bg-success bg-gradient btn-block text-center text-white"
                                >
                                  <div
                                    className="spinner-border text-light"
                                    role="status"
                                  >
                                    <span className="visually-hidden">
                                      Loading...
                                    </span>
                                  </div>
                                </button>
                              </>
                            ) : (
                              <>
                                {" "}
                                <button
                                  type="button"
                                  className="btn bg-success bg-gradient btn-block text-center text-white"
                                  onClick={() => {
                                    handlePaymembershipfree("PERYEAR", 4);
                                  }}
                                >
                                  Subscribe
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="col-lg-4  col-md-12 col-sm-12 border-5 border-info">
                        <div className="card text-center membership-border">
                          <div className="card-header">
                            <h3>5 Years Plan</h3>
                          </div>
                          <div className="card-body">
                            <p className="lead">
                              <strong> 50000 + 18 % GST</strong>
                            </p>
                            <ul className="list-group">
                              <li className="list-group-item">
                                <i className="icon-ok text-danger"></i>
                                <b className="paymembership_tenture">5</b> Years
                                Membership
                              </li>
                              <li className="list-group-item">
                                <i className="icon-ok text-danger"></i>{" "}
                                Unlimited Deals Participation
                              </li>
                            </ul>
                          </div>
                          <div className="card-footer">
                            {isButtonLoading === 5 ? (
                              <>
                                {" "}
                                <button
                                  type="button"
                                  className="btn bg-secondary bg-secondary btn-block text-center text-white"
                                >
                                  <div
                                    className="spinner-border text-light"
                                    role="status"
                                  >
                                    <span className="visually-hidden">
                                      Loading...
                                    </span>
                                  </div>
                                </button>
                              </>
                            ) : (
                              <>
                                {" "}
                                <button
                                  type="button"
                                  className="btn bg-secondary bg-secondary btn-block text-center text-white"
                                  onClick={() => {
                                    handlePaymembershipfree("FIVEYEARS", 5);
                                  }}
                                >
                                  Subscribe
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="col-lg-4  col-md-12 col-sm-12 border-5 border-info">
                        <div className="card text-center membership-border">
                          <div className="card-header">
                            <h3>10 Years Plan</h3>
                          </div>
                          <div className="card-body">
                            <p className="lead">
                              <strong>90000 + 18 % GST</strong>
                            </p>
                            <ul className="list-group">
                              <li className="list-group-item">
                                <i className="icon-ok text-danger"></i>
                                <b className="paymembership_tenture">10</b>{" "}
                                Years Membership
                              </li>
                              <li className="list-group-item">
                                <i className="icon-ok text-danger"></i>{" "}
                                Unlimited Deals Participation
                              </li>
                            </ul>
                          </div>
                          <div className="card-footer">
                            {isButtonLoading === 6 ? (
                              <>
                                {" "}
                                <button
                                  type="button"
                                  className="btn bg-info bg-info btn-block text-center text-white"
                                >
                                  <div
                                    className="spinner-border text-light"
                                    role="status"
                                  >
                                    <span className="visually-hidden">
                                      Loading...
                                    </span>
                                  </div>
                                </button>
                              </>
                            ) : (
                              <>
                                {" "}
                                <button
                                  type="button"
                                  className="btn bg-info bg-info btn-block text-center text-white"
                                  onClick={() => {
                                    handlePaymembershipfree("TENYEARS", 6);
                                  }}
                                >
                                  Subscribe
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="col-lg-4  col-md-12 col-sm-12 border-5 border-info">
                        <div className="card text-center membership-border">
                          <div className="card-header">
                            <h3>Life Time Plan</h3>
                          </div>
                          <div className="card-body">
                            <p className="lead">
                              <strong>100000 + 18 % GST</strong>
                            </p>
                            <ul className="list-group">
                              <li className="list-group-item">
                                <i className="icon-ok text-danger"></i>
                                <b className="paymembership_tenture">14</b>{" "}
                                Years Membership
                              </li>
                              <li className="list-group-item">
                                <i className="icon-ok text-danger"></i>{" "}
                                Unlimited Deals Participation
                              </li>
                            </ul>
                          </div>
                          <div className="card-footer">
                            {isButtonLoading === 7 ? (
                              <>
                                {" "}
                                <button
                                  type="button"
                                  className="btn bg-info bg-info btn-block text-center text-white"
                                >
                                  <div
                                    className="spinner-border text-light"
                                    role="status"
                                  >
                                    <span className="visually-hidden">
                                      Loading...
                                    </span>
                                  </div>
                                </button>
                              </>
                            ) : (
                              <>
                                {" "}
                                <button
                                  type="button"
                                  className="btn bg-info bg-info btn-block text-center text-white"
                                  onClick={() => {
                                    handlePaymembershipfree("LIFETIME", 7);
                                  }}
                                >
                                  Subscribe
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/*Page wrapper */}
      </div>
    </>
  );
});

export default Membership;
