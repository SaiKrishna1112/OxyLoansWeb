import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Header from "../../../Header/Header";
import SideBar from "../../../SideBar/SideBar";
import {
  HandleWithFooter,
  WarningAlertWalltTran,
  WarningAlerterror,
  WarningAlertwithdrow1,
} from "../../Base UI Elements/SweetAlert";

import {
  loadVirtualAccount,
  submitWalletToWallet,
} from "../../../HttpRequest/afterlogin";

const WalletToWallet = () => {
  const [walletTowallet, setWaletToWallet] = useState({
    senderId: "",
    receiverId: "",
    amount: "",
    isValid: true,
  });

  const handleInputchange = (event) => {
    const { name, value } = event.target;
    setWaletToWallet({
      ...walletTowallet,
      [name]: value,
    });
  };


  const handleKeyPressNumber = (event) => {
    const inputChar = event.key;
    const regex = /^[0-9]*$/;

    if (!regex.test(inputChar) && inputChar !== "Backspace") {
      event.preventDefault();
    }
  };
  const handleSubmitHandler = () => {
    const response = submitWalletToWallet(walletTowallet);
    response.then((data) => {
      if (data.request.status == 200) {
        HandleWithFooter(
          "The wallet-to-wallet transfer was successful. Your withdrawal request has been initiated, and the receiver will receive the wallet amount after OxyAdmins approval."
        );
      } else if (data.request.status == 403) {
        WarningAlertWalltTran(data.response.data.errorMessage);
      } else {
        alert(data.response.data.errorCode)
        console.log(data)
        if (data.response.data.errorCode == "114") {
          // WarningAlertwithdrow(response.response.data.errorMessage);
          WarningAlertwithdrow1(data.response.data.errorMessage)
        } else {
          WarningAlerterror(data.response.data.errorMessage);
        }

      }
    });
  };

  useEffect(() => {
    if (walletTowallet.amount != "" && walletTowallet.receiverId != "") {
      setWaletToWallet({
        ...walletTowallet,
        isValid: false,
      });
    } else {
      setWaletToWallet({
        ...walletTowallet,
        isValid: true,
      });
    }
    return () => { };
  }, [walletTowallet.amount, walletTowallet.receiverId]);

  useEffect(() => {
    const getUser = loadVirtualAccount();
    setWaletToWallet({
      ...walletTowallet,
      senderId: getUser.userId,
    });
    return () => { };
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
                  <h3 className="page-title">
                    Transfer money from your wallet to another wallet.
                  </h3>
                  <ul className="breadcrumb">
                    <li className="breadcrumb-item">
                      <Link to="/dashboard">DashBoard</Link>
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
                      <code>
                        <b>Note : </b>
                      </code>
                      You can transfer funds from your wallet to your family's
                      or friend's wallet (this sends a request to admin, and
                      after the approval,funds will be debited from your account
                      and credited to the requested account)
                    </p>
                  </div>
                  <div className="card-body">
                    <form>
                      <div className="row">
                        <div className="col-12">
                          <h5 className="form-title">
                            <span>Sender Details</span>
                          </h5>
                        </div>
                        <div className="col-12 col-sm-4">
                          <div className="form-group local-forms">
                            <label>
                              My User ID
                              <span className="login-danger">*</span>
                            </label>
                            <input
                              type="text"
                              className="form-control"
                              disabled={true}
                              value={`LR${walletTowallet.senderId}`}
                            />
                          </div>
                        </div>
                        <div className="col-12 col-sm-4">
                          <div className="form-group local-forms">
                            <label>
                              Receiver ID
                              <span className="login-danger">*</span>
                            </label>
                            <input
                              type="text"
                              className="form-control"
                              placeholder="Enter Receiver Id"
                              name="receiverId"
                              onChange={handleInputchange}
                            />
                          </div>
                        </div>
                        <div className="col-12 col-sm-4">
                          <div className="form-group local-forms">
                            <label>
                              Transfer Amount
                              <span className="login-danger">*</span>
                            </label>
                            <input
                              type="tel"
                              className="form-control"
                              name="amount"
                              placeholder="Enter Transfer Amount"

                              onKeyPress={handleKeyPressNumber}
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
                              disabled={walletTowallet.isValid}
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

export default WalletToWallet;
