import React, { useState, useEffect } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Link } from "react-router-dom";
import Header from "../../../Header/Header";
import SideBar from "../../../SideBar/SideBar";
import ReactStars from "react-rating-stars-component";
import {
  submitWithdrawalRequestFromWallet,
  knowisalredyrequested,
} from "../../../HttpRequest/afterlogin";
import {
  HandleWithFooter,
  WarningAlertwithdrow,
  Info,
  WarningAlertwithdrow1,
} from "../../Base UI Elements/SweetAlert";
import { useSelector } from "react-redux";

const WithdrawalFromWallet = () => {
  const [withdrawrequest, setwithdrawRequest] = useState({
    date: new Date(),
    withdrawAmount: "",
    withdrawFeedback: "",
    withdrawRating: "",
    withdraReason: "",
    setGivendate: "",
    withdrawAmounterror: "",
    withdrawFeedbackerror: "",
    withdrawRatingerror: "",
    withdraReasonerror: "",
    setGivendateerror: "",
    isvalid: true,
    isalredyRequested: false,
    withdrawarequestedamount: 0,
    withdrawstatus: "ADD",
    withdrawerror1: ""
  });

  const [isvaild, setisvaild] = useState(false)

  const reduxStoreData = useSelector((data) => data.counter.userProfile);
  console.log(reduxStoreData);
  const [Walletamount, setwalletAmount] = useState(0);
  useEffect(() => {
    setwalletAmount(reduxStoreData?.equityAmount)
  }, [])
  // <p className="text-muted mb-0">
  //                   Wallet :
  //                   {reduxStoreData?.length !== 0
  //                     ? reduxStoreData?.lenderWalletAmount -
  //                       reduxStoreData?.holdAmountInDealParticipation -
  //                       reduxStoreData?.equityAmount
  //                     : ""}
  //                 </p>
  console.log("walletamount", reduxStoreData)
  const minDate = new Date();
  const handleChange = (date) => {
    const newdate = new Date(date);
    const formattedDate = `${newdate.getDate()}/${newdate.getMonth() + 1
      }/${newdate.getFullYear()}`;
    setwithdrawRequest({
      ...withdrawrequest,
      date: date,
      setGivendate: date != null && formattedDate,
    });
  };

  const maxDate = new Date();

  const ratingChanged = (newRating) => {
    setwithdrawRequest({
      ...withdrawrequest,
      withdrawRating: newRating,
    });
  };

  const handleKeyPress = (event) => {
    console.log("Key pressed:", event.key); // Check if the function is triggered
    const inputChar = event.key;
    const regex = /^[a-zA-Z]*$/; // Regular expression to allow only alphabets

    // Check if the pressed key is an alphabetic character or backspace
    if (!regex.test(inputChar) && inputChar !== "Backspace") {
      event.preventDefault();
    }
  };

  const handleKeyPressNumber = (event) => {
    const inputChar = event.key;
    const regex = /^[0-9]*$/;

    if (!regex.test(inputChar) && inputChar !== "Backspace") {
      event.preventDefault();
    }
  };
  const handleInputchange = (event) => {
    const { name, value } = event.target;
    setwithdrawRequest({
      ...withdrawrequest,
      [name]: value,
    });
  };

  console.log(withdrawrequest.withdrawFeedback);
  console.log(withdrawrequest)
  //   const withdrawrequestHandler = async () => {
  //     setwithdrawRequest((withdrawrequest) => ({
  //       ...withdrawrequest,
  //       withdrawAmounterror:
  //         withdrawrequest.withdrawAmount === ""
  //           ? "Enter the Withdrawal Amount"
  //           : "",
  //       withdrawFeedbackerror:
  //         withdrawrequest.withdrawFeedback === "" ? "Enter the Feedback" : "",
  //       withdrawRatingerror:
  //         withdrawrequest.withdrawRating === "" ? "Give the Rating" : "",
  //       withdraReasonerror:
  //         withdrawrequest.withdraReason === "" ? "Enter the Reason" : "",
  //       setGivendateerror:
  //         withdrawrequest.setGivendate == false
  //           ? "Enter the Withdrawal Date"
  //           : "",
  //     }));

  //     if (
  //       withdrawrequest.withdrawAmount !== "" &&
  //       withdrawrequest.withdrawAmount !== null &&
  //       withdrawrequest.withdrawFeedback !== "" &&
  //       withdrawrequest.withdrawFeedback !== null &&
  //       withdrawrequest.withdrawRating !== "" &&
  //       withdrawrequest.withdrawRating !== null &&
  //       withdrawrequest.withdraReason !== "" &&
  //       withdrawrequest.withdraReason !== null &&
  //       withdrawrequest.setGivendate !== "" &&
  //       withdrawrequest.setGivendate !== null
  //     ) {
  //       if (withdrawrequest.withdrawAmount <= reduxStoreData?.equityAmount) {
  //         console.log("wallet amount is more then request")

  //              if (withdrawrequest.isalredyRequested == true) {
  //         Info(
  //           `
  //           Withdrawal request for INR ${
  //             withdrawrequest.withdrawarequestedamount
  //           } already made. Now adding INR ${
  //             withdrawrequest.withdrawAmount
  //           }, total withdrawal amount will be INR ${
  //             parseInt(withdrawrequest.withdrawarequestedamount) +
  //             parseInt(withdrawrequest.withdrawAmount)
  //           }.`,
  //           withdrawrequest
  //         );
  //       } else {
  //         const response = submitWithdrawalRequestFromWallet(
  //           withdrawrequest,
  //           "first"
  //         );
  //         response.then((data) => {
  //           if (data.request.status == 200) {
  //             HandleWithFooter(
  //               "Withdrawal request successful. You'll be notified when credited. Note: Funds will be in bank within 2-7 working days."
  //             );
  //           } else {
  //             WarningAlertwithdrow(data.response.data.errorMessage);
  //           }
  //         });
  //       }
  //       } else {
  //         console.log("wallet amount is less then request")
  //         setwithdrawRequest({
  //           ...withdrawrequest,
  //           withdrawerror1:"wallet amount is less then request"

  //         })
  // }

  //     } else {
  //       console.log("filed  are required");
  //     }
  //   };


  const withdrawrequestHandler = async () => {
    setwithdrawRequest((withdrawrequest) => ({
      ...withdrawrequest,
      withdrawAmounterror:
        !withdrawrequest.withdrawAmount ? "Enter the Withdrawal Amount" : "",
      withdrawFeedbackerror:
        !withdrawrequest.withdrawFeedback ? "Enter the Feedback" : "",
      withdrawRatingerror:
        !withdrawrequest.withdrawRating ? "Give the Rating" : "",
      withdraReasonerror:
        !withdrawrequest.withdraReason ? "Enter the Reason" : "",
      setGivendateerror:
        !withdrawrequest.setGivendate ? "Enter the Withdrawal Date" : "",
    }));

    if (
      withdrawrequest.withdrawAmount &&
      withdrawrequest.withdrawFeedback &&
      withdrawrequest.withdrawRating &&
      withdrawrequest.withdraReason &&
      withdrawrequest.setGivendate
    ) {
      if (withdrawrequest.withdrawAmount <= reduxStoreData?.lenderWalletAmount -
        reduxStoreData?.holdAmountInDealParticipation -
        reduxStoreData?.equityAmount) {
        console.log("wallet amount is more than request");

        if (withdrawrequest.isalredyRequested) {
          Info(
            `Withdrawal request for INR ${withdrawrequest.withdrawarequestedamount.toLocaleString("en-IN")
            } already made. Now adding INR ${withdrawrequest.withdrawAmount.toLocaleString("en-IN")
            }, total withdrawal amount will be INR ${parseInt(withdrawrequest.withdrawarequestedamount) +
            parseInt(withdrawrequest.withdrawAmount)
            }.`,
            withdrawrequest
          );
        } else {
          setisvaild(true)
          const response = await submitWithdrawalRequestFromWallet(
            withdrawrequest,
            "first"
          );
          if (response.request.status === 200) {
            HandleWithFooter(
              "Withdrawal request successful. You'll be notified when credited. Note: Funds will be in the bank within 2-7 working days."
            );
          } else {
            if (response.response.data.errorCode == "114") {
              // WarningAlertwithdrow(response.response.data.errorMessage);
              WarningAlertwithdrow1(response.response.data.errorMessage)
            } else {
              WarningAlertwithdrow(response.response.data.errorMessage);
            }

          }
        }
      } else {
        console.log("wallet amount is less than request");
        setwithdrawRequest((withdrawrequest) => ({
          ...withdrawrequest,
          withdrawerror1: "The withdrawal amount is greater than the balance of the wallet.",
        }));
      }
    } else {
      console.log("All fields are required");
    }
  };

  useEffect(() => {
    const newdate = new Date(withdrawrequest.date);
    const formattedDate = `${newdate.getDate()}/${newdate.getMonth() + 1
      }/${newdate.getFullYear()}`;

    const isalreadyrequested = knowisalredyrequested();
    isalreadyrequested.then((data) => {
      if (data.data.status != null) {
        setwithdrawRequest({
          ...withdrawrequest,
          isalredyRequested: true,
          withdrawarequestedamount: data.data.amount,
          setGivendate: formattedDate != null && formattedDate,
        });
      }
    });
  }, []);

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
                  <h3 className="page-title">Lender Withdrawal Funds</h3>
                  <ul className="breadcrumb">
                    <li className="breadcrumb-item">
                      <Link to="/withdrawdealfromDeal">Withdraw From Deal</Link>
                    </li>
                    <li className="breadcrumb-item active">
                      Withdrawal From Wallet
                    </li>
                  </ul>
                </div>
              </div>
            </div>
            {/* /Page Header */}
            <div className="row">
              <div className="col-sm-12">
                <div className="card">
                  <div className="card-header">
                    <div className="note_point text-bold fst-italic mx-3">
                      <code>
                        <b>Note : </b>
                      </code>
                      Funds will be Credited to your Bank account within 7
                      working days.
                    </div>
                  </div>
                  <div className="card-body">
                    {/* <form> */}
                    <div className="row">
                      <div className="col-12">
                        <h5 className="form-title">
                          <span>Withdrawal Details</span>
                        </h5>
                      </div>
                      <div className="col-12 col-sm-4">
                        <div className="form-group local-forms">
                          <label>
                            Withdrawal Amount
                            <span className="login-danger">*</span>
                          </label>
                          <input
                            type="number"
                            className="form-control"
                            name="withdrawAmount"
                            onKeyPress={handleKeyPressNumber}
                            onChange={handleInputchange}
                            placeholder="Enter the Withdrawal Amount"
                          />
                          {withdrawrequest.withdrawAmounterror && (
                            <div className="error">
                              {withdrawrequest.withdrawAmounterror}
                            </div>
                          )}

                          {withdrawrequest.withdrawerror1 && (
                            <div className="error">
                              {withdrawrequest.withdrawerror1}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="col-12 col-sm-4">
                        <div className="form-group local-forms">
                          <label>
                            Feedback
                            <span className="login-danger">*</span>
                          </label>
                          <input
                            type="text"
                            name="withdrawFeedback"
                            className="form-control"
                            onKeyPress={handleKeyPress}
                            onChange={handleInputchange}
                            placeholder="Enter the Feedback"
                            value={withdrawrequest.withdrawFeedback}
                          />
                          {withdrawrequest.withdrawFeedbackerror && (
                            <div className="error">
                              {withdrawrequest.withdrawFeedbackerror}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="col-12 col-sm-4">
                        <div className="form-group local-forms">
                          <label>
                            Reason
                            <span className="login-danger">*</span>
                          </label>
                          <input
                            type="text"
                            className="form-control"
                            name="withdraReason"
                            onKeyPress={handleKeyPress}
                            onChange={handleInputchange}
                            placeholder="Enter the Reason"
                          />
                          {withdrawrequest.withdraReasonerror && (
                            <div className="error">
                              {withdrawrequest.withdraReasonerror}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="col-12 col-sm-4">
                        <div className="form-group local-forms calendar-icon">
                          <label>
                            Withdrawal Date
                            <span className="login-danger">*</span>
                          </label>

                          <DatePicker
                            selected={withdrawrequest.date}
                            onChange={handleChange}
                            dateFormat="dd/MM/yyyy"
                            minDate={minDate}
                            className="form-control datetimepicker"
                          />
                          {withdrawrequest.setGivendateerror && (
                            <div className="error">
                              {withdrawrequest.setGivendateerror}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="col-12 col-sm-4">
                        <div className="form-group local-forms">
                          <span>
                            Rating
                            <ReactStars
                              count={5}
                              onChange={ratingChanged}
                              size={24}
                              activeColor="#ffd700"
                            />
                          </span>
                          {withdrawrequest.withdrawRatingerror && (
                            <div className="error">
                              {withdrawrequest.withdrawRatingerror}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="col-12">
                        <div className="student-submit">
                          <button

                            disabled={isvaild}
                            type="button"
                            className="btn btn-primary"
                            onClick={withdrawrequestHandler}
                          >
                            Submit
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

export default WithdrawalFromWallet;
