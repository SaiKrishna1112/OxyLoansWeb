import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  FaFilePdf,
  FaDownload,
  FaExternalLinkAlt,
  FaPrint,
  FaBuilding,
  FaBalanceScale,
  FaShieldAlt,
  FaCalendarAlt,
  FaMapMarkerAlt,
  FaCheckCircle,
  FaInfoCircle,
} from "react-icons/fa";
import LandingHeader from "../../Header/LandingHeader";
import LandingFooter from "../../Footer/LandingFooter";
import oxyTitleDivider from "../../../assets/img/landing/oxy_title_divider.png";
import "./LatestEGMNotice.css";

const LatestEGMNotice = () => {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const [copied, setCopied] = useState(false);

  // Local PDF path in public folder and fallback original remote URL
  const pdfUrl = `${process.env.PUBLIC_URL || ""}/latestEGM.pdf`;
  const remotePdfUrl = "https://www.oxyloans.com/new/assets/pdf/latestEGM.pdf";

  const handlePrint = () => {
    window.print();
  };

  const handleCopyLink = () => {
    const url = window.location.href;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      });
    }
  };

  return (
    <div className="oxy-egm-page">
      {/* 1. Modular Header */}
      <LandingHeader
        standalone={true}
        showProgressBar={false}
        showSocialDock={false}
      />

      {/* 2. Top Hero Banner */}
      <section className="oxy-egm-hero">
        <div className="oxy-egm-hero-inner">
          <div className="oxy-egm-badge-top">
            <FaFilePdf className="badge-icon" />
            <span>STATUTORY CORPORATE COMPLIANCE &amp; SHAREHOLDER NOTICE</span>
          </div>
          <h1 className="oxy-egm-hero-title">
            Latest Extra-Ordinary General Meeting (EGM) Notice
          </h1>
          <p className="oxy-egm-hero-subhead">
            Official statutory notice and explanatory statement convened for members
            and shareholders of <strong>SRS FINTECHLABS PRIVATE LIMITED</strong>{" "}
            (CIN: <code>U72900TG2016PTC103822</code>) in accordance with Section 100
            and 102 of the Companies Act, 2013 and applicable RBI Master Directions.
          </p>

          <div className="oxy-egm-meta-bar">
            <div className="meta-item">
              <FaBuilding className="meta-icon" />
              <span>Company: <strong>SRS FINTECHLABS PVT. LTD.</strong></span>
            </div>
            <div className="meta-item">
              <FaBalanceScale className="meta-icon" />
              <span>CIN: <strong>U72900TG2016PTC103822</strong></span>
            </div>
            <div className="meta-item">
              <FaShieldAlt className="meta-icon" />
              <span>RBI Registration: <strong>NBFC-P2P (Feb 06, 2019)</strong></span>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Main PDF Viewer & Controls Section */}
      <main className="oxy-egm-main">
        <div className="container">
          <div className="borrower-head">
            <h2>Latest EGM Notice</h2>
            <div className="oxy-title-divider-wrap">
              <img
                src={oxyTitleDivider}
                alt="Divider"
                className="oxy-title-divider-img"
              />
            </div>
          </div>

          {/* Action Toolbar */}
          <div className="egm-toolbar-card">
            <div className="toolbar-info">
              <FaFilePdf className="pdf-icon" />
              <div>
                <h4>Notice &amp; Explanatory Statement</h4>
                <p>SRS Fintechlabs Private Limited &bull; PDF Document (920 KB)</p>
              </div>
            </div>

            <div className="toolbar-actions">
              <a
                href={pdfUrl}
                download="OxyLoans_Latest_EGM_Notice.pdf"
                className="btn-toolbar-download"
                title="Download PDF document"
              >
                <FaDownload /> Download PDF
              </a>

              <a
                href={pdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-toolbar-ext"
                title="Open in new browser tab"
              >
                <FaExternalLinkAlt /> Fullscreen Tab
              </a>

              <button
                type="button"
                className="btn-toolbar-print"
                onClick={handlePrint}
                title="Print Notice"
              >
                <FaPrint /> Print
              </button>

              <button
                type="button"
                className="btn-toolbar-share"
                onClick={handleCopyLink}
                title="Copy shareable link"
              >
                {copied ? (
                  <>
                    <FaCheckCircle className="text-success" /> Copied!
                  </>
                ) : (
                  "Share Link"
                )}
              </button>
            </div>
          </div>

          {/* Embedded PDF Viewer Container */}
          <div className="egm-viewer-container">
            <object
              data={pdfUrl}
              type="application/pdf"
              className="egm-pdf-object"
              title="Latest EGM Notice PDF"
            >
              <iframe
                src={`${pdfUrl}#toolbar=1&navpanes=1`}
                className="egm-pdf-iframe"
                title="Latest EGM Notice"
              >
                <div className="pdf-fallback-content">
                  <FaFilePdf className="fallback-icon" />
                  <h3>Unable to embed PDF directly in your browser</h3>
                  <p>
                    Your browser does not support inline PDF viewing. You can
                    easily download or open the official EGM Notice using the
                    buttons below:
                  </p>
                  <div className="fallback-actions">
                    <a
                      href={pdfUrl}
                      download="OxyLoans_Latest_EGM_Notice.pdf"
                      className="btn-fallback-primary"
                    >
                      <FaDownload /> Download Latest EGM Notice (PDF)
                    </a>
                    <a
                      href={remotePdfUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-fallback-secondary"
                    >
                      <FaExternalLinkAlt /> Open Direct Remote PDF
                    </a>
                  </div>
                </div>
              </iframe>
            </object>
          </div>

          {/* Statutory Notes & Governance Disclosures */}
          <div className="egm-statutory-notes">
            <div className="statutory-note-item">
              <FaInfoCircle className="note-icon" />
              <div>
                <strong>Notice to Members:</strong>
                <p>
                  A member entitled to attend and vote at the Extra-Ordinary General
                  Meeting is entitled to appoint a proxy to attend and vote on his /
                  her behalf, and a proxy need not be a member of the Company. Proxy
                  forms duly completed must reach the registered office at least 48
                  hours before the meeting.
                </p>
              </div>
            </div>

            <div className="statutory-note-item">
              <FaShieldAlt className="note-icon" />
              <div>
                <strong>Inspection of Documents:</strong>
                <p>
                  All statutory registers and documents referred to in this notice and
                  explanatory statement are open for inspection at the Registered
                  Office of the Company during normal business hours on all working
                  days up to the date of the meeting.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* 4. Modular Footer */}
      <LandingFooter />
    </div>
  );
};

export default LatestEGMNotice;
