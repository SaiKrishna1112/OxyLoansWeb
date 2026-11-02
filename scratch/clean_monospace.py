# -*- coding: utf-8 -*-
file_path = 'src/components/pages/Oxyloans/Borrower/redesign/components/instantLoan/InstantLoanStepOfferSelection.jsx'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Replace font-monospace in modal tiles and display spans
content = content.replace('font-monospace text-dark', 'fw-bold text-dark')
content = content.replace('font-monospace text-danger', 'fw-bold text-danger')
content = content.replace('font-monospace text-success', 'fw-bold text-success')
content = content.replace('font-monospace text-primary', 'fw-bold text-primary')
content = content.replace('text-dark font-monospace', 'text-dark fw-bold')
content = content.replace('text-danger font-monospace', 'text-danger fw-bold')
content = content.replace('text-success font-monospace', 'text-success fw-bold')
content = content.replace('text-primary font-monospace', 'text-primary fw-bold')
content = content.replace('font-monospace fw-semibold', 'fw-bold')
content = content.replace('fw-bold font-monospace', 'fw-bold')
content = content.replace('fw-extrabold text-dark mb-0.5 font-monospace', 'fw-extrabold text-dark mb-0.5')
content = content.replace('fw-extrabold mb-0.5 font-monospace text-danger', 'fw-extrabold mb-0.5 text-danger')
content = content.replace('fw-extrabold mb-0.5 font-monospace', 'fw-extrabold mb-0.5')

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print('Cleaned up font-monospace successfully!')
