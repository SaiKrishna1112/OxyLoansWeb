import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  getcontactdeatils,
  sendInvait,
  getemailcontent,
} from "../../../HttpRequest/afterlogin";
import Footer from "../../../Footer/Footer";
import "../Lender/Mycontacts.css";
import { Button, Table } from "antd";
import Result1 from "../Lender/Result1";

import BorrowerHeader from "../../../Header/BorrowerHeader";
import BorrowerSidebar from "../../../SideBar/BorrowerSidebar";

const Mycontacts = () => {
  const [contactdata, setcontactData] = useState({
    apidata: [],
    hasdata: false,
    loading: true,
    pageNo: 1,
    pageSize: 5,
    selectAll: false,
    setsuccessMessage: "",
    model: true,
  });

  const [message, setmesage] = useState({
    email: "",
    emailcontent: "",
    emailsubject: "",
    buttomemail: "",
  });

  useEffect(() => {
    const getemailcontact = async () => {
      const response = getcontactdeatils();
      response.then((data) => {
        if (data.request.status == 200) {
          setcontactData({
            ...contactdata,
            apidata: data.data,
            loading: false,
            hasdata: data.data.length == 0 ? false : true,
          });
        }
      });
    };
    getemailcontact();

    const getemail = async () => {
      try {
        const response = await getemailcontent(); // Assuming getemailcontent is an async function
        setmesage({
          ...message,
          emailcontent: response.data.mailContent,
          emailsubject: response.data.mailSubject,
          buttomemail: response.data.bottomOfTheMail,
        });

        if (response.status === 200) {
        } else {
        }
      } catch (error) {
        console.error("Error:", error);
      }
    };

    getemail();
    return () => {};
  }, []);

  const datasource = contactdata.apidata.map((apidata, index) => ({
    id: index + 1,
    Email: apidata.emailAddress,
    ContactName: apidata.contactName,
    Invite: contactdata.selectAll ? (
      <input type="checkbox" checked />
    ) : (
      <input
        type="checkbox"
        onClick={() =>
          handleCheckboxClick(
            index + 1,
            apidata.contactName,
            apidata.emailAddress
          )
        }
      />
    ),

    // ),
  }));

  const handleCheckboxClick = (id, name, email) => {
    const combined = `${name ? name + "-" : "-"}${email}`;

    setmesage({
      ...message,
      email: combined,
    });
  };

  // const handleClick = () => {
  //   setModel({
  //     ...module,
  //   });
  // };
  const column = [
    {
      title: "Email",
      dataIndex: "Email",
      sorter: (a, b) => a.Email.length - b.Email.length,
    },
    {
      title: "Contact Name",
      dataIndex: "ContactName",
      sorter: (a, b) => a.ContactName.length - b.ContactName.length,
    },
    {
      title: "Invite",
      dataIndex: "Invite",
    },
  ];

  useEffect(() => {
    return () => {};
  }, [contactdata.selectAll]);
  const userName = localStorage.getItem("userName");
  const handleSelectClick = () => {
    // Update selectAll in contactData
    setcontactData((prevContactData) => ({
      ...prevContactData,
      selectAll: !prevContactData.selectAll,
    }));

    const emailAddresses = contactdata.apidata.map((data) => data.emailAddress);
    const contactNames = contactdata.apidata.map((data) => data.contactName);

    const combinedData = emailAddresses.map((email, index) => {
      const name = contactNames[index];
      return `${name ? name + "-" : "-"}${email}`;
    });

    // Join the combined data with commas
    const combinedEmails = combinedData.join(",");

    setmesage({
      ...message,
      email: combinedEmails,
    });
  };

  const handlesendInvaite = () => {
    const response = sendInvait(
      message.email,
      message.emailcontent,
      message.emailsubject
    );
    response.then((data) => {});
  };

  return (
    <>
      <div className="main-wrapper">
        {/* Header */}
        <BorrowerHeader />

        {/* Sidebar */}
        <BorrowerSidebar />

        {/* Page Wrapper */}
        <div className="page-wrapper">
          <div className="content container-fluid">
            {/* Page Header */}
            <div className="page-header">
              <div className="row align-items-center">
                <div className="col">
                  <h3 className="page-title">My Gmail Contacts</h3>
                  <ul className="breadcrumb">
                    <li className="breadcrumb-item">
                      <Link to="/borrowerDashboard">Dashboard</Link>
                    </li>
                    <li className="breadcrumb-item active">My Contact</li>
                  </ul>
                </div>
              </div>
            </div>
            {/* /Page Header */}
            <div className="row">
              <div className="col-sm-12">
                <div className="card card-table">
                  <div className="card-body">
                    {/* Page Header */}
                    <div className="page-header">
                      <div className="row align-items-center">
                        <div className="col">
                          <h3 className="page-title"></h3>
                        </div>
                        <div className="col-auto text-end float-end ms-auto download-grp">
                          <Link
                            to="#"
                            className="btn btn-outline-primary me-2"
                            onClick={handlesendInvaite}
                          >
                            <i className="fa-solid fa-share mx-1"></i> Send
                            Invite
                          </Link>

                          <Button
                            className="btn btn-warning h-100 text-white"
                            style={{ marginRight: "8px" }}
                            onClick={handleSelectClick}
                          >
                            {contactdata.selectAll ? (
                              <>De select All</>
                            ) : (
                              <>
                                <i className="fa-solid fa-share mx-1"></i>{" "}
                                Invite All
                              </>
                            )}
                          </Button>

                          <button
                            type="button"
                            className="btn btn-primary"
                            data-bs-toggle="modal"
                            data-bs-target="#exampleModal"
                          >
                            Preview
                          </button>
                        </div>
                      </div>
                    </div>
                    {/* /Page Header */}
                    <div className="table-responsive">
                      {contactdata.setsuccessMessage && (
                        <Result1 message={contactdata.setsuccessMessage} />
                      )}
                      <Table
                        className="table border-0 star-student table-hover table-center mb-0 datatable table-striped dataTable no-footer"
                        pagination={{
                          total: datasource.length,
                          defaultPageSize: 5,
                          showTotal: (total, range) =>
                            `Showing ${range[0]} to ${range[1]} of ${total} entries`,
                          position: ["topRight"],
                          showLessItems: true,
                        }}
                        columns={column}
                        dataSource={datasource}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <Footer />
        </div>
        <div
          className="modal fade"
          id="exampleModal"
          tabindex="-1"
          aria-labelledby="exampleModalLabel"
          aria-hidden="true"
        >
          {/* <div class="modal-dialog modal-md"> */}
          <div className="modal-dialog modal-md">
            <div className="modal-content">
              <div className="modal-header">
                <h1 className="modal-title fs-5" id="exampleModalLabel">
                  {" "}
                  Here is the email invitation preview
                </h1>
                <button
                  type="button"
                  className="btn-close"
                  data-bs-dismiss="modal"
                  aria-label="Close"
                ></button>
              </div>
              <div className="modal-body">
                <p>
                  Subject:- {userName} || OxyLoans - Interesting FinTech
                  Platform
                </p>
                <p className="imagecard">Date:- 2022/06/05</p>
                <p>Hi</p>

                <br></br>

                <p>
                  Greetings from ! I am an existing lender in OxyLoans.com!
                  OXYLOANS.com– RBI Approved Peer 2 Peer Lending Platform.
                  OxyLoans enables every individual to Lend Money Like A Bank.
                </p>

                <p>
                  Greetings from {userName} ! I am an existing LENDER in
                  OxyLoans.com! OXYLOANS.com– RBI Approved Peer 2 Peer Lending
                  Platform. OxyLoans enables every individual to lend money like
                  a bank. I am investing multiples of INR 50,000 in numerous
                  deals, distributing risk, and maximizing monthly profit. I am
                  earning a profit of on average 1.75% per montht. My friends
                  from MNCs like TCS, Microsoft, IBM, Cap Gemini, Yash, etc have
                  started their investment journey with small amounts (like 50k)
                  and currently investing in lakhs. If this interests you and
                  want to earn like them then OxyLoans is the connection.
                </p>
                <a href="">
                  <p>
                    Please join as a Lender / Investor and start earning monthly
                    income.
                  </p>
                </a>
                <p>
                  OxyLoans is founded and run by Mr.RadhakrishnaThatavarti!
                  Please review his linkedin profile{" "}
                  <a
                    href="https://www.linkedin.com/in/venkata-radhakrishna-thatavarti-214b2a213/"
                    target="_blank"
                  >
                    https://www.linkedin.com/in/venkata-radhakrishna-thatavarti-214b2a213/
                  </a>{" "}
                  I am sending this e-mail on my own interest, I have
                  experienced good response directly from the founder and
                  respective team. Please feel free to reach me on 221455225.
                </p>

                <p>Thanks & Regards,</p>
                {/* <p>JOHN DOE DOE.</p> */}
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  data-bs-dismiss="modal"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* /Main Wrapper */}
    </>
  );
};

export default Mycontacts;
