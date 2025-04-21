import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { Table } from "antd";

import Header from "../../../../Header/Header";
import Sidebar from "../../../../SideBar/AdminSidebar";
import { onShowSizeChange } from "../../../../Pagination";
import { getMembershiphistory } from "../../../../HttpRequest/afterlogin";

const CreateUtmforpartnerDealer = () => {
  return (
    <>
      <div className="main-wrapper">
        <Header />
        <Sidebar />
        {/*Page wrapper */}
        <div className="page-wrapper">
          <div className="content container-fluid">
            {/*Page Header */}
            <div className="page-header">
              <div className="row">
                <div className="col">
                  <h3 className="page-title">Paid Borrowers</h3>
                  <ul className="breadcrumb">
                    <li className="breadcrumb-item">
                      <Link to="/dashboard">Dashboard</Link>
                    </li>
                    <li className="breadcrumb-item active">Paid Borrowers</li>
                  </ul>
                </div>
              </div>
            </div>
            {/* /Page Header */}

            <div className="row">
              <div className="col-sm-12">
                <div className="card">
                  <div className="card-body">
                    <div className="row">
                      <div className="col-12 col-sm-3">
                        <div className="form-group local-forms">
                          <label>
                            User ID
                            <span className="login-danger">*</span>
                          </label>
                          <input
                            type="text"
                            name="withdrawFeedback"
                            className="form-control"
                            placeholder="Enther the Start Date"
                          />
                        </div>
                      </div>

                      <div className="col-12 col-sm-3">
                        <div className="form-group local-forms">
                          <label>
                            Mobile No
                            <span className="login-danger">*</span>
                          </label>
                          <input
                            type="text"
                            name="withdrawFeedback"
                            className="form-control"
                            placeholder="Enther the Start Date"
                          />
                        </div>
                      </div>
                      <div className="col-12 col-sm-3">
                        <div className="form-group local-forms">
                          <label>
                            Email
                            <span className="login-danger">*</span>
                          </label>
                          <input
                            type="text"
                            name="withdrawFeedback"
                            className="form-control"
                            placeholder="Enther the Start Date"
                          />
                        </div>
                      </div>
                      <div className="col-3">
                        <div className="student-submit">
                          <button type="button" className="btn btn-primary">
                            Fetch Deatils
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
        {/*Page wrapper */}
      </div>
    </>
  );
};

export default CreateUtmforpartnerDealer;
