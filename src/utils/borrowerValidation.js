/**
 * Utility functions for Borrower Profile and Bank Account Validations
 */

// Check for 4 or more repeating identical characters (e.g., "aaaa", "1111")
export const hasRepeatingPattern = (str) => {
  if (!str) return false;
  return /(.)\1{3,}/.test(str.toString().trim());
};

// Check for all identical digits (e.g., "1111111111", "0000000000")
export const isAllSameDigits = (str) => {
  if (!str) return false;
  return /^(\d)\1+$/.test(str.toString().trim());
};

// Name validation: letters, spaces, dots, hyphens only; no numbers; 2-50 chars; no repeating pattern
export const validateName = (name, fieldName = "Name") => {
  if (!name || !name.toString().trim()) {
    return { valid: false, message: `${fieldName} is required.` };
  }
  const trimmed = name.toString().trim();
  if (trimmed.length < 2 || trimmed.length > 50) {
    return { valid: false, message: `${fieldName} must be between 2 and 50 characters long.` };
  }
  if (!/^[a-zA-Z\s.-]+$/.test(trimmed)) {
    return { valid: false, message: `${fieldName} can only contain letters, spaces, dots, and hyphens (no numbers or special characters allowed).` };
  }
  if (hasRepeatingPattern(trimmed)) {
    return { valid: false, message: `${fieldName} contains invalid repetitive character patterns.` };
  }
  const dummyNames = ["test", "testing", "dummy", "asdf", "qwer", "xxxx", "user", "admin", "null", "undefined"];
  if (dummyNames.includes(trimmed.toLowerCase())) {
    return { valid: false, message: `Please enter a valid real ${fieldName}.` };
  }
  return { valid: true };
};

// DOB & Age validation (min 18 years, max 70 years)
export const validateDob = (dobStr) => {
  if (!dobStr || !dobStr.toString().trim()) {
    return { valid: false, message: "Date of Birth is required." };
  }

  const str = dobStr.toString().trim();
  let birthDate;

  // Format checks: YYYY-MM-DD or DD/MM/YYYY or DD-MM-YYYY
  const isoMatch = str.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})$/);
  const inMatch = str.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})$/);

  if (isoMatch) {
    birthDate = new Date(parseInt(isoMatch[1], 10), parseInt(isoMatch[2], 10) - 1, parseInt(isoMatch[3], 10));
  } else if (inMatch) {
    birthDate = new Date(parseInt(inMatch[3], 10), parseInt(inMatch[2], 10) - 1, parseInt(inMatch[1], 10));
  } else {
    return { valid: false, message: "Date of Birth must be in YYYY-MM-DD or DD/MM/YYYY format." };
  }

  if (isNaN(birthDate.getTime())) {
    return { valid: false, message: "Invalid Date of Birth provided." };
  }

  const today = new Date();
  if (birthDate > today) {
    return { valid: false, message: "Date of Birth cannot be in the future." };
  }

  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }

  if (age < 18) {
    return { valid: false, message: `Borrower must be at least 18 years old. Current calculated age is ${age} years.` };
  }
  if (age > 70) {
    return { valid: false, message: `Age (${age} years) exceeds the maximum allowed limit of 70 years.` };
  }

  return { valid: true, age };
};

// Mobile / WhatsApp number validation (10 digits starting with 6-9, no dummy repeating digits)
export const validateMobileNumber = (phone, fieldName = "Mobile Number") => {
  if (!phone || !phone.toString().trim()) {
    return { valid: false, message: `${fieldName} is required.` };
  }

  const raw = phone.toString().trim();
  const cleaned = raw.replace(/\D/g, "");
  const last10 = cleaned.slice(-10);

  if (last10.length !== 10 || !/^[6-9]\d{9}$/.test(last10)) {
    return { valid: false, message: `${fieldName} must be a valid 10-digit mobile number starting with 6, 7, 8, or 9.` };
  }
  if (isAllSameDigits(last10) || last10 === "1234567890" || last10 === "0987654321" || hasRepeatingPattern(last10)) {
    return { valid: false, message: `Please enter a valid 10-digit ${fieldName} (repetitive/dummy digits not allowed).` };
  }
  return { valid: true, formatted: last10 };
};

// Indian Pincode validation (6 digits starting 1-9, non-repeating dummy)
export const validatePincode = (pincode) => {
  if (!pincode || !pincode.toString().trim()) {
    return { valid: false, message: "Pincode is required." };
  }
  const cleaned = pincode.toString().trim();
  if (!/^[1-9][0-9]{5}$/.test(cleaned)) {
    return { valid: false, message: "Pincode must be a valid 6-digit number (e.g. 500072)." };
  }
  if (isAllSameDigits(cleaned) || cleaned === "123456" || hasRepeatingPattern(cleaned)) {
    return { valid: false, message: "Please enter a genuine 6-digit Pincode (dummy repeating pincodes like 111111 are not allowed)." };
  }
  return { valid: true };
};

// PAN Card validation (10 characters: 5 uppercase letters, 4 digits, 1 uppercase letter)
export const validatePanNumber = (pan) => {
  if (!pan || !pan.toString().trim()) {
    return { valid: false, message: "PAN Card number is required." };
  }
  const uppercasePan = pan.toString().trim().toUpperCase();
  if (!/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(uppercasePan)) {
    return { valid: false, message: "Invalid PAN format. PAN must be 10 characters (e.g. ABCDE1234F)." };
  }
  return { valid: true, formatted: uppercasePan };
};

// Aadhaar Number validation (12 digits, optional)
export const validateAadhaarNumber = (aadhaar) => {
  if (!aadhaar || !aadhaar.toString().trim()) return { valid: true };
  const cleaned = aadhaar.toString().trim().replace(/\D/g, "");
  if (cleaned.length !== 12) {
    return { valid: false, message: "Aadhaar number must be exactly 12 digits." };
  }
  if (isAllSameDigits(cleaned) || hasRepeatingPattern(cleaned)) {
    return { valid: false, message: "Invalid Aadhaar number (cannot be repetitive digits)." };
  }
  return { valid: true };
};

// Work Experience validation (0 to 50 years)
export const validateExperience = (exp, category) => {
  if (category === "STUDENT") return { valid: true };
  if (exp === undefined || exp === null || exp.toString().trim() === "") {
    return { valid: false, message: "Work experience is required." };
  }
  const expStr = exp.toString().trim();
  if (hasRepeatingPattern(expStr) || (isAllSameDigits(expStr) && expStr.length > 2)) {
    return { valid: false, message: "Work experience must be a realistic number of years (0-50)." };
  }
  const num = Number(expStr);
  if (isNaN(num) || num < 0 || num > 50) {
    return { valid: false, message: "Work experience must be a valid number between 0 and 50 years." };
  }
  return { valid: true };
};

// Company Name validation
export const validateCompanyName = (company, category) => {
  if (category === "STUDENT") return { valid: true };
  if (!company || !company.toString().trim()) {
    return { valid: false, message: "Company name is required." };
  }
  const trimmed = company.toString().trim();
  if (trimmed.length < 2 || trimmed.length > 100) {
    return { valid: false, message: "Company name must be between 2 and 100 characters." };
  }
  if (hasRepeatingPattern(trimmed) || isAllSameDigits(trimmed) || /^\d+$/.test(trimmed)) {
    return { valid: false, message: "Please enter a valid company name (pure numbers or repetitive strings not allowed)." };
  }
  return { valid: true };
};

// Monthly Net Salary validation
export const validateSalary = (salary, category) => {
  if (category === "STUDENT") return { valid: true };
  if (salary === undefined || salary === null || salary.toString().trim() === "") {
    return { valid: true }; // optional
  }
  const salStr = salary.toString().trim().replace(/,/g, "");
  const num = Number(salStr);
  if (isNaN(num) || num < 1000 || num > 100000000) {
    return { valid: false, message: "Monthly salary must be a valid positive amount." };
  }
  return { valid: true };
};

// Address validation (min 10 chars, not pure numbers/repeating)
export const validateAddress = (address, fieldName = "Address") => {
  if (!address || !address.toString().trim()) {
    return { valid: false, message: `${fieldName} is required.` };
  }
  const trimmed = address.toString().trim();
  if (trimmed.length < 10) {
    return { valid: false, message: `${fieldName} must be at least 10 characters long with complete street details.` };
  }
  if (hasRepeatingPattern(trimmed) || /^\d+$/.test(trimmed) || isAllSameDigits(trimmed)) {
    return { valid: false, message: `Please enter a valid complete ${fieldName} (cannot be purely numeric or repetitive).` };
  }
  return { valid: true };
};

// Bank Account Number validation
export const validateBankAccountNumber = (accountNo) => {
  if (!accountNo || !accountNo.toString().trim()) {
    return { valid: false, message: "Bank Account Number is required." };
  }
  const cleaned = accountNo.toString().trim();
  if (!/^\d{9,18}$/.test(cleaned)) {
    return { valid: false, message: "Bank Account Number must be between 9 and 18 numeric digits." };
  }
  if (isAllSameDigits(cleaned) || hasRepeatingPattern(cleaned)) {
    return { valid: false, message: "Please enter a genuine Bank Account Number (repetitive dummy digits not allowed)." };
  }
  return { valid: true };
};

// IFSC Code validation
export const validateIfscCode = (ifsc) => {
  if (!ifsc || !ifsc.toString().trim()) {
    return { valid: false, message: "IFSC Code is required." };
  }
  const cleaned = ifsc.toString().trim().toUpperCase();
  if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(cleaned)) {
    return { valid: false, message: "Invalid IFSC Code format (e.g. CNRB0013480 or SBIN0001234)." };
  }
  return { valid: true, formatted: cleaned };
};

// Bank Account Name Match logic
// Compares borrower's full name with bank account holder name
export const isBankNameMatching = (bankHolderName, borrowerName) => {
  if (!bankHolderName || !borrowerName) return false;

  const clean = (str) =>
    str
      .toString()
      .toUpperCase()
      .replace(/[^A-Z0-9\s]/g, "")
      .replace(/\b(MR|MRS|MS|DR|SHRI|SMT|M\/S|AK|SK|K|CH)\b/g, "")
      .trim();

  const bankClean = clean(bankHolderName);
  const borrowerClean = clean(borrowerName);

  if (!bankClean || !borrowerClean) return false;

  // Exact match
  if (bankClean === borrowerClean) return true;

  const bankTokens = bankClean.split(/\s+/).filter((t) => t.length > 1);
  const borrowerTokens = borrowerClean.split(/\s+/).filter((t) => t.length > 1);

  if (bankTokens.length === 0 || borrowerTokens.length === 0) return false;

  // Find matching tokens between bank account name & borrower name
  const matchingTokens = bankTokens.filter((token) => borrowerTokens.includes(token));

  // Check if at least one long token (3+ chars) matches or match ratio >= 50%
  const hasLongTokenMatch = matchingTokens.some((token) => token.length >= 3);
  const matchRatio = matchingTokens.length / Math.max(bankTokens.length, borrowerTokens.length);

  return hasLongTokenMatch || matchRatio >= 0.5;
};

// Master validation function for Personal Details
export const validateBorrowerPersonalDetails = (profileData, category = "SALARIED") => {
  // 1. First Name
  const firstNameCheck = validateName(profileData.firstName, "First Name");
  if (!firstNameCheck.valid) return firstNameCheck;

  // 2. Last Name (if provided)
  if (profileData.lastName && profileData.lastName.trim()) {
    const lastNameCheck = validateName(profileData.lastName, "Last Name");
    if (!lastNameCheck.valid) return lastNameCheck;
  }

  // 3. Father's Name
  const fatherNameCheck = validateName(profileData.fatherName, "Father's Name");
  if (!fatherNameCheck.valid) return fatherNameCheck;

  // 4. Date of Birth & Age
  const dobCheck = validateDob(profileData.dob);
  if (!dobCheck.valid) return dobCheck;

  // 5. PAN Number
  const panCheck = validatePanNumber(profileData.panNumber);
  if (!panCheck.valid) return panCheck;

  // 6. Aadhaar Number (if provided)
  const aadharCheck = validateAadhaarNumber(profileData.aadharNumber);
  if (!aadharCheck.valid) return aadharCheck;

  // 7. WhatsApp Number
  const whatsappCheck = validateMobileNumber(profileData.whatsAppNumber, "WhatsApp Number");
  if (!whatsappCheck.valid) return whatsappCheck;

  // 8. Residence Address
  const addressCheck = validateAddress(profileData.residenceAddress, "Residential Address");
  if (!addressCheck.valid) return addressCheck;

  // 9. City
  const cityCheck = validateName(profileData.city, "City");
  if (!cityCheck.valid) return cityCheck;

  // 10. State
  const stateCheck = validateName(profileData.state, "State");
  if (!stateCheck.valid) return stateCheck;

  // 11. Pincode
  const pincodeCheck = validatePincode(profileData.pinCode);
  if (!pincodeCheck.valid) return pincodeCheck;

  // 12. Employment category fields
  if (category !== "STUDENT") {
    const expCheck = validateExperience(profileData.workExperience, category);
    if (!expCheck.valid) return expCheck;

    const companyCheck = validateCompanyName(profileData.companyName, category);
    if (!companyCheck.valid) return companyCheck;

    const salCheck = validateSalary(profileData.salary, category);
    if (!salCheck.valid) return salCheck;
  }

  return { valid: true };
};
