import React, { useEffect, useState } from "react";
import BorrowerHeader from "../../../Header/BorrowerHeader";
import BorrowerSidebar from "../../../SideBar/BorrowerSidebar";
import { Link } from "react-router-dom";
import {
    getUserId,
    profilesubmit,
    getemailcontent,
    bulkinvitegmailLink,
} from "../../../HttpRequest/afterlogin";

import {
    HandleWithFooter,
    WarningBackendApi,
} from "../../Base UI Elements/SweetAlert";
// import Invaitemodel from "../../../Utills/Modals/Invaitemodel";
import Invaitemodel from "../Utills/Modals/Invaitemodel";
import { toastrSuccess } from "../../Base UI Elements/Toast";

const Updatekyc = () => {
    const [formData, setFormData] = useState({
        userId: '',
        oxyScore: '',
        commentId: '',
        passwordLogin: ''
    });
    const [file, setFile] = useState(null);
    const [errors, setErrors] = useState({});
    const [successMessage, setSuccessMessage] = useState('');

    // Handle input changes
    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    // Handle file change
    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    // Form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        let formErrors = {};

        // Validate inputs
        if (!formData.userId) formErrors.userId = "User ID is required";
        if (!formData.oxyScore) formErrors.oxyScore = "Oxy Score is required";
        if (!formData.commentId) formErrors.commentId = "Comment ID is required";
        if (!formData.passwordLogin) formErrors.passwordLogin = "Password is required";
        if (!file) formErrors.file = "File is required";

        // If there are errors, set them and return
        if (Object.keys(formErrors).length > 0) {
            setErrors(formErrors);
            return;
        } else {
            setErrors({});
        }

        try {
            // Define the API URL dynamically
            const apiUrl = `http://ec2-15-207-239-145.ap-south-1.compute.amazonaws.com:8080/oxyloans/v1/user/${formData.userId}/${formData.oxyScore}/${formData.commentId}/${formData.passwordLogin}/uploadCreditReport`;

            // Create FormData object
            const uploadFormData = new FormData();
            uploadFormData.append('creditReport', file); // Attach the file to the form data

            let accessToken = sessionStorage.getItem("accessToken") // Assuming you have a function to get the access token

            // Make the POST call using Fetch API
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'accessToken': accessToken // Pass the access token as a custom header
                },
                body: uploadFormData // Send formData as the body
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            console.log('Success:', data);

            if (data.downloadUrl) {
                // setSuccessMessage('Credit report uploaded successfully.');
                toastrSuccess('Credit report uploaded successfully.')
                // Handle download link or modal display here
            } else {
                alert('Credit report uploaded, but no download URL was returned.');
            }
        }

        catch (error) {
            console.error('Error:', error);
            alert('Failed to upload credit report. Please try again later.');
        }
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
                            <div className="row">
                                <div className="col">
                                    <h3 className="page-title">borrower kyc details</h3>
                                    <ul className="breadcrumb">
                                        <li className="breadcrumb-item">
                                            <Link to="/borrowerDashboard">Dashboard</Link>
                                        </li>
                                        <li className="breadcrumb-item active">borrower kyc </li>
                                    </ul>
                                </div>
                            </div>
                        </div>{" "}

                        {/* /Page Header */}
                        <div className="row">
                            <div className="col-md-12">


                                <div className="tab-content profile-tab-cont">


                                    {/* Change Nominee Tab */}
                                    {/* ///profile Tab */}
                                    <div id="invite_tab" className="tab-pane fade show active">
                                        <div className="card">
                                            <div className="card-body">
                                                <h5 className="card-title">
                                                    borrower kyc details
                                                </h5>

                                                <form onSubmit={handleSubmit}>
                                                    <div className="row">
                                                        <div className="col-md-12 col-lg-12 row">
                                                            <div className="row mt-3">
                                                                <div className="form-group col-12 col-sm-4">
                                                                    <label>
                                                                        User ID <span className="login-danger">*</span>
                                                                    </label>
                                                                    <input
                                                                        type="text"
                                                                        className="form-control"
                                                                        name="userId"
                                                                        placeholder="Enter The userId"
                                                                        value={formData.userId}
                                                                        onChange={handleChange}
                                                                        required
                                                                    />
                                                                    {errors.userId && <p className="error">{errors.userId}</p>}
                                                                </div>

                                                                <div className="form-group col-12 col-sm-4">
                                                                    <label>
                                                                        Oxy Score <span className="login-danger">*</span>
                                                                    </label>
                                                                    <input
                                                                        type="text"
                                                                        className="form-control"
                                                                        name="oxyScore"
                                                                        placeholder="Enter The oxyScore"
                                                                        value={formData.oxyScore}
                                                                        onChange={handleChange}
                                                                        required
                                                                    />
                                                                    {errors.oxyScore && <p className="error">{errors.oxyScore}</p>}
                                                                </div>

                                                                <div className="form-group col-12 col-sm-4">
                                                                    <label>
                                                                        Comment  <span className="login-danger">*</span>
                                                                    </label>
                                                                    <input
                                                                        type="text"
                                                                        className="form-control"
                                                                        name="commentId"
                                                                        placeholder="Enter Comment"
                                                                        value={formData.commentId}
                                                                        onChange={handleChange}
                                                                        required
                                                                    />
                                                                    {errors.commentId && <p className="error">{errors.commentId}</p>}
                                                                </div>

                                                                <div className="form-group col-12 col-sm-4">
                                                                    <label>
                                                                        Password <span className="login-danger">*</span>
                                                                    </label>
                                                                    <input
                                                                        type="password"
                                                                        className="form-control"
                                                                        name="passwordLogin"
                                                                        placeholder="Enter Password"
                                                                        value={formData.passwordLogin}
                                                                        onChange={handleChange}
                                                                        required
                                                                    />
                                                                    {errors.passwordLogin && <p className="error">{errors.passwordLogin}</p>}
                                                                </div>

                                                                <div className="form-group col-12 col-sm-4">
                                                                    <label>
                                                                        Upload Credit Report <span className="login-danger">*</span>
                                                                    </label>
                                                                    <input
                                                                        type="file"
                                                                        className="form-control"
                                                                        onChange={handleFileChange}
                                                                        required
                                                                    />
                                                                    {errors.file && <p className="error">{errors.file}</p>}
                                                                </div>

                                                                <div className="col-12 ">
                                                                    <button
                                                                        className="btn btn-primary col-md-4 col-12"
                                                                        type="submit"
                                                                    >
                                                                        Save Details
                                                                    </button>
                                                                    {successMessage && <p className="success-message">{successMessage}</p>}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </form>
                                            </div>
                                        </div>
                                    </div>
                                    {/* ///profile Tab */}
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

export default Updatekyc;
