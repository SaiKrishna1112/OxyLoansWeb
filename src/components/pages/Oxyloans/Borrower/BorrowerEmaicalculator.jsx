import React, { useEffect, useState } from "react";
import "react-datepicker/dist/react-datepicker.css";
import { Link } from "react-router-dom";
import { getEmiTableInformation } from "../../../HttpRequest/afterlogin";
import BorrowerHeader from "../../../Header/BorrowerHeader";
import BorrowerSidebar from "../../../SideBar/BorrowerSidebar";

const BorrowerEmaicalculator = () => {
  const [emicalculatorOption, setemicalculatorOption] = useState({
    loanAmount: "",
    inputTenure: "",
    inputroi: "",
    emiType: "",
    isvalid: true,
    apiData: [],
  });

  const setInputValuesFun = (event) => {
    const { name, value } = event.target;
    setemicalculatorOption({
      ...emicalculatorOption,
      [name]: value,
    });
  };

  const submitTheEmiCalculator = () => {
    const response = getEmiTableInformation(emicalculatorOption);
    response.then((data) => {
      if (data.request.status == 200) {
        if (data.data.flatCalculationEmi.length != 0) {
          setemicalculatorOption({
            ...emicalculatorOption,
            apiData: data.data.flatCalculationEmi,
          });
        } else {
          setemicalculatorOption({
            ...emicalculatorOption,
            apiData: data.data.reduceCalculationEmi,
          });
        }
      }
    });
  };

  useEffect(() => {
    const inputValid =
      emicalculatorOption.emiType != "" &&
      emicalculatorOption.inputTenure != "" &&
      emicalculatorOption.inputroi != "" &&
      emicalculatorOption.loanAmount != "";

    if (inputValid) {
      setemicalculatorOption({
        ...emicalculatorOption,
        isvalid: false,
      });
    } else {
      setemicalculatorOption({
        ...emicalculatorOption,
        isvalid: true,
      });
    }

    return () => {};
  }, [
    emicalculatorOption.emiType,
    emicalculatorOption.inputTenure,
    emicalculatorOption.inputroi,
    emicalculatorOption.loanAmount,
  ]);

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
                  <h3 className="page-title">EMI Calculator</h3>
                  <ul className="breadcrumb">
                    <li className="breadcrumb-item">
                      <Link to="/borrowerDashboard">Dashboard</Link>
                    </li>
                    <li className="breadcrumb-item active">EMI Calculator</li>
                  </ul>
                </div>
              </div>
            </div>
            {/* /Page Header */}
            <div className="row">
              <div className="col-sm-12">
                <div className="card">
                  <div className="card-body">
                    <form>
                      <div className="row">
                        <div className="col-12">
                          <h5 className="form-title">
                            <span>Loan Amount Details</span>
                          </h5>
                        </div>
                        <div className="col-12 col-sm-4">
                          <div className="form-group local-forms">
                            <label>
                              Loan Amount
                              <span className="login-danger">*</span>
                            </label>
                            <input
                              type="text"
                              name="loanAmount"
                              className="form-control"
                              placeholder="Loan Amount"
                              onChange={setInputValuesFun}
                            />
                          </div>
                        </div>
                        <div className="col-12 col-sm-4">
                          <div className="form-group local-forms">
                            <label>
                              ROI <span className="login-danger">*</span>
                            </label>

                            <select
                              className="form-control form-select"
                              name="inputroi"
                              defaultValue={emicalculatorOption.inputroi}
                              onChange={setInputValuesFun}
                            >
                              <option value="">Choose ROI</option>
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
                              <option value="30">30</option>
                              <option value="36">36</option>
                            </select>
                          </div>
                        </div>
                        <div className="col-12 col-sm-4">
                          <div className="form-group local-forms">
                            <label>
                              Tenure <span className="login-danger">*</span>
                            </label>

                            <select
                              className="form-control form-select"
                              name="inputTenure"
                              defaultValue={emicalculatorOption.inputTenure}
                              onChange={setInputValuesFun}
                            >
                              <option value="">Choose Tenure</option>
                              <option value="1">1M</option>
                              <option value="2">2M</option>
                              <option value="3">3M</option>
                              <option value="4">4M</option>
                              <option value="5">5M</option>
                              <option value="6">6M</option>
                              <option value="7">7M</option>
                              <option value="8">8M</option>
                              <option value="9">9M</option>
                              <option value="10">10M</option>
                              <option value="11">11M</option>
                              <option value="12">12M</option>
                            </select>
                          </div>
                        </div>
                        <div className="col-12 col-sm-4">
                          <div className="form-group local-forms">
                            <label>
                              EMI Type
                              <span className="login-danger">*</span>
                            </label>

                            <select
                              className="form-control form-select"
                              name="emiType"
                              value={emicalculatorOption.emiType}
                              onChange={setInputValuesFun}
                            >
                              <option value="">Choose EMI Type</option>
                              <option value="REDUCE">Reduce</option>
                              <option value="FLAT">Flat</option>
                            </select>
                          </div>
                        </div>

                        <div className="col-12">
                          <div className="student-submit">
                            <button
                              type="button"
                              className="btn btn-primary"
                              disabled={emicalculatorOption.isvalid}
                              onClick={submitTheEmiCalculator}
                            >
                              Submit
                            </button>
                          </div>
                        </div>

                        <div className="col-12">
                          <h5 className="form-title">
                            <span></span>
                          </h5>
                          <div className="col-lg-12 col-12 col-md-12">
                            <div className="card">
                              <div className="card-header">
                                <h4 className="card-title">EMI Calculation</h4>
                              </div>
                              <div className="card-body">
                                <div className="table-responsive">
                                  <table className="table mb-0">
                                    <thead>
                                      <tr>
                                        <th>So</th>
                                        <th>EMI Amount</th>
                                        <th>Interest Amount</th>
                                        <th>Principal Amount</th>
                                        <th>Outstanding</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {emicalculatorOption.apiData.length ==
                                      0 ? (
                                        <tr>
                                          <td colSpan={8}>No Data found</td>
                                        </tr>
                                      ) : (
                                        emicalculatorOption.apiData.map(
                                          (item, index) => (
                                            <tr key={index}>
                                              <td> {item.emiNumber}</td>
                                              <td>INR {item.emiAmount}</td>
                                              <td>INR {item.interestAmount}</td>
                                              <td>
                                                INR {item.principalAmount}
                                              </td>
                                              <td>
                                                INR {item.balanceAndOutstanding}
                                              </td>
                                            </tr>
                                          )
                                        )
                                      )}
                                    </tbody>
                                  </table>
                                </div>
                              </div>
                            </div>
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

export default BorrowerEmaicalculator;
