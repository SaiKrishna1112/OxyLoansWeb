import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { regular_Api } from "../../../HttpRequest/afterlogin";
import Header from "../../../Header/Header";
import SideBar from "../../../SideBar/SideBar";
import "./InvoiceGrid.css";
import { Table, Pagination } from "antd";

const RegularPersonalDeal = () => {
  const [personal_runningDeal, setRegularRunningDeal] = useState({
    apidata: "",
    dealtype: "HAPPENING",
    paginationCount: 1,
    pageno: 1,
  });

  const changepagination = (pros) => {
    setRegularRunningDeal({
      ...personal_runningDeal,
      pageno: pros,
    });
  };

  useEffect(() => {
    const urlparams = window.location.pathname;
    const urldealname = urlparams.slice(1);

    const handleRegular = () => {
      const response = regular_Api(
        personal_runningDeal.dealtype,
        "PERSONAL",
        personal_runningDeal.pageno
      );

      response.then((data) => {
        if (data.request.status == 200) {
          setRegularRunningDeal({
            ...personal_runningDeal,
            apidata: data.data,
            paginationCount: data.data.count + 1,
          });
        }
      });
    };

    handleRegular();
    return () => {};
  }, [personal_runningDeal.pageno]);

  const dataSource = [];

  personal_runningDeal.apidata != ""
    ? dataSource.push({
        key: Math.random(),
        name: personal_runningDeal.apidata.dealName,
        loanamount: personal_runningDeal.apidata.dealAmount,
        availablelimit: personal_runningDeal.apidata.remainingAmountInDeal,
        tenureinmonths: personal_runningDeal.apidata.duration,
        funding: personal_runningDeal.apidata.fundStartDate,
        fundingdate: personal_runningDeal.apidata.fundEndDate,
        minimumparticipation:
          personal_runningDeal.apidata.minimumPaticipationAmount,
        maximumparticipation:
          personal_runningDeal.apidata.lenderParticiptionLimit,
      })
    : null;
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

  return (
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
                <h3 className="page-title">Personal Deals</h3>
                <ul className="breadcrumb">
                  <li className="breadcrumb-item">
                    <Link to="/dashboard">Dashboard</Link>
                  </li>
                  <li className="breadcrumb-item active">Running Deals </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Invoice Header */}

          <div className="card report-card">
            <div className="card-body h-10">
              <div className="row">
                <Link
                  to="/myRunningDeals"
                  className="btn btn-success col-lg-3 col-sm-6  mx-lg-2"
                >
                  <i className="fa fa-user mx-1"></i> My Participated Deals
                </Link>
              </div>
            </div>
          </div>

          <div className="pangnation">
            <Pagination
              defaultCurrent={1}
              total={personal_runningDeal.paginationCount}
              className="pull-right"
              onChange={changepagination}
            />
          </div>
          {personal_runningDeal.apidata.listOfDealsInformationToLender && (
            <>
              {personal_runningDeal.apidata.listOfDealsInformationToLender !==
              ""
                ? personal_runningDeal.apidata.listOfDealsInformationToLender.map(
                    (data, index) => (
                      <div className="row" key={index}>
                        <div className="col-sm-12 col-lg-12 col-xl-12 col-12 my-lg-2">
                          <div className="card invoices-grid-card w-100 h-25">
                            <div className="card-header row">
                              <Link
                                to="/viewinvoice"
                                className="invoice-grid-link col-sm-12 col-lg-4"
                              >
                                Deal Name: {data.dealName}
                              </Link>

                              <div className="col-sm-12 col-lg-2">
                                RoI : {data.rateOfInterest} %
                              </div>
                              <div className="col-sm-12 col-lg-3">
                                Tenure : {data.duration} Months
                              </div>
                              <div className="col-auto col-lg-3">
                                Deal Value : {data.dealAmount}
                              </div>
                              {/* <div>Status : Open</div> */}
                            </div>
                            <div className="card-middle row">
                              <div className="col-sm-12 col-lg-6">
                                <h6>
                                  Deal Opened Time :{" "}
                                  {data.fundsAcceptanceStartDate}
                                </h6>
                                <h6>
                                  Deal Closing Time :{" "}
                                  {data.fundsAcceptanceEndDate}
                                </h6>
                                <h6>
                                  First Participation :{" "}
                                  {data.firstParticipationDate}
                                </h6>
                                <h6>
                                  Last Participation :{" "}
                                  {data.lastParticipationDate}
                                </h6>
                              </div>
                              <div className="col-sm-12 col-lg-6">
                                <small>
                                  Comments : {data.messageSentToLenders}
                                </small>
                              </div>
                            </div>
                            <div className="card-body">
                              <div className="row align-items-center">
                                <div className="col-sm-6 col-lg-2">
                                  <span>Available Limit</span>
                                  <h6 className="mb-0">
                                    {data.remainingAmountToPaticipateInDeal}
                                  </h6>
                                </div>
                                <div className="col-sm-6 col-lg-2">
                                  <span>Min Amount</span>
                                  <h6 className="mb-0">
                                    {data.minimumAmountInDeal}
                                  </h6>
                                </div>
                                <div className="col-sm-6 col-lg-2">
                                  <span>Max Amount</span>
                                  <h6 className="mb-0">
                                    {data.lenderPaticipationLimit}
                                  </h6>
                                </div>
                                <div className="col-sm-6 col-lg-2">
                                  <span>ATW</span>
                                  <h6 className="mb-0">
                                    {data.withdrawStatus}
                                  </h6>
                                </div>

                                {data.withdrawStatus == "YES" && (
                                  <div className="col-sm-6 col-lg-2">
                                    <span>ATW ROI</span>
                                    <h6 className="mb-0">
                                      {data.roiForWithdraw} %
                                    </h6>
                                  </div>
                                )}

                                <div className="col-sm-6 col-lg-3">
                                  <span>Deal Status</span>
                                  <h6 className="mb-0">{data.fundingStatus}</h6>
                                </div>
                              </div>
                            </div>
                            <div className="card-footer">
                              <div className="row align-items-center">
                                <div className="col-auto">
                                  <Link
                                    to={`participatedeal?dealId=${data.dealId}`}
                                    className="badge bg-success-dark"
                                  >
                                    Participate
                                  </Link>
                                </div>

                                <div className="col-auto">
                                  <a
                                    href={data.dealLink}
                                    className="badge bg-primary-dark"
                                    target="_blank"
                                  >
                                    View Borrower Documents
                                  </a>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  )
                : null}
            </>
          )}

          {personal_runningDeal.apidata.listOfBorrowersDealsResponseDto && (
            <>
              <div className="card">
                <Table
                  columns={columns}
                  dataSource={
                    personal_runningDeal.apidata.listOfBorrowersDealsResponseDto
                      .length !== 0
                      ? dataSource
                      : []
                  }
                  pagination={false}
                />
              </div>
            </>
          )}
        </div>
      </div>
      {/* /Page Wrapper */}
    </div>
  );
};

export default RegularPersonalDeal;
