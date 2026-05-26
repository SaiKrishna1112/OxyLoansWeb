import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Scrollbars } from "react-custom-scrollbars";

const OxyloansAdminSidebar = () => {
  const [isSideMenu, setSideMenu] = useState("");
  const [dealsOpen, setDealsOpen] = useState(false);
  // const pathName = useLocation().pathname;
  const [openSubmenus, setOpenSubmenus] = useState({});
  const { pathname } = useLocation();
  const primaryType=localStorage.getItem("primaryType")
  const userId=sessionStorage.getItem("userId")

  // console.log({primaryType})

  const toggleSubmenu = (key) => {
    setOpenSubmenus((prev) => {
      const newSubmenus = {};
  
      // Close all other submenus, open only the clicked one
      Object.keys(prev).forEach((k) => {
        newSubmenus[k] = false;
      });
  
      // Toggle current key
      newSubmenus[key] = !prev[key];
  
      return newSubmenus;
    });
  };
  

  const toggleSidebar = (value) => {
    setSideMenu(value === isSideMenu ? "" : value);
  };

  useEffect(() => {
    function handleMouseOver(e) {
      e.stopPropagation();
      if (
        document.body.classList.contains("mini-sidebar") &&
        document.querySelector("#toggle_btn")?.offsetParent !== null
      ) {
        const targ = e.target.closest(".sidebar");
        if (targ) {
          document.body.classList.add("expand-menu");
          document
            .querySelectorAll(".subdrop + ul")
            .forEach((ul) => (ul.style.display = "block"));
        } else {
          document.body.classList.remove("expand-menu");
          document
            .querySelectorAll(".subdrop + ul")
            .forEach((ul) => (ul.style.display = "none"));
        }
      }
    }

    document.addEventListener("mouseover", handleMouseOver);
    return () => document.removeEventListener("mouseover", handleMouseOver);
  }, []);


  const menuItems = [
    {
      key: "OxyloansAdminDashboard",
      label: "Dashboard",
      link: "/oxyloansadmindashboard",
      icon: "fa-solid fa-gauge",
      type: ["ADMIN", "HELPDESKADMIN"], // Show to all roles
    },
    {
      key: "RadhaDashboard",
      label: "Radha Dashboard",
      link: "/radhaDashboard",
      icon: "fa-solid fa-gauge",
      type: ["ADMIN"], // Show to all roles
    },
    {
      key:"DealsInfo",
      label:"Deals Info",
      link:"/dealsInfo",
      icon:"fa-solid fa-handshake",
      type:["ADMIN"]
    },
    {
      key: "adminAIDashboard",
      label: "AI Platform Stats",
      link: "/adminAIDashboard",
      icon: "fa-solid fa-robot",
      type: ["ADMIN"],
    },
    {
      key: "adminAIReconciliation",
      label: "AI Reconciliation",
      link: "/adminAIReconciliation",
      icon: "fa-solid fa-robot",
      type: ["ADMIN"],
    },
    {
      key: "lenderLoanApplications",
      label: "Lender Loan Applications",
      link: "/lenderLoanApplications",
      icon: "fa-solid fa-file-lines",
      type: [ "HELPDESKADMIN","ADMIN"]    },
    {
      key: "borrowerLoanApplications",
      label: "Borrower Loan Applications",
      link: "/borrowerLoanApplications",
      icon: "fa-solid fa-file-lines",
      type: [ "HELPDESKADMIN","ADMIN"]    },
    {
  key: "failedborrowers",
  label: "Failed borrowers",
  link: "/failedborrowers",
  icon: "fa-solid fa-triangle-exclamation",
  type: ["HELPDESKADMIN", "ADMIN"]
},
      {
      key: "activeLenders",
      label: "Active Lenders",
      link: "/activeLendersParticipation",
      icon: "fa-solid fa-file-lines",
      type: [ "HELPDESKADMIN","ADMIN"]    },
    {
      key: "participationamountinfo",
      label: " Participation Amount Info",
      link: "/participatedAmountInfo",
      icon: "fas fa-chart-line",
      type: ["ADMIN","HELPDESKADMIN"],
    },
    {
      key: "uploadfile",
      label: "Upload File",
      link: "/uploadFile",
      icon: "fa-solid fa-file-arrow-up",
      type: ["ADMIN"],
    },
    {
      key: "monthlyInterestLenders",
      label: "Monthly Interest Lenders",
      link: "/monthlyInterest",
      icon: "fas fa-calendar-alt",
      type: ["ADMIN"],
    },
    {
      key: "interestDetailsTable",
      label: "Interest Details Table",
      link: "/interestDetailsTable",
      icon: "fas fa-chart-bar",
      type: ["ADMIN"],
    },
    
    {
      key: "ParticipationList",
      label: "Offline Participation List",
      link: "/participationList",
      icon: "fas fa-file-invoice-dollar",
      type: ["ADMIN"],
    },
     {
      key: "userparticipationlist",
      label: "User Participation List",
      link: "/userParticipationlist",
      icon: "fa-solid fa-users",
      type: ["ADMIN"],
    },
    {
      key: "emi",
      label: "Borrower Details",
      link: "/Emi",
      icon: "fa-solid fa-person",
      type: ["ADMIN"],
    },
    {
      key: "cicReports",
      label: "CIC Reports",
      link: "/cicReports",
      icon: "fa-solid fa-file-lines",
      type: ["ADMIN"],
    },
    {
      key: "helpdesk",
      label: "Help Desk",
      icon: "fa-solid fa-headset",
      children: [
        { key: "lenderqueries", label: "Lender Queries", link: "/lenderqueries" },
        { key: "borrowerqueries", label: "Borrower Queries", link: "/borrowerqueries" },
        { key: "resolvedlender", label: "Resolved Lender Queries", link: "/resolvedlender" },
        { key: "resolvedborrower", label: "Resolved Borrower Queries", link: "/resolvedborrower" },
      ],
      type: ["HELPDESKADMIN"]    
    },
    // {
    //   key: "assignedUsers",
    //   label: "Assigned Users",
    //   link: "/assignedUsersforCallers",
    //   icon: "fa-solid fa-file-lines",
    //   type: ["ADMIN", "HELPDESKADMIN"]    },
    {
      key: "registerlender",
      label: "Register Lender",
      icon: "fa-solid fa-users",
      children: [
        { key: "participatedsixmothsago", label: "Participated 6 months ago", link: "/participatedsixmothsago" },
        { key: "walletloadednotpatcipated", label: "Wallet Loaded not participated", link: "/walletloadednotpatcipated" },
        { key: "notparticipatedlendersindeal", label: "Not participated", link: "/notparticipatedlendersindeal" },
        { key: "onlyonceparticipatedlenders", label: "Only once participated lenders", link: "/onlyonceparticipatedlenders" },
        { key: "onlytwiceparticipatedlenders", label: "Only Twice participated Lenders", link: "/onlytwiceparticipatedlenders" },
        { key: "Morethanhundredlenders", label: "More than hundred deals", link: "/Morethanhundredlenders" },
        { key: "Emailwhatsappverified", label: "Email whatsapp not verified", link: "/Emailwhatsappverified" },
        { key: "morethantenlakhs", label: "More than ten lakhs", link: "/morethantenlakhs" },

      ],
      type: ["HELPDESKADMIN"]    },
    {
      key: "deals",
      label: "Deals",
      icon: "fas fa-user",
      children: [
        { key: "viewstudentdeals", label: "View Student Deals", link: "/viewstudentdeals" },
        { key: "viewequitydeals", label: "View Equity Deals", link: "/viewequitydeals" },
        { key: "viewescrowsdeals", label: "View Escrow Deals", link: "/viewescrowsdeals" },
        { key: "viewsalarieddeals", label: "View Salaried Deals", link: "/viewsalarieddeals" },
        { key: "viewtestsdeals", label: "View Test Deals", link: "/viewtestsdeals" }
      ],
      type: ["HELPDESKADMIN"]    },
    {
      key: "superAdmin",
      label: "Super Admin",
      icon: "fa-solid fa-shield",
      children: [
        { key: "updateUserDetails", label: "Update User Details", link: "/updateUserDetails" },
        // { key: "walletloadednotpatcipated", label: "Wallet Loaded not participated", link: "/walletloadednotpatcipated" },
        // { key: "notparticipatedlendersindeal", label: "Not participated", link: "/notparticipatedlendersindeal" },
        // { key: "onlyonceparticipatedlenders", label: "Only once participated lenders", link: "/onlyonceparticipatedlenders" },
        // { key: "onlytwiceparticipatedlenders", label: "Only Twice participated Lenders", link: "/onlytwiceparticipatedlenders" },
        // { key: "Morethanhundredlenders", label: "More than hundred deals", link: "/Morethanhundredlenders" },
        // { key: "Emailwhatsappverified", label: "Email whatsapp not verified", link: "/Emailwhatsappverified" },
        // { key: "morethantenlakhs", label: "More than ten lakhs", link: "/morethantenlakhs" },
      ],
      type: ["ADMIN","SUPERADMIN"],
    },
    {
      key: "myCalls",
      label: "My Calls",
      link: "/myCalls",
      icon: "fa-solid fa-phone",
      type: [ "HELPDESKADMIN"]   
     },
     {
      key: "toplendersinfo",
      label: " Top Lenders Info",
      link: "/topLendersInfo",
      icon: "fas fa-chart-line",
      type: ["ADMIN","SUPERADMIN","HELPDESKADMIN"],
    },

 {
      key: "allreferredetails",
      label: "All Referre Details",
      link: "/allReferreDetails",
      icon: "fas fa-users",
      type: ["ADMIN","SUPERADMIN","HELPDESKADMIN"],
    },

  {
      key: "monthlyreturnedinterest",
      label: "Monthly Returned Interest",
      link: "/monthlyReturnedInterest",
      icon: "fas fa-hand-holding-usd",
      type: ["ADMIN","SUPERADMIN"],
    },
    {
      key: "borrowerFees",
      label: "Borrower Fees",
      icon: "fa-solid fa-indian-rupee-sign",
      children: [
        { key: "adminBorrowerCharges", label: "Borrower Charges", link: "/adminBorrowerCharges" },
        { key: "adminProcessingFees",  label: "Processing Fees",  link: "/adminProcessingFees"  },
      ],
      type: ["ADMIN", "SUPERADMIN"],
    },

  {
      key: "marketplaceAdminDashboard",
      label: "Marketplace Dashboard",
      link: "/marketplace-admin-dashboard",
      icon: "fa-solid fa-store",
      type: ["ADMIN","SUPERADMIN","HELPDESKADMIN"],
    },
  {
      key: "aiReconciliation",
      label: "AI Reconciliation",
      link: "/admin/reconciliation",
      icon: "fa-solid fa-brain",
      type: ["ADMIN","SUPERADMIN"],
    },

  ];
  


  return (
    <div className="sidebar" id="sidebar">
      {/* <Scrollbars
        autoHide
        autoHideTimeout={1000}
        autoHideDuration={200}
        autoHeight
        autoHeightMin={0}
        autoHeightMax="95vh"
        thumbSize={300}
        hideTracksWhenNotNeeded
      > */}
      <Scrollbars
  autoHide
  autoHideTimeout={1000}
  autoHideDuration={200}
  style={{ height: "100vh" }}
  thumbSize={300}
  hideTracksWhenNotNeeded
>

        <div className="sidebar-inner slimscroll">
          <div id="sidebar-menu" className="sidebar-menu">
            {/* <ul>
              <li className={pathName === "/OxyloansAdminDashboard" ? "active" : ""}>
                <Link to="/OxyloansAdminDashboard">
                  <i className="fa-solid fa-gauge"></i> <span>Dashboard</span>
                </Link>
              </li>

              <li className={pathName === "/Emi" ? "active" : ""}>
                <Link to="/Emi">
                  <i className="fa-solid fa-person"></i> <span>Borrower Details</span>
                </Link>
              </li>

              <li className={pathName === "/cicReports" ? "active" : ""}>
                <Link to="/cicReports">
                  <i className="fa-solid fa-file-lines"></i> <span>CIC Report</span>
                </Link>
              </li>

          
            </ul> */}

<ul>
  {menuItems.map((item) => {
    const isSubmenuOpen = openSubmenus[item.key];
    const isActive = pathname === item.link;

    return (
      <>
        {item.type.includes(primaryType) ? (
          <li
            key={item.key}
            className={`${item.children ? "submenu" : ""} ${
              isSubmenuOpen || isActive ? "active" : ""
            }`}
          >
            {item.children ? (
              <a
                href="#!"
                onClick={(e) => {
                  e.preventDefault();
                  toggleSubmenu(item.key);
                }}
                className="d-flex justify-between items-center"
              >
                <div>
                  <i className={item.icon}></i>
                  <span style={{ marginLeft: "16px" }}> {item.label} </span>
                </div>
                <i
                  className={`fa-solid ${
                    isSubmenuOpen ? "fa-chevron-up" : "fa-chevron-down"
                  }`}
                  style={{ marginLeft: "16px" }}
                ></i>
              </a>
            ) : (
              <Link to={item.link}>
                <i className={item.icon}></i>
                <span style={{ marginLeft: "18px", fontSize: "15px" }}> {item.label} </span>
                </Link>
            )}

            {item.children && isSubmenuOpen && (
              <ul className="sub-menu" style={{ display: "block" }}>
                {item.children.map((child) => (
                  <li key={child.key}>
                    <Link to={child.link}>{child.label}</Link>
                  </li>
                ))}
              </ul>
            )}
          </li>
        ) : null}
      </>
    );
  })}

  {/* Extra space at the bottom */}
  <div style={{ height: "8rem" }}></div>
</ul>

          </div>
        </div>
      </Scrollbars>
    </div>
  );
};

export default OxyloansAdminSidebar;
