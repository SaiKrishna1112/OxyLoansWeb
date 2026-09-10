import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useGoogleLogin } from "@react-oauth/google";
import axios from "axios";
import BASE_URL from "../../../config";
import { saveLoginSession } from "../../HttpRequest/aiAdminApi";
import { toastrSuccess } from "../Base UI Elements/Toast";
import { WarningBackendApi } from "../Base UI Elements/SweetAlert";

const GoogleSSOTest = () => {
  const history = useNavigate();
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");

  const handleGoogleSuccess = async (tokenResponse) => {
    setLoading(true);
    setStatus("Checking email with OxyLoans...");
    try {
      const res = await axios.post(
        `${BASE_URL}/v1/user/checkGoogleEmail`,
        { accessToken: tokenResponse.access_token },
        { headers: { "Content-Type": "application/json" } }
      );
      const { phoneNumberRequiredOrNot: emailStatus, signInUrl: email } = res.data;
      setStatus(`checkGoogleEmail → ${emailStatus} (${email})`);

      if (emailStatus === "LINKED" || emailStatus === "FOUND") {
        const loginRes = await axios.post(
          `${BASE_URL}/v1/user/loginWithLinkedGoogle`,
          { accessToken: tokenResponse.access_token },
          { headers: { "Content-Type": "application/json" } }
        );
        if (saveLoginSession(loginRes)) {
          toastrSuccess("Google login successful!");
          const role = loginRes.data?.primaryType;
          setStatus(`Login OK — role: ${role}, id: ${loginRes.data?.id}`);
          setTimeout(() => {
            if (role === "LENDER") history("/lenderAIDashboard/" + loginRes.data.id);
            else if (["ADMIN", "HELPDESKADMIN", "SUPERADMIN", "PRIMARYADMIN"].includes(role)) history("/oxyloansadmindashboard");
            else history("/borrowerDashboard");
          }, 1500);
        }
      } else {
        // NOT_FOUND — show status; on the real login page a modal handles this
        setStatus(`NOT_FOUND — ${email} is not registered on OxyLoans`);
      }
    } catch (err) {
      const msg = err?.response?.data?.errorMessage || err.message || "Unknown error";
      setStatus(`ERROR: ${msg}`);
      WarningBackendApi("Google Login Failed", msg);
    } finally {
      setLoading(false);
    }
  };

  const googleLogin = useGoogleLogin({
    onSuccess: handleGoogleSuccess,
    onError: (err) => {
      setStatus(`Google OAuth error: ${JSON.stringify(err)}`);
      WarningBackendApi("Google Login Failed", "Could not open Google login.");
    },
  });

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f5f5f5" }}>
      <div style={{ background: "#fff", borderRadius: 12, padding: "40px 48px", maxWidth: 420, width: "90%", boxShadow: "0 4px 20px rgba(0,0,0,0.1)", textAlign: "center" }}>
        <img src="/assets/img/logo.png" alt="OxyLoans" style={{ height: 48, marginBottom: 24 }} onError={e => { e.target.style.display = "none"; }} />
        <h2 style={{ marginBottom: 8, color: "#1a1a2e", fontSize: 22 }}>Google SSO Test</h2>
        <p style={{ color: "#888", fontSize: 13, marginBottom: 32 }}>Internal testing only — not visible to lenders</p>

        <button
          onClick={() => googleLogin()}
          disabled={loading}
          style={{
            display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
            width: "100%", padding: "12px 20px", border: "1px solid #ddd", borderRadius: 8,
            background: "#fff", cursor: loading ? "not-allowed" : "pointer",
            fontSize: 15, fontWeight: 500, color: "#333",
            boxShadow: "0 1px 3px rgba(0,0,0,0.1)", opacity: loading ? 0.6 : 1,
          }}
        >
          <img src="https://developers.google.com/identity/images/g-logo.png" alt="G" style={{ width: 20, height: 20 }} />
          {loading ? "Verifying..." : "Sign in with Google"}
        </button>

        {status && (
          <div style={{ marginTop: 24, padding: "12px 16px", background: "#f8f9fa", borderRadius: 8, fontSize: 13, color: "#444", textAlign: "left", wordBreak: "break-all" }}>
            {status}
          </div>
        )}
      </div>
    </div>
  );
};

export default GoogleSSOTest;
