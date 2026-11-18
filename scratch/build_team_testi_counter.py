# TeamSection.jsx
team_jsx = """import React, { useState } from "react";
import { Link } from "react-router-dom";

const TeamSection = () => {
  const [startIndex, setStartIndex] = useState(0);

  const teamMembers = [
    {
      name: "Charles S. Brown",
      role: "CEO & Founder",
      image: "/assets/images/babuz/home-one-team-1.e0dadc48.png"
    },
    {
      name: "Jennifer White",
      role: "COO",
      image: "/assets/images/babuz/home-one-team-2.365585d0.png"
    },
    {
      name: "Robert Johnson",
      role: "CFO",
      image: "/assets/images/babuz/home-one-team-3.0212e381.png"
    },
    {
      name: "Olivia Smith",
      role: "CTO",
      image: "/assets/images/babuz/home-one-team-4.c3bf5dc0.png"
    },
    {
      name: "Eva Green",
      role: "Head of Marketing",
      image: "/assets/images/babuz/home-one-team-5.4ac8fec8.png"
    },
    {
      name: "Michael Davis",
      role: "Chief Designer",
      image: "/assets/images/babuz/home-one-team-6.9b5e03ce.png"
    }
  ];

  const nextSlide = () => {
    setStartIndex((prev) => (prev + 1) % teamMembers.length);
  };

  const prevSlide = () => {
    setStartIndex((prev) => (prev - 1 + teamMembers.length) % teamMembers.length);
  };

  // Visible cards based on startIndex
  const visibleMembers = [];
  for (let i = 0; i < 4; i++) {
    visibleMembers.push(teamMembers[(startIndex + i) % teamMembers.length]);
  }

  return (
    <section id="team" className="spy120px relative overflow-clip bg-white-4">
      <div className="container flex justify-between gap-5 max-sm:flex-col sm:items-center sm:gap-6">
        <div>
          <h5 className="h5 title-animation font-medium capitalize text-primary">
            Our Team
          </h5>
          <h3 className="d4 title-animation font-semibold mt-3 max-w-[703px]">
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pr-4">
            {visibleMembers.map((member, idx) => (
              <div key={idx} className="transition-all duration-300">
                <div className="group relative bg-primary overflow-hidden rounded-lg">
                  <img
                    alt={member.name}
                    className="spx32px spt40px mx-auto block h-[380px] object-cover transition-transform duration-500 group-hover:scale-105"
                    height="497"
                    src={member.image}
                    style={{ color: "transparent" }}
                    width="352"
                  />
                  <div className="theme-transition-4 absolute bottom-4 right-4 z-20 w-fit rounded-full">
                    <div className="bg-primaryColor rounded-full p-2">
                      <div className="w-fit bg-accent-3 p-3 rounded-full cursor-pointer hover:bg-white-1">
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
                  </div>
                </div>
                <div className="mt-4 text-center">
                  <h4 className="h4 font-medium text-black-4">{member.name}</h4>
                  <p className="m-text text-black-3">{member.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <div className="flex items-center gap-4 smt60px mx-auto w-fit">
            <button
              onClick={prevSlide}
              className="customerSliderPrev hover:bg-primaryColor theme-transition-3 flex items-center justify-center rounded-full border border-primary bg-transparent p-4 font-semibold text-primary hover:bg-primary hover:text-white-1"
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
              className="customerSliderNext hover:bg-primaryColor theme-transition-3 flex items-center justify-center rounded-full border border-primary bg-transparent p-4 font-semibold text-primary hover:bg-primary hover:text-white-1"
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
"""

with open('src/components/pages/BabuzLanding/TeamSection.jsx', 'w', encoding='utf-8') as f:
    f.write(team_jsx)
print("Created TeamSection.jsx")

# TestimonialsSection.jsx
testi_jsx = """import React, { useState } from "react";

const TestimonialsSection = () => {
  const [activeIndex, setActiveIndex] = useState(0);

  const testimonials = [
    {
      quote: "“It's been 2 years since I found Bankio, and it's such a relief as a small business owner to not worry about unnecessary fees. I lost my credit card once, and the service was so quick.",
      name: "Andrew Russel",
      role: "VP of Marketing",
      image: "/assets/images/babuz/home-one-testimonial-1.912f25d0.png"
    },
    {
      quote: "“Bankio has made managing my finances so much easier. The user-friendly interface and excellent customer support make it the perfect choice for individuals and businesses alike.",
      name: "Emily Thompson",
      role: "Freelance Designer",
      image: "/assets/images/babuz/home-one-testimonial-2.a7bcae8b.png"
    },
    {
      quote: "“I switched to Bankio for my personal and business banking needs, and I couldn't be happier. The app is intuitive, and I love the convenience it offers.",
      name: "John Davis",
      role: "Entrepreneur",
      image: "/assets/images/babuz/home-one-testimonial-3.053c370b.png"
    },
    {
      quote: "“Bankio's security features give me peace of mind. I can focus on my work without worrying about the safety of my financial information. Highly recommended!",
      name: "Sophia Miller",
      role: "Software Engineer",
      image: "/assets/images/babuz/home-one-testimonial-4.ebf73660.png"
    },
    {
      quote: "“As a startup founder, Bankio has been a game-changer for managing expenses and handling transactions. The real-time updates and analytics are incredibly valuable.",
      name: "Alex Turner",
      role: "CEO, Tech Innovations",
      image: "/assets/images/babuz/home-one-testimonial-5.9af880b4.png"
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
    <div id="testimonial" className="spy120px relative">
      <div className="container relative">
        <h5 className="h5 title-animation font-medium capitalize text-primary text-center">
          Testimonials
        </h5>
        <h3 className="d4 title-animation h2 mt-3 text-center font-semibold">
          What people say
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
                height="24"
                viewBox="0 0 24 24"
                width="24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"></path>
              </svg>
            ))}
          </div>

          <p className="xl-text shrink-0 text-black-1 max-w-[602px] mt-6 mx-auto italic">
            {current.quote}
          </p>

          <div className="relative shrink-0 spt40px flex justify-center">
            <img
              alt={current.name}
              className="rounded-full shadow-md"
              height="66"
              src={current.image}
              style={{ color: "transparent" }}
              width="66"
            />
          </div>

          <div>
            <p className="h4 font-medium spt32px text-black-4">{current.name}</p>
            <p className="m-text mt-1 font-medium text-black-3">{current.role}</p>
          </div>
        </div>

        {/* Navigation Arrows */}
        <div className="max-lg:smt40px z-10 mx-auto flex w-fit items-center gap-4 max-lg:bottom-0 sm:gap-6 lg:absolute lg:top-1/2 lg:w-full lg:justify-between px-4">
          <button
            onClick={prevTestimonial}
            className="customerSliderPrev theme-transition-3 flex items-center justify-center rounded-full border border-accent-3 bg-transparent p-3 font-semibold text-accent-3 hover:bg-accent-3 hover:text-black-4"
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
            className="customerSliderNext theme-transition-3 flex items-center justify-center rounded-full border border-accent-3 bg-transparent p-3 font-semibold text-accent-3 hover:bg-accent-3 hover:text-black-4"
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

export default TestimonialsSection;
"""

with open('src/components/pages/BabuzLanding/TestimonialsSection.jsx', 'w', encoding='utf-8') as f:
    f.write(testi_jsx)
print("Created TestimonialsSection.jsx")

# CounterSection.jsx
counter_jsx = """import React from "react";

const CounterSection = () => {
  return (
    <section className="spy120px bg-white-4">
      <div className="container flex flex-wrap items-center justify-center gap-10 max-sm:text-center sm:justify-between">
        <div className="info-card fade-top">
          <div className="text-outline d2 theme-transition-3 font-medium text-4xl sm:text-5xl lg:text-6xl text-primary">
            <span>250</span>+
          </div>
          <p className="xl-text mt-4 text-black-3 font-medium">Partner with us</p>
        </div>
        <div className="info-card fade-top">
          <div className="text-outline d2 theme-transition-3 font-medium text-4xl sm:text-5xl lg:text-6xl text-primary">
            $<span>25B</span>+
          </div>
          <p className="xl-text mt-4 text-black-3 font-medium">Cumulative trading volume</p>
        </div>
        <div className="info-card fade-top">
          <div className="text-outline d2 theme-transition-3 font-medium text-4xl sm:text-5xl lg:text-6xl text-primary">
            <span>50</span>K+
          </div>
          <p className="xl-text mt-4 text-black-3 font-medium">Successful Projects</p>
        </div>
        <div className="info-card fade-top">
          <div className="text-outline d2 theme-transition-3 font-medium text-4xl sm:text-5xl lg:text-6xl text-primary">
            <span>1.5M</span>+
          </div>
          <p className="xl-text mt-4 text-black-3 font-medium">Active Banking Accounts</p>
        </div>
      </div>
    </section>
  );
};

export default CounterSection;
"""

with open('src/components/pages/BabuzLanding/CounterSection.jsx', 'w', encoding='utf-8') as f:
    f.write(counter_jsx)
print("Created CounterSection.jsx")
