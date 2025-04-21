import React, { useEffect, useState } from "react";
import "./user.css";
import { useNavigate } from "react-router-dom";
import { handelapidata } from "../../HttpRequest/beforelogin";
import { Link } from "react-router-dom";

const Whatappuser = ({ data }) => {
  const [data1, setAppData] = useState(data);
  console.log("Initial data1:", data1);
  const history = useNavigate();

  useEffect(() => {
    const iswhatsAppLogin = sessionStorage.getItem("whatAppLoginMultipleUser");
    if (iswhatsAppLogin) {
      const getdata = JSON.parse(sessionStorage.getItem("whatsAppLoginUsers"));
      setAppData(getdata);
    }
  }, []);

  const handelapi = async (userId) => {
    try {
      const response = await handelapidata(userId);
      const data = response.data;
      const accessToken = response.headers.accesstoken;
      // console.log(accessToken, data.primaryType);
      if (accessToken != null) {
        sessionStorage.setItem("accessToken", accessToken);
        sessionStorage.setItem("userId", data.id);
        sessionStorage.setItem("tokenTime", data.tokenGeneratedTime);
        sessionStorage.setItem("whatAppLoginMultipleUser", true);
        sessionStorage.setItem("whatsAppLoginUsers", JSON.stringify(data1));

        if (data.primaryType === "LENDER" || data.primaryType === "ADMIN") {
          history("/dashboard");
        } else if (data.primaryType === "BORROWER") {
          history("/borrowerDashboard");
        }
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <div className="row col-12">
      <div
        className="alert alert-primary col-12 vw-100 text-center"
        role="alert"
      >
        Multiple users are mapped with the given WhatsApp number. To proceed,
        please select the user you want to login or {""}
        <Link to="/">
          <span class="badge text-bg-secondary"> Back to Home</span>
        </Link>
      </div>

      <div className="d-flex  justify-content-start flex-row flex-wrap my-2">
        {data1 &&
          data1.length > 0 &&
          data1.map((userData, index) => (
            <div
              key={index}
              className="col-md-3 col-12 col-sm-12 col-lg-3 mx-auto"
            >
              <div className="panel price panel-red">
                <div className="panel-heading  text-center">
                  <h3>{userData.userId}</h3>
                </div>
                <div className="panel-body text-center">
                  <ul class="list-group list-group-flush text-center">
                    <li className="list-group-item">
                      <b className="paymembership_tenture">{userData.name}</b>
                    </li>
                    <li className="list-group-item">
                      <b className="paymembership_tenture"> {userData.email}</b>
                    </li>
                  </ul>
                </div>

                <div className="panel-footer">
                  <button
                    className="btn btn-xs btn-block btn-primary"
                    type="button"
                    onClick={() => handelapi(userData.userId)}
                  >
                    Login
                  </button>
                </div>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
};

export default Whatappuser;
