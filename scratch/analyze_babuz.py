import os
import re
from bs4 import BeautifulSoup
import urllib.parse

with open('scraped_home_three.html', 'r', encoding='utf-8') as f:
    html_content = f.read()

soup = BeautifulSoup(html_content, 'html.parser')

print('Title:', soup.title.string if soup.title else 'No title')

css_links = [link.get('href') for link in soup.find_all('link', rel=lambda x: x and 'stylesheet' in x)]
print('\nCSS Links:')
for c in css_links:
    print(' -', c)

scripts = [s.get('src') for s in soup.find_all('script') if s.get('src')]
print('\nScripts:')
for s in scripts[:15]:
    print(' -', s)

# Let's inspect sections / headers / main containers
sections = soup.find_all(['header', 'section', 'footer', 'nav', 'main', 'div'])
major_sections = []
for sec in soup.find_all(['header', 'section', 'footer', 'nav']):
    classes = ' '.join(sec.get('class', []))
    id_attr = sec.get('id', '')
    major_sections.append(f"<{sec.name}> id='{id_attr}' class='{classes}'")

print(f'\nFound {len(major_sections)} major structural tags:')
for idx, sec in enumerate(major_sections):
    print(f' {idx+1}. {sec}')

# Look at key headings
headings = soup.find_all(['h1', 'h2', 'h3'])
print(f'\nHeadings count: {len(headings)}')
for h in headings[:15]:
    text = re.sub(r'\s+', ' ', h.get_text()).strip()
    print(f"[{h.name}] {text}")
