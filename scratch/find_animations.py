import re

with open('scraped_home_three.html', 'r', encoding='utf-8') as f:
    html = f.read()

# Check for animation libraries or data attributes
print("Searching for animation keywords in scraped HTML:")
for kw in ['gsap', 'ScrollTrigger', 'aos', 'framer', 'animate', 'keyframes', 'wow', 'lenis']:
    matches = re.findall(rf'.{{0,30}}{kw}.{{0,30}}', html, re.IGNORECASE)
    if matches:
        print(f"Keyword '{kw}' found ({len(matches)} times), sample: {matches[0]}")

# Check keyframes in CSS
with open('src/components/pages/BabuzLanding/babuz.css', 'r', encoding='utf-8') as f:
    css = f.read()

keyframes = re.findall(r'@keyframes\s+([a-zA-Z0-9_-]+)', css)
print(f"\nKeyframes in babuz.css ({len(keyframes)}):")
for k in set(keyframes):
    print(" -", k)

# Check classes with animation or transition
anim_classes = re.findall(r'\.([a-zA-Z0-9_-]*(?:anim|fade|slide|appear|pulse|spin|reveal|transition)[a-zA-Z0-9_-]*)\s*\{', css)
print(f"\nAnimation/transition classes in babuz.css ({len(anim_classes)}):")
for c in set(anim_classes):
    print(" -", c)
