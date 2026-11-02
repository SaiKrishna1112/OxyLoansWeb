import re

target_file = 'src/components/pages/Oxyloans/Borrower/redesign/components/instantLoan/InstantLoanStepOfferSelection.jsx'

with open(target_file, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Add viewMode state
if 'const [viewMode, setViewMode]' not in content:
    old_state_snippet = '  const [isSubmittingLoanRequest, setIsSubmittingLoanRequest] = useState(false);'
    new_state_snippet = '''  const [isSubmittingLoanRequest, setIsSubmittingLoanRequest] = useState(false);
  const [viewMode, setViewMode] = useState(() => {
    try {
      const saved = localStorage.getItem("oxy_active_loan_request");
      if (saved) return "OFFERS_RECEIVED";
    } catch {}
    return "PLAN_SELECTION";
  });'''
    assert old_state_snippet in content, 'Could not find isSubmittingLoanRequest'
    content = content.replace(old_state_snippet, new_state_snippet, 1)
    print('1. viewMode state added')

# 2. Update getBorrowerRequestAmount to setViewMode("OFFERS_RECEIVED") when active request found
old_req_snippet = '''          if (active) {
            setActiveLoanRequest(active);
            try {
              localStorage.setItem("oxy_active_loan_request", JSON.stringify(active));
            } catch {}
            const reqAmt = Number(active.requestAmount || active.loanRequestAmount || 0);
            if (reqAmt > 0) {
              setRequestedAmount(reqAmt);
            }
          }'''
new_req_snippet = '''          if (active) {
            setActiveLoanRequest(active);
            setViewMode("OFFERS_RECEIVED");
            try {
              localStorage.setItem("oxy_active_loan_request", JSON.stringify(active));
            } catch {}
            const reqAmt = Number(active.requestAmount || active.loanRequestAmount || 0);
            if (reqAmt > 0) {
              setRequestedAmount(reqAmt);
            }
          }'''
if old_req_snippet in content:
    content = content.replace(old_req_snippet, new_req_snippet, 1)
    print('2. getBorrowerRequestAmount updated')

# 3. Add polling effect for real-time offer updates
if 'Live polling: Check for newly initiated lender offers' not in content:
    insert_after = '''  }, []);

  // Prevent background page scrolling while any modal is open'''
    polling_code = '''  }, []);

  // Live polling: Check for newly initiated lender offers every 25 seconds
  useEffect(() => {
    if (!activeLoanRequest && viewMode !== "OFFERS_RECEIVED") return;
    const interval = setInterval(() => {
      fetchLoansInitiated();
    }, 25000);
    return () => clearInterval(interval);
  }, [activeLoanRequest, viewMode]);

  // Prevent background page scrolling while any modal is open'''
    assert insert_after in content, 'Could not find insert_after for polling'
    content = content.replace(insert_after, polling_code, 1)
    print('3. polling effect added')

# 4. Add getApiErrorMessage & handleBorrowerAction & update handleLoanExecute
old_execute_snippet = '''  // Routine to execute accept or reject via live API borrowerLoanAcceptOrReject'''
new_execute_snippet = '''  const getApiErrorMessage = (response, fallbackMessage) => {
    return (
      response?.response?.data?.errorMessage ||
      response?.response?.data?.message ||
      response?.data?.errorMessage ||
      response?.data?.message ||
      fallbackMessage
    );
  };

  const handleBorrowerAction = async (record, borrowerStatus) => {
    const isAcceptAction = borrowerStatus === "LOANACCEPTED";
    const confirmationResult = await Swal.fire({
      title: "Confirm Loan Offer",
      text: isAcceptAction
        ? "Are you sure you want to accept this loan offer?"
        : "Are you sure you want to reject this loan offer? ",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: isAcceptAction ? "#28a745" : "#dc3545",
      cancelButtonColor: "#6c757d",
      confirmButtonText: isAcceptAction ? "Accept Offer" : "Reject Offer",
      cancelButtonText: "Cancel",
    });

    if (!confirmationResult.isConfirmed) {
      return;
    }

    const payload = {
      id: record.id,
      loanRequestId: record.loanRequestId,
      borrowerId: record.borrowerId || profileData.userId || getUserId() || "41682",
      borrowerStatus,
    };

    setUpdatingRowId(record.id);
    try {
      const response = await borrowerLoanAcceptOrReject(payload);
      if (response?.status == 200) {
        HandleWithFooter(
          borrowerStatus === "LOANACCEPTED"
            ? "Your selected loan offer has been accepted successfully "
            : "Your selected loan offer has been rejected successfully "
        );
        await fetchLoansInitiated();
      } else {
        WarningBackendApi(
          "Action Failed",
          getApiErrorMessage(
            response,
            "Unable to update status right now. Please try again."
          )
        );
      }
    } catch (error) {
      WarningBackendApi(
        "Action Failed",
        getApiErrorMessage(
          error,
          "Unable to update status right now. Please try again."
        )
      );
    } finally {
      setUpdatingRowId(null);
    }
  };

  // Routine to execute accept or reject via live API borrowerLoanAcceptOrReject'''
if 'const handleBorrowerAction' not in content:
    assert old_execute_snippet in content, 'Could not find old_execute_snippet'
    content = content.replace(old_execute_snippet, new_execute_snippet, 1)
    print('4. handleBorrowerAction & getApiErrorMessage added')

# 5. In handleRaiseLoanRequest, switch to OFFERS_RECEIVED
old_raise_snippet = '''        await fetchLoansInitiated(newReq);
      } else {'''
new_raise_snippet = '''        await fetchLoansInitiated(newReq);
        setViewMode("OFFERS_RECEIVED");
      } else {'''
if old_raise_snippet in content:
    content = content.replace(old_raise_snippet, new_raise_snippet, 1)
    print('5. handleRaiseLoanRequest setViewMode updated')

with open(target_file, 'w', encoding='utf-8') as f:
    f.write(content)

print('Part 1 modifications written successfully')
