import React from "react";
import { Link } from "react-router-dom";
import FeatherIcon from "feather-icons-react";
import { useState, useEffect } from "react";

import { useDispatch, useSelector } from "react-redux";
import Header from "../../../../../Header/Header";
import Sidebar from "../../../../../SideBar/SideBar";

const CreateDeal = () => {
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
              <div className="row">
                <div className="col">
                  <h3 className="page-title">Profile</h3>
                  <ul className="breadcrumb">
                    <li className="breadcrumb-item">
                      <Link to="/dashboard">Dashboard</Link>
                    </li>
                    <li className="breadcrumb-item active">Profile</li>
                  </ul>
                </div>
              </div>
            </div>
            {/* /Page Header */}
            <div className="card">
              <div className="card-body">
                <h5 className="card-title">Personal Details</h5>
                <div className="row">
                  <div className="col-md-12 col-lg-12 row">
                    <div className="row mt-3">
                      <div className="form-group col-12 col-sm-4 local-forms">
                        <label>
                          Deal Name
                          <span className="login-danger">*</span>
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Enter Deal Name"
                          name="dealname"
                        />
                      </div>
                      <div className="form-group col-12 col-sm-4 local-forms">
                        <label>
                          Primary Borrower
                          <span className="login-danger">*</span>
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Enter Primary Borrower"
                          name="primaryborrower"
                        />
                      </div>

                      {/* <div className="form-group col-12 col-sm-4 local-forms">
                                <label>
                                  
                                  <span className="login-danger">*</span>
                                </label>
                                <input
                                   className="form-control"
                                  name="dob"
                                />  

                            
                              </div> */}

                      <div className="form-group col-12 col-sm-4 local-forms">
                        <label>
                          Loan Amount
                          <span className="login-danger">*</span>
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Enter Loan Amount"
                          name="loanamount"
                        />
                      </div>
                      <div className="form-group col-12 col-sm-4 local-forms">
                        <label>
                          RoI from Borrower
                          <span className="login-danger">*</span>
                        </label>
                        <input
                          type="text"
                          maxLength={10}
                          className="form-control"
                          placeholder="RoI from Borrower"
                          name="roIfromborrower"
                        />
                      </div>
                      <div className="form-group col-12 col-sm-4 local-forms">
                        <label>
                          WhatsApp No
                          <span className="login-danger">*</span>
                        </label>
                        <input
                          type="tel"
                          maxLength={10}
                          className="form-control"
                          placeholder="Enter WhatsApp "
                          name="whatsAppNumber"
                        />
                      </div>
                      <div className="form-group col-12 col-sm-4 local-forms">
                        <label>
                          Funds Start Date
                          <span className="login-danger">*</span>
                        </label>
                        <input
                          type="date"
                          className="form-control"
                          placeholder="Funds Start Date"
                          name="fundsstartdate"
                        />
                      </div>

                      <div className="form-group col-12 col-sm-4 local-forms">
                        <label>
                          Funds End Date
                          <span className="login-danger">*</span>
                        </label>
                        <input
                          type="date"
                          className="form-control"
                          placeholder="Funds End Date"
                          name="fundsendate"
                        />
                      </div>
                      <div className="form-group col-12 col-sm-4 local-forms">
                        <label>
                          Project URL
                          <span className="login-danger">*</span>
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Enter Project URL"
                          name="projecturl"
                        />
                      </div>
                      <div className="form-group col-12 col-sm-4 local-forms">
                        <label>
                          Tenure in Months
                          <span className="login-danger">*</span>
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Tenure in Months "
                          name="tenureinmonths"
                        />
                      </div>

                      <div className="form-group col-12 col-sm-4 local-forms">
                        <label>
                          First Interest Date
                          <span className="login-danger">*</span>
                        </label>
                        <input
                          type="date"
                          className="form-control"
                          placeholder="First Interest Date "
                          name="firstinterestdate"
                        />
                      </div>

                      <div className="form-group col-12 col-sm-4 local-forms">
                        <label>
                          Minimum Amount
                          <span className="login-danger">*</span>
                        </label>
                        <input
                          type="minimumamount"
                          className="form-control"
                          placeholder="First Interest Date "
                          name="firstinterestdate"
                        />
                      </div>
                      <div className="form-group col-12 col-sm-4 local-forms">
                        <label>
                          Maximum Amount <span className="login-danger">*</span>
                        </label>
                        <input
                          type="number"
                          className="form-control"
                          placeholder="Enter City "
                          name="maximumamount"
                        />
                      </div>
                      <div className="form-group col-12 col-sm-4 local-forms">
                        <label>
                          Deal Type
                          <span className="login-danger">*</span>
                        </label>
                        <select
                          type="text"
                          className="form-control"
                          placeholder="Deal Type"
                          name="state"
                        >
                          <option className="form-control">EQUITY</option>
                          <option className="form-control">NORMAL</option>
                          <option className="form-control">ESCROW</option>
                          <option className="form-control">ESCROW</option>
                          <option className="form-control"> PERSONAL </option>
                        </select>
                      </div>

                      <div className="form-group col-12 col-sm-4 local-forms">
                        <label>
                          {/* Project URL */}
                          Borrowers Ids Mapped To Deal
                          <span className="login-danger">*</span>
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Borrowers Ids Mapped To Deal"
                          name="borrowersids"
                        />
                      </div>
                      <div className="form-group col-12 col-sm-4 local-forms">
                        <label>
                          Mapped Users Loan Amount
                          <span className="login-danger">*</span>
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Mapped Users Loan Amount"
                          name="mappedusersloanamount"
                        />
                      </div>
                      <div className="form-group col-12 col-sm-4 local-forms">
                        <label>
                          Enach Status
                          <span className="login-danger">*</span>
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          placeholder=" Enach Status"
                          name="projecturl"
                        />
                      </div>

                      <div className="form-group col-12 col-sm-4 local-forms">
                        <label>
                          Fee ROI for Borrower
                          <span className="login-danger">*</span>
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Fee ROI for Borrower"
                          name="feeroiforborrower"
                        />
                      </div>

                      <div className="form-group col-12 col-sm-4 local-forms">
                        <label>
                          Fee Collected From Borrower
                          <span className="login-danger">*</span>
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Fee Collected From Borrower"
                          name="feecollectedfromborrower"
                        />
                      </div>

                      <div className="form-group col-12 col-sm-4 local-forms">
                        <label>
                          AnyTime Withdraw
                          <span className="login-danger">*</span>
                        </label>
                        <select
                          type="text"
                          className="form-control"
                          placeholder="AnyTime Withdraw"
                          name="anytimewithdraw"
                        >
                          <option className="form-control">No</option>
                          <option className="form-control">No</option>
                        </select>
                      </div>

                      <div className="form-group col-12 col-sm-4 local-forms">
                        <label>
                          Fee To Participate
                          <span className="login-danger">*</span>
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Fee ROI for Borrower"
                          name="feeroiforborrower"
                        />
                      </div>

                      <div className="form-group col-12 col-sm-4 local-forms">
                        <label>
                          Fee To Participate
                          <span className="login-danger">*</span>
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Fee ROI for Borrower"
                          name="feeroiforborrower"
                        />
                      </div>

                      <div className="form-group col-12 col-sm-4 local-forms">
                        <label>
                          WhatsApp Chat Id
                          <span className="login-danger">*</span>
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Fee ROI for Borrower"
                          name="feeroiforborrower"
                        />
                      </div>

                      <div className="form-group col-12 col-sm-4 local-forms">
                        <label>
                          WhatsApp Response Link
                          <span className="login-danger">*</span>
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Fee ROI for Borrower"
                          name="feeroiforborrower"
                        />
                      </div>

                      <div className="form-group col-12 col-sm-4 local-forms">
                        <label>
                          Create/Edit Deal Notification
                          <span className="login-danger">*</span>
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Fee ROI for Borrower"
                          name="feeroiforborrower"
                        />
                      </div>

                      <div className="form-group col-12 col-sm-4 local-forms">
                        <label>
                          Deal Launch
                          <span className="login-danger">*</span>
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Fee ROI for Borrower"
                          name="feeroiforborrower"
                        />
                      </div>

                      <div className="form-group col-12 col-sm-4 local-forms">
                        <label>
                          life Time Fee waive-off
                          <span className="login-danger">*</span>
                        </label>
                        <select
                          type="text"
                          className="form-control"
                          placeholder="Fee ROI for Borrower"
                          name="feeroiforborrower"
                        >
                          <option>No</option>
                          <option>No</option>
                        </select>
                      </div>

                      <div className="form-group col-12 col-sm-4 local-forms">
                        <label>
                          WhatsApp Notification
                          <span className="login-danger">*</span>
                        </label>
                        <select
                          type="text"
                          className="form-control"
                          placeholder="Fee ROI for Borrower"
                          name="feeroiforborrower"
                        >
                          <option>No</option>
                          <option>No</option>
                        </select>
                      </div>

                      <div className="form-group col-12 col-sm-4 local-forms">
                        <label>
                          Email Notification
                          <span className="login-danger">*</span>
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Email Notification"
                          name="emailnotification"
                        />
                      </div>

                      <table className="table">
                        <thead>
                          <tr>
                            <th scope="col">Offer No</th>
                            <th scope="col">Payout Mode</th>
                            <th scope="col">Oxy Premium Lenders</th>
                            <th scope="col">New Lenders</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <th scope="row">1</th>
                            <td>Monthly Interest pay-out</td>
                            <td>
                              <input
                                type="text"
                                className="form-control"
                                placeholder="Roi %"
                              />
                            </td>
                            <td>
                              <input
                                type="text"
                                className="form-control"
                                placeholder="Roi %"
                              />
                            </td>
                          </tr>
                          <tr>
                            <th scope="row">2</th>
                            <td>
                              Yearly Interest Pay-out (Please Re-Lend My Funds
                              for Next Deal)
                            </td>
                            <td>
                              <input
                                type="text"
                                className="form-control"
                                placeholder="Roi %"
                              />
                            </td>
                            <td>
                              <input
                                type="text"
                                className="form-control"
                                placeholder="Roi %"
                              />
                            </td>
                          </tr>
                          <tr>
                            <td>3</td>
                            <td>
                              End of Deal Interest Pay-out (Tenure Would be 1-12
                              Months)
                            </td>
                            <td>
                              <input
                                type="text"
                                className="form-control"
                                placeholder="Roi %"
                              />
                            </td>
                            <td>
                              <input
                                type="text"
                                className="form-control"
                                placeholder="Roi %"
                              />
                            </td>
                          </tr>

                          <tr>
                            <td>4</td>
                            <td>Quarterly Interest Pay-outt</td>
                            <td>
                              <input
                                type="text"
                                className="form-control"
                                placeholder="Roi %"
                              />
                            </td>
                            <td>
                              <input
                                type="text"
                                className="form-control"
                                placeholder="Roi %"
                              />
                            </td>
                          </tr>
                          <tr>
                            <td>5</td>
                            <td>Half-Yearly Interest pay-out</td>
                            <td>
                              <input
                                type="text"
                                className="form-control"
                                placeholder="Roi %"
                              />
                            </td>
                            <td>
                              <input
                                type="text"
                                className="form-control"
                                placeholder="Roi %"
                              />
                            </td>
                          </tr>
                        </tbody>
                      </table>

                      <hr></hr>

                      <div className="form-group col-12 col-sm-4 local-forms">
                        <label>
                          Whatapp Group
                          <span className="login-danger">*</span>
                        </label>
                        <select
                          type="text"
                          className="form-control"
                          placeholder="AnyTime Withdraw"
                          name="anytimewithdraw"
                        >
                          <option className="form-control">No</option>
                          <option className="form-control">No</option>
                        </select>
                      </div>

                      {/* <div className="form-group col-12 col-sm-4 local-forms">
                                <label>
                                Text message
                                  <span className="login-danger">*</span>
                                </label>
                                <input
                                  type="checkbox"
                                  className="form-control"
                                  placeholder="AnyTime Withdraw"
                               
                                
                                  name="anytimewithdraw"
                                />


                        
                              </div>  */}
                      <div className="form-group col-12 col-sm-4 local-forms">
                        <label>
                          Text message
                          <span className="login-danger">*</span>
                        </label>
                        <textarea
                          type="checkbo"
                          className="form-control"
                          placeholder="AnyTime Withdraw"
                          name="anytimewithdraw"
                        ></textarea>
                      </div>
                      <div className="col-12 ">
                        <button
                          className="btn btn-primary col-md-4 col-12"
                          type="submit"
                        >
                          Create Deal
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
      {/* /Main Wrapper */}
    </>
  );
};

export default CreateDeal;
