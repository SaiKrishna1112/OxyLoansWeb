import re
from bs4 import BeautifulSoup
import urllib.parse

with open('scraped_home_three.html', 'r', encoding='utf-8') as f:
    soup = BeautifulSoup(f.read(), 'html.parser')

def html_to_jsx(element_str):
    # Convert image src
    def repl_img(match):
        full = match.group(0)
        # extract url
        u_match = re.search(r'url=([^&]+)', full)
        if u_match:
            clean_url = urllib.parse.unquote(u_match.group(1))
            filename = clean_url.split('/')[-1]
            return f'src="/assets/images/babuz/{filename}"'
        s_match = re.search(r'src="(/_next/static/media/[^"]+)"', full)
        if s_match:
            clean_url = s_match.group(1)
            filename = clean_url.split('/')[-1]
            return f'src="/assets/images/babuz/{filename}"'
        return full

    s = re.sub(r'src="[^"]+"', repl_img, element_str)
    # Remove srcset
    s = re.sub(r'srcset="[^"]*"', '', s)
    s = re.sub(r'loading="lazy"', '', s)
    s = re.sub(r'decoding="async"', '', s)
    
    # Replace class with className
    s = re.sub(r'\bclass=', 'className=', s)
    s = re.sub(r'\bfor=', 'htmlFor=', s)
    s = re.sub(r'\btabindex=', 'tabIndex=', s)
    
    # SVG attributes
    svg_attrs = [
        'stroke-width', 'stroke-linecap', 'stroke-linejoin', 'fill-rule', 
        'clip-rule', 'stop-color', 'stop-opacity', 'stroke-miterlimit',
        'stroke-dasharray', 'stroke-dashoffset', 'stroke-opacity',
        'fill-opacity', 'xmlns:xlink', 'xlink:href'
    ]
    for attr in svg_attrs:
        camel = re.sub(r'[-:]([a-z])', lambda m: m.group(1).upper(), attr)
        s = re.sub(rf'\b{attr}=', f'{camel}=', s)
        
    # Self-closing tags: img, input, br, hr
    s = re.sub(r'<img([^>]*?)(?<!/)>', r'<img\1 />', s)
    s = re.sub(r'<input([^>]*?)(?<!/)>', r'<input\1 />', s)
    s = re.sub(r'<br(?!\s*/)>', r'<br />', s)
    s = re.sub(r'<hr(?!\s*/)>', r'<hr />', s)
    
    # Style strings to JSX objects: style="..."
    def style_repl(match):
        style_content = match.group(1)
        rules = [r.strip() for r in style_content.split(';') if r.strip()]
        obj_entries = []
        for rule in rules:
            if ':' in rule:
                k, v = rule.split(':', 1)
                k = k.strip()
                v = v.strip().replace('"', '\\"')
                # convert kebab to camel
                k_camel = re.sub(r'-([a-z])', lambda m: m.group(1).upper(), k)
                obj_entries.append(f'"{k_camel}": "{v}"')
        return f'style={{{{{", ".join(obj_entries)}}}}}'

    s = re.sub(r'style="([^"]*)"', style_repl, s)
    
    # Replace HTML comments
    s = re.sub(r'<!--.*?-->', '', s, flags=re.DOTALL)
    
    return s

main = soup.find('main')
inner_div = main.find('div', class_='relative').find('div')
children = [c for c in inner_div.children if c.name and c.name != 'template']

print(f"Extracted {len(children)} primary sections.")

with open('scratch/children_manifest.txt', 'w', encoding='utf-8') as mf:
    for idx, c in enumerate(children):
        jsx = html_to_jsx(str(c))
        filename = f'scratch/section_{idx+1}.jsx'
        with open(filename, 'w', encoding='utf-8') as f:
            f.write(jsx)
        mf.write(f"Section {idx+1}: {c.name} -> {filename} (len: {len(jsx)})\n")

print("All sections saved to scratch/section_*.jsx")
