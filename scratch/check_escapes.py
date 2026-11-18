import glob, os, re

files = glob.glob('src/components/pages/BabuzLanding/*.jsx')
for fpath in files:
    with open(fpath, 'r', encoding='utf-8') as f:
        content = f.read()
    # Find any standalone backslash
    pos = 0
    while True:
        idx = content.find('\\', pos)
        if idx == -1:
            break
        # print context around backslash
        context = content[max(0, idx-10):min(len(content), idx+10)]
        print(f"{os.path.basename(fpath)} at {idx}: {repr(context)}")
        pos = idx + 1

print("Check finished.")
