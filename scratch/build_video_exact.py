import os

base_dir = "src/components/pages/BabuzLanding"

# 1. Navbar.jsx
navbar_code = '''import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 40) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="relative w-full">
      {/* Desktop Header */}
      <div
        className={`theme-transition-3 fixed top-0 z-50 w-full transition-all duration-300 ${
          isScrolled
            ? "shadow-xl backdrop-blur-md py-3"
            : "bg-transparent py-5"
        }`}
        style={isScrolled ? { backgroundColor: "rgba(0, 86, 85, 0.95)" } : {}}
      >
        <div className="transition-primary spy24px theme-transition-3 mx-auto hidden w-full items-center justify-between max-4xl:container xl:flex 4xl:max-w-[1674px] min-[1920px]:max-w-[1774px]">
          <div>
            <Link to="/home" className="block">
              <img
                alt="Babuz Logo"
                className="h-10 w-auto object-contain"
                height="60"
                src="/assets/images/babuz/logo.40962213.png"
                style={{ color: "transparent" }}
                width="167"
              />
            </Link>
          </div>

          <ul className="flex items-center justify-between gap-10">
            <li>
              <a
                className="l-text navbar-hover-text font-l-text theme-transition-3 relative z-10 flex cursor-pointer items-center justify-between gap-1 text-white-1 before:theme-transition-3 before:absolute before:bottom-0 before:block before:h-px before:w-0 before:bg-accent-3 hover:text-accent-3 hover:before:w-full font-medium"
                href="#hero"
              >
                <span>Home</span>
                <svg
                  className="tabler-icon tabler-icon-chevron-down size-4"
                  fill="none"
                  height="20"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  width="20"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M6 9l6 6l6 -6"></path>
                </svg>
              </a>
            </li>

            <li>
              <a
                className="l-text navbar-hover-text font-l-text theme-transition-3 relative z-10 flex cursor-pointer items-center justify-between gap-1 text-white-1 before:theme-transition-3 before:absolute before:bottom-0 before:block before:h-px before:w-0 before:bg-accent-3 hover:text-accent-3 hover:before:w-full font-medium"
                href="#about"
              >
                About
              </a>
            </li>

            <li>
              <a
                className="l-text navbar-hover-text font-l-text theme-transition-3 relative z-10 flex cursor-pointer items-center justify-between gap-1 text-white-1 before:theme-transition-3 before:absolute before:bottom-0 before:block before:h-px before:w-0 before:bg-accent-3 hover:text-accent-3 hover:before:w-full font-medium"
                href="#services"
              >
                <span>Pages</span>
                <svg
                  className="tabler-icon tabler-icon-chevron-down size-4"
                  fill="none"
                  height="20"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  width="20"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M6 9l6 6l6 -6"></path>
                </svg>
              </a>
            </li>

            <li>
              <a
                className="l-text navbar-hover-text font-l-text theme-transition-3 relative z-10 flex cursor-pointer items-center justify-between gap-1 text-white-1 before:theme-transition-3 before:absolute before:bottom-0 before:block before:h-px before:w-0 before:bg-accent-3 hover:text-accent-3 hover:before:w-full font-medium"
                href="#loan"
              >
                <span>Loan</span>
                <svg
                  className="tabler-icon tabler-icon-chevron-down size-4"
                  fill="none"
                  height="20"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  width="20"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M6 9l6 6l6 -6"></path>
                </svg>
              </a>
            </li>

            <li>
              <a
                className="l-text navbar-hover-text font-l-text theme-transition-3 relative z-10 flex cursor-pointer items-center justify-between gap-1 text-white-1 before:theme-transition-3 before:absolute before:bottom-0 before:block before:h-px before:w-0 before:bg-accent-3 hover:text-accent-3 hover:before:w-full font-medium"
                href="#blog"
              >
                Blog
              </a>
            </li>

            <li>
              <a
                className="l-text navbar-hover-text font-l-text theme-transition-3 relative z-10 flex cursor-pointer items-center justify-between gap-1 text-white-1 before:theme-transition-3 before:absolute before:bottom-0 before:block before:h-px before:w-0 before:bg-accent-3 hover:text-accent-3 hover:before:w-full font-medium"
                href="#contact"
              >
                Contact
              </a>
            </li>
          </ul>

          {/* Action CTAs */}
          <div className="flex gap-6 items-center">
            <Link
              className="l-text theme-transition-3 flex items-center gap-1.5 text-white-1 hover:text-accent-3 font-medium"
              to="/"
            >
              <svg
                className="tabler-icon tabler-icon-lock"
                fill="none"
                height="22"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                width="22"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M5 13a2 2 0 0 1 2 -2h10a2 2 0 0 1 2 2v6a2 2 0 0 1 -2 2h-10a2 2 0 0 1 -2 -2v-6z"></path>
                <path d="M11 16a1 1 0 1 0 2 0a1 1 0 0 0 -2 0"></path>
                <path d="M8 11v-4a4 4 0 1 1 8 0v4"></path>
              </svg>
              <span>Login</span>
            </Link>

            <Link
              className="l-text spx24px group theme-transition-3 flex items-center gap-3 bg-accent-3 py-3 px-6 text-black-4 font-semibold rounded hover:bg-accent-3/90"
              style={{ backgroundColor: "#ffce32", color: "#111111" }}
              to="/usertype"
            >
              <span>Get Started</span>
              <svg
                className="theme-transition-3 group-hover:rotate-45"
                fill="none"
                height="22"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                width="22"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M17 7l-10 10"></path>
                <path d="M8 7l9 0l0 9"></path>
              </svg>
            </Link>
          </div>
        </div>
      </div>

      {/* Mobile Header Bar */}
      <div
        className="fixed top-0 z-50 w-full xl:hidden bg-primary shadow-md"
        style={{ backgroundColor: "#005655" }}
      >
        <div className="container left-0 top-0 flex w-full items-center justify-between py-4">
          <Link to="/home" className="block">
            <img
              alt="Babuz Logo"
              className="h-8 w-auto object-contain"
              height="40"
              src="/assets/images/babuz/logo.40962213.png"
              style={{ color: "transparent" }}
              width="120"
            />
          </Link>
          <div
            className="group flex h-10 w-10 cursor-pointer items-center justify-center rounded-md p-2 bg-white-1"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <div className="space-y-1.5">
              <span
                className={`block h-1 w-6 rounded-full bg-primary transition-transform duration-300 ${
                  mobileMenuOpen ? "rotate-45 translate-y-2.5" : ""
                }`}
                style={{ backgroundColor: "#005655" }}
              ></span>
              <span
                className={`block h-1 w-6 rounded-full bg-accent-3 transition-opacity duration-300 ${
                  mobileMenuOpen ? "opacity-0" : ""
                }`}
                style={{ backgroundColor: "#ffce32" }}
              ></span>
              <span
                className={`block h-1 w-6 rounded-full bg-secondary transition-transform duration-300 ${
                  mobileMenuOpen ? "-rotate-45 -translate-y-2.5" : ""
                }`}
                style={{ backgroundColor: "#7d49f3" }}
              ></span>
            </div>
          </div>
        </div>

        {/* Mobile Drawer Overlay */}
        <div
          className={`fixed inset-0 z-40 bg-black/60 transition-opacity duration-300 ${
            mobileMenuOpen ? "opacity-100 visible" : "opacity-0 invisible pointer-events-none"
          }`}
          onClick={() => setMobileMenuOpen(false)}
        ></div>

        {/* Mobile Menu Drawer */}
        <div
          className={`fixed left-0 top-0 z-50 m-3 h-[96vh] w-[280px] overflow-y-auto rounded-2xl bg-black-4 pt-5 text-black-4 transition-all duration-500 ${
            mobileMenuOpen
              ? "translate-y-0 opacity-100"
              : "-translate-y-full opacity-0 pointer-events-none"
          }`}
        >
          <div className="px-5 pb-4 flex justify-between items-center">
            <Link to="/home" onClick={() => setMobileMenuOpen(false)}>
              <img
                alt="Babuz Logo"
                className="h-7 w-auto object-contain"
                height="30"
                src="/assets/images/babuz/logo.40962213.png"
                style={{ color: "transparent" }}
                width="100"
              />
            </Link>
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="text-white-1 hover:text-accent-3 text-2xl font-bold p-1"
            >
              ✕
            </button>
          </div>

          <div className="min-h-screen rounded-xl bg-white-1 p-3 pt-6">
            <ul className="flex flex-col gap-2">
              <li>
                <a
                  className="my-1 block w-full rounded-md border-b bg-secondary/20 px-6 py-3 font-medium text-black-4"
                  href="#hero"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Home
                </a>
              </li>
              <li>
                <a
                  className="my-1 block w-full rounded-md border-b bg-secondary/20 px-6 py-3 font-medium text-black-4"
                  href="#about"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  About
                </a>
              </li>
              <li>
                <a
                  className="my-1 block w-full rounded-md border-b bg-secondary/20 px-6 py-3 font-medium text-black-4"
                  href="#services"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Pages
                </a>
              </li>
              <li>
                <a
                  className="my-1 block w-full rounded-md border-b bg-secondary/20 px-6 py-3 font-medium text-black-4"
                  href="#pricing"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Pricing
                </a>
              </li>
              <li>
                <a
                  className="my-1 block w-full rounded-md border-b bg-secondary/20 px-6 py-3 font-medium text-black-4"
                  href="#loan"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Loan
                </a>
              </li>
              <li>
                <a
                  className="my-1 block w-full rounded-md border-b bg-secondary/20 px-6 py-3 font-medium text-black-4"
                  href="#team"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Team
                </a>
              </li>
              <li>
                <a
                  className="my-1 block w-full rounded-md border-b bg-secondary/20 px-6 py-3 font-medium text-black-4"
                  href="#faq"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  FAQ
                </a>
              </li>
              <li>
                <a
                  className="my-1 block w-full rounded-md border-b bg-secondary/20 px-6 py-3 font-medium text-black-4"
                  href="#blog"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Blog
                </a>
              </li>
              <li>
                <a
                  className="my-1 block w-full rounded-md border-b bg-secondary/20 px-6 py-3 font-medium text-black-4"
                  href="#contact"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Contact
                </a>
              </li>
              <li className="pt-4 flex flex-col gap-3">
                <Link
                  className="w-full text-center py-2.5 rounded-md border border-primary text-primary font-medium hover:bg-primary hover:text-white-1"
                  to="/"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Login
                </Link>
                <Link
                  className="w-full text-center py-2.5 rounded-md bg-accent-3 text-black-4 font-semibold hover:bg-accent-3/90"
                  style={{ backgroundColor: "#ffce32", color: "#111111" }}
                  to="/usertype"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Get Started
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
'''

# 2. HeroSection.jsx
hero_code = '''import React from "react";
import { Link } from "react-router-dom";

const HeroSection = () => {
  return (
    <section
      id="hero"
      className="hero-banner fade-wrapper relative overflow-hidden bg-primary bg-no-repeat object-cover pt-[108px] md:mx-5 md:my-5 xl:rounded-xl xl:[clip-path:polygon(70%_0,100%_0,100%_60%,100%_100%,0%_100%,0_8%,67%_8%)] xxl:mx-6"
      style={{ backgroundColor: "#005655" }}
    >
      <div className="container relative pt-20 text-white-1 sm:pt-25">
        <div className="grid grid-cols-12">
          <div className="max-md:spt60px max-4xl:spb120px col-start-1 col-end-13 md:col-end-7 xxl:col-end-6">
            <h5 className="h5 title-animation font-medium capitalize text-white-1">
              SAVE &amp; MANAGE YOUR MONEY
            </h5>
            <h1 className="d2 title-animation mt-3 font-medium text-white-1 leading-tight">
              Banking Solutions for Businesses
            </h1>
            <p className="xl-text smt24px fade-top text-white-4 leading-relaxed">
              Banking is the practice of accepting and safeguarding money owned and then to earn a profit.
            </p>
            <div className="smt40px flex items-center gap-5 max-xs:flex-wrap max-xs:justify-center">
              <Link
                className="spx24px l-text theme-transition-3 flex items-center gap-3 border border-accent-3 bg-transparent py-3 hover:text-black-4 font-medium hover:bg-accent-3 text-white-1 px-6 rounded transition-all duration-300"
                style={{ borderColor: "#ffce32" }}
                to="/usertype"
              >
                <span>Open Account</span>
                <svg
                  className="tabler-icon tabler-icon-arrow-up-right"
                  fill="none"
                  height="24"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  width="24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M17 7l-10 10"></path>
                  <path d="M8 7l9 0l0 9"></path>
                </svg>
              </Link>
              <Link
                className="spx24px l-text theme-transition-3 flex items-center gap-3 border border-accent-3 bg-transparent py-3 hover:text-black-4 font-medium hover:bg-accent-3 text-white-1 px-6 rounded transition-all duration-300"
                style={{ borderColor: "#ffce32" }}
                to="/usertype"
              >
                <span>Get in touch</span>
                <svg
                  className="tabler-icon tabler-icon-arrow-up-right"
                  fill="none"
                  height="24"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  width="24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M17 7l-10 10"></path>
                  <path d="M8 7l9 0l0 9"></path>
                </svg>
              </Link>
            </div>
          </div>

          <div className="fade-top col-start-1 col-end-13 max-md:row-start-1 md:col-start-7">
            <img
              alt="Banking Solutions for Businesses Banner"
              className="4xl:max-w-[unset]"
              height="669"
              src="/assets/images/babuz/banner-three-image.bdac1d43.png"
              style={{ color: "transparent" }}
              width="885"
            />
          </div>
        </div>

        {/* Floating Social Proof & Rating Badge */}
        <div className="absolute max-[1650px]:hidden -left-36 4xl:-left-[180px] top-1/2 z-10 flex -translate-y-1/2 gap-[135px] flex-col">
          <div className="flex flex-col items-center -space-y-2">
            <img
              alt="Star"
              className="animate-custom-pulse"
              height="60"
              src="/assets/images/babuz/banner-star.64effc86.png"
              style={{ color: "transparent" }}
              width="60"
            />
            <div className="rounded-full bg-white-1 p-[14px] shadow-lg">
              <svg
                className="text-secondary"
                fill="none"
                height="32"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                width="32"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M6.979 3.074a6 6 0 0 1 4.988 1.425l.037 .033l.034 -.03a6 6 0 0 1 4.733 -1.44l.246 .036a6 6 0 0 1 3.364 10.008l-.18 .185l-.048 .041l-7.45 7.379a1 1 0 0 1 -1.313 .082l-.094 -.082l-7.493 -7.422a6 6 0 0 1 3.176 -10.215z"
                  fill="currentColor"
                  strokeWidth="0"
                ></path>
              </svg>
            </div>
            <div className="flex items-center gap-1 rounded-full bg-secondary p-[9px] shadow-md">
              <span className="l-text font-medium text-white-1">4.7</span>
              <svg
                className="text-white-1"
                fill="none"
                height="16"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                width="16"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M8.243 7.34l-6.38 .925l-.113 .023a1 1 0 0 0 -.44 1.684l4.622 4.499l-1.09 6.355l-.013 .11a1 1 0 0 0 1.464 .944l5.706 -3l5.693 3l.1 .046a1 1 0 0 0 1.352 -1.1l-1.091 -6.355l4.624 -4.5l.078 -.085a1 1 0 0 0 -.633 -1.62l-6.38 -.926l-2.852 -5.78a1 1 0 0 0 -1.794 0l-2.853 5.78z"
                  fill="currentColor"
                  strokeWidth="0"
                ></path>
              </svg>
            </div>
          </div>
          <div className="flex flex-col gap-4">
            <p className="lead-text items-center justify-center text-center font-medium text-white-1">
              Active user
            </p>
            <div className="mt-3 flex flex-col items-center -space-y-2 overflow-hidden p-0.5">
              <img
                alt="Active User"
                className="inline-block h-12 w-12 rounded-full ring-2 ring-white-3"
                height="57"
                src="/assets/images/babuz/banner-user-1.81918b8a.png"
                style={{ color: "transparent" }}
                width="57"
              />
              <img
                alt="Active User"
                className="inline-block h-12 w-12 rounded-full ring-2 ring-white-3"
                height="57"
                src="/assets/images/babuz/banner-user-2.4309ff3a.png"
                style={{ color: "transparent" }}
                width="57"
              />
              <img
                alt="Active User"
                className="inline-block h-12 w-12 rounded-full ring-2 ring-white-3"
                height="57"
                src="/assets/images/babuz/banner-user-3.06a324c1.png"
                style={{ color: "transparent" }}
                width="57"
              />
            </div>
            <p className="m-text text-center font-medium text-white-4">+100 More</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
'''

# 3. AboutSection.jsx
about_code = '''import React from "react";
import { Link } from "react-router-dom";

const AboutSection = () => {
  return (
    <section id="about" className="spy120px fade-wrapper relative overflow-hidden bg-white-1">
      <div className="container relative">
        <div className="grid grid-cols-12 items-center gap-6">
          <div className="col-start-1 col-end-13 flex justify-end xl:col-end-6">
            <img
              alt="About Babuz"
              className="appear-down max-xl:mx-auto max-xl:block xxl:max-w-[unset]"
              height="574"
              src="/assets/images/babuz/about.2df54fdb.png"
              style={{ color: "transparent" }}
              width="526"
            />
          </div>
          <div className="col-start-1 col-end-13 xl:col-start-6 xxl:col-start-7">
            <div className="max-w-[416px]">
              <h5 className="h5 title-animation font-medium capitalize text-primary" style={{ color: "#005655" }}>
                ABOUT US
              </h5>
              <h3 className="d4 title-animation font-semibold h2 mt-3 text-black-4">
                Introduction to Banking
              </h3>
              <p className="m-text fade-top mt-3 text-black-1 leading-relaxed">
                This section provides an overview of what banking is and its importance in the financial system.
              </p>
            </div>
            <div className="mt-8 flex gap-6 max-sm:flex-col-reverse sm:items-center sm:gap-8 xl:mt-[55px] xl:gap-15">
              <div>
                <Link
                  className="alter-btn btn-anim group/link relative z-10 inline-flex size-[140px] shrink-0 items-center justify-center gap-4 overflow-hidden rounded-full border font-semibold border-accent-3 bg-accent-3 text-black-4 hover:border-accent-3 hover:bg-transparent hover:text-black-4 lg:size-[160px]"
                  style={{ backgroundColor: "#ffce32", borderColor: "#ffce32", color: "#111111" }}
                  to="/usertype"
                >
                  <div className="flex flex-col items-center justify-center">
                    <svg
                      className="tabler-icon tabler-icon-arrow-up-right"
                      fill="none"
                      height="40"
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                      width="40"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path d="M17 7l-10 10"></path>
                      <path d="M8 7l9 0l0 9"></path>
                    </svg>
                    <p className="capitalize">About More</p>
                  </div>
                  <span className="pointer-events-none absolute z-[-1] h-0 w-0 -translate-x-1/2 -translate-y-1/2 transform rounded-full bg-accent-3 duration-700 group-hover/link:w-[calc(100%*2.25)] group-hover/link:pt-[calc(100%*2.25)]"></span>
                </Link>
              </div>
              <div>
                <h3 className="d4 title-animation font-semibold h2 text-black-4">
                  Online and Mobile Banking
                </h3>
                <p className="m-text fade-top mt-3 text-black-1 leading-relaxed">
                  Highlights the impact of technology on the banking industry, enabling convenient digital access to financial services.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Decorative Animated Stars */}
        <img
          alt="Service star"
          className="absolute right-5 top-0 animate-custom-pulse max-md:w-20 xxl:-right-15 pointer-events-none"
          height="120"
          src="/assets/images/babuz/service-stars.aa7ae5e8.png"
          style={{ color: "transparent" }}
          width="125"
        />
      </div>
      <img
        alt="About star"
        className="absolute top-10 max-md:w-20 sm:left-18 sm:top-15 animate-custom-pulse pointer-events-none"
        height="131"
        src="/assets/images/babuz/about-star.6a9d5df8.png"
        style={{ color: "transparent" }}
        width="131"
      />
      <div className="over hidden overflow-hidden md:block pointer-events-none">
        <div className="lines">
          <div className="line absolute left-[10%] top-0 -z-10 h-full w-px bg-white-3/30"></div>
          <div className="line absolute right-[calc(100%-50%)] top-0 -z-10 h-full w-px bg-white-3/30"></div>
          <div className="line-alt absolute left-[30%] top-0 -z-10 h-full w-px bg-white-3/30"></div>
          <div className="line-alt absolute right-[calc(30%)] top-0 -z-10 h-full w-px bg-white-3/30"></div>
          <div className="line absolute right-[10%] top-0 -z-10 h-full w-px bg-white-3/30"></div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
'''

# 4. ServicesSection.jsx
services_code = '''import React from "react";
import { Link } from "react-router-dom";

const ServicesSection = () => {
  return (
    <section
      id="services"
      className="services-section spy120px fade-wrapper relative z-10 bg-primary text-white-1"
      style={{ backgroundColor: "#005655" }}
    >
      <div className="container relative grid grid-cols-12 items-center">
        <div className="col-start-1 col-end-13 lg:col-end-6">
          <h5 className="h5 title-animation font-medium capitalize text-white-1">
            SERVICES
          </h5>
          <h3 className="d4 title-animation font-semibold h2 mt-3 text-white-1">
            Our Featured Services.
          </h3>
          <p className="m-text fade-top mt-5 text-white-2 leading-relaxed">
            Integrate Babuz on your web-site to offer fast, secure and seamless online bank transfer payment method.
          </p>
          <p className="m-text fade-top mt-4 text-white-2 leading-relaxed">
            You could receive payments straight into your company bank account or open a Babuz merchant account and collect funds there.
          </p>
          <div className="spt40px flex items-center gap-6">
            <Link
              className="alter-btn btn-anim group/link relative z-10 inline-flex size-[140px] shrink-0 items-center justify-center gap-4 overflow-hidden rounded-full border border-black-3 font-semibold bg-accent-3 text-black-4 hover:border-accent-3"
              style={{ backgroundColor: "#ffce32", color: "#111111" }}
              to="/usertype"
            >
              <div className="flex flex-col items-center justify-center">
                <svg
                  className="tabler-icon tabler-icon-arrow-up-right"
                  fill="none"
                  height="40"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  width="40"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M17 7l-10 10"></path>
                  <path d="M8 7l9 0l0 9"></path>
                </svg>
                <p className="capitalize">All Services</p>
              </div>
              <span className="pointer-events-none absolute z-[-1] h-0 w-0 -translate-x-1/2 -translate-y-1/2 transform rounded-full bg-accent-3 duration-700 group-hover/link:w-[calc(100%*2.25)] group-hover/link:pt-[calc(100%*2.25)]"></span>
            </Link>

            {/* Pagination dots matching video 00:01 */}
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-accent-3" style={{ backgroundColor: "#ffce32" }}></span>
              <span className="h-3 w-3 rounded-full border border-white-1/40"></span>
              <span className="h-3 w-3 rounded-full border border-white-1/40"></span>
            </div>
          </div>
        </div>

        {/* 2 cards matching video 00:00 - 00:02 */}
        <div className="max-lg:spt40px col-start-1 col-end-13 lg:col-start-7">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Card 1 */}
            <div
              className="group theme-transition-3 relative border border-accent-3 p-8 text-white-1 hover:bg-accent-3 hover:text-black-4 rounded-lg cursor-pointer transition-all duration-300"
              style={{ backgroundColor: "#005655", borderColor: "#ffce32" }}
            >
              <svg
                className="size-10"
                fill="none"
                height="24"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                width="24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M5 7.2a2.2 2.2 0 0 1 2.2 -2.2h1a2.2 2.2 0 0 0 1.55 -.64l.7 -.7a2.2 2.2 0 0 1 3.12 0l.7 .7c.412 .41 .97 .64 1.55 .64h1a2.2 2.2 0 0 1 2.2 2.2v1c0 .58 .23 1.138 .64 1.55l.7 .7a2.2 2.2 0 0 1 0 3.12l-.7 .7a2.2 2.2 0 0 0 -.64 1.55v1a2.2 2.2 0 0 1 -2.2 2.2h-1a2.2 2.2 0 0 0 -1.55 .64l-.7 .7a2.2 2.2 0 0 1 -3.12 0l-.7 -.7a2.2 2.2 0 0 0 -1.55 -.64h-1a2.2 2.2 0 0 1 -2.2 -2.2v-1a2.2 2.2 0 0 0 -.64 -1.55l-.7 -.7a2.2 2.2 0 0 1 0 -3.12l.7 -.7a2.2 2.2 0 0 0 .64 -1.55v-1"></path>
                <path d="M9 12l2 2l4 -4"></path>
              </svg>
              <h5 className="h5 spt24px font-medium group-hover:text-black-4 text-white-1">
                Savings Account
              </h5>
              <p className="m-text mt-3 text-balance text-white-1 group-hover:text-black-2 leading-relaxed">
                Reduced Payments maintenance and processing fees. No hidden fees.
              </p>
              <Link
                className="m-text theme-transition-3 mt-10 flex items-center gap-3 font-medium group-hover:text-black-4 text-accent-3"
                style={{ color: "#ffce32" }}
                to="/usertype"
              >
                <span>Learn More</span>
                <svg
                  className="theme-transition-3 group-hover:-rotate-45"
                  fill="none"
                  height="24"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  width="24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M5 12l14 0"></path>
                  <path d="M13 18l6 -6"></path>
                  <path d="M13 6l6 6"></path>
                </svg>
              </Link>
            </div>

            {/* Card 2 */}
            <div
              className="group theme-transition-3 relative border border-accent-3 p-8 text-white-1 hover:bg-accent-3 hover:text-black-4 rounded-lg cursor-pointer transition-all duration-300"
              style={{ backgroundColor: "#005655", borderColor: "#ffce32" }}
            >
              <svg
                className="size-10"
                fill="none"
                height="24"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                width="24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M3 19a2 2 0 1 0 4 0a2 2 0 0 0 -4 0"></path>
                <path d="M19 7a2 2 0 1 0 0 -4a2 2 0 0 0 0 4z"></path>
                <path d="M11 19h5.5a3.5 3.5 0 0 0 0 -7h-8a3.5 3.5 0 0 1 0 -7h4.5"></path>
              </svg>
              <h5 className="h5 spt24px font-medium group-hover:text-black-4 text-white-1">
                Savings Account
              </h5>
              <p className="m-text mt-3 text-balance text-white-1 group-hover:text-black-2 leading-relaxed">
                Reduced Payments maintenance and processing fees. No hidden fees.
              </p>
              <Link
                className="m-text theme-transition-3 mt-10 flex items-center gap-3 font-medium group-hover:text-black-4 text-accent-3"
                style={{ color: "#ffce32" }}
                to="/usertype"
              >
                <span>Learn More</span>
                <svg
                  className="theme-transition-3 group-hover:-rotate-45"
                  fill="none"
                  height="24"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  width="24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M5 12l14 0"></path>
                  <path d="M13 18l6 -6"></path>
                  <path d="M13 6l6 6"></path>
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </div>
      <img
        alt="Service animal"
        className="absolute bottom-0 left-0 max-3xl:w-30 max-sm:hidden pointer-events-none"
        height="212"
        src="/assets/images/babuz/service-animale.b432fdbc.png"
        style={{ color: "transparent" }}
        width="220"
      />
    </section>
  );
};

export default ServicesSection;
'''

# 5. PricingSection.jsx
pricing_code = '''import React, { useState } from "react";
import { Link } from "react-router-dom";

const PricingSection = () => {
  const [billingCycle, setBillingCycle] = useState("yearly");

  return (
    <div
      id="pricing"
      className="spy120px relative z-10 bg-white-4 after:absolute after:bottom-0 after:-z-10 after:h-[35%] after:w-full after:bg-accent-3/15"
      style={{ backgroundColor: "#f5f6f8" }}
    >
      <div className="container">
        <div className="flex flex-col items-center justify-center">
          <h5 className="h5 title-animation font-medium capitalize text-primary text-center" style={{ color: "#005655" }}>
            PRICING PLAN
          </h5>
          <h3 className="d4 title-animation font-semibold mt-3 text-center text-black-4">
            Simple pricing for everyone.
          </h3>
          <p className="m-text text-black-3 mt-6 max-w-[367px] text-center leading-relaxed">
            Use customer data to build great and solid product experiences that convert.
          </p>
          <div className="mt-5 flex items-center gap-8">
            <button
              onClick={() => setBillingCycle("monthly")}
              className={`spx24px spy12px capitalize l-text theme-transition-3 border border-accent-3 !px-12 py-4 text-accent-2 font-medium rounded ${
                billingCycle === "monthly" ? "bg-accent-3 shadow-md" : "bg-transparent hover:bg-accent-3"
              }`}
              style={billingCycle === "monthly" ? { backgroundColor: "#ffce32", borderColor: "#ffce32" } : { borderColor: "#ffce32" }}
            >
              Weekly
            </button>
            <button
              onClick={() => setBillingCycle("yearly")}
              className={`spx24px spy12px capitalize l-text theme-transition-3 border border-accent-3 !px-12 py-4 text-accent-2 font-medium rounded ${
                billingCycle === "yearly" ? "bg-accent-3 shadow-md" : "bg-transparent hover:bg-accent-3"
              }`}
              style={billingCycle === "yearly" ? { backgroundColor: "#ffce32", borderColor: "#ffce32" } : { borderColor: "#ffce32" }}
            >
              Yearly
            </button>
          </div>
        </div>

        <div className="smt60px grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:gap-8">
          {/* Card 1: Simple Plan */}
          <div className="spt40px till-card spb40px theme-transition-3 relative rounded-xl shadow-lg bg-white-1">
            <div className="spl40px pr-6">
              <div className="flex items-center justify-between">
                <span className="h5 font-medium text-black-4">Simple Plan</span>
              </div>
              <div className="mt-3 flex items-end">
                <p className="d4 leading-none text-primary font-semibold" style={{ color: "#005655" }}>
                  $10
                </p>
                <p className="h6 theme-transition-4 mb-2 font-medium text-black-3">
                  /yr
                </p>
              </div>
            </div>

            <div className="spt32px spb32px smt32px spr24px spl24px mx-4 flex flex-col gap-6 rounded-xl bg-white-2 shadow-inner">
              <div className="flex items-center justify-between gap-6">
                <div className="flex items-center gap-3">
                  <svg className="tabler-icon tabler-icon-checkbox" fill="none" height="24" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M9 11l3 3l8 -8"></path>
                    <path d="M20 12v6a2 2 0 0 1 -2 2h-12a2 2 0 0 1 -2 -2v-12a2 2 0 0 1 2 -2h9"></path>
                  </svg>
                  <p className="m-text text-black-2">Minimum Investment</p>
                </div>
                <p className="h4 font-medium text-black-4">$100</p>
              </div>

              <div className="flex items-center justify-between gap-6">
                <div className="flex items-center gap-3">
                  <svg className="tabler-icon tabler-icon-checkbox" fill="none" height="24" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M9 11l3 3l8 -8"></path>
                    <path d="M20 12v6a2 2 0 0 1 -2 2h-12a2 2 0 0 1 -2 -2v-12a2 2 0 0 1 2 -2h9"></path>
                  </svg>
                  <p className="m-text text-black-2">Investment Duration</p>
                </div>
                <p className="h4 font-medium text-black-4">30D</p>
              </div>

              <div className="flex items-center justify-between gap-6">
                <div className="flex items-center gap-3">
                  <svg className="tabler-icon tabler-icon-checkbox" fill="none" height="24" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M9 11l3 3l8 -8"></path>
                    <path d="M20 12v6a2 2 0 0 1 -2 2h-12a2 2 0 0 1 -2 -2v-12a2 2 0 0 1 2 -2h9"></path>
                  </svg>
                  <p className="m-text text-black-2">Daily Returns</p>
                </div>
                <p className="h4 font-medium text-black-4">2.0%</p>
              </div>

              <div className="flex items-center justify-between gap-6">
                <div className="flex items-center gap-3">
                  <svg className="tabler-icon tabler-icon-checkbox" fill="none" height="24" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M9 11l3 3l8 -8"></path>
                    <path d="M20 12v6a2 2 0 0 1 -2 2h-12a2 2 0 0 1 -2 -2v-12a2 2 0 0 1 2 -2h9"></path>
                  </svg>
                  <p className="m-text text-black-2">Total Return</p>
                </div>
                <p className="h4 font-medium text-black-4">160%</p>
              </div>
            </div>

            <Link
              className="spx24px spy12px l-text smt40px theme-transition-3 mx-auto block w-fit bg-accent-3 capitalize hover:bg-accent-3/80 font-semibold rounded px-8 py-3 text-black-4"
              style={{ backgroundColor: "#ffce32", color: "#111111" }}
              to="/usertype"
            >
              Join Simple Plan
            </Link>

            <img
              alt="Secondary Circle"
              className="absolute right-0 top-0 max-xl:w-[80px] pointer-events-none"
              height="114"
              src="/assets/images/babuz/pricint-play-secondary-circle.e72b1072.png"
              style={{ color: "transparent" }}
              width="117"
            />
          </div>

          {/* Card 2: Growth Plan (Featured Yellow) */}
          <div
            className="spt40px till-card spb40px theme-transition-3 relative rounded-xl shadow-xl bg-accent-3"
            style={{ backgroundColor: "#ffce32" }}
          >
            <div className="spl40px pr-6">
              <div className="flex items-center justify-between">
                <span className="h5 font-medium text-black-4">Growth Plan</span>
                <span className="text-xs uppercase tracking-wider font-bold z-10 rounded-full px-3 py-1.5 bg-black-4 text-white-1">
                  Most Popular
                </span>
              </div>
              <div className="mt-3 flex items-end">
                <p className="d4 leading-none text-black-4 font-semibold">
                  $30
                </p>
                <p className="h6 theme-transition-4 mb-2 font-medium text-black-3">
                  /yr
                </p>
              </div>
            </div>

            <div className="spt32px spb32px smt32px spr24px spl24px mx-4 flex flex-col gap-6 rounded-xl bg-white-2 shadow-inner">
              <div className="flex items-center justify-between gap-6">
                <div className="flex items-center gap-3">
                  <svg className="tabler-icon tabler-icon-checkbox" fill="none" height="24" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M9 11l3 3l8 -8"></path>
                    <path d="M20 12v6a2 2 0 0 1 -2 2h-12a2 2 0 0 1 -2 -2v-12a2 2 0 0 1 2 -2h9"></path>
                  </svg>
                  <p className="m-text text-black-2">Minimum Investment</p>
                </div>
                <p className="h4 font-medium text-black-4">$500</p>
              </div>

              <div className="flex items-center justify-between gap-6">
                <div className="flex items-center gap-3">
                  <svg className="tabler-icon tabler-icon-checkbox" fill="none" height="24" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M9 11l3 3l8 -8"></path>
                    <path d="M20 12v6a2 2 0 0 1 -2 2h-12a2 2 0 0 1 -2 -2v-12a2 2 0 0 1 2 -2h9"></path>
                  </svg>
                  <p className="m-text text-black-2">Investment Duration</p>
                </div>
                <p className="h4 font-medium text-black-4">60D</p>
              </div>

              <div className="flex items-center justify-between gap-6">
                <div className="flex items-center gap-3">
                  <svg className="tabler-icon tabler-icon-checkbox" fill="none" height="24" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M9 11l3 3l8 -8"></path>
                    <path d="M20 12v6a2 2 0 0 1 -2 2h-12a2 2 0 0 1 -2 -2v-12a2 2 0 0 1 2 -2h9"></path>
                  </svg>
                  <p className="m-text text-black-2">Daily Returns</p>
                </div>
                <p className="h4 font-medium text-black-4">2.5%</p>
              </div>

              <div className="flex items-center justify-between gap-6">
                <div className="flex items-center gap-3">
                  <svg className="tabler-icon tabler-icon-checkbox" fill="none" height="24" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M9 11l3 3l8 -8"></path>
                    <path d="M20 12v6a2 2 0 0 1 -2 2h-12a2 2 0 0 1 -2 -2v-12a2 2 0 0 1 2 -2h9"></path>
                  </svg>
                  <p className="m-text text-black-2">Total Return</p>
                </div>
                <p className="h4 font-medium text-black-4">230%</p>
              </div>
            </div>

            <Link
              className="spx24px spy12px l-text smt40px theme-transition-3 mx-auto block w-fit bg-black-4 text-white-1 capitalize hover:bg-black-4/90 font-semibold rounded px-8 py-3"
              style={{ backgroundColor: "#111111", color: "#ffffff" }}
              to="/usertype"
            >
              Join Standard Plan
            </Link>
          </div>

          {/* Card 3: Premium Plan */}
          <div className="spt40px till-card spb40px theme-transition-3 relative rounded-xl shadow-lg bg-white-1">
            <div className="spl40px pr-6">
              <div className="flex items-center justify-between">
                <span className="h5 font-medium text-black-4">Premium Plan</span>
              </div>
              <div className="mt-3 flex items-end">
                <p className="d4 leading-none text-primary font-semibold" style={{ color: "#005655" }}>
                  $75
                </p>
                <p className="h6 theme-transition-4 mb-2 font-medium text-black-3">
                  /yr
                </p>
              </div>
            </div>

            <div className="spt32px spb32px smt32px spr24px spl24px mx-4 flex flex-col gap-6 rounded-xl bg-white-2 shadow-inner">
              <div className="flex items-center justify-between gap-6">
                <div className="flex items-center gap-3">
                  <svg className="tabler-icon tabler-icon-checkbox" fill="none" height="24" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M9 11l3 3l8 -8"></path>
                    <path d="M20 12v6a2 2 0 0 1 -2 2h-12a2 2 0 0 1 -2 -2v-12a2 2 0 0 1 2 -2h9"></path>
                  </svg>
                  <p className="m-text text-black-2">Minimum Investment</p>
                </div>
                <p className="h4 font-medium text-black-4">$1000</p>
              </div>

              <div className="flex items-center justify-between gap-6">
                <div className="flex items-center gap-3">
                  <svg className="tabler-icon tabler-icon-checkbox" fill="none" height="24" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M9 11l3 3l8 -8"></path>
                    <path d="M20 12v6a2 2 0 0 1 -2 2h-12a2 2 0 0 1 -2 -2v-12a2 2 0 0 1 2 -2h9"></path>
                  </svg>
                  <p className="m-text text-black-2">Investment Duration</p>
                </div>
                <p className="h4 font-medium text-black-4">90D</p>
              </div>

              <div className="flex items-center justify-between gap-6">
                <div className="flex items-center gap-3">
                  <svg className="tabler-icon tabler-icon-checkbox" fill="none" height="24" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M9 11l3 3l8 -8"></path>
                    <path d="M20 12v6a2 2 0 0 1 -2 2h-12a2 2 0 0 1 -2 -2v-12a2 2 0 0 1 2 -2h9"></path>
                  </svg>
                  <p className="m-text text-black-2">Daily Returns</p>
                </div>
                <p className="h4 font-medium text-black-4">3.0%</p>
              </div>

              <div className="flex items-center justify-between gap-6">
                <div className="flex items-center gap-3">
                  <svg className="tabler-icon tabler-icon-checkbox" fill="none" height="24" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M9 11l3 3l8 -8"></path>
                    <path d="M20 12v6a2 2 0 0 1 -2 2h-12a2 2 0 0 1 -2 -2v-12a2 2 0 0 1 2 -2h9"></path>
                  </svg>
                  <p className="m-text text-black-2">Total Return</p>
                </div>
                <p className="h4 font-medium text-black-4">475%</p>
              </div>
            </div>

            <Link
              className="spx24px spy12px l-text smt40px theme-transition-3 mx-auto block w-fit bg-accent-3 capitalize hover:bg-accent-3/80 font-semibold rounded px-8 py-3 text-black-4"
              style={{ backgroundColor: "#ffce32", color: "#111111" }}
              to="/usertype"
            >
              Join Premium Plan
            </Link>

            <img
              alt="Primary Circle"
              className="absolute right-0 top-0 max-xl:w-[80px] pointer-events-none"
              height="114"
              src="/assets/images/babuz/pricint-play-primary-circle.9ca4c2b9.png"
              style={{ color: "transparent" }}
              width="117"
            />
          </div>
        </div>
      </div>

      <img
        alt="Pricing Plan Vector"
        className="absolute right-[2%] top-10 max-lg:w-[150px] md:max-lg:top-15 lg:right-[10%] lg:top-[78px] pointer-events-none"
        height="97"
        src="/assets/images/babuz/pricing-plan-vector.4d72d1a1.png"
        style={{ color: "transparent" }}
        width="202"
      />
    </div>
  );
};

export default PricingSection;
'''

# 6. LoanMasterySection.jsx
loan_code = '''import React from "react";
import { Link } from "react-router-dom";

const LoanMasterySection = () => {
  return (
    <section
      id="loan"
      className="banner relative z-10 overflow-hidden bg-secondary/5 text-white-1 after:bottom-0 after:right-0 after:-z-10 after:h-full after:w-1/2 after:bg-secondary lg:after:absolute"
    >
      <div className="max-lg:spy120px container relative grid grid-cols-12 items-center">
        {/* Left Side: 4 light cards in 2x2 grid */}
        <div className="col-start-1 col-end-13 grid max-lg:gap-3 xs:grid-cols-2 lg:col-end-7">
          {/* Card 1 */}
          <div className="spx40px group theme-transition-3 relative bg-secondary/20 py-10 text-black-4 hover:bg-accent-3 sm:py-15 xxl:pb-[105px] xxl:pt-15 cursor-pointer rounded-lg">
            <svg className="size-10" fill="none" height="24" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg">
              <path d="M3 4l18 0"></path>
              <path d="M4 4v10a2 2 0 0 0 2 2h12a2 2 0 0 0 2 -2v-10"></path>
              <path d="M12 16l0 4"></path>
              <path d="M9 20l6 0"></path>
              <path d="M8 12l3 -3l2 2l3 -3"></path>
            </svg>
            <h5 className="h5 spt24px font-medium text-black-4">Boost your Payments</h5>
            <p className="m-text text-black-3 mt-3 text-balance leading-relaxed">
              Reduced Payments maintenance and processing fees. No hidden fees.
            </p>
            <div className="rounded-16px theme-transition-4 flex w-full items-center justify-center opacity-0 group-hover:visible group-hover:opacity-100">
              <Link className="absolute right-5 top-5 z-10 cursor-pointer rounded-full bg-primary p-3" style={{ backgroundColor: "#005655" }} to="/usertype">
                <svg className="size-10 text-white-1" fill="none" height="24" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M17 7l-10 10"></path>
                  <path d="M8 7l9 0l0 9"></path>
                </svg>
              </Link>
            </div>
          </div>

          {/* Card 2 */}
          <div className="spx40px group theme-transition-3 relative bg-secondary/20 py-10 text-black-4 hover:bg-accent-3 sm:py-15 xxl:pb-[105px] xxl:pt-15 cursor-pointer rounded-lg">
            <svg className="size-10" fill="none" height="24" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg">
              <path d="M9 7m-4 0a4 4 0 1 0 8 0a4 4 0 1 0 -8 0"></path>
              <path d="M3 21v-2a4 4 0 0 1 4 -4h4a4 4 0 0 1 4 4v2"></path>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
              <path d="M21 21v-2a4 4 0 0 0 -3 -3.85"></path>
            </svg>
            <h5 className="h5 spt24px font-medium text-black-4">Agent Banking</h5>
            <p className="m-text text-black-3 mt-3 text-balance leading-relaxed">
              Stay updated: check your bank account to manage funds and track transactions securely.
            </p>
            <div className="rounded-16px theme-transition-4 flex w-full items-center justify-center opacity-0 group-hover:visible group-hover:opacity-100">
              <Link className="absolute right-5 top-5 z-10 cursor-pointer rounded-full bg-primary p-3" style={{ backgroundColor: "#005655" }} to="/usertype">
                <svg className="size-10 text-white-1" fill="none" height="24" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M17 7l-10 10"></path>
                  <path d="M8 7l9 0l0 9"></path>
                </svg>
              </Link>
            </div>
          </div>

          {/* Card 3 */}
          <div className="spx40px group theme-transition-3 relative bg-secondary/20 py-10 text-black-4 hover:bg-accent-3 sm:py-15 xxl:pb-[105px] xxl:pt-15 cursor-pointer rounded-lg">
            <svg className="size-10" fill="none" height="24" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg">
              <path d="M5 7.2a2.2 2.2 0 0 1 2.2 -2.2h1a2.2 2.2 0 0 0 1.55 -.64l.7 -.7a2.2 2.2 0 0 1 3.12 0l.7 .7c.412 .41 .97 .64 1.55 .64h1a2.2 2.2 0 0 1 2.2 2.2v1c0 .58 .23 1.138 .64 1.55l.7 .7a2.2 2.2 0 0 1 0 3.12l-.7 .7a2.2 2.2 0 0 0 -.64 1.55v1a2.2 2.2 0 0 1 -2.2 2.2h-1a2.2 2.2 0 0 0 -1.55 .64l-.7 .7a2.2 2.2 0 0 1 -3.12 0l-.7 -.7a2.2 2.2 0 0 0 -1.55 -.64h-1a2.2 2.2 0 0 1 -2.2 -2.2v-1a2.2 2.2 0 0 0 -.64 -1.55l-.7 -.7a2.2 2.2 0 0 1 0 -3.12l.7 -.7a2.2 2.2 0 0 0 .64 -1.55v-1"></path>
              <path d="M9 12l2 2l4 -4"></path>
            </svg>
            <h5 className="h5 spt24px font-medium text-black-4">Savings Account</h5>
            <p className="m-text text-black-3 mt-3 text-balance leading-relaxed">
              Reduced Payments maintenance and processing fees. No hidden fees.
            </p>
            <div className="rounded-16px theme-transition-4 flex w-full items-center justify-center opacity-0 group-hover:visible group-hover:opacity-100">
              <Link className="absolute right-5 top-5 z-10 cursor-pointer rounded-full bg-primary p-3" style={{ backgroundColor: "#005655" }} to="/usertype">
                <svg className="size-10 text-white-1" fill="none" height="24" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M17 7l-10 10"></path>
                  <path d="M8 7l9 0l0 9"></path>
                </svg>
              </Link>
            </div>
          </div>

          {/* Card 4 */}
          <div className="spx40px group theme-transition-3 relative bg-secondary/20 py-10 text-black-4 hover:bg-accent-3 sm:py-15 xxl:pb-[105px] xxl:pt-15 cursor-pointer rounded-lg">
            <svg className="size-10" fill="none" height="24" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg">
              <path d="M3 19a2 2 0 1 0 4 0a2 2 0 0 0 -4 0"></path>
              <path d="M19 7a2 2 0 1 0 0 -4a2 2 0 0 0 0 4z"></path>
              <path d="M11 19h5.5a3.5 3.5 0 0 0 0 -7h-8a3.5 3.5 0 0 1 0 -7h4.5"></path>
            </svg>
            <h5 className="h5 spt24px font-medium text-black-4">Pay Out &amp; Refund</h5>
            <p className="m-text text-black-3 mt-3 text-balance leading-relaxed">
              Execute pay outs and refunds straight to your customer’s bank account via BabuZ.
            </p>
            <div className="rounded-16px theme-transition-4 flex w-full items-center justify-center opacity-0 group-hover:visible group-hover:opacity-100">
              <Link className="absolute right-5 top-5 z-10 cursor-pointer rounded-full bg-primary p-3" style={{ backgroundColor: "#005655" }} to="/usertype">
                <svg className="size-10 text-white-1" fill="none" height="24" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M17 7l-10 10"></path>
                  <path d="M8 7l9 0l0 9"></path>
                </svg>
              </Link>
            </div>
          </div>
        </div>

        {/* Right Side: Royal Purple Box */}
        <div
          className="max-lg:spb40px col-start-1 col-end-13 max-lg:row-start-1 lg:col-start-7 lg:ps-20 xxl:ps-[134px] rounded-r-xl"
          style={{ position: "relative", zIndex: 10 }}
        >
          <h5 className="h5 title-animation font-medium capitalize text-black-4 lg:text-white-1">
            FINANCIAL PLANNING
          </h5>
          <h3 className="d4 title-animation font-semibold h2 mt-3 max-lg:text-black-4 text-white-1 leading-tight">
            Financial Mastery. The Right Way to Plan
          </h3>
          <p className="m-text text-black-3 mt-5 lg:text-white-2 leading-relaxed">
            Lending that doesn't weigh you down. We know how hard is it to start something new, that’s why we have the perfect plan for you.
          </p>
          <div className="spt40px">
            <Link
              className="alter-btn btn-anim group/link relative z-10 inline-flex size-[140px] shrink-0 items-center justify-center gap-4 overflow-hidden rounded-full border border-black-3 font-semibold bg-accent-3 text-black-4 hover:border-accent-3 hover:bg-transparent max-sm:w-48 sm:size-[160px] lg:size-[180px]"
              style={{ backgroundColor: "#ffce32", borderColor: "#111111", color: "#111111" }}
              to="/usertype"
            >
              <div className="flex flex-col items-center justify-center">
                <svg
                  className="tabler-icon tabler-icon-arrow-up-right"
                  fill="none"
                  height="40"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  width="40"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M17 7l-10 10"></path>
                  <path d="M8 7l9 0l0 9"></path>
                </svg>
                <p className="capitalize">Apply For A Loan</p>
              </div>
              <span className="pointer-events-none absolute z-[-1] h-0 w-0 -translate-x-1/2 -translate-y-1/2 transform rounded-full bg-accent-3 duration-700 group-hover/link:w-[calc(100%*2.25)] group-hover/link:pt-[calc(100%*2.25)]"></span>
            </Link>
          </div>
        </div>
      </div>

      {/* Decorative Assets */}
      <img
        alt="Robot illustration"
        className="banner-thumb-one absolute left-0 top-[107px] max-4xl:hidden max-3xl:w-30 max-sm:hidden pointer-events-none"
        height="251"
        src="/assets/images/babuz/robot.50761808.png"
        style={{ color: "transparent" }}
        width="278"
      />
      <img
        alt="Plan circle"
        className="absolute bottom-0 right-0 max-3xl:w-30 max-sm:hidden pointer-events-none"
        height="239"
        src="/assets/images/babuz/plan-circle.1ac1a76a.png"
        style={{ color: "transparent" }}
        width="225"
      />
      <img
        alt="Vector"
        className="absolute right-20 top-14 max-lg:hidden xxl:top-20 pointer-events-none"
        height="97"
        src="/assets/images/babuz/vector.1d672853.png"
        style={{ color: "transparent" }}
        width="202"
      />
    </section>
  );
};

export default LoanMasterySection;
'''

# 7. FaqSection.jsx (From video 00:06 - 00:12)
faq_code = '''import React, { useState } from "react";

const FaqSection = () => {
  const [openIndex, setOpenIndex] = useState(null);

  const faqsLeft = [
    {
      q: "How do I report fraudulent activity on my account?",
      a: "Contact our customer support immediately via phone or through the in-app support chat to report any unauthorized transactions."
    },
    {
      q: "Can I set up account alerts for unusual transactions?",
      a: "Yes, you can easily configure instant SMS and email notifications in your account security settings."
    },
    {
      q: "What should I do if my card is damaged?",
      a: "You can request a replacement card directly from the mobile app or web portal under card management."
    },
    {
      q: "Is there a way to dispute a transaction on my account?",
      a: "Yes, select the specific transaction in your statement and submit a dispute claim with supporting details."
    },
    {
      q: "What steps should I take if I forget my card PIN?",
      a: "You can securely reset your PIN online through two-factor authentication or visit the nearest service center."
    }
  ];

  const faqsRight = [
    {
      q: "How do I report fraudulent activity on my account?",
      a: "Contact our customer support immediately via phone or through the in-app support chat to report any unauthorized transactions."
    },
    {
      q: "Can I set up account alerts for unusual transactions?",
      a: "Yes, you can easily configure instant SMS and email notifications in your account security settings."
    },
    {
      q: "What should I do if my card is damaged?",
      a: "You can request a replacement card directly from the mobile app or web portal under card management."
    },
    {
      q: "Is there a way to dispute a transaction on my account?",
      a: "Yes, select the specific transaction in your statement and submit a dispute claim with supporting details."
    },
    {
      q: "What steps should I take if I forget my card PIN?",
      a: "You can securely reset your PIN online through two-factor authentication or visit the nearest service center."
    }
  ];

  const toggleFaq = (idx) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <div id="faq" className="spy120px relative overflow-hidden bg-white-1">
      <div className="container">
        <h5 className="h5 title-animation font-medium capitalize text-primary text-center" style={{ color: "#005655" }}>
          FAQ
        </h5>
        <h3 className="d4 title-animation font-semibold mt-3 text-center text-black-4">
          Frequently ASked Questions
        </h3>

        <div className="spt60px grid gap-6 lg:grid-cols-2">
          {/* Column 1 */}
          <div className="flex flex-col justify-between gap-5">
            {faqsLeft.map((faq, i) => {
              const isOpen = openIndex === i;
              return (
                <div
                  key={i}
                  className="rounded-16px appear-down rounded-xl p-4 shadow-custom3 sm:p-5 border border-black-1/10 bg-white-1 cursor-pointer transition-all duration-300"
                  onClick={() => toggleFaq(i)}
                >
                  <div className="rounded-16px theme-transition-3 flex items-center justify-between gap-6">
                    <h6 className="l-text font-medium text-black-4">{faq.q}</h6>
                    <div
                      className={`text-primaryColor rounded-full border-2 p-1 border-black-4 transition-transform duration-300 ${
                        isOpen ? "rotate-45 bg-accent-3 text-black-4" : "bg-transparent"
                      }`}
                      style={isOpen ? { backgroundColor: "#ffce32" } : {}}
                    >
                      <svg
                        className="tabler-icon tabler-icon-plus"
                        fill="none"
                        height="20"
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                        width="20"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path d="M12 5l0 14"></path>
                        <path d="M5 12l14 0"></path>
                      </svg>
                    </div>
                  </div>
                  {isOpen && (
                    <div className="pt-3">
                      <p className="m-text text-black-3 whitespace-pre-line leading-relaxed text-sm">
                        {faq.a}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Column 2 */}
          <div className="flex flex-col justify-between gap-5">
            {faqsRight.map((faq, i) => {
              const idx = i + 10;
              const isOpen = openIndex === idx;
              return (
                <div
                  key={idx}
                  className="rounded-16px appear-down rounded-xl p-4 shadow-custom3 sm:p-5 border border-black-1/10 bg-white-1 cursor-pointer transition-all duration-300"
                  onClick={() => toggleFaq(idx)}
                >
                  <div className="rounded-16px theme-transition-3 flex items-center justify-between gap-6">
                    <h6 className="l-text font-medium text-black-4">{faq.q}</h6>
                    <div
                      className={`text-primaryColor rounded-full border-2 p-1 border-black-4 transition-transform duration-300 ${
                        isOpen ? "rotate-45 bg-accent-3 text-black-4" : "bg-transparent"
                      }`}
                      style={isOpen ? { backgroundColor: "#ffce32" } : {}}
                    >
                      <svg
                        className="tabler-icon tabler-icon-plus"
                        fill="none"
                        height="20"
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                        width="20"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path d="M12 5l0 14"></path>
                        <path d="M5 12l14 0"></path>
                      </svg>
                    </div>
                  </div>
                  {isOpen && (
                    <div className="pt-3">
                      <p className="m-text text-black-3 whitespace-pre-line leading-relaxed text-sm">
                        {faq.a}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="over hidden overflow-hidden md:block pointer-events-none">
        <div className="lines">
          <div className="line absolute left-[10%] top-0 -z-10 h-full w-px bg-white-3/30"></div>
          <div className="line absolute right-[calc(100%-50%)] top-0 -z-10 h-full w-px bg-white-3/30"></div>
          <div className="line-alt absolute left-[30%] top-0 -z-10 h-full w-px bg-white-3/30"></div>
          <div className="line-alt absolute right-[calc(30%)] top-0 -z-10 h-full w-px bg-white-3/30"></div>
          <div className="line absolute right-[10%] top-0 -z-10 h-full w-px bg-white-3/30"></div>
        </div>
      </div>
    </div>
  );
};

export default FaqSection;
'''

# 8. TeamSection.jsx (From video 00:13 - 00:23)
team_code = '''import React, { useState } from "react";
import { Link } from "react-router-dom";

const TeamSection = () => {
  const [startIndex, setStartIndex] = useState(0);

  const teamMembers = [
    {
      name: "Amanda Jones",
      role: "Customer Support Specialist",
      image: "/assets/images/babuz/home-one-team-1.e0dadc48.png"
    },
    {
      name: "Charles S. Brown",
      role: "CEO & Founder",
      image: "/assets/images/babuz/home-one-team-2.365585d0.png"
    },
    {
      name: "Jennifer White",
      role: "COO",
      image: "/assets/images/babuz/home-one-team-3.0212e381.png"
    },
    {
      name: "Robert Johnson",
      role: "CFO",
      image: "/assets/images/babuz/home-one-team-4.c3bf5dc0.png"
    },
    {
      name: "Olivia Smith",
      role: "CTO",
      image: "/assets/images/babuz/home-one-team-5.4ac8fec8.png"
    },
    {
      name: "Eva Green",
      role: "Head of Marketing",
      image: "/assets/images/babuz/home-one-team-6.9b5e03ce.png"
    }
  ];

  const nextSlide = () => {
    setStartIndex((prev) => (prev + 1) % teamMembers.length);
  };

  const prevSlide = () => {
    setStartIndex((prev) => (prev - 1 + teamMembers.length) % teamMembers.length);
  };

  const visibleMembers = [];
  for (let i = 0; i < 3; i++) {
    visibleMembers.push(teamMembers[(startIndex + i) % teamMembers.length]);
  }

  return (
    <section id="team" className="spy120px relative overflow-clip bg-white-4" style={{ backgroundColor: "#f5f6f8" }}>
      <div className="container flex justify-between gap-5 max-sm:flex-col sm:items-center sm:gap-6">
        <div>
          <h5 className="h5 title-animation font-medium capitalize text-primary" style={{ color: "#005655" }}>
            OUR TEAM
          </h5>
          <h3 className="d4 title-animation font-semibold mt-3 max-w-[703px] text-black-4">
            We are Business Consulting Professionals
          </h3>
        </div>
        <Link
          className="alter-btn btn-anim group/link relative z-10 inline-flex size-[140px] shrink-0 items-center justify-center gap-4 overflow-hidden rounded-full border border-black-3 bg-inherit font-semibold text-black-4 hover:border-accent-3"
          to="/usertype"
        >
          <div className="flex flex-col items-center justify-center">
            <svg
              className="tabler-icon tabler-icon-arrow-up-right"
              fill="none"
              height="40"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              width="40"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M17 7l-10 10"></path>
              <path d="M8 7l9 0l0 9"></path>
            </svg>
            <p className="capitalize">Explore Now</p>
          </div>
          <span className="pointer-events-none absolute z-[-1] h-0 w-0 -translate-x-1/2 -translate-y-1/2 transform rounded-full bg-accent-3 duration-700 group-hover/link:w-[calc(100%*2.25)] group-hover/link:pt-[calc(100%*2.25)]"></span>
        </Link>
      </div>

      <div className="relative max-xl:container xl:ml-[calc((100%-1296px)/2)]">
        <div className="smt60px">
          {/* Exactly 3 cards matching video */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 pr-4">
            {visibleMembers.map((member, idx) => (
              <div key={idx} className="transition-all duration-300">
                <div
                  className="team-card-box group relative bg-primary overflow-hidden rounded-xl shadow-lg"
                  style={{ backgroundColor: "#005655" }}
                >
                  <img
                    alt={member.name}
                    className="spx32px spt40px mx-auto block h-[420px] w-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
                    height="497"
                    src={member.image}
                    style={{ color: "transparent" }}
                    width="352"
                  />
                  <div className="theme-transition-4 absolute bottom-4 right-4 z-20 w-fit rounded-full">
                    <div className="rounded-full p-1.5 shadow-md" style={{ backgroundColor: "#005655" }}>
                      <div
                        className="w-fit p-2.5 rounded-full cursor-pointer hover:bg-white-1 transition-colors"
                        style={{ backgroundColor: "#ffce32" }}
                      >
                        <svg
                          className="tabler-icon tabler-icon-plus"
                          fill="none"
                          height="18"
                          stroke="currentColor"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2.5"
                          viewBox="0 0 24 24"
                          width="18"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path d="M12 5l0 14"></path>
                          <path d="M5 12l14 0"></path>
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="mt-4 text-center">
                  <h4 className="h4 font-bold text-black-4">{member.name}</h4>
                  <p className="m-text text-black-3 mt-1 font-medium text-sm">{member.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <div className="flex items-center gap-4 smt60px mx-auto w-fit">
            <button
              onClick={prevSlide}
              className="customerSliderPrev theme-transition-3 flex items-center justify-center rounded-full border border-primary bg-transparent p-4 font-semibold text-primary hover:bg-primary hover:text-white-1 shadow-sm"
              style={{ borderColor: "#005655", color: "#005655" }}
              title="Previous Member"
            >
              <svg
                className="tabler-icon tabler-icon-arrow-left"
                fill="none"
                height="24"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                width="24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M5 12l14 0"></path>
                <path d="M5 12l6 6"></path>
                <path d="M5 12l6 -6"></path>
              </svg>
            </button>
            <button
              onClick={nextSlide}
              className="customerSliderNext theme-transition-3 flex items-center justify-center rounded-full border border-primary bg-transparent p-4 font-semibold text-primary hover:bg-primary hover:text-white-1 shadow-sm"
              style={{ borderColor: "#005655", color: "#005655" }}
              title="Next Member"
            >
              <svg
                className="tabler-icon tabler-icon-arrow-right"
                fill="none"
                height="24"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                width="24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M5 12l14 0"></path>
                <path d="M13 18l6 -6"></path>
                <path d="M13 6l6 6"></path>
              </svg>
            </button>
          </div>
        </div>
      </div>

      <img
        alt="Team Vector"
        className="left-5 top-5 max-3xl:size-20 max-md:hidden md:absolute 4xl:left-20 4xl:top-25 pointer-events-none"
        height="154"
        src="/assets/images/babuz/home-one-theam-vector.3446f28c.png"
        style={{ color: "transparent" }}
        width="146"
      />
      <img
        alt="Team circle"
        className="absolute bottom-0 left-0 max-sm:size-14 sm:max-md:size-20 md:max-lg:size-30 lg:max-xxl:size-40 pointer-events-none"
        height="252"
        src="/assets/images/babuz/team-circle.10a979ad.png"
        style={{ color: "transparent" }}
        width="249"
      />
    </section>
  );
};

export default TeamSection;
'''

# 9. TestimonialsSection.jsx (From video 00:24 - 00:30 & 01:12 - 01:14)
testi_code = '''import React, { useState } from "react";

const TestimonialsSection = () => {
  const [activeIndex, setActiveIndex] = useState(0);

  const testimonials = [
    {
      quote: "Bankio has made managing my finances so much easier. The user-friendly interface and excellent customer support make it the perfect choice for individuals and businesses alike.",
      name: "Andrew Russel",
      role: "VP of Marketing",
      image: "/assets/images/babuz/home-one-testimonial-1.912f25d0.png"
    },
    {
      quote: "The seamless integration and automated processes have saved us countless hours every single week. Highly recommended for modern growing enterprises.",
      name: "Emily Thompson",
      role: "Freelance Designer",
      image: "/assets/images/babuz/home-one-testimonial-2.a7bcae8b.png"
    },
    {
      quote: "I switched to Bankio for my personal and business banking needs, and I couldn't be happier. The app is intuitive, and I love the convenience it offers.",
      name: "John Davis",
      role: "Entrepreneur",
      image: "/assets/images/babuz/home-one-testimonial-3.053c370b.png"
    }
  ];

  const nextTestimonial = () => {
    setActiveIndex((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setActiveIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  const current = testimonials[activeIndex];

  return (
    <div id="testimonial" className="spy120px relative bg-white-1">
      <div className="container relative">
        <h5 className="h5 title-animation font-medium capitalize text-primary text-center" style={{ color: "#005655" }}>
          TESTIMONIALS
        </h5>
        <h3 className="d4 title-animation h2 mt-3 text-center font-semibold text-black-4">
          What people say
        </h3>

        <div className="smt60px mx-auto w-fit rounded-full p-[18px]" style={{ backgroundColor: "rgba(0, 86, 85, 0.1)" }}>
          <span className="text-primary font-bold text-2xl leading-none select-none" style={{ color: "#005655" }}>
            99
          </span>
        </div>

        <div className="spt60px max-w-[750px] mx-auto text-center transition-opacity duration-300">
          <div className="mx-auto flex w-fit items-center gap-1 justify-center">
            {[...Array(5)].map((_, i) => (
              <svg
                key={i}
                className="text-accent-3 fill-accent-3"
                style={{ color: "#ffce32", fill: "#ffce32" }}
                height="22"
                viewBox="0 0 24 24"
                width="22"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"></path>
              </svg>
            ))}
          </div>

          <p className="xl-text shrink-0 text-black-1 max-w-[620px] mt-6 mx-auto italic leading-relaxed">
            "{current.quote}"
          </p>

          <div className="relative shrink-0 spt40px flex justify-center">
            <img
              alt={current.name}
              className="rounded-full shadow-md object-cover size-16 ring-2 ring-accent-3/50"
              height="64"
              src={current.image}
              style={{ color: "transparent" }}
              width="64"
            />
          </div>

          <div>
            <p className="h4 font-bold spt32px text-black-4">{current.name}</p>
            <p className="m-text mt-1 font-medium text-black-3">{current.role}</p>
          </div>
        </div>

        {/* Navigation Arrows */}
        <div className="max-lg:smt40px z-10 mx-auto flex w-fit items-center gap-4 max-lg:bottom-0 sm:gap-6 lg:absolute lg:top-1/2 lg:w-full lg:justify-between px-4">
          <button
            onClick={prevTestimonial}
            className="customerSliderPrev theme-transition-3 flex items-center justify-center rounded-full border border-primary bg-transparent p-3 font-semibold text-primary hover:bg-primary hover:text-white-1 shadow-sm"
            style={{ borderColor: "#005655", color: "#005655" }}
            title="Previous Testimonial"
          >
            <svg
              className="tabler-icon tabler-icon-arrow-left"
              fill="none"
              height="24"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              width="24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M5 12l14 0"></path>
              <path d="M5 12l6 6"></path>
              <path d="M5 12l6 -6"></path>
            </svg>
          </button>
          <button
            onClick={nextTestimonial}
            className="customerSliderNext theme-transition-3 flex items-center justify-center rounded-full border border-primary bg-transparent p-3 font-semibold text-primary hover:bg-primary hover:text-white-1 shadow-sm"
            style={{ borderColor: "#005655", color: "#005655" }}
            title="Next Testimonial"
          >
            <svg
              className="tabler-icon tabler-icon-arrow-right"
              fill="none"
              height="24"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              width="24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M5 12l14 0"></path>
              <path d="M13 18l6 -6"></path>
              <path d="M13 6l6 6"></path>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default TestimonialsSection;
'''

# 10. CounterSection.jsx (From video 00:31 - 00:41)
counter_code = '''import React from "react";

const CounterSection = () => {
  return (
    <section className="spy120px bg-white-4 border-y border-black-1/5" style={{ backgroundColor: "#f5f6f8" }}>
      <div className="container flex flex-wrap items-center justify-center gap-10 max-sm:text-center sm:justify-between">
        <div className="info-card fade-top text-center sm:text-left">
          <div className="text-outline d2 theme-transition-3 font-medium text-4xl sm:text-5xl lg:text-6xl text-primary" style={{ color: "#005655" }}>
            <span>120</span> +
          </div>
          <p className="xl-text mt-4 text-black-3 font-medium">Partner with us</p>
        </div>
        <div className="info-card fade-top text-center sm:text-left">
          <div className="text-outline d2 theme-transition-3 font-medium text-4xl sm:text-5xl lg:text-6xl text-primary" style={{ color: "#005655" }}>
            $<span>1.3</span>+
          </div>
          <p className="xl-text mt-4 text-black-3 font-medium">Cumulative trading volume</p>
        </div>
        <div className="info-card fade-top text-center sm:text-left">
          <div className="text-outline d2 theme-transition-3 font-medium text-4xl sm:text-5xl lg:text-6xl text-primary" style={{ color: "#005655" }}>
            <span>705</span>K+
          </div>
          <p className="xl-text mt-4 text-black-3 font-medium">Successful Projects</p>
        </div>
        <div className="info-card fade-top text-center sm:text-left">
          <div className="text-outline d2 theme-transition-3 font-medium text-4xl sm:text-5xl lg:text-6xl text-primary" style={{ color: "#005655" }}>
            <span>575</span>K
          </div>
          <p className="xl-text mt-4 text-black-3 font-medium">Active Banking Accounts</p>
        </div>
      </div>
    </section>
  );
};

export default CounterSection;
'''

# 11. BlogSection.jsx (From video 00:42 - 00:45)
blog_code = '''import React from "react";
import { Link } from "react-router-dom";

const BlogSection = () => {
  return (
    <section id="blog" className="spy120px fade-wrapper relative overflow-hidden bg-white-1">
      <div className="container">
        <div className="flex justify-between gap-4 max-md:flex-col md:items-center md:gap-6">
          <div>
            <h5 className="h5 title-animation font-medium capitalize text-primary" style={{ color: "#005655" }}>
              RECENT BLOG
            </h5>
            <h3 className="d4 title-animation font-semibold mt-5 max-w-[335px] text-black-4">
              Read update Journal
            </h3>
          </div>
          <p className="m-text text-black-3 max-w-[306px] text-balance leading-relaxed">
            Read our blog and try to see passion lies in making everything accessible and aesthetic for everyone.
          </p>
        </div>

        <div className="spt60px grid items-center gap-6 xl:grid-cols-2">
          {/* Card 1 */}
          <div className="till-card relative justify-center gap-6 max-xl:flex max-xl:items-center max-md:flex-col lg:gap-10 xl:pb-15">
            <div className="w-fit overflow-hidden rounded-xl">
              <img
                alt="The future of fraud protection"
                className="reveal-img parallax-img relative inline-block transition-transform duration-500 hover:scale-105"
                height="450"
                src="/assets/images/babuz/home-one-recent-blog-1.3fab76d3.png"
                style={{ color: "transparent" }}
                width="306"
              />
            </div>
            <div className="sp24px p-6 bottom-0 left-[220px] max-w-[416px] bg-white-1 shadow-custom2 max-xl:h-fit xl:absolute rounded-xl border border-black-1/10">
              <p className="s-text text-black-3 text-xs">Latest News December 12, 2022</p>
              <Link className="h4 theme-transition-3 mt-3 block font-medium hover:text-primary text-black-4" to="/usertype">
                The future of fraud protection.
              </Link>
              <p className="m-text text-black-3 mt-4 text-sm leading-relaxed">
                Morbi eget venenatis lorem, id viverra massa. Etiam congue efficitur velit vel pharetra.
              </p>
              <div className="h-px w-full bg-white-3/60 mt-4 mb-4"></div>
              <Link
                className="m-text theme-transition-3 flex items-center gap-2 font-medium hover:text-primary text-primary"
                style={{ color: "#005655" }}
                to="/usertype"
              >
                <span>Read More</span>
                <svg
                  className="tabler-icon tabler-icon-arrow-up-right"
                  fill="none"
                  height="20"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  width="20"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M17 7l-10 10"></path>
                  <path d="M8 7l9 0l0 9"></path>
                </svg>
              </Link>
            </div>
          </div>

          {/* Card 2 */}
          <div className="till-card relative justify-center gap-6 max-xl:flex max-xl:items-center max-md:flex-col lg:gap-10 xl:pb-15">
            <div className="w-fit overflow-hidden rounded-xl">
              <img
                alt="Digital Banking Services"
                className="reveal-img parallax-img relative inline-block transition-transform duration-500 hover:scale-105"
                height="450"
                src="/assets/images/babuz/home-one-recent-blog-2.7ec13838.png"
                style={{ color: "transparent" }}
                width="306"
              />
            </div>
            <div className="sp24px p-6 bottom-0 left-[220px] max-w-[416px] bg-white-1 shadow-custom2 max-xl:h-fit xl:absolute rounded-xl border border-black-1/10">
              <p className="s-text text-black-3 text-xs">Latest News December 12, 2022</p>
              <Link className="h4 theme-transition-3 mt-3 block font-medium hover:text-primary text-black-4" to="/usertype">
                Digital Banking Services
              </Link>
              <p className="m-text text-black-3 mt-4 text-sm leading-relaxed">
                Morbi eget venenatis lorem, id viverra massa. Etiam congue efficitur velit vel pharetra.
              </p>
              <div className="h-px w-full bg-white-3/60 mt-4 mb-4"></div>
              <Link
                className="m-text theme-transition-3 flex items-center gap-2 font-medium hover:text-primary text-primary"
                style={{ color: "#005655" }}
                to="/usertype"
              >
                <span>Read More</span>
                <svg
                  className="tabler-icon tabler-icon-arrow-up-right"
                  fill="none"
                  height="20"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  width="20"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M17 7l-10 10"></path>
                  <path d="M8 7l9 0l0 9"></path>
                </svg>
              </Link>
            </div>
          </div>
        </div>

        <div className="spt60px flex items-center justify-center">
          <Link
            className="alter-btn btn-anim group/link relative z-10 inline-flex size-[140px] shrink-0 items-center justify-center gap-4 overflow-hidden rounded-full border border-black-3 bg-inherit font-semibold text-black-4 hover:border-accent-3"
            to="/usertype"
          >
            <div className="flex flex-col items-center justify-center">
              <svg
                className="tabler-icon tabler-icon-arrow-up-right"
                fill="none"
                height="40"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                width="40"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M17 7l-10 10"></path>
                <path d="M8 7l9 0l0 9"></path>
              </svg>
              <p className="capitalize">All Blog</p>
            </div>
            <span className="pointer-events-none absolute z-[-1] h-0 w-0 -translate-x-1/2 -translate-y-1/2 transform rounded-full bg-accent-3 duration-700 group-hover/link:w-[calc(100%*2.25)] group-hover/link:pt-[calc(100%*2.25)]"></span>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default BlogSection;
'''

# 12. Footer.jsx (From video 01:23 - 01:33)
footer_code = '''import React from "react";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer id="contact" className="relative overflow-hidden bg-accent-2 text-white-1" style={{ backgroundColor: "#111111" }}>
      <div className="max-xxl:container xxl:ml-[calc((100%-1296px)/2)]">
        <div className="flex justify-between max-xxl:flex-col-reverse">
          <div>
            <div className="spy120px flex flex-auto gap-6 max-md:flex-col max-md:gap-8">
              {/* Brand Info */}
              <div className="flex-1 max-w-[416px]">
                <img
                  alt="Footer Logo"
                  height="80"
                  src="/assets/images/babuz/footer-logo.09cbce3b.png"
                  style={{ color: "transparent" }}
                  width="200"
                />
                <p className="m-text text-balance text-white-3 mt-4 leading-relaxed">
                  Highlights the impact of technology on the banking industry, enabling convenient digital access to financial services.
                </p>
                <div className="smt40px flex items-center gap-3">
                  <a className="theme-transition-3 rounded-xl bg-black-2 p-2.5 hover:bg-primary" href="https://facebook.com" target="_blank" rel="noreferrer">
                    <svg className="tabler-icon tabler-icon-brand-facebook" fill="none" height="20" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="20" xmlns="http://www.w3.org/2000/svg">
                      <path d="M7 10v4h3v7h4v-7h3l1 -4h-4v-2a1 1 0 0 1 1 -1h3v-4h-3a5 5 0 0 0 -5 5v2h-3"></path>
                    </svg>
                  </a>
                  <a className="theme-transition-3 rounded-xl bg-black-2 p-2.5 hover:bg-primary" href="https://twitter.com" target="_blank" rel="noreferrer">
                    <svg className="tabler-icon tabler-icon-brand-twitch" fill="none" height="20" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="20" xmlns="http://www.w3.org/2000/svg">
                      <path d="M4 5v11a1 1 0 0 0 1 1h2v4l4 -4h5.584c.266 0 .52 -.105 .707 -.293l2.415 -2.414c.187 -.188 .293 -.442 .293 -.708v-8.585a1 1 0 0 0 -1 -1h-14a1 1 0 0 0 -1 1z"></path>
                      <path d="M16 8l0 4"></path>
                      <path d="M12 8l0 4"></path>
                    </svg>
                  </a>
                  <a className="theme-transition-3 rounded-xl bg-black-2 p-2.5 hover:bg-primary" href="https://instagram.com" target="_blank" rel="noreferrer">
                    <svg className="tabler-icon tabler-icon-brand-instagram" fill="none" height="20" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="20" xmlns="http://www.w3.org/2000/svg">
                      <path d="M4 4m0 4a4 4 0 0 1 4 -4h8a4 4 0 0 1 4 4v8a4 4 0 0 1 -4 4h-8a4 4 0 0 1 -4 -4z"></path>
                      <path d="M12 12m-3 0a3 3 0 1 0 6 0a3 3 0 1 0 -6 0"></path>
                      <path d="M16.5 7.5l0 .01"></path>
                    </svg>
                  </a>
                  <a className="theme-transition-3 rounded-xl bg-black-2 p-2.5 hover:bg-primary" href="https://discord.com" target="_blank" rel="noreferrer">
                    <svg className="tabler-icon tabler-icon-brand-discord" fill="none" height="20" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="20" xmlns="http://www.w3.org/2000/svg">
                      <path d="M8 12a1 1 0 1 0 2 0a1 1 0 0 0 -2 0"></path>
                      <path d="M14 12a1 1 0 1 0 2 0a1 1 0 0 0 -2 0"></path>
                      <path d="M15.5 17c0 1 1.5 3 2 3c1.5 0 2.833 -1.667 3.5 -3c.667 -1.667 .5 -5.833 -1.5 -11.5c-1.457 -1.015 -3 -1.34 -4.5 -1.5l-.972 1.923a11.913 11.913 0 0 0 -4.053 0l-.975 -1.923c-1.5 .16 -3.043 .485 -4.5 1.5c-2 5.667 -2.167 9.833 -1.5 11.5c.667 1.333 2 3 3.5 3c.5 0 2 -2 2 -3"></path>
                      <path d="M7 16.5c3.5 1 6.5 1 10 0"></path>
                    </svg>
                  </a>
                  <a className="theme-transition-3 rounded-xl bg-black-2 p-2.5 hover:bg-primary" href="https://youtube.com" target="_blank" rel="noreferrer">
                    <svg className="tabler-icon tabler-icon-brand-youtube" fill="none" height="20" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="20" xmlns="http://www.w3.org/2000/svg">
                      <path d="M2 8a4 4 0 0 1 4 -4h12a4 4 0 0 1 4 4v8a4 4 0 0 1 -4 4h-12a4 4 0 0 1 -4 -4v-8z"></path>
                      <path d="M10 9l5 3l-5 3z"></path>
                    </svg>
                  </a>
                </div>
              </div>

              {/* Quick Link */}
              <div className="flex-1">
                <h5 className="h3 font-medium text-white-1">Quick Link</h5>
                <ul className="spt32px flex flex-col gap-3 md:gap-4">
                  <li><a className="m-text theme-transition-3 text-white-3 hover:tracking-wide hover:text-accent-3" href="#about">About Us</a></li>
                  <li><a className="m-text theme-transition-3 text-white-3 hover:tracking-wide hover:text-accent-3" href="#blog">Our Blog</a></li>
                  <li><a className="m-text theme-transition-3 text-white-3 hover:tracking-wide hover:text-accent-3" href="#services">Services</a></li>
                  <li><a className="m-text theme-transition-3 text-white-3 hover:tracking-wide hover:text-accent-3" href="#pricing">Our Features</a></li>
                  <li><a className="m-text theme-transition-3 text-white-3 hover:tracking-wide hover:text-accent-3" href="#contact">Contact Us</a></li>
                </ul>
              </div>

              {/* Contact Us */}
              <div className="flex-1">
                <h5 className="h3 font-medium text-white-1">Contact Us</h5>
                <p className="m-text spt32px text-white-3 leading-relaxed">
                  Valentin, Street Road 27, New<br />York. USA - 752252
                </p>
                <a className="spt24px xl-text block text-white-3 underline underline-offset-4 hover:text-accent-3" href="tel:+3567897483">
                  (303) 555-0105
                </a>
                <a className="m-text mt-3 block text-white-3 hover:text-accent-3" href="mailto:info@gmail.com">
                  info@gmail.com
                </a>
              </div>
            </div>

            {/* Copyright & Newsletter */}
            <div className="spy32px flex items-center justify-between border-t border-black-2 max-md:flex-col-reverse max-md:gap-5">
              <div className="flex items-center gap-2 max-[380px]:flex-col min-[380px]:gap-3">
                <p className="m-text text-white-1">Copyright @ 2024 BabuZ</p>
                <div className="bg-black-3 max-[380px]:h-px max-[380px]:w-20 min-[380px]:h-4 min-[380px]:w-px"></div>
                <p className="m-text text-white-3">
                  Designed By <a className="hover:text-accent-3 text-accent-3" href="/">Pixelaxis</a>
                </p>
              </div>
              <div className="me-6 flex bg-accent-1 py-1 pr-1 ps-5 min-[1500px]:w-[526px] rounded-lg">
                <input
                  className="w-full bg-inherit outline-none placeholder:text-white-3 text-white-1 text-sm"
                  placeholder="Enter Your Email"
                  type="text"
                />
                <button className="bg-black-4 p-3 rounded-md hover:bg-accent-3 hover:text-black-4 transition-colors">
                  <svg className="tabler-icon tabler-icon-send" fill="none" height="20" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="20" xmlns="http://www.w3.org/2000/svg">
                    <path d="M10 14l11 -11"></path>
                    <path d="M21 3l-6.5 18a.55 .55 0 0 1 -1 0l-3.5 -7l-7 -3.5a.55 .55 0 0 1 0 -1l18 -6.5"></path>
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {/* Right Callout Box: Have a Project in Your Mind? */}
          <div
            className="xxl:spt120px flex flex-col items-center gap-10 bg-accent-1 px-10 text-center max-xxl:justify-between max-xxl:py-8 lg:gap-15 lg:max-xxl:flex-row xxl:w-[508px] xxl:px-20 xxl:pb-8"
            style={{ backgroundColor: "#16192c" }}
          >
            <h5 className="h3 font-semibold text-white-1">Have a Project in Your Mind?</h5>
            <Link
              className="alter-btn btn-anim group/link relative z-10 inline-flex size-[140px] shrink-0 items-center justify-center gap-4 overflow-hidden rounded-full border border-black-3 bg-inherit font-semibold hover:border-accent-3 text-white-1 hover:text-black-4 lg:max-xxl:order-3 xxl:size-[170px]"
              to="/usertype"
            >
              <div className="flex flex-col items-center justify-center">
                <svg className="tabler-icon tabler-icon-arrow-up-right" fill="none" height="38" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="38" xmlns="http://www.w3.org/2000/svg">
                  <path d="M17 7l-10 10"></path>
                  <path d="M8 7l9 0l0 9"></path>
                </svg>
                <p className="capitalize text-sm font-bold">Contact Us</p>
              </div>
              <span className="pointer-events-none absolute z-[-1] h-0 w-0 -translate-x-1/2 -translate-y-1/2 transform rounded-full bg-accent-3 duration-700 group-hover/link:w-[calc(100%*2.25)] group-hover/link:pt-[calc(100%*2.25)]"></span>
            </Link>
            <div className="flex flex-col items-center">
              <p className="xl-text font-medium text-white-1">09 : 00 AM - 10 : 30 PM</p>
              <p className="m-text font-semibold text-accent-3" style={{ color: "#ffce32" }}>Saturday - Thursday</p>
            </div>
          </div>
        </div>
      </div>

      <img
        alt="Footer coin animation"
        className="absolute -left-[17%] hidden 3xl:block -top-[40%] origin-center animate-spin-slow pointer-events-none"
        height="639"
        src="/assets/images/babuz/footer-coin.c039b2a2.png"
        style={{ color: "transparent" }}
        width="641"
      />
      <img
        alt="Footer crown decoration"
        className="absolute bottom-0 left-0 block max-3xl:size-30 max-[1500px]:hidden pointer-events-none"
        height="214"
        src="/assets/images/babuz/footer-crown.2623c060.png"
        style={{ color: "transparent" }}
        width="222"
      />
    </footer>
  );
};

export default Footer;
'''

# 13. BabuzLanding.jsx master wrapper (Notice FAQ is included right between Loan and Team!)
landing_code = '''import React, { useEffect } from "react";
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
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="babuz-page relative min-h-screen">
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
'''

files_to_write = {
    "Navbar.jsx": navbar_code,
    "HeroSection.jsx": hero_code,
    "AboutSection.jsx": about_code,
    "ServicesSection.jsx": services_code,
    "PricingSection.jsx": pricing_code,
    "LoanMasterySection.jsx": loan_code,
    "FaqSection.jsx": faq_code,
    "TeamSection.jsx": team_code,
    "TestimonialsSection.jsx": testi_code,
    "CounterSection.jsx": counter_code,
    "BlogSection.jsx": blog_code,
    "Footer.jsx": footer_code,
    "BabuzLanding.jsx": landing_code,
}

for name, code in files_to_write.items():
    fpath = os.path.join(base_dir, name)
    with open(fpath, "w", encoding="utf-8") as f:
        f.write(code)
    print(f"Written: {name}")

print("All exact components matching the video recording written successfully!")
