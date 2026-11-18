import os
import re

css_path = "src/components/pages/BabuzLanding/babuz.css"
with open(css_path, "r", encoding="utf-8") as f:
    css_content = f.read()

# Append high-specificity, bulletproof scoped overrides to defeat OxyLoans style.css
overrides = """
/* ========================================================
   HIGH SPECIFICITY BULLETPROOF OVERRIDES TO DEFEAT style.css
   ======================================================== */

.babuz-page {
  font-family: 'Kanit', sans-serif !important;
  color: #343839 !important;
  background-color: #ffffff !important;
  overflow-x: hidden;
  position: relative;
  width: 100%;
}

.babuz-page * {
  box-sizing: border-box !important;
}

/* Background Colors Overrides */
.babuz-page .bg-primary,
.babuz-page section.bg-primary,
.babuz-page div.bg-primary,
.babuz-page header.bg-primary,
.babuz-page .hero-banner,
.babuz-page .services-section,
.babuz-page .team-card-box {
  background-color: #005655 !important;
}

.babuz-page .bg-primary\\/95 {
  background-color: rgba(0, 86, 85, 0.95) !important;
}

.babuz-page .bg-primary\\/90 {
  background-color: rgba(0, 86, 85, 0.90) !important;
}

.babuz-page .bg-primary\\/10 {
  background-color: rgba(0, 86, 85, 0.10) !important;
}

.babuz-page .bg-primary\\/20 {
  background-color: rgba(0, 86, 85, 0.20) !important;
}

.babuz-page .bg-primary\\/5 {
  background-color: rgba(0, 86, 85, 0.05) !important;
}

.babuz-page .bg-secondary,
.babuz-page div.bg-secondary,
.babuz-page section.bg-secondary {
  background-color: #7d49f3 !important;
}

.babuz-page .bg-secondary\\/5 {
  background-color: rgba(125, 73, 243, 0.05) !important;
}

.babuz-page .bg-secondary\\/10 {
  background-color: rgba(125, 73, 243, 0.10) !important;
}

.babuz-page .bg-secondary\\/20 {
  background-color: rgba(125, 73, 243, 0.20) !important;
}

.babuz-page .bg-accent-1 {
  background-color: #16192c !important;
}

.babuz-page .bg-accent-2 {
  background-color: #111111 !important;
}

.babuz-page .bg-accent-3 {
  background-color: #ffce32 !important;
}

.babuz-page .bg-accent-3\\/15 {
  background-color: rgba(255, 206, 50, 0.15) !important;
}

.babuz-page .bg-accent-3\\/20 {
  background-color: rgba(255, 206, 50, 0.20) !important;
}

.babuz-page .bg-white-1 {
  background-color: #ffffff !important;
}

.babuz-page .bg-white-2 {
  background-color: #fbfbfb !important;
}

.babuz-page .bg-white-3 {
  background-color: #e6e6e7 !important;
}

.babuz-page .bg-white-4 {
  background-color: #f5f6f8 !important;
}

.babuz-page .bg-black-1 {
  background-color: #222222 !important;
}

.babuz-page .bg-black-2 {
  background-color: #333333 !important;
}

.babuz-page .bg-black-3 {
  background-color: #555555 !important;
}

.babuz-page .bg-black-4 {
  background-color: #111111 !important;
}

/* Text Colors Overrides */
.babuz-page .text-primary {
  color: #005655 !important;
}

.babuz-page .text-secondary {
  color: #7d49f3 !important;
}

.babuz-page .text-accent-3 {
  color: #ffce32 !important;
}

.babuz-page .text-white-1 {
  color: #ffffff !important;
}

.babuz-page .text-white-2 {
  color: #e6e6e7 !important;
}

.babuz-page .text-white-3 {
  color: #c2c2c3 !important;
}

.babuz-page .text-white-4 {
  color: #8e9097 !important;
}

.babuz-page .text-black-1 {
  color: #222222 !important;
}

.babuz-page .text-black-2 {
  color: #333333 !important;
}

.babuz-page .text-black-3 {
  color: #555555 !important;
}

.babuz-page .text-black-4 {
  color: #111111 !important;
}

/* Borders Overrides */
.babuz-page .border-accent-3 {
  border-color: #ffce32 !important;
}

.babuz-page .border-primary {
  border-color: #005655 !important;
}

.babuz-page .border-white-1 {
  border-color: #ffffff !important;
}

.babuz-page .border-black-1 {
  border-color: #222222 !important;
}

.babuz-page .border-black-2 {
  border-color: #333333 !important;
}

.babuz-page .border-black-3 {
  border-color: #555555 !important;
}

.babuz-page .border-black-4 {
  border-color: #111111 !important;
}

/* Hover Overrides */
.babuz-page .hover\\:bg-accent-3:hover {
  background-color: #ffce32 !important;
}

.babuz-page .hover\\:bg-primary:hover {
  background-color: #005655 !important;
}

.babuz-page .hover\\:bg-white-1:hover {
  background-color: #ffffff !important;
}

.babuz-page .hover\\:text-black-4:hover {
  color: #111111 !important;
}

.babuz-page .hover\\:text-white-1:hover {
  color: #ffffff !important;
}

.babuz-page .hover\\:text-accent-3:hover {
  color: #ffce32 !important;
}

.babuz-page .hover\\:border-accent-3:hover {
  border-color: #ffce32 !important;
}

/* Section 6 Purple Right Half */
@media (min-width: 992px) {
  .babuz-page .banner:after {
    content: "" !important;
    position: absolute !important;
    bottom: 0 !important;
    right: 0 !important;
    z-index: 0 !important;
    height: 100% !important;
    width: 50% !important;
    background-color: #7d49f3 !important;
  }
}

/* Hero Polygon Clip Path */
@media (min-width: 1200px) {
  .babuz-page .hero-banner {
    clip-path: polygon(70% 0, 100% 0, 100% 60%, 100% 100%, 0% 100%, 0 8%, 67% 8%) !important;
    -webkit-clip-path: polygon(70% 0, 100% 0, 100% 60%, 100% 100%, 0% 100%, 0 8%, 67% 8%) !important;
    border-radius: 0.75rem !important;
  }
}

/* Typography and Link Reset */
.babuz-page h1,
.babuz-page h2,
.babuz-page h3,
.babuz-page h4,
.babuz-page h5,
.babuz-page h6 {
  font-family: 'Kanit', sans-serif !important;
  margin-bottom: 0 !important;
}

.babuz-page a {
  text-decoration: none !important;
}

.babuz-page a:hover {
  text-decoration: none !important;
}

.babuz-page button {
  outline: none !important;
}

/* Title reveal guarantee */
.babuz-page .title-animation {
  opacity: 1 !important;
  visibility: visible !important;
}
"""

if "BULLETPROOF OVERRIDES TO DEFEAT style.css" not in css_content:
    with open(css_path, "a", encoding="utf-8") as f:
        f.write("\n" + overrides)
    print("Updated babuz.css with high-specificity overrides!")
else:
    print("Overrides already present in babuz.css")
