import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import Header from "../../../Header/Header";
import SideBar from "../../../SideBar/SideBar";
import Footer from "../../../Footer/Footer";
import "./InvoiceGrid.css";
import { handledetail, withdrawriaseapipay, getUserReactivationOffers } from "../../../HttpRequest/afterlogin";
import { Button, Table,Tooltip } from "antd";
import { toastrError } from "../../Base UI Elements/Toast";
import { participatedapi, isParticipationFeeWaived, hasActiveReactivationOffer, isOfferDeactivated, isMandatoryFeeDeal, OFFER_MIN_PARTICIPATION, OFFER_STATUS_ACTIVE } from "../../Base UI Elements/SweetAlert";
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

  const [loadError, setLoadError] = useState("");
  const dealLoadStartedRef = useRef(false);

  const FEE_WAIVER_OFFER_TYPES = new Set([
    "FIRST_DEAL_FREE",
    "REINVEST_FEE_WAIVER",
    "COMEBACK_ZERO_FEE",
    "COMEBACK_BONUS",
    "LOYALTY_REWARD",
  ]);

  const FREE_SUBSCRIPTION_OFFER_TYPES = new Set([
    "FIRST_DEAL_FREE",
    "COMEBACK_ZERO_FEE",
    "COMEBACK_BONUS",
  ]);

  const shouldShowPaymentSection =
    deal.apidata &&
    !isParticipationFeeWaived(deal.apidata, deal.participatedAmount);

  const participationAmount = Number(deal.participatedAmount) || 0;
  const offerAppliesNow =
    deal.apidata &&
    isMandatoryFeeDeal(deal.apidata) &&
    hasActiveReactivationOffer(deal.apidata) &&
    participationAmount >= OFFER_MIN_PARTICIPATION;
  const offerActiveBelowMinimum =
    deal.apidata &&
    isMandatoryFeeDeal(deal.apidata) &&
    hasActiveReactivationOffer(deal.apidata) &&
    participationAmount > 0 &&
    participationAmount < OFFER_MIN_PARTICIPATION;
  const offerAlreadyUsed =
    deal.apidata &&
    !deal.apidata.subscriptionActive &&
    isOfferDeactivated(deal.apidata) &&
    !isParticipationFeeWaived(deal.apidata, participationAmount);

  const mergeActiveOffersIntoDealData = (dealData, offers) => {
    const activeOffers = (offers || []).filter(
      (offer) =>
        offer &&
        offer.status === "ACTIVE" &&
        !offer.redeemed &&
        FEE_WAIVER_OFFER_TYPES.has(offer.offerType)
    );
    if (activeOffers.length === 0) {
      return dealData;
    }
    const primaryOffer = activeOffers[0];
    const grantsFreeSubscription =
      primaryOffer.grantsFreeSubscription === true ||
      FREE_SUBSCRIPTION_OFFER_TYPES.has(primaryOffer.offerType);
    const freeMonths = primaryOffer.freeSubscriptionMonths || 1;
    const subscriptionNote = grantsFreeSubscription
      ? ` A free ${freeMonths}-month membership will also be activated after this participation.`
      : "";
    return {
      ...dealData,
      offerActive: true,
      offerStatus: OFFER_STATUS_ACTIVE,
      activeOfferId: primaryOffer.offerId,
      activeOfferType: primaryOffer.offerType,
      activeOfferTitle: primaryOffer.title,
      grantsFreeSubscription,
      freeSubscriptionMonths: freeMonths,
      activeOffers,
      offerMessage: `Your special offer "${primaryOffer.title}" is active. Invest at least ₹10,000 on this mandatory deal to waive the participation fee (one-time use).${subscriptionNote}`,
    };
  };

  useEffect(() => {
    if (dealLoadStartedRef.current) {
      return;
    }
    dealLoadStartedRef.current = true;

    const handledealinfo = async () => {
      setDeal((prev) => ({ ...prev, spining: true }));
      setLoadError("");
      const urlparam = new URLSearchParams(window.location.search);
      const dealId = urlparam.get("dealId");
      if (!dealId) {
        const message = "Deal ID is missing from the URL.";
        setLoadError(message);
        toastrError(message);
        setDeal((prev) => ({ ...prev, spining: false }));
        return;
      }

      try {
        const response = await handledetail(dealId);
        const status = response?.status ?? response?.response?.status;
        const apiData = response?.data ?? response?.response?.data;

        if (!apiData || (status && status >= 400)) {
          const serverMessage =
            apiData?.errorMessage ||
            apiData?.message ||
            response?.response?.data?.errorMessage;
          const message =
            status === 401
              ? serverMessage || "Your session expired. Please login again."
              : serverMessage || "Unable to load deal information. Please try again.";
          setLoadError(message);
          toastrError(message);
          setDeal((prev) => ({ ...prev, spining: false }));
          return;
        }

        if (!apiData.dealName) {
          const message = "Deal details are not available for this deal.";
          setLoadError(message);
          toastrError(message);
          setDeal((prev) => ({ ...prev, spining: false }));
          return;
        }

        let newObj = { ...apiData };
        try {
          const offers = await getUserReactivationOffers();
          newObj = mergeActiveOffersIntoDealData(newObj, offers);
        } catch (error) {
          /* single-deal API still carries offer flags when backend is updated */
        }
        if (newObj.monthlyInterest != 0) {
          newObj.rateOfInterest = newObj.monthlyInterest + " % PM";
          newObj["payout"] = "MONTHLY";
          localStorage.setItem("choosenPayOutOption", "MONTHLY");
        } else if (newObj.quartlyInterest != 0) {
          newObj.rateOfInterest = newObj.quartlyInterest * 3 + " % PA ";
          newObj["payout"] = "QUARTELY";
          localStorage.setItem("choosenPayOutOption", "QUARTELY");
        } else if (newObj.halfInterest != 0) {
          newObj.rateOfInterest = newObj.halfInterest * 6 + " % PA ";
          newObj["payout"] = "HALFLY";
          localStorage.setItem("choosenPayOutOption", "HALFLY");
        } else if (newObj.yearlyInterest != 0) {
          newObj.rateOfInterest = newObj.yearlyInterest * 12 + " %  PA ";
          newObj["payout"] = "YEARLY";
          localStorage.setItem("choosenPayOutOption", "YEARLY");
        } else if (newObj.endofthedealInterest != 0) {
          newObj.rateOfInterest = newObj.endofthedealInterest * 12 + " %  PA ";
          newObj["payout"] = "ENDOFTHEDEAL";
          localStorage.setItem("choosenPayOutOption", "ENDOFTHEDEAL");
        } else if (newObj.perDayInterestRoi != 0 || newObj.perDayInterestAmount != null) {
          newObj.rateOfInterest = newObj.perDayInterestRoi ==0.0 ? newObj.perDayInterestAmount + " PD " : newObj.perDayInterestRoi + " % PD ";
          newObj["payout"] = "PERDAY";
          localStorage.setItem("choosenPayOutOption", "PERDAY");
        }

        setDeal((prev) => ({
          ...prev,
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
          spining: false,
        }));
        setLoadError("");
      } catch (error) {
        const message = "Unable to load deal information. Please try again.";
        setLoadError(message);
        toastrError(message);
        setDeal((prev) => ({ ...prev, spining: false }));
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
    const withdrawriase = async () => {
      try {
        const response = await withdrawriaseapipay(null);
        if (response?.status === 200 && response.data) {
          const walletAmount = response.data.amount;
          setWithdrawriaseapi({
            message: response.data.status,
            amount:
              walletAmount === null || walletAmount === undefined
                ? ""
                : String(walletAmount),
            status: null,
          });
        }
      } catch (error) {
        /* wallet balance is optional for deal page */
      }
    };

    withdrawriase();
  }, []);

  useEffect(() => {
    const walletAmount = withdrawriaseapi.amount;
    if (walletAmount === "" || walletAmount === null || walletAmount === undefined) {
      return;
    }
    const walletNum = Number(walletAmount);
    if (!Number.isFinite(walletNum)) {
      return;
    }

    const urlparam = new URLSearchParams(window.location.search);
    const amountFromURL = urlparam.get("amount");
    const urlNum = Number(amountFromURL);
    if (Number.isFinite(urlNum) && urlNum === walletNum) {
      return;
    }

    urlparam.set("amount", String(walletNum));
    window.history.replaceState({}, "", `${window.location.pathname}?${urlparam.toString()}`);
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
       render: (value, data) => (
        <Tooltip title="DS - Days, MS - Months">
          <span>
            {value}{" "}
            {localStorage.getItem("choosenPayOutOption") === "PERDAY"
              ? data.value > 1 ? "DS" : "D"
              : data.value > 1 ? "MS" : "M"}
          </span>
        </Tooltip>
       )
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
  const rateOfInterest =
    deal.apidata && deal.apidata !== ""
      ? parseFloat(deal.apidata.rateOfInterest)
      : NaN;
  deal.apidata && deal.apidata != ""
    ? dataSource.push({
      key: Math.random(),
      name: deal.apidata.dealName,
      loanamount: deal.apidata.dealAmount,
      rateOfInterest: rateOfInterest,
      availablelimit: deal.apidata.remainingAmountInDeal,
      tenureinmonths: deal.apidata.duration + " " ,
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
            ) : loadError ? (
              <div className="alert alert-danger text-center m-5" role="alert">
                <h5 className="mb-2">Could not load deal</h5>
                <p className="mb-3">{loadError}</p>
                <Button
                  type="primary"
                  onClick={() => {
                    dealLoadStartedRef.current = false;
                    window.location.reload();
                  }}
                >
                  Retry
                </Button>
              </div>
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

                {deal.apidata.lenderValidityStatus == true &&
                  !isParticipationFeeWaived(deal.apidata, deal.participatedAmount) && (
                  <div className="row notepoint text-center m-5 align-self-center">
                    {deal.apidata.feeStatusToParticipate == "OPTIONAL" ? (
                      <h4 className="text-bold font-monospace">
                        <code>Note :</code> Processing Fee is waived for this
                        deal.
                      </h4>
                    ) : deal.apidata.groupName != "NewLender" ? (
                      <h4 className="text-bold fs-4 fw-light textquery">
                        <code>Note :</code> Your validity has expired. Please
                        pay to continue your participation.
                      </h4>
                    ) : (
                      <h4 className="text-bold fs-4 fw-light">
                        <code>Note :</code> You are requested to pay a 1%
                        processing fee on your investment.
                      </h4>
                    )}
                  </div>
                )}

                {offerAppliesNow && (
                  <div className="alert alert-success text-center m-4" role="alert">
                    <h5 className="mb-2">Special Offer Applied Successfully</h5>
                    <p className="mb-0">
                      Your participation fee has been waived.
                      This offer will be deactivated after this participation.
                    </p>
                  </div>
                )}

                {offerActiveBelowMinimum && (
                  <div className="alert alert-warning text-center m-4" role="alert">
                    <h5 className="mb-2">Special Offer Active</h5>
                    <p className="mb-0">
                      Invest at least ₹{OFFER_MIN_PARTICIPATION.toLocaleString("en-IN")} to use your
                      one-time offer. Normal fee applies below this amount. Your offer stays active.
                    </p>
                  </div>
                )}

                {hasActiveReactivationOffer(deal.apidata) &&
                  isMandatoryFeeDeal(deal.apidata) &&
                  participationAmount === 0 && (
                  <div className="alert alert-info text-center m-4" role="alert">
                    <h5 className="mb-2">Special Offer Available</h5>
                    <p className="mb-0">
                      {deal.apidata?.offerMessage ||
                        `Invest at least ₹${OFFER_MIN_PARTICIPATION.toLocaleString("en-IN")} on this mandatory deal to waive the participation fee (one-time use).`}
                    </p>
                  </div>
                )}

                {offerAppliesNow && deal.apidata?.grantsFreeSubscription && (
                  <div className="alert alert-success text-center m-4" role="alert">
                    <p className="mb-0">
                      Your offer also includes a free{" "}
                      {deal.apidata?.freeSubscriptionMonths || 1}-month membership after participation.
                      You will not need to pay a separate subscription fee.
                    </p>
                  </div>
                )}

                {offerAlreadyUsed && (
                  <div className="alert alert-secondary text-center m-4" role="alert">
                    <p className="mb-0">
                      {deal.apidata?.offerMessage ||
                        "Offer already used. Normal participation fee applies."}
                    </p>
                  </div>
                )}

                {deal.apidata?.subscriptionActive && !hasActiveReactivationOffer(deal.apidata) && (
                  <div className="alert alert-info text-center m-4" role="alert">
                    <h5 className="mb-2">Active Subscription Detected</h5>
                    <p className="mb-0">
                      {deal.apidata?.offerMessage ||
                        "You can participate without paying any deal fee."}
                    </p>
                  </div>
                )}

                {deal.apidata?.subscriptionActive &&
                  deal.apidata?.grantsFreeSubscription &&
                  !hasActiveReactivationOffer(deal.apidata) && (
                  <div className="alert alert-success text-center m-4" role="alert">
                    <p className="mb-0">
                      Your free {deal.apidata?.freeSubscriptionMonths || 1}-month membership is active.
                      No separate subscription payment is required.
                    </p>
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
                  {deal.participatedAmount !== 0 &&
                    deal.participatedAmount !== "" &&
                    deal.participatedAmount !== null &&
                    shouldShowPaymentSection && (
                      <div className="error">
                        This deal has a fee (1% + 18% GST) of ₹{" "}
                        {Math.round(deal.participatedAmount * 0.01 * 1.18)}.
                      </div>
                    )}
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
