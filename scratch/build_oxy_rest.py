out_dir = 'src/components/pages/BabuzLanding'

# TestimonialsSection.jsx
testi_code = '''import React, { useState } from "react";

const TestimonialsSection = () => {
  const [activeIndex, setActiveIndex] = useState(0);

  const testimonials = [
    {
      quote: "OxyLoans has provided me with consistent monthly returns on my investments for over 3 years. The transparency and escrow mechanism give me complete peace of mind.",
      name: "Suresh Venkat",
      role: "IT Director & Active Lender",
      image: "/assets/images/babuz/home-one-testimonial-1.912f25d0.png"
    },
    {
      quote: "As an SME business owner, getting quick working capital without endless collateral paperwork was a lifesaver. The digital verification process was fast and seamless.",
      name: "Pooja Sharma",
      role: "Founder, Retail Enterprise",
      image: "/assets/images/babuz/home-one-testimonial-2.a7bcae8b.png"
    },
    {
      quote: "Investing through OxyLoans as an NRI has been extremely rewarding. The team handles all KYC and documentation smoothly, and interest is credited directly to my account.",
      name: "Anand Ranganathan",
      role: "NRI Investor, Dubai",
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
        <h5 className="h5 title-animation font-medium capitalize text-primary text-center">
          Testimonials
        </h5>
        <h3 className="d4 title-animation h2 mt-3 text-center font-semibold text-black-4">
          What Our Users Say
        </h3>

        <div className="smt60px mx-auto w-fit rounded-full bg-primary/10 p-[18px]">
          <svg
            className="text-primary"
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
            <path d="M10 11h-4a1 1 0 0 1 -1 -1v-3a1 1 0 0 1 1 -1h3a1 1 0 0 1 1 1v6c0 2.667 -1.333 4.333 -4 5"></path>
            <path d="M19 11h-4a1 1 0 0 1 -1 -1v-3a1 1 0 0 1 1 -1h3a1 1 0 0 1 1 1v6c0 2.667 -1.333 4.333 -4 5"></path>
          </svg>
        </div>

        <div className="spt60px max-w-[750px] mx-auto text-center transition-opacity duration-300">
          <div className="mx-auto flex w-fit items-center gap-1 justify-center">
            {[...Array(5)].map((_, i) => (
              <svg
                key={i}
                className="text-accent-3 fill-accent-3"
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

with open(f'{out_dir}/TestimonialsSection.jsx', 'w', encoding='utf-8') as f:
    f.write(testi_code)
print("Updated TestimonialsSection.jsx")

# CounterSection.jsx
counter_code = '''import React from "react";

const CounterSection = () => {
  return (
    <section className="spy120px bg-white-4 border-y border-black-1/5">
      <div className="container flex flex-wrap items-center justify-center gap-10 max-sm:text-center sm:justify-between">
        <div className="info-card fade-top text-center sm:text-left">
          <div className="text-outline d2 theme-transition-3 font-extrabold text-4xl sm:text-5xl lg:text-6xl text-primary">
            ₹<span>100</span>Cr+
          </div>
          <p className="xl-text mt-3 text-black-3 font-medium">Cumulative Loan Volume</p>
        </div>
        <div className="info-card fade-top text-center sm:text-left">
          <div className="text-outline d2 theme-transition-3 font-extrabold text-4xl sm:text-5xl lg:text-6xl text-primary">
            <span>30</span>K+
          </div>
          <p className="xl-text mt-3 text-black-3 font-medium">Registered Platform Users</p>
        </div>
        <div className="info-card fade-top text-center sm:text-left">
          <div className="text-outline d2 theme-transition-3 font-extrabold text-4xl sm:text-5xl lg:text-6xl text-primary">
            <span>12 - 24</span>%
          </div>
          <p className="xl-text mt-3 text-black-3 font-medium">Target Annualized Returns</p>
        </div>
        <div className="info-card fade-top text-center sm:text-left">
          <div className="text-outline d2 theme-transition-3 font-extrabold text-4xl sm:text-5xl lg:text-6xl text-primary">
            <span>100</span>%
          </div>
          <p className="xl-text mt-3 text-black-3 font-medium">RBI Regulated NBFC-P2P</p>
        </div>
      </div>
    </section>
  );
};

export default CounterSection;
'''

with open(f'{out_dir}/CounterSection.jsx', 'w', encoding='utf-8') as f:
    f.write(counter_code)
print("Updated CounterSection.jsx")

# BlogSection.jsx
blog_code = '''import React from "react";
import { Link } from "react-router-dom";

const BlogSection = () => {
  const blogs = [
    {
      title: "Why P2P Lending Is Ideal For SME and Business Loans?",
      category: "SME Lending",
      date: "Latest Insights",
      excerpt: "Explore how peer-to-peer financing allows fast-growing micro and small businesses to secure working capital without conventional red tape.",
      image: "/assets/images/blog/fintech_oxyloans.jpg"
    },
    {
      title: "The Role of Peer to Peer (P2P) Investment in Digital India",
      category: "Fintech Innovation",
      date: "Fintech Analysis",
      excerpt: "How direct digital financial matching bridges the credit gap for millions of Indians while delivering inflation-beating returns to lenders.",
      image: "/assets/images/blog/role_of_p2p.jpg"
    }
  ];

  return (
    <section id="blog" className="spy120px fade-wrapper relative overflow-hidden bg-white-1">
      <div className="container">
        <div className="flex justify-between gap-4 max-md:flex-col md:items-center md:gap-6">
          <div>
            <h5 className="h5 title-animation font-medium capitalize text-primary">
              OxyLoans Insights
            </h5>
            <h3 className="d4 title-animation font-semibold mt-4 max-w-[450px] text-black-4">
              Knowledge Repository &amp; Articles
            </h3>
          </div>
          <p className="m-text text-black-3 max-w-[360px] leading-relaxed">
            Stay updated with financial insights, peer lending strategies, tax efficiency, and regulatory developments.
          </p>
        </div>

        <div className="spt60px grid items-stretch gap-8 xl:grid-cols-2">
          {blogs.map((b, idx) => (
            <div
              key={idx}
              className="till-card bg-white-2 border border-black-1/10 rounded-2xl overflow-hidden flex flex-col md:flex-row shadow-sm hover:shadow-xl transition-all duration-300"
            >
              <div className="md:w-1/2 overflow-hidden h-[260px] md:h-auto">
                <img
                  alt={b.title}
                  className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                  src={b.image}
                  style={{ color: "transparent" }}
                />
              </div>
              <div className="p-6 md:w-1/2 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-semibold px-2.5 py-1 rounded bg-primary/10 text-primary">
                      {b.category}
                    </span>
                    <span className="text-xs text-black-3">{b.date}</span>
                  </div>
                  <h4 className="h5 font-bold text-black-4 hover:text-primary transition-colors leading-snug">
                    {b.title}
                  </h4>
                  <p className="m-text text-black-3 mt-3 text-sm leading-relaxed">
                    {b.excerpt}
                  </p>
                </div>
                <div className="pt-4 border-t border-black-1/10 mt-4">
                  <Link
                    className="inline-flex items-center gap-2 text-primary font-semibold hover:text-secondary transition-colors"
                    to="/blogs"
                  >
                    <span>Read Full Article</span>
                    <svg
                      className="tabler-icon tabler-icon-arrow-up-right"
                      fill="none"
                      height="18"
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                      width="18"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path d="M17 7l-10 10"></path>
                      <path d="M8 7l9 0l0 9"></path>
                    </svg>
                  </Link>
                </div>
              </div>
            </div>
          ))}
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
              <p className="capitalize">All Blogs</p>
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

with open(f'{out_dir}/BlogSection.jsx', 'w', encoding='utf-8') as f:
    f.write(blog_code)
print("Updated BlogSection.jsx")

# Footer.jsx
footer_code = '''import React from "react";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer id="contact" className="relative overflow-hidden bg-accent-2 text-white-1">
      <div className="max-xxl:container xxl:ml-[calc((100%-1296px)/2)]">
        <div className="flex justify-between max-xxl:flex-col-reverse">
          <div>
            <div className="spy120px flex flex-auto gap-8 max-md:flex-col max-md:gap-8">
              {/* Brand info */}
              <div className="flex-1 max-w-[360px]">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-3xl font-extrabold tracking-tight text-white-1">
                    Oxy<span className="text-accent-3">Loans</span>
                  </span>
                </div>
                <p className="m-text text-balance text-white-3 leading-relaxed">
                  OxyLoans is a Reserve Bank of India (RBI) registered Non-Banking Financial Company - Peer to Peer Lending Platform (NBFC-P2P). Registration No: N-09.00447.
                </p>
                <p className="text-xs text-white-3/70 mt-3 leading-relaxed">
                  Connecting creditworthy borrowers directly with smart investors via ICICI Bank Escrow security.
                </p>
                <div className="smt40px flex items-center gap-3">
                  <a className="theme-transition-3 rounded-xl bg-black-2 p-2.5 hover:bg-primary" href="https://facebook.com" target="_blank" rel="noreferrer">
                    <svg className="tabler-icon tabler-icon-brand-facebook" fill="none" height="20" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="20" xmlns="http://www.w3.org/2000/svg">
                      <path d="M7 10v4h3v7h4v-7h3l1 -4h-4v-2a1 1 0 0 1 1 -1h3v-4h-3a5 5 0 0 0 -5 5v2h-3"></path>
                    </svg>
                  </a>
                  <a className="theme-transition-3 rounded-xl bg-black-2 p-2.5 hover:bg-primary" href="https://linkedin.com" target="_blank" rel="noreferrer">
                    <svg className="tabler-icon tabler-icon-brand-linkedin" fill="none" height="20" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="20" xmlns="http://www.w3.org/2000/svg">
                      <path d="M4 4m0 2a2 2 0 0 1 2 -2h12a2 2 0 0 1 2 2v12a2 2 0 0 1 -2 2h-12a2 2 0 0 1 -2 -2z"></path>
                      <path d="M8 11l0 5"></path>
                      <path d="M8 8l0 .01"></path>
                      <path d="M12 16l0 -5"></path>
                      <path d="M16 16v-3a2 2 0 0 0 -4 0"></path>
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

              {/* Quick Links */}
              <div className="flex-1">
                <h5 className="h4 font-bold text-white-1">Quick Links</h5>
                <ul className="spt32px flex flex-col gap-2.5 md:gap-3">
                  <li><Link className="m-text theme-transition-3 text-white-3 hover:text-accent-3" to="/how-it-works">How It Works</Link></li>
                  <li><Link className="m-text theme-transition-3 text-white-3 hover:text-accent-3" to="/rbi-directions">RBI Directions</Link></li>
                  <li><Link className="m-text theme-transition-3 text-white-3 hover:text-accent-3" to="/transparency">Transparency &amp; Disclosures</Link></li>
                  <li><Link className="m-text theme-transition-3 text-white-3 hover:text-accent-3" to="/faqs">FAQs</Link></li>
                  <li><Link className="m-text theme-transition-3 text-white-3 hover:text-accent-3" to="/privacy-policy">Privacy Policy</Link></li>
                </ul>
              </div>

              {/* Contact Us */}
              <div className="flex-1">
                <h5 className="h4 font-bold text-white-1">Headquarters</h5>
                <p className="m-text spt32px text-white-3 leading-relaxed">
                  Plot No. 1228, Road No. 36,<br />
                  Jubilee Hills, Hyderabad,<br />
                  Telangana - 500033
                </p>
                <a className="spt24px xl-text block text-accent-3 font-semibold hover:underline" href="tel:+918886412345">
                  +91 88864 12345
                </a>
                <a className="m-text mt-2 block text-white-3 hover:text-accent-3" href="mailto:support@oxyloans.com">
                  support@oxyloans.com
                </a>
              </div>
            </div>

            {/* Copyright bar */}
            <div className="spy32px flex items-center justify-between border-t border-black-2 max-md:flex-col-reverse max-md:gap-5">
              <div className="flex items-center gap-2 max-[380px]:flex-col min-[380px]:gap-3">
                <p className="m-text text-white-1">Copyright © 2026 OxyLoans. All Rights Reserved.</p>
                <div className="bg-black-3 max-[380px]:h-px max-[380px]:w-20 min-[380px]:h-4 min-[380px]:w-px"></div>
                <p className="m-text text-white-3">RBI Regulated NBFC-P2P</p>
              </div>
              <div className="me-6 flex bg-accent-1 py-1 pr-1 ps-5 min-[1500px]:w-[526px] rounded-lg">
                <input
                  className="w-full bg-inherit outline-none placeholder:text-white-3 text-white-1 text-sm"
                  placeholder="Enter email for market updates"
                  type="email"
                />
                <button className="bg-primary text-white-1 p-3 rounded-md hover:bg-accent-3 hover:text-black-4 transition-colors">
                  <svg className="tabler-icon tabler-icon-send" fill="none" height="20" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="20" xmlns="http://www.w3.org/2000/svg">
                    <path d="M10 14l11 -11"></path>
                    <path d="M21 3l-6.5 18a.55 .55 0 0 1 -1 0l-3.5 -7l-7 -3.5a.55 .55 0 0 1 0 -1l18 -6.5"></path>
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {/* Right Box: Have questions? */}
          <div className="xxl:spt120px flex flex-col items-center gap-10 bg-accent-1 px-10 text-center max-xxl:justify-between max-xxl:py-8 lg:gap-15 lg:max-xxl:flex-row xxl:w-[508px] xxl:px-20 xxl:pb-8">
            <h5 className="h3 font-semibold text-white-1">Have Questions About P2P Lending?</h5>
            <Link
              className="alter-btn btn-anim group/link relative z-10 inline-flex size-[140px] shrink-0 items-center justify-center gap-4 overflow-hidden rounded-full border border-black-3 bg-inherit font-semibold hover:border-accent-3 text-white-1 hover:text-black-4 lg:max-xxl:order-3 xxl:size-[170px]"
              to="/usertype"
            >
              <div className="flex flex-col items-center justify-center">
                <svg className="tabler-icon tabler-icon-arrow-up-right" fill="none" height="38" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="38" xmlns="http://www.w3.org/2000/svg">
                  <path d="M17 7l-10 10"></path>
                  <path d="M8 7l9 0l0 9"></path>
                </svg>
                <p className="capitalize text-sm font-bold">Get In Touch</p>
              </div>
              <span className="pointer-events-none absolute z-[-1] h-0 w-0 -translate-x-1/2 -translate-y-1/2 transform rounded-full bg-accent-3 duration-700 group-hover/link:w-[calc(100%*2.25)] group-hover/link:pt-[calc(100%*2.25)]"></span>
            </Link>
            <div className="flex flex-col items-center">
              <p className="xl-text font-medium text-white-1">09:30 AM - 06:30 PM</p>
              <p className="m-text font-semibold text-accent-3">Monday - Saturday</p>
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

with open(f'{out_dir}/Footer.jsx', 'w', encoding='utf-8') as f:
    f.write(footer_code)
print("Updated Footer.jsx")
