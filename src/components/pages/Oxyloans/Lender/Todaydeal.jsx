import React, { useEffect, useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import {
  borrowerIdMappedToDealIdapi,
  getNotAchievedDealsapi,
  regular_Api,
} from "../../../HttpRequest/afterlogin";
import Header from "../../../Header/Header";
import "./InvoiceGrid.css";
import SideBar from "../../../SideBar/SideBar";
import { Table, Pagination, Progress, Space } from "antd";
import Borrowermodel from "../Utills/Modals/Borrowermodel";

const Todaydeal = () => {
  const navigate = useNavigate();

  const [regular_runningDeal, setRegularRunningDeal] = useState([]);
  const groupName = localStorage.getItem("groupName");
  const [borrowermodelopen, setborrowermodelopen] = useState(false);
  const [borrowerview, setborrowerview] = useState([])

  const dataSource = [];

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

  //   useEffect(() => {
  //     const urlparams = window.location.pathname;
  //     const urldealname = urlparams.slice(1);

  //     const handleRegular = () => {
  //       const response = regular_Api(
  //         regular_runningDeal.dealtype,
  //         urldealname,
  //         regular_runningDeal.pageno
  //       );

  //       response.then((data) => {
  //         setRegularRunningDeal({
  //           ...regular_runningDeal,
  //           apidata: data.data,
  //           paginationCount: data.data.listOfDealsInformationToLender.length,
  //         });
  //       });
  //     };

  //     handleRegular();
  //     return () => {};
  //   }, [regular_runningDeal.pageno]);



  const borrowerIdMappedToDealId = (dealId) => {
    setborrowermodelopen(!borrowermodelopen)
    const response = borrowerIdMappedToDealIdapi(dealId);
    response.then((data) => {
      if (data.status == 200) {
        setborrowerview(data.data)
        console.log(data.data);

      }

    }).catch((error) => {
      console.log(error)
    })
  }
  useEffect(() => {
    const urlparams = window.location.pathname;
    const urldealname = urlparams.slice(1);

    const handleRegular = () => {
      const response = getNotAchievedDealsapi("NORMAL");

      response.then((data) => {
        console.log(data.data);
        setRegularRunningDeal(data.data);
      });
    };

    handleRegular();
    return () => { };
  }, []);

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
                    to="/regularRunningDeal"
                    className="btn btn-primary col-lg-3 col-sm-6  mx-lg-2"
                  >
                    <i className="fa fa-user mx-1"></i>View Other Deals
                  </Link>
                </div>
              </div>
            </div>
            <div className="pangnation">
              <Pagination
                defaultCurrent={1}
                total={regular_runningDeal.paginationCount}
                className="pull-right"
                onChange={changepagination}
              />
            </div>

            {borrowermodelopen && <>

              <Borrowermodel data={borrowerview} hidefun={statementHideProps1} /></>}
            {regular_runningDeal != "" && (
              <>
                {regular_runningDeal.length > 0 ? (
                  regular_runningDeal?.map((data, index) => (
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
                                {data?.repaymentType === "MONTHLY" && <> ROI : {data?.rateOfInterest} % P.M</>}
                                {data?.repaymentType === "PERDAY" && <> ROI : {(data?.rateOfInterest).toFixed(2)} % P.D</>}
                              </div>


                            <div className="col-sm-12 col-lg-2">
                              Deal Id : {data.dealId}
                            </div>
                            <div className="col-sm-12 col-lg-3">
                              Tenure : {data?.duration} {data?.repaymentType == "PERDAY" ? data?.duration > 1 ? "Days" : "Day" : data?.duration > 1 ? "Months" : "Month"}
                            </div>
                            <div className="col-sm-12 col-lg-3">
                              Borrower Name : {data?.borrowerName}
                            </div>
                            {/* <div className="col-auto col-lg-3">
                                Deal Value : {data.dealAmount}
                              </div> */}
                            {/* <div>Status : Open</div> */}
                          </div>
                          <div className="card-middle row">
                            <div className="col-sm-12 col-lg-6">
                              {/* <h6>
                                Funds Acceptance Date :{" "}
                                  {data.fundsAcceptanceStartDate}
                                </h6> */}
                              {/* <h6>
                                Funds Acceptance EndDate :{" "}
                                  {data.fundsAcceptanceEndDate}
                                </h6> */}
                              {/* <h6>
                                  First Participation :{" "}
                                  {data.firstParticipationDate}
                                </h6> */}
                            </div>
                            {/* <div className="col-sm-12 col-lg-6">
                                <small>
                                  Comments : {data.messageSentToLenders}
                                </small>
                              </div> */}
                          </div>
                          <div className="card-body">
                            <div className="row col-12 align-items-center">
                              {/* <Progress
                                  percent={(
                                    (data.totalPaticipatedAmount /
                                      data.dealAmount) *
                                    100
                                  ).toFixed(2)}
                                  size={"default"}
                                /> */}
                            </div>
                            <div className="row align-items-center">
                              {/* <div className="col-sm-6 col-lg-2">
                                  <span>Available Limit</span>
                                  <h6 className="mb-0">
                                    INR {data.remainingAmountToPaticipateInDeal}
                                  </h6>
                                </div> */}
                              <div className="col-sm-6 col-lg-2">
                                <span>Min Amount</span>
                                <h6 className="mb-0">
                                  INR {data.minimumAmountInDeal}
                                </h6>
                              </div>
                              <div className="col-sm-6 col-lg-2">
                                <span>Max Amount</span>
                                <h6 className="mb-0">
                                  INR {data.lenderPaticipationLimit}
                                </h6>
                              </div>
                              <div className="col-sm-6 col-lg-3">
                                {/* <span> Deal Start Date </span> */}
                                <h6 className="mb-0">
                                  {" "}
                                  Deal Start Date :{" "}
                                  {data.fundsAcceptanceStartDate}
                                </h6>
                                {/* <span>  Deal End Date </span> */}
                                <h6 className="mb-0">
                                  {" "}
                                  Deal End Date : {data.fundsAcceptanceEndDate}
                                </h6>
                              </div>
                              <small className="mt-2">
                                {data.feeStatusToParticipate === "Achieved" && <div class="alert alert-danger" role="alert">
                                  <span className="fw-bold fs-10" style={{ color: 'black' }}>
                                    <>This Deal is closed</>
                                  </span>
                                </div>}
                                {" "}
                              </small>
                              <small>
                                {data.dealCreatedType === "NEW" && <div class="alert alert-danger" role="alert">
                                  <span className="fw-bold fs-10" style={{ color: 'black' }}>
                                    <>This Deal is for only New Lender</>
                                  </span>
                                  {" "}
                                </div>
                                }
                              </small>

                              {/* <div className="col-sm-6 col-lg-2">
                                  <span>  Deal End Date </span>
                                  <h6 className="mb-0">
                                  {data.fundsAcceptanceEndDate}
                                  </h6>
                                </div> */}
                              <div className="col-sm-6 col-lg-5">
                                <div className="row align-items-center align-items-center1">
                                  <div className="col-auto">
                                    {data.lenderPaticipateStatus && (
                                      <>
                                        {" "}



                                        {data.dealCreatedType === "ANY" ? <>
                                          <Link
                                            to={`/participatedeal?dealId=${data.dealId}`}
                                            className="btn btn-success"
                                            disabled={data.lenderPaticipateStatus}
                                          >
                                            <i className="fa fa-forward mx-1"></i>
                                            Participate
                                          </Link>
                                        </> : <>



                                          {groupName === "NewLender" ? <>     <Link
                                            to={`/participatedeal?dealId=${data.dealId}`}
                                            className="btn btn-success"
                                            disabled={data.lenderPaticipateStatus}
                                          >
                                            <i className="fa fa-forward mx-1"></i>
                                            Participate
                                          </Link></> : <>
                                            {/* <button className="btn btn-success disabled">Participate</button> */}
                                            {data.dealCreatedType === "NEW" ? <></> : <>                                       <button className="badge bg-success-dark" onClick={() => oncliclparticpated(data.dealId)}  >  <i className="fa fa-forward mx-1"></i>                     Participate</button></>}
                                          </>}
                                        </>}

                                      </>
                                    )}
                                  </div>

                                  {/* <div className="col-auto">
                                    <a
                                      href={data.dealLink}
                                      className="btn btn btn-primary -dark"
                                      target="_blank"
                                      style={{ fontSize: "14px" }}
                                    >
                                      <i className="fa fa-eye"></i> View
                                      Borrower Documents
                                    </a>
                                  </div> */}
                                  {data.dealId >= 740 && <>     <div className="col-auto">
                                    <span
                                      type="button"
                                      className="badge bg-primary-dark"
                                      onClick={() => { borrowerIdMappedToDealId(data.dealId); localStorage.setItem("dealLink", data.dealLink) }}
                                    >
                                      <i className="fa fa-eye"></i> View borrowers  documents
                                    </span>
                                  </div></>}
                                </div>
                              </div>
                              {/* <div className="col-sm-6 col-lg-2">
                                  <span>ATW</span>
                                  <h6 className="mb-0">
                                    {data.withdrawStatus}
                                  </h6>
                                </div> */}

                              {data.withdrawStatus == "YES" && (
                                <div className="col-sm-6 col-lg-2">
                                  <span>ATW ROI</span>
                                  <h6 className="mb-0">
                                    {data.roiForWithdraw} %
                                  </h6>
                                </div>
                              )}

                              {/* <div className="col-sm-6 col-lg-3">
                                  <span>Deal Status</span>
                                  <h6 className="mb-0">{data.fundingStatus}</h6>
                                </div> */}
                            </div>
                          </div>
                          <div className="card-footer"></div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="card">
                    <Table columns={columns} dataSource={[]} loading={true} />
                    {setTimeout(() => {
                      // window.location = "/regularRunningDeal";
                      // <Navigate
                      //   to="/regularRunningDeal"
                      //   replace={"false"}
                      // ></Navigate>;

                      navigate("/regularRunningDeal");
                    }, 500)}
                  </div>
                )}
              </>
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
