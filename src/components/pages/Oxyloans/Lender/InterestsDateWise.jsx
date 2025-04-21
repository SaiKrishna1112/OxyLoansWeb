import React, { useEffect, useState } from "react";

import "react-datepicker/dist/react-datepicker.css";

import { Link } from "react-router-dom";
import Header from "../../../Header/Header";
import SideBar from "../../../SideBar/SideBar";
import { getEmiTableInformation, getLendersInterestsDateWiseapi } from "../../../HttpRequest/afterlogin";
import { error } from "jquery";

const InterestsDateWise = () => {

    const [date1, setDate1] = useState("");
    const [tabledata, settabledata] = useState([]);


    const InterestsDateWise = async (date1) => {
        console.log(date1)


        const response = await getLendersInterestsDateWiseapi(date1);
        try {
            console.log(response.data)
            settabledata(response.data)
        }
        catch {
            console.log(error)
        }


    }
    const handelchangedate = (event) => {
        const { name, value } = event.target;
        setDate1({
            [name]: value
        })

        // setTimeout(() => {
        //     InterestsDateWise(date1)
        // }, 2000);


    }
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
                        {/* Page Header */}
                        <div className="page-header">
                            <div className="row align-items-center">
                                <div className="col">
                                    <h3 className="page-title">Loan Amount Details</h3>
                                    <ul className="breadcrumb">
                                        <li className="breadcrumb-item">
                                            <Link to="/dashboard">Dashboard</Link>
                                        </li>
                                        <li className="breadcrumb-item active">Loan Amount Details</li>
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
                                                            Select month
                                                            <span className="login-danger">*</span>
                                                        </label>

                                                        <input

                                                            type="month"
                                                            className="form-control form-input"
                                                            name="date1"
                                                            onChange={handelchangedate}
                                                        />

                                                    </div>
                                                </div>

                                                <div className="col-12">
                                                    <div className="student-submit">
                                                        <button
                                                            type="button"
                                                            className="btn btn-primary"
                                                            onClick={() => InterestsDateWise(date1)}

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
                                                                <h4 className="card-title">Lenders Interests Month Wise</h4>
                                                            </div>
                                                            <div className="card-body">
                                                                <div className="table-responsive">
                                                                    <table className="table mb-0">
                                                                        <thead>
                                                                            <tr>
                                                                                <th>S#</th>
                                                                                <th>dealId</th>
                                                                                <th>Paid Date</th>
                                                                                <th>Amount</th>
                                                                                <th>Amount Type</th>
                                                                            </tr>
                                                                        </thead>
                                                                        <tbody>
                                                                            {tabledata ==
                                                                                0 ? (
                                                                                <tr>
                                                                                    <td colSpan={8}>No Data found</td>
                                                                                </tr>
                                                                            ) : (
                                                                                tabledata.map(
                                                                                    (item, index) => (
                                                                                        <tr key={index}>


                                                                                            <td> {index + 1}</td>
                                                                                            <td> {item.dealId}</td>
                                                                                            <td> {item.paidDate}</td>
                                                                                            <td> {item.amount}</td>
                                                                                            <td>
                                                                                                {item.amountType}
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

export default InterestsDateWise;
