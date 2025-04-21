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
} from "../../../HttpRequest/afterlogin";
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
  })
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
      const response = await membershipsweetalertconformation(membership, no, feeAmountWithGst);
      console.log(response);
    } catch (error) {
      console.error(`Error: ${error.errorMessage}`);
      setLoadingIndex(no);
    }
  };
  const membershipsweetalertconformation = (membership, no, feeAmountWithGst) => {
    Swal.fire({
      title: "Are you willing to proceed with the payment at this moment ?",
      showDenyButton: true,
      showCancelButton: true,
      confirmButtonText: "Pay Through wallet",
      cancelButtonText: "cancel",
      denyButtonText: "Payment Gateway",
    }).then((result) => {
      if (result.isConfirmed) {
        const response = handlePaymembershipapi(membership, no, feeAmountWithGst);
        response.then((data) => {
          if (data.status == 200) {
            Swal.fire("Success!", `Payment received successfully!`, "success");
            setTimeout(() => {
              window.location.href = `/dashboard`;
            }, 5000);
          } else {
            membershipsweetalert(data.response.data.errorMessage);
            setmywalletTowalletHistory({
              [`loading${no}`]: false,
            })
          }
        });
      } else if (result.isDenied) {
        paymentordercreation(membership, no, feeAmountWithGst);
        setmywalletTowalletHistory({
          [`loading${no}`]: false,
        })
      } else if (result.dismiss) {
        console.log("dismiss");
      }
    });
  };

  useEffect(() => {
    if (myorder != null) {
      const getresponse = getpaymentorder(myorder);
      getresponse.then((data) => {
        console.log(data)
        if (data.data.order_status === "PAID") {
          const response = handellenderFeePaymentsapi(data)
          response.then((data) => {
            console.log("data success")
            `${window.location.href}`
            console.log(data)
            membershipsuccess(
              `You have successfully paid  INR ${data.data.order_amount} Amount`
            );

          })

        }

        else {
          WarningAlertwithdrow("something went wrong, payment failed");
        }
      });
    }
    return () => { };
  }, [myorder]);



  useEffect(() => {
    const lenderfeeamountdetails = async () => {
      try {
        const response = await lenderfeeamountdetailsapi();
        if (response.status === 200) {
          setmebershipdata({
            data: response.data,
            isLoading: false,
          });
        } else {
          throw new Error('Failed to fetch data');
        }
      } catch (error) {
        console.error(error);
        setmebershipdata({
          data: [],
          isLoading: false,
        });
      }
    };

    lenderfeeamountdetails();
  }, [lenderfeeamountdetailsapi]);
  useEffect(() => {
    if (payment != null || payment != "") {
      let checkoutOptions = {
        paymentSessionId: payment,
        redirectTarget: "_self", //optional (_self or _blank)
      };
      cashfree.checkout(checkoutOptions);
    }
    return () => { };
  }, [payment]);

  const paymentordercreation = async (
    membership,
    no,
    feeAmountWithGst,
    url = `${window.location.href}?myorder={order_id}`
  ) => {
    const resposnse = await fetchcashfree(membership, no, feeAmountWithGst, url);
    setpaymentsession(resposnse.data.payment_session_id);
    console.log(resposnse);
  };

  const buttonNumber = 0;
  const isButtonLoading = mywalletTowalletHistory[`loading${buttonNumber}`];
  if (membershipdata.isLoading) {
    return <div>Loading...</div>;
  }

  const actualPrices = {
    "MONTHLY": 1000,
    "QUARTERLY": 2900,
    "LIFETIME": 100000,
    "HALFYEARLY": 5600,
    "PERYEAR": 9800,
    "FIVEYEARS": 50000,
    "TENYEARS": 90000
  };

  function calculateTotalWithGST(amount) {
    const gst = (amount * 18) / 100;
    const total = amount + gst;

    return  total;
}

function calculateDiscountPercentage(originalPrice, discountedPrice) {
  console.log(originalPrice, discountedPrice);
  
  const discount = originalPrice - discountedPrice;
  const discountPercentage = (discount / originalPrice) * 100;
  
  return discountPercentage.toFixed(2); // Returns percentage with 2 decimal places
}

   // Function to format the plans correctly
   const formatPlanName = (plan) => {
    console.log({plan});
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

                      {console.log(membershipdata.data[6])}


                      {membershipdata.data.length !== 0 ? (
  <>
    {/* Special Plan (Single Item) */}
    {membershipdata.data.slice(6, 7).map((data, index) => (
  <div className="col-lg-4 col-md-6 col-sm-12 mb-4" key={index}>
    <div className="card shadow-lg border-0 rounded-lg text-center" style={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between' }}>
      <div className="card-header bg-primary text-white">
        <h3 className="mb-0" style={{ textTransform: "capitalize", fontSize: '18px', fontWeight: 'bold' }}>
          {data.lenderFeePayments} PLAN
        </h3>
      </div>
      <div className="card-body d-flex flex-column justify-content-center" style={{ flexGrow: 1, textAlign: 'center' }}>
        {data.feeAmount !== actualPrices[data.lenderFeePayments.toUpperCase()] && (
          <div className="mb-2" style={{ fontSize: '14px' }}>
            <span className="badge badge-danger">Discounted!</span>
            <p className="text-muted small mb-1">
              <del>₹{actualPrices[data.lenderFeePayments.toUpperCase()]}</del> + 18% GST = ₹
              {Math.round(calculateTotalWithGST(actualPrices[data.lenderFeePayments.toUpperCase()]))}
            </p>
            {/* Displaying the discount percentage */}
            <p className="text-muted small mb-1">
              Discount: {calculateDiscountPercentage(calculateTotalWithGST(actualPrices[data.lenderFeePayments.toUpperCase()]), data.feeAmountWithGst)}% off
            </p>
          </div>
        )}
        <h4 className="font-weight-bold text-success" style={{ fontSize: '20px' }}>
          ₹{data.feeAmount} + 18% GST = ₹{data.feeAmountWithGst}
        </h4>
        {/* Displaying the percentage discount here */}
        {data.percentageDiscount && (
          <p className="text-success" style={{ fontSize: '14px' }}>
            <b>{data.percentageDiscount}% OFF</b>
          </p>
        )}
        <ul className="list-group list-group-flush mt-3" style={{ fontSize: '14px' }}>
          <li className="list-group-item">
            <i className="text-danger mr-2">✔</i> 
            <b>{data.lenderFeePayments === "LIFETIME" ? "14 Years " : ""} Membership</b>
          </li>
          <li className="list-group-item">
            <i className="text-danger mr-2">✔</i> Unlimited Deals Participation
          </li>
        </ul>
      </div>
      <div className="card-footer bg-white">
        {isButtonLoading ? (
          <button className="btn btn-success btn-block" disabled>
            <span className="spinner-border spinner-border-sm mr-2"></span> Processing...
          </button>
        ) : (
          <button
            className={`btn btn-success bg-gradient btn-block text-white`}
            style={{ height: '50px', fontSize: '16px' }}
            onClick={() => handlePaymembershipfree(data.lenderFeePayments, index + 1, data.feeAmountWithGst)}
          >
            Subscribe Now
          </button>
        )}
      </div>
    </div>
  </div>
))}

{/* Other Plans */}
{membershipdata.data.slice(0, 6).map((data, index) => (
  <div className="col-lg-4 col-md-6 col-sm-12 mb-4" key={index}>
    <div className="card text-center shadow-lg border-0 rounded-lg membership-border" style={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between' }}>
      <div className="card-header bg-primary text-white">
        <h3 className="card_heading mb-0" style={{ textTransform: "capitalize", fontSize: '18px', fontWeight: 'bold' }}>
          {formatPlanName(data.lenderFeePayments)} PLAN
        </h3>
      </div>
      <div className="card-body d-flex flex-column justify-content-center" style={{ flexGrow: 1, textAlign: 'center' }}>
        {data.feeAmount !== actualPrices[data.lenderFeePayments.toUpperCase()] && (
          <div className="mb-2" style={{ fontSize: '14px' }}>
            <span className="badge badge-danger">Discounted!</span>
            <p className="text-muted small mb-1">
              <del>₹{actualPrices[data.lenderFeePayments.toUpperCase()]}</del> + 18% GST = ₹
              {Math.round(calculateTotalWithGST(actualPrices[data.lenderFeePayments.toUpperCase()]))}
            </p>
            {/* Displaying the discount percentage */}
            <p className="text-muted small mb-1">
              Discount: {calculateDiscountPercentage(calculateTotalWithGST(actualPrices[data.lenderFeePayments.toUpperCase()]), data.feeAmountWithGst)}% off
            </p>
          </div>
        )}
        <h4 className="font-weight-bold text-success" style={{ fontSize: '20px' }}>
          ₹{data.feeAmount} + 18% GST = ₹{data.feeAmountWithGst}
        </h4>
        {/* Displaying the percentage discount here */}
        {data.percentageDiscount && (
          <p className="text-success" style={{ fontSize: '14px' }}>
            <b>{calculateDiscountPercentage(actualPrices[data.lenderFeePayments.toUpperCase()], data.feeAmount)}% OFF</b>
          </p>
        )}
        <ul className="list-group list-group-flush" style={{ fontSize: '14px' }}>
          <li className="list-group-item">
            <i className="text-danger mr-2">✔</i>
            <b className="paymembership_tenture" style={{ fontSize: '14px' }}>
              {data.lenderFeePayments === "QUARTERLY" && "3 Months "}
              {data.lenderFeePayments === "HALFYEARLY" && "6 Months "}
              {data.lenderFeePayments === "PERYEAR" && "1 Year "}
              {data.lenderFeePayments === "FIVEYEARS" && "5 Years "}
              {data.lenderFeePayments === "TENYEARS" && "10 Years "}
              {data.lenderFeePayments === "LIFETIME" && "14 Years "} 
            </b> 
            Membership
          </li>
          <li className="list-group-item">
            <i className="text-danger mr-2">✔</i> Unlimited Deals Participation
          </li>
        </ul>
      </div>
      <div className="card-footer bg-white">
        {isButtonLoading ? (
          <button className="btn btn-success btn-block" disabled>
            <span className="spinner-border spinner-border-sm mr-2"></span> Processing...
          </button>
        ) : (
          <button
            type="button"
            className={`btn btn-success bg-gradient btn-block text-white`}
            style={{ height: '50px', fontSize: '16px' }}
            onClick={() => handlePaymembershipfree(data.lenderFeePayments, index + 1, data.feeAmountWithGst)}
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

                      {/* <div className="col-lg-4  col-md-12 col-sm-12">
                        <div className="card text-center membership-border">
                          <div className="card-header">
                            <h3>1 Month Plan</h3>
                          </div>
                          <div className="card-body">
                            <p c-lassName="lead">
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
                      </div> */}
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
