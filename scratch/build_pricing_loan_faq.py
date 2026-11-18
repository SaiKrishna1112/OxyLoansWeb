# PricingSection.jsx
pricing_jsx = """import React, { useState } from "react";
import { Link } from "react-router-dom";

const PricingSection = () => {
  const [billingCycle, setBillingCycle] = useState("weekly");

  const plans = [
    {
      name: "Simple Plan",
      weeklyPrice: "$10",
      yearlyPrice: "$99",
      bgClass: "bg-white-1",
      btnText: "Join Simple Plan",
      btnClass: "bg-accent-3 hover:bg-accent-3/80 text-black-4",
      circleImg: "/assets/images/babuz/pricint-play-secondary-circle.e72b1072.png",
      popular: false,
      minInv: "$100",
      duration: "30D",
      dailyReturns: "2.0%",
      totalReturn: "160%"
    },
    {
      name: "Growth Plan",
      weeklyPrice: "$30",
      yearlyPrice: "$299",
      bgClass: "bg-accent-3",
      btnText: "Join Standard Plan",
      btnClass: "bg-accent-5 hover:bg-accent-5/90 text-white-1",
      circleImg: null,
      popular: true,
      minInv: "$500",
      duration: "60D",
      dailyReturns: "2.5%",
      totalReturn: "230%"
    },
    {
      name: "Premium Plan",
      weeklyPrice: "$75",
      yearlyPrice: "$699",
      bgClass: "bg-white-1",
      btnText: "Join Premium Plan",
      btnClass: "bg-accent-3 hover:bg-accent-3/80 text-black-4",
      circleImg: "/assets/images/babuz/pricint-play-primary-circle.9ca4c2b9.png",
      popular: false,
      minInv: "$1000",
      duration: "90D",
      dailyReturns: "3.0%",
      totalReturn: "475%"
    }
  ];

  return (
    <div id="pricing" className="spy120px relative z-10 bg-white-4 after:absolute after:bottom-0 after:-z-10 after:h-[35%] after:w-full after:bg-accent-3/15">
      <div className="container">
        <div className="flex flex-col items-center justify-center">
          <h5 className="h5 title-animation font-medium capitalize text-primary text-center">
            Pricing Plan
          </h5>
          <h3 className="d4 title-animation font-semibold mt-3 text-center">
            Simple pricing for everyone.
          </h3>
          <p className="m-text text-black-3 mt-6 max-w-[367px] text-center">
            Use customer data to build great and solid product experiences that convert.
          </p>
          <div className="mt-5 flex items-center gap-8">
            <button
              onClick={() => setBillingCycle("weekly")}
              className={`spx24px spy12px capitalize l-text theme-transition-3 border border-accent-3 !px-12 py-4 text-accent-2 font-medium ${
                billingCycle === "weekly" ? "bg-accent-3" : "bg-transparent hover:bg-accent-3"
              }`}
            >
              Weekly
            </button>
            <button
              onClick={() => setBillingCycle("yearly")}
              className={`spx24px spy12px capitalize l-text theme-transition-3 border border-accent-3 !px-12 py-4 text-accent-2 font-medium ${
                billingCycle === "yearly" ? "bg-accent-3" : "bg-transparent hover:bg-accent-3"
              }`}
            >
              yearly
            </button>
          </div>
        </div>

        <div className="smt60px grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:gap-6">
          {plans.map((p, idx) => (
            <div
              key={idx}
              className={`spt40px till-card spb40px theme-transition-3 relative ${p.bgClass}`}
            >
              <div className="spl40px">
                <div className="flex items-center justify-between">
                  <span className="h5 font-medium">{p.name}</span>
                  {p.popular && (
                    <span className="h6 theme-transition-3 z-10 me-3 rounded-full px-3 py-2 font-medium bg-black-4 text-white-1">
                      Most Popular
                    </span>
                  )}
                </div>
                <div className="mt-3 flex items-end">
                  <p className="d4 leading-0 text-primaryColor theme-transition-4 font-semibold">
                    {billingCycle === "weekly" ? p.weeklyPrice : p.yearlyPrice}
                  </p>
                  <p className="h6 theme-transition-4 mb-2 font-medium">
                    /{billingCycle === "weekly" ? "wk" : "yr"}
                  </p>
                </div>
              </div>

              <div className="spt32px spb32px smt32px spr24px spl24px mx-4 flex flex-col gap-6 rounded-xl bg-white-2">
                <div className="flex items-center justify-between gap-6">
                  <div className="flex items-center gap-3">
                    <svg className="tabler-icon tabler-icon-checkbox" fill="none" height="24" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg">
                      <path d="M9 11l3 3l8 -8"></path>
                      <path d="M20 12v6a2 2 0 0 1 -2 2h-12a2 2 0 0 1 -2 -2v-12a2 2 0 0 1 2 -2h9"></path>
                    </svg>
                    <p className="m-text">Minimum Investment</p>
                  </div>
                  <p className="h4 font-medium">{p.minInv}</p>
                </div>

                <div className="flex items-center justify-between gap-6">
                  <div className="flex items-center gap-3">
                    <svg className="tabler-icon tabler-icon-checkbox" fill="none" height="24" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg">
                      <path d="M9 11l3 3l8 -8"></path>
                      <path d="M20 12v6a2 2 0 0 1 -2 2h-12a2 2 0 0 1 -2 -2v-12a2 2 0 0 1 2 -2h9"></path>
                    </svg>
                    <p className="m-text">Investment Duration</p>
                  </div>
                  <p className="h4 font-medium">{p.duration}</p>
                </div>

                <div className="flex items-center justify-between gap-6">
                  <div className="flex items-center gap-3">
                    <svg className="tabler-icon tabler-icon-checkbox" fill="none" height="24" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg">
                      <path d="M9 11l3 3l8 -8"></path>
                      <path d="M20 12v6a2 2 0 0 1 -2 2h-12a2 2 0 0 1 -2 -2v-12a2 2 0 0 1 2 -2h9"></path>
                    </svg>
                    <p className="m-text">Daily Returns</p>
                  </div>
                  <p className="h4 font-medium">{p.dailyReturns}</p>
                </div>

                <div className="flex items-center justify-between gap-6">
                  <div className="flex items-center gap-3">
                    <svg className="tabler-icon tabler-icon-checkbox" fill="none" height="24" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg">
                      <path d="M9 11l3 3l8 -8"></path>
                      <path d="M20 12v6a2 2 0 0 1 -2 2h-12a2 2 0 0 1 -2 -2v-12a2 2 0 0 1 2 -2h9"></path>
                    </svg>
                    <p className="m-text">Total Return</p>
                  </div>
                  <p className="h4 font-medium">{p.totalReturn}</p>
                </div>
              </div>

              <Link
                className={`spx24px spy12px l-text smt40px theme-transition-3 mx-auto block w-fit capitalize font-medium ${p.btnClass}`}
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
"""

with open('src/components/pages/BabuzLanding/PricingSection.jsx', 'w', encoding='utf-8') as f:
    f.write(pricing_jsx)
print("Created PricingSection.jsx")

# LoanMasterySection.jsx
loan_jsx = """import React from "react";
import { Link } from "react-router-dom";

const LoanMasterySection = () => {
  const cards = [
    {
      title: "Boost your Payments",
      desc: "Reduced Payments maintenance and processing fees. No hidden fees.",
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
    }
  ];

  return (
    <section id="loan" className="banner relative z-10 overflow-hidden bg-secondary/5 text-white-1 after:bottom-0 after:right-0 after:-z-10 after:h-full after:w-1/2 after:bg-secondary lg:after:absolute">
      <div className="max-lg:spy120px container relative grid grid-cols-12 items-center">
        <div className="col-start-1 col-end-13 grid max-lg:gap-3 xs:grid-cols-2 lg:col-end-7">
          {cards.map((c, idx) => (
            <div
              key={idx}
              className="spx40px group theme-transition-3 relative bg-secondary/20 py-10 text-black-4 hover:bg-accent-3 sm:py-15 xxl:pb-[105px] xxl:pt-15 cursor-pointer"
            >
              {c.icon}
              <h5 className="h5 spt24px font-medium">{c.title}</h5>
              <p className="m-text text-black-3 mt-3 text-balance">{c.desc}</p>
              <div className="rounded-16px theme-transition-4 flex w-full items-center justify-center opacity-0 group-hover:visible group-hover:opacity-100">
                <Link
                  className="absolute right-5 top-5 z-10 cursor-pointer rounded-full bg-primary p-3"
                  to="/usertype"
                >
                  <svg
                    className="size-10 text-white-1"
                    fill="none"
                    height="24"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="1"
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
          <h5 className="h5 title-animation font-medium capitalize text-black-4 lg:text-white-1">
            Financial Planning
          </h5>
          <h3 className="d4 title-animation font-semibold h2 mt-3 max-lg:text-black-4 text-white-1">
            Financial Mastery. The Right Way to Plan
          </h3>
          <p className="m-text text-black-3 mt-5 lg:text-white-2">
            Lending that doesn't weigh you down.We know how hard is it to start something new, that’s why we have the perfect plan for you.
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
"""

with open('src/components/pages/BabuzLanding/LoanMasterySection.jsx', 'w', encoding='utf-8') as f:
    f.write(loan_jsx)
print("Created LoanMasterySection.jsx")

# FaqSection.jsx
faq_jsx = """import React, { useState } from "react";

const FaqSection = () => {
  const [openIndex, setOpenIndex] = useState(null);

  const faqsLeft = [
    {
      q: "How do I report fraudulent activity on my account?",
      a: "If you notice any suspicious or unauthorized activity on your account, follow these steps:\\n1. Contact your bank or credit card issuer immediately.\\n2. Report the fraudulent transactions and provide details of the unauthorized activity.\\n3. Request to block or deactivate the affected card or account.\\n4. Follow any additional instructions provided by your bank to resolve the issue."
    },
    {
      q: "Can I set up account alerts for unusual transactions?",
      a: "Yes, many banks offer account alert services. You can set up alerts for unusual transactions, large withdrawals, or any other specific activity. Check with your bank to explore the available alert options and customize them according to your preferences."
    },
    {
      q: "What should I do if my card is damaged?",
      a: "If your debit/credit card is damaged, follow these steps:\\n1. Contact your bank or credit card issuer.\\n2. Report the damage and request a replacement card.\\n3. Destroy the damaged card securely by cutting it into multiple pieces.\\n4. Activate the new card once you receive it."
    },
    {
      q: "Is there a way to dispute a transaction on my account?",
      a: "Yes, if you believe a transaction on your account is incorrect or unauthorized, you can dispute it. Contact your bank or credit card issuer, provide details of the disputed transaction, and follow their dispute resolution process. Be sure to report the issue promptly for a quicker resolution."
    },
    {
      q: "What steps should I take if I forget my card PIN?",
      a: "If you forget your card PIN, follow these steps:\\n1. Contact your bank or credit card issuer.\\n2. Request a PIN reset or reissue.\\n3. Authenticate your identity through the bank's security measures.\\n4. Choose a new PIN and update it securely. Avoid using easily guessable PINs for your security."
    }
  ];

  const faqsRight = [
    {
      q: "How secure is online and mobile banking?",
      a: "Online and mobile banking employs bank-grade 256-bit encryption, biometric authentication, and real-time fraud monitoring to safeguard all your transactions and account credentials around the clock."
    },
    {
      q: "Are there any hidden maintenance fees?",
      a: "No, there are no hidden maintenance or surprise platform fees. All applicable rates and charges are disclosed transparently before you confirm any plan or transaction."
    },
    {
      q: "How quickly do payouts and refunds clear?",
      a: "Most peer payouts and instant bank transfers clear in real-time or within 24 business hours, depending on your banking network and settlement rails."
    },
    {
      q: "Can I manage multiple accounts simultaneously?",
      a: "Yes, our dashboard allows business and personal account holders to toggle and manage multiple balances, statements, and cards from a single unified portal."
    },
    {
      q: "How can I contact customer support?",
      a: "Customer support is accessible 24/7 via phone, live chat, or email. You can also reach out to our dedicated client assistance desk directly from the contact section."
    }
  ];

  const toggleFaq = (idx) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <div id="faq" className="spy120px relative overflow-hidden">
      <div className="container">
        <h5 className="h5 title-animation font-medium capitalize text-primary text-center">
          FAQ
        </h5>
        <h3 className="d4 title-animation font-semibold mt-3 text-center">
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
                      <p className="m-text text-black-3 whitespace-pre-line leading-relaxed">
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
                      <p className="m-text text-black-3 whitespace-pre-line leading-relaxed">
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
"""

with open('src/components/pages/BabuzLanding/FaqSection.jsx', 'w', encoding='utf-8') as f:
    f.write(faq_jsx)
print("Created FaqSection.jsx")
