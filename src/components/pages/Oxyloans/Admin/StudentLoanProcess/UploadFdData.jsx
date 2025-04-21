import React, { useState } from "react";
import DatePicker from "react-datepicker";
import { Link } from "react-router-dom";
import Header from "../../../../Header/Header";
import Sidebar from "../../../../SideBar/AdminSidebar";

const UploadFdData = () => {
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
                  <h3 className="page-title"> Add Student Bank Info </h3>
                  <ul className="breadcrumb">
                    <li className="breadcrumb-item">
                      <Link to="/dashboard">Dashboard</Link>
                    </li>
                    <li className="breadcrumb-item active">
                      Add Student Bank Info
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
                          <input
                            type="text"
                            name="withdrawFeedback"
                            className="form-control"
                            placeholder="Enther the Borrower Id "
                          />
                        </div>
                      </div>

                      <div className="col-12 col-sm-4">
                        <div className="form-group local-forms">
                          <label>
                            Amount :<span className="login-danger">*</span>
                          </label>
                          <input
                            type="text"
                            name="withdrawFeedback"
                            className="form-control"
                            placeholder="Enther the Amount  "
                          />
                        </div>
                      </div>
                      <div className="col-12 col-sm-4">
                        <div className="form-group local-forms">
                          <label>
                            Created on :<span className="login-danger">*</span>
                          </label>
                          <input
                            type="text"
                            name="withdrawFeedback"
                            className="form-control"
                            placeholder="Enther the Created on"
                          />
                        </div>
                      </div>

                      <div className="col-12">
                        <div className="student-submit">
                          <button type="button" className="btn btn-primary">
                            Save Fd
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

export default UploadFdData;
