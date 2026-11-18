# Python script to build the Oxyloans-powered Babuz components
import os

out_dir = 'src/components/pages/BabuzLanding'

# 1. Navbar.jsx
navbar_code = '''import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileSubmenu, setMobileSubmenu] = useState({
    services: false,
    loans: false,
    company: false,
  });

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

  const toggleSubmenu = (menu) => {
    setMobileSubmenu((prev) => ({
      ...prev,
      [menu]: !prev[menu],
    }));
  };

  return (
    <div className="relative w-full">
      {/* Desktop Header */}
      <div
        className={`theme-transition-3 fixed top-0 z-50 w-full transition-all duration-300 ${
          isScrolled
            ? "bg-primary/95 shadow-xl backdrop-blur-md py-2.5"
            : "bg-transparent py-4"
        }`}
      >
        <div className="transition-primary spy24px theme-transition-3 mx-auto hidden w-full items-center justify-between max-4xl:container xl:flex 4xl:max-w-[1674px] min-[1920px]:max-w-[1774px]">
          <div>
            <Link to="/home" className="flex items-center gap-2">
              <span className="text-3xl font-extrabold tracking-tight text-white-1">
                Oxy<span className="text-accent-3">Loans</span>
              </span>
              <span className="text-[10px] uppercase tracking-widest px-2 py-0.5 rounded bg-accent-3/20 text-accent-3 font-semibold border border-accent-3/40">
                RBI-P2P
              </span>
            </Link>
          </div>

          <ul className="flex items-center justify-between gap-8">
            <li>
              <Link
                className="l-text navbar-hover-text font-l-text theme-transition-3 relative z-10 flex cursor-pointer items-center justify-between gap-1 text-white-1 before:theme-transition-3 before:absolute before:bottom-0 before:block before:h-px before:w-0 before:bg-accent-3 hover:text-accent-3 hover:before:w-full font-medium"
                to="/home"
              >
                Home
              </Link>
            </li>

            <li>
              <a
                className="l-text navbar-hover-text font-l-text theme-transition-3 relative z-10 flex cursor-pointer items-center justify-between gap-1 text-white-1 before:theme-transition-3 before:absolute before:bottom-0 before:block before:h-px before:w-0 before:bg-accent-3 hover:text-accent-3 hover:before:w-full font-medium"
                href="#about"
              >
                About Us
              </a>
            </li>

            <li>
              <a
                className="l-text navbar-hover-text font-l-text theme-transition-3 relative z-10 flex cursor-pointer items-center justify-between gap-1 text-white-1 before:theme-transition-3 before:absolute before:bottom-0 before:block before:h-px before:w-0 before:bg-accent-3 hover:text-accent-3 hover:before:w-full font-medium"
                href="#services"
              >
                Services
              </a>
            </li>

            <li>
              <a
                className="l-text navbar-hover-text font-l-text theme-transition-3 relative z-10 flex cursor-pointer items-center justify-between gap-1 text-white-1 before:theme-transition-3 before:absolute before:bottom-0 before:block before:h-px before:w-0 before:bg-accent-3 hover:text-accent-3 hover:before:w-full font-medium"
                href="#pricing"
              >
                Investment Plans
              </a>
            </li>

            <li>
              <a
                className="l-text navbar-hover-text font-l-text theme-transition-3 relative z-10 flex cursor-pointer items-center justify-between gap-1 text-white-1 before:theme-transition-3 before:absolute before:bottom-0 before:block before:h-px before:w-0 before:bg-accent-3 hover:text-accent-3 hover:before:w-full font-medium"
                href="#team"
              >
                Leadership
              </a>
            </li>

            <li>
              <a
                className="l-text navbar-hover-text font-l-text theme-transition-3 relative z-10 flex cursor-pointer items-center justify-between gap-1 text-white-1 before:theme-transition-3 before:absolute before:bottom-0 before:block before:h-px before:w-0 before:bg-accent-3 hover:text-accent-3 hover:before:w-full font-medium"
                href="#faq"
              >
                FAQs
              </a>
            </li>

            <li>
              <a
                className="l-text navbar-hover-text font-l-text theme-transition-3 relative z-10 flex cursor-pointer items-center justify-between gap-1 text-white-1 before:theme-transition-3 before:absolute before:bottom-0 before:block before:h-px before:w-0 before:bg-accent-3 hover:text-accent-3 hover:before:w-full font-medium"
                href="#blog"
              >
                Knowledge Blog
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
              to="/usertype"
            >
              <span>Start Lending</span>
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
      <div className="fixed top-0 z-50 w-full xl:hidden bg-primary/95 shadow-md">
        <div className="container left-0 top-0 flex w-full items-center justify-between py-4">
          <Link to="/home" className="flex items-center gap-2">
            <span className="text-2xl font-extrabold tracking-tight text-white-1">
              Oxy<span className="text-accent-3">Loans</span>
            </span>
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
              ></span>
              <span
                className={`block h-1 w-6 rounded-full bg-accent-3 transition-opacity duration-300 ${
                  mobileMenuOpen ? "opacity-0" : ""
                }`}
              ></span>
              <span
                className={`block h-1 w-6 rounded-full bg-secondary transition-transform duration-300 ${
                  mobileMenuOpen ? "-rotate-45 -translate-y-2.5" : ""
                }`}
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
              <span className="text-xl font-extrabold tracking-tight text-white-1">
                Oxy<span className="text-accent-3">Loans</span>
              </span>
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
                <Link
                  className="my-1 block w-full rounded-md border-b bg-secondary/20 px-6 py-3 font-medium text-black-4"
                  to="/home"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Home
                </Link>
              </li>
              <li>
                <a
                  className="my-1 block w-full rounded-md border-b bg-secondary/20 px-6 py-3 font-medium text-black-4"
                  href="#about"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  About OxyLoans
                </a>
              </li>
              <li>
                <a
                  className="my-1 block w-full rounded-md border-b bg-secondary/20 px-6 py-3 font-medium text-black-4"
                  href="#services"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Our Services
                </a>
              </li>
              <li>
                <a
                  className="my-1 block w-full rounded-md border-b bg-secondary/20 px-6 py-3 font-medium text-black-4"
                  href="#pricing"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Investment Plans
                </a>
              </li>
              <li>
                <a
                  className="my-1 block w-full rounded-md border-b bg-secondary/20 px-6 py-3 font-medium text-black-4"
                  href="#team"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Leadership Team
                </a>
              </li>
              <li>
                <a
                  className="my-1 block w-full rounded-md border-b bg-secondary/20 px-6 py-3 font-medium text-black-4"
                  href="#faq"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Frequently Asked Questions
                </a>
              </li>
              <li>
                <a
                  className="my-1 block w-full rounded-md border-b bg-secondary/20 px-6 py-3 font-medium text-black-4"
                  href="#blog"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Knowledge Blog
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
                  to="/usertype"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Start Lending / Borrowing
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

with open(f'{out_dir}/Navbar.jsx', 'w', encoding='utf-8') as f:
    f.write(navbar_code)
print("Updated Navbar.jsx")
