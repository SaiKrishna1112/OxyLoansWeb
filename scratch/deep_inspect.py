from bs4 import BeautifulSoup
import json

with open('scraped_home_three.html', 'r', encoding='utf-8') as f:
    soup = BeautifulSoup(f.read(), 'html.parser')

# Check Next.js data or script tags
next_data = soup.find('script', id='__NEXT_DATA__')
if next_data:
    print("Found __NEXT_DATA__!")
    try:
        data = json.loads(next_data.string)
        print("Keys:", data.keys())
        print("Page:", data.get('page'))
    except Exception as e:
        print("Parse error:", e)
else:
    print("No __NEXT_DATA__ tag (App router)")

# Let's see the full tree of sections and their detailed contents
for i, s in enumerate(soup.find_all('section')):
    classes = " ".join(s.get('class', []))
    print(f"\n================ SECTION {i+1} ================")
    print(f"Classes: {classes}")
    
    # Sub-elements
    headings = [h.get_text(strip=True) for h in s.find_all(['h1', 'h2', 'h3', 'h4', 'h5', 'h6'])]
    print("Headings:", headings)
    
    paragraphs = [p.get_text(strip=True) for p in s.find_all('p') if len(p.get_text(strip=True)) > 0]
    print(f"Paragraphs ({len(paragraphs)}):", [p[:60] + '...' if len(p) > 60 else p for p in paragraphs[:5]])
    
    # Check if there are lists or cards or accordion
    lists = s.find_all(['ul', 'ol'])
    print(f"Lists count: {len(lists)}")
    for l in lists[:3]:
        items = [li.get_text(strip=True) for li in l.find_all('li')]
        print("  List items sample:", items[:4])

print(f"\n================ FOOTER ================")
footer = soup.find('footer')
if footer:
    print("Footer headings:", [h.get_text(strip=True) for h in footer.find_all(['h1','h2','h3','h4','h5','h6'])])
    print("Footer links:", [a.get_text(strip=True) for a in footer.find_all('a') if a.get_text(strip=True)][:15])
