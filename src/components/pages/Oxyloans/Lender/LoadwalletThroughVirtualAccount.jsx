import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Header from "../../../Header/Header";
import SideBar from "../../../SideBar/SideBar";
import Footer from "../../../Footer/Footer";
import FeatherIcon from "feather-icons-react/build/FeatherIcon";
import { loadVirtualAccount } from "../../../HttpRequest/afterlogin";
import "./LoadwalletThroughVirtualAccount.css";

const LoadwalletThroughVirtualAccount = () => {
  const [userid, setUserid] = useState("");
  const [copiedField, setCopiedField] = useState("");
  useEffect(() => {
    const getUser = loadVirtualAccount();
    setUserid(getUser.userId);
    return () => {};
  }, []);

  const virtualAccountNumber = `OXYLRV${userid}`;

  const copyToClipboard = async (value, field) => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(value);
      } else {
        const textArea = document.createElement("textarea");
        textArea.value = value;
        textArea.style.position = "fixed";
        textArea.style.opacity = "0";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand("copy");
        document.body.removeChild(textArea);
      }
      setCopiedField(field);
      window.setTimeout(() => setCopiedField(""), 1600);
    } catch (error) {
      setCopiedField("");
    }
  };

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
            <div className="page-header">
              <div className="row">
                <div className="col-sm-12">
                  <div className="page-sub-header">
                    <h3 className="page-title">
                      Your Virtual Account with OxyLoans
                    </h3>
                    <ul className="breadcrumb">
                      <li className="breadcrumb-item">
                        <Link to="/dashboard">Dashboard</Link>
                      </li>
                      <li className="breadcrumb-item active">
                        <Link to="/loadwalletThroughQr">QR Scanner</Link>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
            <div className="wallet-load-layout">
              <section className="wallet-load-card wallet-instructions">
                <h2>How to Load Your Wallet</h2>
                <ul style={{ listStyle: "block",marginLeft: "25px" }}>
                  <li>Your <strong>Virtual Account Number is {virtualAccountNumber}</strong> – use this to transfer money from your bank.</li>
                  <li>Add <strong>{virtualAccountNumber}</strong> as a beneficiary in your bank app or net banking.</li>
                  <li>Transfer the amount you wish to invest – your <strong>OxyLoans wallet</strong> will be loaded automatically.</li>
                  <li>You will receive a confirmation on <strong>WhatsApp</strong> and <strong>email</strong> once the money is credited.</li>
                  <li>We only accept transfers in <strong>INR (Indian Rupees)</strong>. For any help, <Link to="/writetous">Click Here</Link>.</li>
                </ul>
                <div className="wallet-help-note">
                  <span className="wallet-help-icon" aria-hidden="true">▲</span>
                  <div>
                    <strong>Having trouble?</strong>
                    <p>If you are using <strong>ICICI </strong> or <strong>SBI</strong> Banks, are unable to add the beneficiary or transfer funds, please try using a <strong>different bank account</strong> to load your wallet.</p>
                  </div>
                </div>
              </section>

              <section className="wallet-load-card account-details-card">
                <h2>Account Details :</h2>
                <div className="account-detail-list">
                  <div className="account-detail-item"><FeatherIcon icon="user" /><div><strong>Account Name</strong><span>SRS FINTECHLABS PVT LTD</span></div></div>
                  <div className="account-detail-item"><FeatherIcon icon="grid" /><div><strong>Account Number</strong><span>{virtualAccountNumber} <button className="copy-account-button" type="button" aria-label="Copy account number" onClick={() => copyToClipboard(virtualAccountNumber, "account")}><FeatherIcon icon={copiedField === "account" ? "check" : "copy"} /><em>{copiedField === "account" ? "Copied" : ""}</em></button></span></div></div>
                  <div className="account-detail-item"><FeatherIcon icon="alert-octagon" /><div><strong>IFSC Code</strong><span>ICIC0000106 <button className="copy-account-button" type="button" aria-label="Copy IFSC code" onClick={() => copyToClipboard("ICIC0000106", "ifsc")}><FeatherIcon icon={copiedField === "ifsc" ? "check" : "copy"} /><em>{copiedField === "ifsc" ? "Copied" : ""}</em></button></span></div></div>
                  <div className="account-detail-item"><FeatherIcon icon="briefcase" /><div><strong>BANK</strong><span>ICICI</span></div></div>
                  <div className="account-detail-item"><FeatherIcon icon="user" /><div><strong>Account Type</strong><span>Current account</span></div></div>
                </div>
              </section>
            </div>
          </div>
          {/* Footer */}
          <Footer />
        </div>
      </div>
      {/* /Main Wrapper */}
    </>
  );
};

export default LoadwalletThroughVirtualAccount;
