import os
import re
import urllib.request
import urllib.parse

# 1. Download all assets from Babuz
output_dir = 'src/assets/images/babuz'
os.makedirs(output_dir, exist_ok=True)

with open('scraped_home_three.html', 'r', encoding='utf-8') as f:
    html = f.read()

# Find all image URLs
img_urls = set()
# Search Next.js image urls or static media urls
matches = re.findall(r'/_next/image\?url=([^&]+)&amp;[^"\'\s>]+', html)
matches += re.findall(r'/_next/image\?url=([^&]+)&[^"\'\s>]+', html)
matches += re.findall(r'/_next/static/media/[a-zA-Z0-9_.-]+', html)

for m in matches:
    clean = urllib.parse.unquote(m)
    img_urls.add(clean)

# Also check for css background images or svgs
with open('scratch/style_1.css', 'r', encoding='utf-8') as f:
    css_content = f.read()

css_imgs = re.findall(r'url\((["\']?)(/_next/static/media/[^)"\']+)\1\)', css_content)
for _, c_img in css_imgs:
    img_urls.add(c_img)

print(f"Found {len(img_urls)} unique asset URLs:")
downloaded_map = {}
for u in sorted(img_urls):
    filename = os.path.basename(u)
    full_url = "https://babuz.vercel.app" + u
    local_path = os.path.join(output_dir, filename)
    req = urllib.request.Request(full_url, headers={'User-Agent': 'Mozilla/5.0'})
    try:
        with urllib.request.urlopen(req) as resp:
            data = resp.read()
            with open(local_path, 'wb') as img_f:
                img_f.write(data)
            downloaded_map[u] = f"/assets/images/babuz/{filename}"
            print(f"Downloaded: {filename} ({len(data)} bytes)")
    except Exception as e:
        print(f"Failed to download {full_url}: {e}")

print("Total downloaded successfully:", len(downloaded_map))
