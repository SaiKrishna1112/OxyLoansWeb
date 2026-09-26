import React from "react";
import "../redesign.css";

const StatusBadge = ({ status }) => {
  const norm = String(status || "").trim().toUpperCase();

  // Status mapping
  // Backend Status -> UI
  // Borrower Accepted -> Offer Accepted
  // Lender Accepted -> Loan Approved
  // Loan Execution -> Preparing Documents
  // Agreement Generated -> Agreement Ready
  // eSign Pending -> Sign Agreement
  // eNACH Pending -> Setup Auto-Pay
  // Disbursement -> Funds on the Way
  // Loan Active -> Active Loan
  // Loan Closed -> Completed
  let uiText = status || "Unknown";
  let badgeClass = "oxy-badge-primary";
  let iconClass = "fa-solid fa-circle-question";

  if (norm === "BORROWERACCEPTED" || norm === "OFFERACCEPTED" || norm === "BORROWER_ACCEPTED" || norm === "LOANACCEPTED" || norm === "ACCEPTED") {
    uiText = "Offer Accepted";
    badgeClass = "oxy-badge-primary";
    iconClass = "fa-solid fa-check";
  } else if (norm === "LENDERACCEPTED" || norm === "LOANAPPROVED" || norm === "LENDER_ACCEPTED" || norm === "APPROVED" || norm === "PRE-APPROVED") {
    uiText = "Loan Approved";
    badgeClass = "oxy-badge-success";
    iconClass = "fa-solid fa-circle-check";
  } else if (norm === "LOANEXECUTION" || norm === "PREPARINGDOCUMENTS" || norm === "LOAN_EXECUTION" || norm === "PROCESSING" || norm === "IN_PROGRESS") {
    uiText = "Preparing Documents";
    badgeClass = "oxy-badge-warning";
    iconClass = "fa-solid fa-file-signature";
  } else if (norm === "AGREEMENTGENERATED" || norm === "AGREEMENTREADY" || norm === "AGREEMENT_GENERATED") {
    uiText = "Agreement Ready";
    badgeClass = "oxy-badge-success";
    iconClass = "fa-solid fa-file-contract";
  } else if (norm === "ESIGNPENDING" || norm === "SIGNAGREEMENT" || norm === "ESIGN_PENDING" || norm === "ESIGN") {
    uiText = "Sign Agreement";
    badgeClass = "oxy-badge-warning";
    iconClass = "fa-solid fa-signature";
  } else if (norm === "ENACHPENDING" || norm === "SETUPAUTO-PAY" || norm === "ENACH_PENDING" || norm === "ENACH") {
    uiText = "Setup Auto-Pay";
    badgeClass = "oxy-badge-warning";
    iconClass = "fa-solid fa-credit-card";
  } else if (norm === "DISBURSEMENT" || norm === "FUNDSONTHEWAY" || norm === "DISBURSED") {
    uiText = "Funds on the Way";
    badgeClass = "oxy-badge-success";
    iconClass = "fa-solid fa-truck-ramp-box";
  } else if (norm === "LOANACTIVE" || norm === "ACTIVELOAN" || norm === "ACTIVE" || norm === "RUNNING") {
    uiText = "Active Loan";
    badgeClass = "oxy-badge-success";
    iconClass = "fa-solid fa-wallet";
  } else if (norm === "LOANCLOSED" || norm === "COMPLETED" || norm === "CLOSED") {
    uiText = "Completed";
    badgeClass = "oxy-badge-primary";
    iconClass = "fa-solid fa-circle-check";
  } else if (norm === "INITIATED") {
    uiText = "INITIATED";
    badgeClass = "oxy-badge-primary";
    iconClass = "fa-solid fa-clock";
  } else if (norm === "BANK_APPROVAL_PENDING" || norm === "BANKAPPROVALPENDING") {
    uiText = "BANK_APPROVAL_PENDING";
    badgeClass = "oxy-badge-warning";
    iconClass = "fa-solid fa-building-columns";
  } else if (norm === "SUCCESS") {
    uiText = "SUCCESS";
    badgeClass = "oxy-badge-success";
    iconClass = "fa-solid fa-circle-check";
  } else if (norm === "FAILED") {
    uiText = "FAILED";
    badgeClass = "oxy-badge-danger";
    iconClass = "fa-solid fa-circle-xmark";
  } else if (norm === "ADMINREJECTED" || norm === "ADMIN_REJECTED") {
    uiText = "ADMINREJECTED";
    badgeClass = "oxy-badge-danger";
    iconClass = "fa-solid fa-user-xmark";
  } else if (norm === "NOT_FOUND" || norm === "NOTFOUND") {
    uiText = "NOT_FOUND";
    badgeClass = "oxy-badge-secondary";
    iconClass = "fa-solid fa-circle-question";
  } else if (norm === "REJECTED" || norm === "BORROWER_REJECTED" || norm === "LENDER_REJECTED" || norm === "LENDERREJECTED" || norm === "DECLINED") {
    uiText = "Rejected";
    badgeClass = "oxy-badge-danger";
    iconClass = "fa-solid fa-circle-xmark";
  }

  return (
    <span className={`oxy-badge-status ${badgeClass}`}>
      <i className={iconClass}></i>
      {uiText}
    </span>
  );
};

export default StatusBadge;
