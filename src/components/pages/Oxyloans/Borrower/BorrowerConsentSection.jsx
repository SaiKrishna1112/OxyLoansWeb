import React, { useEffect, useRef } from "react";

export const BORROWER_CONSENTS = [
  {
    id: "loan_application",
    title: "1. Loan Application Consent",
    subtitle: "Consent to evaluate and process borrower's loan request",
    text: "I hereby confirm that I am voluntarily applying for a loan request on OxyLoans. I certify that all details provided in my loan application and supporting documents are accurate, true, and complete.",
  },
  {
    id: "credit_assessment",
    title: "2. Credit Bureau & Assessment Consent",
    subtitle: "Consent to assess credit score & financial profile",
    text: "I authorize OxyLoans and registered lenders on the platform to access, pull, and evaluate my credit score, CIBIL report, payment history, and financial obligations for the purpose of making loan offers and credit evaluation.",
  },
  {
    id: "doc_verification",
    title: "3. Document Verification Consent",
    subtitle: "Consent to verify submitted documents",
    text: "I consent to the verification and validation of all documents submitted by me, including identity (Aadhaar, PAN), address proof, income statements, and financial records through authorized verification agencies.",
  },
  {
    id: "p2p_platform_acknowledgment",
    title: "4. P2P Platform Facilitator Acknowledgment",
    subtitle: "Acknowledgment of P2P marketplace structure",
    text: "I acknowledge that OxyLoans is a Peer-to-Peer (P2P) lending facilitator platform operating under RBI guidelines. OxyLoans is not a direct bank or NBFC lender and does not guarantee loan funding.",
  },
  {
    id: "offer_sharing_consent",
    title: "5. Offers & Profile Sharing Consent",
    subtitle: "Consent for sharing loan request with lenders",
    text: "I consent to sharing my loan request details and credit summary with verified lenders on OxyLoans so that lenders can review my application and submit loan offers to me.",
  },
  {
    id: "data_sharing",
    title: "6. Data Sharing & Privacy Consent",
    subtitle: "Consent for regulatory and institutional data sharing",
    text: "I agree that my information may be securely shared with credit bureaus, financial institutions, and regulatory bodies for mandatory reporting, verification, and legal compliance.",
  },
  {
    id: "repayment_commitment",
    title: "7. Repayment Commitment & Overdue Terms",
    subtitle: "Commitment to adhere to EMI schedule and penalty terms",
    text: "I undertake to repay the borrowed amount along with applicable interest as per the agreed EMI repayment schedule. I understand that overdue payments attract penal interest, legal recovery notices, and credit bureau reporting.",
  },
  {
    id: "compliance_legal",
    title: "8. Compliance & Legal Declaration",
    subtitle: "Adherence to legal and regulatory requirements",
    text: "I confirm that this loan application complies with all applicable laws, regulations, and internal risk policies, and I agree to abide by OxyLoans Terms of Service and P2P Borrower Guidelines.",
  },
];

const PRIMARY_COLOR = "#0040e0";

export default function BorrowerConsentSection({ consentItems = [], onChange }) {
  const masterRef = useRef(null);

  const completedCount = consentItems.filter(Boolean).length;
  const allChecked = completedCount === BORROWER_CONSENTS.length;
  const someChecked = completedCount > 0 && !allChecked;

  useEffect(() => {
    if (masterRef.current) {
      masterRef.current.indeterminate = someChecked;
    }
  }, [someChecked]);

  const handleIndividualChange = (index, isChecked) => {
    const updated = [...consentItems];
    updated[index] = isChecked;
    if (onChange) onChange(updated);
  };

  const handleMasterChange = (isChecked) => {
    const updated = new Array(BORROWER_CONSENTS.length).fill(isChecked);
    if (onChange) onChange(updated);
  };

  return (
    <div className="card shadow-sm border mb-4" style={{ borderRadius: 10, overflow: "hidden" }}>
      {/* Header Banner */}
      <div
        className="d-flex align-items-center justify-content-between px-3 py-2.5"
        style={{
          background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
          color: "#fff",
        }}
      >
        <div>
          <div className="fw-bold d-flex align-items-center gap-2" style={{ fontSize: 13, color: "#fff" }}>
            <i className="fa-solid fa-file-signature text-info" />
            Borrower Consent &amp; Acknowledgment (8 Requirements)
          </div>
          <small style={{ color: "rgba(255,255,255,0.7)", fontSize: 11 }}>
            Read and acknowledge all 8 consent points to submit your loan request
          </small>
        </div>
        <div
          style={{
            background: allChecked ? "#10b981" : "#64748b",
            color: "#fff",
            borderRadius: 20,
            padding: "3px 12px",
            fontSize: 11,
            fontWeight: 700,
            whiteSpace: "nowrap",
          }}
        >
          {completedCount} / {BORROWER_CONSENTS.length} done
        </div>
      </div>

      {/* Consent Items Scrollable List */}
      <div style={{ maxHeight: 310, overflowY: "auto", background: "#f8fafc" }}>
        {BORROWER_CONSENTS.map((item, i) => {
          const isChecked = !!consentItems[i];
          return (
            <div
              key={item.id}
              style={{
                padding: "12px 16px",
                borderBottom: i < BORROWER_CONSENTS.length - 1 ? "1px solid #e2e8f0" : "none",
                background: isChecked ? "#f0fdf4" : "#ffffff",
                transition: "background 0.2s ease",
              }}
            >
              <div className="d-flex align-items-start gap-3">
                <div style={{ paddingTop: 2, flexShrink: 0 }}>
                  <input
                    type="checkbox"
                    id={`borrower_consent_${item.id}`}
                    checked={isChecked}
                    onChange={(e) => handleIndividualChange(i, e.target.checked)}
                    style={{
                      width: 17,
                      height: 17,
                      cursor: "pointer",
                      accentColor: PRIMARY_COLOR,
                    }}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label htmlFor={`borrower_consent_${item.id}`} style={{ cursor: "pointer", display: "block", margin: 0 }}>
                    <div className="fw-semibold" style={{ fontSize: 12.5, color: "#0f172a", marginBottom: 2 }}>
                      {item.title}
                      {isChecked && <i className="fa fa-check-circle ms-2" style={{ color: "#10b981", fontSize: 12 }} />}
                    </div>
                    <div style={{ fontSize: 11, color: "#64748b", marginBottom: 3, fontStyle: "italic" }}>
                      {item.subtitle}
                    </div>
                    <div style={{ fontSize: 11.5, color: "#334155", lineHeight: 1.5 }}>
                      {item.text}
                    </div>
                  </label>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Master Select All Footer */}
      <div style={{ padding: "12px 16px", background: "#f1f5f9", borderTop: "1px solid #cbd5e1" }}>
        <div className="d-flex align-items-center gap-2">
          <input
            id="borrower_agree_all_consents"
            ref={masterRef}
            type="checkbox"
            checked={allChecked}
            onChange={(e) => handleMasterChange(e.target.checked)}
            style={{ width: 17, height: 17, cursor: "pointer", accentColor: PRIMARY_COLOR }}
          />
          <label htmlFor="borrower_agree_all_consents" className="fw-bold mb-0" style={{ cursor: "pointer", fontSize: 12.5, color: "#0f172a" }}>
            I hereby confirm that I have read, understood, and accept all 8 Borrower Consent items above. <span className="text-danger">*</span>
          </label>
        </div>
      </div>
    </div>
  );
}
