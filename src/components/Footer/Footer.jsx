import React from "react";
import LandingFooter from "./LandingFooter";

/**
 * Universal Footer Component
 * 
 * Supports two presentation modes:
 * - default/simple: Compact dashboard footer for authenticated internal pages
 * - "landing" / "full": Comprehensive regulatory footer with full links grid and disclaimers
 */
const Footer = ({ variant = "simple", ...props }) => {
  if (variant === "landing" || variant === "full") {
    return <LandingFooter {...props} />;
  }

  return (
    <footer>
      <p>Copyright © 2016 OxyLoans.com. All rights reserved.</p>
    </footer>
  );
};

export { LandingFooter };
export default Footer;
