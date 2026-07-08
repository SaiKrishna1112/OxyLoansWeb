import React, { useState,useEffect } from "react";
import { Table, Button, Popover } from "antd";
import 'bootstrap/dist/css/bootstrap.min.css'; // Import Bootstrap CSS

const MyReffereeTable = ({ data }) => {

  const newData = [];

  if (data) {
    data.forEach((data, index) => {
      newData.push({
        key: Math.random(),
        UserName: data.userName,
        Status: data.paymentStatus,
        ReferredOn: data.referredOn,
        TransferredOn: data.transferredOn,
        Remark: data.remarks,
        RefereeId: data.refereeId,
        Earned: data.amount ? data.amount.toLocaleString("en-IN") : null,
      });
    });
  }

  const columns = [
    {
      title: "Referee ID",
      dataIndex: "RefereeId",
      sorter : (a, b) => a.RefereeId.length - b.RefereeId.length
    },
    {
      title: "User Name",
      dataIndex: "UserName",
      sorter: (a, b) => a.UserName.length - b.UserName.length,
    },
    {
      title: "Transferred On",
      dataIndex: "TransferredOn",
      sorter: (a, b) => a.TransferredOn.length - b.TransferredOn.length,
    },
    {
      title: "Payment Status",
      dataIndex: "Status",
      sorter: (a, b) => a.Status.length - b.Status.length,
    },
    {
      title: "Amount",
      dataIndex: "Earned",
      sorter: (a, b) => a.Earned - b.Earned,
    },
    {
      title: "Remark",
      dataIndex: "Remark",
      sorter: (a, b) => a.Remark.length - b.Remark.length,
    }
  ];


  return (
    <>
      <Table
        columns={columns}
        dataSource={newData}
        pagination={false}
      />
    </>
  );
};

export default MyReffereeTable;
