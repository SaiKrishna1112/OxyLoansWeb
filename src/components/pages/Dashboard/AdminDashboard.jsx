import React, { useState, useEffect } from "react";
import Chart from "react-apexcharts";
import Header from "../../Header/Header";
import SideBar from "../../SideBar/SideBar";
import ProgressBar from "react-customizable-progressbar";
import { Link } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import "../Oxyloans/Lender/table.css";
import FloatingAssistant from "../../FloatingAssistant"
import logo from "../../../assets/img/avtarimage.png"
import { formatAmountWithCommas, amountToWords } from '../../../utils/formatAmount';

import {
  getDashboardInvestment,
  regular_Api,
  getNoDealsParticipated,
  handelexcelsForNewLenderDashboard,
  setLatLong,
} from "../../HttpRequest/afterlogin";
import { useNavigate } from "react-router-dom";

import { Table, Tag } from "antd";
import { onShowSizeChange } from "../../Pagination";
import { fetchData } from "../../Redux/Slice";
import { fetchDatadashboard } from "../../Redux/SliceDashboard";
import { useSelector, useDispatch } from "react-redux";

import {
  awardicon01,
  dashboard1,
  dashboard2,
  dashboard3,
  dashboard4,
  rightclickmark,
} from "../../imagepath";
import Footer from "../../Footer/Footer";
import {
  getuserMembershipValidity,
  getUserDetails,
  getUserDetails1,
  getactivityApisData,
} from "../../HttpRequest/afterlogin";
import { personalDetails } from "../Base UI Elements/SweetAlert";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import axios from "axios";
import { base_url, getToken, getUserId } from "../../HttpRequest/afterlogin";
import { fetchTopLenders } from "../../HttpRequest/admin";
import Swal from "sweetalert2";

const AdminDashboard = () => {
  const getdashboardData = useSelector((data) => data.dashboard.fetchDashboard);
  const getreducerprofiledata = useSelector((data) => data.counter.userProfile);
  const [show, setShow] = useState(false);
  const [selectedCity, setSelectedCity] = useState("");
  const [selectedCityerror, setSelectedCityerror] = useState(false);
  const [customCity, setCustomCity] = useState("");
  const [showWallet, setShowWallet] = useState(false);
  const [showActivityDeals, setShowActivityDeals] = useState(false);
  const [ShowClosedDeal, setShowClosedDeal] = useState(false);
  const [ShowTotalDeal, setShowTotalDeal] = useState(false);
  const [showParticipatedDeals, setShowParticipatedDeals] = useState(false);
  const [showChart, setShowChart] = useState(false);
  const [showTable, setShowTable] = useState(false);
  const navigate = useNavigate();

  const [dashboarddata, setdashboarddata] = useState({
    profileData: "",
  });
  const [membershipdata, setmembershipdata] = useState({
    dashboardData: "",
    ismembershiptrue: "",
    isnewlender: false,
  });

  const [dashboardDealActive, setdashboardDealActvity] = useState({
    activedeal: 0,
    closedDeal: 0,
    disbursedDeal: 0,
  });
  const [regular_runningDeal, setRegularRunningDeal] = useState({
    apidata: "",
    dealtype: "HAPPENING",
    paginationCount: 1,
    pageno: 1,
    apidataESCROW: "",
  });
  const [dashboardInvestment, setdashboardInvestment] = useState({
    apiData: "",
    hasdata: false,
    loading: true,
    pageNo: 1,
    pageSize: 6,
    defaultPageSize: 4,
  });

  const [excelsForNewLenderDashboardLink, setexcelsForNewLenderDashboardLink] =
    useState({
      excelDownloadUrl: "",
    });
  
  const investmentdashboardPagination = (dats) => {
    setdashboardInvestment({
      ...dashboardInvestment,
      defaultPageSize: dats.pageSize,
      pageNo: dats.current,
      pageSize: dats.pageSize,
    });
  };

  const datasource = [];

  if (dashboardInvestment.apiData !== "") {
    dashboardInvestment.apiData.lenderWalletHistoryResponseDto.forEach((data) => {
      datasource.push({
        key: Math.random(),
        Date: data.walletLoaded,
        Description: data.remarks,
        Amount: data.amount,
      });
    });
  }

  const [dashboardcarddata, setdashboardcarddata] = useState({});

  const [dealsProgressed, setdealsProgressed] = useState({
    totalDeals: 0,
    participatedDeals: 0,
    percentage: 0,
  });

  const [treemap, Settreemap] = useState({
    series: [
      {
        name: "",
        data: [
          dashboardDealActive.activedeal,
          dashboardDealActive.closedDeal,
          dashboardDealActive.disbursedDeal,
        ],
        color: "#664DC9",
      },
    ],

    options: {
      chart: {
        height: 350,
        type: "bar",
        zoom: {
          enabled: false,
        },
      },

      dataLabels: {
        enabled: false,
      },
      stroke: {
        curve: "straight",
      },

      grid: {
        row: {
          colors: ["#f3f3f3", "transparent"],
          opacity: 0.5,
        },
      },
      xaxis: {
        categories: ["Active  Amount ", "Closed  Amount", "Total  Amount "],
      },
    },
  });

  const columns = [
    {
      title: "Date",
      dataIndex: "Date",
      sorter: (a, b) => new Date(a.Date) - new Date(b.Date),
    },

    {
      title: "Description",
      dataIndex: "Description",
      sorter: (a, b) => a.Description.length - b.Description.length,
    },
    {
      title: "Amount",
      dataIndex: "Amount",
      sorter: (a, b) => a.Amount - b.Amount,
    },
  ];

  const handleClose = () => {
    setShow(false);
    setSelectedCity("");
    setCustomCity("");
    setSelectedCityerror(false);
  };

 const [topLender, setTopLender] = useState(null);

  useEffect(() => {
    const loadTopLender = async () => {
      try {
        const response = await fetchTopLenders();

        // Extract list properly
        const list = Array.isArray(response.data)
          ? response.data
          : response.data?.data || [];

        if (list.length > 0) {
          setTopLender(list[0]); 
        }

      } catch (error) {
        console.error("Error fetching top lender:", error);
      }
    };

    loadTopLender();
  }, []);

  useEffect(() => {
    const urlparams = window.location.pathname;
    const urldealname = "regularRunningDeal";

    const handleRegular = () => {
      const response = regular_Api(
        regular_runningDeal.dealtype,
        urldealname,
        regular_runningDeal.pageno
      );

      response.then((data) => {
        setRegularRunningDeal({
          ...regular_runningDeal,
          apidata: data.data,
        });
      });
    };   

    handleRegular();
  }, [regular_runningDeal.pageno]);

  useEffect(() => {
    const primaryType = localStorage.getItem("primaryType");
    const fetchProfile = primaryType === "LENDER" ? getUserDetails : getUserDetails;
    fetchProfile().then((data) => {
      if (data?.request?.status === 200) {
        setdashboarddata({ ...dashboarddata, profileData: data });
        const city = data?.data?.city || localStorage.getItem("userCity");
        if (!city) setShow(true);
      }
    }).catch(() => {});
    return () => {};
  }, []);
 


  const handleCityChange = (event) => {
    if (event.target.value.trim() === "") {
      setSelectedCityerror(true);
    } else {
      setSelectedCityerror(false);
    }
    setSelectedCity(event.target.value);
  };

  const handleSave = () => {
    console.log("Selected city:", selectedCity);
    const userId = getUserId();
    console.log("User ID:", userId);

    let data = {
      city: selectedCity,
    };

    axios
      .post(`${base_url}${userId}/city`, data, {
        headers: {
          accessToken: getToken(),
        },
      })
      .then(function (response) {
        console.log("City saved successfully:", response.data);
        localStorage.setItem("userCity", selectedCity);
        setShow(false);
        setSelectedCity("");
        if (response.status === 200) {
          Swal.fire({
            icon: "success",
            title: "Success!",
            text: "City updated successfully.",
            confirmButtonText: "OK",
          });
          handleClose();
        }
        window.location.reload();
      })
      .catch(function (error) {
        console.error("Error saving city:", error.response);
        if (error.response.status === 401) {
          Swal.fire({
            icon: "error",
            title: "Oops...",
            text: error.response.data.errorMessage,
            confirmButtonText: "Go to Login",
          }).then((result) => {
            if (result.isConfirmed) {
              navigate("/");
            }
          });
        } else {
          Swal.fire({
            icon: "error",
            title: "Oops...",
            text: error.response.data.errorMessage,
            confirmButtonText: "OK",
          });
        }
      });
  };

  useEffect(() => {
    const fetchActivityData = async () => {
      try {
        const activeres = await getactivityApisData();
        if (activeres.request.status === 200) {
          setdashboardcarddata(activeres.data);
          Settreemap({
            ...treemap,
            series: [
              {
                name: "",
                data: [
                  activeres.data.activeDealsAmount,
                  activeres.data.closedDealsAmount,
                  activeres.data.disbursedDealsAmount,
                ],
                color: "#664DC9",
              },
            ],
          });
        }
      } catch (error) {
        console.error("Error fetching activity data:", error);
      }
    };

    if (showActivityDeals || ShowClosedDeal || ShowTotalDeal || showChart) {
      fetchActivityData();
    }
  }, [showActivityDeals, ShowClosedDeal, ShowTotalDeal, showChart]);

  useEffect(() => {
    function getdashboardInvestment() {
      try {
        const response = getDashboardInvestment(
          dashboardInvestment.pageNo,
          dashboardInvestment.pageSize
        );
        response.then((data) => {
          if (data.request.status === 200) {
            setdashboardInvestment({
              ...dashboardInvestment,
              apiData: data.data,
              loading: false,
              hasdata:
                data.data.lenderWalletHistoryResponseDto.length === 0 ? false : true,
            });
          }
        });
      } catch (error) {
        console.error("Error fetching dashboard investment data:", error);
      }
    }
    if (showTable) {
      getdashboardInvestment();
    }
  }, [showTable, dashboardInvestment.pageNo, dashboardInvestment.pageSize]);

  useEffect(() => {
    function getdealsParticipated() {
      try {
        const response = getNoDealsParticipated();
        response.then((data) => {
          if (data.request.status === 200) {
            setdealsProgressed({
              ...dealsProgressed,
              totalDeals: data.data.dealCount,
              participatedDeals: data.data.participationCount,
              percentage:
                (data.data.participationCount / data.data.dealCount) * 100,
            });
          }
        });
      } catch (error) {
        console.error("Error fetching deals participated data:", error);
      }
    }
    if (showParticipatedDeals) {
      getdealsParticipated();
    }
    return () => {};
  }, [showParticipatedDeals]);

  useEffect( () => {
    const profileskip = localStorage.getItem("profileskip");
    if (profileskip) {
    } else {
      const profileData = dashboarddata?.profileData?.data;
      if (profileData) {
        const { kycStatus, bankDetailsInfo, personalDetailsInfo, groupName } =
          profileData;
        const isvalidity = membershipdata.ismembershiptrue;

        // if(profileData.latitude === null || profileData.latitude === undefined || profileData.latitude === "" || profileData.longitude === null || profileData.longitude === undefined || profileData.longitude === ""){
                 try{
                     setLatLong().then((response) => {
                      if (response.status === 200) {
                        console.log("Geolocation data updated successfully");
                      }else {
                        console.error("Failed to update geolocation data");
                      }
                    });
                 }
                  catch(error){
                    console.error("Error fetching geolocation data:", error);
                  }
        // }

        if (
          kycStatus === false &&
          bankDetailsInfo === true &&
          personalDetailsInfo === true
        ) {
          personalDetails(
            "Attention: Update Your Personal Details for Enhanced Services and Security. ",
            "/profile"
          );
        } else if (
          kycStatus === true &&
          bankDetailsInfo === true &&
          personalDetailsInfo === false
        ) {
          personalDetails(
            "Kindly provide/update your bank information,",
            "/profile"
          );
        } else if (
          kycStatus === true &&
          bankDetailsInfo === true &&
          personalDetailsInfo === false
        ) {
          personalDetails(
            " Kindly provide/update your personal Information",
            "/profile"
          );
        } else if (
          kycStatus === false &&
          bankDetailsInfo === false &&
          personalDetailsInfo === false
        ) {
          personalDetails(
            "Personal details are currently unavailable. Kindly provide/update your bank information, nominee details, and complete the KYC process ",
            "/profile"
          );
        } else if (
          kycStatus === true &&
          bankDetailsInfo === true &&
          personalDetailsInfo === true &&
          isvalidity === false
        ) {
          const skipbutton = localStorage.getItem("skip");
        }
      }
    }
    return () => {};
  }, [dashboarddata.profileData, membershipdata.ismembershiptrue]);

  const handleClickGetLink = async (type) => {
    try {
      const response = await handelexcelsForNewLenderDashboard(type);
      console.log(response);

      if (response.status === 200) {
        const downloadUrl = response.data.excelDownloadUrl;
        console.log(downloadUrl);
        setexcelsForNewLenderDashboardLink({
          ...excelsForNewLenderDashboardLink,
          excelDownloadUrl: downloadUrl,
        });
        window.open(downloadUrl, "_blank");
      }
    } catch (error) {
      console.error("Error fetching the Excel download link:", error);
    }
  };

  const leftColClass = showChart ? "col-12 col-lg-8" : "col-12 col-lg-6";
const getFinancialYear = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth() + 1; 

  if (month >= 4) {
    
    return `${year.toString().slice(-2)}-${(year + 1).toString().slice(-2)}`;
  } else {
    
    return `${(year - 1).toString().slice(-2)}-${year.toString().slice(-2)}`;
  }
};
  return (
    <>
      <div>
        <div className="main-wrapper">
          <Header />
          <SideBar />

          <div className="page-wrapper">
            <div className="content container-fluid">
              <div className="page-header">
                <div className="row">
                  <div className="col-sm-12">
                    <div className="page-sub-header">
                      <div
                        className="mebershipbutton"
                        style={{
                          display: "flex",
                          flexDirection: "row",
                          justifyContent: "space-around",
                          alignItems: "center",
                        }}
                      >
                        <h3 className="page-title">
                          Welcome back,{" "}
                          {getreducerprofiledata?.length !== 0
                            ? (getreducerprofiledata?.firstName
                                .charAt(0)
                                .toUpperCase() +
                                getreducerprofiledata?.firstName
                                  .slice(1)
                                  .toLowerCase() ?? "")
                            : ""}{" "}
                          👋
                        </h3>

                        <div
                          className="button_class"
                          style={{
                            display: "flex",
                            flexDirection: "row",
                            position: "absolute",
                            right: "1rem",
                            flexWrap: "wrap",
                          }}
                        >
                          <Link to="/todaydeal">
                            <Tag
                              style={{
                                height: "1.8rem",
                                display: "flex",
                                alignItems: "center",
                              }}
                              className="badge bg-info mx-2"
                            >
                              Today Deals
                            </Tag>
                          </Link>
                          <Link to="/myRunningDeals">
                            <Tag
                              style={{
                                height: "1.8rem",
                                display: "flex",
                                alignItems: "center",
                                backgroundColor: "#008f64",
                              }}
                              className="badge bg-success-dark mx-2"
                            >
                              My Participated Deals
                            </Tag>
                          </Link>
                          <Link to="/membership">
                            <Tag
                              style={{
                                height: "1.8rem",
                                display: "flex",
                                alignItems: "center",
                              }}
                              className="badge bg-success mx-2"
                            >
                              Get Membership
                            </Tag>
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <p>Discover borrowers, fund loans, and track your earnings.</p>
              </div>

              <div className="row">
                <div className="col-xl-3 col-sm-6 col-12 d-flex">
                  <div className="card bg-comman w-100">
                    <div className="card-body">
                      <div className="db-widgets d-flex justify-content-between align-items-center">
                        <div className="db-info">
                          <div className="d-flex align-items-center justify-content-between">
                            <h6 className="m-0">Wallet</h6>
                          </div>
                          <h3 className="mt-2">
                            {showWallet ? (
                              <>
                               {getreducerprofiledata?.length !== 0
                                  ? formatAmountWithCommas(getreducerprofiledata?.lenderWalletAmount -
                                    getreducerprofiledata?.holdAmountInDealParticipation -
                                    getreducerprofiledata?.equityAmount)
                                  : ""}
                              </>
                            ) : (
                              <span
                                style={{
                                  letterSpacing: "2px",
                                  fontSize: "18px",
                                  opacity: 0.4,
                                }}
                              >
                                ✱✱✱
                              </span>
                            )}
                          </h3>
                        </div>

                        <div className="db-icon">
                          <img
                            src={dashboard3}
                            alt="Dashboard Icon"
                            height={60}
                            width={60}
                          />
                        </div>
                      </div>
                    </div>
                    {/* 
                  <Link to="/earningCertificate">
                    <div
                      className="card-footer m-0 p-1 c-black"
                      style={{ color: "gray", textAlign: "center" }}
                    >
                      Earnings FY : 24-25
               <button
                   className="btn btn-sm p-0 border-0 bg-transparent ms-5"
                    onClick={() => setShowWallet(!showWallet)}>
                   {showWallet ? (
               <FaEye size={20} color="gray" title="Show data" />
               ) : (
              <FaEyeSlash size={20} color="gray" title="Hide data" />
               )}
              </button>

                    </div>
                  </Link>
                  
                </div> */}
                    {/* </div> */}

                    <div
                      className="card-footer m-0 p-1 c-black"
                      style={{ color: "gray", textAlign: "center" }}
                    >
                      <Link
                        to="/earningCertificate"
                        style={{ textDecoration: "none", color: "gray" }}
                      >
                        Earnings FY : {getFinancialYear()}
                      </Link>
                      <button
                        className="btn btn-sm p-0 border-0 bg-transparent ms-5"
                        onClick={() => setShowWallet(!showWallet)}
                      >
                        {showWallet ? (
                          <FaEye size={20} color="gray" title="Show data" />
                        ) : (
                          <FaEyeSlash
                            size={20}
                            color="gray"
                            title="Hide data"
                          />
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="col-xl-3 col-sm-6 col-12 d-flex">
                  <div
                    className="card bg-comman w-100"
                    style={{ position: "relative" }}
                  >
                    <Link to="/myRunningDeals">
                      <div className="card-body">
                        <div className="db-widgets d-flex justify-content-between align-items-center">
                          <div className="db-info">
                            <h6>Active Deals</h6>
                            <h3>
                              {showActivityDeals ? (
                                getdashboardData?.length !== 0 ? (
                                  (getdashboardData?.numberOfActiveDealsCount ??
                                  0)
                                ) : (
                                  ""
                                )
                              ) : (
                                <span
                                  style={{
                                    letterSpacing: "2px",
                                    fontSize: "18px",
                                    opacity: 0.4,
                                  }}
                                >
                                  ✱✱✱
                                </span>
                              )}
                            </h3>
                          </div>
                          <div className="db-icon">
                            <img
                              src={dashboard2}
                              alt="Dashboard Icon"
                              height={60}
                              width={60}
                            />
                          </div>
                        </div>
                      </div>
                    </Link>

                    <div
                      className="card-footer m-0 p-1 c-black"
                      style={{
                        color: "gray",
                        textAlign: "center",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <div style={{ flex: 1 }}>
                        {showActivityDeals ? (
                          <span title={amountToWords(dashboardcarddata?.activeDealsAmount ?? 0)}>
                            {/* <strong>INR </strong>{" "} */}
                            {dashboardcarddata?.length !== 0
                              ? formatAmountWithCommas(dashboardcarddata?.activeDealsAmount ?? 0)
                              : ""}
                          </span>
                        ) : (
                          <span style={{ letterSpacing: "2px" }}>₹ ✱✱✱</span>
                        )}
                      </div>

                      <div
                        style={{
                          zIndex: 10,
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                        }}
                        onClick={() => setShowActivityDeals(!showActivityDeals)}
                      >
                        {showActivityDeals ? (
                          <FaEye size={20} color="gray" title="Show Data" />
                        ) : (
                          <FaEyeSlash
                            size={20}
                            color="gray"
                            title="Hide Data"
                          />
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="col-xl-3 col-sm-6 col-12 d-flex">
                  <div className="card bg-comman w-100">
                    <Link to="/myclosedDeals">
                      <div className="card-body">
                        <div className="db-widgets d-flex justify-content-between align-items-center">
                          <div className="db-info">
                            <h6>Closed Deals</h6>
                            <h3>
                              {ShowClosedDeal ? (
                                getdashboardData?.length !== 0 ? (
                                  (getdashboardData?.numberOfClosedDealsCount ??
                                  0)
                                ) : (
                                  ""
                                )
                              ) : (
                                <span
                                  style={{
                                    letterSpacing: "2px",
                                    fontSize: "18px",
                                    opacity: 0.4,
                                  }}
                                >
                                  ✱✱✱
                                </span>
                              )}
                            </h3>
                          </div>
                          <div className="db-icon">
                            <img
                              src={dashboard1}
                              alt="Dashboard Icon"
                              height={60}
                              width={60}
                            />
                          </div>
                        </div>
                      </div>
                    </Link>

                    <div
                      className="card-footer m-0 p-1 c-black"
                      style={{
                        color: "gray",
                        textAlign: "center",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <div style={{ flex: 1 }}>
                        {ShowClosedDeal ? (
                          <span title={amountToWords(dashboardcarddata?.closedDealsAmount ?? 0)}>
                            {/* <strong>INR :</strong>{" "} */}
                            {dashboardcarddata?.length !== 0
                              ? formatAmountWithCommas(dashboardcarddata?.closedDealsAmount ?? 0)
                              : ""}
                          </span>
                        ) : (
                          <span style={{ letterSpacing: "2px" }}>₹ ✱✱✱</span>
                        )}
                      </div>

                      <div
                        style={{
                          zIndex: 10,
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                        }}
                        onClick={() => setShowClosedDeal(!ShowClosedDeal)}
                      >
                        {ShowClosedDeal ? (
                          <FaEye size={20} color="gray" title="Show Data" />
                        ) : (
                          <FaEyeSlash
                            size={20}
                            color="gray"
                            title="Hide Data"
                          />
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="col-xl-3 col-sm-6 col-12 d-flex">
                  <div className="card bg-comman w-100">
                    <div className="card-body">
                      <div className="db-widgets d-flex justify-content-between align-items-center">
                        <div className="db-info">
                          <h6>Total Deals</h6>
                          <h3>
                            {ShowTotalDeal ? (
                              getdashboardData?.length !== 0 ? (
                                getdashboardData?.numberOfClosedDealsCount +
                                getdashboardData?.numberOfActiveDealsCount
                              ) : (
                                ""
                              )
                            ) : (
                              <span
                                style={{
                                  letterSpacing: "2px",
                                  fontSize: "18px",
                                  opacity: 0.4,
                                }}
                              >
                                ✱✱✱
                              </span>
                            )}
                          </h3>
                        </div>
                        <div className="db-icon">
                          <img
                            src={dashboard4}
                            alt="Dashboard Icon"
                            height={60}
                            width={60}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Footer Section */}
                    <div
                      className="card-footer m-0 p-1 c-black"
                      style={{
                        color: "gray",
                        textAlign: "center",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      {/* Amount Section */}
                      <div style={{ flex: 1 }}>
                        {ShowTotalDeal ? (
                          <span title={amountToWords(dashboardcarddata?.disbursedDealsAmount ?? 0)}>
                            {dashboardcarddata?.length !== 0
                              ? formatAmountWithCommas(dashboardcarddata?.disbursedDealsAmount ?? 0)
                              : ""}
                          </span>
                        ) : (
                          <span style={{ letterSpacing: "2px" }}>₹ ✱✱✱</span>
                        )}
                      </div>

                      {/* Eye Icon Section */}
                      <div
                        style={{
                          zIndex: 10,
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                        }}
                        onClick={() => setShowTotalDeal(!ShowTotalDeal)}
                      >
                        {ShowTotalDeal ? (
                          <FaEye size={20} color="gray" title="Hide Data" />
                        ) : (
                          <FaEyeSlash
                            size={20}
                            color="gray"
                            title="Show Data"
                          />
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="row">
                  <div className="col-md-6 col-lg-6">
                    <div className="card">
                      <div className="card-body">
                        <span>
                          <span className="text-bold text-success mx-lg-1">
                            <strong> Subscription Validity:</strong>
                          </span>
                          {getreducerprofiledata?.length !== 0 &&
                            (getreducerprofiledata?.groupName ===
                            "NewLender" ? (
                              <span>
                                You are a new lender, pay the annual membership
                                fee to participate in the multiple deals
                                <span className="badge bg-info mx-2">
                                  <Link to="/membership" className="text-white">
                                    Get Membership
                                  </Link>
                                </span>
                              </span>
                            ) : (
                              <span>
                                {getdashboardData?.validityDate &&
                                  `Active until ${getdashboardData?.validityDate}`}{" "}
                                <span className="badge bg-info mx-2">
                                  <Link to="/membership" className="text-white">
                                    Get Membership
                                  </Link>
                                </span>
                              </span>
                            ))}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-6 col-lg-6">
                    <div className="card">
                      <div className="card-body">
                        <span>
                          <span className="text-bold text-success mx-lg-1">
                            <strong>
                              Lend Smarter with Proximity-Based Loans:
                            </strong>
                          </span>
                          <span>
                            Connect with nearby borrowers and diversify your
                            investments.
                            <span className="badge bg-info mx-2">
                              <Link to="/proximityLoans" className="text-white">
                                Browse Loans
                              </Link>
                            </span>
                          </span>
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="row mt-3">
                  <div className="col-md-12 col-lg-12">
                    <div className="card">
                      <div className="card-body position-relative">
                        {/* Corner Badge */}
                        <span
                          className="badge bg-info"
                          style={{
                            position: "absolute",
                            top: "10px",
                            right: "10px",
                            cursor: "pointer",
                            padding: "8px 12px",
                          }}
                        >
                          <Link
                            to="/top-lenders"
                            className="text-white"
                            style={{ textDecoration: "none" }}
                          >
                            View More
                          </Link>
                        </span>

                        <div className="d-flex align-items-center gap-2 flex-wrap">
                          <span className="text-bold text-success">
                            <strong> Top Lender of Oxyloans:</strong>
                          </span>

                          {topLender ? (
                            <span className="d-flex align-items-center">
                              🏆{" "}
                              <strong className="mx-1">
                                Total Cumulative Participation - LR
                                {topLender.lenderId}
                              </strong>
                            </span>
                          ) : (
                            <span>Loading top lender...</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="row">
                  <div className={leftColClass}>
                    <div className="card card-chart">
                      <div className="card-header">
                        <div className="row align-items-center">
                          <div className="col-10">
                            <h6 className="card-title">Deals Amount Monitor</h6>
                          </div>
                          <div className="col-2 text-end">
                            <button
                              className="btn btn-sm p-0 border-0 bg-transparent"
                              onClick={() => setShowChart(!showChart)}
                            >
                              {!showChart ? (
                                <FaEyeSlash
                                  size={20}
                                  color="gray"
                                  title="Hide Chart"
                                />
                              ) : (
                                <FaEye
                                  size={20}
                                  color="gray"
                                  title="Show Chart"
                                />
                              )}
                            </button>
                          </div>
                        </div>
                      </div>

                      {showChart && (
                        <div className="card-body">
                          <div id="apexcharts-area" />
                          <Chart
                            options={treemap.options}
                            series={treemap.series}
                            type="bar"
                            className="activechart"
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  {showChart && (
                    <div className="col-12 col-lg-4 d-flex">
                      <div className="card flex-fill comman-shadow">
                        <div className="card-header">
                          <div className="row align-items-center">
                            <div className="col-12">
                              <div className="d-flex justify-content-between align-items-center">
                                <h5 className="card-title">
                                  Participated vs Created In System
                                </h5>
                                <div className="col-4 text-end">
                                  <button
                                    className="btn btn-sm p-0 border-0 bg-transparent"
                                    onClick={() =>
                                      setShowParticipatedDeals(
                                        !showParticipatedDeals,
                                      )
                                    }
                                  >
                                    {!showParticipatedDeals ? (
                                      <FaEyeSlash
                                        size={20}
                                        color="gray"
                                        title="Hide Chart"
                                      />
                                    ) : (
                                      <FaEye
                                        size={20}
                                        color="gray"
                                        title="Show Chart"
                                      />
                                    )}
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {showParticipatedDeals ? (
                          <div className="dash-widget d-flex justify-content-center align-items-center p-3">
                            <div className="circle-bar">
                              <ProgressBar
                                width={270}
                                radius={75}
                                progress={dealsProgressed.percentage}
                                rotate={-180}
                                strokeWidth={10}
                                strokeColor="#70C4CF"
                                strokeLinecap="square"
                                trackStrokeWidth={8}
                                trackStrokeColor="#e6e6e6"
                                trackStrokeLinecap="square"
                                pointerRadius={0}
                                initialAnimation={true}
                                transition="1.5s ease 0.5s"
                                trackTransition="0s ease"
                              >
                                <div
                                  className="circle-graph1"
                                  data-percent="50"
                                >
                                  <div className="progress-less teacher-dashboard text-center">
                                    <h4>
                                      {`${
                                        getdashboardData?.numberOfClosedDealsCount ??
                                        0
                                      }/${dealsProgressed?.totalDeals ?? "—"}`}
                                    </h4>
                                    <p>Deals</p>
                                  </div>
                                </div>
                              </ProgressBar>
                            </div>
                          </div>
                        ) : (
                          <div className="dash-widget d-flex justify-content-center align-items-center p-3">
                            <div className="circle-bar">
                              <ProgressBar
                                width={270}
                                radius={75}
                                progress={0}
                                rotate={-180}
                                strokeWidth={10}
                                strokeColor="#70C4CF"
                                strokeLinecap="square"
                                trackStrokeWidth={8}
                                trackStrokeColor="#e6e6e6"
                                trackStrokeLinecap="square"
                                pointerRadius={0}
                                initialAnimation={true}
                                transition="1.5s ease 0.5s"
                                trackTransition="0s ease"
                              >
                                <div className="circle-graph1" data-percent="0">
                                  <div className="progress-less teacher-dashboard text-center">
                                    <h4>****/****</h4>
                                    <p>Deals</p>
                                  </div>
                                </div>
                              </ProgressBar>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <div className="row">
                  <div className="col-xl-12 d-flex">
                    <div className="card flex-fill student-space comman-shadow">
                      <div className="card-header d-flex align-items-center justify-content-between">
                        <h5 className="card-title">Investment / Wallet</h5>
                        <div className="d-flex align-items-center gap-3">
                          {showTable && (
                            <ul className="chart-list-out student-ellips">
                              <li className="star-menus">
                                {
                                  <Link
                                    id="downloadLink"
                                    onClick={() =>
                                      handleClickGetLink("WALLETCREDITED")
                                    }
                                  >
                                    <i className="fa-solid fa-download"></i>
                                  </Link>
                                }
                              </li>
                            </ul>
                          )}
                          <div className="col-4 text-end">
                            <button
                              className="btn btn-sm p-0 border-0 bg-transparent"
                              onClick={() => setShowTable(!showTable)}
                            >
                              {!showTable ? (
                                <FaEyeSlash
                                  size={20}
                                  color="gray"
                                  title="Hide Chart"
                                />
                              ) : (
                                <FaEye
                                  size={20}
                                  color="gray"
                                  title="Show Chart"
                                />
                              )}
                            </button>
                          </div>
                        </div>
                      </div>

                      {showTable && (
                        <div className="card-body">
                          <div>
                            <Table
                              className="table-responsive table-responsive-md table-responsive-lg table-responsive-xs"
                              pagination={{
                                total: dashboardInvestment.apiData.countValue,
                                defaultPageSize:
                                  dashboardInvestment.defaultPageSize,
                                position: ["topRight"],
                                showSizeChanger: false,
                                onShowSizeChange: onShowSizeChange,
                                size: "default",
                                showLessItems: true,
                                responsive: true,
                              }}
                              columns={columns}
                              expandable={true}
                              dataSource={
                                dashboardInvestment.hasdata ? datasource : []
                              }
                              loading={dashboardInvestment.loading}
                              onChange={investmentdashboardPagination}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {regular_runningDeal.apidata?.listOfDealsInformationToLender
                    ?.length > 0 ? (
                    <div className="col-xl-12 d-flex">
                      <div className="card flex-fill comman-shadow">
                        <div className="card-header d-flex align-items-center">
                          <h5 className="card-title ">Ongoing Deals</h5>
                          <ul className="chart-list-out student-ellips">
                            <li className="star-menus"></li>
                          </ul>
                        </div>
                        <div className="card-body">
                          <div className="activity-groups">
                            {regular_runningDeal.apidata
                              .listOfDealsInformationToLender &&
                            regular_runningDeal.apidata
                              .listOfDealsInformationToLender.length > 0
                              ? regular_runningDeal.apidata.listOfDealsInformationToLender
                                  .slice(0, 4)
                                  .map((data, index) => (
                                    <div
                                      key={`listOfDealsInfo-${index}`}
                                      className="activity-awards"
                                    >
                                      <div className="award-boxs">
                                        <img src={rightclickmark} alt="Award" />
                                      </div>
                                      <div className="award-list-outs">
                                        <h4> {data.dealName}</h4>
                                        <h5>
                                          Min: ₹
                                          {data.minimumAmountInDeal.toLocaleString()}
                                          , Max: ₹
                                          {data.lenderPaticipationLimit.toLocaleString()}
                                          , RoI:
                                          {data.rateOfInterest.toFixed(2)}%
                                        </h5>
                                      </div>
                                      <div className="award-time-list">
                                        <Link
                                          to={`/participatedeal?dealId=${data.dealId}`}
                                        >
                                          <span>Participate</span>
                                        </Link>
                                      </div>
                                    </div>
                                  ))
                              : regular_runningDeal.apidataESCROW &&
                                regular_runningDeal.apidataESCROW
                                  .slice(0, 4)
                                  .map((data, index) => (
                                    <div
                                      key={`listOfDealsInfo-${index}`}
                                      className="activity-awards"
                                    >
                                      <div className="award-boxs">
                                        <img src={awardicon01} alt="Award" />
                                      </div>
                                      <div className="award-list-outs">
                                        <h4
                                          style={{
                                            fontWeight: "400",
                                            inlineSize: "18rem",
                                          }}
                                          className="textwrap"
                                        >
                                          {data.dealName}
                                        </h4>
                                        <h5>
                                          Min: {data.minimumPaticipationAmount},
                                          Max:
                                          {data.lenderPaticipationAmount}, RoI:
                                          {data.rateOfInterest}%
                                        </h5>
                                      </div>
                                      <div className="award-time-list">
                                        <Link
                                          to={`/participatedeal?dealId=${data.dealId}`}
                                        >
                                          <span>Participate</span>
                                        </Link>
                                      </div>
                                    </div>
                                  ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    ""
                  )}
                </div>
              </div>

              <Modal
                show={show}
                onHide={handleClose}
                dialogClassName="custom-small-modal"
              >
                <Modal.Header closeButton className="py-2 px-3">
                  <Modal.Title className="h6">Select City</Modal.Title>
                </Modal.Header>

                <Modal.Body className="py-2 px-3">
                  <div className="mb-2">
                    <label
                      htmlFor="citySelect"
                      className="form-label small mb-1"
                    >
                      City
                    </label>
                    <select
                      id="citySelect"
                      className="form-select form-select-sm"
                      value={selectedCity}
                      onChange={handleCityChange}
                    >
                      <option value="">Select a city</option>
                      <option value="Mumbai">Mumbai</option>
                      <option value="Delhi">Delhi</option>
                      <option value="Bangalore">Bangalore</option>
                      <option value="Hyderabad">Hyderabad</option>
                      <option value="Ahmedabad">Ahmedabad</option>
                      <option value="Chennai">Chennai</option>
                      <option value="Kolkata">Kolkata</option>
                      <option value="Pune">Pune</option>
                      <option value="Jaipur">Jaipur</option>
                      <option value="Lucknow">Lucknow</option>
                      <option value="Secunderabad">Secunderabad</option>
                      <option value="Vishakapatnam">Vishakapatnam</option>
                      <option value="Vijayawada">Vijayawada</option>
                      <option value="Gujarat">Gujarat</option>
                      <option value="Madhya Pradesh">Madhya Pradesh</option>
                      <option value="Others">Other</option>
                    </select>

                    {selectedCity === "Others" && (
                      <div className="mt-2">
                        <input
                          type="text"
                          placeholder="Enter City"
                          className="form-control form-control-sm"
                          name="customCity"
                          value={customCity}
                          onChange={(e) => setCustomCity(e.target.value)}
                        />
                      </div>
                    )}

                    {selectedCityerror && (
                      <p className="text-danger small mt-1">
                        Please select a city.
                      </p>
                    )}
                  </div>
                </Modal.Body>

                <Modal.Footer className="py-2 px-3">
                  <Button
                    variant="primary"
                    onClick={handleSave}
                    size="sm"
                    disabled={
                      !selectedCity ||
                      (selectedCity === "Others" && customCity.trim() === "")
                    }
                  >
                    Save
                  </Button>
                </Modal.Footer>
              </Modal>

              <Footer />
            </div>
          </div>

          <FloatingAssistant
            avatarSrc={logo}
            // onOpen={() => {
            //   window.open("https://askdisha.com/oxyloans", "_blank", "noopener,noreferrer");
            // }}
          />

          <style>
            {`
            .back-btn {
              background-color: white;
              color: #333;
              border: 1px solid #ccc;
              padding: 6px 12px;
              font-size: 14px;
              border-radius: 4px;
              cursor: pointer;
              transition: all 0.3s ease;
            }

            .back-btn:hover {
              background-color: #f0f0f0;
            }
          `}
          </style>
        </div>
      </div>
    </>
  );
};

export default AdminDashboard;
