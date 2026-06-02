import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";
import { MARKETPLACE_URL } from "../../../config";
import { getToken } from "../../HttpRequest/afterlogin";

export default function AISubscriptionSuccess() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState("verifying");
  const [tier, setTier] = useState(null);

  useEffect(() => {
    const orderId = params.get("order_id");
    if (!orderId) { setStatus("error"); return; }

    axios
      .post(`${MARKETPLACE_URL}/v1/ai/subscription/verify?orderId=${orderId}`, {}, {
        headers: { accessToken: getToken() },
      })
      .then((r) => {
        if (r.data.success) {
          setTier(r.data.tier);
          setStatus("success");
        } else {
          setStatus("pending");
        }
      })
      .catch(() => setStatus("error"));
  }, []);

  const icon = status === "success" ? "✅" : status === "pending" ? "⏳" : "❌";
  const title =
    status === "success" ? `${tier} Plan Activated!` :
    status === "pending" ? "Payment Processing…" :
    "Verification Failed";
  const msg =
    status === "success" ? "Your AI Dashboard is now unlocked. Redirecting…" :
    status === "pending" ? "Your payment is being processed. Check back in a few minutes." :
    "Could not verify payment. Please contact support.";

  useEffect(() => {
    if (status === "success") {
      const t = setTimeout(() => navigate("/ai/portfolio"), 3000);
      return () => clearTimeout(t);
    }
  }, [status]);

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f8f9fa" }}>
      <div className="card" style={{ maxWidth: 420, width: "100%", borderRadius: 16, padding: 40, textAlign: "center", boxShadow: "0 4px 24px rgba(0,0,0,0.08)" }}>
        <div style={{ fontSize: 56, marginBottom: 16 }}>{icon}</div>
        <h4 style={{ fontWeight: 700, marginBottom: 8 }}>{title}</h4>
        <p className="text-muted" style={{ marginBottom: 24 }}>{msg}</p>
        {status !== "verifying" && (
          <button className="btn btn-primary" onClick={() => navigate("/ai/portfolio")} style={{ borderRadius: 8, fontWeight: 600 }}>
            Go to AI Dashboard
          </button>
        )}
      </div>
    </div>
  );
}
