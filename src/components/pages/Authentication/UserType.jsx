import React from 'react';
import logo from '../../../assets/img/oxylogodashboard.png';
import './UserType.css';
import { Link } from 'react-router-dom';

const UserType = () => {
  const handleMouseOver = (e) => {
    e.target.style.backgroundColor = "#0056b3";
  };

  const handleMouseOut = (e) => {
    e.target.style.backgroundColor = "#007bff";
  };

  const openNav = () => {
    document.getElementById("ut-mySidenav").style.width = "250px";
  };

  const closeNav = () => {
    document.getElementById("ut-mySidenav").style.width = "0";
  };

  return (
    <>
      <div className="ut-wrapper">
        {/* Sticky Bar */}
        <div className="ut-stickybar">
          <marquee
            behavior="scroll"
            direction="left"
            onMouseOver={(e) => e.currentTarget.stop()}
            onMouseOut={(e) => e.currentTarget.start()}
          >
            <a href="#" className="ut-stickybar-link">
              M/S SRS FINTECHLABS PVT. LTD (OxyLoans) is now registered as an{' '}
              <b>NBFC-P2P</b> with <b>RBI</b>. <b>Disclaimer</b>: The company is
              having a valid certificate of Registration dated Feb 06 2019 issued
              by the Reserve Bank of India under Section 45 IA of the Reserve Bank
              of India Act, 1934. However, the RBI does not accept any
              responsibility or guarantee about the present position as to the
              financial soundness of the company or for the correctness of any of
              the statements or representations made or opinions expressed by the
              company and for repayment of deposits/discharge of liabilities by
              the company.
            </a>
          </marquee>
        </div>

        {/* Header */}
        <header className="ut-main-header header-beforeLogin">
          <div className="row">
            <div className="col-md-11">
              <a href="https://oxyloans.com/" className="ut-logo">
                <img
                  src="https://www.oxyloans.com/new/assets/images/logo.png?oxy=6"
                  alt="OxyLoans Logo"
                  className="ut-logo-img"
                />
              </a>
            </div>
            <div className="col-md-1">
              <div className="navbar-header ut-newHeadernav">
                <a href="#" onClick={openNav}>
                  <span className="glyphicon ut-showMyNav">&#9776;</span>
                </a>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="navbar navbar-static-top newposition ut-sidenav" id="ut-mySidenav">
            <div className="navbar-custom-menu">
              <a className="ut-close ut-showmyCloseNav pull-right ut-closebtn" onClick={closeNav} href="#">
                &times;
              </a>
              <ul className="nav navbar-nav">
                <li><a href="https://oxyloans.com/personal-loans/">Personal Loans</a></li>
                <li><a href="https://oxyloans.com/management">Team</a></li>
                <li><a href="https://oxyloans.com/lender/">Lender</a></li>
                <li><a href="https://oxyloans.com/borrower/">Borrower</a></li>
                <li><a href="/">Sign In</a></li>
                <li><a href="/userType">Join Today</a></li>
              </ul>
            </div>
          </nav>
        </header>
      </div>

      <div className="ut-container">
        <div className="ut-note">
          <p>
            <strong>Note:</strong> Currently, we are processing loans for students
            who opt for global education only.
          </p>
        </div>
        <div className="ut-sections">
          <div>
            <Link to="/borrower_register">
              <h5 className="section-title">
                <i className="fa-regular fa-money-bill-1"></i>{' '}
                Are You Looking for a Loan?
              </h5>
              <div className="ut-card ut-borrower">
                <h3>
                  Register as a Borrower
                  <i
                    className="fa-solid fa-arrow-right"
                    style={{ fontSize: "20px", marginLeft: "10px", marginTop: "5px" }}
                  ></i>
                </h3>
                <img
                  src="https://www.oxyloans.com/new/assets/images/needloan.jpg?oxy=1"
                  alt="Need Loan"
                  className="ut-img"
                />
              </div>
            </Link>
          </div>
          <div>
            <Link to="/register">
              <h5 className="section-title">
                <i className="fa-solid fa-arrow-trend-up"></i>{' '}
                Lend and Earn Better Returns?
              </h5>
              <div className="ut-card ut-lender">
                <h3>
                  Register as a Lender
                  <i
                    className="fa-solid fa-arrow-right"
                    style={{ fontSize: "20px", marginLeft: "10px", marginTop: "5px" }}
                  ></i>
                </h3>
                <img
                  src="https://www.oxyloans.com/new/assets/images/giveloan.jpg?oxy=1"
                  alt="Give Loan"
                  className="ut-img"
                />
              </div>
            </Link>
          </div>
        </div>
        <footer className="ut-footer">
          <p>Copyright &copy; 2016 OxyLoans.com. All rights reserved.</p>
          <p>Version 2.4.0</p>
        </footer>
      </div>
    </>
  );
};

export default UserType;
