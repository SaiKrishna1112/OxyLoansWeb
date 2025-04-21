import React, { useState } from "react";
import DatePicker from "react-datepicker";
import { Link } from "react-router-dom";
import Header from "../../../../Header/Header";
import Sidebar from "../../../../SideBar/AdminSidebar";

const LendersLoanApplications = () => {
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
                  <h3 className="page-title"> FD Statistics </h3>
                  <ul className="breadcrumb">
                    <li className="breadcrumb-item">
                      <Link to="/dashboard">Dashboard</Link>
                    </li>
                    <li className="breadcrumb-item active">
                      Transfer The Funds
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
                      <div className="col-12 col-sm-4">
                        <div className="form-group local-forms">
                          <label>
                            Borrower Id :<span className="login-danger">*</span>
                          </label>
                          <select
                            type="text"
                            name="withdrawFeedback"
                            className="form-control"
                            placeholder="Enther the Borrower Id "
                          >
                            <option>Please choose option</option>
                            <option>Date Range</option>
                          </select>
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

                    <div className="row col-6" style={{ marginTop: "1rem" }}>
                      <table className="table table-hover">
                        <tr>
                          <td className="table-primary">No of FDs Done</td>
                          <td className="table-secondary"> 4</td>
                        </tr>

                        <tr>
                          <td className="table-primary">Value of the FDS</td>
                          <td className="table-secondary">INR 2600000</td>
                        </tr>

                        <tr>
                          <td className="table-primary">
                            No of the active FDS
                          </td>
                          <td className="table-secondary"> 0</td>
                        </tr>

                        <tr>
                          <td className="table-primary">
                            Value of the active Fds
                          </td>
                          <td className="table-secondary"> INR 0</td>
                        </tr>

                        <tr>
                          <td className="table-primary">
                            Total Interest Received to ICICI
                          </td>
                          <td className="table-secondary">INR 3000</td>
                        </tr>
                        <tr>
                          <td className="table-primary">
                            Total Interest Received to HDFC
                          </td>
                          <td className="table-secondary"> INR 550</td>
                        </tr>
                        <tr>
                          <td className="table-primary">
                            Total Fd Closed Interest
                          </td>
                          <td className="table-secondary"> INR 2510000</td>
                        </tr>
                      </table>
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

export default LendersLoanApplications;
