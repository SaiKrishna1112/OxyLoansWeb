import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Header from "../../../Header/Header";
import SideBar from "../../../SideBar/SideBar";
import { Button, Table } from "antd";
import { onShowSizeChange, itemRender } from "../../../Pagination";
import { getWithdrawaFromDeal } from "../../../HttpRequest/afterlogin";
import Swal from "sweetalert2";

const WithdrawdealfromDeal = () => {
  const navigate = useNavigate();
  const [participatedDeals, setparticipatedDeals] = useState({
    apiData: "",
    hasdata: false,
    loading: true,
    pageNo: 1,
    pageSize: 10,
    defaultPageSize: 10,
    dealtype: "NORMAL",
    pagecount:0
  });

  const withdrawalFromDealPagination = (Pagination) => {
    setparticipatedDeals({
      ...participatedDeals,
      defaultPageSize: Pagination.pageSize,
      pageNo: Pagination.current,
      pageSize: Pagination.pageSize,
    });
  };

  useEffect(() => {
    const response = getWithdrawaFromDeal(
      participatedDeals.pageNo,
      participatedDeals.pageSize,
      participatedDeals.dealtype
    );
    response.then((data) => {
      if (data.request.status == 200) {
        console.log(data.data.count)
        setparticipatedDeals({
          ...participatedDeals,
          apiData: data.data,
          loading: false,
          hasdata: data.data.count == 0 ? false : true,
          pagecount:data.data.count
        });
      }
    });

    return () => { };
  }, [
    participatedDeals.pageNo,
    participatedDeals.pageSize,
    participatedDeals.dealtype,
  ]);

  const handleWithdrawFromEscrow = () => {
    setparticipatedDeals({
      ...participatedDeals,
      dealtype: "ESCROW",
    });
  };
  const handleWithdrawFromNormal = () => {
    setparticipatedDeals({
      ...participatedDeals,
      dealtype: "NORMAL",
    });
  };

  const handleWriteToUs = () => {
    Swal.fire({
      title: 'NO ATW (No Anytime Withdrawal)',
      html: `
        <div style="text-align: left;">
          <p><strong>Withdrawal Terms – NOATW Deal</strong></p>
          <p>If you withdraw from this NOATW deal, your ROI will be reduced to 0.5%.</p>
          <p>If you withdraw within the first month (before the first interest payment date), no ROI will be applicable, and you will receive only the principal amount.</p>
          <p>Please write to us if you wish to proceed with the withdrawal.</p>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: 'OK',
      cancelButtonText: 'Close',
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33'
    }).then((result) => {
      if (result.isConfirmed) {
        navigate('/writetous');
      }
    });
  };
  const datasource = [];
  if (participatedDeals.apiData !== "") {
    participatedDeals.apiData.lenderPaticipatedResponseDto.forEach((data) => {
      const nextPageUrl = `/withdrawdealFounds?dealId=${data.dealId}&currentAmount=${data.currentValue}&requestedAmount=${data.requestedAmount}&dealName=${data.dealName}&roi=${data.rateOfInterest}`;

      datasource.push({
        key: Math.random(),
        DealName: data.dealName,
        DealType: data.dealType,
        ParticipatedAmount: data.paticipatedAmount,
        dealtype: data.dealType,
        currentStatus: data.currentStatus,
        RoI: data.rateOfInterest + " % ",
        Duration: data.dealDuration + " " + (data.lederReturnType === "PERDAY" ? (data.dealDuration > 1 ? "DS" : "D") : (data.dealDuration > 1 ? "MS" : "M")),
        DealStatus: data.currentStatus,
        RequestedAmount: data.requestedAmount,
        action: (
          <>{ }

            {data.withdrawStatus == "NO" ? <>
              <Button type="primary" onClick={handleWriteToUs}>Write to us</Button>
              </> : <>  <Link to={nextPageUrl}>
                  <button type="submit" className="btn w-100 btn-outline-success">
                    <i className="fa-solid fa-business-time"></i> Withdraw
                  </button>
                </Link></>}

          </>
        ),
      });
    });
  }

  const columns = [
    {
      title: "Deal Name",
      dataIndex: "DealName",
      sorter: (a, b) => a.DealName.length - b.DealName.length,
    },

    {
      title: "Participated",
      dataIndex: "ParticipatedAmount",
      sorter: (a, b) => a.ParticipatedAmount - b.ParticipatedAmount,
    },
    {
      title: "Deal Type",
      dataIndex: "dealtype",
      sorter: (a, b) => a.RoI.length - b.RoI.length,
    },
    {
      title: "Deal Status",
      dataIndex: "currentStatus",
      sorter: (a, b) => a.RoI.length - b.RoI.length,
    },
    {
      title: "ROI",
      dataIndex: "RoI",
      sorter: (a, b) => a.RoI.length - b.RoI.length,
    },
    {
      title: "Duration",
      dataIndex: "Duration",
      sorter: (a, b) => a.Duration.length - b.Duration.length,
    },

    {
      title: "Requested",
      dataIndex: "RequestedAmount",
      sorter: (a, b) => a.RequestedAmount - b.RequestedAmount,
    },
    {
      title: "Action",
      dataIndex: "action",
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
                  <h3 className="page-title">
                    Withdraw Funds from{" "}
                    {participatedDeals.dealtype == "NORMAL"
                      ? ""
                      : participatedDeals.dealtype + " "}
                    Deals
                  </h3>
                  <ul className="breadcrumb">
                    <li className="breadcrumb-item">
                      <Link to="/dashboard">Dashboard</Link>
                    </li>
                    <li className="breadcrumb-item active">Withdraw Funds</li>
                  </ul>
                </div>
              </div>
            </div>
            {/* /Page Header */}

            <div className="row">
              <div className="col-sm-12">
                <div className="card">
                  <div className="card-header">
                    <div className="row col-12">
                      <Link
                        to={"/withdrawalFromWallet"}
                        className="col-md-2 col-xs-6 col-lg-4 mx-lg-2 my-xs-2 my-md-1"
                      >
                        <button className="btn  btn-outline-success col-12">
                          <i className="fa-solid fa-briefcase mx-2"></i>
                          From wallet{" "}
                        </button>
                      </Link>

                      <button
                        onClick={handleWithdrawFromNormal}
                        className="btn  btn-outline-info col-md-2 col-xs-6 col-lg-4 mx-lg-2 my-xs-2 my-md-1"
                      >
                        <i className="fa-solid fa-briefcase mx-2"></i> From a
                        normal deal
                      </button>

                      <button
                        className="btn  btn-outline-warning col-md-2 col-xs-6 col-lg-3 mx-lg-2 my-xs-2 my-md-1"
                        onClick={handleWithdrawFromEscrow}
                      >
                        <i className="fa-solid fa-briefcase mx-2"></i> From an
                        escrow deal
                      </button>
                    </div>
                  </div>
                  <div className="card-body">
                    <div>
                      <Table
                        className="table-responsive table-responsive-md table-responsive-lg table-responsive-xs"
                        pagination={{
                          total: participatedDeals.pagecount,
                          showTotal: (total, range) =>
                            `Showing ${range[0]} to ${range[1]} of ${total} entries`,
                          position: ["topRight"],
                          showSizeChanger: true,
                          onShowSizeChange: onShowSizeChange,
                        }}
                        columns={columns}
                        expandable={true}
                        dataSource={participatedDeals.hasdata ? datasource : []}
                        loading={participatedDeals.loading}
                        onChange={withdrawalFromDealPagination}
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

export default WithdrawdealfromDeal;
