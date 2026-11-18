import React, { useState } from "react";

const TestimonialsSection = () => {
  const [activeIdx, setActiveIdx] = useState(0);

  const testimonials = [
    {
      quote: "It's been 2 years since I found Bankio, and it's such a relief as a small business owner to not worry about unnecessary fees. I lost my credit card once, and the service was so quick.",
      name: "Andrew Russel",
      role: "VP of Marketing",
      img: "/assets/images/babuz/home-one-testimonial-1.912f25d0.png",
    },
    {
      quote: "Bankio has made managing my finances so much easier. The user-friendly interface and excellent customer support make it the perfect choice for individuals and businesses alike.",
      name: "Emily Thompson",
      role: "Freelance Designer",
      img: "/assets/images/babuz/home-one-testimonial-2.a7bcae8b.png",
    },
    {
      quote: "I switched to Bankio for my personal and business banking needs, and I couldn't be happier. The app is intuitive, and I love the convenience it offers.",
      name: "John Davis",
      role: "Entrepreneur",
      img: "/assets/images/babuz/home-one-testimonial-3.053c370b.png",
    },
  ];

  const nextTesti = () => {
    setActiveIdx((activeIdx + 1) % testimonials.length);
  };

  const prevTesti = () => {
    setActiveIdx((activeIdx - 1 + testimonials.length) % testimonials.length);
  };

  const current = testimonials[activeIdx];

  return (
    <section id="testimonials" className="b-testimonials-section">
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
        <div style={{ color: "#005655", fontSize: "16px", fontWeight: 600, letterSpacing: "1.5px", textTransform: "uppercase", marginBottom: "12px" }}>
          TESTIMONIALS
        </div>
        <h2 style={{ fontSize: "44px", fontWeight: 700, color: "#111111", lineHeight: 1.2, margin: "0 0 40px 0" }}>
          What people say
        </h2>

        {/* Quote Badge */}
        <div
          style={{
            width: "60px",
            height: "60px",
            borderRadius: "50%",
            backgroundColor: "rgba(125, 73, 243, 0.1)",
            color: "#7d49f3",
            fontSize: "24px",
            fontWeight: 700,
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: "24px",
          }}
        >
          99
        </div>

        {/* 5 Stars */}
        <div style={{ display: "flex", justifyContent: "center", gap: "6px", color: "#ffce32", fontSize: "20px", marginBottom: "28px" }}>
          {"★★★★★"}
        </div>

        {/* Quote text */}
        <div style={{ position: "relative", maxWidth: "800px", margin: "0 auto 36px auto" }}>
          <p style={{ fontSize: "22px", fontWeight: 500, color: "#222222", lineHeight: 1.6, margin: 0 }}>
            "{current.quote}"
          </p>

          {/* Left Arrow Button */}
          <button
            onClick={prevTesti}
            style={{
              position: "absolute",
              left: "-80px",
              top: "50%",
              transform: "translateY(-50%)",
              width: "48px",
              height: "48px",
              borderRadius: "50%",
              border: "1px solid #d0d0d0",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
            }}
          >
            &larr;
          </button>

          {/* Right Arrow Button */}
          <button
            onClick={nextTesti}
            style={{
              position: "absolute",
              right: "-80px",
              top: "50%",
              transform: "translateY(-50%)",
              width: "48px",
              height: "48px",
              borderRadius: "50%",
              border: "1px solid #d0d0d0",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
            }}
          >
            &rarr;
          </button>
        </div>

        {/* Author Avatar and Info */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
          <img
            src={current.img}
            alt={current.name}
            style={{ width: "64px", height: "64px", borderRadius: "50%", objectFit: "cover", marginBottom: "12px", border: "2px solid #ffce32" }}
          />
          <h4 style={{ fontSize: "20px", fontWeight: 700, color: "#111111", margin: "0 0 4px 0" }}>
            {current.name}
          </h4>
          <p style={{ color: "#777777", fontSize: "15px", margin: 0 }}>
            {current.role}
          </p>
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
