import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Header from "../../../Header/Header";
import SideBar from "../../../SideBar/SideBar";
import Footer from "../../../Footer/Footer";
import "./InvoiceGrid.css";
import { handledetail, withdrawriaseapipay } from "../../../HttpRequest/afterlogin";
import { Button, Table } from "antd";
import { toastrError } from "../../Base UI Elements/Toast";
import { participatedapi } from "../../Base UI Elements/SweetAlert";
import Spining from "./Spining";
import { useDispatch } from "react-redux";
import { useSelector } from "react-redux";

const Participatedeal = () => {
  const [buttonvaild, setbuttonvaild] = useState(true);
  const [buttonvaild1, setbuttonvaild1] = useState(true);
  const [isConditionMet, setIsConditionMet] = useState(false);
  const dispatch = useDispatch();
  const reduxStoreData = useSelector((data) => data.counter.userProfile);

  const [deal, setDeal] = useState({
    apidata: "",
    transactionNumber: "",
    accountType: "",
    lenderFeeId: "",
    feeParticipate: true,
    lenderReturnType: "",
    lenderFeeId: "",
    transferPrincipal: "",
    participatedAmount: 0,
    bank: "",
    wallet: "",
    urldealId: "",
    amountfromurl: "",
    spining: false,
    lenderRemainingPanLimit: 0,
    lenderTotalParticipationAmount: 0,
    lenderRemainingWalletAmount: 0,
    dealParticipatedAmount: 0,
    lenderParticipated: false,
    dealfeestatus: "",
    uservalidity: "",
    groupName: "",
    dealId: 0,
    currentUserWallet: 0,
  });


  useEffect(() => {
    const handledealinfo = async () => {
      const urlparam = new URLSearchParams(window.location.search);
      const dealId = urlparam.get("dealId");
      const response = await handledetail(dealId);

      const newObj = { ...response.data };
      if (newObj.monthlyInterest != 0) {
        newObj.rateOfInterest = newObj.monthlyInterest + " % PM";
        newObj["payout"] = "MONTHLY";
        localStorage.setItem("choosenPayOutOption", "MONTHLY");
      } else if (newObj.quartlyInterest != 0) {
        newObj.rateOfInterest = newObj.quartlyInterest * 3 + " % PA ";
        newObj["payout"] = "QUARTERLY";
        localStorage.setItem("choosenPayOutOption", "QUARTELY");
      } else if (newObj.halfInterest != 0) {
        newObj.rateOfInterest = newObj.halfInterest * 6 + " % PA ";
        newObj["payout"] = "HALFYEARLY";
        localStorage.setItem("choosenPayOutOption", "HALFLY");
      } else if (newObj.yearlyInterest != 0) {
        newObj.rateOfInterest = newObj.yearlyInterest * 12 + " %  PA ";
        newObj["payout"] = "YEARLY";
        localStorage.setItem("choosenPayOutOption", "YEARLY");
      } else if (newObj.endofthedealInterest != 0) {
        newObj.rateOfInterest = newObj.endofthedealInterest * 12 + " %  PA ";
        newObj["payout"] = "ENDOFTHEDEAL";
        localStorage.setItem("choosenPayOutOption", "ENDOFTHEDEAL");
      }
      if (response.request.status == 500) {
        setDeal({
          ...deal,
          spining: true,
        });
      } else {
        setDeal({
          ...deal,
          apidata: newObj,
          urldealId: dealId,
          lenderRemainingPanLimit: newObj.lenderRemainingPanLimit,
          lenderTotalParticipationAmount: newObj.lenderTotalParticipationAmount,
          lenderRemainingWalletAmount: newObj.lenderRemainingWalletAmount,
          dealParticipatedAmount: newObj.lenderParticipationTotal,
          lenderParticipated:
            newObj.lenderParticipationTotal != 0 &&
              newObj.lenderParticipationTotal != null
              ? true
              : false,
          dealfeestatus: newObj.feeStatusToParticipate,
          uservalidity: newObj.lenderValidityStatus,
          groupName: newObj.groupName,
        });
      }
    };

    handledealinfo();
  }, []);


  const [withdrawriaseapi, setWithdrawriaseapi] = useState({
    message: "",
    status: null,
    amount: "",
  });

  useEffect(() => {
    const urlparam = new URLSearchParams(window.location.search);
    const amount = urlparam.get("amount");

    const withdrawriase = async () => {
      const response = await withdrawriaseapipay(withdrawriaseapi.status);

      if (response.status === 200) {
        setWithdrawriaseapi({
          message: response.data.status,
          amount: response.data.amount,
          status: withdrawriaseapi.status // keep the current status
        });
      } else {
        setWithdrawriaseapi({
          message: null,
          amount: "",
          status: withdrawriaseapi.status // keep the current status
        });
      }
    };

    withdrawriase();
  }, [withdrawriaseapi.status]);

  useEffect(() => {
    const urlparam = new URLSearchParams(window.location.search);
    const amountFromURL = urlparam.get("amount");

    if (parseInt(amountFromURL) !== parseInt(withdrawriaseapi.amount)) {
      urlparam.set("amount", withdrawriaseapi.amount);
      window.history.replaceState({}, '', `${window.location.pathname}?${urlparam.toString()}`);



    }
  }, [withdrawriaseapi.amount]);


  //   useEffect(() => {
  //     console.log("llllllll")
  //     console.log(parseInt(amount) === 94604)
  //     console.log(typeof (amount))


  // },[])


  const handleChange = (event) => {
    const { name, value } = event.target;
       
    setDeal({
      ...deal,
      [name]: value,
    });
      console.log(deal);
      
    // const amountFromURL = amount; // Assuming 'amount' is defined or passed as a prop
    // const participateAmount = deal.participatedAmount;

    // if (amountFromURL && parseFloat(amountFromURL) <= participateAmount) {
    //   console.log("Amount is more than your wallet amount");
    //   setbuttonvaild(true);
    // } else {
    //   console.log("Amount is valid");
    //   setbuttonvaild(true);
    // }
  };


  useEffect(() => {
    const amountFromURL = parseFloat(withdrawriaseapi.amount);
    const participateAmount = parseFloat(deal.participatedAmount);

    if (amountFromURL && participateAmount > amountFromURL) {
      console.log("Amount is more than your wallet amount");
      setbuttonvaild1(true);

    } else {
      console.log("Amount is valid");
      setbuttonvaild1(false);

    }
  }, [withdrawriaseapi.amount, deal.participatedAmount]);

  useEffect(() => {
    const checkCondition = () => {
      if (deal.bank != "") {
        setIsConditionMet(true);
        setbuttonvaild(false);
      } else {
        setIsConditionMet(false);
        setbuttonvaild(true);
      }
    };
    checkCondition();
  }, [deal.participatedAmount, deal.bank]);

  const dealparticipate = async () => {
    console.log(deal.apidata);
    const amount = `${reduxStoreData?.length !== 0
      ? reduxStoreData?.lenderWalletAmount -
      reduxStoreData?.holdAmountInDealParticipation -
      reduxStoreData?.equityAmount
      : ""
      }`;
    const numericAmount = parseInt(amount);

    if (parseInt(deal.participatedAmount) == "") {
      toastrError(
        "Please enter the amount that you wish to lend in this deal."
      );
      return false;
    } else if (numericAmount < parseInt(deal.participatedAmount)) {
      toastrError(
        "Your participation amount is greater than your wallet balance."
      );
      return false;
    } else if (
      parseInt(deal.participatedAmount) + parseInt(deal.apidata.lenderParticipationTotal) > parseInt(deal.apidata.lenderParticiptionLimit)
    ) {

      console.log("check")
      console.log("participatedAmount" + deal.participatedAmount, "lenderParticipationTotal" + deal.apidata.lenderParticipationTotal + "lenderParticiptionLimit" + deal.apidata.lenderParticiptionLimit)

      toastrError(
        "Participation limit exceeded please check"
      );
      return false;
    } else if (
      parseInt(deal.participatedAmount) > deal.apidata.lenderParticiptionLimit
    ) {
      toastrError("You are participating  more than the maximum amount.");
      return false;
    } else if (
      parseInt(deal.participatedAmount) <
      deal.apidata.minimumPaticipationAmount &&
      deal.lenderParticipated == false
    ) {
      toastrError("You are participating in less than the minimum amount.");
      return false;
    } else {
      if (
        deal.apidata.remainingAmountInDeal >
        deal.apidata.minimumPaticipationAmount &&
        deal.lenderParticipated == false
      ) {
        if (
          parseInt(deal.participatedAmount) <
          deal.apidata.minimumPaticipationAmount &&
          deal.lenderParticipated == false
        ) {
          toastrError(
            "Minimum investment is INR" + deal.apidata.minimumPaticipationAmount
          );

          return false;
        } else if (
          parseInt(deal.participatedAmount) > deal.apidata.remainingAmountInDeal
        ) {
          toastrError(
            "Your participation amount is greater than the Deal available limit."
          );

          return false;
        }
      } else if (
        deal.apidata.remainingAmountInDeal <
        deal.apidata.minimumPaticipationAmount
      ) {
        if (deal.apidata.remainingAmountInDeal == 0) {
          toastrError("Deal Is Closed");

          return false;
        } else if (
          parseInt(deal.participatedAmount) < deal.apidata.remainingAmountInDeal && deal.apidata.lenderParticipationTotal === null
        ) {
          console.log(deal.participatedAmount, deal.apidata.remainingAmountInDeal, deal.apidata.lenderParticipationTotal)
          toastrError(
            " investment is INR" + deal.apidata.remainingAmountInDeal
          );
          console.log("error")
          return false;
        } else if (
          parseInt(deal.participatedAmount) > deal.apidata.remainingAmountInDeal
        ) {
          toastrError(
            "Your participation amount is greater than the Deal available limit."
          );
          return false;
        }
      }
    }

    const userparticipatestatis = await participatedapi(deal);
  };

  const columns = [
    {
      title: "Deal Name",
      dataIndex: "name",
      key: "deal",
    },
    {
      title: "ROI",
      dataIndex: "rateOfInterest",
      key: "rateOfInterest",
    },
    {
      title: "Deal Value",
      dataIndex: "loanamount",
      key: "loanamount",
    },
    {
      title: "Available Limit",
      dataIndex: "availablelimit",
      key: "availablelimit",
    },
    {
      title: "Tenure",
      dataIndex: "tenureinmonths",
      key: "tenureinmonths",
    },

    {
      title: "Min Amount",
      dataIndex: "minimumparticipation",
      key: "minimumparticipation",
    },
    {
      title: "Max Amount",
      dataIndex: "maximumparticipation",
      key: "maximumparticipation",
    },
  ];


  const dataSource = [];
  const rateOfInterest = parseFloat(deal.apidata.rateOfInterest);
  deal.apidata && deal.apidata != ""
    ? dataSource.push({
      key: Math.random(),
      name: deal.apidata.dealName,
      loanamount: deal.apidata.dealAmount,
      rateOfInterest: rateOfInterest,
      availablelimit: deal.apidata.remainingAmountInDeal,
      tenureinmonths: deal.apidata.duration + "M",
      funding: deal.apidata.fundStartDate,
      fundingdate: deal.apidata.fundEndDate,
      minimumparticipation: deal.apidata.minimumPaticipationAmount,
      maximumparticipation: deal.apidata.lenderParticiptionLimit,
    })
    : [];



  // useEffect(() => {
  //   if (deal.participatedAmount <= ) {

  //   }
  // })

  return (
    <>
      <div className="main-wrapper">
        {/* Header */}
        <Header />

        {/* Sidebar */}
        <SideBar />

        {/* Page Wrapper */}
        <div className="page-wrapper">
          <div className="content container-fluid">
            {/* Page Header */}
            <div className="page-header">
              <div className="row align-items-center">
                <div className="col">
                  <h3 className="page-title">
                    {/* Write To Us */}
                    Deal Info
                  </h3>

                  <ul className="breadcrumb">
                    <li className="breadcrumb-item">
                      <Link to="/dashboard">Dashboard</Link>
                    </li>
                    <li className="breadcrumb-item active">Deal Info</li>
                  </ul>
                </div>
              </div>
            </div>
            {deal.spining ? (
              <>
                {" "}
                <Spining />
              </>
            ) : (
              <>
                <p>Welcome to {deal.apidata && deal.apidata.dealName}</p>
                {/* <div className="row col-12"> */}
                <Table
                  dataSource={dataSource.length < 0 ? [] : dataSource}
                  columns={columns}
                  loading={dataSource.length < 0 ? true : false}
                  pagination={false}
                />
                {/* </div> */}

                <div className="displaycenter">
                  <h4 style={{ marginTop: "2rem" }}>Return Principal To :</h4>
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="radio"
                      name="transferPrincipal"
                      value={"WALLET"}
                      onChange={(event) => {
                        setDeal({
                          ...deal,
                          bank: event.target.value,
                        });
                      }}
                    />
                    <label
                      className="form-check-label mt-2"
                      htmlFor="transferPrincipal"
                    >
                      <strong> Move Principal to wallet </strong>
                    </label>
                  </div>
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="radio"
                      name="transferPrincipal"
                      value={"BANKACCOUNT"}
                      onChange={(event) => {
                        setDeal({
                          ...deal,
                          bank: event.target.value,
                        });
                      }}
                    />

                    <label
                      className="form-check-label mt-2"
                      htmlFor="transferPrincipal"
                    >
                      <strong> Move Principal to Bank</strong>
                    </label>
                  </div>
                </div>

                {deal.apidata.lenderValidityStatus == true && (
                  <div className="row notepoint text-center m-5 align-self-center">
                    {deal.apidata.feeStatusToParticipate == "OPTIONAL" &&
                      deal.apidata.lenderValidityStatus == true ? (
                      <h4 className="text-bold font-monospace">
                        <code>Note :</code> Processing Fee is waived for this
                        deal.
                      </h4>
                    ) : deal.apidata.lenderValidityStatus == true &&
                      deal.apidata.groupName != "NewLender" ? (
                      <h4 className="text-bold fs-4 fw-light textquery">
                        <code>Note :</code> Your validity has expired. Please
                        pay to continue your participation.
                      </h4>
                    ) : deal.apidata.lenderValidityStatus == true &&
                      deal.apidata.groupName == "NewLender" ? (
                      <h4 className="text-bold fs-4 fw-light">
                        <code>Note :</code> You are requested to pay a 1%
                        processing fee on your investment.
                      </h4>
                    ) : null}
                  </div>
                )}

                <div
                  className={`centerdiv ${deal.apidata?.lenderValidityStatus ? "mt-5" : "mt-5"
                    }`}
                >
                  <h4>Your participation to this deal is</h4>
                  <div className="form-group">
                    <input
                      className="form-control-lg form-control-lg1"
                      type="number"
                      placeholder="Enter amount here..."
                       onWheel={(e) => e.target.blur()} 
                      name="participatedAmount"
                      onChange={handleChange}
                    />
                  </div>
                  {deal.participatedAmount!==0 && deal.participatedAmount !== "" && deal.participatedAmount !== null && deal.dealfeestatus !== "OPTIONAL" && deal.uservalidity === true && <div className="error">This deal has a fee(1% + 18% GST) of ₹ {Math.round((deal.participatedAmount * 0.01) * 1.18)}. </div>}
                  {console.log(typeof (withdrawriaseapi.amount), withdrawriaseapi.amount)}
                  {withdrawriaseapi.amount !== "" && withdrawriaseapi.amount !== null ? (
                    <div className="error">Actual wallet amount after withdrawal request: ₹ {withdrawriaseapi.amount}.</div>
                  ) : (
                    ""
                  )}
                  { }

                  {buttonvaild1 ? <> <Button
                    type="primary"
                    size="large"
                    disabled={true}
                    onClick={() => {
                      dealparticipate();
                    }}
                  >
                    Participate
                  </Button>   </> : <> <Button
                    type="primary"
                    size="large"
                    disabled={buttonvaild}
                    onClick={() => {
                      dealparticipate();
                    }}
                  >
                    Participate
                  </Button></>}









                  {/* <Button
                    type="primary"
                    size="large"
                    disabled={buttonvaild}
                    onClick={() => {
                      dealparticipate();
                    }}
                  >
                    Participate
                  </Button> */}

                </div>
              </>
            )}
            {/* /Page Header */}
          </div>
          <Footer />
        </div>
      </div>
      {/* /Main Wrapper */}
      <style>
        {`
        /* Remove arrow buttons */
input::-webkit-inner-spin-button,
input::-webkit-outer-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

/* Remove scroll wheel changing the number */
input[type=number] {
  -moz-appearance: textfield; /* Firefox remove arrows */
}

input[type=number] {
  appearance: textfield; /* Removes spinner behavior on Chrome/Safari as well */
}

/* Prevent scroll from changing values */
input[type=number]:focus,
input[type=number]:hover {
  -moz-appearance: textfield;
}

input[type=number] {
  pointer-events: auto;
}

input[type=number]::-webkit-inner-spin-button,
input[type=number]::-webkit-outer-spin-button {
  display: none;
}
`}
      </style>
    </>
  );
};

export default Participatedeal;
