import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  borrowerIdMappedToDealIdapi,
  getNotAchievedDealsapi,
  regular_Api,
} from "../../../HttpRequest/afterlogin";
import Header from "../../../Header/Header";
import "./InvoiceGrid.css";
import SideBar from "../../../SideBar/SideBar";
import { Table, Pagination, Progress } from "antd";
import Borrowermodel from "../Utills/Modals/Borrowermodel";

const Todaydeal = () => {
  const navigate = useNavigate();

  const [regular_runningDeal, setRegularRunningDeal] = useState([]);
  const [loading, setLoading] = useState(true);
  const TOTAL_SECONDS = 8;
  const [countdown, setCountdown] = useState(TOTAL_SECONDS);

  const groupName = localStorage.getItem("groupName");
  const [borrowermodelopen, setborrowermodelopen] = useState(false);
  const [borrowerview, setborrowerview] = useState([]);

  const columns = [
    {
      title: "Deal Info",
      dataIndex: "Deal Info",
      key: "deal",
    },
    {
      title: "Participation Details",
      dataIndex: "loanamount",
      key: "loanamount",
    },
    {
      title: "Duration & Time Limits",
      dataIndex: "availablelimit",
      key: "availablelimit",
    },
    {
      title: "ROI & Withdrawal Details",
      dataIndex: "tenureinmonths",
      key: "tenureinmonths",
    },
    {
      title: "Participate",
      dataIndex: "funding",
      key: "funding",
    },
  ];

  const changepagination = (pros) => {
    console.log(pros);
    setRegularRunningDeal({
      ...regular_runningDeal,
      pageno: pros,
    });
  };

  const statementHideProps1 = () => {
    setborrowermodelopen(!borrowermodelopen);
  };

  const borrowerIdMappedToDealId = (dealId) => {
    setborrowermodelopen(!borrowermodelopen);
    const response = borrowerIdMappedToDealIdapi(dealId);
    response
      .then((data) => {
        if (data.status === 200) {
          setborrowerview(data.data);
          console.log(data.data);
        }
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const oncliclparticpated = (dealId) => {
    navigate(`/participatedeal?dealId=${dealId}`);
  };

  useEffect(() => {
    const handleRegular = () => {
      setLoading(true);
      const response = getNotAchievedDealsapi("NORMAL");

      response
        .then((data) => {
          console.log(data?.data);
          if (data && data.data && Array.isArray(data.data)) {
            setRegularRunningDeal(data.data);
          } else {
            setRegularRunningDeal([]);
          }
        })
        .catch((error) => {
          console.log("Error fetching today deals:", error);
          setRegularRunningDeal([]);
        })
        .finally(() => {
          setLoading(false);
        });
    };

    handleRegular();
    return () => {};
  }, []);

  // 15 seconds auto-redirect when no deals are present
  useEffect(() => {
    const hasDeals = Array.isArray(regular_runningDeal) && regular_runningDeal.length > 0;
    if (loading || hasDeals) {
      return;
    }

    if (countdown <= 0) {
      navigate("/regularRunningDeal");
      return;
    }

    const timer = setTimeout(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [loading, regular_runningDeal, countdown, navigate]);

  const progressPercent = Math.round(((TOTAL_SECONDS - countdown) / TOTAL_SECONDS) * 100);

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
            {/* Page Header */}
            <div className="page-header">
              <div className="row align-items-center">
                <div className="col">
                  <h3 className="page-title">Today's Deals</h3>
                  <ul className="breadcrumb">
                    <li className="breadcrumb-item">
                      <Link to="/dashboard">Dashboard</Link>
                    </li>
                    <li className="breadcrumb-item active">Running Deals</li>
                  </ul>
                </div>
              </div>
            </div>

            {borrowermodelopen && (
              <Borrowermodel data={borrowerview} hidefun={statementHideProps1} />
            )}

            {/* Loading State */}
            {loading && (
              <div className="card shadow-sm border-0 my-4 text-center py-5" style={{ borderRadius: "16px" }}>
                <div
                  className="spinner-border text-primary mx-auto mb-3"
                  style={{ width: "3rem", height: "3rem" }}
                  role="status"
                >
                  <span className="visually-hidden">Loading...</span>
                </div>
                <h5 className="text-secondary mb-1">Checking Today's Deals...</h5>
                <p className="text-muted small">
                  Please wait while we check for active deals.
                </p>
              </div>
            )}

            {/* Deals Loaded State */}
            {!loading && regular_runningDeal && regular_runningDeal.length > 0 && (
              <>
                {/* Invoice Header */}
                <div className="card report-card">
                  <div className="card-body h-10">
                    <div className="row">
                      <Link
                        to="/regularRunningDeal"
                        className="btn btn-primary col-lg-3 col-sm-6 mx-lg-2"
                      >
                        <i className="fa fa-user mx-1"></i>View Other Deals
                      </Link>
                    </div>
                  </div>
                </div>

                <div className="pangnation">
                  <Pagination
                    defaultCurrent={1}
                    total={regular_runningDeal?.paginationCount || regular_runningDeal.length}
                    className="pull-right"
                    onChange={changepagination}
                  />
                </div>

                {regular_runningDeal.map((data, index) => (
                  <div className="row" key={index}>
                    <div className="col-sm-12 col-lg-12 col-xl-12 col-12 my-lg-2">
                      <div className="card invoices-grid-card w-100 h-25">
                        <div className="card-header row">
                          <Link
                            to="#"
                            className="invoice-grid-link col-sm-12 col-lg-4"
                          >
                            Deal Name: {data.dealName}
                          </Link>

                          <div className="col-sm-12 col-lg-2">
                            {data?.repaymentType === "YEARLY" && (
                              <>ROI: {(data?.rateOfInterest * 12).toFixed(2)} % P.A</>
                            )}
                            {data?.repaymentType === "MONTHLY" && (
                              <> ROI : {data?.rateOfInterest} % P.M</>
                            )}
                            {data?.repaymentType === "PERDAY" && (
                              <> ROI : {(data?.rateOfInterest).toFixed(2)} % P.D</>
                            )}
                          </div>

                          <div className="col-sm-12 col-lg-2">
                            Deal Id : {data.dealId}
                          </div>
                          <div className="col-sm-12 col-lg-3">
                            Tenure : {data?.duration}{" "}
                            {data?.repaymentType === "PERDAY"
                              ? data?.duration > 1
                                ? "Days"
                                : "Day"
                              : data?.duration > 1
                              ? "Months"
                              : "Month"}
                          </div>
                          <div className="col-sm-12 col-lg-3">
                            Borrower Name : {data?.borrowerName}
                          </div>
                          <div className="col-auto col-lg-3">
                            Deal Value : INR {data.dealAmount.toLocaleString("en-IN")}
                          </div>
                        </div>

                        <div className="card-middle row">
                          <div className="col-sm-12 col-lg-6"></div>
                        </div>

                        <div className="card-body">
                          <div className="row col-12 align-items-center"></div>
                          <div className="row align-items-center">
                            <div className="col-sm-6 col-lg-2">
                              <span>Min Amount</span>
                              <h6 className="mb-0">
                                INR {data.minimumAmountInDeal.toLocaleString("en-IN")}
                              </h6>
                            </div>
                            <div className="col-sm-6 col-lg-2">
                              <span>Max Amount</span>
                              <h6 className="mb-0">
                                INR {data.lenderPaticipationLimit.toLocaleString("en-IN")}
                              </h6>
                            </div>
                            <div className="col-sm-6 col-lg-3">
                              <h6 className="mb-0">
                                Deal Start Date : {data.fundsAcceptanceStartDate}
                              </h6>
                              <h6 className="mb-0">
                                Deal End Date : {data.fundsAcceptanceEndDate}
                              </h6>
                            </div>
                            <small className="mt-2">
                              {data.feeStatusToParticipate === "Achieved" && (
                                <div className="alert alert-danger" role="alert">
                                  <span
                                    className="fw-bold fs-10"
                                    style={{ color: "black" }}
                                  >
                                    This Deal is closed
                                  </span>
                                </div>
                              )}
                            </small>
                            <small>
                              {data.dealCreatedType === "NEW" && (
                                <div className="alert alert-danger" role="alert">
                                  <span
                                    className="fw-bold fs-10"
                                    style={{ color: "black" }}
                                  >
                                    This Deal is for only New Lender
                                  </span>
                                </div>
                              )}
                            </small>

                            <div className="col-sm-6 col-lg-5">
                              <div className="row align-items-center align-items-center1">
                                <div className="col-auto">
                                  {data.lenderPaticipateStatus ? (
                                    <>
                                      {data.dealCreatedType === "ANY" ? (
                                        <Link
                                          to={`/participatedeal?dealId=${data.dealId}`}
                                          className="btn btn-success"
                                          disabled={data.lenderPaticipateStatus}
                                        >
                                          <i className="fa fa-forward mx-1"></i>
                                          Participate
                                        </Link>
                                      ) : (
                                        <>
                                          {groupName === "NewLender" ? (
                                            <Link
                                              to={`/participatedeal?dealId=${data.dealId}`}
                                              className="btn btn-success"
                                              disabled={data.lenderPaticipateStatus}
                                            >
                                              <i className="fa fa-forward mx-1"></i>
                                              Participate
                                            </Link>
                                          ) : (
                                            <>
                                              {data.dealCreatedType === "NEW" ? null : (
                                                <button
                                                  className="badge bg-success-dark"
                                                  onClick={() =>
                                                    oncliclparticpated(data.dealId)
                                                  }
                                                >
                                                  <i className="fa fa-forward mx-1"></i>
                                                  Participate
                                                </button>
                                              )}
                                            </>
                                          )}
                                        </>
                                      )}
                                    </>
                                  ):(
                                    <button
                                      className="badge bg-success-dark"
                                      disabled
                                    >
                                      <i className="fa fa-forward mx-1"></i>
                                      Deal is acheived
                                    </button>
                                  )}
                                </div>

                                {data.dealId >= 740 && (
                                  <div className="col-auto">
                                    <span
                                      type="button"
                                      className="badge bg-primary-dark"
                                      onClick={() => {
                                        borrowerIdMappedToDealId(data.dealId);
                                        localStorage.setItem(
                                          "dealLink",
                                          data.dealLink
                                        );
                                      }}
                                    >
                                      <i className="fa fa-eye"></i> View borrowers
                                      documents
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>

                            {data.withdrawStatus === "YES" && (
                              <div className="col-sm-6 col-lg-2">
                                <span>ATW ROI</span>
                                <h6 className="mb-0">
                                  {data.roiForWithdraw} %
                                </h6>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="card-footer"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </>
            )}

            {/* No Deals Present State */}
            {!loading && (!regular_runningDeal || regular_runningDeal.length === 0) && (
              <div
                className="card shadow-sm border-0 my-3"
                style={{
                  borderRadius: "16px",
                  backgroundColor: "#ffffff",
                  boxShadow: "0 4px 20px rgba(0, 0, 0, 0.05)",
                  overflow: "hidden",
                }}
              >
                {/* Top Card Border Dynamic Auto-Navigate Progress Bar */}
                <div
                  style={{
                    height: "5px",
                    width: "100%",
                    backgroundColor: "#e2e8f0",
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      height: "100%",
                      width: `${progressPercent}%`,
                      background: "linear-gradient(90deg, #2563eb 0%, #10b981 100%)",
                      transition: "width 1s linear",
                    }}
                  />
                </div>

                <div className="card-body p-4 p-md-5 text-center">
                  {/* Hero Icon Badge */}
                  <div
                    className="d-inline-flex align-items-center justify-content-center mb-3"
                    style={{
                      width: "72px",
                      height: "72px",
                      borderRadius: "50%",
                      backgroundColor: "#eff6ff",
                      border: "2px solid #dbeafe",
                    }}
                  >
                    <svg
                      width="36"
                      height="36"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#2563eb"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                      <line x1="16" y1="2" x2="16" y2="6" />
                      <line x1="8" y1="2" x2="8" y2="6" />
                      <line x1="3" y1="10" x2="21" y2="10" />
                    </svg>
                  </div>

                  {/* Title & Description */}
                  <h3
                    className="fw-bold text-dark mb-2"
                    style={{ fontSize: "24px", letterSpacing: "-0.3px" }}
                  >
                    Today No Deals Launched
                  </h3>
                  <p
                    className="text-secondary mx-auto mb-4"
                    style={{
                      fontSize: "15px",
                      maxWidth: "600px",
                      lineHeight: "1.6",
                    }}
                  >
                    There are no new deals launched today. However, we have active{" "}
                    <strong className="text-dark">long-term deals</strong> and{" "}
                    <strong className="text-dark">short-term deals</strong>{" "}
                    currently open for investment in Running Deals.
                  </p>

                  {/* Two Opportunity Feature Cards: Long-Term Deals & Short-Term Deals */}
                  <div
                    className="row justify-content-center g-3 mb-4 text-start"
                    style={{ maxWidth: "740px", margin: "0 auto" }}
                  >
                    {/* Long-Term Deals */}
                    <div className="col-md-6 col-12">
                      <div
                        className="p-3 h-100"
                        style={{
                          backgroundColor: "#f8fafc",
                          border: "1px solid #e2e8f0",
                          borderRadius: "12px",
                        }}
                      >
                        <div className="d-flex align-items-center mb-2">
                          <div
                            className="d-flex align-items-center justify-content-center rounded-circle me-3 flex-shrink-0"
                            style={{
                              width: "40px",
                              height: "40px",
                              backgroundColor: "#e0f2fe",
                            }}
                          >
                            <svg
                              width="22"
                              height="22"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="#0284c7"
                              strokeWidth="2.2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <circle cx="12" cy="12" r="10" />
                              <polyline points="12 6 12 12 16 14" />
                            </svg>
                          </div>
                          <div>
                            <span
                              className="badge mb-1"
                              style={{
                                backgroundColor: "#e0f2fe",
                                color: "#0369a1",
                                fontSize: "11px",
                                fontWeight: "600",
                                padding: "3px 8px",
                              }}
                            >
                              Long-Term
                            </span>
                            <h6
                              className="fw-bold mb-0 text-dark"
                              style={{ fontSize: "15px" }}
                            >
                              Long-Term Deals
                            </h6>
                          </div>
                        </div>
                        <p
                          className="text-muted small mb-0 ps-1"
                          style={{ lineHeight: "1.5" }}
                        >
                          Multi-month tenure options offering attractive ROI and steady returns.
                        </p>
                      </div>
                    </div>

                    {/* Short-Term Deals */}
                    <div className="col-md-6 col-12">
                      <div
                        className="p-3 h-100"
                        style={{
                          backgroundColor: "#f8fafc",
                          border: "1px solid #e2e8f0",
                          borderRadius: "12px",
                        }}
                      >
                        <div className="d-flex align-items-center mb-2">
                          <div
                            className="d-flex align-items-center justify-content-center rounded-circle me-3 flex-shrink-0"
                            style={{
                              width: "40px",
                              height: "40px",
                              backgroundColor: "#ffedd5",
                            }}
                          >
                            <svg
                              width="22"
                              height="22"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="#ea580c"
                              strokeWidth="2.2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                            </svg>
                          </div>
                          <div>
                            <span
                              className="badge mb-1"
                              style={{
                                backgroundColor: "#ffedd5",
                                color: "#c2410c",
                                fontSize: "11px",
                                fontWeight: "600",
                                padding: "3px 8px",
                              }}
                            >
                              Short-Term
                            </span>
                            <h6
                              className="fw-bold mb-0 text-dark"
                              style={{ fontSize: "15px" }}
                            >
                              Short-Term Deals
                            </h6>
                          </div>
                        </div>
                        <p
                          className="text-muted small mb-0 ps-1"
                          style={{ lineHeight: "1.5" }}
                        >
                          Quick-turnaround opportunities with monthly tenures and faster liquidity.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Auto-Navigation Countdown Status */}
                  <div className="d-flex align-items-center justify-content-center text-muted small my-3">
                    <div
                      className="spinner-border spinner-border-sm text-primary me-2"
                      role="status"
                      style={{ width: "14px", height: "14px", borderWidth: "2px" }}
                    />
                    <span>
                      Auto-navigating to Running Deals in{" "}
                      <strong className="text-primary">{countdown}s</strong>...
                    </span>
                  </div>

                  {/* Action Buttons */}
                  <div className="d-flex justify-content-center align-items-center gap-3 flex-wrap mt-2">
                    <button
                      type="button"
                      className="btn btn-primary px-4 py-2"
                      style={{
                        borderRadius: "8px",
                        fontWeight: "600",
                        fontSize: "14px",
                        backgroundColor: "#2563eb",
                        borderColor: "#2563eb",
                        boxShadow: "0 2px 8px rgba(37, 99, 235, 0.25)",
                      }}
                      onClick={() => navigate("/regularRunningDeal")}
                    >
                      <i className="fa fa-arrow-right me-2" /> Go to Running Deals Now ({countdown}s)
                    </button>

                    <Link
                      to="/dashboard"
                      className="btn btn-outline-dark px-4 py-2"
                      style={{
                        borderRadius: "8px",
                        fontWeight: "600",
                        fontSize: "14px",
                      }}
                    >
                      <i className="fa fa-home me-2" /> Dashboard
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        {/* /Page Wrapper */}
      </div>
      {/* /Main Wrapper */}
    </>
  );
};

export default Todaydeal;
