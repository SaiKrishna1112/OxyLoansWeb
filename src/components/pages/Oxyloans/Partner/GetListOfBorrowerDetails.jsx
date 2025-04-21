import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Header from "../../../Header/Header";
import SideBar from "../../../SideBar/SideBar";
import { Table } from "antd";
import { onShowSizeChange, itemRender } from "../../../Pagination";
import { getMyTransactions } from "../../../HttpRequest/afterlogin";
import { downloadMytransactionAlert, partnerrequestInfoError } from "../../Base UI Elements/SweetAlert";
import { getListOfBorrowerDetailsapi } from "../../../HttpRequest/partner";
import PartnerHeader from "../../../Header/PartnerHeader";
import PartnerSideBar from "../../../SideBar/PartnerSideBar";

const GetListOfBorrowerDetails = () => {
  const [mytransactions, setmytransactions] = useState({
    apiData: "",
    hasdata: false,
    loading: true,
    pageNo: 1,
    pageSize: 6,
    defaultPageSize: 6,
    donloadlink: "",
  });



  const mytransactionpagination = (dats) => {
    setmytransactions({
      ...mytransactions,
      defaultPageSize: dats.pageSize,
      pageNo: dats.current,
      pageSize: dats.pageSize,
    });
  };


  useEffect(() => {
    const response = getListOfBorrowerDetailsapi();
  
    response.then((data) => {
      console.log(data.data)
      //   if (data.response.status !== 200) {
      // partnerrequestInfoError(data.response.data.errorMessage)
         
      //  }
      if (data.request.status == 200) {
        setmytransactions({
          ...mytransactions,
          apiData: data.data.partnerRequestResponse,
          loading: false,
          hasdata: true
        });
      }
   
    });

  }, []);

  
  const datasource = [];


  {
    mytransactions.apiData != ""
      ? mytransactions.apiData.map((data) => {
          datasource.push({
            partnerId:data.partnerId,
            TransactionDate: data.name,
            CreditedAmount: data.email,
            DebitedAmount: data.mobileNumber,
            DebitedAmount: data.borrowerId,
            Status: data.status == null ? " No data found" : data.status,
          });
        })
      : "";
  }
            // partnerId:data.partnerId,
            // TransactionDate: data.name,
            // CreditedAmount: data.email,
            // DebitedAmount: data.mobileNumber,
            // borrowerId: data.borrowerId,
            // Status: data.status == null ? " No data found" : data.status,
  const columns = [
  {
      title: "Partner Id",
      dataIndex: "partnerId",
      sorter: (a, b) => a.raisedon - b.raisedon,
    },
    {
      title: "Name",
      dataIndex: "TransactionDate",
      sorter: (a, b) => a.raisedon - b.raisedon,
    },
    {
      title: "Email",
      dataIndex: "CreditedAmount",
      sorter: (a, b) => a.CreditedAmount - b.CreditedAmount,
    },
    {
      title: "MobileNumber",
      dataIndex: "DebitedAmount",
      sorter: (a, b) => a.DebitedAmount - b.DebitedAmount,
    },
    {
      title: "borrowerId",
      dataIndex: "borrowerId",
      sorter: (a, b) => a.Status - b.Status,
    },
      {
      title: "Status",
      dataIndex: "Status",
      sorter: (a, b) => a.Status - b.Status,
    },
  ];

  const handeltranscationAlert = () => {
    downloadMytransactionAlert();
  };

  return (
    <>
      <div className="main-wrapper">
        <PartnerHeader />
        <PartnerSideBar />
        {/*Page wrapper */}
        <div className="page-wrapper">
          <div className="content container-fluid">
            {/*Page Header */}
            <div className="page-header">
              <div className="row">
                <div className="col">
                  <h3 className="page-title">
                    {/* Get */}
                    List Of BorrowerDetails</h3>
                  <ul className="breadcrumb">
                    <li className="breadcrumb-item">
                      <Link to="/dashboard">Dashboard</Link>
                    </li>
                    <li className="breadcrumb-item active">List Of BorrowerDetails</li>
                  </ul>
                </div>
              </div>
            </div>
            {/* /Page Header */}

            <div className="row">
              <div className="col-sm-12">
                <div className="card">
               
                  <div className="card-body">
                    <div>
                      <Table
                        className="table-responsive table-responsive-md table-responsive-lg table-responsive-xs"
                        pagination={{
                          total: datasource.length,
                          defaultPageSize: mytransactions.defaultPageSize,
                          showTotal: (total, range) =>
                            `Showing ${range[0]} to ${range[1]} of ${total} entries`,
                          position: ["topRight"],
                          showSizeChanger: false,
                          onShowSizeChange: onShowSizeChange,
                          size: "default",
                          showLessItems: true,
                          pageSizeOptions: [5, 10, 15, 20],
                          responsive: true,
                        }}
                        columns={columns}
                        dataSource={mytransactions.hasdata ? datasource : []}
                        expandable={true}
                        loading={mytransactions.loading}
                        onChange={mytransactionpagination}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/*Page wrapper */}
      </div>
    </>
  );
};

export default GetListOfBorrowerDetails;
