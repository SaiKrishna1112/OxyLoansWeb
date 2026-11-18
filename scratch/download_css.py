import urllib.request
import re

css_links = [
    'https://babuz.vercel.app/_next/static/css/73c00cd95dc66651.css',
    'https://babuz.vercel.app/_next/static/css/4b4529233e05c6ee.css',
    'https://babuz.vercel.app/_next/static/css/74c61b83702de20d.css'
]

combined_css = ""
for i, url in enumerate(css_links):
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    try:
        with urllib.request.urlopen(req) as resp:
            content = resp.read().decode('utf-8')
            with open(f'scratch/style_{i}.css', 'w', encoding='utf-8') as f:
                f.write(content)
            combined_css += content + "\n"
            print(f'Downloaded {url} (size: {len(content)})')
    except Exception as e:
        print(f'Error downloading {url}: {e}')

# Extract root CSS variables or color tokens
root_vars = re.findall(r'(--[a-zA-Z0-9_-]+)\s*:\s*([^;]+);', combined_css)
print(f'\nTotal CSS Variables found: {len(root_vars)}')
unique_vars = dict(root_vars)
for k, v in list(unique_vars.items())[:30]:
    print(f'{k}: {v}')

# Extract font-family references
fonts = re.findall(r'font-family:\s*([^;]+);', combined_css)
print('\nFont Families found:')
for f in set(fonts):
    print(' -', f)
