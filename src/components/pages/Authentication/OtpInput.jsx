import React, { useEffect, useRef, useState, forwardRef } from "react";

const OtpInput = forwardRef(function OtpInput(
  { data = 6, setwhatsappotphandler, length = 6, onOtpSubmit },
  ref
) {
  const [otpValues, setOtpValues] = useState(["", "", "", "", "", ""]);
  const inputRefs = useRef([]);

  const handleChange = (index, value) => {
    if (/^\d*$/.test(value) && value.length <= 1) {
      const updatedOtpValues = [...otpValues];
      updatedOtpValues[index] = value;
      setOtpValues(updatedOtpValues);
      const handler = setwhatsappotphandler || onOtpSubmit;
      if (typeof handler === "function") {
        handler(updatedOtpValues);
      }
      if (value !== "" && index < 5 && inputRefs.current[index + 1]) {
        inputRefs.current[index + 1].focus();
      }
    }
  };

  useEffect(() => {
    const count = data || length || 6;
    if (count === 4) {
      setOtpValues(["", "", "", ""]);
    } else if (count === 6) {
      setOtpValues(["", "", "", "", "", ""]);
    }
  }, [data, length]);

  useEffect(() => {
    localStorage.setItem("otp", JSON.stringify(otpValues));
  }, [otpValues]);

  return (
    <div className="otp-field" ref={ref}>
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
});

export default OtpInput;
