import React from "react";

const CounterSection = () => {
  const stats = [
    { number: "120 +", label: "Partner with us" },
    { number: "$1.3+", label: "Cumulative trading volume" },
    { number: "705K+", label: "Successful Projects" },
    { number: "575K", label: "Active Banking Accounts" },
  ];

  return (
    <section className="b-counter-section">
      <div className="b-container">
        <div className="b-counter-grid">
          {stats.map((s, idx) => (
            <div key={idx} className="b-counter-item">
              <h3 style={{ fontSize: "52px", fontWeight: 700, color: "#005655", margin: "0 0 8px 0" }}>
                {s.number}
              </h3>
              <p style={{ color: "#666666", fontSize: "16px", fontWeight: 500, margin: 0 }}>
                {s.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CounterSection;
