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
  lenderfeeamountdetailsapi,
  handellenderFeePaymentsapi,
  getuserMembershipValidity,
} from "../../../HttpRequest/afterlogin";
import {
  fetchSubscriptionOffer,
  getFinalSubscriptionAmount,
  formatRupee,
  calculateTotalWithGST,
  isActiveSubscriptionOffer,
  resolveDiscountPercent,
} from "./subscriptionOfferUtils";
import {
  registersuccess,
  WarningAlertwithdrow,
  membershipsweetalert,
  membershipsuccess,
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

  const [loadingIndex, setLoadingIndex] = useState(null);
  const [membershipdata, setmebershipdata] = useState({
    data: [],
    isLoading: true,
  });
  const [subscriptionOffer, setSubscriptionOffer] = useState(null);
  const [offerFetchDone, setOfferFetchDone] = useState(false);
  const [activeMembership, setActiveMembership] = useState(null);
  const [payment, setpaymentsession] = useState("");
  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);
  const myorder = urlParams.get("myorder");

  const cashfree = Cashfree({
    mode: "production",
  });

  const handlePaymembershipfree = async (membership, no, feeAmountWithGst) => {
    try {
      setmywalletTowalletHistory({
        ...mywalletTowalletHistory,
        [`loading${no}`]: true,
      });
      setLoadingIndex(no);
      const response = await membershipsweetalertconformation(
        membership,
        no,
        feeAmountWithGst
      );
      console.log(response);
    } catch (error) {
      console.error(`Error: ${error.errorMessage}`);
      setLoadingIndex(no);
    }
  };
const membershipsweetalertconformation = (membership, no, feeAmountWithGst) => {
  Swal.fire({
    title: "Are you willing to proceed with the payment at this moment?",
    showDenyButton: true,
    showCancelButton: true,
    confirmButtonText: "Pay Through Wallet",
    cancelButtonText: "Cancel",
    denyButtonText: "Payment Gateway",
    allowOutsideClick: false,
    didOpen: () => {
      // No loader shown initially
    },
    preConfirm: () => {
      // Show spinner inside "Pay Through Wallet" button
      const confirmBtn = Swal.getConfirmButton();
      const cancelBtn = Swal.getCancelButton();
      const denyBtn = Swal.getDenyButton();

      // Disable other buttons
      cancelBtn.disabled = true;
      denyBtn.disabled = true;

      // Add inline loader to confirm button
      confirmBtn.innerHTML = `<span style="display: inline-flex; align-items: center;">
        <span style="border: 2px solid #f3f3f3; border-top: 2px solid white; border-radius: 50%; width: 16px; height: 16px; margin-right: 8px; animation: spin 0.8s linear infinite;"></span>
        Processing...
      </span>`;
      confirmBtn.disabled = true;

      return handlePaymembershipapi(membership, no, feeAmountWithGst).then((data) => {
        if (data.status === 200) {
          Swal.fire("Success!", `Payment received successfully!`, "success");
          setTimeout(() => {
            window.location.href = `/dashboard`;
          }, 3000);
        } else {
          Swal.close(); // close modal
          membershipsweetalert(data.response.data.errorMessage);
          setmywalletTowalletHistory({ [`loading${no}`]: false });
        }
      });
    },
    // Inject inline style for spinner animation
    customClass: {
      popup: 'custom-swal-popup'
    },
    didRender: () => {
      const style = document.createElement("style");
      style.innerHTML = `
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `;
      document.head.appendChild(style);
    }
  }).then((result) => {
    if (result.isDenied) {
      paymentordercreation(membership, no, feeAmountWithGst);
      setmywalletTowalletHistory({ [`loading${no}`]: false });
    } else if (result.dismiss) {
      console.log("dismiss");
    }
  });
};


  useEffect(() => {
    if (myorder != null) {
      const getresponse = getpaymentorder(myorder);
      getresponse.then((data) => {
        console.log(data);
        if (data.data.order_status === "PAID") {
          const response = handellenderFeePaymentsapi(data);
          response.then((data) => {
            console.log("data success")`${window.location.href}`;
            console.log(data);
            membershipsuccess(
              `You have successfully paid  INR ${data.data.order_amount} Amount`
            );
          });
        } else {
          WarningAlertwithdrow("something went wrong, payment failed");
        }
      });
    }
    return () => {};
  }, [myorder]);

  useEffect(() => {
    let cancelled = false;

    const loadMembershipPageData = async () => {
      try {
        const [membershipResponse, offer, validityResponse] = await Promise.all([
          lenderfeeamountdetailsapi(),
          fetchSubscriptionOffer(),
          getuserMembershipValidity(),
        ]);

        if (cancelled) return;

        if (validityResponse?.request?.status === 200 && validityResponse.data?.validityDate) {
          const validityDate = new Date(validityResponse.data.validityDate);
          if (validityDate > new Date()) {
            setActiveMembership({
              validityDate: validityResponse.data.validityDate,
            });
          }
        }

        if (membershipResponse?.status === 200) {
          setmebershipdata({
            data: membershipResponse.data,
            isLoading: false,
          });
        } else {
          setmebershipdata({
            data: [],
            isLoading: false,
          });
        }
        setSubscriptionOffer(offer);
      } catch (error) {
        console.error(error);
        if (!cancelled) {
          setmebershipdata((prev) => ({
            ...prev,
            isLoading: false,
          }));
        }
      } finally {
        if (!cancelled) {
          setOfferFetchDone(true);
        }
      }
    };

    loadMembershipPageData();

    return () => {
      cancelled = true;
    };
  }, []);
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
    feeAmountWithGst,
    url = `${window.location.href}?myorder={order_id}`
  ) => {
    const resposnse = await fetchcashfree(
      membership,
      no,
      feeAmountWithGst,
      url
    );
    setpaymentsession(resposnse.data.payment_session_id);
    console.log(resposnse);
  };

  const buttonNumber = 0;
  const isButtonLoading = mywalletTowalletHistory[`loading${buttonNumber}`];
  const membershipPaymentBlocked = Boolean(activeMembership);
  if (membershipdata.isLoading || !offerFetchDone) {
    return <div>Loading...</div>;
  }

  const actualPrices = {
    MONTHLY: 1000,
    QUARTERLY: 2900,
    LIFETIME: 100000,
    HALFYEARLY: 5600,
    PERYEAR: 9800,
    FIVEYEARS: 50000,
    TENYEARS: 90000,
  };

  function calculateDiscountPercentage(originalPrice, discountedPrice) {
    const discount = originalPrice - discountedPrice;
    const discountPercentage = (discount / originalPrice) * 100;

    return discountPercentage.toFixed(2);
  }

  const getPaymentAmount = (planData) => {
    const pricing = getFinalSubscriptionAmount(planData, subscriptionOffer);
    return Math.round(pricing.finalWithGst);
  };

  const renderMembershipPricing = (data) => {
    const pricing = getFinalSubscriptionAmount(data, subscriptionOffer);

    if (pricing.offerApplied) {
      return (
        <div className="subscription-offer-pricing mb-2">
          <p className="text-muted small mb-1">
            <del>₹{formatRupee(pricing.originalBase)}</del>
          </p>
          <span className="badge badge-success subscription-discount-badge mb-2">
            {pricing.discountPercent > 0
              ? `${pricing.discountPercent}% OFF`
              : "OFFER APPLIED"}
          </span>
          <h4
            className="font-weight-bold text-success subscription-you-pay"
            style={{ fontSize: "20px" }}
          >
            You Pay: ₹{formatRupee(pricing.finalBase)}
          </h4>
          <p className="text-muted small mb-1">
            + 18% GST = ₹{formatRupee(Math.round(pricing.finalWithGst))}
          </p>
          <p className="text-muted small mb-1">
            <del>Was ₹{formatRupee(Math.round(pricing.originalWithGst))} with GST</del>
          </p>
          <p className="text-success small subscription-offer-note mb-0">
            Same membership plan &amp; validity as full price — only the amount is discounted.
          </p>
        </div>
      );
    }

    return (
      <>
        {data.feeAmount !==
          actualPrices[data.lenderFeePayments.toUpperCase()] && (
          <div className="mb-2" style={{ fontSize: "14px" }}>
            <span className="badge badge-danger">Discounted!</span>
            <p className="text-muted small mb-1">
              <del>
                ₹
                {actualPrices[data.lenderFeePayments.toUpperCase()]}
              </del>{" "}
              + 18% GST = ₹
              {Math.round(
                calculateTotalWithGST(
                  actualPrices[data.lenderFeePayments.toUpperCase()]
                )
              )}
            </p>
            <p className="text-muted small mb-1">
              Discount:{" "}
              {calculateDiscountPercentage(
                calculateTotalWithGST(
                  actualPrices[data.lenderFeePayments.toUpperCase()]
                ),
                data.feeAmountWithGst
              )}
              % off
            </p>
          </div>
        )}
        <h4
          className="font-weight-bold text-success"
          style={{ fontSize: "20px" }}
        >
          ₹{data.feeAmount} + 18% GST = ₹{data.feeAmountWithGst}
        </h4>
        {data.percentageDiscount && (
          <p className="text-success" style={{ fontSize: "14px" }}>
            <b>
              {data.percentageDiscount ||
                calculateDiscountPercentage(
                  actualPrices[data.lenderFeePayments.toUpperCase()],
                  data.feeAmount
                )}
              % OFF
            </b>
          </p>
        )}
      </>
    );
  };

  // Function to format the plans correctly
  const formatPlanName = (plan) => {
    console.log({ plan });
    return plan
      .replace("HALFYEARLY", "HALF YEARLY")
      .replace("PERYEAR", "ANNUAL")
      .replace("FIVEYEARS", "FIVE YEARS")
      .replace("TENYEARS", "TEN YEARS")
      .replace("LIFETIME", "LIFETIME")
      .toUpperCase();
  };

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
                  <h3 className="page-title">Membership Plans</h3>
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
                      {activeMembership && (
                        <div className="col-12 mb-3">
                          <div className="alert alert-info subscription-offer-banner mb-0">
                            <strong>Membership already active</strong> until{" "}
                            {activeMembership.validityDate}. No subscription payment is required
                            right now.
                          </div>
                        </div>
                      )}
                      {subscriptionOffer && isActiveSubscriptionOffer(subscriptionOffer) && (
                        <div className="col-12 mb-3">
                          <div className="alert alert-success subscription-offer-banner mb-0">
                            <strong>
                              {resolveDiscountPercent(subscriptionOffer) || 50}% membership
                              discount active
                            </strong>
                            {" — "}
                            pay the discounted amount below. After payment you get the same
                            membership validity and benefits as a normal subscription. The offer
                            then becomes CLAIMED.
                          </div>
                        </div>
                      )}
                      {console.log(membershipdata.data[6])}

                      {membershipdata.data.length !== 0 ? (
                        <>
                          {/* Special Plan (Single Item) */}
                          {membershipdata.data
                            .slice(6, 7)
                            .map((data, index) => (
                              <div
                                className="col-lg-4 col-md-6 col-sm-12 mb-4"
                                key={index}
                              >
                                <div
                                  className="card shadow-lg border-0 rounded-lg text-center"
                                  style={{
                                    display: "flex",
                                    flexDirection: "column",
                                    height: "100%",
                                    justifyContent: "space-between",
                                  }}
                                >
                                  <div className="card-header bg-primary text-white">
                                    <h3
                                      className="mb-0"
                                      style={{
                                        textTransform: "capitalize",
                                        fontSize: "18px",
                                        fontWeight: "bold",
                                      }}
                                    >
                                      {data.lenderFeePayments} PLAN
                                    </h3>
                                  </div>
                                  <div
                                    className="card-body d-flex flex-column justify-content-center"
                                    style={{ flexGrow: 1, textAlign: "center" }}
                                  >
                                    {renderMembershipPricing(data)}
                                    <ul
                                      className="list-group list-group-flush mt-3"
                                      style={{ fontSize: "14px" }}
                                    >
                                      <li className="list-group-item">
                                        <i className="text-danger mr-2">✔</i>
                                        <b>
                                          {data.lenderFeePayments === "LIFETIME"
                                            ? "14 Years "
                                            : ""}{" "}
                                          Membership
                                        </b>
                                      </li>
                                      <li className="list-group-item">
                                        <i className="text-danger mr-2">✔</i>{" "}
                                        Unlimited Deals Participation
                                      </li>
                                    </ul>
                                  </div>
                                  <div className="card-footer bg-white">
                                    {membershipPaymentBlocked ? (
                                      <button
                                        className="btn btn-secondary btn-block"
                                        disabled
                                      >
                                        Membership Active
                                      </button>
                                    ) : isButtonLoading ? (
                                      <button
                                        className="btn btn-success btn-block"
                                        disabled
                                      >
                                        <span className="spinner-border spinner-border-sm mr-2"></span>{" "}
                                        Processing...
                                      </button>
                                    ) : (
                                      <button
                                        className={`btn btn-success bg-gradient btn-block text-white`}
                                        style={{
                                          height: "50px",
                                          fontSize: "16px",
                                        }}
                                        onClick={() =>
                                          handlePaymembershipfree(
                                            data.lenderFeePayments,
                                            index + 1,
                                            getPaymentAmount(data)
                                          )
                                        }
                                      >
                                        Subscribe Now
                                      </button>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ))}

                          {/* Other Plans */}
                          {membershipdata.data
                            .slice(0, 6)
                            .map((data, index) => (
                              <div
                                className="col-lg-4 col-md-6 col-sm-12 mb-4"
                                key={index}
                              >
                                <div
                                  className="card text-center shadow-lg border-0 rounded-lg membership-border"
                                  style={{
                                    display: "flex",
                                    flexDirection: "column",
                                    height: "100%",
                                    justifyContent: "space-between",
                                  }}
                                >
                                  <div className="card-header bg-primary text-white">
                                    <h3
                                      className="card_heading mb-0"
                                      style={{
                                        textTransform: "capitalize",
                                        fontSize: "18px",
                                        fontWeight: "bold",
                                      }}
                                    >
                                      {formatPlanName(data.lenderFeePayments)}{" "}
                                      PLAN
                                    </h3>
                                  </div>
                                  <div
                                    className="card-body d-flex flex-column justify-content-center"
                                    style={{ flexGrow: 1, textAlign: "center" }}
                                  >
                                    {renderMembershipPricing(data)}
                                    <ul
                                      className="list-group list-group-flush"
                                      style={{ fontSize: "14px" }}
                                    >
                                      <li className="list-group-item">
                                        <i className="text-danger mr-2">✔</i>
                                        <b
                                          className="paymembership_tenture"
                                          style={{ fontSize: "14px" }}
                                        >
                                          {data.lenderFeePayments ===
                                            "QUARTERLY" && "3 Months "}
                                          {data.lenderFeePayments ===
                                            "HALFYEARLY" && "6 Months "}
                                          {data.lenderFeePayments ===
                                            "PERYEAR" && "1 Year "}
                                          {data.lenderFeePayments ===
                                            "FIVEYEARS" && "5 Years "}
                                          {data.lenderFeePayments ===
                                            "TENYEARS" && "10 Years "}
                                          {data.lenderFeePayments ===
                                            "LIFETIME" && "14 Years "}
                                        </b>
                                        Membership
                                      </li>
                                      <li className="list-group-item">
                                        <i className="text-danger mr-2">✔</i>{" "}
                                        Unlimited Deals Participation
                                      </li>
                                    </ul>
                                  </div>
                                  <div className="card-footer bg-white">
                                    {membershipPaymentBlocked ? (
                                      <button
                                        className="btn btn-secondary btn-block"
                                        disabled
                                      >
                                        Membership Active
                                      </button>
                                    ) : isButtonLoading ? (
                                      <button
                                        className="btn btn-success btn-block"
                                        disabled
                                      >
                                        <span className="spinner-border spinner-border-sm mr-2"></span>{" "}
                                        Processing...
                                      </button>
                                    ) : (
                                      <button
                                        type="button"
                                        className={`btn btn-success bg-gradient btn-block text-white`}
                                        style={{
                                          height: "50px",
                                          fontSize: "16px",
                                        }}
                                        onClick={() =>
                                          handlePaymembershipfree(
                                            data.lenderFeePayments,
                                            index + 1,
                                            getPaymentAmount(data)
                                          )
                                        }
                                      >
                                        Subscribe
                                      </button>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ))}
                        </>
                      ) : (
                        <div>No data</div>
                      )}
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
