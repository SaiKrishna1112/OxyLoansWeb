// import React, { useState } from "react";
// import { Table, Button, Popover } from "antd";
// import 'bootstrap/dist/css/bootstrap.min.css'; // Import Bootstrap CSS

// const MyParticipateStatementTable = ({ data }) => {
//   const [content, setContent] = useState([]);
//   const [isCollapsed, setIsCollapsed] = useState(true); // Track the collapsed state

//   const handleUploadData = (data) => {
//     setContent(data);
//     console.log(data);
//   };

//   const newData = [];

//   if (data && data.data && data.data.dealLevelLoanEmiCard) {
//     data.data.dealLevelLoanEmiCard.forEach((dataItem, index) => {
//       newData.push({
//         key: index,
//         Sno: index + 1,
//         ActualPaymentDate: dataItem.date,
//         InterestPaidDate: dataItem.interestPaidDate ? dataItem.interestPaidDate : "Yet to be paid",
//         InterestAmount: index === 0 ? (
//           <>
//             {dataItem.interestAmount}
//             {console.log(data.data.dealLevelLoanEmiCard[0].listOfPaticipatedInfo)}
//             {console.log(data.data.dealLevelLoanEmiCard[0])}
//             {/* {()=>handleUploadData(data.data.dealLevelLoanEmiCard[0].listOfPaticipatedInfo)} */}

//             <Popover
//               placement="bottomRight"
//               title={
//                 <table className="table">
//                   <thead>
//                     <tr>
//                       <th scope="col">Participation on</th>
//                       <th scope="col">Amount</th>
//                       <th scope="col">No Days</th>
//                     </tr>
//                   </thead>
//                   <tbody>
//                     {data.data.dealLevelLoanEmiCard[0].listOfPaticipatedInfo ? (
//                       <>
//                         {data.data.dealLevelLoanEmiCard[0].listOfPaticipatedInfo.map((item, index) => (
//                           <tr key={index}>
//                             <th scope="row">{item.upatedDate}</th>
//                             <td>{item.interestAmount}</td>
//                             <td>{item.differenceInDays}</td>
//                           </tr>
//                         ))}
//                         <tr>
//                           <td colSpan="1">Total Amount</td>
//                           <td>
//                             {data.data.dealLevelLoanEmiCard[0].listOfPaticipatedInfo.reduce((total, item) => total + item.interestAmount, 0)}
//                           </td>
//                         </tr>
//                       </>
//                     ) : (
//                       <tr>
//                         <td colSpan="3">No data available</td>
//                       </tr>
//                     )}
//                   </tbody>
//                 </table>
//               }
//               okText="none"
//               cancelText="none"
//               overlayStyle={{ zIndex: 10000, width: "25%" }} // Apply zIndex here
//             >
//               {data.data.dealLevelLoanEmiCard[0].listOfPaticipatedInfo !== null && <p style={{ cursor: 'pointer', textDecoration: 'underline' }} >breakup view</p>}

//             </Popover>
//           </>
//         ) : (
//           dataItem.interestAmount
//         ),
//         Noofdays: dataItem.differenceInDaysForFirstParticipation,
//         listOfPaticipatedInfo: dataItem.listOfPaticipatedInfo,
//       });
//     });
//   }

//   const columns = [
//     {
//       title: "S.No",
//       dataIndex: "Sno",
//       sorter: (a, b) => a.Sno - b.Sno,
//     },
//     {
//       title: "Actual Payment Date",
//       dataIndex: "ActualPaymentDate",
//       sorter: (a, b) => new Date(a.ActualPaymentDate) - new Date(b.ActualPaymentDate),
//     },
//     {
//       title: "Interest Paid Date",
//       dataIndex: "InterestPaidDate",
//       sorter: (a, b) => new Date(a.InterestPaidDate) - new Date(b.InterestPaidDate),
//     },
//     {
//       title: "Interest Amount",
//       dataIndex: "InterestAmount",
//       sorter: (a, b) => a.InterestAmount - b.InterestAmount,
//     },
//     {
//       title: "No of Days",
//       dataIndex: "Noofdays",
//       sorter: (a, b) => a.Noofdays - b.Noofdays,
//     },
//   ];

//   const expandedRowRender = () => {
//     if (content && content.length > 0) {
//       const subColumns = [
//         {
//           title: "User ID",
//           dataIndex: "userId",
//           key: "userId",
//         },
//         {
//           title: "ROI",
//           dataIndex: "roi",
//           key: "roi",
//         },
//         {
//           title: "Amount",
//           dataIndex: "amount",
//           key: "amount",
//         },
//         {
//           title: "Updated Date",
//           dataIndex: "upatedDate",
//           key: "upatedDate",
//         },
//         {
//           title: "Difference in Days",
//           dataIndex: "differenceInDays",
//           key: "differenceInDays",
//         },
//         {
//           title: "Interest Amount",
//           dataIndex: "interestAmount",
//           key: "interestAmount",
//         },
//       ];

//       return (
//         <Table
//           columns={subColumns}
//           dataSource={content}
//           pagination={false}
//           rowKey={(record) => record.userId}
//         />
//       );
//     }
//     return null;
//   };

//   return (
//     <>
//       <div className={`collapse ${isCollapsed ? '' : 'show'}`} id="collapseExample">
//         {expandedRowRender()}
//       </div>
//       <Table
//         columns={columns}
//         dataSource={newData}
//         pagination={false}
//       />
//     </>
//   );
// };

// export default MyParticipateStatementTable;


import React, { useState } from "react";
import { Table } from "antd";
import "bootstrap/dist/css/bootstrap.min.css";

const MyParticipateStatementTable = ({ data }) => {
  const [content, setContent] = useState([]);
  const [isCollapsed, setIsCollapsed] = useState(true);

  const handleBreakupClick = (participationData) => {
    setContent(participationData);
    setIsCollapsed(false);
  };

  const newData = [];
  let breakupButtonShown = false;
  if (data?.data?.dealLevelLoanEmiCard) {
    data.data.dealLevelLoanEmiCard.forEach((dataItem, index) => {
      const shouldShowBreakupButton =
        index===0 && dataItem.listOfPaticipatedInfo !== null;

      if (shouldShowBreakupButton) {
        breakupButtonShown = true; // mark that we've shown the button
      }

      newData.push({
        key: index,
        Sno: index + 1,
        ActualPaymentDate: dataItem.date,
        InterestPaidDate: dataItem.interestPaidDate || "Yet to be paid",
        InterestAmount: (
          <>
            {dataItem.interestAmount.toLocaleString("en-IN")}
            {shouldShowBreakupButton && (
              <button
                className="btn btn-sm btn-outline-primary ms-2"
                onClick={() =>
                  handleBreakupClick(dataItem.listOfPaticipatedInfo)
                }
              >
                Breakup View
              </button>
            )}
          </>
        ),
        Noofdays: dataItem.differenceInDaysForFirstParticipation,
      });
    });
  }

  const columns = [
    {
      title: "S.No",
      dataIndex: "Sno",
      sorter: (a, b) => a.Sno - b.Sno,
    },
    {
      title: "Actual Payment Date",
      dataIndex: "ActualPaymentDate",
      sorter: (a, b) =>
        new Date(a.ActualPaymentDate) - new Date(b.ActualPaymentDate),
    },
    {
      title: "Interest Paid Date",
      dataIndex: "InterestPaidDate",
      sorter: (a, b) =>
        new Date(a.InterestPaidDate) - new Date(b.InterestPaidDate),
    },
    {
      title: "Interest Amount",
      dataIndex: "InterestAmount",
    },
    {
      title: "No of Days",
      dataIndex: "Noofdays",
      sorter: (a, b) => a.Noofdays - b.Noofdays,
    },
  ];

  const expandedRowRender = () => {
    if (!content || content.length === 0) return null;

    const totalAmount = content.reduce(
      (acc, item) => acc + item.interestAmount,
      0
    );

    return (
      <div className="table-responsive mt-3">
        <table className="table table-bordered table-striped">
          <thead>
            <tr>
              <th>User ID</th>
              <th>ROI</th>
              <th>Amount</th>
              <th>Updated Date</th>
              <th>Difference in Days</th>
              <th>Interest Amount</th>
            </tr>
          </thead>
          <tbody>
            {content.map((item, index) => (
              <tr key={index}>
                <td>{item.userId}</td>
                <td>{item.roi}</td>
                <td>{item.amount}</td>
                <td>{item.upatedDate}</td>
                <td>{item.differenceInDays}</td>
                <td>{item.interestAmount.toLocaleString("en-IN")}</td>
              </tr>
            ))}
            <tr>
              <td colSpan="5" className="text-end fw-bold">
                Total Amount
              </td>
              <td className="fw-bold">{totalAmount.toLocaleString("en-IN")}</td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div style={{maxHeight: '80vh', overflowY: 'auto'}}>
      <Table 
        columns={columns} 
        dataSource={newData} 
        pagination={false}
        scroll={{ x: true }}
        sticky
      />
      {!isCollapsed && expandedRowRender()}
    </div>
  );
};

export default MyParticipateStatementTable;
