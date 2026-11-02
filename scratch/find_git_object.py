import os
import subprocess
import datetime

objects_dir = '.git/objects'
today = datetime.date(2026, 10, 30)

matches = []
for root, dirs, files in os.walk(objects_dir):
    for f in files:
        if len(f) == 38: # loose git object
            folder = os.path.basename(root)
            if len(folder) == 2:
                sha = folder + f
                p = os.path.join(root, f)
                mtime = datetime.date.fromtimestamp(os.path.getmtime(p))
                # Check all objects modified recently
                try:
                    # check size
                    sz = os.path.getsize(p)
                    if sz > 20000: # compressed loose object > 20KB
                        content = subprocess.check_output(['git', 'cat-file', '-p', sha], text=True, stderr=subprocess.DEVNULL)
                        if 'Underwriting, Repayment & Matched Loan Offers' in content or 'Select Your Preferred Repayment Plan' in content:
                            lines = len(content.splitlines())
                            print(f'FOUND SHA: {sha} ({lines} lines, mtime {mtime})')
                            matches.append((sha, lines, content))
                except Exception:
                    pass

print(f'Total matches: {len(matches)}')
if matches:
    # Sort by lines descending
    matches.sort(key=lambda x: x[1], reverse=True)
    best_sha, best_lines, best_content = matches[0]
    print(f'Restoring best match {best_sha} with {best_lines} lines!')
    target = 'src/components/pages/Oxyloans/Borrower/redesign/components/instantLoan/InstantLoanStepOfferSelection.jsx'
    with open(target, 'w', encoding='utf-8') as f:
        f.write(best_content)
    print('Restored successfully!')
