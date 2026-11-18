from bs4 import BeautifulSoup
import re

with open('scraped_home_three.html', 'r', encoding='utf-8') as f:
    soup = BeautifulSoup(f.read(), 'html.parser')

headings = soup.find_all(['h1', 'h2', 'h3', 'h4'])
for h in headings:
    text = re.sub(r'\s+', ' ', h.get_text()).strip()
    parent = h.find_parent(['section', 'div', 'header', 'footer'])
    p_classes = ' '.join(parent.get('class', [])) if parent else ''
    print(f"[{h.name}] {text} | in <{parent.name}> class='{p_classes[:70]}'")
