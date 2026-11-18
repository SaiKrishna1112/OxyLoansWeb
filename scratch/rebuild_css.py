import os

print("Writing rebuild script for Babuz landing page...")

CSS_CONTENT = """/* babuz.css - Exact styles matching Recording 2026-11-17 173610.mp4 */
@import url('https://fonts.googleapis.com/css2?family=Kanit:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,400;1,600&display=swap');

/* Scope root */
.babuz-page {
  font-family: 'Kanit', sans-serif !important;
  color: #111111;
  background-color: #ffffff;
  overflow-x: hidden;
  position: relative;
  width: 100%;
  margin: 0;
  padding: 0;
  line-height: 1.5;
  -webkit-font-smoothing: antialiased;
}

.babuz-page * {
  box-sizing: border-box !important;
  font-family: 'Kanit', sans-serif;
}

.babuz-page a {
  text-decoration: none !important;
  color: inherit;
  transition: all 0.3s ease;
}

.babuz-page a:hover {
  text-decoration: none !important;
}

.babuz-page button {
  outline: none !important;
  border: none;
  background: transparent;
  cursor: pointer;
  font-family: 'Kanit', sans-serif;
}

/* Common Container */
.babuz-page .b-container {
  width: 100%;
  max-width: 1320px;
  margin-left: auto;
  margin-right: auto;
  padding-left: 20px;
  padding-right: 20px;
  position: relative;
}

@media (min-width: 1400px) {
  .babuz-page .b-container {
    max-width: 1360px;
  }
}

/* Animations */
@keyframes bPulse {
  0% { transform: scale(0.95); opacity: 0.7; }
  50% { transform: scale(1.05); opacity: 1; }
  100% { transform: scale(0.95); opacity: 0.7; }
}

@keyframes bSpinSlow {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.babuz-page .b-anim-pulse {
  animation: bPulse 4s ease-in-out infinite;
}

.babuz-page .b-anim-spin {
  animation: bSpinSlow 15s linear infinite;
}

/* Circular Action Buttons */
.babuz-page .b-circle-btn {
  width: 140px;
  height: 140px;
  border-radius: 50%;
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
  text-decoration: none !important;
  text-align: center;
}

.babuz-page .b-circle-btn-yellow {
  background-color: #ffce32 !important;
  color: #111111 !important;
  border: 1px solid #ffce32 !important;
}

.babuz-page .b-circle-btn-yellow:hover {
  background-color: transparent !important;
  color: #ffce32 !important;
  transform: scale(1.05);
}

.babuz-page .b-circle-btn-white {
  background-color: #ffffff !important;
  color: #111111 !important;
  border: 1px solid #111111 !important;
}

.babuz-page .b-circle-btn-white:hover {
  background-color: #ffce32 !important;
  border-color: #ffce32 !important;
  color: #111111 !important;
  transform: scale(1.05);
}

.babuz-page .b-circle-btn-dark {
  background-color: transparent !important;
  color: #ffffff !important;
  border: 1px solid rgba(255, 255, 255, 0.3) !important;
}

.babuz-page .b-circle-btn-dark:hover {
  background-color: #ffce32 !important;
  border-color: #ffce32 !important;
  color: #111111 !important;
  transform: scale(1.05);
}

/* Background Runner Lines */
.babuz-page .b-runner-lines {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  z-index: 1;
}

.babuz-page .b-runner-line {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 1px;
  background-color: rgba(0, 0, 0, 0.06);
}

.babuz-page .b-runner-line-white {
  background-color: rgba(255, 255, 255, 0.08) !important;
}

/* Navigation Bar */
.babuz-page .b-navbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 9999;
  transition: all 0.35s ease;
  padding: 24px 0;
}

.babuz-page .b-navbar.scrolled {
  background-color: rgba(0, 86, 85, 0.98) !important;
  backdrop-filter: blur(8px);
  padding: 14px 0;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
}

.babuz-page .b-navbar-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.babuz-page .b-nav-links {
  display: flex;
  align-items: center;
  gap: 36px;
  list-style: none;
  margin: 0;
  padding: 0;
}

.babuz-page .b-nav-link {
  color: #ffffff !important;
  font-weight: 500;
  font-size: 17px;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  position: relative;
  padding: 4px 0;
}

.babuz-page .b-nav-link::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 0%;
  height: 2px;
  background-color: #ffce32;
  transition: width 0.3s ease;
}

.babuz-page .b-nav-link:hover {
  color: #ffce32 !important;
}

.babuz-page .b-nav-link:hover::after {
  width: 100%;
}

.babuz-page .b-btn-login {
  color: #ffffff !important;
  font-weight: 500;
  font-size: 16px;
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.babuz-page .b-btn-login:hover {
  color: #ffce32 !important;
}

.babuz-page .b-btn-get-started {
  background-color: #ffce32 !important;
  color: #111111 !important;
  font-weight: 600;
  font-size: 16px;
  padding: 12px 26px;
  border-radius: 6px;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s ease;
}

.babuz-page .b-btn-get-started:hover {
  background-color: #ffd859 !important;
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(255, 206, 50, 0.4);
}

/* HERO SECTION */
.babuz-page .b-hero-wrapper {
  padding: 16px 24px 0 24px;
  background-color: #ffffff;
}

@media (max-width: 768px) {
  .babuz-page .b-hero-wrapper {
    padding: 0;
  }
}

.babuz-page .b-hero-card {
  background-color: #005655 !important;
  border-radius: 24px;
  position: relative;
  overflow: hidden;
  padding: 140px 60px 80px 60px;
}

@media (max-width: 991px) {
  .babuz-page .b-hero-card {
    padding: 120px 24px 60px 24px;
    border-radius: 0;
  }
}

.babuz-page .b-hero-grid {
  display: grid;
  grid-template-columns: 1.15fr 1fr;
  align-items: center;
  gap: 40px;
  position: relative;
  z-index: 2;
}

@media (max-width: 991px) {
  .babuz-page .b-hero-grid {
    grid-template-columns: 1fr;
  }
}

.babuz-page .b-hero-subtitle {
  color: #ffffff;
  font-size: 16px;
  font-weight: 500;
  letter-spacing: 1.5px;
  text-transform: uppercase;
  margin-bottom: 14px;
}

.babuz-page .b-hero-title {
  color: #ffffff !important;
  font-size: 58px;
  font-weight: 700;
  line-height: 1.15;
  margin: 0 0 24px 0;
}

@media (max-width: 1200px) {
  .babuz-page .b-hero-title {
    font-size: 44px;
  }
}

@media (max-width: 576px) {
  .babuz-page .b-hero-title {
    font-size: 34px;
  }
}

.babuz-page .b-hero-desc {
  color: rgba(255, 255, 255, 0.78);
  font-size: 18px;
  line-height: 1.6;
  max-width: 520px;
  margin-bottom: 40px;
}

.babuz-page .b-hero-btns {
  display: flex;
  align-items: center;
  gap: 18px;
  flex-wrap: wrap;
}

.babuz-page .b-btn-hero-outline {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 13px 28px;
  border: 1.5px solid #ffce32 !important;
  border-radius: 6px;
  color: #ffffff !important;
  font-size: 16px;
  font-weight: 500;
  background-color: transparent !important;
  transition: all 0.3s ease;
}

.babuz-page .b-btn-hero-outline:hover {
  background-color: #ffce32 !important;
  color: #111111 !important;
}

.babuz-page .b-hero-image-wrap {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
}

.babuz-page .b-hero-image-wrap img {
  width: 100%;
  max-width: 720px;
  height: auto;
  display: block;
}

/* Floating Reviews Badge */
.babuz-page .b-hero-reviews-badge {
  position: absolute;
  left: 20px;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 40px;
  z-index: 10;
}

@media (max-width: 1400px) {
  .babuz-page .b-hero-reviews-badge {
    display: none;
  }
}

/* ABOUT SECTION */
.babuz-page .b-about-section {
  padding: 120px 0;
  position: relative;
  background-color: #ffffff;
  overflow: hidden;
}

.babuz-page .b-about-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  align-items: center;
  gap: 60px;
  position: relative;
  z-index: 2;
}

@media (max-width: 991px) {
  .babuz-page .b-about-grid {
    grid-template-columns: 1fr;
  }
}

/* SERVICES SECTION */
.babuz-page .b-services-section {
  background-color: #005655 !important;
  color: #ffffff;
  padding: 120px 0;
  position: relative;
  overflow: hidden;
}

.babuz-page .b-services-grid {
  display: grid;
  grid-template-columns: 1fr 1.3fr;
  gap: 60px;
  align-items: center;
  position: relative;
  z-index: 2;
}

@media (max-width: 991px) {
  .babuz-page .b-services-grid {
    grid-template-columns: 1fr;
  }
}

.babuz-page .b-service-card {
  border: 1px solid rgba(255, 255, 255, 0.25);
  border-radius: 12px;
  padding: 36px 32px;
  background-color: transparent;
  transition: all 0.35s ease;
}

.babuz-page .b-service-card:hover {
  border-color: #ffce32;
  transform: translateY(-6px);
  background-color: rgba(255, 255, 255, 0.04);
}

/* PRICING SECTION */
.babuz-page .b-pricing-section {
  padding: 120px 0;
  background-color: #ffffff;
  position: relative;
  overflow: hidden;
}

.babuz-page .b-pricing-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 30px;
  margin-top: 50px;
}

@media (max-width: 991px) {
  .babuz-page .b-pricing-grid {
    grid-template-columns: 1fr;
  }
}

.babuz-page .b-pricing-card {
  border-radius: 16px;
  padding: 44px 36px;
  background-color: #fbfbfb;
  border: 1px solid #e5e7eb;
  position: relative;
  overflow: hidden;
  transition: all 0.35s ease;
}

.babuz-page .b-pricing-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.08);
}

.babuz-page .b-pricing-card.featured {
  background-color: #ffce32 !important;
  border-color: #ffce32 !important;
}

/* FINANCIAL / LOAN SECTION */
.babuz-page .b-loan-section {
  padding: 0;
  position: relative;
  overflow: hidden;
  background-color: #ffffff;
}

.babuz-page .b-loan-grid {
  display: grid;
  grid-template-columns: 1.1fr 1fr;
  align-items: stretch;
}

@media (max-width: 991px) {
  .babuz-page .b-loan-grid {
    grid-template-columns: 1fr;
  }
}

.babuz-page .b-loan-purple-box {
  background-color: #7d49f3 !important;
  color: #ffffff;
  padding: 90px 60px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  position: relative;
  overflow: hidden;
}

/* FAQ SECTION */
.babuz-page .b-faq-section {
  padding: 120px 0;
  background-color: #ffffff;
  position: relative;
}

.babuz-page .b-faq-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px 30px;
  margin-top: 50px;
}

@media (max-width: 991px) {
  .babuz-page .b-faq-grid {
    grid-template-columns: 1fr;
  }
}

.babuz-page .b-faq-item {
  border: 1px solid #e6e6e6;
  border-radius: 9999px;
  background-color: #ffffff;
  padding: 18px 28px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
  transition: all 0.3s ease;
}

.babuz-page .b-faq-item:hover {
  border-color: #005655;
  box-shadow: 0 6px 20px rgba(0, 86, 85, 0.08);
}

.babuz-page .b-faq-item.open {
  border-radius: 24px;
}

/* TEAM SECTION */
.babuz-page .b-team-section {
  padding: 120px 0;
  background-color: #ffffff;
  position: relative;
  overflow: hidden;
}

.babuz-page .b-team-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 30px;
  margin-top: 50px;
}

@media (max-width: 991px) {
  .babuz-page .b-team-grid {
    grid-template-columns: 1fr;
  }
}

.babuz-page .b-team-card-image {
  background-color: #005655 !important;
  border-radius: 12px;
  overflow: hidden;
  position: relative;
  padding-top: 24px;
  display: flex;
  justify-content: center;
  align-items: flex-end;
  height: 380px;
}

.babuz-page .b-team-card-image img {
  max-height: 100%;
  width: auto;
  object-fit: cover;
  transition: transform 0.5s ease;
}

.babuz-page .b-team-card:hover .b-team-card-image img {
  transform: scale(1.05);
}

.babuz-page .b-team-plus-badge {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 44px;
  height: 44px;
  background-color: #ffce32 !important;
  color: #111111;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
  font-weight: 700;
  cursor: pointer;
}

/* TESTIMONIALS SECTION */
.babuz-page .b-testimonials-section {
  padding: 120px 0 60px 0;
  background-color: #ffffff;
  text-align: center;
  position: relative;
}

/* COUNTER SECTION */
.babuz-page .b-counter-section {
  padding: 70px 0 100px 0;
  background-color: #ffffff;
  border-bottom: 1px solid #ebebeb;
}

.babuz-page .b-counter-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  align-items: center;
}

@media (max-width: 768px) {
  .babuz-page .b-counter-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 30px;
  }
}

.babuz-page .b-counter-item {
  text-align: center;
  padding: 0 20px;
  position: relative;
}

.babuz-page .b-counter-item:not(:last-child)::after {
  content: '';
  position: absolute;
  right: 0;
  top: 15%;
  height: 70%;
  width: 1px;
  background-color: #e5e7eb;
}

@media (max-width: 768px) {
  .babuz-page .b-counter-item:not(:last-child)::after {
    display: none;
  }
}

/* BLOG SECTION */
.babuz-page .b-blog-section {
  padding: 120px 0;
  background-color: #ffffff;
  position: relative;
}

.babuz-page .b-blog-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 30px;
  margin-top: 50px;
}

@media (max-width: 768px) {
  .babuz-page .b-blog-grid {
    grid-template-columns: 1fr;
  }
}

/* FOOTER SECTION */
.babuz-page .b-footer {
  background-color: #111111 !important;
  color: #ffffff;
  position: relative;
  overflow: hidden;
}

.babuz-page .b-footer-cta-bar {
  background-color: #1a1e2d;
  padding: 44px 60px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 70px;
  position: relative;
  z-index: 2;
}

@media (max-width: 991px) {
  .babuz-page .b-footer-cta-bar {
    flex-direction: column;
    text-align: center;
    gap: 24px;
    padding: 36px 24px;
  }
}

.babuz-page .b-footer-grid {
  display: grid;
  grid-template-columns: 1.4fr 1fr 1fr 1.2fr;
  gap: 50px;
  padding-bottom: 70px;
  position: relative;
  z-index: 2;
}

@media (max-width: 991px) {
  .babuz-page .b-footer-grid {
    grid-template-columns: 1fr 1fr;
  }
}

@media (max-width: 576px) {
  .babuz-page .b-footer-grid {
    grid-template-columns: 1fr;
  }
}

.babuz-page .b-footer-bottom {
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  padding: 28px 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: relative;
  z-index: 2;
}

@media (max-width: 768px) {
  .babuz-page .b-footer-bottom {
    flex-direction: column;
    gap: 16px;
    text-align: center;
  }
}

/* SCROLL TO TOP */
.babuz-page .b-scroll-top {
  position: fixed;
  bottom: 30px;
  right: 30px;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background-color: #ffffff;
  border: 1px solid #e0e0e0;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 999;
  transition: all 0.3s ease;
}

.babuz-page .b-scroll-top:hover {
  background-color: #ffce32;
  transform: translateY(-3px);
}
"""

with open("src/components/pages/BabuzLanding/babuz.css", "w", encoding="utf-8") as f:
    f.write(CSS_CONTENT)

print("babuz.css written successfully!")
