import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  FaPhoneAlt,
  FaEnvelope,
  FaMapMarkerAlt,
  FaWhatsapp,
  FaPaperPlane,
  FaCheckCircle,
  FaHeadset,
  FaDirections,
  FaBuilding,
  FaExternalLinkAlt,
} from "react-icons/fa";
import LandingHeader from "../../Header/LandingHeader";
import LandingFooter from "../../Footer/LandingFooter";
import formBg from "../../../assets/img/landing/contact/form_bg.jpg";
import mapBg from "../../../assets/img/landing/contact/map_bg.jpg";
import "./ContactUs.css";

const ContactUs = () => {
  const [formData, setFormData] = useState({
    "your-name": "",
    "your-email": "",
    "tel-432": "",
    "your-message": "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData["your-name"] || !formData["your-email"]) {
      alert("Please enter your name and email.");
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
      setFormData({
        "your-name": "",
        "your-email": "",
        "tel-432": "",
        "your-message": "",
      });
    }, 1000);
  };

  return (
    <div className="oxy-contact-page">
      {/* 1. Modular Header */}
      <LandingHeader
        standalone={true}
        showProgressBar={false}
        showSocialDock={false}
      />

      {/* 2. Top Hero Banner */}
      <section className="oxy-contact-hero">
        <div className="oxy-contact-hero-inner">
          <div className="oxy-contact-badge-top">
            <FaHeadset className="badge-icon" />
            <span>24/7 DEDICATED SUPPORT &amp; ASSISTANCE</span>
          </div>
          <h1 className="oxy-contact-hero-title">Contact Us</h1>
          <p className="oxy-contact-hero-subhead">
            Have questions about lending, borrowing, or partner opportunities?
            Our financial specialists and grievance redressal team are here to help you.
          </p>

          <div className="contact-quick-dock">
            <a href="tel:+919966888825" className="quick-dock-card">
              <FaPhoneAlt className="dock-icon phone-icon" />
              <div>
                <span className="dock-label">Direct Helpline</span>
                <span className="dock-val">+91 9966 8888 25</span>
              </div>
            </a>

            <a href="mailto:support@oxyloans.com" className="quick-dock-card">
              <FaEnvelope className="dock-icon mail-icon" />
              <div>
                <span className="dock-label">Email Support</span>
                <span className="dock-val">support@oxyloans.com</span>
              </div>
            </a>

            <a
              href="https://api.whatsapp.com/send?phone=919966888825"
              target="_blank"
              rel="noopener noreferrer"
              className="quick-dock-card"
            >
              <FaWhatsapp className="dock-icon wa-icon" />
              <div>
                <span className="dock-label">WhatsApp Chat</span>
                <span className="dock-val">Chat with Specialist</span>
              </div>
            </a>
          </div>
        </div>
      </section>

      {/* 3. User's Contact Form Section */}
      <section
        className="contact-form"
        style={{
          backgroundImage: `url(${formBg})`,
        }}
      >
        <div className="container">
          <div className="contact-form-card">
            <h2>Need To Speak To Us?</h2>
            <p className="contact-form-subtitle">
              Fill out the form below and our dedicated customer relationship team will reach out to you within 24 hours.
            </p>

            {submitted ? (
              <div className="contact-success-banner">
                <FaCheckCircle className="success-icon" />
                <div>
                  <h4>Thank You for Contacting OxyLoans!</h4>
                  <p>
                    Your message has been received successfully. One of our lending advisors will get in touch with you shortly.
                  </p>
                </div>
                <button
                  type="button"
                  className="btn-send-another"
                  onClick={() => setSubmitted(false)}
                >
                  Send Another Message
                </button>
              </div>
            ) : (
              <form
                className="contact-custom-form"
                noValidate
                onSubmit={handleSubmit}
              >
                <div className="contact-form-row">
                  {/* Left Column: Name, Email, Phone */}
                  <div className="contact-form-col left-col">
                    <div className="form-group">
                      <input
                        type="text"
                        name="your-name"
                        value={formData["your-name"]}
                        className="form-control"
                        placeholder="Name"
                        onChange={handleChange}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <input
                        type="email"
                        name="your-email"
                        value={formData["your-email"]}
                        className="form-control"
                        placeholder="Email"
                        onChange={handleChange}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <input
                        type="tel"
                        name="tel-432"
                        value={formData["tel-432"]}
                        className="form-control"
                        placeholder="Phone"
                        onChange={handleChange}
                      />
                    </div>
                  </div>

                  {/* Right Column: Message & Submit */}
                  <div className="contact-form-col right-col">
                    <div className="form-group message-group">
                      <textarea
                        name="your-message"
                        value={formData["your-message"]}
                        rows="6"
                        className="form-control textarea-control"
                        placeholder="Message"
                        onChange={handleChange}
                        required
                      />
                    </div>

                    <div className="submit-group">
                      <button
                        type="submit"
                        disabled={loading}
                        className="btn-contact-submit"
                      >
                        {loading ? "SENDING..." : "SUBMIT"}
                      </button>
                    </div>
                  </div>
                </div>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* 4. Reach Us Section with 4-Column Map & Office Details */}
      <section
        className="reach-us-wrap"
        style={{
          backgroundImage: `url(${mapBg})`,
        }}
      >
        <div className="borrower-head">
          <h2>HOW TO REACH US?</h2>
          <p>
            <span>We are here to help people achieve their goals the smart way</span>
          </p>
        </div>

        <div className="contact-maps-block">
          <div className="maps-grid">
            {/* Location 1: Hyderabad Map */}
            <div className="map-col">
              <iframe
                title="Hyderabad Office Map"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3805.297437862529!2d78.38249127593922!3d17.493288399745778!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bcb918d3a955555%3A0x9414c8bca6f540e9!2sPlot+No.+287+1st+Floor%2C+OXYLOANS%2C+MIG%2F2%2C+MIG+1%2C+K+P+H+B+Phase+9%2C+Kukatpally%2C+Hyderabad%2C+Telangana+500072!5e0!3m2!1sen!2sin!4v1548259307246"
                width="100%"
                height="100%"
                frameBorder="0"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
              />
            </div>

            {/* Location 1: Hyderabad Address Card */}
            <div className="address-block">
              <div className="address">
                <div className="city-title-row">
                  <div className="city-icon-wrap">
                    <FaMapMarkerAlt className="city-icon" />
                  </div>
                  <div>
                    <h5>Hyderabad</h5>
                    <span className="location-badge">HEADQUARTERS</span>
                  </div>
                </div>

                <address>
                  <p className="company-name">SRS FINTECHLABS PVT LTD</p>
                  <p className="address-lines">
                    Plot No 287, 1st Floor, MIG-2,
                    <br />
                    Phase &ndash; IX, KPHB Colony,
                    <br />
                    Hyderabad -500072,
                    <br />
                    Telangana, India.
                  </p>
                </address>

                <div className="address-actions">
                  <a
                    href="https://www.google.com/maps/place/SRS+FINTECHLABS+PVT+LTD/@17.4837914,78.3846799,17z"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-location-action"
                  >
                    <FaDirections className="btn-action-icon" /> Open in Maps
                  </a>
                  <a href="tel:+919966888825" className="btn-location-action secondary">
                    <FaPhoneAlt className="btn-action-icon" /> +91 9966 8888 25
                  </a>
                </div>
              </div>
            </div>

            {/* Location 2: Bangalore Map */}
            <div className="map-col">
              <iframe
                title="Bangalore Office Map"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d992989.5906828358!2d76.3706382975205!3d13.543835827016677!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bb02c1e5c82429f%3A0x9f7feb8f496dd6de!2sTumkur%2C+Karnataka!5e0!3m2!1sen!2sin!4v1514445632764"
                width="100%"
                height="100%"
                frameBorder="0"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
              />
            </div>

            {/* Location 2: Bangalore Address Card */}
            <div className="address-block">
              <div className="address">
                <div className="city-title-row">
                  <div className="city-icon-wrap">
                    <FaMapMarkerAlt className="city-icon" />
                  </div>
                  <div>
                    <h5>Banglore</h5>
                    <span className="location-badge branch-badge">BRANCH OFFICE</span>
                  </div>
                </div>

                <address>
                  <p className="company-name">SRS FINTECHLABS PVT LTD</p>
                  <p className="address-lines">
                    #51, MC Colony, 1st cross, 1st Main
                    <br />
                    SS Puram,
                    <br />
                    Tumkur -500072,
                    <br />
                    Karnataka, India.
                  </p>
                </address>

                <div className="address-actions">
                  <a
                    href="https://maps.google.com/?q=Tumkur,+Karnataka"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-location-action"
                  >
                    <FaDirections className="btn-action-icon" /> Open in Maps
                  </a>
                  <a href="tel:+919966888825" className="btn-location-action secondary">
                    <FaPhoneAlt className="btn-action-icon" /> +91 9966 8888 25
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Modular Footer */}
      <LandingFooter />
    </div>
  );
};

export default ContactUs;
