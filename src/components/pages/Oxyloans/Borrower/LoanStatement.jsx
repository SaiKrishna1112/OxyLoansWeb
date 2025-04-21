import React, { useEffect, useState } from "react";
import BorrowerHeader from "../../../Header/BorrowerHeader";
import BorrowerSidebar from "../../../SideBar/BorrowerSidebar";
import { Link, NavLink } from "react-router-dom";
import { Table, Space, Tag, Button, Flex } from "antd";
import { onShowSizeChange } from "../../../Pagination";
import {
  getBorrowerApplication,
  editloanNewRequestHold,
} from "../../../HttpRequest/afterlogin";
import {
  HandleWithFooter,
  WarningAlertWalltTran,
  WarningAlerterror,
} from "../../Base UI Elements/SweetAlert";

const LoanStatement = () => {
  const [myapplicationStatus, setmyapplication] = useState({
    apiData: "",
    hasdata: false,
    loading: true,
    pageNo: 1,
    pageSize: 10,
    defaultPageSize: 10,
  });
  const mywithdrawalPagination = (Pagination) => {
    setmyapplication({
      ...myapplicationStatus,
      defaultPageSize: Pagination.pageSize,
      pageNo: Pagination.current,
      pageSize: Pagination.pageSize,
    });
  };

  const editandrejectLoanRequest = (status) => {
    const response = editloanNewRequestHold(status);
    response.then((data) => {
      if (data.request.status == 200) {
        HandleWithFooter(
          `You have successfully modified the loan request as ${status}`
        );
      } else if (data.request.status == 403) {
        WarningAlertWalltTran(data.response.data.errorMessage);
      } else {
        WarningAlerterror(data.response.data.errorMessage);
      }
    });
  };

  useEffect(() => {
    const response = getBorrowerApplication(
      myapplicationStatus.pageNo,
      myapplicationStatus.pageSize
    );
    response.then((data) => {
      if (data.request.status == 200) {
        setmyapplication({
          ...myapplicationStatus,
          apiData: data.data,
          loading: false,
          hasdata: data.data.results.length == 0 ? false : true,
        });
      }
    });
    return () => {};
  }, [myapplicationStatus.pageNo, myapplicationStatus.pageSize]);

  const datasource = [];
  {
    myapplicationStatus.apiData != ""
      ? myapplicationStatus.apiData.results.map((data) => {
          datasource.push({
            key: Math.random(),
            LoanInfo: [
              data.loanRequestAmount,
              data.rateOfInterest + " % PM",
              data.duration + data.durationType,
            ],
            Repayment: [
              data.repaymentMethod,
              data.loanRequestedDate,
              data.loanPurpose,
              data.loanStatus,
            ],
            action: (
              <>
                <Button type="primary" ghost>
                  <NavLink to={"/loanRequest"}>Edit</NavLink>
                </Button>

                <Button
                  type="primary"
                  danger
                  ghostn
                  onClick={() => {
                    editandrejectLoanRequest("Hold");
                  }}
                >
                  Hold
                </Button>
                <Button
                  type="dashed"
                  onClick={() => {
                    editandrejectLoanRequest("Rejected");
                  }}
                >
                  Delete
                </Button>
              </>
            ),
          });
        })
      : "";
  }

  const columns = [
    {
      title: "Loan Info",
      dataIndex: "LoanInfo",
      key: "LoanInfo",
      render: (_, { LoanInfo }) => (
        <>
          {LoanInfo.map((tag, index) => {
            let color = tag.length > 5 ? "geekblue" : "green";
            let label = "";
            if (tag === "loser") {
              color = "volcano";
            }

            if (index == 0) {
              label = "Amount";
            } else if (index == 1) {
              label = "ROI";
            } else if (index == 2) {
              label = "Duration";
            }
            return (
              <>
                <div className="m-2">
                  <Tag color={color} key={tag}>
                    {`${label} : `} {tag}
                  </Tag>
                </div>
              </>
            );
          })}
        </>
      ),
    },
    {
      title: "Repayment Info",
      dataIndex: "Repayment",
      key: "Repayment",
      render: (_, { Repayment }) => (
        <>
          {Repayment.map((tag, index) => {
            let label = "";
            if (index == 0) {
              label = "Repayment";
            } else if (index == 1) {
              label = "Requested Date";
            } else if (index == 2) {
              label = "Loan Purpose";
            } else if (index == 3) {
              label = "status";
            }
            return (
              <>
                <div className="m-2">
                  <Tag color={index % 2 == 0 ? "geekblue" : "green"} key={tag}>
                    {`${label} : `} {tag}
                  </Tag>
                </div>
              </>
            );
          })}
        </>
      ),
    },

    {
      title: "Action",
      dataIndex: "action",
      action: (
        <button
          type="submit"
          className="btn  w-70 btn-primary btn-xs"
          onClick={() => {}}
        >
          Edit
        </button>
      ),
    },
  ];

  return (
    <>
      <div className="main-wrapper">
        <BorrowerHeader />
        <BorrowerSidebar />
        {/*Page wrapper */}
        <div className="page-wrapper">
          <div className="content container-fluid">
            {/*Page Header */}
            <div className="page-header">
              <div className="row">
                <div className="col">
                  <h3 className="page-title">Running Loans </h3>
                  <ul className="breadcrumb">
                    <li className="breadcrumb-item">
                      <Link to="/borrowerDashboard">Dashboard</Link>
                    </li>
                    <li className="breadcrumb-item active">
                      My Loan Application
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
                          total: myapplicationStatus.apiData.totalCount,
                          defaultPageSize: myapplicationStatus.defaultPageSize,
                          showTotal: (total, range) =>
                            `Showing ${range[0]} to ${range[1]} of ${total} entries`,
                          position: ["topRight"],
                          showSizeChanger: true,
                          onShowSizeChange: onShowSizeChange,
                        }}
                        columns={columns}
                        dataSource={
                          myapplicationStatus.hasdata ? datasource : []
                        }
                        expandable={true}
                        loading={myapplicationStatus.loading}
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

export default LoanStatement;
