import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Header from "../../../Header/Header";
import SideBar from "../../../SideBar/SideBar";
import { Myreferal, downloadreferal, handeldisplayMonthlyReferrersAmountapi } from "../../../HttpRequest/afterlogin";
import Footer from "../../../Footer/Footer";
import { Table } from "antd";
import { onShowSizeChange } from "../../../Pagination";
import { Success } from "../../Base UI Elements/SweetAlert";
import MyReffereeModal from "../Utills/Modals/MyReffereeModal";

const ReferalEaringsMonthWise = () => {
  const [referdata, setreferaldata] = useState({
    apiData: "",
    hasdata: false,
    loading: false,
    pageNo: 1,
    pageSize: 5,
    defaultPageSize: 5,
    datasource: [],
    reffereeData:[],
    nriinvite: false,
    inviteborrowerlink: false,
    invaitlenderlink: false,
  });

   const [modelopen, setOpen] = useState(false);

   const handlemodalopen = (data) => {
    
         setOpen(!modelopen);
     };

  const [MonthlyReferrersAmount, setMonthlyReferrersAmount] = useState({

    pageNo: 1,
    pageSize: 10,
    userId: "39016",
    month: "03",
    year: "2024"
  })


  const handelchange = (event) => {
    const { name, value } = event.target;
    setMonthlyReferrersAmount({
      ...MonthlyReferrersAmount,
      [name]: value,
    })
  }
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
    // const response = Myreferal(referdata.pageNo, referdata.pageSize);
    // response.then((data) => {
    //   if (data.request.status == 200) {
    //     setreferaldata({
    //       ...referdata,
    //       apiData: data.data,
    //       loading: false,
    //       hasdata:
    //         data.data.listOfLenderReferenceDetails.length == 0 ? false : true,
    //     });
    //   }
    // });
    downloadreferalstatus();
    return () => { };
  }, [referdata.pageNo, referdata.pageSize]);

  const datasource = [];

  {
    referdata.apiData != ""
      ? referdata.apiData.lenderReferenceAmountResponse.map((data) => {
        datasource.push({
          key: Math.random(),
          UserName: data.userName,
          Status: data.paymentStatus,
          ReferredOn: data.referredOn,
          TransferredOn: data.transferredOn,
          Remark: data.remarks,
          ReferrerId: data.referrerId,
          Earned: data.amount,
          ViewReferee: (
            <span className="badge badge-success" type="button" onClick={() => handlemodalopen(data)}>
              Break Up
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
    input.value = `https://www.user.oxyloans.com/register?ref=${userId}`;
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
      title: "Referrer Name",
      dataIndex: "UserName",
      sorter: (a, b) => a.UserName.length - b.UserName.length,
    },
    {
      title: "Referrer Id",
      dataIndex: "ReferrerId",
      sorter: (a, b) => a.ReferrerId.length - b.ReferrerId.length,
    },
    {
      title: "Earned Amount",
      dataIndex: "Earned",
      sorter: (a, b) => a.Earned.length - b.Earned.length,
    },
    {
      title: "Payment Status",
      dataIndex: "Status",
      sorter: (a, b) => a.Status.length - b.Status.length,
    },
    {
      title: "Transferred On",
      dataIndex: "TransferredOn",
      sorter: (a, b) => a.TransferredOn.length - b.TransferredOn.length,
    },

    {
      title: "Remarks",
      dataIndex: "Remark",
      sorter: (a, b) => a.Remark.length - b.Remark.length,
    },
    {
      title: "Break Up",
      dataIndex: "ViewReferee",
      // sorter: (a, b) => new Date(a.ReferredOn) - new Date(b.ReferredOn),
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


  const handeldisplayMonthlyReferrersAmount = () => {
    setreferaldata({
      ...referdata,
      loading: true,
    })
    const response = handeldisplayMonthlyReferrersAmountapi(MonthlyReferrersAmount);
    response.then((data) => {
      // console.log(data);
      if (data.status === 200) {
        console.log("call success 200");
        setreferaldata({
          ...referdata,
          apiData: data.data,
          loading: false,
          hasdata:
            data.data.lenderReferenceAmountResponse.length == 0 ? false : true,
          reffereeData: data.data.lenderReferralsResponse
        });
      }

    })
  }

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

                          {/* <p>March paid amount :INR 0</p> */}
                          <div className="row">
                            <div className="col-3">
                              <select className="form-control col-12 col-md-3 col-lg-3" name="month" onChange={handelchange}>
                                <option value=""> Select The Month</option>
                                <option value="01">January</option>
                                <option value="02">February</option>
                                <option value="03">March</option>
                                <option value="04">April</option>
                                <option value="05">May</option>
                                <option value="06">June</option>
                                <option value="07">July</option>
                                <option value="08">August</option>
                                <option value="09">September</option>
                                <option value="10">October</option>
                                <option value="11">November</option>
                                <option value="12">December</option>

                              </select>
                            </div>
                            <div className="col-3">
                              <select className="form-control col-12 col-md-3 col-lg-3" name="year" onChange={handelchange}>
                                <option value=""> Select The Year</option>
                                <option value="2022">22</option>
                                <option value="2023">23</option>
                                <option value="2024">24</option>
                                <option value="2025">25</option>
                                <option value="2026">26</option>


                              </select>
                            </div>
                            <button className="btn btn-primary col-2" onClick={handeldisplayMonthlyReferrersAmount}>Search</button>
                          </div>
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

          {/* Referee Info */}
          {modelopen && (
                      <MyReffereeModal
                        data={referdata.reffereeData}
                        open={modelopen}
                      />
                    )}

          {/* Footer */}
          <Footer />
        </div>
      </div>
      {/* /Main Wrapper */}
    </>
  );
};

export default ReferalEaringsMonthWise;
