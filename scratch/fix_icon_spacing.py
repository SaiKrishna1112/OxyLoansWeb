# -*- coding: utf-8 -*-
import re

# 1. Update InstantLoanStepOfferSelection.jsx
offer_path = 'src/components/pages/Oxyloans/Borrower/redesign/components/instantLoan/InstantLoanStepOfferSelection.jsx'
with open(offer_path, 'r', encoding='utf-8') as f:
    code = f.read()

# Fix Section headers gap-2.5 to gap-3
code = code.replace(
    'className="d-flex align-items-center gap-2.5">\n              <div\n                className="d-flex align-items-center justify-content-center rounded-circle text-white fw-bold shadow-xs"\n                style={{ width: "30px", height: "30px", minWidth: "30px", backgroundColor: "#0040e0", fontSize: "14px" }}\n              >\n                1',
    'className="d-flex align-items-center gap-3">\n              <div\n                className="d-flex align-items-center justify-content-center rounded-circle text-white fw-bold shadow-xs"\n                style={{ width: "32px", height: "32px", minWidth: "32px", backgroundColor: "#0040e0", fontSize: "14px" }}\n              >\n                1'
)

code = code.replace(
    'className="d-flex align-items-center gap-2.5 mb-3">\n            <div\n              className="d-flex align-items-center justify-content-center rounded-circle text-white fw-bold shadow-xs"\n              style={{ width: "30px", height: "30px", minWidth: "30px", backgroundColor: "#0040e0", fontSize: "14px" }}\n            >\n              2',
    'className="d-flex align-items-center gap-3 mb-3">\n            <div\n              className="d-flex align-items-center justify-content-center rounded-circle text-white fw-bold shadow-xs"\n              style={{ width: "32px", height: "32px", minWidth: "32px", backgroundColor: "#0040e0", fontSize: "14px" }}\n            >\n              2'
)

code = code.replace(
    'className="d-flex align-items-center gap-2.5">\n              <div\n                className="d-flex align-items-center justify-content-center rounded-circle text-white fw-bold shadow-xs"\n                style={{ width: "30px", height: "30px", minWidth: "30px", backgroundColor: "#0040e0", fontSize: "14px" }}\n              >\n                3',
    'className="d-flex align-items-center gap-3">\n              <div\n                className="d-flex align-items-center justify-content-center rounded-circle text-white fw-bold shadow-xs"\n                style={{ width: "32px", height: "32px", minWidth: "32px", backgroundColor: "#0040e0", fontSize: "14px" }}\n              >\n                3'
)

# Fix Top cards headers gap-2.5 to gap-3
code = code.replace('className="d-flex align-items-center gap-2.5 mb-2.5"', 'className="d-flex align-items-center gap-3 mb-2.5"')
code = code.replace('className="d-flex align-items-center gap-2.5 mb-1.5"', 'className="d-flex align-items-center gap-3 mb-1.5"')
code = code.replace('className="d-flex align-items-center gap-2.5"\n                  style={{ width: "100%" }}', 'className="d-flex align-items-center gap-3"\n                  style={{ width: "100%" }}')

# Fix checkmark bullet gaps from gap-1.5 to gap-2
code = code.replace('className="text-secondary d-flex align-items-center gap-1.5"', 'className="text-secondary d-flex align-items-center gap-2"')

# Fix Available Tenures calendar icon me-1.5 to me-2
code = code.replace('fa-regular fa-calendar-check text-primary me-1.5', 'fa-regular fa-calendar-check text-primary me-2')

# Fix Card 3 icons me-1 to me-2
code = code.replace('fa-solid fa-user me-1 text-muted', 'fa-solid fa-user me-2 text-muted')
code = code.replace('fa-solid fa-landmark me-1 text-muted', 'fa-solid fa-landmark me-2 text-muted')
code = code.replace('fa-solid fa-shield-halved me-1 text-muted', 'fa-solid fa-shield-halved me-2 text-muted')
code = code.replace('fa-solid fa-clock me-1 text-muted', 'fa-solid fa-clock me-2 text-muted')

# Fix Section 2 card icons
code = code.replace('fa-solid fa-triangle-exclamation text-warning', 'fa-solid fa-triangle-exclamation text-warning me-1.5')
code = code.replace('fa-solid fa-calendar-check', 'fa-solid fa-calendar-check me-1.5')

# Fix Breakdown row icons
code = code.replace('fa-solid fa-money-bill-wave text-muted', 'fa-solid fa-money-bill-wave text-muted me-2')
code = code.replace('fa-solid fa-coins text-muted', 'fa-solid fa-coins text-muted me-2')
code = code.replace('fa-solid fa-receipt text-muted', 'fa-solid fa-receipt text-muted me-2')
code = code.replace('fa-solid fa-circle-check me-1', 'fa-solid fa-circle-check me-2')

# Fix Feature tags icons
code = code.replace('fa-solid fa-shield-check text-info', 'fa-solid fa-shield-check text-info me-1.5')
code = code.replace('fa-solid fa-star text-primary', 'fa-solid fa-star text-primary me-1.5')
code = code.replace('fa-solid fa-bolt text-warning', 'fa-solid fa-bolt text-warning me-1.5')
code = code.replace('fa-solid fa-ban text-danger', 'fa-solid fa-ban text-danger me-1.5')
code = code.replace('fa-solid fa-money-bill-1-wave text-success', 'fa-solid fa-money-bill-1-wave text-success me-1.5')
code = code.replace('fa-solid fa-clock-rotate-left text-primary', 'fa-solid fa-clock-rotate-left text-primary me-1.5')

# Fix Advisory buttons
code = code.replace('fa-solid fa-star me-1', 'fa-solid fa-star me-1.5')
code = code.replace('fa-solid fa-clock-rotate-left me-1', 'fa-solid fa-clock-rotate-left me-1.5')
code = code.replace('fa-solid fa-gear me-1', 'fa-solid fa-gear me-1.5')

# Fix Bottom Bar Selected Plan icon & text
code = code.replace(
    'className="d-flex align-items-center gap-2.5">\n              <div\n                className="d-flex align-items-center justify-content-center rounded-3 bg-primary bg-opacity-10 text-primary shadow-2xs"',
    'className="d-flex align-items-center gap-3">\n              <div\n                className="d-flex align-items-center justify-content-center rounded-3 bg-primary bg-opacity-10 text-primary shadow-2xs"'
)

# Fix Trust badges on bottom right
code = code.replace(
    '<div className="d-flex align-items-center gap-1.5">\n                <div\n                  className="d-flex align-items-center justify-content-center rounded-circle"\n                  style={{ width: "26px", height: "26px", backgroundColor: "#eff6ff", color: "#0040e0" }}\n                >\n                  <i className="fa-solid fa-shield-halved"',
    '<div className="d-flex align-items-center gap-2">\n                <div\n                  className="d-flex align-items-center justify-content-center rounded-circle"\n                  style={{ width: "28px", height: "28px", backgroundColor: "#eff6ff", color: "#0040e0" }}\n                >\n                  <i className="fa-solid fa-shield-halved"'
)

code = code.replace(
    '<div className="d-flex align-items-center gap-1.5">\n                <div\n                  className="d-flex align-items-center justify-content-center rounded-circle"\n                  style={{ width: "26px", height: "26px", backgroundColor: "#eff6ff", color: "#0040e0" }}\n                >\n                  <i className="fa-solid fa-percent"',
    '<div className="d-flex align-items-center gap-2">\n                <div\n                  className="d-flex align-items-center justify-content-center rounded-circle"\n                  style={{ width: "28px", height: "28px", backgroundColor: "#eff6ff", color: "#0040e0" }}\n                >\n                  <i className="fa-solid fa-percent"'
)

code = code.replace(
    '<div className="d-flex align-items-center gap-1.5">\n                <div\n                  className="d-flex align-items-center justify-content-center rounded-circle"\n                  style={{ width: "26px", height: "26px", backgroundColor: "#eff6ff", color: "#0040e0" }}\n                >\n                  <i className="fa-solid fa-lock"',
    '<div className="d-flex align-items-center gap-2">\n                <div\n                  className="d-flex align-items-center justify-content-center rounded-circle"\n                  style={{ width: "28px", height: "28px", backgroundColor: "#eff6ff", color: "#0040e0" }}\n                >\n                  <i className="fa-solid fa-lock"'
)

with open(offer_path, 'w', encoding='utf-8') as f:
    f.write(code)

print('Updated InstantLoanStepOfferSelection.jsx')

# 2. Update InstantLoanFlow.jsx
flow_path = 'src/components/pages/Oxyloans/Borrower/redesign/pages/InstantLoanFlow.jsx'
with open(flow_path, 'r', encoding='utf-8') as f:
    fcode = f.read()

# Fix borrower pills me-1 to me-1.5
fcode = fcode.replace('fa-solid fa-circle-check me-1', 'fa-solid fa-circle-check me-1.5')
fcode = fcode.replace('fa-solid fa-building-columns me-1', 'fa-solid fa-building-columns me-1.5')
fcode = fcode.replace('fa-solid fa-rotate-left', 'fa-solid fa-rotate-left me-1.5')

# Fix horizontal stepper gap-1.5 to gap-2
fcode = fcode.replace(
    'className={`d-flex align-items-center gap-1.5 ${isPast ? "cursor-pointer" : ""}`}',
    'className={`d-flex align-items-center gap-2 ${isPast ? "cursor-pointer" : ""}`}'
)

with open(flow_path, 'w', encoding='utf-8') as f:
    f.write(fcode)

print('Updated InstantLoanFlow.jsx')
