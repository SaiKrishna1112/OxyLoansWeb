import React, { useEffect, useState, useMemo, useCallback } from "react";
import { Link } from "react-router-dom";
import Header from "../../../Header/Header";
import SideBar from "../../../SideBar/SideBar";
import "./Dashboardtable.css";
import { Table } from "antd";

import { getMyWalletTowalletHistory } from "../../../HttpRequest/afterlogin";

const WalletToWalletHistory = React.memo((pros) => {
  const [mywalletTowalletHistory, setmywalletTowalletHistory] = useState({
    apiData: "",
    hasdata: false,
    loading: true,
  });

  const fetchData = useCallback(() => {
    const response = getMyWalletTowalletHistory();
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
            hasdata:
              data.data.walletTransferLenderToLenderResponseDto.length == 0
                ? false
                : true,
          });
        }
      })
      .catch((error) => {});
  }, []);

  const datasource = [];
  {
    mywalletTowalletHistory.apiData != ""
      ? mywalletTowalletHistory.apiData.walletTransferLenderToLenderResponseDto.map(
          (data) => {
            datasource.push({
              key: Math.random(),
              ReceiverId: "LR" + data.receiverId,
              ReceiverName: "LR" + data.receiverName,
              TransformedDate: data.transformedDate,
              Amount: data.amount,
            });
          }
        )
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
      title: "Approved Date",
      dataIndex: "TransformedDate",
      sorter: (a, b) =>
        new Date(a.TransformedDate) - new Date(b.TransformedDate),
    },
    {
      title: "Amount",
      dataIndex: "Amount",
      sorter: (a, b) => a.Amount - b.Amount,
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
                  <h3 className="page-title">Wallet debit history</h3>
                  <ul className="breadcrumb">
                    <li className="breadcrumb-item">
                      <Link to="/dashboard">Dashboard</Link>
                    </li>
                    <li className="breadcrumb-item active">
                      Wallet debit history
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

export default WalletToWalletHistory;
