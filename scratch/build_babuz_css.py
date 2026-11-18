import os
import re

os.makedirs('src/components/pages/BabuzLanding', exist_ok=True)

with open('scratch/style_0.css', 'r', encoding='utf-8') as f:
    css0 = f.read()
with open('scratch/style_1.css', 'r', encoding='utf-8') as f:
    css1 = f.read()
with open('scratch/style_2.css', 'r', encoding='utf-8') as f:
    css2 = f.read()

combined = css0 + "\n" + css1 + "\n" + css2

# 1. Update font families to Kanit
combined = re.sub(r'__Kanit_[a-zA-Z0-9]+', 'Kanit', combined)
combined = re.sub(r'__Kanit_Fallback_[a-zA-Z0-9]+', 'sans-serif', combined)
combined = re.sub(r'var\(--body-font\)', "'Kanit', sans-serif", combined)

# 2. Update media paths
combined = re.sub(r'/_next/static/media/', '/assets/images/babuz/', combined)
combined = re.sub(r'/images/hover-image', '/assets/images/babuz/hover-image', combined)

# 3. Scope resets safely
# Replace :host,html with .babuz-page
combined = re.sub(r':host,html\b', '.babuz-page', combined)
combined = re.sub(r'\*,\s*:after,\s*:before\{', '.babuz-page, .babuz-page *, .babuz-page *:after, .babuz-page *:before{', combined)
combined = re.sub(r'\bh1,h2,h3,h4,h5,h6\{', '.babuz-page h1,.babuz-page h2,.babuz-page h3,.babuz-page h4,.babuz-page h5,.babuz-page h6{', combined)
combined = re.sub(r'\ba\{color:inherit', '.babuz-page a{color:inherit', combined)
combined = re.sub(r'\ba\{text-decoration:inherit\}', '.babuz-page a{text-decoration:inherit}', combined)
combined = re.sub(r'body\{margin:0;line-height:inherit\}', '.babuz-page{margin:0;line-height:inherit;font-family:\'Kanit\',sans-serif}', combined)
combined = re.sub(r'body\{background-color:var\(--tw-bg-opacity\)[^}]*\}', '', combined)
combined = re.sub(r'audio,canvas,embed,iframe,img,object,svg,video\{', '.babuz-page audio,.babuz-page canvas,.babuz-page embed,.babuz-page iframe,.babuz-page img,.babuz-page object,.babuz-page svg,.babuz-page video{', combined)

# Prepend Google Font import and root tokens
font_header = """@import url('https://fonts.googleapis.com/css2?family=Kanit:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap');

.babuz-page {
  font-family: 'Kanit', sans-serif;
  color: #343839;
  background-color: #ffffff;
  overflow-x: hidden;
  position: relative;
  width: 100%;
}

.babuz-page * {
  box-sizing: border-box;
}

"""

final_css = font_header + combined

with open('src/components/pages/BabuzLanding/babuz.css', 'w', encoding='utf-8') as f:
    f.write(final_css)

print(f"Generated src/components/pages/BabuzLanding/babuz.css (size: {len(final_css)} bytes)")
