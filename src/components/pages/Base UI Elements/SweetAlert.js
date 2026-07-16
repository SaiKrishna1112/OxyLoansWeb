import React, { Component } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import {
  getNewSessionTime,
  getFinancialReportDownload,
  downloadClosedLoanStatement,
  downloadTranactionStatement,
  cancelWithdrawalRequest,
  nofreeParticipationapi,
  handlePaymembershipapi,
  feeApicall,
  feeapicallforonedeal,
  cancelMyWithdrawWalletRequest,
  dealparticipationValidityUser,
  newlenderdealparticipation,
  confirmthependingamount,
  submitWithdrawalRequestFromWallet,
  handleprincipalreturnaccounttypeapi,
  handletocancelticketapi1,
  withdrawriaseapipay,
} from "../../HttpRequest/afterlogin";
import { toastrSuccess } from "./Toast";


export const OFFER_MIN_PARTICIPATION = 10000;
export const OFFER_STATUS_ACTIVE = "ACTIVE";
export const OFFER_STATUS_DEACTIVATED = "DEACTIVATED";

/** Deal participation fee waiver offers only — not SUBSCRIPTION_DISCOUNT. */
export const PARTICIPATION_FEE_OFFER_TYPES = new Set(["FIRST_DEAL_FREE"]);

export const normalizeOfferTypeCode = (offerType) => {
  if (!offerType) return "";
  if (typeof offerType === "string") return offerType.toUpperCase();
  if (typeof offerType === "object" && offerType.name) return String(offerType.name).toUpperCase();
  return String(offerType).toUpperCase();
};

export const isParticipationFeeOfferType = (offerType) =>
  PARTICIPATION_FEE_OFFER_TYPES.has(normalizeOfferTypeCode(offerType));

export const hasActiveReactivationOffer = (apidata) => {
  if (!apidata) return false;
  if (apidata.offerStatus === OFFER_STATUS_DEACTIVATED) return false;

  const activeType = apidata.activeOfferType || apidata.activeOfferTypeCode;
  if (activeType && !isParticipationFeeOfferType(activeType)) {
    return false;
  }

  if (apidata.offerStatus === OFFER_STATUS_ACTIVE) return true;
  if (apidata.offerActive === true || apidata.offerActive === "true") return true;
  if (apidata.activeOfferId) return true;
  if (Array.isArray(apidata.activeOffers) && apidata.activeOffers.length > 0) {
    return apidata.activeOffers.some(
      (o) =>
        !o.redeemed &&
        o.claimStatus !== "CLAIMED" &&
        isParticipationFeeOfferType(o.offerType || o.activeOfferType)
    );
  }
  return false;
};

export const isOfferDeactivated = (apidata) =>
  apidata?.offerStatus === OFFER_STATUS_DEACTIVATED;

export const isMandatoryFeeDeal = (apidata) =>
  apidata?.feeStatusToParticipate === "MANDATORY" || apidata?.mandatoryDeal === true;

/** True when lender should participate without membership/per-deal fee payment. */
export const isParticipationFeeWaived = (apidata, participationAmount = 0) => {
  if (!apidata) return false;
  if (apidata.feeStatusToParticipate === "OPTIONAL") return true;

  // Paid or offer-granted membership → no fee for ANY amount (same as normal membership flow)
  if (apidata.subscriptionActive === true || apidata.subscriptionActive === "true") {
    return true;
  }
  if (apidata.lenderValidityStatus === false || apidata.lenderValidityStatus === "false") {
    // Valid membership on file — same as historical zero-fee participate path
    if (apidata.groupName !== "NewLender") {
      return true;
    }
  }

  // Backend said no payment required — only treat as waived when membership OR offer eligible for this amount
  if (apidata.paymentRequired === false || apidata.paymentRequired === "false") {
    if (apidata.subscriptionActive === true || apidata.subscriptionActive === "true") {
      return true;
    }
    if (apidata.lenderValidityStatus === false || apidata.lenderValidityStatus === "false") {
      if (apidata.groupName !== "NewLender") {
        return true;
      }
    }
    // Offer-driven paymentRequired=false: only if amount meets minimum for FIRST_DEAL_FREE
    if (hasActiveReactivationOffer(apidata) || apidata.offerEligible === true || apidata.offerEligible === "true") {
      return Number(participationAmount) >= OFFER_MIN_PARTICIPATION;
    }
    return true;
  }

  if (!isMandatoryFeeDeal(apidata)) {
    return false;
  }

  // Active FIRST_DEAL_FREE offer → waive FEE only when amount meets minimum
  if (hasActiveReactivationOffer(apidata)) {
    const amount = Number(participationAmount) || 0;
    if (amount >= OFFER_MIN_PARTICIPATION) {
      return true;
    }
    // Amount below minimum: normal fee applies; offer stays ACTIVE until eligible participate
    return false;
  }

  if (
    (apidata.offerEligible === true || apidata.offerEligible === "true") &&
    Number(participationAmount) >= OFFER_MIN_PARTICIPATION
  ) {
    return true;
  }

  return false;
};

export const calculatePerDealProcessingFee = (participatedAmount) => {
  const amount = Number(participatedAmount) || 0;
  const onePercent = (amount * 1) / 100;
  return (onePercent * 118) / 100;
};

/** Participate with PENDING per-deal fee, then deduct fee from wallet automatically. */
export const participateWithPerDealFee = (deal) => {
  const feeAmount = calculatePerDealProcessingFee(deal.participatedAmount);
  const response = newlenderdealparticipation(deal);
  return response.then((data) => {
    const httpStatus = data?.status ?? data?.request?.status;
    if (httpStatus !== 200) {
      return Promise.reject(data);
    }
    return feeapicallforonedeal(feeAmount, deal.urldealId).then((feeRes) => {
      const feeStatus = feeRes?.status ?? feeRes?.request?.status;
      if (feeStatus !== 200) {
        return Promise.reject({ participate: data, fee: feeRes });
      }
      return { participate: data, fee: feeRes, feeAmount };
    });
  });
};

const showPerDealFeeParticipationSuccess = (deal, feeAmount) => {
  Swal.fire({
    title: "Congratulations!",
    text: `We are reserving ${deal.participatedAmount} for ${deal.apidata.dealName}. INR ${feeAmount} participation fee was deducted from your wallet.`,
    icon: "success",
    showCancelButton: true,
    cancelButtonText: "cancel",
    showConfirmButton: true,
    confirmButtonText: "OK",
  }).then((result) => {
    if (result.isConfirmed) {
      window.location.reload();
    }
  });
};

const showPerDealFeeParticipationError = (data) => {
  const participateErr = data?.response?.data || data?.participate?.response?.data;
  const feeErr = data?.fee?.response?.data;
  const errPayload = participateErr || feeErr || data?.response?.data;
  if (errPayload?.errorCode == "123") {
    const paymentErrormessage = String(errPayload.errorMessage || "").match(/\d+(\.\d+)?/g);
    Swal.fire({
      title: "Fee Alert",
      text: `${errPayload.errorMessage}`,
      icon: "info",
      showCancelButton: true,
      cancelButtonText: "cancel",
      showConfirmButton: true,
      confirmButtonText: "Wallet",
    }).then(async (result) => {
      if (result.isConfirmed && paymentErrormessage?.length >= 2) {
        paypendingprocessingAmount(paymentErrormessage[1], parseInt(paymentErrormessage[0], 10));
      }
    });
    return;
  }
  Swal.fire({
    title: "Error!",
    text: `${errPayload?.errorMessage || "Participation or fee payment failed."}`,
    icon: "error",
    showCancelButton: true,
    cancelButtonText: "cancel",
    showConfirmButton: true,
    confirmButtonText: "ok",
  });
};

const participateWithoutFee = (deal) => {
  // Same API as normal valid-membership participate (updatingLenderDeal with fee COMPLETED).
  // Offer only waives the participation FEE — lending amount must still reduce the wallet.
  const response = dealparticipationValidityUser(deal);
  response.then((data) => {
    const httpStatus = data?.status ?? data?.request?.status;
    if (httpStatus === 200) {
      const resp = data.data || {};
      const offerWasConsumed =
        resp.offerConsumed === true ||
        resp.offerConsumed === "true" ||
        resp.offerStatus === OFFER_STATUS_DEACTIVATED;
      const subscriptionGranted =
        resp.subscriptionGrantedThroughOffer === true ||
        resp.subscriptionGrantedThroughOffer === "true";

      // Normal users (no offer claim) — keep classic congratulations popup
      if (!offerWasConsumed && !subscriptionGranted) {
        Swal.fire({
          title: "Congratulations!",
          text: `We are reserving ${deal.participatedAmount} for ${deal.apidata.dealName}. No participation fee required.`,
          icon: "success",
          showCancelButton: true,
          confirmButtonColor: "#3085d6",
          cancelButtonColor: "#d33",
          confirmButtonText: "OK",
        }).then((result) => {
          if (result.isConfirmed) {
            window.location.reload();
          }
        });
        return;
      }

      // Offer claimed — short, clear success message (wallet already debited like normal flow)
      const months =
        resp.freeSubscriptionMonths ||
        deal.apidata?.freeSubscriptionMonths ||
        1;
      const offerPopupTitle = "Offer Claimed Successfully!";
      const offerPopupText = subscriptionGranted
        ? `We are reserving ${deal.participatedAmount} for ${deal.apidata.dealName}. Participation fee waived. Free ${months}-month membership is now active.`
        : `We are reserving ${deal.participatedAmount} for ${deal.apidata.dealName}. Participation fee waived. This offer is now claimed.`;

      Swal.fire({
        title: offerPopupTitle,
        text: offerPopupText,
        icon: "success",
        confirmButtonColor: "#198754",
        confirmButtonText: "OK",
        showCancelButton: false,
      }).then((result) => {
        if (result.isConfirmed) {
          window.location.reload();
        }
      });
    } else {
      const errMsg =
        data?.response?.data?.errorMessage ||
        data?.data?.errorMessage ||
        data?.message ||
        "Participation failed. Your wallet was not charged.";
      Swal.fire({
        title: "Error!",
        text: `${errMsg}`,
        icon: "error",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "OK",
      });
    }
  });
};

// Inside your component
export const HandleClick = () => {
  Swal.fire({
    title: "Any fool can use a computer",
    confirmButtonClass: "btn btn-primary",
    buttonsStyling: !1,
  });
};
export const HandleWithTitle = () => {
  Swal.fire({
    title: "The Internet?,",
    text: "That thing is still around?",
    confirmButtonClass: "btn btn-primary",
    buttonsStyling: !1,
  });
};
export const HandleWithFooter = (message) => {
  Swal.fire({
    type: "success",
    title: "Congratulations",
    text: message,
    confirmButtonClass: "btn btn-primary",
    buttonsStyling: !1,
  });
};

export const topStart = () => {
  Swal.fire({
    position: "top-start",
    type: "success",
    title: "Your work has been saved",
    showConfirmButton: !1,
    timer: 1500,
    confirmButtonClass: "btn btn-primary",
    buttonsStyling: !1,
  });
};
export const topEnd = () => {
  Swal.fire({
    position: "top-end",
    type: "success",
    title: "Your work has been saved",
    showConfirmButton: !1,
    timer: 1500,
    confirmButtonClass: "btn btn-primary",
    buttonsStyling: !1,
  });
};
export const bottomStart = () => {
  Swal.fire({
    position: "bottom-start",
    type: "success",
    title: "Your work has been saved",
    showConfirmButton: !1,
    timer: 1500,
    confirmButtonClass: "btn btn-primary",
    buttonsStyling: !1,
  });
};
export const bottomEnd = () => {
  Swal.fire({
    position: "bottom-end",
    type: "success",
    title: "Your work has been saved",
    showConfirmButton: !1,
    timer: 1500,
    confirmButtonClass: "btn btn-primary",
    buttonsStyling: !1,
  });
};

// export const Info = (message, data) => {
//   Swal.fire({
//     title: "INFO!",
//     text: message,
//     type: "info",
//     icon: "info",
//     confirmButtonClass: "btn btn-primary",
//     confirmButtonText: "Add",
//     cancelButtonText: "cancel",
//     showCloseButton: true,
//   }).then((result) => {
//     if (result.isConfirmed) {
//       const response = submitWithdrawalRequestFromWallet(data, "ADD");
//       response.then((data) => {
//         if (data.request.status == 200) {
//           HandleWithFooter(
//             "Withdrawal request successful. You'll be notified when credited. Note: Funds will be in bank within 2-7 working days."
//           );
//         } else {
//           WarningAlertwithdrow(data.response.data.errorMessage);
//         }
//       });
//     }
//   });
// };

export const Info = (message, data) => {
  Swal.fire({
    title: "INFO!",
    text: message,
    icon: "info",
    showCancelButton: true,
    confirmButtonClass: "btn btn-primary",
    confirmButtonText: "Add",
    cancelButtonText: "Update",
    showCloseButton: true,
  }).then((result) => {
    if (result.isConfirmed) {
      // Handle "Add" button click
      const response = submitWithdrawalRequestFromWallet(data, "ADD");
      response.then((data) => {
        if (data.request.status === 200) {
          HandleWithFooter(
            "Withdrawal request successful. You'll be notified when credited. Note: Funds will be in the bank within 2-7 working days."
          );
        } else {
          WarningAlertwithdrow(data.response.data.errorMessage);
        }
      });
    } else if (result.dismiss === Swal.DismissReason.cancel) {
      // Handle "Update" button click
      const response = submitWithdrawalRequestFromWallet(data, "UPDATED");
      response.then((data) => {
        if (data.request.status === 200) {
          HandleWithFooter(
            "Withdrawal request updated successfully. You'll be notified when credited. Note: Funds will be in the bank within 2-7 working days."
          );
        } else {
          WarningAlertwithdrow(data.response.data.errorMessage);
        }
      });
    }
  });
};

export const registersuccess = (message) => {
  Swal.fire({
    title: "Success!",
    text: message,
    type: "info",
    confirmButtonClass: "btn btn-primary",
    buttonsStyling: !1,
    confirmButtonText: "Login",
    showConfirmButton: true,
  }).then((result) => {
    if (result.isConfirmed) {
      window.location.href = "/";
    }
  });
};

export const membershipsuccess = (message) => {
  Swal.fire({
    title: "Success!",
    text: message,
    type: "info",
    confirmButtonClass: "btn btn-primary",
    buttonsStyling: !1,
    confirmButtonText: "dashboard",
    showConfirmButton: true,
  }).then((result) => {
    if (result.isConfirmed) {
      window.location.href = "/dashboard";
    }
  });
};

export const membershipsuccessinfo = (message) => {
  Swal.fire({
    text: message,
    type: "info",
    confirmButtonClass: "btn btn-primary",
    buttonsStyling: !1,
    confirmButtonText: "ok",
    showConfirmButton: true,
  });
};

export const WarningAlert = (errorMessage, redirectTo) => {
  Swal.fire({
    title: "Session Expiring",
    text: errorMessage,
    icon: "warning",
    showDenyButton: true,
    confirmButtonText: "Sign Out",
    denyButtonText: "Continue",
    denyButtonColor: "#5c9b45",
  }).then((result) => {
    if (result.isConfirmed) {
      window.location.href = `${redirectTo}`;
    } else if (result.isDenied) {
      getNewSessionTime();
      Swal.fire("Session!", "New session has Generated.", "success");
    }
  });
};
export const WarningAlertwithdrow = (errorMessage, redirectTo) => {
  Swal.fire({
    title: "Error",
    text: errorMessage,
    icon: "warning",
  }).then((result) => {});
};

export const WarningAlertwithdrow1 = (errorMessage, redirectTo) => {
  Swal.fire({
    title: "Error",
    text: errorMessage,
    icon: "warning",
  }).then((result) => {
    if (result.isConfirmed) {
      // User clicked "Get Membership"
      window.location.href = "/myRunningDeals";
    }
  });
};
export const validityDatemodal = (validityDate, groupName) => {
  Swal.fire({
    title: "Membership reminder",
    html: `<p style={{marginBottom: '2px'}}> ${
      groupName == "NewLender"
        ? " Membership reminder"
        : "Your membership validity expired"
    }   ${validityDate == null ? "" : validityDate}.</p>`,
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#3085d6",
    cancelButtonColor: "#d33",
    confirmButtonText: "Get Membership",
    cancelButtonText: "Skip", // Add this line to set the text for the Cancel button
  }).then((result) => {
    if (result.isConfirmed) {
      // User clicked "Get Membership"
      window.location.href = "/membership";
    } else if (result.dismiss === Swal.DismissReason.cancel) {
      localStorage.setItem("skip", true);
    }
  });
};

export const dealmembership = (message, route) => {
  Swal.fire({
    title: message,
    html: `<p style={{marginBottom: '2px'}}></p>`,
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#3085d6",
    cancelButtonColor: "#d33",
    confirmButtonText: "update",
    cancelButtonText: "Skip", // Add this line to set the text for the Cancel button
  }).then((result) => {
    if (result.isConfirmed) {
      window.location.href = route;
    } else if (result.dismiss === Swal.DismissReason.cancel) {
      localStorage.setItem("dealmember", true);
    }
  });
};
export const personalDetails = (message, route) => {
  Swal.fire({
    title: message,
    html: `<p style={{marginBottom: '2px'}}></p>`,
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#3085d6",
    cancelButtonColor: "#d33",
    confirmButtonText: "Update",
    cancelButtonText: "Skip",
  }).then((result) => {
    if (result.isConfirmed) {
      window.location.href = route;
    } else if (result.dismiss === Swal.DismissReason.cancel) {
      localStorage.setItem("profileskip", true);
    }
  });
};

export const participatedapi = async (deal) => {
  const payoutmethod = localStorage.getItem("choosenPayOutOption");
  Swal.fire({
    title: "Please review the lending details!",
    html: `<p><strong> Lending Amount :- INR </strong>${deal.participatedAmount}</p>
           <p><strong> Deal Name : </strong>${deal.apidata.dealName}</p>
           <p><strong> Pay-out Method : </strong>${payoutmethod}</p>`,
    icon: "info",
    showCancelButton: true,
    confirmButtonColor: "#3085d6",
    cancelButtonColor: "#d33",
    confirmButtonText: "Ok!",
  }).then((result) => {
    if (result.isConfirmed) {
      // Fee waived only when membership is active OR FIRST_DEAL_FREE amount >= ₹10,000.
      // Below minimum: normal fee path (1% + GST).
      if (isParticipationFeeWaived(deal.apidata, deal.participatedAmount)) {
        participateWithoutFee(deal);
        return;
      }

      if (deal.apidata.groupName == "NewLender") {
          participateWithPerDealFee(deal)
            .then(({ feeAmount }) => showPerDealFeeParticipationSuccess(deal, feeAmount))
            .catch((err) => showPerDealFeeParticipationError(err));
        } else if (
          deal.apidata.lenderValidityStatus == true &&
          deal.apidata.groupName != "NewLender" &&
          isMandatoryFeeDeal(deal.apidata) &&
          hasActiveReactivationOffer(deal.apidata) &&
          Number(deal.participatedAmount) < OFFER_MIN_PARTICIPATION
        ) {
          participateWithPerDealFee(deal)
            .then(({ feeAmount }) => showPerDealFeeParticipationSuccess(deal, feeAmount))
            .catch((err) => showPerDealFeeParticipationError(err));
        } else if (
          deal.apidata.lenderValidityStatus == true &&
          deal.apidata.groupName != "NewLender"
        ) {
          membership(deal.urldealId, deal, deal.participatedAmount);
        } else if (
          deal.apidata.lenderValidityStatus == false &&
          deal.apidata.groupName != "NewLender"
        ) {
          const response = dealparticipationValidityUser(deal);
          response.then((data) => {
            if (data.request.status === 200) {
              Swal.fire({
                title: "Congratulations!",
                text: `We are reserving ${deal.participatedAmount} for ${deal.apidata.dealName}.`,
                icon: "success",
                showCancelButton: true,
                cancelButtonText: "cancel",
                showConfirmButton: true,
                confirmButtonText: "OK",
              });
            } else {
              console.log(data.response);
              Swal.fire({
                title: "Error!",
                text: `${data.response.data.errorMessage}`,
                icon: "error",
                showCancelButton: true,
                cancelButtonText: "cancel",
                showConfirmButton: true,
                confirmButtonText: "ok",
              });
            }
          });
        }
    }
  });
};

export const membership = async (dealId, dealInfo, participatedAmount) => {
  if (isParticipationFeeWaived(dealInfo?.apidata, participatedAmount)) {
    participateWithoutFee(dealInfo);
    return;
  }

  let amount;
  let calculate;
  const tenure = {
    monthly: 1000,
    quarterly: 2900,
    halfyearly: 5600,
    peryear: 9800,
    lifetime: 100000,
    fiveyears: 50000,
    tenyears: 90000,
    PerDeal: participatedAmount,
  };
  const inputOptions = new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        monthly: "One Month",
        quarterly: "Quarterly",
        halfyearly: "Half-Yearly",
        peryear: "One Year",
        lifetime: "Five Years",
        fiveyears: "Ten Years",
        tenyears: "Life Time",
        PerDeal: "PerDeal",
      });
    }, 1000);
  });

  const { value: choosenPayoutMethod } = await Swal.fire({
    title: "Select Payment Method",
    width: "1100px",
    input: "radio",
    inputOptions,
    cancelButtonText: "Cancel",
    inputValidator: (value) => {
      if (!value) {
        return "You need to choose Payment Method!";
      }
    },
  });

  if (choosenPayoutMethod) {
    const selectedOption = choosenPayoutMethod;
    if (selectedOption == "PerDeal") {
      amount = tenure[selectedOption];
      const onepercentage = (amount * 1) / 100;
      calculate = (onepercentage * 118) / 100;
    } else {
      amount = tenure[selectedOption];
      calculate = (amount * 118) / 100;
    }
if(choosenPayoutMethod == "PerDeal"){
  participateWithPerDealFee(dealInfo)
    .then(({ feeAmount }) => showPerDealFeeParticipationSuccess(dealInfo, feeAmount))
    .catch((err) => showPerDealFeeParticipationError(err));
}else{
    Swal.fire({
      html: `You selected: ${choosenPayoutMethod}  membership tenure and you have to pay the ${calculate} to participate the deal `,
      showCancelButton: true,
      confirmButtonText: "Pay & Participate",
      cancelButtonText: "Cancel",
    }).then((result) => {
      if (result.isConfirmed) {
        feeApicall(calculate, selectedOption).then((response) => {
          if (response.request.status === 200) {
            console.log(response.data.status);
            Swal.fire({
              title: "Congratulations!",
              text: response.data.status,
              icon: "success",
              showCancelButton: true,
              cancelButtonText: "cancel",
              showConfirmButton: true,
              confirmButtonText: "ok",
            });
            const responseValidity = dealparticipationValidityUser(dealInfo);
            responseValidity.then((data) => {
              if (data.request.status === 200) {
                Swal.fire({
                  title: "Congratulations!",
                  text: `We are reserving ${dealInfo.participatedAmount} for ${dealInfo.apidata.dealName}. `,
                  icon: "success",
                  showCancelButton: true,
                  cancelButtonText: "cancel",
                  showConfirmButton: true,
                  confirmButtonText: "ok",
                });
              } else {
                Swal.fire({
                  title: "Error!",
                  text: `${data.response.data.errorMessage}`, // Displaying the error message
                  icon: "error",
                  showCancelButton: true,
                  cancelButtonText: "cancel",
                  showConfirmButton: true,
                  confirmButtonText: "ok",
                });
              }
            });
          } else {
            Swal.fire({
              title: "Error!",
              text: `${data.response.data.errorMessage}`, // Displaying the error message
              icon: "error",
              showCancelButton: true,
              cancelButtonText: "cancel",
              showConfirmButton: true,
              confirmButtonText: "ok",
            });
          }
        });
      }
    });
  }
}
};
// export const withdrawriaseapi11 = (navigate, url ,message) => {

//   Swal.fire({
//     title: "error",
//     text: message,
//     icon: "warning",
//     showCancelButton: true,
//     cancelButtonText: "cancel",
//     showConfirmButton: true,
//     confirmButtonText: "ok",
//   }).then((result) => {
//     if (result.isConfirmed) {
//       withdrawriaseapipay("ok")
//         .then((data) => {
//           Swal.fire({
//             title: "Processing fee paid successfully!",
//             // text: `${data.data.status}`,
//             icon: "success",
//             showCancelButton: true,
//             cancelButtonText: "cancel",
//             showConfirmButton: true,
//             confirmButtonText: "ok",
//           });
//           navigate(url)
//         })
//         .catch((error) => {});
//     }
//   });
// };
export const newlenderfree = (amount, dealId) => {
  const freeamount = (amount * 1) / 100;

  Swal.fire({
    title: "Congratulations on successfully completing your participation!",
    text: `To finalize the process, a nominal 1%  Rs:${freeamount} /- processing fee is required. Kindly submit the payment at your earliest convenience.`,
    icon: "success",
    showCancelButton: true,
    cancelButtonText: "cancel",
    showConfirmButton: true,
    confirmButtonText: "ok",
  }).then((result) => {
    if (result.isConfirmed) {
      feeapicallforonedeal(freeamount, dealId)
        .then((data) => {
          Swal.fire({
            title: "Processing fee paid successfully!",
            // text: `${data.data.status}`,
            icon: "success",
            showCancelButton: true,
            cancelButtonText: "cancel",
            showConfirmButton: true,
            confirmButtonText: "ok",
          });
          localStorage.removeItem("participatedAmount");
          localStorage.removeItem("newLender");
        })
        .catch((error) => {});
    }
  });
};

export const WarningAlertWalltTran = (errorMessage, redirectTo) => {
  Swal.fire({
    title: "error",
    text: errorMessage,
    icon: "warning",
    showCancelButton: true,
    cancelButtonText: "Cancel",
    showConfirmButton: true,
    confirmButtonText: "Ok",
  }).then((result) => {});
};
export const PrincipalTransfer = (warningType, errormessage) => {
  Swal.fire("Principal Payout!", errormessage, warningType);
  setTimeout(() => {
    window.location.reload();
  }, 3000);
};

export const WarningAlerterror = (errorMessage, redirectTo) => {
  Swal.fire({
    title: "error",
    text: errorMessage,
    icon: "error",
    showDenyButton: true,
    showCancelButton: true,
    cancelButtonText: "Cancel",
    showConfirmButton: true,
    confirmButtonText: "Ok",
  });
};
export const partnerrequestInfoError = (message) => {
  Swal.fire({
    title: "Error!",
    text: message,
    type: "error",
    confirmButtonClass: "btn btn-primary",
    buttonsStyling: !1,
    showConfirmButton: true,
    confirmButtonText: "Ok",
  });
};
export const Error = () => {
  Swal.fire({
    title: "Error!",
    text: " You clicked the button!",
    type: "error",
    confirmButtonClass: "btn btn-primary",
    buttonsStyling: !1,
    showCancelButton: true,
    cancelButtonText: "Cancel",
    showConfirmButton: true,
    confirmButtonText: "Ok",
  });
};
export const membershipsweetalert = (message) => {
  Swal.fire(message);
};

export const membershipsweetalertconformation = (membership, no) => {
  Swal.fire({
    title: "Are you willing to proceed with the payment at this moment ?",
    showDenyButton: false,
    showCancelButton: true,
    confirmButtonText: "Pay Through wallet",
    denyButtonText: "Payment Gateway",
  }).then((result) => {
    if (result.isConfirmed) {
      const response = handlePaymembershipapi(membership, no);
      response.then((data) => {
        if (data.status == 200) {
          Swal.fire("Success!", `Payment received successfully!`, "success");
          setTimeout(() => {
            window.location.href = `/dashboard`;
          }, 5000);
        } else {
          membershipsweetalert(data.response.data.errorMessage);
        }
      });
    } else if (result.isDenied) {
      return "dined";
    } else if (result.dismiss) {
      console.log("dismiss");
    }
  });
};

export const newlendersweetalert = () => {
  const navigate = useNavigate();

  Swal.fire({
    title:
      "You are a new lender group, pay the annual membership fee to participate in the multiple deals. ?",
    showDenyButton: true,
    confirmButtonText: "Pay Through wallet",
  }).then((result) => {
    if (result.isConfirmed) {
      navigate("/membership");
    }
  });
};
export const autoClose = () => {
  var t;
  Swal.fire({
    title: "Auto close alert!",
    html: "I will close in <strong></strong> seconds.",
    timer: 2e3,
    confirmButtonClass: "btn btn-primary",
    buttonsStyling: !1,
    onBeforeOpen: function () {
      Swal.showLoading(),
        (t = setInterval(function () {
          Swal.getContent().querySelector("strong").textContent =
            Swal.getTimerLeft();
        }, 100));
    },
    onClose: function () {
      clearInterval(t);
    },
  }).then(function (t) {
    t.dismiss === Swal.DismissReason.timer &&
      console.log("I was closed by the timer");
  });
};
export const outsideClick = () => {
  Swal.fire({
    title: "Click outside to close!",
    text: "This is a cool message!",
    allowOutsideClick: !0,
    confirmButtonClass: "btn btn-primary",
    buttonsStyling: !1,
  });
};
export const Prompt = () => {
  Swal.fire({
    input: "text",
    confirmButtonText: "Next &rarr;",
    showCancelButton: !0,
    progressSteps: ["1", "2", "3"],
    confirmButtonClass: "btn btn-primary",
    buttonsStyling: !1,
    cancelButtonClass: "btn btn-danger ml-1",
  })
    .queue([
      { title: "Question 1", text: "Chaining swal2 modals is easy" },
      "Question 2",
      "Question 3",
    ])
    .then(function (t) {
      t.value &&
        Swal.fire({
          title: "All done!",
          html:
            "Your answers: <pre><code>" +
            JSON.stringify(t.value) +
            "</code></pre>",
          confirmButtonText: "Lovely!",
        });
    });
};
export const confirmText = () => {
  Swal.fire({
    title: "Are you sure?",
    text: "You won't be able to revert this!",
    type: "warning",
    showCancelButton: !0,
    confirmButtonColor: "#3085d6",
    cancelButtonColor: "#d33",
    confirmButtonText: "Yes, delete it!",
    confirmButtonClass: "btn btn-primary",
    cancelButtonClass: "btn btn-danger ml-1",
    buttonsStyling: !1,
  }).then(function (t) {
    t.value &&
      Swal.fire({
        type: "success",
        title: "Deleted!",
        text: "Your file has been deleted.",
        confirmButtonClass: "btn btn-success",
      });
  });
};
export const confirmColor = () => {
  Swal.fire({
    title: "Are you sure?",
    text: "You won't be able to revert this!",
    type: "warning",
    showCancelButton: !0,
    confirmButtonColor: "#3085d6",
    cancelButtonColor: "#d33",
    confirmButtonText: "Yes, delete it!",
    confirmButtonClass: "btn btn-primary",
    cancelButtonClass: "btn btn-danger ml-1",
    buttonsStyling: !1,
  }).then(function (t) {
    t.value
      ? Swal.fire({
          type: "success",
          title: "Deleted!",
          text: "Your file has been deleted.",
          confirmButtonClass: "btn btn-success",
        })
      : t.dismiss === Swal.DismissReason.cancel &&
        Swal.fire({
          title: "Cancelled",
          text: "Your imaginary file is safe :)",
          type: "error",
          confirmButtonClass: "btn btn-success",
        });
  });
};

export const confirmationAlertFyYear = (
  startdate,
  enddate,
  downloadType,
  status
) => {
  Swal.fire({
    title: "Are you sure?",
    text: `You want to ${
      downloadType == "DOWNLOAD"
        ? `Download the ${
            status == "dealsumMonthly" ? "Monthly" : "FY"
          } Statement`
        : "Get FY Email Statement"
    } `,
    icon: "info",
    showCancelButton: true,
    confirmButtonColor: "#3085d6",
    cancelButtonColor: "#d33",
    confirmButtonText: "Yes !",
  }).then((result) => {
    if (result.isConfirmed) {
      const response = getFinancialReportDownload(
        startdate,
        enddate,
        downloadType,
        status
      );
      response.then((data) => {
        if (data.request.status == 200) {
          if (downloadType == "DOWNLOAD") {
            window.open(data.data.lenderProfit, "_blank");
          }
          Swal.fire(
            "Success!",
            `${
              downloadType == "DOWNLOAD"
                ? "Your file has been downloaded."
                : "We have sent FY Statement  to your Email"
            }`,
            "success"
          );
        }
      });
    }
  });
};

export const downloadClosedLoanStatementAlert = (type) => {
  Swal.fire({
    title: "Are you sure?",
    text: `You want to download All  Closed Deal Information  `,
    icon: "info",
    showCancelButton: true,
    confirmButtonColor: "#3085d6",
    cancelButtonColor: "#d33",
    confirmButtonText: "Yes !",
  }).then((result) => {
    if (result.isConfirmed) {
      const response = downloadClosedLoanStatement(type);
      response.then((data) => {
        if (data.request.status == 200) {
          window.open(data.data.closedDealsDownloadUrl, "_blank");
          Swal.fire("Success!", `Downloaded Successfully`, "success");
        } else if (data.response.data.errorCode != "200") {
          Swal.fire(
            "warning!",
            `${data.response.data.errorMessage}`,
            "warning"
          );
        }
      });
    }
  });
};
export const handleprincipalreturnaccounttype = (dealId, accountType) => {
  const accountType1 = accountType === "WALLET" ? "BANKACCOUNT" : "WALLET";
  Swal.fire({
    title: "Are you sure?",
    text: `Are You Sure, you want to move the principal amount to ${accountType1}?`,
    icon: "info",
    showCancelButton: true,
    confirmButtonColor: "#3085d6",
    cancelButtonColor: "#d33",
    confirmButtonText: "Yes !",
  }).then((result) => {
    if (result.isConfirmed) {
      const response = handleprincipalreturnaccounttypeapi(
        dealId,
        accountType1
      );
      response.then((data) => {
        if (data.request.status == 200) {
          Swal.fire("Success!", `Thanks for your update.`, "success");
        } else if (data.response.data.errorCode != "200") {
          Swal.fire(
            "warning!",
            `${data.response.data.errorMessage}`,
            "warning"
          );
        }
      });
    }
  });
};

export const handletocancelticket = (id) => {
  Swal.fire({
    text: `Are you sure you want to cancel the query?  `,
    icon: "info",
    showCancelButton: true,
    confirmButtonColor: "#3085d6",
    cancelButtonColor: "#d33",
    confirmButtonText: "Yes !",
  }).then((result) => {
    if (result.isConfirmed) {
      const response = handletocancelticketapi1(id);
      response.then((data) => {
        if (data.request.status == 200) {
          Swal.fire("Success!", `Query cancelled successfully`, "success");
        } else if (data.response.data.errorCode != "200") {
          Swal.fire(
            "warning!",
            `${data.response.data.errorMessage}`,
            "warning"
          );
        }
      });
    }
  });
};
export const downloadMytransactionAlert = () => {
  Swal.fire({
    title: "Are you sure?",
    text: `You want to download Transaction Information  `,
    icon: "info",
    showCancelButton: true,
    confirmButtonColor: "#3085d6",
    cancelButtonColor: "#d33",
    confirmButtonText: "Yes !",
  }).then((result) => {
    if (result.isConfirmed) {
      const response = downloadTranactionStatement();
      response.then((data) => {
        if (data.request.status == 200) {
          window.open(data.data.downloadUrl, "_blank");
          Swal.fire("Success!", `Downloaded Successfully`, "success");
        } else if (data.response.data.errorCode != "200") {
          Swal.fire(
            "warning!",
            `${data.response.data.errorMessage}`,
            "warning"
          );
        }
      });
    }
  });
};

export const freeParticipationapialert = (
  apidata,
  groupId,
  urldealId,
  bank,
  lenderReturnType,
  deal
) => {
  Swal.fire({
    title: "Please review the lending details!",
    text: `Lending Amount: INR ${deal.participatedAmount}<br></br>Deal Name: ${deal.dealName}<br></br>RoI: ${deal}%`,
    icon: "info",
    showCancelButton: true,
    confirmButtonColor: "#3085d6",
    cancelButtonColor: "#d33",
    confirmButtonText: "Yes!",
  }).then((result) => {
    if (result.isConfirmed) {
      const response = nofreeParticipationapi(
        apidata,
        groupId,
        urldealId,
        bank,
        lenderReturnType,
        deal
      );
      response.then((data) => {
        if (data.request.status == 200) {
          toastrSuccess("Deal participated successfully"); // Make sure toastrSuccess is defined
        } else if (data.response.data.errorCode != "200") {
          Swal.fire(
            "Warning!",
            `${data.response.data.errorMessage}`,
            "warning"
          );
        }
      });
    }
  });
};

export const paypendingprocessingAmount = (dealaId, fee) => {
  Swal.fire({
    title: "Are you sure?",
    text: `You want to pay the INR ${fee} processing fee Amount`,
    icon: "info",
    showCancelButton: true,
    confirmButtonColor: "#3085d6",
    cancelButtonColor: "#d33",
    confirmButtonText: "Yes !",
  }).then((result) => {
    if (result.isConfirmed) {
      const response = confirmthependingamount(dealaId, fee);
      response.then((data) => {
        if (data.request.status == 200) {
          Swal.fire(
            "Success!",
            `Sucessfully Paid The Pending Amount`,
            "success"
          );

          setTimeout(() => {
            window.location.reload();
          }, 5000);
        } else if (data.response.data.errorCode != "200") {
          Swal.fire(
            "warning!",
            `${data.response.data.errorMessage}`,
            "warning"
          );
        }
      });
    }
  });
};

export const cancelwithdrawalRequestInformation = (fromrequest, id) => {
  Swal.fire({
    title: "Are you sure?",
    text: `You want to Cancel The Withdrawal Request`,
    icon: "info",
    showCancelButton: true,
    confirmButtonColor: "#3085d6",
    cancelButtonColor: "#d33",
    confirmButtonText: "Yes !",
  }).then((result) => {
    if (result.isConfirmed) {
      const response = cancelWithdrawalRequest(fromrequest, id);
      response.then((data) => {
        if (data.request.status == 200) {
          Swal.fire("Success!", `Sucessfully Cancel The Request`, "success");
        } else if (data.response.data.errorCode != "200") {
          Swal.fire(
            "warning!",
            `${data.response.data.errorMessage}`,
            "warning"
          );
        }
      });
    }
  });
};

export const cancelwithdrawalWalletToWallet = async (id) => {
  console.log(id);
  Swal.fire({
    title: "Are you sure?",
    text: `You want to Cancel The  Request`,
    icon: "info",
    showCancelButton: true,
    confirmButtonColor: "#3085d6",
    cancelButtonColor: "#d33",
    confirmButtonText: "Yes !",
  }).then((result) => {
    if (result.isConfirmed) {
      console.log(id);
      const response = cancelMyWithdrawWalletRequest(id);
      response.then((data) => {
        if (
          data == undefined ||
          data.request.status == 200 ||
          data.request.status == 204
        ) {
          Swal.fire("Success!", `Sucessfully Cancel The Request`, "success");
          setTimeout(() => {
            window.location.reload();
          }, 3000);
        } else if (data.response.data.errorCode != "200") {
          Swal.fire(
            "warning!",
            `${data.response.data.errorMessage}`,
            "warning"
          );
        }
      });
    }
  });
};

export const Success = (tittle, message) => {
  Swal.fire(`${tittle}`, `${message}`, "success");
};

export const WarningBackendApi = (tittle, message) => {
  const safeTitle =
    tittle != null && String(tittle).trim() && String(tittle) !== "undefined"
      ? String(tittle).trim()
      : "Warning";
  const safeMessage =
    message != null && String(message).trim() && String(message) !== "undefined"
      ? String(message).trim()
      : "Something went wrong. Please try again.";
  Swal.fire(safeTitle, safeMessage, "warning");
};
