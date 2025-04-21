import React, { useState } from 'react';
import { message, Button, Alert } from 'antd';
import { Link, useNavigate } from "react-router-dom";
import 'bootstrap/dist/css/bootstrap.min.css';
import Header from "../../../../../components/Header/OxyloansAdminHeader";
import Sidebar from "../../../../../components/SideBar/OxyloansAdminSidebar";
import {handleAddBorrowerRequest} from "../../../../HttpRequest/admin"


const AddBorrower = () => {
    const userisIn = "prod";
    const API_BASE_URL =
  userisIn == "local"
    ? "http://ec2-15-207-239-145.ap-south-1.compute.amazonaws.com:8080/oxyloans/v1/user/"
    : "https://fintech.oxyloans.com/oxyloans/v1/user/";
  const [formData, setFormData] = useState({
    userId: '',
    fullName: '',
    email: '',
    loanAmount: '',
    paidAmount: '',
    pendingAmount: '',
    loanCreatedDate: '',
    loanExpiryDate: '',
    mobileNumber: '',
  });
const token=sessionStorage.getItem("accessToken")
const userId=sessionStorage.getItem("userId")

  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  // Handle form submission
  const handleSubmit = async () => {
    const { ...submissionData } = formData; // Excluding optional fields

    // Mandatory fields validation
    const mandatoryFields = [
      'fullName',
      'loanAmount',
      'paidAmount',
      'pendingAmount',
      'loanCreatedDate',
      'loanExpiryDate',
      'mobileNumber',
    ];

    for (let field of mandatoryFields) {
      if (!submissionData[field]) {
        message.error(`${field.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())} is required`);
        return;
      }
    }

    // console.log("UserId:", userId);
    // console.log("Email:", formData.email);
                // setLoading(true)
              try {
                const response = await handleAddBorrowerRequest(submissionData);
                // setPendingUsers(response.data);
                console.log(response.data)
                message.success("Successfully Added borrower details")
                // setLoading(false)
              } catch (err) {
                // setError(err);
                message.error("Error to fetch details")
                // setLoading(false)
              }
            

// axios({
// method:"post",
// url:API_BASE_URL+`savePendingLoanUsresInfo`,
// data:submissionData,
//     headers:{
//         token
//     }
// })
// .then(function(response){
//     console.log(response.data)
//     message.success("Data successfully logged to console.");
// })
// .catch(function(error){
//     console.log(error.response)
// })
  };



  return (
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
                <ul className="breadcrumb">
                  <li className="breadcrumb-item">
                    <Link to="/dashboard">Dashboard</Link>
                  </li>
                  <li className="breadcrumb-item active">Profile</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="card">
            <div className="card-body">
              <Button onClick={() => navigate('/Emi')} className="btn btn-secondary">
                Get Borrower Details
              </Button> 

              <div className="row mt-3">

              <div className="form-group col-12 col-sm-4 local-forms">
                  <label>User Id (Optional)</label>
                  <input type="text" className="form-control" placeholder="Enter User Id" name="userId" value={formData.userId} onChange={handleChange} />
                </div>

                <div className="form-group col-12 col-sm-4 local-forms">
                  <label>Full Name <span className="login-danger">*</span></label>
                  <input type="text" className="form-control" placeholder="Enter Full Name" name="fullName" value={formData.fullName} onChange={handleChange} />
                </div>

                <div className="form-group col-12 col-sm-4 local-forms">
                  <label>Mobile Number <span className="login-danger">*</span></label>
                  <input type="number" className="form-control" placeholder="Mobile Number" name="mobileNumber" value={formData.mobileNumber} onChange={handleChange} />
                </div>

                <div className="form-group col-12 col-sm-4 local-forms">
                  <label>Email (Optional)</label>
                  <input type="text" className="form-control" placeholder="Enter Email" name="email" value={formData.email} onChange={handleChange} />
                </div>

                <div className="form-group col-12 col-sm-4 local-forms">
                  <label>Loan Amount <span className="login-danger">*</span></label>
                  <input type="text" className="form-control" placeholder="Enter Loan Amount" name="loanAmount" value={formData.loanAmount} onChange={handleChange} />
                </div>

                <div className="form-group col-12 col-sm-4 local-forms">
                  <label>Paid Amount <span className="login-danger">*</span></label>
                  <input type="text" className="form-control" placeholder="Paid Amount" name="paidAmount" value={formData.paidAmount} onChange={handleChange} />
                </div>

                <div className="form-group col-12 col-sm-4 local-forms">
                  <label>Pending Amount <span className="login-danger">*</span></label>
                  <input type="text" className="form-control" placeholder="Enter Pending Amount" name="pendingAmount" value={formData.pendingAmount} onChange={handleChange} />
                </div>

                <div className="form-group col-12 col-sm-4 local-forms">
                  <label>Loan Start Date <span className="login-danger">*</span></label>
                  <input type="date" className="form-control" name="loanCreatedDate" value={formData.loanCreatedDate} onChange={handleChange} />
                </div>

                <div className="form-group col-12 col-sm-4 local-forms">
                  <label>Loan Expiry Date <span className="login-danger">*</span></label>
                  <input type="date" className="form-control" name="loanExpiryDate" value={formData.loanExpiryDate} onChange={handleChange} />
                </div>

              

               
              </div>

              <Button className="btn btn-primary mt-3" onClick={handleSubmit} disabled={loading}>
                {loading ? "Submitting..." : "Submit"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddBorrower;
