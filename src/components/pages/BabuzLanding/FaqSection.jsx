import React, { useState } from "react";

const FaqSection = () => {
  const [openIdx, setOpenIdx] = useState(null);

  const leftFaqs = [
    { q: "How do I report fraudulent activity on my account?", a: "You can report fraudulent transactions instantly through our 24/7 mobile app support or by calling our fraud prevention helpline immediately." },
    { q: "Can I set up account alerts for unusual transactions?", a: "Yes, you can enable custom SMS and push notification alerts for high-value transactions, international usage, and daily limits." },
    { q: "What should I do if my card is damaged?", a: "You can request a free card replacement directly in your account settings, and a new contactless card will be dispatched within 48 hours." },
    { q: "Is there a way to dispute a transaction on my account?", a: "Yes, tap the disputed transaction in your account dashboard and select 'Dispute Charge' to submit evidence for rapid resolution." },
    { q: "What steps should I take if I forget my card PIN?", a: "You can instantly and securely reset your PIN in the app using biometric verification or OTP verification." },
  ];

  const rightFaqs = [
    { q: "How do I report fraudulent activity on my account?", a: "You can report fraudulent transactions instantly through our 24/7 mobile app support or by calling our fraud prevention helpline immediately." },
    { q: "Can I set up account alerts for unusual transactions?", a: "Yes, you can enable custom SMS and push notification alerts for high-value transactions, international usage, and daily limits." },
    { q: "What should I do if my card is damaged?", a: "You can request a free card replacement directly in your account settings, and a new contactless card will be dispatched within 48 hours." },
    { q: "Is there a way to dispute a transaction on my account?", a: "Yes, tap the disputed transaction in your account dashboard and select 'Dispute Charge' to submit evidence for rapid resolution." },
    { q: "What steps should I take if I forget my card PIN?", a: "You can instantly and securely reset your PIN in the app using biometric verification or OTP verification." },
  ];

  const toggle = (key) => {
    setOpenIdx(openIdx === key ? null : key);
  };

  return (
    <section id="faq" className="b-faq-section">
      {/* Background runner lines */}
      <div className="b-runner-lines">
        <div className="b-runner-line" style={{ left: "10%" }}></div>
        <div className="b-runner-line" style={{ left: "30%" }}></div>
        <div className="b-runner-line" style={{ left: "50%" }}></div>
        <div className="b-runner-line" style={{ left: "70%" }}></div>
        <div className="b-runner-line" style={{ left: "90%" }}></div>
      </div>

      <div className="b-container">
        {/* Header */}
        <div style={{ textAlign: "center", maxWidth: "600px", margin: "0 auto" }}>
          <div style={{ color: "#005655", fontSize: "16px", fontWeight: 600, letterSpacing: "1.5px", textTransform: "uppercase", marginBottom: "12px" }}>
            FAQ
          </div>
          <h2 style={{ fontSize: "44px", fontWeight: 700, color: "#111111", lineHeight: 1.2, margin: 0 }}>
            Frequently ASked Questions
          </h2>
        </div>

        {/* 2 Columns */}
        <div className="b-faq-grid">
          {/* Left Column */}
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {leftFaqs.map((faq, idx) => {
              const isOpen = openIdx === `l-${idx}`;
              return (
                <div
                  key={idx}
                  className={`b-faq-item ${isOpen ? "open" : ""}`}
                  onClick={() => toggle(`l-${idx}`)}
                >
                  <div style={{ flex: 1, paddingRight: "16px" }}>
                    <div style={{ fontWeight: 600, fontSize: "16px", color: "#111111" }}>{faq.q}</div>
                    {isOpen && (
                      <p style={{ color: "#666666", fontSize: "14px", marginTop: "12px", lineHeight: 1.6, margin: 0 }}>
                        {faq.a}
                      </p>
                    )}
                  </div>
                  <div
                    style={{
                      width: "36px",
                      height: "36px",
                      borderRadius: "50%",
                      border: "1px solid #d0d0d0",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "20px",
                      fontWeight: 600,
                      color: "#111111",
                      flexShrink: 0,
                    }}
                  >
                    {isOpen ? "−" : "+"}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right Column */}
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {rightFaqs.map((faq, idx) => {
              const isOpen = openIdx === `r-${idx}`;
              return (
                <div
                  key={idx}
                  className={`b-faq-item ${isOpen ? "open" : ""}`}
                  onClick={() => toggle(`r-${idx}`)}
                >
                  <div style={{ flex: 1, paddingRight: "16px" }}>
                    <div style={{ fontWeight: 600, fontSize: "16px", color: "#111111" }}>{faq.q}</div>
                    {isOpen && (
                      <p style={{ color: "#666666", fontSize: "14px", marginTop: "12px", lineHeight: 1.6, margin: 0 }}>
                        {faq.a}
                      </p>
                    )}
                  </div>
                  <div
                    style={{
                      width: "36px",
                      height: "36px",
                      borderRadius: "50%",
                      border: "1px solid #d0d0d0",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "20px",
                      fontWeight: 600,
                      color: "#111111",
                      flexShrink: 0,
                    }}
                  >
                    {isOpen ? "−" : "+"}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default FaqSection;
