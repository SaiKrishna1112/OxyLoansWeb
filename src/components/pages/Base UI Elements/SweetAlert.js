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
      if (deal.apidata.feeStatusToParticipate == "OPTIONAL") {
        const response = dealparticipationValidityUser(deal);
        response.then((data) => {
          if (data.request.status === 200) {
            Swal.fire({
              title: "Congratulations!",
              text: `We are reserving ${deal.participatedAmount} for ${deal.apidata.dealName}. `,
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
          } else {
            Swal.fire({
              title: "Error!",
              text: `${data.response.data.errorMessage}`,
              icon: "error",
              showCancelButton: true,
              confirmButtonColor: "#3085d6",
              cancelButtonColor: "#d33",
              confirmButtonText: "OK",
            });
          }
        });
      } else {
        if (deal.apidata.groupName == "NewLender") {
          const response = newlenderdealparticipation(deal);
          var newLenderFeePercentage =
            (parseInt(deal.participatedAmount) * 1) / 100;
          var newLenderGstAndFeeCalculation =
            (newLenderFeePercentage * 118) / 100;
          response.then((data) => {
            if (data.request.status === 200) {
              Swal.fire({
                title: "Congratulations!",
                text: `We are reserving ${deal.participatedAmount} for ${deal.apidata.dealName} .please pay the INR ${newLenderGstAndFeeCalculation}
					    	 for the deal processing fee. `,
                icon: "success",
                showCancelButton: true,
                cancelButtonText: "cancel",
                showConfirmButton: true,
                confirmButtonText: "Pay Fee",
              }).then(async (result) => {
                if (result.isConfirmed) {
                  const res = feeapicallforonedeal(
                    newLenderGstAndFeeCalculation,
                    deal.urldealId
                  );
                  res.then((data) => {
                    if (data.request.status === 200) {
                      Swal.fire({
                        title: "Congratulations!",
                        text: `You have successfully paid the fee`,
                        icon: "success",
                        showCancelButton: true,
                        cancelButtonText: "cancel",
                        showConfirmButton: true,
                        confirmButtonText: "ok",
                      });
                    } else {
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
              });
            } else {
              console.log(data.response);

              if (data.response.data.errorCode == "123") {
                let paymentErrormessage =
                  data.response.data.errorMessage.match(/\d+(\.\d+)?/g);

                Swal.fire({
                  title: "Fee Alert",
                  text: `${data.response.data.errorMessage}`, // Displaying the error message
                  icon: "info",
                  showCancelButton: true,
                  cancelButtonText: "cancel",
                  showConfirmButton: true,
                  confirmButtonText: "Wallet",
                }).then(async (result) => {
                  if (result.isConfirmed) {
                    paypendingprocessingAmount(
                      paymentErrormessage[1],
                      parseInt(paymentErrormessage[0])
                    );
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
            }
          });
        } else if (
          deal.apidata.lenderValidityStatus == true &&
          deal.apidata.groupName != "NewLender"
        ) {
          const membershipExpiredUser = membership(
            deal.urldealId,
            deal,
            deal.participatedAmount
          );
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
              //           if (data.response.status === 403) {
              //   Swal.fire({
              //     title: "Error!",
              //     text: `${data.response.data.errorMessage}`,
              //     icon: "error",
              //     showCancelButton: true,
              //     cancelButtonText: "Cancel",
              //     showConfirmButton: true,
              //     confirmButtonText: "OK",
              //   }).then(async (result) => {
              //     if (result.isConfirmed) {
              //       try {
              //         const res = await feeapicallforonedeal(newLenderGstAndFeeCalculation, deal.urldealId);
              //         if (res.request.status === 200) {
              //           Swal.fire({
              //             title: "Congratulations!",
              //             text: `You have successfully paid the fee`,
              //             icon: "success",
              //             showCancelButton: true,
              //             cancelButtonText: "Cancel",
              //             showConfirmButton: true,
              //             confirmButtonText: "OK",
              //           });
              //         }
              //       } catch (error) {
              //         console.error("Error while making fee API call:", error);
              //         Swal.fire({
              //           title: "Error!",
              //           text: "There was an error processing your request. Please try again later.",
              //           icon: "error",
              //         });
              //       }
              //     }
              //   });
              // }
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
    }
  });
};

export const membership = async (dealId, dealInfo, participatedAmount) => {
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
  const response = newlenderdealparticipation(dealInfo);
  var newLenderFeePercentage =
    (parseInt(dealInfo.participatedAmount) * 1) / 100;
  var newLenderGstAndFeeCalculation =
    (newLenderFeePercentage * 118) / 100;
  response.then((data) => {
    if (data.request.status === 200) {
      Swal.fire({
        title: "Congratulations!",
        text: `We are reserving ${dealInfo.participatedAmount} for ${dealInfo.apidata.dealName} .please pay the INR ${newLenderGstAndFeeCalculation}
         for the deal processing fee. `,
        icon: "success",
        showCancelButton: true,
        cancelButtonText: "cancel",
        showConfirmButton: true,
        confirmButtonText: "Pay Fee",
      }).then(async (result) => {
        if (result.isConfirmed) {
          const res = feeapicallforonedeal(
            newLenderGstAndFeeCalculation,
            dealInfo.urldealId
          );
          res.then((data) => {
            if (data.request.status === 200) {
              Swal.fire({
                title: "Congratulations!",
                text: `You have successfully paid the fee`,
                icon: "success",
                showCancelButton: true,
                cancelButtonText: "cancel",
                showConfirmButton: true,
                confirmButtonText: "ok",
              });
            } else {
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
      });
    } else {
      console.log(data.response);

      if (data.response.data.errorCode == "123") {
        let paymentErrormessage =
          data.response.data.errorMessage.match(/\d+(\.\d+)?/g);

        Swal.fire({
          title: "Fee Alert",
          text: `${data.response.data.errorMessage}`, // Displaying the error message
          icon: "info",
          showCancelButton: true,
          cancelButtonText: "cancel",
          showConfirmButton: true,
          confirmButtonText: "Wallet",
        }).then(async (result) => {
          if (result.isConfirmed) {
            paypendingprocessingAmount(
              paymentErrormessage[1],
              parseInt(paymentErrormessage[0])
            );
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
    }
  });
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
