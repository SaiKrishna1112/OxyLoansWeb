import React, { useState, useEffect } from "react";
import Chart from "react-apexcharts";
import BorrowerHeader from "../../Header/BorrowerHeader";
import BorrowerSidebar from "../../SideBar/BorrowerSidebar";
import ReactApexChart from "react-apexcharts";

import { Link } from "react-router-dom";
import "../Oxyloans/Lender/table.css";
import { invoicesicon5 } from "../../imagepath";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import axios from "axios";
import { base_url } from "../../HttpRequest/afterlogin";
import Swal from "sweetalert2";
import {
  dashboard1,
  dashboard2,
  dashboard3,
  dashboard4,
} from "../../imagepath";
import Footer from "../../Footer/Footer";

import { personalDetails } from "../Base UI Elements/SweetAlert";

const BorrowerDashboard = () => {
  const dispatch = useDispatch();
  const getdashboardData = useSelector((data) => data.dashboard.fetchDashboard);
  const getreducerprofiledata = useSelector((data) => data.counter.userProfile);
  const [show, setShow] = useState(false);
  const [selectedCity, setSelectedCity] = useState("");
  const [selectedCityerror, setSelectedCityerror] = useState(false);
  const [profileDetails, setProfileDetails] = useState();
  const [customCity, setCustomCity] = useState("");

  const navigate = useNavigate();
  const [treemap, Settreemap] = useState({
    series: [
      {
        name: "Loan Application",
        data: [1, 0, 0],
      },
    ],
    options: {
      annotations: {
        points: [
          {
            x: "Bananas",
            seriesIndex: 0,
            label: {
              borderColor: "#775DD0",
              offsetY: 0,
              style: {
                color: "#fff",
                background: "#775DD0",
              },
              text: "Bananas are good",
            },
          },
        ],
      },
      chart: {
        height: 350,
        type: "bar",
      },
      plotOptions: {
        bar: {
          borderRadius: 10,
          columnWidth: "10%",
        },
      },
      dataLabels: {
        enabled: false,
      },
      stroke: {
        width: 2,
      },
      grid: {
        row: {
          colors: ["#fff", "#f2f2f2"],
        },
      },
      xaxis: {
        labels: {
          rotate: -45,
        },
        categories: [
          "No loan Application",
          "No Loan  Responsed",
          "No EMI failed",
        ],
        tickPlacement: "on",
      },
      yaxis: {
        title: {
          text: "Loan Application",
        },
      },
      fill: {
        type: "gradient",
        gradient: {
          shade: "light",
          type: "horizontal",
          shadeIntensity: 0.25,
          gradientToColors: undefined,
          inverseColors: true,
          opacityFrom: 0.85,
          opacityTo: 0.85,
          stops: [50, 0, 100],
        },
      },
    },
  });

  const [data, setdata] = useState({
    series: [
      {
        name: "",
        data: [0, 0, 0, 600],
      },
    ],
    options: {
      chart: {
        height: 350,
        type: "line",
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
      title: {
        text: "Payment Information",
        align: "left",
      },
      grid: {
        row: {
          colors: ["#f3f3f3", "transparent"], // takes an array which will be repeated on columns
          opacity: 0.5,
        },
      },
      xaxis: {
        categories: ["Interest Paid", "Principal Paid", "Fee Paid", "OxyScore"],
      },
    },
  });
  useEffect(() => {
    getCall();
  }, []);
  const triggerSavingGoogleDistance = async (userId) => {
    try {
      await axios.post(
        `${base_url}savingGoogleDistance`,
        {
          userId: String(userId),
        },
        {
          headers: {
            accessToken: sessionStorage.getItem("accessToken"),
          },
        },
      );
    } catch (error) {
      // Silent background call - no user popup required.
      console.log("savingGoogleDistance api failed", error);
    }
  };

  const getCall = () => {
    axios
      .get(`${base_url}personal/${sessionStorage.getItem("userId")}`, {
        headers: {
          accessToken: sessionStorage.getItem("accessToken"),
        },
      })
      .then((response) => {
        console.log("response", response);
        setProfileDetails(response.data);
        if (
          response?.data?.latitude == null ||
          response?.data?.longitude == null
        ) {
          triggerSavingGoogleDistance(
            response?.data?.userId || sessionStorage.getItem("userId"),
          );
        }
        if (response.data.city == null || response.data.city == "") {
          setShow(true);
        }
      })
      .catch((error) => {
        console.log("error", error);
      });
  };

  const handleCityChange = (event) => {
    if (event.target.value === "") {
      setSelectedCityerror(true);
      return false;
    }
    setSelectedCityerror(false);

    setSelectedCity(event.target.value);
  };

  const handleSave = () => {
    console.log("Selected city:", selectedCity);
    const userId = sessionStorage.getItem("userId");
    console.log("User ID:", userId);
    // handleClose();
    if (selectedCity != "Others") {
      var data = {
        city: selectedCity,
      };
    } else {
      var data = {
        city: customCity,
      };
    }
    axios
      .post(`${base_url}${userId}/city`, data, {
        headers: {
          accessToken: sessionStorage.getItem("accessToken"),
        },
      })
      .then(function (response) {
        console.log("City saved successfully:", response.data);
        setShow(false);
        if (response.status === 200) {
          Swal.fire({
            icon: "success",
            title: "Success!",
            text: "City updated successfully.",
            confirmButtonText: "OK",
          });
          handleClose();
        }
        window.location.reload(); // Reload the page to reflect changes
        // Close the modal after saving
        setSelectedCity(""); // Reset the selected city
      })
      .catch(function (error) {
        console.error("Error saving city:", error.response);
        if (error.response.status == 401) {
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

  return (
    <>
      <div className="main-wrapper">
        {/* Header */}
        <BorrowerHeader />

        {/* Sidebar */}
        <BorrowerSidebar />

        {/* Page Wrapper */}
        <div className="page-wrapper">
          <div className="content container-fluid">
            {/* Page Header */}
            <div className="page-header">
              <div className="row">
                <div className="col-sm-12">
                  <div className="page-sub-header">
                    <h3 className="page-title">
                      Welcome {""}
                      {getreducerprofiledata?.length !== 0
                        ? (getreducerprofiledata?.firstName
                            .charAt(0)
                            .toUpperCase() +
                            getreducerprofiledata?.firstName
                              .slice(1)
                              .toLowerCase() ?? "")
                        : ""}
                    </h3>
                    <ul className="breadcrumb">
                      <li className="breadcrumb-item active">
                        <Link to="/borrowerDashboard">Home</Link>
                      </li>
                      <li className="breadcrumb-item">
                        {" "}
                        <Link to="/borrowerDashboard">Dashboard</Link>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* /Page Header */}
            {/* Overview Section */}
            <div className="row">
              <div className="col-xl-3 col-sm-6 col-12 d-flex">
                <div className="card bg-comman w-100">
                  <div className="card-body">
                    <div className="db-widgets d-flex justify-content-between align-items-center">
                      <div className="db-info">
                        <h6>Applications</h6>
                        <h3>
                          {getreducerprofiledata?.length !== 0
                            ? getreducerprofiledata?.lenderWalletAmount -
                              getreducerprofiledata?.holdAmountInDealParticipation -
                              getreducerprofiledata?.equityAmount
                            : ""}
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
                </div>
              </div>
              <div className="col-xl-3 col-sm-6 col-12 d-flex">
                <div className="card bg-comman w-100">
                  <div className="card-body">
                    <div className="db-widgets d-flex justify-content-between align-items-center">
                      <div className="db-info">
                        <h6>Active </h6>
                        <h3>
                          {getdashboardData?.length !== 0
                            ? (getdashboardData?.numberOfActiveDealsCount ?? 0)
                            : ""}
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
                </div>
              </div>
              <div className="col-xl-3 col-sm-6 col-12 d-flex">
                <div className="card bg-comman w-100">
                  <div className="card-body">
                    <div className="db-widgets d-flex justify-content-between align-items-center">
                      <div className="db-info">
                        <h6>Closed </h6>
                        <h3>
                          {getdashboardData?.length !== 0
                            ? (getdashboardData?.numberOfClosedDealsCount ?? 0)
                            : ""}
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
                </div>
              </div>
              <div className="col-xl-3 col-sm-6 col-12 d-flex">
                <div className="card bg-comman w-100">
                  <div className="card-body">
                    <div className="db-widgets d-flex justify-content-between align-items-center">
                      <div className="db-info">
                        <h6> Disbursed</h6>
                        <h3>
                          {getdashboardData?.length !== 0
                            ? getdashboardData?.numberOfClosedDealsCount +
                              getdashboardData?.numberOfActiveDealsCount
                            : ""}
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
                </div>
              </div>
            </div>

            <div className="card report-card">
              <div className="card-body pb-0">
                <div className="row">
                  <div className="col-md-12">
                    <ul className="app-listing">
                      <li>
                        <div className="report-btn">
                          <Link to="/borrowermyloanApplication" className="btn">
                            <img src={invoicesicon5} alt="" className="me-2" />
                            Active Loans
                          </Link>
                        </div>
                      </li>
                      <li>
                        <div className="report-btn">
                          <Link to="/borrowerAgreedLoans" className="btn">
                            <img src={invoicesicon5} alt="" className="me-2" />
                            Closed Loans
                          </Link>
                        </div>
                      </li>

                      <li>
                        <div className="report-btn">
                          <Link to="/loanRequest" className="btn">
                            <img src={invoicesicon5} alt="" className="me-2" />
                            New Request
                          </Link>
                        </div>
                      </li>

                      <li>
                        <div className="report-btn">
                          <Link to="/borrowerAgreedLoans" className="btn">
                            <img src={invoicesicon5} alt="" className="me-2" />
                            Agreed Loans
                          </Link>
                        </div>
                      </li>
                      <li>
                        <div className="report-btn">
                          <Link to="/nearbyleders" className="btn">
                            <i className="fa-solid fa-location-dot me-2"></i>
                            Nearby Lenders
                          </Link>
                        </div>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* /Overview Section */}
            <div className="row ">
              <div className="col-md-12 col-lg-6">
                {/* Revenue Chart */}
                <div className="card card-chart d-i">
                  <div className="card-header">
                    <div className="row align-items-center">
                      <div className="col-6"></div>
                    </div>
                  </div>
                  <div className="card-body">
                    <div id="apexcharts-area"></div>
                    <Chart
                      options={data.options}
                      series={data.series}
                      type="line"
                      height={350}
                    />
                  </div>
                </div>
                {/* /Revenue Chart */}
              </div>

              <div className="col-md-12 col-lg-6">
                {/* Student Chart */}
                <div className="card card-chart">
                  <div className="card-header">
                    <div className="row align-items-center">
                      {/* <div className="col-8">
                        <h6 className="card-title">Deals Amount Monitor</h6>
                      </div> */}
                    </div>
                  </div>
                  <div className="card-body">
                    <div id="apexcharts-area"></div>
                    <ReactApexChart
                      options={treemap.options}
                      series={treemap.series}
                      type="bar"
                      className="activechart"
                      height={350}
                    />
                  </div>
                </div>

                {/* /Student Chart */}
              </div>
            </div>
          </div>
          {/* Footer */}
          <Footer />
        </div>
        <Modal
          show={show}
          onHide={() => setShow(false)}
          dialogClassName="custom-small-modal"
        >
          <Modal.Header closeButton className="py-2 px-3">
            <Modal.Title className="h6">Select City</Modal.Title>
          </Modal.Header>

          <Modal.Body className="py-2 px-3">
            <div className="mb-2">
              <label htmlFor="citySelect" className="form-label small mb-1">
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
                <p className="text-danger small mt-1">Please select a city.</p>
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
      </div>
      {/* /Main Wrapper */}
    </>
  );
};

export default BorrowerDashboard;
