import React, { useEffect, useState, useMemo, useCallback } from "react";
import { Link } from "react-router-dom";
import Header from "../../../Header/Header";
import SideBar from "../../../SideBar/SideBar";
import "./Dashboardtable.css";
import { Table } from "antd";
import { cancelwithdrawalWalletToWallet } from "../../Base UI Elements/SweetAlert";
import { getMyWalletTowalletTransactionHistory } from "../../../HttpRequest/afterlogin";

const WalletToWalletTransactionHistory = React.memo((pros) => {
  const [mywalletTowalletHistory, setmywalletTowalletHistory] = useState({
    apiData: "",
    hasdata: false,
    loading: true,
  });

  const confirmcancelrequest = (id) => {
    cancelwithdrawalWalletToWallet(id);
  };

  const fetchData = useCallback(() => {
    const response = getMyWalletTowalletTransactionHistory();
    return response;
  }, []);

  useMemo(() => {
    fetchData()
      .then((data) => {
        if (data.request.status == 200) {
          setmywalletTowalletHistory({
            ...mywalletTowalletHistory,
            apiData: data.data,
            loading: false,
            hasdata: data.data.length == 0 ? false : true,
          });
        }
      })
      .catch((error) => {});
  }, []);

  const datasource = [];
  {
    mywalletTowalletHistory.apiData != ""
      ? mywalletTowalletHistory.apiData.map((data) => {
          datasource.push({
            key: Math.random(),
            ReceiverId: "LR" + data.receiverId,
            ReceiverName: data.receiverName, 
            amount: data.amount,
            RequestedDate: data.requestedDate,
            Amount: data.amount,
            Status: data.status,
            transformedDate:
              data.transformedDate == null
                ? "Yet to be approve"
                : data.transformedDate,
            Action: (
              <button
                type="submit"
                className="btn  w-70 btn-primary btn-xs"
                disabled={
                  data.status == "APPROVED" ||
                  data.status == "REJECTED" ||
                  data.status == "ADMIN REJECTED" ||
                  data.status == "USER REJECTED"
                    ? true
                    : false
                }
                onClick={() => {
                  confirmcancelrequest(data.id);
                }}
              >
                Cancel Request
              </button>
            ),
          });
        })
      : "";
  }

  const columns = [
    {
      title: "Receiver Id",
      dataIndex: "ReceiverId",
      sorter: (a, b) => a.ReceiverId.length - b.ReceiverId.length,
    },
    {
      title: "Receiver Name",
      dataIndex: "ReceiverName",
      sorter: (a, b) => a.ReceiverName.length - b.ReceiverName.length,
    },
    {
      title: "Amount",
      dataIndex: "amount",
      sorter: (a, b) => a.ReceiverName.length - b.ReceiverName.length,
    },
    {
      title: "Request Date",
      dataIndex: "RequestedDate",
      sorter: (a, b) => new Date(a.RequestedDate) - new Date(b.RequestedDate),
    },

    {
      title: "Approved Date",
      dataIndex: "transformedDate",
      sorter: (a, b) => a.transformedDate - b.transformedDate,
    },
    {
      title: "Status",
      dataIndex: "Status",
      sorter: (a, b) => a.Status.length - b.Status.length,
    },
    {
      title: "Action",
      dataIndex: "Action",
    },
  ];

  return (
    <>
      <div className="main-wrapper">
        <Header />
        <SideBar />
        {/*Page wrapper */}
        <div className="page-wrapper">
          <div className="content container-fluid">
            {/*Page Header */}
            <div className="page-header">
              <div className="row">
                <div className="col">
                  <h3 className="page-title">Wallet To Wallet History</h3>
                  <ul className="breadcrumb">
                    <li className="breadcrumb-item">
                      <Link to="/dashboard">Dashboard</Link>
                    </li>
                    <li className="breadcrumb-item active">
                      Wallet To Wallet History
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
                    <div>
                      <Table
                        className="table-responsive table-responsive-md table-responsive-lg table-responsive-xs"
                        pagination={{
                          total: datasource.length,
                          showTotal: (total, range) =>
                            `Showing ${range[0]} to ${range[1]} of ${total} entries`,
                          position: ["topRight"],
                        }}
                        columns={columns}
                        dataSource={datasource}
                        expandable={true}
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
});

export default WalletToWalletTransactionHistory;
