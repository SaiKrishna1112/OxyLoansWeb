import React, { useEffect } from "react";
import Lenis from "lenis";
import Navbar from "./Navbar";
import HeroSection from "./HeroSection";
import AboutSection from "./AboutSection";
import ServicesSection from "./ServicesSection";
import PricingSection from "./PricingSection";
import LoanMasterySection from "./LoanMasterySection";
import FaqSection from "./FaqSection";
import TeamSection from "./TeamSection";
import TestimonialsSection from "./TestimonialsSection";
import CounterSection from "./CounterSection";
import BlogSection from "./BlogSection";
import Footer from "./Footer";
import ScrollToTop from "./ScrollToTop";
import "./babuz.css";

const BabuzLanding = () => {
  useEffect(() => {
    document.title = "Home Three - Banking Solutions for Businesses | Babuz";

    // Disable browser scroll restoration so page always starts at top hero
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }
    window.scrollTo(0, 0);

    // Initialize Lenis Ultra-Smooth Scrolling
    let lenis = null;
    let animationFrameId = null;

    try {
      lenis = new Lenis({
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        orientation: "vertical",
        gestureOrientation: "vertical",
        smoothWheel: true,
        wheelMultiplier: 1.1,
        touchMultiplier: 2,
      });

      lenis.scrollTo(0, { immediate: true });

      function raf(time) {
        if (lenis) {
          lenis.raf(time);
          animationFrameId = requestAnimationFrame(raf);
        }
      }
      animationFrameId = requestAnimationFrame(raf);

      window.__babuz_lenis = lenis;
    } catch (e) {
      console.warn("Lenis init fallback:", e);
    }

    return () => {
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
      if (lenis) lenis.destroy();
      window.__babuz_lenis = null;
    };
  }, []);

  return (
    <div className="babuz-page">
      <Navbar />
      <HeroSection />
      <AboutSection />
      <ServicesSection />
      <PricingSection />
      <LoanMasterySection />
      <FaqSection />
      <TeamSection />
      <TestimonialsSection />
      <CounterSection />
      <BlogSection />
      <Footer />
      <ScrollToTop />
    </div>
  );
};

export default BabuzLanding;
