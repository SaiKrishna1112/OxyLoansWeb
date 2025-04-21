import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Header from "../../../Header/Header";
import SideBar from "../../../SideBar/SideBar";
import { Table } from "antd";
import { onShowSizeChange } from "../../../Pagination";
import { getMyWithdrawalHistory } from "../../../HttpRequest/afterlogin";
import { cancelwithdrawalRequestInformation, partnerrequestInfoError } from "../../Base UI Elements/SweetAlert";
import PartnerHeader from "../../../Header/PartnerHeader";
import PartnerSideBar from "../../../SideBar/PartnerSideBar";
import { getStatus, partnerrequestInfoapi } from "../../../HttpRequest/partner";
import { error } from "jquery";

const PartnerrequestInfo = () => {
  const [mywithdrawalHistory, setmywithdrawalHistory] = useState({
    apiData: "",
    hasdata: true,
    loading: true,
    pageNo: 1,
    pageSize: 10,
    defaultPageSize: 10,
  });
  const mywithdrawalPagination = (Pagination) => {
    setmywithdrawalHistory({
      ...mywithdrawalHistory,
      defaultPageSize: Pagination.pageSize,
      pageNo: Pagination.current,
      pageSize: Pagination.pageSize,
    });
  };

  const confirmcancelrequest = (fromrequest, id) => {
    cancelwithdrawalRequestInformation(fromrequest, id);
  };

  useEffect(() => {
    const response = getStatus();
      response.then((data) => {
        console.log(data.data)
      if (data.status == 200) {
        setmywithdrawalHistory({
          ...mywithdrawalHistory,
          apiData: data.data,
          loading: false,
        });
      }
    });
    return () => {};
  }, []);

    

    
    
    const handelrequestborrower = async () => {
  try {
      const response = await partnerrequestInfoapi();
      if (response.response.status === 403) {
            partnerrequestInfoError(response.response.data.errorMessage)
       }
   
    if (response.status === 200) {
      setmywithdrawalHistory({
        ...mywithdrawalHistory,
        apiData: response.data,
        loading: false,
      });
        
    } 
  } catch (error) {
      
    console.error('An unexpected error occurred:', error);
  }
};


  const datasource = [];
  {
    mywithdrawalHistory.apiData != ""
      ? 
          datasource.push({
            key: Math.random(),
            raisedon: mywithdrawalHistory.apiData.partnerRequestId,
            amount: mywithdrawalHistory.apiData.partnerName,
            reason: mywithdrawalHistory.apiData.comments,
            requestedFrom: mywithdrawalHistory.apiData.adminComments,
            status: mywithdrawalHistory.apiData.status,
          })
        
      : "";
  }

    
  const columns = [
    {
      title: "Partner RequestId",
      dataIndex: "raisedon",
      sorter: (a, b) => new Date(a.raisedon) - new Date(b.raisedon),
    },
    // {
    //   title: "Partner Name",
    //   dataIndex: "amount",
    //   sorter: (a, b) => a.amount - b.amount,
    // },
    {
      title: "comments",
      dataIndex: "reason",
      sorter: (a, b) => a.reason.length - b.reason.length,
    },
    {
      title: "adminComments",
      dataIndex: "requestedFrom",
      sorter: (a, b) => a.requestedFrom.length - b.requestedFrom.length,
      },
     {
      title: "Status",
      dataIndex: "status",
      sorter: (a, b) => a.requestedFrom.length - b.requestedFrom.length,
    },

  ];

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
                  <h3 className="page-title">Requesting For Borrower</h3>
                  <ul className="breadcrumb">
                    <li className="breadcrumb-item">
                      <Link to="/dashboard">Dashboard</Link>
                    </li>
                    <li className="breadcrumb-item active">
                      Requesting For Borrower"
                    </li>
                  </ul>
                </div>
              </div>
            </div>
            {/* /Page Header */}

            <div className="row">
              <div className="col-sm-12">
                <div className="card">
                                  <div className="card-body">
                                      
                                      <button   className="btn  btn-primary"  onClick={handelrequestborrower}>Requesting For Borrower</button>
                    <div>
                      <Table
                        className="table-responsive table-responsive-md table-responsive-lg table-responsive-xs"
                        // pagination={{
                        //   total: mywithdrawalHistory.apiData.totalCount,
                        //   defaultPageSize: mywithdrawalHistory.defaultPageSize,
                        //   showTotal: (total, range) =>
                        //     `Showing ${range[0]} to ${range[1]} of ${total} entries`,
                        //   position: ["topRight"],
                        //   showSizeChanger: true,
                        //   onShowSizeChange: onShowSizeChange,
                        // }}
                        columns={columns}
                        dataSource={
                          mywithdrawalHistory.hasdata ? datasource : []
                        }
                        expandable={true}
                        loading={mywithdrawalHistory.loading}
                        onChange={mywithdrawalPagination}
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

export default PartnerrequestInfo;
