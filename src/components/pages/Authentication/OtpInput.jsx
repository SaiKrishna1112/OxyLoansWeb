import React, { useEffect, useRef, useState } from "react";

function OtpInput({ data, setwhatsappotphandler }) {
  const [otpValues, setOtpValues] = useState(["", "", "", "", "", ""]);
  const inputRefs = useRef([]);

  const handleChange = (index, value) => {
    if (/^\d*$/.test(value) && value.length <= 1) {
      const updatedOtpValues = [...otpValues];
      updatedOtpValues[index] = value;
      setOtpValues(updatedOtpValues);
      setwhatsappotphandler(updatedOtpValues);
      if (value !== "" && index < 5 && inputRefs.current[index + 1]) {
        inputRefs.current[index + 1].focus();
      }
    }
  };

  useEffect(() => {
    if (data === 4) {
      console.log(data);
      setOtpValues(["", "", "", ""]);
    } else if (data === 6) {
      console.log(data);
      setOtpValues(["", "", "", "", "", ""]);
    }
  }, [data]); // Add data as a dependency to useEffect

  useEffect(() => {
    localStorage.setItem("otp", JSON.stringify(otpValues)); // Store otpValues as a string
  }, [otpValues]);

  return (
    <div className="otp-field">
      {otpValues.map((value, index) => (
        <input
          key={index}
          type="text"
          maxLength="1"
          value={value}
          onChange={(e) => handleChange(index, e.target.value)}
          ref={(input) => (inputRefs.current[index] = input)}
        />
      ))}
    </div>
  );
}

export default OtpInput;
