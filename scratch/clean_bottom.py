with open("src/components/pages/Oxyloans/Borrower/redesign/components/instantLoan/InstantLoanStepOfferSelection.jsx", "r", encoding="utf-8") as f:
    text = f.read()

idx = text.rfind("Confirm Offer & Proceed to eSign / eNACH")
if idx != -1:
    btn_start = text.rfind("<button", 0, idx)
    btn_end = text.find("</div>", idx) + len("</div>")
    text = text[:btn_start].rstrip() + "\n    </div>\n  );\n};\n\nexport default InstantLoanStepOfferSelection;\n"
    with open("src/components/pages/Oxyloans/Borrower/redesign/components/instantLoan/InstantLoanStepOfferSelection.jsx", "w", encoding="utf-8") as f:
        f.write(text)
    print("Cleaned leftover button successfully!")
else:
    print("Confirm Offer string not found")
