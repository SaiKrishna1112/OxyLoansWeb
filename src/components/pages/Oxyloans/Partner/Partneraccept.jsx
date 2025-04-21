import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Header from "../../../Header/Header";
import SideBar from "../../../SideBar/SideBar";
import { Table } from "antd";
import { onShowSizeChange } from "../../../Pagination";
import { getMyWithdrawalHistory } from "../../../HttpRequest/afterlogin";
import { cancelwithdrawalRequestInformation } from "../../Base UI Elements/SweetAlert";
import PartnerHeader from "../../../Header/PartnerHeader";
import PartnerSideBar from "../../../SideBar/PartnerSideBar";
import { handelclickapicall } from "../../../HttpRequest/partner";
import { toastrSuccess } from "../../Base UI Elements/Toast";

const Partneraccept = () => {


    const [partnerdata, setpartnerdata] = useState({
        Approval:false
    })




   const handelechange = (event) => {
        const { name, checked } = event.target;

        setpartnerdata({
            ...partnerdata,
            [name]: checked
        });
    };
//   useEffect(() => {
//     const response = getMyWithdrawalHistory(
//       mywithdrawalHistory.pageNo,
//       mywithdrawalHistory.pageSize
//     );
//     response.then((data) => {
//       if (data.request.status == 200) {
//         setmywithdrawalHistory({
//           ...mywithdrawalHistory,
//           apiData: data.data,
//           loading: false,
//           hasdata: data.data.results.length == 0 ? false : true,
//         });
//       }
//     });
//     return () => {};
//   }, [mywithdrawalHistory.pageNo, mywithdrawalHistory.pageSize]);


    
    const handleclickapi = ()  => {
        const response =  handelclickapicall(partnerdata);

        response.then((data) => {
            console.log(data)
            if (data.status === 200) {
                console.log(data)
                toastrSuccess(data.data)
            } else {
                
            }
        })
    }

    

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
                  <h3 className="page-title">User Approval  </h3>
                  <ul className="breadcrumb">
                    <li className="breadcrumb-item">
                      <Link to="/dashboard">Dashboard</Link>
                    </li>
                    <li className="breadcrumb-item active">
                      User Approval
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


  <div className="mb-3 form-check">
    <input type="checkbox" className="form-check-input" id="exampleCheck1"   name="Approval"  onChange={handelechange}/>
    <label className="form-check-label" htmlFor="exampleCheck1">
      Check me out
    </label>
  </div>
  <button type="submit" className="btn btn-primary"   onClick={handleclickapi}>
    Submit
  </button>

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

export default Partneraccept;
