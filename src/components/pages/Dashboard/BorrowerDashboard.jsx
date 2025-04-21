import React, { useState } from "react";
import Chart from "react-apexcharts";
import BorrowerHeader from "../../Header/BorrowerHeader";
import BorrowerSidebar from "../../SideBar/BorrowerSidebar";
import ReactApexChart from "react-apexcharts";

import { Link } from "react-router-dom";
import "../Oxyloans/Lender/table.css";
import { invoicesicon5 } from "../../imagepath";

import { useSelector, useDispatch } from "react-redux";

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
                        ? getreducerprofiledata?.firstName
                            .charAt(0)
                            .toUpperCase() +
                            getreducerprofiledata?.firstName
                              .slice(1)
                              .toLowerCase() ?? ""
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
                            ? getdashboardData?.numberOfActiveDealsCount ?? 0
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
                            ? getdashboardData?.numberOfClosedDealsCount ?? 0
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
      </div>
      {/* /Main Wrapper */}
    </>
  );
};

export default BorrowerDashboard;
