from bs4 import BeautifulSoup

with open('scraped_home_three.html', 'r', encoding='utf-8') as f:
    soup = BeautifulSoup(f.read(), 'html.parser')

inner_div = soup.find('main').find('div', class_='relative').find('div')
if inner_div:
    print(f"Children of inner_div:")
    idx = 0
    for child in inner_div.children:
        if child.name:
            idx += 1
            h = child.find(['h1', 'h2', 'h3'])
            h_text = h.get_text(strip=True) if h else ""
            classes = " ".join(child.get('class', []))
            print(f" {idx}. <{child.name}> class='{classes[:60]}' | Heading: '{h_text}'")
