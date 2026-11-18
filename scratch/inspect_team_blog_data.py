# inspect team data
with open('src/data/teamManagementData.js', 'r', encoding='utf-8') as f:
    text = f.read()

import re
names = re.findall(r'name:\s*["\']([^"\']+)["\']', text)
roles = re.findall(r'role:\s*["\']([^"\']+)["\']', text)
images = re.findall(r'image:\s*([^\n,]+)', text)

print("Team members count:", len(names))
for i in range(min(len(names), 10)):
    img = images[i] if i < len(images) else ''
    print(f" {i+1}. {names[i]} - {roles[i] if i < len(roles) else ''} (img: {img})")

# inspect blog data
with open('src/data/blogData.js', 'r', encoding='utf-8') as f:
    btext = f.read()

titles = re.findall(r'title:\s*["\']([^"\']+)["\']', btext)
categories = re.findall(r'category:\s*["\']([^"\']+)["\']', btext)
print("\nBlog articles count:", len(titles))
for i in range(min(len(titles), 5)):
    print(f" {i+1}. {titles[i]} [{categories[i] if i < len(categories) else ''}]")
