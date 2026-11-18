from bs4 import BeautifulSoup
import re

with open('scraped_home_three.html', 'r', encoding='utf-8') as f:
    soup = BeautifulSoup(f.read(), 'html.parser')

main = soup.find('main')
inner_div = main.find('div', class_='relative').find('div')
children = [c for c in inner_div.children if c.name]

print(f"Total top-level components inside inner_div: {len(children)}")
for i, c in enumerate(children):
    classes = ' '.join(c.get('class', []))
    h = c.find(['h1', 'h2', 'h3', 'h4'])
    h_text = h.get_text(strip=True) if h else ''
    print(f"[{i+1}] <{c.name}> class='{classes[:50]}...' heading='{h_text}' length={len(str(c))}")
