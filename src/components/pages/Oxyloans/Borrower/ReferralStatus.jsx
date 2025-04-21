import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import BorrowerHeader from "../../../Header/BorrowerHeader";
import BorrowerSidebar from "../../../SideBar/BorrowerSidebar";
import { Myreferal, downloadreferal } from "../../../HttpRequest/afterlogin";
import Footer from "../../../Footer/Footer";
import { Table } from "antd";
import { onShowSizeChange } from "../../../Pagination";
import { Success } from "../../Base UI Elements/SweetAlert";

const ReferralStatus = () => {
  const [referdata, setreferaldata] = useState({
    apiData: "",
    hasdata: false,
    loading: true,
    pageNo: 1,
    pageSize: 5,
    defaultPageSize: 5,
    datasource: [],
    nriinvite: false,
    inviteborrowerlink: false,
    invaitlenderlink: false,
  });
  const [copySuccess, setCopySuccess] = useState(false);
  const [referlink, setrefer] = useState("");

  const downloadReferalStatusFileInfo = () => {
    Success("success", "Referral  Status File Download");
    window.open(referlink, "_blank");
  };

  const referdashboardPagination = (Pagination) => {
    setreferaldata({
      ...referdata,
      defaultPageSize: Pagination.pageSize,
      pageNo: Pagination.current,
      pageSize: Pagination.pageSize,
    });
  };

  useEffect(() => {
    const response = Myreferal(referdata.pageNo, referdata.pageSize);
    response.then((data) => {
      if (data.request.status == 200) {
        setreferaldata({
          ...referdata,
          apiData: data.data,
          loading: false,
          hasdata:
            data.data.listOfLenderReferenceDetails.length == 0 ? false : true,
        });
      }
    });
    downloadreferalstatus();
    return () => {};
  }, [referdata.pageNo, referdata.pageSize]);

  const datasource = [];

  {
    referdata.apiData != ""
      ? referdata.apiData.listOfLenderReferenceDetails.map((data) => {
          datasource.push({
            key: Math.random(),
            Email: data.refereeEmail,
            UserName: data.refereeName,
            MobileNumber: data.refereeMobileNumber,
            Status: data.status,
            ReferredOn: data.referredOn,
            ViewReferee: (
              <span className="badge badge-danger" type="button">
                View Referee
              </span>
            ),
          });
        })
      : "";
  }
  const downloadreferalstatus = async () => {
    const response = downloadreferal();

    response.then((data) => {
      if (data.request.status == 200) {
        setrefer(data.data.downloadUrl);
      }
    });
  };

  const Invitelender = async () => {
    const userId = localStorage.getItem("userType");
    const input = document.createElement("input");
    input.value = `https://www.oxyloans.com/new/register_lender?ref=${userId}`;
    document.body.appendChild(input);
    input.select();
    document.execCommand("copy");
    document.body.removeChild(input);

    setreferaldata({
      ...referdata,
      invaitlenderlink: !referdata.invaitlenderlink,
    });
  };

  const column = [
    {
      title: "User Name",
      dataIndex: "UserName",
      sorter: (a, b) => a.UserName.length - b.UserName.length,
    },
    {
      title: "Email",
      dataIndex: "Email",
      sorter: (a, b) => a.Email.length - b.Email.length,
    },
    {
      title: "Mobile Number",
      dataIndex: "MobileNumber",
      sorter: (a, b) => a.MobileNumber.length - b.MobileNumber.length,
    },
    {
      title: "Status",
      dataIndex: "Status",
      sorter: (a, b) => a.Status.length - b.Status.length,
    },

    {
      title: "Referred On",
      dataIndex: "ReferredOn",
      sorter: (a, b) => new Date(a.ReferredOn) - new Date(b.ReferredOn),
    },
  ];

  const handlenriinvite = () => {
    const userId = localStorage.getItem("userType");
    const input = document.createElement("input");
    input.value = `https://www.oxyloans.com/new/nrilenderregistration?ref=${userId}`;
    document.body.appendChild(input);
    input.select();
    document.execCommand("copy");
    document.body.removeChild(input);
    setreferaldata({
      ...referdata,
      nriinvite: !referdata.nriinvite,
    });
  };
  const Inviteborrower = () => {
    const userId = localStorage.getItem("userType");
    const input = document.createElement("input");
    input.value = `https://www.oxyloans.com/new/register_borrower?ref=${userId}`;
    document.body.appendChild(input);
    input.select();
    document.execCommand("copy");
    document.body.removeChild(input);
    setreferaldata({
      ...referdata,
      inviteborrowerlink: !referdata.inviteborrowerlink,
    });
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
                  <h3 className="page-title">Referral Info</h3>
                  <ul className="breadcrumb">
                    <li className="breadcrumb-item">
                      <Link to="/dashboard">Dashboard</Link>
                    </li>
                    <li className="breadcrumb-item active">Referral Status</li>
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
                        <div className="col-12 text-start float-left ms-auto download-grp">
                          <button
                            onClick={downloadReferalStatusFileInfo}
                            className="btn btn-danger me-2 text-white"
                          >
                            <i className="fa-solid fa-download mx-1"></i>{" "}
                            Referral Status
                          </button>
                          <button
                            onClick={Inviteborrower}
                            className="btn btn-warning me-2 text-white"
                          >
                            {referdata.inviteborrowerlink ? (
                              <>copied</>
                            ) : (
                              <>
                                <i className="fa-solid fa-user mx-1"></i>Invite
                                Borrower
                              </>
                            )}
                          </button>
                          <button
                            onClick={handlenriinvite}
                            className="btn btn-info me-2 text-white"
                          >
                            {referdata.nriinvite ? (
                              <> copied</>
                            ) : (
                              <>
                                <i className="fa-solid fa-plane-departure mx-1"></i>
                                Invite an NRI
                              </>
                            )}
                          </button>

                          <button
                            onClick={Invitelender}
                            className="btn btn-success me-2 text-white"
                          >
                            {/* {copySuccess ? 'Link Copied!' : 'Invite A lender'} */}

                            {referdata.invaitlenderlink ? (
                              <> copied</>
                            ) : (
                              <>
                                <i className="fa-solid fa-user mx-1"></i> Invite
                                Lender
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                    {/* /Page Header */}
                    <div className="table-responsive">
                      <Table
                        className="table border-0 star-student table-hover table-center mb-0 datatable table-striped dataTable no-footer"
                        pagination={{
                          total: referdata.apiData.countOfReferees,
                          defaultPageSize: referdata.defaultPageSize,
                          showTotal: (total, range) =>
                            `Showing ${range[0]} to ${range[1]} of ${total} entries`,
                          size: "default",
                          showLessItems: true,
                          pageSizeOptions: [5, 10, 15, 20],
                          responsive: true,
                          position: ["topRight"],
                          showSizeChanger: false,
                          onShowSizeChange: onShowSizeChange,
                        }}
                        columns={column}
                        expandable={true}
                        dataSource={referdata.hasdata ? datasource : []}
                        loading={referdata.loading}
                        onChange={referdashboardPagination}
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

export default ReferralStatus;
