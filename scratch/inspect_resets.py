with open('scratch/style_1.css', 'r', encoding='utf-8') as f:
    css = f.read()

# Let's inspect the first 2000 characters of style_1.css
print("Beginning of style_1.css:")
print(css[:1000])

# Check what global element selectors exist
import re
selectors = re.findall(r'([^{}]+)\{', css)
global_resets = [s.strip() for s in selectors if any(s.strip().startswith(x) for x in ['html', 'body', '*', 'a', 'h1', 'p', 'button'])]
print(f"\nFound {len(global_resets)} potential global/element selectors:")
for s in global_resets[:25]:
    print(" -", s)
