import re

with open('src/components/pages/BabuzLanding/babuz.css', 'r', encoding='utf-8') as f:
    css = f.read()

# Remove any rule containing hover-image
css = re.sub(r'[^}]*hover-image[^}]*\{[^}]*\}', '', css)

# Verify all remaining url()
urls = re.findall(r'url\(([^)]+)\)', css)
print("Remaining url() in css:")
for u in set(urls):
    print("  ", u)

with open('src/components/pages/BabuzLanding/babuz.css', 'w', encoding='utf-8') as f:
    f.write(css)

print("Saved babuz.css")
