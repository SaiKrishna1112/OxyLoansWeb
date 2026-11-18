import re

with open('scratch/style_1.css', 'r', encoding='utf-8') as f:
    css = f.read()

# find bg-[color] or text-[color] or color definitions
colors = set()
for match in re.finditer(r'--(?:tw-)?(?:color|bg|text|border)-?([a-zA-Z0-9_-]+)?:\s*(#[0-9a-fA-F]{3,8}|rgba?\([^)]+\))', css):
    colors.add((match.group(1), match.group(2)))

# find custom bg classes like bg-primary, bg-secondary, bg-accent, etc.
custom_classes = set(re.findall(r'\.(bg-[a-zA-Z0-9_-]+|\btext-[a-zA-Z0-9_-]+|\bborder-[a-zA-Z0-9_-]+)\{([^}]+)\}', css))

print("Sample custom classes and definitions:")
for c, rule in list(custom_classes)[:40]:
    if any(k in c for k in ['primary', 'secondary', 'accent', 'white', 'black', 'n900', 'p1']):
        print(f"{c} -> {rule}")

# Let's inspect the sections in scraped_home_three.html in detail
from bs4 import BeautifulSoup
with open('scraped_home_three.html', 'r', encoding='utf-8') as f:
    soup = BeautifulSoup(f.read(), 'html.parser')

print("\n--- Detailed Page Breakdown ---")
# Header / Navbar
header = soup.find('header')
if header:
    print(f"Header: class='{header.get('class')}'")
    nav_links = [a.get_text(strip=True) for a in header.find_all('a') if a.get_text(strip=True)]
    print(f"Header nav links ({len(nav_links)}): {nav_links[:15]}")

# All sections and their headers / key content
for i, sec in enumerate(soup.find_all('section')):
    h_tag = sec.find(['h1', 'h2', 'h3', 'h4'])
    h_text = h_tag.get_text(strip=True) if h_tag else "No heading"
    subtitle = sec.find(['span', 'p'], class_=lambda c: c and ('sub' in c or 'badge' in c or 'text-' in c))
    sub_text = subtitle.get_text(strip=True) if subtitle else ""
    classes = " ".join(sec.get('class', []))
    print(f"\nSection {i+1}: Heading='{h_text}' | Sub='{sub_text[:40]}'")
    print(f"  Classes: {classes[:100]}...")

footer = soup.find('footer')
if footer:
    print(f"\nFooter: class='{footer.get('class')}'")
