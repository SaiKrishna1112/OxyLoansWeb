import os
import zlib

objects_dir = '.git/objects'

for root, dirs, files in os.walk(objects_dir):
    if 'pack' in root or 'info' in root:
        continue
    for f in files:
        if len(f) == 38:
            folder = os.path.basename(root)
            sha = folder + f
            fp = os.path.join(root, f)
            try:
                with open(fp, 'rb') as zf:
                    raw = zlib.decompress(zf.read())
                    if b'InstantLoanStepOfferSelection' in raw and b'Select Your Preferred Repayment Plan' in raw:
                        text = raw.decode('utf-8', errors='ignore')
                        # strip git header e.g. blob 12345\0
                        null_idx = text.find('\0')
                        if null_idx != -1:
                            text = text[null_idx+1:]
                        lines = len(text.splitlines())
                        print(f'FOUND SHA: {sha} with {lines} lines!')
                        if lines > 3000:
                            target = 'src/components/pages/Oxyloans/Borrower/redesign/components/instantLoan/InstantLoanStepOfferSelection.jsx'
                            with open(target, 'w', encoding='utf-8') as out_f:
                                out_f.write(text)
                            print(f'Successfully restored from {sha}!')
                            exit(0)
            except Exception:
                pass

print('Done searching loose objects.')
