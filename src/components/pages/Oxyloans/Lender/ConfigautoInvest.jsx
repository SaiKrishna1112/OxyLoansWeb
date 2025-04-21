import React from "react";
import { Link } from "react-router-dom";
import Header from "../../../Header/Header";
import SideBar from "../../../SideBar/SideBar";
import Footer from "../../../Footer/Footer";

const ConfigautoInvest = () => {
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
            <div className="page-header">
              <div className="row">
                <div className="col-sm-12">
                  <div className="page-sub-header">
                    <h3 className="page-title">Auto Invest</h3>
                    <ul className="breadcrumb">
                      <li className="breadcrumb-item">
                        <Link to="/dashboard">DashBoard</Link>
                      </li>
                      <li className="breadcrumb-item active">
                        configauto Invest
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
            <div className="card">
              <div className="card-body">
                <div className="row">
                  <div className="col-lg-6">
                    <div className="student-personals-grp">
                      <div className="card mb-0">
                        <div className="card-body">
                          <div className="heading-detail">
                            <h4>Note Points</h4>
                          </div>

                          <ul style={{ listStyle: "block" }}>
                            <li>
                              As soon as the deal is launched, the minimum
                              amount will be participated automatically by the
                              system on behalf of the lender..
                            </li>
                            <li>
                              The system will participate only once in a deal
                              (if auto lending is opted). If the lender wants to
                              participate more than the min amount, he/she can
                              log in and participate till the max limit is
                              reached
                            </li>
                            <li>
                              Auto lending process chooses lenders based on
                              their wallet-loaded time. whoever loads their
                              wallet first will be participated first in the
                              deal.
                            </li>

                            <li>
                              If there is no min amount in the wallet auto-lend
                              cannot be applied.
                            </li>
                            <li>
                              Lenders can choose auto lending for specific types
                              of deals or all types of deals also.
                            </li>

                            <li>
                              Lenders can enable and disable auto-investment
                              configuration in their auto-investment history.
                            </li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="col-lg-6">
                    <div className="student-personals-grp">
                      <div className="card">
                        <div className="card-body">
                          <div className="heading-detail">
                            <h4>Auto Investment configuration</h4>
                          </div>
                          <div className="col-12 col-sm-12">
                            <div className="form-group local-forms">
                              <label>
                                User ID:
                                <span className="login-danger">*</span>
                              </label>
                              <input type="text" className="form-control" />
                            </div>
                          </div>
                          <div className="col-12 col-sm-12">
                            <div className="form-group local-forms">
                              <label>
                                Deal Type
                                <span className="login-danger">*</span>
                              </label>
                              <input type="text" className="form-control" />
                            </div>
                          </div>
                          <div className="col-12 col-sm-12">
                            <div className="form-group local-forms">
                              <label>
                                ROI Range Per Month
                                <span className="login-danger">*</span>
                              </label>
                              <input type="text" className="form-control" />
                            </div>
                          </div>
                          <div className="col-12 col-sm-12">
                            <div className="form-group local-forms">
                              <label>
                                Deal Participation Type
                                <span className="login-danger">*</span>
                              </label>
                              <input type="text" className="form-control" />
                            </div>
                          </div>

                          <div className="col-12 col-sm-12">
                            <button className="btn btn-sx col-md-3 btn-primary">
                              Save
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
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

export default ConfigautoInvest;
