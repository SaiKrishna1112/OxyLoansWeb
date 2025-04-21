import React, { useState } from "react";
import { Button, Modal } from "antd";
import "../Lender/InvoiceGrid.css";

import "./table.css";

export default function Modall({ data, open: propOpen }) {
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(propOpen);

  const showModal = () => {
    setOpen(true);
  };
  const handleOk = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setOpen(false);
    }, 3000);
  };
  const handleCancel = () => {
    setOpen(false);
  };

  return (
    <div>
      <Modal
        open={open}
        title="Interest Statement"
        onOk={handleOk}
        width={840}
        style={{
          left: 80,
        }}
        onCancel={handleCancel}
        footer={
          [
            // <Button key="back" onClick={handleCancel}>
            //   Return
            // </Button>,
            // <Button key="submit" type="primary" loading={loading} onClick={handleOk}>
            //   Submit
            // </Button>,
            // <Button
            //   key="link"
            //   href="https://google.com"
            //   type="primary"
            //   loading={loading}
            //   onClick={handleOk}
            // >
            //   Search on Google
            // </Button>,
          ]
        }
      >
        {/* Interest Statement */}
        <p>
          If you've any queries please write to us <a href="">Click Here</a>{" "}
        </p>
        <div className="intestdata">
          <h6>First Interest Date :14/09/2023</h6>
        </div>

        <table>
          <tr className="tablerow">
            <th>S no</th>
            {/* <th></th> */}
            <th>Actual Payment Date</th>
            <th> Interest Paid Date</th>
            <th> Interest Amount</th>
            <th> No of days</th>
            <th>Participation Details</th>
          </tr>

          {data.data && Array.isArray(data.data.dealLevelLoanEmiCard) ? (
            data.data.dealLevelLoanEmiCard.map((item) => (
              <tr className="tablerow" key={item.sno}>
                <td>{item.sno}</td>
                <td>{item.date}</td>
                <td>
                  {item.interestPaidDate != null ? (
                    <>{item.interestPaidDate}</>
                  ) : (
                    <>Yet to be paid</>
                  )}
                </td>
                <td>{item.interestAmount}</td>
                <td>{item.differenceInDaysForFirstParticipation}</td>
                <td>
                  <Button type="primary">Amount statement</Button>
                </td>
              </tr>
            ))
          ) : (
            <p>No data available</p>
          )}
        </table>

        <table>
          <tr className="tablerow">
            <th>S no</th>
            {/* <th></th> */}
            <th>Actual Payment Date</th>
            <th> Interest Paid Date</th>
            <th> Interest Amount</th>
            <th> No of days</th>
            <th>Participation Details</th>
          </tr>

          {data.data && Array.isArray(data.data.dealLevelLoanEmiCard) ? (
            data.data.dealLevelLoanEmiCard.map((item) => (
              <tr className="tablerow" key={item.sno}>
                <td>{item.sno}</td>
                <td>{item.date}</td>
                <td>
                  {item.interestPaidDate != null ? (
                    <>{item.interestPaidDate}</>
                  ) : (
                    <>Yet to be paid</>
                  )}
                </td>
                <td>{item.interestAmount}</td>
                <td>{item.differenceInDaysForFirstParticipation}</td>
                <td>
                  <Button type="primary">Amount statement</Button>
                </td>
              </tr>
            ))
          ) : (
            <p>No data available</p>
          )}
        </table>

        {/* <table>
          <tr>
            <th>S no</th>
           
            <th>Actual Payment Date</th>
            <th> Interest Paid Date</th>
            <th> Interest Amount</th>
            <th> No of days</th>
            <th>Participation Details</th>
          </tr>


          {data.data && Array.isArray(data.data.dealLevelLoanEmiCard) ? (
            data.data.dealLevelLoanEmiCard.map((item) => (
              <tr key={item.sno}>
                <td>{item.sno}</td>
                <td>{item.date}</td>
                <td>
                  {item.interestPaidDate != null ? (
                    <>{item.interestPaidDate}</>
                  ) : (
                    <>Yet to be paid</>
                  )}
                </td>
                <td>{item.interestAmount}</td>
                <td>{item.differenceInDaysForFirstParticipation}</td>
                <td>
                  <Button type="primary">Amount statement</Button>
                </td>
              </tr>
            ))
          ) : (
            <p>No data available</p>
          )}
        </table> */}
      </Modal>
    </div>
  );
}
