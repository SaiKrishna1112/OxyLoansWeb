import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Header from "../../../Header/Header";
import "./InvoiceGrid.css";
import SideBar from "../../../SideBar/SideBar";
import { Table, Pagination, Spin, Tag } from "antd";
import "./InvoiceGrid.css";

import {
    myrunnig,
    paticipationChanges1,
    viewdealamountemi,
    withdrawriaseapipay,
} from "../../../HttpRequest/afterlogin";
import AlertTable from "./AlertTable";
import ModalComponet from "../../Base UI Elements/ModalComponet";
import MyParticipatedStatement from "../Utills/Modals/MyParticipatedStatement";
import { handleprincipalreturnaccounttype, paypendingprocessingAmount } from "../../Base UI Elements/SweetAlert";
import Swal from "sweetalert2";

const MyRunningDeals = () => {
    const [modelopen, setOpen] = useState(false);
    const [runningdeals, setrunningdeals] = useState({
        data: "",
        modelopen: false,
        paticipationChanges: "",
        dealID: "",
        isModalVisible: false,
        principal_return_account_type: false,
        dealLevelLoanEmiCard: "",
        model2: false,
        principalPayout: true,
        paginationCount: 0,
        pageNo: 1,
        pageSize: 10,
        loader: true,
    });


    const [withdrawriaseapi, setwithdrawriaseapi] = useState({
        message: "",
        status: null,
        amount: "",
    })

    const [searchinput, setinputserach] = useState("")



    const navigate = useNavigate()
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
    const handlemodalopen = (dealId) => {
        const response = viewdealamountemi(dealId);
        response.then((data) => {
            setrunningdeals({
                ...runningdeals,
                dealLevelLoanEmiCard: data,
            });
            setOpen(!modelopen);
        });
    };

    const principal_return_account_type = (type, dealId) => {
        setrunningdeals({
            ...runningdeals,
            principalPayout: type == "BANKACCOUNT" ? "WALLET" : "BANKACCOUNT",
            isModalVisible: !runningdeals.isModalVisible,
            dealID: dealId,
        });
    };

    const handleDataFromChild = (data) => {
        setrunningdeals({
            ...runningdeals,
            isModalVisible: !runningdeals.isModalVisible,
        });
    };

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
    //   const handleprincipalreturnaccounttype =async()=>{
    // const  response =await handleprincipalreturnaccounttypeapi(dealId , accountType);
    // console.log(response)
    //   }
    const paticipationChanges = (dealId) => {
        const response = paticipationChanges1(dealId);
        response.then((data) => {
            localStorage.setItem("paticipationChanges", data.data);

            setrunningdeals({
                ...runningdeals,
                paticipationChanges: data.data,
                model2: !runningdeals.model2,
            });
        });
    };

    const handleDataFromStatement = (data) => {
        setrunningdeals({
            ...runningdeals,
            model2: !runningdeals.model2,
        });
    };

    const changepagination = (pros) => {
        setrunningdeals({
            ...runningdeals,
            pageNo: pros,
        });
    };

    const statementHideProps = () => {
        setOpen(!modelopen);
    };

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
    useEffect(() => {
        const response = myrunnig(runningdeals);
        response.then((data) => {
            setrunningdeals({
                ...runningdeals,
                data: data.data.lenderPaticipatedResponseDto,
                paginationCount: data.data.count,
                loader: false,
            });
        });
        return () => { };
    }, [runningdeals.pageNo]);


    const handlechange = (event) => {
        setinputserach(event.target.value)

    }


    const filterdata = runningdeals.data !== "" ? runningdeals.data.filter(deal => deal.dealName.toLowerCase().includes(searchinput.toLowerCase())) : ""
    console.log(filterdata)

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
                                    <h3 className="page-title">Participated Deals </h3>
                                    <ul className="breadcrumb">
                                        <li className="breadcrumb-item">
                                            <Link to="/dashboard">Dashboard</Link>
                                        </li>
                                        <li className="breadcrumb-item active">My running deals</li>

                                        {modelopen && (
                                            <MyParticipatedStatement
                                                data={runningdeals.dealLevelLoanEmiCard}
                                                open={modelopen}
                                                hidefun={statementHideProps}
                                            />
                                        )}

                                        {runningdeals.model2 && (
                                            <AlertTable
                                                data={runningdeals.paticipationChanges}
                                                open={runningdeals.model2}
                                                sendRunningDealStatement={handleDataFromStatement}
                                            />
                                        )}

                                        {runningdeals.isModalVisible && (
                                            <ModalComponet
                                                data={`Are You Sure, you want to move the principal amount to ${runningdeals.principalPayout.toLowerCase()}`}
                                                heading={"Payout conformation !"}
                                                sendDataToParent={handleDataFromChild}
                                                dealIdInfo={runningdeals.dealID}
                                                trasferMethod={runningdeals.principalPayout}
                                            />
                                        )}
                                    </ul>
                                </div>
                            </div>
                        </div>

                        <div className="page-body">
                            <div className="pangnation">
                                <Pagination
                                    defaultCurrent={1}
                                    total={runningdeals.paginationCount}
                                    className="pull-right"
                                    onChange={changepagination}
                                />
                            </div>
                            <br />


                            <div class="col-md-3">
                                <input type="text" id="inputPassword6" class="form-control" aria-describedby="passwordHelpInline" name="inputserach" placeholder="Enter the deal Id" onChange={handlechange} />

                            </div>


                            {filterdata !== "" && filterdata.length > 0 ?

                                <>{filterdata.map((data, index) => (
                                    <div className="row" key={index}>
                                        <div className="card invoices-tabs-card border-0">
                                            <div className="card-body card-body pt-0 pb-0">
                                                <div className="invoices-main-tabs border-0 pb-0"></div>
                                            </div>
                                        </div>
                                        <div className="row">
                                            <div className="col-sm-12 col-lg-12 col-xl-12 col-12 my-lg-2">
                                                <div className="card invoices-grid-card w-100">
                                                    <div className="card-header row">
                                                        <Link
                                                            to="#"
                                                            className="invoice-grid-link col-sm-12 col-lg-4"
                                                        >
                                                            Deal Name: {data.dealName}{" "}
                                                            {localStorage.setItem("dealID", data.dealId)}
                                                        </Link>

                                                        <div className="col-sm-12 col-lg-2">
                                                            ROI :{data.rateOfInterest} %
                                                        </div>
                                                        <div className="col-sm-12 col-lg-3">
                                                            Tenure : {data.dealDuration} M
                                                        </div>
                                                        <div className="col-auto col-lg-3">
                                                            Participated Amount: INR {data.paticipatedAmount}
                                                        </div>
                                                        {/* <div>Status : Open</div> */}
                                                    </div>
                                                    <div className="card-middle row">
                                                        <div className="col-sm-12 col-lg-6">
                                                            <h6>Deal Type : {data.dealType}</h6>
                                                            <h6>First Interest : {data.firstInterestDate}</h6>
                                                            <h6>
                                                                Participated Date :{" "}
                                                                {data.firstParticipationDate}
                                                            </h6>
                                                        </div>
                                                        <div className="col-sm-12 col-lg-6">
                                                            <small>
                                                                <span className="fw-bold">Comments :</span>{" "}
                                                                {data.messageSentToLenders}
                                                            </small>
                                                        </div>
                                                    </div>
                                                    <div className="card-body row">
                                                        <div className="row align-items-center">
                                                            <div className="col-sm-6 col-lg-1">
                                                                <span>Deal-ID </span>
                                                                <h6 className="mb-0">{data.dealId}</h6>
                                                            </div>

                                                            <div className="col-sm-6 col-lg-2">
                                                                <span>Payout Type </span>
                                                                <h6 className="mb-0">{data.lederReturnType}</h6>
                                                            </div>
                                                            <div className="col-sm-6 col-lg-1">
                                                                <span> ATW</span>
                                                                <h6 className="mb-0">{data.withdrawStatus}</h6>
                                                            </div>

                                                            <div className="col-sm-6 col-lg-3">
                                                                <span>Deal Status</span>
                                                                <h6 className="mb-0">
                                                                    {data.participationStatus == "NOTATACHIEVED"
                                                                        ? "RUNNING"
                                                                        : data.participationStatus}
                                                                </h6>
                                                            </div>

                                                            <div className="col-sm-6 col-lg-2">
                                                                <span>Principal Payout</span>
                                                                <h6 className="mb-0">{data.accountType} </h6>
                                                            </div>
                                                            {/* <div className="col-sm-6 col-lg-2">
                                <span>Principal Payout</span>
                                <h6 className="mb-0">{data.accountType}    <Tag className="badge bg-info mx-2 fw-100" onClick={()=>handleprincipalreturnaccounttype(data.dealId ,data.accountType)}>Edit</Tag></h6> 
                              </div> */}

                                                            {data.withdrawStatus == "YES" && (
                                                                <div className="col-sm-6 col-lg-2">
                                                                    <span>ATW ROI</span>
                                                                    <h6 className="mb-0">
                                                                        {data.dealRateofinterest} %
                                                                    </h6>
                                                                </div>
                                                            )}

                                                            {data.interestEarned != null && (
                                                                <div className="col-sm-6 col-lg-2">
                                                                    <span>Interest Earned</span>
                                                                    <h6 className="mb-0">
                                                                        INR {data.interestEarned}
                                                                    </h6>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div className="card-footer">
                                                        <div className="row align-items-center align-items-center1">
                                                            <div className="col-auto">
                                                                <span
                                                                    className="badge bg-success-dark"
                                                                    type="button"
                                                                    onClick={() => {
                                                                        paticipationChanges(data.dealId);
                                                                    }}
                                                                >
                                                                    <i className="fa fa-forward mx-1"></i>
                                                                    Participation Info
                                                                </span>
                                                            </div>

                                                            <div className="col-auto">
                                                                <span
                                                                    type="button"
                                                                    className="badge bg-primary-dark"
                                                                    onClick={() => handlemodalopen(data.dealId)}
                                                                >
                                                                    <i className="fa fa-eye"></i> Interest
                                                                    Statement
                                                                </span>
                                                            </div>

                                                            <div className="col-auto">
                                                                <a
                                                                    href={
                                                                        data.groupLink == "" ? "#" : data.groupLink
                                                                    }
                                                                    target="_self"
                                                                    className="badge bg-success"
                                                                >
                                                                    <i className="fa fa-whatsapp"></i> Join Deal
                                                                </a>
                                                            </div>

                                                            <div className="col-auto">
                                                                <Link
                                                                    className="badge bg-warning"
                                                                    to={`/writetous?dealName=${data.dealName}&&dealId=${data.dealId}`}
                                                                >
                                                                    <i className="fa fa-edit"></i> Raise A query
                                                                </Link>
                                                            </div>

                                                            {data.feeStatus == "PENDING" && (
                                                                <div className="col-auto">
                                                                    <span
                                                                        type="button"
                                                                        className="badge bg-danger"
                                                                        onClick={() =>
                                                                            paypendingprocessingAmount(
                                                                                data.dealId,
                                                                                data.processingFee
                                                                            )
                                                                        }
                                                                    >
                                                                        <i className="fa fa-money"> </i> Fee Pending
                                                                    </span>
                                                                </div>
                                                            )}


                                                            {console.log(data)}
                                                            {data.participationStatus != "ACHIEVED" && (
                                                                <div className="col-auto">
                                                                    {/* <Link
                                    to={`/participatedeal?dealId=${data.dealId}`}
                                  >
                                    <span className="badge bg-success-dark">
                                      <i className="fa fa-forward mx-1"></i>
                                      Participate
                                    </span>
                                  </Link> */}


                                                                    {withdrawriaseapi.message === null ?
                                                                        <>
                                                                            <Link
                                                                                to={`/participatedeal?dealId=${data.dealId}`}
                                                                                className="badge bg-success-dark"
                                                                            >

                                                                                <i className="fa fa-forward mx-1"></i>
                                                                                Participate
                                                                            </Link>
                                                                        </>
                                                                        : <>
                                                                            <button className="badge bg-success-dark" onClick={() => oncliclparticpated(data.dealId)}>  <i className="fa fa-forward mx-1"></i>                     Participate</button>
                                                                        </>}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}</> : <>


                                    {runningdeals.loader == true ? (
                                        <div className="row d-flex justify-content-center">
                                            <Spin
                                                tip="Loading..."
                                                className="text-center"
                                                large="large"
                                            ></Spin>
                                        </div>
                                    ) :

                                        Array.isArray(runningdeals.data) &&
                                            runningdeals.data.length > 0 ? (
                                            runningdeals.data.map((data, index) => (
                                                <div className="row" key={index}>
                                                    <div className="card invoices-tabs-card border-0">
                                                        <div className="card-body card-body pt-0 pb-0">
                                                            <div className="invoices-main-tabs border-0 pb-0"></div>
                                                        </div>
                                                    </div>
                                                    <div className="row">
                                                        <div className="col-sm-12 col-lg-12 col-xl-12 col-12 my-lg-2">
                                                            <div className="card invoices-grid-card w-100">
                                                                <div className="card-header row">
                                                                    <Link
                                                                        to="#"
                                                                        className="invoice-grid-link col-sm-12 col-lg-4"
                                                                    >
                                                                        Deal Name: {data.dealName}{" "}
                                                                        {localStorage.setItem("dealID", data.dealId)}
                                                                    </Link>

                                                                    <div className="col-sm-12 col-lg-2">
                                                                        ROI :{data.rateOfInterest} %
                                                                    </div>
                                                                    <div className="col-sm-12 col-lg-3">
                                                                        Tenure : {data.dealDuration} M
                                                                    </div>
                                                                    <div className="col-auto col-lg-3">
                                                                        Participated Amount: INR {data.paticipatedAmount}
                                                                    </div>
                                                                    {/* <div>Status : Open</div> */}
                                                                </div>
                                                                <div className="card-middle row">
                                                                    <div className="col-sm-12 col-lg-6">
                                                                        <h6>Deal Type : {data.dealType}</h6>
                                                                        <h6>First Interest : {data.firstInterestDate}</h6>
                                                                        <h6>
                                                                            Participated Date :{" "}
                                                                            {data.firstParticipationDate}
                                                                        </h6>
                                                                    </div>
                                                                    <div className="col-sm-12 col-lg-6">
                                                                        <small>
                                                                            <span className="fw-bold">Comments :</span>{" "}
                                                                            {data.messageSentToLenders}
                                                                        </small>
                                                                    </div>
                                                                </div>
                                                                <div className="card-body row">
                                                                    <div className="row align-items-center">
                                                                        <div className="col-sm-6 col-lg-1">
                                                                            <span>Deal-ID </span>
                                                                            <h6 className="mb-0">{data.dealId}</h6>
                                                                        </div>

                                                                        <div className="col-sm-6 col-lg-2">
                                                                            <span>Payout Type </span>
                                                                            <h6 className="mb-0">{data.lederReturnType}</h6>
                                                                        </div>
                                                                        <div className="col-sm-6 col-lg-1">
                                                                            <span> ATW</span>
                                                                            <h6 className="mb-0">{data.withdrawStatus}</h6>
                                                                        </div>

                                                                        <div className="col-sm-6 col-lg-3">
                                                                            <span>Deal Status</span>
                                                                            <h6 className="mb-0">
                                                                                {data.participationStatus == "NOTATACHIEVED"
                                                                                    ? "RUNNING"
                                                                                    : data.participationStatus}
                                                                            </h6>
                                                                        </div>

                                                                        <div className="col-sm-6 col-lg-2">
                                                                            <span>Principal Payout</span>
                                                                            <h6 className="mb-0">{data.accountType} </h6>
                                                                        </div>
                                                                        {/* <div className="col-sm-6 col-lg-2">
                                <span>Principal Payout</span>
                                <h6 className="mb-0">{data.accountType}    <Tag className="badge bg-info mx-2 fw-100" onClick={()=>handleprincipalreturnaccounttype(data.dealId ,data.accountType)}>Edit</Tag></h6> 
                              </div> */}

                                                                        {data.withdrawStatus == "YES" && (
                                                                            <div className="col-sm-6 col-lg-2">
                                                                                <span>ATW ROI</span>
                                                                                <h6 className="mb-0">
                                                                                    {data.dealRateofinterest} %
                                                                                </h6>
                                                                            </div>
                                                                        )}

                                                                        {data.interestEarned != null && (
                                                                            <div className="col-sm-6 col-lg-2">
                                                                                <span>Interest Earned</span>
                                                                                <h6 className="mb-0">
                                                                                    INR {data.interestEarned}
                                                                                </h6>
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                                <div className="card-footer">
                                                                    <div className="row align-items-center align-items-center1">
                                                                        <div className="col-auto">
                                                                            <span
                                                                                className="badge bg-success-dark"
                                                                                type="button"
                                                                                onClick={() => {
                                                                                    paticipationChanges(data.dealId);
                                                                                }}
                                                                            >
                                                                                <i className="fa fa-forward mx-1"></i>
                                                                                Participation Info
                                                                            </span>
                                                                        </div>

                                                                        <div className="col-auto">
                                                                            <span
                                                                                type="button"
                                                                                className="badge bg-primary-dark"
                                                                                onClick={() => handlemodalopen(data.dealId)}
                                                                            >
                                                                                <i className="fa fa-eye"></i> Interest
                                                                                Statement
                                                                            </span>
                                                                        </div>

                                                                        <div className="col-auto">
                                                                            <a
                                                                                href={
                                                                                    data.groupLink == "" ? "#" : data.groupLink
                                                                                }
                                                                                target="_self"
                                                                                className="badge bg-success"
                                                                            >
                                                                                <i className="fa fa-whatsapp"></i> Join Deal
                                                                            </a>
                                                                        </div>

                                                                        <div className="col-auto">
                                                                            <Link
                                                                                className="badge bg-warning"
                                                                                to={`/writetous?dealName=${data.dealName}&&dealId=${data.dealId}`}
                                                                            >
                                                                                <i className="fa fa-edit"></i> Raise A query
                                                                            </Link>
                                                                        </div>

                                                                        {data.feeStatus == "PENDING" && (
                                                                            <div className="col-auto">
                                                                                <span
                                                                                    type="button"
                                                                                    className="badge bg-danger"
                                                                                    onClick={() =>
                                                                                        paypendingprocessingAmount(
                                                                                            data.dealId,
                                                                                            data.processingFee
                                                                                        )
                                                                                    }
                                                                                >
                                                                                    <i className="fa fa-money"> </i> Fee Pending
                                                                                </span>
                                                                            </div>
                                                                        )}


                                                                        {console.log(data)}
                                                                        {data.participationStatus != "ACHIEVED" && (
                                                                            <div className="col-auto">
                                                                                {/* <Link
                                    to={`/participatedeal?dealId=${data.dealId}`}
                                  >
                                    <span className="badge bg-success-dark">
                                      <i className="fa fa-forward mx-1"></i>
                                      Participate
                                    </span>
                                  </Link> */}


                                                                                {withdrawriaseapi.message === null ?
                                                                                    <>
                                                                                        <Link
                                                                                            to={`/participatedeal?dealId=${data.dealId}`}
                                                                                            className="badge bg-success-dark"
                                                                                        >

                                                                                            <i className="fa fa-forward mx-1"></i>
                                                                                            Participate
                                                                                        </Link>
                                                                                    </>
                                                                                    : <>
                                                                                        <button className="badge bg-success-dark" onClick={() => oncliclparticpated(data.dealId)}>  <i className="fa fa-forward mx-1"></i>                     Participate</button>
                                                                                    </>}
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="row">
                                                <div className="col-sm-12">
                                                    <div className="card card-table">
                                                        <div className="page-header"> </div>
                                                        <div className="card-body">
                                                            <div className="table-responsive">
                                                                <Table
                                                                    className="table border-0 star-student table-center mb-0"
                                                                    columns={columns}
                                                                    dataSource={[]}
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                </>}

                        </div>
                    </div>
                </div>
                {/* /Page Wrapper */}
            </div>
        </>
    );
};

export default MyRunningDeals;
