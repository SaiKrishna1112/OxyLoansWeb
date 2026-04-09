import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { borrowerIdMappedToDealIdapi, handelsubmitdatafilter, regular_Api, withdrawriaseapipay } from "../../../HttpRequest/afterlogin";
import Header from "../../../Header/Header";
import "./InvoiceGrid.css";
import SideBar from "../../../SideBar/SideBar";
import { Table, Pagination, Progress, message, Tag } from "antd";
import { withdrawriaseapi11 } from "../../Base UI Elements/SweetAlert";
import Swal from "sweetalert2";
import { error } from "jquery";
import Borrowermodel from "../Utills/Modals/Borrowermodel";

const RegularRunningDeal = () => {
  const [regular_runningDeal, setRegularRunningDeal] = useState({
    apidata: "",
    dealtype: "HAPPENING",
    paginationCount: 1,
    pageno: 1,
  });
  const [borrowerview, setborrowerview] = useState([]);
  const [borrowerfilelink, setborrowerfilelik] = useState("")


  const [borrowermodelopen, setborrowermodelopen] = useState(false)
  const groupName = localStorage.getItem("groupName")



  const [withdrawriaseapi, setwithdrawriaseapi] = useState({
    message: "",
    status: null,
    amount: "",
  })



  const [searchinput, setinputserach] = useState("");



  const statementHideProps = () => {
    // setborrowermodelopen(!borrowermodelopen);
  };
  const statementHideProps1 = () => {

    setborrowermodelopen(!borrowermodelopen);
  };
  const navigate = useNavigate();
  const dataSource = [];

  const [filterdata, setfilterData] = useState([])
  regular_runningDeal.apidata != ""
    ? dataSource.push({
      key: Math.random(),
      name: regular_runningDeal.apidata.dealName,
      loanamount: regular_runningDeal.apidata.dealAmount,
      availablelimit: regular_runningDeal.apidata.remainingAmountInDeal,
      tenureinmonths: regular_runningDeal.apidata.duration,
      funding: regular_runningDeal.apidata.fundStartDate,
      fundingdate: regular_runningDeal.apidata.fundEndDate,
      minimumparticipation:
        regular_runningDeal.apidata.minimumPaticipationAmount,
      maximumparticipation:
        regular_runningDeal.apidata.lenderParticiptionLimit,
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

  const changepagination = (pros) => {
    setRegularRunningDeal({
      ...regular_runningDeal,
      pageno: pros,
    });
  };

  useEffect(() => {
    const urlparams = window.location.pathname;
    const urldealname = urlparams.slice(1);

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
          paginationCount: data.data.totalCount,
        });
      });
    };

    handleRegular();
    return () => { };
  }, [regular_runningDeal.pageno]);



  useEffect(() => {


    const withdrawriase = () => {
      const response = withdrawriaseapipay(withdrawriaseapi.status)

      response.then((data) => {
        console.log(data.data.status)
        if (data.status === 200) {
          setwithdrawriaseapi({
            message: data.data.status,
            amount: data.data.amount
          })
        } else {
          setwithdrawriaseapi({
            message: null
          })
        }

      });
    };

    withdrawriase();
  }, [])



  const withdrawriaseapi11 = (navigate, dealId, message, amount) => {
    Swal.fire({
      // title: "error",
      text: message,
      icon: "warning",
      showCancelButton: true,
      cancelButtonText: "Continue to particpate",
      showConfirmButton: true,
      confirmButtonText: "Cancel withdrawal",
    }).then((result) => {
      if (result.isConfirmed) {
        withdrawriaseapipay("yes")
          .then((data) => {
            // Swal.fire({
            //   title: "Processing fee paid successfully!",
            //   icon: "success",
            //   showCancelButton: true,
            //   cancelButtonText: "cancel",
            //   showConfirmButton: true,
            //   confirmButtonText: "ok",
            // });
            navigate(`/participatedeal?dealId=${dealId}`);  // Correct use of navigate passed as an argument
          })
          .catch((error) => {
            // Handle error if needed
            console.log(error)
          });
      } else if (result.dismiss === Swal.DismissReason.cancel) {
        // Navigate when "Participate" is clicked
        navigate(`/participatedeal?dealId=${dealId}&amount=${amount}`);
      }
    });
  };

  const oncliclparticpated = (dealId) => {
    console.log(withdrawriaseapi.message)
    withdrawriaseapi11(navigate, dealId, withdrawriaseapi.message, withdrawriaseapi.amount)
  }

  <div className="col-auto">
    <span
      type="button"
      className="badge bg-primary-dark"
      onClick={() => borrowerIdMappedToDealId(data.dealId)}
    >
      <i className="fa fa-eye"></i> View borrowers document
    </span>
  </div>


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
  const handlechange = (event) => {
    setinputserach(event.target.value)

  }




  // const handlesubmitfilterdeal = async (searchinput) => {


  //   console.log(searchinput)
  //   try {
  //     const response = await handelsubmitdatafilter(searchinput);
  //     console.log(response)
  //     setfilterData(response.data);

  //   } catch (error) {
  //     console.log(error)
  //   }
  // }
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
                  <h3 className="page-title">Running Deals</h3>
                  <ul className="breadcrumb">
                    <li className="breadcrumb-item">
                      <Link to="/dashboard">Dashboard</Link>
                    </li>
                    <li className="breadcrumb-item active">Running Deals </li>
                  </ul>
                </div>
              </div>
              <div className="button_class" style={{ display: 'flex', flexDirection: 'row', position: 'absolute', right: '1rem', flexWrap: 'wrap' }}>
                <Link to="/todaydeal">
                  <Tag style={{ height: '1.8rem', display: 'flex', alignItems: 'center' }} className="badge bg-info mx-2">Today
                    Deals</Tag>
                </Link>
                <Link to="/myRunningDeals">
                  <Tag style={{ height: '1.8rem', display: 'flex', alignItems: 'center', backgroundColor: '#008f64', }} className="badge bg-success-dark mx-2">My Participated Deals</Tag>
                </Link>
                <Link to="/myclosedDeals">
                  <Tag style={{ height: '1.8rem', display: 'flex', alignItems: 'center' }} className="badge bg-success mx-2">Get My Closed Deals</Tag>
                </Link></div>
            </div>



            {/* Invoice Header */}

            <div className="card report-card">
              {/* <div className="card-body h-10">
                <div className="row">
                  <Link
                    to="/myRunningDeals"
                    className="btn btn-success col-lg-3 col-sm-6  mx-lg-2"
                  >
                    <i className="fa fa-user mx-1"></i> My Participated Deals
                  </Link>
                </div>
              </div> */}
            </div>

            <div class="col-md-3">

              {/* <input type="text" id="inputPassword6" class="form-control" aria-describedby="passwordHelpInline" name="inputserach" placeholder="Enter the Deal Name..." onChange={handlechange} /> */}

              {/* <div class="input-group mb-3">
                <input type="text" class="form-control" id="inputPassword6" className="form-control" aria-describedby="passwordHelpInline" name="inputserach" placeholder="Enter the Deal Name..." onChange={handlechange} />

                <button class="btn btn-outline-secondary" type="button" id="button-addon2" onClick={() => handlesubmitfilterdeal(searchinput)}>   Search</button>
              </div> */}



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

            {regular_runningDeal.apidata?.listOfBorrowersDealsResponseDto && (
              <>
                {regular_runningDeal.apidata.listOfBorrowersDealsResponseDto
                  .length > 0 ? (
                  regular_runningDeal.apidata.listOfBorrowersDealsResponseDto.map(
                    (data, index) => (
                      <div className="row" key={index}>
                        <div className="col-sm-12 col-lg-12 col-xl-12 col-12 my-lg-2">
                          <div className="card invoices-grid-card w-100 h-25">
                            <div className="card-header row">
                              <Link
                                to="#"
                                className="invoice-grid-link col-sm-12 col-lg-2"
                              >
                                Deal Id: {data.dealId}
                              </Link>
                              <Link
                                to="#"
                                className="invoice-grid-link col-sm-12 col-lg-3"
                              >
                                Deal Name: {data.dealName}
                              </Link>

                              <div className="col-sm-12 col-lg-2">

                                {data.repaymentType === "YEARLY" && (
                                  <>ROI: {(data.rateOfInterest * 12).toFixed(2)} % P.A</>
                                )}
                                {data.repaymentType === "MONTHLY" && <> ROI : {data.rateOfInterest} %</>}
                              </div>
                              <div className="col-sm-12 col-lg-2">
                                Tenure : {data.duration} {data.durationType == "DAYS"? data.duration > 1 ? "Days" : "Day" : data.duration > 1 ? "Months" : "Month"}
                              </div>
                              <div className="col-auto col-lg-3">
                                Deal Value : INR {data.dealAmount}
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
                              </div>
                              <div className="col-sm-12 col-lg-6">
                                <small>
                                  <span className="fw-bold fs-6">
                                    Comments :
                                  </span>
                                  {data.messageSentToLenders}
                                </small>

                                <br></br>
                                <small>
                                  <span className="fw-bold fs-6">
                                    Fee Status To Participate :
                                  </span>
                                  {" "} {data.feeStatusToParticipate}
                                </small>

                                {/* {data.dealCreatedType} */}

                              </div>
                              <small>
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
                            </div>
                            <div className="card-body">
                              <div className="row col-12 align-items-center">
                                <Progress
                                  percent={(
                                    (data.totalPaticipatedAmount /
                                      data.dealAmount) *
                                    100
                                  ).toFixed(2)}
                                  size={"default"}
                                />
                              </div>
                              <div className="row align-items-center">
                                <div className="col-sm-6 col-lg-2">
                                  <span>Available Limit</span>
                                  <h6 className="mb-0">
                                    INR {data.remainingAmountToPaticipateInDeal}
                                  </h6>
                                </div>
                                <div className="col-sm-6 col-lg-2">
                                  <span>Min Amount</span>
                                  <h6 className="mb-0">
                                    INR {data.minimumPaticipationAmount}
                                  </h6>
                                </div>
                                <div className="col-sm-6 col-lg-2">
                                  <span>Max Amount</span>
                                  <h6 className="mb-0">
                                    INR {data.paticipationLimitToLenders}
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
                              <div className="row align-items-center align-items-center1">
                                <div className="col-auto">


                                  {withdrawriaseapi.message === null ?
                                    <>
                                      {/* <Link
                                        to={`/participatedeal?dealId=${data.dealId}`}
                                        className="badge bg-success-dark"
                                      >

                                        <i className="fa fa-forward mx-1"></i>
                                        Participate
                                      </Link> */}

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
                                              <button className="btn btn-success disabled">Participate</button>
                                            </>}</>}

                                        </>
                                      )}
                                    </>
                                    : <>
                                      {data.dealCreatedType === "NEW" ? <></> : <>                                       <button className="badge bg-success-dark" onClick={() => oncliclparticpated(data.dealId)}  >  <i className="fa fa-forward mx-1"></i>                     Participate</button></>}

                                    </>}
                                  {/* <Link
                                    to={`/participatedeal?dealId=${data.dealId}`}
                                    className="badge bg-success-dark"
                                  >

                                    <i className="fa fa-forward mx-1"></i>
                                    Participate
                                  </Link> */}
                                </div>


                                {data.dealId >= 740 && <>     <div className="col-auto">
                                  <span
                                    type="button"
                                    className="badge bg-primary-dark"
                                    onClick={() => borrowerIdMappedToDealId(data.dealId)}
                                  >
                                    <i className="fa fa-eye"></i> View borrowers  documents
                                  </span>
                                </div></>}

                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  )
                ) : (
                  <div className="card">
                    <Table
                      columns={columns}
                      dataSource={
                        regular_runningDeal.apidata
                          .listOfDealsInformationToLender.length !== 0
                          ? dataSource
                          : []
                      }
                    />
                  </div>
                )}
              </>
            )}


            {/* {regular_runningDeal.apidata.listOfDealsInformationToLender && (
              <>
                <div className="card">
                  <Table
                    columns={columns}
                    dataSource={
                      regular_runningDeal.apidata.listOfDealsInformationToLender
                        .length !== 0
                        ? dataSource
                        : []
                    }
                  />
                </div>
              </>
            )} */}

          </div>
        </div>
        {/* /Page Wrapper */}
      </div>
      {/* /Main Wrapper */}
    </>
  );
};

export default RegularRunningDeal;
