import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import BorrowerHeader from "../../../Header/BorrowerHeader";
import BorrowerSidebar from "../../../SideBar/BorrowerSidebar";
import {
  HandleWithFooter,
  WarningAlertWalltTran,
  WarningAlerterror,
} from "../../Base UI Elements/SweetAlert";

import { submitloanRequest } from "../../../HttpRequest/afterlogin";

const LoanRequest = () => {
  const [newloandrequest, setnewloanrequest] = useState({
    loanamount: "",
    roi: "",
    duration: "",
    durationType: true,
    repayment: "",
    loanpurpose: "",
    expectedDate: "",
  });

  const handleInputchange = (event) => {
    const { name, value } = event.target;
    setnewloanrequest({
      ...newloandrequest,
      [name]: value,
    });
  };

  const handleSubmitHandler = () => {
    const response = submitloanRequest(newloandrequest);
    response.then((data) => {
      if (data.request.status == 200) {
        HandleWithFooter(
          "The wallet-to-wallet transfer was successful. Your withdrawal request has been initiated, and the receiver will receive the wallet amount after OxyAdmins approval."
        );
      } else if (data.request.status == 403) {
        WarningAlertWalltTran(data.response.data.errorMessage);
      } else {
        WarningAlerterror(data.response.data.errorMessage);
      }
    });
  };

  const searchOnchange = (pros) => {
    const { name, value } = pros.target;
    setnewloanrequest({
      ...newloandrequest,
      [name]: value,
    });
  };

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
                  <h3 className="page-title">Review your loan application</h3>
                  <ul className="breadcrumb">
                    <li className="breadcrumb-item">
                      <Link to="/">DashBoard</Link>
                    </li>
                    <li className="breadcrumb-item active">Wallet To Wallet</li>
                  </ul>
                </div>
              </div>
            </div>
            {/* /Page Header */}
            <div className="row">
              <div className="col-sm-12">
                <div className="card">
                  <div className="card-header">
                    <p className="note_point text-bold fst-italic">
                      <p>Your Loan Eligibility is : INR 0 </p>
                      <code>
                        <b>Note : </b>
                      </code>

                      <div>
                        {" "}
                        Loan Eligibility Criteria for a borrower: You should
                        prove your monthly salary — upload your salary slip in
                        the system. If your salary is INR 24,000 per month and
                        one user registers through your referral link, then your
                        loan eligibility will be INR 2400 (24,000/10=2400). If
                        50 people join logically, your loan eligibility will be
                        50*2400=INR 1,20000, but we consider your salary i.e.,
                        INR 24000 as your maximum loan eligibility.
                      </div>
                    </p>
                  </div>
                  <div className="card-body">
                    <form>
                      <div className="row">
                        <div className="col-12">
                          <h5 className="form-title">
                            <span>Loan Request Details</span>
                          </h5>
                        </div>
                        <div className="col-12 col-sm-4">
                          <div className="form-group local-forms">
                            <label>
                              Loan Request Amount
                              <span className="login-danger">*</span>
                            </label>
                            <input
                              type="number"
                              className="form-control"
                              name="loanamount"
                              onChange={handleInputchange}
                            />
                          </div>
                        </div>
                        <div className="col-12 col-sm-4">
                          <div className="form-group">
                            <select
                              className="form-control"
                              name="roi"
                              onChange={searchOnchange}
                            >
                              ""
                              <option value="null">-- ROI --</option>
                              <option value="3">3</option>
                              <option value="4">4</option>
                              <option value="5">5</option>
                              <option value="6">6</option>
                              <option value="7">7</option>
                              <option value="8">8</option>
                              <option value="9">9</option>
                              <option value="10">10</option>
                              <option value="11">11</option>
                              <option value="12">12</option>
                              <option value="13">13</option>
                              <option value="14">14</option>
                              <option value="15">15</option>
                              <option value="16">16</option>
                              <option value="17">17</option>
                              <option value="18">18</option>
                              <option value="19">19</option>
                              <option value="20">20</option>
                              <option value="21">21</option>
                              <option value="22">22</option>
                              <option value="23">23</option>
                              <option value="24">24</option>
                              <option value="25">25</option>
                              <option value="26">26</option>
                              <option value="27">27</option>
                              <option value="28">28</option>
                              <option value="29">29</option>
                              <option value="30">30</option>
                              <option value="31">31</option>
                              <option value="32">32</option>
                              <option value="33">33</option>
                              <option value="34">34</option>
                              <option value="35">35</option>
                              <option value="36">36</option>
                              <option value="37">37</option>
                              <option value="38">38</option>
                              <option value="39">39</option>
                              <option value="40">40</option>
                              <option value="41">41</option>
                              <option value="42">42</option>
                              <option value="43">43</option>
                              <option value="44">44</option>
                              <option value="45">45</option>
                              <option value="46">46</option>
                              <option value="47">47</option>
                              <option value="48">48</option>
                            </select>
                          </div>
                        </div>
                        <div className="col-12 col-sm-4">
                          <div className="form-group">
                            <select
                              className="form-control"
                              name="duration"
                              onChange={searchOnchange}
                            >
                              ""
                              <option value="null">-- Duration --</option>
                              <option value="3">3</option>
                              <option value="4">4</option>
                              <option value="5">5</option>
                              <option value="6">6</option>
                              <option value="7">7</option>
                              <option value="8">8</option>
                              <option value="9">9</option>
                              <option value="10">10</option>
                              <option value="11">11</option>
                              <option value="12">12</option>
                              <option value="13">13</option>
                              <option value="14">14</option>
                              <option value="15">15</option>
                              <option value="16">16</option>
                              <option value="17">17</option>
                              <option value="18">18</option>
                              <option value="19">19</option>
                              <option value="20">20</option>
                              <option value="21">21</option>
                              <option value="22">22</option>
                              <option value="23">23</option>
                              <option value="24">24</option>
                              <option value="25">25</option>
                              <option value="26">26</option>
                              <option value="27">27</option>
                              <option value="28">28</option>
                              <option value="29">29</option>
                              <option value="30">30</option>
                              <option value="31">31</option>
                              <option value="32">32</option>
                              <option value="33">33</option>
                              <option value="34">34</option>
                              <option value="35">35</option>
                              <option value="36">36</option>
                              <option value="37">37</option>
                              <option value="38">38</option>
                              <option value="39">39</option>
                              <option value="40">40</option>
                              <option value="41">41</option>
                              <option value="42">42</option>
                              <option value="43">43</option>
                              <option value="44">44</option>
                              <option value="45">45</option>
                              <option value="46">46</option>
                              <option value="47">47</option>
                              <option value="48">48</option>
                            </select>
                          </div>
                        </div>

                        <div className="col-12 col-sm-4">
                          <div className="form-group">
                            <select
                              className="form-control"
                              name="durationType"
                              onChange={searchOnchange}
                            >
                              ""
                              <option value="null">-- Duration Type --</option>
                              <option value="months">Month</option>
                              <option value="Days">Days</option>
                            </select>
                          </div>
                        </div>

                        <div className="col-12 col-sm-4">
                          <div className="form-group">
                            <select
                              className="form-control"
                              name="repayment"
                              onChange={searchOnchange}
                            >
                              ""
                              <option value="null">
                                --Preferred Re-Payment --
                              </option>
                              <option value="PI">
                                {" "}
                                Pay (P + I) monthly by Flat EMI method
                              </option>
                              <option value="I">
                                {" "}
                                Pay Monthly Interest (I) Only &amp; Principal
                                (P) at the end of the term.
                              </option>
                            </select>
                          </div>
                        </div>

                        <div className="col-12 col-sm-4">
                          <div className="form-group local-forms">
                            <label>
                              Loan Purpose
                              <span className="login-danger">*</span>
                            </label>
                            <input
                              type="text"
                              className="form-control"
                              name="loanpurpose"
                              placeholder="Enter Transfer Amount"
                              onChange={handleInputchange}
                            />
                          </div>
                        </div>

                        <div className="col-12 col-sm-4">
                          <div className="form-group local-forms">
                            <label>
                              Expected Date
                              <span className="login-danger">*</span>
                            </label>
                            <input
                              type="date"
                              className="form-control"
                              name="expectedDate"
                              placeholder="Enter Transfer Amount"
                              onChange={handleInputchange}
                            />
                          </div>
                        </div>
                        <div className="col-12">
                          <div className="student-submit">
                            <button
                              type="button"
                              className="btn btn-primary"
                              onClick={handleSubmitHandler}
                            >
                              Submit
                            </button>
                          </div>
                        </div>
                      </div>
                    </form>
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

export default LoanRequest;
