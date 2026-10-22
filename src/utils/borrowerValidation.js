/**
 * Utility functions for Borrower Profile and Bank Account Validations
 */

import { message } from "antd";

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
  if (age > 85) {
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
    return { valid: false, message: "Please enter your salary amount." };
  }
  const salStr = salary.toString().trim().replace(/,/g, "");
  const num = Number(salStr);
  if (isNaN(num) || num < 1000 || num > 100000000) {
    return { valid: false, message: "Monthly salary must be a valid positive amount." };
  }
  return { valid: true };
};

// Designation / Role validation
export const validateDesignation = (designation, category = "SALARIED") => {
  if (category === "STUDENT") return { valid: true };
  if (!designation || !designation.toString().trim()) {
    return { valid: false, message: "Designation / Role is required." };
  }
  const trimmed = designation.toString().trim();
  if (trimmed.length < 2 || trimmed.length > 100) {
    return { valid: false, message: "Designation must be between 2 and 100 characters long." };
  }
  const dummyDesignations = ["test", "testing", "dummy", "asdf", "qwer", "xxxx", "null", "undefined", "na", "n/a", "none"];
  if (dummyDesignations.includes(trimmed.toLowerCase())) {
    return { valid: false, message: "Please enter a valid Designation / Role." };
  }
  const alphaChars = trimmed.replace(/[^a-zA-Z]/g, "");
  if (alphaChars.length < 2 || /^\d+$/.test(trimmed) || isAllSameDigits(trimmed) || hasRepeatingPattern(trimmed)) {
    return { valid: false, message: "Please enter a valid Designation / Role (cannot be purely numeric or repetitive)." };
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
  const dummyAddresses = ["test test test", "dummy address", "testing address", "asdfasdfasdf"];
  if (dummyAddresses.some((d) => trimmed.toLowerCase().includes(d))) {
    return { valid: false, message: `Please enter a genuine complete ${fieldName}.` };
  }
  return { valid: true };
};

// Office Address validation
export const validateOfficeAddress = (address, category = "SALARIED") => {
  if (category === "STUDENT") return { valid: true };
  return validateAddress(address, "Office / Company Address");
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
    return { valid: false, message: "Invalid IFSC Code format (e.g. CNRB0000010 or SBIN0001234)." };
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

  // 4. Mother's Name
  const motherNameCheck = validateName(profileData.motherName, "Mother's Name");
  if (!motherNameCheck.valid) return motherNameCheck;

  // 5. Date of Birth & Age
  const dobCheck = validateDob(profileData.dob);
  if (!dobCheck.valid) return dobCheck;

  // 6. Marital Status
  const maritalStatus = (profileData.maritalStatus && profileData.maritalStatus.toString().trim()) || "Single";

  // 7. Spouse Details (if Married)
  if (maritalStatus === "Married") {
    const spouseNameCheck = validateName(profileData.spouseName, "Spouse Name");
    if (!spouseNameCheck.valid) return spouseNameCheck;

    if (profileData.spouseDob && profileData.spouseDob.toString().trim()) {
      const spouseDobCheck = validateDob(profileData.spouseDob);
      if (!spouseDobCheck.valid) {
        return { valid: false, message: `Spouse ${spouseDobCheck.message}` };
      }
    }
  }

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

    const designationCheck = validateDesignation(profileData.designation, category);
    if (!designationCheck.valid) return designationCheck;

    const officeAddressCheck = validateOfficeAddress(profileData.officeAddress, category);
    if (!officeAddressCheck.valid) return officeAddressCheck;
  }

  return { valid: true };
};

/**
 * Calculates Borrower Profile Completeness Percentage (0 - 100%)
 * Rule: Profile completeness must be at least 90% to raise a loan request.
 *
 * @param {Object} profile - Profile details object from getUserDetails()
 * @param {Array|Object} [references] - Reference contacts array or object
 * @param {Object} [nominee] - Nominee details object
 * @param {Object} [bankAccount] - Bank account details object
 * @returns {Object} { percentage, isEligibleToRaiseLoan, missingRequirements, completionBreakdown }
 */
export const calculateBorrowerProfileCompleteness = (
  profile = {},
  references = null,
  nominee = null,
  bankAccount = null
) => {
  if (!profile || typeof profile !== "object") {
    return {
      percentage: 0,
      isEligibleToRaiseLoan: false,
      missingRequirements: ["Profile Information"],
      completionBreakdown: [],
    };
  }

  const missing = [];
  const completionBreakdown = [];
  let score = 0;

  const addBreakdownItem = (label, points, earned, completed, missingLabel = label) => {
    completionBreakdown.push({
      label,
      points,
      earned,
      completed,
      missing: completed ? "" : missingLabel,
    });
  };

  // 1. Personal & Identity Information (30%)
  const hasName = Boolean(profile.firstName?.trim() && profile.lastName?.trim());
  if (hasName) score += 5;
  else missing.push("Full Name (First & Last Name)");
  addBreakdownItem("Full Name", 5, hasName ? 5 : 0, hasName, "Full Name (First & Last Name)");

  const hasDob = Boolean(profile.dob?.trim());
  const hasGender = Boolean(profile.gender?.trim());
  if (hasDob) score += 3;
  else missing.push("Date of Birth");
  if (hasGender) score += 2;
  else missing.push("Gender");
  addBreakdownItem("Date of Birth", 3, hasDob ? 3 : 0, hasDob);
  addBreakdownItem("Gender", 2, hasGender ? 2 : 0, hasGender);

  const hasParents = Boolean(profile.fatherName?.trim() && profile.motherName?.trim());
  if (hasParents) score += 5;
  else missing.push("Parents' Names (Father & Mother)");
  addBreakdownItem("Parents' Names", 5, hasParents ? 5 : 0, hasParents, "Parents' Names (Father & Mother)");

  const effectiveStatus = (profile.maritalStatus && profile.maritalStatus.trim()) || "Single";
  const isMarried = effectiveStatus === "Married";
  const hasMaritalValid = !isMarried || Boolean(profile.spouseName?.trim());
  if (hasMaritalValid) score += 5;
  else missing.push(isMarried ? "Spouse Name" : "Marital Status");
  addBreakdownItem("Marital / Spouse Details", 5, hasMaritalValid ? 5 : 0, hasMaritalValid, isMarried ? "Spouse Name" : "Marital Status");

  const hasContact = Boolean((profile.whatsAppNumber || profile.mobileNumber) && profile.email);
  if (hasContact) score += 5;
  else missing.push("Contact Details (Mobile & Email)");
  addBreakdownItem("Contact Details", 5, hasContact ? 5 : 0, hasContact, "Contact Details (Mobile & Email)");

  const hasPan = Boolean(profile.panNumber?.trim());
  const isPanVerified = Boolean(
    profile.panVerified === true ||
    profile.panStatus?.toUpperCase() === "VERIFIED" ||
    profile.isPanVerified
  );
  if (hasPan) {
    score += isPanVerified ? 5 : 3;
    if (!isPanVerified) missing.push("PAN Verification");
  } else {
    missing.push("PAN Card Details");
  }
  addBreakdownItem("PAN Card & Verification", 5, hasPan ? (isPanVerified ? 5 : 3) : 0, hasPan && isPanVerified, hasPan ? "PAN Verification" : "PAN Card Details");

  // 2. Residence & Address Details (15%)
  const hasAddress = Boolean((profile.residenceAddress || profile.address)?.trim());
  if (hasAddress) score += 5;
  else missing.push("Residential Address");
  addBreakdownItem("Residential Address", 5, hasAddress ? 5 : 0, hasAddress);

  const hasCityState = Boolean(profile.city?.trim() && profile.state?.trim());
  if (hasCityState) score += 5;
  else missing.push("City & State");
  addBreakdownItem("City & State", 5, hasCityState ? 5 : 0, hasCityState);

  const hasPincode = Boolean(profile.pinCode && String(profile.pinCode).replace(/\D/g, "").length === 6);
  if (hasPincode) score += 5;
  else missing.push("Valid 6-digit Pincode");
  addBreakdownItem("Valid Pincode", 5, hasPincode ? 5 : 0, hasPincode, "Valid 6-digit Pincode");

  // 3. Employment & Professional Details (15%)
  const category = (profile.studentOrNot === true || profile.category === "STUDENT") ? "STUDENT" : (profile.employment || "SALARIED");
  if (category === "STUDENT") {
    const hasCollege = Boolean(profile.universityName || profile.collegeName || profile.companyName);
    if (hasCollege) {
      score += 15;
    } else {
      score += 5;
      missing.push("College / University Details");
    }
    addBreakdownItem("Education Details", 15, hasCollege ? 15 : 5, hasCollege, "College / University Details");
  } else {
    const hasCompany = Boolean(profile.companyName?.trim());
    if (hasCompany) score += 5;
    else missing.push("Company / Employer Name");

    const hasSalary = Boolean(profile.salary && Number(profile.salary) > 0);
    if (hasSalary) score += 5;
    else missing.push("Monthly Income / Salary");

    const hasDesignation = Boolean(profile.designation?.trim());
    const hasOfficeAddress = Boolean(profile.officeAddress?.trim());
    const hasOffice = hasDesignation && hasOfficeAddress;
    if (hasOffice) {
      score += 5;
    } else {
      if (!hasDesignation && !hasOfficeAddress) {
        missing.push("Job Designation & Office Address");
      } else if (!hasDesignation) {
        missing.push("Job Designation / Role");
      } else {
        missing.push("Office / Company Address");
      }
    }
    addBreakdownItem(
      "Employment Details",
      15,
      (hasCompany ? 5 : 0) + (hasSalary ? 5 : 0) + (hasOffice ? 5 : 0),
      hasCompany && hasSalary && hasOffice,
      "Company, salary, designation, and office address"
    );
  }

  // 4. Bank Account Details (15%) - Optional when bank details are removed from profile
  const shouldValidateBank = bankAccount !== null && bankAccount !== false && bankAccount !== undefined;
  const bankAcc = (shouldValidateBank && bankAccount) || {
    accountNumber: profile.accountNumber,
    ifscCode: profile.ifscCode,
    bankName: profile.bankName,
    bankDetailsInfo: profile.bankDetailsInfo,
  };
  const hasBankAcc = Boolean(bankAcc?.accountNumber?.toString().trim());
  const hasIfsc = Boolean(bankAcc?.ifscCode?.toString().trim());
  const isBankLinked = shouldValidateBank && Boolean(profile.bankDetailsInfo === true || (hasBankAcc && hasIfsc));

  if (isBankLinked) {
    score += 15;
    addBreakdownItem("Bank Account Linking", 15, 15, true);
  } else if (shouldValidateBank && (hasBankAcc || hasIfsc)) {
    score += 8;
    missing.push("Complete Bank Account (Account & IFSC)");
    addBreakdownItem("Bank Account Linking", 15, 8, false, "Complete Bank Account (Account & IFSC)");
  } else if (shouldValidateBank) {
    missing.push("Bank Account Linking");
    addBreakdownItem("Bank Account Linking", 15, 0, false, "Bank Account Linking");
  }

  // 5. Emergency Reference Contacts (15%)
  let refCount = 0;
  if (Array.isArray(references)) {
    refCount = references.filter(
      (r) => r.name?.trim() && r.referenceNumber?.toString().replace(/\D/g, "").length === 10
    ).length;
  } else if (references && typeof references === "object") {
    const list = references.referenceDto || references.referenceDetailsResponseDto || [];
    if (Array.isArray(list)) {
      refCount = list.filter(
        (r) =>
          (r.name || r.referenceName)?.trim() &&
          (r.referenceNumber || r.mobileNumber)?.toString().replace(/\D/g, "").length === 10
      ).length;
    } else {
      for (let i = 1; i <= 8; i++) {
        const val = references[`reference${i}`];
        if (val && String(val).match(/[6-9]\d{9}/)) refCount++;
      }
    }
  } else if (profile.referenceDto || profile.referenceDetailsResponseDto) {
    const list = profile.referenceDto || profile.referenceDetailsResponseDto;
    if (Array.isArray(list)) {
      refCount = list.filter(
        (r) =>
          (r.name || r.referenceName)?.trim() &&
          (r.referenceNumber || r.mobileNumber)?.toString().replace(/\D/g, "").length === 10
      ).length;
    } else if (typeof list === "object") {
      for (let i = 1; i <= 8; i++) {
        const val = list[`reference${i}`];
        if (val && String(val).match(/[6-9]\d{9}/)) refCount++;
      }
    }
  }

  if (refCount >= 2) {
    score += 15;
  } else if (refCount === 1) {
    score += 7;
    missing.push("Second Emergency Reference Contact (2 required)");
  } else {
    missing.push("Emergency Reference Contacts (Minimum 2 required)");
  }
  addBreakdownItem("Emergency References (2 required)", 15, refCount >= 2 ? 15 : refCount === 1 ? 7 : 0, refCount >= 2, refCount === 1 ? "Second Emergency Reference Contact (2 required)" : "Emergency Reference Contacts (Minimum 2 required)");

  // 6. Nominee Details (5%)
  const nom = nominee || {
    nomineeName: profile.nomineeName,
    nomineeMobile: profile.nomineeMobile,
  };
  const hasNominee = Boolean(nom?.nomineeName?.trim() && (nom?.nomineeMobile?.trim() || nom?.relation?.trim()));
  if (hasNominee) {
    score += 5;
  } else {
    missing.push("Nominee Details");
  }
  addBreakdownItem("Nominee Details", 5, hasNominee ? 5 : 0, hasNominee);

  // 7. Aadhaar / KYC Document Status (5%)
  const hasAadhaarOrKyc = Boolean(profile.aadharNumber || profile.kycStatus === true);
  if (hasAadhaarOrKyc) {
    score += 5;
  } else {
    missing.push("Aadhaar Number / KYC Document");
  }
  addBreakdownItem("Aadhaar / KYC Document", 5, hasAadhaarOrKyc ? 5 : 0, hasAadhaarOrKyc);

  const totalPossiblePoints = shouldValidateBank ? 100 : 85;
  const finalPercentage = Math.min(100, Math.round((score / totalPossiblePoints) * 100));
  const groupDefinitions = [
    { label: "Personal & Identity", points: 30, labels: ["Full Name", "Date of Birth", "Gender", "Parents' Names", "Marital / Spouse Details", "Contact Details", "PAN Card & Verification"] },
    { label: "Residence & Address", points: 15, labels: ["Residential Address", "City & State", "Valid Pincode"] },
    { label: "Employment / Education", points: 15, labels: ["Employment Details", "Education Details"] },
    ...(shouldValidateBank ? [{ label: "Bank Account", points: 15, labels: ["Bank Account Linking"] }] : []),
    { label: "Emergency References", points: 15, labels: ["Emergency References (2 required)"] },
    { label: "Nominee", points: 5, labels: ["Nominee Details"] },
    { label: "Aadhaar / KYC", points: 5, labels: ["Aadhaar / KYC Document"] },
  ];
  const completionGroups = groupDefinitions.map((group) => ({
    label: group.label,
    points: group.points,
    earned: completionBreakdown
      .filter((item) => group.labels.includes(item.label))
      .reduce((total, item) => total + item.earned, 0),
  }));

  return {
    percentage: finalPercentage,
    isEligibleToRaiseLoan: finalPercentage >= 90,
    missingRequirements: missing,
    completionBreakdown,
    completionGroups,
    pointsRemainingToEligibility: Math.max(0, 90 - finalPercentage),
  };
};

/**
 * Verify uploaded Payslip document against declared Borrower Company Name
 */
export const verifyPayslipCompany = async (file, companyName) => {
  if (!file) {
    return {
      verified: false,
      reason: "No file provided for verification.",
    };
  }

  const cleanCompany = (companyName || "").trim();
  if (!cleanCompany) {
    return {
      verified: false,
      reason: "Please specify your Employer / Company Name in your profile first.",
    };
  }

  const stopWords = new Set([
    "pvt", "ltd", "private", "limited", "inc", "corp", "corporation",
    "llp", "technologies", "technology", "services", "solutions", "india",
    "enterprises", "company", "group", "the", "and"
  ]);

  // Extract core keywords from company name
  const companyWords = cleanCompany
    .toLowerCase()
    .replace(/[^a-z0-9\s]/gi, " ")
    .split(/\s+/)
    .filter((w) => w.length >= 3 && !stopWords.has(w));

  const fileName = (file.name || "").toLowerCase().replace(/[^a-z0-9\s]/gi, " ");

  // 1. Check if company keyword matches file name
  const matchedInFileName = companyWords.filter((w) => fileName.includes(w));
  if (matchedInFileName.length > 0) {
    return {
      verified: true,
      confidence: "HIGH",
      matchedBy: "File Name",
      matchedWords: matchedInFileName,
      companyName: cleanCompany,
      message: `Company "${cleanCompany}" verified from document name (${file.name}).`,
    };
  }

  // 2. Read file text content (ArrayBuffer decoding)
  try {
    const buffer = await file.arrayBuffer();
    const decoder = new TextDecoder("latin1");
    const rawText = decoder.decode(buffer).toLowerCase();

    const matchedInContent = companyWords.filter((w) => rawText.includes(w));
    if (matchedInContent.length > 0) {
      return {
        verified: true,
        confidence: "HIGH",
        matchedBy: "Document Text Content",
        matchedWords: matchedInContent,
        companyName: cleanCompany,
        message: `Company "${cleanCompany}" verified inside payslip document!`,
      };
    }
  } catch (err) {
    console.warn("Payslip text inspection error:", err);
  }

  // 3. Fallback for image / scanned PDF / encrypted document
  return {
    verified: false,
    confidence: "MANUAL_CHECK",
    matchedBy: "Manual Verification Required",
    companyName: cleanCompany,
    message: `Could not automatically detect company "${cleanCompany}" in this file. Please verify that this payslip was issued by ${cleanCompany}.`,
  };
};

/**
 * Known Brand Names and their Registered Legal Entities / Payroll Partners
 */
export const KNOWN_COMPANY_ALIASES = [
  {
    brand: "oxyloans",
    aliases: [
      "srs fintech labs",
      "srs fintech labs pvt ltd",
      "srs fintech",
      "oxyloans",
      "srs fintech labs private limited",
      "oxy loans",
      "oxyloans p2p",
      "oxyloans p2p lending"
    ]
  },
  {
    brand: "swiggy",
    aliases: ["bundl technologies", "bundl technologies pvt ltd", "swiggy"]
  },
  {
    brand: "zomato",
    aliases: ["eternal", "blinkit", "blink commerce", "zomato media", "zomato"]
  },
  {
    brand: "zepto",
    aliases: ["kiranakart", "kiranakart technologies", "zepto"]
  },
  {
    brand: "phonepe",
    aliases: ["fx mart", "phonepe", "phonepe private limited"]
  },
  {
    brand: "paytm",
    aliases: ["one97 communications", "one97", "paytm"]
  },
  {
    brand: "cred",
    aliases: ["dreamplug technologies", "dreamplug", "cred"]
  },
  {
    brand: "ola",
    aliases: ["ani technologies", "ola electric", "ola cabs", "ani technologies pvt ltd"]
  },
  {
    brand: "uber",
    aliases: ["uber india systems", "uber india", "uber"]
  },
  {
    brand: "amazon",
    aliases: ["amazon development centre", "amazon development centre india", "cloudtail", "amazon seller services"]
  },
  {
    brand: "google",
    aliases: ["alphabet", "google india", "google india pvt ltd"]
  },
  {
    brand: "flipkart",
    aliases: ["internet private limited", "flipkart india", "flipkart internet"]
  },
  {
    brand: "meesho",
    aliases: ["fashnear technologies", "fashnear", "meesho"]
  },
  {
    brand: "urban company",
    aliases: ["urbanclap technologies", "urbanclap", "urban company"]
  },
  {
    brand: "groww",
    aliases: ["nextbillion technology", "nextbillion", "groww"]
  },
  {
    brand: "zerodha",
    aliases: ["zerodha broking", "rainmatter", "zerodha"]
  },
  {
    brand: "razorpay",
    aliases: ["razorpay software", "razorpay software private limited", "razorpay"]
  },
  {
    brand: "bharatpe",
    aliases: ["resilient innovations", "resilient innovations pvt ltd", "bharatpe"]
  },
  {
    brand: "cars24",
    aliases: ["cars24 services", "regrob technologies", "cars24"]
  },
  {
    brand: "licious",
    aliases: ["delightful gourmet", "licious"]
  },
  {
    brand: "unacademy",
    aliases: ["sorting hat technologies", "unacademy"]
  },
  {
    brand: "byju",
    aliases: ["think and learn", "think & learn", "byju's", "byjus"]
  },
];

/**
 * Validate Payslip document analysis:
 * 1. Checks whether payslip is within the past 6 months
 * 2. Matches detected company with declared Borrower company (supporting legal entity aliases like SRS Fintech Labs for Oxyloans)
 * 3. Extracts net/monthly salary
 */
export const validatePayslipDocument = async (
  analysisData = {},
  declaredCompany = "",
  file = null
) => {
  const cleanDeclaredCompany = (declaredCompany || "").trim();
  const resData = analysisData?.data?.data || analysisData?.data || analysisData || {};

  // 1. EXTRACT & VALIDATE DATE (Past 6 months rule)
  const monthNamesMap = {
    january: 0, jan: 0,
    february: 1, feb: 1,
    march: 2, mar: 2,
    april: 3, apr: 3,
    may: 4,
    june: 5, jun: 5,
    july: 6, jul: 6,
    august: 7, aug: 7,
    september: 8, sep: 8, sept: 8,
    october: 9, oct: 9,
    november: 10, nov: 10,
    december: 11, dec: 11,
  };
  const monthDisplayNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  let detectedMonth = null;
  let detectedYear = null;
  let detectedDateStr = "";

  const parseMonthYearFromStr = (str) => {
    if (!str || typeof str !== "string") return null;
    const cleanStr = str.trim();
    const lower = cleanStr.toLowerCase();

    // 1. Direct standard / ISO date check
    if (!isNaN(Date.parse(cleanStr))) {
      const d = new Date(cleanStr);
      if (!isNaN(d.getTime()) && d.getFullYear() >= 2020 && d.getFullYear() <= 2035) {
        return { month: d.getMonth(), year: d.getFullYear() };
      }
    }

    // 2. Check "Month YYYY" e.g., "August 2026", "Aug-2026", "OCT 2026", "October/2026"
    const mMatch = lower.match(/(jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:tember)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)[^\w\d]*(202\d|2\d)\b/i);
    if (mMatch) {
      const mIdx = monthNamesMap[mMatch[1].toLowerCase()];
      let yr = parseInt(mMatch[2], 10);
      if (yr < 100) yr += 2000;
      return { month: mIdx, year: yr };
    }

    // 3. Check "YYYY Month" e.g., "2026 August", "2026-Oct"
    const ymMatch = lower.match(/\b(202\d)[^\w\d]*(jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:tember)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)\b/i);
    if (ymMatch) {
      const yr = parseInt(ymMatch[1], 10);
      const mIdx = monthNamesMap[ymMatch[2].toLowerCase()];
      return { month: mIdx, year: yr };
    }

    // 4. Check numeric "YYYY-MM" or "YYYY/MM" (e.g. 2026-10 or 2026/09)
    const numYm = lower.match(/\b(202\d)[-/](0?[1-9]|1[0-2])\b/);
    if (numYm) {
      const yr = parseInt(numYm[1], 10);
      const mIdx = parseInt(numYm[2], 10) - 1;
      return { month: mIdx, year: yr };
    }

    // 5. Check numeric "MM-YYYY" or "MM/YYYY" (single separator, e.g. 10/2026 or 09-2026)
    const numMonthYear = lower.match(/\b(0?[1-9]|1[0-2])[-/](202\d)\b/);
    if (numMonthYear) {
      const mIdx = parseInt(numMonthYear[1], 10) - 1;
      const yr = parseInt(numMonthYear[2], 10);
      return { month: mIdx, year: yr };
    }

    // 6. Check numeric "DD-MM-YYYY" or "DD/MM/YYYY" (two separators, e.g. 31/10/2026)
    const numDayMonthYear = lower.match(/\b(?:0?[1-9]|[12]\d|3[01])[-/](0?[1-9]|1[0-2])[-/](202\d)\b/);
    if (numDayMonthYear) {
      const mIdx = parseInt(numDayMonthYear[1], 10) - 1;
      const yr = parseInt(numDayMonthYear[2], 10);
      return { month: mIdx, year: yr };
    }

    return null;
  };

  // Inspect analysisData fields for date strings
  const candidateDateStrings = [
    resData.payslipMonth,
    resData.salaryMonth,
    resData.payPeriod,
    resData.monthYear,
    resData.forMonth,
    resData.payslipForMonth,
    resData.period,
    resData.date,
    resData.payslipDate,
    resData.payDate,
    resData.salaryDate,
    resData.issueDate,
    resData.statementDate,
  ].filter(Boolean);

  for (const s of candidateDateStrings) {
    const parsed = parseMonthYearFromStr(String(s));
    if (parsed) {
      detectedMonth = parsed.month;
      detectedYear = parsed.year;
      break;
    }
  }

  // Inspect separate month and year fields
  if (detectedMonth === null && (resData.month || resData.payslipMonth)) {
    const rawM = String(resData.month || resData.payslipMonth).trim().toLowerCase();
    if (monthNamesMap[rawM] !== undefined) {
      detectedMonth = monthNamesMap[rawM];
    } else if (!isNaN(Number(rawM)) && Number(rawM) >= 1 && Number(rawM) <= 12) {
      detectedMonth = Number(rawM) - 1;
    }
  }
  if (detectedYear === null && (resData.year || resData.payslipYear || resData.salaryYear)) {
    const rawY = parseInt(resData.year || resData.payslipYear || resData.salaryYear, 10);
    if (!isNaN(rawY)) {
      detectedYear = rawY < 100 ? rawY + 2000 : rawY;
    }
  }

  // Fallback 1: check file name
  if ((detectedMonth === null || detectedYear === null) && file?.name) {
    const fileParsed = parseMonthYearFromStr(file.name);
    if (fileParsed) {
      if (detectedMonth === null) detectedMonth = fileParsed.month;
      if (detectedYear === null) detectedYear = fileParsed.year;
    }
  }

  // Fallback 2: read file buffer text content if available
  let fileBufferRawText = "";
  if (file && typeof file.arrayBuffer === "function") {
    try {
      const buffer = await file.arrayBuffer();
      const decoder = new TextDecoder("latin1");
      fileBufferRawText = decoder.decode(buffer);
      if (detectedMonth === null || detectedYear === null) {
        const textParsed = parseMonthYearFromStr(fileBufferRawText);
        if (textParsed) {
          if (detectedMonth === null) detectedMonth = textParsed.month;
          if (detectedYear === null) detectedYear = textParsed.year;
        }
      }
    } catch (e) {
      // ignore
    }
  }

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();

  let isDateValid = false;
  let dateError = "";
  let monthsDifference = 0;

  if (detectedMonth !== null && detectedYear !== null) {
    detectedDateStr = `${monthDisplayNames[detectedMonth]} ${detectedYear}`;
    monthsDifference = (currentYear - detectedYear) * 12 + (currentMonth - detectedMonth);

    if (monthsDifference > 6) {
      isDateValid = false;
      dateError = `The payslip is dated ${detectedDateStr} (more than 6 months old). Please upload a recent payslip from the past 6 months.`;
    } else if (monthsDifference < -1) {
      isDateValid = false;
      dateError = `The payslip has an invalid future date (${detectedDateStr}). Please upload an issued payslip from the past 6 months.`;
    } else {
      isDateValid = true;
    }
  } else if (resData.isPast6Months === true || resData.pastSixMonths === true || resData.isWithin6Months === false || resData.withinSixMonths === false) {
    isDateValid = false;
    dateError = "The uploaded payslip is older than 6 months. Please upload a recent payslip from the past 6 months.";
  } else if (resData.isWithin6Months === true || resData.withinSixMonths === true) {
    isDateValid = true;
    detectedDateStr = "Within last 6 months";
  } else {
    // If not identifiable from OCR, allow confirmation instead of hard rejection
    isDateValid = false;
    dateError = "Could not identify the payslip date or month from document text.";
  }

  // 2. EXTRACT & VALIDATE COMPANY NAME (With Parent / Legal Entity Alias Support)
  const stopWords = new Set([
    "pvt", "ltd", "private", "limited", "inc", "corp", "corporation",
    "llp", "technologies", "technology", "services", "solutions", "india",
    "enterprises", "company", "group", "the", "and", "labs"
  ]);

  const detectedCompany = (
    resData.companyName ||
    resData.company ||
    resData.employerName ||
    resData.employer ||
    resData.organization ||
    ""
  ).toString().trim();

  let isCompanyMatch = false;
  let companyError = "";
  let matchedAliasInfo = "";

  const normDeclared = cleanDeclaredCompany.toLowerCase().replace(/[^a-z0-9]/g, "");
  const normDetected = detectedCompany.toLowerCase().replace(/[^a-z0-9]/g, "");

  if (!cleanDeclaredCompany) {
    isCompanyMatch = false;
    companyError = "Please specify your Employer / Company Name in your profile first.";
  } else if (resData.companyMatch === true || resData.companyVerified === true) {
    isCompanyMatch = true;
  } else if (detectedCompany) {
    // A. Substring & Direct match
    if (normDeclared.includes(normDetected) || normDetected.includes(normDeclared)) {
      isCompanyMatch = true;
    } else {
      // B. Known Corporate Entity / Brand Aliases (e.g. Oxyloans <-> SRS Fintech Labs Pvt Ltd)
      const matchingAliasGroup = KNOWN_COMPANY_ALIASES.find((group) => {
        const normAliases = group.aliases.map((a) => a.toLowerCase().replace(/[^a-z0-9]/g, ""));
        const declaredMatches = normAliases.some((a) => normDeclared.includes(a) || a.includes(normDeclared));
        const detectedMatches = normAliases.some((a) => normDetected.includes(a) || a.includes(normDetected));
        return declaredMatches && detectedMatches;
      });

      if (matchingAliasGroup) {
        isCompanyMatch = true;
        matchedAliasInfo = `Verified via registered entity link: "${detectedCompany}" is the registered corporate/parent entity for "${cleanDeclaredCompany}".`;
      } else {
        // C. Common keyword match
        const declaredWords = cleanDeclaredCompany
          .toLowerCase()
          .replace(/[^a-z0-9\s]/gi, " ")
          .split(/\s+/)
          .filter((w) => w.length >= 3 && !stopWords.has(w));

        const detectedWords = detectedCompany
          .toLowerCase()
          .replace(/[^a-z0-9\s]/gi, " ")
          .split(/\s+/)
          .filter((w) => w.length >= 3 && !stopWords.has(w));

        const hasCommon = declaredWords.some((w) => detectedCompany.toLowerCase().includes(w)) ||
                          detectedWords.some((w) => cleanDeclaredCompany.toLowerCase().includes(w));
        if (hasCommon) {
          isCompanyMatch = true;
        }
      }
    }
  }

  // D. Full document text inspection fallback
  if (!isCompanyMatch && cleanDeclaredCompany && fileBufferRawText) {
    const normText = fileBufferRawText.toLowerCase().replace(/[^a-z0-9]/g, "");
    if (normText.includes(normDeclared)) {
      isCompanyMatch = true;
      matchedAliasInfo = `Employer "${cleanDeclaredCompany}" confirmed inside document text.`;
    }
  }

  if (!isCompanyMatch && cleanDeclaredCompany && file) {
    try {
      const clientCheck = await verifyPayslipCompany(file, cleanDeclaredCompany);
      if (clientCheck.verified) {
        isCompanyMatch = true;
      }
    } catch {
      // ignore
    }
  }

  if (!isCompanyMatch && cleanDeclaredCompany) {
    companyError = `Employer mismatch: Your profile employer is "${cleanDeclaredCompany}", but the payslip indicates "${detectedCompany || 'Unknown Employer'}".`;
  }

  // 3. EXTRACT & VALIDATE SALARY
  const rawSalary =
    resData.salary != null
      ? resData.salary
      : resData.netSalary != null
      ? resData.netSalary
      : resData.netPay != null
      ? resData.netPay
      : resData.monthlySalary != null
      ? resData.monthlySalary
      : resData.inHandSalary != null
      ? resData.inHandSalary
      : resData.takeHomeSalary != null
      ? resData.takeHomeSalary
      : resData.grossSalary != null
      ? resData.grossSalary
      : null;

  let detectedSalary = null;
  let salaryError = "";

  if (rawSalary != null) {
    const cleanNum = Number(String(rawSalary).replace(/[^0-9.]/g, ""));
    if (!isNaN(cleanNum) && cleanNum > 0) {
      detectedSalary = Math.round(cleanNum);
    }
  }

  if (!detectedSalary || detectedSalary <= 0) {
    salaryError = "Could not detect a valid salary amount from this payslip. Please ensure your net/monthly pay is clearly visible.";
  }

  const isValid = isDateValid && isCompanyMatch && detectedSalary > 0;
  const errors = [];
  if (!isDateValid && dateError) errors.push(dateError);
  if (!isCompanyMatch && companyError) errors.push(companyError);
  if (!detectedSalary && salaryError) errors.push(salaryError);

  const needsParentConfirmation = !isCompanyMatch && Boolean(detectedCompany && cleanDeclaredCompany);
  const needsDateConfirmation = !isDateValid && detectedMonth === null;

  return {
    isValid,
    isDateValid,
    isCompanyMatch,
    detectedSalary,
    detectedDate: detectedDateStr,
    detectedCompany: detectedCompany || cleanDeclaredCompany,
    declaredCompany: cleanDeclaredCompany,
    monthsAgo: monthsDifference,
    matchedAliasInfo,
    needsParentConfirmation,
    suggestedParentCompany: detectedCompany,
    needsDateConfirmation,
    errors,
    errorMessage: errors.join("<br/><br/>"),
    rawAnalysis: resData,
  };
};

/**
 * Verify Borrower Salary against Bank Statement Analysis
 */
export const verifySalaryFromBankStatement = (declaredSalary, bankAnalysis) => {
  const declared = Number(declaredSalary || 0);

  if (!bankAnalysis) {
    return {
      status: "PENDING",
      badgeClass: "bg-info-subtle text-info",
      message: "Bank statement analysis is pending to extract verified salary credits.",
      isMatch: false,
    };
  }

  // Detect salary or monthly credits from bank analysis response
  const detected = Number(
    bankAnalysis.salary ||
    bankAnalysis.detectedSalary ||
    bankAnalysis.averageMonthlySalary ||
    bankAnalysis.monthlyIncome ||
    bankAnalysis.salaryAmount ||
    0
  );

  const avgMonthlyBalance = Number(
    bankAnalysis.averageMonthlyBalance ||
    bankAnalysis.avgMonthlyBalance ||
    0
  );

  const turnover = Number(bankAnalysis.totalTurnover || bankAnalysis.turnover || 0);
  const estimatedMonthlyInflow = turnover > 0 ? Math.round(turnover / 6) : avgMonthlyBalance;

  const benchmarkSalary = detected > 0 ? detected : estimatedMonthlyInflow;

  if (declared <= 0) {
    return {
      status: "NO_DECLARED_SALARY",
      badgeClass: "bg-warning-subtle text-warning",
      detectedSalary: benchmarkSalary,
      message: `Bank statement reflects monthly turnover/inflow of ₹${benchmarkSalary.toLocaleString("en-IN")}. Please declare your monthly salary in your profile.`,
      isMatch: false,
    };
  }

  if (benchmarkSalary <= 0) {
    return {
      status: "ANALYZED_NO_SALARY",
      badgeClass: "bg-secondary-subtle text-secondary",
      declaredSalary: declared,
      detectedSalary: 0,
      message: `Bank statement analyzed (Turnover: ₹${turnover.toLocaleString("en-IN")}). Specific monthly salary credits not separated.`,
      isMatch: false,
    };
  }

  // Calculate variance percentage
  const variancePct = Math.abs(declared - benchmarkSalary) / declared * 100;

  // Allow up to 25% difference between declared Gross CTC vs in-hand Net take-home salary
  if (variancePct <= 25 || (benchmarkSalary >= declared * 0.70 && benchmarkSalary <= declared * 1.30)) {
    return {
      status: "VERIFIED",
      badgeClass: "bg-success-subtle text-success",
      declaredSalary: declared,
      detectedSalary: benchmarkSalary,
      variancePct: variancePct.toFixed(1),
      message: `Salary Verified! Bank statement shows regular monthly inflow of ₹${benchmarkSalary.toLocaleString("en-IN")}, matching declared salary of ₹${declared.toLocaleString("en-IN")}.`,
      isMatch: true,
    };
  } else {
    return {
      status: "VARIANCE",
      badgeClass: "bg-warning-subtle text-warning",
      declaredSalary: declared,
      detectedSalary: benchmarkSalary,
      variancePct: variancePct.toFixed(1),
      message: `Salary Variance: Declared salary is ₹${declared.toLocaleString("en-IN")}, but bank statement detected approx ₹${benchmarkSalary.toLocaleString("en-IN")}/month.`,
      isMatch: false,
    };
  }
};

