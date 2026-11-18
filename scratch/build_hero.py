import re

# HeroSection.jsx
hero_jsx = """import React from "react";
import { Link } from "react-router-dom";

const HeroSection = () => {
  return (
    <section className="fade-wrapper relative overflow-hidden bg-primary bg-no-repeat object-cover pt-[108px] md:mx-5 md:my-5 xl:rounded-xl xl:[clip-path:polygon(70%_0,100%_0,100%_60%,100%_100%,0%_100%,0_8%,67%_8%)] xxl:mx-6">
      <div className="container relative pt-20 text-white-1 sm:pt-25">
        <div className="grid grid-cols-12">
          <div className="max-md:spt60px max-4xl:spb120px col-start-1 col-end-13 md:col-end-7 xxl:col-end-6">
            <h5 className="h5 title-animation font-medium capitalize text-white-1">
              SAVE &amp; MANAGE YOUR MONEY
            </h5>
            <h1 className="d2 title-animation mt-3 font-medium">
              Banking Solutions for Businesses
            </h1>
            <p className="xl-text smt24px fade-top text-white-4">
              Banking is the practice of accepting and safeguarding money owned and then to earn a profit.
            </p>
            <div className="smt40px flex items-center gap-5 max-xs:flex-wrap max-xs:justify-center">
              <Link
                className="spx24px l-text theme-transition-3 flex items-center gap-3 border border-accent-3 bg-transparent py-3 hover:text-black-4 font-medium hover:bg-accent-3"
                to="/usertype"
              >
                Open Account
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
                className="spx24px l-text theme-transition-3 flex items-center gap-3 border border-accent-3 bg-transparent py-3 hover:text-black-4 font-medium hover:bg-accent-3"
                to="/usertype"
              >
                Get in touch
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
              alt="banner image"
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
              height="60"
              src="/assets/images/babuz/banner-star.64effc86.png"
              style={{ color: "transparent" }}
              width="60"
            />
            <div className="rounded-full bg-white-1 p-[14px]">
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
            <div className="flex items-center gap-1 rounded-full bg-secondary p-[9px]">
              <span className="l-text font-medium">4.7</span>
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
                alt="User 1"
                className="inline-block h-12 w-12 rounded-full ring-2 ring-white-3"
                height="57"
                src="/assets/images/babuz/banner-user-1.81918b8a.png"
                style={{ color: "transparent" }}
                width="57"
              />
              <img
                alt="User 2"
                className="inline-block h-12 w-12 rounded-full ring-2 ring-white-3"
                height="57"
                src="/assets/images/babuz/banner-user-2.4309ff3a.png"
                style={{ color: "transparent" }}
                width="57"
              />
              <img
                alt="User 3"
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
"""

with open('src/components/pages/BabuzLanding/HeroSection.jsx', 'w', encoding='utf-8') as f:
    f.write(hero_jsx)
print("Created HeroSection.jsx")
