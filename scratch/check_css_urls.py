import re

with open('src/components/pages/BabuzLanding/babuz.css', 'r', encoding='utf-8') as f:
    css = f.read()

urls = re.findall(r'url\(([^)]+)\)', css)
print(f"Total url() in babuz.css: {len(urls)}")
for u in set(urls):
    print("  ", u)

# Check what rules contain @font-face
font_faces = re.findall(r'@font-face\s*\{[^}]+\}', css)
print(f"\nTotal @font-face blocks: {len(font_faces)}")
for ff in font_faces[:5]:
    print("  Sample font-face:", ff[:80])
