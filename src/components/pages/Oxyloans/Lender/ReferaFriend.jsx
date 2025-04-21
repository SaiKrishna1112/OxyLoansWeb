import React, { useEffect, useState } from "react";
import SideBar from "../../../SideBar/SideBar";
import Header from "../../../Header/Header";
import { Link } from "react-router-dom";
import {
  getUserId,
  profilesubmit,
  getemailcontent,
  bulkinvitegmailLink,
  getUserDetails,
} from "../../../HttpRequest/afterlogin";

import {
  HandleWithFooter,
  WarningBackendApi,
} from "../../Base UI Elements/SweetAlert";
import Invaitemodel from "../Utills/Modals/Invaitemodel";
import { vaildateemail } from "../../Authentication/api";

const ReferaFriend = () => {
  const [profile, setprofile] = useState({
    email: "",
    mobileNumber: "",
    name: "",
    emailerror: "",
    mobileNumbererror: "",
    nameerror: "",
    mailSubject: 0,
    referrerId: "",
    primaryType: "LENDER",
    citizenType: "NONNRI",
    seekerRequestedId: "0",
    inviteType: "SingleInvite",
    mailContent: 0,
    savebtndisable: false,
    userinviteType: "YES",
  });

  const [emailres, setEmailres] = useState({
    emailcontent: "",
    emailsubject: "",
    buttomemail: "",
    invaitemodel: false,
    invaitlenderlink: false,
    invaitborrowerlink: false,
    invaitNrilink: false,
  });
  const [url, seturl] = useState("");

  const handlechanges = (event) => {
    const { name, value } = event.target;

    setprofile({
      ...profile,
      [name]: value,
    });
  };


  const primary = localStorage.getItem("primaryType")
  useEffect(() => {
    const emailRegex = /^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/;
    console.log(profile.email);
    if (!emailRegex.test(profile.email) && profile.email !== "") {
      setprofile({
        ...profile,
        emailerror: "Please enter a valid email",
      });
    } else {
      setprofile({
        ...profile,
        emailerror: "",
      });
    }
  }, [profile.email]);

  useEffect(() => {
    const getemail = async () => {
      try {
        const response = await getemailcontent(); // Assuming getemailcontent is an async function
        setEmailres({
          ...emailres,
          emailcontent: response.data.mailContent,
          emailsubject: response.data.mailSubject,
          buttomemail: response.data.bottomOfTheMail,
        });

        if (response.status === 200) {
        } else {
        }
      } catch (error) {
        console.error("Error:", error);
      }
    };
    getemail();
    const userid = getUserId();
    setprofile({
      ...profile,
      referrerId: userid,
    });
    return () => { };
  }, []);


  const handleKeyPress = (event) => {
    const inputChar = event.key;
    const regex = /^[A-Za-z]*$/;

    if (!regex.test(inputChar) && inputChar !== "Backspace") {
      event.preventDefault();
    }
  };
  useEffect(() => {
    handlebulkInvite();
    return () => { };
  }, [url]);

  const handleprofilesubmit = () => {
    setprofile({
      ...profile,
      emailerror: profile.email === "" ? "Enter The Email" : "",
      mobileNumbererror:
        profile.mobileNumber.length != 10
          ? "Enter The 10 Digit Mobile number"
          : "",
      nameerror: profile.name === "" ? "Enter The Name" : "",
      emailerror: profile.email.includes('@') ? "" : "Please enter a valid email address"
    });

    if (
      profile.email !== "" &&
      profile.email !== null &&
      profile.emailerror == "" &&
      profile.mobileNumber.length === 10 &&
      profile.name !== "" &&
      profile.name !== null &&
      profile.nameerror == ""
    ) {
      const response = profilesubmit(profile);
      response.then((data) => {
        if (data.request.status === 200) {
          HandleWithFooter("lender invited successfully ");
        } else {
          WarningBackendApi("Error", data.response.data.errorMessage);
        }
      });
    } else {
      console.log("form not vaild");
    }
  };

  const handlebulkInvite = async () => {
    const response = bulkinvitegmailLink();
    response.then((data) => {
      seturl(data.data.signInUrl);
      if (data.request.status == 200) {
      } else {
        WarningAlert(data.response.data.errorMessage);
      }
    });
  };

  const emailcontentdata = emailres.emailcontent + emailres.buttomemail;

  const Invitelender = async () => {

    const userId = localStorage.getItem("userType");
    const input = document.createElement("input");
    console.log(userId)
    input.value = `https://www.user.oxyloans.com/register?ref=${userId}`;
    document.body.appendChild(input);
    input.select();
    document.execCommand("copy");
    document.body.removeChild(input);

    setEmailres({
      ...emailres,
      invaitlenderlink: !emailres.invaitlenderlink,
      invaitNrilink: false,
      invaitborrowerlink: false
    });
  };
  const invitenri = async () => {
    const userId = localStorage.getItem("userType");
    const input = document.createElement("input");
    input.value = `https://www.oxyloans.com/new/nrilenderregistration?ref=${userId}`;
    document.body.appendChild(input);
    input.select();
    document.execCommand("copy");
    document.body.removeChild(input);

    setEmailres({
      ...emailres,
      invaitNrilink: !emailres.invaitNrilink,
      invaitlenderlink: false,
      invaitborrowerlink: false
    });
  };
  const Inviteborrower = async () => {
    const userId = localStorage.getItem("userType");
    const input = document.createElement("input");
    input.value = `https:///www.user.oxyloans.com/borrower_register?ref=${userId}`;
    document.body.appendChild(input);
    input.select();
    document.execCommand("copy");
    document.body.removeChild(input);

    setEmailres({
      ...emailres,
      invaitborrowerlink: !emailres.invaitborrowerlink,
      invaitNrilink: false,
      invaitlenderlink: false,
    });
  };


  const handleKeyPressNumber = (event) => {
    const inputChar = event.key;
    const regex = /^[0-9]*$/;

    if (!regex.test(inputChar) && inputChar !== "Backspace") {
      event.preventDefault();
    }
  };
  const handleinvaite = () => {
    setEmailres({
      ...emailres,
      invaitemodel: !emailres.invaitemodel,
    });
  };

  useEffect(() => {
    const response = getUserDetails();
    response.then((data) => {
      console.log(data.data.userDisplayId)
      localStorage.setItem("userType", data.data.userDisplayId)
    }).catch((error) => {
      console.log(error)
    })
  })
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
              <div className="row">
                <div className="col">
                  <h3 className="page-title">Refer a Friend & Earn INR 1000</h3>
                  <ul className="breadcrumb">
                    <li className="breadcrumb-item">
                      <Link to="/dashboard">Dashboard</Link>
                    </li>
                    <li className="breadcrumb-item active">Refer a Friend</li>
                  </ul>
                </div>
              </div>
            </div>{" "}
            {emailres.invaitemodel && (
              <Invaitemodel
                emailcontentdata={emailcontentdata}
                handleinvaite={handleinvaite}
              />
            )}
            {/* /Page Header */}
            <div className="row">
              <div className="col-md-12">
                <div className="profile-header">
                  <div className="row refer-notepoints ">
                    <ul style={{ listStyle: "block" }}>
                      <li>
                        Let's grow as a family while you engage with OXYLOANS'
                        lending platform. We can become a support system for
                        each other in all circumstances.
                      </li>
                      <li>
                        Every time your friend lends money, both you and your
                        friend will benefit. Your friend will earn interest on
                        the lent amount, and you will receive a Reference Fee
                        based on the example below:
                      </li>

                      <li>
                        For instance, you referred XYZ, and when XYZ joined the
                        platform and lent INR 3,00,000, here's how your
                        Reference Fee would be calculated,For the first INR
                        1,00,000, you will get INR 1000. For the second INR
                        1,00,000, you will get INR 100. For the third INR
                        1,00,000, you will get INR 100. In total, you will
                        receive INR 1200 as your Reference Fee.
                      </li>
                      <li className="disPlayNone">
                        For more information and frequently asked questions,
                        please visit{" "}
                        <a
                          href="https://sites.google.com/oxyloans.com/oxyloansfaq/referral-faq?authuser=0"
                          target="_blank"
                        >
                          FAQS / MORE
                        </a>
                      </li>
                    </ul>

                    <div className="row col-12">
                      {emailres.invaitlenderlink ? (
                        <>
                          <button
                            className="btn btn-xs btn-warning col-md-3 col-12 "
                            onClick={Invitelender}
                          >
                            copied
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            className="btn btn-xs btn-warning col-md-3 col-12 text-white"
                            onClick={Invitelender}
                          >
                            <i className="fa-solid fa-share-nodes"></i> Invite a
                            Friend
                          </button>
                        </>
                      )}

                      {emailres.invaitNrilink ? (
                        <>
                          {" "}
                          <button
                            className="btn btn-xs btn-info col-12 col-md-3 mx-lg-2 text-white"
                            onClick={invitenri}
                          >
                            copied
                          </button>
                        </>
                      ) : (
                        <>
                          {" "}
                          <button
                            className="btn btn-xs btn-info col-12 col-md-3 mx-lg-2 text-white"
                            onClick={invitenri}
                          >
                            <i className="fa-solid fa-plane-departure mx-1"></i>{" "}
                            Invite an NRI
                          </button>
                        </>
                      )}

                      {emailres.invaitborrowerlink ? (
                        <>
                          <button
                            className="btn btn-xs btn-success col-12 col-md-3 mx-lg-2 text-white"
                            onClick={Inviteborrower}
                          >
                            copied
                          </button>
                        </>
                      ) : (
                        <>
                          {" "}
                          <button
                            className="btn btn-xs btn-success col-12 col-md-3 mx-lg-2 text-white"
                            onClick={Inviteborrower}
                          >
                            <i className="fa-solid fa-share-nodes mx-1"></i>{" "}
                            Invite a Borrower
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <div className="profile-menu">
                  <ul className="nav nav-tabs nav-tabs-solid">
                    <li className="nav-item">
                      <Link
                        className="nav-link active"
                        data-bs-toggle="tab"
                        to="#invite_tab"
                      >
                        <i className="fa-solid fa-user-tie"></i> Invite Friend
                      </Link>
                    </li>
                    <li className="nav-item">
                      <Link
                        className="nav-link"
                        data-bs-toggle="tab"
                        to="#BulkInvite_tab"
                        onClick={handlebulkInvite}
                      >
                        <i className="fa-solid mx-1 fa-cloud-arrow-up"></i>
                        Bulk Invite
                      </Link>
                    </li>

                    <li className="nav-item">
                      <Link
                        className="nav-link"
                        data-bs-toggle="tab"
                        to="#setupneo_tab"
                      >
                        <i className="fa-solid fa-building-columns mx-1"></i>{" "}
                        Setup Neo Bank
                      </Link>
                    </li>

                    {/* <li className="nav-item">
                      <Link
                        className="nav-link"
                        data-bs-toggle="tab"
                        to="#BulkInvite_tab"
                        onClick={handlebulkInvite}
                      >
                        <i className="fa-solid mx-1 fa-cloud-arrow-up"></i>
                        Vinod
                      </Link>
                    </li> */}
                  </ul>
                </div>
                <div className="tab-content profile-tab-cont">
                  {/* Change Password Tab */}
                  <div id="BulkInvite_tab" className="tab-pane fade">
                    <div className="card">
                      <div className="card-body">
                        <div className="card-header">
                          <p>
                            <code>Note:</code> The file format should be .xlsx,
                            The columns in Excel should be arranged as follows:
                            Column 1: Name, Column 2: Email, Column 3: Phone
                            Number.
                          </p>
                        </div>
                        <h5 className="card-title my-lg-2">Bulk Upload</h5>
                        <div className="row  text-center w-100 h-50">
                          <div className="col-md-12 col-lg-12 d-flex justify-content-center">
                            <form>
                              <div className="row">
                                <a
                                  //  <button

                                  className="btn btn-outline-primary my-lg-3 border-2 "
                                  type="button"
                                  onClick={handleinvaite}
                                >
                                  Browse From Computer
                                  {/* </button> */}{" "}
                                </a>
                                <a
                                  href={url}
                                  className="btn btn-outline-warning my-lg-3 border-2 "
                                >
                                  Invite Through Gmail
                                </a>
                              </div>
                            </form>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  {/* /Change Password Tab */}
                  {/* Change Nominee Tab */}
                  <div id="setupneo_tab" className="tab-pane fade">
                    <div className="card">
                      <div className="card-header">
                        <p>
                          How to launch a NeoBank in 3 steps,detail site with
                          videos
                          <a
                            href="https://sites.google.com/oxyloans.com/neobank/home"
                            target="_blank"
                          >
                            : Click Here
                          </a>
                        </p>
                      </div>
                      <div className="card-body">
                        <h5 className="card-title">Set-up a NeoBank.</h5>
                        <div className="row">
                          <div className="col-md-12 col-lg-12">
                            <p className="neo-Oxy ">Welcome to OxyLoans !</p>

                            <p className="neo-Oxycontent1 ">
                              In 2019-Feb, we got the RBI NBFC-P2P license.
                            </p>
                            <p className="neo-Oxycontent1 ">
                              Using this license, We are able to offer p2p
                              lending services.
                            </p>

                            <p className="neo-Oxycontent1">
                              In p2p lending lenders & borrowers, both are
                              Individuals/companies/PAN card holders.
                            </p>
                            <p className="neo-Oxycontent2">
                              Using the following referral links, you can launch
                              the p2p lending platform which we are calling a
                              Neo bank.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  {/* Change Nominee Tab */}
                  {/* ///profile Tab */}
                  <div id="invite_tab" className="tab-pane fade show active">
                    <div className="card">
                      <div className="card-body">
                        <h5 className="card-title">
                          Invite Friends/ Professionals
                        </h5>
                        <div className="row">
                          <div className="col-md-12 col-lg-12 row">
                            <div className="row mt-3">
                              <div className="form-group col-12 col-sm-4">
                                <label>
                                  Friend Name{" "}
                                  <span className="login-danger">*</span>
                                </label>
                                <input
                                  type="text"
                                  className="form-control"
                                  name="name"
                                  placeholder="Enter The Name"
                                  onKeyPress={handleKeyPress}
                                  onChange={handlechanges}
                                  required
                                />
                                {profile.nameerror && (
                                  <div className="error">
                                    {" "}
                                    {profile.nameerror}
                                  </div>
                                )}
                              </div>

                              <div className="form-group col-12 col-sm-4">
                                <label>
                                  Friend Email{" "}
                                  <span className="login-danger">*</span>
                                </label>
                                <input
                                  type="email"
                                  className="form-control"
                                  name="email"
                                  placeholder="Enter The Email"
                                  onChange={handlechanges}
                                />{" "}
                                {profile.emailerror && (
                                  <div className="error">
                                    {" "}
                                    {profile.emailerror}
                                  </div>
                                )}
                              </div>
                              <div className="form-group col-12 col-sm-4">
                                <label>
                                  Friend Location{" "}
                                  <span className="login-danger">*</span>
                                </label>
                                <select
                                  className="form-control form-select"
                                  name="citizenType"
                                  // value={profile.citizenType}
                                  onChange={handlechanges}
                                  defaultValue={profile.citizenType}
                                >
                                  <option value="NRI">NRI</option>
                                  <option value="NONNRI">NON NRI</option>
                                </select>
                              </div>

                              <div className="form-group col-12 col-sm-4">
                                <label>
                                  Keep me in cc{" "}
                                  <span className="login-danger">*</span>
                                </label>
                                <select
                                  className="form-control form-select"
                                  name="userinviteType"
                                  defaultValue={profile.userinviteType}
                                  onChange={handlechanges}
                                >
                                  <option value="YES">YES</option>
                                  <option value="NO">NO</option>
                                </select>
                              </div>

                              <div className="form-group col-12 col-sm-4">
                                <label>
                                  Friend Mobile{" "}
                                  <span className="login-danger">*</span>
                                </label>
                                <input
                                  type="tel"
                                  className="form-control"
                                  placeholder="Enter The mobile No"
                                  onKeyPress={handleKeyPressNumber}
                                  maxLength={10}
                                  name="mobileNumber"
                                  onChange={handlechanges}
                                />
                                {profile.mobileNumbererror && (
                                  <div className="error">
                                    {" "}
                                    {profile.mobileNumbererror}
                                  </div>
                                )}
                              </div>

                              <div className="form-group col-12 col-sm-4">
                                <label>
                                  Email Subject
                                  <span className="login-danger">*</span>{" "}
                                </label>
                                <input
                                  type="text"
                                  className="form-control"
                                  value={emailres.emailsubject}
                                  name="mailSubject"
                                  onChange={handlechanges}
                                />
                              </div>

                              <div className="form-group col-12 col-sm-12">
                                <label>
                                  Email Content{" "}
                                  <span className="login-danger">*</span>
                                </label>
                                <textarea
                                  className="form-control"
                                  value={emailres.emailcontent}
                                  name="emailcontent"
                                  onChange={handlechanges}
                                ></textarea>
                              </div>
                              <div className="col-12 ">
                                <button
                                  className="btn btn-secondary col-md-4 col-12"
                                  type="submit"
                                // onClick={handleprofilesubmit}

                                >
                                  Preview
                                </button>
                                {" "}
                                <button
                                  className="btn btn-primary col-md-4 col-12"
                                  type="submit"
                                  onClick={handleprofilesubmit}
                                  disabled={profile.savebtndisable}
                                >
                                  Send
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
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

export default ReferaFriend;
