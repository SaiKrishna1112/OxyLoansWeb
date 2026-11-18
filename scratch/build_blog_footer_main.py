# BlogSection.jsx
blog_jsx = """import React from "react";
import { Link } from "react-router-dom";

const BlogSection = () => {
  return (
    <section id="blog" className="spy120px fade-wrapper relative overflow-hidden">
      <div className="container">
        <div className="flex justify-between gap-4 max-md:flex-col md:items-center md:gap-6">
          <div>
            <h5 className="h5 title-animation font-medium capitalize text-primary">
              Recent Blog
            </h5>
            <h3 className="d4 title-animation font-semibold mt-5 max-w-[335px]">
              Read update Journal
            </h3>
          </div>
          <p className="m-text text-black-3 max-w-[306px] text-balance">
            Read our blog and try to see passion lies in making everything accessible and aesthetic for everyone.
          </p>
        </div>

        <div className="spt60px grid items-center gap-6 xl:grid-cols-2">
          {/* Blog 1 */}
          <div className="till-card relative justify-center gap-6 max-xl:flex max-xl:items-center max-md:flex-col lg:gap-10 xl:pb-15">
            <div className="w-fit overflow-hidden rounded-lg">
              <img
                alt="Blog post 1"
                className="reveal-img parallax-img relative inline-block transition-transform duration-500 hover:scale-105"
                height="450"
                src="/assets/images/babuz/home-one-recent-blog-1.3fab76d3.png"
                style={{ color: "transparent" }}
                width="306"
              />
            </div>
            <div className="sp24px bottom-0 left-[220px] max-w-[416px] bg-white-1 shadow-custom2 max-xl:h-fit xl:absolute p-6 rounded-lg">
              <p className="s-text text-black-3">Latest News December 12, 2022</p>
              <Link
                className="h4 theme-transition-3 mt-3 block font-medium hover:text-primary text-black-4"
                to="/blogs"
              >
                The future of fraud protection.
              </Link>
              <p className="m-text text-black-3 mt-4">
                Morbi eget venenatis lorem, id viverra massa. Etiam congue efficitur velit vel pharetra.
              </p>
              <div className="h-px w-full bg-white-3/60 mt-3"></div>
              <Link
                className="group theme-transition-3 mt-3 flex items-center gap-6 hover:text-primary text-black-4"
                to="/blogs"
              >
                <span className="xl-text font-medium">Read More</span>
                <span className="theme-transition-3 bg-primary p-2 text-white-1 group-hover:bg-accent-3 md:p-3 rounded-full">
                  <svg
                    className="theme-transition-3 group-hover:text-primary"
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
                </span>
              </Link>
            </div>
          </div>

          {/* Blog 2 */}
          <div className="till-card relative justify-center gap-6 max-xl:flex max-xl:items-center max-md:flex-col lg:gap-10 xl:pb-15">
            <div className="w-fit overflow-hidden rounded-lg">
              <img
                alt="Blog post 2"
                className="reveal-img parallax-img relative inline-block transition-transform duration-500 hover:scale-105"
                height="450"
                src="/assets/images/babuz/home-one-recent-blog-2.7ec13838.png"
                style={{ color: "transparent" }}
                width="306"
              />
            </div>
            <div className="sp24px bottom-0 left-[220px] max-w-[416px] bg-white-1 shadow-custom2 max-xl:h-fit xl:absolute p-6 rounded-lg">
              <p className="s-text text-black-3">Latest News December 12, 2022</p>
              <Link
                className="h4 theme-transition-3 mt-3 block font-medium hover:text-primary text-black-4"
                to="/blogs"
              >
                Digital Banking Services
              </Link>
              <p className="m-text text-black-3 mt-4">
                Morbi eget venenatis lorem, id viverra massa. Etiam congue efficitur velit vel pharetra.
              </p>
              <div className="h-px w-full bg-white-3/60 mt-3"></div>
              <Link
                className="group theme-transition-3 mt-3 flex items-center gap-6 hover:text-primary text-black-4"
                to="/blogs"
              >
                <span className="xl-text font-medium">Read More</span>
                <span className="theme-transition-3 bg-primary p-2 text-white-1 group-hover:bg-accent-3 md:p-3 rounded-full">
                  <svg
                    className="theme-transition-3 group-hover:text-primary"
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
                </span>
              </Link>
            </div>
          </div>
        </div>

        <div className="spt60px flex items-center justify-center">
          <Link
            className="alter-btn btn-anim group/link relative z-10 inline-flex size-[140px] shrink-0 items-center justify-center gap-4 overflow-hidden rounded-full border border-black-3 bg-inherit font-semibold text-black-4 hover:border-accent-3"
            to="/blogs"
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

export default BlogSection;
"""

with open('src/components/pages/BabuzLanding/BlogSection.jsx', 'w', encoding='utf-8') as f:
    f.write(blog_jsx)
print("Created BlogSection.jsx")

# Footer.jsx
footer_jsx = """import React from "react";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer id="contact" className="relative overflow-hidden bg-accent-2 text-white-1">
      <div className="max-xxl:container xxl:ml-[calc((100%-1296px)/2)]">
        <div className="flex justify-between max-xxl:flex-col-reverse">
          <div>
            <div className="spy120px flex flex-auto gap-6 max-md:flex-col max-md:gap-8">
              {/* Brand info */}
              <div className="flex-1">
                <img
                  alt="Footer Logo"
                  height="80"
                  src="/assets/images/babuz/footer-logo.09cbce3b.png"
                  style={{ color: "transparent" }}
                  width="320"
                />
                <p className="m-text text-balance text-white-3 mt-4">
                  Highlights the impact of technology on the banking industry, enabling convenient digital access to financial services.
                </p>
                <div className="smt40px flex items-center gap-3">
                  <a className="theme-transition-3 rounded-xl bg-black-2 p-2 hover:bg-primary" href="#facebook">
                    <svg className="tabler-icon tabler-icon-brand-facebook" fill="none" height="24" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg">
                      <path d="M7 10v4h3v7h4v-7h3l1 -4h-4v-2a1 1 0 0 1 1 -1h3v-4h-3a5 5 0 0 0 -5 5v2h-3"></path>
                    </svg>
                  </a>
                  <a className="theme-transition-3 rounded-xl bg-black-2 p-2 hover:bg-primary" href="#instagram">
                    <svg className="tabler-icon tabler-icon-brand-instagram" fill="none" height="24" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg">
                      <path d="M4 4m0 4a4 4 0 0 1 4 -4h8a4 4 0 0 1 4 4v8a4 4 0 0 1 -4 4h-8a4 4 0 0 1 -4 -4z"></path>
                      <path d="M12 12m-3 0a3 3 0 1 0 6 0a3 3 0 1 0 -6 0"></path>
                      <path d="M16.5 7.5l0 .01"></path>
                    </svg>
                  </a>
                  <a className="theme-transition-3 rounded-xl bg-black-2 p-2 hover:bg-primary" href="#youtube">
                    <svg className="tabler-icon tabler-icon-brand-youtube" fill="none" height="24" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg">
                      <path d="M2 8a4 4 0 0 1 4 -4h12a4 4 0 0 1 4 4v8a4 4 0 0 1 -4 4h-12a4 4 0 0 1 -4 -4v-8z"></path>
                      <path d="M10 9l5 3l-5 3z"></path>
                    </svg>
                  </a>
                </div>
              </div>

              {/* Quick Links */}
              <div className="flex-1">
                <h5 className="h3 font-medium text-white-1">Quick Link</h5>
                <ul className="spt32px flex flex-col gap-3 md:gap-4">
                  <li><a className="m-text theme-transition-3 text-white-3 hover:tracking-wide hover:text-accent-3" href="#about">About Us</a></li>
                  <li><a className="m-text theme-transition-3 text-white-3 hover:tracking-wide hover:text-accent-3" href="#blog">Our Blog</a></li>
                  <li><a className="m-text theme-transition-3 text-white-3 hover:tracking-wide hover:text-accent-3" href="#services">Services</a></li>
                  <li><a className="m-text theme-transition-3 text-white-3 hover:tracking-wide hover:text-accent-3" href="#pricing">Pricing Plan</a></li>
                  <li><a className="m-text theme-transition-3 text-white-3 hover:tracking-wide hover:text-accent-3" href="#contact">Contact Us</a></li>
                </ul>
              </div>

              {/* Contact Us */}
              <div className="flex-1">
                <h5 className="h3 font-medium text-white-1">Contact Us</h5>
                <p className="m-text spt32px text-white-3">Valentin, Street Road 27, New <br />York. USA - 752252</p>
                <a className="spt24px xl-text block text-white-3 underline underline-offset-4" href="tel:+3567897483">(303) 555-0105</a>
                <a className="m-text mt-3 block text-white-3" href="mailto:info@gmail.com">info@gmail.com</a>
              </div>
            </div>

            {/* Copyright bar */}
            <div className="spy32px flex items-center justify-between border-t border-black-2 max-md:flex-col-reverse max-md:gap-5">
              <div className="flex items-center gap-2 max-[380px]:flex-col min-[380px]:gap-3">
                <p className="m-text text-white-1">Copyright @ 2024 BabuZ</p>
                <div className="bg-black-3 max-[380px]:h-px max-[380px]:w-20 min-[380px]:h-4 min-[380px]:w-px"></div>
                <p className="m-text text-white-3">Designed By <span className="text-accent-3">Pixelaxis</span></p>
              </div>
              <div className="me-6 flex bg-accent-1 py-1 pr-1 ps-5 min-[1500px]:w-[526px] rounded-lg">
                <input
                  className="w-full bg-inherit outline-none placeholder:text-white-3 text-white-1 text-sm"
                  placeholder="Enter Your Email"
                  type="email"
                />
                <button className="bg-black-4 p-3 rounded-md hover:bg-accent-3 hover:text-black-4 transition-colors">
                  <svg className="tabler-icon tabler-icon-send" fill="none" height="24" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M10 14l11 -11"></path>
                    <path d="M21 3l-6.5 18a.55 .55 0 0 1 -1 0l-3.5 -7l-7 -3.5a.55 .55 0 0 1 0 -1l18 -6.5"></path>
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {/* Right Box: Have a project? */}
          <div className="xxl:spt120px flex flex-col items-center gap-10 bg-accent-1 px-10 text-center max-xxl:justify-between max-xxl:py-6 lg:gap-15 lg:max-xxl:flex-row xxl:w-[508px] xxl:px-25 xxl:pb-8">
            <h5 className="h3 font-semibold text-white-1">Have a Project in Your Mind?</h5>
            <Link
              className="alter-btn btn-anim group/link relative z-10 inline-flex size-[140px] shrink-0 items-center justify-center gap-4 overflow-hidden rounded-full border border-black-3 bg-inherit font-semibold hover:border-accent-3 text-white-1 hover:text-black-4 lg:max-xxl:order-3 xxl:size-[180px]"
              to="/usertype"
            >
              <div className="flex flex-col items-center justify-center">
                <svg className="tabler-icon tabler-icon-arrow-up-right" fill="none" height="40" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="40" xmlns="http://www.w3.org/2000/svg">
                  <path d="M17 7l-10 10"></path>
                  <path d="M8 7l9 0l0 9"></path>
                </svg>
                <p className="capitalize">Contact Us</p>
              </div>
              <span className="pointer-events-none absolute z-[-1] h-0 w-0 -translate-x-1/2 -translate-y-1/2 transform rounded-full bg-accent-3 duration-700 group-hover/link:w-[calc(100%*2.25)] group-hover/link:pt-[calc(100%*2.25)]"></span>
            </Link>
            <div className="flex flex-col items-center">
              <p className="xl-text font-medium text-white-1">09 : 00 AM - 10 : 30 PM</p>
              <p className="m-text font-medium text-accent-3">Saturday - Thursday</p>
            </div>
          </div>
        </div>
      </div>

      <img
        alt="footer coin"
        className="absolute -left-[17%] hidden 3xl:block -top-[40%] origin-center animate-spin-slow pointer-events-none"
        height="639"
        src="/assets/images/babuz/footer-coin.c039b2a2.png"
        style={{ color: "transparent" }}
        width="641"
      />
      <img
        alt="footer crown"
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
"""

with open('src/components/pages/BabuzLanding/Footer.jsx', 'w', encoding='utf-8') as f:
    f.write(footer_jsx)
print("Created Footer.jsx")

# ScrollToTop.jsx
scroll_jsx = """import React, { useState, useEffect } from "react";

const ScrollToTop = () => {
  const [visible, setVisible] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = docHeight > 0 ? (scrollY / docHeight) * 308.66 : 0;
      setScrollProgress(progress);

      if (scrollY > 300) {
        setVisible(true);
      } else {
        setVisible(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  };

  return (
    <button
      onClick={scrollToTop}
      className={`group/topButton theme-transition-3 fixed bottom-8 right-8 z-50 block size-10 cursor-pointer rounded-full bg-black-4 transition-all duration-300 md:!size-14 ${
        visible ? "opacity-100 visible" : "opacity-0 invisible pointer-events-none"
      }`}
      title="Go To Top"
    >
      <svg className="svg-content" height="100%" viewBox="-1 -1 102 102" width="100%">
        <path
          className="stroke-accent-3 stroke-[4px]"
          d="M50,1 a49,49 0 0,1 0,98 a49,49 0 0,1 0,-98"
          fill="none"
          stroke="#3887FE"
          strokeWidth="4"
          style={{
            strokeDasharray: "308.66px",
            strokeDashoffset: `${308.66 - scrollProgress}px`
          }}
        ></path>
      </svg>
      <svg
        className="theme-transition-3 absolute left-1/2 top-1/2 size-6 -translate-x-1/2 -translate-y-1/2 text-white-1 group-hover/topButton:text-accent-3 md:size-8"
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
        <path d="M7 11l5 -5l5 5"></path>
        <path d="M7 17l5 -5l5 5"></path>
      </svg>
    </button>
  );
};

export default ScrollToTop;
"""

with open('src/components/pages/BabuzLanding/ScrollToTop.jsx', 'w', encoding='utf-8') as f:
    f.write(scroll_jsx)
print("Created ScrollToTop.jsx")

# BabuzLanding.jsx
main_page_jsx = """import React, { useEffect } from "react";
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
    document.title = "Home Three - Banking Solutions for Businesses | Oxyloans";
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
"""

with open('src/components/pages/BabuzLanding/BabuzLanding.jsx', 'w', encoding='utf-8') as f:
    f.write(main_page_jsx)
print("Created BabuzLanding.jsx")
