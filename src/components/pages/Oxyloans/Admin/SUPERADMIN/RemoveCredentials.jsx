import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { Table } from "antd";

import Header from "../../../../../components/Header/OxyloansAdminHeader";
import Sidebar from "../../../../../components/SideBar/OxyloansAdminSidebar";
// import { onShowSizeChange } from "../../../../Pagination";
import { updateUserDetails } from "../../../../HttpRequest/admin";

const RemoveCredentials = () => {
  const[userId,setUserId]=useState("")
  const[mobileNo,setMobileNo]=useState("")
  const[email,setEmail]=useState("")

  const fetchRemoveDetails = async () => {
    console.log("Fetching details for user ID:", userId,email,mobileNo);
    const response =await updateUserDetails(userId,email,mobileNo)
    console.log("Response from API:", response);
    if(response.status === 200) {
      console.log("User details updated successfully:", response.data);
      message.success("You have successfully updated the user details")
    }
    else {
      console.error("Error updating user details:", response.data);
      alert("Error updating user details")
    }
  }

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
                  <h3 className="page-title">Update User Details</h3>
                  <ul className="breadcrumb">
                    <li className="breadcrumb-item">
                      <Link to="/dashboard">Dashboard</Link>
                    </li>
                    <li className="breadcrumb-item active">Update User Details</li>
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
                            placeholder="Enter the User Id"
                            onChange={(e)=> setUserId(e.target.value)}
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
                            type="number"
                            name="withdrawFeedback"
                            className="form-control"
                            placeholder="Enter the Mobile Number"
                            onChange={(e)=> setMobileNo(e.target.value)}
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
                            placeholder="Enter the Email"
                            onChange={(e)=> setEmail(e.target.value)}
                          />
                        </div>
                      </div>

                 
                    </div>
                    <div className="col-3">
                        <div className="student-submit" onClick={()=>fetchRemoveDetails()}>
                          <button type="button" className="btn btn-primary">
                            Fetch Details
                          </button>
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

export default RemoveCredentials;
