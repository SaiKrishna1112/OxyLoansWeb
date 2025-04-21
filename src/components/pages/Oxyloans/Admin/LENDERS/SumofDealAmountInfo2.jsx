import React, { useState } from "react";
import DatePicker from "react-datepicker";
import { Link } from "react-router-dom";
import Header from "../../../../Header/Header";
import Sidebar from "../../../../SideBar/AdminSidebar";

const SumofDealAmountInfo2 = () => {
  return (
    <>
      <div className="main-wrapper">
        {/* Header */}
        <Header />

        {/* Sidebar */}
        <Sidebar />

        {/* Page Wrapper */}

        <div className="page-wrapper">
          <div className="content container-fluid">
            {/* Page Header */}
            <div className="page-header">
              <div className="row align-items-center">
                <div className="col">
                  <h3 className="page-title"> SumofDealAmountInfo</h3>
                  <ul className="breadcrumb">
                    <li className="breadcrumb-item">
                      <Link to="/dashboard">Dashboard</Link>
                    </li>
                    <li className="breadcrumb-item active">
                      SumofDealAmountInfo
                    </li>
                  </ul>
                </div>
              </div>
            </div>
            {/* /Page Header */}
            <div className="row">
              <div className="col-sm-12">
                <div className="card">
                  <div className="card-header"></div>
                  <div className="card-body">
                    {/* <form> */}
                    <div className="row">
                      <div className="col-12 col-sm-3">
                        <div className="form-group local-forms">
                          <label>
                            Select Lender Group
                            <span className="login-danger">*</span>
                          </label>
                          <select
                            type="text"
                            name="withdrawFeedback"
                            className="form-control"
                            // placeholder="Enther the Borrower Id "
                          >
                            <option>other</option>
                          </select>
                        </div>
                      </div>

                      <div className="col-12 col-sm-3">
                        <div className="form-group local-forms">
                          <label>
                            -- Choose Month--
                            <span className="login-danger">*</span>
                          </label>
                          <select
                            type="text"
                            name="withdrawFeedback"
                            className="form-control"
                            // placeholder="Enther the Borrower Id "
                          >
                            <option value="January">January</option>
                            <option value="February">February</option>
                            <option value="March">March</option>
                            <option value="April">April</option>
                            <option value="May">May</option>
                            <option value="June">June</option>
                            <option value="July">July</option>
                            <option value="August">August</option>
                            <option value="September">September</option>
                            <option value="October">October</option>
                            <option value="November">November</option>
                            <option value="December">December</option>
                          </select>
                        </div>
                      </div>

                      <div className="col-12 col-sm-3">
                        <div className="form-group local-forms">
                          <label>
                            Enter The Year
                            <span className="login-danger">*</span>
                          </label>
                          <input
                            type="text"
                            name="withdrawFeedback"
                            className="form-control"
                            // placeholder="Enther the Borrower Id "
                          />
                        </div>
                      </div>
                      <div className="col-12">
                        <div className="student-submit">
                          <button type="button" className="btn btn-primary">
                            Fetch details
                          </button>
                        </div>
                      </div>
                    </div>

                    {/*   </form> */}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* /Main Wrapper */}
    </>
  );
};

export default SumofDealAmountInfo2;
