from bs4 import BeautifulSoup
import re

with open('scraped_home_three.html', 'r', encoding='utf-8') as f:
    soup = BeautifulSoup(f.read(), 'html.parser')

# Find all links on the page
links = soup.find_all('a')
nav_routes = set()
for a in links:
    href = a.get('href')
    text = a.get_text(strip=True)
    if href and not href.startswith('#') and not href.startswith('javascript'):
        nav_routes.add((text, href))

print(f"Total internal/external routes found ({len(nav_routes)}):")
for text, href in sorted(nav_routes):
    print(f"  {text} -> {href}")

# Let's see what interactive elements or components are on home-three:
print("\n--- Detailed Components in Home-Three ---")
sections = soup.find_all('section')
for i, s in enumerate(sections):
    h = s.find(['h1', 'h2', 'h3'])
    h_text = h.get_text(strip=True) if h else "No heading"
    buttons = [b.get_text(strip=True) for b in s.find_all(['button', 'a']) if b.get_text(strip=True)]
    cards = s.find_all(class_=re.compile(r'card|item|box|slide|group'))
    print(f"\nSection #{i+1}: {h_text}")
    print(f"  Buttons/Links: {buttons[:6]}")
    print(f"  Images count: {len(s.find_all('img'))}")
    img_alts_or_src = [img.get('src', '') for img in s.find_all('img')]
    print(f"  Image sample: {img_alts_or_src[:3]}")
