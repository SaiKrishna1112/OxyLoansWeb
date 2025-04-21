import React, { useEffect, useRef, useState } from "react";
import "owl.carousel/dist/assets/owl.carousel.css";
import "owl.carousel/dist/assets/owl.theme.default.css";
import * as api from "./api";

import { registerImage } from "../../imagepath";
import FeatherIcon from "feather-icons-react";
import "./login.css";
import { useNavigate, useParams } from "react-router-dom";
import { toastrWarning } from "../Base UI Elements/Toast";
import { registersuccess } from "../Base UI Elements/SweetAlert";

const Register_active_proceed = () => {
  const history = useNavigate();
  let inputRef = useRef();
  const params = useParams();
  const showIcon = () => (
    <i class="feather feather-eye" aria-hidden="true">
      <FeatherIcon icon="eye" />
    </i>
  );
  const hideIcon = () => (
    <i class="feather feather-eye-slash" aria-hidden="true">
      <FeatherIcon icon="eye-off" />
    </i>
  );

  const [date1, setdate1] = useState("");
  const [response, setResponse] = useState(null);

  const [id, setid] = useState("318");
  const [time, settime] = useState("");
  const [error, setError] = useState("");
  const [data, setdata] = useState({
    pannumber: "",
    address: "",
    date: "",
    isbtnvalid: false,
    doberror: "",
    panerror: "",
    addresserror: "",
  });
    const [isloading, setLoading] = useState(false)
  
  // useEffect(() => {
  //   // Calculate today's date
  //   const today = new Date();

  //   // Calculate the minimum date for someone to be 18 years old
  //   const minDate = new Date(
  //     today.getFullYear() - 18,
  //     today.getMonth(),
  //     today.getDate()
  //   );

  //   // Convert the input value to a Date object
  //   const inputDate = new Date(date1);

  //   // Check if the input date is valid and the user is at least 18 years old
  //   if (!isNaN(inputDate.getTime()) && inputDate <= minDate) {
  //     setdata({
  //       ...data,
  //       doberror: "", // Clear error message
  //     });
  //   } else {
  //     setdata({
  //       ...data,
  //       doberror: "Note : Age must be at least 18 years old",
  //     });
  //   }
  // }, [date1]);

  const today = new Date();
  today.setFullYear(today.getFullYear() - 18); // Subtract 18 years

  const minDate = today.toISOString().split("T")[0];
  const handlesubmit = async () => {
    if (data.date === "" || data.pannumber === "" || data.address === "") {
      setdata({
        ...data,
        doberror: data.date === "" ? "Enter the DOB" : "",
        panerror: data.pannumber === "" ? "Enter  Pan Number" : "",
        addresserror: data.address === "" ? "Enter the address" : "",
      });
    } else {
      if (data.date === "") {
        //  setErrordate("Enter DOB");
      }


      if (data.pannumber.length >= 10) {
        setLoading(true)

        try {
          const loginResponse = await api.verifypannumber(
            data.pannumber,
            data.address,
            time,
            id,
            date1
          );
          registersuccess("Registration successfully completed");
          setResponse(loginResponse);
          history("/");
          setLoading(false)

          setError(null);
        } catch (error) {
          console.error("Error:", error.response.data.errorMessage);
          setError(error.response.data.errorMessage);
          toastrWarning(error.response.data.errorMessage);
          setLoading(false)

          // setError('An error occurred during login');
        }
      } else {
        setError("please enter vaild pan-card number");
        toastrWarning("please enter vaild pan-card number");
        setLoading(false)

      }
    }
  };

  const handlechanges = (event) => {
    const { name, value } = event.target;
    setdata({
      ...data,
      [name]: value,
    });
  };
  // useEffect(() => {
  //   const id = localStorage.getItem("id");
  //   const time = localStorage.getItem("time");
  //   settime(time);
  //   setid(id);
  // }, []);
  useEffect(() => {
    const urlemail = new URLSearchParams(window.location.search);
    const id = urlemail.get("id");

    const time = urlemail.get("time");
    console.log(id , time)
    settime(time);
    setid(id);
  
  }, []);



    const handleKeyPressPannumber = (event) => {
    const inputChar = event.key;
    const regex = /^[A-Z0-9]*$/;

    if (!regex.test(inputChar) && inputChar !== "Backspace") {
      event.preventDefault();
    }
  };
  // useEffect(() => {
  //   const isvalid =
  //     (data.address != "") & (data.pannumber != "") && data.date != "";
  //   if (isvalid) {
  //     setdata({
  //       ...data,
  //       isbtnvalid: false,
  //     });
  //   } else {
  //     setdata({
  //       ...data,
  //       isbtnvalid: true,
  //     });
  //   }
  // }, [data.address, data.date, data.pannumber]);
  useEffect(() => {
    //   const isvalid =
    //   (data.address != "") & (data.pannumber != "") && data.date != "";
    // if (isvalid) {
    //   setdata({
    //     ...data,
    //     isbtnvalid: false,
    //   });
    // } else {
    //   setdata({
    //     ...data,
    //     isbtnvalid: true,
    //   });
    // }

    var inputDate = data.date;
    var dateParts = inputDate.split("-");
    var dateObj = new Date(dateParts[0], dateParts[1] - 1, dateParts[2]);
    // Format the date as DD/MM/YYYY with leading zeros
    var formattedDay = String(dateObj.getDate()).padStart(2, "0");
    var formattedMonth = String(dateObj.getMonth() + 1).padStart(2, "0");
    var formattedYear = dateObj.getFullYear();

    var formattedDate =
      formattedDay + "/" + formattedMonth + "/" + formattedYear;

    // Print the result

    setdate1(formattedDate);
  }, [data.date]);

  return (
    <>
      <div className="main-wrapper login-body">
        <div className="login-wrapper">
          <div className="container">
            <div className="loginbox">
              <div className="login-left">
                <img className="img-fluid" src={registerImage} alt="Logo" />
              </div>
              <div className="login-right">
                <div className="login-right-wrap">
                  {/* <h1>Final Step: Complete Registration</h1> */}
                  <h4 className="tex-muted my-3 text-center">
                    Complete Registration
                  </h4>

                  {/* Form */}
                  {/* <form > */}

                  <div className="form-group">
                    <label>
                      Pan Number <span className="login-danger">*</span>
                    </label>
                    <input
                      className="form-control"
                      type="text"
                      name="pannumber"
                      maxLength={10}
                      onKeyPress={handleKeyPressPannumber}
                      onChange={handlechanges}
                    />
                    <span className="profile-views">
                      <i className="fas fa-user-circle" />
                    </span>
                    {data.panerror && (
                      <div className="error">{data.panerror}</div>
                    )}
                  </div>
                  <div className="form-group">
                    <label>
                      Date of Birth <span className="login-danger">*</span>
                    </label>
                    <input
                      className="form-control"
                      type="date"
                      name="date"
                      onChange={handlechanges}
                      max={minDate} // set the max date to 18 years ago
                    />
                    {/* <span className="profile-views">
                      <i className="fas fa-user-circle" />
                    </span> */}
                    {data.doberror && (
                      <div className="error">{data.doberror}</div>
                    )}
                  </div>

                  <div className="form-group">
                    <label>
                      Address <span className="login-danger">*</span>
                    </label>
                    <textarea
                      className="form-control"
                      type="text"
                      name="address"
                      onChange={handlechanges}
                    />
                    <span className="profile-views">
                      <i className="fas fa-user-circle" />
                    </span>
                    {data.addresserror && (
                      <div className="error">{data.addresserror}</div>
                    )}
                  </div>

                  {isloading==true ? <> <button
                    className="btn btn-primary btn-block"
                    type="button"
                  // onClick={submitloginhandler}
                  >
                    <div class="spinner-border text-light" role="status">
                      <span class="visually-hidden">Loading...</span>
                    </div>
                  </button></> :
                    <button
                      className="btn btn-primary btn-block"
                      type="submit"
                      onClick={handlesubmit}
                      disabled={data.isbtnvalid}
                    >
                      {" "}
                      Submit{" "}
                    </button>
                  }
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Register_active_proceed;
