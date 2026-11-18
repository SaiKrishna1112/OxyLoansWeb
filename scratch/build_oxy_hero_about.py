out_dir = 'src/components/pages/BabuzLanding'

hero_code = '''import React from "react";
import { Link } from "react-router-dom";

const HeroSection = () => {
  return (
    <section className="fade-wrapper relative overflow-hidden bg-primary bg-no-repeat object-cover pt-[108px] md:mx-5 md:my-5 xl:rounded-xl xl:[clip-path:polygon(70%_0,100%_0,100%_60%,100%_100%,0%_100%,0_8%,67%_8%)] xxl:mx-6">
      <div className="container relative pt-20 text-white-1 sm:pt-25">
        <div className="grid grid-cols-12">
          <div className="max-md:spt60px max-4xl:spb120px col-start-1 col-end-13 md:col-end-7 xxl:col-end-6">
            <h5 className="h5 title-animation font-semibold tracking-wider uppercase text-accent-3 flex items-center gap-2">
              <span className="size-2.5 rounded-full bg-accent-3 animate-ping"></span>
              RBI REGISTERED NBFC-P2P PLATFORM
            </h5>
            <h1 className="d2 title-animation mt-3 font-medium text-white-1 leading-tight">
              India's Premier Peer to Peer Lending &amp; Investing Platform
            </h1>
            <p className="xl-text smt24px fade-top text-white-4 leading-relaxed">
              Connect directly with verified creditworthy borrowers or invest in curated deals. Earn high monthly returns up to 18% p.a. through bank-grade Escrow protection.
            </p>
            <div className="smt40px flex items-center gap-5 max-xs:flex-wrap max-xs:justify-center">
              <Link
                className="spx24px l-text theme-transition-3 flex items-center gap-3 bg-accent-3 text-black-4 py-3.5 px-7 hover:bg-white-1 font-semibold rounded shadow-lg transition-transform duration-300 hover:scale-105"
                to="/usertype"
              >
                Start Lending
                <svg
                  className="tabler-icon tabler-icon-arrow-up-right"
                  fill="none"
                  height="22"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2.5"
                  viewBox="0 0 24 24"
                  width="22"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M17 7l-10 10"></path>
                  <path d="M8 7l9 0l0 9"></path>
                </svg>
              </Link>
              <Link
                className="spx24px l-text theme-transition-3 flex items-center gap-3 border-2 border-white-1 bg-transparent py-3.5 px-7 text-white-1 hover:bg-white-1 hover:text-black-4 font-semibold rounded transition-transform duration-300 hover:scale-105"
                to="/usertype"
              >
                Apply for Loan
                <svg
                  className="tabler-icon tabler-icon-arrow-up-right"
                  fill="none"
                  height="22"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2.5"
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

          <div className="fade-top col-start-1 col-end-13 max-md:row-start-1 md:col-start-7">
            <img
              alt="Oxyloans P2P Finance Hero Visual"
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
              <span className="l-text font-medium text-white-1">4.8</span>
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
          <div className="flex flex-col gap-3">
            <p className="lead-text items-center justify-center text-center font-medium text-white-1">
              Active Users
            </p>
            <div className="mt-2 flex flex-col items-center -space-y-2 overflow-hidden p-0.5">
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
            <p className="m-text text-center font-semibold text-accent-3">30,000+ Verified</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
'''

with open(f'{out_dir}/HeroSection.jsx', 'w', encoding='utf-8') as f:
    f.write(hero_code)
print("Updated HeroSection.jsx")

about_code = '''import React from "react";
import { Link } from "react-router-dom";

const AboutSection = () => {
  return (
    <section id="about" className="spy120px fade-wrapper relative overflow-hidden">
      <div className="container relative">
        <div className="grid grid-cols-12 items-center gap-6">
          <div className="col-start-1 col-end-13 flex justify-end xl:col-end-6">
            <img
              alt="About Oxyloans P2P"
              className="appear-down max-xl:mx-auto max-xl:block xxl:max-w-[unset]"
              height="574"
              src="/assets/images/babuz/about.2df54fdb.png"
              style={{ color: "transparent" }}
              width="526"
            />
          </div>
          <div className="col-start-1 col-end-13 xl:col-start-6 xxl:col-start-7">
            <div className="max-w-[500px]">
              <h5 className="h5 title-animation font-medium capitalize text-primary">
                About OxyLoans
              </h5>
              <h3 className="d4 title-animation font-semibold h2 mt-3 text-black-4">
                Revolutionizing Peer-to-Peer Finance in India
              </h3>
              <p className="m-text fade-top mt-3 text-black-1 leading-relaxed">
                OxyLoans is a Reserve Bank of India (RBI) registered Non-Banking Financial Company - Peer to Peer Lending Platform (NBFC-P2P). We democratize access to credit and empower investors with risk-calibrated high yields.
              </p>
            </div>
            <div className="mt-8 flex gap-6 max-sm:flex-col-reverse sm:items-center sm:gap-8 xl:mt-[55px] xl:gap-12">
              <div>
                <Link
                  className="alter-btn btn-anim group/link relative z-10 inline-flex size-[140px] shrink-0 items-center justify-center gap-4 overflow-hidden rounded-full border font-semibold border-accent-3 bg-accent-3 text-black-4 hover:border-accent-3 hover:bg-transparent hover:text-black-4 lg:size-[160px]"
                  to="/how-it-works"
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
                    <p className="capitalize">How It Works</p>
                  </div>
                  <span className="pointer-events-none absolute z-[-1] h-0 w-0 -translate-x-1/2 -translate-y-1/2 transform rounded-full bg-accent-3 duration-700 group-hover/link:w-[calc(100%*2.25)] group-hover/link:pt-[calc(100%*2.25)]"></span>
                </Link>
              </div>
              <div>
                <h3 className="d4 title-animation font-semibold h2 text-black-4">
                  Bank-Grade Escrow &amp; Risk Scoring
                </h3>
                <p className="m-text fade-top mt-3 text-black-1 leading-relaxed">
                  Every rupee lent and repaid is routed through ICICI Bank Escrow accounts with zero handling by third parties. Our proprietary OxyScore evaluates 100+ credit data points for borrower risk grading.
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

with open(f'{out_dir}/AboutSection.jsx', 'w', encoding='utf-8') as f:
    f.write(about_code)
print("Updated AboutSection.jsx")
