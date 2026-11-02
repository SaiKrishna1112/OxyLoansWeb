import re

with open('scratch/update_refined_ui.py', 'r', encoding='utf-8') as f:
    text = f.read()

start_rep = text.find('replacement = """')
end_rep = text.rfind('"""')
rep_code = text[start_rep + len('replacement = """'):end_rep]

# Check for variables used
vars_to_check = [
    'requestedAmount', 'setRequestedAmount', 'selectedTenure', 'setSelectedTenure',
    'selectedOfferType', 'setSelectedOfferType', 'option3M', 'optionPayday',
    'lenderList', 'onlyRbiRegulated', 'setOnlyRbiRegulated',
    'handleSelectLenderOffer', 'handleRaiseLoanRequest', 'isSubmittingLoanRequest',
    'verifiedInflow', 'affordability', 'surplus', 'confirmedLenderRoi',
    'creditScore', 'profileData', 'formatINR', 'onBack', 'setShowExpenseDrawer',
    'hasLenderOffers', 'onProceedToEsign'
]

with open('src/components/pages/Oxyloans/Borrower/redesign/components/instantLoan/InstantLoanStepOfferSelection.jsx', 'r', encoding='utf-8') as f:
    base_code = f.read()

for v in vars_to_check:
    in_rep = v in rep_code
    in_base = v in base_code
    print(f'{v}: in_rep={in_rep}, in_base={in_base}')
