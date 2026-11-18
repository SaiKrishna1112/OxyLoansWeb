import urllib.request
import re

# Let's download the page chunk
chunk_url = 'https://babuz.vercel.app/_next/static/chunks/app/home-three/page-0408be5211f59de7.js'
req = urllib.request.Request(chunk_url, headers={'User-Agent': 'Mozilla/5.0'})
try:
    with urllib.request.urlopen(req) as resp:
        code = resp.read().decode('utf-8')
        with open('scratch/home_three_page.js', 'w', encoding='utf-8') as f:
            f.write(code)
        print("Downloaded page chunk, length:", len(code))
        
        # Check imported components or strings
        imports = re.findall(r'function\s+([A-Z][a-zA-Z0-9]+)', code)
        print("Components found in chunk:", imports[:20])
except Exception as e:
    print("Error:", e)
