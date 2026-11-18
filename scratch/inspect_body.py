from bs4 import BeautifulSoup

with open('scraped_home_three.html', 'r', encoding='utf-8') as f:
    soup = BeautifulSoup(f.read(), 'html.parser')

body = soup.find('body')
if body:
    print("Direct children of body:")
    for child in body.children:
        if child.name:
            classes = " ".join(child.get('class', []))
            print(f" <{child.name}> id='{child.get('id', '')}' class='{classes[:60]}'")
            
# Let's find main or wrappers
main = soup.find('main')
if main:
    print("\nInside <main>:")
    for child in main.children:
        if child.name:
            classes = " ".join(child.get('class', []))
            h = child.find(['h1', 'h2', 'h3'])
            h_text = h.get_text(strip=True) if h else ""
            print(f" <{child.name}> class='{classes[:50]}' | Heading: '{h_text}'")
else:
    print("\nNo <main> tag, checking body contents")
