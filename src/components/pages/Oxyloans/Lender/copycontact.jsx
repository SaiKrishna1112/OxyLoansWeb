import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  getcontactdeatils,
  getemailcontent,
} from "../../../HttpRequest/afterlogin";
import Header from "../../../Header/Header";
import SideBar from "../../../SideBar/SideBar";
import Footer from "../../../Footer/Footer";
import { Button, Table } from "antd";

const Mycontacts = () => {
  const [contactdata, setcontactData] = useState({
    apidata: [],
    hasdata: false,
    loading: true,
    pageNo: 1,
    pageSize: 5,
    selectAll: false,
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
    return () => {};
  }, []);

  const datasource = contactdata.apidata.map((apidata, index) => ({
    id: index + 1,
    Email: apidata.emailAddress,
    ContactName: apidata.contactName,
    Invite: contactdata.selectAll ? (
      <input type="checkbox" checked />
    ) : (
      <input type="checkbox" onClick={() => handleCheckboxClick(index + 1)} />
    ),

    // ),
  }));

  useEffect(() => {
    const getemail = async () => {
      try {
        const response = await getemailcontent(); // Assuming getemailcontent is an async function
        setcontactData({
          ...contactdata,
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
  const handleCheckboxClick = (id) => {};
  const column = [
    {
      title: "Email",
      dataIndex: "Email",
      sorter: (a, b) => a.Email.length - b.Email.length,
    },
    {
      title: "ContactName",
      dataIndex: "ContactName",
      sorter: (a, b) => a.ContactName.length - b.ContactName.length,
    },
    {
      title: "Invite",
      dataIndex: "Invite",
      sorter: (a, b) => a.Invite.length - b.Invite.length,
    },

    ,
  ];

  useEffect(() => {
    return () => {};
  }, [contactdata.selectAll]);

  const HandleselectClick = () => {
    setcontactData({
      ...contactdata,
      selectAll: !contactdata.selectAll,
    });

    // handlapplyemail()
  };
  const handlapplyemail = () => {
    contactdata.apidata.map((data) => {
      setcontactData({
        ...contactdata,
        email: data.emailAddress,
      });
    });
  };

  return (
    <>
      <div className="main-wrapper">
        {/* Header */}
        <Header />

        {/* Sidebar */}
        <SideBar />

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
                      <Link to="/dashboard">Dashboard</Link>
                    </li>
                    <li className="breadcrumb-item active">Salary</li>
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
                          <button className="btn btn-outline-primary me-2">
                            Send Invite
                          </button>
                          {/* <Link className="btn btn-warning"  onClick={HandleselectClick}>
                            Invite All
                          </Link> */}
                          <Button
                            className="btn btn-warning"
                            onClick={HandleselectClick}
                          >
                            {contactdata.selectAll ? (
                              <>Deselect All</>
                            ) : (
                              <>Invite All</>
                            )}
                          </Button>
                        </div>
                      </div>
                    </div>
                    {/* /Page Header */}
                    <div className="table-responsive">
                      <Table
                        className="table border-0 star-student  table-center mb-0"
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
      </div>
      {/* /Main Wrapper */}
    </>
  );
};

export default Mycontacts;
