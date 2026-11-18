out_dir = 'src/components/pages/BabuzLanding'

services_code = '''import React from "react";
import { Link } from "react-router-dom";

const ServicesSection = () => {
  const services = [
    {
      title: "Lender Escrow Deals",
      desc: "Earn high monthly interest up to 18% p.a. through direct lending with bank-grade ICICI Escrow security.",
      icon: (
        <svg className="size-10" fill="none" height="24" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg">
          <path d="M5 7.2a2.2 2.2 0 0 1 2.2 -2.2h1a2.2 2.2 0 0 0 1.55 -.64l.7 -.7a2.2 2.2 0 0 1 3.12 0l.7 .7c.412 .41 .97 .64 1.55 .64h1a2.2 2.2 0 0 1 2.2 2.2v1c0 .58 .23 1.138 .64 1.55l.7 .7a2.2 2.2 0 0 1 0 3.12l-.7 .7a2.2 2.2 0 0 0 -.64 1.55v1a2.2 2.2 0 0 1 -2.2 2.2h-1a2.2 2.2 0 0 0 -1.55 .64l-.7 .7a2.2 2.2 0 0 1 -3.12 0l-.7 -.7a2.2 2.2 0 0 0 -1.55 -.64h-1a2.2 2.2 0 0 1 -2.2 -2.2v-1a2.2 2.2 0 0 0 -.64 -1.55l-.7 -.7a2.2 2.2 0 0 1 0 -3.12l.7 -.7a2.2 2.2 0 0 0 .64 -1.55v-1"></path>
          <path d="M9 12l2 2l4 -4"></path>
        </svg>
      )
    },
    {
      title: "Instant Personal Loans",
      desc: "Fast, paperless, unsecured loans for salaried professionals with digital KYC and rapid bank disbursement.",
      icon: (
        <svg className="size-10" fill="none" height="24" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg">
          <path d="M3 19a2 2 0 1 0 4 0a2 2 0 0 0 -4 0"></path>
          <path d="M19 7a2 2 0 1 0 0 -4a2 2 0 0 0 0 4z"></path>
          <path d="M11 19h5.5a3.5 3.5 0 0 0 0 -7h-8a3.5 3.5 0 0 1 0 -7h4.5"></path>
        </svg>
      )
    },
    {
      title: "SME & Business Credit",
      desc: "Collateral-free working capital solutions to empower micro, small, and medium enterprises across India.",
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
      title: "AI P2P Portfolio Matching",
      desc: "Smart automated diversification spreading investments across credit-vetted borrower tranches to minimize risk.",
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
          <h5 className="h5 title-animation font-medium capitalize text-accent-3">
            Our Services
          </h5>
          <h3 className="d4 title-animation font-semibold h2 mt-3 text-white-1">
            Featured Financial Services.
          </h3>
          <p className="m-text fade-top mt-5 text-white-2 leading-relaxed">
            Harness the power of RBI-regulated direct peer lending. Borrowers access flexible credit without traditional banking delays, while lenders unlock superior risk-calibrated returns.
          </p>
          <p className="m-text fade-top mt-4 text-white-2 leading-relaxed">
            All disbursements and monthly repayments are settled directly between lenders and borrowers through transparent ICICI Bank Escrow accounts.
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
                className="group theme-transition-3 relative border border-accent-3 p-8 text-white-1 hover:bg-accent-3 hover:text-black-4 cursor-pointer rounded-lg"
              >
                {item.icon}
                <h5 className="h5 spt24px font-medium group-hover:text-black-4 text-white-1">
                  {item.title}
                </h5>
                <p className="m-text mt-3 text-balance text-white-1 group-hover:text-black-2 leading-relaxed">
                  {item.desc}
                </p>
                <Link
                  className="m-text theme-transition-3 mt-8 flex items-center gap-3 font-semibold group-hover:text-black-4 text-accent-3"
                  to="/usertype"
                >
                  <span>Learn More</span>
                  <svg
                    className="theme-transition-3 group-hover:-rotate-45"
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
'''

with open(f'{out_dir}/ServicesSection.jsx', 'w', encoding='utf-8') as f:
    f.write(services_code)
print("Updated ServicesSection.jsx")

pricing_code = '''import React, { useState } from "react";
import { Link } from "react-router-dom";

const PricingSection = () => {
  const [billingCycle, setBillingCycle] = useState("monthly");

  const plans = [
    {
      name: "Starter Lender Plan",
      monthlyReturn: "12% - 15% p.a.",
      yearlyReturn: "Up to 15% Annual",
      bgClass: "bg-white-1",
      btnText: "Join Starter Plan",
      btnClass: "bg-accent-3 hover:bg-accent-3/80 text-black-4",
      circleImg: "/assets/images/babuz/pricint-play-secondary-circle.e72b1072.png",
      popular: false,
      minInv: "₹50,000",
      duration: "3 - 12 Months",
      payouts: "Monthly Interest",
      security: "Escrow Protected"
    },
    {
      name: "Growth Portfolio Plan",
      monthlyReturn: "15% - 18% p.a.",
      yearlyReturn: "Up to 18% Annual",
      bgClass: "bg-accent-3",
      btnText: "Join Growth Plan",
      btnClass: "bg-black-4 hover:bg-black-4/90 text-white-1",
      circleImg: null,
      popular: true,
      minInv: "₹2,00,000",
      duration: "12 - 24 Months",
      payouts: "Monthly Payout",
      security: "Diversified Pool"
    },
    {
      name: "HNI / Corporate Plan",
      monthlyReturn: "18% - 24% p.a.",
      yearlyReturn: "Up to 24% Annual",
      bgClass: "bg-white-1",
      btnText: "Join Premium Plan",
      btnClass: "bg-accent-3 hover:bg-accent-3/80 text-black-4",
      circleImg: "/assets/images/babuz/pricint-play-primary-circle.9ca4c2b9.png",
      popular: false,
      minInv: "₹5,00,000",
      duration: "Flexible Tenure",
      payouts: "Custom Schedule",
      security: "Priority Relationship"
    }
  ];

  return (
    <div id="pricing" className="spy120px relative z-10 bg-white-4 after:absolute after:bottom-0 after:-z-10 after:h-[35%] after:w-full after:bg-accent-3/15">
      <div className="container">
        <div className="flex flex-col items-center justify-center">
          <h5 className="h5 title-animation font-medium capitalize text-primary text-center">
            Investment Returns
          </h5>
          <h3 className="d4 title-animation font-semibold mt-3 text-center text-black-4">
            Transparent earning plans for every investor.
          </h3>
          <p className="m-text text-black-3 mt-6 max-w-[450px] text-center leading-relaxed">
            Maximize your wealth with direct peer investments. Enjoy regular monthly interest credited straight to your bank account.
          </p>
          <div className="mt-6 flex items-center gap-6">
            <button
              onClick={() => setBillingCycle("monthly")}
              className={`spx24px spy12px capitalize l-text theme-transition-3 border border-accent-3 !px-10 py-3.5 text-accent-2 font-semibold rounded ${
                billingCycle === "monthly" ? "bg-accent-3 shadow-md" : "bg-transparent hover:bg-accent-3"
              }`}
            >
              Monthly Payouts
            </button>
            <button
              onClick={() => setBillingCycle("yearly")}
              className={`spx24px spy12px capitalize l-text theme-transition-3 border border-accent-3 !px-10 py-3.5 text-accent-2 font-semibold rounded ${
                billingCycle === "yearly" ? "bg-accent-3 shadow-md" : "bg-transparent hover:bg-accent-3"
              }`}
            >
              Annualized Return
            </button>
          </div>
        </div>

        <div className="smt60px grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:gap-8">
          {plans.map((p, idx) => (
            <div
              key={idx}
              className={`spt40px till-card spb40px theme-transition-3 relative rounded-xl shadow-lg ${p.bgClass}`}
            >
              <div className="spl40px pr-6">
                <div className="flex items-center justify-between">
                  <span className="h5 font-bold text-black-4">{p.name}</span>
                  {p.popular && (
                    <span className="text-xs uppercase tracking-wider font-bold z-10 rounded-full px-3 py-1.5 bg-black-4 text-white-1">
                      Most Popular
                    </span>
                  )}
                </div>
                <div className="mt-3 flex items-end">
                  <p className="d4 leading-none text-primary font-bold">
                    {billingCycle === "monthly" ? p.monthlyReturn : p.yearlyReturn}
                  </p>
                </div>
              </div>

              <div className="spt32px spb32px smt32px spr24px spl24px mx-4 flex flex-col gap-5 rounded-xl bg-white-2 shadow-inner">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2.5">
                    <svg className="tabler-icon tabler-icon-checkbox text-primary" fill="none" height="22" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="22" xmlns="http://www.w3.org/2000/svg">
                      <path d="M9 11l3 3l8 -8"></path>
                      <path d="M20 12v6a2 2 0 0 1 -2 2h-12a2 2 0 0 1 -2 -2v-12a2 2 0 0 1 2 -2h9"></path>
                    </svg>
                    <p className="m-text text-black-2 font-medium">Minimum Investment</p>
                  </div>
                  <p className="h4 font-bold text-black-4">{p.minInv}</p>
                </div>

                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2.5">
                    <svg className="tabler-icon tabler-icon-checkbox text-primary" fill="none" height="22" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="22" xmlns="http://www.w3.org/2000/svg">
                      <path d="M9 11l3 3l8 -8"></path>
                      <path d="M20 12v6a2 2 0 0 1 -2 2h-12a2 2 0 0 1 -2 -2v-12a2 2 0 0 1 2 -2h9"></path>
                    </svg>
                    <p className="m-text text-black-2 font-medium">Lending Duration</p>
                  </div>
                  <p className="h4 font-bold text-black-4">{p.duration}</p>
                </div>

                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2.5">
                    <svg className="tabler-icon tabler-icon-checkbox text-primary" fill="none" height="22" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="22" xmlns="http://www.w3.org/2000/svg">
                      <path d="M9 11l3 3l8 -8"></path>
                      <path d="M20 12v6a2 2 0 0 1 -2 2h-12a2 2 0 0 1 -2 -2v-12a2 2 0 0 1 2 -2h9"></path>
                    </svg>
                    <p className="m-text text-black-2 font-medium">Payout Frequency</p>
                  </div>
                  <p className="h4 font-bold text-black-4">{p.payouts}</p>
                </div>

                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2.5">
                    <svg className="tabler-icon tabler-icon-checkbox text-primary" fill="none" height="22" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="22" xmlns="http://www.w3.org/2000/svg">
                      <path d="M9 11l3 3l8 -8"></path>
                      <path d="M20 12v6a2 2 0 0 1 -2 2h-12a2 2 0 0 1 -2 -2v-12a2 2 0 0 1 2 -2h9"></path>
                    </svg>
                    <p className="m-text text-black-2 font-medium">Risk Framework</p>
                  </div>
                  <p className="h4 font-bold text-black-4">{p.security}</p>
                </div>
              </div>

              <Link
                className={`spx24px spy12px l-text smt40px theme-transition-3 mx-auto block w-fit font-bold rounded-md shadow-md ${p.btnClass}`}
                to="/usertype"
              >
                {p.btnText}
              </Link>

              {p.circleImg && (
                <img
                  alt="Decorative Circle"
                  className="absolute right-0 top-0 max-xl:w-[80px] pointer-events-none"
                  height="114"
                  src={p.circleImg}
                  style={{ color: "transparent" }}
                  width="117"
                />
              )}
            </div>
          ))}
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

with open(f'{out_dir}/PricingSection.jsx', 'w', encoding='utf-8') as f:
    f.write(pricing_code)
print("Updated PricingSection.jsx")

loan_code = '''import React from "react";
import { Link } from "react-router-dom";

const LoanMasterySection = () => {
  const cards = [
    {
      title: "Direct Escrow Settlement",
      desc: "All loan funds are routed securely through ICICI Bank Escrow accounts with zero intermediary risk.",
      icon: (
        <svg className="size-10" fill="none" height="24" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg">
          <path d="M3 4l18 0"></path>
          <path d="M4 4v10a2 2 0 0 0 2 2h12a2 2 0 0 0 2 -2v-10"></path>
          <path d="M12 16l0 4"></path>
          <path d="M9 20l6 0"></path>
          <path d="M8 12l3 -3l2 2l3 -3"></path>
        </svg>
      )
    },
    {
      title: "Instant e-NACH & Auto-Debit",
      desc: "Hassle-free automatic monthly EMI collection directly from borrower bank accounts without manual follow-ups.",
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
      title: "Vetted Borrower Profiles",
      desc: "Rigorous bureau credit report verification, salary slips, bank statements, and address verification.",
      icon: (
        <svg className="size-10" fill="none" height="24" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg">
          <path d="M5 7.2a2.2 2.2 0 0 1 2.2 -2.2h1a2.2 2.2 0 0 0 1.55 -.64l.7 -.7a2.2 2.2 0 0 1 3.12 0l.7 .7c.412 .41 .97 .64 1.55 .64h1a2.2 2.2 0 0 1 2.2 2.2v1c0 .58 .23 1.138 .64 1.55l.7 .7a2.2 2.2 0 0 1 0 3.12l-.7 .7a2.2 2.2 0 0 0 -.64 1.55v1a2.2 2.2 0 0 1 -2.2 2.2h-1a2.2 2.2 0 0 0 -1.55 .64l-.7 .7a2.2 2.2 0 0 1 -3.12 0l-.7 -.7a2.2 2.2 0 0 0 -1.55 -.64h-1a2.2 2.2 0 0 1 -2.2 -2.2v-1a2.2 2.2 0 0 0 -.64 -1.55l-.7 -.7a2.2 2.2 0 0 1 0 -3.12l.7 -.7a2.2 2.2 0 0 0 .64 -1.55v-1"></path>
          <path d="M9 12l2 2l4 -4"></path>
        </svg>
      )
    },
    {
      title: "Legally Binding e-Agreements",
      desc: "Secure Aadhaar/OTP signed digital loan agreements recognized under the Information Technology Act.",
      icon: (
        <svg className="size-10" fill="none" height="24" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg">
          <path d="M3 19a2 2 0 1 0 4 0a2 2 0 0 0 -4 0"></path>
          <path d="M19 7a2 2 0 1 0 0 -4a2 2 0 0 0 0 4z"></path>
          <path d="M11 19h5.5a3.5 3.5 0 0 0 0 -7h-8a3.5 3.5 0 0 1 0 -7h4.5"></path>
        </svg>
      )
    }
  ];

  return (
    <section id="loan" className="banner relative z-10 overflow-hidden bg-secondary/5 text-white-1 after:bottom-0 after:right-0 after:-z-10 after:h-full after:w-1/2 after:bg-secondary lg:after:absolute">
      <div className="max-lg:spy120px container relative grid grid-cols-12 items-center">
        <div className="col-start-1 col-end-13 grid max-lg:gap-3 xs:grid-cols-2 lg:col-end-7">
          {cards.map((c, idx) => (
            <div
              key={idx}
              className="spx40px group theme-transition-3 relative bg-secondary/20 py-10 text-black-4 hover:bg-accent-3 sm:py-15 xxl:pb-[105px] xxl:pt-15 cursor-pointer rounded-lg"
            >
              {c.icon}
              <h5 className="h5 spt24px font-bold text-black-4">{c.title}</h5>
              <p className="m-text text-black-3 mt-3 text-balance leading-relaxed">{c.desc}</p>
              <div className="rounded-16px theme-transition-4 flex w-full items-center justify-center opacity-0 group-hover:visible group-hover:opacity-100">
                <Link
                  className="absolute right-5 top-5 z-10 cursor-pointer rounded-full bg-primary p-3 shadow-lg"
                  to="/usertype"
                >
                  <svg
                    className="size-10 text-white-1"
                    fill="none"
                    height="24"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="1.5"
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
          ))}
        </div>

        <div className="max-lg:spb40px col-start-1 col-end-13 max-lg:row-start-1 lg:col-start-7 lg:ps-20 xxl:ps-[134px]">
          <h5 className="h5 title-animation font-medium capitalize text-black-4 lg:text-accent-3">
            Financial Mastery
          </h5>
          <h3 className="d4 title-animation font-semibold h2 mt-3 max-lg:text-black-4 text-white-1 leading-tight">
            The Transparent Way to Grow &amp; Borrow Wealth
          </h3>
          <p className="m-text text-black-3 mt-5 lg:text-white-2 leading-relaxed">
            Lending and borrowing that doesn't weigh you down. Zero hidden broker fees, fair interest rates determined by market forces, and absolute adherence to RBI P2P guidelines.
          </p>
          <div className="spt40px">
            <Link
              className="alter-btn btn-anim group/link relative z-10 inline-flex size-[140px] shrink-0 items-center justify-center gap-4 overflow-hidden rounded-full border border-black-3 font-semibold bg-accent-3 text-black-4 hover:border-accent-3 hover:bg-transparent max-sm:w-48 sm:size-[160px] lg:size-[180px]"
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
                <p className="capitalize">Apply for a loan</p>
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

with open(f'{out_dir}/LoanMasterySection.jsx', 'w', encoding='utf-8') as f:
    f.write(loan_code)
print("Updated LoanMasterySection.jsx")
