import os
import subprocess
import zlib

objects_dir = '.git/objects'

for root, dirs, files in os.walk(objects_dir):
    if 'pack' in root or 'info' in root:
        continue
    for f in files:
        if len(f) == 38:
            folder = os.path.basename(root)
            sha = folder + f
            try:
                # Use git cat-file -p sha
                out = subprocess.check_output(['git', 'cat-file', '-p', sha], text=True, stderr=subprocess.DEVNULL)
                if 'InstantLoanStepOfferSelection' in out and 'Select Your Preferred Repayment Plan' in out:
                    lines = len(out.splitlines())
                    print(f'FOUND SHA: {sha} with {lines} lines!')
                    if lines > 3000:
                        target = 'src/components/pages/Oxyloans/Borrower/redesign/components/instantLoan/InstantLoanStepOfferSelection.jsx'
                        with open(target, 'w', encoding='utf-8') as out_f:
                            out_f.write(out)
                        print(f'Successfully restored from {sha}!')
                        exit(0)
            except Exception:
                pass

print('Done searching loose objects.')
