import React, { useState, useEffect } from "react";
import axios from "axios";
// import { load } from "@cashfreepayments/cashfree-js";
import {
  fetchcashfree,
  getpaymentorder,
} from "../../../HttpRequest/afterlogin";
import {
  registersuccess,
  WarningAlertwithdrow,
} from "../../Base UI Elements/SweetAlert";
// import "../Lender/payment";
// import { confirmbtn } from "./payment";

const PaymentGateway = () => {
  const [payment, setpaymentsession] = useState("");

  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);
  const myorder = urlParams.get("myorder");

  const cashfree = Cashfree({
    mode: "sandbox", //or production
  });

  useEffect(async () => {
    if (myorder != null) {
      const getresponse = await getpaymentorder(myorder);
      console.log(getresponse);
      if (getresponse.request.status == 200) {
        registersuccess(
          `You have successfully paid  INR ${getresponse.data.order_amount} Amount`
        );
      } else {
        WarningAlertwithdrow("something went wrong , payment failed");
      }
    }

    return () => {};
  }, [myorder]);

  useEffect(() => {
    if (payment != null || payment != "") {
      let checkoutOptions = {
        paymentSessionId: payment,
        redirectTarget: "_self", //optional (_self or _blank)
      };

      cashfree.checkout(checkoutOptions);
    }
    return () => {};
  }, [payment]);

  const paymentordercreation = async () => {
    const resposnse = await fetchcashfree();
    setpaymentsession(resposnse.data.payment_session_id);
    console.log(resposnse);
  };

  return (
    <div className="paymentgateway d-flex h-100 justify-content-center align-content-center w-100">
      <button
        className="btn btn-primary"
        id="btn-payment-gateway"
        onClick={paymentordercreation}
      >
        Gateway
      </button>
    </div>
  );
};

export default PaymentGateway;
