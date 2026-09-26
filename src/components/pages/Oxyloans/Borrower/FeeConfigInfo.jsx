import React, { useEffect, useState } from "react";
import { getRadiusBasedFee, getBorrowerCibilScore } from "../../../HttpRequest/afterlogin";

const RadiusIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="10" r="3" />
    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
  </svg>
);

const CibilIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="20" x2="18" y2="10" />
    <line x1="12" y1="20" x2="12" y2="4" />
    <line x1="6" y1="20" x2="6" y2="14" />
  </svg>
);

const ChevronIcon = ({ up }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
    style={{ transform: up ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.3s ease" }}>
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

const InfoIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 4 }}>
    <circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" />
  </svg>
);

const FeeConfigInfo = () => {
  const [radiusFees, setRadiusFees] = useState([]);
  const [cibilFees, setCibilFees] = useState([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    getRadiusBasedFee()
      .then((res) => { if (res?.status === 200 && Array.isArray(res.data)) setRadiusFees(res.data); })
      .catch(() => {});
    getBorrowerCibilScore()
      .then((res) => { if (res?.status === 200 && Array.isArray(res.data)) setCibilFees(res.data); })
      .catch(() => {});
  }, []);

  return (
    <div style={{ borderRadius: 16, overflow: "hidden", boxShadow: "0 2px 16px rgba(0,0,0,0.08)", marginBottom: 24, background: "#fff", border: "1px solid #e8eaf0" }}>
      {/* Header Toggle */}
      <div
        onClick={() => setOpen((p) => !p)}
        style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "14px 20px", cursor: "pointer",
          background: open ? "linear-gradient(135deg, #1a56db 0%, #3b82f6 100%)" : "linear-gradient(135deg, #f8faff 0%, #eef2ff 100%)",
          transition: "background 0.3s ease",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 34, height: 34, borderRadius: 8,
            background: open ? "rgba(255,255,255,0.2)" : "linear-gradient(135deg, #1a56db, #3b82f6)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="4" y1="6" x2="20" y2="6" /><line x1="4" y1="12" x2="14" y2="12" /><line x1="4" y1="18" x2="17" y2="18" />
              <circle cx="19" cy="12" r="2" /><circle cx="17" cy="18" r="2" />
            </svg>
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 15, color: open ? "#fff" : "#1e293b" }}>Fee Configuration</div>
            <div style={{ fontSize: 12, color: open ? "rgba(255,255,255,0.75)" : "#64748b", marginTop: 1 }}>
              Radius & CIBIL score based processing fees
            </div>
          </div>
        </div>
        <div style={{
          display: "flex", alignItems: "center", gap: 8,
          color: open ? "#fff" : "#1a56db",
          fontSize: 12, fontWeight: 600,
        }}>
          <span>{open ? "Hide" : "View Details"}</span>
          <ChevronIcon up={open} />
        </div>
      </div>

      {/* Expandable Content */}
      {open && (
        <div style={{ padding: "20px", background: "#f8faff" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16 }}>

            {/* Radius-Based Fee Card */}
            <div style={{ background: "#fff", borderRadius: 12, overflow: "hidden", boxShadow: "0 1px 8px rgba(26,86,219,0.10)", border: "1px solid #dbeafe" }}>
              <div style={{
                background: "linear-gradient(135deg, #1a56db 0%, #3b82f6 100%)",
                padding: "14px 18px", display: "flex", alignItems: "center", gap: 10,
              }}>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: "rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <RadiusIcon />
                </div>
                <div>
                  <div style={{ color: "#fff", fontWeight: 700, fontSize: 14 }}>Radius-Based Fee</div>
                  <div style={{ color: "rgba(255,255,255,0.75)", fontSize: 11 }}>Distance between borrower & lender</div>
                </div>
              </div>
              <div style={{ padding: "14px 18px" }}>
                {radiusFees.length === 0 ? (
                  <p style={{ color: "#94a3b8", fontSize: 13, margin: 0 }}>No data available.</p>
                ) : (
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                    <thead>
                      <tr style={{ background: "#eff6ff" }}>
                        <th style={{ padding: "8px 12px", textAlign: "left", color: "#1e40af", fontWeight: 600, borderBottom: "2px solid #dbeafe" }}>From (km)</th>
                        <th style={{ padding: "8px 12px", textAlign: "left", color: "#1e40af", fontWeight: 600, borderBottom: "2px solid #dbeafe" }}>To (km)</th>
                        <th style={{ padding: "8px 12px", textAlign: "center", color: "#1e40af", fontWeight: 600, borderBottom: "2px solid #dbeafe" }}>Fee %</th>
                      </tr>
                    </thead>
                    <tbody>
                      {radiusFees.map((r, i) => (
                        <tr key={r.id} style={{ background: i % 2 === 0 ? "#fff" : "#f8faff" }}>
                          <td style={{ padding: "9px 12px", borderBottom: "1px solid #e2e8f0", color: "#334155" }}>{r.startingKm}</td>
                          <td style={{ padding: "9px 12px", borderBottom: "1px solid #e2e8f0", color: "#334155" }}>{r.endingKm}</td>
                          <td style={{ padding: "9px 12px", borderBottom: "1px solid #e2e8f0", textAlign: "center" }}>
                            <span style={{ background: "#1a56db", color: "#fff", borderRadius: 20, padding: "3px 10px", fontWeight: 700, fontSize: 12 }}>
                              {r.feePercentage}%
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
                {/* <div style={{ marginTop: 12, padding: "8px 12px", background: "#eff6ff", borderRadius: 8, display: "flex", alignItems: "center", color: "#1e40af", fontSize: 12 }}>
                  <InfoIcon />
                  Eligible Amount = Requested Amount − Radius Fee
                </div> */}
              </div>
            </div>

            {/* CIBIL Score-Based Fee Card */}
            <div style={{ background: "#fff", borderRadius: 12, overflow: "hidden", boxShadow: "0 1px 8px rgba(5,150,105,0.10)", border: "1px solid #d1fae5" }}>
              <div style={{
                background: "linear-gradient(135deg, #059669 0%, #10b981 100%)",
                padding: "14px 18px", display: "flex", alignItems: "center", gap: 10,
              }}>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: "rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <CibilIcon />
                </div>
                <div>
                  <div style={{ color: "#fff", fontWeight: 700, fontSize: 14 }}>CIBIL Score-Based Fee</div>
                  <div style={{ color: "rgba(255,255,255,0.75)", fontSize: 11 }}>Based on your credit score</div>
                </div>
              </div>
              <div style={{ padding: "14px 18px" }}>
                {cibilFees.length === 0 ? (
                  <p style={{ color: "#94a3b8", fontSize: 13, margin: 0 }}>No data available.</p>
                ) : (
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                    <thead>
                      <tr style={{ background: "#ecfdf5" }}>
                        <th style={{ padding: "8px 12px", textAlign: "left", color: "#065f46", fontWeight: 600, borderBottom: "2px solid #d1fae5" }}>Score Range</th>
                        <th style={{ padding: "8px 12px", textAlign: "center", color: "#065f46", fontWeight: 600, borderBottom: "2px solid #d1fae5" }}>Fee %</th>
                      </tr>
                    </thead>
                    <tbody>
                      {cibilFees.map((c, i) => (
                        <tr key={c.id} style={{ background: i % 2 === 0 ? "#fff" : "#f0fdf4" }}>
                          <td style={{ padding: "9px 12px", borderBottom: "1px solid #e2e8f0", color: "#334155", fontWeight: 500 }}>
                            {c.startScore} – {c.endScore}
                          </td>
                          <td style={{ padding: "9px 12px", borderBottom: "1px solid #e2e8f0", textAlign: "center" }}>
                            <span style={{ background: "#059669", color: "#fff", borderRadius: 20, padding: "3px 10px", fontWeight: 700, fontSize: 12 }}>
                              {c.feePercentage}%
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
                {/* <div style={{ marginTop: 12, padding: "8px 12px", background: "#ecfdf5", borderRadius: 8, display: "flex", alignItems: "center", color: "#065f46", fontSize: 12 }}>
                  <InfoIcon />
                  Eligible Amount = Requested Amount − Radius Fee − CIBIL Fee
                </div> */}
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default FeeConfigInfo;
