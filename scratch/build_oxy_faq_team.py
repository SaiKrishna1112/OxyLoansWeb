out_dir = 'src/components/pages/BabuzLanding'

faq_code = '''import React, { useState } from "react";

const FaqSection = () => {
  const [openIndex, setOpenIndex] = useState(0);

  const faqsLeft = [
    {
      q: "Do I need to register with OxyLoans.com to lend or borrow?",
      a: "Yes, both Lenders and Borrowers need to register on OxyLoans. Registration ensures that all participants are verified in accordance with Reserve Bank of India (RBI) NBFC-P2P regulations, protecting all parties involved."
    },
    {
      q: "What is the minimum amount I can lend on OxyLoans?",
      a: "The minimum amount you can lend is ₹50,000. As per RBI guidelines, an individual lender can invest across peer-to-peer platforms up to the statutory limit with complete diversification across multiple borrowers."
    },
    {
      q: "What rate of interest can I earn as an investor?",
      a: "Interest rates on OxyLoans typically range between 12% and 24% per annum depending on the risk grading of borrower profiles, deal tenure, and borrower creditworthiness."
    },
    {
      q: "How does the ICICI Bank Escrow account work?",
      a: "OxyLoans operates with a dedicated, dual-trustee Escrow account managed by ICICI Bank. When lenders fund a deal, money transfers directly into the escrow and is disbursed directly to borrower accounts. Neither OxyLoans nor any intermediary holds user funds."
    },
    {
      q: "What is the method used for borrower repayments calculation?",
      a: "Borrower repayments are calculated using standard amortized monthly Equated Monthly Installments (EMIs) or principal-at-maturity monthly interest models. Lenders receive their returns credited directly to their bank accounts on the designated monthly payment dates."
    }
  ];

  const faqsRight = [
    {
      q: "What happens if a borrower delays or defaults on an EMI?",
      a: "OxyLoans enforces a structured, multi-tier recovery process including automated e-NACH retries, dedicated tele-calling recovery teams, legal notices under Section 138 / Section 25, and credit bureau reporting to CIBIL, Equifax, and Experian."
    },
    {
      q: "Can Non-Resident Indians (NRIs) invest on OxyLoans?",
      a: "Yes! NRIs can invest in Indian P2P loans through their NRO (Non-Resident Ordinary) bank accounts, allowing them to earn attractive double-digit rupee yields on their funds in India."
    },
    {
      q: "How does OxyLoans evaluate borrower creditworthiness?",
      a: "We run a multi-dimensional underwriting algorithm (OxyScore) evaluating CIBIL credit history, bank statements, monthly cash flow, employment stability, debt-to-income ratio, and social footprint."
    },
    {
      q: "Are the earnings subject to TDS (Tax Deducted at Source)?",
      a: "Under current Indian income tax guidelines, P2P earnings are considered 'Income from Other Sources'. If total interest earned from a single borrower exceeds the threshold, TDS may apply; otherwise lenders report earnings in their annual ITR."
    },
    {
      q: "What documents are required to get a loan approved?",
      a: "Borrowers need to submit their PAN Card, Aadhaar Card, last 3 to 6 months bank statements, and recent salary slips (or ITR for business owners). Approvals are typically completed digitally within 24-48 business hours."
    }
  ];

  const toggleFaq = (idx) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <div id="faq" className="spy120px relative overflow-hidden">
      <div className="container">
        <h5 className="h5 title-animation font-medium capitalize text-primary text-center">
          OxyLoans Knowledge Center
        </h5>
        <h3 className="d4 title-animation font-semibold mt-3 text-center text-black-4">
          Frequently Asked Questions
        </h3>
        <p className="m-text text-black-3 text-center max-w-[500px] mx-auto mt-3">
          Everything you need to know about peer-to-peer lending, borrower screening, returns, and RBI safety guidelines.
        </p>

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
                    <h6 className="l-text font-bold text-black-4">{faq.q}</h6>
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
                    <h6 className="l-text font-bold text-black-4">{faq.q}</h6>
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
'''

with open(f'{out_dir}/FaqSection.jsx', 'w', encoding='utf-8') as f:
    f.write(faq_code)
print("Updated FaqSection.jsx")

team_code = '''import React, { useState } from "react";
import { Link } from "react-router-dom";

const TeamSection = () => {
  const [startIndex, setStartIndex] = useState(0);

  const teamMembers = [
    {
      name: "Radhakrishna Thatavarti",
      role: "Founder & Managing Director",
      image: "/assets/images/team/radha.png"
    },
    {
      name: "Ramesh Reddy",
      role: "Co-Founder, SVP - Sales & Marketing",
      image: "/assets/images/team/ramesh.png"
    },
    {
      name: "Subash Sure",
      role: "Founder & Technology Advisor",
      image: "/assets/images/team/subbu.png"
    },
    {
      name: "Rama Devi Thatavarti",
      role: "Director - Technology Operations",
      image: "/assets/images/team/rama.png"
    },
    {
      name: "Ganesh Rayapudi",
      role: "MD, INDEX LLC, Dubai (Advisor)",
      image: "/assets/images/team/advisors/ganesh_rayapudi.png"
    },
    {
      name: "Hansel Barboza",
      role: "Head, Merchant Acquiring, Bank Muscat (Advisor)",
      image: "/assets/images/team/advisors/hanseel.png"
    },
    {
      name: "Narendra Kumar Balijepalli",
      role: "Software Engineering Lead",
      image: "/assets/images/team/narendra.png"
    },
    {
      name: "Megha SK",
      role: "Sales & Client Relations Executive",
      image: "/assets/images/team/Megha.jpg"
    }
  ];

  const nextSlide = () => {
    setStartIndex((prev) => (prev + 1) % teamMembers.length);
  };

  const prevSlide = () => {
    setStartIndex((prev) => (prev - 1 + teamMembers.length) % teamMembers.length);
  };

  const visibleMembers = [];
  for (let i = 0; i < 4; i++) {
    visibleMembers.push(teamMembers[(startIndex + i) % teamMembers.length]);
  }

  return (
    <section id="team" className="spy120px relative overflow-clip bg-white-4">
      <div className="container flex justify-between gap-5 max-sm:flex-col sm:items-center sm:gap-6">
        <div>
          <h5 className="h5 title-animation font-medium capitalize text-primary">
            Our Leadership
          </h5>
          <h3 className="d4 title-animation font-semibold mt-3 max-w-[703px] text-black-4">
            Seasoned Fintech &amp; Banking Professionals
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
            <p className="capitalize">View Board</p>
          </div>
          <span className="pointer-events-none absolute z-[-1] h-0 w-0 -translate-x-1/2 -translate-y-1/2 transform rounded-full bg-accent-3 duration-700 group-hover/link:w-[calc(100%*2.25)] group-hover/link:pt-[calc(100%*2.25)]"></span>
        </Link>
      </div>

      <div className="relative max-xl:container xl:ml-[calc((100%-1296px)/2)]">
        <div className="smt60px">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pr-4">
            {visibleMembers.map((member, idx) => (
              <div key={idx} className="transition-all duration-300">
                <div className="group relative bg-primary overflow-hidden rounded-xl shadow-lg">
                  <img
                    alt={member.name}
                    className="spx32px spt40px mx-auto block h-[380px] w-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
                    height="497"
                    src={member.image}
                    style={{ color: "transparent" }}
                    width="352"
                  />
                  <div className="theme-transition-4 absolute bottom-4 right-4 z-20 w-fit rounded-full">
                    <div className="bg-primary rounded-full p-1.5 shadow-md">
                      <div className="w-fit bg-accent-3 p-2.5 rounded-full cursor-pointer hover:bg-white-1 transition-colors">
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
              className="customerSliderPrev hover:bg-primaryColor theme-transition-3 flex items-center justify-center rounded-full border border-primary bg-transparent p-4 font-semibold text-primary hover:bg-primary hover:text-white-1 shadow-sm"
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
              className="customerSliderNext hover:bg-primaryColor theme-transition-3 flex items-center justify-center rounded-full border border-primary bg-transparent p-4 font-semibold text-primary hover:bg-primary hover:text-white-1 shadow-sm"
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

with open(f'{out_dir}/TeamSection.jsx', 'w', encoding='utf-8') as f:
    f.write(team_code)
print("Updated TeamSection.jsx")
