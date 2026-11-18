# AboutSection.jsx
about_jsx = """import React from "react";
import { Link } from "react-router-dom";

const AboutSection = () => {
  return (
    <section id="about" className="spy120px fade-wrapper relative overflow-hidden">
      <div className="container relative">
        <div className="grid grid-cols-12 items-center gap-6">
          <div className="col-start-1 col-end-13 flex justify-end xl:col-end-6">
            <img
              alt="about section image"
              className="appear-down max-xl:mx-auto max-xl:block xxl:max-w-[unset]"
              height="574"
              src="/assets/images/babuz/about.2df54fdb.png"
              style={{ color: "transparent" }}
              width="526"
            />
          </div>
          <div className="col-start-1 col-end-13 xl:col-start-6 xxl:col-start-7">
            <div className="max-w-[416px]">
              <h5 className="h5 title-animation font-medium capitalize text-primary">
                About Us
              </h5>
              <h3 className="d4 title-animation font-semibold h2 mt-3">
                Introduction to Banking
              </h3>
              <p className="m-text fade-top mt-3 text-black-1">
                This section provides an overview of what banking is and its importance in the financial system.
              </p>
            </div>
            <div className="mt-8 flex gap-6 max-sm:flex-col-reverse sm:items-center sm:gap-8 xl:mt-[55px] xl:gap-15">
              <div>
                <Link
                  className="alter-btn btn-anim group/link relative z-10 inline-flex size-[140px] shrink-0 items-center justify-center gap-4 overflow-hidden rounded-full border font-semibold border-accent-3 bg-accent-3 text-black-4 hover:border-accent-3 hover:bg-transparent hover:text-black-4 lg:size-[160px]"
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
                <h3 className="d4 title-animation font-semibold h2">
                  Online and Mobile Banking
                </h3>
                <p className="m-text fade-top mt-3 text-black-1">
                  Highlights the impact of technology on the banking industry, enabling convenient digital access to financial services.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Decorative Stars */}
        <img
          alt="Service star"
          className="absolute right-5 top-0 animate-custom-pulse max-md:w-20 xxl:-right-15"
          height="120"
          src="/assets/images/babuz/service-stars.aa7ae5e8.png"
          style={{ color: "transparent" }}
          width="125"
        />
      </div>
      <img
        alt="About star"
        className="absolute top-10 max-md:w-20 sm:left-18 sm:top-15"
        height="131"
        src="/assets/images/babuz/about-star.6a9d5df8.png"
        style={{ color: "transparent" }}
        width="131"
      />
      <div className="over hidden overflow-hidden md:block">
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
"""

with open('src/components/pages/BabuzLanding/AboutSection.jsx', 'w', encoding='utf-8') as f:
    f.write(about_jsx)
print("Created AboutSection.jsx")

# ServicesSection.jsx
services_jsx = """import React, { useState } from "react";
import { Link } from "react-router-dom";

const ServicesSection = () => {
  const [activeSlide, setActiveSlide] = useState(0);

  const services = [
    {
      title: "Savings Account",
      desc: "Reduced Payments maintenance and processing fees. No hidden fees.",
      icon: (
        <svg className="size-10" fill="none" height="24" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg">
          <path d="M5 7.2a2.2 2.2 0 0 1 2.2 -2.2h1a2.2 2.2 0 0 0 1.55 -.64l.7 -.7a2.2 2.2 0 0 1 3.12 0l.7 .7c.412 .41 .97 .64 1.55 .64h1a2.2 2.2 0 0 1 2.2 2.2v1c0 .58 .23 1.138 .64 1.55l.7 .7a2.2 2.2 0 0 1 0 3.12l-.7 .7a2.2 2.2 0 0 0 -.64 1.55v1a2.2 2.2 0 0 1 -2.2 2.2h-1a2.2 2.2 0 0 0 -1.55 .64l-.7 .7a2.2 2.2 0 0 1 -3.12 0l-.7 -.7a2.2 2.2 0 0 0 -1.55 -.64h-1a2.2 2.2 0 0 1 -2.2 -2.2v-1a2.2 2.2 0 0 0 -.64 -1.55l-.7 -.7a2.2 2.2 0 0 1 0 -3.12l.7 -.7a2.2 2.2 0 0 0 .64 -1.55v-1"></path>
          <path d="M9 12l2 2l4 -4"></path>
        </svg>
      )
    },
    {
      title: "Pay Out & Refund",
      desc: "Execute pay outs and refunds straight to your customer’s bank account via BabuZ.",
      icon: (
        <svg className="size-10" fill="none" height="24" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg">
          <path d="M3 19a2 2 0 1 0 4 0a2 2 0 0 0 -4 0"></path>
          <path d="M19 7a2 2 0 1 0 0 -4a2 2 0 0 0 0 4z"></path>
          <path d="M11 19h5.5a3.5 3.5 0 0 0 0 -7h-8a3.5 3.5 0 0 1 0 -7h4.5"></path>
        </svg>
      )
    },
    {
      title: "Agent Banking",
      desc: "Stay updated. check your bank account to manage funds and track transactions securely.",
      icon: (
        <svg className="size-10" fill="none" height="24" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg">
          <path d="M9 7m-4 0a4 4 0 1 0 8 0a4 4 0 1 0 -8 0"></path>
          <path d="M3 21v-2a4 4 0 0 1 4 -4h4a4 4 0 0 1 4 4v2"></path>
          <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
          <path d="M21 21v-2a4 4 0 0 0 -3 -3.85"></path>
        </svg>
      )
    },
    {
      title: "Corporate Banking",
      desc: "Tailored enterprise banking solutions, bulk payouts, and customized merchant integrations.",
      icon: (
        <svg className="size-10" fill="none" height="24" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg">
          <path d="M3 21l18 0"></path>
          <path d="M5 21v-14l8 -4v18"></path>
          <path d="M19 21v-10l-6 -4"></path>
          <path d="M9 9l0 .01"></path>
          <path d="M9 12l0 .01"></path>
          <path d="M9 15l0 .01"></path>
          <path d="M9 18l0 .01"></path>
        </svg>
      )
    }
  ];

  return (
    <section id="services" className="spy120px fade-wrapper relative z-10 bg-primary text-white-1">
      <div className="container relative grid grid-cols-12 items-center">
        <div className="col-start-1 col-end-13 lg:col-end-6">
          <h5 className="h5 title-animation font-medium capitalize text-white-1">
            Services
          </h5>
          <h3 className="d4 title-animation font-semibold h2 mt-3">
            Our Featured Services.
          </h3>
          <p className="m-text fade-top mt-5 text-white-2">
            Integrate Babuz on your web-site to offer fast, secure and seamless online bank transfer payment method.
          </p>
          <p className="m-text fade-top mt-4 text-white-2">
            You could receive payments straight into your company bank account or open a Babuz merchant account and collect funds there.
          </p>
          <div className="spt40px flex items-center justify-between">
            <Link
              className="alter-btn btn-anim group/link relative z-10 inline-flex size-[140px] shrink-0 items-center justify-center gap-4 overflow-hidden rounded-full border border-black-3 font-semibold bg-accent-3 text-black-4 hover:border-accent-3"
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
          </div>
        </div>

        <div className="max-lg:spt40px col-start-1 col-end-13 lg:col-start-7">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {services.map((item, idx) => (
              <div
                key={idx}
                className="group theme-transition-3 relative border border-accent-3 p-8 text-white-1 hover:bg-accent-3 hover:text-black-4 cursor-pointer"
              >
                {item.icon}
                <h5 className="h5 spt24px font-medium group-hover:text-black-4">
                  {item.title}
                </h5>
                <p className="m-text mt-3 text-balance text-white-1 group-hover:text-black-2">
                  {item.desc}
                </p>
                <Link
                  className="m-text theme-transition-3 mt-10 flex items-center gap-3 font-medium group-hover:text-black-4"
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
            ))}
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
"""

with open('src/components/pages/BabuzLanding/ServicesSection.jsx', 'w', encoding='utf-8') as f:
    f.write(services_jsx)
print("Created ServicesSection.jsx")
