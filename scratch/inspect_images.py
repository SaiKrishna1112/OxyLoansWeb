from bs4 import BeautifulSoup
import urllib.parse

with open('scraped_home_three.html', 'r', encoding='utf-8') as f:
    soup = BeautifulSoup(f.read(), 'html.parser')

images = soup.find_all('img')
print(f"Total images found: {len(images)}")
img_data = []
for img in images:
    src = img.get('src')
    alt = img.get('alt', '')
    if src:
        # decode next/image url
        if 'url=' in src:
            actual_url = urllib.parse.unquote(src.split('url=')[1].split('&')[0])
        else:
            actual_url = src
        img_data.append((actual_url, alt))

for src, alt in img_data[:25]:
    print(f" - {src} (alt: {alt})")

# Check SVGs / icons
svgs = soup.find_all('svg')
print(f"\nTotal SVGs/Icons found: {len(svgs)}")
