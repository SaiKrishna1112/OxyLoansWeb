import re

with open('src/components/pages/BabuzLanding/babuz.css', 'r', encoding='utf-8') as f:
    css = f.read()

# 1. Remove all @font-face blocks that reference Kanit or .woff2 files
# Keep the swiper-icons @font-face if any, or remove only Kanit font-faces
def font_face_filter(match):
    block = match.group(0)
    if 'woff2' in block or 'Kanit' in block:
        return ''
    return block

css = re.sub(r'@font-face\s*\{[^}]+\}', font_face_filter, css)

# 2. Remove rules with hover-image or banner-bg or home-one-banner-shape
# Example: .bg-\[url\(\'\/images\/hover-image-2\.png\'\)\]{...}
css = re.sub(r'\.bg-\[url\([^)]+\)\]\{[^}]+\}', '', css)
css = re.sub(r'\.home-one-hero-pattern\{[^}]+\}', '', css)
css = re.sub(r'\.home-two-hero-pattern\{[^}]+\}', '', css)

# Check any remaining url(...)
urls = re.findall(r'url\([^)]+\)', css)
print("Remaining url() in css:")
for u in set(urls):
    print("  ", u)

with open('src/components/pages/BabuzLanding/babuz.css', 'w', encoding='utf-8') as f:
    f.write(css)

print(f"Updated babuz.css (size: {len(css)} bytes)")
