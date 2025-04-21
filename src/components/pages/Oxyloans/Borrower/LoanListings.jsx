import React, { useEffect, useState } from "react";
import BorrowerHeader from "../../../Header/BorrowerHeader";
import BorrowerSidebar from "../../../SideBar/BorrowerSidebar";
import FeatherIcon from "feather-icons-react/build/FeatherIcon";
import { Link } from "react-router-dom";
import { Pagination, Spin } from "antd";
import { borrowerloaslistings } from "../../../HttpRequest/afterlogin";
import { avatar04, invoicesicon5 } from "../../../imagepath";

const LoanListings = () => {
  const [myloanlisting, setmyloanslisting] = useState({
    apiData: [],
    hasdata: false,
    loading: true,
    pageNo: 1,
    pageSize: 10,
    defaultPageSize: 10,
    paginationCount: 10,
  });
  const changepagination = (pros) => {
    setmyloanslisting({
      ...myloanlisting,
      pageNo: pros,
    });
  };

  useEffect(() => {
    const response = borrowerloaslistings(
      myloanlisting.pageNo,
      myloanlisting.pageSize
    );
    response.then((data) => {
      if (data.request.status == 200) {
        setmyloanslisting({
          ...myloanlisting,
          apiData: data.data.results,
          loading: false,
          hasdata: data.data.totalCount == 0 ? false : true,
          paginationCount: data.data.totalCount,
        });
      }
    });
    return () => {};
  }, [myloanlisting.pageNo, myloanlisting.pageSize]);
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
              <div className="row align-items-center">
                <div className="col">
                  <h3 className="page-title">Loan Listings</h3>
                  <ul className="breadcrumb">
                    <li className="breadcrumb-item">
                      <Link to="/borrowerDashboard">Dashboard</Link>
                    </li>
                    <li className="breadcrumb-item active">Loan Listings</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Invoice Header */}
            <div className="page-header">
              <div className="row align-items-center">
                <div className="col" />
                <div className="col-auto">
                  <Link to="/invoicelist" className="invoices-links">
                    <FeatherIcon className="feather feather-list" icon="list" />
                  </Link>
                  <Link to="/invoicegrid" className="invoices-links active">
                    <FeatherIcon className="feather feather-grid" icon="grid" />
                  </Link>
                </div>
              </div>
            </div>

            {/* Report Filter */}

            <div className="card report-card">
              <div className="card-body pb-0">
                <div className="row">
                  <div className="col-md-12">
                    <ul className="app-listing">
                      <li>
                        <div className="report-btn">
                          <Link to="/loanRequest" className="btn">
                            <img src={invoicesicon5} alt="" className="me-2" />{" "}
                            Apply Loan
                          </Link>
                        </div>
                      </li>
                      <li>
                        <div className="report-btn">
                          <Link to="/borrowerAgreedLoans" className="btn">
                            <img src={invoicesicon5} alt="" className="me-2" />{" "}
                            Agrred Loan
                          </Link>
                        </div>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
            <>
              <div className="row">
                <div className="row pangnation  col-12">
                  <Pagination
                    defaultCurrent={1}
                    total={myloanlisting.paginationCount}
                    className="float-end m-3"
                    onChange={changepagination}
                  />
                </div>

                {myloanlisting.apiData.length > 0 ? (
                  myloanlisting.apiData.map((data, index) => {
                    return (
                      <div
                        className="col-sm-6 col-lg-4 col-xl-6 d-flex"
                        key={index}
                      >
                        <div className="card invoices-grid-card w-100">
                          <div className="card-header d-flex justify-content-between align-items-center">
                            <Link
                              to="/viewinvoice"
                              className="invoice-grid-link"
                            >
                              {data.loanRequest}
                            </Link>
                          </div>
                          <div className="card-middle">
                            <h2 className="card-middle-avatar">
                              <Link to="/borrowerloanListing">
                                <img
                                  className="avatar avatar-sm me-2 avatar-img rounded-circle"
                                  src={avatar04}
                                  alt="User Image"
                                />{" "}
                                {data.user.firstName + " "}
                                {data.user.lastName}
                              </Link>
                            </h2>
                          </div>
                          <div className="card-body">
                            <div className="row align-items-center">
                              <div className="col">
                                <span>
                                  <i className="far fa-money-bill-alt" /> Amount
                                </span>
                                <h6 className="mb-0">
                                  INR {data.loanRequestAmount}
                                </h6>
                              </div>
                              <div className="col-auto">
                                <span>
                                  <i className="far fa-calendar-alt" />{" "}
                                  Available on
                                </span>
                                <h6 className="mb-0">{data.expectedDate}</h6>
                              </div>

                              <div className="col-auto">
                                <span>
                                  <i className="far fa-user" /> Lender
                                </span>
                                <h6 className="mb-0">
                                  LR {data.userDisplayId}
                                </h6>
                              </div>

                              <div className="col-auto">
                                <span>
                                  <i className="far fa-user" /> Duration
                                </span>
                                <h6 className="mb-0"> {data.duration} M</h6>
                              </div>
                            </div>
                          </div>
                          <div className="card-footer">
                            <div className="row align-items-center">
                              <div className="col-auto">
                                <span className="badge bg-success-dark">
                                  Application
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="row d-flex justify-content-center">
                    <Spin
                      tip="Loading..."
                      className="text-center"
                      large="large"
                    ></Spin>
                  </div>
                )}
              </div>
            </>
          </div>
        </div>
        {/* /Page Wrapper */}
      </div>
      {/* /Main Wrapper */}
    </>
  );
};

export default LoanListings;
