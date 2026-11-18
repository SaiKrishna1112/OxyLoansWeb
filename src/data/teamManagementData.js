/**
 * TEAM MANAGEMENT & ADVISORY BOARD DATA
 *
 * Modeled after the reference leadership design in OxyLoans corporate theme.
 * Clean cards: Photo, Name, Designation, Department Badge, Social Links.
 */

// Management Leaders (Team of 6)
import leader1Img from "../assets/Team/radha.png";
import leader2Img from "../assets/Team/ramesh.png";
import leader3Img from "../assets/Team/subbu.png";
import leader4Img from "../assets/Team/rama.png";
import leader5Img from "../assets/Team/Megha.jpg";
import leader6Img from "../assets/Team/narendra.png";

// Advisory Board Leaders
import ganeshImg from "../assets/Team/advisors/ganesh_rayapudi.png";
import devassyImg from "../assets/Team/advisors/devassy.png";
import hanseelImg from "../assets/Team/advisors/hanseel.png";
import hsTejiImg from "../assets/Team/advisors/hs_teji.png";
import karthyicImg from "../assets/Team/advisors/karthyic.png";
import pravallikaImg from "../assets/Team/advisors/pravallika.png";
import seshaSomaImg from "../assets/Team/advisors/seshasoma.png";
import sridherReddyImg from "../assets/Team/advisors/sridherreddy.png";
import yenduriSrinivasImg from "../assets/Team/advisors/yenduri_srinivas.png";
import subbaraoImg from "../assets/Team/advisors/subarao.png";
import sureshImg from "../assets/Team/advisors/suresh.png";

// 1. Leadership Management Team
export const managementTeamData = [
  {
    id: "mgt_1",
    name: "Radhakrishna Thatavarti",
    role: "Founder & Managing Director",
    department: "Executive Board",
    teamType: "Management",
    badge: "FOUNDER & CEO",
    badgeColor: "green",
    image: leader1Img,
    fallbackInitials: "RT",
    education: "B.Tech in Computer Science & Engineering",
    email: "radhakrishna.t@oxyloans.com",
    linkedin: "https://www.linkedin.com/in/oxyradhakrishna/",
    twitter: "https://x.com/RadhakrishnaIND",
  },
  {
    id: "mgt_2",
    name: "Ramesh Reddy",
    role: "Co-Founder, SVP - Sales & Marketing",
    department: "Executive Board",
    teamType: "Management",
    badge: "CO-FOUNDER & SVP",
    badgeColor: "blue",
    image: leader2Img,
    fallbackInitials: "RR",
    education: "Master of Commerce (M.Com)",
    email: "rameshreddy@oxyloans.com",
    linkedin: "https://www.linkedin.com/in/k-ramesh-reddy-a2150b15/",
  },
  {
    id: "mgt_3",
    name: "Subash Sure",
    role: "Founder & Technology Advisor",
    department: "Technology & Product",
    teamType: "Management",
    badge: "FOUNDER",
    badgeColor: "indigo",
    image: leader3Img,
    fallbackInitials: "SS",
    education: "Ph.D. in Computer Science",
    email: "subbu@oxyloans.com",
    linkedin: "https://www.linkedin.com/in/ssure/",
    twitter: "https://x.com/sjobos",
  },
  {
    id: "mgt_4",
    name: "Rama Devi Thatavarti",
    role: "Director - Technology Operations",
    department: "Technology & Product",
    teamType: "Management",
    badge: "DIRECTOR - TECHNOLOGY",
    badgeColor: "blue",
    image: leader4Img,
    fallbackInitials: "RD",
    education: "MBA in Product Management",
    email: "ramadevi@oxyloans.com",
    linkedin: "https://www.linkedin.com/in/ramadevi-thatavarti/",
  },
  {
    id: "mgt_5",
    name: "Megha SK",
    role: "Sales & Client Relations Executive",
    department: "Executive Board",
    teamType: "Management",
    badge: "SALES EXECUTIVE",
    badgeColor: "green",
    image: leader5Img,
    fallbackInitials: "MS",
    education: "Chartered Accountant (ICAI)",
    linkedin: "https://www.linkedin.com/in/megha-oxyloans-87313b148/",
  },
  {
    id: "mgt_6",
    name: "Narendra Kumar Balijepalli",
    role: "Software Engineering Lead",
    department: "Technology & Product",
    teamType: "Management",
    badge: "SOFTWARE ENGINEER",
    badgeColor: "blue",
    image: leader6Img,
    fallbackInitials: "NK",
    education: "MBA in Banking & Risk Management",
    email: "narendra@oxyloans.com",
    linkedin: "https://www.linkedin.com/in/narendra-kumar-balijepalli-bb4a96129/",
    twitter: "https://x.com/Narendra_1994",
  },
];

// 2. Advisory Board Team (Global Industry Leaders & Strategists)
export const advisoryTeamData = [
  {
    id: "adv_1",
    name: "Ganesh Rayapudi",
    role: "Managing Director, INDEX LLC, Dubai",
    company: "INDEX LLC, Dubai",
    department: "Advisory Board",
    teamType: "Advisory Board",
    category: "Corporate & Global Strategy",
    badge: "SME & STRATEGY",
    badgeColor: "blue",
    image: ganeshImg,
    fallbackInitials: "GR",
    linkedin: "https://www.linkedin.com/in/ganesh-srinivas-rayapudi-5ab2b019/",
    summary:
      "GSR is a successful and passionate entrepreneur. He established Index LLC in 1999, a part of a familiar group of companies associated with UAE construction industry.",
    fullBio:
      "GSR is a successful and passionate entrepreneur. He established Index LLC in 1999, a part of familiar group of companies associated with UAE construction industry has grown with strength to strength to cater the specialized needs of CONCRETE PROTECTION WORKS & HEAT INSULATION WORKS in the construction field of UAE. At OxyLoans, GSR is designing new age marketing strategy that helps to penetrate in the SME sector.",
    advisoryFocus: "SME Market Penetration & UAE Alliances",
    fitMode: "contain",
  },
  {
    id: "adv_2",
    name: "K O Devassy",
    role: "Chief Marketing Officer, Badr Al Samaa Group of Hospitals, Oman",
    company: "Badr Al Samaa Group of Hospitals",
    department: "Advisory Board",
    teamType: "Advisory Board",
    category: "Healthcare & Marketing",
    badge: "HEALTHCARE & MARKETING",
    badgeColor: "green",
    image: devassyImg,
    fallbackInitials: "KD",
    linkedin: "https://www.linkedin.com/in/devassy-k-o-659b9518/",
    summary:
      "Well-recognized and experienced marketing professional with diversified industry expertise across Healthcare, Finance, and international brand strategy.",
    fullBio:
      "Mr. Devassy is a well recognized and experienced marketing professional, having diversified industry expertise in Healthcare and Finance etc. Currently he heads the Badr Al Samaa Group of Hospitals as its CMO. According to him, the key to success is to bring innovations in strategies to match the changing markets.",
    advisoryFocus: "Healthcare Partnerships & Strategic Marketing",
    fitMode: "contain",
  },
  {
    id: "adv_3",
    name: "Hansel Barboza",
    role: "Head - Merchant Acquiring Business at Bank Muscat",
    company: "Bank Muscat",
    department: "Advisory Board",
    teamType: "Advisory Board",
    category: "Banking & Finance",
    badge: "BANKING & PAYMENTS",
    badgeColor: "indigo",
    image: hanseelImg,
    fallbackInitials: "HB",
    linkedin: "https://www.linkedin.com/in/hansel-barboza-87b9239/",
    summary:
      "A Chartered Accountant by qualification, Hansel currently heads the Merchant Acquiring Business in Bank Muscat, the largest merchant acquirer in the Sultanate of Oman.",
    fullBio:
      "A Chartered Accountant by qualification, Hansel currently heads the Merchant Acquiring Business in Bank Muscat, the largest merchant acquirer in the Sultanate of Oman. His responsibilities include increasing the merchant acquiring footprint of the bank in the point of sale and e-commerce space and maintain the bank's position as a market leader. He has previously worked with PwC and KPMG.",
    advisoryFocus: "Merchant Acquiring & Digital Payments",
    fitMode: "contain",
  },
  {
    id: "adv_4",
    name: "HS Teji",
    role: "Global Sales & Innovation Strategist, Financial Services",
    company: "Global Financial Services",
    department: "Advisory Board",
    teamType: "Advisory Board",
    category: "Banking & Finance",
    badge: "GLOBAL STRATEGY",
    badgeColor: "blue",
    image: hsTejiImg,
    fallbackInitials: "HT",
    linkedin: "https://www.linkedin.com/in/hs-teji-9765143/",
    summary:
      "Business leader who strongly believes the most valuable currency is the effect one has on others. Teji brings a blend of entrepreneurial-ism and global diversity.",
    fullBio:
      "Business Leader who strongly believes that the most valuable currency is the effect that one has on others, as everything else one gains in life finally falls apart. Teji brings in a blend of entrepreneurial-ism and a width of diversity with his global experience. He is passionate towards bringing in a meaningful impact even through simplest acts. His mentorship and advisory is a great encouragement for both our growth and value-direction.",
    advisoryFocus: "Global Strategy & Value Direction",
    fitMode: "contain",
  },
  {
    id: "adv_5",
    name: "Karthyic Subramanian",
    role: "Retail Banking & Wealth Management, Bank Muscat",
    company: "Bank Muscat",
    department: "Advisory Board",
    teamType: "Advisory Board",
    category: "Banking & Finance",
    badge: "WEALTH & ASSETS",
    badgeColor: "green",
    image: karthyicImg,
    fallbackInitials: "KS",
    linkedin: "https://www.linkedin.com/in/karthyic-subramanian-8010645/",
    summary:
      "Retail banker with more than 15 years of experience across Priority Banking, Branch Banking, Sales Force Management, and Operational CRM design.",
    fullBio:
      "Retail Banker with expertise in Wealth Management, Retail Liabilities, Retail Assets, and managing P&L for High Net Worth Segment Banking. His guidance assists OxyLoans in retail wealth distribution and credit portfolio structuring.",
    advisoryFocus: "Retail Wealth Distribution & Assets",
    fitMode: "contain",
  },
  {
    id: "adv_6",
    name: "Pravallika Kadiveti",
    role: "Consultant at PricewaterhouseCoopers (PwC), USA",
    company: "PricewaterhouseCoopers (PwC)",
    department: "Advisory Board",
    teamType: "Advisory Board",
    category: "Corporate & Global Strategy",
    badge: "PWC CONSULTING",
    badgeColor: "indigo",
    image: pravallikaImg,
    fallbackInitials: "PK",
    linkedin: "https://www.linkedin.com/in/pravikadiveti/",
    summary:
      "Worked as Consultant at PwC at their US office for 3 years. Program manager for a large business transformation program of a Fortune 500 US Life Insurance Client.",
    fullBio:
      "Pravallika Kadiveti worked as Consultant at PriceWaterhouseCoopers (PwC) at their US office for 3 years. She was the program manager for a large business transformation program of a Fortune 500 US Life Insurance Client. She graduated in Electrical Engineering from Georgia Institute of Technology (GeorgiaTech).",
    advisoryFocus: "Enterprise Transformation & Risk Governance",
    fitMode: "contain",
  },
  {
    id: "adv_7",
    name: "Sesha Soma",
    role: "Founder and CEO at Sphere Technologies FZE",
    company: "Sphere Technologies FZE",
    department: "Advisory Board",
    teamType: "Advisory Board",
    category: "Technology & IT",
    badge: "FINTECH & CLOUD",
    badgeColor: "blue",
    image: seshaSomaImg,
    fallbackInitials: "SS",
    linkedin: "https://www.linkedin.com/in/seshaphani/",
    summary:
      "Chartered Accountant with 20+ years overall experience, spanning 8 years in Finance domain and 12 years across enterprise software and cloud companies.",
    fullBio:
      "Sesha Soma is a Chartered Accountant and has around 20 years of overall experience out of which 8 years in Finance domain and 12 years in various Software companies. He is also founder of Sphere Technologies. Prior to Founding Software company Sesha has worked as Solution Delivery Manager with Nakheel before that he worked as Finance Manager with My Home group of companies in India.",
    advisoryFocus: "FinTech Solution Delivery & Cloud",
    fitMode: "contain",
  },
  {
    id: "adv_8",
    name: "Sreedhar Reddy",
    role: "Director of IT at ALDAR Properties PJSC, UAE",
    company: "ALDAR Properties PJSC",
    department: "Advisory Board",
    teamType: "Advisory Board",
    category: "Technology & IT",
    badge: "ENTERPRISE IT",
    badgeColor: "green",
    image: sridherReddyImg,
    fallbackInitials: "SR",
    linkedin: "https://www.linkedin.com/in/sreedhar-reddy-940a076/",
    summary:
      "25+ years of experience in IT strategy, planning, design, and management of IT Systems and Services in large Real Estate and Government organizations.",
    fullBio:
      "Sreedhar Reddy has 25+ years of experience in IT strategy, planning, design, implementation, and management of IT Systems and Services in large Real Estate, Engineering, and Local government organizations. Sreedhar is currently working as IT Director at Aldar Properties PJSC, the largest property development and asset management company in Abu Dhabi, with responsibility for IT services for the whole group. Alumnus of City, University of London.",
    advisoryFocus: "Enterprise IT Systems & Cyber Resilience",
    fitMode: "contain",
  },
  {
    id: "adv_9",
    name: "Sreenivasarao Yenduri",
    role: "Managing Director, EVER STAR EQUIPMENT RENTALS LLC, Dubai",
    company: "EVER STAR EQUIPMENT RENTALS LLC",
    department: "Advisory Board",
    teamType: "Advisory Board",
    category: "Infrastructure & Logistics",
    badge: "HEAVY LOGISTICS",
    badgeColor: "indigo",
    image: yenduriSrinivasImg,
    fallbackInitials: "SY",
    linkedin: "https://www.linkedin.com/in/sreenivasarao-yenduri-940a076/",
    summary:
      "A total logistics leader with 25 years of experience in the field of Transportation, Equipment Rental, Earth works, and Gulf shipping industry.",
    fullBio:
      "A total logistics person with 25 years of experience in the field of Transportation, Equipment Rental, Earth works and shipping industry. Ever Star was started in 2005 and recognised by the industry as one of the Professional and Reliable Companies in the field of Equipment Rentals and Earth works. Excavated more than 20 metres of depth for basements and completed more than 150 projects.",
    advisoryFocus: "Heavy Infrastructure & Equipment Underwriting",
    fitMode: "contain",
  },
  {
    id: "adv_10",
    name: "Nalluri Subbarao",
    role: "Senior Vice President, Business Management Services",
    company: "Business Management Services",
    department: "Advisory Board",
    teamType: "Advisory Board",
    category: "Technology & IT",
    badge: "IT INFRASTRUCTURE",
    badgeColor: "blue",
    image: subbaraoImg,
    fallbackInitials: "NS",
    linkedin: "https://www.linkedin.com/in/nalluri-subba-rao-2254202/",
    summary:
      "25+ years of experience in End-to-End IT Infrastructure Management. Technical expertise to build and maintain business solutions across the lending lifecycle.",
    fullBio:
      "NSR comes with 25+ years of experience in End - End IT Infrastructure Management. He also has great technical expertise and industry experience to build and maintain business solutions across the mortgage lending life cycle. At OxyLoans, he is helping us to craft flexible solutions that keep up with industry trends and organization objectives.",
    advisoryFocus: "Lending Solutions & IT Architecture",
    fitMode: "contain",
  },
  {
    id: "adv_11",
    name: "Suresh Peddapalli",
    role: "Asst Manager - L&D, Broadridge Financial Services Pvt Ltd.",
    company: "Broadridge Financial Services",
    department: "Advisory Board",
    teamType: "Advisory Board",
    category: "Corporate & Global Strategy",
    badge: "LEARNING & FINTECH",
    badgeColor: "green",
    image: sureshImg,
    fallbackInitials: "SP",
    linkedin: "https://www.linkedin.com/in/suresh-peddapalli-0bb9297/",
    summary:
      "Passionate about FinTech startups. Experienced in developing soft skills, leadership training, and educational content for the financial services sector.",
    fullBio:
      "Suresh is passionate about FinTech start-ups. He helps in providing advanced communications, technology, data and analytics solutions for the financial services industry and businesses. He got profound experience in Developing and Delivering Soft Skills and Leadership Development training courses. At OxyLoans, SP is helping us to design right content to educate people about Peer 2 Peer Lending.",
    advisoryFocus: "P2P Education & Financial Literacy Content",
    fitMode: "contain",
  },
  {
    id: "adv_12",
    name: "Sama Srinivas",
    role: "Head Structures, Engineer's Office (EO), Dubai | GMP (IIM-A)",
    company: "Engineer's Office (EO), Dubai",
    department: "Advisory Board",
    teamType: "Advisory Board",
    category: "Infrastructure & Logistics",
    badge: "STRUCTURAL DESIGN",
    badgeColor: "indigo",
    image: null,
    fallbackInitials: "SS",
    linkedin: "https://www.linkedin.com/in/sama-srinivas/",
    summary:
      "Chartered Structural Engineer with 20+ years in the Gulf. Actively participated in structural design of the world's tallest buildings in Dubai. IIM-A Alum.",
    fullBio:
      "Mr Sama is a Chartered structural engineer and working in Gulf countries for more than 20 years, currently working with EO Dubai, Previously worked for TATA group India. He is part of the team who has actively participated in the structural design of the world's tallest buildings in Dubai. He is Alumni of Indian Institute of Management, Ahmedabad.",
    advisoryFocus: "Structural Assets & High-Value Real Estate",
    fitMode: "contain",
  },
];

// All Combined Team Members
export const allTeamData = [...managementTeamData, ...advisoryTeamData];

// Alias for backwards compatibility
export const initialTeamData = allTeamData;
