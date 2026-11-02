file_path = "src/components/pages/Oxyloans/Borrower/redesign/pages/InstantLoanFlow.jsx"

with open(file_path, "r", encoding="utf-8") as f:
    code = f.read()

# 1. Add import for InstantLoanStepLenderOffers
old_import = """import InstantLoanStepOfferSelection from "../components/instantLoan/InstantLoanStepOfferSelection";
import InstantLoanStepAgreementSign from "../components/instantLoan/InstantLoanStepAgreementSign";"""

new_import = """import InstantLoanStepOfferSelection from "../components/instantLoan/InstantLoanStepOfferSelection";
import InstantLoanStepLenderOffers from "../components/instantLoan/InstantLoanStepLenderOffers";
import InstantLoanStepAgreementSign from "../components/instantLoan/InstantLoanStepAgreementSign";"""

assert old_import in code, "Could not find old_import"
code = code.replace(old_import, new_import, 1)

# 2. Update isAllStepsCompleted
old_completed = "const isAllStepsCompleted = currentStep >= 8 || Boolean(isCompleted);"
new_completed = "const isAllStepsCompleted = currentStep >= 9 || Boolean(isCompleted);"
assert old_completed in code, "Could not find old_completed"
code = code.replace(old_completed, new_completed, 1)

# 3. Update step transition handlers
old_handlers = """  // Step 5: Offer Selected -> Normal borrower flow: advance directly to Step 6 for eSign
  const handleOfferSelected = (offer) => {
    setSelectedOffer(offer);
    setIsWaitingForLender(false);
    const targetStep = 6;
    maxReachedStepRef.current = Math.max(maxReachedStepRef.current, targetStep);
    currentStepRef.current = targetStep;
    setCurrentStep(targetStep);
    syncState({ selectedOffer: offer, isWaitingForLender: false, currentStep: targetStep });
  };

  // Step 5: Advance to Step 6 (eSign & eNACH)
  const handleProceedToEsign = (offer = null) => {
    if (offer) setSelectedOffer(offer);
    setIsWaitingForLender(false);
    const targetStep = 6;
    maxReachedStepRef.current = Math.max(maxReachedStepRef.current, targetStep);
    currentStepRef.current = targetStep;
    setCurrentStep(targetStep);
    syncState({
      ...(offer ? { selectedOffer: offer } : {}),
      currentStep: targetStep,
      isWaitingForLender: false,
      lenderSigned: true,
    });
  };

  // Step 5: Modify or reselect offer
  const handleModifyOffer = () => {
    setIsWaitingForLender(false);
    syncState({ isWaitingForLender: false });
  };

  // Step 6 Complete (eSign & eNACH)
  const handleAgreementComplete = () => {
    setCurrentStep(7);
    syncState({ currentStep: 7 });
  };

  // Step 7 Complete (Bank Verified -> Waiting for Disbursal)
  const handleBankVerified = (bData) => {
    setBankData(bData);
    setCurrentStep(8);
    setIsCompleted(true);
    syncState({ bankData: bData, currentStep: 8, isCompleted: true });
  };"""

new_handlers = """  // Step 5: Advance to Step 6 (Lender Offers Received - BorrowerLoansInitiated)
  const handleProceedToOffers = (offer = null) => {
    if (offer) setSelectedOffer(offer);
    setIsWaitingForLender(false);
    const targetStep = 6;
    maxReachedStepRef.current = Math.max(maxReachedStepRef.current, targetStep);
    currentStepRef.current = targetStep;
    setCurrentStep(targetStep);
    syncState({
      ...(offer ? { selectedOffer: offer } : {}),
      isWaitingForLender: false,
      currentStep: targetStep,
    });
  };

  const handleOfferSelected = (offer) => {
    handleProceedToOffers(offer);
  };

  // Step 6: Advance to Step 7 (Individual Agreement eSign)
  const handleProceedToEsign = (offer = null) => {
    if (offer) setSelectedOffer(offer);
    setIsWaitingForLender(false);
    const targetStep = 7;
    maxReachedStepRef.current = Math.max(maxReachedStepRef.current, targetStep);
    currentStepRef.current = targetStep;
    setCurrentStep(targetStep);
    syncState({
      ...(offer ? { selectedOffer: offer } : {}),
      currentStep: targetStep,
      isWaitingForLender: false,
      lenderSigned: true,
    });
  };

  // Advance to Step 8 (eNACH Mandate Setup)
  const handleProceedToEnach = (offer = null) => {
    if (offer) setSelectedOffer(offer);
    const targetStep = 8;
    maxReachedStepRef.current = Math.max(maxReachedStepRef.current, targetStep);
    currentStepRef.current = targetStep;
    setCurrentStep(targetStep);
    syncState({
      ...(offer ? { selectedOffer: offer } : {}),
      currentStep: targetStep,
    });
  };

  // Step 5: Modify or reselect offer
  const handleModifyOffer = () => {
    setIsWaitingForLender(false);
    syncState({ isWaitingForLender: false });
  };"""

assert old_handlers in code, "Could not find old_handlers"
code = code.replace(old_handlers, new_handlers, 1)

# 4. Update the step JSX renderer
old_jsx = """                      ) : currentStep === 5 ? (
                        <InstantLoanStepOfferSelection
                          profileData={profileData}
                          payslipVerification={payslipVerification}
                          bankStatementVerification={bankStatementVerification}
                          creditScore={verificationResult?.score || 802}
                          onOfferSelected={handleOfferSelected}
                          onBack={() => setCurrentStep(4)}
                          isWaitingForLender={isWaitingForLender}
                          lenderSigned={lenderSigned}
                          selectedOffer={selectedOffer}
                          onProceedToEsign={handleProceedToEsign}
                          onModifyOffer={handleModifyOffer}
                        />
                      ) : currentStep === 6 ? (
                        <InstantLoanStepAgreementSign
                          selectedOffer={selectedOffer}
                          profileData={profileData}
                          applicationId={applicationId}
                          onComplete={() => {
                            const nextStep = 7;
                            maxReachedStepRef.current = Math.max(maxReachedStepRef.current, nextStep);
                            currentStepRef.current = nextStep;
                            setCurrentStep(nextStep);
                            syncState({ currentStep: nextStep });
                          }}
                          onBack={() => setCurrentStep(5)}
                        />
                      ) : currentStep === 7 ? (
                        <InstantLoanStepEnachMandate
                          selectedOffer={selectedOffer}
                          profileData={profileData}
                          bankData={bankData}
                          applicationId={applicationId}
                          onComplete={() => {
                            const nextStep = 8;
                            maxReachedStepRef.current = Math.max(maxReachedStepRef.current, nextStep);
                            currentStepRef.current = nextStep;
                            setCurrentStep(nextStep);
                            setIsCompleted(true);
                            syncState({ currentStep: nextStep, isCompleted: true });
                          }}
                          onBack={() => setCurrentStep(6)}
                        />
                      ) : (
                        <InstantLoanStepDisbursalTracker
                          applicationId={applicationId}
                          selectedOffer={selectedOffer}
                          profileData={profileData}
                          bankData={bankData}
                          onReset={handleResetFlow}
                        />
                      )}"""

new_jsx = """                      ) : currentStep === 5 ? (
                        <InstantLoanStepOfferSelection
                          profileData={profileData}
                          payslipVerification={payslipVerification}
                          bankStatementVerification={bankStatementVerification}
                          creditScore={verificationResult?.score || 802}
                          onOfferSelected={handleOfferSelected}
                          onProceedToOffers={handleProceedToOffers}
                          onProceedToEsign={handleProceedToEsign}
                          onBack={() => setCurrentStep(4)}
                          isWaitingForLender={isWaitingForLender}
                          lenderSigned={lenderSigned}
                          selectedOffer={selectedOffer}
                          onModifyOffer={handleModifyOffer}
                        />
                      ) : currentStep === 6 ? (
                        <InstantLoanStepLenderOffers
                          profileData={profileData}
                          selectedOffer={selectedOffer}
                          applicationId={applicationId}
                          onProceedToEsign={handleProceedToEsign}
                          onProceedToEnach={handleProceedToEnach}
                          onBack={() => setCurrentStep(5)}
                        />
                      ) : currentStep === 7 ? (
                        <InstantLoanStepAgreementSign
                          selectedOffer={selectedOffer}
                          profileData={profileData}
                          applicationId={applicationId}
                          onComplete={() => {
                            const nextStep = 8;
                            maxReachedStepRef.current = Math.max(maxReachedStepRef.current, nextStep);
                            currentStepRef.current = nextStep;
                            setCurrentStep(nextStep);
                            syncState({ currentStep: nextStep });
                          }}
                          onBack={() => setCurrentStep(6)}
                        />
                      ) : currentStep === 8 ? (
                        <InstantLoanStepEnachMandate
                          selectedOffer={selectedOffer}
                          profileData={profileData}
                          bankData={bankData}
                          applicationId={applicationId}
                          onComplete={() => {
                            const nextStep = 9;
                            maxReachedStepRef.current = Math.max(maxReachedStepRef.current, nextStep);
                            currentStepRef.current = nextStep;
                            setCurrentStep(nextStep);
                            setIsCompleted(true);
                            syncState({ currentStep: nextStep, isCompleted: true });
                          }}
                          onBack={() => setCurrentStep(7)}
                        />
                      ) : (
                        <InstantLoanStepDisbursalTracker
                          applicationId={applicationId}
                          selectedOffer={selectedOffer}
                          profileData={profileData}
                          bankData={bankData}
                          onReset={handleResetFlow}
                        />
                      )}"""

assert old_jsx in code, "Could not find old_jsx"
code = code.replace(old_jsx, new_jsx, 1)

with open(file_path, "w", encoding="utf-8") as f:
    f.write(code)

print("Successfully updated InstantLoanFlow.jsx")
