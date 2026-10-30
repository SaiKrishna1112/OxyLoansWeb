import React, { useEffect, useState } from "react";
import axios from "axios";
import { BASE_URL } from "../../../config";

const DealConsentPage = () => {
  const params = new URLSearchParams(window.location.search);
  const token = params.get("token");
  const choiceFromUrl = params.get("choice");

  const [info, setInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!token) {
      setError("Invalid link. Please use the link from your WhatsApp message.");
      setLoading(false);
      return;
    }
    axios
      .get(`${BASE_URL}/v1/user/dealConsentInfo?token=${token}`)
      .then((res) => {
        setInfo(res.data);
        setLoading(false);
        if (choiceFromUrl && !res.data.alreadyResponded) {
          submitConsent(choiceFromUrl, res.data);
        }
      })
      .catch(() => {
        setError("Unable to load your deal information. Please try again.");
        setLoading(false);
      });
  }, [token]);

  const submitConsent = (choice, infoData) => {
    setSubmitting(true);
    axios
      .post(
        `${BASE_URL}/v1/user/recordDealConsent?token=${token}&choice=${choice}`
      )
      .then((res) => {
        setResult(res.data);
        setSubmitting(false);
      })
      .catch(() => {
        setError("Failed to record your response. Please try again.");
        setSubmitting(false);
      });
  };

  if (loading) {
    return (
      <div style={styles.center}>
        <div style={styles.spinner} />
        <p style={{ color: "#555", marginTop: 16 }}>Loading your deal information…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.center}>
        <div style={styles.card}>
          <span style={{ fontSize: 40 }}>⚠️</span>
          <p style={{ color: "#c0392b", marginTop: 12, fontWeight: 600 }}>{error}</p>
        </div>
      </div>
    );
  }

  if (result || (info && info.alreadyResponded)) {
    const data = result || info;
    const isContinue = (data.consentType || "").toUpperCase() === "CONTINUE";
    return (
      <div style={styles.center}>
        <div style={styles.card}>
          <span style={{ fontSize: 48 }}>{isContinue ? "✅" : "💰"}</span>
          <h2 style={{ color: "#2c3e50", marginTop: 12 }}>
            {isContinue ? "Investment Continues!" : "Withdrawal Recorded"}
          </h2>
          <p style={{ color: "#555", marginTop: 8, textAlign: "center" }}>
            {data.message ||
              (isContinue
                ? "Thank you! Your investment will continue. We appreciate your trust in OxyLoans."
                : "Thank you! Your withdrawal request has been recorded. Our team will process it after the tenure ends.")}
          </p>
          <div style={styles.dealBox}>
            <p><strong>Deal:</strong> {data.dealName || info?.dealName}</p>
            <p><strong>Your Investment:</strong> ₹{(data.participatedAmount || info?.participatedAmount || 0).toLocaleString("en-IN")}</p>
          </div>
          <p style={{ color: "#888", fontSize: 13, marginTop: 16 }}>
            For queries, contact OxyLoans support.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.center}>
      <div style={styles.card}>
        <img
          src="https://oxyloans.com/assets/logo.png"
          alt="OxyLoans"
          style={{ height: 40, marginBottom: 16 }}
          onError={(e) => (e.target.style.display = "none")}
        />
        <h2 style={{ color: "#2c3e50", marginBottom: 4 }}>Deal Tenure Update</h2>
        <p style={{ color: "#888", fontSize: 13, marginBottom: 20 }}>
          Your deal is completing its tenure soon. Please choose an action.
        </p>

        <div style={styles.dealBox}>
          <p><strong>Deal:</strong> {info.dealName}</p>
          <p><strong>Lender:</strong> {info.lenderName}</p>
          <p>
            <strong>Your Investment:</strong> ₹
            {(info.participatedAmount || 0).toLocaleString("en-IN")}
          </p>
          <p><strong>Tenure End Date:</strong> {info.emiEndDate}</p>
        </div>

        <p style={{ color: "#555", fontSize: 14, margin: "20px 0 8px", textAlign: "center" }}>
          What would you like to do?
        </p>

        <button
          style={{ ...styles.btn, background: "#27ae60" }}
          disabled={submitting}
          onClick={() => submitConsent("CONTINUE")}
        >
          ✅ Continue Investment
        </button>

        <button
          style={{ ...styles.btn, background: "#2980b9", marginTop: 12 }}
          disabled={submitting}
          onClick={() => submitConsent("WITHDRAW")}
        >
          💰 Withdraw Principal
        </button>

        {submitting && (
          <p style={{ color: "#888", fontSize: 13, marginTop: 12 }}>
            Recording your response…
          </p>
        )}

        <p style={{ color: "#aaa", fontSize: 12, marginTop: 20 }}>
          This link is unique to you. Your response is securely recorded.
        </p>
      </div>
    </div>
  );
};

const styles = {
  center: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#f0f4f8",
    padding: 16,
  },
  card: {
    background: "#fff",
    borderRadius: 16,
    padding: "32px 28px",
    maxWidth: 420,
    width: "100%",
    boxShadow: "0 4px 24px rgba(0,0,0,0.10)",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  dealBox: {
    background: "#f8f9fa",
    borderRadius: 10,
    padding: "14px 18px",
    width: "100%",
    marginTop: 8,
    lineHeight: 1.8,
    fontSize: 14,
    color: "#2c3e50",
  },
  btn: {
    width: "100%",
    padding: "14px 0",
    borderRadius: 10,
    border: "none",
    color: "#fff",
    fontSize: 16,
    fontWeight: 600,
    cursor: "pointer",
  },
  spinner: {
    width: 40,
    height: 40,
    border: "4px solid #e0e0e0",
    borderTop: "4px solid #2980b9",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
  },
};

export default DealConsentPage;
